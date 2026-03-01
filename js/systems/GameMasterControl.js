/**
 * GameMasterControl — real-time game-state commands broadcast via Firebase.
 *
 * The GM panel calls GameMasterControl.broadcast(type, payload) to push a
 * command.  Every other connected browser receives it via the Firebase
 * 'child_added' listener and applies it to the local game state immediately.
 *
 * Commands:
 *   WIN_GAME      — force-win the next unplayed season game (+$500 bonus)
 *   ADD_PLAYER    — add a database player to every team's roster
 *   GIVE_MONEY    — credit every player's economy manager
 *   BOOST_TEAM    — multiply all roster-player stats by a factor
 *   MESSAGE       — show a banner message on every screen
 */

import { Player } from '../entities/Player.js';
import { MLB_PLAYERS, LIGHTNING_PLAYERS, LOCAL_PLAYERS } from '../data/mlbPlayers.js';

const GM_CONTROL_PATH = 'gmControl';

// Unique ID for this browser tab — lets us skip our own broadcasts
const SESSION_ID = Math.random().toString(36).slice(2, 10);

// Only process commands pushed AFTER this page loaded
const SESSION_START = Date.now();

export class GameMasterControl {
    static _db   = null;
    static _initialized = false;
    static _game = null; // set from main.js after Game is created

    /**
     * Call from main.js after creating the Game object.
     * Safe to call even if Firebase SDK hasn't loaded.
     */
    static init(firebaseConfig, game) {
        GameMasterControl._game = game;

        if (typeof firebase === 'undefined') {
            console.warn('GameMasterControl: Firebase SDK not loaded — live control disabled.');
            return;
        }
        if (GameMasterControl._initialized) return;

        try {
            if (!firebase.apps.length) {
                firebase.initializeApp(firebaseConfig);
            }
            GameMasterControl._db = firebase.database();
            GameMasterControl._initialized = true;
        } catch (err) {
            console.error('GameMasterControl: init failed —', err);
            return;
        }

        GameMasterControl._listen();
    }

    static get isAvailable() {
        return GameMasterControl._db !== null;
    }

    /**
     * Broadcast a command to all connected browsers.
     * Called by GameMasterScene; the sending session will NOT apply it locally
     * (the GM is not running a player game).
     * @param {string} type  - Command type constant
     * @param {Object} payload
     */
    static async broadcast(type, payload = {}) {
        if (!GameMasterControl.isAvailable) return;
        try {
            await GameMasterControl._db.ref(GM_CONTROL_PATH).push({
                type,
                payload,
                timestamp: Date.now(),
                _pushedBy: SESSION_ID,
            });
        } catch (err) {
            console.error('GameMasterControl: broadcast failed —', err);
        }
    }

    // ── private ──────────────────────────────────────────────────────────────

    static _listen() {
        if (!GameMasterControl.isAvailable) return;

        // Only receive commands sent after this session started
        GameMasterControl._db
            .ref(GM_CONTROL_PATH)
            .orderByChild('timestamp')
            .startAt(SESSION_START)
            .on('child_added', (snapshot) => {
                const cmd = snapshot.val();
                if (!cmd) return;
                if (cmd._pushedBy === SESSION_ID) return; // ignore our own
                GameMasterControl._apply(cmd);
            });
    }

    static _apply(cmd) {
        const game = GameMasterControl._game;
        switch (cmd.type) {
            case 'WIN_GAME':   GameMasterControl._applyWinGame(game); break;
            case 'ADD_PLAYER': GameMasterControl._applyAddPlayer(cmd.payload, game); break;
            case 'GIVE_MONEY': GameMasterControl._applyGiveMoney(cmd.payload, game); break;
            case 'BOOST_TEAM': GameMasterControl._applyBoostTeam(cmd.payload, game); break;
            case 'MESSAGE':    GameMasterControl._applyMessage(cmd.payload); break;
        }
    }

    // ── command handlers (run on each client) ────────────────────────────────

    static _applyWinGame(game) {
        if (!game || !game.seasonManager || !game.playerTeam) return;
        const nextGame = game.seasonManager.getNextUnplayedGame();
        if (!nextGame) return;

        const idx = game.seasonManager.schedule.indexOf(nextGame);
        game.seasonManager.recordGameResult(idx, true, 9, 0);
        game.playerTeam.record.wins++;

        if (game.economyManager) {
            game.economyManager.earn(500, 'GM: Forced Win');
        }

        GameMasterControl._showBanner('\u26BE GAME MASTER: YOU WIN THIS GAME! +$500', '#0a4a0a');
    }

    static _applyAddPlayer(payload, game) {
        if (!game || !game.playerTeam) return;

        const allPlayers = [...MLB_PLAYERS, ...LIGHTNING_PLAYERS, ...LOCAL_PLAYERS];
        const pData = allPlayers.find(p => p.id === payload.playerId);
        if (!pData) return;

        // Don't add duplicates
        if (game.playerTeam.roster.some(p => p.id === payload.playerId)) return;

        game.playerTeam.addPlayer(new Player(pData));
        GameMasterControl._showBanner(`\u26BE GAME MASTER: ${pData.name} ADDED TO YOUR TEAM!`, '#0a1a4a');
    }

    static _applyGiveMoney(payload, game) {
        if (!game || !game.economyManager) return;
        const amount = payload.amount || 100;
        game.economyManager.earn(amount, 'GM: Gift');
        GameMasterControl._showBanner(`\u26BE GAME MASTER: +$${amount} ADDED TO YOUR WALLET!`, '#3a2a00');
    }

    static _applyBoostTeam(payload, game) {
        if (!game || !game.playerTeam) return;
        const factor = payload.factor || 1.15;
        const statKeys = ['power', 'contact', 'speed', 'fielding', 'arm', 'pitchSpeed', 'pitchControl', 'pitchBreak'];
        for (const player of game.playerTeam.roster) {
            for (const k of statKeys) {
                if (player.stats[k] > 0) {
                    player.stats[k] = Math.min(99, Math.round(player.stats[k] * factor));
                }
            }
        }
        const pct = Math.round((factor - 1) * 100);
        GameMasterControl._showBanner(`\u26BE GAME MASTER: ALL PLAYER STATS BOOSTED +${pct}%!`, '#2a0a3a');
    }

    static _applyMessage(payload) {
        GameMasterControl._showBanner(`\u26BE GAME MASTER: ${payload.text || ''}`, '#1a1a4a');
    }

    // ── banner helper ─────────────────────────────────────────────────────────

    static _showBanner(text, bgColor = '#1a1a4a') {
        const existing = document.getElementById('gm-control-banner');
        if (existing) existing.remove();

        const banner = document.createElement('div');
        banner.id = 'gm-control-banner';
        banner.style.cssText =
            `position:fixed;top:0;left:0;right:0;background:${bgColor};color:#fff;` +
            'text-align:center;padding:14px;font-family:monospace;font-size:15px;' +
            'z-index:9999;font-weight:bold;letter-spacing:1px;cursor:pointer;' +
            'border-bottom:2px solid rgba(255,255,255,0.3);';
        banner.textContent = text;
        banner.onclick = () => banner.remove();
        document.body.appendChild(banner);

        setTimeout(() => { if (banner.parentNode) banner.remove(); }, 6000);
    }
}
