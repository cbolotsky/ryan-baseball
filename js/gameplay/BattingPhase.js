import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../utils/constants.js';
import { worldToScreen } from '../utils/perspective.js';
import { BatPhysics } from './BatPhysics.js';
import { PitchEngine } from './PitchEngine.js';
import { PITCH_TYPES, getPitcherRepertoire } from '../data/pitchTypes.js';
import { distance } from '../utils/math.js';
import { Audio } from '../engine/Audio.js';

export class BattingPhase {
    constructor(gameScene) {
        this.gameScene = gameScene;
        this.game = gameScene.game;
        this.state = 'WAITING'; // WAITING, PITCH_INCOMING, SWING_WINDOW, RESULT
        this.ball = gameScene.ball;

        // Bat cursor position (screen coords)
        this.batCursor = { x: CANVAS_WIDTH / 2, y: 420 };

        // Strike zone rendering (screen coords approximation)
        this.strikeZone = {
            x: CANVAS_WIDTH / 2 - 60,
            y: 320,
            width: 120,
            height: 140,
        };

        this.swingTriggered = false;
        this.swingTime = 0;
        this.pitchArrivalTime = 0;
        this.ballScreenPosAtPlate = null;

        // Result display
        this.resultText = '';
        this.resultTimer = 0;
        this.resultColor = '#FFF';
        this.atBatOver = false; // true when this at-bat is done (out, hit, walk, K)

        // Swing timing feedback
        this.swingFeedbackText = '';
        this.swingFeedbackColor = '#FFF';
        this.swingFeedbackTimer = 0;

        // Pitch tracking
        this.currentPitch = null;
        this.pitchStartTime = 0;
        this.autoThrowTimer = 1.5; // throw pitch after short delay
    }

    enter() {
        this.state = 'WAITING';
        this.swingTriggered = false;
        this.resultText = '';
        this.autoThrowTimer = 1.5;
        this.ball.reset();
    }

    update(dt) {
        const input = this.game.input;

        // Move bat cursor with mouse
        this.batCursor.x = input.mouse.x;
        this.batCursor.y = input.mouse.y;

        // Clamp bat cursor to reasonable area
        this.batCursor.x = Math.max(this.strikeZone.x - 80, Math.min(this.strikeZone.x + this.strikeZone.width + 80, this.batCursor.x));
        this.batCursor.y = Math.max(this.strikeZone.y - 40, Math.min(this.strikeZone.y + this.strikeZone.height + 60, this.batCursor.y));

        switch (this.state) {
            case 'WAITING':
                this.autoThrowTimer -= dt;
                if (this.autoThrowTimer <= 0) {
                    this._throwPitch();
                }
                break;

            case 'PITCH_INCOMING':
                this.ball.update(dt);

                // Check if ball has arrived at the plate
                if (this.ball.trajectoryT >= 0.70 && !this.swingTriggered) {
                    this.state = 'SWING_WINDOW';
                }

                // Check for swing input
                if (input.isMouseJustPressed() || input.isKeyJustPressed('Space')) {
                    this.swingTriggered = true;
                    this.swingTime = this.ball.trajectoryT;
                }

                // Pitch passed plate without swing
                if (this.ball.trajectoryT >= 1.0) {
                    if (this.swingTriggered) {
                        this._resolveSwing();
                    } else {
                        this._resolveTake();
                    }
                }
                break;

            case 'SWING_WINDOW':
                this.ball.update(dt);

                if (input.isMouseJustPressed() || input.isKeyJustPressed('Space')) {
                    this.swingTriggered = true;
                    this.swingTime = this.ball.trajectoryT;
                }

                if (this.ball.trajectoryT >= 1.0) {
                    if (this.swingTriggered) {
                        this._resolveSwing();
                    } else {
                        this._resolveTake();
                    }
                }
                break;

            case 'RESULT':
                this.ball.update(dt);
                this.resultTimer -= dt;
                if (this.swingFeedbackTimer > 0) this.swingFeedbackTimer -= dt;
                if (this.resultTimer <= 0) {
                    this._endAtBat();
                }
                break;
        }
    }

