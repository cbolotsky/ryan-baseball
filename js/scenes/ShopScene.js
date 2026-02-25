import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../utils/constants.js';
import { UIRenderer } from '../rendering/UIRenderer.js';
import { EQUIPMENT_CATALOG, RARITY_COLORS } from '../data/equipment.js';
import { Audio } from '../engine/Audio.js';
import { TextInput } from '../utils/TextInput.js';
import { AdminDataManager } from '../systems/AdminDataManager.js';

const CATEGORIES = ['bats', 'gloves', 'helmets', 'cleats', 'accessories'];
const CATEGORY_LABELS = { bats: 'BATS', gloves: 'GLOVES', helmets: 'HELMETS', cleats: 'CLEATS', accessories: 'ACCESSORIES' };

export class ShopScene {
    constructor(game) {
        this.game = game;
        this.economy = game.economyManager;
        this.selectedCategory = 'bats';
        this.hoveredItem = -1;
        this.hoveredButton = -1;
        this.purchaseMessage = null;
        this.purchaseMessageTimer = 0;

        // Secret code system
        this.unlockedSecrets = new Set(AdminDataManager.getUnlockedSecrets());
        this.codeInputActive = false;
    }

    onEnter() {}

    onExit() {
        TextInput.deactivate();
        this.codeInputActive = false;
    }

    _getVisibleItems() {
        const all = EQUIPMENT_CATALOG[this.selectedCategory] || [];
        return all.filter(item => !item.secret || this.unlockedSecrets.has(item.id));
    }

    update(dt) {
        const mx = this.game.input.mouse.x;
        const my = this.game.input.mouse.y;
        this.hoveredItem = -1;
        this.hoveredButton = -1;

        if (this.purchaseMessageTimer > 0) {
            this.purchaseMessageTimer -= dt;
        }

        // Category tabs
        for (let i = 0; i < CATEGORIES.length; i++) {
            const tx = 60 + i * 180;
            if (UIRenderer.isPointInRect(mx, my, tx, 60, 160, 35)) {
                this.hoveredButton = 100 + i;
            }
        }

        // Items (filtered — hides secret unless unlocked)
        const items = this._getVisibleItems();
        for (let i = 0; i < items.length; i++) {
            const iy = 130 + i * 90;
            if (iy > CANVAS_HEIGHT - 150) break;
            if (UIRenderer.isPointInRect(mx, my, 60, iy, 900, 80)) {
                this.hoveredItem = i;
            }
        }

        // Buy button (inside hovered item)
        if (this.hoveredItem >= 0) {
            const iy = 130 + this.hoveredItem * 90;
            if (UIRenderer.isPointInRect(mx, my, 820, iy + 20, 120, 40)) {
                this.hoveredButton = 200; // buy button
            }
        }

        // Code input field area
        if (UIRenderer.isPointInRect(mx, my, 200, CANVAS_HEIGHT - 90, 250, 30)) {
            this.hoveredButton = 301; // code field
        }
        // UNLOCK button
        if (UIRenderer.isPointInRect(mx, my, 470, CANVAS_HEIGHT - 95, 110, 36)) {
            this.hoveredButton = 300; // unlock button
        }

        // Back button
        if (UIRenderer.isPointInRect(mx, my, 20, CANVAS_HEIGHT - 60, 120, 40)) {
            this.hoveredButton = 0;
        }

        if (this.game.input.isMouseJustPressed()) {
            if (this.hoveredButton >= 0) Audio.uiClick();

            // Category tabs
            for (let i = 0; i < CATEGORIES.length; i++) {
                if (this.hoveredButton === 100 + i) {
                    this.selectedCategory = CATEGORIES[i];
                }
            }

            // Buy
            if (this.hoveredButton === 200 && this.hoveredItem >= 0) {
                this._buyItem(items[this.hoveredItem]);
            }

            // Code field click — activate text input
            if (this.hoveredButton === 301) {
                if (!this.codeInputActive) {
                    const canvas = this.game.canvas || document.getElementById('gameCanvas');
                    TextInput.activate(canvas, 200, CANVAS_HEIGHT - 90, 250, 30, '', { maxLength: 20 });
                    this.codeInputActive = true;
                }
            } else if (this.hoveredButton !== 300 && this.codeInputActive) {
                // Clicked somewhere else (not code field, not unlock) — deactivate
                TextInput.deactivate();
                this.codeInputActive = false;
            }

            // UNLOCK button
            if (this.hoveredButton === 300) {
                const code = TextInput.getValue().trim();
                if (code) {
                    const item = AdminDataManager.tryUnlockCode(code);
                    if (item) {
                        this.unlockedSecrets.add(item.id);
                        this.purchaseMessage = `Unlocked: ${item.name}!`;
                        this.purchaseMessageTimer = 3;
                        TextInput.setValue('');
                    } else {
                        this.purchaseMessage = 'INVALID CODE';
                        this.purchaseMessageTimer = 2;
                    }
                }
            }

            // Back
            if (this.hoveredButton === 0) {
                this._goBack();
            }
        }

        // Enter key while code input is active
        if (this.codeInputActive && this.game.input.isKeyJustPressed && this.game.input.isKeyJustPressed('Enter')) {
            const code = TextInput.getValue().trim();
            if (code) {
                const item = AdminDataManager.tryUnlockCode(code);
                if (item) {
                    this.unlockedSecrets.add(item.id);
                    this.purchaseMessage = `Unlocked: ${item.name}!`;
                    this.purchaseMessageTimer = 3;
                    TextInput.setValue('');
                } else {
                    this.purchaseMessage = 'INVALID CODE';
                    this.purchaseMessageTimer = 2;
                }
            }
        }
    }

