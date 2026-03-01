/**
 * GameMasterScene — 2nd game-master control panel.
 *
 * Accessed via a separate password on the title screen login.
 * Same look-and-feel as AdminScene but focused on live game-state commands
 * that are broadcast to every connected computer via Firebase.
 *
 * Tabs:
 *   GAME    — Win next game, Give money, Boost all team stats
 *   ROSTER  — Browse the player database and add someone to every team
 *   ANNOUNCE — Send a text banner to all screens
 */

import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../utils/constants.js';
import { UIRenderer } from '../rendering/UIRenderer.js';
import { Audio } from '../engine/Audio.js';
import { TextInput } from '../utils/TextInput.js';
import { GameMasterControl } from '../systems/GameMasterControl.js';
import { MLB_PLAYERS, LIGHTNING_PLAYERS, LOCAL_PLAYERS } from '../data/mlbPlayers.js';

const TABS = ['game', 'roster', 'announce'];
const TAB_LABELS = { game: 'GAME', roster: 'ROSTER', announce: 'ANNOUNCE' };

// Colors matching the "red/dark" GM theme
const THEME = {
    header:     '#12000a',
    accent:     '#FF4444',
    accentDim:  '#882222',
    bg:         '#0a0008',
    panel:      'rgba(30,0,15,0.7)',
    text:       '#FFCCCC',
    textDim:    '#884466',
};

// Money amounts available to gift
const MONEY_STEPS = [50, 100, 250, 500, 1000, 2500, 5000];

// Stat boost multipliers
const BOOST_OPTIONS = [
    { label: '+10%', factor: 1.10 },
    { label: '+20%', factor: 1.20 },
    { label: '+50%', factor: 1.50 },
    { label: 'MAX',  factor: 99   },
];

export class GameMasterScene {
    constructor(game) {
        this.game = game;
        this.tab  = 'game';

        this.hoveredButton = -1;
        this.hoveredPlayer = -1;
        this.feedbackMsg   = '';
        this.feedbackTimer = 0;

        // GAME tab
        this.moneyStepIdx  = 2;          // default $250
        this.boostIdx      = 1;          // default +20%
        this.hoveredBoost  = -1;

        // ROSTER tab
        this.rosterScroll  = 0;
        this.searchActive  = false;
        this._allPlayers   = [...MLB_PLAYERS, ...LIGHTNING_PLAYERS, ...LOCAL_PLAYERS];
        this._filtered     = this._allPlayers.slice();
        this._lastSearch   = '';
    }

    onEnter() {}

    onExit() {
        TextInput.deactivate();
    }

    // ── update ───────────────────────────────────────────────────────────────

    update(dt) {
        if (this.feedbackTimer > 0) this.feedbackTimer -= dt;

        const mx = this.game.input.mouse.x;
        const my = this.game.input.mouse.y;

        this.hoveredButton = -1;
        this.hoveredPlayer = -1;
        this.hoveredBoost  = -1;

        // Back button
        if (UIRenderer.isPointInRect(mx, my, 10, 10, 80, 34)) this.hoveredButton = 99;

        // Tab buttons
        for (let i = 0; i < TABS.length; i++) {
            if (UIRenderer.isPointInRect(mx, my, 110 + i * 140, 10, 130, 34)) {
                this.hoveredButton = 200 + i;
            }
        }

        // Sync text search value every frame (TextInput may change between frames)
        if (this.tab === 'roster') {
            const cur = TextInput.isFocused() ? TextInput.getValue() : this._lastSearch;
            if (cur !== this._lastSearch) {
                this._lastSearch = cur;
                const q = cur.toLowerCase();
                this._filtered = this._allPlayers.filter(p =>
                    p.name.toLowerCase().includes(q) ||
                    (p.position || '').toLowerCase().includes(q) ||
                    (p.teamSource || '').toLowerCase().includes(q)
                );
                this.rosterScroll = 0;
            }
        }

        if (this.tab === 'game')     this._updateGameTab(mx, my);
        else if (this.tab === 'roster')   this._updateRosterTab(mx, my);
        else if (this.tab === 'announce') this._updateAnnounceTab(mx, my);

        if (this.game.input.isMouseJustPressed()) {
            // Back
            if (this.hoveredButton === 99) {
                Audio.uiClick();
                TextInput.deactivate();
                if (GameMasterScene._TitleScene) {
                    this.game.sceneManager.transitionTo(new GameMasterScene._TitleScene(this.game));
                }
                return;
            }
            // Tab switch
            for (let i = 0; i < TABS.length; i++) {
                if (this.hoveredButton === 200 + i) {
                    Audio.uiClick();
                    this.tab = TABS[i];
                    this.rosterScroll = 0;
                    TextInput.deactivate();
                    if (this.tab === 'announce') {
                        const canvas = this.game.canvas || document.querySelector('canvas');
                        TextInput.activate(canvas, CANVAS_WIDTH / 2 - 200, 168, 400, 32, '');
                    } else if (this.tab === 'roster') {
                        this._lastSearch = '';
                        this._filtered = this._allPlayers.slice();
                    }
                    return;
                }
            }
            this._handleClick();
        }
    }

