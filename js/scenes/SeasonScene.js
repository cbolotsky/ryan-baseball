import { CANVAS_WIDTH, CANVAS_HEIGHT, GAME_SETTINGS } from '../utils/constants.js';
import { UIRenderer } from '../rendering/UIRenderer.js';
import { Audio } from '../engine/Audio.js';
import { SaveManager } from '../systems/SaveManager.js';
import { LeaderboardManager } from '../systems/LeaderboardManager.js';

export class SeasonScene {
    constructor(game) {
        this.game = game;
        this.season = game.seasonManager;
        this.hoveredButton = -1;
        this.hoveredGame = -1;
        this.tab = 'schedule'; // 'schedule' or 'standings'
        this.scrollOffset = 0;
    }

    onEnter() {}

    update(dt) {
        const mx = this.game.input.mouse.x;
        const my = this.game.input.mouse.y;
        this.hoveredButton = -1;
        this.hoveredGame = -1;

        // Tab buttons
        if (UIRenderer.isPointInRect(mx, my, 440, 55, 120, 35)) {
            this.hoveredButton = 10; // schedule tab
        }
        if (UIRenderer.isPointInRect(mx, my, 580, 55, 120, 35)) {
            this.hoveredButton = 11; // standings tab
        }

        if (this.tab === 'schedule') {
            // Game entries
            for (let i = 0; i < this.season.schedule.length; i++) {
                const row = i;
                const y = 120 + row * 38;
                if (y > CANVAS_HEIGHT - 100) break;
                if (mx >= 140 && mx <= 900 && my >= y && my <= y + 34) {
                    this.hoveredGame = i;
                }
            }
        }

        // Bottom buttons
        if (UIRenderer.isPointInRect(mx, my, 30, CANVAS_HEIGHT - 65, 160, 45)) {
            this.hoveredButton = 0; // Team
        }
        if (UIRenderer.isPointInRect(mx, my, 210, CANVAS_HEIGHT - 65, 160, 45)) {
            this.hoveredButton = 1; // Shop
        }

        // Play Next Game button
        const nextGame = this.season.getNextUnplayedGame();
        if (nextGame && UIRenderer.isPointInRect(mx, my, CANVAS_WIDTH - 250, CANVAS_HEIGHT - 65, 220, 45)) {
            this.hoveredButton = 2; // Play next
        }

        // World Series button (if qualified and season over)
        if (this.season.seasonOver && this.season.qualifiesForWorldSeries()) {
            if (UIRenderer.isPointInRect(mx, my, CANVAS_WIDTH / 2 - 120, CANVAS_HEIGHT - 65, 240, 45)) {
                this.hoveredButton = 3;
            }
        }

        // SAVE & EXIT button (top-right area, always available)
        if (UIRenderer.isPointInRect(mx, my, CANVAS_WIDTH - 170, 8, 150, 35)) {
            this.hoveredButton = 4;
        }

        // MAIN MENU button (season over, didn't qualify)
        if (this.season.seasonOver && !this.season.qualifiesForWorldSeries()) {
            if (UIRenderer.isPointInRect(mx, my, CANVAS_WIDTH / 2 - 110, CANVAS_HEIGHT - 65, 220, 45)) {
                this.hoveredButton = 5;
            }
        }

        if (this.game.input.isMouseJustPressed()) {
            if (this.hoveredButton >= 0 || this.hoveredGame >= 0) Audio.uiClick();
            if (this.hoveredButton === 10) this.tab = 'schedule';
            else if (this.hoveredButton === 11) this.tab = 'standings';
            else if (this.hoveredButton === 0) this._goToTeam();
            else if (this.hoveredButton === 1) this._goToShop();
            else if (this.hoveredButton === 2) this._playNextGame();
            else if (this.hoveredButton === 3) this._goToWorldSeries();
            else if (this.hoveredButton === 4) this._saveAndExit();
            else if (this.hoveredButton === 5) this._endSeasonMainMenu();
            else if (this.hoveredGame >= 0) {
                const game = this.season.schedule[this.hoveredGame];
                if (!game.played) this._playGame(this.hoveredGame);
            }
        }
    }

