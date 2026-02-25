import { CANVAS_WIDTH, CANVAS_HEIGHT, FIELDER_POSITIONS, TEAM_COLORS } from '../utils/constants.js';
import { setCameraImmediate, setCamera } from '../utils/perspective.js';
import { FieldRenderer } from '../rendering/FieldRenderer.js';
import { PlayerRenderer } from '../rendering/PlayerRenderer.js';
import { BallRenderer } from '../rendering/BallRenderer.js';
import { UIRenderer } from '../rendering/UIRenderer.js';
import { ParticleSystem } from '../rendering/ParticleSystem.js';
import { Audio } from '../engine/Audio.js';
import { Player } from '../entities/Player.js';
import { Team } from '../entities/Team.js';
import { Ball } from '../entities/Ball.js';
import { GameState } from '../gameplay/GameState.js';
import { BattingPhase } from '../gameplay/BattingPhase.js';
import { PitchingPhase } from '../gameplay/PitchingPhase.js';
import { CatchingPhase } from '../gameplay/CatchingPhase.js';

export class GameScene {
    constructor(game, homeTeam, awayTeam, playerPosition = 'C') {
        this.game = game;
        this.homeTeam = homeTeam;
        this.awayTeam = awayTeam;
        this.playerPosition = playerPosition; // position the user is playing

        this.fieldRenderer = new FieldRenderer();
        this.ball = new Ball();
        this.ballTrail = [];

        const innings = (game.seasonConfig && game.seasonConfig.innings) || 9;
        this.gameState = new GameState(homeTeam, awayTeam, innings);

        // Current phase
        this.phase = null; // BattingPhase, PitchingPhase, CatchingPhase, FieldingPhase
        this.phaseType = 'idle'; // 'batting', 'pitching', 'catching', 'fielding', 'sim', 'idle'

        // Announcement
        this.announcement = '';
        this.announcementTimer = 0;

        // Is the player's team currently batting?
        this.isPlayerBatting = false;

        // Particle system
        this.particles = new ParticleSystem();

        // Screen shake
        this.shakeIntensity = 0;
        this.shakeTimer = 0;
    }

    onEnter() {
        // Position fielders
        this.homeTeam.positionFielders();
        this.awayTeam.positionFielders();

        this._startNextAtBat();
    }

    _startNextAtBat() {
        if (this.gameState.isGameOver()) {
            this._endGame();
            return;
        }

        const battingTeam = this.gameState.getBattingTeam();
        const fieldingTeam = this.gameState.getFieldingTeam();
        this.isPlayerBatting = (battingTeam === this.homeTeam);

        // Announce batter
        const batter = this.gameState.getCurrentBatter();
        if (batter) {
            this.announcement = `Now batting: ${batter.name} #${batter.number}`;
            this.announcementTimer = 2;
        }

        // Position the fielding team on the field
        fieldingTeam.positionFielders();

        if (this.isPlayerBatting) {
            // Player's team is batting — use BattingPhase
            this.phaseType = 'batting';
            this.phase = new BattingPhase(this);
            this.phase.enter();
            setCameraImmediate('batting');
        } else {
            // Player's team is fielding — choose phase based on player's position
            if (this.playerPosition === 'P' || this.playerPosition === 'SP' || this.playerPosition === 'RP') {
                // Player is pitcher
                this.phaseType = 'pitching';
                this.phase = new PitchingPhase(this);
                this.phase.enter();
                setCameraImmediate('pitching');
            } else if (this.playerPosition === 'C') {
                // Player is catcher
                this.phaseType = 'catching';
                this.phase = new CatchingPhase(this);
                this.phase.enter();
                setCameraImmediate('batting'); // catcher sees same view as batter
            } else {
                // Player is a fielder — simulate the at-bat, player throws after hit
                this.phaseType = 'sim';
                this.phase = null;
                setCameraImmediate('field');
                this._simulateAtBat();
            }
        }
    }

