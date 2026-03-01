import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../utils/constants.js';
import { UIRenderer } from '../rendering/UIRenderer.js';
import { Audio } from '../engine/Audio.js';
import { TextInput } from '../utils/TextInput.js';
import { AdminDataManager } from '../systems/AdminDataManager.js';
import { MLB_PLAYERS, LIGHTNING_PLAYERS, LOCAL_PLAYERS } from '../data/mlbPlayers.js';
import { COACHES } from '../data/coaches.js';
import { EQUIPMENT_CATALOG, RARITY_COLORS } from '../data/equipment.js';

const TABS = ['players', 'coaches', 'shop'];
const TAB_LABELS = { players: 'PLAYERS', coaches: 'COACHES', shop: 'SHOP' };

const POSITIONS = ['C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'SP', 'RP', 'DH', 'UTIL'];
const SPECIALTIES = ['general', 'hitting', 'pitching', 'speed', 'defense'];
const RARITIES = ['common', 'uncommon', 'rare', 'legendary'];
const EQUIP_TYPES = ['bat', 'glove', 'helmet', 'cleats', 'accessory'];
const EQUIP_CATEGORIES = ['bats', 'gloves', 'helmets', 'cleats', 'accessories'];

const PLAYER_FIELDS = [
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'number', label: 'Number', type: 'number' },
    { key: 'position', label: 'Position', type: 'select', options: POSITIONS },
    { key: 'teamSource', label: 'Team', type: 'text' },
    { key: 'stars', label: 'Stars', type: 'number', min: 1, max: 5 },
    { key: 'power', label: 'Power', type: 'number', min: 0, max: 100 },
    { key: 'contact', label: 'Contact', type: 'number', min: 0, max: 100 },
    { key: 'speed', label: 'Speed', type: 'number', min: 0, max: 100 },
    { key: 'fielding', label: 'Fielding', type: 'number', min: 0, max: 100 },
    { key: 'arm', label: 'Arm', type: 'number', min: 0, max: 100 },
    { key: 'pitchSpeed', label: 'Pitch Spd', type: 'number', min: 0, max: 100 },
    { key: 'pitchControl', label: 'Pitch Ctl', type: 'number', min: 0, max: 100 },
    { key: 'pitchBreak', label: 'Pitch Brk', type: 'number', min: 0, max: 100 },
];

const COACH_FIELDS = [
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'specialty', label: 'Specialty', type: 'select', options: SPECIALTIES },
    { key: 'stars', label: 'Stars', type: 'number', min: 1, max: 5 },
    { key: 'teamSource', label: 'Team', type: 'text' },
    { key: 'bonus_power', label: '+Power', type: 'number', min: 0, max: 20 },
    { key: 'bonus_contact', label: '+Contact', type: 'number', min: 0, max: 20 },
    { key: 'bonus_speed', label: '+Speed', type: 'number', min: 0, max: 20 },
    { key: 'bonus_fielding', label: '+Fielding', type: 'number', min: 0, max: 20 },
    { key: 'bonus_arm', label: '+Arm', type: 'number', min: 0, max: 20 },
    { key: 'bonus_pitchSpeed', label: '+PitchSpd', type: 'number', min: 0, max: 20 },
    { key: 'bonus_pitchControl', label: '+PitchCtl', type: 'number', min: 0, max: 20 },
    { key: 'bonus_pitchBreak', label: '+PitchBrk', type: 'number', min: 0, max: 20 },
    { key: 'secret', label: 'Secret?', type: 'toggle' },
    { key: 'unlockCode', label: 'Unlock Code', type: 'text' },
];

const EQUIP_FIELDS = [
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'category', label: 'Category', type: 'select', options: EQUIP_CATEGORIES },
    { key: 'cost', label: 'Cost ($)', type: 'number', min: 0, max: 99999 },
    { key: 'rarity', label: 'Rarity', type: 'select', options: RARITIES },
    { key: 'description', label: 'Desc', type: 'text' },
    { key: 'bonus_power', label: '+Power', type: 'number', min: 0, max: 50 },
    { key: 'bonus_contact', label: '+Contact', type: 'number', min: 0, max: 50 },
    { key: 'bonus_speed', label: '+Speed', type: 'number', min: 0, max: 50 },
    { key: 'bonus_fielding', label: '+Fielding', type: 'number', min: 0, max: 50 },
    { key: 'bonus_arm', label: '+Arm', type: 'number', min: 0, max: 50 },
    { key: 'secret', label: 'Secret?', type: 'toggle' },
    { key: 'unlockCode', label: 'Unlock Code', type: 'text' },
];

const ROW_HEIGHT = 36;
const LIST_TOP = 110;
const LIST_LEFT = 20;
const LIST_WIDTH = 780;
const FORM_LEFT = 820;
const FORM_WIDTH = 440;

export class AdminScene {
    constructor(game) {
        this.game = game;
        this.tab = 'players';
        this.subView = 'list'; // 'list', 'edit', 'add', 'mlbPick'
        this.scrollOffset = 0;
        this.hoveredButton = -1;
        this.hoveredRow = -1;

        // Form state
        this.formData = {};
        this.formFields = [];
        this.activeFieldIndex = -1;
        this.editingId = null;
        this.addCategory = 'bats'; // for equipment add

        // MLB picker
        this.mlbDatabase = null; // lazy-loaded
        this.mlbTeams = [];
        this.mlbSelectedTeam = null;
        this.mlbScrollOffset = 0;
        this.mlbHoveredRow = -1;

        // Confirm dialog
        this.confirmDialog = null; // { message, onConfirm }

        // Feedback
        this.feedbackMsg = '';
        this.feedbackTimer = 0;

        // Scroll listener
        this._wheelHandler = null;
    }

