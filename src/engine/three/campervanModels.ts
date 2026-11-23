import * as THREE from 'three';

/**
 * Winding scenic mountain road center X coordinate as a function of Z.
 * Z = 0 is the camp turnout; negative Z extends down the valley toward distant peaks.
 */
export function roadCenterX(z: number): number {
  if (z > 2) return 0;
  const dist = Math.max(0, -z);
  return Math.sin(dist * 0.085) * 4.2 + Math.sin(dist * 0.032) * 2.4;
}

/**
 * Derivative dx/dz of the scenic road for smooth vehicle heading alignment.
 */
export function roadHeadingYaw(z: number): number {
  const eps = 0.25;
  const x0 = roadCenterX(z + eps);
  const x1 = roadCenterX(z - eps);
  // Forward travel is toward -Z; yaw=0 faces -Z, positive yaw turns left (-X)
  return Math.atan2(x0 - x1, eps * 2);
}

/**
 * Deterministic ground elevation heightfield.
 * Flat (y = 0) along the road corridor and camp turnout so wheels and boots sit flush.
 */
export function groundHeightAt(x: number, z: number): number {
  const rCenter = roadCenterX(z);
  const distToRoad = Math.abs(x - rCenter);
  // Camp turnout clearing around (x: -2..7, z: -3..7)
  const campDist = Math.hypot((x - 2.2) * 0.72, (z - 1.2) * 0.85);
  const roadBlend = THREE.MathUtils.smoothstep(distToRoad, 2.7, 7.8);
  const campBlend = THREE.MathUtils.smoothstep(campDist, 4.8, 9.2);
  const flatMask = Math.min(roadBlend, campBlend);

  const rolling =
    Math.sin(x * 0.09 + 0.6) * Math.cos(z * 0.075 - 0.3) * 1.9 +
    Math.sin(x * 0.21 - z * 0.14) * 0.55;

  // Gentle valley rise farther out on the sides and distant horizon
  const valleyWalls = Math.pow(Math.max(0, distToRoad - 11) * 0.085, 1.55) * 3.4;
  return Math.max(0, (rolling + 1.2 + valleyWalls) * flatMask);
}

/**
 * Procedural radial soft contact shadow texture (zero external files).
 */
export function createContactShadowTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(
      size * 0.5,
      size * 0.5,
      size * 0.06,
      size * 0.5,
      size * 0.5,
      size * 0.48
    );
    grad.addColorStop(0, 'rgba(18, 22, 18, 0.65)');
    grad.addColorStop(0.55, 'rgba(18, 22, 18, 0.28)');
    grad.addColorStop(1, 'rgba(18, 22, 18, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Procedural tactile stylized meadow grass texture (Canvas 2D, SRGBColorSpace).
 */
function createMeadowTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#5F7F52';
    ctx.fillRect(0, 0, size, size);

    // Deterministic soft painterly grass patches & wildflower flecks
    let seed = 1337;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    for (let i = 0; i < 420; i++) {
      const x = rand() * size;
      const y = rand() * size;
      const r = 10 + rand() * 34;
      const tone = rand();
      ctx.fillStyle =
        tone < 0.45
          ? 'rgba(112, 145, 86, 0.22)'
          : tone < 0.85
            ? 'rgba(72, 104, 62, 0.22)'
            : 'rgba(164, 152, 92, 0.16)';
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    for (let i = 0; i < 1200; i++) {
      const x = rand() * size;
      const y = rand() * size;
      const h = 4 + rand() * 8;
      ctx.strokeStyle = rand() > 0.5 ? 'rgba(148, 178, 108, 0.35)' : 'rgba(54, 80, 48, 0.28)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + (rand() - 0.5) * 4, y - h);
      ctx.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(16, 16);
  tex.anisotropy = maxAnisotropy;
  return tex;
}

/**
 * Procedural scenic gravel/asphalt road texture with warm dusty shoulders.
 */
function createRoadTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const w = 256;
  const h = 512;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Warm sunlit weathered slate road with soft gravel edges
    const grad = ctx.createLinearGradient(0, 0, w, 0);
    grad.addColorStop(0, '#A5957A');
    grad.addColorStop(0.11, '#847B72');
    grad.addColorStop(0.22, '#6A6560');
    grad.addColorStop(0.5, '#706B65');
    grad.addColorStop(0.78, '#6A6560');
    grad.addColorStop(0.89, '#847B72');
    grad.addColorStop(1, '#A5957A');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Subtle aggregate grain
    let seed = 4242;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    for (let i = 0; i < 1800; i++) {
      const x = rand() * w;
      const y = rand() * h;
      ctx.fillStyle = rand() > 0.5 ? 'rgba(235, 224, 206, 0.14)' : 'rgba(42, 38, 36, 0.15)';
      ctx.fillRect(x, y, 2, 2);
    }

    // Subtle faded warm centerline dashes
    ctx.fillStyle = 'rgba(240, 214, 152, 0.45)';
    for (let y = 24; y < h; y += 96) {
      ctx.fillRect(w * 0.5 - 3, y, 6, 44);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 16);
  tex.anisotropy = maxAnisotropy;
  return tex;
}

/**
 * Procedural sky dome canvas texture for each atmospheric lighting preset.
 */
export function createSkyGradientTexture(
  zenithHex: string,
  midHex: string,
  horizonHex: string
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, zenithHex);
    grad.addColorStop(0.45, midHex);
    grad.addColorStop(0.68, horizonHex);
    grad.addColorStop(1, horizonHex);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 256);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export interface CampervanRig {
  root: THREE.Group;
  bodyGroup: THREE.Group;
  doorPivot: THREE.Group;
  wheels: THREE.Group[];
  bodyPaintMat: THREE.MeshPhysicalMaterial;
  roofPaintMat: THREE.MeshStandardMaterial;
  headlightMat: THREE.MeshStandardMaterial;
  taillightMat: THREE.MeshStandardMaterial;
  cabinLight: THREE.PointLight;
  contactShadow: THREE.Mesh;
}

/**
 * Builds an original 14+ part procedural retro compact campervan (THREE.Group)
 * with beveled ExtrudeGeometry silhouette, hinged right-side cab door, roof rack,
 * surfboard, interior cabin, and 4 rotating multi-part wheels sitting flush on y = 0.
 * Forward direction is -Z; right passenger/boarding side is +X.
 */
