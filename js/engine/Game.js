import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../utils/constants.js';
import { Input } from './Input.js';
import { SceneManager } from '../scenes/SceneManager.js';
import { updateCamera } from '../utils/perspective.js';
import { Audio } from './Audio.js';
import { ParticleSystem } from '../rendering/ParticleSystem.js';

export class Game {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = CANVAS_WIDTH;
        this.canvas.height = CANVAS_HEIGHT;

        this.input = new Input(this.canvas);
        this.sceneManager = new SceneManager(this);
        this.particles = new ParticleSystem();

        // Initialize audio system
        Audio.init();

        // Game-wide state (set by scenes)
        this.playerTeam = null;
        this.seasonManager = null;
        this.economyManager = null;
        this.inventory = [];
        this.settings = {
            soundEnabled: true,
            musicEnabled: true,
        };

        this.lastTime = 0;
        this.running = false;
        this.fps = 0;
        this.frameCount = 0;
        this.fpsTimer = 0;
    }

    start(initialScene) {
        this.running = true;
        this.sceneManager.push(initialScene);
        this.lastTime = performance.now();
        requestAnimationFrame((t) => this._loop(t));
    }

    _loop(timestamp) {
        const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05); // cap at 50ms
        this.lastTime = timestamp;

        // FPS counter
        this.frameCount++;
        this.fpsTimer += dt;
        if (this.fpsTimer >= 1) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.fpsTimer = 0;
        }

        this._update(dt);
        this._render();

        if (this.running) {
            requestAnimationFrame((t) => this._loop(t));
        }
    }

    _update(dt) {
        updateCamera(dt);
        this.sceneManager.update(dt);
        this.input.endFrame();
    }

    _render() {
        this.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        this.sceneManager.render(this.ctx);

        // FPS display (debug)
        this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
        this.ctx.fillRect(5, 5, 60, 20);
        this.ctx.fillStyle = '#0f0';
        this.ctx.font = '12px monospace';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`FPS: ${this.fps}`, 10, 19);
    }

    stop() {
        this.running = false;
    }
}
