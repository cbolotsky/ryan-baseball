export class GameState {
    constructor(homeTeam, awayTeam, innings = 9) {
        this.homeTeam = homeTeam;
        this.awayTeam = awayTeam;
        this.totalInnings = innings;
        this.inning = 1;
        this.isTopHalf = true; // true = away batting, false = home batting
        this.outs = 0;
        this.score = { home: 0, away: 0 };
        this.count = { balls: 0, strikes: 0 };

        this.bases = {
            first: null,
            second: null,
            third: null,
        };

        this.battingOrder = { home: 0, away: 0 };
        this.pitchCount = 0;

        this.scoreByInning = {
            home: new Array(innings).fill(0),
            away: new Array(innings).fill(0),
        };

        this.lastPlayResult = null; // 'strike', 'ball', 'foul', 'hit', 'out', etc.
        this.lastPlayDescription = '';

        // Flag set when 3 outs end a decisive half-inning (checked by isGameOver)
        this._gameEndedAfterOuts = false;
    }

    getBattingTeam() {
        return this.isTopHalf ? this.awayTeam : this.homeTeam;
    }

    getFieldingTeam() {
        return this.isTopHalf ? this.homeTeam : this.awayTeam;
    }

    getCurrentBatter() {
        const team = this.getBattingTeam();
        const idx = this.isTopHalf ? this.battingOrder.away : this.battingOrder.home;
        return team.lineup[idx % team.lineup.length];
    }

    getCurrentPitcher() {
        const team = this.getFieldingTeam();
        return team.startingPitcher || team.lineup.find(p => p.assignedPosition === 'P');
    }

    advanceBatter() {
        if (this.isTopHalf) {
            this.battingOrder.away = (this.battingOrder.away + 1) % this.awayTeam.lineup.length;
        } else {
            this.battingOrder.home = (this.battingOrder.home + 1) % this.homeTeam.lineup.length;
        }
        this.resetCount();
    }

    resetCount() {
        this.count.balls = 0;
        this.count.strikes = 0;
    }

    addStrike() {
        this.count.strikes++;
        if (this.count.strikes >= 3) {
            this.recordOut('strikeout');
            return 'strikeout';
        }
        return 'strike';
    }

    addBall() {
        this.count.balls++;
        if (this.count.balls >= 4) {
            this.recordWalk();
            return 'walk';
        }
        return 'ball';
    }

    addFoul() {
        if (this.count.strikes < 2) {
            this.count.strikes++;
        }
        return 'foul';
    }

    recordOut(type = 'out') {
        this.outs++;
        this.lastPlayResult = type;

        if (this.outs >= 3) {
            // Check game-over conditions BEFORE endHalfInning resets outs/flips state
            if (this.isTopHalf && this.inning >= this.totalInnings && this.score.home > this.score.away) {
                // Top half over, home leads — no need for bottom half
                this._gameEndedAfterOuts = true;
            }
            if (!this.isTopHalf && this.inning >= this.totalInnings && this.score.home !== this.score.away) {
                // Bottom half over in final+ inning, scores differ — game over
                this._gameEndedAfterOuts = true;
            }
            this.endHalfInning();
            return 'half_inning_over';
        }

        this.advanceBatter();
        return type;
    }

    recordWalk() {
        // Advance runners forced by walk
        if (this.bases.first) {
            if (this.bases.second) {
                if (this.bases.third) {
                    this.recordRun(this.bases.third);
                }
                this.bases.third = this.bases.second;
            }
            this.bases.second = this.bases.first;
        }
        this.bases.first = this.getCurrentBatter();
        this.lastPlayResult = 'walk';
        this.lastPlayDescription = `${this.getCurrentBatter().name} walks`;
        this.advanceBatter();
    }

    recordHit(basesReached, runners = null) {
        const batter = this.getCurrentBatter();
        const scoreBefore = this.isTopHalf ? this.score.away : this.score.home;

        // Advance existing runners
        if (basesReached >= 4) {
            // Home run — everyone scores
            if (this.bases.third) this.recordRun(this.bases.third);
            if (this.bases.second) this.recordRun(this.bases.second);
            if (this.bases.first) this.recordRun(this.bases.first);
            this.recordRun(batter);
            this.bases = { first: null, second: null, third: null };
        } else if (basesReached === 3) {
            // Triple
            if (this.bases.third) this.recordRun(this.bases.third);
            if (this.bases.second) this.recordRun(this.bases.second);
            if (this.bases.first) this.recordRun(this.bases.first);
            this.bases.third = batter;
            this.bases.second = null;
            this.bases.first = null;
        } else if (basesReached === 2) {
            // Double
            if (this.bases.third) this.recordRun(this.bases.third);
            if (this.bases.second) this.recordRun(this.bases.second);
            this.bases.third = this.bases.first || null;
            this.bases.second = batter;
            this.bases.first = null;
        } else {
            // Single
            if (this.bases.third) this.recordRun(this.bases.third);
            this.bases.third = this.bases.second;
            this.bases.second = this.bases.first;
            this.bases.first = batter;
        }

        // Track RBI
        const scoreAfter = this.isTopHalf ? this.score.away : this.score.home;
        const rbis = scoreAfter - scoreBefore;
        if (batter && rbis > 0) {
            batter.seasonStats.rbi += rbis;
        }

        this.advanceBatter();
    }

    recordRun(player) {
        // Extend scoreByInning arrays for extra innings
        while (this.scoreByInning.home.length < this.inning) {
            this.scoreByInning.home.push(0);
            this.scoreByInning.away.push(0);
        }

        if (this.isTopHalf) {
            this.score.away++;
            this.scoreByInning.away[this.inning - 1]++;
        } else {
            this.score.home++;
            this.scoreByInning.home[this.inning - 1]++;
        }
        if (player) player.seasonStats.runs++;
    }

    endHalfInning() {
        this.outs = 0;
        this.bases = { first: null, second: null, third: null };
        this.resetCount();

        if (!this.isTopHalf) {
            // End of full inning
            this.inning++;
            // Extend scoreByInning for extra innings
            while (this.scoreByInning.home.length < this.inning) {
                this.scoreByInning.home.push(0);
                this.scoreByInning.away.push(0);
            }
        }
        this.isTopHalf = !this.isTopHalf;
    }

    isGameOver() {
        // Walk-off: bottom half of final+ inning, home team takes the lead mid-inning
        if (!this.isTopHalf && this.inning >= this.totalInnings && this.score.home > this.score.away) {
            return true;
        }

        // Game ended after 3 outs in a decisive half-inning
        // (flag set by recordOut before endHalfInning resets outs to 0)
        if (this._gameEndedAfterOuts) {
            return true;
        }

        return false;
    }

    getWinner() {
        if (this.score.home > this.score.away) return 'home';
        if (this.score.away > this.score.home) return 'away';
        return null;
    }

    getRunnersOnBase() {
        let count = 0;
        if (this.bases.first) count++;
        if (this.bases.second) count++;
        if (this.bases.third) count++;
        return count;
    }
}