export function buildStylizedCampervan(shadowTex: THREE.Texture): CampervanRig {
  const root = new THREE.Group();
  const bodyGroup = new THREE.Group();
  root.add(bodyGroup);

  const bodyPaintMat = new THREE.MeshPhysicalMaterial({
    color: 0x3b7a6c, // Vintage alpine teal-sage (editable)
    roughness: 0.3,
    metalness: 0.14,
    clearcoat: 0.65,
    clearcoatRoughness: 0.22,
  });

  const roofPaintMat = new THREE.MeshStandardMaterial({
    color: 0xf4ece0, // Warm cream pop-top roof (editable)
    roughness: 0.42,
    metalness: 0.05,
  });

  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xe6e9ed,
    roughness: 0.16,
    metalness: 0.92,
  });

  const darkTrimMat = new THREE.MeshStandardMaterial({
    color: 0x26292e,
    roughness: 0.72,
    metalness: 0.2,
  });

  const tireMat = new THREE.MeshStandardMaterial({
    color: 0x1e2024,
    roughness: 0.9,
    metalness: 0.04,
  });

  const rimMat = new THREE.MeshStandardMaterial({
    color: 0xeee5d5,
    roughness: 0.38,
    metalness: 0.35,
  });

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x1e303c,
    roughness: 0.08,
    metalness: 0.15,
    transparent: true,
    opacity: 0.56,
    clearcoat: 0.9,
    depthWrite: false,
  });

  const interiorMat = new THREE.MeshStandardMaterial({
    color: 0xc59a6d,
    roughness: 0.82,
    metalness: 0.02,
  });

  const cabinWallMat = new THREE.MeshStandardMaterial({
    color: 0x2e2a26,
    roughness: 0.88,
    metalness: 0.05,
  });

  const headlightMat = new THREE.MeshStandardMaterial({
    color: 0xfff4d6,
    emissive: 0xffd27a,
    emissiveIntensity: 0.18,
    roughness: 0.15,
    metalness: 0.1,
  });

  const taillightMat = new THREE.MeshStandardMaterial({
    color: 0xb91c1c,
    emissive: 0xef4444,
    emissiveIntensity: 0.15,
    roughness: 0.25,
    metalness: 0.1,
  });

  // Van dimensions: width X = 1.94m, length Z = 4.35m (front at -2.18, rear at +2.18), ground clearance = 0.36m
  const halfW = 0.96;

  // 1. Dark steel undercarriage & chassis frame
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.76, 0.18, 4.1), darkTrimMat);
  chassis.position.set(0, 0.39, 0);
  chassis.castShadow = true;
  chassis.receiveShadow = true;
  bodyGroup.add(chassis);

  // 2. Lower body sculpted profile using ExtrudeGeometry (beveled rounded retro nose)
  // Shape drawn in (z, y) plane then rotated so length runs along Z (front = -Z)
  const lowerShape = new THREE.Shape();
  lowerShape.moveTo(-2.05, 0.44);
  lowerShape.lineTo(1.98, 0.44);
  lowerShape.quadraticCurveTo(2.14, 0.46, 2.15, 0.65);
  lowerShape.lineTo(2.12, 1.32);
  lowerShape.lineTo(-1.98, 1.32);
  lowerShape.quadraticCurveTo(-2.14, 1.24, -2.18, 0.82);
  lowerShape.quadraticCurveTo(-2.18, 0.46, -2.05, 0.44);

  const lowerGeo = new THREE.ExtrudeGeometry(lowerShape, {
    depth: 1.76,
    bevelEnabled: true,
    bevelThickness: 0.09,
    bevelSize: 0.08,
    bevelSegments: 4,
    curveSegments: 12,
  });
  lowerGeo.center();
  // Rotate so shape's X becomes world Z and extrusion depth becomes world X
  lowerGeo.rotateY(Math.PI / 2);
  const lowerHull = new THREE.Mesh(lowerGeo, bodyPaintMat);
  lowerHull.position.set(0, 0.89, 0);
  lowerHull.castShadow = true;
  lowerHull.receiveShadow = true;
  bodyGroup.add(lowerHull);

  // 3. Brushed chrome beltline trim stripe around the waist
  const beltTrim = new THREE.Mesh(new THREE.BoxGeometry(1.97, 0.055, 4.26), chromeMat);
  beltTrim.position.set(0, 1.32, 0.01);
  beltTrim.castShadow = true;
  bodyGroup.add(beltTrim);

  // 4. Upper cabin structural pillars & roof (leaving open right-side cab doorway at x=+0.95, z=-1.35..-0.15)
  // Rear upper cabin body (behind cab doors: z = 0.05 .. +2.10)
  const rearUpper = new THREE.Mesh(new THREE.BoxGeometry(1.88, 0.78, 2.04), roofPaintMat);
  rearUpper.position.set(0, 1.73, 1.06);
  rearUpper.castShadow = true;
  rearUpper.receiveShadow = true;
  bodyGroup.add(rearUpper);

  // Left-side cab upper pillar wall
  const leftCabWall = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.76, 1.95), roofPaintMat);
  leftCabWall.position.set(-0.88, 1.72, -0.92);
  leftCabWall.castShadow = true;
  bodyGroup.add(leftCabWall);

  // Front A-pillars (left and right) framing the windshield
  const pillarGeo = new THREE.CylinderGeometry(0.055, 0.065, 0.82, 10);
  const leftAPillar = new THREE.Mesh(pillarGeo, roofPaintMat);
  leftAPillar.position.set(-0.86, 1.7, -1.86);
  leftAPillar.rotation.x = 0.24;
  leftAPillar.castShadow = true;
  bodyGroup.add(leftAPillar);

  const rightAPillar = new THREE.Mesh(pillarGeo, roofPaintMat);
  rightAPillar.position.set(0.86, 1.7, -1.86);
  rightAPillar.rotation.x = 0.24;
  rightAPillar.castShadow = true;
  bodyGroup.add(rightAPillar);

  // Right-side B-pillar (between hinged cab door and rear cabin)
  const rightBPillar = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.78, 0.16), roofPaintMat);
  rightBPillar.position.set(0.88, 1.73, 0.02);
  rightBPillar.castShadow = true;
  bodyGroup.add(rightBPillar);

  // 5. Rounded Roof Cap & Pop-Top Camper Shell
  const roofCap = new THREE.Mesh(new THREE.BoxGeometry(1.92, 0.14, 3.96), roofPaintMat);
  roofCap.position.set(0, 2.15, 0.12);
  roofCap.castShadow = true;
  roofCap.receiveShadow = true;
  bodyGroup.add(roofCap);

  const popTop = new THREE.Mesh(new THREE.BoxGeometry(1.66, 0.18, 2.75), roofPaintMat);
  popTop.position.set(0, 2.28, 0.42);
  popTop.castShadow = true;
  bodyGroup.add(popTop);

  // 6. Roof Rack + Stylized Vintage Wooden Surfboard & Camp Gear Box
  const rackRailGeo = new THREE.CylinderGeometry(0.022, 0.022, 1.72, 8);
  rackRailGeo.rotateZ(Math.PI / 2);
  [-0.55, 0.35, 1.25].forEach((rz) => {
    const bar = new THREE.Mesh(rackRailGeo, darkTrimMat);
    bar.position.set(0, 2.42, rz);
    bar.castShadow = true;
    bodyGroup.add(bar);
  });

  // Side rack rails
  const sideRailGeo = new THREE.CylinderGeometry(0.022, 0.022, 2.0, 8);
  sideRailGeo.rotateX(Math.PI / 2);
  [-0.84, 0.84].forEach((rx) => {
    const rail = new THREE.Mesh(sideRailGeo, darkTrimMat);
    rail.position.set(rx, 2.42, 0.35);
    bodyGroup.add(rail);
  });

  // Vintage striped surfboard on roof rack (Lathe/scaled capsule silhouette)
  const boardMat = new THREE.MeshPhysicalMaterial({
    color: 0xe6a149,
    roughness: 0.25,
    metalness: 0.05,
    clearcoat: 0.85,
  });
  const boardGeo = new THREE.CapsuleGeometry(0.24, 2.15, 8, 16);
  boardGeo.scale(1.15, 1.0, 0.2);
  boardGeo.rotateX(Math.PI / 2);
  const surfboard = new THREE.Mesh(boardGeo, boardMat);
  surfboard.position.set(-0.34, 2.49, 0.26);
  surfboard.castShadow = true;
  bodyGroup.add(surfboard);

  const boardStripe = new THREE.Mesh(
    new THREE.BoxGeometry(0.11, 0.095, 2.42),
    new THREE.MeshStandardMaterial({ color: 0xfaf5eb, roughness: 0.3 })
  );
  boardStripe.position.set(-0.34, 2.495, 0.26);
  bodyGroup.add(boardStripe);

  // Retro wooden luggage crate on opposite side of rack
  const crateMat = new THREE.MeshStandardMaterial({ color: 0x8f5d38, roughness: 0.82 });
  const luggageCrate = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.24, 0.86), crateMat);
  luggageCrate.position.set(0.4, 2.55, 0.62);
  luggageCrate.castShadow = true;
  bodyGroup.add(luggageCrate);

  // Side roll-up awning cylinder on the right roof edge
  const awning = new THREE.Mesh(
    new THREE.CylinderGeometry(0.065, 0.065, 2.55, 12),
    new THREE.MeshStandardMaterial({ color: 0xd9cdb8, roughness: 0.78 })
  );
  awning.rotation.x = Math.PI / 2;
  awning.position.set(0.96, 2.22, 0.55);
  awning.castShadow = true;
  bodyGroup.add(awning);

  // 7. Interior Cab (floor, seats, dashboard, steering wheel, warm dome light)
  const cabBackdrop = new THREE.Mesh(new THREE.BoxGeometry(1.72, 1.25, 0.14), cabinWallMat);
  cabBackdrop.position.set(0, 1.38, -0.04);
  bodyGroup.add(cabBackdrop);

  const dash = new THREE.Mesh(new THREE.BoxGeometry(1.68, 0.34, 0.42), darkTrimMat);
  dash.position.set(0, 1.24, -1.68);
  bodyGroup.add(dash);

  const steeringRim = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.024, 8, 20), darkTrimMat);
  steeringRim.position.set(0.42, 1.44, -1.36);
  steeringRim.rotation.x = 0.45;
  bodyGroup.add(steeringRim);

  // Two cozy tan camper seats
  [-0.42, 0.42].forEach((sx) => {
    const cushion = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.16, 0.52), interiorMat);
    cushion.position.set(sx, 0.96, -0.78);
    bodyGroup.add(cushion);
    const backrest = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.66, 0.14), interiorMat);
    backrest.position.set(sx, 1.34, -0.54);
    backrest.rotation.x = -0.12;
    bodyGroup.add(backrest);
  });

  const cabinLight = new THREE.PointLight(0xffd89b, 1.1, 3.8, 2);
  cabinLight.position.set(0.15, 1.92, -0.82);
  bodyGroup.add(cabinLight);

  // 8. Wrap-around Windshield, Side Rear Windows & Rear Window
  const windshield = new THREE.Mesh(new THREE.PlaneGeometry(1.66, 0.72), glassMat);
  windshield.position.set(0, 1.7, -1.89);
  windshield.rotation.x = -0.22;
  windshield.rotation.y = Math.PI;
  windshield.renderOrder = 4;
  bodyGroup.add(windshield);

  // Rear side windows (both sides)
  const rearWinGeo = new THREE.PlaneGeometry(1.56, 0.52);
  const rightRearWin = new THREE.Mesh(rearWinGeo, glassMat);
  rightRearWin.position.set(0.955, 1.72, 1.06);
  rightRearWin.rotation.y = Math.PI / 2;
  rightRearWin.renderOrder = 4;
  bodyGroup.add(rightRearWin);

  const leftRearWin = new THREE.Mesh(rearWinGeo, glassMat);
  leftRearWin.position.set(-0.955, 1.72, 1.06);
  leftRearWin.rotation.y = -Math.PI / 2;
  leftRearWin.renderOrder = 4;
  bodyGroup.add(leftRearWin);

  // Rear tailgate window
  const backWin = new THREE.Mesh(new THREE.PlaneGeometry(1.42, 0.52), glassMat);
  backWin.position.set(0, 1.72, 2.09);
  backWin.renderOrder = 4;
  bodyGroup.add(backWin);

  // 9. Articulated Right-Side Cab Door (hinged at front edge x=+0.95, z=-1.56)
  // Swings cleanly outward (+rotation.y opens toward +X / front-right)
  const doorPivot = new THREE.Group();
  doorPivot.position.set(0.95, 0.54, -1.56);
  bodyGroup.add(doorPivot);

  const doorLower = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.78, 1.48), bodyPaintMat);
  doorLower.position.set(0, 0.39, 0.74);
  doorLower.castShadow = true;
  doorPivot.add(doorLower);

  const doorBelt = new THREE.Mesh(new THREE.BoxGeometry(0.115, 0.055, 1.48), chromeMat);
  doorBelt.position.set(0.01, 0.78, 0.74);
  doorPivot.add(doorBelt);

  // Door window frame (top, front, rear rails)
  const doorTopRail = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.09, 1.48), roofPaintMat);
  doorTopRail.position.set(0, 1.52, 0.74);
  doorPivot.add(doorTopRail);

  const doorFrontRail = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.72, 0.1), roofPaintMat);
  doorFrontRail.position.set(0, 1.15, 0.05);
  doorPivot.add(doorFrontRail);

  const doorBackRail = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.72, 0.1), roofPaintMat);
  doorBackRail.position.set(0, 1.15, 1.43);
  doorPivot.add(doorBackRail);

  const doorGlass = new THREE.Mesh(new THREE.PlaneGeometry(1.28, 0.62), glassMat);
  doorGlass.position.set(0.04, 1.15, 0.74);
  doorGlass.rotation.y = Math.PI / 2;
  doorGlass.renderOrder = 5;
  doorPivot.add(doorGlass);

  // Brushed chrome door handle
  const doorHandle = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.045, 0.22), chromeMat);
  doorHandle.position.set(0.075, 0.68, 1.24);
  doorPivot.add(doorHandle);

  // Retro chrome side mirror attached to door front
  const mirrorArm = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.2, 8), chromeMat);
  mirrorArm.rotation.z = Math.PI / 2;
  mirrorArm.position.set(0.12, 0.92, 0.16);
  doorPivot.add(mirrorArm);

  const mirrorHead = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.16, 0.12), chromeMat);
  mirrorHead.position.set(0.22, 0.94, 0.16);
  doorPivot.add(mirrorHead);

  // 10. Front Fascia: Round Chrome Headlights, Classic Emblem, Chrome Bumpers, Taillights
  const bezelGeo = new THREE.TorusGeometry(0.16, 0.028, 10, 24);
  const lampGeo = new THREE.CylinderGeometry(0.145, 0.145, 0.05, 20);
  lampGeo.rotateX(Math.PI / 2);

  [-0.64, 0.64].forEach((hx) => {
    const bezel = new THREE.Mesh(bezelGeo, chromeMat);
    bezel.position.set(hx, 0.88, -2.18);
    bodyGroup.add(bezel);

    const lamp = new THREE.Mesh(lampGeo, headlightMat);
    lamp.position.set(hx, 0.88, -2.16);
    bodyGroup.add(lamp);

    // Amber turn signal lens
    const blinker = new THREE.Mesh(
      new THREE.SphereGeometry(0.055, 12, 10),
      new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        emissive: 0xd97706,
        emissiveIntensity: 0.25,
        roughness: 0.25,
      })
    );
    blinker.position.set(hx * 1.06, 1.13, -2.14);
    bodyGroup.add(blinker);
  });

  // Classic circular chrome front badge
  const frontBadge = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.025, 10, 24), chromeMat);
  frontBadge.position.set(0, 1.04, -2.19);
  bodyGroup.add(frontBadge);

  // Front & rear chrome bumpers
  const bumperGeo = new THREE.BoxGeometry(2.04, 0.15, 0.18);
  const frontBumper = new THREE.Mesh(bumperGeo, chromeMat);
  frontBumper.position.set(0, 0.44, -2.22);
  frontBumper.castShadow = true;
  bodyGroup.add(frontBumper);

  const rearBumper = new THREE.Mesh(bumperGeo, chromeMat);
  rearBumper.position.set(0, 0.44, 2.2);
  rearBumper.castShadow = true;
  bodyGroup.add(rearBumper);

  // Rear taillights + spare tire on tailgate + tailpipe
  [-0.72, 0.72].forEach((tx) => {
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.26, 0.08), taillightMat);
    tail.position.set(tx, 0.94, 2.15);
    bodyGroup.add(tail);
  });

  const spareCover = new THREE.Mesh(
    new THREE.CylinderGeometry(0.36, 0.36, 0.2, 24),
    roofPaintMat
  );
  spareCover.rotation.x = Math.PI / 2;
  spareCover.position.set(0, 0.98, 2.24);
  spareCover.castShadow = true;
  bodyGroup.add(spareCover);

  const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.045, 0.32, 10), chromeMat);
  exhaust.rotation.x = Math.PI / 2;
  exhaust.position.set(-0.56, 0.34, 2.22);
  bodyGroup.add(exhaust);

  // 11. Four Detailed Rotating Wheels (radius = 0.38m so bottom touches y = 0.0 exactly!)
  const wheelRadius = 0.38;
  const wheelPositions: [number, number, number][] = [
    [-halfW + 0.02, wheelRadius, -1.32],
    [halfW - 0.02, wheelRadius, -1.32],
    [-halfW + 0.02, wheelRadius, 1.24],
    [halfW - 0.02, wheelRadius, 1.24],
  ];

  const wheels: THREE.Group[] = [];
  const tireGeo = new THREE.CylinderGeometry(wheelRadius, wheelRadius, 0.26, 24);
  tireGeo.rotateZ(Math.PI / 2);
  const rimGeo = new THREE.CylinderGeometry(0.23, 0.23, 0.275, 18);
  rimGeo.rotateZ(Math.PI / 2);
  const hubGeo = new THREE.SphereGeometry(0.13, 14, 10);
  hubGeo.scale(0.55, 1, 1);

  for (const [wx, wy, wz] of wheelPositions) {
    const wGroup = new THREE.Group();
    wGroup.position.set(wx, wy, wz);

    const tire = new THREE.Mesh(tireGeo, tireMat);
    tire.castShadow = true;
    wGroup.add(tire);

    const rim = new THREE.Mesh(rimGeo, rimMat);
    wGroup.add(rim);

    // Subtle visual lug spoke markers so wheel rotation reads clearly on camera
    const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.285, 0.04, 0.32), darkTrimMat);
    wGroup.add(spoke);

    const hub = new THREE.Mesh(hubGeo, chromeMat);
    hub.position.x = wx > 0 ? 0.11 : -0.11;
    wGroup.add(hub);

    root.add(wGroup);
    wheels.push(wGroup);
  }

  // 12. Soft radial contact shadow grounded at y = 0.035 (prevents floating appearance)
  const shadowGeo = new THREE.PlaneGeometry(3.2, 5.4);
  shadowGeo.rotateX(-Math.PI / 2);
  const contactShadow = new THREE.Mesh(
    shadowGeo,
    new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -2,
    })
  );
  contactShadow.position.set(0, 0.036, 0);
  root.add(contactShadow);

  return {
    root,
    bodyGroup,
    doorPivot,
    wheels,
    bodyPaintMat,
    roofPaintMat,
    headlightMat,
    taillightMat,
    cabinLight,
    contactShadow,
  };
}