    _updateGameTab(mx, my) {
        // WIN NEXT GAME
        if (UIRenderer.isPointInRect(mx, my, CANVAS_WIDTH / 2 - 160, 160, 320, 48)) this.hoveredButton = 0;
        // Money left
        if (UIRenderer.isPointInRect(mx, my, CANVAS_WIDTH / 2 - 150, 310, 44, 34)) this.hoveredButton = 1;
        // Money right
        if (UIRenderer.isPointInRect(mx, my, CANVAS_WIDTH / 2 + 106, 310, 44, 34)) this.hoveredButton = 2;
        // GIVE MONEY
        if (UIRenderer.isPointInRect(mx, my, CANVAS_WIDTH / 2 - 160, 360, 320, 48)) this.hoveredButton = 3;
        // Boost options
        for (let i = 0; i < BOOST_OPTIONS.length; i++) {
            const bx = CANVAS_WIDTH / 2 - 170 + i * 88;
            if (UIRenderer.isPointInRect(mx, my, bx, 510, 80, 36)) this.hoveredBoost = i;
        }
        // BOOST TEAM
        if (UIRenderer.isPointInRect(mx, my, CANVAS_WIDTH / 2 - 160, 560, 320, 48)) this.hoveredButton = 4;
    }

    _updateRosterTab(mx, my) {
        // Search field click
        if (UIRenderer.isPointInRect(mx, my, 180, 63, 280, 28)) {
            const canvas = this.game.canvas || document.querySelector('canvas');
            TextInput.activate(canvas, 180, 63, 280, 28, this._lastSearch);
        }

        const rowH   = 38;
        const startY = 108;
        const maxVis = Math.floor((CANVAS_HEIGHT - startY - 60) / rowH);

        for (let i = 0; i < maxVis && (i + this.rosterScroll) < this._filtered.length; i++) {
            const y = startY + i * rowH;
            // ADD button
            if (UIRenderer.isPointInRect(mx, my, CANVAS_WIDTH - 200, y + 4, 80, 28)) {
                this.hoveredButton = 300 + i;
            } else if (UIRenderer.isPointInRect(mx, my, 100, y, CANVAS_WIDTH - 320, rowH - 2)) {
                this.hoveredPlayer = i + this.rosterScroll;
            }
        }

        // Scroll arrows
        if (UIRenderer.isPointInRect(mx, my, CANVAS_WIDTH - 90, CANVAS_HEIGHT - 52, 80, 32)) this.hoveredButton = 401; // next page
        if (UIRenderer.isPointInRect(mx, my, CANVAS_WIDTH - 180, CANVAS_HEIGHT - 52, 80, 32)) this.hoveredButton = 400; // prev page

        const maxScroll = Math.max(0, this._filtered.length - maxVis);
        if (this.game.input.isKeyJustPressed('ArrowDown')) {
            this.rosterScroll = Math.min(maxScroll, this.rosterScroll + 1);
        }
        if (this.game.input.isKeyJustPressed('ArrowUp')) {
            this.rosterScroll = Math.max(0, this.rosterScroll - 1);
        }
    }

