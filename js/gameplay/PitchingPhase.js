import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../utils/constants.js';
import { worldToScreen } from '../utils/perspective.js';
import { PitchEngine } from './PitchEngine.js';
import { PITCH_TYPES, getPitcherRepertoire } from '../data/pitchTypes.js';
import { UIRenderer } from '../rendering/UIRenderer.js';
import { Audio } from '../engine/Audio.js';

export class PitchingPhase {
    constructor(gameScene) {
        this.gameScene = gameScene;
        this.game = gameScene.game;
        this.ball = gameScene.ball;

        this.state = 'SELECT_PITCH'; // SELECT_PITCH, AIM, POWER, DELIVER, RESULT

        // Available pitches for this pitcher
        const pitcher = gameScene.gameState.getCurrentPitcher();
        this.repertoire = getPitcherRepertoire(pitcher);
        this.selectedPitch = null;

        // Aim target (normalized -1 to 1)
        this.targetX = 0;
        this.targetY = 0;

        // Unified pitch quality meter (single click)
        this.meterValue = 0;
        this.meterDirection = 1;
        this.meterSpeed = 1.5;
        this.meterResult = 0;

        // Meter feedback
        this.meterFeedbackText = '';
        this.meterFeedbackColor = '#FFF';
        this.meterFeedbackTimer = 0;

        // Strike zone position on screen (from pitcher's view, zone is in the distance)
        this.strikeZone = {
            x: CANVAS_WIDTH / 2 - 40,
            y: 300,
            width: 80,
            height: 100,
        };

        // Result
        this.resultText = '';
        this.resultTimer = 0;
        this.resultColor = '#FFF';
        this.atBatOver = false;
    }

    enter() {
        this.state = 'SELECT_PITCH';
        this.selectedPitch = null;
        this.ball.reset();
        this.resultText = '';
        this.atBatOver = false;
    }

    update(dt) {
        const input = this.game.input;

        switch (this.state) {
            case 'SELECT_PITCH':
                this._handlePitchSelection(input);
                break;

            case 'AIM':
                this._handleAiming(input, dt);
                break;

            case 'POWER':
                this._handleMeter(input, dt);
                break;

            case 'DELIVER':
                this.ball.update(dt);
                if (this.meterFeedbackTimer > 0) this.meterFeedbackTimer -= dt;
                if (this.ball.trajectoryT >= 1.0) {
                    this._resolveDelivery();
                }
                break;

            case 'RESULT':
                this.ball.update(dt);
                if (this.meterFeedbackTimer > 0) this.meterFeedbackTimer -= dt;
                this.resultTimer -= dt;
                if (this.resultTimer <= 0) {
                    this._endAtBat();
                }
                break;
        }
    }

    _handlePitchSelection(input) {
        // Number keys select pitch type
        for (let i = 0; i < this.repertoire.length; i++) {
            const pitchId = this.repertoire[i];
            const pitchType = PITCH_TYPES[pitchId];
            if (pitchType && input.isKeyJustPressed(pitchType.key)) {
                this.selectedPitch = pitchId;
                this.state = 'AIM';
                return;
            }
        }

        // Also allow clicking on pitch buttons
        const mx = input.mouse.x;
        const my = input.mouse.y;
        if (input.isMouseJustPressed()) {
            for (let i = 0; i < this.repertoire.length; i++) {
                const bx = 20;
                const by = 150 + i * 50;
                if (UIRenderer.isPointInRect(mx, my, bx, by, 160, 40)) {
                    this.selectedPitch = this.repertoire[i];
                    this.state = 'AIM';
                    return;
                }
            }
        }
    }

    _handleAiming(input, dt) {
        // Mouse moves aim reticle within strike zone
        const sz = this.strikeZone;
        this.targetX = ((input.mouse.x - sz.x) / sz.width) * 2 - 1;
        this.targetY = ((input.mouse.y - sz.y) / sz.height) * 2 - 1;

        // Clamp
        this.targetX = Math.max(-1.5, Math.min(1.5, this.targetX));
        this.targetY = Math.max(-1.5, Math.min(1.5, this.targetY));

        if (input.isMouseJustPressed() || input.isKeyJustPressed('Space')) {
            this.state = 'POWER';
            this.meterValue = 0;
            this.meterDirection = 1;
        }
    }

