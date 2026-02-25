import { FIELDER_POSITIONS } from '../utils/constants.js';

export class Team {
    constructor(name, abbreviation, colors, roster = []) {
        this.name = name;
        this.abbreviation = abbreviation;
        this.colors = colors; // { primary, secondary, accent }
        this.roster = roster; // Array of Player instances
        this.lineup = [];     // 9-player batting order (Player references)
        this.startingPitcher = null;
        this.coach = null;
        this.record = { wins: 0, losses: 0 };
    }

    addPlayer(player) {
        this.roster.push(player);
    }

    removePlayer(playerId) {
        this.roster = this.roster.filter(p => p.id !== playerId);
        this.lineup = this.lineup.filter(p => p.id !== playerId);
    }

    getPlayerByPosition(pos) {
        return this.lineup.find(p => p.assignedPosition === pos) || null;
    }

    getPlayerById(id) {
        return this.roster.find(p => p.id === id) || null;
    }

    setLineup(orderedPlayers) {
        this.lineup = orderedPlayers.slice(0, 9);
    }

    // Position players at their field positions (world coordinates)
    positionFielders() {
        for (const player of this.lineup) {
            const pos = player.assignedPosition;
            if (pos && FIELDER_POSITIONS[pos]) {
                const fieldPos = FIELDER_POSITIONS[pos];
                player.setWorldPos(fieldPos.x, fieldPos.y || 0, fieldPos.z);
            }
        }
    }

    // Auto-assign lineup based on roster and their natural positions
    autoLineup() {
        const positionOrder = ['C', 'SS', '2B', '3B', '1B', 'LF', 'CF', 'RF', 'P'];
        const assigned = new Set();
        this.lineup = [];

        // First pass: assign players to their natural positions
        for (const pos of positionOrder) {
            const candidate = this.roster.find(p =>
                !assigned.has(p.id) &&
                (p.position === pos || (p.position === 'UTIL'))
            );
            if (candidate) {
                candidate.assignedPosition = pos;
                this.lineup.push(candidate);
                assigned.add(candidate.id);
            }
        }

        // Second pass: fill remaining with any unassigned players
        for (const pos of positionOrder) {
            if (!this.lineup.find(p => p.assignedPosition === pos)) {
                const candidate = this.roster.find(p => !assigned.has(p.id));
                if (candidate) {
                    candidate.assignedPosition = pos;
                    this.lineup.push(candidate);
                    assigned.add(candidate.id);
                }
            }
        }

        // Set starting pitcher
        this.startingPitcher = this.lineup.find(p => p.assignedPosition === 'P') || null;
    }
}
