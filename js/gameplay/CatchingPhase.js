import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../utils/constants.js';
import { worldToScreen } from '../utils/perspective.js';
import { PitchEngine } from './PitchEngine.js';
import { PITCH_TYPES, getPitcherRepertoire } from '../data/pitchTypes.js';
import { distance } from '../utils/math.js';
import { UIRenderer } from '../rendering/UIRenderer.js';
import { Audio } from '../engine/Audio.js';

export class CatchingPhase {
    constructor(gameScene) {
        this.gameScene = gameScene;
        this.game = gameScene.game;
        this.ball = gameScene.ball;

        this.state = 'CALL_PITCH'; // CALL_PITCH, PITCH_INCOMING, CATCH_WINDOW, RESULT

        // Mitt cursor
        this.mittCursor = { x: CANVAS_WIDTH / 2, y: 420 };

        // Pitch calling — player picks what pitch the AI pitcher throws
        const pitcher = gameScene.gameState.getCurrentPitcher();
        this.repertoire = getPitcherRepertoire(pitcher);
        this.calledPitch = null;

        // Strike zone
        this.strikeZone = {
            x: CANVAS_WIDTH / 2 - 60,
            y: 320,
            width: 120,
            height: 140,
        };

        // Catch quality
        this.catchResult = null;
        this.framingBonus = false;

        // Result
        this.resultText = '';
        this.resultTimer = 0;
        this.resultColor = '#FFF';
        this.atBatOver = false;
    }

    enter() {
        this.state = 'CALL_PITCH';
        this.calledPitch = null;
        this.ball.reset();
        this.resultText = '';
        this.atBatOver = false;
        this.catchResult = null;
    }

    update(dt) {
        const input = this.game.input;

        // Move mitt with mouse
        this.mittCursor.x = input.mouse.x;
        this.mittCursor.y = input.mouse.y;

        switch (this.state) {
            case 'CALL_PITCH':
                this._handlePitchCall(input);
                break;

            case 'PITCH_INCOMING':
                this.ball.update(dt);
                if (this.ball.trajectoryT >= 0.9) {
                    this.state = 'CATCH_WINDOW';
                }
                break;

            case 'CATCH_WINDOW':
                this.ball.update(dt);
                if (this.ball.trajectoryT >= 1.0) {
                    this._evaluateCatch();
                }
                break;

            case 'RESULT':
                this.ball.update(dt);
                this.resultTimer -= dt;
                if (this.resultTimer <= 0) {
                    this._endAtBat();
                }
                break;
        }
    }

    _handlePitchCall(input) {
        // Number keys to call pitch type
        for (let i = 0; i < this.repertoire.length; i++) {
            const pitchId = this.repertoire[i];
            const pt = PITCH_TYPES[pitchId];
            if (pt && input.isKeyJustPressed(pt.key)) {
                this._throwCalledPitch(pitchId);
                return;
            }
        }

        // Click on pitch buttons
        if (input.isMouseJustPressed()) {
            for (let i = 0; i < this.repertoire.length; i++) {
                const bx = 20;
                const by = 150 + i * 50;
                if (UIRenderer.isPointInRect(input.mouse.x, input.mouse.y, bx, by, 160, 40)) {
                    this._throwCalledPitch(this.repertoire[i]);
                    return;
                }
            }
        }
    }

    _throwCalledPitch(pitchId) {
        this.calledPitch = pitchId;
        const gameState = this.gameScene.gameState;
        const pitcher = gameState.getCurrentPitcher();

        // AI pitcher aims (semi-random based on game situation)
        const selection = PitchEngine.selectAIPitch(pitcher, gameState.count, [pitchId]);

        const trajectory = PitchEngine.calculateTrajectory(
            pitchId,
            selection.targetX,
            selection.targetY,
            pitcher.getEffectiveStats(),
            65 + pitcher.stats.pitchControl * 0.3
        );

        this.ball.setTrajectory(trajectory);
        this.state = 'PITCH_INCOMING';

        // Pitcher animation
        pitcher.animState = 'pitching';
        pitcher.animTimer = 0;
        setTimeout(() => { pitcher.animState = 'idle'; }, 600);
    }