    onEnter() {
        this._wheelHandler = (e) => {
            e.preventDefault();
            if (this.subView === 'mlbPick') {
                this.mlbScrollOffset = Math.max(0, this.mlbScrollOffset + (e.deltaY > 0 ? 3 : -3));
            } else {
                this.scrollOffset = Math.max(0, this.scrollOffset + (e.deltaY > 0 ? 3 : -3));
            }
        };
        const canvas = this.game.canvas || document.querySelector('canvas');
        canvas.addEventListener('wheel', this._wheelHandler, { passive: false });
    }

    onExit() {
        TextInput.deactivate();
        const canvas = this.game.canvas || document.querySelector('canvas');
        if (this._wheelHandler) canvas.removeEventListener('wheel', this._wheelHandler);
    }

    update(dt) {
        if (this.feedbackTimer > 0) this.feedbackTimer -= dt;

        const mx = this.game.input.mouse.x;
        const my = this.game.input.mouse.y;
        this.hoveredButton = -1;
        this.hoveredRow = -1;

        // Confirm dialog
        if (this.confirmDialog) {
            this._updateConfirmDialog(mx, my);
            return;
        }

        // Tab buttons
        for (let i = 0; i < TABS.length; i++) {
            if (UIRenderer.isPointInRect(mx, my, 20 + i * 160, 55, 140, 35)) {
                this.hoveredButton = 100 + i;
            }
        }

        // EXIT button
        if (UIRenderer.isPointInRect(mx, my, CANVAS_WIDTH - 120, 10, 100, 35)) {
            this.hoveredButton = 99;
        }

        if (this.subView === 'mlbPick') {
            this._updateMLBPicker(mx, my);
        } else if (this.subView === 'edit' || this.subView === 'add') {
            this._updateForm(mx, my);
            this._updateList(mx, my);
        } else {
            this._updateList(mx, my);
        }

        if (this.game.input.isMouseJustPressed()) {
            if (this.hoveredButton >= 0) Audio.uiClick();

            // Tab clicks
            for (let i = 0; i < TABS.length; i++) {
                if (this.hoveredButton === 100 + i && this.tab !== TABS[i]) {
                    this.tab = TABS[i];
                    this.subView = 'list';
                    this.scrollOffset = 0;
                    this.editingId = null;
                    TextInput.deactivate();
                    this.activeFieldIndex = -1;
                }
            }

            // EXIT
            if (this.hoveredButton === 99) {
                TextInput.deactivate();
                const TitleScene = AdminScene._TitleScene;
                if (TitleScene) this.game.sceneManager.transitionTo(new TitleScene(this.game));
            }
        }
    }

    _updateList(mx, my) {
        const items = this._getListItems();
        const visibleStart = this.scrollOffset;
        const maxVisible = Math.floor((CANVAS_HEIGHT - LIST_TOP - 80) / ROW_HEIGHT);
        const listW = (this.subView === 'edit' || this.subView === 'add') ? LIST_WIDTH - 10 : CANVAS_WIDTH - 40;

        for (let i = 0; i < maxVisible && (visibleStart + i) < items.length; i++) {
            const y = LIST_TOP + i * ROW_HEIGHT;
            if (UIRenderer.isPointInRect(mx, my, LIST_LEFT, y, listW, ROW_HEIGHT - 2)) {
                this.hoveredRow = visibleStart + i;
            }
        }

        // Action buttons at bottom of list
        const btnY = CANVAS_HEIGHT - 55;
        if (UIRenderer.isPointInRect(mx, my, LIST_LEFT, btnY, 140, 35)) {
            this.hoveredButton = 50; // ADD NEW
        }
        if (this.tab === 'players' && UIRenderer.isPointInRect(mx, my, LIST_LEFT + 160, btnY, 180, 35)) {
            this.hoveredButton = 51; // ADD FROM MLB
        }

        if (this.game.input.isMouseJustPressed()) {
            if (this.hoveredRow >= 0 && this.hoveredRow < items.length) {
                Audio.uiClick();
                this._openEdit(items[this.hoveredRow]);
            }
            if (this.hoveredButton === 50) {
                this._openAdd();
            }
            if (this.hoveredButton === 51) {
                this._openMLBPicker();
            }
        }
    }

