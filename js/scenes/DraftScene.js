import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../utils/constants.js';
import { UIRenderer } from '../rendering/UIRenderer.js';
import { DraftManager } from '../systems/DraftManager.js';
import { RYAN_SILBER } from '../data/mlbPlayers.js';
import { RARITY_COLORS } from '../data/equipment.js';
import { COACHES } from '../data/coaches.js';
import { Player } from '../entities/Player.js';
import { Team } from '../entities/Team.js';
import { Coach } from '../entities/Coach.js';
import { EconomyManager } from '../systems/EconomyManager.js';
import { Audio } from '../engine/Audio.js';
import { SeasonManager } from '../systems/SeasonManager.js';
import { AdminDataManager } from '../systems/AdminDataManager.js';
import { TextInput } from '../utils/TextInput.js';

const STAR_COLORS = { 5: '#FFD700', 4: '#4488FF', 3: '#44FF44', 2: '#AAAAAA', 1: '#777777' };

export class DraftScene {
    constructor(game) {
        this.game = game;
        this.draftManager = new DraftManager();
        this.phase = 'coach'; // 'coach', 'drafting', 'complete'
        this.hoveredCard = -1;
        this.hoveredButton = -1;
        this.animTimer = 0;
        this.pickAnimation = null; // { player, timer }

        // Coach selection
        this.coachPage = 0;
        this.coachesPerPage = 4;
        this.selectedCoach = null;

        // Secret coach unlock
        this.unlockedSecrets = new Set(AdminDataManager.getUnlockedSecrets());
        this.codeInputActive = false;
        this.unlockFeedback = '';
        this.unlockFeedbackTimer = 0;

        // Draft cards
        this.cardOptions = [];
    }

    _getVisibleCoaches() {
        return COACHES.filter(c => !c.secret || this.unlockedSecrets.has(c.id));
    }

    onEnter() {
        this.draftManager.initDraftPool();
    }

    onExit() {
        TextInput.deactivate();
        this.codeInputActive = false;
    }

    update(dt) {
        this.animTimer += dt;
        const mx = this.game.input.mouse.x;
        const my = this.game.input.mouse.y;

        if (this.pickAnimation) {
            this.pickAnimation.timer -= dt;
            if (this.pickAnimation.timer <= 0) {
                this.pickAnimation = null;
                if (this.draftManager.draftComplete) {
                    this.phase = 'complete';
                } else {
                    this.cardOptions = this.draftManager.getNextOptions(3);
                }
            }
            return;
        }

        if (this.phase === 'coach') {
            this._updateCoachSelection(mx, my, dt);
        } else if (this.phase === 'drafting') {
            this._updateDrafting(mx, my);
        } else if (this.phase === 'complete') {
            this._updateComplete(mx, my);
        }
    }

