import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../utils/constants.js';
import { UIRenderer } from '../rendering/UIRenderer.js';
import { Audio } from '../engine/Audio.js';
import { LeaderboardManager } from '../systems/LeaderboardManager.js';

export class LeaderboardScene {
    constructor(game) {
        this.game = game;
        this.hoveredButton = -1;

        // Data state
        this.entries = [];
        this.loading = false;
        this.error = null;

        // Sort state
        this.sortBy = 'wins';

        // Sort tabs
        this.tabs = [
            { text: 'BY WINS', sortBy: 'wins', x: CANVAS_WIDTH / 2 - 170, y: 55, w: 150, h: 35 },
            { text: 'BY WS WINS', sortBy: 'worldSeriesWins', x: CANVAS_WIDTH / 2 + 20, y: 55, w: 150, h: 35 },
        ];

        // Back button
        this.backButton = { text: 'BACK', x: 20, y: CANVAS_HEIGHT - 60, w: 120, h: 40 };
    }

    onEnter() {
        this._fetchLeaderboard();
    }

    onExit() {}

    async _fetchLeaderboard() {
        this.loading = true;
        this.error = null;
        this.entries = [];

        try {
            const results = await LeaderboardManager.getTopLeagues(this.sortBy, 15);
            this.entries = results;
        } catch (err) {
            console.error('LeaderboardScene: fetch failed —', err);
            this.error = 'Failed to load leaderboard.';
        }

        this.loading = false;
    }

    update(dt) {
        const mx = this.game.input.mouse.x;
        const my = this.game.input.mouse.y;
        this.hoveredButton = -1;

        // Sort tabs
        for (let i = 0; i < this.tabs.length; i++) {
            const t = this.tabs[i];
            if (UIRenderer.isPointInRect(mx, my, t.x, t.y, t.w, t.h)) {
                this.hoveredButton = 100 + i;
            }
        }

        // Back button
        if (UIRenderer.isPointInRect(mx, my, this.backButton.x, this.backButton.y, this.backButton.w, this.backButton.h)) {
            this.hoveredButton = 0;
        }

        if (this.game.input.isMouseJustPressed()) {
            if (this.hoveredButton >= 0) Audio.uiClick();

            // Sort tabs
            for (let i = 0; i < this.tabs.length; i++) {
                if (this.hoveredButton === 100 + i) {
                    const newSort = this.tabs[i].sortBy;
                    if (newSort !== this.sortBy) {
                        this.sortBy = newSort;
                        this._fetchLeaderboard();
                    }
                }
            }

            // Back
            if (this.hoveredButton === 0) {
                this._goBack();
            }
        }
    }

    _goBack() {
        const TitleScene = LeaderboardScene._TitleScene;
        if (TitleScene) {
            this.game.sceneManager.transitionTo(new TitleScene(this.game));
        }
    }

    render(ctx) {
        // Background
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Title
        UIRenderer.drawText(ctx, 'LEADERBOARD', CANVAS_WIDTH / 2, 28, {
            font: 'bold 32px monospace',
            color: '#FFD700',
            shadow: true,
            shadowOffset: 3,
        });

        // Sort tabs
        for (let i = 0; i < this.tabs.length; i++) {
            const t = this.tabs[i];
            const active = this.sortBy === t.sortBy;
            UIRenderer.drawButton(ctx, t.x, t.y, t.w, t.h, t.text, this.hoveredButton === 100 + i || active, {
                normal: active ? '#333' : '#1a1a1a',
                hover: '#444',
                text: active ? '#FFD700' : '#888',
                border: active ? '#FFD700' : '#444',
            });
        }

        // Content area
        if (this.loading) {
            UIRenderer.drawText(ctx, 'Loading...', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, {
                font: '20px monospace',
                color: '#888',
            });
        } else if (this.error) {
            UIRenderer.drawText(ctx, this.error, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, {
                font: '18px monospace',
                color: '#FF4444',
            });
        } else if (this.entries.length === 0) {
            UIRenderer.drawText(ctx, 'No entries yet', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, {
                font: '20px monospace',
                color: '#666',
            });
        } else {
            this._renderTable(ctx);
        }

        // Back button
        UIRenderer.drawButton(ctx, this.backButton.x, this.backButton.y, this.backButton.w, this.backButton.h,
            this.backButton.text, this.hoveredButton === 0, {
                normal: '#222',
                hover: '#444',
                text: '#AAA',
                border: '#666',
            });
    }

    _renderTable(ctx) {
        const startY = 110;
        const rowH = 35;
        const colX = {
            rank: 80,
            name: 250,
            record: 520,
            ws: 700,
            money: 900,
        };

        // Column headers
        const headerY = startY - 8;
        ctx.save();
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#888';
        ctx.fillText('#', colX.rank, headerY);
        ctx.fillText('LEAGUE', colX.name, headerY);
        ctx.fillText('W - L', colX.record, headerY);
        ctx.fillText('WS WINS', colX.ws, headerY);
        ctx.fillText('MONEY', colX.money, headerY);
        ctx.restore();

        // Separator line
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(40, startY + 8);
        ctx.lineTo(CANVAS_WIDTH - 40, startY + 8);
        ctx.stroke();

        // Rows (max 15)
        const maxVisible = 15;
        const count = Math.min(this.entries.length, maxVisible);

        for (let i = 0; i < count; i++) {
            const entry = this.entries[i];
            const y = startY + 25 + i * rowH;

            // Alternating row background
            if (i % 2 === 0) {
                ctx.fillStyle = 'rgba(255,255,255,0.03)';
                ctx.fillRect(40, y - rowH / 2 + 2, CANVAS_WIDTH - 80, rowH);
            }

            // Rank color: gold/silver/bronze for top 3
            let rankColor = '#AAA';
            if (i === 0) rankColor = '#FFD700';
            else if (i === 1) rankColor = '#C0C0C0';
            else if (i === 2) rankColor = '#CD7F32';

            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Rank
            ctx.font = 'bold 16px monospace';
            ctx.fillStyle = rankColor;
            ctx.fillText(`${i + 1}`, colX.rank, y);

            // League name
            ctx.font = '15px monospace';
            ctx.fillStyle = '#FFF';
            const displayName = entry.leagueName.length > 22
                ? entry.leagueName.substring(0, 20) + '..'
                : entry.leagueName;
            ctx.fillText(displayName, colX.name, y);

            // W-L record
            ctx.font = '15px monospace';
            ctx.fillStyle = '#CCC';
            ctx.fillText(`${entry.wins} - ${entry.losses}`, colX.record, y);

            // WS wins
            ctx.font = 'bold 15px monospace';
            ctx.fillStyle = entry.worldSeriesWins > 0 ? '#FFD700' : '#666';
            ctx.fillText(`${entry.worldSeriesWins}`, colX.ws, y);

            // Total money
            ctx.font = '15px monospace';
            ctx.fillStyle = '#44FF44';
            ctx.fillText(`$${entry.totalMoney.toLocaleString()}`, colX.money, y);

            ctx.restore();
        }
    }
}

// Set by main.js
LeaderboardScene._TitleScene = null;
