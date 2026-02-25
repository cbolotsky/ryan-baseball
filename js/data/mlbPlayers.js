// MLB Players database + local players
// Stars: 1-5, Stats: 1-100 scale

export const MLB_PLAYERS = [
    // === 5-STAR (Elite) ===
    { id: 'judge', name: 'Aaron Judge', number: 99, position: 'RF', stars: 5, power: 99, contact: 82, speed: 65, fielding: 78, arm: 85, bats: 'R', throws: 'R', height: 'tall', build: 'stocky', skinTone: 'light', teamSource: 'New York Yankees' },
    { id: 'ohtani', name: 'Shohei Ohtani', number: 17, position: 'DH', stars: 5, power: 95, contact: 88, speed: 78, fielding: 70, arm: 90, pitchSpeed: 97, pitchControl: 85, pitchBreak: 92, bats: 'L', throws: 'R', height: 'tall', build: 'average', skinTone: 'light', teamSource: 'Los Angeles Dodgers' },
    { id: 'trout', name: 'Mike Trout', number: 27, position: 'CF', stars: 5, power: 94, contact: 90, speed: 82, fielding: 85, arm: 80, bats: 'R', throws: 'R', height: 'average', build: 'stocky', skinTone: 'light', teamSource: 'Los Angeles Angels' },
    { id: 'betts', name: 'Mookie Betts', number: 50, position: 'SS', stars: 5, power: 80, contact: 92, speed: 88, fielding: 95, arm: 82, bats: 'R', throws: 'R', height: 'short', build: 'lean', skinTone: 'dark', teamSource: 'Los Angeles Dodgers' },
    { id: 'soto', name: 'Juan Soto', number: 22, position: 'LF', stars: 5, power: 90, contact: 95, speed: 65, fielding: 68, arm: 75, bats: 'L', throws: 'L', height: 'tall', build: 'stocky', skinTone: 'medium', teamSource: 'New York Mets' },
    { id: 'tatis', name: 'Fernando Tatis Jr.', number: 23, position: 'RF', stars: 5, power: 88, contact: 80, speed: 90, fielding: 82, arm: 88, bats: 'R', throws: 'R', height: 'average', build: 'lean', skinTone: 'dark', teamSource: 'San Diego Padres' },
    { id: 'cole', name: 'Gerrit Cole', number: 45, position: 'SP', stars: 5, power: 30, contact: 25, speed: 50, fielding: 55, arm: 92, pitchSpeed: 98, pitchControl: 90, pitchBreak: 88, bats: 'R', throws: 'R', height: 'tall', build: 'average', skinTone: 'light', teamSource: 'New York Yankees' },
    { id: 'degrom', name: 'Jacob deGrom', number: 48, position: 'SP', stars: 5, power: 35, contact: 30, speed: 55, fielding: 60, arm: 95, pitchSpeed: 99, pitchControl: 92, pitchBreak: 90, bats: 'L', throws: 'R', height: 'tall', build: 'lean', skinTone: 'light', teamSource: 'Texas Rangers' },

    // === 4-STAR (All-Star) ===
    { id: 'acuna', name: 'Ronald Acuna Jr.', number: 13, position: 'CF', stars: 4, power: 85, contact: 82, speed: 95, fielding: 80, arm: 78, bats: 'R', throws: 'R', height: 'average', build: 'lean', skinTone: 'dark', teamSource: 'Atlanta Braves' },
    { id: 'lindor', name: 'Francisco Lindor', number: 12, position: 'SS', stars: 4, power: 78, contact: 85, speed: 82, fielding: 90, arm: 85, bats: 'S', throws: 'R', height: 'short', build: 'average', skinTone: 'medium', teamSource: 'New York Mets' },
    { id: 'vlad', name: 'Vladimir Guerrero Jr.', number: 27, position: '1B', stars: 4, power: 92, contact: 88, speed: 45, fielding: 72, arm: 78, bats: 'R', throws: 'R', height: 'average', build: 'stocky', skinTone: 'medium', teamSource: 'Toronto Blue Jays' },
    { id: 'devers', name: 'Rafael Devers', number: 11, position: '3B', stars: 4, power: 88, contact: 85, speed: 55, fielding: 68, arm: 80, bats: 'L', throws: 'R', height: 'average', build: 'stocky', skinTone: 'medium', teamSource: 'Boston Red Sox' },
    { id: 'harper', name: 'Bryce Harper', number: 3, position: '1B', stars: 4, power: 88, contact: 85, speed: 62, fielding: 65, arm: 75, bats: 'L', throws: 'R', height: 'tall', build: 'stocky', skinTone: 'light', teamSource: 'Philadelphia Phillies' },
    { id: 'turner_t', name: 'Trea Turner', number: 7, position: 'SS', stars: 4, power: 72, contact: 86, speed: 96, fielding: 82, arm: 78, bats: 'R', throws: 'R', height: 'average', build: 'lean', skinTone: 'light', teamSource: 'Philadelphia Phillies' },
    { id: 'freeman', name: 'Freddie Freeman', number: 5, position: '1B', stars: 4, power: 82, contact: 93, speed: 58, fielding: 85, arm: 78, bats: 'L', throws: 'R', height: 'tall', build: 'average', skinTone: 'light', teamSource: 'Los Angeles Dodgers' },
    { id: 'ramirez', name: 'Jose Ramirez', number: 11, position: '3B', stars: 4, power: 82, contact: 88, speed: 75, fielding: 80, arm: 82, bats: 'S', throws: 'R', height: 'short', build: 'stocky', skinTone: 'medium', teamSource: 'Cleveland Guardians' },
    { id: 'realmuto', name: 'J.T. Realmuto', number: 10, position: 'C', stars: 4, power: 75, contact: 80, speed: 72, fielding: 90, arm: 92, bats: 'R', throws: 'R', height: 'average', build: 'average', skinTone: 'light', teamSource: 'Philadelphia Phillies' },
    { id: 'alvarez', name: 'Yordan Alvarez', number: 44, position: 'DH', stars: 4, power: 95, contact: 86, speed: 40, fielding: 45, arm: 60, bats: 'L', throws: 'R', height: 'tall', build: 'stocky', skinTone: 'medium', teamSource: 'Houston Astros' },
    { id: 'wheeler', name: 'Zack Wheeler', number: 45, position: 'SP', stars: 4, power: 28, contact: 22, speed: 48, fielding: 58, arm: 88, pitchSpeed: 96, pitchControl: 88, pitchBreak: 85, bats: 'L', throws: 'R', height: 'tall', build: 'average', skinTone: 'light', teamSource: 'Philadelphia Phillies' },
    { id: 'burnes', name: 'Corbin Burnes', number: 39, position: 'SP', stars: 4, power: 25, contact: 20, speed: 45, fielding: 52, arm: 85, pitchSpeed: 95, pitchControl: 90, pitchBreak: 88, bats: 'R', throws: 'R', height: 'average', build: 'average', skinTone: 'light', teamSource: 'Arizona Diamondbacks' },

    // === 3-STAR (Solid Starters) ===
    { id: 'seager', name: 'Corey Seager', number: 5, position: 'SS', stars: 3, power: 80, contact: 78, speed: 55, fielding: 72, arm: 76, bats: 'L', throws: 'R', height: 'tall', build: 'average', skinTone: 'light', teamSource: 'Texas Rangers' },
    { id: 'rodriguez', name: 'Julio Rodriguez', number: 44, position: 'CF', stars: 3, power: 78, contact: 75, speed: 88, fielding: 78, arm: 82, bats: 'R', throws: 'R', height: 'tall', build: 'lean', skinTone: 'medium', teamSource: 'Seattle Mariners' },
    { id: 'witt', name: 'Bobby Witt Jr.', number: 7, position: 'SS', stars: 3, power: 75, contact: 76, speed: 92, fielding: 78, arm: 85, bats: 'R', throws: 'R', height: 'tall', build: 'lean', skinTone: 'light', teamSource: 'Kansas City Royals' },
    { id: 'henderson', name: 'Gunnar Henderson', number: 2, position: 'SS', stars: 3, power: 78, contact: 74, speed: 72, fielding: 70, arm: 78, bats: 'L', throws: 'R', height: 'tall', build: 'lean', skinTone: 'light', teamSource: 'Baltimore Orioles' },
    { id: 'adley', name: 'Adley Rutschman', number: 35, position: 'C', stars: 3, power: 70, contact: 82, speed: 48, fielding: 88, arm: 85, bats: 'S', throws: 'R', height: 'average', build: 'average', skinTone: 'light', teamSource: 'Baltimore Orioles' },
    { id: 'tucker', name: 'Kyle Tucker', number: 30, position: 'RF', stars: 3, power: 78, contact: 80, speed: 78, fielding: 80, arm: 82, bats: 'L', throws: 'R', height: 'tall', build: 'lean', skinTone: 'light', teamSource: 'Chicago Cubs' },
    { id: 'olson', name: 'Matt Olson', number: 28, position: '1B', stars: 3, power: 85, contact: 72, speed: 42, fielding: 82, arm: 75, bats: 'L', throws: 'R', height: 'tall', build: 'stocky', skinTone: 'light', teamSource: 'Atlanta Braves' },
    { id: 'strider', name: 'Spencer Strider', number: 65, position: 'SP', stars: 3, power: 20, contact: 18, speed: 42, fielding: 48, arm: 82, pitchSpeed: 99, pitchControl: 75, pitchBreak: 80, bats: 'R', throws: 'R', height: 'average', build: 'lean', skinTone: 'light', teamSource: 'Atlanta Braves' },
    { id: 'webb', name: 'Logan Webb', number: 62, position: 'SP', stars: 3, power: 22, contact: 20, speed: 45, fielding: 55, arm: 78, pitchSpeed: 92, pitchControl: 88, pitchBreak: 82, bats: 'R', throws: 'R', height: 'tall', build: 'average', skinTone: 'light', teamSource: 'San Francisco Giants' },

    // === 2-STAR (Role Players) ===
    { id: 'nimmo', name: 'Brandon Nimmo', number: 9, position: 'CF', stars: 2, power: 65, contact: 78, speed: 72, fielding: 75, arm: 70, bats: 'L', throws: 'R', height: 'average', build: 'lean', skinTone: 'light', teamSource: 'New York Mets' },
    { id: 'arraez', name: 'Luis Arraez', number: 4, position: '1B', stars: 2, power: 38, contact: 98, speed: 42, fielding: 65, arm: 55, bats: 'L', throws: 'R', height: 'short', build: 'average', skinTone: 'medium', teamSource: 'San Diego Padres' },
    { id: 'kirk', name: 'Alejandro Kirk', number: 30, position: 'C', stars: 2, power: 60, contact: 82, speed: 25, fielding: 78, arm: 72, bats: 'R', throws: 'R', height: 'short', build: 'stocky', skinTone: 'medium', teamSource: 'Toronto Blue Jays' },
    { id: 'cronenworth', name: 'Jake Cronenworth', number: 9, position: '2B', stars: 2, power: 62, contact: 80, speed: 60, fielding: 82, arm: 72, bats: 'L', throws: 'R', height: 'average', build: 'average', skinTone: 'light', teamSource: 'San Diego Padres' },
    { id: 'bassitt', name: 'Chris Bassitt', number: 40, position: 'SP', stars: 2, power: 18, contact: 15, speed: 40, fielding: 55, arm: 72, pitchSpeed: 93, pitchControl: 82, pitchBreak: 75, bats: 'R', throws: 'R', height: 'tall', build: 'average', skinTone: 'light', teamSource: 'Toronto Blue Jays' },

    // === 1-STAR (Bench) ===
    { id: 'profar', name: 'Jurickson Profar', number: 10, position: 'LF', stars: 1, power: 55, contact: 70, speed: 58, fielding: 68, arm: 65, bats: 'S', throws: 'R', height: 'average', build: 'average', skinTone: 'dark', teamSource: 'San Diego Padres' },
    { id: 'walls', name: 'Taylor Walls', number: 0, position: 'SS', stars: 1, power: 38, contact: 58, speed: 72, fielding: 82, arm: 78, bats: 'S', throws: 'R', height: 'short', build: 'lean', skinTone: 'light', teamSource: 'Tampa Bay Rays' },
];