    _handleMeter(input, dt) {
        // Single unified oscillating meter
        this.meterValue += this.meterDirection * this.meterSpeed * dt * 60;
        if (this.meterValue >= 100) {
            this.meterValue = 100;
            this.meterDirection = -1;
        } else if (this.meterValue <= 0) {
            this.meterValue = 0;
            this.meterDirection = 1;
        }

        if (input.isMouseJustPressed() || input.isKeyJustPressed('Space')) {
            this.meterResult = this.meterValue;
            this._setMeterFeedback(this.meterResult);
            this._throwPitch();
        }
    }

    _setMeterFeedback(value) {
        const sweetSpot = 75;
        const diff = Math.abs(value - sweetSpot);
        if (diff <= 5) {
            this.meterFeedbackText = 'PERFECT!';
            this.meterFeedbackColor = '#44FF44';
        } else if (diff <= 15) {
            this.meterFeedbackText = 'GREAT';
            this.meterFeedbackColor = '#88FF44';
        } else if (diff <= 25) {
            this.meterFeedbackText = 'GOOD';
            this.meterFeedbackColor = '#FFD700';
        } else if (diff <= 35) {
            this.meterFeedbackText = 'OK';
            this.meterFeedbackColor = '#FFAA44';
        } else {
            this.meterFeedbackText = 'POOR';
            this.meterFeedbackColor = '#FF4444';
        }
        this.meterFeedbackTimer = 1.0;
    }

    _throwPitch() {
        const gameState = this.gameScene.gameState;
        const pitcher = gameState.getCurrentPitcher();

        // Derive both power and accuracy from single meter value
        // Sweet spot at 75, wide green zone 55-95
        const sweetSpot = 75;
        const diff = Math.abs(this.meterResult - sweetSpot);
        const quality = Math.max(0, 1 - diff / 50);

        const accuracy = 50 + quality * 45 + pitcher.stats.pitchControl * 0.05;

        const trajectory = PitchEngine.calculateTrajectory(
            this.selectedPitch,
            this.targetX,
            this.targetY,
            pitcher.getEffectiveStats(),
            accuracy
        );

        this.ball.setTrajectory(trajectory);
        this.state = 'DELIVER';

        // Pitcher animation
        pitcher.animState = 'pitching';
        pitcher.animTimer = 0;
        setTimeout(() => { pitcher.animState = 'idle'; }, 600);
    }

    _resolveDelivery() {
        const gameState = this.gameScene.gameState;
        const batter = gameState.getCurrentBatter();
        const trajectory = this.ball.trajectory;
        const isStrike = PitchEngine.isStrike(trajectory.end);

        // AI batter decides whether to swing
        const swingDecision = this._aiBatterSwing(batter, trajectory, isStrike);

        if (swingDecision.swings) {
            if (swingDecision.makes_contact) {
                if (swingDecision.result === 'foul') {
                    Audio.batCrack(0.3);
                    gameState.addFoul();
                    this.resultText = 'FOUL BALL';
                    this.resultColor = '#FFAA44';
                    this.atBatOver = false;
                } else {
                    // Ball in play
                    this._resolveHit(swingDecision, batter);
                    return;
                }
            } else {
                // Swing and miss
                Audio.swingWhoosh();
                Audio.mittPop(0.5);
                const result = gameState.addStrike();
                this.resultText = result === 'strikeout' ? 'STRUCK HIM OUT!' : 'SWINGING STRIKE!';
                this.resultColor = result === 'strikeout' ? '#44FF44' : '#FFD700';
                this.atBatOver = (result === 'strikeout');
                if (result === 'strikeout') {
                    Audio.crowdCheer(0.6);
                    this.gameScene.particles.strikeoutEffect(CANVAS_WIDTH / 2, 250);
                    const pitcher = gameState.getCurrentPitcher();
                    if (pitcher) pitcher.seasonStats.pitcherStrikeouts++;
                }
            }
        } else {
            // Batter takes
            Audio.mittPop(0.5);
            if (isStrike) {
                Audio.strikeCall();
                const result = gameState.addStrike();
                this.resultText = result === 'strikeout' ? 'CALLED STRIKE THREE!' : 'CALLED STRIKE';
                this.resultColor = result === 'strikeout' ? '#44FF44' : '#FFD700';
                this.atBatOver = (result === 'strikeout');
                if (result === 'strikeout') {
                    Audio.crowdCheer(0.6);
                    this.gameScene.particles.strikeoutEffect(CANVAS_WIDTH / 2, 250);
                    const pitcher = gameState.getCurrentPitcher();
                    if (pitcher) pitcher.seasonStats.pitcherStrikeouts++;
                }
            } else {
                const result = gameState.addBall();
                this.resultText = result === 'walk' ? 'BALL FOUR' : 'BALL';
                this.resultColor = result === 'walk' ? '#FF4444' : '#88AAFF';
                this.atBatOver = (result === 'walk');
            }
        }

        this.state = 'RESULT';
        this.resultTimer = 1.5;
    }