    _updateCoachSelection(mx, my, dt) {
        if (this.unlockFeedbackTimer > 0) this.unlockFeedbackTimer -= dt;

        const coaches = this._getVisibleCoaches();
        const startIdx = this.coachPage * this.coachesPerPage;
        const visible = coaches.slice(startIdx, startIdx + this.coachesPerPage);

        this.hoveredCard = -1;
        for (let i = 0; i < visible.length; i++) {
            const cx = 100 + i * 280;
            const cy = 200;
            if (mx >= cx && mx <= cx + 240 && my >= cy && my <= cy + 340) {
                this.hoveredCard = i;
            }
        }

        // Navigation arrows
        this.hoveredButton = -1;
        if (this.coachPage > 0 && mx >= 20 && mx <= 60 && my >= 350 && my <= 400) {
            this.hoveredButton = 0; // left arrow
        }
        if ((this.coachPage + 1) * this.coachesPerPage < coaches.length &&
            mx >= CANVAS_WIDTH - 60 && mx <= CANVAS_WIDTH - 20 && my >= 350 && my <= 400) {
            this.hoveredButton = 1; // right arrow
        }

        // Unlock code field and button
        if (UIRenderer.isPointInRect(mx, my, CANVAS_WIDTH / 2 - 160, CANVAS_HEIGHT - 80, 220, 30)) {
            this.hoveredButton = 10; // code input field
        }
        if (UIRenderer.isPointInRect(mx, my, CANVAS_WIDTH / 2 + 70, CANVAS_HEIGHT - 84, 90, 36)) {
            this.hoveredButton = 11; // UNLOCK button
        }

        if (this.game.input.isMouseJustPressed()) {
            if (this.hoveredCard >= 0) {
                Audio.uiClick();
                this.selectedCoach = visible[this.hoveredCard];
                this.phase = 'drafting';
                this.cardOptions = this.draftManager.getNextOptions(3);
            } else if (this.hoveredButton === 0) {
                Audio.uiClick();
                this.coachPage--;
            } else if (this.hoveredButton === 1) {
                Audio.uiClick();
                this.coachPage++;
            } else if (this.hoveredButton === 10) {
                if (!this.codeInputActive) {
                    const canvas = this.game.canvas || document.getElementById('gameCanvas');
                    TextInput.activate(canvas, CANVAS_WIDTH / 2 - 160, CANVAS_HEIGHT - 80, 220, 30, '');
                    this.codeInputActive = true;
                }
            } else if (this.hoveredButton === 11) {
                this._tryCoachUnlock();
            } else if (this.codeInputActive) {
                // Clicked elsewhere — keep input active
            }
        }

        // Enter key submits unlock
        if (this.codeInputActive && this.game.input.isKeyJustPressed && this.game.input.isKeyJustPressed('Enter')) {
            this._tryCoachUnlock();
        }
    }

    _tryCoachUnlock() {
        const code = TextInput.getValue().trim();
        const found = AdminDataManager.tryUnlockCode(code);
        if (found && COACHES.some(c => c.id === found.id)) {
            this.unlockedSecrets = new Set(AdminDataManager.getUnlockedSecrets());
            this.unlockFeedback = `Unlocked: ${found.name}!`;
            this.coachPage = 0;
        } else if (found) {
            this.unlockFeedback = 'That code unlocks equipment, not a coach.';
        } else {
            this.unlockFeedback = 'Invalid code.';
        }
        this.unlockFeedbackTimer = 3;
        TextInput.deactivate();
        this.codeInputActive = false;
    }

    _updateDrafting(mx, my) {
        this.hoveredCard = -1;
        for (let i = 0; i < this.cardOptions.length; i++) {
            const cx = 140 + i * 350;
            const cy = 160;
            if (mx >= cx && mx <= cx + 300 && my >= cy && my <= cy + 420) {
                this.hoveredCard = i;
            }
        }

        // Skip button
        this.hoveredButton = -1;
        const skipX = CANVAS_WIDTH / 2 - 60;
        const skipY = CANVAS_HEIGHT - 60;
        if (mx >= skipX && mx <= skipX + 120 && my >= skipY && my <= skipY + 40) {
            this.hoveredButton = 2;
        }

        if (this.game.input.isMouseJustPressed()) {
            if (this.hoveredCard >= 0 && this.hoveredCard < this.cardOptions.length) {
                Audio.uiClick();
                const picked = this.draftManager.pickPlayer(this.cardOptions[this.hoveredCard].id);
                if (picked) {
                    this.pickAnimation = { player: picked, timer: 1.0 };
                }
            } else if (this.hoveredButton === 2) {
                Audio.uiClick();
                this.cardOptions = this.draftManager.skipRound();
            }
        }
    }

    _updateComplete(mx, my) {
        this.hoveredButton = -1;
        const btnX = CANVAS_WIDTH / 2 - 100;
        const btnY = CANVAS_HEIGHT - 80;
        if (mx >= btnX && mx <= btnX + 200 && my >= btnY && my <= btnY + 50) {
            this.hoveredButton = 3;
        }

        if (this.game.input.isMouseJustPressed() && this.hoveredButton === 3) {
            Audio.uiClick();
            this._finalizeDraft();
        }
    }

