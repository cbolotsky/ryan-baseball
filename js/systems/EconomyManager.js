import { GAME_REWARDS } from '../data/equipment.js';
import { GAME_SETTINGS } from '../utils/constants.js';

export class EconomyManager {
    constructor(startingMoney = GAME_SETTINGS.startingMoney) {
        this.money = startingMoney;
        this.purchasedItems = []; // item IDs already bought
        this.transactionLog = [];
    }

    get balance() {
        return this.money;
    }

    canAfford(cost) {
        return this.money >= cost;
    }

    spend(amount, description = '') {
        if (amount > this.money) return false;
        this.money -= amount;
        this.transactionLog.push({ type: 'spend', amount, description, balance: this.money });
        return true;
    }

    earn(amount, description = '') {
        this.money += amount;
        this.transactionLog.push({ type: 'earn', amount, description, balance: this.money });
    }

    purchaseItem(item) {
        if (!this.canAfford(item.cost)) return false;
        if (this.purchasedItems.includes(item.id)) return false; // already owned
        this.spend(item.cost, `Purchased ${item.name}`);
        this.purchasedItems.push(item.id);
        return true;
    }

    ownsItem(itemId) {
        return this.purchasedItems.includes(itemId);
    }

    // Calculate game rewards
    calculateGameReward(won, stats = {}) {
        const rewards = GAME_REWARDS;
        let total = 0;
        let breakdown = [];

        if (won) {
            const base = Math.floor(Math.random() * (rewards.win.max - rewards.win.min + 1)) + rewards.win.min;
            total += base;
            breakdown.push({ label: 'Win Bonus', amount: base });
        } else {
            const base = Math.floor(Math.random() * (rewards.loss.max - rewards.loss.min + 1)) + rewards.loss.min;
            total += base;
            breakdown.push({ label: 'Game Pay', amount: base });
        }

        if (stats.homeRuns > 0) {
            const hrBonus = stats.homeRuns * rewards.homeRun;
            total += hrBonus;
            breakdown.push({ label: `Home Runs (${stats.homeRuns})`, amount: hrBonus });
        }

        if (stats.strikeouts > 0) {
            const kBonus = stats.strikeouts * rewards.strikeoutPitching;
            total += kBonus;
            breakdown.push({ label: `Strikeouts (${stats.strikeouts})`, amount: kBonus });
        }

        if (stats.worldSeriesWin) {
            total += rewards.worldSeriesWin;
            breakdown.push({ label: 'World Series Champion!', amount: rewards.worldSeriesWin });
        }

        return { total, breakdown };
    }

    awardGameReward(won, stats = {}) {
        const reward = this.calculateGameReward(won, stats);
        this.earn(reward.total, won ? 'Game win' : 'Game loss');
        return reward;
    }
}