    _throwPitch() {
        const gameState = this.gameScene.gameState;
        const pitcher = gameState.getCurrentPitcher();
        const repertoire = getPitcherRepertoire(pitcher);

        // AI selects pitch
        const selection = PitchEngine.selectAIPitch(pitcher, gameState.count, repertoire);

        const trajectory = PitchEngine.calculateTrajectory(
            selection.type,
            selection.targetX,
            selection.targetY,
            pitcher.getEffectiveStats(),
            70 + pitcher.stats.pitchControl * 0.3
        );

        this.currentPitch = selection;
        this.ball.setTrajectory(trajectory);
        this.state = 'PITCH_INCOMING';
        this.swingTriggered = false;
        this.swingTime = 0;

        // Animate pitcher
        if (pitcher) {
            pitcher.animState = 'pitching';
            pitcher.animTimer = 0;
            setTimeout(() => { pitcher.animState = 'idle'; }, 600);
        }
    }

    _resolveSwing() {
        const gameState = this.gameScene.gameState;
        const batter = gameState.getCurrentBatter();
        const trajectory = this.ball.trajectory;

        // Calculate timing quality
        // Perfect timing is when swing happens at t ≈ 0.92 (just before arrival)
        const idealSwingT = 0.92;
        const timingDiff = Math.abs(this.swingTime - idealSwingT);
        const timingQuality = Math.max(0, 1 - timingDiff * 2.5);

        // Set swing timing feedback
        if (timingDiff <= 0.03) {
            this.swingFeedbackText = 'PERFECT!';
            this.swingFeedbackColor = '#00FF00';
        } else if (timingDiff <= 0.08) {
            this.swingFeedbackText = 'GOOD';
            this.swingFeedbackColor = '#88FF44';
        } else if (this.swingTime < idealSwingT) {
            this.swingFeedbackText = timingDiff > 0.2 ? 'WAY EARLY' : 'EARLY';
            this.swingFeedbackColor = timingDiff > 0.2 ? '#FF4444' : '#FFAA44';
        } else {
            this.swingFeedbackText = timingDiff > 0.2 ? 'WAY LATE' : 'LATE';
            this.swingFeedbackColor = timingDiff > 0.2 ? '#FF4444' : '#FFAA44';
        }
        this.swingFeedbackTimer = 1.0;

        // Calculate placement quality — how close is bat cursor to ball's arrival position
        const ballEndScreen = worldToScreen(trajectory.end.x, trajectory.end.y, trajectory.end.z);
        let placementQuality = 0;
        if (ballEndScreen) {
            const dist = distance(this.batCursor, ballEndScreen);
            placementQuality = Math.max(0, 1 - dist / 180);
        }

        // Get hit result
        const hitResult = BatPhysics.calculateHitResult(
            timingQuality,
            placementQuality,
            batter.getEffectiveStats(),
            PITCH_TYPES[this.currentPitch.type]
        );

        if (hitResult.type === 'miss') {
            Audio.swingWhoosh();
            const result = gameState.addStrike();
            this.resultText = result === 'strikeout' ? 'STRIKEOUT!' : 'SWING AND A MISS!';
            this.resultColor = '#FF4444';
            this.atBatOver = (result === 'strikeout');
            if (result === 'strikeout') {
                Audio.strikeCall();
                this.gameScene.particles.strikeoutEffect(CANVAS_WIDTH / 2, 200);
                const pitcher = gameState.getCurrentPitcher();
                if (pitcher) pitcher.seasonStats.pitcherStrikeouts++;
            }
        } else if (hitResult.type === 'foul') {
            Audio.batCrack(0.3);
            gameState.addFoul();
            this.resultText = 'FOUL BALL';
            this.resultColor = '#FFAA44';
            this.atBatOver = false;
        } else {
            // Ball in play — resolve fielding
            const avgFielding = this._getAvgFielding(gameState.getFieldingTeam());
            const fieldResult = BatPhysics.resolveFielding(hitResult, avgFielding);

            if (fieldResult.result === 'out') {
                Audio.batCrack(0.4);
                gameState.recordOut('field_out');
                this.resultText = fieldResult.description;
                this.resultColor = '#FF4444';
                this.atBatOver = true;
                Audio.outCall();
            } else if (fieldResult.result === 'home_run') {
                Audio.batCrack(1.0);
                gameState.recordHit(4);
                this.resultText = 'HOME RUN!!!';
                this.resultColor = '#FFD700';
                batter.seasonStats.homeRuns++;
                batter.seasonStats.hits++;
                batter.seasonStats.atBats++;
                this.atBatOver = true;
                Audio.homeRunFanfare();
                this.gameScene.triggerShake(10, 0.5);
                this.gameScene.particles.fireworks(CANVAS_WIDTH / 2, 180, 40);
            } else {
                Audio.batCrack(0.5 + fieldResult.basesReached * 0.15);
                gameState.recordHit(fieldResult.basesReached);
                this.resultText = fieldResult.description;
                this.resultColor = '#44FF44';
                batter.seasonStats.hits++;
                batter.seasonStats.atBats++;
                this.atBatOver = true;
                Audio.crowdCheer(0.3 + fieldResult.basesReached * 0.15);
                this.gameScene.particles.sparkle(CANVAS_WIDTH / 2, 380, 10);
            }

            // Launch ball visually
            if (hitResult.exitVelo) {
                this.ball.launch(
                    hitResult.exitVelo,
                    hitResult.launchAngle,
                    hitResult.sprayAngle,
                    { x: 0, y: 3, z: 2 }
                );
            }
        }

        this.state = 'RESULT';
        this.resultTimer = 2.0;
    }

