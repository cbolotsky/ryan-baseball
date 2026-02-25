import { CANVAS_WIDTH, CANVAS_HEIGHT, FIELDER_POSITIONS } from '../utils/constants.js';
import { UIRenderer } from '../rendering/UIRenderer.js';
import { FieldRenderer } from '../rendering/FieldRenderer.js';
import { setCameraImmediate } from '../utils/perspective.js';
import { worldToScreen } from '../utils/perspective.js';
import { Team } from '../entities/Team.js';
import { Player } from '../entities/Player.js';
import { generateOpponentRoster } from '../data/teams.js';
import { Audio } from '../engine/Audio.js';

export class PreGameScene {
    constructor(game, gameIndex) {
        this.game = game;
        this.gameIndex = gameIndex;
        this.seasonGame = game.seasonManager.schedule[gameIndex];
        this.opponent = this.seasonGame.opponent;

        this.fieldRenderer = new FieldRenderer();
        this.selectedPosition = 'C'; // default to catcher (Ryan's position)
        this.hoveredPosition = null;
        this.hoveredButton = -1;

        // Position diamonds on the field
        this.positionHitAreas = {};
    }

    onEnter() {
        setCameraImmediate('field');
        this._calculatePositionScreenCoords();
    }

    _calculatePositionScreenCoords() {
        this.positionHitAreas = {};
        for (const [pos, worldPos] of Object.entries(FIELDER_POSITIONS)) {
            const screen = worldToScreen(worldPos.x, worldPos.y || 0, worldPos.z);
            if (screen) {
                this.positionHitAreas[pos] = {
                    x: screen.x,
                    y: screen.y,
                    radius: 25,
                    pos,
                };
            }
        }
    }

    update(dt) {
        const mx = this.game.input.mouse.x;
        const my = this.game.input.mouse.y;
        this.hoveredPosition = null;
        this.hoveredButton = -1;

        // Check position clicks on field
        for (const [pos, area] of Object.entries(this.positionHitAreas)) {
            const dx = mx - area.x;
            const dy = my - area.y;
            if (dx * dx + dy * dy < area.radius * area.radius) {
                this.hoveredPosition = pos;
            }
        }

        // Play Ball button
        if (UIRenderer.isPointInRect(mx, my, CANVAS_WIDTH / 2 - 110, CANVAS_HEIGHT - 70, 220, 50)) {
            this.hoveredButton = 0;
        }

        // Back button
        if (UIRenderer.isPointInRect(mx, my, 20, CANVAS_HEIGHT - 60, 120, 40)) {
            this.hoveredButton = 1;
        }

        if (this.game.input.isMouseJustPressed()) {
            if (this.hoveredPosition || this.hoveredButton >= 0) Audio.uiClick();
            if (this.hoveredPosition) {
                this.selectedPosition = this.hoveredPosition;
            } else if (this.hoveredButton === 0) {
                this._startGame();
            } else if (this.hoveredButton === 1) {
                this._goBack();
            }
        }
    }

    _startGame() {
        // Generate opponent team
        const oppTeam = new Team(
            this.opponent.name,
            this.opponent.abbreviation,
            this.opponent.colors,
        );
        const oppRoster = generateOpponentRoster(this.opponent);
        for (const data of oppRoster) {
            oppTeam.addPlayer(new Player(data));
        }
        oppTeam.autoLineup();

        // Get player team
        const playerTeam = this.game.playerTeam;
        playerTeam.positionFielders();

        // Map selected position
        let pos = this.selectedPosition;
        if (pos === 'P') pos = 'SP'; // pitching phase uses SP

        // Start game scene - Lightning at home
        const { GameScene } = await_import_game();
        const gameScene = new GameScene(this.game, playerTeam, oppTeam, pos);
        gameScene._seasonGameIndex = this.gameIndex; // store for PostGame
        this.game.sceneManager.transitionTo(gameScene);
    }

    _goBack() {
        const { SeasonScene } = await_import_season();
        this.game.sceneManager.transitionTo(new SeasonScene(this.game));
    }

