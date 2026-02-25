export class Input {
    constructor(canvas) {
        this.canvas = canvas;
        this.keys = {};
        this.keysJustPressed = {};
        this.mouse = {
            x: 0,
            y: 0,
            down: false,
            justPressed: false,
            justReleased: false,
        };

        this._boundMouseMove = this._onMouseMove.bind(this);
        this._boundMouseDown = this._onMouseDown.bind(this);
        this._boundMouseUp = this._onMouseUp.bind(this);
        this._boundKeyDown = this._onKeyDown.bind(this);
        this._boundKeyUp = this._onKeyUp.bind(this);
        this._boundContextMenu = (e) => e.preventDefault();

        canvas.addEventListener('mousemove', this._boundMouseMove);
        canvas.addEventListener('mousedown', this._boundMouseDown);
        canvas.addEventListener('mouseup', this._boundMouseUp);
        canvas.addEventListener('contextmenu', this._boundContextMenu);
        window.addEventListener('keydown', this._boundKeyDown);
        window.addEventListener('keyup', this._boundKeyUp);
    }

    _getCanvasCoords(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY,
        };
    }

    _onMouseMove(e) {
        const coords = this._getCanvasCoords(e);
        this.mouse.x = coords.x;
        this.mouse.y = coords.y;
    }

    _onMouseDown(e) {
        this.mouse.down = true;
        this.mouse.justPressed = true;
        const coords = this._getCanvasCoords(e);
        this.mouse.x = coords.x;
        this.mouse.y = coords.y;
    }

    _onMouseUp(e) {
        this.mouse.down = false;
        this.mouse.justReleased = true;
    }

    _onKeyDown(e) {
        if (!this.keys[e.code]) {
            this.keysJustPressed[e.code] = true;
        }
        this.keys[e.code] = true;
    }

    _onKeyUp(e) {
        this.keys[e.code] = false;
    }

    isKeyDown(code) {
        return !!this.keys[code];
    }

    isKeyJustPressed(code) {
        return !!this.keysJustPressed[code];
    }

    isMouseDown() {
        return this.mouse.down;
    }

    isMouseJustPressed() {
        return this.mouse.justPressed;
    }

    isMouseJustReleased() {
        return this.mouse.justReleased;
    }

    endFrame() {
        this.keysJustPressed = {};
        this.mouse.justPressed = false;
        this.mouse.justReleased = false;
    }

    destroy() {
        this.canvas.removeEventListener('mousemove', this._boundMouseMove);
        this.canvas.removeEventListener('mousedown', this._boundMouseDown);
        this.canvas.removeEventListener('mouseup', this._boundMouseUp);
        this.canvas.removeEventListener('contextmenu', this._boundContextMenu);
        window.removeEventListener('keydown', this._boundKeyDown);
        window.removeEventListener('keyup', this._boundKeyUp);
    }
}