export interface TravelerRig {
  root: THREE.Group;
  hips: THREE.Group;
  torso: THREE.Group;
  head: THREE.Group;
  leftShoulder: THREE.Group;
  leftElbow: THREE.Group;
  rightShoulder: THREE.Group;
  rightElbow: THREE.Group;
  leftHip: THREE.Group;
  leftKnee: THREE.Group;
  rightHip: THREE.Group;
  rightKnee: THREE.Group;
  backpack: THREE.Group;
  jacketMat: THREE.MeshStandardMaterial;
  backpackMat: THREE.MeshStandardMaterial;
  beanieMat: THREE.MeshStandardMaterial;
  contactShadow: THREE.Mesh;
}

/**
 * Builds an original stylized 3D traveler (~1.72m tall) entirely from procedural
 * Three.js geometry with natural hierarchical joints, knit beanie, scarf, parka jacket,
 * hiking backpack with brass buckles & rolled sleeping pad, and hiking boots.
 * Local forward is +Z so rotation.y aligns naturally with atan2(dx, dz).
 */
export function buildStylizedTraveler(shadowTex: THREE.Texture): TravelerRig {
  const root = new THREE.Group();

  const skinMat = new THREE.MeshStandardMaterial({
    color: 0xf1c29b,
    roughness: 0.62,
    metalness: 0.02,
  });

  const hairMat = new THREE.MeshStandardMaterial({
    color: 0x3b2820,
    roughness: 0.85,
    metalness: 0.04,
  });

  const beanieMat = new THREE.MeshStandardMaterial({
    color: 0xd97736, // Warm burnt-ochre knit beanie (editable)
    roughness: 0.92,
    metalness: 0.0,
  });

  const scarfMat = new THREE.MeshStandardMaterial({
    color: 0xf4e8d4,
    roughness: 0.9,
    metalness: 0.0,
  });

  const jacketMat = new THREE.MeshStandardMaterial({
    color: 0xc8523b, // Terracotta adventure parka (editable)
    roughness: 0.78,
    metalness: 0.04,
  });

  const pantsMat = new THREE.MeshStandardMaterial({
    color: 0x2d3a45, // Slate hiking trousers
    roughness: 0.86,
    metalness: 0.02,
  });

  const bootMat = new THREE.MeshStandardMaterial({
    color: 0x4b3426,
    roughness: 0.84,
    metalness: 0.05,
  });

  const soleMat = new THREE.MeshStandardMaterial({
    color: 0x1e1d1c,
    roughness: 0.95,
  });

  const backpackMat = new THREE.MeshStandardMaterial({
    color: 0x4f6448, // Moss canvas backpack (editable)
    roughness: 0.86,
    metalness: 0.04,
  });

  const brassMat = new THREE.MeshStandardMaterial({
    color: 0xd8a84e,
    roughness: 0.25,
    metalness: 0.88,
  });

  // Hips root positioned at standing hip height (y = 0.84m)
  const hips = new THREE.Group();
  hips.position.set(0, 0.84, 0);
  root.add(hips);

  const pelvis = new THREE.Mesh(new THREE.CapsuleGeometry(0.145, 0.08, 8, 14), pantsMat);
  pelvis.rotation.z = Math.PI / 2;
  pelvis.castShadow = true;
  hips.add(pelvis);

  // Torso group pivoted at waist
  const torso = new THREE.Group();
  torso.position.set(0, 0.06, 0);
  hips.add(torso);

  // Sculpted outdoor parka torso + flared lower coat skirt
  const chest = new THREE.Mesh(new THREE.CylinderGeometry(0.175, 0.2, 0.44, 16), jacketMat);
  chest.position.set(0, 0.24, 0);
  chest.scale.set(1.06, 1, 0.78);
  chest.castShadow = true;
  torso.add(chest);

  const jacketHem = new THREE.Mesh(new THREE.CylinderGeometry(0.205, 0.23, 0.16, 16), jacketMat);
  jacketHem.position.set(0, 0.02, 0);
  jacketHem.scale.set(1.06, 1, 0.8);
  jacketHem.castShadow = true;
  torso.add(jacketHem);

  // Front zipper strip & warm knit scarf collar
  const zipper = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.48, 0.02), brassMat);
  zipper.position.set(0, 0.22, 0.165);
  torso.add(zipper);

  const scarf = new THREE.Mesh(new THREE.TorusGeometry(0.125, 0.052, 10, 20), scarfMat);
  scarf.rotation.x = Math.PI / 2;
  scarf.position.set(0, 0.48, 0.01);
  scarf.castShadow = true;
  torso.add(scarf);

  const scarfTail = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.18, 0.032), scarfMat);
  scarfTail.position.set(0.06, 0.37, 0.155);
  scarfTail.rotation.z = -0.15;
  torso.add(scarfTail);

  // Backpack group mounted cleanly on upper back (-Z)
  const backpack = new THREE.Group();
  backpack.position.set(0, 0.26, -0.2);
  torso.add(backpack);

  const packShape = new THREE.Shape();
  packShape.moveTo(-0.14, -0.2);
  packShape.lineTo(0.14, -0.2);
  packShape.quadraticCurveTo(0.18, -0.2, 0.18, -0.14);
  packShape.lineTo(0.17, 0.16);
  packShape.quadraticCurveTo(0.17, 0.22, 0.11, 0.22);
  packShape.lineTo(-0.11, 0.22);
  packShape.quadraticCurveTo(-0.17, 0.22, -0.17, 0.16);
  packShape.lineTo(-0.18, -0.14);
  packShape.quadraticCurveTo(-0.18, -0.2, -0.14, -0.2);

  const packGeo = new THREE.ExtrudeGeometry(packShape, {
    depth: 0.15,
    bevelEnabled: true,
    bevelThickness: 0.035,
    bevelSize: 0.03,
    bevelSegments: 3,
  });
  packGeo.center();
  const packBody = new THREE.Mesh(packGeo, backpackMat);
  packBody.castShadow = true;
  backpack.add(packBody);

  // Twin brass buckles & straps on backpack
  [-0.08, 0.08].forEach((bx) => {
    const strap = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.34, 0.025), bootMat);
    strap.position.set(bx, 0.02, -0.1);
    backpack.add(strap);

    const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.044, 0.036, 0.034), brassMat);
    buckle.position.set(bx, -0.04, -0.105);
    backpack.add(buckle);
  });

  // Rolled sleeping pad across top of backpack
  const padMat = new THREE.MeshStandardMaterial({ color: 0xe3b256, roughness: 0.85 });
  const sleepingPad = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.062, 0.38, 14), padMat);
  sleepingPad.rotation.z = Math.PI / 2;
  sleepingPad.position.set(0, 0.26, -0.01);
  sleepingPad.castShadow = true;
  backpack.add(sleepingPad);

  // Aluminum water bottle in side pocket
  const bottle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.034, 0.034, 0.16, 12),
    new THREE.MeshStandardMaterial({ color: 0xd1d8e0, roughness: 0.22, metalness: 0.85 })
  );
  bottle.position.set(0.21, -0.08, 0);
  backpack.add(bottle);

  // Head group pivoted at neck
  const head = new THREE.Group();
  head.position.set(0, 0.54, 0.01);
  torso.add(head);

  const neckMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.056, 0.065, 0.09, 12), skinMat);
  neckMesh.position.set(0, 0.02, 0);
  head.add(neckMesh);

  const cranium = new THREE.Mesh(new THREE.SphereGeometry(0.168, 22, 18), skinMat);
  cranium.position.set(0, 0.19, 0);
  cranium.scale.set(0.95, 1.04, 0.96);
  cranium.castShadow = true;
  head.add(cranium);

  // Stylized warm eyes with crisp white specular catchlights
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.12, metalness: 0.1 });
  const catchlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  [-0.056, 0.056].forEach((ex) => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.022, 12, 10), eyeMat);
    eye.position.set(ex, 0.2, 0.146);
    head.add(eye);

    const glint = new THREE.Mesh(new THREE.SphereGeometry(0.007, 8, 6), catchlightMat);
    glint.position.set(ex + 0.008, 0.208, 0.164);
    head.add(glint);

    // Subtle expressive brow
    const brow = new THREE.Mesh(new THREE.BoxGeometry(0.044, 0.012, 0.015), hairMat);
    brow.position.set(ex, 0.242, 0.148);
    brow.rotation.z = ex < 0 ? 0.12 : -0.12;
    head.add(brow);
  });

  // Small stylized nose & warm friendly smile
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.022, 10, 8), skinMat);
  nose.position.set(0, 0.168, 0.164);
  nose.scale.set(0.85, 0.95, 1.15);
  head.add(nose);

  const smile = new THREE.Mesh(
    new THREE.TorusGeometry(0.034, 0.007, 8, 14, Math.PI * 0.85),
    new THREE.MeshStandardMaterial({ color: 0x8f4338, roughness: 0.6 })
  );
  smile.position.set(0, 0.132, 0.148);
  smile.rotation.z = Math.PI * 1.075;
  head.add(smile);

  // Ears
  [-0.158, 0.158].forEach((ex) => {
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.032, 10, 8), skinMat);
    ear.position.set(ex, 0.185, -0.005);
    ear.scale.set(0.55, 1, 0.85);
    head.add(ear);
  });

  // Sculpted hair fringe beneath beanie
  const hairBack = new THREE.Mesh(
    new THREE.SphereGeometry(0.17, 16, 14, 0, Math.PI * 2, 0, Math.PI * 0.58),
    hairMat
  );
  hairBack.position.set(0, 0.205, -0.015);
  hairBack.rotation.x = -0.25;
  head.add(hairBack);

  // Cozy knit beanie hat (dome + folded cuff + pom-pom)
  const beanieDome = new THREE.Mesh(
    new THREE.SphereGeometry(0.178, 18, 14, 0, Math.PI * 2, 0, Math.PI * 0.56),
    beanieMat
  );
  beanieDome.position.set(0, 0.235, -0.012);
  beanieDome.rotation.x = -0.18;
  beanieDome.castShadow = true;
  head.add(beanieDome);

  const beanieCuff = new THREE.Mesh(new THREE.TorusGeometry(0.168, 0.032, 10, 22), beanieMat);
  beanieCuff.rotation.x = Math.PI / 2 - 0.18;
  beanieCuff.position.set(0, 0.258, -0.006);
  beanieCuff.castShadow = true;
  head.add(beanieCuff);

  const pomPom = new THREE.Mesh(new THREE.SphereGeometry(0.048, 12, 10), scarfMat);
  pomPom.position.set(0, 0.425, -0.05);
  pomPom.castShadow = true;
  head.add(pomPom);

  // Helper to build articulated arm (shoulder -> upper arm -> elbow -> forearm -> hand)
  const buildArm = (side: -1 | 1) => {
    const shoulder = new THREE.Group();
    shoulder.position.set(side * 0.225, 0.42, 0);
    torso.add(shoulder);

    const shoulderCap = new THREE.Mesh(new THREE.SphereGeometry(0.068, 12, 10), jacketMat);
    shoulderCap.castShadow = true;
    shoulder.add(shoulderCap);

    const upperArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.056, 0.21, 6, 12), jacketMat);
    upperArm.position.set(0, -0.145, 0);
    upperArm.castShadow = true;
    shoulder.add(upperArm);

    const elbow = new THREE.Group();
    elbow.position.set(0, -0.28, 0);
    shoulder.add(elbow);

    const forearm = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.19, 6, 12), jacketMat);
    forearm.position.set(0, -0.125, 0);
    forearm.castShadow = true;
    elbow.add(forearm);

    const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.053, 0.05, 0.04, 12), scarfMat);
    cuff.position.set(0, -0.235, 0);
    elbow.add(cuff);

    // Stylized sculpted hand + thumb so camera wave reads clearly
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.052, 12, 10), skinMat);
    hand.position.set(0, -0.29, 0.01);
    hand.scale.set(0.82, 1.12, 0.62);
    hand.castShadow = true;
    elbow.add(hand);

    const thumb = new THREE.Mesh(new THREE.CapsuleGeometry(0.016, 0.032, 4, 8), skinMat);
    thumb.position.set(-side * 0.038, -0.275, 0.025);
    thumb.rotation.z = side * 0.55;
    elbow.add(thumb);

    return { shoulder, elbow };
  };

  const leftArm = buildArm(-1);
  const rightArm = buildArm(1);

  // Helper to build articulated leg (hip -> thigh -> knee -> shin -> hiking boot)
  const buildLeg = (side: -1 | 1) => {
    const hip = new THREE.Group();
    hip.position.set(side * 0.105, -0.02, 0);
    hips.add(hip);

    const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.068, 0.27, 6, 12), pantsMat);
    thigh.position.set(0, -0.18, 0);
    thigh.castShadow = true;
    hip.add(thigh);

    const knee = new THREE.Group();
    knee.position.set(0, -0.37, 0);
    hip.add(knee);

    const shin = new THREE.Mesh(new THREE.CapsuleGeometry(0.058, 0.27, 6, 12), pantsMat);
    shin.position.set(0, -0.18, 0);
    shin.castShadow = true;
    knee.add(shin);

    // Hiking boot with ankle collar + lug sole (bottom rests at y = -0.45 from knee -> 0.84 - 0.02 - 0.37 - 0.45 = 0.00!)
    const bootUpper = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.1, 0.22), bootMat);
    bootUpper.position.set(0, -0.37, 0.045);
    bootUpper.castShadow = true;
    knee.add(bootUpper);

    const bootToe = new THREE.Mesh(new THREE.SphereGeometry(0.058, 10, 8), bootMat);
    bootToe.position.set(0, -0.385, 0.14);
    bootToe.scale.set(0.95, 0.72, 1.1);
    knee.add(bootToe);

    const sole = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.036, 0.26), soleMat);
    sole.position.set(0, -0.432, 0.052);
    knee.add(sole);

    return { hip, knee };
  };

  const leftLeg = buildLeg(-1);
  const rightLeg = buildLeg(1);

  // Soft radial contact shadow under traveler's boots
  const shadowGeo = new THREE.PlaneGeometry(0.95, 0.95);
  shadowGeo.rotateX(-Math.PI / 2);
  const contactShadow = new THREE.Mesh(
    shadowGeo,
    new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -3,
    })
  );
  contactShadow.position.set(0, 0.038, 0);
  root.add(contactShadow);

  return {
    root,
    hips,
    torso,
    head,
    leftShoulder: leftArm.shoulder,
    leftElbow: leftArm.elbow,
    rightShoulder: rightArm.shoulder,
    rightElbow: rightArm.elbow,
    leftHip: leftLeg.hip,
    leftKnee: leftLeg.knee,
    rightHip: rightLeg.hip,
    rightKnee: rightLeg.knee,
    backpack,
    jacketMat,
    backpackMat,
    beanieMat,
    contactShadow,
  };
}

