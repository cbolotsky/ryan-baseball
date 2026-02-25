import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../utils/constants.js';
import { UIRenderer } from '../rendering/UIRenderer.js';
import { OPPONENT_TEAMS, generateOpponentRoster } from '../data/teams.js';
import { Team } from '../entities/Team.js';
import { Player } from '../entities/Player.js';
import { Audio } from '../engine/Audio.js';
import { LeaderboardManager } from '../systems/LeaderboardManager.js';
import { SaveManager } from '../systems/SaveManager.js';

export class WorldSeriesScene {
    constructor(game) {
        this.game = game;
        this.hoveredButton = -1;
        this.animTimer = 0;

        // Best-of-7 series
        this.series = { playerWins: 0, opponentWins: 0, games: [] };
        this.seriesComplete = false;
        this.playerWon = false;

        // Pick the toughest team as WS opponent
        this.wsOpponent = [...OPPONENT_TEAMS].sort((a, b) => b.difficulty - a.difficulty)[0];

        this.phase = 'intro'; // 'intro', 'playing', 'result'
    }

    onEnter() {}

    update(dt) {
        this.animTimer += dt;
        const mx = this.game.input.mouse.x;
        const my = this.game.input.mouse.y;
        this.hoveredButton = -1;

        if (this.phase === 'intro') {
            if (UIRenderer.isPointInRect(mx, my, CANVAS_WIDTH / 2 - 110, 500, 220, 50)) {
                this.hoveredButton = 0;
            }
            if (this.game.input.isMouseJustPressed() && this.hoveredButton === 0) {
                Audio.uiClick();
                this.phase = 'playing';
            }
        } else if (this.phase === 'playing') {
            if (UIRenderer.isPointInRect(mx, my, CANVAS_WIDTH / 2 - 110, CANVAS_HEIGHT - 70, 220, 50)) {
                this.hoveredButton = 1;
            }
            if (this.game.input.isMouseJustPressed() && this.hoveredButton === 1) {
                Audio.uiClick();
                this._playNextGame();
            }
        } else if (this.phase === 'result') {
            if (UIRenderer.isPointInRect(mx, my, CANVAS_WIDTH / 2 - 110, CANVAS_HEIGHT - 70, 220, 50)) {
                this.hoveredButton = 2;
            }
            if (this.game.input.isMouseJustPressed() && this.hoveredButton === 2) {
                Audio.uiClick();
                this._finish();
            }
        }
    }

    _playNextGame() {
        // Generate opponent
        const oppTeam = new Team(
            this.wsOpponent.name,
            this.wsOpponent.abbreviation,
            this.wsOpponent.colors,
        );
        const oppRoster = generateOpponentRoster(this.wsOpponent);
        for (const data of oppRoster) {
            oppTeam.addPlayer(new Player(data));
        }
        oppTeam.autoLineup();

        const playerTeam = this.game.playerTeam;
        playerTeam.positionFielders();

        // Start game - use catcher by default for WS games
        const { GameScene } = await_import_game();
        const gameScene = new GameScene(this.game, playerTeam, oppTeam, 'C');
        gameScene._worldSeries = this; // link back
        gameScene._seasonGameIndex = -1; // no season game
        this.game.sceneManager.transitionTo(gameScene);
    }

    // Called from PostGameScene when returning from a WS game
    recordWSGameResult(won, homeScore, awayScore) {
        this.series.games.push({ won, homeScore, awayScore });
        if (won) {
            this.series.playerWins++;
        } else {
            this.series.opponentWins++;
        }

        if (this.series.playerWins >= 4) {
            this.seriesComplete = true;
            this.playerWon = true;
            this.phase = 'result';

            // Big money bonus
            if (this.game.economyManager) {
                this.game.economyManager.earn(10000, 'World Series Champion!');
            }
        } else if (this.series.opponentWins >= 4) {
            this.seriesComplete = true;
            this.playerWon = false;
            this.phase = 'result';
        }
    }