    _updateForm(mx, my) {
        const fields = this.formFields;
        const formX = FORM_LEFT;
        let fy = LIST_TOP + 10;

        for (let i = 0; i < fields.length; i++) {
            const field = fields[i];
            const fieldY = fy + i * 34;
            if (fieldY > CANVAS_HEIGHT - 120) break;
            const fieldX = formX + 100;
            const fieldW = FORM_WIDTH - 120;
            const fieldH = 26;

            if (UIRenderer.isPointInRect(mx, my, fieldX, fieldY, fieldW, fieldH)) {
                this.hoveredButton = 200 + i;
            }
        }

        // Save button
        if (UIRenderer.isPointInRect(mx, my, formX, CANVAS_HEIGHT - 95, 120, 35)) {
            this.hoveredButton = 60; // SAVE
        }
        // Delete button
        if (this.subView === 'edit' && UIRenderer.isPointInRect(mx, my, formX + 140, CANVAS_HEIGHT - 95, 120, 35)) {
            this.hoveredButton = 61; // DELETE
        }
        // Cancel button
        if (UIRenderer.isPointInRect(mx, my, formX + (this.subView === 'edit' ? 280 : 140), CANVAS_HEIGHT - 95, 120, 35)) {
            this.hoveredButton = 62; // CANCEL
        }

        if (this.game.input.isMouseJustPressed()) {
            // Field clicks
            for (let i = 0; i < fields.length; i++) {
                if (this.hoveredButton === 200 + i) {
                    const field = fields[i];
                    if (field.type === 'select') {
                        // Cycle through options
                        const opts = field.options;
                        const curIdx = opts.indexOf(this.formData[field.key]);
                        this.formData[field.key] = opts[(curIdx + 1) % opts.length];
                        TextInput.deactivate();
                        this.activeFieldIndex = -1;
                    } else if (field.type === 'toggle') {
                        this.formData[field.key] = !this.formData[field.key];
                        TextInput.deactivate();
                        this.activeFieldIndex = -1;
                    } else {
                        // Text/number field - activate TextInput
                        this.activeFieldIndex = i;
                        const canvas = this.game.canvas || document.querySelector('canvas');
                        const fieldY = LIST_TOP + 10 + i * 34;
                        TextInput.activate(canvas, FORM_LEFT + 100, fieldY, FORM_WIDTH - 120, 26, String(this.formData[field.key] || ''));
                    }
                }
            }

            // Save
            if (this.hoveredButton === 60) {
                this._saveForm();
            }
            // Delete
            if (this.hoveredButton === 61) {
                this.confirmDialog = {
                    message: 'Are you sure you want to delete this?',
                    onConfirm: () => this._deleteCurrentItem(),
                };
            }
            // Cancel
            if (this.hoveredButton === 62) {
                this.subView = 'list';
                this.editingId = null;
                TextInput.deactivate();
                this.activeFieldIndex = -1;
            }
        }

        // Sync text input to form data
        if (this.activeFieldIndex >= 0 && TextInput.isFocused()) {
            const field = this.formFields[this.activeFieldIndex];
            if (field) {
                this.formData[field.key] = TextInput.getValue();
            }
        }

        // Tab key to move to next field
        if (this.game.input.isKeyJustPressed('Tab')) {
            if (this.activeFieldIndex >= 0) {
                let next = this.activeFieldIndex + 1;
                while (next < fields.length && (fields[next].type === 'select' || fields[next].type === 'toggle')) next++;
                if (next < fields.length) {
                    this.activeFieldIndex = next;
                    const canvas = this.game.canvas || document.querySelector('canvas');
                    const fieldY = LIST_TOP + 10 + next * 34;
                    TextInput.activate(canvas, FORM_LEFT + 100, fieldY, FORM_WIDTH - 120, 26, String(this.formData[fields[next].key] || ''));
                }
            }
        }
    }

    _updateMLBPicker(mx, my) {
        this.mlbHoveredRow = -1;

        // Back button
        if (UIRenderer.isPointInRect(mx, my, LIST_LEFT, CANVAS_HEIGHT - 55, 100, 35)) {
            this.hoveredButton = 70;
        }

        // Search field
        if (UIRenderer.isPointInRect(mx, my, 200, 60, 300, 30)) {
            this.hoveredButton = 71;
        }

        if (!this.mlbSelectedTeam) {
            // Team list
            const teams = this._getFilteredTeams();
            const maxVisible = Math.floor((CANVAS_HEIGHT - LIST_TOP - 80) / ROW_HEIGHT);
            for (let i = 0; i < maxVisible && (this.mlbScrollOffset + i) < teams.length; i++) {
                const y = LIST_TOP + i * ROW_HEIGHT;
                if (UIRenderer.isPointInRect(mx, my, LIST_LEFT, y, CANVAS_WIDTH - 40, ROW_HEIGHT - 2)) {
                    this.mlbHoveredRow = this.mlbScrollOffset + i;
                }
            }
        } else {
            // Player list for selected team
            const players = this._getFilteredMLBPlayers();
            const maxVisible = Math.floor((CANVAS_HEIGHT - LIST_TOP - 80) / ROW_HEIGHT);
            for (let i = 0; i < maxVisible && (this.mlbScrollOffset + i) < players.length; i++) {
                const y = LIST_TOP + i * ROW_HEIGHT;
                if (UIRenderer.isPointInRect(mx, my, LIST_LEFT, y, CANVAS_WIDTH - 40, ROW_HEIGHT - 2)) {
                    this.mlbHoveredRow = this.mlbScrollOffset + i;
                }
            }
            // Back to teams
            if (UIRenderer.isPointInRect(mx, my, LIST_LEFT + 120, CANVAS_HEIGHT - 55, 140, 35)) {
                this.hoveredButton = 72;
            }
        }

        if (this.game.input.isMouseJustPressed()) {
            if (this.hoveredButton === 70) {
                this.subView = 'list';
                TextInput.deactivate();
                return;
            }
            if (this.hoveredButton === 71) {
                const canvas = this.game.canvas || document.querySelector('canvas');
                TextInput.activate(canvas, 200, 60, 300, 30, this.mlbPickerSearch || '');
                this.activeFieldIndex = -2; // special marker for search
            }
            if (this.hoveredButton === 72) {
                this.mlbSelectedTeam = null;
                this.mlbScrollOffset = 0;
            }

            if (this.mlbHoveredRow >= 0) {
                Audio.uiClick();
                if (!this.mlbSelectedTeam) {
                    const teams = this._getFilteredTeams();
                    if (this.mlbHoveredRow < teams.length) {
                        this.mlbSelectedTeam = teams[this.mlbHoveredRow];
                        this.mlbScrollOffset = 0;
                    }
                } else {
                    const players = this._getFilteredMLBPlayers();
                    if (this.mlbHoveredRow < players.length) {
                        const p = players[this.mlbHoveredRow];
                        const newPlayer = { ...p, id: `admin_${p.id}_${Date.now()}` };
                        AdminDataManager.addPlayer(newPlayer);
                        this._showFeedback(`Added ${p.name}!`);
                    }
                }
            }
        }

        // Sync search field
        if (this.activeFieldIndex === -2 && TextInput.isFocused()) {
            this.mlbPickerSearch = TextInput.getValue();
        }
    }