    _updateAnnounceTab(mx, my) {
        // Message field click
        if (UIRenderer.isPointInRect(mx, my, CANVAS_WIDTH / 2 - 200, 168, 400, 32)) {
            const canvas = this.game.canvas || document.querySelector('canvas');
            TextInput.activate(canvas, CANVAS_WIDTH / 2 - 200, 168, 400, 32, TextInput.getValue());
        }
        // BROADCAST
        if (UIRenderer.isPointInRect(mx, my, CANVAS_WIDTH / 2 - 160, 225, 320, 48)) this.hoveredButton = 5;
    }

    _handleClick() {
        if (this.tab === 'game') {
            if (this.hoveredButton === 0) this._doWinGame();
            else if (this.hoveredButton === 1) this.moneyStepIdx = Math.max(0, this.moneyStepIdx - 1);
            else if (this.hoveredButton === 2) this.moneyStepIdx = Math.min(MONEY_STEPS.length - 1, this.moneyStepIdx + 1);
            else if (this.hoveredButton === 3) this._doGiveMoney();
            else if (this.hoveredBoost >= 0)   { Audio.uiClick(); this.boostIdx = this.hoveredBoost; }
            else if (this.hoveredButton === 4)  this._doBoostTeam();

        } else if (this.tab === 'roster') {
            if (this.hoveredButton >= 300 && this.hoveredButton < 400) {
                const idx = this.hoveredButton - 300 + this.rosterScroll;
                if (this._filtered[idx]) this._doAddPlayer(this._filtered[idx]);
            } else if (this.hoveredButton === 400) {
                const rowH   = 38;
                const startY = 108;
                const maxVis = Math.floor((CANVAS_HEIGHT - startY - 60) / rowH);
                this.rosterScroll = Math.max(0, this.rosterScroll - maxVis);
            } else if (this.hoveredButton === 401) {
                const rowH   = 38;
                const startY = 108;
                const maxVis = Math.floor((CANVAS_HEIGHT - startY - 60) / rowH);
                const maxScroll = Math.max(0, this._filtered.length - maxVis);
                this.rosterScroll = Math.min(maxScroll, this.rosterScroll + maxVis);
            }

        } else if (this.tab === 'announce') {
            if (this.hoveredButton === 5) this._doAnnounce();
        }
    }

    // ── broadcast actions ────────────────────────────────────────────────────

    async _doWinGame() {
        Audio.uiClick();
        await GameMasterControl.broadcast('WIN_GAME', {});
        this._feedback('WIN GAME broadcast to all computers!');
    }

    async _doGiveMoney() {
        Audio.uiClick();
        const amount = MONEY_STEPS[this.moneyStepIdx];
        await GameMasterControl.broadcast('GIVE_MONEY', { amount });
        this._feedback(`$${amount} gift sent to all players!`);
    }

    async _doBoostTeam() {
        Audio.uiClick();
        const opt = BOOST_OPTIONS[this.boostIdx];
        await GameMasterControl.broadcast('BOOST_TEAM', { factor: opt.factor });
        this._feedback(`${opt.label} stat boost sent to all teams!`);
    }

    async _doAddPlayer(pData) {
        Audio.uiClick();
        await GameMasterControl.broadcast('ADD_PLAYER', { playerId: pData.id });
        this._feedback(`${pData.name} added to EVERY team!`);
    }

    async _doAnnounce() {
        const text = TextInput.isFocused() ? TextInput.getValue() : '';
        if (!text.trim()) return;
        Audio.uiClick();
        await GameMasterControl.broadcast('MESSAGE', { text: text.trim() });
        this._feedback('Message broadcast to all screens!');
        TextInput.setValue('');
    }