    _goToTeam() {
        const { TeamScene } = await_import_team();
        this.game.sceneManager.transitionTo(new TeamScene(this.game));
    }

    _goToShop() {
        const { ShopScene } = await_import_shop();
        this.game.sceneManager.transitionTo(new ShopScene(this.game));
    }

    _playNextGame() {
        const nextGame = this.season.getNextUnplayedGame();
        if (nextGame) {
            const idx = this.season.schedule.indexOf(nextGame);
            this._playGame(idx);
        }
    }

    _playGame(gameIndex) {
        const { PreGameScene } = await_import_pregame();
        this.game.sceneManager.transitionTo(new PreGameScene(this.game, gameIndex));
    }

    _goToWorldSeries() {
        const { WorldSeriesScene } = await_import_ws();
        this.game.sceneManager.transitionTo(new WorldSeriesScene(this.game));
    }

    _saveAndExit() {
        try {
            SaveManager.save(SaveManager.serializeGameState(this.game));
        } catch (e) {
            console.error('Save failed:', e);
        }
        const TitleScene = SeasonScene._TitleScene;
        if (TitleScene) {
            this.game.sceneManager.transitionTo(new TitleScene(this.game));
        }
    }

    _endSeasonMainMenu() {
        // Submit to leaderboard before going to main menu
        const record = this.season.getPlayerRecord();
        const config = this.game.seasonConfig || {};
        LeaderboardManager.submitLeagueResult({
            leagueName: config.leagueName || 'Unknown League',
            wins: record.wins,
            losses: record.losses,
            gamesPlayed: record.wins + record.losses,
            worldSeriesWins: 0,
            totalMoney: this.game.economyManager ? this.game.economyManager.balance : 0,
            inningsPerGame: config.innings || 9,
            gamesPerSeason: config.seasonGames || 16,
        });

        // Clear save since season is over
        SaveManager.deleteSave();

        const TitleScene = SeasonScene._TitleScene;
        if (TitleScene) {
            this.game.sceneManager.transitionTo(new TitleScene(this.game));
        }
    }