    _finish() {
        // Submit to leaderboard
        const record = this.game.seasonManager.getPlayerRecord();
        const config = this.game.seasonConfig || {};
        LeaderboardManager.submitLeagueResult({
            leagueName: config.leagueName || 'Unknown League',
            wins: record.wins,
            losses: record.losses,
            gamesPlayed: record.wins + record.losses,
            worldSeriesWins: this.playerWon ? 1 : 0,
            totalMoney: this.game.economyManager ? this.game.economyManager.balance : 0,
            inningsPerGame: config.innings || 9,
            gamesPerSeason: config.seasonGames || 16,
        });

        // Clear save since season is over
        SaveManager.deleteSave();

        const { TitleScene } = await_import_title();
        this.game.sceneManager.transitionTo(new TitleScene(this.game));
    }

    render(ctx) {
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        if (this.phase === 'intro') {
            this._renderIntro(ctx);
        } else if (this.phase === 'playing') {
            this._renderPlaying(ctx);
        } else if (this.phase === 'result') {
            this._renderResult(ctx);
        }
    }

    _renderIntro(ctx) {
        // Trophy / celebration graphic
        const glow = Math.sin(this.animTimer * 3) * 0.3 + 0.7;
        ctx.save();
        ctx.globalAlpha = glow;
        UIRenderer.drawText(ctx, '\u2605 WORLD SERIES \u2605', CANVAS_WIDTH / 2, 100, {
            font: 'bold 48px monospace', color: '#FFD700', shadow: true, shadowOffset: 4,
        });
        ctx.restore();

        UIRenderer.drawText(ctx, 'BEST OF 7', CANVAS_WIDTH / 2, 170, {
            font: 'bold 24px monospace', color: '#FFF',
        });

        // Matchup
        UIRenderer.drawPanel(ctx, CANVAS_WIDTH / 2 - 250, 220, 500, 120, {
            bgColor: 'rgba(20,20,30,0.9)', borderColor: '#FFD700', borderWidth: 3,
        });

        UIRenderer.drawText(ctx, 'Old Bridge Lightning', CANVAS_WIDTH / 2, 260, {
            font: 'bold 22px monospace', color: '#FFD700',
        });
        UIRenderer.drawText(ctx, 'vs', CANVAS_WIDTH / 2, 295, {
            font: '18px monospace', color: '#888',
        });
        UIRenderer.drawText(ctx, this.wsOpponent.name, CANVAS_WIDTH / 2, 325, {
            font: 'bold 22px monospace', color: '#FF4444',
        });

        // Record from season
        const record = this.game.seasonManager.getPlayerRecord();
        UIRenderer.drawText(ctx, `Season Record: ${record.wins}-${record.losses}`, CANVAS_WIDTH / 2, 400, {
            font: '16px monospace', color: '#AAA',
        });

        UIRenderer.drawText(ctx, 'Win 4 games to become World Champions!', CANVAS_WIDTH / 2, 440, {
            font: '14px monospace', color: '#888',
        });

        UIRenderer.drawButton(ctx, CANVAS_WIDTH / 2 - 110, 500, 220, 50, 'START SERIES', this.hoveredButton === 0, {
            normal: '#1a1a00', hover: '#333300', text: '#FFD700', border: '#FFD700',
        });
    }

