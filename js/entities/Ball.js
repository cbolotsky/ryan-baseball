export class Ball {
    constructor() {
        this.pos = { x: 0, y: 0, z: 0 };
        this.vel = { x: 0, y: 0, z: 0 };
        this.active = false;
        this.trajectory = null; // bezier trajectory for pitches
        this.trajectoryT = 0;
        this.inFlight = false;
        this.gravity = 32; // ft/s^2 (simplified)
        this.spin = 0;
    }

    reset() {
        this.pos = { x: 0, y: 0, z: 0 };
        this.vel = { x: 0, y: 0, z: 0 };
        this.active = false;
        this.trajectory = null;
        this.trajectoryT = 0;
        this.inFlight = false;
    }

    setPosition(x, y, z) {
        this.pos.x = x;
        this.pos.y = y;
        this.pos.z = z;
    }

    setVelocity(vx, vy, vz) {
        this.vel.x = vx;
        this.vel.y = vy;
        this.vel.z = vz;
    }

    // For pitch trajectories (bezier curve)
    setTrajectory(trajectory) {
        this.trajectory = trajectory;
        this.trajectoryT = 0;
        this.active = true;
        this.inFlight = true;
    }

    // For hit balls (physics-based)
    launch(exitVelo, launchAngleDeg, sprayAngleDeg, startPos) {
        const launchRad = launchAngleDeg * Math.PI / 180;
        const sprayRad = sprayAngleDeg * Math.PI / 180;

        // Convert mph to ft/s (1 mph = 1.467 ft/s)
        const speed = exitVelo * 1.467;

        this.pos.x = startPos.x;
        this.pos.y = startPos.y || 3; // bat height
        this.pos.z = startPos.z;

        // Velocity components
        const horizontalSpeed = speed * Math.cos(launchRad);
        this.vel.x = horizontalSpeed * Math.sin(sprayRad);
        this.vel.y = speed * Math.sin(launchRad);
        this.vel.z = horizontalSpeed * Math.cos(sprayRad);

        this.active = true;
        this.inFlight = true;
        this.trajectory = null;
    }

    update(dt) {
        if (!this.active) return;

        if (this.trajectory) {
            // Follow bezier trajectory
            this.trajectoryT += dt / this.trajectory.duration;
            if (this.trajectoryT >= 1) {
                this.trajectoryT = 1;
                this.inFlight = false;
            }
            const t = this.trajectoryT;
            this.pos = this._bezierPos(t);
        } else if (this.inFlight) {
            // Physics-based flight (after hit)
            this.vel.y -= this.gravity * dt;
            this.pos.x += this.vel.x * dt;
            this.pos.y += this.vel.y * dt;
            this.pos.z += this.vel.z * dt;

            // Ground collision
            if (this.pos.y <= 0) {
                this.pos.y = 0;
                this.vel.y = -this.vel.y * 0.3; // bounce
                this.vel.x *= 0.7; // friction
                this.vel.z *= 0.7;

                // Stop if slow enough
                const speed = Math.sqrt(this.vel.x ** 2 + this.vel.y ** 2 + this.vel.z ** 2);
                if (speed < 5) {
                    this.vel = { x: 0, y: 0, z: 0 };
                    this.inFlight = false;
                }
            }
        }
    }

    _bezierPos(t) {
        const tr = this.trajectory;
        const mt = 1 - t;
        const mt2 = mt * mt;
        const mt3 = mt2 * mt;
        const t2 = t * t;
        const t3 = t2 * t;

        return {
            x: mt3 * tr.start.x + 3 * mt2 * t * tr.control1.x + 3 * mt * t2 * tr.control2.x + t3 * tr.end.x,
            y: mt3 * tr.start.y + 3 * mt2 * t * tr.control1.y + 3 * mt * t2 * tr.control2.y + t3 * tr.end.y,
            z: mt3 * tr.start.z + 3 * mt2 * t * tr.control1.z + 3 * mt * t2 * tr.control2.z + t3 * tr.end.z,
        };
    }

    isOnGround() {
        return this.active && !this.inFlight && this.pos.y <= 0.1;
    }

    getSpeed() {
        return Math.sqrt(this.vel.x ** 2 + this.vel.y ** 2 + this.vel.z ** 2);
    }
}
