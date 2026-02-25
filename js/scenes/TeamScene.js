import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../utils/constants.js';
import { UIRenderer } from '../rendering/UIRenderer.js';
import { Audio } from '../engine/Audio.js';

const POSITIONS = ['C', 'SP', 'SS', '2B', '3B', '1B', 'LF', 'CF', 'RF'];
const STAR_COLORS = { 5: '#FFD700', 4: '#4488FF', 3: '#44FF44', 2: '#AAAAAA', 1: '#777777' };

export class TeamScene {
    constructor(game) {
        this.game = game;
        this.team = game.playerTeam;
        this.hoveredSlot = -1;
        this.hoveredButton = -1;
        this.selectedSlot = -1; // which lineup slot is selected for swapping
        this.hoveredBenchPlayer = -1;
        this.scrollOffset = 0;
    }

    onEnter() {
        // Ensure lineup is populated
        if (this.team.lineup.length === 0) {
            this.team.autoLineup();
        }
    }

    update(dt) {
        const mx = this.game.input.mouse.x;
        const my = this.game.input.mouse.y;

        this.hoveredSlot = -1;
        this.hoveredButton = -1;
        this.hoveredBenchPlayer = -1;

        // Lineup slots
        for (let i = 0; i < 9; i++) {
            const y = 110 + i * 55;
            if (mx >= 30 && mx <= 660 && my >= y && my <= y + 48) {
                this.hoveredSlot = i;
            }
        }

        // Bench players (right side)
        const bench = this._getBenchPlayers();
        for (let i = 0; i < bench.length; i++) {
            const y = 110 + i * 45;
            if (mx >= 700 && mx <= 1080 && my >= y && my <= y + 40) {
                this.hoveredBenchPlayer = i;
            }
        }

        // Buttons
        const btnY = CANVAS_HEIGHT - 65;
        if (UIRenderer.isPointInRect(mx, my, CANVAS_WIDTH / 2 - 230, btnY, 200, 50)) {
            this.hoveredButton = 0; // Auto lineup
        }
        if (UIRenderer.isPointInRect(mx, my, CANVAS_WIDTH / 2 + 30, btnY, 200, 50)) {
            this.hoveredButton = 1; // Continue
        }

        if (this.game.input.isMouseJustPressed()) {
            Audio.uiClick();
            if (this.hoveredSlot >= 0) {
                if (this.selectedSlot >= 0 && this.selectedSlot !== this.hoveredSlot) {
                    this._swapLineupSlots(this.selectedSlot, this.hoveredSlot);
                    this.selectedSlot = -1;
                } else if (this.selectedSlot === this.hoveredSlot) {
                    this.selectedSlot = -1;
                } else {
                    this.selectedSlot = this.hoveredSlot;
                }
            } else if (this.hoveredBenchPlayer >= 0 && this.selectedSlot >= 0) {
                this._swapBenchIntoLineup(this.selectedSlot, bench[this.hoveredBenchPlayer]);
                this.selectedSlot = -1;
            } else if (this.hoveredButton === 0) {
                this.team.autoLineup();
                this.selectedSlot = -1;
            } else if (this.hoveredButton === 1) {
                this._continue();
            } else {
                this.selectedSlot = -1;
            }
        }
    }

    _getBenchPlayers() {
        const lineupIds = new Set(this.team.lineup.map(p => p.id));
        return this.team.roster.filter(p => !lineupIds.has(p.id));
    }

    _swapLineupSlots(a, b) {
        const lineup = this.team.lineup;
        if (a >= 0 && a < lineup.length && b >= 0 && b < lineup.length) {
            // Swap positions too
            const posA = lineup[a].assignedPosition;
            const posB = lineup[b].assignedPosition;
            lineup[a].assignedPosition = posB;
            lineup[b].assignedPosition = posA;
            [lineup[a], lineup[b]] = [lineup[b], lineup[a]];
        }
    }

    _swapBenchIntoLineup(slotIndex, benchPlayer) {
        const lineup = this.team.lineup;
        if (slotIndex >= 0 && slotIndex < lineup.length) {
            const old = lineup[slotIndex];
            benchPlayer.assignedPosition = old.assignedPosition;
            old.assignedPosition = null;
            lineup[slotIndex] = benchPlayer;
        }
    }

    _continue() {
        // Go to season scene
        const { SeasonScene } = await_import_season();
        this.game.sceneManager.transitionTo(new SeasonScene(this.game));
    }