    _updateConfirmDialog(mx, my) {
        this.hoveredButton = -1;
        if (UIRenderer.isPointInRect(mx, my, CANVAS_WIDTH / 2 - 130, 400, 120, 40)) {
            this.hoveredButton = 80; // YES
        }
        if (UIRenderer.isPointInRect(mx, my, CANVAS_WIDTH / 2 + 10, 400, 120, 40)) {
            this.hoveredButton = 81; // NO
        }

        if (this.game.input.isMouseJustPressed()) {
            Audio.uiClick();
            if (this.hoveredButton === 80 && this.confirmDialog.onConfirm) {
                this.confirmDialog.onConfirm();
            }
            this.confirmDialog = null;
        }
    }

    // ==================== Data helpers ====================

    _getListItems() {
        switch (this.tab) {
            case 'players': return [...MLB_PLAYERS, ...LIGHTNING_PLAYERS, ...LOCAL_PLAYERS];
            case 'coaches': return [...COACHES];
            case 'shop': {
                const items = [];
                for (const cat of EQUIP_CATEGORIES) {
                    for (const item of (EQUIPMENT_CATALOG[cat] || [])) {
                        items.push({ ...item, _category: cat });
                    }
                }
                return items;
            }
        }
        return [];
    }

    _getFilteredTeams() {
        if (!this.mlbDatabase) return [];
        let teams = Object.keys(this.mlbDatabase);
        if (this.mlbPickerSearch) {
            const search = this.mlbPickerSearch.toLowerCase();
            teams = teams.filter(t => t.toLowerCase().includes(search));
        }
        return teams.sort();
    }

    _getFilteredMLBPlayers() {
        if (!this.mlbDatabase || !this.mlbSelectedTeam) return [];
        let players = this.mlbDatabase[this.mlbSelectedTeam] || [];
        if (this.mlbPickerSearch) {
            const search = this.mlbPickerSearch.toLowerCase();
            players = players.filter(p => p.name.toLowerCase().includes(search));
        }
        return players;
    }

    // ==================== Actions ====================

    _openEdit(item) {
        this.subView = 'edit';
        this.editingId = item.id;
        TextInput.deactivate();
        this.activeFieldIndex = -1;

        switch (this.tab) {
            case 'players':
                this.formFields = PLAYER_FIELDS;
                this.formData = {};
                for (const f of PLAYER_FIELDS) {
                    this.formData[f.key] = item[f.key] || (f.type === 'number' ? 0 : '');
                }
                break;
            case 'coaches':
                this.formFields = COACH_FIELDS;
                this.formData = {};
                for (const f of COACH_FIELDS) {
                    if (f.key.startsWith('bonus_')) {
                        const stat = f.key.replace('bonus_', '');
                        this.formData[f.key] = (item.bonuses || {})[stat] || 0;
                    } else if (f.key === 'secret') {
                        this.formData.secret = !!item.secret;
                    } else {
                        this.formData[f.key] = item[f.key] || (f.type === 'number' ? 0 : '');
                    }
                }
                break;
            case 'shop':
                this.formFields = EQUIP_FIELDS;
                this.formData = {};
                for (const f of EQUIP_FIELDS) {
                    if (f.key === 'category') {
                        this.formData.category = item._category || 'bats';
                    } else if (f.key.startsWith('bonus_')) {
                        const stat = f.key.replace('bonus_', '');
                        this.formData[f.key] = (item.bonuses || {})[stat] || 0;
                    } else if (f.key === 'secret') {
                        this.formData.secret = !!item.secret;
                    } else {
                        this.formData[f.key] = item[f.key] || (f.type === 'number' ? 0 : '');
                    }
                }
                break;
        }
    }

    _openAdd() {
        this.subView = 'add';
        this.editingId = null;
        TextInput.deactivate();
        this.activeFieldIndex = -1;

        switch (this.tab) {
            case 'players':
                this.formFields = PLAYER_FIELDS;
                this.formData = { position: 'C', stars: 3, power: 50, contact: 50, speed: 50, fielding: 50, arm: 50 };
                break;
            case 'coaches':
                this.formFields = COACH_FIELDS;
                this.formData = { specialty: 'general', stars: 3, teamSource: '' };
                break;
            case 'shop':
                this.formFields = EQUIP_FIELDS;
                this.formData = { category: 'bats', rarity: 'common', cost: 500, secret: false };
                break;
        }
    }

    _openMLBPicker() {
        // Lazy-load the MLB database
        if (!this.mlbDatabase) {
            import('../data/mlbDatabase.js').then(mod => {
                this.mlbDatabase = mod.MLB_DATABASE;
                this.mlbTeams = Object.keys(this.mlbDatabase).sort();
            }).catch(() => {
                this._showFeedback('MLB Database not found');
            });
        }
        this.subView = 'mlbPick';
        this.mlbSelectedTeam = null;
        this.mlbScrollOffset = 0;
        this.mlbPickerSearch = '';
        TextInput.deactivate();
        this.activeFieldIndex = -1;
    }

    _saveForm() {
        // Sync any active text field
        if (this.activeFieldIndex >= 0 && TextInput.isFocused()) {
            const field = this.formFields[this.activeFieldIndex];
            if (field) this.formData[field.key] = TextInput.getValue();
        }
        TextInput.deactivate();
        this.activeFieldIndex = -1;

        // Parse numbers
        for (const f of this.formFields) {
            if (f.type === 'number') {
                this.formData[f.key] = parseInt(this.formData[f.key]) || 0;
                if (f.min !== undefined) this.formData[f.key] = Math.max(f.min, this.formData[f.key]);
                if (f.max !== undefined) this.formData[f.key] = Math.min(f.max, this.formData[f.key]);
            }
        }

        switch (this.tab) {
            case 'players': this._savePlayer(); break;
            case 'coaches': this._saveCoach(); break;
            case 'shop': this._saveEquipment(); break;
        }
    }

