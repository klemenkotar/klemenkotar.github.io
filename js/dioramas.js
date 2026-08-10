// ─────────────────────────────────────────────────────────────────────────────
// Tiny 3D dioramas for the About section — one hand-built low-poly model per
// fun fact, rendered into the shared robot canvas with viewport/scissor so a
// single WebGL context drives everything. Fully still, like little figurines
// standing on the page.
// ─────────────────────────────────────────────────────────────────────────────
import * as THREE from 'three';
import { RoundedBoxGeometry } from '../vendor/RoundedBoxGeometry.js';

function mat(color, opts = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0.05, flatShading: false, ...opts });
}
function box(w, h, d, r, color, opts) {
  return new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 2, r), mat(color, opts));
}
function blobShadow(radius = 0.55, opacity = 0.14) {
  const m = new THREE.Mesh(
    new THREE.CircleGeometry(radius, 24),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity })
  );
  m.rotation.x = -Math.PI / 2;
  m.position.y = 0.005;
  return m;
}

const BUILDERS = {
  // ── Triglav: Slovenia's three-headed mountain ──
  triglav() {
    const g = new THREE.Group();
    const rock = mat(0x98a0ad, { flatShading: true, roughness: 0.9 });
    const snow = mat(0xf7f9fb, { flatShading: true, roughness: 0.7 });
    const peaks = [
      { x: 0, z: 0, r: 0.55, h: 1.1 },
      { x: -0.52, z: 0.1, r: 0.42, h: 0.78 },
      { x: 0.5, z: -0.06, r: 0.38, h: 0.64 },
    ];
    for (const p of peaks) {
      const cone = new THREE.Mesh(new THREE.ConeGeometry(p.r, p.h, 5), rock);
      cone.position.set(p.x, p.h / 2, p.z);
      cone.rotation.y = p.x * 2.1;
      const cap = new THREE.Mesh(new THREE.ConeGeometry(p.r * 0.42, p.h * 0.34, 5), snow);
      cap.position.set(p.x, p.h - p.h * 0.17 + 0.002, p.z);
      cap.rotation.y = cone.rotation.y;
      g.add(cone, cap);
    }
    const hill = new THREE.Mesh(new THREE.SphereGeometry(0.42, 8, 6), mat(0x9db97e, { flatShading: true }));
    hill.scale.set(1.4, 0.35, 1.1);
    hill.position.set(0.1, 0.05, 0.42);
    g.add(hill, blobShadow(0.85, 0.12));
    return { model: g, yaw: -0.25 };
  },

  // ── M-class hobby rocket standing on its pad ──
  rocket() {
    const g = new THREE.Group();
    const ship = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 1.1, 18), mat(0xf5f1e6, { roughness: 0.45 }));
    body.position.y = 0.85;
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.3, 18), mat(0xff6f61, { roughness: 0.45 }));
    nose.position.y = 1.55;
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.134, 0.134, 0.07, 18), mat(0xff6f61));
    band.position.y = 0.56;
    ship.add(body, nose, band);
    for (let i = 0; i < 3; i++) {
      const fin = box(0.03, 0.3, 0.18, 0.015, 0xff6f61);
      const a = (i / 3) * Math.PI * 2;
      fin.position.set(Math.sin(a) * 0.16, 0.42, Math.cos(a) * 0.16);
      fin.rotation.y = a;
      ship.add(fin);
    }
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.36, 0.08, 18), mat(0xb8b2a2, { roughness: 0.8 }));
    pad.position.y = 0.04;
    ship.position.y = 0.08;                   // resting on the pad
    ship.scale.setScalar(0.92);
    g.add(ship, pad, blobShadow(0.5));
    return { model: g, yaw: 0.2 };
  },

  // ── the Washington Hyperloop pod on its rail ──
  hyperloop() {
    const g = new THREE.Group();
    const pod = new THREE.Group();
    const hull = new THREE.Mesh(new THREE.CapsuleGeometry(0.26, 0.95, 8, 18), mat(0x23252b, { roughness: 0.3, metalness: 0.35 }));
    hull.rotation.z = Math.PI / 2;
    hull.scale.set(0.72, 1, 0.8);
    const stripe = box(1.28, 0.035, 0.13, 0.015, 0x6b3fa0);       // husky purple
    stripe.position.y = 0.155;
    const gold = box(0.3, 0.045, 0.14, 0.02, 0xd8b542);           // and gold
    gold.position.set(0.52, 0.11, 0);
    gold.rotation.z = -0.18;
    // rocket booster at the tail
    const booster = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.22, 14), mat(0x8f96a3, { metalness: 0.5, roughness: 0.35 }));
    booster.rotation.z = Math.PI / 2;
    booster.position.set(-0.72, 0.02, 0);
    const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.12, 0.14, 14, 1, true), mat(0x3a3e47, { metalness: 0.6, roughness: 0.4, side: THREE.DoubleSide }));
    nozzle.rotation.z = Math.PI / 2;
    nozzle.position.set(-0.86, 0.02, 0);
    pod.add(hull, stripe, gold, booster, nozzle);
    pod.position.y = 0.33;                    // sitting on the rail
    // rail
    const bed = box(1.8, 0.06, 0.34, 0.02, 0xcfc8b6, { roughness: 0.9 });
    bed.position.y = 0.03;
    const rail = box(1.8, 0.07, 0.09, 0.02, 0x8f96a3, { metalness: 0.4, roughness: 0.4 });
    rail.position.y = 0.1;
    g.add(pod, bed, rail, blobShadow(0.75, 0.12));
    return { model: g, yaw: -0.45 };
  },

  // ── a Franka-style robot arm for the Fox lab days ──
  franka() {
    const g = new THREE.Group();
    const white = 0xf3f0e9, dark = 0x2b2e36;
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 0.1, 20), mat(dark));
    base.position.y = 0.05;
    const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.15, 0.18, 16), mat(white, { roughness: 0.4 }));
    pedestal.position.y = 0.19;
    g.add(base, pedestal, blobShadow(0.5));

    const shoulder = new THREE.Group();
    shoulder.position.y = 0.28;
    g.add(shoulder);
    const link1 = box(0.15, 0.5, 0.15, 0.07, white, { roughness: 0.4 });
    link1.position.y = 0.22;
    const j1 = new THREE.Mesh(new THREE.SphereGeometry(0.1, 14, 12), mat(dark));
    j1.position.y = 0.48;
    shoulder.add(link1, j1);
    shoulder.rotation.z = -0.18;

    const elbow = new THREE.Group();
    elbow.position.y = 0.48;
    shoulder.add(elbow);
    const link2 = box(0.13, 0.44, 0.13, 0.06, white, { roughness: 0.4 });
    link2.position.y = 0.19;
    const j2 = new THREE.Mesh(new THREE.SphereGeometry(0.085, 14, 12), mat(dark));
    j2.position.y = 0.4;
    elbow.add(link2, j2);
    elbow.rotation.z = 1.15;

    const wrist = new THREE.Group();
    wrist.position.y = 0.4;
    elbow.add(wrist);
    const link3 = box(0.11, 0.3, 0.11, 0.05, white, { roughness: 0.4 });
    link3.position.y = 0.13;
    const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.08, 14), mat(dark));
    cuff.position.y = 0.3;
    wrist.add(link3, cuff);
    wrist.rotation.z = 0.75;
    const fingers = [];
    for (const f of [-1, 1]) {
      const finger = box(0.035, 0.14, 0.05, 0.015, white, { roughness: 0.4 });
      finger.position.set(f * 0.045, 0.4, 0);
      wrist.add(finger);
      fingers.push(finger);
    }
    return { model: g, yaw: -0.65 };
  },

  // ── Hoover Tower for the Stanford years ──
  hoover() {
    const g = new THREE.Group();
    const sand = 0xead9b5;
    const plinth = box(0.6, 0.14, 0.6, 0.02, 0xd9c69a, { roughness: 0.8 });
    plinth.position.y = 0.07;
    const shaft = box(0.42, 0.95, 0.42, 0.03, sand, { roughness: 0.75 });
    shaft.position.y = 0.6;
    const upper = box(0.36, 0.24, 0.36, 0.02, sand, { roughness: 0.75 });
    upper.position.y = 1.19;
    g.add(plinth, shaft, upper);
    // belfry arches
    for (let i = 0; i < 4; i++) {
      const arch = box(0.09, 0.15, 0.02, 0.03, 0x4b4436);
      const a = (i * Math.PI) / 2;
      arch.position.set(Math.sin(a) * 0.185, 1.2, Math.cos(a) * 0.185);
      arch.rotation.y = a;
      g.add(arch);
    }
    // windows down the shaft
    for (const y of [0.95, 0.75, 0.55]) {
      const win = box(0.07, 0.11, 0.02, 0.02, 0x6b6353);
      win.position.set(0, y, 0.215);
      g.add(win);
    }
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.21, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2), mat(0xb0503c, { roughness: 0.6 }));
    dome.position.y = 1.31;
    const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.18, 8), mat(0x4b4436));
    spire.position.y = 1.58;
    g.add(dome, spire);
    // a couple of campus trees
    for (const [tx, tz] of [[-0.42, 0.28], [0.44, -0.2]]) {
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.12, 8), mat(0x8a6a4a));
      trunk.position.set(tx, 0.06, tz);
      const crown = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 7), mat(0x9db97e, { flatShading: true }));
      crown.position.set(tx, 0.2, tz);
      g.add(trunk, crown);
    }
    g.add(blobShadow(0.55));
    return { model: g, yaw: -0.4 };
  },
};

