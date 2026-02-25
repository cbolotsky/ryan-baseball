export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 720;

// Team colors
export const TEAM_COLORS = {
    oldBridgeLightning: {
        primary: '#000000',
        secondary: '#FFD700',
        accent: '#FFFFFF',
    },
};

// Baseball field dimensions (in feet, used as world units)
export const FIELD = {
    baseDist: 90,
    moundDist: 60.5,
    outfieldDist: 330,
    foulLineDist: 330,
    infieldArcRadius: 95,
    grassLineRadius: 150,
};

// Base positions in world coordinates (home plate at origin)
// Diamond oriented: home at (0,0,0), 2nd base straight ahead
export const BASES = {
    home:   { x: 0, y: 0, z: 0 },
    first:  { x: 63.64, y: 0, z: 63.64 },
    second: { x: 0, y: 0, z: 127.28 },
    third:  { x: -63.64, y: 0, z: 63.64 },
    mound:  { x: 0, y: 3, z: 60.5 },
};

// Fielder default positions (world coordinates)
export const FIELDER_POSITIONS = {
    P:  { x: 0, y: 3, z: 60.5 },
    C:  { x: 0, y: 0, z: -5 },
    '1B': { x: 75, y: 0, z: 72 },
    '2B': { x: 30, y: 0, z: 115 },
    SS:  { x: -30, y: 0, z: 115 },
    '3B': { x: -75, y: 0, z: 72 },
    LF:  { x: -150, y: 0, z: 220 },
    CF:  { x: 0, y: 0, z: 270 },
    RF:  { x: 150, y: 0, z: 220 },
};

// Game settings
export const GAME_SETTINGS = {
    innings: 9,
    winsForWorldSeries: 10,
    seasonGames: 16,
    startingMoney: 1000,
};
