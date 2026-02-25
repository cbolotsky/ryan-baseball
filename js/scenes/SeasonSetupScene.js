import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../utils/constants.js';
import { UIRenderer } from '../rendering/UIRenderer.js';
import { Audio } from '../engine/Audio.js';
import { TextInput } from '../utils/TextInput.js';

const INNINGS_OPTIONS = [3, 5, 7, 9];
const GAMES_OPTIONS = [5, 10, 16];

export class SeasonSetupScene {
    constructor(game) {
        this.game = game;
        this.hoveredButton = -1;
        this.animTimer = 0;

        // Configuration state with defaults
        this.leagueName = '';
        this.selectedInnings = 9;
        this.selectedGames = 16;
        this.leagueNameActive = false;
    }

    onEnter() {
        const canvas = this.game.canvas || document.getElementById('gameCanvas');
        TextInput.activate(canvas, CANVAS_WIDTH / 2 - 150, 185, 300, 32, '');
        this.leagueNameActive = true;
    }

    onExit() {
        TextInput.deactivate();
        this.leagueNameActive = false;
    }

    _getWinsNeeded() {
        return Math.max(3, Math.ceil(this.selectedGames * 0.6));
    }

    update(dt) {
        this.animTimer += dt;
        const mx = this.game.input.mouse.x;
        const my = this.game.input.mouse.y;
        this.hoveredButton = -1;

        // League name text field click area
        if (UIRenderer.isPointInRect(mx, my, CANVAS_WIDTH / 2 - 150, 185, 300, 32)) {
            this.hoveredButton = 50;
        }

        // Innings preset buttons
        for (let i = 0; i < INNINGS_OPTIONS.length; i++) {
            const bx = CANVAS_WIDTH / 2 - (INNINGS_OPTIONS.length * 50) + i * 100;
            if (UIRenderer.isPointInRect(mx, my, bx, 320, 80, 40)) {
                this.hoveredButton = 100 + i;
            }
        }

        // Games preset buttons
        for (let i = 0; i < GAMES_OPTIONS.length; i++) {
            const bx = CANVAS_WIDTH / 2 - (GAMES_OPTIONS.length * 60) + i * 120;
            if (UIRenderer.isPointInRect(mx, my, bx, 440, 100, 40)) {
                this.hoveredButton = 200 + i;
            }
        }

        // START SEASON button
        if (UIRenderer.isPointInRect(mx, my, CANVAS_WIDTH / 2 - 120, CANVAS_HEIGHT - 100, 240, 55)) {
            this.hoveredButton = 0;
        }

        if (this.game.input.isMouseJustPressed()) {
            if (this.hoveredButton >= 0) Audio.uiClick();

            // League name field click
            if (this.hoveredButton === 50) {
                if (!this.leagueNameActive) {
                    const canvas = this.game.canvas || document.getElementById('gameCanvas');
                    TextInput.activate(canvas, CANVAS_WIDTH / 2 - 150, 185, 300, 32, TextInput.getValue());
                    this.leagueNameActive = true;
                }
            } else if (this.leagueNameActive && this.hoveredButton !== -1) {
                // Clicked something else — keep field active but don't deactivate
            }

            // Innings selection
            for (let i = 0; i < INNINGS_OPTIONS.length; i++) {
                if (this.hoveredButton === 100 + i) {
                    this.selectedInnings = INNINGS_OPTIONS[i];
                }
            }

            // Games selection
            for (let i = 0; i < GAMES_OPTIONS.length; i++) {
                if (this.hoveredButton === 200 + i) {
                    this.selectedGames = GAMES_OPTIONS[i];
                }
            }

            // START SEASON
            if (this.hoveredButton === 0) {
                this._startSeason();
            }
        }
    }