    _simulateAtBat() {
        // Quick AI vs AI simulation
        const pitcher = this.gameState.getCurrentPitcher();
        const batter = this.gameState.getCurrentBatter();

        if (!pitcher || !batter) {
            this.gameState.recordOut('auto');
            this._afterAtBat();
            return;
        }

        const pitcherRating = (pitcher.stats.pitchSpeed + pitcher.stats.pitchControl + pitcher.stats.pitchBreak) / 3;
        const batterRating = (batter.stats.power + batter.stats.contact) / 2;
        const advantage = (batterRating - pitcherRating) / 100;

        const outcomes = {
            strikeout: Math.max(0.05, 0.20 - advantage * 0.08),
            walk: Math.max(0.03, 0.08 + advantage * 0.03),
            single: Math.max(0.05, 0.18 + advantage * 0.06),
            double: Math.max(0.02, 0.05 + advantage * 0.03),
            triple: Math.max(0.005, 0.01 + advantage * 0.005),
            home_run: Math.max(0.01, 0.03 + advantage * 0.04),
            ground_out: Math.max(0.05, 0.22 - advantage * 0.03),
            fly_out: Math.max(0.05, 0.18 - advantage * 0.03),
            line_out: 0.05,
        };

        const totalWeight = Object.values(outcomes).reduce((a, b) => a + b, 0);
        let roll = Math.random() * totalWeight;
        let result = 'ground_out';
        for (const [key, weight] of Object.entries(outcomes)) {
            roll -= weight;
            if (roll <= 0) {
                result = key;
                break;
            }
        }

        // Process result
        switch (result) {
            case 'strikeout':
                this.gameState.recordOut('strikeout');
                this.announcement = `${batter.name} strikes out!`;
                if (pitcher) pitcher.seasonStats.pitcherStrikeouts++;
                batter.seasonStats.atBats++;
                break;
            case 'walk':
                this.gameState.recordWalk();
                this.announcement = `${batter.name} walks`;
                break;
            case 'single':
                batter.seasonStats.hits++;
                batter.seasonStats.atBats++;
                this.gameState.recordHit(1);
                this.announcement = `${batter.name} singles!`;
                break;
            case 'double':
                batter.seasonStats.hits++;
                batter.seasonStats.doubles++;
                batter.seasonStats.atBats++;
                this.gameState.recordHit(2);
                this.announcement = `${batter.name} doubles!`;
                break;
            case 'triple':
                batter.seasonStats.hits++;
                batter.seasonStats.triples++;
                batter.seasonStats.atBats++;
                this.gameState.recordHit(3);
                this.announcement = `${batter.name} triples!`;
                break;
            case 'home_run':
                batter.seasonStats.hits++;
                batter.seasonStats.homeRuns++;
                batter.seasonStats.atBats++;
                this.gameState.recordHit(4);
                this.announcement = `${batter.name} hits a HOME RUN!`;
                break;
            case 'ground_out':
            case 'fly_out':
            case 'line_out':
                batter.seasonStats.atBats++;
                this.gameState.recordOut(result);
                this.announcement = `${batter.name} ${result.replace('_', ' ')}`;
                break;
        }

        this.announcementTimer = 1.5;

        // Play sounds for sim results
        if (result === 'home_run') {
            Audio.batCrack(1.0);
            Audio.homeRunFanfare();
            this.triggerShake(8, 0.4);
            this.particles.fireworks(CANVAS_WIDTH / 2, 200, 30);
        } else if (result === 'strikeout') {
            Audio.strikeCall();
            this.particles.strikeoutEffect(CANVAS_WIDTH / 2, 250);
        } else if (result === 'single' || result === 'double' || result === 'triple') {
            Audio.batCrack(0.5 + Math.random() * 0.3);
        } else if (result === 'ground_out' || result === 'fly_out' || result === 'line_out') {
            Audio.outCall();
        }

        // After a delay, move to next at-bat
        setTimeout(() => this._afterAtBat(), 1500);
    }

    _afterAtBat() {
        if (this.gameState.isGameOver()) {
            this._endGame();
        } else {
            this._startNextAtBat();
        }
    }

    onAtBatComplete() {
        // Called by BattingPhase when an at-bat result is final
        this._afterAtBat();
    }

    triggerShake(intensity, duration) {
        this.shakeIntensity = intensity;
        this.shakeTimer = duration;
    }

    _endGame() {
        const winner = this.gameState.getWinner();
        this.announcement = winner === 'home'
            ? `${this.homeTeam.name} wins!`
            : `${this.awayTeam.name} wins!`;
        this.announcementTimer = 3;
        this.phaseType = 'game_over';

        // Victory sounds + particles
        if (winner === 'home') {
            Audio.crowdCheer(1.0);
            this.particles.fireworks(CANVAS_WIDTH / 2, 200, 40);
            this.particles.fireworks(CANVAS_WIDTH / 3, 250, 20);
            this.particles.fireworks(CANVAS_WIDTH * 2 / 3, 250, 20);
        }

        // Transition to PostGameScene after a delay
        setTimeout(() => {
            const PostGameScene = GameScene._PostGameScene;
            if (PostGameScene) {
                const seasonIdx = this._seasonGameIndex !== undefined ? this._seasonGameIndex : -1;
                const postScene = new PostGameScene(
                    this.game, this.gameState, seasonIdx,
                    this.homeTeam, this.awayTeam,
                );
                this.game.sceneManager.transitionTo(postScene);
            }
        }, 3000);
    }

