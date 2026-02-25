export const COACHES = [
    // 5-STAR MLB COACHES
    {
        id: 'boone', name: 'Aaron Boone', stars: 5,
        specialty: 'general',
        bonuses: { power: 3, contact: 3, fielding: 2 },
        teamSource: 'MLB', skinTone: 'light',
    },
    {
        id: 'roberts', name: 'Dave Roberts', stars: 5,
        specialty: 'speed',
        bonuses: { speed: 5, contact: 2 },
        teamSource: 'MLB', skinTone: 'medium',
    },
    {
        id: 'baker', name: 'Dusty Baker', stars: 5,
        specialty: 'hitting',
        bonuses: { power: 4, contact: 3 },
        teamSource: 'MLB', skinTone: 'dark',
    },

    // 4-STAR MLB COACHES
    {
        id: 'counsell', name: 'Craig Counsell', stars: 4,
        specialty: 'general',
        bonuses: { contact: 3, fielding: 3 },
        teamSource: 'MLB', skinTone: 'light',
    },
    {
        id: 'showalter', name: 'Buck Showalter', stars: 4,
        specialty: 'pitching',
        bonuses: { pitchControl: 4, pitchBreak: 2 },
        teamSource: 'MLB', skinTone: 'light',
    },
    {
        id: 'francona', name: 'Terry Francona', stars: 4,
        specialty: 'general',
        bonuses: { power: 2, contact: 2, speed: 2 },
        teamSource: 'MLB', skinTone: 'light',
    },

    // 3-STAR MLB COACHES
    {
        id: 'cash', name: 'Kevin Cash', stars: 3,
        specialty: 'pitching',
        bonuses: { pitchSpeed: 3, pitchControl: 2 },
        teamSource: 'MLB', skinTone: 'light',
    },
    {
        id: 'snitker', name: 'Brian Snitker', stars: 3,
        specialty: 'hitting',
        bonuses: { power: 3, contact: 1 },
        teamSource: 'MLB', skinTone: 'light',
    },
    {
        id: 'kapler', name: 'Gabe Kapler', stars: 3,
        specialty: 'defense',
        bonuses: { fielding: 3, arm: 2 },
        teamSource: 'MLB', skinTone: 'light',
    },

    // LOCAL COACHES
    {
        id: 'paul_silber', name: 'Paul Silber', stars: 4,
        specialty: 'general',
        bonuses: { contact: 3, fielding: 3, arm: 2 },
        teamSource: 'Old Bridge Lightning', skinTone: 'light',
        isCustom: false,
    },
    {
        id: 'anthony_scala', name: 'Anthony Scala', stars: 4,
        specialty: 'hitting',
        bonuses: { power: 4, contact: 2, speed: 1 },
        teamSource: 'Old Bridge Lightning', skinTone: 'light',
        isCustom: false,
    },
];
