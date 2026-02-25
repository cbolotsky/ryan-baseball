import { PITCH_TYPES } from '../data/pitchTypes.js';
import { BASES } from '../utils/constants.js';

export class PitchEngine {
    // Calculate a pitch trajectory from the mound to home plate
    static calculateTrajectory(pitchTypeId, targetX, targetY, pitcherStats, accuracy) {
        const pitchType = PITCH_TYPES[pitchTypeId];
        if (!pitchType) return null;

        // Start position: pitcher's hand (on the mound)
        const start = {
            x: BASES.mound.x,
            y: BASES.mound.y + 5, // hand height above mound
            z: BASES.mound.z,
        };

        // Target: home plate area
        // targetX: -1 to 1 (left to right across the zone)
        // targetY: -1 to 1 (low to high across the zone)
        const zoneWidth = 3.5; // feet wide (17 inches = ~1.4 ft, but we use game scale)
        const zoneHeight = 3;  // feet tall

        // Apply accuracy deviation
        const deviation = (100 - accuracy) / 100 * 2; // max 2 feet deviation at 0 accuracy
        const actualTargetX = targetX * zoneWidth / 2 + (Math.random() - 0.5) * deviation;
        const actualTargetY = 2.5 + targetY * zoneHeight / 2 + (Math.random() - 0.5) * deviation;

        const end = {
            x: actualTargetX,
            y: Math.max(0.5, actualTargetY),
            z: 0, // home plate
        };

        // Movement based on pitch type and pitcher stats
        const breakFactor = pitcherStats.pitchBreak / 80;
        const movement = {
            x: pitchType.movement.x * breakFactor,
            y: pitchType.movement.y * breakFactor,
        };

        // Control points for bezier curve
        const midZ = BASES.mound.z / 2;
        const control1 = {
            x: start.x + movement.x * 0.2,
            y: start.y - 1, // slight dip from release
            z: start.z - (start.z - end.z) * 0.35,
        };

        const control2 = {
            x: end.x + movement.x * 0.8,
            y: end.y + movement.y * 0.3,
            z: end.z + (start.z - end.z) * 0.2,
        };

        // Speed
        const speedMult = pitcherStats.pitchSpeed / 95;
        const pitchSpeed = pitchType.baseSpeed * speedMult;

        // Duration to reach plate (faster pitch = shorter duration)
        const duration = 0.55 + (100 - pitchSpeed) * 0.008;

        return {
            start,
            control1,
            control2,
            end,
            speed: pitchSpeed,
            duration,
            pitchType: pitchTypeId,
            movement,
        };
    }

    // Get ball position at time t (0 to 1) along trajectory
    static getPositionAtTime(trajectory, t) {
        const { start, control1, control2, end } = trajectory;
        const mt = 1 - t;
        const mt2 = mt * mt;
        const mt3 = mt2 * mt;
        const t2 = t * t;
        const t3 = t2 * t;

        return {
            x: mt3 * start.x + 3 * mt2 * t * control1.x + 3 * mt * t2 * control2.x + t3 * end.x,
            y: mt3 * start.y + 3 * mt2 * t * control1.y + 3 * mt * t2 * control2.y + t3 * end.y,
            z: mt3 * start.z + 3 * mt2 * t * control1.z + 3 * mt * t2 * control2.z + t3 * end.z,
        };
    }

    // Check if pitch location is in the strike zone
    static isStrike(endPos) {
        const zoneHalfWidth = 0.85; // ~17 inches / 2
        const zoneLow = 1.5;         // knees
        const zoneHigh = 3.5;        // mid-torso

        return Math.abs(endPos.x) <= zoneHalfWidth &&
               endPos.y >= zoneLow &&
               endPos.y <= zoneHigh;
    }

    // AI pitch selection (for computer pitcher)
    static selectAIPitch(pitcher, count, repertoire) {
        const { balls, strikes } = count;

        // Behind in count -> throw strikes (fastball)
        if (balls >= 3 && strikes < 2) {
            return { type: 'fastball', targetX: (Math.random() - 0.5) * 0.8, targetY: (Math.random() - 0.5) * 0.6 };
        }

        // Ahead in count -> throw breaking balls / waste pitches
        if (strikes === 2 && balls <= 1) {
            const breakingBalls = repertoire.filter(p => p !== 'fastball');
            if (breakingBalls.length > 0) {
                const type = breakingBalls[Math.floor(Math.random() * breakingBalls.length)];
                return {
                    type,
                    targetX: (Math.random() - 0.5) * 1.4, // might miss zone intentionally
                    targetY: -0.3 + Math.random() * 0.6,   // low in zone
                };
            }
        }

        // Even count -> mix it up
        const type = repertoire[Math.floor(Math.random() * repertoire.length)];
        return {
            type,
            targetX: (Math.random() - 0.5) * 1.0,
            targetY: (Math.random() - 0.5) * 0.8,
        };
    }
}