    _aiBatterSwing(batter, trajectory, isStrike) {
        const contactSkill = batter.stats.contact / 100;
        const powerSkill = batter.stats.power / 100;

        // Swing probability based on location
        let swingChance = isStrike ? 0.65 : 0.25;
        swingChance += contactSkill * 0.15;

        const swings = Math.random() < swingChance;

        if (!swings) {
            return { swings: false };
        }

        // Contact probability
        let contactChance = 0.5 + contactSkill * 0.3;
        if (!isStrike) contactChance -= 0.2; // harder to hit balls outside zone

        const makes_contact = Math.random() < contactChance;

        if (!makes_contact) {
            return { swings: true, makes_contact: false };
        }

        // Foul probability
        if (Math.random() < 0.25) {
            return { swings: true, makes_contact: true, result: 'foul' };
        }

        // Quality of contact
        const quality = contactSkill * 0.5 + Math.random() * 0.5;
        let hitType;
        const roll = Math.random();

        if (quality > 0.85 && powerSkill > 0.7 && roll < 0.15) {
            hitType = 'home_run';
        } else if (quality > 0.7 && roll < 0.08) {
            hitType = 'triple';
        } else if (quality > 0.6 && roll < 0.2) {
            hitType = 'double';
        } else if (quality > 0.4) {
            hitType = roll < 0.55 ? 'single' : 'out';
        } else {
            hitType = 'out';
        }

        return { swings: true, makes_contact: true, result: hitType, quality };
    }

    _resolveHit(swingDecision, batter) {
        const gameState = this.gameScene.gameState;

        switch (swingDecision.result) {
            case 'home_run':
                Audio.batCrack(1.0);
                batter.seasonStats.hits++;
                batter.seasonStats.homeRuns++;
                batter.seasonStats.atBats++;
                gameState.recordHit(4);
                this.resultText = 'HOME RUN!';
                this.resultColor = '#FF4444';
                this.gameScene.triggerShake(8, 0.4);
                this.gameScene.particles.fireworks(CANVAS_WIDTH / 2, 200, 30);
                break;
            case 'triple':
                Audio.batCrack(0.7);
                batter.seasonStats.hits++;
                batter.seasonStats.triples++;
                batter.seasonStats.atBats++;
                gameState.recordHit(3);
                this.resultText = 'TRIPLE!';
                this.resultColor = '#FF8844';
                break;
            case 'double':
                Audio.batCrack(0.6);
                batter.seasonStats.hits++;
                batter.seasonStats.doubles++;
                batter.seasonStats.atBats++;
                gameState.recordHit(2);
                this.resultText = 'DOUBLE!';
                this.resultColor = '#FFAA44';
                break;
            case 'single':
                Audio.batCrack(0.5);
                batter.seasonStats.hits++;
                batter.seasonStats.atBats++;
                gameState.recordHit(1);
                this.resultText = 'BASE HIT!';
                this.resultColor = '#FF6644';
                break;
            case 'out':
            default:
                Audio.batCrack(0.4);
                batter.seasonStats.atBats++;
                gameState.recordOut('field_out');
                this.resultText = 'OUT!';
                this.resultColor = '#44FF44';
                Audio.outCall();
                break;
        }

        this.atBatOver = true;

        // Launch ball visually for hits
        if (swingDecision.result !== 'out') {
            const exitVelo = 60 + Math.random() * 40;
            const launchAngle = 5 + Math.random() * 35;
            const sprayAngle = (Math.random() - 0.5) * 60;
            this.ball.launch(exitVelo, launchAngle, sprayAngle, { x: 0, y: 3, z: 0 });
        }

        this.state = 'RESULT';
        this.resultTimer = 2.0;
    }