    render(ctx) {
        // Field background
        this.fieldRenderer.render(ctx);

        // Dark overlay
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Title
        UIRenderer.drawText(ctx, 'SELECT YOUR POSITION', CANVAS_WIDTH / 2, 30, {
            font: 'bold 28px monospace', color: '#FFD700', shadow: true, shadowOffset: 3,
        });

        // Matchup
        UIRenderer.drawText(ctx, `vs ${this.opponent.name}`, CANVAS_WIDTH / 2, 65, {
            font: 'bold 20px monospace', color: '#FFF',
        });

        // Difficulty
        const diff = this.opponent.difficulty;
        UIRenderer.drawText(ctx, `Difficulty: ${'■'.repeat(diff)}${'□'.repeat(7 - diff)}`, CANVAS_WIDTH / 2, 90, {
            font: '14px monospace', color: '#FF6644',
        });

        // Draw position markers on field
        for (const [pos, area] of Object.entries(this.positionHitAreas)) {
            const selected = this.selectedPosition === pos;
            const hovered = this.hoveredPosition === pos;

            ctx.save();

            // Circle
            ctx.beginPath();
            ctx.arc(area.x, area.y, area.radius, 0, Math.PI * 2);
            ctx.fillStyle = selected ? 'rgba(255,215,0,0.6)' : (hovered ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.4)');
            ctx.fill();
            ctx.strokeStyle = selected ? '#FFD700' : (hovered ? '#FFF' : '#888');
            ctx.lineWidth = selected ? 3 : 1;
            ctx.stroke();

            // Position label
            ctx.fillStyle = selected ? '#000' : '#FFF';
            ctx.font = 'bold 14px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(pos, area.x, area.y);

            ctx.restore();
        }

        // Selected position info
        UIRenderer.drawPanel(ctx, CANVAS_WIDTH / 2 - 150, CANVAS_HEIGHT - 135, 300, 55, {
            bgColor: 'rgba(0,0,0,0.8)', borderColor: '#FFD700',
        });
        UIRenderer.drawText(ctx, `Playing as: ${this._positionName(this.selectedPosition)}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT - 115, {
            font: 'bold 16px monospace', color: '#FFD700',
        });
        UIRenderer.drawText(ctx, this._positionDescription(this.selectedPosition), CANVAS_WIDTH / 2, CANVAS_HEIGHT - 92, {
            font: '12px monospace', color: '#AAA',
        });

        // Play Ball button
        UIRenderer.drawButton(ctx, CANVAS_WIDTH / 2 - 110, CANVAS_HEIGHT - 70, 220, 50, 'PLAY BALL!', this.hoveredButton === 0, {
            normal: '#1a1a00', hover: '#333300', text: '#FFD700', border: '#FFD700',
        });

        // Back button
        UIRenderer.drawButton(ctx, 20, CANVAS_HEIGHT - 60, 120, 40, 'BACK', this.hoveredButton === 1, {
            normal: '#222', hover: '#444', text: '#AAA', border: '#666',
        });
    }

    _positionName(pos) {
        const names = {
            'C': 'Catcher', 'P': 'Pitcher', 'SP': 'Pitcher',
            '1B': 'First Base', '2B': 'Second Base', '3B': 'Third Base',
            'SS': 'Shortstop', 'LF': 'Left Field', 'CF': 'Center Field', 'RF': 'Right Field',
        };
        return names[pos] || pos;
    }

    _positionDescription(pos) {
        const descs = {
            'C': 'Call pitches, frame strikes, catch balls',
            'P': 'Choose pitches, aim, and throw',
            'SP': 'Choose pitches, aim, and throw',
            '1B': 'Auto-field, choose throw targets',
            '2B': 'Auto-field, choose throw targets',
            '3B': 'Auto-field, choose throw targets',
            'SS': 'Auto-field, choose throw targets',
            'LF': 'Auto-field, choose throw targets',
            'CF': 'Auto-field, choose throw targets',
            'RF': 'Auto-field, choose throw targets',
        };
        return descs[pos] || 'Play the game!';
    }
}

// Lazy imports
function await_import_game() { return { GameScene: PreGameScene._GameScene }; }
function await_import_season() { return { SeasonScene: PreGameScene._SeasonScene }; }
PreGameScene._GameScene = null;
PreGameScene._SeasonScene = null;
