export class SceneManager {
    constructor(game) {
        this.game = game;
        this.scenes = [];
        this.transitioning = false;
        this.transitionAlpha = 0;
        this.transitionDirection = 0; // 1 = fading out, -1 = fading in
        this.pendingScene = null;
        this.transitionSpeed = 3;
    }

    get current() {
        return this.scenes.length > 0 ? this.scenes[this.scenes.length - 1] : null;
    }

    push(scene) {
        if (this.current && this.current.onPause) {
            this.current.onPause();
        }
        this.scenes.push(scene);
        if (scene.onEnter) scene.onEnter();
    }

    pop() {
        if (this.scenes.length > 0) {
            const old = this.scenes.pop();
            if (old.onExit) old.onExit();
            if (this.current && this.current.onResume) {
                this.current.onResume();
            }
        }
    }

    replace(scene) {
        if (this.current) {
            const old = this.scenes.pop();
            if (old.onExit) old.onExit();
        }
        this.scenes.push(scene);
        if (scene.onEnter) scene.onEnter();
    }

    transitionTo(scene) {
        this.pendingScene = scene;
        this.transitioning = true;
        this.transitionDirection = 1; // fade out
        this.transitionAlpha = 0;
    }

    update(dt) {
        if (this.transitioning) {
            this.transitionAlpha += this.transitionDirection * this.transitionSpeed * dt;
            if (this.transitionDirection === 1 && this.transitionAlpha >= 1) {
                this.transitionAlpha = 1;
                this.replace(this.pendingScene);
                this.pendingScene = null;
                this.transitionDirection = -1; // fade in
            } else if (this.transitionDirection === -1 && this.transitionAlpha <= 0) {
                this.transitionAlpha = 0;
                this.transitioning = false;
            }
        }

        if (this.current && this.current.update) {
            this.current.update(dt);
        }
    }

    render(ctx) {
        if (this.current && this.current.render) {
            this.current.render(ctx);
        }

        if (this.transitioning && this.transitionAlpha > 0) {
            ctx.fillStyle = `rgba(0, 0, 0, ${this.transitionAlpha})`;
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        }
    }
}
