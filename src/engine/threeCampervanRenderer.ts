import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  OpenMotionScene,
  SceneThreeCampervan,
  ThreeLightingMood,
} from '../types/openmotion';
import {
  CampervanRig,
  DustPuffPool,
  LandscapeHandles,
  TravelerRig,
  buildDustPuffPool,
  buildStylizedCampervan,
  buildStylizedLandscape,
  buildStylizedTraveler,
  createContactShadowTexture,
  createSkyGradientTexture,
  roadCenterX,
  roadHeadingYaw,
} from './three/campervanModels';

function clamp(v: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, v));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

function detectSoftwareWebGL(): boolean {
  if (typeof document === 'undefined') return true;
  try {
    const probe = document.createElement('canvas');
    const gl = probe.getContext('webgl2') || probe.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) ?? '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

interface LightingPreset {
  skyZenith: string;
  skyMid: string;
  skyHorizon: string;
  fogHex: number;
  fogDensity: number;
  sunColor: number;
  sunIntensity: number;
  sunPos: [number, number, number];
  hemiSky: number;
  hemiGround: number;
  hemiIntensity: number;
  rimColor: number;
  rimIntensity: number;
  exposure: number;
}

const LIGHTING_PRESETS: Record<ThreeLightingMood, LightingPreset> = {
  'golden-hour': {
    skyZenith: '#386291',
    skyMid: '#D4986F',
    skyHorizon: '#F4D5A9',
    fogHex: 0xebd1ae,
    fogDensity: 0.0115,
    sunColor: 0xffd194,
    sunIntensity: 2.35,
    sunPos: [-18, 13, -14],
    hemiSky: 0x99bce0,
    hemiGround: 0x6c5942,
    hemiIntensity: 0.92,
    rimColor: 0xffc082,
    rimIntensity: 0.72,
    exposure: 1.08,
  },
  'morning-mist': {
    skyZenith: '#4D7AA1',
    skyMid: '#A5C4D4',
    skyHorizon: '#E4ECEC',
    fogHex: 0xdce6e8,
    fogDensity: 0.014,
    sunColor: 0xfff0d8,
    sunIntensity: 2.05,
    sunPos: [16, 15, -18],
    hemiSky: 0xb7d5eb,
    hemiGround: 0x5c695b,
    hemiIntensity: 1.05,
    rimColor: 0xc2dff5,
    rimIntensity: 0.65,
    exposure: 1.05,
  },
  'alpine-noon': {
    skyZenith: '#2E6CB0',
    skyMid: '#76B0DC',
    skyHorizon: '#D4E6F2',
    fogHex: 0xcfe2ef,
    fogDensity: 0.0085,
    sunColor: 0xfffaf0,
    sunIntensity: 2.55,
    sunPos: [-12, 24, 10],
    hemiSky: 0xaad4f5,
    hemiGround: 0x5f6e4b,
    hemiIntensity: 1.0,
    rimColor: 0xd8ecff,
    rimIntensity: 0.55,
    exposure: 1.04,
  },
};

// Pre-allocated scratch vectors (zero GC in render loop)
const _camPos = new THREE.Vector3();
const _camTarget = new THREE.Vector3();
const _localSeat = new THREE.Vector3();
const _vanQuat = new THREE.Quaternion();
const _upAxis = new THREE.Vector3(0, 1, 0);

class CampervanThreeStage {
  public readonly renderer: THREE.WebGLRenderer;
  public readonly scene: THREE.Scene;
  public readonly camera: THREE.PerspectiveCamera;
  private readonly van: CampervanRig;
  private readonly traveler: TravelerRig;
  private readonly landscape: LandscapeHandles;
  private readonly dust: DustPuffPool;
  private readonly sunLight: THREE.DirectionalLight;
  private readonly hemiLight: THREE.HemisphereLight;
  private readonly rimLight: THREE.DirectionalLight;
  private readonly fog: THREE.FogExp2;
  private readonly camPosCurve: THREE.CatmullRomCurve3;
  private readonly camTargetCurve: THREE.CatmullRomCurve3;
  private readonly skyTextures: Record<ThreeLightingMood, THREE.CanvasTexture>;
  private activeMood: ThreeLightingMood = 'golden-hour';
  private curW = 0;
  private curH = 0;

  constructor() {
    const isSoftwareGl = detectSoftwareWebGL();
    this.renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;
    this.renderer.setPixelRatio(1); // Match exact OpenMotion pixel dimensions for crisp 1920x1080 MP4
    this.renderer.shadowMap.enabled = !isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.scene = new THREE.Scene();
    this.fog = new THREE.FogExp2(0xebd1ae, 0.0115);
    this.scene.fog = this.fog;

    // Mandatory studio environment map via RoomEnvironment for chrome, glass & clearcoat reflections
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    this.camera = new THREE.PerspectiveCamera(42, 16 / 9, 0.1, 240);

    // 3-Point Soft Outdoor Lighting Rig (warm golden sun key + cool sky hemisphere fill + rim)
    this.hemiLight = new THREE.HemisphereLight(0x99bce0, 0x6c5942, 0.92);
    this.hemiLight.position.set(0, 40, 0);
    this.scene.add(this.hemiLight);

    this.sunLight = new THREE.DirectionalLight(0xffd194, 2.35);
    this.sunLight.position.set(-18, 13, -14);
    this.sunLight.castShadow = !isSoftwareGl;
    this.sunLight.shadow.mapSize.set(2048, 2048);
    this.sunLight.shadow.camera.near = 2;
    this.sunLight.shadow.camera.far = 70;
    const d = 16;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.sunLight.shadow.bias = -0.0005;
    this.sunLight.shadow.normalBias = 0.025;
    this.scene.add(this.sunLight);
    this.scene.add(this.sunLight.target);

    this.rimLight = new THREE.DirectionalLight(0xffc082, 0.72);
    this.rimLight.position.set(14, 9, 12);
    this.scene.add(this.rimLight);

    // Build all procedural 3D assets (zero external models or files)
    const maxAniso = Math.min(8, this.renderer.capabilities.getMaxAnisotropy());
    const contactShadowTex = createContactShadowTexture();

    this.landscape = buildStylizedLandscape(maxAniso);
    this.scene.add(this.landscape.group);

    this.van = buildStylizedCampervan(contactShadowTex);
    this.scene.add(this.van.root);

    this.traveler = buildStylizedTraveler(contactShadowTex);
    this.scene.add(this.traveler.root);

    this.dust = buildDustPuffPool();
    this.scene.add(this.dust.group);

    this.skyTextures = {
      'golden-hour': createSkyGradientTexture(
        LIGHTING_PRESETS['golden-hour'].skyZenith,
        LIGHTING_PRESETS['golden-hour'].skyMid,
        LIGHTING_PRESETS['golden-hour'].skyHorizon
      ),
      'morning-mist': createSkyGradientTexture(
        LIGHTING_PRESETS['morning-mist'].skyZenith,
        LIGHTING_PRESETS['morning-mist'].skyMid,
        LIGHTING_PRESETS['morning-mist'].skyHorizon
      ),
      'alpine-noon': createSkyGradientTexture(
        LIGHTING_PRESETS['alpine-noon'].skyZenith,
        LIGHTING_PRESETS['alpine-noon'].skyMid,
        LIGHTING_PRESETS['alpine-noon'].skyHorizon
      ),
    };

    // Smooth continuous 15-second cinematic camera choreography (Catmull-Rom curves)
    this.camPosCurve = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(8.6, 2.25, 6.1), // 0.0s: Establishing shot — traveler walking toward van
        new THREE.Vector3(6.4, 1.82, 3.9), // 3.0s: Smooth low tracking shot alongside path
        new THREE.Vector3(4.85, 1.65, 2.35), // 6.0s: Dolly arc as traveler opens cab door
        new THREE.Vector3(4.15, 1.56, 2.05), // 8.4s: Intimate hero wave at camera
        new THREE.Vector3(5.35, 1.98, 3.3), // 10.8s: Pull back for boarding & door shut
        new THREE.Vector3(4.45, 2.85, 2.2), // 13.0s: Crane up as campervan pulls onto road
        new THREE.Vector3(2.6, 4.15, -1.8), // 15.0s: Sweeping farewell down valley toward peaks
      ],
      false,
      'centripetal',
      0.5
    );

    this.camTargetCurve = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(2.85, 1.15, 1.3),
        new THREE.Vector3(1.85, 1.12, 0.2),
        new THREE.Vector3(1.25, 1.24, -0.42),
        new THREE.Vector3(1.75, 1.35, -0.22),
        new THREE.Vector3(0.45, 1.18, -0.55),
        new THREE.Vector3(roadCenterX(-8.5), 1.28, -8.5),
        new THREE.Vector3(roadCenterX(-25), 1.55, -25.0),
      ],
      false,
      'centripetal',
      0.5
    );

    this.applyLightingMood('golden-hour');
  }

  private applyLightingMood(mood: ThreeLightingMood) {
    if (this.activeMood === mood && this.landscape.skyMat.map === this.skyTextures[mood]) return;
    this.activeMood = mood;
    const p = LIGHTING_PRESETS[mood] ?? LIGHTING_PRESETS['golden-hour'];
    this.landscape.skyMat.map = this.skyTextures[mood];
    this.landscape.skyMat.needsUpdate = true;
    this.fog.color.setHex(p.fogHex);
    this.fog.density = p.fogDensity;
    this.sunLight.color.setHex(p.sunColor);
    this.sunLight.intensity = p.sunIntensity;
    this.sunLight.position.set(p.sunPos[0], p.sunPos[1], p.sunPos[2]);
    this.hemiLight.color.setHex(p.hemiSky);
    this.hemiLight.groundColor.setHex(p.hemiGround);
    this.hemiLight.intensity = p.hemiIntensity;
    this.rimLight.color.setHex(p.rimColor);
    this.rimLight.intensity = p.rimIntensity;
    this.renderer.toneMappingExposure = p.exposure;
  }

  private applyEditableConfig(cfg: SceneThreeCampervan) {
    this.van.bodyPaintMat.color.set(cfg.vanColor || '#3B7A6C');
    this.van.roofPaintMat.color.set(cfg.vanRoofColor || '#F4ECE0');
    this.traveler.jacketMat.color.set(cfg.jacketColor || '#C8523B');
    this.traveler.backpackMat.color.set(cfg.backpackColor || '#4F6448');
    this.traveler.beanieMat.color.set(cfg.beanieColor || '#D97736');
    this.applyLightingMood(cfg.lightingMood || 'golden-hour');

    const desiredFov = clamp(cfg.cameraFov ?? 42, 28, 60);
    if (Math.abs(this.camera.fov - desiredFov) > 0.05) {
      this.camera.fov = desiredFov;
      this.camera.updateProjectionMatrix();
    }
  }

  /**
   * Evaluates every 3D joint angle, vehicle transform, wheel spin, dust puff, and
   * spline camera position purely deterministically from globalTime (0..15s).
   */
  public renderAtTime(
    w: number,
    h: number,
    globalTime: number,
    cfg: SceneThreeCampervan
  ): HTMLCanvasElement {
    if (this.curW !== w || this.curH !== h) {
      this.curW = w;
      this.curH = h;
      this.renderer.setSize(w, h, false);
      this.camera.aspect = w / Math.max(1, h);
      this.camera.updateProjectionMatrix();
    }

    this.applyEditableConfig(cfg);

    const t = clamp(globalTime, 0, 15.0);

    // Subtle organic campfire flicker
    const flicker = 0.88 + 0.12 * Math.sin(t * 11.4) + 0.08 * Math.cos(t * 17.3);
    this.landscape.campfireLight.intensity = 1.65 * flicker;
    this.landscape.flameMesh.scale.set(
      0.92 + 0.1 * Math.sin(t * 9.2),
      0.88 + 0.22 * flicker,
      0.92 + 0.1 * Math.cos(t * 10.7)
    );

    // =========================================================================
    // 1. CAMPERVAN TRANSFORM, DOOR, SUSPENSION, LIGHTS & WHEELS
    // =========================================================================
    // Door opens 5.2s -> 6.6s, stays open through wave & boarding, shuts 10.55s -> 11.35s
    const doorOpenIn = smoothstep(5.15, 6.55, t);
    const doorCloseOut = 1 - smoothstep(10.55, 11.35, t);
    const doorOpenFrac = doorOpenIn * doorCloseOut;
    this.van.doorPivot.rotation.y = doorOpenFrac * 1.18;

    // Headlights & taillights ignite warmly at 11.15s right as the traveler settles in
    const ignitionFrac = smoothstep(11.1, 11.55, t);
    this.van.headlightMat.emissiveIntensity = lerp(0.18, 2.8, ignitionFrac);
    this.van.taillightMat.emissiveIntensity = lerp(0.15, 1.9, ignitionFrac);
    this.van.cabinLight.intensity = lerp(1.25, 0.75, smoothstep(11.3, 12.2, t));

    // Drive away motion (11.45s -> 15.0s) along winding scenic mountain road
    const driveU = clamp((t - 11.45) / 3.55);
    const driveDist = 27.5 * (0.18 * driveU + 0.82 * driveU * driveU);
    const vanZ = -driveDist;
    const vanX = roadCenterX(vanZ);
    const vanYaw = roadHeadingYaw(vanZ);

    this.van.root.position.set(vanX, 0, vanZ);
    this.van.root.rotation.set(0, vanYaw, 0);

    // Keep directional sun shadow frustum centered near the active action
    this.sunLight.target.position.set(vanX * 0.5, 0.8, vanZ * 0.5);
    this.sunLight.target.updateMatrixWorld();

    // Tactile body suspension bounce on boarding/door slam + gentle road undulation
    const doorSlamT = Math.max(0, t - 11.28);
    const doorSlamBounce =
      doorSlamT > 0 && doorSlamT < 0.75
        ? Math.sin(doorSlamT * 22) * Math.exp(-doorSlamT * 6.5) * 0.032
        : 0;
    const engineIdle = ignitionFrac * (1 - smoothstep(11.5, 12.2, t)) * Math.sin(t * 44) * 0.004;
    const driveBounce = driveU > 0 ? Math.sin(driveDist * 1.9) * 0.018 * Math.min(1, driveU * 3) : 0;
    const accelPitch = smoothstep(11.45, 12.1, t) * (1 - smoothstep(13.6, 15.0, t)) * 0.028;

    this.van.bodyGroup.position.y = doorSlamBounce + engineIdle + driveBounce;
    this.van.bodyGroup.rotation.x = accelPitch;
    this.van.bodyGroup.rotation.z = doorSlamBounce * 0.55 - Math.sin(vanYaw) * driveU * 0.03;

    // Spin all 4 wheels accurately by distance / wheelRadius (r = 0.38m)
    const wheelAngle = -driveDist / 0.38;
    for (const wGroup of this.van.wheels) {
      wGroup.rotation.x = wheelAngle;
    }

    // =========================================================================
    // 2. PROCEDURAL DUST PUFFS BEHIND REAR TIRES DURING DRIVE-AWAY
    // =========================================================================
    const dustActive = t >= 11.55;
    for (let i = 0; i < this.dust.meshes.length; i++) {
      const puff = this.dust.meshes[i];
      const mat = puff.material as THREE.MeshStandardMaterial;
      if (!dustActive) {
        puff.visible = false;
        continue;
      }
      // Deterministic spawn schedule staggered across the 3.45s departure
      const spawnTime = 11.55 + i * 0.19;
      const age = t - spawnTime;
      if (age < 0 || age > 1.35) {
        puff.visible = false;
        continue;
      }
      const life = age / 1.35;
      const uAtSpawn = clamp((spawnTime - 11.45) / 3.55);
      const distAtSpawn = 27.5 * (0.18 * uAtSpawn + 0.82 * uAtSpawn * uAtSpawn);
      const zSpawn = -distAtSpawn + 1.95;
      const xSpawn = roadCenterX(zSpawn) + (i % 2 === 0 ? -0.82 : 0.82);

      puff.visible = true;
      puff.position.set(
        xSpawn + (i % 2 === 0 ? -1 : 1) * life * 0.45,
        0.18 + life * 0.72,
        zSpawn + life * 0.55
      );
      const s = 0.45 + life * 1.65;
      puff.scale.set(s, s * 0.8, s);
      puff.rotation.set(life * 1.4, i * 0.9, life * 0.8);
      mat.opacity = Math.sin(life * Math.PI) * 0.34 * Math.min(1, driveU * 4);
    }

    // =========================================================================
    // 3. TRAVELER NATURAL JOINT KINEMATICS (WALK -> OPEN -> WAVE -> BOARD -> DRIVE)
    // =========================================================================
    const tr = this.traveler;

    // Reset neutral base joints before blending phases
    tr.hips.position.set(0, 0.84, 0);
    tr.hips.rotation.set(0, 0, 0);
    tr.torso.rotation.set(0, 0, 0);
    tr.head.rotation.set(0, 0, 0);
    tr.leftShoulder.rotation.set(0, 0, -0.1);
    tr.leftElbow.rotation.set(-0.14, 0, 0);
    tr.rightShoulder.rotation.set(0, 0, 0.1);
    tr.rightElbow.rotation.set(-0.14, 0, 0);
    tr.leftHip.rotation.set(0, 0, 0);
    tr.leftKnee.rotation.set(0, 0, 0);
    tr.rightHip.rotation.set(0, 0, 0);
    tr.rightKnee.rotation.set(0, 0, 0);
    tr.backpack.scale.setScalar(1);
    tr.backpack.position.set(0, 0.26, -0.2);
    (tr.contactShadow.material as THREE.MeshBasicMaterial).opacity = 0.5;

    // Phase blends
    const walkFrac = clamp(t / 4.65);
    const walkEase = smoothstep(0, 1, walkFrac);
    const walkBlend = (1 - smoothstep(4.2, 4.68, t)) * smoothstep(0, 0.25, t + 0.25);

    const openBlend = smoothstep(4.55, 5.1, t) * (1 - smoothstep(6.45, 7.0, t));
    const waveBlend = smoothstep(6.75, 7.35, t) * (1 - smoothstep(9.2, 9.75, t));
    const boardFrac = smoothstep(9.65, 10.75, t);

    // Base world position along path (0.0 -> 4.65s) + half-step clear of swinging door (5.2 -> 6.6s)
    const pathX = lerp(5.45, 1.62, walkEase) + smoothstep(5.25, 6.45, t) * 0.26 * (1 - boardFrac);
    const pathZ =
      lerp(3.25, -0.36, walkEase) +
      Math.sin(walkEase * Math.PI) * 0.35 +
      smoothstep(5.25, 6.45, t) * 0.16 * (1 - boardFrac);

    // Compute world seated position inside moving campervan
    _vanQuat.setFromAxisAngle(_upAxis, vanYaw);
    _localSeat.set(0.4, 0.45 + this.van.bodyGroup.position.y, -0.78).applyQuaternion(_vanQuat);
    const seatWorldX = vanX + _localSeat.x;
    const seatWorldY = _localSeat.y;
    const seatWorldZ = vanZ + _localSeat.z;

    // Blend smoothly from outside camp turnout into the campervan driver's seat
    const charX = lerp(pathX, seatWorldX, boardFrac);
    const charY = lerp(0, seatWorldY, smoothstep(9.85, 10.65, t));
    const charZ = lerp(pathZ, seatWorldZ, boardFrac);
    tr.root.position.set(charX, charY, charZ);

    // Character heading yaw across phases
    const walkDirYaw = Math.atan2(1.62 - 5.45, -0.36 - 3.25); // Facing van (~ -2.35 rad)
    const doorFaceYaw = -Math.PI * 0.54; // Facing van cab side (-X)
    const cameraWaveYaw = 0.68; // Facing camera at (+4.15, 1.56, +2.05)
    const seatedYaw = Math.PI + vanYaw; // Facing forward through windshield (-Z)

    let charYaw = lerp(walkDirYaw, doorFaceYaw, smoothstep(3.8, 4.75, t));
    charYaw = lerp(charYaw, cameraWaveYaw, smoothstep(6.6, 7.4, t));
    // Shortest-path turn into cabin & forward driving orientation
    const preBoardTurn = lerp(charYaw, -Math.PI * 0.65, smoothstep(9.35, 10.0, t));
    charYaw = lerp(preBoardTurn, seatedYaw, smoothstep(10.0, 10.75, t));
    tr.root.rotation.set(0, charYaw, 0);

    // --- PHASE 1: Natural Bipedal Walk Cycle (0.0s -> 4.65s) ---
    if (walkBlend > 0.001) {
      const cycle = t * 1.88 * Math.PI * 2;
      const sinC = Math.sin(cycle);
      const cosC = Math.cos(cycle);

      tr.hips.position.y += Math.abs(sinC) * 0.048 * walkBlend;
      tr.hips.rotation.y += sinC * 0.085 * walkBlend;
      tr.hips.rotation.z += cosC * 0.035 * walkBlend;
      tr.torso.rotation.y += -sinC * 0.115 * walkBlend;
      tr.torso.rotation.x += 0.065 * walkBlend;
      tr.head.rotation.x += (-0.03 + Math.abs(sinC) * 0.03) * walkBlend;
      tr.head.rotation.y += 0.08 * smoothstep(2.2, 4.2, t) * walkBlend;

      // Backpack secondary micro-bounce
      tr.backpack.position.y = 0.26 + Math.abs(Math.sin(cycle - 0.45)) * 0.022 * walkBlend;

      // Articulated hips & delayed knee flexion
      tr.leftHip.rotation.x += sinC * 0.48 * walkBlend;
      tr.leftKnee.rotation.x += Math.max(0, -Math.cos(cycle - 0.35)) * 0.68 * walkBlend;

      tr.rightHip.rotation.x += -sinC * 0.48 * walkBlend;
      tr.rightKnee.rotation.x += Math.max(0, Math.cos(cycle - 0.35)) * 0.68 * walkBlend;

      // Natural opposite arm swing with relaxed elbows
      tr.leftShoulder.rotation.x += -sinC * 0.42 * walkBlend;
      tr.leftElbow.rotation.x += (-0.22 - Math.max(0, sinC) * 0.28) * walkBlend;

      tr.rightShoulder.rotation.x += sinC * 0.42 * walkBlend;
      tr.rightElbow.rotation.x += (-0.22 - Math.max(0, -sinC) * 0.28) * walkBlend;
    }

    // --- PHASE 2: Reach & Pull Campervan Door Open (4.6s -> 6.8s) ---
    if (openBlend > 0.001) {
      const pullArc = smoothstep(5.15, 6.45, t);
      tr.torso.rotation.x += lerp(0.11, 0.04, pullArc) * openBlend;
      tr.torso.rotation.y += lerp(0.14, -0.22, pullArc) * openBlend;
      tr.head.rotation.x += 0.06 * openBlend;
      tr.rightShoulder.rotation.x += lerp(-1.12, -0.72, pullArc) * openBlend;
      tr.rightShoulder.rotation.z += lerp(0.18, 0.52, pullArc) * openBlend;
      tr.rightElbow.rotation.x += lerp(-0.34, -0.68, pullArc) * openBlend;
      tr.leftShoulder.rotation.x += 0.12 * openBlend;
      tr.leftElbow.rotation.x += -0.28 * openBlend;
    }

    // --- PHASE 3: Friendly Wave Directly at the Camera (6.8s -> 9.6s) ---
    if (waveBlend > 0.001) {
      const wavePhase = (t - 7.1) * 3.15 * Math.PI * 2;
      const waveOsc = Math.sin(wavePhase) * smoothstep(6.95, 7.45, t);
      tr.hips.rotation.z += -0.045 * waveBlend;
      tr.torso.rotation.z += 0.055 * waveBlend;
      tr.head.rotation.z += (0.1 + waveOsc * 0.04) * waveBlend;
      tr.head.rotation.x += -0.06 * waveBlend;

      // Raise right arm warmly and wave forearm/hand side to side
      tr.rightShoulder.rotation.z += (2.28 + waveOsc * 0.12) * waveBlend;
      tr.rightShoulder.rotation.x += -0.28 * waveBlend;
      tr.rightElbow.rotation.z += (0.28 + waveOsc * 0.48) * waveBlend;
      tr.rightElbow.rotation.x += -0.18 * waveBlend;

      // Relaxed left arm resting casually
      tr.leftShoulder.rotation.z += -0.14 * waveBlend;
      tr.leftElbow.rotation.x += -0.24 * waveBlend;
    }

    // --- PHASE 4 & 5: Climb Inside & Drive Away Seated (9.65s -> 15.0s) ---
    if (boardFrac > 0.001) {
      const seatBend = smoothstep(9.85, 10.65, t);
      tr.hips.position.y = lerp(tr.hips.position.y, 0.56, seatBend);
      tr.leftHip.rotation.x = lerp(tr.leftHip.rotation.x, -1.38, seatBend);
      tr.rightHip.rotation.x = lerp(tr.rightHip.rotation.x, -1.38, seatBend);
      tr.leftKnee.rotation.x = lerp(tr.leftKnee.rotation.x, 1.32, seatBend);
      tr.rightKnee.rotation.x = lerp(tr.rightKnee.rotation.x, 1.32, seatBend);

      // Hands steer the wheel smoothly once seated
      const steer = Math.sin(vanYaw * 2.4) * 0.14;
      tr.leftShoulder.rotation.x = lerp(tr.leftShoulder.rotation.x, -0.92 + steer, seatBend);
      tr.rightShoulder.rotation.x = lerp(tr.rightShoulder.rotation.x, -0.92 - steer, seatBend);
      tr.leftElbow.rotation.x = lerp(tr.leftElbow.rotation.x, -0.45, seatBend);
      tr.rightElbow.rotation.x = lerp(tr.rightElbow.rotation.x, -0.45, seatBend);

      // Stow backpack inside the camper behind seat & hide outdoor ground shadow
      tr.backpack.scale.setScalar(lerp(1, 0.01, smoothstep(9.9, 10.45, t)));
      (tr.contactShadow.material as THREE.MeshBasicMaterial).opacity =
        0.5 * (1 - smoothstep(9.75, 10.25, t));
    }

    // =========================================================================
    // 4. SMOOTH CINEMATIC SPLINE CAMERA CHOREOGRAPHY
    // =========================================================================
    const camU = clamp(t / 15.0);
    this.camPosCurve.getPoint(camU, _camPos);
    this.camTargetCurve.getPoint(camU, _camTarget);

    // Subtle organic breathing camera float so it feels like a real Steadicam / gimbal
    _camPos.y += Math.sin(t * 0.85) * 0.04;
    this.camera.position.copy(_camPos);
    this.camera.lookAt(_camTarget);

    // Keep sky dome centered on camera so horizon never clips
    this.landscape.skyMesh.position.copy(_camPos);

    this.renderer.render(this.scene, this.camera);
    return this.renderer.domElement;
  }
}

