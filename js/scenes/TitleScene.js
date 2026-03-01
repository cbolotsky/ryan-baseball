import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../utils/constants.js';
import { UIRenderer } from '../rendering/UIRenderer.js';
import { FieldRenderer } from '../rendering/FieldRenderer.js';
import { setCameraImmediate } from '../utils/perspective.js';
import { SaveManager } from '../systems/SaveManager.js';
import { Audio } from '../engine/Audio.js';
import { TextInput } from '../utils/TextInput.js';

export class TitleScene {
    constructor(game) {
        this.game = game;
        this.fieldRenderer = new FieldRenderer();
        this.hoveredButton = -1;
        this.animTimer = 0;
        this.hasSave = SaveManager.hasSave();

        this.buttons = [
            { text: 'NEW SEASON', x: CANVAS_WIDTH / 2 - 120, y: 390, w: 240, h: 50 },
            { text: 'CONTINUE', x: CANVAS_WIDTH / 2 - 120, y: 450, w: 240, h: 50 },
            { text: 'LEADERBOARD', x: CANVAS_WIDTH / 2 - 120, y: 510, w: 240, h: 50 },
            { text: 'SETTINGS', x: CANVAS_WIDTH / 2 - 120, y: 570, w: 240, h: 50 },
        ];

        // Gamemaster login
        this.gmButton = { text: 'GAMEMASTER LOGIN', x: CANVAS_WIDTH / 2 - 100, y: 650, w: 200, h: 34 };
        this.showLoginModal = false;
        this.loginError = '';
        this.loginErrorTimer = 0;
        this.hoveredModalButton = -1;
    }

    onEnter() {
        setCameraImmediate('field');
    }

    onExit() {
        TextInput.deactivate();
    }

    update(dt) {
        this.animTimer += dt;

        if (this.loginErrorTimer > 0) {
            this.loginErrorTimer -= dt;
        }

        const mx = this.game.input.mouse.x;
        const my = this.game.input.mouse.y;

        if (this.showLoginModal) {
            this._updateLoginModal(mx, my);
            return;
        }

        this.hoveredButton = -1;
        for (let i = 0; i < this.buttons.length; i++) {
            const b = this.buttons[i];
            if (UIRenderer.isPointInRect(mx, my, b.x, b.y, b.w, b.h)) {
                this.hoveredButton = i;
            }
        }

        // GM button
        if (UIRenderer.isPointInRect(mx, my, this.gmButton.x, this.gmButton.y, this.gmButton.w, this.gmButton.h)) {
            this.hoveredButton = 10;
        }

        if (this.game.input.isMouseJustPressed()) {
            if (this.hoveredButton >= 0) Audio.uiClick();
            if (this.hoveredButton === 10) {
                this.showLoginModal = true;
                this.loginError = '';
                const canvas = this.game.canvas || document.querySelector('canvas');
                TextInput.activate(canvas, CANVAS_WIDTH / 2 - 120, 350, 240, 32, '', { password: true });
            } else if (this.hoveredButton >= 0) {
                this._handleButtonClick(this.hoveredButton);
            }
        }
    }

