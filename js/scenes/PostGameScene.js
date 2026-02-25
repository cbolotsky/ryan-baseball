import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../utils/constants.js';
import { UIRenderer } from '../rendering/UIRenderer.js';
import { Audio } from '../engine/Audio.js';
import { SaveManager } from '../systems/SaveManager.js';

export class PostGameScene {
    constructor(game, gameState, seasonGameIndex, playerTeam, opponentTeam) {
        this.game = game;
        this.gameState = gameState;
        this.seasonGameIndex = seasonGameIndex;
        this.playerTeam = playerTeam;
        this.opponentTeam = opponentTeam;

        this.won = gameState.getWinner() === 'home';
        this.hoveredButton = -1;
        this.animTimer = 0;
        this.reward = null;

        // Calculate rewards
        this._processResult();
    }

    _processResult() {
        const gs = this.gameState;

        // Record in season
        if (this.game.seasonManager && this.seasonGameIndex >= 0) {
            this.game.seasonManager.recordGameResult(
                this.seasonGameIndex,
                this.won,
                gs.score.home,
                gs.score.away,
            );
        }

        // Update team record
        if (this.won) {
            this.playerTeam.record.wins++;
        } else {
            this.playerTeam.record.losses++;
        }

        // Calculate money reward
        if (this.game.economyManager) {
            // Collect stats for bonus
            const stats = {
                homeRuns: 0,
                strikeouts: 0,
            };
            for (const p of this.playerTeam.roster) {
                stats.homeRuns += p.seasonStats.homeRuns;
                stats.strikeouts += p.seasonStats.pitcherStrikeouts;
            }
            this.reward = this.game.economyManager.awardGameReward(this.won, stats);
        }

        // Auto-save after every game
        try {
            SaveManager.save(SaveManager.serializeGameState(this.game));
        } catch (e) {
            console.error('Auto-save failed:', e);
        }
    }

    onEnter() {}

    update(dt) {
        this.animTimer += dt;
        const mx = this.game.input.mouse.x;
        const my = this.game.input.mouse.y;

        this.hoveredButton = -1;

        // Continue button
        if (UIRenderer.isPointInRect(mx, my, CANVAS_WIDTH / 2 - 100, CANVAS_HEIGHT - 70, 200, 50)) {
            this.hoveredButton = 0;
        }

        if (this.game.input.isMouseJustPressed() && this.hoveredButton === 0) {
            Audio.uiClick();
            this._continue();
        }
    }

    _continue() {
        const { SeasonScene } = await_import_season();
        this.game.sceneManager.transitionTo(new SeasonScene(this.game));
    }

    render(ctx) {
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Win/Loss banner
        const bannerColor = this.won ? '#FFD700' : '#FF4444';
        const bannerText = this.won ? 'VICTORY!' : 'DEFEAT';

        UIRenderer.drawText(ctx, bannerText, CANVAS_WIDTH / 2, 50, {
            font: 'bold 48px monospace', color: bannerColor, shadow: true, shadowOffset: 4,
        });

        // Score
        const gs = this.gameState;
        UIRenderer.drawPanel(ctx, CANVAS_WIDTH / 2 - 200, 80, 400, 80, {
            bgColor: 'rgba(20,20,30,0.9)', borderColor: bannerColor,
        });

        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Away
        ctx.font = 'bold 16px monospace';
        ctx.fillStyle = '#FFF';
        ctx.fillText(this.opponentTeam.abbreviation || 'AWAY', CANVAS_WIDTH / 2 - 80, 105);
        ctx.font = 'bold 36px monospace';
        ctx.fillText(String(gs.score.away), CANVAS_WIDTH / 2 - 80, 140);

        // VS
        ctx.font = '16px monospace';
        ctx.fillStyle = '#666';
        ctx.fillText('vs', CANVAS_WIDTH / 2, 120);

        // Home
        ctx.font = 'bold 16px monospace';
        ctx.fillStyle = '#FFD700';
        ctx.fillText(this.playerTeam.abbreviation || 'HOME', CANVAS_WIDTH / 2 + 80, 105);
        ctx.font = 'bold 36px monospace';
        ctx.fillText(String(gs.score.home), CANVAS_WIDTH / 2 + 80, 140);

        ctx.restore();

        // Innings
        const totalInnings = gs.isTopHalf ? gs.inning - 1 : gs.inning;
        const expectedInnings = gs.totalInnings || 9;
        const extraText = totalInnings !== expectedInnings ? ` (${totalInnings} innings)` : '';
        UIRenderer.drawText(ctx, `Final${extraText}`, CANVAS_WIDTH / 2, 175, {
            font: '14px monospace', color: '#888',
        });

        // Box score - top performers
        this._renderBoxScore(ctx);

        // Reward display
        if (this.reward) {
            this._renderReward(ctx);
        }

        // Continue button
        UIRenderer.drawButton(ctx, CANVAS_WIDTH / 2 - 100, CANVAS_HEIGHT - 70, 200, 50, 'CONTINUE', this.hoveredButton === 0, {
            normal: '#1a1a1a', hover: '#333', text: '#FFD700', border: '#FFD700',
        });
    }