    _resolveTake() {
        // Batter didn't swing — called ball or strike
        const gameState = this.gameScene.gameState;
        const trajectory = this.ball.trajectory;

        const isStrike = PitchEngine.isStrike(trajectory.end);

        if (isStrike) {
            Audio.mittPop(0.6);
            Audio.strikeCall();
            const result = gameState.addStrike();
            this.resultText = result === 'strikeout' ? 'CALLED STRIKE THREE!' : 'CALLED STRIKE!';
            this.resultColor = '#FF4444';
            this.atBatOver = (result === 'strikeout');
            if (result === 'strikeout') {
                this.gameScene.particles.strikeoutEffect(CANVAS_WIDTH / 2, 200);
                const pitcher = gameState.getCurrentPitcher();
                if (pitcher) pitcher.seasonStats.pitcherStrikeouts++;
            }
        } else {
            Audio.mittPop(0.3);
            const result = gameState.addBall();
            this.resultText = result === 'walk' ? 'BALL FOUR - WALK!' : 'BALL';
            this.resultColor = result === 'walk' ? '#44FF44' : '#88AAFF';
            this.atBatOver = (result === 'walk');
        }

        this.state = 'RESULT';
        this.resultTimer = 1.5;
    }

    _endAtBat() {
        if (this.atBatOver) {
            // At-bat is done — signal to GameScene for next batter
            this.gameScene.onAtBatComplete();
        } else {
            // Continue this at-bat (ball, called strike, foul, swing & miss)
            this.state = 'WAITING';
            this.autoThrowTimer = 1.2;
            this.ball.reset();
            this.swingTriggered = false;
            this.resultText = '';
            this.atBatOver = false;
        }
    }

    _getAvgFielding(team) {
        if (!team.lineup || team.lineup.length === 0) return 70;
        const total = team.lineup.reduce((sum, p) => sum + p.stats.fielding, 0);
        return total / team.lineup.length;
    }