    _savePlayer() {
        const d = this.formData;
        const playerData = {
            name: d.name || 'New Player',
            number: d.number || 0,
            position: d.position || 'C',
            teamSource: d.teamSource || 'Unknown',
            stars: d.stars || 3,
            power: d.power || 50,
            contact: d.contact || 50,
            speed: d.speed || 50,
            fielding: d.fielding || 50,
            arm: d.arm || 50,
            bats: 'R', throws: 'R',
            height: 'average', build: 'average', skinTone: 'light',
        };
        if (d.pitchSpeed) playerData.pitchSpeed = d.pitchSpeed;
        if (d.pitchControl) playerData.pitchControl = d.pitchControl;
        if (d.pitchBreak) playerData.pitchBreak = d.pitchBreak;

        if (this.subView === 'add') {
            playerData.id = `admin_player_${Date.now()}`;
            AdminDataManager.addPlayer(playerData);
            this._showFeedback(`Added ${playerData.name}!`);
        } else {
            AdminDataManager.editPlayer(this.editingId, playerData);
            this._showFeedback(`Saved ${playerData.name}!`);
        }
        this.subView = 'list';
    }

    _saveCoach() {
        const d = this.formData;
        const bonuses = {};
        for (const f of this.formFields) {
            if (f.key.startsWith('bonus_')) {
                const stat = f.key.replace('bonus_', '');
                const val = parseInt(d[f.key]) || 0;
                if (val > 0) bonuses[stat] = val;
            }
        }

        const coachData = {
            name: d.name || 'New Coach',
            specialty: d.specialty || 'general',
            stars: d.stars || 3,
            teamSource: d.teamSource || 'Unknown',
            bonuses,
            skinTone: 'light',
        };

        if (d.secret) {
            coachData.secret = true;
            coachData.unlockCode = d.unlockCode || '';
        }

        if (this.subView === 'add') {
            coachData.id = `admin_coach_${Date.now()}`;
            AdminDataManager.addCoach(coachData);
            if (d.secret) AdminDataManager.setCoachSecret(coachData.id, true, d.unlockCode || '');
            this._showFeedback(`Added Coach ${coachData.name}!`);
        } else {
            AdminDataManager.editCoach(this.editingId, coachData);
            if (d.secret) {
                AdminDataManager.setCoachSecret(this.editingId, true, d.unlockCode || '');
            } else {
                AdminDataManager.setCoachSecret(this.editingId, false, '');
            }
            this._showFeedback(`Saved Coach ${coachData.name}!`);
        }
        this.subView = 'list';
    }

    _saveEquipment() {
        const d = this.formData;
        const bonuses = {};
        for (const f of this.formFields) {
            if (f.key.startsWith('bonus_')) {
                const stat = f.key.replace('bonus_', '');
                const val = parseInt(d[f.key]) || 0;
                if (val > 0) bonuses[stat] = val;
            }
        }

        const category = d.category || 'bats';
        const typeMap = { bats: 'bat', gloves: 'glove', helmets: 'helmet', cleats: 'cleats', accessories: 'accessory' };

        const itemData = {
            name: d.name || 'New Item',
            type: typeMap[category] || 'bat',
            cost: parseInt(d.cost) || 0,
            rarity: d.rarity || 'common',
            description: d.description || '',
            bonuses,
        };

        if (d.secret) {
            itemData.secret = true;
            itemData.unlockCode = d.unlockCode || '';
        }

        if (this.subView === 'add') {
            itemData.id = `admin_equip_${Date.now()}`;
            AdminDataManager.addEquipment(category, itemData);
            if (d.secret) AdminDataManager.setItemSecret(itemData.id, true, d.unlockCode || '');
            this._showFeedback(`Added ${itemData.name}!`);
        } else {
            AdminDataManager.editEquipment(this.editingId, itemData);
            if (d.secret) {
                AdminDataManager.setItemSecret(this.editingId, true, d.unlockCode || '');
            } else {
                AdminDataManager.setItemSecret(this.editingId, false, '');
            }
            this._showFeedback(`Saved ${itemData.name}!`);
        }
        this.subView = 'list';
    }

    _deleteCurrentItem() {
        switch (this.tab) {
            case 'players':
                AdminDataManager.deletePlayer(this.editingId);
                this._showFeedback('Player deleted.');
                break;
            case 'coaches':
                AdminDataManager.deleteCoach(this.editingId);
                this._showFeedback('Coach deleted.');
                break;
            case 'shop':
                AdminDataManager.deleteEquipment(this.editingId);
                this._showFeedback('Item deleted.');
                break;
        }
        this.subView = 'list';
        this.editingId = null;
        TextInput.deactivate();
        this.activeFieldIndex = -1;
    }

    _showFeedback(msg) {
        this.feedbackMsg = msg;
        this.feedbackTimer = 2;
    }

    // ==================== Rendering ====================

    render(ctx) {
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Header
        UIRenderer.drawText(ctx, 'GAMEMASTER', CANVAS_WIDTH / 2, 25, {
            font: 'bold 28px monospace', color: '#FF6644', shadow: true, shadowOffset: 2,
        });

        // Tab buttons
        for (let i = 0; i < TABS.length; i++) {
            const active = this.tab === TABS[i];
            UIRenderer.drawButton(ctx, 20 + i * 160, 55, 140, 35, TAB_LABELS[TABS[i]],
                this.hoveredButton === 100 + i || active, {
                    normal: active ? '#333' : '#1a1a1a',
                    hover: '#444',
                    text: active ? '#FFD700' : '#888',
                    border: active ? '#FFD700' : '#444',
                });
        }

        // EXIT button
        UIRenderer.drawButton(ctx, CANVAS_WIDTH - 120, 10, 100, 35, 'EXIT', this.hoveredButton === 99, {
            normal: '#2a1a1a', hover: '#4a2a2a', text: '#FF4444', border: '#FF4444',
        });

        // Main content
        if (this.subView === 'mlbPick') {
            this._renderMLBPicker(ctx);
        } else {
            this._renderList(ctx);
            if (this.subView === 'edit' || this.subView === 'add') {
                this._renderForm(ctx);
            }
        }

        // Feedback message
        if (this.feedbackTimer > 0 && this.feedbackMsg) {
            const alpha = Math.min(1, this.feedbackTimer);
            ctx.save();
            ctx.globalAlpha = alpha;
            UIRenderer.drawText(ctx, this.feedbackMsg, CANVAS_WIDTH / 2, CANVAS_HEIGHT - 20, {
                font: 'bold 16px monospace', color: '#FFD700',
            });
            ctx.restore();
        }

        // Confirm dialog
        if (this.confirmDialog) {
            this._renderConfirmDialog(ctx);
        }
    }

