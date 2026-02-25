/**
 * LeaderboardManager — Firebase Realtime Database wrapper for league leaderboards.
 * Uses the global `firebase` namespace loaded via CDN compat scripts.
 */
export class LeaderboardManager {
    static _db = null;
    static _initialized = false;

    /**
     * Initialize Firebase using the global firebase namespace (CDN compat).
     * Guards against double initialization.
     * @param {Object} firebaseConfig - Firebase project config object
     */
    static init(firebaseConfig) {
        // Guard: Firebase SDK not loaded
        if (typeof firebase === 'undefined') {
            console.warn('LeaderboardManager: Firebase SDK not loaded — leaderboard disabled.');
            return;
        }

        // Guard: already initialized
        if (LeaderboardManager._initialized) {
            return;
        }

        try {
            // Only initialize if no apps exist yet
            if (!firebase.apps.length) {
                firebase.initializeApp(firebaseConfig);
            }
            LeaderboardManager._db = firebase.database();
            LeaderboardManager._initialized = true;
        } catch (err) {
            console.error('LeaderboardManager: Failed to initialize Firebase —', err);
        }
    }

    /**
     * Returns true if the database reference is available.
     */
    static get isAvailable() {
        return LeaderboardManager._db !== null;
    }

    /**
     * Push a league result to the /leaderboard ref.
     * @param {Object} data
     * @param {string} data.leagueName
     * @param {number} data.wins
     * @param {number} data.losses
     * @param {number} data.gamesPlayed
     * @param {number} data.worldSeriesWins
     * @param {number} data.totalMoney
     * @param {number} data.inningsPerGame
     * @param {number} data.gamesPerSeason
     * @param {number} [data.timestamp] - auto-set to Date.now() if omitted
     * @returns {Promise<boolean>} true on success
     */
    static async submitLeagueResult(data) {
        if (!LeaderboardManager.isAvailable) {
            console.warn('LeaderboardManager: Cannot submit — Firebase not available.');
            return false;
        }

        try {
            const entry = {
                leagueName: data.leagueName || 'Unknown',
                wins: data.wins || 0,
                losses: data.losses || 0,
                gamesPlayed: data.gamesPlayed || 0,
                worldSeriesWins: data.worldSeriesWins || 0,
                totalMoney: data.totalMoney || 0,
                inningsPerGame: data.inningsPerGame || 9,
                gamesPerSeason: data.gamesPerSeason || 162,
                timestamp: data.timestamp || Date.now(),
            };

            await LeaderboardManager._db.ref('leaderboard').push(entry);
            return true;
        } catch (err) {
            console.error('LeaderboardManager: submitLeagueResult failed —', err);
            return false;
        }
    }

    /**
     * Fetch top league entries from /leaderboard, ordered by a given field.
     * @param {string} sortBy - Field to sort by (e.g. 'wins', 'worldSeriesWins')
     * @param {number} limit - Max entries to return
     * @returns {Promise<Array<Object>>} Entries in descending order
     */
    static async getTopLeagues(sortBy = 'wins', limit = 20) {
        if (!LeaderboardManager.isAvailable) {
            return [];
        }

        try {
            const snapshot = await LeaderboardManager._db
                .ref('leaderboard')
                .orderByChild(sortBy)
                .limitToLast(limit)
                .once('value');

            const results = [];
            snapshot.forEach((child) => {
                results.push({ id: child.key, ...child.val() });
            });

            // limitToLast returns ascending; reverse for descending order
            results.reverse();

            return results;
        } catch (err) {
            console.error('LeaderboardManager: getTopLeagues failed —', err);
            return [];
        }
    }
}