    render(ctx) {
        const progress = this.ball ? this.ball.trajectoryT : 0;
        const isPitchActive = this.state === 'PITCH_INCOMING' || this.state === 'SWING_WINDOW';

        // Pitch prediction target circle (where ball will arrive)
        if (isPitchActive && progress > 0.30 && this.ball.trajectory) {
            this._drawTargetCircle(ctx, progress);
        }

        // Strike zone
        this._drawStrikeZone(ctx);

        // Bat cursor (with glow when near target)
        this._drawBatCursor(ctx, progress);

        // Sweet-spot circle on ball
        if (isPitchActive && progress > 0.30) {
            this._drawSweetSpotCircle(ctx, progress);
        }

        // Result text
        if (this.resultText) {
            ctx.save();
            ctx.font = 'bold 36px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.fillText(this.resultText, CANVAS_WIDTH / 2 + 2, 200 + 2);
            ctx.fillStyle = this.resultColor;
            ctx.fillText(this.resultText, CANVAS_WIDTH / 2, 200);
            ctx.restore();
        }

        // Swing timing feedback
        if (this.swingFeedbackTimer > 0 && this.swingFeedbackText) {
            const alpha = Math.min(1, this.swingFeedbackTimer * 2);
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.font = 'bold 28px monospace';
            ctx.textAlign = 'center';
            ctx.fillStyle = 'rgba(0,0,0,0.6)';
            ctx.fillText(this.swingFeedbackText, CANVAS_WIDTH / 2 + 2, 250 + 2);
            ctx.fillStyle = this.swingFeedbackColor;
            ctx.fillText(this.swingFeedbackText, CANVAS_WIDTH / 2, 250);
            ctx.restore();
        }

        // Pitch info
        if (this.currentPitch && isPitchActive) {
            const pt = PITCH_TYPES[this.currentPitch.type];
            if (pt) {
                ctx.fillStyle = pt.color || '#FFF';
                ctx.font = 'bold 14px monospace';
                ctx.textAlign = 'right';
                ctx.fillText(pt.name, CANVAS_WIDTH - 20, 100);
                if (this.ball.trajectory) {
                    ctx.fillText(`${Math.round(this.ball.trajectory.speed)} MPH`, CANVAS_WIDTH - 20, 118);
                }
            }
        }

        // Large color-coded timing meter
        if (isPitchActive) {
            this._drawTimingMeter(ctx, progress);
        }
    }

    _drawTimingMeter(ctx, progress) {
        const barWidth = 400;
        const barHeight = 16;
        const barX = CANVAS_WIDTH / 2 - barWidth / 2;
        const barY = CANVAS_HEIGHT - 45;

        // Background
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(barX - 5, barY - 5, barWidth + 10, barHeight + 25);

        // Color-coded gradient bar: red (early) → yellow → green (sweet 0.80-0.97) → red (late)
        const gradient = ctx.createLinearGradient(barX, 0, barX + barWidth, 0);
        gradient.addColorStop(0.0, '#FF2222');
        gradient.addColorStop(0.55, '#FF8844');
        gradient.addColorStop(0.72, '#FFDD44');
        gradient.addColorStop(0.80, '#44FF44');
        gradient.addColorStop(0.92, '#00FF00');
        gradient.addColorStop(0.97, '#44FF44');
        gradient.addColorStop(1.0, '#FF2222');
        ctx.fillStyle = gradient;
        ctx.fillRect(barX, barY, barWidth, barHeight);

        // Perfect-spot marker at t=0.92
        const perfectX = barX + 0.92 * barWidth;
        ctx.strokeStyle = 'rgba(255,255,255,0.7)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(perfectX, barY - 2);
        ctx.lineTo(perfectX, barY + barHeight + 2);
        ctx.stroke();

        // Current position triangle cursor
        const cursorX = barX + progress * barWidth;
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.moveTo(cursorX, barY - 6);
        ctx.lineTo(cursorX - 5, barY - 12);
        ctx.lineTo(cursorX + 5, barY - 12);
        ctx.closePath();
        ctx.fill();
        // Also draw a line through the bar
        ctx.fillRect(cursorX - 1, barY, 2, barHeight);

        // Border
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barWidth, barHeight);