    _buyItem(item) {
        if (this.economy.ownsItem(item.id)) {
            this.purchaseMessage = 'Already owned!';
            this.purchaseMessageTimer = 2;
            return;
        }
        if (item.cost === 0) {
            this.purchaseMessage = 'Free items are already equipped!';
            this.purchaseMessageTimer = 2;
            return;
        }
        if (!this.economy.canAfford(item.cost)) {
            this.purchaseMessage = 'Not enough money!';
            this.purchaseMessageTimer = 2;
            return;
        }

        if (this.economy.purchaseItem(item)) {
            this.game.inventory.push(item);
            this.purchaseMessage = `Bought ${item.name}!`;
            this.purchaseMessageTimer = 2;
        }
    }

    _goBack() {
        const { SeasonScene } = await_import_season();
        this.game.sceneManager.transitionTo(new SeasonScene(this.game));
    }

    render(ctx) {
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Header
        UIRenderer.drawText(ctx, 'EQUIPMENT SHOP', CANVAS_WIDTH / 2, 28, {
            font: 'bold 32px monospace', color: '#FFD700', shadow: true, shadowOffset: 3,
        });

        // Money
        UIRenderer.drawText(ctx, `$${this.economy.balance}`, CANVAS_WIDTH - 80, 28, {
            font: 'bold 20px monospace', color: '#44FF44',
        });

        // Category tabs
        for (let i = 0; i < CATEGORIES.length; i++) {
            const cat = CATEGORIES[i];
            const active = this.selectedCategory === cat;
            const tx = 60 + i * 180;
            UIRenderer.drawButton(ctx, tx, 60, 160, 35, CATEGORY_LABELS[cat], this.hoveredButton === 100 + i || active, {
                normal: active ? '#333' : '#1a1a1a',
                hover: '#444',
                text: active ? '#FFD700' : '#888',
                border: active ? '#FFD700' : '#444',
            });
        }

        // Items (filtered — hides secret unless unlocked)
        const items = this._getVisibleItems();
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const iy = 130 + i * 90;
            if (iy > CANVAS_HEIGHT - 150) break;

            const hovered = this.hoveredItem === i;
            const owned = this.economy.ownsItem(item.id);
            const canAfford = this.economy.canAfford(item.cost);

            this._drawItemCard(ctx, 60, iy, 900, 80, item, hovered, owned, canAfford);
        }