    _renderList(ctx) {
        const items = this._getListItems();
        const visibleStart = this.scrollOffset;
        const listW = (this.subView === 'edit' || this.subView === 'add') ? LIST_WIDTH - 10 : CANVAS_WIDTH - 40;
        const maxVisible = Math.floor((CANVAS_HEIGHT - LIST_TOP - 80) / ROW_HEIGHT);

        // Column headers
        ctx.save();
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#666';
        if (this.tab === 'players') {
            ctx.fillText('NAME', LIST_LEFT + 10, LIST_TOP - 5);
            ctx.fillText('POS', LIST_LEFT + 200, LIST_TOP - 5);
            ctx.fillText('TEAM', LIST_LEFT + 250, LIST_TOP - 5);
            if (listW > 600) {
                ctx.fillText('STARS', LIST_LEFT + 460, LIST_TOP - 5);
                ctx.fillText('PWR', LIST_LEFT + 520, LIST_TOP - 5);
                ctx.fillText('CON', LIST_LEFT + 560, LIST_TOP - 5);
                ctx.fillText('SPD', LIST_LEFT + 600, LIST_TOP - 5);
            }
        } else if (this.tab === 'coaches') {
            ctx.fillText('NAME', LIST_LEFT + 10, LIST_TOP - 5);
            ctx.fillText('SPECIALTY', LIST_LEFT + 250, LIST_TOP - 5);
            ctx.fillText('STARS', LIST_LEFT + 380, LIST_TOP - 5);
            ctx.fillText('BONUSES', LIST_LEFT + 450, LIST_TOP - 5);
        } else {
            ctx.fillText('NAME', LIST_LEFT + 10, LIST_TOP - 5);
            ctx.fillText('CAT', LIST_LEFT + 220, LIST_TOP - 5);
            ctx.fillText('RARITY', LIST_LEFT + 290, LIST_TOP - 5);
            ctx.fillText('COST', LIST_LEFT + 380, LIST_TOP - 5);
            if (listW > 600) ctx.fillText('SECRET', LIST_LEFT + 450, LIST_TOP - 5);
        }
        ctx.restore();

        // Rows
        for (let i = 0; i < maxVisible && (visibleStart + i) < items.length; i++) {
            const idx = visibleStart + i;
            const item = items[idx];
            const y = LIST_TOP + i * ROW_HEIGHT;
            const hovered = this.hoveredRow === idx;
            const isEditing = this.editingId === item.id;

            UIRenderer.drawPanel(ctx, LIST_LEFT, y, listW, ROW_HEIGHT - 2, {
                bgColor: isEditing ? 'rgba(60,60,0,0.6)' : (hovered ? 'rgba(40,40,40,0.6)' : 'rgba(15,15,25,0.5)'),
                borderColor: isEditing ? '#FFD700' : (hovered ? '#666' : '#222'),
                borderWidth: 1,
            });

            ctx.save();
            ctx.font = '13px monospace';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            const cy = y + ROW_HEIGHT / 2 - 1;

            if (this.tab === 'players') {
                ctx.fillStyle = '#FFF';
                ctx.fillText(item.name || '', LIST_LEFT + 10, cy);
                ctx.fillStyle = '#AAA';
                ctx.fillText(item.position || '', LIST_LEFT + 200, cy);
                ctx.fillStyle = '#888';
                const team = (item.teamSource || '').substring(0, 22);
                ctx.fillText(team, LIST_LEFT + 250, cy);
                if (listW > 600) {
                    ctx.fillStyle = '#FFD700';
                    ctx.fillText('*'.repeat(item.stars || 0), LIST_LEFT + 460, cy);
                    ctx.fillStyle = '#FF6644';
                    ctx.fillText(String(item.power || 0), LIST_LEFT + 520, cy);
                    ctx.fillStyle = '#44FF44';
                    ctx.fillText(String(item.contact || 0), LIST_LEFT + 560, cy);
                    ctx.fillStyle = '#44AAFF';
                    ctx.fillText(String(item.speed || 0), LIST_LEFT + 600, cy);
                }
            } else if (this.tab === 'coaches') {
                ctx.fillStyle = '#FFF';
                ctx.fillText(item.name || '', LIST_LEFT + 10, cy);
                ctx.fillStyle = '#AAA';
                ctx.fillText((item.specialty || '').toUpperCase(), LIST_LEFT + 250, cy);
                ctx.fillStyle = '#FFD700';
                ctx.fillText('*'.repeat(item.stars || 0), LIST_LEFT + 380, cy);
                ctx.fillStyle = '#44FF44';
                const bonusStr = Object.entries(item.bonuses || {}).map(([k, v]) => `+${v}${k.substring(0, 3)}`).join(' ');
                ctx.fillText(bonusStr, LIST_LEFT + 450, cy);
                if (listW > 600) {
                    ctx.fillStyle = item.secret ? '#FF4444' : '#333';
                    ctx.fillText(item.secret ? 'SECRET' : '--', LIST_LEFT + 650, cy);
                }
            } else {
                ctx.fillStyle = RARITY_COLORS[item.rarity] || '#AAA';
                ctx.fillText(item.name || '', LIST_LEFT + 10, cy);
                ctx.fillStyle = '#888';
                ctx.fillText(item._category || '', LIST_LEFT + 220, cy);
                ctx.fillStyle = RARITY_COLORS[item.rarity] || '#AAA';
                ctx.fillText((item.rarity || '').toUpperCase(), LIST_LEFT + 290, cy);
                ctx.fillStyle = '#44FF44';
                ctx.fillText(`$${item.cost || 0}`, LIST_LEFT + 380, cy);
                if (listW > 600) {
                    ctx.fillStyle = item.secret ? '#FF4444' : '#333';
                    ctx.fillText(item.secret ? 'SECRET' : '--', LIST_LEFT + 450, cy);
                }
            }
            ctx.restore();
        }

        // Scroll info
        if (items.length > maxVisible) {
            UIRenderer.drawText(ctx, `${visibleStart + 1}-${Math.min(visibleStart + maxVisible, items.length)} of ${items.length}`, CANVAS_WIDTH - 100, LIST_TOP - 5, {
                font: '11px monospace', color: '#666',
            });
        }

        // Bottom buttons
        const btnY = CANVAS_HEIGHT - 55;
        UIRenderer.drawButton(ctx, LIST_LEFT, btnY, 140, 35, 'ADD NEW', this.hoveredButton === 50, {
            normal: '#1a2a1a', hover: '#2a4a2a', text: '#44FF44', border: '#44FF44',
        });
        if (this.tab === 'players') {
            UIRenderer.drawButton(ctx, LIST_LEFT + 160, btnY, 180, 35, 'ADD FROM MLB', this.hoveredButton === 51, {
                normal: '#1a1a2a', hover: '#2a2a4a', text: '#4488FF', border: '#4488FF',
            });
        }
    }

