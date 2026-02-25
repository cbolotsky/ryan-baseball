import { Team } from '../entities/Team.js';
import { Player } from '../entities/Player.js';
import { Coach } from '../entities/Coach.js';
import { COACHES } from '../data/coaches.js';
import { SeasonManager } from './SeasonManager.js';
import { EconomyManager } from './EconomyManager.js';
import { EQUIPMENT_CATALOG } from '../data/equipment.js';

const SAVE_KEY = 'ob_lightning_baseball_save';

export class SaveManager {
    static save(gameData) {
        try {
            const data = {
                version: 1,
                timestamp: Date.now(),
                ...gameData,
            };
            localStorage.setItem(SAVE_KEY, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Save failed:', e);
            return false;
        }
    }

    static load() {
        try {
            const raw = localStorage.getItem(SAVE_KEY);
            if (!raw) return null;
            return JSON.parse(raw);
        } catch (e) {
            console.error('Load failed:', e);
            return null;
        }
    }

    static hasSave() {
        return localStorage.getItem(SAVE_KEY) !== null;
    }

    static deleteSave() {
        localStorage.removeItem(SAVE_KEY);
    }

    // Serialize the full game state for saving
    static serializeGameState(game) {
        const team = game.playerTeam;
        const season = game.seasonManager;
        const economy = game.economyManager;

        return {
            team: {
                name: team.name,
                abbreviation: team.abbreviation,
                colors: team.colors,
                roster: team.roster.map(p => SaveManager._serializePlayer(p)),
                lineup: team.lineup.map(p => p.id),
                coachId: team.coach ? team.coach.id : null,
                record: team.record,
            },
            season: season ? {
                schedule: season.schedule,
                currentGameIndex: season.currentGameIndex,
                standings: season.standings,
            } : null,
            economy: economy ? {
                money: economy.money,
                purchasedItems: economy.purchasedItems,
            } : null,
            inventory: game.inventory.map(item => item.id),
            seasonConfig: game.seasonConfig || null,
        };
    }

    // Restore full game state from save data
    static restoreGameState(game, saveData) {
        const teamData = saveData.team;

        // Build all equipment items for lookup
        const allItems = [];
        for (const cat of ['bats', 'gloves', 'helmets', 'cleats', 'accessories']) {
            if (EQUIPMENT_CATALOG[cat]) allItems.push(...EQUIPMENT_CATALOG[cat]);
        }

        // 1. Reconstruct Team
        const team = new Team(teamData.name, teamData.abbreviation, teamData.colors);

        for (const pData of teamData.roster) {
            const p = new Player(pData);
            // Restore assignedPosition (not set by Player constructor)
            if (pData.assignedPosition) p.assignedPosition = pData.assignedPosition;
            // Restore season stats
            if (pData.seasonStats) {
                Object.assign(p.seasonStats, pData.seasonStats);
            }
            // Restore equipment references
            if (pData.equipmentIds) {
                for (const [slot, eqId] of Object.entries(pData.equipmentIds)) {
                    if (eqId) {
                        p.equipment[slot] = allItems.find(it => it.id === eqId) || null;
                    }
                }
            }
            team.addPlayer(p);
        }

        // Restore lineup by IDs
        if (teamData.lineup) {
            team.lineup = teamData.lineup.map(id => team.getPlayerById(id)).filter(Boolean);
        }

        // Restore starting pitcher
        team.startingPitcher = team.lineup.find(p =>
            p.assignedPosition === 'P' || p.position === 'SP' || p.position === 'RP'
        ) || null;

        // Restore coach
        if (teamData.coachId) {
            const coachData = COACHES.find(c => c.id === teamData.coachId);
            if (coachData) {
                team.coach = new Coach(coachData);
            }
        }

        // Restore record
        team.record = teamData.record || { wins: 0, losses: 0 };
        game.playerTeam = team;

        // 2. Restore season config
        if (saveData.seasonConfig) {
            game.seasonConfig = saveData.seasonConfig;
        }

        // 3. Reconstruct SeasonManager
        const seasonManager = new SeasonManager();
        if (saveData.season) {
            seasonManager.schedule = saveData.season.schedule;
            seasonManager.currentGameIndex = saveData.season.currentGameIndex;
            seasonManager.standings = saveData.season.standings;
            seasonManager.seasonOver = seasonManager.currentGameIndex >= seasonManager.schedule.length;
            // Restore config reference for dynamic WS threshold
            if (saveData.seasonConfig) {
                seasonManager._config = saveData.seasonConfig;
            }
        }
        game.seasonManager = seasonManager;

        // 4. Reconstruct EconomyManager
        const economy = new EconomyManager(
            saveData.economy ? saveData.economy.money : 1000
        );
        if (saveData.economy && saveData.economy.purchasedItems) {
            economy.purchasedItems = [...saveData.economy.purchasedItems];
        }
        game.economyManager = economy;

        // 5. Restore inventory
        game.inventory = [];
        if (saveData.inventory) {
            for (const itemId of saveData.inventory) {
                const item = allItems.find(i => i.id === itemId);
                if (item) game.inventory.push(item);
            }
        }
    }

    static _serializePlayer(player) {
        return {
            id: player.id,
            name: player.name,
            number: player.number,
            position: player.position,
            stars: player.stars,
            power: player.stats.power,
            contact: player.stats.contact,
            speed: player.stats.speed,
            fielding: player.stats.fielding,
            arm: player.stats.arm,
            pitchSpeed: player.stats.pitchSpeed,
            pitchControl: player.stats.pitchControl,
            pitchBreak: player.stats.pitchBreak,
            skinTone: player.appearance.skinTone,
            height: player.appearance.height,
            build: player.appearance.build,
            bats: player.appearance.bats,
            throws: player.appearance.throws,
            isPlayerCharacter: player.isPlayerCharacter,
            isCustom: player.isCustom,
            teamSource: player.teamSource,
            assignedPosition: player.assignedPosition,
            equipmentIds: {
                bat: player.equipment.bat ? player.equipment.bat.id : null,
                glove: player.equipment.glove ? player.equipment.glove.id : null,
                helmet: player.equipment.helmet ? player.equipment.helmet.id : null,
                cleats: player.equipment.cleats ? player.equipment.cleats.id : null,
                accessory: player.equipment.accessory ? player.equipment.accessory.id : null,
            },
            seasonStats: { ...player.seasonStats },
        };
    }
}