        // --- ENTER CODE section ---
        this._drawCodeSection(ctx);

        // Purchase message
        if (this.purchaseMessageTimer > 0 && this.purchaseMessage) {
            const alpha = Math.min(1, this.purchaseMessageTimer);
            ctx.save();
            ctx.globalAlpha = alpha;
            UIRenderer.drawText(ctx, this.purchaseMessage, CANVAS_WIDTH / 2, CANVAS_HEIGHT - 135, {
                font: 'bold 18px monospace', color: '#FFD700', shadow: true, shadowOffset: 2,
            });
            ctx.restore();
        }

        // Back button
        UIRenderer.drawButton(ctx, 20, CANVAS_HEIGHT - 60, 120, 40, 'BACK', this.hoveredButton === 0, {
            normal: '#222', hover: '#444', text: '#AAA', border: '#666',
        });
    }

    _drawCodeSection(ctx) {
        // Background strip
        ctx.fillStyle = 'rgba(15,15,30,0.9)';
        ctx.fillRect(150, CANVAS_HEIGHT - 110, 460, 50);
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 1;
        ctx.strokeRect(150, CANVAS_HEIGHT - 110, 460, 50);

        // Lock icon
        ctx.save();
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 16px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🔒', 175, CANVAS_HEIGHT - 85);
        ctx.restore();

        // Text field
        const codeValue = this.codeInputActive ? TextInput.getValue() : '';
        TextInput.drawField(ctx, 200, CANVAS_HEIGHT - 100, 250, 30, '', codeValue, this.codeInputActive, {
            placeholder: 'Enter secret code...',
            font: '14px monospace',
        });

        // UNLOCK button
        UIRenderer.drawButton(ctx, 470, CANVAS_HEIGHT - 105, 110, 36, 'UNLOCK', this.hoveredButton === 300, {
            normal: '#2a1a00', hover: '#4a3a00', text: '#FFD700', border: '#FFD700',
        });
    }

    _drawItemCard(ctx, x, y, w, h, item, hovered, owned, canAfford) {
        const rarityColor = RARITY_COLORS[item.rarity] || '#AAA';
        const bgColor = owned
            ? 'rgba(0,40,0,0.6)'
            : (hovered ? 'rgba(40,40,40,0.8)' : 'rgba(15,15,25,0.8)');

        UIRenderer.drawPanel(ctx, x, y, w, h, {
            bgColor,
            borderColor: owned ? '#44FF44' : (hovered ? rarityColor : '#333'),
            borderWidth: hovered ? 2 : 1,
        });

        ctx.save();

        // Rarity bar
        ctx.fillStyle = rarityColor;
        ctx.fillRect(x + 2, y + 2, 5, h - 4);

        // Item icon
        this._drawItemIcon(ctx, x + 48, y + h / 2, item, rarityColor);

        const textX = x + 95;

        // Name
        ctx.font = 'bold 18px monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#FFF';
        ctx.fillText(item.name, textX, y + 22);

        // Rarity label
        ctx.font = '12px monospace';
        ctx.fillStyle = rarityColor;
        ctx.fillText(item.rarity.toUpperCase(), textX, y + 42);

        // Description
        ctx.fillStyle = '#AAA';
        ctx.font = '14px monospace';
        ctx.fillText(item.description, textX, y + 62);

        // Bonuses
        let bx = 500;
        for (const [stat, value] of Object.entries(item.bonuses || {})) {
            ctx.fillStyle = '#44FF44';
            ctx.font = 'bold 14px monospace';
            ctx.fillText(`+${value} ${stat.toUpperCase()}`, bx, y + 35);
            bx += 100;
        }

        // Price / owned status
        if (owned) {
            ctx.font = 'bold 16px monospace';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#44FF44';
            ctx.fillText('OWNED', x + 880, y + 40);
        } else if (item.cost === 0) {
            ctx.font = 'bold 14px monospace';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#888';
            ctx.fillText('DEFAULT', x + 880, y + 40);
        } else {
            // Price
            ctx.font = 'bold 18px monospace';
            ctx.textAlign = 'center';
            ctx.fillStyle = canAfford ? '#44FF44' : '#FF4444';
            ctx.fillText(`$${item.cost}`, x + 770, y + 40);

            // Buy button
            if (hovered && canAfford) {
                UIRenderer.drawButton(ctx, 820, y + 20, 120, 40, 'BUY', this.hoveredButton === 200, {
                    normal: '#1a4a1a', hover: '#2a6a2a', text: '#44FF44', border: '#44FF44',
                });
            }
        }

        ctx.restore();
    }

    _drawItemIcon(ctx, cx, cy, item, rarityColor) {
        ctx.save();
        // Icon background circle
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.beginPath();
        ctx.arc(cx, cy, 28, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = rarityColor;
        ctx.lineWidth = 2;
        ctx.stroke();

        const isLegendary = item.rarity === 'legendary';
        const iconColor = isLegendary ? '#FFD700' : rarityColor;

        switch (item.type) {
            case 'bat': this._drawBatIcon(ctx, cx, cy, iconColor, isLegendary); break;
            case 'glove': this._drawGloveIcon(ctx, cx, cy, iconColor, item.id); break;
            case 'helmet': this._drawHelmetIcon(ctx, cx, cy, iconColor); break;
            case 'cleats': this._drawCleatsIcon(ctx, cx, cy, iconColor); break;
            case 'accessory': this._drawAccessoryIcon(ctx, cx, cy, iconColor, item.id); break;
        }
        ctx.restore();
    }

    _drawBatIcon(ctx, cx, cy, color, isLegendary) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(-Math.PI / 4);
        // Bat handle
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(-3, -2, 6, 22);
        // Bat barrel
        ctx.fillStyle = isLegendary ? '#FFD700' : '#CD853F';
        ctx.beginPath();
        ctx.moveTo(-4, -2);
        ctx.lineTo(4, -2);
        ctx.lineTo(6, -20);
        ctx.lineTo(-6, -20);
        ctx.closePath();
        ctx.fill();
        // Bat tip
        ctx.beginPath();
        ctx.arc(0, -20, 6, Math.PI, 0);
        ctx.fill();
        // Grip lines
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(-3, 10 + i * 4);
            ctx.lineTo(3, 10 + i * 4);
            ctx.stroke();
        }
        // Lightning effect for legendary
        if (isLegendary) {
            ctx.strokeStyle = '#FFA500';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(-2, -15);
            ctx.lineTo(2, -10);
            ctx.lineTo(-1, -6);
            ctx.lineTo(3, -1);
            ctx.stroke();
        }
        ctx.restore();
    }

    _drawGloveIcon(ctx, cx, cy, color, itemId) {
        ctx.save();
        ctx.translate(cx, cy);
        // Palm
        ctx.fillStyle = itemId === 'gold_glove' ? '#DAA520' : '#8B4513';
        ctx.beginPath();
        ctx.arc(0, 2, 14, 0, Math.PI * 2);
        ctx.fill();
        // Webbing/pocket
        ctx.fillStyle = itemId === 'gold_glove' ? '#FFD700' : '#A0522D';
        ctx.beginPath();
        ctx.arc(0, -2, 10, -Math.PI * 0.8, -Math.PI * 0.2);
        ctx.fill();
        // Fingers (4 bumps on top)
        ctx.fillStyle = itemId === 'gold_glove' ? '#DAA520' : '#8B4513';
        for (let i = 0; i < 4; i++) {
            const angle = -Math.PI * 0.8 + i * (Math.PI * 0.6 / 3);
            const fx = Math.cos(angle) * 16;
            const fy = Math.sin(angle) * 16;
            ctx.beginPath();
            ctx.arc(fx, fy, 5, 0, Math.PI * 2);
            ctx.fill();
        }
        // Thumb
        ctx.beginPath();
        ctx.arc(12, 8, 5, 0, Math.PI * 2);
        ctx.fill();
        // Lacing
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, -2, 10, -Math.PI * 0.7, -Math.PI * 0.3);
        ctx.stroke();
        ctx.restore();
    }

    _drawHelmetIcon(ctx, cx, cy, color) {
        ctx.save();
        ctx.translate(cx, cy);
        // Main helmet dome
        ctx.fillStyle = '#222';
        ctx.beginPath();
        ctx.arc(0, -2, 16, -Math.PI, 0);
        ctx.lineTo(16, 8);
        ctx.lineTo(-16, 8);
        ctx.closePath();
        ctx.fill();
        // Brim
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.moveTo(-18, 6);
        ctx.lineTo(20, 6);
        ctx.lineTo(22, 12);
        ctx.lineTo(-16, 12);
        ctx.closePath();
        ctx.fill();
        // Ear guard
        ctx.fillStyle = '#222';
        ctx.beginPath();
        ctx.arc(-14, 4, 8, 0, Math.PI * 2);
        ctx.fill();
        // Shine highlight
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(-2, -6, 10, -Math.PI * 0.8, -Math.PI * 0.3);
        ctx.stroke();
        // Team color stripe
        ctx.fillStyle = color;
        ctx.fillRect(-8, -16, 16, 3);
        ctx.restore();
    }

    _drawCleatsIcon(ctx, cx, cy, color) {
        ctx.save();
        ctx.translate(cx, cy);
        // Shoe body
        ctx.fillStyle = '#222';
        ctx.beginPath();
        ctx.moveTo(-14, -4);
        ctx.lineTo(-14, 6);
        ctx.lineTo(16, 6);
        ctx.lineTo(18, 0);
        ctx.lineTo(10, -8);
        ctx.lineTo(-8, -10);
        ctx.closePath();
        ctx.fill();
        // Sole
        ctx.fillStyle = '#111';
        ctx.fillRect(-14, 6, 32, 4);
        // Cleats/studs
        ctx.fillStyle = '#666';
        for (let i = 0; i < 4; i++) {
            ctx.fillRect(-10 + i * 8, 10, 3, 5);
        }
        // Swoosh / accent
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-8, -2);
        ctx.quadraticCurveTo(2, -10, 14, -2);
        ctx.stroke();
        // Lace dots
        ctx.fillStyle = '#FFF';
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.arc(-4 + i * 5, -6, 1.5, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    _drawAccessoryIcon(ctx, cx, cy, color, itemId) {
        ctx.save();
        ctx.translate(cx, cy);
        switch (itemId) {
            case 'wristband':
                // Wristband
                ctx.fillStyle = '#FFD700';
                ctx.beginPath();
                ctx.ellipse(0, 0, 14, 10, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#0a0a1a';
                ctx.beginPath();
                ctx.ellipse(0, 0, 10, 6, 0, 0, Math.PI * 2);
                ctx.fill();
                // Stripe
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.ellipse(0, -2, 13, 8, 0, Math.PI * 0.1, Math.PI * 0.9);
                ctx.stroke();
                break;
            case 'sunglasses':
                // Sunglasses
                ctx.strokeStyle = '#333';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(-14, 0);
                ctx.lineTo(14, 0);
                ctx.stroke();
                // Left lens
                ctx.fillStyle = '#1a1a3a';
                ctx.strokeStyle = color;
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.ellipse(-7, 4, 8, 6, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                // Right lens
                ctx.beginPath();
                ctx.ellipse(7, 4, 8, 6, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                // Lens shine
                ctx.strokeStyle = 'rgba(255,255,255,0.3)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(-7, 2, 4, -Math.PI * 0.8, -Math.PI * 0.3);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(7, 2, 4, -Math.PI * 0.8, -Math.PI * 0.3);
                ctx.stroke();
                break;
            case 'chain':
                // Gold chain
                ctx.strokeStyle = '#FFD700';
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.arc(0, -8, 14, Math.PI * 0.15, Math.PI * 0.85);
                ctx.stroke();
                // Chain links
                ctx.lineWidth = 1;
                for (let i = 0; i < 7; i++) {
                    const angle = Math.PI * 0.15 + i * (Math.PI * 0.7 / 6);
                    const lx = Math.cos(angle) * 14;
                    const ly = -8 + Math.sin(angle) * 14;
                    ctx.beginPath();
                    ctx.arc(lx, ly, 2, 0, Math.PI * 2);
                    ctx.stroke();
                }
                // Pendant
                ctx.fillStyle = '#FFD700';
                ctx.beginPath();
                ctx.moveTo(0, 8);
                ctx.lineTo(-5, 16);
                ctx.lineTo(5, 16);
                ctx.closePath();
                ctx.fill();
                break;
            case 'eye_black':
                // Eye black marks
                ctx.fillStyle = '#111';
                // Left mark
                ctx.beginPath();
                ctx.ellipse(-8, 0, 6, 3, -0.2, 0, Math.PI * 2);
                ctx.fill();
                // Right mark
                ctx.beginPath();
                ctx.ellipse(8, 0, 6, 3, 0.2, 0, Math.PI * 2);
                ctx.fill();
                // Eyes above
                ctx.fillStyle = '#FFF';
                ctx.beginPath();
                ctx.ellipse(-8, -8, 5, 3, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.ellipse(8, -8, 5, 3, 0, 0, Math.PI * 2);
                ctx.fill();
                // Pupils
                ctx.fillStyle = '#333';
                ctx.beginPath();
                ctx.arc(-8, -8, 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(8, -8, 2, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 'arm_sleeve':
                // Arm sleeve
                ctx.fillStyle = '#222';
                ctx.beginPath();
                ctx.moveTo(-6, -16);
                ctx.lineTo(6, -16);
                ctx.lineTo(8, 16);
                ctx.lineTo(-8, 16);
                ctx.closePath();
                ctx.fill();
                // Stripes
                ctx.strokeStyle = color;
                ctx.lineWidth = 1.5;
                for (let i = 0; i < 4; i++) {
                    ctx.beginPath();
                    ctx.moveTo(-6, -10 + i * 8);
                    ctx.lineTo(6, -10 + i * 8);
                    ctx.stroke();
                }
                // Fabric texture
                ctx.strokeStyle = 'rgba(255,255,255,0.1)';
                ctx.lineWidth = 0.5;
                for (let i = 0; i < 6; i++) {
                    ctx.beginPath();
                    ctx.moveTo(-7, -14 + i * 6);
                    ctx.lineTo(7, -14 + i * 6);
                    ctx.stroke();
                }
                break;
            default:
                // Generic star icon
                ctx.fillStyle = color;
                this._drawStar(ctx, 0, 0, 12, 6, 5);
                break;
        }
        ctx.restore();
    }

    _drawStar(ctx, cx, cy, outerR, innerR, points) {
        ctx.beginPath();
        for (let i = 0; i < points * 2; i++) {
            const r = i % 2 === 0 ? outerR : innerR;
            const angle = (i * Math.PI) / points - Math.PI / 2;
            const x = cx + Math.cos(angle) * r;
            const y = cy + Math.sin(angle) * r;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
    }
}

// Lazy import
function await_import_season() { return { SeasonScene: ShopScene._SeasonScene }; }
ShopScene._SeasonScene = null;