    _startSeason() {
        const leagueName = TextInput.getValue().trim() || 'Lightning League';
        const winsNeeded = this._getWinsNeeded();

        // Store season configuration on the game object
        this.game.seasonConfig = {
            innings: this.selectedInnings,
            seasonGames: this.selectedGames,
            winsForWorldSeries: winsNeeded,
            leagueName: leagueName,
        };

        // Generate schedule with config
        this.game.seasonManager.generateSchedule(this.game.seasonConfig);

        // Transition to TeamScene
        const TeamScene = SeasonSetupScene._TeamScene;
        this.game.sceneManager.transitionTo(new TeamScene(this.game));
    }

    render(ctx) {
        // Background
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Subtle diamond pattern
        ctx.save();
        ctx.globalAlpha = 0.04;
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

        // Title
        UIRenderer.drawText(ctx, 'SEASON SETUP', CANVAS_WIDTH / 2, 45, {
            font: 'bold 36px monospace', color: '#FFD700', shadow: true, shadowOffset: 3,
        });

        // --- LEAGUE NAME ---
        UIRenderer.drawText(ctx, 'LEAGUE NAME', CANVAS_WIDTH / 2, 155, {
            font: 'bold 18px monospace', color: '#FFF',
        });

        const nameValue = this.leagueNameActive ? TextInput.getValue() : '';
        TextInput.drawField(ctx, CANVAS_WIDTH / 2 - 150, 185, 300, 32, '', nameValue, this.leagueNameActive, {
            placeholder: 'Lightning League',
            font: '16px monospace',
        });

        // --- INNINGS PER GAME ---
        UIRenderer.drawText(ctx, 'INNINGS PER GAME', CANVAS_WIDTH / 2, 285, {
            font: 'bold 18px monospace', color: '#FFF',
        });

        for (let i = 0; i < INNINGS_OPTIONS.length; i++) {
            const val = INNINGS_OPTIONS[i];
            const bx = CANVAS_WIDTH / 2 - (INNINGS_OPTIONS.length * 50) + i * 100;
            const active = this.selectedInnings === val;
            UIRenderer.drawButton(ctx, bx, 320, 80, 40, String(val), this.hoveredButton === 100 + i || active, {
                normal: active ? '#2a2a00' : '#1a1a1a',
                hover: '#333',
                text: active ? '#FFD700' : '#888',
                border: active ? '#FFD700' : '#444',
            });
        }

        // --- GAMES PER SEASON ---
        UIRenderer.drawText(ctx, 'GAMES PER SEASON', CANVAS_WIDTH / 2, 410, {
            font: 'bold 18px monospace', color: '#FFF',
        });

        for (let i = 0; i < GAMES_OPTIONS.length; i++) {
            const val = GAMES_OPTIONS[i];
            const bx = CANVAS_WIDTH / 2 - (GAMES_OPTIONS.length * 60) + i * 120;
            const active = this.selectedGames === val;
            UIRenderer.drawButton(ctx, bx, 440, 100, 40, String(val), this.hoveredButton === 200 + i || active, {
                normal: active ? '#2a2a00' : '#1a1a1a',
                hover: '#333',
                text: active ? '#FFD700' : '#888',
                border: active ? '#FFD700' : '#444',
            });
        }

        // --- Info: Wins needed ---
        const winsNeeded = this._getWinsNeeded();
        UIRenderer.drawText(ctx, `Wins needed for World Series: ${winsNeeded}`, CANVAS_WIDTH / 2, 520, {
            font: '16px monospace', color: '#AAA',
        });

        // Summary line
        UIRenderer.drawText(ctx, `${this.selectedGames} games \u00D7 ${this.selectedInnings} innings each`, CANVAS_WIDTH / 2, 550, {
            font: '14px monospace', color: '#666',
        });

        // --- START SEASON button ---
        UIRenderer.drawButton(ctx, CANVAS_WIDTH / 2 - 120, CANVAS_HEIGHT - 100, 240, 55, 'START SEASON', this.hoveredButton === 0, {
            normal: '#1a1a1a', hover: '#333', text: '#FFD700', border: '#FFD700',
        });
    }
}

// Lazy reference set by main.js
SeasonSetupScene._TeamScene = null;
