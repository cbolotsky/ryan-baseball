// TextInput — bridges HTML <input> and Canvas rendering for text entry
// Uses a single shared hidden DOM element positioned over canvas fields

export class TextInput {
    static _el = null;
    static _canvas = null;
    static _isPassword = false;

    static init() {
        if (TextInput._el) return;
        const el = document.createElement('input');
        el.type = 'text';
        el.style.position = 'absolute';
        el.style.left = '-9999px';
        el.style.top = '-9999px';
        el.style.width = '0px';
        el.style.height = '0px';
        el.style.opacity = '0.01';
        el.style.pointerEvents = 'none';
        el.style.zIndex = '9999';
        el.style.fontSize = '16px';
        el.style.fontFamily = 'monospace';
        el.style.background = 'transparent';
        el.style.border = 'none';
        el.style.outline = 'none';
        el.style.color = 'transparent';
        el.style.caretColor = 'transparent';
        el.autocomplete = 'off';
        el.autocapitalize = 'off';
        el.spellcheck = false;
        document.body.appendChild(el);
        TextInput._el = el;
    }

    static activate(canvas, canvasX, canvasY, w, h, initialValue = '', options = {}) {
        TextInput.init();
        const el = TextInput._el;
        TextInput._canvas = canvas;
        TextInput._isPassword = !!options.password;

        const rect = canvas.getBoundingClientRect();
        const scaleX = rect.width / canvas.width;
        const scaleY = rect.height / canvas.height;

        el.style.left = `${rect.left + canvasX * scaleX}px`;
        el.style.top = `${rect.top + canvasY * scaleY}px`;
        el.style.width = `${w * scaleX}px`;
        el.style.height = `${h * scaleY}px`;
        el.style.pointerEvents = 'auto';
        el.type = options.password ? 'password' : 'text';
        el.maxLength = options.maxLength || 64;
        el.value = initialValue;
        el.focus();
    }

    static deactivate() {
        if (!TextInput._el) return;
        const el = TextInput._el;
        el.blur();
        el.style.left = '-9999px';
        el.style.top = '-9999px';
        el.style.width = '0px';
        el.style.height = '0px';
        el.style.pointerEvents = 'none';
        el.value = '';
        TextInput._isPassword = false;
    }

    static getValue() {
        return TextInput._el ? TextInput._el.value : '';
    }

    static setValue(v) {
        if (TextInput._el) TextInput._el.value = v;
    }

    static isFocused() {
        return TextInput._el && document.activeElement === TextInput._el;
    }

    static getDisplayValue() {
        const val = TextInput.getValue();
        return TextInput._isPassword ? '*'.repeat(val.length) : val;
    }

    // Draw a canvas-side text field
    static drawField(ctx, x, y, w, h, label, value, isActive, options = {}) {
        ctx.save();

        // Field background
        ctx.fillStyle = isActive ? 'rgba(40,40,20,0.95)' : 'rgba(20,20,30,0.95)';
        ctx.strokeStyle = isActive ? '#FFD700' : '#555';
        ctx.lineWidth = isActive ? 2 : 1;
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(x, y, w, h, 4) : ctx.rect(x, y, w, h);
        ctx.fill();
        ctx.stroke();

        // Label (above)
        if (label) {
            ctx.font = '11px monospace';
            ctx.fillStyle = '#888';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'bottom';
            ctx.fillText(label, x + 2, y - 2);
        }

        // Value text
        const displayVal = options.password ? '*'.repeat(value.length) : value;
        ctx.font = options.font || '14px monospace';
        ctx.fillStyle = options.color || '#FFF';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';

        // Clip text to field
        ctx.save();
        ctx.beginPath();
        ctx.rect(x + 4, y, w - 8, h);
        ctx.clip();
        ctx.fillText(displayVal || (options.placeholder || ''), x + 6, y + h / 2);
        ctx.restore();

        // Cursor blink when active
        if (isActive && Math.floor(Date.now() / 500) % 2 === 0) {
            const textWidth = ctx.measureText(displayVal).width;
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(x + 6 + textWidth, y + 4, 2, h - 8);
        }

        ctx.restore();
    }
}