        // "SWING!" text when in green zone
        if (progress >= 0.70 && progress <= 0.97) {
            ctx.fillStyle = '#00FF00';
            ctx.font = 'bold 16px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('SWING!', CANVAS_WIDTH / 2, barY + barHeight + 18);
        } else {
            ctx.fillStyle = '#888';
            ctx.font = '12px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('TIMING', CANVAS_WIDTH / 2, barY + barHeight + 16);
        }
    }

    _drawSweetSpotCircle(ctx, progress) {
        if (!this.ball || !this.ball.pos) return;
        const bscreen = worldToScreen(this.ball.pos.x, this.ball.pos.y, this.ball.pos.z);
        if (!bscreen) return;

        const radius = 8 + (1 - progress) * 20;

        // Color based on timing zone
        let color;
        if (progress < 0.70) {
            color = 'rgba(255,255,255,0.3)';
        } else if (progress < 0.80) {
            color = 'rgba(255,221,68,0.5)';
        } else if (progress <= 0.97) {
            // Green zone — pulse
            const pulse = 0.5 + 0.5 * Math.sin(Date.now() * 0.01);
            color = `rgba(0,255,0,${0.4 + pulse * 0.3})`;
        } else {
            color = 'rgba(255,68,68,0.5)';
        }

        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(bscreen.x, bscreen.y, radius, 0, Math.PI * 2);
        ctx.stroke();
    }

    _drawTargetCircle(ctx, progress) {
        if (!this.ball || !this.ball.trajectory) return;
        const endPos = this.ball.trajectory.end;
        const target = worldToScreen(endPos.x, endPos.y, endPos.z);
        if (!target) return;

        // Shrink from 60px to 18px as ball approaches
        const t = Math.min(1, (progress - 0.30) / 0.70);
        const radius = 60 - t * 42;
        const opacity = 0.2 + t * 0.6;

        // Check if bat cursor is inside target
        const dist = distance(this.batCursor, target);
        const isOverlapping = dist < radius;

        // Dashed circle
        ctx.save();
        ctx.strokeStyle = isOverlapping ? `rgba(0,255,0,${opacity})` : `rgba(255,221,0,${opacity})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.arc(target.x, target.y, radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Green fill when overlapping
        if (isOverlapping) {
            ctx.fillStyle = `rgba(0,255,0,${opacity * 0.15})`;
            ctx.beginPath();
            ctx.arc(target.x, target.y, radius, 0, Math.PI * 2);
            ctx.fill();
        }

        // Center crosshair dot (appears at 50%+)
        if (progress > 0.50) {
            ctx.fillStyle = isOverlapping ? `rgba(0,255,0,${opacity})` : `rgba(255,221,0,${opacity})`;
            ctx.beginPath();
            ctx.arc(target.x, target.y, 3, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    _drawStrikeZone(ctx) {
        const sz = this.strikeZone;

        // Zone outline
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(sz.x, sz.y, sz.width, sz.height);
        ctx.setLineDash([]);

        // Grid lines (3x3 zones)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 0.5;
        for (let i = 1; i < 3; i++) {
            // Vertical
            ctx.beginPath();
            ctx.moveTo(sz.x + (sz.width * i) / 3, sz.y);
            ctx.lineTo(sz.x + (sz.width * i) / 3, sz.y + sz.height);
            ctx.stroke();
            // Horizontal
            ctx.beginPath();
            ctx.moveTo(sz.x, sz.y + (sz.height * i) / 3);
            ctx.lineTo(sz.x + sz.width, sz.y + (sz.height * i) / 3);
            ctx.stroke();
        }
    }

    _drawBatCursor(ctx, progress) {
        const x = this.batCursor.x;
        const y = this.batCursor.y;

        // Check if cursor is near the target for green glow
        let nearTarget = false;
        if (this.ball && this.ball.trajectory && progress > 0.30) {
            const endPos = this.ball.trajectory.end;
            const target = worldToScreen(endPos.x, endPos.y, endPos.z);
            if (target) {
                const t = Math.min(1, (progress - 0.30) / 0.70);
                const targetRadius = 60 - t * 42;
                nearTarget = distance(this.batCursor, target) < targetRadius;
            }
        }

        // Green glow when positioned correctly
        if (nearTarget && !this.swingTriggered) {
            ctx.save();
            ctx.shadowColor = '#00FF00';
            ctx.shadowBlur = 15;
            ctx.strokeStyle = '#00FF00';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(x, y, 22, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }

        // Outer circle
        const cursorColor = this.swingTriggered ? '#FF6600' : (nearTarget ? '#00FF00' : '#FFD700');
        ctx.strokeStyle = cursorColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.stroke();

        // Crosshair
        ctx.strokeStyle = this.swingTriggered ? '#FF6600' : (nearTarget ? 'rgba(0,255,0,0.6)' : 'rgba(255,215,0,0.6)');
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x - 8, y);
        ctx.lineTo(x + 8, y);
        ctx.moveTo(x, y - 8);
        ctx.lineTo(x, y + 8);
        ctx.stroke();

        // Center dot
        ctx.fillStyle = cursorColor;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
    }
}