    _feedback(msg) {
        this.feedbackMsg   = msg;
        this.feedbackTimer = 3;
    }

    // ── render ───────────────────────────────────────────────────────────────

    render(ctx) {
        // Background
        ctx.fillStyle = THEME.bg;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Header bar
        ctx.fillStyle = THEME.header;
        ctx.fillRect(0, 0, CANVAS_WIDTH, 55);

        // Accent line
        ctx.fillStyle = THEME.accent;
        ctx.fillRect(0, 54, CANVAS_WIDTH, 2);

        // Back button
        UIRenderer.drawButton(ctx, 10, 10, 80, 34, '< BACK', this.hoveredButton === 99, {
            normal: '#1a0010', hover: '#300020', text: '#888', border: '#441122',
        });

        // Title
        UIRenderer.drawText(ctx, 'GAME MASTER CONTROL', CANVAS_WIDTH / 2, 32, {
            font: 'bold 20px monospace',
            color: THEME.accent,
        });

        // Online indicator
        const online = GameMasterControl.isAvailable;
        UIRenderer.drawText(ctx, online ? '\u25CF ONLINE' : '\u25CF OFFLINE', CANVAS_WIDTH - 15, 32, {
            font: '11px monospace',
            color: online ? '#44FF44' : '#FF4444',
            align: 'right',
        });

        // Tabs
        for (let i = 0; i < TABS.length; i++) {
            const isActive = this.tab === TABS[i];
            UIRenderer.drawButton(ctx, 110 + i * 140, 10, 130, 34, TAB_LABELS[TABS[i]], this.hoveredButton === 200 + i, {
                normal: isActive ? '#3a0010' : '#160008',
                hover:  '#4a1020',
                text:   isActive ? THEME.accent : THEME.textDim,
                border: isActive ? THEME.accent : '#441122',
            });
        }

        // Tab body
        if (this.tab === 'game')     this._renderGameTab(ctx);
        else if (this.tab === 'roster')   this._renderRosterTab(ctx);
        else if (this.tab === 'announce') this._renderAnnounceTab(ctx);

        // Feedback
        if (this.feedbackTimer > 0 && this.feedbackMsg) {
            UIRenderer.drawText(ctx, this.feedbackMsg, CANVAS_WIDTH / 2, CANVAS_HEIGHT - 20, {
                font: 'bold 14px monospace',
                color: '#44FF88',
            });
        }
    }