    _renderForm(ctx) {
        // Form panel
        UIRenderer.drawPanel(ctx, FORM_LEFT - 10, LIST_TOP - 15, FORM_WIDTH + 20, CANVAS_HEIGHT - LIST_TOP - 20, {
            bgColor: 'rgba(10,10,20,0.95)',
            borderColor: '#FFD700',
            borderWidth: 2,
        });

        const title = this.subView === 'add' ? 'ADD NEW' : 'EDIT';
        UIRenderer.drawText(ctx, title, FORM_LEFT + FORM_WIDTH / 2 - 10, LIST_TOP, {
            font: 'bold 16px monospace', color: '#FFD700',
        });

        // Fields
        for (let i = 0; i < this.formFields.length; i++) {
            const field = this.formFields[i];
            const fieldY = LIST_TOP + 10 + i * 34;
            if (fieldY > CANVAS_HEIGHT - 130) break;
            const fieldX = FORM_LEFT + 100;
            const fieldW = FORM_WIDTH - 120;
            const fieldH = 26;
            const isActive = this.activeFieldIndex === i;
            const value = this.formData[field.key];

            // Label
            ctx.save();
            ctx.font = '12px monospace';
            ctx.fillStyle = '#AAA';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            ctx.fillText(field.label, FORM_LEFT + 90, fieldY + fieldH / 2);
            ctx.restore();

            if (field.type === 'select') {
                // Select field - show current value, click to cycle
                const hovered = this.hoveredButton === 200 + i;
                ctx.save();
                ctx.fillStyle = hovered ? 'rgba(40,40,20,0.95)' : 'rgba(20,20,30,0.95)';
                ctx.strokeStyle = hovered ? '#FFD700' : '#555';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.rect(fieldX, fieldY, fieldW, fieldH);
                ctx.fill();
                ctx.stroke();
                ctx.font = '14px monospace';
                ctx.fillStyle = '#FFD700';
                ctx.textAlign = 'left';
                ctx.textBaseline = 'middle';
                ctx.fillText(`< ${String(value || field.options[0]).toUpperCase()} >`, fieldX + 6, fieldY + fieldH / 2);
                ctx.restore();
            } else if (field.type === 'toggle') {
                // Toggle
                const hovered = this.hoveredButton === 200 + i;
                ctx.save();
                ctx.fillStyle = value ? '#44FF44' : '#FF4444';
                ctx.strokeStyle = hovered ? '#FFD700' : '#555';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.rect(fieldX, fieldY, fieldW, fieldH);
                ctx.fill();
                ctx.stroke();
                ctx.font = 'bold 14px monospace';
                ctx.fillStyle = '#000';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(value ? 'YES' : 'NO', fieldX + fieldW / 2, fieldY + fieldH / 2);
                ctx.restore();
            } else {
                // Text/number field
                TextInput.drawField(ctx, fieldX, fieldY, fieldW, fieldH, '', String(value || ''), isActive);
            }
        }

        // Buttons
        const btnY = CANVAS_HEIGHT - 95;
        UIRenderer.drawButton(ctx, FORM_LEFT, btnY, 120, 35, 'SAVE', this.hoveredButton === 60, {
            normal: '#1a2a1a', hover: '#2a4a2a', text: '#44FF44', border: '#44FF44',
        });
        if (this.subView === 'edit') {
            UIRenderer.drawButton(ctx, FORM_LEFT + 140, btnY, 120, 35, 'DELETE', this.hoveredButton === 61, {
                normal: '#2a1a1a', hover: '#4a2a2a', text: '#FF4444', border: '#FF4444',
            });
        }
        const cancelX = FORM_LEFT + (this.subView === 'edit' ? 280 : 140);
        UIRenderer.drawButton(ctx, cancelX, btnY, 120, 35, 'CANCEL', this.hoveredButton === 62, {
            normal: '#222', hover: '#444', text: '#AAA', border: '#666',
        });
    }

