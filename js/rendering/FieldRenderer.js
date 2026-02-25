import { worldToScreen, getDepthScale } from '../utils/perspective.js';
import { BASES, FIELD } from '../utils/constants.js';
import { degToRad } from '../utils/math.js';

export class FieldRenderer {
    constructor() {
        // Cache for the static field background
        this.cacheCanvas = null;
        this.cacheDirty = true;
    }

    render(ctx) {
        // Redraw each frame since camera can move
        this.drawSky(ctx);
        this.drawOutfieldGrass(ctx);
        this.drawInfieldDirt(ctx);
        this.drawGrassLine(ctx);
        this.drawFoulLines(ctx);
        this.drawBasePaths(ctx);
        this.drawBases(ctx);
        this.drawMound(ctx);
        this.drawBatterBoxes(ctx);
        this.drawOutfieldWall(ctx);
    }

    drawSky(ctx) {
        // Gradient sky
        const grad = ctx.createLinearGradient(0, 0, 0, 360);
        grad.addColorStop(0, '#4A90D9');
        grad.addColorStop(0.6, '#87CEEB');
        grad.addColorStop(1, '#B8E0F0');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }

    drawOutfieldGrass(ctx) {
        // Draw a large green area covering the outfield
        ctx.fillStyle = '#2D8B36';
        ctx.beginPath();

        // Fan shape from home plate out to outfield wall
        const points = [];
        // Left foul line to right foul line, arcing through center field
        for (let angle = -50; angle <= 50; angle += 2) {
            const rad = degToRad(angle);
            const dist = FIELD.outfieldDist;
            const wx = Math.sin(rad) * dist;
            const wz = Math.cos(rad) * dist;
            const screen = worldToScreen(wx, 0, wz);
            if (screen) points.push(screen);
        }

        // Add home plate area corners (close to camera)
        const homeLeft = worldToScreen(-80, 0, -5);
        const homeRight = worldToScreen(80, 0, -5);

        if (points.length > 2 && homeLeft && homeRight) {
            ctx.beginPath();
            ctx.moveTo(homeRight.x, homeRight.y);
            for (const p of points) {
                ctx.lineTo(p.x, p.y);
            }
            ctx.lineTo(homeLeft.x, homeLeft.y);
            ctx.closePath();
            ctx.fill();
        }
    }

    drawInfieldDirt(ctx) {
        // Dirt diamond slightly larger than the basepaths
        ctx.fillStyle = '#C4873B';

        const dirtPoints = [];
        const dirtRadius = FIELD.infieldArcRadius;

        // Infield dirt is a diamond shape around the bases, plus arc behind 2nd base
        // Simplified: draw a diamond connecting points beyond each base
        const expand = 15; // feet beyond bases
        const dirtCorners = [
            { x: 0, z: -expand },  // behind home
            { x: BASES.first.x + expand * 0.7, z: BASES.first.z - expand * 0.3 }, // beyond 1st
            { x: 0, z: BASES.second.z + expand }, // beyond 2nd
            { x: BASES.third.x - expand * 0.7, z: BASES.third.z - expand * 0.3 }, // beyond 3rd
        ];

        ctx.beginPath();
        let started = false;
        for (const corner of dirtCorners) {
            const screen = worldToScreen(corner.x, 0, corner.z);
            if (screen) {
                if (!started) {
                    ctx.moveTo(screen.x, screen.y);
                    started = true;
                } else {
                    ctx.lineTo(screen.x, screen.y);
                }
            }
        }
        if (started) {
            ctx.closePath();
            ctx.fill();
        }

        // Pitcher's mound dirt circle
        this._drawWorldCircle(ctx, 0, 0, BASES.mound.z, 10, '#C4873B');

        // Home plate dirt circle
        this._drawWorldCircle(ctx, 0, 0, 0, 15, '#C4873B');
    }