export interface LandscapeHandles {
  group: THREE.Group;
  skyMesh: THREE.Mesh;
  skyMat: THREE.MeshBasicMaterial;
  campfireLight: THREE.PointLight;
  flameMesh: THREE.Mesh;
}

/**
 * Builds the full stylized alpine/highland valley landscape:
 * - Sculpted terrain extending far into horizon fog (zero floating box edges)
 * - Winding scenic road ribbon following roadCenterX(z)
 * - InstancedMesh stylized multi-tier pine forest (78 trees, per-instance tint & scale)
 * - InstancedMesh stylized boulders & timber fence posts
 * - Distant layered alpine mountain silhouette ring
 * - Camp turnout wooden signpost & warm glowing campfire
 */
export function buildStylizedLandscape(maxAnisotropy: number): LandscapeHandles {
  const group = new THREE.Group();

  // 1. Procedural Sky Gradient Dome
  const skyGeo = new THREE.SphereGeometry(145, 32, 20);
  const skyMat = new THREE.MeshBasicMaterial({
    map: createSkyGradientTexture('#3B6696', '#D49E76', '#F4D4A8'),
    side: THREE.BackSide,
    fog: false,
    depthWrite: false,
  });
  const skyMesh = new THREE.Mesh(skyGeo, skyMat);
  group.add(skyMesh);

  // 2. Sculpted Valley Ground Mesh (140m x 160m)
  const terrainGeo = new THREE.PlaneGeometry(140, 160, 84, 96);
  terrainGeo.rotateX(-Math.PI / 2);
  const posAttr = terrainGeo.attributes.position;
  for (let i = 0; i < posAttr.count; i++) {
    const vx = posAttr.getX(i);
    const vz = posAttr.getZ(i) - 32; // Shift forward along the scenic valley (-Z)
    posAttr.setZ(i, vz);
    posAttr.setY(i, groundHeightAt(vx, vz));
  }
  terrainGeo.computeVertexNormals();

  const terrainMat = new THREE.MeshStandardMaterial({
    map: createMeadowTexture(maxAnisotropy),
    roughness: 0.94,
    metalness: 0.0,
  });
  const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
  terrainMesh.receiveShadow = true;
  group.add(terrainMesh);

  // 3. Winding Scenic Road Mesh (Custom indexed ribbon sitting cleanly at y = 0.025)
  const roadSegs = 90;
  const roadHalfW = 2.55;
  const roadPositions = new Float32Array((roadSegs + 1) * 2 * 3);
  const roadUvs = new Float32Array((roadSegs + 1) * 2 * 2);
  const roadIndices: number[] = [];

  for (let i = 0; i <= roadSegs; i++) {
    const t = i / roadSegs;
    const z = THREE.MathUtils.lerp(16, -68, t);
    const cx = roadCenterX(z);
    const yaw = roadHeadingYaw(z);
    const nx = Math.cos(yaw);
    const nz = Math.sin(yaw);

    const lx = cx - nx * roadHalfW;
    const lz = z - nz * roadHalfW;
    const rx = cx + nx * roadHalfW;
    const rz = z + nz * roadHalfW;

    const vBase = i * 6;
    roadPositions[vBase] = lx;
    roadPositions[vBase + 1] = 0.024;
    roadPositions[vBase + 2] = lz;
    roadPositions[vBase + 3] = rx;
    roadPositions[vBase + 4] = 0.024;
    roadPositions[vBase + 5] = rz;

    const uBase = i * 4;
    roadUvs[uBase] = 0;
    roadUvs[uBase + 1] = t * 14;
    roadUvs[uBase + 2] = 1;
    roadUvs[uBase + 3] = t * 14;

    if (i < roadSegs) {
      const a = i * 2;
      const b = a + 1;
      const c = a + 2;
      const d = a + 3;
      roadIndices.push(a, c, b, b, c, d);
    }
  }

  const roadGeo = new THREE.BufferGeometry();
  roadGeo.setAttribute('position', new THREE.BufferAttribute(roadPositions, 3));
  roadGeo.setAttribute('uv', new THREE.BufferAttribute(roadUvs, 2));
  roadGeo.setIndex(roadIndices);
  roadGeo.computeVertexNormals();

  const roadMat = new THREE.MeshStandardMaterial({
    map: createRoadTexture(maxAnisotropy),
    roughness: 0.9,
    metalness: 0.02,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });
  const roadMesh = new THREE.Mesh(roadGeo, roadMat);
  roadMesh.receiveShadow = true;
  group.add(roadMesh);

  // Soft camp turnout gravel apron where the traveler walks from right toward the van
  const turnoutGeo = new THREE.CircleGeometry(5.2, 28);
  turnoutGeo.rotateX(-Math.PI / 2);
  const turnoutMat = new THREE.MeshStandardMaterial({
    color: 0x9b8d75,
    roughness: 0.95,
    metalness: 0.0,
    polygonOffset: true,
    polygonOffsetFactor: -1,
  });
  const turnout = new THREE.Mesh(turnoutGeo, turnoutMat);
  turnout.position.set(2.8, 0.02, 1.4);
  turnout.scale.set(1.25, 1, 0.85);
  turnout.receiveShadow = true;
  group.add(turnout);

  // 4. Distant Stylized Mountain Peaks ringing the valley horizon
  const mountainMat = new THREE.MeshStandardMaterial({
    color: 0x5c6d7e,
    roughness: 0.95,
    metalness: 0.02,
    flatShading: true,
  });
  const snowCapMat = new THREE.MeshStandardMaterial({
    color: 0xf4eee6,
    roughness: 0.82,
    flatShading: true,
  });

  const peaks: [number, number, number, number, number][] = [
    [-28, -74, 24, 26, 0.4],
    [-4, -84, 29, 32, 0.9],
    [24, -76, 25, 28, 1.5],
    [48, -62, 22, 24, 2.2],
    [-52, -56, 20, 22, 2.8],
    [10, -92, 34, 38, 0.2],
  ];

  for (const [px, pz, rad, height, rot] of peaks) {
    const peakGroup = new THREE.Group();
    peakGroup.position.set(px, -1, pz);
    peakGroup.rotation.y = rot;

    const body = new THREE.Mesh(new THREE.ConeGeometry(rad, height, 7), mountainMat);
    body.position.y = height * 0.5;
    peakGroup.add(body);

    const capH = height * 0.31;
    const cap = new THREE.Mesh(new THREE.ConeGeometry(rad * 0.315, capH, 7), snowCapMat);
    cap.position.y = height - capH * 0.48;
    peakGroup.add(cap);

    group.add(peakGroup);
  }

  // 5. Stylized Multi-Tier Pine Trees via InstancedMesh (3 foliage cones + trunk)
  const treeCoords: [number, number, number][] = [];
  let seed = 9001;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  for (let i = 0; i < 160 && treeCoords.length < 78; i++) {
    const tx = (rand() - 0.5) * 86;
    const tz = 12 - rand() * 76;
    const distToRoad = Math.abs(tx - roadCenterX(tz));
    const distToCamp = Math.hypot(tx - 2.6, tz - 1.5);
    // Keep camera sightline & camp clearing open
    const inCameraCorridor = tx > 1.5 && tx < 10.5 && tz > 1.2 && tz < 11.5;
    if (distToRoad < 4.4 || distToCamp < 6.4 || inCameraCorridor) continue;
    const sc = 0.82 + rand() * 0.48;
    treeCoords.push([tx, tz, sc]);
  }

  const treeCount = treeCoords.length;
  const trunkGeo = new THREE.CylinderGeometry(0.14, 0.24, 1.3, 7);
  trunkGeo.translate(0, 0.65, 0);
  const tier1Geo = new THREE.ConeGeometry(1.38, 2.35, 8);
  tier1Geo.translate(0, 2.0, 0);
  const tier2Geo = new THREE.ConeGeometry(1.06, 2.05, 8);
  tier2Geo.translate(0, 3.25, 0);
  const tier3Geo = new THREE.ConeGeometry(0.72, 1.65, 8);
  tier3Geo.translate(0, 4.35, 0);

  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c3e2a, roughness: 0.92 });
  const foliageMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.88,
    flatShading: true,
  });

  const trunkInst = new THREE.InstancedMesh(trunkGeo, trunkMat, treeCount);
  const tier1Inst = new THREE.InstancedMesh(tier1Geo, foliageMat, treeCount);
  const tier2Inst = new THREE.InstancedMesh(tier2Geo, foliageMat, treeCount);
  const tier3Inst = new THREE.InstancedMesh(tier3Geo, foliageMat, treeCount);

  trunkInst.castShadow = true;
  tier1Inst.castShadow = true;
  tier2Inst.castShadow = true;
  tier3Inst.castShadow = true;
  tier1Inst.receiveShadow = true;
  tier2Inst.receiveShadow = true;

  const dummy = new THREE.Object3D();
  const colorTmp = new THREE.Color();
  const foliagePalette = [0x2d543c, 0x376444, 0x264834, 0x416d47, 0x2f5a44];

  treeCoords.forEach(([tx, tz, sc], idx) => {
    const ty = groundHeightAt(tx, tz) - 0.08;
    dummy.position.set(tx, ty, tz);
    dummy.rotation.set(0, rand() * Math.PI * 2, (rand() - 0.5) * 0.05);
    dummy.scale.set(sc, sc * (0.92 + rand() * 0.2), sc);
    dummy.updateMatrix();

    trunkInst.setMatrixAt(idx, dummy.matrix);
    tier1Inst.setMatrixAt(idx, dummy.matrix);
    tier2Inst.setMatrixAt(idx, dummy.matrix);
    tier3Inst.setMatrixAt(idx, dummy.matrix);

    const baseHex = foliagePalette[idx % foliagePalette.length];
    colorTmp.setHex(baseHex);
    tier1Inst.setColorAt(idx, colorTmp);
    colorTmp.offsetHSL(0, 0.02, 0.04);
    tier2Inst.setColorAt(idx, colorTmp);
    colorTmp.offsetHSL(0, 0.02, 0.04);
    tier3Inst.setColorAt(idx, colorTmp);
  });

  [trunkInst, tier1Inst, tier2Inst, tier3Inst].forEach((inst) => {
    inst.instanceMatrix.needsUpdate = true;
    if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
    inst.computeBoundingSphere();
    group.add(inst);
  });

  // 6. Stylized Granite Boulders via InstancedMesh
  const rockGeo = new THREE.DodecahedronGeometry(0.65, 0);
  const rockMat = new THREE.MeshStandardMaterial({
    color: 0x868178,
    roughness: 0.92,
    flatShading: true,
  });
  const rockCoords: [number, number, number][] = [
    [-4.2, 2.2, 1.15],
    [-5.1, -3.5, 0.85],
    [6.6, -1.8, 1.3],
    [7.4, -0.9, 0.72],
    [-4.5, -11.4, 1.4],
    [6.2, -16.2, 1.1],
    [-6.2, -24.0, 1.5],
    [8.2, 3.6, 0.95],
    [4.6, -6.5, 0.68],
    [-3.4, -18.5, 0.92],
  ];
  const rockInst = new THREE.InstancedMesh(rockGeo, rockMat, rockCoords.length);
  rockInst.castShadow = true;
  rockInst.receiveShadow = true;
  rockCoords.forEach(([rx, rz, sc], idx) => {
    const ry = groundHeightAt(rx, rz) + 0.2 * sc;
    dummy.position.set(rx, ry, rz);
    dummy.rotation.set(idx * 0.7, idx * 1.3, idx * 0.4);
    dummy.scale.set(sc * 1.2, sc * 0.78, sc);
    dummy.updateMatrix();
    rockInst.setMatrixAt(idx, dummy.matrix);
  });
  rockInst.instanceMatrix.needsUpdate = true;
  rockInst.computeBoundingSphere();
  group.add(rockInst);

  // 7. Cozy Camp Turnout Props: Wooden Trail Signpost & Warm Stone-Ring Campfire
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x6b4b32, roughness: 0.9 });
  const signGroup = new THREE.Group();
  signGroup.position.set(4.9, groundHeightAt(4.9, -2.6), -2.6);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.075, 1.95, 8), woodMat);
  post.position.y = 0.975;
  post.castShadow = true;
  signGroup.add(post);

  const plank = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.22, 0.05), woodMat);
  plank.position.set(-0.22, 1.66, 0.04);
  plank.rotation.y = 0.25;
  plank.castShadow = true;
  signGroup.add(plank);
  group.add(signGroup);

  // Campfire stone ring & gentle embers on right side of turnout
  const fireGroup = new THREE.Group();
  fireGroup.position.set(6.2, 0.02, 2.2);
  const stoneGeo = new THREE.DodecahedronGeometry(0.14, 0);
  for (let i = 0; i < 9; i++) {
    const ang = (i / 9) * Math.PI * 2;
    const stone = new THREE.Mesh(stoneGeo, rockMat);
    stone.position.set(Math.cos(ang) * 0.48, 0.08, Math.sin(ang) * 0.48);
    stone.scale.set(1.1, 0.7, 1.0);
    fireGroup.add(stone);
  }
  const logGeo = new THREE.CylinderGeometry(0.05, 0.055, 0.62, 7);
  logGeo.rotateZ(Math.PI / 2);
  for (let i = 0; i < 3; i++) {
    const log = new THREE.Mesh(logGeo, woodMat);
    log.position.y = 0.08;
    log.rotation.y = (i * Math.PI) / 3;
    fireGroup.add(log);
  }
  const flameMesh = new THREE.Mesh(
    new THREE.ConeGeometry(0.16, 0.42, 7),
    new THREE.MeshBasicMaterial({ color: 0xffa94d })
  );
  flameMesh.position.y = 0.26;
  fireGroup.add(flameMesh);

  const campfireLight = new THREE.PointLight(0xff9442, 1.6, 8, 2);
  campfireLight.position.set(0, 0.55, 0);
  fireGroup.add(campfireLight);
  group.add(fireGroup);

  return { group, skyMesh, skyMat, campfireLight, flameMesh };
}

export interface DustPuffPool {
  group: THREE.Group;
  meshes: THREE.Mesh[];
}

/**
 * Pool of 16 soft procedural dust puffs spawned behind rear wheels as the van drives away.
 */
export function buildDustPuffPool(): DustPuffPool {
  const group = new THREE.Group();
  const puffGeo = new THREE.IcosahedronGeometry(0.26, 1);
  const meshes: THREE.Mesh[] = [];
  for (let i = 0; i < 16; i++) {
    const mat = new THREE.MeshStandardMaterial({
      color: 0xdccbb0,
      roughness: 1.0,
      metalness: 0.0,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const m = new THREE.Mesh(puffGeo, mat);
    m.visible = false;
    group.add(m);
    meshes.push(m);
  }
  return { group, meshes };
}