    _evaluateCatch() {
        const trajectory = this.ball.trajectory;
        const ballEnd = worldToScreen(trajectory.end.x, trajectory.end.y, trajectory.end.z);

        if (!ballEnd) {
            this.catchResult = 'poor_catch';
            this._resolvePitch(false);
            return;
        }

        const dist = distance(this.mittCursor, ballEnd);

        if (dist > 100) {
            this.catchResult = 'passed_ball';
        } else if (dist > 60) {
            this.catchResult = 'poor_catch';
            Audio.mittPop(0.3);
        } else if (dist > 25) {
            this.catchResult = 'good_catch';
            Audio.mittPop(0.6);
        } else {
            this.catchResult = 'perfect_catch';
            Audio.mittPop(0.9);
        }

        // Check if framing applies (borderline pitch, good catch)
        const isStrike = PitchEngine.isStrike(trajectory.end);
        this.framingBonus = false;

        if (!isStrike && this.catchResult === 'perfect_catch') {
            // Check if pitch was borderline
            const borderline = Math.abs(trajectory.end.x) > 0.6 && Math.abs(trajectory.end.x) < 1.2 ||
                              (trajectory.end.y > 1.2 && trajectory.end.y < 1.8) ||
                              (trajectory.end.y > 3.2 && trajectory.end.y < 3.8);
            if (borderline) {
                // Framing chance based on catcher's fielding
                const catcher = this.gameScene.gameState.getFieldingTeam().getPlayerByPosition('C');
                const framingChance = catcher ? catcher.stats.fielding / 200 : 0.3;
                this.framingBonus = Math.random() < framingChance;
            }
        }

        // Resolve the at-bat result based on AI batter swing decision
        this._resolvePitch(isStrike || this.framingBonus);
    }

    _resolvePitch(calledStrike) {
        const gameState = this.gameScene.gameState;
        const batter = gameState.getCurrentBatter();
        const trajectory = this.ball.trajectory;
        const realStrike = PitchEngine.isStrike(trajectory.end);

        // AI batter swing decision
        const contactSkill = batter.stats.contact / 100;
        let swingChance = realStrike ? 0.6 : 0.2;
        swingChance += contactSkill * 0.15;
        const swings = Math.random() < swingChance;

        if (swings) {
            const contactChance = 0.45 + contactSkill * 0.3;
            const makesContact = Math.random() < contactChance;

            if (!makesContact) {
                Audio.swingWhoosh();
                const result = gameState.addStrike();
                this.resultText = result === 'strikeout' ? 'STRIKE THREE! K!' : 'SWINGING STRIKE';
                this.resultColor = result === 'strikeout' ? '#44FF44' : '#FFD700';
                this.atBatOver = (result === 'strikeout');
                if (result === 'strikeout') {
                    Audio.crowdCheer(0.6);
                    this.gameScene.particles.strikeoutEffect(CANVAS_WIDTH / 2, 200);
                    const pitcher = gameState.getCurrentPitcher();
                    if (pitcher) pitcher.seasonStats.pitcherStrikeouts++;
                }
            } else if (Math.random() < 0.3) {
                Audio.batCrack(0.3);
                gameState.addFoul();
                this.resultText = 'FOUL BALL';
                this.resultColor = '#FFAA44';
                this.atBatOver = false;
            } else {
                // Ball in play — simplified
                this._resolveAIHit(batter);
                return;
            }
        } else {
            // Takes the pitch
            if (calledStrike) {
                Audio.strikeCall();
                const result = gameState.addStrike();
                const frameText = this.framingBonus ? ' (FRAMED!)' : '';
                this.resultText = result === 'strikeout' ? `CALLED STRIKE THREE!${frameText}` : `CALLED STRIKE${frameText}`;
                this.resultColor = result === 'strikeout' ? '#44FF44' : '#FFD700';
                this.atBatOver = (result === 'strikeout');
                if (result === 'strikeout') {
                    Audio.crowdCheer(0.7);
                    this.gameScene.particles.strikeoutEffect(CANVAS_WIDTH / 2, 200);
                    const pitcher = gameState.getCurrentPitcher();
                    if (pitcher) pitcher.seasonStats.pitcherStrikeouts++;
                }
                if (this.framingBonus) {
                    this.gameScene.particles.sparkle(this.mittCursor.x, this.mittCursor.y, 12, '#44AAFF');
                }
            } else {
                const result = gameState.addBall();
                this.resultText = result === 'walk' ? 'BALL FOUR' : 'BALL';
                this.resultColor = result === 'walk' ? '#FF4444' : '#88AAFF';
                this.atBatOver = (result === 'walk');
            }
        }

        // Passed ball consequences
        if (this.catchResult === 'passed_ball' && gameState.getRunnersOnBase() > 0) {
            // Advance runners on passed ball
            if (gameState.bases.third) {
                gameState.recordRun(gameState.bases.third);
                gameState.bases.third = null;
                this.resultText += ' - PASSED BALL! RUN SCORES!';
                this.resultColor = '#FF4444';
            }
            if (gameState.bases.second) {
                gameState.bases.third = gameState.bases.second;
                gameState.bases.second = null;
            }
        }

        this.state = 'RESULT';
        this.resultTimer = 1.8;
    }

