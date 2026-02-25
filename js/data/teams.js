// Opponent teams with NJ-themed names and colors
export const OPPONENT_TEAMS = [
    {
        id: 'manalapan_braves',
        name: 'Manalapan Braves',
        abbreviation: 'MAN',
        colors: { primary: '#8B0000', secondary: '#FFFFFF', accent: '#FFD700' },
        difficulty: 2,
    },
    {
        id: 'marlboro_mustangs',
        name: 'Marlboro Mustangs',
        abbreviation: 'MAR',
        colors: { primary: '#004D00', secondary: '#FFFFFF', accent: '#C0C0C0' },
        difficulty: 2,
    },
    {
        id: 'bayshore_bulldogs',
        name: 'Bayshore Bulldogs',
        abbreviation: 'BAY',
        colors: { primary: '#CC0000', secondary: '#FFFFFF', accent: '#CC0000' },
        difficulty: 3,
    },
    {
        id: 'matawan_mavericks',
        name: 'Matawan Mavericks',
        abbreviation: 'MAT',
        colors: { primary: '#003399', secondary: '#C0C0C0', accent: '#FFFFFF' },
        difficulty: 3,
    },
    {
        id: 'sayreville_scorpions',
        name: 'Sayreville Scorpions',
        abbreviation: 'SAY',
        colors: { primary: '#006600', secondary: '#000000', accent: '#FFFFFF' },
        difficulty: 4,
    },
    {
        id: 'edison_eagles',
        name: 'Edison Eagles',
        abbreviation: 'EDI',
        colors: { primary: '#FF6600', secondary: '#000033', accent: '#FFFFFF' },
        difficulty: 4,
    },
    {
        id: 'woodbridge_warriors',
        name: 'Woodbridge Warriors',
        abbreviation: 'WOO',
        colors: { primary: '#660099', secondary: '#FFD700', accent: '#FFFFFF' },
        difficulty: 5,
    },
    {
        id: 'freehold_falcons',
        name: 'Freehold Falcons',
        abbreviation: 'FRE',
        colors: { primary: '#800000', secondary: '#FFFFFF', accent: '#800000' },
        difficulty: 5,
    },
    {
        id: 'monroe_mustangs',
        name: 'Monroe Mustangs',
        abbreviation: 'MON',
        colors: { primary: '#008080', secondary: '#000000', accent: '#FFFFFF' },
        difficulty: 6,
    },
    {
        id: 'middletown_monarchs',
        name: 'Middletown Monarchs',
        abbreviation: 'MID',
        colors: { primary: '#0000AA', secondary: '#FFD700', accent: '#FFFFFF' },
        difficulty: 7,
    },
];

// Generate a roster for an opponent team based on difficulty
export function generateOpponentRoster(team) {
    const positions = ['C', 'SP', 'SS', '2B', '3B', '1B', 'LF', 'CF', 'RF'];
    const firstNames = [
        'Jake', 'Tyler', 'Chris', 'Nick', 'Sam', 'David', 'Marcus', 'Alex', 'Matt',
        'Josh', 'Ethan', 'Dylan', 'Brandon', 'Mike', 'Kevin', 'Ryan', 'Jason', 'Kyle',
    ];
    const lastNames = [
        'Mitchell', 'Garcia', 'Baker', 'Torres', 'Wilson', 'Kim', 'Johnson', 'Rivera',
        'Smith', 'Brown', 'Davis', 'Martinez', 'Lee', 'Clark', 'Hall', 'Young', 'King',
    ];

    const baseStat = 40 + team.difficulty * 8;
    const roster = [];

    for (let i = 0; i < 9; i++) {
        const pos = positions[i];
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const variation = () => Math.round(baseStat + (Math.random() - 0.5) * 20);

        const player = {
            id: `${team.id}_${i}`,
            name: `${firstName} ${lastName}`,
            number: Math.floor(Math.random() * 55) + 1,
            position: pos,
            stars: Math.min(5, Math.max(1, Math.round(team.difficulty / 2))),
            power: variation(),
            contact: variation(),
            speed: variation(),
            fielding: variation(),
            arm: variation(),
            skinTone: ['light', 'medium', 'dark'][Math.floor(Math.random() * 3)],
            height: ['short', 'average', 'tall'][Math.floor(Math.random() * 3)],
            build: ['lean', 'average', 'stocky'][Math.floor(Math.random() * 3)],
        };

        if (pos === 'SP') {
            player.pitchSpeed = baseStat + Math.random() * 15;
            player.pitchControl = baseStat + Math.random() * 15;
            player.pitchBreak = baseStat + Math.random() * 15;
        }

        roster.push(player);
    }

    return roster;
}