    _updateLoginModal(mx, my) {
        this.hoveredModalButton = -1;

        // Confirm button
        if (UIRenderer.isPointInRect(mx, my, CANVAS_WIDTH / 2 - 130, 400, 120, 40)) {
            this.hoveredModalButton = 0;
        }
        // Cancel button
        if (UIRenderer.isPointInRect(mx, my, CANVAS_WIDTH / 2 + 10, 400, 120, 40)) {
            this.hoveredModalButton = 1;
        }
        // Password field click
        if (UIRenderer.isPointInRect(mx, my, CANVAS_WIDTH / 2 - 120, 350, 240, 32)) {
            this.hoveredModalButton = 2;
        }

        if (this.game.input.isMouseJustPressed()) {
            Audio.uiClick();
            if (this.hoveredModalButton === 0) {
                // Confirm
                const pw = TextInput.getValue();
                if (pw === 'Silber6') {
                    TextInput.deactivate();
                    this.showLoginModal = false;
                    const AdminScene = TitleScene._AdminScene;
                    if (AdminScene) {
                        this.game.sceneManager.transitionTo(new AdminScene(this.game));
                    }
                } else if (pw === 'Control6') {
                    TextInput.deactivate();
                    this.showLoginModal = false;
                    const GMScene = TitleScene._GameMasterScene;
                    if (GMScene) {
                        this.game.sceneManager.transitionTo(new GMScene(this.game));
                    }
                } else {
                    this.loginError = 'INVALID CODE';
                    this.loginErrorTimer = 2;
                    TextInput.setValue('');
                }
            } else if (this.hoveredModalButton === 1) {
                // Cancel
                TextInput.deactivate();
                this.showLoginModal = false;
            } else if (this.hoveredModalButton === 2) {
                // Re-focus the password field
                const canvas = this.game.canvas || document.querySelector('canvas');
                TextInput.activate(canvas, CANVAS_WIDTH / 2 - 120, 350, 240, 32, TextInput.getValue(), { password: true });
            }
        }

        // Enter key to confirm
        if (this.game.input.isKeyJustPressed('Enter')) {
            const pw = TextInput.getValue();
            if (pw === 'Silber6') {
                TextInput.deactivate();
                this.showLoginModal = false;
                const AdminScene = TitleScene._AdminScene;
                if (AdminScene) {
                    this.game.sceneManager.transitionTo(new AdminScene(this.game));
                }
            } else if (pw === 'Control6') {
                TextInput.deactivate();
                this.showLoginModal = false;
                const GMScene = TitleScene._GameMasterScene;
                if (GMScene) {
                    this.game.sceneManager.transitionTo(new GMScene(this.game));
                }
            } else {
                this.loginError = 'INVALID CODE';
                this.loginErrorTimer = 2;
                TextInput.setValue('');
            }
        }
    }

    _handleButtonClick(index) {
        switch (index) {
            case 0: { // New Season
                SaveManager.deleteSave(); // Clear old save when starting fresh
                const DraftScene = TitleScene._DraftScene;
                this.game.sceneManager.transitionTo(new DraftScene(this.game));
                break;
            }
            case 1: { // Continue
                if (this.hasSave) {
                    const saveData = SaveManager.load();
                    if (saveData) {
                        SaveManager.restoreGameState(this.game, saveData);
                        const SeasonScene = TitleScene._SeasonScene;
                        if (SeasonScene) {
                            this.game.sceneManager.transitionTo(new SeasonScene(this.game));
                        }
                    }
                }
                break;
            }
            case 2: { // Leaderboard
                const LeaderboardScene = TitleScene._LeaderboardScene;
                if (LeaderboardScene) {
                    this.game.sceneManager.transitionTo(new LeaderboardScene(this.game));
                }
                break;
            }
            case 3: // Settings
                console.log('Settings clicked');
                break;
        }
    }

    render(ctx) {
        // Draw field as background
        this.fieldRenderer.render(ctx);

        // Dark overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Title
        const titleY = 150 + Math.sin(this.animTimer * 1.5) * 8;

        // Lightning bolt accent
        ctx.save();
        ctx.translate(CANVAS_WIDTH / 2, titleY - 60);
        this._drawLightningBolt(ctx, 0, 0, 40);
        ctx.restore();

        // Team name
        UIRenderer.drawText(ctx, 'OLD BRIDGE', CANVAS_WIDTH / 2, titleY, {
            font: 'bold 56px monospace',
            color: '#FFD700',
            shadow: true,
            shadowColor: '#000',
            shadowOffset: 3,
        });

        UIRenderer.drawText(ctx, 'LIGHTNING', CANVAS_WIDTH / 2, titleY + 55, {
            font: 'bold 48px monospace',
            color: '#FFFFFF',
            shadow: true,
            shadowColor: '#000',
            shadowOffset: 3,
        });

        UIRenderer.drawText(ctx, 'BASEBALL', CANVAS_WIDTH / 2, titleY + 105, {
            font: 'bold 28px monospace',
            color: '#FFD700',
            shadow: true,
            shadowColor: '#000',
            shadowOffset: 2,
        });

        // Buttons
        for (let i = 0; i < this.buttons.length; i++) {
            const b = this.buttons[i];
            const dimmed = (i === 1 && !this.hasSave);
            UIRenderer.drawButton(ctx, b.x, b.y, b.w, b.h, b.text, this.hoveredButton === i && !dimmed, {
                normal: dimmed ? '#111' : '#1a1a1a',
                hover: '#333',
                text: dimmed ? '#444' : '#FFD700',
                border: dimmed ? '#333' : '#FFD700',
            });
        }

        // Gamemaster Login button (smaller, muted)
        UIRenderer.drawButton(ctx, this.gmButton.x, this.gmButton.y, this.gmButton.w, this.gmButton.h,
            this.gmButton.text, this.hoveredButton === 10, {
                normal: '#111',
                hover: '#2a1a1a',
                text: '#884444',
                border: '#553333',
            });

        // Footer
        UIRenderer.drawText(ctx, 'Ryan Silber #6', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 30, {
            font: '14px monospace',
            color: '#888',
        });

        // Login modal
        if (this.showLoginModal) {
            this._renderLoginModal(ctx);
        }
    }