    _endAtBat() {
        if (this.atBatOver) {
            this.gameScene.onAtBatComplete();
        } else {
            // Continue at-bat
            this.state = 'SELECT_PITCH';
            this.selectedPitch = null;
            this.ball.reset();
            this.resultText = '';
            this.atBatOver = false;
            this.meterFeedbackText = '';
        }
    }

    render(ctx) {
        // Pitch selection UI
        if (this.state === 'SELECT_PITCH') {
            this._drawPitchSelector(ctx);
        }

        // Strike zone overlay (for aiming)
        if (this.state === 'AIM' || this.state === 'POWER') {
            this._drawStrikeZone(ctx);
        }

        // Aim reticle
        if (this.state === 'AIM') {
            this._drawAimReticle(ctx);
        }

        // Pitch quality meter
        if (this.state === 'POWER') {
            this._drawMeter(ctx);
            this._drawAimReticle(ctx); // keep showing where they're aiming
        }

        // Meter feedback text
        if (this.meterFeedbackText && this.meterFeedbackTimer > 0) {
            const alpha = Math.min(1, this.meterFeedbackTimer * 2);
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.font = 'bold 22px monospace';
            ctx.textAlign = 'center';
            ctx.fillStyle = 'rgba(0,0,0,0.6)';
            ctx.fillText(this.meterFeedbackText, CANVAS_WIDTH / 2 + 1, CANVAS_HEIGHT - 82);
            ctx.fillStyle = this.meterFeedbackColor;
            ctx.fillText(this.meterFeedbackText, CANVAS_WIDTH / 2, CANVAS_HEIGHT - 83);
            ctx.restore();
        }

        // Batter info
        const batter = this.gameScene.gameState.getCurrentBatter();
        if (batter && this.state !== 'RESULT') {
            ctx.fillStyle = 'rgba(0,0,0,0.6)';
            ctx.fillRect(CANVAS_WIDTH - 200, CANVAS_HEIGHT - 50, 190, 40);
            ctx.fillStyle = '#FFF';
            ctx.font = 'bold 13px monospace';
            ctx.textAlign = 'right';
            ctx.fillText(`${batter.name} #${batter.number}`, CANVAS_WIDTH - 20, CANVAS_HEIGHT - 32);
            ctx.fillStyle = '#AAA';
            ctx.font = '11px monospace';
            ctx.fillText(`PWR:${batter.stats.power} CON:${batter.stats.contact}`, CANVAS_WIDTH - 20, CANVAS_HEIGHT - 18);
        }

        // Result text
        if (this.resultText) {
            ctx.save();
            ctx.font = 'bold 36px monospace';
            ctx.textAlign = 'center';
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.fillText(this.resultText, CANVAS_WIDTH / 2 + 2, 250 + 2);
            ctx.fillStyle = this.resultColor;
            ctx.fillText(this.resultText, CANVAS_WIDTH / 2, 250);
            ctx.restore();
        }
    }

