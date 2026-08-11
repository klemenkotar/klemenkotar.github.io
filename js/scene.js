// ─────────────────────────────────────────────────────────────────────────────
// Three.js overlay: a transparent full-viewport canvas that renders the robot
// on top of the page. The robot lives at the 3D origin; a camera view-offset
// slides the projection so the robot appears at any screen position, keeping
// perspective, lighting, and shadows perfectly consistent everywhere.
// ─────────────────────────────────────────────────────────────────────────────
import * as THREE from 'three';
import { Robot } from './robot.js';

const CAM_DIST = 16;
const CAM_FOV = 22;
const CAM_ELEV = 0.62;            // rad above the ground plane
const ROBOT_PX = 148;             // on-screen robot height at map zoom 1 (desktop)
const ROBOT_PX_COMPACT = 66;      // much smaller on phones so it doesn't dominate

export class RobotScene {
  constructor(canvas) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(CAM_FOV, 1, 0.1, 100);
    // look at the ground origin so the robot's footprint projects exactly to
    // the requested screen point
    this.camera.position.set(0, Math.sin(CAM_ELEV) * CAM_DIST, Math.cos(CAM_ELEV) * CAM_DIST);
    this.camera.lookAt(0, 0, 0);

    this.scene.add(new THREE.HemisphereLight(0xfff6e8, 0xd8cfc0, 0.95));
    const key = new THREE.DirectionalLight(0xffffff, 1.55);
    key.position.set(-2.5, 5, 3);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -2; key.shadow.camera.right = 2;
    key.shadow.camera.top = 2; key.shadow.camera.bottom = -2;
    key.shadow.radius = 5;
    this.scene.add(key);
    const fill = new THREE.DirectionalLight(0xcfe8ff, 0.3);
    fill.position.set(2, 2, -2);
    this.scene.add(fill);

    // just big enough for the shadow frustum — a huge plane would make every
    // canvas pixel run shadow shading
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), new THREE.ShadowMaterial({ opacity: 0.14 }));
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.02;
    ground.receiveShadow = true;
    this.scene.add(ground);

    this.robot = new Robot();
    this.scene.add(this.robot.group);

    this.vw = 1; this.vh = 1;
    this.resize();
  }

  resize() {
    this.vw = window.innerWidth; this.vh = window.innerHeight;
    // let setSize also stamp the CSS size: keeps the canvas aligned with
    // innerHeight on iOS, where 100vh includes the collapsed URL bar
    this.renderer.setSize(this.vw, this.vh);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.camera.aspect = this.vw / this.vh;
    // projected height of 1 world unit at the robot's depth, in px:
    const unitPx = this.vh / (2 * CAM_DIST * Math.tan((CAM_FOV * Math.PI / 180) / 2));
    this.robotPx = this.vw < 780 ? ROBOT_PX_COMPACT : ROBOT_PX;
    this.baseZoom = this.robotPx / (1.52 * unitPx);   // robot is ~1.52 units tall
    this.camera.updateProjectionMatrix();
  }

  /**
   * Render the robot so it appears at screen point (sx, sy) — the point under
   * the CENTER of the robot's footprint — at scale `zoom`, facing `heading`
   * (page-space angle: 0 = right, π/2 = down).
   */
  render(sx, sy, zoom, heading, dt, motion) {
    this.robot.group.rotation.y = -heading + Math.PI / 2;
    this.robot.update(dt, motion);

    this.camera.zoom = this.baseZoom * zoom;
    this.camera.updateProjectionMatrix();
    this.camera.setViewOffset(this.vw, this.vh, this.vw / 2 - sx, this.vh / 2 - sy, this.vw, this.vh);
    this.renderer.render(this.scene, this.camera);
  }
}
