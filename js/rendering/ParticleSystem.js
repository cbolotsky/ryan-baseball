import { worldToScreen } from '../utils/perspective.js';

class Particle {
    constructor(x, y, vx, vy, life, color, size, gravity = 0) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.life = life;
        this.maxLife = life;
        this.color = color;
        this.size = size;
        this.gravity = gravity;
        this.alpha = 1;
    }

    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.vy += this.gravity * dt;
        this.life -= dt;
        this.alpha = Math.max(0, this.life / this.maxLife);
    }

    get alive() {
        return this.life > 0;
    }
}

export class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    update(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update(dt);
            if (!this.particles[i].alive) {
                this.particles.splice(i, 1);
            }
        }
    }

    render(ctx) {
        for (const p of this.particles) {
            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * p.alpha, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    get active() {
        return this.particles.length > 0;
    }

    clear() {
        this.particles = [];
    }

    // === EFFECT PRESETS ===

    // Dirt burst when ball hits ground
    dirtBurst(screenX, screenY, count = 12) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
            const speed = 40 + Math.random() * 80;
            this.particles.push(new Particle(
                screenX, screenY,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed - 30,
                0.4 + Math.random() * 0.3,
                ['#8B7355', '#A0926B', '#6B5B3D'][Math.floor(Math.random() * 3)],
                2 + Math.random() * 3,
                200, // gravity
            ));
        }
    }

    // Dust cloud when player slides/runs
    dustCloud(screenX, screenY, count = 6) {
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(
                screenX + (Math.random() - 0.5) * 20,
                screenY + (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 30,
                -Math.random() * 20 - 10,
                0.5 + Math.random() * 0.5,
                'rgba(180, 160, 120, 0.6)',
                4 + Math.random() * 6,
                -10, // float up
            ));
        }
    }

    // Fireworks for home runs / celebrations
    fireworks(screenX, screenY, count = 30) {
        const colors = ['#FFD700', '#FF4444', '#44FF44', '#4488FF', '#FF44FF', '#FFAA00'];
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const speed = 100 + Math.random() * 150;
            this.particles.push(new Particle(
                screenX, screenY,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                0.6 + Math.random() * 0.6,
                colors[Math.floor(Math.random() * colors.length)],
                2 + Math.random() * 4,
                100,
            ));
        }
    }

    // Sparkle effect (bat contact, catch)
    sparkle(screenX, screenY, count = 8, color = '#FFD700') {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 30 + Math.random() * 60;
            this.particles.push(new Particle(
                screenX, screenY,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                0.3 + Math.random() * 0.3,
                color,
                1 + Math.random() * 3,
                50,
            ));
        }
    }

    // Strikeout effect (K)
    strikeoutEffect(screenX, screenY) {
        // Red burst
        for (let i = 0; i < 15; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 50 + Math.random() * 100;
            this.particles.push(new Particle(
                screenX, screenY,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                0.5 + Math.random() * 0.3,
                ['#FF4444', '#FF6666', '#CC0000'][Math.floor(Math.random() * 3)],
                2 + Math.random() * 3,
                80,
            ));
        }
    }

    // Screen shake helper (returns offset to apply)
    static shakeOffset(intensity, timer) {
        if (timer <= 0) return { x: 0, y: 0 };
        const decay = timer * intensity;
        return {
            x: (Math.random() - 0.5) * decay * 2,
            y: (Math.random() - 0.5) * decay * 2,
        };
    }
}
