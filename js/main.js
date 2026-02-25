import { Game } from './engine/Game.js';
import { TitleScene } from './scenes/TitleScene.js';
import { DraftScene } from './scenes/DraftScene.js';
import { TeamScene } from './scenes/TeamScene.js';
import { SeasonScene } from './scenes/SeasonScene.js';
import { PreGameScene } from './scenes/PreGameScene.js';
import { PostGameScene } from './scenes/PostGameScene.js';
import { ShopScene } from './scenes/ShopScene.js';
import { WorldSeriesScene } from './scenes/WorldSeriesScene.js';
import { GameScene } from './scenes/GameScene.js';
import { AdminScene } from './scenes/AdminScene.js';
import { AdminDataManager } from './systems/AdminDataManager.js';
import { SeasonSetupScene } from './scenes/SeasonSetupScene.js';
import { LeaderboardScene } from './scenes/LeaderboardScene.js';
import { LeaderboardManager } from './systems/LeaderboardManager.js';
import { FIREBASE_CONFIG } from './config/firebase.js';

// Resolve lazy cross-references between scenes (avoids circular imports)
DraftScene._SeasonSetupScene = SeasonSetupScene;
SeasonSetupScene._TeamScene = TeamScene;
TeamScene._SeasonScene = SeasonScene;
SeasonScene._TeamScene = TeamScene;
SeasonScene._ShopScene = ShopScene;
SeasonScene._PreGameScene = PreGameScene;
SeasonScene._WorldSeriesScene = WorldSeriesScene;
SeasonScene._TitleScene = TitleScene;
PreGameScene._GameScene = GameScene;
PreGameScene._SeasonScene = SeasonScene;
PostGameScene._SeasonScene = SeasonScene;
ShopScene._SeasonScene = SeasonScene;
WorldSeriesScene._GameScene = GameScene;
WorldSeriesScene._TitleScene = TitleScene;
GameScene._PostGameScene = PostGameScene;
GameScene._WorldSeriesScene = WorldSeriesScene;
TitleScene._DraftScene = DraftScene;
TitleScene._SeasonScene = SeasonScene;
TitleScene._AdminScene = AdminScene;
TitleScene._LeaderboardScene = LeaderboardScene;
LeaderboardScene._TitleScene = TitleScene;
AdminScene._TitleScene = TitleScene;

// Apply admin overrides before game starts
AdminDataManager.applyOverrides();

// Initialize Firebase leaderboard (gracefully fails if config not set)
LeaderboardManager.init(FIREBASE_CONFIG);

// Start the game
const game = new Game('gameCanvas');
game.start(new TitleScene(game));

// Expose for debugging
window._game = game;
window._scenes = { TitleScene, DraftScene, TeamScene, SeasonScene, SeasonSetupScene, PreGameScene, PostGameScene, ShopScene, WorldSeriesScene, GameScene, AdminScene, LeaderboardScene };
