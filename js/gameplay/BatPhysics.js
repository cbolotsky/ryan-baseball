export class BatPhysics {
    // Calculate hit result from swing timing and placement
    static calculateHitResult(timingQuality, placementQuality, batterStats, pitchType) {
        // timingQuality: 0-1 (1 = perfect timing)
        // placementQuality: 0-1 (1 = bat cursor perfectly on ball)

        const contactQuality = timingQuality * 0.6 + placementQuality * 0.4;
        const powerFactor = batterStats.power / 100;
        const contactFactor = batterStats.contact / 100;

        // Did the batter make contact at all?
        const contactChance = 0.5 + contactQuality * 0.35 + contactFactor * 0.15;
        if (Math.random() > contactChance) {
            return { type: 'miss' };
        }

        // Foul ball check (poor contact)
        if (contactQuality < 0.3 && Math.random() < 0.6) {
            return { type: 'foul' };
        }
        if (contactQuality < 0.5 && Math.random() < 0.3) {
            return { type: 'foul' };
        }

        // Exit velocity
        const baseExitVelo = 50 + contactQuality * 55 * powerFactor;
        const exitVelo = baseExitVelo + (Math.random() - 0.5) * 12;

        // Launch angle
        let launchAngle;
        if (contactQuality > 0.8) {
            // Great contact — line drive / fly ball range
            launchAngle = 15 + (Math.random() - 0.5) * 20;
        } else if (contactQuality > 0.5) {
            // Decent contact
            launchAngle = -5 + Math.random() * 45;
        } else {
            // Poor contact — ground ball or popup
            if (Math.random() < 0.5) {
                launchAngle = -15 + Math.random() * 15; // ground ball
            } else {
                launchAngle = 50 + Math.random() * 30; // popup
            }
        }

        // Spray direction (pull vs opposite field)
        // Early timing = pull, late = opposite, perfect = center
        const pullFactor = (timingQuality - 0.5) * 2; // -1 to 1
        const sprayAngle = pullFactor * 35 + (Math.random() - 0.5) * 20;

        // Calculate distance
        const launchRad = launchAngle * Math.PI / 180;
        const distance = exitVelo * 2.8 * Math.max(0, Math.cos(launchRad - 0.4));

        const type = BatPhysics.classifyHit(exitVelo, launchAngle, distance);

        return {
            type,
            exitVelo,
            launchAngle,
            sprayAngle,
            distance,
            contactQuality,
        };
    }

    static classifyHit(exitVelo, launchAngle, distance) {
        if (distance > 340) return 'home_run';
        if (launchAngle < -5) return 'ground_ball';
        if (launchAngle > 55) return 'popup';
        if (exitVelo > 85 && launchAngle > 8 && launchAngle < 28) return 'line_drive';
        if (launchAngle > 25) return 'fly_ball';
        return 'ground_ball';
    }

    // Determine if a batted ball results in an out (simplified)
    static resolveFielding(hitResult, fieldingTeamAvgFielding) {
        const fieldingFactor = fieldingTeamAvgFielding / 100;

        switch (hitResult.type) {
            case 'home_run':
                return { result: 'home_run', basesReached: 4, description: 'HOME RUN!' };

            case 'line_drive': {
                // Line drives: caught ~25% of time
                const catchChance = 0.2 + fieldingFactor * 0.1;
                if (Math.random() < catchChance) {
                    return { result: 'out', description: 'Line drive caught!' };
                }
                // Could be single, double, or triple based on distance
                if (hitResult.distance > 280) return { result: 'hit', basesReached: 3, description: 'TRIPLE!' };
                if (hitResult.distance > 200) return { result: 'hit', basesReached: 2, description: 'Double!' };
                return { result: 'hit', basesReached: 1, description: 'Base hit!' };
            }

            case 'fly_ball': {
                // Fly balls: caught more often
                if (hitResult.distance > 340) return { result: 'home_run', basesReached: 4, description: 'HOME RUN!' };
                const catchChance = 0.5 + fieldingFactor * 0.25;
                if (Math.random() < catchChance) {
                    return { result: 'out', description: 'Fly ball caught!' };
                }
                if (hitResult.distance > 250) return { result: 'hit', basesReached: 2, description: 'Double!' };
                return { result: 'hit', basesReached: 1, description: 'Single, drops in!' };
            }

            case 'ground_ball': {
                // Ground balls: fielded ~70% of time
                const fieldChance = 0.55 + fieldingFactor * 0.2;
                if (Math.random() < fieldChance) {
                    return { result: 'out', description: 'Fielded, out at first!' };
                }
                return { result: 'hit', basesReached: 1, description: 'Ground ball single!' };
            }

            case 'popup': {
                // Popups: almost always caught
                const catchChance = 0.9 + fieldingFactor * 0.08;
                if (Math.random() < catchChance) {
                    return { result: 'out', description: 'Popup caught!' };
                }
                return { result: 'hit', basesReached: 1, description: 'Dropped popup!' };
            }

            default:
                return { result: 'out', description: 'Out.' };
        }
    }
}
