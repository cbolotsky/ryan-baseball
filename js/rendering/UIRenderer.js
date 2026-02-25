import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../utils/constants.js';

export class UIRenderer {
    static drawButton(ctx, x, y, width, height, text, isHovered, colors = null) {
        const c = colors || {
            normal: '#333333',
            hover: '#555555',
            text: '#FFFFFF',
            border: '#FFD700',
        };

        ctx.save();

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        UIRenderer.roundRect(ctx, x + 2, y + 2, width, height, 8);
        ctx.fill();

        // Button body
        ctx.fillStyle = isHovered ? c.hover : c.normal;
        UIRenderer.roundRect(ctx, x, y, width, height, 8);
        ctx.fill();

        // Border
        ctx.strokeStyle = c.border;
        ctx.lineWidth = 2;
        UIRenderer.roundRect(ctx, x, y, width, height, 8);
        ctx.stroke();

        // Text
        ctx.fillStyle = c.text;
        ctx.font = 'bold 18px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, x + width / 2, y + height / 2);

        ctx.restore();
    }

    static isPointInRect(px, py, x, y, width, height) {
        return px >= x && px <= x + width && py >= y && py <= y + height;
    }

    static roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }

    static drawText(ctx, text, x, y, options = {}) {
        const {
            font = 'bold 24px monospace',
            color = '#FFFFFF',
            align = 'center',
            baseline = 'middle',
            shadow = false,
            shadowColor = 'rgba(0,0,0,0.5)',
            shadowOffset = 2,
        } = options;

        ctx.save();
        ctx.font = font;
        ctx.textAlign = align;
        ctx.textBaseline = baseline;

        if (shadow) {
            ctx.fillStyle = shadowColor;
            ctx.fillText(text, x + shadowOffset, y + shadowOffset);
        }

        ctx.fillStyle = color;
        ctx.fillText(text, x, y);
        ctx.restore();
    }

    static drawPanel(ctx, x, y, width, height, options = {}) {
        const {
            bgColor = 'rgba(0, 0, 0, 0.8)',
            borderColor = '#FFD700',
            borderWidth = 2,
            radius = 10,
        } = options;

        ctx.save();
        ctx.fillStyle = bgColor;
        UIRenderer.roundRect(ctx, x, y, width, height, radius);
        ctx.fill();

        if (borderWidth > 0) {
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = borderWidth;
            UIRenderer.roundRect(ctx, x, y, width, height, radius);
            ctx.stroke();
        }
        ctx.restore();
    }

    static drawStars(ctx, x, y, stars, maxStars = 5, size = 12) {
        for (let i = 0; i < maxStars; i++) {
            ctx.fillStyle = i < stars ? '#FFD700' : '#555555';
            UIRenderer.drawStar(ctx, x + i * (size + 4), y, size / 2);
        }
    }

    static drawStar(ctx, cx, cy, radius) {
        const spikes = 5;
        const outerRadius = radius;
        const innerRadius = radius * 0.4;
        let rot = -Math.PI / 2;
        const step = Math.PI / spikes;

        ctx.beginPath();
        for (let i = 0; i < spikes * 2; i++) {
            const r = i % 2 === 0 ? outerRadius : innerRadius;
            const x = cx + Math.cos(rot) * r;
            const y = cy + Math.sin(rot) * r;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
            rot += step;
        }
        ctx.closePath();
        ctx.fill();
    }

    // Draw scoreboard for in-game HUD
    static drawScoreboard(ctx, gameState) {
        const w = 400;
        const h = 60;
        const x = (CANVAS_WIDTH - w) / 2;
        const y = 10;

        UIRenderer.drawPanel(ctx, x, y, w, h, { bgColor: 'rgba(0,0,0,0.85)' });

        ctx.save();
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Away team
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(gameState.awayTeam.abbreviation || 'AWAY', x + 60, y + 20);
        ctx.font = 'bold 22px monospace';
        ctx.fillText(String(gameState.score.away), x + 60, y + 42);

        // Home team
        ctx.font = 'bold 14px monospace';
        ctx.fillStyle = '#FFD700';
        ctx.fillText(gameState.homeTeam.abbreviation || 'HOME', x + w - 60, y + 20);
        ctx.font = 'bold 22px monospace';
        ctx.fillText(String(gameState.score.home), x + w - 60, y + 42);

        // Inning
        ctx.font = 'bold 16px monospace';
        ctx.fillStyle = '#FFFFFF';
        const half = gameState.isTopHalf ? 'TOP' : 'BOT';
        ctx.fillText(`${half} ${gameState.inning}`, x + w / 2, y + 20);

        // Outs
        ctx.font = '12px monospace';
        ctx.fillStyle = '#AAA';
        ctx.fillText(`${gameState.outs} OUT`, x + w / 2, y + 38);

        // Count
        ctx.fillText(`${gameState.count.balls}-${gameState.count.strikes}`, x + w / 2, y + 52);

        ctx.restore();
    }

    // Mini base runner diamond
    static drawBaseRunnerDiamond(ctx, x, y, bases, size = 30) {
        ctx.save();

        const positions = [
            { dx: size, dy: 0 },      // 1st base (right)
            { dx: 0, dy: -size },      // 2nd base (top)
            { dx: -size, dy: 0 },      // 3rd base (left)
        ];
        const baseNames = ['first', 'second', 'third'];

        // Draw diamond outline
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y + size);  // home
        ctx.lineTo(x + size, y);  // 1st
        ctx.lineTo(x, y - size);  // 2nd
        ctx.lineTo(x - size, y);  // 3rd
        ctx.closePath();
        ctx.stroke();

        // Draw base markers
        for (let i = 0; i < 3; i++) {
            const bx = x + positions[i].dx;
            const by = y + positions[i].dy;
            const occupied = bases[baseNames[i]] !== null;

            ctx.fillStyle = occupied ? '#FFD700' : '#444';
            ctx.beginPath();
            // Rotated square (diamond shape)
            const bs = 6;
            ctx.moveTo(bx, by - bs);
            ctx.lineTo(bx + bs, by);
            ctx.lineTo(bx, by + bs);
            ctx.lineTo(bx - bs, by);
            ctx.closePath();
            ctx.fill();
        }

        ctx.restore();
    }
}
