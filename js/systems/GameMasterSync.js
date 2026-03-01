/**
 * GameMasterSync — syncs game-master admin overrides to every computer via Firebase.
 *
 * Flow:
 *   1. On startup, fetches the latest overrides from Firebase into localStorage
 *      so AdminDataManager.applyOverrides() picks them up before the game starts.
 *   2. Listens in real-time; when the game master saves a change, every other
 *      browser receives it, stores it, and reloads to apply it.
 *   3. After each AdminDataManager save, push() is called so Firebase is updated.
 */

const ADMIN_KEY = 'ob_lightning_admin_overrides';
const FIREBASE_PATH = 'gameMasterOverrides';
const FETCH_TIMEOUT_MS = 3000;

// Unique ID for this browser session — lets us ignore our own Firebase pushes.
const SESSION_ID = Math.random().toString(36).slice(2, 10);

export class GameMasterSync {
    static _db = null;
    static _initialized = false;

    /**
     * Initialize Firebase and fetch the latest game-master overrides into
     * localStorage before the game starts. Then starts real-time listener.
     * Safe to call even if Firebase SDK failed to load.
     * @param {Object} firebaseConfig
     */
    static async init(firebaseConfig) {
        if (typeof firebase === 'undefined') {
            console.warn('GameMasterSync: Firebase SDK not loaded — live sync disabled.');
            return;
        }
        if (GameMasterSync._initialized) return;

        try {
            if (!firebase.apps.length) {
                firebase.initializeApp(firebaseConfig);
            }
            GameMasterSync._db = firebase.database();
            GameMasterSync._initialized = true;
        } catch (err) {
            console.error('GameMasterSync: Firebase init failed —', err);
            return;
        }

        // Pull current state before game loads (with timeout so we don't hang)
        await GameMasterSync._fetchAndStore();

        // Subscribe to future changes
        GameMasterSync._listen();
    }

    static get isAvailable() {
        return GameMasterSync._db !== null;
    }

    /**
     * Push the current admin overrides to Firebase.
     * Called automatically by AdminDataManager after every save.
     * @param {Object} overridesData - The full overrides object
     */
    static async push(overridesData) {
        if (!GameMasterSync.isAvailable) return;
        try {
            await GameMasterSync._db.ref(FIREBASE_PATH).set({
                ...overridesData,
                _pushedBy: SESSION_ID,
                _updatedAt: Date.now(),
            });
        } catch (err) {
            console.error('GameMasterSync: push failed —', err);
        }
    }

    // ── private helpers ──────────────────────────────────────────────────────

    /** One-time fetch before game start; stores result in localStorage. */
    static async _fetchAndStore() {
        if (!GameMasterSync.isAvailable) return;
        try {
            const fetchPromise = GameMasterSync._db.ref(FIREBASE_PATH).once('value');
            const timeoutPromise = new Promise(resolve => setTimeout(resolve, FETCH_TIMEOUT_MS));
            const snapshot = await Promise.race([fetchPromise, timeoutPromise]);
            if (snapshot && typeof snapshot.val === 'function') {
                GameMasterSync._saveToLocalStorage(snapshot.val());
            }
        } catch (err) {
            console.warn('GameMasterSync: initial fetch failed —', err);
        }
    }

    /**
     * Subscribe to Firebase for real-time updates.
     * Skips the immediate first value (already handled by _fetchAndStore).
     */
    static _listen() {
        if (!GameMasterSync.isAvailable) return;
        let firstCall = true;
        GameMasterSync._db.ref(FIREBASE_PATH).on('value', (snapshot) => {
            if (firstCall) { firstCall = false; return; }

            const data = snapshot.val();
            if (!data) return;

            // Ignore pushes that originated from this same browser tab
            if (data._pushedBy === SESSION_ID) return;

            GameMasterSync._saveToLocalStorage(data);
            GameMasterSync._notifyAndReload();
        });
    }

    /** Strip sync metadata and save clean overrides to localStorage. */
    static _saveToLocalStorage(data) {
        if (!data) return;
        const { _pushedBy, _updatedAt, ...overrides } = data;
        try {
            localStorage.setItem(ADMIN_KEY, JSON.stringify(overrides));
        } catch (e) { /* quota errors — ignore */ }
    }

    /** Show a banner then reload so the new overrides take effect. */
    static _notifyAndReload() {
        if (document.getElementById('gm-sync-banner')) return;

        const banner = document.createElement('div');
        banner.id = 'gm-sync-banner';
        banner.style.cssText =
            'position:fixed;top:0;left:0;right:0;' +
            'background:#1a7a1a;color:#fff;text-align:center;' +
            'padding:14px;font-family:monospace;font-size:15px;' +
            'z-index:9999;font-weight:bold;letter-spacing:1px;';
        banner.textContent = '\u26BE GAME MASTER UPDATED — SYNCING ALL COMPUTERS...';
        document.body.appendChild(banner);

        setTimeout(() => window.location.reload(), 2500);
    }
}