    _finalizeDraft() {
        // Build the player's team
        const team = new Team('Old Bridge Lightning', 'OBL', {
            primary: '#000000',
            secondary: '#FFD700',
            accent: '#FFFFFF',
        });

        // Add all drafted players
        const roster = this.draftManager.getFinalRoster();
        for (const data of roster) {
            team.addPlayer(new Player(data));
        }

        // Set coach
        if (this.selectedCoach) {
            team.coach = new Coach(this.selectedCoach);
        }

        team.autoLineup();

        // Store on game object
        this.game.playerTeam = team;
        this.game.economyManager = new EconomyManager();
        this.game.seasonManager = new SeasonManager();
        // Schedule generation moved to SeasonSetupScene (depends on config)
        this.game.inventory = [];

        // Transition to SeasonSetupScene for league name + config
        const SeasonSetupScene = DraftScene._SeasonSetupScene;
        this.game.sceneManager.transitionTo(new SeasonSetupScene(this.game));
    }

    render(ctx) {
        // Background
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Subtle diamond pattern background
        this._drawBackground(ctx);

        if (this.phase === 'coach') {
            this._renderCoachSelection(ctx);
        } else if (this.phase === 'drafting') {
            this._renderDrafting(ctx);
        } else if (this.phase === 'complete') {
            this._renderComplete(ctx);
        }

        // Pick animation overlay
        if (this.pickAnimation) {
            this._renderPickAnimation(ctx);
        }
    }

    _drawBackground(ctx) {
        ctx.save();
        ctx.globalAlpha = 0.05;
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 1;
        for (let i = 0; i < 20; i++) {
            for (let j = 0; j < 12; j++) {
                const x = i * 70 + 35;
                const y = j * 65 + 32;
                ctx.beginPath();
                ctx.moveTo(x, y - 12);
                ctx.lineTo(x + 12, y);
                ctx.lineTo(x, y + 12);
                ctx.lineTo(x - 12, y);
                ctx.closePath();
                ctx.stroke();
            }
        }
        ctx.restore();
    }