    _resolveAIHit(batter) {
        const gameState = this.gameScene.gameState;
        const powerSkill = batter.stats.power / 100;
        const roll = Math.random();

        if (roll < 0.03 + powerSkill * 0.05) {
            Audio.batCrack(1.0);
            batter.seasonStats.hits++;
            batter.seasonStats.homeRuns++;
            batter.seasonStats.atBats++;
            gameState.recordHit(4);
            this.resultText = 'HOME RUN!';
            this.resultColor = '#FF4444';
            this.gameScene.triggerShake(6, 0.3);
            this.gameScene.particles.fireworks(CANVAS_WIDTH / 2, 200, 25);
        } else if (roll < 0.07) {
            Audio.batCrack(0.7);
            batter.seasonStats.hits++;
            batter.seasonStats.atBats++;
            gameState.recordHit(3);
            this.resultText = 'TRIPLE!';
            this.resultColor = '#FF8844';
        } else if (roll < 0.18) {
            Audio.batCrack(0.6);
            batter.seasonStats.hits++;
            batter.seasonStats.atBats++;
            gameState.recordHit(2);
            this.resultText = 'DOUBLE!';
            this.resultColor = '#FFAA44';
        } else if (roll < 0.45) {
            Audio.batCrack(0.5);
            batter.seasonStats.hits++;
            batter.seasonStats.atBats++;
            gameState.recordHit(1);
            this.resultText = 'BASE HIT';
            this.resultColor = '#FF6644';
        } else {
            Audio.batCrack(0.4);
            batter.seasonStats.atBats++;
            gameState.recordOut('field_out');
            this.resultText = 'OUT!';
            this.resultColor = '#44FF44';
            Audio.outCall();
        }

        this.atBatOver = true;
        this.state = 'RESULT';
        this.resultTimer = 2.0;
    }

    _endAtBat() {
        if (this.atBatOver) {
            this.gameScene.onAtBatComplete();
        } else {
            this.state = 'CALL_PITCH';
            this.calledPitch = null;
            this.ball.reset();
            this.resultText = '';
            this.atBatOver = false;
            this.catchResult = null;
        }
    }