    render(ctx) {
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Title
        UIRenderer.drawText(ctx, 'TEAM ROSTER', CANVAS_WIDTH / 2, 30, {
            font: 'bold 32px monospace', color: '#FFD700', shadow: true, shadowOffset: 3,
        });

        // Team name and record
        UIRenderer.drawText(ctx, `${this.team.name}`, CANVAS_WIDTH / 2, 65, {
            font: '18px monospace', color: '#FFF',
        });

        // Coach
        if (this.team.coach) {
            UIRenderer.drawText(ctx, `Coach: ${this.team.coach.name}`, CANVAS_WIDTH / 2, 88, {
                font: '14px monospace', color: '#AAA',
            });
        }

        // Lineup header
        UIRenderer.drawText(ctx, 'BATTING ORDER', 345, 105, {
            font: 'bold 14px monospace', color: '#FFD700',
        });

        // Lineup slots
        for (let i = 0; i < 9; i++) {
            const player = this.team.lineup[i];
            const y = 110 + i * 55;
            const selected = this.selectedSlot === i;
            const hovered = this.hoveredSlot === i;

            this._drawLineupSlot(ctx, 30, y, 630, 48, i, player, selected, hovered);
        }

        // Bench header
        UIRenderer.drawText(ctx, 'BENCH', 890, 90, {
            font: 'bold 14px monospace', color: '#AAA',
        });

        // Bench players
        const bench = this._getBenchPlayers();
        for (let i = 0; i < bench.length; i++) {
            const y = 110 + i * 45;
            const hovered = this.hoveredBenchPlayer === i;
            this._drawBenchSlot(ctx, 700, y, 380, 40, bench[i], hovered);
        }

        if (bench.length === 0) {
            UIRenderer.drawText(ctx, 'No bench players', 890, 140, {
                font: '13px monospace', color: '#555',
            });
        }

        // Instructions
        if (this.selectedSlot >= 0) {
            UIRenderer.drawText(ctx, 'Click another slot to swap, or a bench player to sub in', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 100, {
                font: '13px monospace', color: '#FFD700',
            });
        } else {
            UIRenderer.drawText(ctx, 'Click a lineup slot to select it for swapping', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 100, {
                font: '13px monospace', color: '#666',
            });
        }

        // Buttons
        const btnY = CANVAS_HEIGHT - 65;
        UIRenderer.drawButton(ctx, CANVAS_WIDTH / 2 - 230, btnY, 200, 50, 'AUTO LINEUP', this.hoveredButton === 0, {
            normal: '#222', hover: '#444', text: '#AAA', border: '#666',
        });
        UIRenderer.drawButton(ctx, CANVAS_WIDTH / 2 + 30, btnY, 200, 50, 'CONTINUE', this.hoveredButton === 1, {
            normal: '#1a1a1a', hover: '#333', text: '#FFD700', border: '#FFD700',
        });

        // Money display
        if (this.game.economyManager) {
            UIRenderer.drawText(ctx, `$${this.game.economyManager.balance}`, CANVAS_WIDTH - 80, 30, {
                font: 'bold 18px monospace', color: '#44FF44',
            });
        }
    }

    _drawLineupSlot(ctx, x, y, w, h, index, player, selected, hovered) {
        const bgColor = selected ? 'rgba(80,80,0,0.7)' : (hovered ? 'rgba(40,40,40,0.8)' : 'rgba(20,20,30,0.8)');
        const borderColor = selected ? '#FFD700' : (hovered ? '#888' : '#333');

        UIRenderer.drawPanel(ctx, x, y, w, h, { bgColor, borderColor, borderWidth: selected ? 2 : 1 });

        if (!player) return;

        ctx.save();
        // Batting order number
        ctx.fillStyle = '#666';
        ctx.font = 'bold 20px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(index + 1), x + 20, y + h / 2);

        // Position
        const posColor = STAR_COLORS[player.stars] || '#AAA';
        ctx.fillStyle = posColor;
        ctx.font = 'bold 14px monospace';
        ctx.fillText(player.assignedPosition || player.position, x + 60, y + h / 2);

        // Name
        ctx.fillStyle = player.isPlayerCharacter ? '#FFD700' : '#FFF';
        ctx.font = 'bold 16px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(player.name, x + 90, y + h / 2 - 8);

        // Number + stars
        ctx.fillStyle = '#888';
        ctx.font = '12px monospace';
        ctx.fillText(`#${player.number}`, x + 90, y + h / 2 + 12);
        UIRenderer.drawStars(ctx, x + 140, y + h / 2 + 5, player.stars, 5, 8);

        // Stats mini
        const stats = player.getEffectiveStats();
        const statLabels = ['PWR', 'CON', 'SPD', 'FLD', 'ARM'];
        const statKeys = ['power', 'contact', 'speed', 'fielding', 'arm'];
        const statColors = ['#FF6644', '#44FF44', '#44AAFF', '#FFAA44', '#FF44FF'];

        for (let s = 0; s < 5; s++) {
            const sx = x + 320 + s * 62;
            ctx.font = '9px monospace';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#666';
            ctx.fillText(statLabels[s], sx, y + 14);
            ctx.font = 'bold 14px monospace';
            ctx.fillStyle = statColors[s];
            ctx.fillText(String(stats[statKeys[s]]), sx, y + 32);
        }

        // Overall
        ctx.font = 'bold 18px monospace';
        ctx.fillStyle = '#FFF';
        ctx.textAlign = 'center';
        ctx.fillText(String(player.getOverall()), x + w - 30, y + h / 2);

        ctx.restore();
    }

    _drawBenchSlot(ctx, x, y, w, h, player, hovered) {
        const bgColor = hovered ? 'rgba(40,40,40,0.8)' : 'rgba(15,15,25,0.6)';
        UIRenderer.drawPanel(ctx, x, y, w, h, {
            bgColor,
            borderColor: hovered ? '#888' : '#222',
            borderWidth: 1,
        });

        ctx.save();
        ctx.fillStyle = STAR_COLORS[player.stars] || '#AAA';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(player.position, x + 10, y + h / 2);

        ctx.fillStyle = '#DDD';
        ctx.font = '14px monospace';
        ctx.fillText(player.name, x + 45, y + h / 2);

        ctx.fillStyle = '#888';
        ctx.font = '11px monospace';
        ctx.fillText(`#${player.number}`, x + 250, y + h / 2);

        UIRenderer.drawStars(ctx, x + 290, y + h / 2 - 5, player.stars, 5, 8);

        ctx.font = 'bold 14px monospace';
        ctx.fillStyle = '#FFF';
        ctx.textAlign = 'right';
        ctx.fillText(String(player.getOverall()), x + w - 10, y + h / 2);
        ctx.restore();
    }
}

// Lazy import helper
function await_import_season() {
    return { SeasonScene: TeamScene._SeasonScene };
}
TeamScene._SeasonScene = null;
