export class Player {
    constructor(data) {
        this.id = data.id || 'unknown';
        this.name = data.name || 'Unknown Player';
        this.number = data.number || 0;
        this.position = data.position || 'UTIL';
        this.stars = data.stars || 1;

        this.stats = {
            power: data.power || 50,
            contact: data.contact || 50,
            speed: data.speed || 50,
            fielding: data.fielding || 50,
            arm: data.arm || 50,
            pitchSpeed: data.pitchSpeed || 0,
            pitchControl: data.pitchControl || 0,
            pitchBreak: data.pitchBreak || 0,
        };

        this.appearance = {
            skinTone: data.skinTone || 'medium',
            height: data.height || 'average',
            build: data.build || 'average',
            bats: data.bats || 'R',
            throws: data.throws || 'R',
        };

        this.equipment = {
            bat: null,
            glove: null,
            helmet: null,
            cleats: null,
            accessory: null,
        };

        this.seasonStats = this._emptySeasonStats();

        this.isCustom = data.isCustom || false;
        this.isPlayerCharacter = data.isPlayerCharacter || false;
        this.teamSource = data.teamSource || null; // e.g. 'Old Bridge Lightning', 'Manalapan Braves'

        // Runtime state (used during gameplay)
        this.worldPos = { x: 0, y: 0, z: 0 };
        this.targetPos = null;
        this.animState = 'idle'; // idle, running, throwing, batting, pitching, catching, fielding
        this.animTimer = 0;
        this.facingDir = 0; // angle in radians
        this.assignedPosition = null; // position on field for this game
    }

    _emptySeasonStats() {
        return {
            gamesPlayed: 0,
            atBats: 0,
            hits: 0,
            doubles: 0,
            triples: 0,
            homeRuns: 0,
            rbi: 0,
            runs: 0,
            strikeouts: 0,
            walks: 0,
            stolenBases: 0,
            // Pitching
            inningsPitched: 0,
            pitcherStrikeouts: 0,
            pitcherWalks: 0,
            earnedRuns: 0,
            wins: 0,
            losses: 0,
            saves: 0,
        };
    }

    get avg() {
        if (this.seasonStats.atBats === 0) return '.000';
        const avg = this.seasonStats.hits / this.seasonStats.atBats;
        return avg.toFixed(3).replace('0.', '.');
    }

    get era() {
        if (this.seasonStats.inningsPitched === 0) return '0.00';
        const era = (this.seasonStats.earnedRuns / this.seasonStats.inningsPitched) * 9;
        return era.toFixed(2);
    }

    getOverall() {
        const isPitcher = this.position === 'SP' || this.position === 'RP';
        if (isPitcher) {
            return Math.round(
                this.stats.pitchSpeed * 0.35 +
                this.stats.pitchControl * 0.35 +
                this.stats.pitchBreak * 0.2 +
                this.stats.fielding * 0.1
            );
        }
        return Math.round(
            this.stats.power * 0.25 +
            this.stats.contact * 0.25 +
            this.stats.speed * 0.15 +
            this.stats.fielding * 0.2 +
            this.stats.arm * 0.15
        );
    }

    getEffectiveStats() {
        const base = { ...this.stats };
        // Apply equipment bonuses
        for (const slot of Object.values(this.equipment)) {
            if (slot && slot.bonuses) {
                for (const [stat, bonus] of Object.entries(slot.bonuses)) {
                    if (base[stat] !== undefined) {
                        base[stat] = Math.min(99, base[stat] + bonus);
                    }
                }
            }
        }
        return base;
    }

    resetSeasonStats() {
        this.seasonStats = this._emptySeasonStats();
    }

    update(dt) {
        this.animTimer += dt;

        // Move toward target if set
        if (this.targetPos) {
            const dx = this.targetPos.x - this.worldPos.x;
            const dz = this.targetPos.z - this.worldPos.z;
            const dist = Math.sqrt(dx * dx + dz * dz);

            if (dist > 1) {
                const moveSpeed = this.stats.speed * 0.8; // feet per second
                const moveAmt = Math.min(dist, moveSpeed * dt);
                this.worldPos.x += (dx / dist) * moveAmt;
                this.worldPos.z += (dz / dist) * moveAmt;
                this.facingDir = Math.atan2(dx, dz);
                this.animState = 'running';
            } else {
                this.worldPos.x = this.targetPos.x;
                this.worldPos.z = this.targetPos.z;
                this.targetPos = null;
                this.animState = 'idle';
            }
        }
    }

    setWorldPos(x, y, z) {
        this.worldPos.x = x;
        this.worldPos.y = y;
        this.worldPos.z = z;
    }

    moveTo(x, z) {
        this.targetPos = { x, z };
    }
}
