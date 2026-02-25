import { MLB_PLAYERS, RYAN_SILBER, LIGHTNING_PLAYERS, LOCAL_PLAYERS } from '../data/mlbPlayers.js';
import { shuffle } from '../utils/math.js';

export class DraftManager {
    constructor() {
        this.draftPool = [];
        this.drafted = [];      // players picked by user
        this.currentRound = 0;
        this.totalRounds = 8;   // draft 8 players (Ryan is pre-selected = 9 total)
        this.currentOptions = []; // 3 choices per round
        this.draftComplete = false;
    }

    // Build the draft pool from all available players
    initDraftPool() {
        this.draftPool = [];
        this.drafted = [];
        this.currentRound = 0;
        this.draftComplete = false;

        // Add all MLB players
        const mlb = MLB_PLAYERS.map(p => ({ ...p, source: 'MLB' }));

        // Add Lightning teammates
        const lightning = LIGHTNING_PLAYERS.map(p => ({ ...p, source: 'Lightning' }));

        // Add local players
        const local = LOCAL_PLAYERS.map(p => ({ ...p, source: 'Local' }));

        // Combine and shuffle
        this.draftPool = shuffle([...mlb, ...lightning, ...local]);
    }

    // Get the next 3 (or 4) options for the current round
    getNextOptions(count = 3) {
        if (this.draftComplete) return [];

        // Try to offer positional variety
        this.currentOptions = [];
        const used = new Set();

        // Grab from draft pool ensuring variety
        for (const player of this.draftPool) {
            if (used.has(player.id)) continue;
            if (this.currentOptions.length >= count) break;

            // Skip duplicates of already drafted positions if we have options
            this.currentOptions.push(player);
            used.add(player.id);
        }

        return this.currentOptions;
    }

    // Pick a player from the current options
    pickPlayer(playerId) {
        const picked = this.currentOptions.find(p => p.id === playerId);
        if (!picked) return null;

        // Add to drafted
        this.drafted.push(picked);

        // Remove ALL current options from pool (picked + unpicked)
        // This ensures no repeats from prior rounds
        const optionIds = new Set(this.currentOptions.map(p => p.id));
        this.draftPool = this.draftPool.filter(p => !optionIds.has(p.id));

        this.currentRound++;
        if (this.currentRound >= this.totalRounds) {
            this.draftComplete = true;
        }

        return picked;
    }

    // Skip current options and get new ones
    skipRound() {
        // Move current options to end of pool
        const currentIds = new Set(this.currentOptions.map(p => p.id));
        const skipped = this.draftPool.filter(p => currentIds.has(p.id));
        this.draftPool = [
            ...this.draftPool.filter(p => !currentIds.has(p.id)),
            ...skipped,
        ];
        return this.getNextOptions();
    }

    // Get all drafted players + Ryan Silber
    getFinalRoster() {
        return [RYAN_SILBER, ...this.drafted];
    }

    getRoundLabel() {
        return `Round ${this.currentRound + 1} of ${this.totalRounds}`;
    }

    getRemainingPicks() {
        return this.totalRounds - this.currentRound;
    }
}