    drawGrassLine(ctx) {
        // Cut grass pattern on the infield (lighter green arcs)
        ctx.strokeStyle = '#3AA845';
        ctx.lineWidth = 1;

        for (let r = 30; r < FIELD.infieldArcRadius; r += 8) {
            ctx.beginPath();
            let started = false;
            for (let angle = -45; angle <= 45; angle += 3) {
                const rad = degToRad(angle);
                const wx = Math.sin(rad) * r;
                const wz = Math.cos(rad) * r;
                const screen = worldToScreen(wx, 0, wz);
                if (screen) {
                    if (!started) {
                        ctx.moveTo(screen.x, screen.y);
                        started = true;
                    } else {
                        ctx.lineTo(screen.x, screen.y);
                    }
                }
            }
            ctx.stroke();
        }
    }

    drawFoulLines(ctx) {
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;

        // Left foul line (home to left field)
        const home = worldToScreen(0, 0, 0);
        const leftFoul = worldToScreen(
            -Math.sin(degToRad(45)) * FIELD.foulLineDist,
            0,
            Math.cos(degToRad(45)) * FIELD.foulLineDist
        );
        const rightFoul = worldToScreen(
            Math.sin(degToRad(45)) * FIELD.foulLineDist,
            0,
            Math.cos(degToRad(45)) * FIELD.foulLineDist
        );

        if (home && leftFoul) {
            ctx.beginPath();
            ctx.moveTo(home.x, home.y);
            ctx.lineTo(leftFoul.x, leftFoul.y);
            ctx.stroke();
        }

        if (home && rightFoul) {
            ctx.beginPath();
            ctx.moveTo(home.x, home.y);
            ctx.lineTo(rightFoul.x, rightFoul.y);
            ctx.stroke();
        }
    }

    drawBasePaths(ctx) {
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;

        const baseOrder = [
            BASES.home, BASES.first, BASES.second, BASES.third, BASES.home,
        ];

        ctx.beginPath();
        let started = false;
        for (const base of baseOrder) {
            const screen = worldToScreen(base.x, 0, base.z);
            if (screen) {
                if (!started) {
                    ctx.moveTo(screen.x, screen.y);
                    started = true;
                } else {
                    ctx.lineTo(screen.x, screen.y);
                }
            }
        }
        ctx.stroke();
    }

    drawBases(ctx) {
        // 1st, 2nd, 3rd bases — white squares
        const baseSize = 3; // feet
        this._drawWorldSquare(ctx, BASES.first.x, 0, BASES.first.z, baseSize, '#FFFFFF');
        this._drawWorldSquare(ctx, BASES.second.x, 0, BASES.second.z, baseSize, '#FFFFFF');
        this._drawWorldSquare(ctx, BASES.third.x, 0, BASES.third.z, baseSize, '#FFFFFF');

        // Home plate — pentagon (simplified as a diamond)
        this._drawWorldSquare(ctx, 0, 0, 0, 2.5, '#FFFFFF');
    }

    drawMound(ctx) {
        // Pitcher's mound (slightly elevated circle)
        this._drawWorldCircle(ctx, BASES.mound.x, 0, BASES.mound.z, 6, '#B8964B');

        // Rubber on the mound
        const rubber = worldToScreen(0, BASES.mound.y, BASES.mound.z);
        if (rubber) {
            const s = rubber.scale;
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(rubber.x - 3 * s, rubber.y - 0.5 * s, 6 * s, 1 * s);
        }
    }

    drawBatterBoxes(ctx) {
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;

        // Left batter's box
        this._drawWorldRect(ctx, -5, 0, -3, 4, 7, '#FFFFFF', true);
        // Right batter's box
        this._drawWorldRect(ctx, 1, 0, -3, 4, 7, '#FFFFFF', true);
    }

