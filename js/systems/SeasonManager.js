import { OPPONENT_TEAMS, generateOpponentRoster } from '../data/teams.js';
import { GAME_SETTINGS } from '../utils/constants.js';
import { shuffle } from '../utils/math.js';

export class SeasonManager {
    constructor() {
        this.schedule = [];
        this.currentGameIndex = 0;
        this.standings = {};
        this.seasonOver = false;
        this._config = null; // Set by generateSchedule or restored from save
    }

    // Generate season schedule with optional config
    generateSchedule(config = null) {
        this.schedule = [];
        this.currentGameIndex = 0;
        this.seasonOver = false;
        this._config = config;

        const totalGames = (config && config.seasonGames) || GAME_SETTINGS.seasonGames;

        // Sort teams by difficulty for progressive schedule
        const teams = [...OPPONENT_TEAMS].sort((a, b) => a.difficulty - b.difficulty);

        const easyTeams = teams.filter(t => t.difficulty <= 3);
        const medTeams = teams.filter(t => t.difficulty >= 3 && t.difficulty <= 5);
        const hardTeams = teams.filter(t => t.difficulty >= 5 && t.difficulty <= 6);
        const eliteTeams = teams.filter(t => t.difficulty >= 6);

        // Proportional distribution scaled to totalGames
        const easyCount = Math.max(1, Math.round(totalGames * 0.3));
        const medCount = Math.max(1, Math.round(totalGames * 0.3));
        const hardCount = Math.max(1, Math.round(totalGames * 0.25));
        const eliteCount = Math.max(1, totalGames - easyCount - medCount - hardCount);

        const gameTeams = [];
        for (let i = 0; i < easyCount; i++) gameTeams.push(easyTeams[i % easyTeams.length]);
        for (let i = 0; i < medCount; i++) gameTeams.push(medTeams[i % medTeams.length]);
        for (let i = 0; i < hardCount; i++) gameTeams.push(hardTeams[i % hardTeams.length]);
        for (let i = 0; i < eliteCount; i++) gameTeams.push(eliteTeams[i % eliteTeams.length]);

        // Trim or pad to exact totalGames
        while (gameTeams.length > totalGames) gameTeams.pop();
        while (gameTeams.length < totalGames) {
            gameTeams.push(teams[Math.floor(Math.random() * teams.length)]);
        }

        // Build schedule entries
        for (let i = 0; i < totalGames; i++) {
            this.schedule.push({
                gameNumber: i + 1,
                opponent: gameTeams[i],
                result: null,
                played: false,
            });
        }

        // Init standings
        this.standings = {};
        for (const team of OPPONENT_TEAMS) {
            this.standings[team.id] = { wins: 0, losses: 0 };
        }
        this.standings['old_bridge_lightning'] = { wins: 0, losses: 0 };
    }

    getCurrentGame() {
        if (this.currentGameIndex >= this.schedule.length) return null;
        return this.schedule[this.currentGameIndex];
    }

    getNextUnplayedGame() {
        return this.schedule.find(g => !g.played) || null;
    }

    recordGameResult(gameIndex, won, homeScore, awayScore) {
        const game = this.schedule[gameIndex];
        if (!game) return;

        game.played = true;
        game.result = { won, homeScore, awayScore };

        // Update standings
        if (won) {
            this.standings['old_bridge_lightning'].wins++;
            this.standings[game.opponent.id].losses++;
        } else {
            this.standings['old_bridge_lightning'].losses++;
            this.standings[game.opponent.id].wins++;
        }

        // Simulate other teams playing each other for standings flavor
        this._simulateOtherGames();

        // Advance to next game
        this.currentGameIndex = gameIndex + 1;

        // Check if season is over
        if (this.currentGameIndex >= this.schedule.length) {
            this.seasonOver = true;
        }
    }

    _simulateOtherGames() {
        // Give other teams random W/L to make standings interesting
        const teams = OPPONENT_TEAMS;
        for (let i = 0; i < 2; i++) {
            const t1 = teams[Math.floor(Math.random() * teams.length)];
            const t2 = teams[Math.floor(Math.random() * teams.length)];
            if (t1.id !== t2.id) {
                // Higher difficulty = more likely to win
                const t1WinChance = t1.difficulty / (t1.difficulty + t2.difficulty);
                if (Math.random() < t1WinChance) {
                    this.standings[t1.id].wins++;
                    this.standings[t2.id].losses++;
                } else {
                    this.standings[t2.id].wins++;
                    this.standings[t1.id].losses++;
                }
            }
        }
    }

    getPlayerRecord() {
        return this.standings['old_bridge_lightning'] || { wins: 0, losses: 0 };
    }

    qualifiesForWorldSeries() {
        const record = this.getPlayerRecord();
        const winsNeeded = this.getWinsForWorldSeriesThreshold();
        return record.wins >= winsNeeded;
    }

    getWinsForWorldSeriesThreshold() {
        return (this._config && this._config.winsForWorldSeries)
            || GAME_SETTINGS.winsForWorldSeries;
    }

    getGamesPlayed() {
        return this.schedule.filter(g => g.played).length;
    }

    getGamesRemaining() {
        return this.schedule.filter(g => !g.played).length;
    }

    // Get sorted standings for display
    getSortedStandings() {
        const entries = Object.entries(this.standings).map(([id, record]) => {
            let name;
            if (id === 'old_bridge_lightning') {
                name = 'Old Bridge Lightning';
            } else {
                const team = OPPONENT_TEAMS.find(t => t.id === id);
                name = team ? team.name : id;
            }
            return {
                id,
                name,
                wins: record.wins,
                losses: record.losses,
                pct: record.wins + record.losses > 0
                    ? (record.wins / (record.wins + record.losses)).toFixed(3)
                    : '.000',
            };
        });

        entries.sort((a, b) => {
            const pctDiff = parseFloat(b.pct) - parseFloat(a.pct);
            if (pctDiff !== 0) return pctDiff;
            return b.wins - a.wins;
        });

        return entries;
    }
}