    _renderLoginModal(ctx) {
        // Overlay
        ctx.fillStyle = 'rgba(0,0,0,0.75)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Modal panel
        const mx = CANVAS_WIDTH / 2 - 180;
        const my = 260;
        UIRenderer.drawPanel(ctx, mx, my, 360, 210, {
            bgColor: 'rgba(15,15,25,0.98)',
            borderColor: '#884444',
            borderWidth: 2,
        });

        UIRenderer.drawText(ctx, 'GAMEMASTER LOGIN', CANVAS_WIDTH / 2, my + 30, {
            font: 'bold 22px monospace', color: '#FF6644',
        });

        UIRenderer.drawText(ctx, 'Enter password:', CANVAS_WIDTH / 2, my + 65, {
            font: '14px monospace', color: '#AAA',
        });

        // Password field
        const pwValue = TextInput.isFocused() ? TextInput.getValue() : '';
        TextInput.drawField(ctx, CANVAS_WIDTH / 2 - 120, my + 85, 240, 32, '', pwValue, TextInput.isFocused(), { password: true });

        // Error message
        if (this.loginErrorTimer > 0 && this.loginError) {
            UIRenderer.drawText(ctx, this.loginError, CANVAS_WIDTH / 2, my + 130, {
                font: 'bold 14px monospace', color: '#FF4444',
            });
        }

        // Confirm button
        UIRenderer.drawButton(ctx, CANVAS_WIDTH / 2 - 130, my + 140, 120, 40, 'CONFIRM', this.hoveredModalButton === 0, {
            normal: '#1a2a1a', hover: '#2a4a2a', text: '#44FF44', border: '#44FF44',
        });

        // Cancel button
        UIRenderer.drawButton(ctx, CANVAS_WIDTH / 2 + 10, my + 140, 120, 40, 'CANCEL', this.hoveredModalButton === 1, {
            normal: '#2a1a1a', hover: '#4a2a2a', text: '#FF4444', border: '#FF4444',
        });
    }

    _drawLightningBolt(ctx, x, y, size) {
        ctx.fillStyle = '#FFD700';
        ctx.strokeStyle = '#FFA500';
        ctx.lineWidth = 2;
        ctx.beginPath();
        const s = size / 40;
        ctx.moveTo(x - 5 * s, y - 40 * s);
        ctx.lineTo(x + 15 * s, y - 40 * s);
        ctx.lineTo(x + 5 * s, y - 10 * s);
        ctx.lineTo(x + 20 * s, y - 10 * s);
        ctx.lineTo(x - 10 * s, y + 40 * s);
        ctx.lineTo(x, y + 5 * s);
        ctx.lineTo(x - 15 * s, y + 5 * s);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
}

// Set by main.js
TitleScene._DraftScene = null;
TitleScene._SeasonScene = null;
TitleScene._AdminScene = null;
TitleScene._LeaderboardScene = null;
TitleScene._GameMasterScene = null;