// Player character — always on the team
export const RYAN_SILBER = {
    id: 'ryan_silber', name: 'Ryan Silber', number: 6, position: 'C', stars: 3,
    power: 72, contact: 78, speed: 60, fielding: 85, arm: 88,
    bats: 'R', throws: 'R', height: 'average', build: 'average', skinTone: 'light',
    isPlayerCharacter: true, teamSource: 'Old Bridge Lightning',
};

// Old Bridge Lightning teammates
export const LIGHTNING_PLAYERS = [
    { id: 'scala', name: 'Carmine Scala', number: 4, position: 'SS', stars: 3, power: 65, contact: 75, speed: 78, fielding: 82, arm: 80, skinTone: 'light', teamSource: 'Old Bridge Lightning' },
    { id: 'demarco', name: 'Angelo Demarco', number: 34, position: 'LF', stars: 3, power: 68, contact: 70, speed: 65, fielding: 72, arm: 70, skinTone: 'light', teamSource: 'Old Bridge Lightning' },
    { id: 'schirripa', name: 'Anthony Schirripa', number: 2, position: '1B', stars: 3, power: 75, contact: 72, speed: 52, fielding: 70, arm: 68, skinTone: 'light', teamSource: 'Old Bridge Lightning' },
    { id: 'nap', name: 'Anthony Nap', number: 11, position: 'SP', stars: 3, power: 45, contact: 40, speed: 55, fielding: 60, arm: 80, pitchSpeed: 88, pitchControl: 80, pitchBreak: 75, skinTone: 'light', teamSource: 'Old Bridge Lightning' },
    { id: 'hodgins', name: 'Brian Hodgins', number: 51, position: 'UTIL', stars: 3, power: 70, contact: 72, speed: 68, fielding: 75, arm: 74, skinTone: 'light', teamSource: 'Old Bridge Lightning' },
    { id: 'minnoia', name: 'Dom Minnoia', number: 17, position: '3B', stars: 3, power: 70, contact: 70, speed: 58, fielding: 75, arm: 78, skinTone: 'light', teamSource: 'Old Bridge Lightning' },
    { id: 'lennox', name: 'Jackson Lennox', number: 21, position: 'SP', stars: 3, power: 42, contact: 38, speed: 52, fielding: 55, arm: 76, pitchSpeed: 85, pitchControl: 78, pitchBreak: 72, skinTone: 'light', teamSource: 'Old Bridge Lightning' },
    { id: 'decker', name: 'Jayden Decker', number: 7, position: 'SP', stars: 3, power: 40, contact: 36, speed: 50, fielding: 52, arm: 74, pitchSpeed: 84, pitchControl: 76, pitchBreak: 70, skinTone: 'light', teamSource: 'Old Bridge Lightning' },
    { id: 'perseghin', name: 'Mason Perseghin', number: 45, position: 'RF', stars: 3, power: 66, contact: 68, speed: 62, fielding: 72, arm: 74, skinTone: 'light', teamSource: 'Old Bridge Lightning' },
    { id: 'denora', name: 'Michael Denora', number: 24, position: 'CF', stars: 3, power: 62, contact: 74, speed: 80, fielding: 80, arm: 75, skinTone: 'light', teamSource: 'Old Bridge Lightning' },
    { id: 'ikola', name: 'Ryan Ikola', number: 99, position: '2B', stars: 3, power: 60, contact: 72, speed: 70, fielding: 78, arm: 72, skinTone: 'light', teamSource: 'Old Bridge Lightning' },
    { id: 'christian', name: 'Zeik Christian', number: 37, position: 'UTIL', stars: 3, power: 68, contact: 70, speed: 72, fielding: 74, arm: 76, skinTone: 'light', teamSource: 'Old Bridge Lightning' },
];

// Other local players
export const LOCAL_PLAYERS = [
    { id: 'matt_silber', name: 'Matthew Silber', number: 9, position: 'C', stars: 3, power: 68, contact: 72, speed: 55, fielding: 80, arm: 82, skinTone: 'light', teamSource: 'Manalapan Braves' },
];