    _renderPlaying(ctx) {
        UIRenderer.drawText(ctx, 'WORLD SERIES', CANVAS_WIDTH / 2, 40, {
            font: 'bold 36px monospace', color: '#FFD700', shadow: true, shadowOffset: 3,
        });

        // Series score
        UIRenderer.drawPanel(ctx, CANVAS_WIDTH / 2 - 200, 70, 400, 80, {
            bgColor: 'rgba(20,20,30,0.9)', borderColor: '#FFD700',
        });

        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.font = 'bold 14px monospace';
        ctx.fillStyle = '#FFD700';
        ctx.fillText('OBL', CANVAS_WIDTH / 2 - 80, 95);
        ctx.font = 'bold 40px monospace';
        ctx.fillText(String(this.series.playerWins), CANVAS_WIDTH / 2 - 80, 130);

        ctx.fillStyle = '#888';
        ctx.font = '16px monospace';
        ctx.fillText('-', CANVAS_WIDTH / 2, 120);

        ctx.font = 'bold 14px monospace';
        ctx.fillStyle = '#FF4444';
        ctx.fillText(this.wsOpponent.abbreviation, CANVAS_WIDTH / 2 + 80, 95);
        ctx.font = 'bold 40px monospace';
        ctx.fillText(String(this.series.opponentWins), CANVAS_WIDTH / 2 + 80, 130);
        ctx.restore();

        // Game results
        for (let i = 0; i < this.series.games.length; i++) {
            const g = this.series.games[i];
            const y = 180 + i * 35;
            ctx.save();
            ctx.font = '14px monospace';
            ctx.textAlign = 'center';
            ctx.fillStyle = g.won ? '#44FF44' : '#FF4444';
            ctx.fillText(
                `Game ${i + 1}: ${g.won ? 'W' : 'L'} ${g.homeScore}-${g.awayScore}`,
                CANVAS_WIDTH / 2, y,
            );
            ctx.restore();
        }

        UIRenderer.drawButton(ctx, CANVAS_WIDTH / 2 - 110, CANVAS_HEIGHT - 70, 220, 50, `PLAY GAME ${this.series.games.length + 1}`, this.hoveredButton === 1, {
            normal: '#1a1a00', hover: '#333300', text: '#FFD700', border: '#FFD700',
        });
    }

    _renderResult(ctx) {
        if (this.playerWon) {
            // Celebration!
            const glow = Math.sin(this.animTimer * 4) * 0.3 + 0.7;
            ctx.save();
            ctx.globalAlpha = glow;

            // Fireworks effect
            for (let i = 0; i < 20; i++) {
                const fx = Math.sin(this.animTimer * 2 + i * 0.7) * 400 + CANVAS_WIDTH / 2;
                const fy = Math.cos(this.animTimer * 1.5 + i * 0.5) * 200 + 300;
                const colors = ['#FFD700', '#FF4444', '#44FF44', '#4488FF', '#FF44FF'];
                ctx.fillStyle = colors[i % colors.length];
                ctx.beginPath();
                ctx.arc(fx, fy, 3 + Math.sin(this.animTimer * 5 + i) * 2, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();

            UIRenderer.drawText(ctx, '\u2605 WORLD CHAMPIONS! \u2605', CANVAS_WIDTH / 2, 150, {
                font: 'bold 48px monospace', color: '#FFD700', shadow: true, shadowOffset: 4,
            });

            UIRenderer.drawText(ctx, 'OLD BRIDGE LIGHTNING', CANVAS_WIDTH / 2, 220, {
                font: 'bold 32px monospace', color: '#FFF', shadow: true, shadowOffset: 3,
            });

            UIRenderer.drawText(ctx, `Series: ${this.series.playerWins}-${this.series.opponentWins}`, CANVAS_WIDTH / 2, 280, {
                font: '20px monospace', color: '#AAA',
            });

            UIRenderer.drawText(ctx, '+$10,000 BONUS!', CANVAS_WIDTH / 2, 340, {
                font: 'bold 24px monospace', color: '#44FF44',
            });
        } else {
            UIRenderer.drawText(ctx, 'SEASON OVER', CANVAS_WIDTH / 2, 150, {
                font: 'bold 48px monospace', color: '#FF4444', shadow: true, shadowOffset: 4,
            });

            UIRenderer.drawText(ctx, `Lost the World Series ${this.series.playerWins}-${this.series.opponentWins}`, CANVAS_WIDTH / 2, 230, {
                font: '20px monospace', color: '#AAA',
            });

            UIRenderer.drawText(ctx, 'Better luck next season!', CANVAS_WIDTH / 2, 280, {
                font: '16px monospace', color: '#888',
            });
        }

        UIRenderer.drawButton(ctx, CANVAS_WIDTH / 2 - 110, CANVAS_HEIGHT - 70, 220, 50, 'MAIN MENU', this.hoveredButton === 2, {
            normal: '#1a1a1a', hover: '#333', text: '#FFD700', border: '#FFD700',
        });
    }
}

// Lazy imports
function await_import_game() { return { GameScene: WorldSeriesScene._GameScene }; }
function await_import_title() { return { TitleScene: WorldSeriesScene._TitleScene }; }
WorldSeriesScene._GameScene = null;
WorldSeriesScene._TitleScene = null;