    update(dt) {
        // Update ball
        this.ball.update(dt);

        // Store trail
        if (this.ball.active && this.ball.inFlight) {
            this.ballTrail.push({ ...this.ball.pos });
            if (this.ballTrail.length > 10) this.ballTrail.shift();
        }

        // Update players
        for (const p of this.homeTeam.lineup) p.update(dt);
        for (const p of this.awayTeam.lineup) p.update(dt);

        // Update current phase
        if (this.phase) {
            this.phase.update(dt);
        }

        // Announcement timer
        if (this.announcementTimer > 0) {
            this.announcementTimer -= dt;
        }

        // Screen shake
        if (this.shakeTimer > 0) {
            this.shakeTimer -= dt;
        }

        // Particles
        this.particles.update(dt);
    }

    render(ctx) {
        // Apply screen shake
        const shake = ParticleSystem.shakeOffset(this.shakeIntensity, this.shakeTimer);
        if (shake.x !== 0 || shake.y !== 0) {
            ctx.save();
            ctx.translate(shake.x, shake.y);
        }

        // Draw field
        this.fieldRenderer.render(ctx);

        // Draw fielders (fielding team)
        const fieldingTeam = this.gameState.getFieldingTeam();
        PlayerRenderer.drawFielders(ctx, fieldingTeam.lineup, fieldingTeam.colors);

        // Draw base runners (batting team)
        const battingTeam = this.gameState.getBattingTeam();
        PlayerRenderer.drawBaseRunners(ctx, this.gameState.bases, battingTeam.colors);

        // Ball
        BallRenderer.drawBallTrail(ctx, this.ballTrail);
        BallRenderer.drawBall(ctx, this.ball);

        // Draw phase-specific UI
        if (this.phase) {
            this.phase.render(ctx);
        }

        // Scoreboard
        UIRenderer.drawScoreboard(ctx, this.gameState);

        // Base runner diamond
        UIRenderer.drawBaseRunnerDiamond(ctx, CANVAS_WIDTH - 60, 90, this.gameState.bases);

        // Count display
        this._drawCount(ctx);

        // Announcement
        if (this.announcementTimer > 0 && this.announcement) {
            const alpha = Math.min(1, this.announcementTimer);
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.font = 'bold 14px monospace';
            const tw = ctx.measureText(this.announcement).width;
            ctx.fillRect(CANVAS_WIDTH / 2 - tw / 2 - 15, 260, tw + 30, 30);
            ctx.fillStyle = '#FFD700';
            ctx.font = 'bold 14px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.announcement, CANVAS_WIDTH / 2, 275);
            ctx.restore();
        }

        // Particles
        this.particles.render(ctx);

        // Inning / phase info
        ctx.fillStyle = '#FFF';
        ctx.font = '12px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`Phase: ${this.phaseType}`, 10, CANVAS_HEIGHT - 10);

        // Close shake transform
        if (shake.x !== 0 || shake.y !== 0) {
            ctx.restore();
        }
    }

    _drawCount(ctx) {
        const x = CANVAS_WIDTH - 120;
        const y = 140;

        UIRenderer.drawPanel(ctx, x - 10, y - 5, 110, 55, { bgColor: 'rgba(0,0,0,0.7)', borderWidth: 1 });

        ctx.font = 'bold 13px monospace';
        ctx.textAlign = 'left';

        // Balls
        ctx.fillStyle = '#44FF44';
        ctx.fillText('B', x, y + 12);
        for (let i = 0; i < 4; i++) {
            ctx.fillStyle = i < this.gameState.count.balls ? '#44FF44' : '#333';
            ctx.beginPath();
            ctx.arc(x + 20 + i * 16, y + 9, 5, 0, Math.PI * 2);
            ctx.fill();
        }

        // Strikes
        ctx.fillStyle = '#FF4444';
        ctx.fillText('S', x, y + 30);
        for (let i = 0; i < 3; i++) {
            ctx.fillStyle = i < this.gameState.count.strikes ? '#FF4444' : '#333';
            ctx.beginPath();
            ctx.arc(x + 20 + i * 16, y + 27, 5, 0, Math.PI * 2);
            ctx.fill();
        }

        // Outs
        ctx.fillStyle = '#FFAA00';
        ctx.fillText('O', x, y + 48);
        for (let i = 0; i < 3; i++) {
            ctx.fillStyle = i < this.gameState.outs ? '#FFAA00' : '#333';
            ctx.beginPath();
            ctx.arc(x + 20 + i * 16, y + 45, 5, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

// Set by main.js
GameScene._PostGameScene = null;
GameScene._WorldSeriesScene = null;