let sharedStage: CampervanThreeStage | null = null;
let stageInitFailed = false;

function getThreeStage(): CampervanThreeStage | null {
  if (stageInitFailed) return null;
  if (!sharedStage) {
    try {
      sharedStage = new CampervanThreeStage();
    } catch {
      stageInitFailed = true;
      return null;
    }
  }
  return sharedStage;
}

const DEFAULT_CAMPERVAN_CONFIG: SceneThreeCampervan = {
  vanColor: '#3B7A6C',
  vanRoofColor: '#F4ECE0',
  jacketColor: '#C8523B',
  backpackColor: '#4F6448',
  beanieColor: '#D97736',
  lightingMood: 'golden-hour',
  cameraFov: 42,
  showTitleOverlay: true,
};

/**
 * Renders a full-bleed 16:9 Three.js frame onto OpenMotion's target 2D canvas
 * (used identically by live Studio preview, Library cards, and 1920x1080 MP4 export).
 */
export function renderThreeCampervanScene(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  scene: OpenMotionScene,
  localTime: number,
  globalTime: number
) {
  const cfg: SceneThreeCampervan = {
    ...DEFAULT_CAMPERVAN_CONFIG,
    ...(scene.threeCampervan ?? {}),
  };

  const stage = getThreeStage();
  if (stage) {
    const glCanvas = stage.renderAtTime(w, h, globalTime, cfg);
    ctx.drawImage(glCanvas, 0, 0, w, h);
  } else {
    // Graceful fallback if WebGL context is unavailable
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#F8FAFC';
    ctx.font = `600 ${Math.round(h * 0.032)}px "Plus Jakarta Sans", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('WebGL 3D renderer unavailable in this browser context', w / 2, h / 2);
  }

  // Subtle cinematic vignette unifying the 3D render with filmic framing
  const scale = Math.min(w, h) / 1080;
  const vig = ctx.createRadialGradient(w * 0.5, h * 0.5, w * 0.3, w * 0.5, h * 0.5, w * 0.72);
  vig.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vig.addColorStop(1, 'rgba(18, 16, 14, 0.28)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);

  // Optional refined cinematic opening / closing title overlay (zero heavy chrome)
  if (cfg.showTitleOverlay && cfg.titleText) {
    const dur = Math.max(0.5, scene.durationSec);
    const p = clamp(localTime / dur);
    const fadeIn = smoothstep(0.08, 0.26, p);
    const fadeOut = globalTime > 12.5 ? 1 : 1 - smoothstep(0.68, 0.88, p);
    const alpha = clamp(fadeIn * fadeOut);

    if (alpha > 0.01) {
      ctx.save();
      ctx.globalAlpha = alpha;

      const scrimH = h * 0.28;
      const grad = ctx.createLinearGradient(0, h - scrimH, 0, h);
      grad.addColorStop(0, 'rgba(14, 14, 16, 0)');
      grad.addColorStop(1, 'rgba(14, 14, 16, 0.62)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, h - scrimH, w, scrimH);

      const leftX = 76 * scale;
      const baseY = h - 98 * scale;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
      ctx.shadowBlur = 16 * scale;

      ctx.font = `700 ${Math.round(38 * scale)}px "Bricolage Grotesque", "Plus Jakarta Sans", sans-serif`;
      ctx.fillStyle = '#FAF7F2';
      ctx.fillText(cfg.titleText, leftX, baseY);

      if (cfg.subtitleText) {
        ctx.font = `italic 400 ${Math.round(24 * scale)}px Georgia, serif`;
        ctx.fillStyle = 'rgba(250, 247, 242, 0.88)';
        ctx.fillText(cfg.subtitleText, leftX, baseY + 46 * scale);
      }

      ctx.restore();
    }
  }
}
