export class Coach {
    constructor(data) {
        this.id = data.id || 'unknown';
        this.name = data.name || 'Unknown Coach';
        this.stars = data.stars || 1;
        this.specialty = data.specialty || 'general'; // general, hitting, pitching, defense, speed
        this.teamSource = data.teamSource || null;
        this.isCustom = data.isCustom || false;

        // Coach bonuses (applied to all team players)
        this.bonuses = data.bonuses || {};
        // e.g. { power: 3, contact: 2 } — added to all players' stats

        this.appearance = {
            skinTone: data.skinTone || 'medium',
        };
    }

    // Get description of what this coach does
    getDescription() {
        const parts = [];
        for (const [stat, bonus] of Object.entries(this.bonuses)) {
            parts.push(`+${bonus} ${stat.charAt(0).toUpperCase() + stat.slice(1)}`);
        }
        return parts.length > 0 ? parts.join(', ') : 'No bonuses';
    }
}