export class Dioramas {
  constructor(renderer) {
    this.renderer = renderer;
    this.items = new Map();
    this.camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
    this.camera.position.set(2.0, 1.75, 3.3);
    this.camera.lookAt(0, 0.5, 0);
  }

  _ensure(key) {
    if (this.items.has(key)) return this.items.get(key);
    const builder = BUILDERS[key];
    if (!builder) return null;
    const scene = new THREE.Scene();
    scene.add(new THREE.HemisphereLight(0xfff6e8, 0xd8cfc0, 1.0));
    const sun = new THREE.DirectionalLight(0xffffff, 1.5);
    sun.position.set(-2, 4, 3);
    scene.add(sun);
    const built = builder();
    built.model.rotation.y = built.yaw ?? -0.4;      // a fixed, flattering angle — fully still
    scene.add(built.model);
    const item = { scene, model: built.model };
    this.items.set(key, item);
    return item;
  }

  /**
   * Render dioramas into rects (CSS px, top-left origin) on the shared canvas.
   * Call after the main robot render each frame.
   */
  render(list) {
    if (!list.length) return;
    const r = this.renderer;
    const vh = window.innerHeight;
    const prevAutoClear = r.autoClear;
    r.autoClear = false;
    r.setScissorTest(true);
    for (const { key, x, y, w, h } of list) {
      const it = this._ensure(key);
      if (!it) continue;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      const gy = vh - y - h;                 // WebGL viewport origin is bottom-left
      r.setViewport(x, gy, w, h);
      r.setScissor(x, gy, w, h);
      r.clearDepth();
      r.render(it.scene, this.camera);
    }
    r.setScissorTest(false);
    r.setViewport(0, 0, window.innerWidth, vh);
    r.autoClear = prevAutoClear;
  }
}