    _renderCoachSelection(ctx) {
        UIRenderer.drawText(ctx, 'SELECT YOUR COACH', CANVAS_WIDTH / 2, 40, {
            font: 'bold 36px monospace', color: '#FFD700', shadow: true, shadowOffset: 3,
        });
        UIRenderer.drawText(ctx, 'Your coach provides stat bonuses to the entire team', CANVAS_WIDTH / 2, 80, {
            font: '16px monospace', color: '#AAA',
        });

        const coaches = this._getVisibleCoaches();
        const startIdx = this.coachPage * this.coachesPerPage;
        const visible = coaches.slice(startIdx, startIdx + this.coachesPerPage);

        for (let i = 0; i < visible.length; i++) {
            const coach = visible[i];
            const cx = 100 + i * 280;
            const cy = 200;
            const hovered = this.hoveredCard === i;

            this._drawCoachCard(ctx, cx, cy, 240, 340, coach, hovered);
        }

        // Navigation arrows
        if (this.coachPage > 0) {
            this._drawArrow(ctx, 40, 370, 'left', this.hoveredButton === 0);
        }
        if ((this.coachPage + 1) * this.coachesPerPage < coaches.length) {
            this._drawArrow(ctx, CANVAS_WIDTH - 40, 370, 'right', this.hoveredButton === 1);
        }

        // Page indicator
        const totalPages = Math.ceil(coaches.length / this.coachesPerPage);
        UIRenderer.drawText(ctx, `${this.coachPage + 1} / ${totalPages}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT - 105, {
            font: '14px monospace', color: '#666',
        });

        // Secret coach unlock section
        UIRenderer.drawText(ctx, 'HAVE A SECRET CODE?', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 115, {
            font: '11px monospace', color: '#555',
        });
        const codeValue = this.codeInputActive ? TextInput.getValue() : '';
        TextInput.drawField(ctx, CANVAS_WIDTH / 2 - 160, CANVAS_HEIGHT - 80, 220, 30, '', codeValue, this.codeInputActive, {
            placeholder: 'Enter secret code...',
            font: '14px monospace',
        });
        UIRenderer.drawButton(ctx, CANVAS_WIDTH / 2 + 70, CANVAS_HEIGHT - 84, 90, 36, 'UNLOCK', this.hoveredButton === 11, {
            normal: '#1a1a2a', hover: '#2a2a4a', text: '#4488FF', border: '#4488FF',
        });

        // Unlock feedback
        if (this.unlockFeedbackTimer > 0) {
            const isSuccess = this.unlockFeedback.startsWith('Unlocked');
            UIRenderer.drawText(ctx, this.unlockFeedback, CANVAS_WIDTH / 2, CANVAS_HEIGHT - 38, {
                font: 'bold 13px monospace', color: isSuccess ? '#44FF44' : '#FF4444',
            });
        }
    }

    _drawCoachCard(ctx, x, y, w, h, coach, hovered) {
        const borderColor = hovered ? '#FFD700' : '#444';
        UIRenderer.drawPanel(ctx, x, y, w, h, {
            bgColor: hovered ? 'rgba(40,40,20,0.95)' : 'rgba(20,20,30,0.95)',
            borderColor,
            borderWidth: hovered ? 3 : 2,
        });

        // Stars
        UIRenderer.drawStars(ctx, x + w / 2 - (coach.stars * 8), y + 20, coach.stars);

        // Coach icon (simple person silhouette)
        ctx.save();
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(x + w / 2, y + 70, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(x + w / 2 - 15, y + 92, 30, 40);
        ctx.restore();

        // Name
        UIRenderer.drawText(ctx, coach.name, x + w / 2, y + 155, {
            font: 'bold 18px monospace', color: '#FFF',
        });

        // Specialty
        UIRenderer.drawText(ctx, coach.specialty.toUpperCase(), x + w / 2, y + 180, {
            font: 'bold 14px monospace', color: '#FFD700',
        });

        // Source
        UIRenderer.drawText(ctx, coach.teamSource, x + w / 2, y + 205, {
            font: '12px monospace', color: '#888',
        });

        // Bonuses
        let bonusY = y + 240;
        ctx.font = '14px monospace';
        ctx.textAlign = 'center';
        for (const [stat, value] of Object.entries(coach.bonuses)) {
            ctx.fillStyle = '#44FF44';
            ctx.fillText(`+${value} ${stat}`, x + w / 2, bonusY);
            bonusY += 20;
        }
    }

    _drawArrow(ctx, x, y, dir, hovered) {
        ctx.save();
        ctx.fillStyle = hovered ? '#FFD700' : '#666';
        ctx.font = 'bold 30px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(dir === 'left' ? '\u25C0' : '\u25B6', x, y);
        ctx.restore();
    }

    _renderDrafting(ctx) {
        // Header
        UIRenderer.drawText(ctx, 'PLAYER DRAFT', CANVAS_WIDTH / 2, 30, {
            font: 'bold 32px monospace', color: '#FFD700', shadow: true, shadowOffset: 3,
        });
        UIRenderer.drawText(ctx, this.draftManager.getRoundLabel(), CANVAS_WIDTH / 2, 65, {
            font: 'bold 18px monospace', color: '#FFF',
        });

        // Already drafted count
        const drafted = this.draftManager.drafted;
        UIRenderer.drawText(ctx, `Roster: ${drafted.length + 1}/9 (Ryan Silber + ${drafted.length} drafted)`, CANVAS_WIDTH / 2, 90, {
            font: '14px monospace', color: '#AAA',
        });

        // Draft instruction
        UIRenderer.drawText(ctx, 'Click a player card to draft them', CANVAS_WIDTH / 2, 115, {
            font: '13px monospace', color: '#666',
        });

        // Player cards
        for (let i = 0; i < this.cardOptions.length; i++) {
            const player = this.cardOptions[i];
            const cx = 140 + i * 350;
            const cy = 160;
            const hovered = this.hoveredCard === i;

            this._drawPlayerCard(ctx, cx, cy, 300, 420, player, hovered);
        }

        // Skip button
        const skipX = CANVAS_WIDTH / 2 - 60;
        const skipY = CANVAS_HEIGHT - 60;
        UIRenderer.drawButton(ctx, skipX, skipY, 120, 40, 'SKIP', this.hoveredButton === 2, {
            normal: '#333', hover: '#555', text: '#AAA', border: '#666',
        });

        // Drafted roster mini display
        this._drawDraftedRoster(ctx);
    }

    _drawPlayerCard(ctx, x, y, w, h, player, hovered) {
        const starColor = STAR_COLORS[player.stars] || '#AAA';
        const borderColor = hovered ? starColor : '#444';

        UIRenderer.drawPanel(ctx, x, y, w, h, {
            bgColor: hovered ? 'rgba(30,30,15,0.95)' : 'rgba(15,15,25,0.95)',
            borderColor,
            borderWidth: hovered ? 3 : 2,
        });

        // Star rating
        UIRenderer.drawStars(ctx, x + w / 2 - (player.stars * 8), y + 15, player.stars);

        // Position badge
        ctx.save();
        ctx.fillStyle = starColor;
        UIRenderer.roundRect(ctx, x + 10, y + 10, 50, 24, 4);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(player.position, x + 35, y + 22);
        ctx.restore();

        // Player silhouette
        ctx.save();
        const skinColors = { light: '#FDBCB4', medium: '#C68642', dark: '#8D5524' };
        ctx.fillStyle = skinColors[player.skinTone] || '#C68642';
        ctx.beginPath();
        ctx.arc(x + w / 2, y + 75, 22, 0, Math.PI * 2);
        ctx.fill();
        // Body
        ctx.fillStyle = '#333';
        ctx.fillRect(x + w / 2 - 18, y + 100, 36, 50);
        // Jersey number
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 16px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`#${player.number}`, x + w / 2, y + 130);
        ctx.restore();

        // Name
        UIRenderer.drawText(ctx, player.name, x + w / 2, y + 175, {
            font: 'bold 18px monospace', color: '#FFF',
        });

        // Team affiliation label
        const team = player.teamSource || player.source || '';
        if (team) {
            UIRenderer.drawText(ctx, team, x + w / 2, y + 198, {
                font: 'bold 13px monospace', color: '#BBBB44',
            });
        }

        // Stats
        const stats = [
            { label: 'PWR', value: player.power, color: '#FF6644' },
            { label: 'CON', value: player.contact, color: '#44FF44' },
            { label: 'SPD', value: player.speed, color: '#44AAFF' },
            { label: 'FLD', value: player.fielding, color: '#FFAA44' },
            { label: 'ARM', value: player.arm, color: '#FF44FF' },
        ];

        const isPitcher = player.position === 'SP' || player.position === 'RP';
        if (isPitcher) {
            stats.push(
                { label: 'VEL', value: player.pitchSpeed || 0, color: '#FF4444' },
                { label: 'CTL', value: player.pitchControl || 0, color: '#44FFAA' },
                { label: 'BRK', value: player.pitchBreak || 0, color: '#FFFF44' },
            );
        }

        let sy = y + 225;
        for (const stat of stats) {
            this._drawStatBar(ctx, x + 20, sy, w - 40, stat.label, stat.value, stat.color);
            sy += 22;
        }
    }

    _drawStatBar(ctx, x, y, width, label, value, color) {
        ctx.save();
        ctx.font = '12px monospace';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#AAA';
        ctx.fillText(label, x, y + 10);

        const barX = x + 40;
        const barW = width - 70;
        const barH = 10;

        // Background
        ctx.fillStyle = '#222';
        UIRenderer.roundRect(ctx, barX, y + 2, barW, barH, 3);
        ctx.fill();

        // Fill
        const fillW = (value / 100) * barW;
        ctx.fillStyle = color;
        UIRenderer.roundRect(ctx, barX, y + 2, Math.max(4, fillW), barH, 3);
        ctx.fill();

        // Value
        ctx.textAlign = 'right';
        ctx.fillStyle = '#FFF';
        ctx.fillText(String(value), x + width, y + 10);
        ctx.restore();
    }

    _drawDraftedRoster(ctx) {
        const x = 10;
        const y = CANVAS_HEIGHT - 55;
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(x, y, CANVAS_WIDTH - 20, 50);

        ctx.font = '11px monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';

        // Ryan is always first
        ctx.fillStyle = '#FFD700';
        ctx.fillText('Ryan Silber (C)', x + 10, y + 15);

        // Drafted players
        const drafted = this.draftManager.drafted;
        for (let i = 0; i < drafted.length; i++) {
            const p = drafted[i];
            ctx.fillStyle = STAR_COLORS[p.stars] || '#AAA';
            const px = x + 10 + (i + 1) * 140;
            const py = px > CANVAS_WIDTH - 160 ? y + 35 : y + 15;
            const actualX = px > CANVAS_WIDTH - 160 ? px - (CANVAS_WIDTH - 160) + 10 : px;
            ctx.fillText(`${p.name} (${p.position})`, actualX, py);
        }

        ctx.restore();
    }

    _renderPickAnimation(ctx) {
        const p = this.pickAnimation.player;
        const alpha = Math.min(1, (1 - this.pickAnimation.timer) * 3);

        ctx.save();
        ctx.globalAlpha = alpha * 0.8;
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        ctx.globalAlpha = alpha;
        UIRenderer.drawText(ctx, 'DRAFTED!', CANVAS_WIDTH / 2, 200, {
            font: 'bold 48px monospace', color: '#FFD700', shadow: true, shadowOffset: 4,
        });
        UIRenderer.drawText(ctx, p.name, CANVAS_WIDTH / 2, 280, {
            font: 'bold 32px monospace', color: '#FFF', shadow: true, shadowOffset: 3,
        });
        UIRenderer.drawText(ctx, `${p.position} | #${p.number}`, CANVAS_WIDTH / 2, 330, {
            font: '20px monospace', color: '#AAA',
        });
        UIRenderer.drawStars(ctx, CANVAS_WIDTH / 2 - (p.stars * 8), 370, p.stars);
        ctx.restore();
    }

    _renderComplete(ctx) {
        UIRenderer.drawText(ctx, 'DRAFT COMPLETE!', CANVAS_WIDTH / 2, 50, {
            font: 'bold 36px monospace', color: '#FFD700', shadow: true, shadowOffset: 3,
        });

        UIRenderer.drawText(ctx, 'Your Roster', CANVAS_WIDTH / 2, 90, {
            font: 'bold 20px monospace', color: '#FFF',
        });

        // Show full roster
        const roster = this.draftManager.getFinalRoster();
        const cols = 3;
        for (let i = 0; i < roster.length; i++) {
            const p = roster[i];
            const col = i % cols;
            const row = Math.floor(i / cols);
            const x = 80 + col * 400;
            const y = 120 + row * 60;

            ctx.save();
            ctx.font = 'bold 16px monospace';
            ctx.textAlign = 'left';
            ctx.fillStyle = p.isPlayerCharacter ? '#FFD700' : (STAR_COLORS[p.stars] || '#AAA');
            ctx.fillText(`${p.name}`, x + 5, y + 20);

            ctx.font = '13px monospace';
            ctx.fillStyle = '#AAA';
            ctx.fillText(`#${p.number} | ${p.position}`, x + 5, y + 40);

            UIRenderer.drawStars(ctx, x + 300, y + 12, p.stars, 5, 10);
            ctx.restore();
        }

        // Coach info
        if (this.selectedCoach) {
            const cy = 120 + Math.ceil(roster.length / cols) * 60 + 20;
            UIRenderer.drawText(ctx, `Coach: ${this.selectedCoach.name}`, CANVAS_WIDTH / 2, cy, {
                font: 'bold 16px monospace', color: '#FFD700',
            });
        }

        // Continue button
        const btnX = CANVAS_WIDTH / 2 - 100;
        const btnY = CANVAS_HEIGHT - 80;
        UIRenderer.drawButton(ctx, btnX, btnY, 200, 50, 'SET LINEUP', this.hoveredButton === 3, {
            normal: '#1a1a1a', hover: '#333', text: '#FFD700', border: '#FFD700',
        });
    }
}

// Will be set by main.js after imports are resolved
DraftScene._SeasonSetupScene = null;
