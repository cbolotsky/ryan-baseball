// Comprehensive MLB Player Database for Admin Panel
// ~8 players per team across 20 teams (~160 players total)
// Stars: 1-5, Stats: 1-100 scale
// IDs prefixed with db_ to avoid collisions with mlbPlayers.js

export const MLB_DATABASE = {

    // ==========================================
    // 1. NEW YORK YANKEES
    // ==========================================
    'New York Yankees': [
        { id: 'db_judge', name: 'Aaron Judge', number: 99, position: 'RF', stars: 5, power: 99, contact: 82, speed: 65, fielding: 78, arm: 85, bats: 'R', throws: 'R', height: 'tall', build: 'stocky', skinTone: 'light', teamSource: 'New York Yankees' },
        { id: 'db_cole', name: 'Gerrit Cole', number: 45, position: 'SP', stars: 5, power: 30, contact: 25, speed: 50, fielding: 55, arm: 92, pitchSpeed: 98, pitchControl: 90, pitchBreak: 88, bats: 'R', throws: 'R', height: 'tall', build: 'average', skinTone: 'light', teamSource: 'New York Yankees' },
        { id: 'db_stanton', name: 'Giancarlo Stanton', number: 27, position: 'DH', stars: 4, power: 96, contact: 70, speed: 45, fielding: 55, arm: 80, bats: 'R', throws: 'R', height: 'tall', build: 'stocky', skinTone: 'dark', teamSource: 'New York Yankees' },
        { id: 'db_torres', name: 'Gleyber Torres', number: 25, position: '2B', stars: 3, power: 72, contact: 76, speed: 62, fielding: 70, arm: 72, bats: 'R', throws: 'R', height: 'average', build: 'average', skinTone: 'medium', teamSource: 'New York Yankees' },
        { id: 'db_volpe', name: 'Anthony Volpe', number: 11, position: 'SS', stars: 3, power: 62, contact: 72, speed: 80, fielding: 78, arm: 76, bats: 'R', throws: 'R', height: 'average', build: 'lean', skinTone: 'light', teamSource: 'New York Yankees' },
        { id: 'db_rizzo', name: 'Anthony Rizzo', number: 48, position: '1B', stars: 3, power: 75, contact: 74, speed: 45, fielding: 82, arm: 70, bats: 'L', throws: 'L', height: 'tall', build: 'stocky', skinTone: 'light', teamSource: 'New York Yankees' },
        { id: 'db_holmes', name: 'Clay Holmes', number: 35, position: 'RP', stars: 3, power: 18, contact: 15, speed: 42, fielding: 50, arm: 80, pitchSpeed: 97, pitchControl: 72, pitchBreak: 88, bats: 'R', throws: 'R', height: 'tall', build: 'average', skinTone: 'light', teamSource: 'New York Yankees' },
        { id: 'db_verdugo', name: 'Alex Verdugo', number: 24, position: 'LF', stars: 2, power: 58, contact: 78, speed: 60, fielding: 72, arm: 68, bats: 'L', throws: 'L', height: 'average', build: 'average', skinTone: 'medium', teamSource: 'New York Yankees' },
    ],

    // ==========================================
    // 2. BOSTON RED SOX
    // ==========================================
    'Boston Red Sox': [
        { id: 'db_devers', name: 'Rafael Devers', number: 11, position: '3B', stars: 5, power: 90, contact: 86, speed: 55, fielding: 68, arm: 80, bats: 'L', throws: 'R', height: 'average', build: 'stocky', skinTone: 'medium', teamSource: 'Boston Red Sox' },
        { id: 'db_yoshida', name: 'Masataka Yoshida', number: 7, position: 'LF', stars: 3, power: 62, contact: 88, speed: 48, fielding: 62, arm: 60, bats: 'L', throws: 'R', height: 'short', build: 'stocky', skinTone: 'light', teamSource: 'Boston Red Sox' },
        { id: 'db_duran', name: 'Jarren Duran', number: 16, position: 'CF', stars: 3, power: 65, contact: 74, speed: 92, fielding: 75, arm: 70, bats: 'L', throws: 'R', height: 'average', build: 'lean', skinTone: 'medium', teamSource: 'Boston Red Sox' },
        { id: 'db_casas', name: 'Triston Casas', number: 36, position: '1B', stars: 3, power: 80, contact: 70, speed: 38, fielding: 72, arm: 68, bats: 'L', throws: 'R', height: 'tall', build: 'stocky', skinTone: 'light', teamSource: 'Boston Red Sox' },
        { id: 'db_story', name: 'Trevor Story', number: 10, position: 'SS', stars: 3, power: 74, contact: 68, speed: 78, fielding: 75, arm: 80, bats: 'R', throws: 'R', height: 'average', build: 'average', skinTone: 'light', teamSource: 'Boston Red Sox' },
        { id: 'db_whitlock', name: 'Garrett Whitlock', number: 72, position: 'SP', stars: 3, power: 20, contact: 18, speed: 44, fielding: 52, arm: 78, pitchSpeed: 95, pitchControl: 80, pitchBreak: 78, bats: 'R', throws: 'R', height: 'tall', build: 'average', skinTone: 'light', teamSource: 'Boston Red Sox' },
        { id: 'db_turner_j', name: 'Justin Turner', number: 2, position: 'DH', stars: 2, power: 68, contact: 76, speed: 35, fielding: 58, arm: 62, bats: 'R', throws: 'R', height: 'average', build: 'stocky', skinTone: 'light', teamSource: 'Boston Red Sox' },
        { id: 'db_mcguire', name: 'Reese McGuire', number: 3, position: 'C', stars: 2, power: 45, contact: 68, speed: 40, fielding: 75, arm: 72, bats: 'L', throws: 'R', height: 'average', build: 'average', skinTone: 'light', teamSource: 'Boston Red Sox' },
    ],

    // ==========================================
    // 3. NEW YORK METS
    // ==========================================
    'New York Mets': [
        { id: 'db_soto', name: 'Juan Soto', number: 22, position: 'LF', stars: 5, power: 90, contact: 95, speed: 65, fielding: 68, arm: 75, bats: 'L', throws: 'L', height: 'tall', build: 'stocky', skinTone: 'medium', teamSource: 'New York Mets' },
        { id: 'db_lindor', name: 'Francisco Lindor', number: 12, position: 'SS', stars: 5, power: 80, contact: 85, speed: 82, fielding: 92, arm: 85, bats: 'S', throws: 'R', height: 'short', build: 'average', skinTone: 'medium', teamSource: 'New York Mets' },
        { id: 'db_alonso', name: 'Pete Alonso', number: 20, position: '1B', stars: 4, power: 94, contact: 72, speed: 40, fielding: 68, arm: 70, bats: 'R', throws: 'R', height: 'tall', build: 'stocky', skinTone: 'light', teamSource: 'New York Mets' },
        { id: 'db_mcneil', name: 'Jeff McNeil', number: 1, position: '2B', stars: 3, power: 55, contact: 90, speed: 60, fielding: 72, arm: 65, bats: 'L', throws: 'R', height: 'average', build: 'average', skinTone: 'light', teamSource: 'New York Mets' },
        { id: 'db_nimmo', name: 'Brandon Nimmo', number: 9, position: 'CF', stars: 3, power: 65, contact: 78, speed: 72, fielding: 75, arm: 70, bats: 'L', throws: 'R', height: 'average', build: 'lean', skinTone: 'light', teamSource: 'New York Mets' },
        { id: 'db_severino', name: 'Luis Severino', number: 40, position: 'SP', stars: 3, power: 22, contact: 18, speed: 46, fielding: 50, arm: 82, pitchSpeed: 97, pitchControl: 78, pitchBreak: 82, bats: 'R', throws: 'R', height: 'tall', build: 'average', skinTone: 'medium', teamSource: 'New York Mets' },
        { id: 'db_diaz', name: 'Edwin Diaz', number: 39, position: 'RP', stars: 4, power: 15, contact: 12, speed: 40, fielding: 45, arm: 88, pitchSpeed: 99, pitchControl: 80, pitchBreak: 92, bats: 'R', throws: 'R', height: 'tall', build: 'lean', skinTone: 'medium', teamSource: 'New York Mets' },
        { id: 'db_marte', name: 'Starling Marte', number: 6, position: 'RF', stars: 2, power: 58, contact: 72, speed: 82, fielding: 74, arm: 75, bats: 'R', throws: 'R', height: 'average', build: 'lean', skinTone: 'dark', teamSource: 'New York Mets' },
    ],

    // ==========================================
    // 4. PHILADELPHIA PHILLIES
    // ==========================================
    'Philadelphia Phillies': [
        { id: 'db_harper', name: 'Bryce Harper', number: 3, position: '1B', stars: 5, power: 90, contact: 86, speed: 62, fielding: 65, arm: 75, bats: 'L', throws: 'R', height: 'tall', build: 'stocky', skinTone: 'light', teamSource: 'Philadelphia Phillies' },
        { id: 'db_turner_t', name: 'Trea Turner', number: 7, position: 'SS', stars: 4, power: 72, contact: 86, speed: 96, fielding: 82, arm: 78, bats: 'R', throws: 'R', height: 'average', build: 'lean', skinTone: 'light', teamSource: 'Philadelphia Phillies' },
        { id: 'db_wheeler', name: 'Zack Wheeler', number: 45, position: 'SP', stars: 4, power: 28, contact: 22, speed: 48, fielding: 58, arm: 88, pitchSpeed: 96, pitchControl: 88, pitchBreak: 85, bats: 'L', throws: 'R', height: 'tall', build: 'average', skinTone: 'light', teamSource: 'Philadelphia Phillies' },
        { id: 'db_realmuto', name: 'J.T. Realmuto', number: 10, position: 'C', stars: 4, power: 75, contact: 80, speed: 72, fielding: 90, arm: 92, bats: 'R', throws: 'R', height: 'average', build: 'average', skinTone: 'light', teamSource: 'Philadelphia Phillies' },
        { id: 'db_schwarber', name: 'Kyle Schwarber', number: 12, position: 'DH', stars: 3, power: 90, contact: 62, speed: 40, fielding: 50, arm: 60, bats: 'L', throws: 'R', height: 'average', build: 'stocky', skinTone: 'light', teamSource: 'Philadelphia Phillies' },
        { id: 'db_nola', name: 'Aaron Nola', number: 27, position: 'SP', stars: 4, power: 22, contact: 20, speed: 42, fielding: 55, arm: 85, pitchSpeed: 93, pitchControl: 92, pitchBreak: 86, bats: 'R', throws: 'R', height: 'average', build: 'average', skinTone: 'light', teamSource: 'Philadelphia Phillies' },
        { id: 'db_castellanos', name: 'Nick Castellanos', number: 8, position: 'RF', stars: 3, power: 78, contact: 76, speed: 52, fielding: 60, arm: 68, bats: 'R', throws: 'R', height: 'tall', build: 'average', skinTone: 'light', teamSource: 'Philadelphia Phillies' },
        { id: 'db_bohm', name: 'Alec Bohm', number: 28, position: '3B', stars: 3, power: 70, contact: 80, speed: 45, fielding: 68, arm: 72, bats: 'R', throws: 'R', height: 'tall', build: 'average', skinTone: 'light', teamSource: 'Philadelphia Phillies' },
    ],

    // ==========================================
    // 5. LOS ANGELES DODGERS
    // ==========================================
    'Los Angeles Dodgers': [
        { id: 'db_ohtani', name: 'Shohei Ohtani', number: 17, position: 'DH', stars: 5, power: 95, contact: 88, speed: 78, fielding: 70, arm: 90, pitchSpeed: 97, pitchControl: 85, pitchBreak: 92, bats: 'L', throws: 'R', height: 'tall', build: 'average', skinTone: 'light', teamSource: 'Los Angeles Dodgers' },
        { id: 'db_betts', name: 'Mookie Betts', number: 50, position: 'SS', stars: 5, power: 80, contact: 92, speed: 88, fielding: 95, arm: 82, bats: 'R', throws: 'R', height: 'short', build: 'lean', skinTone: 'dark', teamSource: 'Los Angeles Dodgers' },
        { id: 'db_freeman', name: 'Freddie Freeman', number: 5, position: '1B', stars: 4, power: 82, contact: 93, speed: 58, fielding: 85, arm: 78, bats: 'L', throws: 'R', height: 'tall', build: 'average', skinTone: 'light', teamSource: 'Los Angeles Dodgers' },
        { id: 'db_smith_w', name: 'Will Smith', number: 16, position: 'C', stars: 4, power: 78, contact: 80, speed: 45, fielding: 82, arm: 80, bats: 'R', throws: 'R', height: 'average', build: 'average', skinTone: 'light', teamSource: 'Los Angeles Dodgers' },
        { id: 'db_buehler', name: 'Walker Buehler', number: 21, position: 'SP', stars: 3, power: 20, contact: 18, speed: 45, fielding: 52, arm: 82, pitchSpeed: 96, pitchControl: 82, pitchBreak: 85, bats: 'R', throws: 'R', height: 'average', build: 'average', skinTone: 'light', teamSource: 'Los Angeles Dodgers' },
        { id: 'db_muncy', name: 'Max Muncy', number: 13, position: '3B', stars: 3, power: 82, contact: 68, speed: 42, fielding: 65, arm: 70, bats: 'L', throws: 'R', height: 'average', build: 'stocky', skinTone: 'light', teamSource: 'Los Angeles Dodgers' },
        { id: 'db_outman', name: 'James Outman', number: 33, position: 'CF', stars: 2, power: 68, contact: 62, speed: 80, fielding: 72, arm: 70, bats: 'L', throws: 'R', height: 'tall', build: 'lean', skinTone: 'light', teamSource: 'Los Angeles Dodgers' },
        { id: 'db_treinen', name: 'Blake Treinen', number: 49, position: 'RP', stars: 2, power: 15, contact: 12, speed: 40, fielding: 48, arm: 75, pitchSpeed: 97, pitchControl: 74, pitchBreak: 82, bats: 'R', throws: 'R', height: 'tall', build: 'stocky', skinTone: 'light', teamSource: 'Los Angeles Dodgers' },
    ],

    // ==========================================
    // 6. LOS ANGELES ANGELS
    // ==========================================
    'Los Angeles Angels': [
        { id: 'db_trout', name: 'Mike Trout', number: 27, position: 'CF', stars: 5, power: 94, contact: 90, speed: 82, fielding: 85, arm: 80, bats: 'R', throws: 'R', height: 'average', build: 'stocky', skinTone: 'light', teamSource: 'Los Angeles Angels' },
        { id: 'db_rendon', name: 'Anthony Rendon', number: 6, position: '3B', stars: 3, power: 72, contact: 78, speed: 48, fielding: 75, arm: 78, bats: 'R', throws: 'R', height: 'average', build: 'average', skinTone: 'medium', teamSource: 'Los Angeles Angels' },
        { id: 'db_drury', name: 'Brandon Drury', number: 23, position: '2B', stars: 2, power: 68, contact: 70, speed: 48, fielding: 64, arm: 68, bats: 'R', throws: 'R', height: 'average', build: 'average', skinTone: 'light', teamSource: 'Los Angeles Angels' },
        { id: 'db_ward', name: 'Taylor Ward', number: 3, position: 'RF', stars: 3, power: 70, contact: 74, speed: 58, fielding: 68, arm: 72, bats: 'R', throws: 'R', height: 'average', build: 'average', skinTone: 'light', teamSource: 'Los Angeles Angels' },
        { id: 'db_neto', name: 'Zach Neto', number: 9, position: 'SS', stars: 3, power: 60, contact: 68, speed: 78, fielding: 80, arm: 82, bats: 'R', throws: 'R', height: 'average', build: 'lean', skinTone: 'light', teamSource: 'Los Angeles Angels' },
        { id: 'db_sandoval', name: 'Patrick Sandoval', number: 43, position: 'SP', stars: 3, power: 18, contact: 15, speed: 42, fielding: 50, arm: 76, pitchSpeed: 92, pitchControl: 82, pitchBreak: 80, bats: 'L', throws: 'L', height: 'tall', build: 'lean', skinTone: 'medium', teamSource: 'Los Angeles Angels' },
        { id: 'db_detmers', name: 'Reid Detmers', number: 48, position: 'SP', stars: 2, power: 16, contact: 14, speed: 40, fielding: 48, arm: 72, pitchSpeed: 93, pitchControl: 76, pitchBreak: 78, bats: 'L', throws: 'L', height: 'tall', build: 'lean', skinTone: 'light', teamSource: 'Los Angeles Angels' },
        { id: 'db_ohoppe', name: 'Logan O\'Hoppe', number: 14, position: 'C', stars: 2, power: 62, contact: 66, speed: 38, fielding: 72, arm: 75, bats: 'R', throws: 'R', height: 'average', build: 'average', skinTone: 'light', teamSource: 'Los Angeles Angels' },
    ],

    // ==========================================
    // 7. SAN DIEGO PADRES
    // ==========================================
    'San Diego Padres': [
        { id: 'db_tatis', name: 'Fernando Tatis Jr.', number: 23, position: 'RF', stars: 5, power: 88, contact: 80, speed: 90, fielding: 82, arm: 88, bats: 'R', throws: 'R', height: 'average', build: 'lean', skinTone: 'dark', teamSource: 'San Diego Padres' },
        { id: 'db_machado', name: 'Manny Machado', number: 13, position: '3B', stars: 4, power: 82, contact: 82, speed: 60, fielding: 88, arm: 90, bats: 'R', throws: 'R', height: 'tall', build: 'average', skinTone: 'medium', teamSource: 'San Diego Padres' },
        { id: 'db_bogaerts', name: 'Xander Bogaerts', number: 2, position: 'SS', stars: 3, power: 72, contact: 82, speed: 55, fielding: 72, arm: 74, bats: 'R', throws: 'R', height: 'average', build: 'average', skinTone: 'dark', teamSource: 'San Diego Padres' },
        { id: 'db_cronenworth', name: 'Jake Cronenworth', number: 9, position: '2B', stars: 3, power: 62, contact: 80, speed: 60, fielding: 82, arm: 72, bats: 'L', throws: 'R', height: 'average', build: 'average', skinTone: 'light', teamSource: 'San Diego Padres' },
        { id: 'db_kim', name: 'Ha-Seong Kim', number: 7, position: 'SS', stars: 3, power: 60, contact: 76, speed: 78, fielding: 85, arm: 80, bats: 'R', throws: 'R', height: 'short', build: 'lean', skinTone: 'light', teamSource: 'San Diego Padres' },
        { id: 'db_musgrove', name: 'Joe Musgrove', number: 44, position: 'SP', stars: 3, power: 22, contact: 18, speed: 44, fielding: 55, arm: 80, pitchSpeed: 94, pitchControl: 85, pitchBreak: 82, bats: 'R', throws: 'R', height: 'tall', build: 'average', skinTone: 'light', teamSource: 'San Diego Padres' },
        { id: 'db_arraez', name: 'Luis Arraez', number: 4, position: '1B', stars: 3, power: 38, contact: 98, speed: 42, fielding: 65, arm: 55, bats: 'L', throws: 'R', height: 'short', build: 'average', skinTone: 'medium', teamSource: 'San Diego Padres' },
        { id: 'db_hader', name: 'Josh Hader', number: 71, position: 'RP', stars: 4, power: 15, contact: 12, speed: 42, fielding: 46, arm: 86, pitchSpeed: 97, pitchControl: 82, pitchBreak: 90, bats: 'L', throws: 'L', height: 'tall', build: 'lean', skinTone: 'light', teamSource: 'San Diego Padres' },
    ],

    // ==========================================
    // 8. HOUSTON ASTROS
    // ==========================================
    'Houston Astros': [
        { id: 'db_alvarez', name: 'Yordan Alvarez', number: 44, position: 'DH', stars: 5, power: 96, contact: 86, speed: 40, fielding: 45, arm: 60, bats: 'L', throws: 'R', height: 'tall', build: 'stocky', skinTone: 'medium', teamSource: 'Houston Astros' },
        { id: 'db_altuve', name: 'Jose Altuve', number: 27, position: '2B', stars: 4, power: 72, contact: 90, speed: 75, fielding: 82, arm: 70, bats: 'R', throws: 'R', height: 'short', build: 'lean', skinTone: 'medium', teamSource: 'Houston Astros' },
        { id: 'db_bregman', name: 'Alex Bregman', number: 2, position: '3B', stars: 4, power: 78, contact: 84, speed: 58, fielding: 85, arm: 82, bats: 'R', throws: 'R', height: 'average', build: 'average', skinTone: 'light', teamSource: 'Houston Astros' },
        { id: 'db_pena', name: 'Jeremy Pena', number: 3, position: 'SS', stars: 3, power: 68, contact: 72, speed: 75, fielding: 82, arm: 80, bats: 'R', throws: 'R', height: 'average', build: 'lean', skinTone: 'medium', teamSource: 'Houston Astros' },
        { id: 'db_tucker_k', name: 'Kyle Tucker', number: 30, position: 'RF', stars: 4, power: 80, contact: 82, speed: 78, fielding: 80, arm: 82, bats: 'L', throws: 'R', height: 'tall', build: 'lean', skinTone: 'light', teamSource: 'Houston Astros' },
        { id: 'db_framber', name: 'Framber Valdez', number: 59, position: 'SP', stars: 4, power: 20, contact: 16, speed: 44, fielding: 55, arm: 82, pitchSpeed: 94, pitchControl: 86, pitchBreak: 88, bats: 'L', throws: 'L', height: 'average', build: 'stocky', skinTone: 'medium', teamSource: 'Houston Astros' },
        { id: 'db_javier', name: 'Cristian Javier', number: 53, position: 'SP', stars: 3, power: 18, contact: 14, speed: 42, fielding: 48, arm: 78, pitchSpeed: 94, pitchControl: 80, pitchBreak: 82, bats: 'R', throws: 'R', height: 'average', build: 'lean', skinTone: 'medium', teamSource: 'Houston Astros' },
        { id: 'db_pressly', name: 'Ryan Pressly', number: 55, position: 'RP', stars: 3, power: 16, contact: 12, speed: 38, fielding: 45, arm: 78, pitchSpeed: 95, pitchControl: 84, pitchBreak: 80, bats: 'R', throws: 'R', height: 'average', build: 'average', skinTone: 'light', teamSource: 'Houston Astros' },
    ],

    // ==========================================
    // 9. ATLANTA BRAVES
    // ==========================================
    'Atlanta Braves': [
        { id: 'db_acuna', name: 'Ronald Acuna Jr.', number: 13, position: 'CF', stars: 5, power: 88, contact: 84, speed: 96, fielding: 80, arm: 78, bats: 'R', throws: 'R', height: 'average', build: 'lean', skinTone: 'dark', teamSource: 'Atlanta Braves' },
        { id: 'db_riley', name: 'Austin Riley', number: 27, position: '3B', stars: 4, power: 88, contact: 78, speed: 48, fielding: 75, arm: 80, bats: 'R', throws: 'R', height: 'tall', build: 'stocky', skinTone: 'light', teamSource: 'Atlanta Braves' },
        { id: 'db_olson', name: 'Matt Olson', number: 28, position: '1B', stars: 4, power: 88, contact: 74, speed: 42, fielding: 82, arm: 75, bats: 'L', throws: 'R', height: 'tall', build: 'stocky', skinTone: 'light', teamSource: 'Atlanta Braves' },
        { id: 'db_albies', name: 'Ozzie Albies', number: 1, position: '2B', stars: 3, power: 72, contact: 78, speed: 82, fielding: 82, arm: 74, bats: 'S', throws: 'R', height: 'short', build: 'average', skinTone: 'dark', teamSource: 'Atlanta Braves' },
        { id: 'db_harris', name: 'Michael Harris II', number: 23, position: 'CF', stars: 4, power: 72, contact: 80, speed: 90, fielding: 92, arm: 78, bats: 'L', throws: 'L', height: 'average', build: 'lean', skinTone: 'dark', teamSource: 'Atlanta Braves' },
        { id: 'db_strider', name: 'Spencer Strider', number: 65, position: 'SP', stars: 4, power: 20, contact: 18, speed: 42, fielding: 48, arm: 84, pitchSpeed: 99, pitchControl: 78, pitchBreak: 82, bats: 'R', throws: 'R', height: 'average', build: 'lean', skinTone: 'light', teamSource: 'Atlanta Braves' },
        { id: 'db_fried', name: 'Max Fried', number: 54, position: 'SP', stars: 4, power: 22, contact: 20, speed: 45, fielding: 72, arm: 85, pitchSpeed: 95, pitchControl: 88, pitchBreak: 85, bats: 'L', throws: 'L', height: 'tall', build: 'average', skinTone: 'light', teamSource: 'Atlanta Braves' },
        { id: 'db_murphy_s', name: 'Sean Murphy', number: 12, position: 'C', stars: 3, power: 75, contact: 72, speed: 38, fielding: 85, arm: 88, bats: 'R', throws: 'R', height: 'tall', build: 'stocky', skinTone: 'light', teamSource: 'Atlanta Braves' },
    ],

    // ==========================================
    // 10. CHICAGO CUBS
    // ==========================================
    'Chicago Cubs': [
        { id: 'db_bellinger', name: 'Cody Bellinger', number: 24, position: 'CF', stars: 4, power: 80, contact: 76, speed: 72, fielding: 82, arm: 75, bats: 'L', throws: 'L', height: 'tall', build: 'lean', skinTone: 'light', teamSource: 'Chicago Cubs' },
        { id: 'db_suzuki_s', name: 'Seiya Suzuki', number: 27, position: 'RF', stars: 3, power: 75, contact: 78, speed: 60, fielding: 72, arm: 80, bats: 'R', throws: 'R', height: 'average', build: 'stocky', skinTone: 'light', teamSource: 'Chicago Cubs' },
        { id: 'db_hoerner', name: 'Nico Hoerner', number: 2, position: '2B', stars: 3, power: 48, contact: 82, speed: 80, fielding: 85, arm: 72, bats: 'R', throws: 'R', height: 'short', build: 'lean', skinTone: 'light', teamSource: 'Chicago Cubs' },
        { id: 'db_swanson', name: 'Dansby Swanson', number: 7, position: 'SS', stars: 3, power: 72, contact: 72, speed: 72, fielding: 85, arm: 82, bats: 'R', throws: 'R', height: 'tall', build: 'lean', skinTone: 'light', teamSource: 'Chicago Cubs' },
        { id: 'db_happ_i', name: 'Ian Happ', number: 8, position: 'LF', stars: 3, power: 75, contact: 72, speed: 65, fielding: 72, arm: 72, bats: 'S', throws: 'R', height: 'average', build: 'average', skinTone: 'light', teamSource: 'Chicago Cubs' },
        { id: 'db_steele', name: 'Justin Steele', number: 35, position: 'SP', stars: 3, power: 18, contact: 16, speed: 42, fielding: 52, arm: 78, pitchSpeed: 94, pitchControl: 84, pitchBreak: 82, bats: 'L', throws: 'L', height: 'tall', build: 'lean', skinTone: 'light', teamSource: 'Chicago Cubs' },
        { id: 'db_hendricks', name: 'Kyle Hendricks', number: 28, position: 'SP', stars: 2, power: 15, contact: 18, speed: 38, fielding: 60, arm: 68, pitchSpeed: 86, pitchControl: 92, pitchBreak: 78, bats: 'R', throws: 'R', height: 'average', build: 'average', skinTone: 'light', teamSource: 'Chicago Cubs' },
        { id: 'db_amaya', name: 'Miguel Amaya', number: 9, position: 'C', stars: 2, power: 60, contact: 64, speed: 35, fielding: 72, arm: 74, bats: 'R', throws: 'R', height: 'average', build: 'stocky', skinTone: 'medium', teamSource: 'Chicago Cubs' },
    ],

    // ==========================================
    // 11. TORONTO BLUE JAYS
    // ==========================================
    'Toronto Blue Jays': [
        { id: 'db_vlad', name: 'Vladimir Guerrero Jr.', number: 27, position: '1B', stars: 5, power: 92, contact: 88, speed: 45, fielding: 72, arm: 78, bats: 'R', throws: 'R', height: 'average', build: 'stocky', skinTone: 'medium', teamSource: 'Toronto Blue Jays' },
        { id: 'db_bichette', name: 'Bo Bichette', number: 11, position: 'SS', stars: 4, power: 74, contact: 82, speed: 78, fielding: 72, arm: 76, bats: 'R', throws: 'R', height: 'average', build: 'lean', skinTone: 'light', teamSource: 'Toronto Blue Jays' },
        { id: 'db_springer', name: 'George Springer', number: 4, position: 'CF', stars: 3, power: 75, contact: 74, speed: 68, fielding: 72, arm: 74, bats: 'R', throws: 'R', height: 'average', build: 'average', skinTone: 'medium', teamSource: 'Toronto Blue Jays' },
        { id: 'db_kirk', name: 'Alejandro Kirk', number: 30, position: 'C', stars: 3, power: 62, contact: 82, speed: 25, fielding: 78, arm: 72, bats: 'R', throws: 'R', height: 'short', build: 'stocky', skinTone: 'medium', teamSource: 'Toronto Blue Jays' },
        { id: 'db_chapman_m', name: 'Matt Chapman', number: 26, position: '3B', stars: 3, power: 76, contact: 68, speed: 55, fielding: 90, arm: 85, bats: 'R', throws: 'R', height: 'tall', build: 'average', skinTone: 'light', teamSource: 'Toronto Blue Jays' },
        { id: 'db_gausman', name: 'Kevin Gausman', number: 34, position: 'SP', stars: 4, power: 20, contact: 18, speed: 42, fielding: 52, arm: 82, pitchSpeed: 95, pitchControl: 86, pitchBreak: 88, bats: 'R', throws: 'R', height: 'tall', build: 'average', skinTone: 'light', teamSource: 'Toronto Blue Jays' },
        { id: 'db_bassitt', name: 'Chris Bassitt', number: 40, position: 'SP', stars: 2, power: 18, contact: 15, speed: 40, fielding: 55, arm: 72, pitchSpeed: 93, pitchControl: 82, pitchBreak: 75, bats: 'R', throws: 'R', height: 'tall', build: 'average', skinTone: 'light', teamSource: 'Toronto Blue Jays' },
        { id: 'db_romano', name: 'Jordan Romano', number: 68, position: 'RP', stars: 3, power: 16, contact: 14, speed: 40, fielding: 46, arm: 80, pitchSpeed: 97, pitchControl: 78, pitchBreak: 82, bats: 'R', throws: 'R', height: 'tall', build: 'average', skinTone: 'medium', teamSource: 'Toronto Blue Jays' },
    ],

    // ==========================================
    // 12. ST. LOUIS CARDINALS
    // ==========================================
    'St. Louis Cardinals': [
        { id: 'db_goldschmidt', name: 'Paul Goldschmidt', number: 46, position: '1B', stars: 4, power: 82, contact: 82, speed: 52, fielding: 85, arm: 78, bats: 'R', throws: 'R', height: 'tall', build: 'average', skinTone: 'light', teamSource: 'St. Louis Cardinals' },
        { id: 'db_arenado', name: 'Nolan Arenado', number: 28, position: '3B', stars: 4, power: 82, contact: 80, speed: 50, fielding: 95, arm: 92, bats: 'R', throws: 'R', height: 'average', build: 'stocky', skinTone: 'medium', teamSource: 'St. Louis Cardinals' },
        { id: 'db_contreras', name: 'Willson Contreras', number: 40, position: 'C', stars: 3, power: 75, contact: 74, speed: 45, fielding: 72, arm: 82, bats: 'R', throws: 'R', height: 'average', build: 'stocky', skinTone: 'medium', teamSource: 'St. Louis Cardinals' },
        { id: 'db_edman', name: 'Tommy Edman', number: 19, position: '2B', stars: 3, power: 55, contact: 76, speed: 85, fielding: 82, arm: 75, bats: 'S', throws: 'R', height: 'short', build: 'lean', skinTone: 'light', teamSource: 'St. Louis Cardinals' },
        { id: 'db_carlson', name: 'Dylan Carlson', number: 3, position: 'CF', stars: 2, power: 62, contact: 68, speed: 70, fielding: 72, arm: 72, bats: 'S', throws: 'L', height: 'average', build: 'lean', skinTone: 'light', teamSource: 'St. Louis Cardinals' },
        { id: 'db_wainwright', name: 'Adam Wainwright', number: 50, position: 'SP', stars: 2, power: 20, contact: 22, speed: 32, fielding: 68, arm: 72, pitchSpeed: 88, pitchControl: 88, pitchBreak: 80, bats: 'R', throws: 'R', height: 'tall', build: 'average', skinTone: 'light', teamSource: 'St. Louis Cardinals' },
        { id: 'db_mikolas', name: 'Miles Mikolas', number: 39, position: 'SP', stars: 3, power: 18, contact: 16, speed: 38, fielding: 58, arm: 76, pitchSpeed: 93, pitchControl: 85, pitchBreak: 78, bats: 'R', throws: 'R', height: 'tall', build: 'average', skinTone: 'light', teamSource: 'St. Louis Cardinals' },
        { id: 'db_helsley', name: 'Ryan Helsley', number: 56, position: 'RP', stars: 4, power: 16, contact: 12, speed: 42, fielding: 48, arm: 85, pitchSpeed: 99, pitchControl: 80, pitchBreak: 85, bats: 'R', throws: 'R', height: 'average', build: 'average', skinTone: 'medium', teamSource: 'St. Louis Cardinals' },
    ],

    // ==========================================
    // 13. SAN FRANCISCO GIANTS
    // ==========================================
    'San Francisco Giants': [
        { id: 'db_webb', name: 'Logan Webb', number: 62, position: 'SP', stars: 4, power: 22, contact: 20, speed: 45, fielding: 55, arm: 82, pitchSpeed: 93, pitchControl: 90, pitchBreak: 84, bats: 'R', throws: 'R', height: 'tall', build: 'average', skinTone: 'light', teamSource: 'San Francisco Giants' },
        { id: 'db_chapman_a', name: 'Matt Chapman', number: 26, position: '3B', stars: 3, power: 76, contact: 68, speed: 55, fielding: 90, arm: 85, bats: 'R', throws: 'R', height: 'tall', build: 'average', skinTone: 'light', teamSource: 'San Francisco Giants' },
        { id: 'db_pederson', name: 'Joc Pederson', number: 23, position: 'LF', stars: 3, power: 80, contact: 68, speed: 45, fielding: 58, arm: 62, bats: 'L', throws: 'L', height: 'average', build: 'stocky', skinTone: 'light', teamSource: 'San Francisco Giants' },
        { id: 'db_crawford_b', name: 'Brandon Crawford', number: 35, position: 'SS', stars: 2, power: 58, contact: 66, speed: 42, fielding: 85, arm: 82, bats: 'L', throws: 'R', height: 'tall', build: 'average', skinTone: 'light', teamSource: 'San Francisco Giants' },
        { id: 'db_wade', name: 'LaMonte Wade Jr.', number: 31, position: '1B', stars: 2, power: 65, contact: 72, speed: 50, fielding: 70, arm: 65, bats: 'L', throws: 'L', height: 'average', build: 'average', skinTone: 'dark', teamSource: 'San Francisco Giants' },
        { id: 'db_bailey', name: 'Patrick Bailey', number: 14, position: 'C', stars: 3, power: 62, contact: 70, speed: 42, fielding: 82, arm: 80, bats: 'S', throws: 'R', height: 'average', build: 'average', skinTone: 'light', teamSource: 'San Francisco Giants' },
        { id: 'db_doval', name: 'Camilo Doval', number: 75, position: 'RP', stars: 3, power: 15, contact: 12, speed: 40, fielding: 45, arm: 82, pitchSpeed: 99, pitchControl: 72, pitchBreak: 86, bats: 'R', throws: 'R', height: 'tall', build: 'lean', skinTone: 'medium', teamSource: 'San Francisco Giants' },
        { id: 'db_yastrzemski', name: 'Mike Yastrzemski', number: 5, position: 'RF', stars: 2, power: 68, contact: 68, speed: 62, fielding: 72, arm: 72, bats: 'L', throws: 'L', height: 'average', build: 'lean', skinTone: 'light', teamSource: 'San Francisco Giants' },
    ],

    // ==========================================
    // 14. SEATTLE MARINERS
    // ==========================================
    'Seattle Mariners': [
        { id: 'db_rodriguez', name: 'Julio Rodriguez', number: 44, position: 'CF', stars: 5, power: 82, contact: 78, speed: 90, fielding: 80, arm: 84, bats: 'R', throws: 'R', height: 'tall', build: 'lean', skinTone: 'medium', teamSource: 'Seattle Mariners' },
        { id: 'db_castillo', name: 'Luis Castillo', number: 21, position: 'SP', stars: 4, power: 20, contact: 16, speed: 44, fielding: 52, arm: 84, pitchSpeed: 97, pitchControl: 84, pitchBreak: 86, bats: 'R', throws: 'R', height: 'tall', build: 'average', skinTone: 'medium', teamSource: 'Seattle Mariners' },
        { id: 'db_gilbert', name: 'Logan Gilbert', number: 36, position: 'SP', stars: 3, power: 18, contact: 15, speed: 42, fielding: 50, arm: 80, pitchSpeed: 96, pitchControl: 82, pitchBreak: 80, bats: 'R', throws: 'R', height: 'tall', build: 'lean', skinTone: 'light', teamSource: 'Seattle Mariners' },
        { id: 'db_kirby', name: 'George Kirby', number: 68, position: 'SP', stars: 3, power: 18, contact: 16, speed: 40, fielding: 48, arm: 78, pitchSpeed: 96, pitchControl: 88, pitchBreak: 78, bats: 'R', throws: 'R', height: 'tall', build: 'average', skinTone: 'light', teamSource: 'Seattle Mariners' },
        { id: 'db_crawford_jp', name: 'J.P. Crawford', number: 3, position: 'SS', stars: 3, power: 55, contact: 78, speed: 68, fielding: 88, arm: 82, bats: 'L', throws: 'R', height: 'average', build: 'lean', skinTone: 'light', teamSource: 'Seattle Mariners' },
        { id: 'db_france', name: 'Ty France', number: 23, position: '1B', stars: 2, power: 65, contact: 78, speed: 38, fielding: 68, arm: 65, bats: 'R', throws: 'R', height: 'average', build: 'stocky', skinTone: 'light', teamSource: 'Seattle Mariners' },
        { id: 'db_raleigh', name: 'Cal Raleigh', number: 29, position: 'C', stars: 3, power: 78, contact: 62, speed: 35, fielding: 82, arm: 82, bats: 'S', throws: 'R', height: 'tall', build: 'stocky', skinTone: 'light', teamSource: 'Seattle Mariners' },
        { id: 'db_munoz', name: 'Andres Munoz', number: 75, position: 'RP', stars: 3, power: 15, contact: 12, speed: 42, fielding: 45, arm: 82, pitchSpeed: 100, pitchControl: 72, pitchBreak: 84, bats: 'R', throws: 'R', height: 'tall', build: 'average', skinTone: 'medium', teamSource: 'Seattle Mariners' },
    ],

    // ==========================================
    // 15. CLEVELAND GUARDIANS
    // ==========================================
    'Cleveland Guardians': [
        { id: 'db_ramirez', name: 'Jose Ramirez', number: 11, position: '3B', stars: 5, power: 85, contact: 88, speed: 75, fielding: 80, arm: 82, bats: 'S', throws: 'R', height: 'short', build: 'stocky', skinTone: 'medium', teamSource: 'Cleveland Guardians' },
        { id: 'db_clase', name: 'Emmanuel Clase', number: 48, position: 'RP', stars: 5, power: 15, contact: 10, speed: 42, fielding: 48, arm: 90, pitchSpeed: 100, pitchControl: 88, pitchBreak: 85, bats: 'R', throws: 'R', height: 'tall', build: 'lean', skinTone: 'dark', teamSource: 'Cleveland Guardians' },
        { id: 'db_gimenez', name: 'Andres Gimenez', number: 0, position: '2B', stars: 4, power: 68, contact: 80, speed: 82, fielding: 90, arm: 78, bats: 'L', throws: 'R', height: 'short', build: 'lean', skinTone: 'medium', teamSource: 'Cleveland Guardians' },
        { id: 'db_kwan', name: 'Steven Kwan', number: 38, position: 'LF', stars: 3, power: 45, contact: 92, speed: 78, fielding: 82, arm: 65, bats: 'L', throws: 'L', height: 'short', build: 'lean', skinTone: 'light', teamSource: 'Cleveland Guardians' },
        { id: 'db_naylor', name: 'Josh Naylor', number: 22, position: '1B', stars: 3, power: 80, contact: 75, speed: 40, fielding: 68, arm: 68, bats: 'L', throws: 'L', height: 'average', build: 'stocky', skinTone: 'light', teamSource: 'Cleveland Guardians' },
        { id: 'db_bieber', name: 'Shane Bieber', number: 57, position: 'SP', stars: 3, power: 18, contact: 16, speed: 40, fielding: 52, arm: 78, pitchSpeed: 93, pitchControl: 90, pitchBreak: 82, bats: 'R', throws: 'R', height: 'tall', build: 'lean', skinTone: 'light', teamSource: 'Cleveland Guardians' },
        { id: 'db_mckenzie', name: 'Triston McKenzie', number: 24, position: 'SP', stars: 2, power: 16, contact: 14, speed: 42, fielding: 48, arm: 74, pitchSpeed: 94, pitchControl: 75, pitchBreak: 80, bats: 'R', throws: 'R', height: 'tall', build: 'lean', skinTone: 'dark', teamSource: 'Cleveland Guardians' },
        { id: 'db_hedges', name: 'Austin Hedges', number: 17, position: 'C', stars: 1, power: 40, contact: 48, speed: 32, fielding: 88, arm: 85, bats: 'R', throws: 'R', height: 'average', build: 'average', skinTone: 'light', teamSource: 'Cleveland Guardians' },
    ],

    // ==========================================
    // 16. BALTIMORE ORIOLES
    // ==========================================
    'Baltimore Orioles': [
        { id: 'db_henderson', name: 'Gunnar Henderson', number: 2, position: 'SS', stars: 5, power: 82, contact: 78, speed: 75, fielding: 75, arm: 80, bats: 'L', throws: 'R', height: 'tall', build: 'lean', skinTone: 'light', teamSource: 'Baltimore Orioles' },
        { id: 'db_adley', name: 'Adley Rutschman', number: 35, position: 'C', stars: 4, power: 72, contact: 84, speed: 48, fielding: 90, arm: 88, bats: 'S', throws: 'R', height: 'average', build: 'average', skinTone: 'light', teamSource: 'Baltimore Orioles' },
        { id: 'db_mullins', name: 'Cedric Mullins', number: 31, position: 'CF', stars: 3, power: 65, contact: 72, speed: 88, fielding: 80, arm: 72, bats: 'S', throws: 'L', height: 'short', build: 'lean', skinTone: 'dark', teamSource: 'Baltimore Orioles' },
        { id: 'db_mountcastle', name: 'Ryan Mountcastle', number: 6, position: '1B', stars: 3, power: 78, contact: 72, speed: 45, fielding: 65, arm: 68, bats: 'R', throws: 'R', height: 'tall', build: 'average', skinTone: 'light', teamSource: 'Baltimore Orioles' },
        { id: 'db_holliday', name: 'Jackson Holliday', number: 7, position: '2B', stars: 3, power: 65, contact: 72, speed: 72, fielding: 74, arm: 72, bats: 'L', throws: 'R', height: 'average', build: 'lean', skinTone: 'light', teamSource: 'Baltimore Orioles' },
        { id: 'db_grayson', name: 'Grayson Rodriguez', number: 30, position: 'SP', stars: 4, power: 18, contact: 15, speed: 44, fielding: 50, arm: 82, pitchSpeed: 97, pitchControl: 78, pitchBreak: 85, bats: 'L', throws: 'R', height: 'tall', build: 'lean', skinTone: 'light', teamSource: 'Baltimore Orioles' },
        { id: 'db_means', name: 'John Means', number: 47, position: 'SP', stars: 2, power: 16, contact: 14, speed: 40, fielding: 50, arm: 72, pitchSpeed: 92, pitchControl: 80, pitchBreak: 76, bats: 'L', throws: 'L', height: 'tall', build: 'average', skinTone: 'light', teamSource: 'Baltimore Orioles' },
        { id: 'db_hays', name: 'Austin Hays', number: 21, position: 'RF', stars: 2, power: 68, contact: 70, speed: 65, fielding: 72, arm: 74, bats: 'R', throws: 'R', height: 'average', build: 'average', skinTone: 'light', teamSource: 'Baltimore Orioles' },
    ],

    // ==========================================
    // 17. TEXAS RANGERS
    // ==========================================
    'Texas Rangers': [
        { id: 'db_seager', name: 'Corey Seager', number: 5, position: 'SS', stars: 4, power: 82, contact: 80, speed: 55, fielding: 72, arm: 76, bats: 'L', throws: 'R', height: 'tall', build: 'average', skinTone: 'light', teamSource: 'Texas Rangers' },
        { id: 'db_degrom', name: 'Jacob deGrom', number: 48, position: 'SP', stars: 5, power: 35, contact: 30, speed: 55, fielding: 60, arm: 95, pitchSpeed: 99, pitchControl: 92, pitchBreak: 90, bats: 'L', throws: 'R', height: 'tall', build: 'lean', skinTone: 'light', teamSource: 'Texas Rangers' },
        { id: 'db_semien', name: 'Marcus Semien', number: 2, position: '2B', stars: 4, power: 76, contact: 78, speed: 72, fielding: 82, arm: 78, bats: 'R', throws: 'R', height: 'average', build: 'average', skinTone: 'dark', teamSource: 'Texas Rangers' },
        { id: 'db_garcia_a', name: 'Adolis Garcia', number: 53, position: 'RF', stars: 3, power: 82, contact: 66, speed: 78, fielding: 78, arm: 90, bats: 'R', throws: 'R', height: 'tall', build: 'lean', skinTone: 'dark', teamSource: 'Texas Rangers' },
        { id: 'db_lowe_n', name: 'Nathaniel Lowe', number: 30, position: '1B', stars: 3, power: 72, contact: 78, speed: 42, fielding: 72, arm: 68, bats: 'L', throws: 'L', height: 'tall', build: 'average', skinTone: 'light', teamSource: 'Texas Rangers' },
        { id: 'db_jung', name: 'Josh Jung', number: 6, position: '3B', stars: 3, power: 78, contact: 72, speed: 55, fielding: 72, arm: 78, bats: 'R', throws: 'R', height: 'average', build: 'average', skinTone: 'light', teamSource: 'Texas Rangers' },
        { id: 'db_eovaldi', name: 'Nathan Eovaldi', number: 17, position: 'SP', stars: 3, power: 20, contact: 16, speed: 42, fielding: 52, arm: 80, pitchSpeed: 97, pitchControl: 82, pitchBreak: 80, bats: 'R', throws: 'R', height: 'tall', build: 'average', skinTone: 'light', teamSource: 'Texas Rangers' },
        { id: 'db_leclerc', name: 'Jose Leclerc', number: 25, position: 'RP', stars: 2, power: 14, contact: 12, speed: 40, fielding: 44, arm: 76, pitchSpeed: 96, pitchControl: 72, pitchBreak: 80, bats: 'R', throws: 'R', height: 'average', build: 'lean', skinTone: 'medium', teamSource: 'Texas Rangers' },
    ],

    // ==========================================
    // 18. TAMPA BAY RAYS
    // ==========================================
    'Tampa Bay Rays': [
        { id: 'db_franco', name: 'Wander Franco', number: 5, position: 'SS', stars: 4, power: 72, contact: 82, speed: 78, fielding: 78, arm: 80, bats: 'S', throws: 'R', height: 'short', build: 'average', skinTone: 'medium', teamSource: 'Tampa Bay Rays' },
        { id: 'db_arozarena', name: 'Randy Arozarena', number: 56, position: 'LF', stars: 3, power: 72, contact: 72, speed: 82, fielding: 72, arm: 75, bats: 'R', throws: 'R', height: 'average', build: 'lean', skinTone: 'dark', teamSource: 'Tampa Bay Rays' },
        { id: 'db_lowe_b', name: 'Brandon Lowe', number: 8, position: '2B', stars: 3, power: 75, contact: 68, speed: 60, fielding: 72, arm: 70, bats: 'L', throws: 'R', height: 'short', build: 'average', skinTone: 'light', teamSource: 'Tampa Bay Rays' },
        { id: 'db_rasmussen', name: 'Drew Rasmussen', number: 57, position: 'SP', stars: 3, power: 18, contact: 14, speed: 42, fielding: 50, arm: 78, pitchSpeed: 96, pitchControl: 82, pitchBreak: 80, bats: 'R', throws: 'R', height: 'tall', build: 'lean', skinTone: 'light', teamSource: 'Tampa Bay Rays' },
        { id: 'db_glasnow', name: 'Tyler Glasnow', number: 20, position: 'SP', stars: 4, power: 20, contact: 16, speed: 44, fielding: 48, arm: 85, pitchSpeed: 98, pitchControl: 78, pitchBreak: 90, bats: 'L', throws: 'R', height: 'tall', build: 'lean', skinTone: 'light', teamSource: 'Tampa Bay Rays' },
        { id: 'db_paredes', name: 'Isaac Paredes', number: 17, position: '3B', stars: 3, power: 72, contact: 76, speed: 35, fielding: 65, arm: 68, bats: 'R', throws: 'R', height: 'short', build: 'stocky', skinTone: 'medium', teamSource: 'Tampa Bay Rays' },
        { id: 'db_walls', name: 'Taylor Walls', number: 0, position: 'SS', stars: 1, power: 38, contact: 58, speed: 72, fielding: 82, arm: 78, bats: 'S', throws: 'R', height: 'short', build: 'lean', skinTone: 'light', teamSource: 'Tampa Bay Rays' },
        { id: 'db_bethancourt', name: 'Christian Bethancourt', number: 14, position: 'C', stars: 2, power: 58, contact: 64, speed: 45, fielding: 72, arm: 78, bats: 'R', throws: 'R', height: 'tall', build: 'average', skinTone: 'medium', teamSource: 'Tampa Bay Rays' },
    ],

    // ==========================================
    // 19. KANSAS CITY ROYALS
    // ==========================================
    'Kansas City Royals': [
        { id: 'db_witt', name: 'Bobby Witt Jr.', number: 7, position: 'SS', stars: 5, power: 80, contact: 80, speed: 94, fielding: 82, arm: 88, bats: 'R', throws: 'R', height: 'tall', build: 'lean', skinTone: 'light', teamSource: 'Kansas City Royals' },
        { id: 'db_perez_s', name: 'Salvador Perez', number: 13, position: 'C', stars: 4, power: 85, contact: 72, speed: 32, fielding: 78, arm: 85, bats: 'R', throws: 'R', height: 'tall', build: 'stocky', skinTone: 'medium', teamSource: 'Kansas City Royals' },
        { id: 'db_pasquantino', name: 'Vinnie Pasquantino', number: 9, position: '1B', stars: 3, power: 78, contact: 78, speed: 35, fielding: 72, arm: 68, bats: 'L', throws: 'R', height: 'tall', build: 'stocky', skinTone: 'light', teamSource: 'Kansas City Royals' },
        { id: 'db_melendez', name: 'MJ Melendez', number: 1, position: 'LF', stars: 2, power: 68, contact: 62, speed: 62, fielding: 65, arm: 72, bats: 'L', throws: 'R', height: 'average', build: 'average', skinTone: 'medium', teamSource: 'Kansas City Royals' },
        { id: 'db_massey', name: 'Michael Massey', number: 19, position: '2B', stars: 2, power: 62, contact: 72, speed: 58, fielding: 72, arm: 68, bats: 'L', throws: 'R', height: 'average', build: 'average', skinTone: 'light', teamSource: 'Kansas City Royals' },
        { id: 'db_singer', name: 'Brady Singer', number: 51, position: 'SP', stars: 3, power: 18, contact: 14, speed: 42, fielding: 52, arm: 78, pitchSpeed: 95, pitchControl: 80, pitchBreak: 82, bats: 'R', throws: 'R', height: 'tall', build: 'average', skinTone: 'light', teamSource: 'Kansas City Royals' },
        { id: 'db_wacha', name: 'Michael Wacha', number: 52, position: 'SP', stars: 2, power: 16, contact: 14, speed: 38, fielding: 50, arm: 72, pitchSpeed: 93, pitchControl: 78, pitchBreak: 75, bats: 'R', throws: 'R', height: 'tall', build: 'average', skinTone: 'light', teamSource: 'Kansas City Royals' },
        { id: 'db_taylor', name: 'Michael A. Taylor', number: 2, position: 'CF', stars: 1, power: 52, contact: 58, speed: 82, fielding: 88, arm: 80, bats: 'R', throws: 'R', height: 'tall', build: 'lean', skinTone: 'dark', teamSource: 'Kansas City Royals' },
    ],

    // ==========================================
    // 20. MINNESOTA TWINS
    // ==========================================
    'Minnesota Twins': [
        { id: 'db_correa', name: 'Carlos Correa', number: 4, position: 'SS', stars: 4, power: 80, contact: 82, speed: 62, fielding: 85, arm: 85, bats: 'R', throws: 'R', height: 'tall', build: 'average', skinTone: 'medium', teamSource: 'Minnesota Twins' },
        { id: 'db_buxton', name: 'Byron Buxton', number: 25, position: 'CF', stars: 4, power: 85, contact: 68, speed: 96, fielding: 92, arm: 85, bats: 'R', throws: 'R', height: 'average', build: 'lean', skinTone: 'dark', teamSource: 'Minnesota Twins' },
        { id: 'db_lewis', name: 'Royce Lewis', number: 23, position: 'SS', stars: 3, power: 75, contact: 72, speed: 78, fielding: 72, arm: 76, bats: 'R', throws: 'R', height: 'average', build: 'lean', skinTone: 'dark', teamSource: 'Minnesota Twins' },
        { id: 'db_polanco', name: 'Jorge Polanco', number: 11, position: '2B', stars: 3, power: 70, contact: 76, speed: 55, fielding: 72, arm: 72, bats: 'S', throws: 'R', height: 'short', build: 'average', skinTone: 'medium', teamSource: 'Minnesota Twins' },
        { id: 'db_miranda', name: 'Jose Miranda', number: 64, position: '1B', stars: 2, power: 68, contact: 74, speed: 38, fielding: 65, arm: 68, bats: 'R', throws: 'R', height: 'average', build: 'stocky', skinTone: 'medium', teamSource: 'Minnesota Twins' },
        { id: 'db_ryan', name: 'Joe Ryan', number: 41, position: 'SP', stars: 3, power: 18, contact: 14, speed: 40, fielding: 48, arm: 78, pitchSpeed: 93, pitchControl: 85, pitchBreak: 80, bats: 'R', throws: 'R', height: 'tall', build: 'average', skinTone: 'light', teamSource: 'Minnesota Twins' },
        { id: 'db_lopez_p', name: 'Pablo Lopez', number: 49, position: 'SP', stars: 4, power: 18, contact: 16, speed: 42, fielding: 52, arm: 82, pitchSpeed: 94, pitchControl: 88, pitchBreak: 84, bats: 'R', throws: 'R', height: 'tall', build: 'lean', skinTone: 'medium', teamSource: 'Minnesota Twins' },
        { id: 'db_duran_j', name: 'Jhoan Duran', number: 59, position: 'RP', stars: 4, power: 15, contact: 12, speed: 44, fielding: 46, arm: 85, pitchSpeed: 100, pitchControl: 75, pitchBreak: 88, bats: 'R', throws: 'R', height: 'tall', build: 'lean', skinTone: 'dark', teamSource: 'Minnesota Twins' },
    ],

};
