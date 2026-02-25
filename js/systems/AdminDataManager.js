// AdminDataManager — persistence layer for all admin/gamemaster CRUD operations
// Stores overrides in localStorage separately from game saves

import { MLB_PLAYERS, LIGHTNING_PLAYERS, LOCAL_PLAYERS } from '../data/mlbPlayers.js';
import { COACHES } from '../data/coaches.js';
import { EQUIPMENT_CATALOG } from '../data/equipment.js';

const ADMIN_KEY = 'ob_lightning_admin_overrides';
const SECRETS_KEY = 'ob_lightning_unlocked_secrets';

function getDefaultOverrides() {
    return {
        players: { added: [], edited: {}, deleted: [] },
        coaches: { added: [], edited: {}, deleted: [] },
        equipment: { added: { bats: [], gloves: [], helmets: [], cleats: [], accessories: [] }, edited: {}, deleted: [] },
        secretItems: {},
    };
}

export class AdminDataManager {
    static loadOverrides() {
        try {
            const raw = localStorage.getItem(ADMIN_KEY);
            if (!raw) return getDefaultOverrides();
            const data = JSON.parse(raw);
            // Ensure all keys exist
            const def = getDefaultOverrides();
            return {
                players: { ...def.players, ...data.players },
                coaches: { ...def.coaches, ...data.coaches },
                equipment: {
                    added: { ...def.equipment.added, ...(data.equipment?.added || {}) },
                    edited: data.equipment?.edited || {},
                    deleted: data.equipment?.deleted || [],
                },
                secretItems: data.secretItems || {},
            };
        } catch (e) {
            return getDefaultOverrides();
        }
    }

    static saveOverrides(data) {
        try {
            localStorage.setItem(ADMIN_KEY, JSON.stringify(data));
            return true;
        } catch (e) {
            return false;
        }
    }

    // Called once at startup — mutates live arrays so all consumers see changes
    static applyOverrides() {
        const data = AdminDataManager.loadOverrides();

        // --- Players ---
        const allPlayerArrays = [MLB_PLAYERS, LIGHTNING_PLAYERS, LOCAL_PLAYERS];
        // Apply edits
        for (const [id, fields] of Object.entries(data.players.edited || {})) {
            for (const arr of allPlayerArrays) {
                const p = arr.find(x => x.id === id);
                if (p) Object.assign(p, fields);
            }
        }
        // Apply deletes
        const deletedPlayers = new Set(data.players.deleted || []);
        for (const arr of allPlayerArrays) {
            for (let i = arr.length - 1; i >= 0; i--) {
                if (deletedPlayers.has(arr[i].id)) arr.splice(i, 1);
            }
        }
        // Apply adds (add to LOCAL_PLAYERS)
        for (const p of (data.players.added || [])) {
            LOCAL_PLAYERS.push(p);
        }

        // --- Coaches ---
        for (const [id, fields] of Object.entries(data.coaches.edited || {})) {
            const c = COACHES.find(x => x.id === id);
            if (c) Object.assign(c, fields);
        }
        const deletedCoaches = new Set(data.coaches.deleted || []);
        for (let i = COACHES.length - 1; i >= 0; i--) {
            if (deletedCoaches.has(COACHES[i].id)) COACHES.splice(i, 1);
        }
        for (const c of (data.coaches.added || [])) {
            COACHES.push(c);
        }

        // --- Equipment ---
        const allCategories = ['bats', 'gloves', 'helmets', 'cleats', 'accessories'];
        for (const [id, fields] of Object.entries(data.equipment.edited || {})) {
            for (const cat of allCategories) {
                const item = (EQUIPMENT_CATALOG[cat] || []).find(x => x.id === id);
                if (item) Object.assign(item, fields);
            }
        }
        const deletedEquip = new Set(data.equipment.deleted || []);
        for (const cat of allCategories) {
            const arr = EQUIPMENT_CATALOG[cat];
            if (!arr) continue;
            for (let i = arr.length - 1; i >= 0; i--) {
                if (deletedEquip.has(arr[i].id)) arr.splice(i, 1);
            }
        }
        for (const cat of allCategories) {
            const added = (data.equipment.added || {})[cat] || [];
            for (const item of added) {
                if (!EQUIPMENT_CATALOG[cat]) EQUIPMENT_CATALOG[cat] = [];
                EQUIPMENT_CATALOG[cat].push(item);
            }
        }

        // --- Secret items ---
        for (const [id, secretInfo] of Object.entries(data.secretItems || {})) {
            for (const cat of allCategories) {
                const item = (EQUIPMENT_CATALOG[cat] || []).find(x => x.id === id);
                if (item) {
                    item.secret = secretInfo.secret;
                    item.unlockCode = secretInfo.unlockCode;
                }
            }
        }
    }

    // ==================== Player CRUD ====================

    static addPlayer(playerData) {
        const data = AdminDataManager.loadOverrides();
        data.players.added.push(playerData);
        AdminDataManager.saveOverrides(data);
        LOCAL_PLAYERS.push(playerData);
    }

    static editPlayer(id, fields) {
        const data = AdminDataManager.loadOverrides();
        data.players.edited[id] = { ...(data.players.edited[id] || {}), ...fields };
        AdminDataManager.saveOverrides(data);
        // Apply to live arrays
        for (const arr of [MLB_PLAYERS, LIGHTNING_PLAYERS, LOCAL_PLAYERS]) {
            const p = arr.find(x => x.id === id);
            if (p) Object.assign(p, fields);
        }
    }

