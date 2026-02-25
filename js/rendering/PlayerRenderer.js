import { worldToScreen } from '../utils/perspective.js';
import { BASES } from '../utils/constants.js';

const SKIN_COLORS = {
    light: '#F5D0A9',
    medium: '#D2A06B',
    dark: '#8B5E3C',
};

const HEIGHT_SCALE = {
    short: 0.85,
    average: 1.0,
    tall: 1.15,
};

const BUILD_WIDTH = {
    lean: 0.85,
    average: 1.0,
    stocky: 1.2,
};

export class PlayerRenderer {
    // Utility: darken (negative) or lighten (positive) a hex color by RGB offset
    static _shadeColor(hex, amount) {
        const num = parseInt(hex.replace('#', ''), 16);
        const r = Math.min(255, Math.max(0, (num >> 16) + amount));
        const g = Math.min(255, Math.max(0, ((num >> 8) & 0xFF) + amount));
        const b = Math.min(255, Math.max(0, (num & 0xFF) + amount));
        return `rgb(${r},${g},${b})`;
    }

    static drawPlayer(ctx, player, teamColors, overrideAnimState = null) {
        const screen = worldToScreen(player.worldPos.x, player.worldPos.y, player.worldPos.z);
        if (!screen) return;

        const baseScale = screen.scale * 0.55;
        const s = baseScale * HEIGHT_SCALE[player.appearance.height || 'average'];
        const w = BUILD_WIDTH[player.appearance.build || 'average'];

        if (s < 0.5) return; // too small to render

        const animState = overrideAnimState || player.animState;
        const primaryColor = teamColors.primary || '#333333';
        const skinColor = SKIN_COLORS[player.appearance.skinTone || 'medium'];

        ctx.save();
        ctx.translate(screen.x, screen.y);

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.beginPath();
        ctx.ellipse(0, 2 * s, 8 * s * w, 3 * s, 0, 0, Math.PI * 2);
        ctx.fill();

        // Legs / Pants (with cylindrical gradient)
        const pantsColor = teamColors.secondary || '#CCCCCC';
        const legSpread = animState === 'running' ? Math.sin(player.animTimer * 12) * 4 : 0;

        // Left leg
        const leftLegX = (-4 * w - legSpread) * s;
        const leftLegW = 3.5 * s * w;
        const leftLegGrad = ctx.createLinearGradient(leftLegX, 0, leftLegX + leftLegW, 0);
        leftLegGrad.addColorStop(0, PlayerRenderer._shadeColor(pantsColor, -20));
        leftLegGrad.addColorStop(0.5, PlayerRenderer._shadeColor(pantsColor, 10));
        leftLegGrad.addColorStop(1, PlayerRenderer._shadeColor(pantsColor, -20));
        ctx.fillStyle = leftLegGrad;
        ctx.fillRect(leftLegX, -12 * s, leftLegW, 12 * s);

        // Right leg
        const rightLegX = (0.5 * w + legSpread) * s;
        const rightLegW = 3.5 * s * w;
        const rightLegGrad = ctx.createLinearGradient(rightLegX, 0, rightLegX + rightLegW, 0);
        rightLegGrad.addColorStop(0, PlayerRenderer._shadeColor(pantsColor, -20));
        rightLegGrad.addColorStop(0.5, PlayerRenderer._shadeColor(pantsColor, 10));
        rightLegGrad.addColorStop(1, PlayerRenderer._shadeColor(pantsColor, -20));
        ctx.fillStyle = rightLegGrad;
        ctx.fillRect(rightLegX, -12 * s, rightLegW, 12 * s);

        // Cleats
        ctx.fillStyle = '#222';
        ctx.fillRect((-5 * w - legSpread) * s, -1 * s, 5 * s * w, 2 * s);
        ctx.fillRect((0 * w + legSpread) * s, -1 * s, 5 * s * w, 2 * s);

        // Body / Jersey (with cylindrical gradient)
        const bodyTop = -30 * s;
        const bodyHeight = 18 * s;
        const bodyWidth = 14 * s * w;
        const jerseyGrad = ctx.createLinearGradient(-bodyWidth / 2, 0, bodyWidth / 2, 0);
        jerseyGrad.addColorStop(0, PlayerRenderer._shadeColor(primaryColor, -30));
        jerseyGrad.addColorStop(0.35, PlayerRenderer._shadeColor(primaryColor, 15));
        jerseyGrad.addColorStop(0.65, PlayerRenderer._shadeColor(primaryColor, 15));
        jerseyGrad.addColorStop(1, PlayerRenderer._shadeColor(primaryColor, -30));
        ctx.fillStyle = jerseyGrad;
        ctx.fillRect(-bodyWidth / 2, bodyTop, bodyWidth, bodyHeight);

        // Jersey trim (stripe)
        if (teamColors.accent) {
            ctx.fillStyle = teamColors.accent;
            ctx.fillRect(-bodyWidth / 2, bodyTop + bodyHeight - 2 * s, bodyWidth, 2 * s);
        }

        // Arms
        let leftArmAngle = 0;
        let rightArmAngle = 0;

        if (animState === 'running') {
            leftArmAngle = Math.sin(player.animTimer * 12) * 30;
            rightArmAngle = -leftArmAngle;
        } else if (animState === 'batting') {
            rightArmAngle = -45;
            leftArmAngle = -45;
        } else if (animState === 'throwing') {
            rightArmAngle = -90 + Math.sin(player.animTimer * 8) * 45;
        } else if (animState === 'pitching') {
            rightArmAngle = -120 + player.animTimer * 200;
        }

        // Left arm (jersey sleeve + skin) with gradients
        ctx.save();
        ctx.translate(-bodyWidth / 2, bodyTop + 4 * s);
        ctx.rotate(leftArmAngle * Math.PI / 180);
        const lSleeveGrad = ctx.createLinearGradient(-3 * s * w, 0, 0, 0);
        lSleeveGrad.addColorStop(0, PlayerRenderer._shadeColor(primaryColor, -25));
        lSleeveGrad.addColorStop(0.5, PlayerRenderer._shadeColor(primaryColor, 10));
        lSleeveGrad.addColorStop(1, PlayerRenderer._shadeColor(primaryColor, -15));
        ctx.fillStyle = lSleeveGrad;
        ctx.fillRect(-3 * s * w, -1 * s, 3 * s * w, 8 * s);
        const lArmGrad = ctx.createLinearGradient(-3 * s * w, 0, 0, 0);
        lArmGrad.addColorStop(0, PlayerRenderer._shadeColor(skinColor, -20));
        lArmGrad.addColorStop(0.5, PlayerRenderer._shadeColor(skinColor, 10));
        lArmGrad.addColorStop(1, PlayerRenderer._shadeColor(skinColor, -15));
        ctx.fillStyle = lArmGrad;
        ctx.fillRect(-3 * s * w, 7 * s, 3 * s * w, 5 * s);
        ctx.restore();

        // Right arm with gradients
        ctx.save();
        ctx.translate(bodyWidth / 2, bodyTop + 4 * s);
        ctx.rotate(rightArmAngle * Math.PI / 180);
        const rSleeveGrad = ctx.createLinearGradient(0, 0, 3 * s * w, 0);
        rSleeveGrad.addColorStop(0, PlayerRenderer._shadeColor(primaryColor, -15));
        rSleeveGrad.addColorStop(0.5, PlayerRenderer._shadeColor(primaryColor, 10));
        rSleeveGrad.addColorStop(1, PlayerRenderer._shadeColor(primaryColor, -25));
        ctx.fillStyle = rSleeveGrad;
        ctx.fillRect(0, -1 * s, 3 * s * w, 8 * s);
        const rArmGrad = ctx.createLinearGradient(0, 0, 3 * s * w, 0);
        rArmGrad.addColorStop(0, PlayerRenderer._shadeColor(skinColor, -15));
        rArmGrad.addColorStop(0.5, PlayerRenderer._shadeColor(skinColor, 10));
        rArmGrad.addColorStop(1, PlayerRenderer._shadeColor(skinColor, -20));
        ctx.fillStyle = rArmGrad;
        ctx.fillRect(0, 7 * s, 3 * s * w, 5 * s);
        ctx.restore();

        // Number on jersey
        if (s > 2) {
            ctx.fillStyle = teamColors.secondary || '#FFF';
            ctx.font = `bold ${Math.max(6, Math.round(8 * s))}px monospace`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(String(player.number), 0, bodyTop + bodyHeight / 2);
        }

        // Head
        const headRadius = 5.5 * s;
        const headY = bodyTop - headRadius;

        // Neck
        ctx.fillStyle = skinColor;
        ctx.fillRect(-2 * s, bodyTop - 3 * s, 4 * s, 4 * s);

        // Head circle (spherical radial gradient)
        const headGrad = ctx.createRadialGradient(
            -1 * s, headY - 1 * s, headRadius * 0.1,
            0, headY, headRadius
        );
        headGrad.addColorStop(0, PlayerRenderer._shadeColor(skinColor, 20));
        headGrad.addColorStop(0.7, skinColor);
        headGrad.addColorStop(1, PlayerRenderer._shadeColor(skinColor, -30));
        ctx.fillStyle = headGrad;
        ctx.beginPath();
        ctx.arc(0, headY, headRadius, 0, Math.PI * 2);
        ctx.fill();

        // Helmet / Cap (with curvature gradient)
        const helmetGrad = ctx.createLinearGradient(0, headY - headRadius - 1.5 * s, 0, headY - 1 * s);
        helmetGrad.addColorStop(0, PlayerRenderer._shadeColor(primaryColor, 25));
        helmetGrad.addColorStop(1, PlayerRenderer._shadeColor(primaryColor, -20));
        ctx.fillStyle = helmetGrad;
        ctx.beginPath();
        ctx.arc(0, headY - 1 * s, headRadius + 0.5 * s, Math.PI, 0);
        ctx.fill();

        // Cap brim
        ctx.fillStyle = PlayerRenderer._shadeColor(primaryColor, -15);
        ctx.fillRect(-headRadius * 1.1, headY - 1 * s, headRadius * 2.2, 2 * s);

        // Shadow under brim
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(-headRadius * 1.0, headY - 1 * s + 1.5 * s, headRadius * 2.0, 1.2 * s);

        // Eyes (sclera + pupil + highlight)
        if (s > 2) {
            const eyeSpacing = 2 * s;
            const eyeRadius = 0.8 * s;
            const pupilRadius = 0.35 * s;
            const highlightRadius = 0.15 * s;

            for (const ex of [-eyeSpacing, eyeSpacing]) {
                // White sclera
                ctx.fillStyle = '#FAFAFA';
                ctx.beginPath();
                ctx.arc(ex, headY, eyeRadius, 0, Math.PI * 2);
                ctx.fill();

                // Thin outline for definition
                ctx.strokeStyle = 'rgba(0,0,0,0.3)';
                ctx.lineWidth = Math.max(0.3, 0.1 * s);
                ctx.beginPath();
                ctx.arc(ex, headY, eyeRadius, 0, Math.PI * 2);
                ctx.stroke();

                // Dark pupil (smaller)
                ctx.fillStyle = '#111';
                ctx.beginPath();
                ctx.arc(ex, headY, pupilRadius, 0, Math.PI * 2);
                ctx.fill();

                // Tiny white highlight (upper-right of pupil)
                ctx.fillStyle = '#FFF';
                ctx.beginPath();
                ctx.arc(ex + 0.12 * s, headY - 0.12 * s, highlightRadius, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Equipment cosmetics
        if (player.equipment.accessory?.cosmetic?.neckChain) {
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = Math.max(1, s * 0.5);
            ctx.beginPath();
            ctx.arc(0, bodyTop + 2 * s, 3 * s, 0, Math.PI);
            ctx.stroke();
        }

        // Name label (only when close enough)
        if (s > 3) {
            const fontSize = Math.max(9, Math.round(5 * s));
            ctx.font = `bold ${fontSize}px monospace`;
            ctx.textAlign = 'center';
            const nameText = player.name;
            const nameWidth = ctx.measureText(nameText).width;
            const labelY = headY - headRadius - 10 * s;
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.fillRect(-nameWidth / 2 - 4, labelY - fontSize / 2 - 2, nameWidth + 8, fontSize + 4);
            ctx.fillStyle = '#FFF';
            ctx.textBaseline = 'middle';
            ctx.fillText(nameText, 0, labelY);
        }

        ctx.restore();
    }

    // Draw a simpler version for distant players
    static drawPlayerSimple(ctx, player, teamColors) {
        const screen = worldToScreen(player.worldPos.x, player.worldPos.y, player.worldPos.z);
        if (!screen) return;

        const s = screen.scale * 0.5;
        if (s < 0.3) return;

        ctx.save();
        ctx.translate(screen.x, screen.y);

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        ctx.ellipse(0, 1, 4 * s, 1.5 * s, 0, 0, Math.PI * 2);
        ctx.fill();

        // Body block
        ctx.fillStyle = teamColors.primary || '#333';
        ctx.fillRect(-3 * s, -15 * s, 6 * s, 15 * s);

        // Head
        ctx.fillStyle = SKIN_COLORS[player.appearance.skinTone || 'medium'];
        ctx.beginPath();
        ctx.arc(0, -18 * s, 3 * s, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    // Draw fielders at their positions
    static drawFielders(ctx, players, teamColors) {
        // Sort by z (depth) for proper draw order — farther first
        const sorted = [...players].sort((a, b) => b.worldPos.z - a.worldPos.z);

        for (const player of sorted) {
            const screen = worldToScreen(player.worldPos.x, player.worldPos.y, player.worldPos.z);
            if (!screen) continue;

            if (screen.scale > 1.5) {
                PlayerRenderer.drawPlayer(ctx, player, teamColors);
            } else {
                PlayerRenderer.drawPlayerSimple(ctx, player, teamColors);
            }
        }
    }

    // Draw base runners at their base positions
    static drawBaseRunners(ctx, bases, teamColors) {
        const basePositions = {
            first:  BASES.first,
            second: BASES.second,
            third:  BASES.third,
        };

        const runners = [];
        for (const [baseName, player] of Object.entries(bases)) {
            if (player) {
                runners.push({ player, pos: basePositions[baseName] });
            }
        }

        // Sort by z (depth) — farther bases drawn first
        runners.sort((a, b) => b.pos.z - a.pos.z);

        for (const { player, pos } of runners) {
            const screen = worldToScreen(pos.x, pos.y, pos.z);
            if (!screen) continue;

            const s = screen.scale * 0.5;
            if (s < 0.3 || s > 10) continue; // too small or camera too close

            ctx.save();
            ctx.translate(screen.x, screen.y);

            // Shadow
            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            ctx.beginPath();
            ctx.ellipse(0, 1, 4 * s, 1.5 * s, 0, 0, Math.PI * 2);
            ctx.fill();

            // Body (batting team jersey color)
            ctx.fillStyle = teamColors.primary || '#333';
            ctx.fillRect(-3 * s, -15 * s, 6 * s, 15 * s);

            // Head
            ctx.fillStyle = SKIN_COLORS[player.appearance?.skinTone || 'medium'];
            ctx.beginPath();
            ctx.arc(0, -18 * s, 3 * s, 0, Math.PI * 2);
            ctx.fill();

            // Helmet (team color)
            ctx.fillStyle = teamColors.primary || '#333';
            ctx.beginPath();
            ctx.arc(0, -19 * s, 3 * s + 0.5, Math.PI, 0);
            ctx.fill();

            ctx.restore();
        }
    }
}