    drawOutfieldWall(ctx) {
        ctx.strokeStyle = '#1A5E1F';
        ctx.lineWidth = 4;

        ctx.beginPath();
        let started = false;
        for (let angle = -48; angle <= 48; angle += 2) {
            const rad = degToRad(angle);
            // Vary wall distance for realism (shorter in corners, deeper in center)
            const dist = angle === 0 ? 400 :
                Math.abs(angle) < 20 ? 380 :
                Math.abs(angle) < 35 ? 350 : 330;
            const wx = Math.sin(rad) * dist;
            const wz = Math.cos(rad) * dist;
            const screen = worldToScreen(wx, 8, wz); // wall is 8 feet tall
            if (screen) {
                if (!started) {
                    ctx.moveTo(screen.x, screen.y);
                    started = true;
                } else {
                    ctx.lineTo(screen.x, screen.y);
                }
            }
        }
        ctx.stroke();

        // Wall face (dark green fill below the top edge)
        ctx.fillStyle = '#0D3B12';
        ctx.beginPath();
        started = false;
        // Top edge
        const topPoints = [];
        const bottomPoints = [];
        for (let angle = -48; angle <= 48; angle += 2) {
            const rad = degToRad(angle);
            const dist = angle === 0 ? 400 :
                Math.abs(angle) < 20 ? 380 :
                Math.abs(angle) < 35 ? 350 : 330;
            const wx = Math.sin(rad) * dist;
            const wz = Math.cos(rad) * dist;
            const top = worldToScreen(wx, 8, wz);
            const bottom = worldToScreen(wx, 0, wz);
            if (top) topPoints.push(top);
            if (bottom) bottomPoints.push(bottom);
        }

        if (topPoints.length > 1 && bottomPoints.length > 1) {
            ctx.beginPath();
            ctx.moveTo(topPoints[0].x, topPoints[0].y);
            for (let i = 1; i < topPoints.length; i++) {
                ctx.lineTo(topPoints[i].x, topPoints[i].y);
            }
            for (let i = bottomPoints.length - 1; i >= 0; i--) {
                ctx.lineTo(bottomPoints[i].x, bottomPoints[i].y);
            }
            ctx.closePath();
            ctx.fill();
        }
    }

    // Helper: draw a filled circle in world space
    _drawWorldCircle(ctx, wx, wy, wz, radius, color) {
        ctx.fillStyle = color;
        ctx.beginPath();
        let started = false;
        for (let angle = 0; angle < 360; angle += 15) {
            const rad = degToRad(angle);
            const px = wx + Math.cos(rad) * radius;
            const pz = wz + Math.sin(rad) * radius;
            const screen = worldToScreen(px, wy, pz);
            if (screen) {
                if (!started) {
                    ctx.moveTo(screen.x, screen.y);
                    started = true;
                } else {
                    ctx.lineTo(screen.x, screen.y);
                }
            }
        }
        ctx.closePath();
        ctx.fill();
    }

    // Helper: draw a filled square in world space
    _drawWorldSquare(ctx, wx, wy, wz, size, color) {
        const half = size / 2;
        const corners = [
            worldToScreen(wx - half, wy, wz - half),
            worldToScreen(wx + half, wy, wz - half),
            worldToScreen(wx + half, wy, wz + half),
            worldToScreen(wx - half, wy, wz + half),
        ].filter(c => c !== null);

        if (corners.length >= 3) {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(corners[0].x, corners[0].y);
            for (let i = 1; i < corners.length; i++) {
                ctx.lineTo(corners[i].x, corners[i].y);
            }
            ctx.closePath();
            ctx.fill();
        }
    }

    // Helper: draw a rectangle in world space (stroked or filled)
    _drawWorldRect(ctx, wx, wy, wz, width, height, color, stroke = false) {
        const corners = [
            worldToScreen(wx, wy, wz),
            worldToScreen(wx + width, wy, wz),
            worldToScreen(wx + width, wy, wz + height),
            worldToScreen(wx, wy, wz + height),
        ].filter(c => c !== null);

        if (corners.length >= 3) {
            if (stroke) {
                ctx.strokeStyle = color;
                ctx.lineWidth = 1;
            } else {
                ctx.fillStyle = color;
            }
            ctx.beginPath();
            ctx.moveTo(corners[0].x, corners[0].y);
            for (let i = 1; i < corners.length; i++) {
                ctx.lineTo(corners[i].x, corners[i].y);
            }
            ctx.closePath();
            if (stroke) ctx.stroke();
            else ctx.fill();
        }
    }
}