    _renderMLBPicker(ctx) {
        UIRenderer.drawText(ctx, 'MLB DATABASE', CANVAS_WIDTH / 2, LIST_TOP - 30, {
            font: 'bold 20px monospace', color: '#4488FF',
        });

        // Search field
        const searchVal = this.mlbPickerSearch || '';
        TextInput.drawField(ctx, 200, 60, 300, 30, 'Search', searchVal, this.activeFieldIndex === -2, {
            placeholder: 'Type to search...',
        });

        if (!this.mlbDatabase) {
            UIRenderer.drawText(ctx, 'Loading database...', CANVAS_WIDTH / 2, 300, {
                font: '16px monospace', color: '#888',
            });
        } else if (!this.mlbSelectedTeam) {
            // Team list
            const teams = this._getFilteredTeams();
            const maxVisible = Math.floor((CANVAS_HEIGHT - LIST_TOP - 80) / ROW_HEIGHT);
            for (let i = 0; i < maxVisible && (this.mlbScrollOffset + i) < teams.length; i++) {
                const idx = this.mlbScrollOffset + i;
                const team = teams[idx];
                const y = LIST_TOP + i * ROW_HEIGHT;
                const hovered = this.mlbHoveredRow === idx;

                UIRenderer.drawPanel(ctx, LIST_LEFT, y, CANVAS_WIDTH - 40, ROW_HEIGHT - 2, {
                    bgColor: hovered ? 'rgba(30,30,60,0.8)' : 'rgba(15,15,25,0.5)',
                    borderColor: hovered ? '#4488FF' : '#222',
                    borderWidth: 1,
                });

                ctx.save();
                ctx.font = 'bold 14px monospace';
                ctx.fillStyle = hovered ? '#4488FF' : '#FFF';
                ctx.textAlign = 'left';
                ctx.textBaseline = 'middle';
                ctx.fillText(team, LIST_LEFT + 15, y + ROW_HEIGHT / 2 - 1);
                const count = (this.mlbDatabase[team] || []).length;
                ctx.fillStyle = '#666';
                ctx.fillText(`${count} players`, LIST_LEFT + 400, y + ROW_HEIGHT / 2 - 1);
                ctx.restore();
            }
        } else {
            // Player list
            UIRenderer.drawText(ctx, this.mlbSelectedTeam, LIST_LEFT + 10, LIST_TOP - 5, {
                font: 'bold 14px monospace', color: '#4488FF', align: 'left',
            });

            const players = this._getFilteredMLBPlayers();
            const maxVisible = Math.floor((CANVAS_HEIGHT - LIST_TOP - 80) / ROW_HEIGHT);
            for (let i = 0; i < maxVisible && (this.mlbScrollOffset + i) < players.length; i++) {
                const idx = this.mlbScrollOffset + i;
                const p = players[idx];
                const y = LIST_TOP + i * ROW_HEIGHT;
                const hovered = this.mlbHoveredRow === idx;

                UIRenderer.drawPanel(ctx, LIST_LEFT, y, CANVAS_WIDTH - 40, ROW_HEIGHT - 2, {
                    bgColor: hovered ? 'rgba(30,60,30,0.8)' : 'rgba(15,15,25,0.5)',
                    borderColor: hovered ? '#44FF44' : '#222',
                    borderWidth: 1,
                });

                ctx.save();
                ctx.font = '13px monospace';
                ctx.textAlign = 'left';
                ctx.textBaseline = 'middle';
                const cy = y + ROW_HEIGHT / 2 - 1;
                ctx.fillStyle = '#FFF';
                ctx.fillText(p.name, LIST_LEFT + 10, cy);
                ctx.fillStyle = '#AAA';
                ctx.fillText(p.position, LIST_LEFT + 250, cy);
                ctx.fillStyle = '#FFD700';
                ctx.fillText('*'.repeat(p.stars), LIST_LEFT + 300, cy);
                ctx.fillStyle = '#FF6644';
                ctx.fillText(`PWR:${p.power}`, LIST_LEFT + 380, cy);
                ctx.fillStyle = '#44FF44';
                ctx.fillText(`CON:${p.contact}`, LIST_LEFT + 460, cy);
                if (hovered) {
                    ctx.fillStyle = '#44FF44';
                    ctx.font = 'bold 12px monospace';
                    ctx.textAlign = 'right';
                    ctx.fillText('CLICK TO ADD', CANVAS_WIDTH - 40, cy);
                }
                ctx.restore();
            }

            // Back to teams button
            UIRenderer.drawButton(ctx, LIST_LEFT + 120, CANVAS_HEIGHT - 55, 140, 35, 'ALL TEAMS', this.hoveredButton === 72, {
                normal: '#1a1a2a', hover: '#2a2a4a', text: '#4488FF', border: '#4488FF',
            });
        }

        // Back button
        UIRenderer.drawButton(ctx, LIST_LEFT, CANVAS_HEIGHT - 55, 100, 35, 'BACK', this.hoveredButton === 70, {
            normal: '#222', hover: '#444', text: '#AAA', border: '#666',
        });
    }

    _renderConfirmDialog(ctx) {
        ctx.fillStyle = 'rgba(0,0,0,0.75)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        UIRenderer.drawPanel(ctx, CANVAS_WIDTH / 2 - 200, 320, 400, 140, {
            bgColor: 'rgba(15,15,25,0.98)',
            borderColor: '#FF4444',
            borderWidth: 2,
        });

        UIRenderer.drawText(ctx, this.confirmDialog.message, CANVAS_WIDTH / 2, 360, {
            font: 'bold 16px monospace', color: '#FFF',
        });

        UIRenderer.drawButton(ctx, CANVAS_WIDTH / 2 - 130, 400, 120, 40, 'YES', this.hoveredButton === 80, {
            normal: '#2a1a1a', hover: '#4a2a2a', text: '#FF4444', border: '#FF4444',
        });
        UIRenderer.drawButton(ctx, CANVAS_WIDTH / 2 + 10, 400, 120, 40, 'NO', this.hoveredButton === 81, {
            normal: '#222', hover: '#444', text: '#AAA', border: '#666',
        });
    }
}

// Lazy imports
AdminScene._TitleScene = null;