    static deletePlayer(id) {
        const data = AdminDataManager.loadOverrides();
        if (!data.players.deleted.includes(id)) {
            data.players.deleted.push(id);
        }
        // Also remove from added if it was an admin-added player
        data.players.added = data.players.added.filter(p => p.id !== id);
        delete data.players.edited[id];
        AdminDataManager.saveOverrides(data);
        // Remove from live arrays
        for (const arr of [MLB_PLAYERS, LIGHTNING_PLAYERS, LOCAL_PLAYERS]) {
            const idx = arr.findIndex(x => x.id === id);
            if (idx >= 0) arr.splice(idx, 1);
        }
    }

    // ==================== Coach CRUD ====================

    static addCoach(coachData) {
        const data = AdminDataManager.loadOverrides();
        data.coaches.added.push(coachData);
        AdminDataManager.saveOverrides(data);
        COACHES.push(coachData);
    }

    static editCoach(id, fields) {
        const data = AdminDataManager.loadOverrides();
        data.coaches.edited[id] = { ...(data.coaches.edited[id] || {}), ...fields };
        AdminDataManager.saveOverrides(data);
        const c = COACHES.find(x => x.id === id);
        if (c) Object.assign(c, fields);
    }

    static deleteCoach(id) {
        const data = AdminDataManager.loadOverrides();
        if (!data.coaches.deleted.includes(id)) {
            data.coaches.deleted.push(id);
        }
        data.coaches.added = data.coaches.added.filter(c => c.id !== id);
        delete data.coaches.edited[id];
        AdminDataManager.saveOverrides(data);
        const idx = COACHES.findIndex(x => x.id === id);
        if (idx >= 0) COACHES.splice(idx, 1);
    }

    // ==================== Equipment CRUD ====================

    static addEquipment(category, itemData) {
        const data = AdminDataManager.loadOverrides();
        if (!data.equipment.added[category]) data.equipment.added[category] = [];
        data.equipment.added[category].push(itemData);
        AdminDataManager.saveOverrides(data);
        if (!EQUIPMENT_CATALOG[category]) EQUIPMENT_CATALOG[category] = [];
        EQUIPMENT_CATALOG[category].push(itemData);
    }

    static editEquipment(id, fields) {
        const data = AdminDataManager.loadOverrides();
        data.equipment.edited[id] = { ...(data.equipment.edited[id] || {}), ...fields };
        AdminDataManager.saveOverrides(data);
        for (const cat of ['bats', 'gloves', 'helmets', 'cleats', 'accessories']) {
            const item = (EQUIPMENT_CATALOG[cat] || []).find(x => x.id === id);
            if (item) Object.assign(item, fields);
        }
    }

    static deleteEquipment(id) {
        const data = AdminDataManager.loadOverrides();
        if (!data.equipment.deleted.includes(id)) {
            data.equipment.deleted.push(id);
        }
        // Remove from added
        for (const cat of ['bats', 'gloves', 'helmets', 'cleats', 'accessories']) {
            data.equipment.added[cat] = (data.equipment.added[cat] || []).filter(i => i.id !== id);
        }
        delete data.equipment.edited[id];
        AdminDataManager.saveOverrides(data);
        for (const cat of ['bats', 'gloves', 'helmets', 'cleats', 'accessories']) {
            const arr = EQUIPMENT_CATALOG[cat];
            if (!arr) continue;
            const idx = arr.findIndex(x => x.id === id);
            if (idx >= 0) arr.splice(idx, 1);
        }
    }

    static setItemSecret(id, isSecret, unlockCode) {
        const data = AdminDataManager.loadOverrides();
        if (isSecret) {
            data.secretItems[id] = { secret: true, unlockCode: unlockCode || '' };
        } else {
            delete data.secretItems[id];
        }
        AdminDataManager.saveOverrides(data);
        // Apply to live item
        for (const cat of ['bats', 'gloves', 'helmets', 'cleats', 'accessories']) {
            const item = (EQUIPMENT_CATALOG[cat] || []).find(x => x.id === id);
            if (item) {
                item.secret = isSecret;
                item.unlockCode = isSecret ? (unlockCode || '') : undefined;
            }
        }
    }

    // ==================== Secret Unlock System ====================

    static tryUnlockCode(code) {
        if (!code) return null;
        const upperCode = code.toUpperCase();
        for (const cat of ['bats', 'gloves', 'helmets', 'cleats', 'accessories']) {
            for (const item of (EQUIPMENT_CATALOG[cat] || [])) {
                if (item.secret && item.unlockCode && item.unlockCode.toUpperCase() === upperCode) {
                    // Unlock it
                    const unlocked = AdminDataManager.getUnlockedSecrets();
                    unlocked.push(item.id);
                    AdminDataManager._saveUnlockedSecrets(unlocked);
                    return item;
                }
            }
        }
        return null;
    }

    static getUnlockedSecrets() {
        try {
            const raw = localStorage.getItem(SECRETS_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    }

    static isSecretUnlocked(itemId) {
        return AdminDataManager.getUnlockedSecrets().includes(itemId);
    }

    static _saveUnlockedSecrets(ids) {
        try {
            localStorage.setItem(SECRETS_KEY, JSON.stringify([...new Set(ids)]));
        } catch (e) { /* ignore */ }
    }

    // ==================== Reset ====================

    static resetAllOverrides() {
        localStorage.removeItem(ADMIN_KEY);
        localStorage.removeItem(SECRETS_KEY);
    }
}