    _renderBoxScore(ctx) {
        const y = 200;

        UIRenderer.drawText(ctx, 'BOX SCORE', CANVAS_WIDTH / 2, y, {
            font: 'bold 16px monospace', color: '#FFD700',
        });

        // Column headers
        ctx.save();
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#666';
        const cols = { name: 200, pos: 370, ab: 430, h: 480, hr: 530, rbi: 580, avg: 640 };
        ctx.fillText('PLAYER', cols.name, y + 22);
        ctx.fillText('POS', cols.pos, y + 22);
        ctx.fillText('AB', cols.ab, y + 22);
        ctx.fillText('H', cols.h, y + 22);
        ctx.fillText('HR', cols.hr, y + 22);
        ctx.fillText('RBI', cols.rbi, y + 22);
        ctx.fillText('AVG', cols.avg, y + 22);
        ctx.restore();

        // Player rows (home team lineup)
        const lineup = this.playerTeam.lineup;
        for (let i = 0; i < lineup.length; i++) {
            const p = lineup[i];
            const ry = y + 40 + i * 24;
            const stats = p.seasonStats;

            ctx.save();
            ctx.font = '13px monospace';
            ctx.textBaseline = 'middle';

            ctx.textAlign = 'left';
            ctx.fillStyle = p.isPlayerCharacter ? '#FFD700' : '#DDD';
            ctx.fillText(p.name, 120, ry);

            ctx.textAlign = 'center';
            ctx.fillStyle = '#AAA';
            ctx.fillText(p.assignedPosition || p.position, cols.pos, ry);
            ctx.fillText(String(stats.atBats), cols.ab, ry);
            ctx.fillText(String(stats.hits), cols.h, ry);
            ctx.fillText(String(stats.homeRuns), cols.hr, ry);
            ctx.fillText(String(stats.rbi), cols.rbi, ry);
            ctx.fillText(p.avg, cols.avg, ry);

            ctx.restore();
        }
    }

    _renderReward(ctx) {
        const rx = CANVAS_WIDTH - 300;
        const ry = 210;

        UIRenderer.drawPanel(ctx, rx, ry, 260, 30 + this.reward.breakdown.length * 28, {
            bgColor: 'rgba(0,40,0,0.8)', borderColor: '#44FF44',
        });

        UIRenderer.drawText(ctx, 'EARNINGS', rx + 130, ry + 15, {
            font: 'bold 14px monospace', color: '#44FF44',
        });

        for (let i = 0; i < this.reward.breakdown.length; i++) {
            const item = this.reward.breakdown[i];
            const iy = ry + 35 + i * 28;

            ctx.save();
            ctx.font = '13px monospace';
            ctx.textAlign = 'left';
            ctx.fillStyle = '#DDD';
            ctx.fillText(item.label, rx + 15, iy + 8);
            ctx.textAlign = 'right';
            ctx.fillStyle = '#44FF44';
            ctx.fillText(`+$${item.amount}`, rx + 245, iy + 8);
            ctx.restore();
        }

        // Total
        const totalY = ry + 35 + this.reward.breakdown.length * 28;
        ctx.save();
        ctx.font = 'bold 16px monospace';
        ctx.textAlign = 'right';
        ctx.fillStyle = '#44FF44';
        ctx.fillText(`TOTAL: $${this.reward.total}`, rx + 245, totalY + 5);
        ctx.restore();
    }
}

// Lazy import
function await_import_season() { return { SeasonScene: PostGameScene._SeasonScene }; }
PostGameScene._SeasonScene = null;