    render(ctx) {
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Header - show league name if available
        const leagueName = (this.game.seasonConfig && this.game.seasonConfig.leagueName) || 'SEASON';
        UIRenderer.drawText(ctx, leagueName, CANVAS_WIDTH / 2, 28, {
            font: 'bold 32px monospace', color: '#FFD700', shadow: true, shadowOffset: 3,
        });

        // SAVE & EXIT button (top-right)
        UIRenderer.drawButton(ctx, CANVAS_WIDTH - 170, 8, 150, 35, 'SAVE & EXIT', this.hoveredButton === 4, {
            normal: '#1a1a1a', hover: '#333', text: '#FF8844', border: '#FF8844',
        });

        // Record
        const record = this.season.getPlayerRecord();
        UIRenderer.drawText(ctx, `${record.wins}-${record.losses}`, 120, 28, {
            font: 'bold 24px monospace', color: '#FFF',
        });

        // Money
        if (this.game.economyManager) {
            UIRenderer.drawText(ctx, `$${this.game.economyManager.balance}`, CANVAS_WIDTH - 80, 28, {
                font: 'bold 18px monospace', color: '#44FF44',
            });
        }

        // Tabs
        const schedTabActive = this.tab === 'schedule';
        UIRenderer.drawButton(ctx, 440, 55, 120, 35, 'SCHEDULE', this.hoveredButton === 10 || schedTabActive, {
            normal: schedTabActive ? '#333' : '#1a1a1a',
            hover: '#444',
            text: schedTabActive ? '#FFD700' : '#888',
            border: schedTabActive ? '#FFD700' : '#444',
        });
        UIRenderer.drawButton(ctx, 580, 55, 120, 35, 'STANDINGS', this.hoveredButton === 11 || !schedTabActive, {
            normal: !schedTabActive ? '#333' : '#1a1a1a',
            hover: '#444',
            text: !schedTabActive ? '#FFD700' : '#888',
            border: !schedTabActive ? '#FFD700' : '#444',
        });

        if (this.tab === 'schedule') {
            this._renderSchedule(ctx);
        } else {
            this._renderStandings(ctx);
        }

        // Bottom nav buttons
        UIRenderer.drawButton(ctx, 30, CANVAS_HEIGHT - 65, 160, 45, 'TEAM', this.hoveredButton === 0, {
            normal: '#1a1a1a', hover: '#333', text: '#FFF', border: '#666',
        });
        UIRenderer.drawButton(ctx, 210, CANVAS_HEIGHT - 65, 160, 45, 'SHOP', this.hoveredButton === 1, {
            normal: '#1a1a1a', hover: '#333', text: '#44FF44', border: '#44FF44',
        });

        const nextGame = this.season.getNextUnplayedGame();
        if (nextGame && !this.season.seasonOver) {
            UIRenderer.drawButton(ctx, CANVAS_WIDTH - 250, CANVAS_HEIGHT - 65, 220, 45, 'PLAY NEXT GAME', this.hoveredButton === 2, {
                normal: '#1a1a00', hover: '#333300', text: '#FFD700', border: '#FFD700',
            });
        }

        // World Series button
        if (this.season.seasonOver) {
            if (this.season.qualifiesForWorldSeries()) {
                UIRenderer.drawButton(ctx, CANVAS_WIDTH / 2 - 120, CANVAS_HEIGHT - 65, 240, 45, 'WORLD SERIES!', this.hoveredButton === 3, {
                    normal: '#1a1a00', hover: '#333300', text: '#FFD700', border: '#FFD700',
                });
            } else {
                UIRenderer.drawText(ctx, 'Season over - did not qualify for World Series', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 100, {
                    font: '16px monospace', color: '#FF4444',
                });
                UIRenderer.drawButton(ctx, CANVAS_WIDTH / 2 - 110, CANVAS_HEIGHT - 65, 220, 45, 'MAIN MENU', this.hoveredButton === 5, {
                    normal: '#1a1a1a', hover: '#333', text: '#FFF', border: '#666',
                });
            }
        }

        // WS qualification info (dynamic threshold)
        const wsThreshold = typeof this.season.getWinsForWorldSeriesThreshold === 'function'
            ? this.season.getWinsForWorldSeriesThreshold()
            : GAME_SETTINGS.winsForWorldSeries;
        if (!this.season.seasonOver) {
            const needed = wsThreshold - record.wins;
            const remaining = this.season.getGamesRemaining();
            if (needed > 0 && needed <= remaining) {
                UIRenderer.drawText(ctx, `Need ${needed} more win${needed > 1 ? 's' : ''} for World Series (${remaining} games left)`, CANVAS_WIDTH / 2, CANVAS_HEIGHT - 100, {
                    font: '13px monospace', color: '#AAA',
                });
            } else if (needed <= 0) {
                UIRenderer.drawText(ctx, 'World Series Qualified!', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 100, {
                    font: 'bold 14px monospace', color: '#FFD700',
                });
            }
        }
    }

