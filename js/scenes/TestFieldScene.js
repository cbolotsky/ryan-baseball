import { CANVAS_WIDTH, CANVAS_HEIGHT, FIELDER_POSITIONS, TEAM_COLORS } from '../utils/constants.js';
import { setCameraImmediate, setCamera } from '../utils/perspective.js';
import { FieldRenderer } from '../rendering/FieldRenderer.js';
import { PlayerRenderer } from '../rendering/PlayerRenderer.js';
import { BallRenderer } from '../rendering/BallRenderer.js';
import { UIRenderer } from '../rendering/UIRenderer.js';
import { Player } from '../entities/Player.js';
import { Ball } from '../entities/Ball.js';
import { PitchEngine } from '../gameplay/PitchEngine.js';
import { PITCH_TYPES } from '../data/pitchTypes.js';

// Temporary test scene to verify field + players + ball rendering
export class TestFieldScene {
    constructor(game) {
        this.game = game;
        this.fieldRenderer = new FieldRenderer();
        this.ball = new Ball();
        this.players = [];
        this.ballTrail = [];
        this.currentCamera = 'field';
        this.pitchTimer = 0;
        this.autoPitch = true;

        this._createTestPlayers();
    }

    _createTestPlayers() {
        const positions = ['P', 'C', '1B', '2B', 'SS', '3B', 'LF', 'CF', 'RF'];
        const names = [
            'Anthony Nap', 'Ryan Silber', 'Anthony Schirripa', 'Ryan Ikola',
            'Carmine Scala', 'Dom Minnoia', 'Angelo Demarco', 'Michael Denora', 'Mason Perseghin',
        ];
        const numbers = [11, 6, 2, 99, 4, 17, 34, 24, 45];

        for (let i = 0; i < positions.length; i++) {
            const p = new Player({
                id: `test_${i}`,
                name: names[i],
                number: numbers[i],
                position: positions[i],
                stars: 3,
                power: 70, contact: 75, speed: 60, fielding: 75, arm: 70,
                pitchSpeed: positions[i] === 'P' ? 88 : 0,
                pitchControl: positions[i] === 'P' ? 80 : 0,
                pitchBreak: positions[i] === 'P' ? 75 : 0,
                skinTone: 'light',
            });
            const fieldPos = FIELDER_POSITIONS[positions[i]];
            p.setWorldPos(fieldPos.x, fieldPos.y || 0, fieldPos.z);
            p.assignedPosition = positions[i];
            this.players.push(p);
        }
    }

    onEnter() {
        setCameraImmediate('field');
    }

    update(dt) {
        // Update players
        for (const p of this.players) {
            p.update(dt);
        }

        // Update ball
        this.ball.update(dt);

        // Store trail positions
        if (this.ball.active && this.ball.inFlight) {
            this.ballTrail.push({ ...this.ball.pos });
            if (this.ballTrail.length > 10) this.ballTrail.shift();
        }

        // Auto throw a pitch every few seconds
        if (this.autoPitch) {
            this.pitchTimer += dt;
            if (this.pitchTimer > 3) {
                this._throwRandomPitch();
                this.pitchTimer = 0;
            }
        }

        // Camera switching with keys
        if (this.game.input.isKeyJustPressed('KeyF')) {
            this.currentCamera = 'field';
            setCamera('field');
        }
        if (this.game.input.isKeyJustPressed('KeyB')) {
            this.currentCamera = 'batting';
            setCamera('batting');
        }
        if (this.game.input.isKeyJustPressed('KeyP')) {
            this.currentCamera = 'pitching';
            setCamera('pitching');
        }

        // Click to throw a pitch
        if (this.game.input.isMouseJustPressed()) {
            this._throwRandomPitch();
            this.pitchTimer = 0;
        }

        // Space to hit the ball
        if (this.game.input.isKeyJustPressed('Space') && this.ball.active) {
            this._hitBall();
        }
    }

    _throwRandomPitch() {
        const pitchTypes = Object.keys(PITCH_TYPES);
        const type = pitchTypes[Math.floor(Math.random() * pitchTypes.length)];
        const pitcher = this.players.find(p => p.assignedPosition === 'P');

        const trajectory = PitchEngine.calculateTrajectory(
            type,
            (Math.random() - 0.5) * 1.0, // targetX
            (Math.random() - 0.5) * 0.8, // targetY
            pitcher ? pitcher.stats : { pitchSpeed: 85, pitchControl: 75, pitchBreak: 70 },
            75 + Math.random() * 20 // accuracy
        );

        this.ball.setTrajectory(trajectory);
        this.ballTrail = [];

        // Set pitcher animation
        if (pitcher) {
            pitcher.animState = 'pitching';
            pitcher.animTimer = 0;
            setTimeout(() => { pitcher.animState = 'idle'; }, 800);
        }
    }

    _hitBall() {
        // Simulate a hit
        const exitVelo = 70 + Math.random() * 40;
        const launchAngle = -10 + Math.random() * 50;
        const sprayAngle = (Math.random() - 0.5) * 60;
        this.ball.launch(exitVelo, launchAngle, sprayAngle, { x: 0, y: 3, z: 2 });
        this.ballTrail = [];
    }

    render(ctx) {
        // Field
        this.fieldRenderer.render(ctx);

        // Players (sorted by depth)
        const teamColors = TEAM_COLORS.oldBridgeLightning;
        PlayerRenderer.drawFielders(ctx, this.players, teamColors);

        // Ball trail + ball
        BallRenderer.drawBallTrail(ctx, this.ballTrail);
        BallRenderer.drawBall(ctx, this.ball);

        // Instructions
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(10, CANVAS_HEIGHT - 100, 350, 90);
        ctx.fillStyle = '#FFF';
        ctx.font = '13px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('Camera: [F] Field  [B] Batting  [P] Pitching', 20, CANVAS_HEIGHT - 80);
        ctx.fillText('Click anywhere to throw a pitch', 20, CANVAS_HEIGHT - 60);
        ctx.fillText('Press SPACE to hit the ball', 20, CANVAS_HEIGHT - 40);
        ctx.fillText(`Current: ${this.currentCamera} | Ball active: ${this.ball.active}`, 20, CANVAS_HEIGHT - 20);
    }
}
