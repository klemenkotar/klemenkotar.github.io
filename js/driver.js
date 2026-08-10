// ─────────────────────────────────────────────────────────────────────────────
// Locomotion: follows A* waypoints with accelerate/brake profiles and
// turn-in-place for sharp corners, like a real differential-drive rover.
// Positions are map px; heading is the page-space angle atan2(dy, dx).
// ─────────────────────────────────────────────────────────────────────────────

const TURN_SPEED = 5.2;          // rad/s
const ACCEL = 2600;              // px/s^2
const BRAKE = 3200;
const ARRIVE_R = 8;              // final-waypoint acceptance
const WAYPOINT_R = 20;           // intermediate-waypoint acceptance — must exceed the
                                 // turning circle radius or the robot can orbit forever
const WP_TIMEOUT = 2.5;          // s — failsafe: never let one waypoint trap us

export class Driver {
  constructor(x, y) {
    this.pos = { x, y };
    this.heading = Math.PI / 2;  // facing down-page (toward viewer)
    this.speed = 0;
    this.path = null;            // remaining waypoints
    this.wpIndex = 0;
    this.wpTime = 0;
    this.maxSpeed = 900;
    this.onArrive = null;
    this.faceAfter = null;       // heading to settle into after arrival
    this.accelState = 0;         // -1..1 for robot lean
    this.spinLeft = 0;           // rad remaining of a celebration spin
  }

  get moving() { return this.path !== null || this.spinLeft > 0; }

  /** drive along a precomputed path (array of map points, first = current pos) */
  follow(path, { maxSpeed = null, onArrive = null, faceAfter = null } = {}) {
    if (!path || path.length < 2) { this.path = null; if (onArrive) onArrive(); return; }
    this.path = path;
    this.wpIndex = 1;
    this.wpTime = 0;
    // scale speed with trip length: short hops stay gentle, cross-map trips are zippy
    const dist = this.pathLength(path);
    this.maxSpeed = maxSpeed ?? Math.min(2400, Math.max(700, dist / 1.7));
    this.onArrive = onArrive;
    this.faceAfter = faceAfter;
  }

  pathLength(path) {
    let d = 0;
    for (let i = 1; i < path.length; i++) d += Math.hypot(path[i].x - path[i-1].x, path[i].y - path[i-1].y);
    return d;
  }

  stop() { this.path = null; this.speed = 0; this.accelState = 0; }

  teleport(x, y) { this.stop(); this.pos.x = x; this.pos.y = y; }

  spin() { this.spinLeft = Math.PI * 2; }

  /** remaining distance to the end of the current path */
  remaining() {
    if (!this.path) return 0;
    let d = Math.hypot(this.path[this.wpIndex].x - this.pos.x, this.path[this.wpIndex].y - this.pos.y);
    for (let i = this.wpIndex + 1; i < this.path.length; i++)
      d += Math.hypot(this.path[i].x - this.path[i-1].x, this.path[i].y - this.path[i-1].y);
    return d;
  }

  update(dt) {
    let turn = 0;

    if (this.spinLeft > 0) {
      const step = Math.min(this.spinLeft, 6.5 * dt);
      this.heading += step;
      this.spinLeft -= step;
      turn = 6.5;
      this.accelState *= 0.9;
      return { speed: 0, maxSpeed: this.maxSpeed, accel: this.accelState, turn };
    }

    if (this.path) {
      const last = this.wpIndex >= this.path.length - 1;
      const wp = this.path[this.wpIndex];
      const dx = wp.x - this.pos.x, dy = wp.y - this.pos.y;
      const dist = Math.hypot(dx, dy);
      this.wpTime += dt;

      // consume the waypoint when close enough (a loose radius for intermediate
      // points — tighter than the turning circle and it becomes un-reachable and
      // the robot orbits it forever), or when it has trapped us too long.
      // The final waypoint may legitimately be a long drive away, so it only
      // times out when the robot is genuinely stuck (barely moving).
      const trapped = last ? (this.wpTime > 6 && this.speed < 40) : this.wpTime > WP_TIMEOUT;
      if (dist <= (last ? ARRIVE_R : WAYPOINT_R) || trapped) {
        if (last) {
          if (dist < 60) { this.pos.x = wp.x; this.pos.y = wp.y; }
          this.path = null;
          this.speed = 0;
          const cb = this.onArrive; this.onArrive = null;
          if (cb) cb();
          return { speed: 0, maxSpeed: this.maxSpeed, accel: this.accelState, turn: 0 };
        }
        this.wpIndex++;
        this.wpTime = 0;
        return this.update(0);   // re-aim at the next waypoint immediately
      }

      const targetHeading = Math.atan2(dy, dx);
      let dh = normAngle(targetHeading - this.heading);

      // sharp angle → brake to a stop and rotate in place (never drive-and-orbit)
      const canDrive = Math.abs(dh) < 1.1;
      const maxTurn = TURN_SPEED * (0.35 + 0.65 * (1 - Math.min(1, this.speed / 600)));
      const turnStep = clamp(dh, -maxTurn * dt, maxTurn * dt);
      this.heading = normAngle(this.heading + turnStep);
      turn = turnStep / Math.max(dt, 1e-4);

      // decide target speed: brake for arrival & corners
      const rem = this.remaining();
      const arriveSpeed = Math.sqrt(2 * BRAKE * Math.max(0, rem - ARRIVE_R));
      let target = Math.min(this.maxSpeed, arriveSpeed);
      if (!canDrive) target = 0;
      // upcoming corner? ease off proportionally to its sharpness
      if (!last && dist < 180) {
        const nx = this.path[this.wpIndex + 1];
        const nextH = Math.atan2(nx.y - wp.y, nx.x - wp.x);
        const corner = Math.abs(normAngle(nextH - targetHeading));
        target = Math.min(target, 900 - Math.min(1, corner / Math.PI) * 700 + dist * 2);
      }

      const before = this.speed;
      if (this.speed < target) this.speed = Math.min(target, this.speed + ACCEL * dt);
      else this.speed = Math.max(target, this.speed - BRAKE * dt);
      this.accelState = clamp((this.speed - before) / (dt * ACCEL + 1e-6), -1, 1);

      const step = Math.min(this.speed * dt, dist);
      this.pos.x += Math.cos(this.heading) * step;
      this.pos.y += Math.sin(this.heading) * step;
    } else {
      this.speed = Math.max(0, this.speed - BRAKE * dt);
      this.accelState *= Math.exp(-6 * dt);
      // settle into the requested resting orientation
      if (this.faceAfter !== null) {
        const dh = normAngle(this.faceAfter - this.heading);
        if (Math.abs(dh) < 0.02) { this.heading = this.faceAfter; this.faceAfter = null; }
        else {
          const s = clamp(dh, -3.5 * dt, 3.5 * dt);
          this.heading = normAngle(this.heading + s);
          turn = s / Math.max(dt, 1e-4);
        }
      }
    }

    return { speed: this.speed, maxSpeed: this.maxSpeed, accel: this.accelState, turn };
  }
}

function normAngle(a) {
  while (a > Math.PI) a -= 2 * Math.PI;
  while (a < -Math.PI) a += 2 * Math.PI;
  return a;
}
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