    _drawPitchSelector(ctx) {
        UIRenderer.drawPanel(ctx, 10, 130, 180, this.repertoire.length * 50 + 20, {
            bgColor: 'rgba(0,0,0,0.8)', borderColor: '#FFD700',
        });

        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('SELECT PITCH:', 20, 150);

        for (let i = 0; i < this.repertoire.length; i++) {
            const pitchId = this.repertoire[i];
            const pt = PITCH_TYPES[pitchId];
            const bx = 20;
            const by = 160 + i * 50;

            const mx = this.game.input.mouse.x;
            const my = this.game.input.mouse.y;
            const hovered = UIRenderer.isPointInRect(mx, my, bx, by, 160, 40);

            ctx.fillStyle = hovered ? 'rgba(255,215,0,0.2)' : 'rgba(255,255,255,0.05)';
            ctx.fillRect(bx, by, 160, 40);
            ctx.strokeStyle = pt.color;
            ctx.lineWidth = 2;
            ctx.strokeRect(bx, by, 160, 40);

            ctx.fillStyle = pt.color;
            ctx.font = 'bold 13px monospace';
            ctx.fillText(`[${i + 1}] ${pt.shortName}`, bx + 8, by + 16);
            ctx.fillStyle = '#AAA';
            ctx.font = '10px monospace';
            ctx.fillText(pt.description, bx + 8, by + 32);
        }
    }

    _drawStrikeZone(ctx) {
        const sz = this.strikeZone;

        // Zone box
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.lineWidth = 2;
        ctx.strokeRect(sz.x, sz.y, sz.width, sz.height);

        // Grid
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 0.5;
        for (let i = 1; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(sz.x + (sz.width * i) / 3, sz.y);
            ctx.lineTo(sz.x + (sz.width * i) / 3, sz.y + sz.height);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(sz.x, sz.y + (sz.height * i) / 3);
            ctx.lineTo(sz.x + sz.width, sz.y + (sz.height * i) / 3);
            ctx.stroke();
        }
    }

    _drawAimReticle(ctx) {
        const sz = this.strikeZone;
        const sx = sz.x + (this.targetX + 1) / 2 * sz.width;
        const sy = sz.y + (this.targetY + 1) / 2 * sz.height;

        // Outer ring
        ctx.strokeStyle = '#FF4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(sx, sy, 15, 0, Math.PI * 2);
        ctx.stroke();

        // Crosshair
        ctx.strokeStyle = 'rgba(255,68,68,0.6)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(sx - 6, sy);
        ctx.lineTo(sx + 6, sy);
        ctx.moveTo(sx, sy - 6);
        ctx.lineTo(sx, sy + 6);
        ctx.stroke();

        // Center dot
        ctx.fillStyle = '#FF4444';
        ctx.beginPath();
        ctx.arc(sx, sy, 2, 0, Math.PI * 2);
        ctx.fill();
    }

    _drawMeter(ctx) {
        const meterX = CANVAS_WIDTH / 2 - 100;
        const meterY = CANVAS_HEIGHT - 60;
        const meterW = 200;
        const meterH = 20;

        // Background panel
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(meterX - 5, meterY - 25, meterW + 10, meterH + 35);

        // Label
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('PITCH QUALITY', CANVAS_WIDTH / 2, meterY - 8);

        // Color-coded gradient bar (red → orange → yellow → green → yellow → red)
        const gradient = ctx.createLinearGradient(meterX, 0, meterX + meterW, 0);
        gradient.addColorStop(0.0, '#FF2222');
        gradient.addColorStop(0.35, '#FF8844');
        gradient.addColorStop(0.55, '#FFDD44');
        gradient.addColorStop(0.70, '#44FF44');
        gradient.addColorStop(0.75, '#00FF00');
        gradient.addColorStop(0.80, '#44FF44');
        gradient.addColorStop(0.95, '#FFDD44');
        gradient.addColorStop(1.0, '#FF2222');
        ctx.fillStyle = gradient;
        ctx.fillRect(meterX, meterY, meterW, meterH);

        // Sweet spot marker line at 75%
        const sweetX = meterX + 0.75 * meterW;
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(sweetX, meterY);
        ctx.lineTo(sweetX, meterY + meterH);
        ctx.stroke();

        // Current value indicator (white line)
        const indicX = meterX + (this.meterValue / 100) * meterW;
        ctx.fillStyle = '#FFF';
        ctx.fillRect(indicX - 1.5, meterY - 4, 3, meterH + 8);

        // Border
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 1;
        ctx.strokeRect(meterX, meterY, meterW, meterH);
    }
}