    _renderSchedule(ctx) {
        const schedule = this.season.schedule;
        const headerY = 100;

        ctx.save();
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#666';
        ctx.fillText('GAME', 170, headerY);
        ctx.fillText('OPPONENT', 420, headerY);
        ctx.fillText('DIFFICULTY', 650, headerY);
        ctx.fillText('RESULT', 820, headerY);
        ctx.restore();

        for (let i = 0; i < schedule.length; i++) {
            const game = schedule[i];
            const y = 120 + i * 38;
            if (y > CANVAS_HEIGHT - 110) break;

            const hovered = this.hoveredGame === i;
            const isNext = !game.played && this.season.getNextUnplayedGame() === game;
            const bgColor = isNext ? 'rgba(60,60,0,0.6)' : (hovered && !game.played ? 'rgba(40,40,40,0.6)' : 'rgba(15,15,25,0.5)');

            UIRenderer.drawPanel(ctx, 140, y, 760, 34, {
                bgColor,
                borderColor: isNext ? '#FFD700' : (hovered ? '#666' : '#222'),
                borderWidth: isNext ? 2 : 1,
            });

            ctx.save();
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';

            // Game number
            ctx.font = 'bold 14px monospace';
            ctx.fillStyle = '#888';
            ctx.fillText(`${game.gameNumber}`, 170, y + 17);

            // Opponent
            ctx.font = 'bold 14px monospace';
            ctx.fillStyle = '#FFF';
            ctx.fillText(game.opponent.name, 420, y + 17);

            // Difficulty stars
            const diff = game.opponent.difficulty;
            for (let d = 0; d < 7; d++) {
                ctx.fillStyle = d < diff ? '#FF6644' : '#333';
                ctx.fillRect(620 + d * 12, y + 12, 8, 8);
            }

            // Result
            if (game.played && game.result) {
                ctx.font = 'bold 14px monospace';
                if (game.result.won) {
                    ctx.fillStyle = '#44FF44';
                    ctx.fillText(`W ${game.result.homeScore}-${game.result.awayScore}`, 820, y + 17);
                } else {
                    ctx.fillStyle = '#FF4444';
                    ctx.fillText(`L ${game.result.homeScore}-${game.result.awayScore}`, 820, y + 17);
                }
            } else if (isNext) {
                ctx.font = 'bold 12px monospace';
                ctx.fillStyle = '#FFD700';
                ctx.fillText('NEXT', 820, y + 17);
            } else {
                ctx.font = '12px monospace';
                ctx.fillStyle = '#444';
                ctx.fillText('--', 820, y + 17);
            }

            ctx.restore();
        }
    }

    _renderStandings(ctx) {
        const standings = this.season.getSortedStandings();
        const headerY = 100;

        ctx.save();
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#666';
        ctx.fillText('#', 170, headerY);
        ctx.fillText('TEAM', 400, headerY);
        ctx.fillText('W', 650, headerY);
        ctx.fillText('L', 720, headerY);
        ctx.fillText('PCT', 800, headerY);
        ctx.restore();

        for (let i = 0; i < standings.length; i++) {
            const team = standings[i];
            const y = 115 + i * 36;
            const isPlayer = team.id === 'old_bridge_lightning';

            UIRenderer.drawPanel(ctx, 140, y, 720, 32, {
                bgColor: isPlayer ? 'rgba(60,60,0,0.6)' : 'rgba(15,15,25,0.5)',
                borderColor: isPlayer ? '#FFD700' : '#222',
                borderWidth: isPlayer ? 2 : 1,
            });

            ctx.save();
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';
            ctx.font = 'bold 14px monospace';

            ctx.fillStyle = '#888';
            ctx.fillText(String(i + 1), 170, y + 16);

            ctx.fillStyle = isPlayer ? '#FFD700' : '#FFF';
            ctx.fillText(team.name, 400, y + 16);

            ctx.fillStyle = '#44FF44';
            ctx.fillText(String(team.wins), 650, y + 16);

            ctx.fillStyle = '#FF4444';
            ctx.fillText(String(team.losses), 720, y + 16);

            ctx.fillStyle = '#FFF';
            ctx.fillText(team.pct, 800, y + 16);

            ctx.restore();
        }
    }
}

// Lazy imports
function await_import_team() { return { TeamScene: SeasonScene._TeamScene }; }
function await_import_shop() { return { ShopScene: SeasonScene._ShopScene }; }
function await_import_pregame() { return { PreGameScene: SeasonScene._PreGameScene }; }
function await_import_ws() { return { WorldSeriesScene: SeasonScene._WorldSeriesScene }; }
SeasonScene._TeamScene = null;
SeasonScene._ShopScene = null;
SeasonScene._PreGameScene = null;
SeasonScene._WorldSeriesScene = null;
SeasonScene._TitleScene = null;