    _renderGameTab(ctx) {
        const cx = CANVAS_WIDTH / 2;

        // ── WIN NEXT GAME ────────────────────────────────────────────────────
        UIRenderer.drawPanel(ctx, cx - 200, 80, 400, 120, {
            bgColor: 'rgba(0,40,0,0.5)', borderColor: '#44AA44', borderWidth: 1,
        });
        UIRenderer.drawText(ctx, 'FORCE WIN NEXT GAME', cx, 106, {
            font: 'bold 13px monospace', color: '#888',
        });
        UIRenderer.drawText(ctx, 'All connected players win their next scheduled game  +$500', cx, 126, {
            font: '11px monospace', color: '#555',
        });
        UIRenderer.drawButton(ctx, cx - 160, 145, 320, 44, '\u26BE  WIN NEXT GAME FOR EVERYONE', this.hoveredButton === 0, {
            normal: '#0a2a0a', hover: '#1a4a1a', text: '#44FF44', border: '#44AA44',
        });

        // ── GIVE MONEY ───────────────────────────────────────────────────────
        UIRenderer.drawPanel(ctx, cx - 200, 225, 400, 155, {
            bgColor: 'rgba(40,30,0,0.5)', borderColor: '#AA8822', borderWidth: 1,
        });
        UIRenderer.drawText(ctx, 'GIVE MONEY TO EVERYONE', cx, 252, {
            font: 'bold 13px monospace', color: '#888',
        });

        // Amount selector
        UIRenderer.drawButton(ctx, cx - 150, 275, 44, 34, '<', this.hoveredButton === 1, {
            normal: '#1a1000', hover: '#3a2800', text: '#FFD700', border: '#AA8822',
        });
        const amount = MONEY_STEPS[this.moneyStepIdx];
        UIRenderer.drawText(ctx, `$${amount}`, cx, 298, {
            font: 'bold 22px monospace', color: '#FFD700',
        });
        UIRenderer.drawButton(ctx, cx + 106, 275, 44, 34, '>', this.hoveredButton === 2, {
            normal: '#1a1000', hover: '#3a2800', text: '#FFD700', border: '#AA8822',
        });

        UIRenderer.drawButton(ctx, cx - 160, 325, 320, 44, `\u26BE  GIVE $${amount} TO EVERYONE`, this.hoveredButton === 3, {
            normal: '#1a1000', hover: '#3a2800', text: '#FFD700', border: '#AA8822',
        });

        // ── BOOST ALL STATS ──────────────────────────────────────────────────
        UIRenderer.drawPanel(ctx, cx - 200, 410, 400, 165, {
            bgColor: 'rgba(20,0,40,0.5)', borderColor: '#8844CC', borderWidth: 1,
        });
        UIRenderer.drawText(ctx, 'BOOST ALL TEAM STATS', cx, 438, {
            font: 'bold 13px monospace', color: '#888',
        });
        UIRenderer.drawText(ctx, 'Permanently raises every stat on every team\'s roster', cx, 458, {
            font: '11px monospace', color: '#555',
        });

        // Boost option pills
        for (let i = 0; i < BOOST_OPTIONS.length; i++) {
            const bx = cx - 170 + i * 88;
            const isSelected = this.boostIdx === i;
            UIRenderer.drawButton(ctx, bx, 474, 80, 36, BOOST_OPTIONS[i].label, this.hoveredBoost === i, {
                normal: isSelected ? '#2a0a4a' : '#100020',
                hover:  '#3a1a5a',
                text:   isSelected ? '#CC88FF' : '#664488',
                border: isSelected ? '#8844CC' : '#331155',
            });
        }

        UIRenderer.drawButton(ctx, cx - 160, 524, 320, 44,
            `\u26BE  BOOST ALL TEAMS ${BOOST_OPTIONS[this.boostIdx].label}`, this.hoveredButton === 4, {
            normal: '#1a0030', hover: '#2a0050', text: '#CC88FF', border: '#8844CC',
        });
    }

