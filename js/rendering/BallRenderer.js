import { worldToScreen } from '../utils/perspective.js';

export class BallRenderer {
    static drawBall(ctx, ball) {
        if (!ball.active) return;

        const screen = worldToScreen(ball.pos.x, ball.pos.y, ball.pos.z);
        if (!screen) return;

        const radius = Math.max(2, 3.5 * screen.scale);

        // Ground shadow
        const groundScreen = worldToScreen(ball.pos.x, 0, ball.pos.z);
        if (groundScreen) {
            const shadowScale = Math.max(0.3, 1 - ball.pos.y / 100);
            ctx.fillStyle = `rgba(0,0,0,${0.3 * shadowScale})`;
            ctx.beginPath();
            ctx.ellipse(
                groundScreen.x, groundScreen.y,
                radius * 0.8 * shadowScale, radius * 0.3 * shadowScale,
                0, 0, Math.PI * 2
            );
            ctx.fill();
        }

        // Ball glow (for fast pitches)
        if (ball.trajectory && ball.trajectoryT > 0 && ball.trajectoryT < 1) {
            const speed = ball.trajectory.speed || 90;
            if (speed > 90) {
                ctx.fillStyle = `rgba(255, 255, 200, ${0.3 * (speed - 90) / 20})`;
                ctx.beginPath();
                ctx.arc(screen.x, screen.y, radius * 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Ball body (white)
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, radius, 0, Math.PI * 2);
        ctx.fill();

        // Ball outline
        ctx.strokeStyle = '#CCCCCC';
        ctx.lineWidth = Math.max(0.5, radius * 0.1);
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, radius, 0, Math.PI * 2);
        ctx.stroke();

        // Red stitches (only visible when ball is big enough)
        if (radius > 4) {
            ctx.strokeStyle = '#CC0000';
            ctx.lineWidth = Math.max(0.5, radius * 0.15);

            // Left stitch arc
            ctx.beginPath();
            ctx.arc(screen.x - radius * 0.35, screen.y, radius * 0.55, -0.6, 0.6);
            ctx.stroke();

            // Right stitch arc
            ctx.beginPath();
            ctx.arc(screen.x + radius * 0.35, screen.y, radius * 0.55, Math.PI - 0.6, Math.PI + 0.6);
            ctx.stroke();
        }
    }

    // Draw ball trail (motion blur effect)
    static drawBallTrail(ctx, positions, maxTrail = 5) {
        for (let i = 0; i < Math.min(positions.length, maxTrail); i++) {
            const pos = positions[positions.length - 1 - i];
            const screen = worldToScreen(pos.x, pos.y, pos.z);
            if (!screen) continue;

            const alpha = (1 - i / maxTrail) * 0.3;
            const radius = Math.max(1, 2 * screen.scale * (1 - i / maxTrail));

            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.beginPath();
            ctx.arc(screen.x, screen.y, radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}
