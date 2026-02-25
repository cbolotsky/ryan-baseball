export const EQUIPMENT_CATALOG = {
    bats: [
        { id: 'wood_bat', name: 'Wooden Bat', type: 'bat', cost: 0, rarity: 'common', bonuses: {}, description: 'Standard wooden bat.' },
        { id: 'alloy_bat', name: 'Alloy Power Bat', type: 'bat', cost: 500, rarity: 'uncommon', bonuses: { power: 5 }, description: '+5 Power' },
        { id: 'composite_bat', name: 'Composite Contact Bat', type: 'bat', cost: 500, rarity: 'uncommon', bonuses: { contact: 5 }, description: '+5 Contact' },
        { id: 'gold_bat', name: 'Gold Slugger', type: 'bat', cost: 2000, rarity: 'rare', bonuses: { power: 10, contact: 5 }, description: '+10 Power, +5 Contact' },
        { id: 'lightning_bat', name: 'Lightning Bolt Bat', type: 'bat', cost: 5000, rarity: 'legendary', bonuses: { power: 15, contact: 10 }, description: 'Team special! +15 Power, +10 Contact', cosmetic: { trail: 'lightning' } },
    ],
    gloves: [
        { id: 'basic_glove', name: 'Basic Glove', type: 'glove', cost: 0, rarity: 'common', bonuses: {}, description: 'Standard leather glove.' },
        { id: 'pro_glove', name: 'Pro Fielder Glove', type: 'glove', cost: 500, rarity: 'uncommon', bonuses: { fielding: 5 }, description: '+5 Fielding' },
        { id: 'gold_glove', name: 'Gold Glove', type: 'glove', cost: 3000, rarity: 'rare', bonuses: { fielding: 10, arm: 5 }, description: '+10 Fielding, +5 Arm' },
        { id: 'catchers_mitt', name: "Catcher's Pro Mitt", type: 'glove', cost: 1500, rarity: 'uncommon', bonuses: { fielding: 8, arm: 3 }, description: 'Catcher specialty. +8 Fielding, +3 Arm' },
    ],
    helmets: [
        { id: 'basic_helmet', name: 'Standard Helmet', type: 'helmet', cost: 0, rarity: 'common', bonuses: {}, description: 'Basic batting helmet.' },
        { id: 'pro_helmet', name: 'Pro Batting Helmet', type: 'helmet', cost: 800, rarity: 'uncommon', bonuses: { contact: 3 }, description: '+3 Contact' },
        { id: 'gold_helmet', name: 'Black & Gold Helmet', type: 'helmet', cost: 2500, rarity: 'rare', bonuses: { contact: 5, power: 3 }, description: 'Team colors! +5 Contact, +3 Power' },
    ],
    cleats: [
        { id: 'basic_cleats', name: 'Standard Cleats', type: 'cleats', cost: 0, rarity: 'common', bonuses: {}, description: 'Basic cleats.' },
        { id: 'speed_cleats', name: 'Speed Cleats', type: 'cleats', cost: 600, rarity: 'uncommon', bonuses: { speed: 5 }, description: '+5 Speed' },
        { id: 'turbo_cleats', name: 'Turbo Cleats', type: 'cleats', cost: 2000, rarity: 'rare', bonuses: { speed: 10 }, description: '+10 Speed' },
    ],
    accessories: [
        { id: 'wristband', name: 'Sweatband', type: 'accessory', cost: 200, rarity: 'common', bonuses: { contact: 2 }, description: '+2 Contact' },
        { id: 'sunglasses', name: 'Oakley Shades', type: 'accessory', cost: 400, rarity: 'uncommon', bonuses: { fielding: 3 }, description: '+3 Fielding' },
        { id: 'chain', name: 'Gold Chain', type: 'accessory', cost: 1000, rarity: 'uncommon', bonuses: { power: 3 }, description: '+3 Power (swagger)', cosmetic: { neckChain: true } },
        { id: 'eye_black', name: 'Eye Black', type: 'accessory', cost: 300, rarity: 'common', bonuses: { contact: 2 }, description: '+2 Contact' },
        { id: 'arm_sleeve', name: 'Compression Sleeve', type: 'accessory', cost: 500, rarity: 'uncommon', bonuses: { arm: 4 }, description: '+4 Arm Strength' },
    ],
};

export const RARITY_COLORS = {
    common: '#AAAAAA',
    uncommon: '#44FF44',
    rare: '#4488FF',
    legendary: '#FFD700',
};

export const GAME_REWARDS = {
    win: { min: 500, max: 1000 },
    loss: { min: 100, max: 300 },
    homeRun: 100,
    strikeoutPitching: 25,
    worldSeriesWin: 10000,
};