    _renderRosterTab(ctx) {
        // Search field
        UIRenderer.drawText(ctx, 'SEARCH:', 120, 82, {
            font: '12px monospace', color: '#664455', align: 'left',
        });
        const searchVal = TextInput.isFocused() ? TextInput.getValue() : this._lastSearch;
        TextInput.drawField(ctx, 180, 63, 280, 28, '', searchVal, TextInput.isFocused());

        UIRenderer.drawText(ctx, `${this._filtered.length} players`, 480, 82, {
            font: '11px monospace', color: '#554455', align: 'left',
        });

        // Column headers
        const headerY = 96;
        UIRenderer.drawText(ctx, 'NAME', 130, headerY, { font: '11px monospace', color: '#664455', align: 'left' });
        UIRenderer.drawText(ctx, 'POS', 430, headerY, { font: '11px monospace', color: '#664455', align: 'left' });
        UIRenderer.drawText(ctx, 'TEAM', 510, headerY, { font: '11px monospace', color: '#664455', align: 'left' });
        UIRenderer.drawText(ctx, 'STARS', 720, headerY, { font: '11px monospace', color: '#664455', align: 'left' });

        // Player rows
        const rowH   = 38;
        const startY = 108;
        const maxVis = Math.floor((CANVAS_HEIGHT - startY - 60) / rowH);

        for (let i = 0; i < maxVis && (i + this.rosterScroll) < this._filtered.length; i++) {
            const p   = this._filtered[i + this.rosterScroll];
            const y   = startY + i * rowH;
            const isH = this.hoveredPlayer === i + this.rosterScroll;
            const btnH = this.hoveredButton === 300 + i;

            ctx.fillStyle = isH ? 'rgba(255,68,68,0.08)' : (i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent');
            ctx.fillRect(100, y, CANVAS_WIDTH - 320, rowH - 2);

            UIRenderer.drawText(ctx, p.name, 130, y + 14, {
                font: '13px monospace', color: isH ? '#FF8866' : '#DDAAAA', align: 'left',
            });
            UIRenderer.drawText(ctx, p.position || '?', 430, y + 14, {
                font: '12px monospace', color: '#AA7788', align: 'left',
            });
            UIRenderer.drawText(ctx, (p.teamSource || '').slice(0, 14), 510, y + 14, {
                font: '11px monospace', color: '#775566', align: 'left',
            });
            UIRenderer.drawText(ctx, '\u2605'.repeat(p.stars || 1), 720, y + 14, {
                font: '12px monospace', color: '#FFD700', align: 'left',
            });

            UIRenderer.drawButton(ctx, CANVAS_WIDTH - 200, y + 4, 80, 28, 'ADD ALL', btnH, {
                normal: '#0a2000', hover: '#1a4000', text: '#44FF44', border: '#224422',
            });
        }

        // Scroll / page controls
        const maxScroll = Math.max(0, this._filtered.length - maxVis);
        if (maxScroll > 0) {
            UIRenderer.drawButton(ctx, CANVAS_WIDTH - 180, CANVAS_HEIGHT - 52, 80, 32, '\u25B2 PREV', this.hoveredButton === 400, {
                normal: '#1a000a', hover: '#300018', text: '#AA4466', border: '#441133',
            });
            UIRenderer.drawButton(ctx, CANVAS_WIDTH - 90, CANVAS_HEIGHT - 52, 80, 32, 'NEXT \u25BC', this.hoveredButton === 401, {
                normal: '#1a000a', hover: '#300018', text: '#AA4466', border: '#441133',
            });
            UIRenderer.drawText(ctx,
                `${this.rosterScroll + 1}–${Math.min(this.rosterScroll + maxVis, this._filtered.length)} / ${this._filtered.length}`,
                CANVAS_WIDTH - 200, CANVAS_HEIGHT - 20, {
                    font: '11px monospace', color: '#554455', align: 'right',
                }
            );
        }
    }

    _renderAnnounceTab(ctx) {
        const cx = CANVAS_WIDTH / 2;

        UIRenderer.drawPanel(ctx, cx - 250, 90, 500, 220, {
            bgColor: 'rgba(10,0,30,0.7)', borderColor: '#6633AA', borderWidth: 1,
        });

        UIRenderer.drawText(ctx, 'BROADCAST MESSAGE', cx, 118, {
            font: 'bold 16px monospace', color: '#9966CC',
        });
        UIRenderer.drawText(ctx, 'Your message will appear as a banner on every screen', cx, 140, {
            font: '11px monospace', color: '#553366',
        });

        const msgVal = TextInput.isFocused() ? TextInput.getValue() : '';
        TextInput.drawField(ctx, cx - 200, 155, 400, 36, 'Type your message...', msgVal, TextInput.isFocused());

        UIRenderer.drawButton(ctx, cx - 160, 210, 320, 48, '\u26BE  BROADCAST TO ALL SCREENS', this.hoveredButton === 5, {
            normal: '#180030', hover: '#280050', text: '#BB88FF', border: '#6633AA',
        });

        UIRenderer.drawText(ctx, 'Tip: Click the field above to start typing', cx, 310, {
            font: '11px monospace', color: '#442255',
        });
    }
}

// Set from main.js
GameMasterScene._TitleScene = null;