    render(ctx) {
        // Pitch call selector
        if (this.state === 'CALL_PITCH') {
            this._drawPitchSelector(ctx);
        }

        // Strike zone
        if (this.state !== 'RESULT') {
            this._drawStrikeZone(ctx);
        }

        // Mitt cursor
        this._drawMitt(ctx);

        // Catch quality indicator
        if (this.catchResult && this.state === 'RESULT') {
            this._drawCatchQuality(ctx);
        }

        // Result text
        if (this.resultText) {
            ctx.save();
            ctx.font = 'bold 32px monospace';
            ctx.textAlign = 'center';
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.fillText(this.resultText, CANVAS_WIDTH / 2 + 2, 200 + 2);
            ctx.fillStyle = this.resultColor;
            ctx.fillText(this.resultText, CANVAS_WIDTH / 2, 200);
            ctx.restore();
        }

        // Batter info
        const batter = this.gameScene.gameState.getCurrentBatter();
        if (batter) {
            ctx.fillStyle = 'rgba(0,0,0,0.6)';
            ctx.fillRect(CANVAS_WIDTH - 200, CANVAS_HEIGHT - 50, 190, 40);
            ctx.fillStyle = '#FFF';
            ctx.font = 'bold 13px monospace';
            ctx.textAlign = 'right';
            ctx.fillText(`AB: ${batter.name}`, CANVAS_WIDTH - 20, CANVAS_HEIGHT - 30);
        }
    }

    _drawPitchSelector(ctx) {
        UIRenderer.drawPanel(ctx, 10, 130, 180, this.repertoire.length * 50 + 30, {
            bgColor: 'rgba(0,0,0,0.8)', borderColor: '#44AAFF',
        });

        ctx.fillStyle = '#44AAFF';
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('CALL THE PITCH:', 20, 150);

        for (let i = 0; i < this.repertoire.length; i++) {
            const pitchId = this.repertoire[i];
            const pt = PITCH_TYPES[pitchId];
            const bx = 20;
            const by = 160 + i * 50;

            const mx = this.game.input.mouse.x;
            const my = this.game.input.mouse.y;
            const hovered = UIRenderer.isPointInRect(mx, my, bx, by, 160, 40);

            ctx.fillStyle = hovered ? 'rgba(68,170,255,0.2)' : 'rgba(255,255,255,0.05)';
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
        ctx.strokeStyle = 'rgba(255,255,255,0.25)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(sz.x, sz.y, sz.width, sz.height);
        ctx.setLineDash([]);
    }

    _drawMitt(ctx) {
        const x = this.mittCursor.x;
        const y = this.mittCursor.y;

        // Glove shape (brown circle with pocket)
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.arc(x, y, 22, 0, Math.PI * 2);
        ctx.fill();

        // Glove pocket
        ctx.fillStyle = '#654321';
        ctx.beginPath();
        ctx.arc(x + 2, y + 2, 14, 0, Math.PI * 2);
        ctx.fill();

        // Webbing lines
        ctx.strokeStyle = '#A0522D';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x - 10, y - 15);
        ctx.lineTo(x + 10, y - 15);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x - 15, y - 5);
        ctx.lineTo(x + 15, y - 5);
        ctx.stroke();
    }

    _drawCatchQuality(ctx) {
        let qualityText = '';
        let qualityColor = '#FFF';

        switch (this.catchResult) {
            case 'perfect_catch':
                qualityText = this.framingBonus ? 'PERFECT FRAME!' : 'PERFECT CATCH!';
                qualityColor = '#44FF44';
                break;
            case 'good_catch':
                qualityText = 'GOOD CATCH';
                qualityColor = '#88FF88';
                break;
            case 'poor_catch':
                qualityText = 'SLOPPY CATCH';
                qualityColor = '#FFAA44';
                break;
            case 'passed_ball':
                qualityText = 'PASSED BALL!';
                qualityColor = '#FF4444';
                break;
        }

        ctx.fillStyle = qualityColor;
        ctx.font = 'bold 16px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(qualityText, CANVAS_WIDTH / 2, 240);
    }
}
