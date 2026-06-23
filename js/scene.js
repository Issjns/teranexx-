// ===== Terranex Elite Infraprojects — 3D Hero Scene =====
// A tracked hydraulic excavator (Poclain-style) that REALLY digs into a trench
// (2-bone inverse kinematics), lays pipes that rest in the trench, and throws
// dirt that falls with gravity. Ground fills the whole view. Cinematic look.
// Uses the global THREE (js/three.min.js) so it runs even from a local file.

const canvas = document.getElementById('scene3d');
if (canvas && typeof THREE !== 'undefined') {
  initScene(canvas);
}

function initScene(canvas) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#0a0e14');
  scene.fog = new THREE.FogExp2('#0a0e14', 0.016);

  const camera = new THREE.PerspectiveCamera(44, window.innerWidth / window.innerHeight, 0.1, 400);
  camera.position.set(16, 9, 20);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  if ('outputColorSpace' in renderer) renderer.outputColorSpace = THREE.SRGBColorSpace;

  // --- Lights ---
  scene.add(new THREE.HemisphereLight('#a8c8ff', '#241a0c', 0.65));
  const sun = new THREE.DirectionalLight('#ffe2b0', 2.2);
  sun.position.set(16, 26, 14);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 90;
  sun.shadow.camera.left = -28; sun.shadow.camera.right = 28;
  sun.shadow.camera.top = 28; sun.shadow.camera.bottom = -28;
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02;
  scene.add(sun);
  const rim = new THREE.SpotLight('#ff9a2e', 1.5, 70, Math.PI / 5, 0.5, 1.2);
  rim.position.set(-16, 14, -8);
  scene.add(rim);
  const fill = new THREE.PointLight('#3da9fc', 0.5, 60);
  fill.position.set(-12, 6, 14);
  scene.add(fill);

  // ===== Materials =====
  const groundMat = new THREE.MeshStandardMaterial({ color: '#2a3742', roughness: 1 });
  const dirtMat = new THREE.MeshStandardMaterial({ color: '#6b4f2c', roughness: 1 });
  const dirtDarkMat = new THREE.MeshStandardMaterial({ color: '#3a2c18', roughness: 1 });
  const wallMat = new THREE.MeshStandardMaterial({ color: '#5a4226', roughness: 1 });
  const exYellow = new THREE.MeshStandardMaterial({ color: '#ffb400', roughness: 0.45, metalness: 0.35 });
  const exYellowDark = new THREE.MeshStandardMaterial({ color: '#dd9400', roughness: 0.5, metalness: 0.3 });
  const trackMat = new THREE.MeshStandardMaterial({ color: '#14141a', roughness: 0.85, metalness: 0.3 });
  const steelMat = new THREE.MeshStandardMaterial({ color: '#aab4c0', roughness: 0.35, metalness: 0.85 });
  const ramMat = new THREE.MeshStandardMaterial({ color: '#d2dae3', roughness: 0.18, metalness: 0.95 });
  const glassMat = new THREE.MeshStandardMaterial({ color: '#8fe0ff', roughness: 0.08, metalness: 0.25, transparent: true, opacity: 0.45 });
  const pipeMat = new THREE.MeshStandardMaterial({ color: '#2f6f4f', roughness: 0.55, metalness: 0.25 });
  const pipeInner = new THREE.MeshStandardMaterial({ color: '#12302a', roughness: 0.95, side: THREE.DoubleSide });
  const rockMat = new THREE.MeshStandardMaterial({ color: '#574a3a', roughness: 1 });

  // ===== World layout =====
  // Ground top = y 0. Trench runs along X, centered z=0, half-width 1.3, floor top y=-1.5.
  const GROUND_Y = 0;
  const TRENCH_HALF = 1.3;
  const TRENCH_FLOOR_TOP = -1.5;

  // Big ground slabs on both sides of the trench fill the entire view.
  [1, -1].forEach((side) => {
    const slab = new THREE.Mesh(new THREE.BoxGeometry(260, 1.8, 130), groundMat);
    slab.position.set(0, -0.9, side * (TRENCH_HALF + 65));
    slab.receiveShadow = true;
    scene.add(slab);
  });
  // Trench floor + walls
  const trenchFloor = new THREE.Mesh(new THREE.BoxGeometry(260, 0.3, TRENCH_HALF * 2), dirtDarkMat);
  trenchFloor.position.set(0, TRENCH_FLOOR_TOP - 0.15, 0);
  trenchFloor.receiveShadow = true;
  scene.add(trenchFloor);
  [1, -1].forEach((side) => {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(260, 1.5, 0.12), wallMat);
    wall.position.set(0, -0.75, side * TRENCH_HALF);
    wall.receiveShadow = true; wall.castShadow = true;
    scene.add(wall);
  });

  // Spoil pile (where the bucket dumps) + scattered rocks, on the machine side (+z)
  function dirtPile(x, z, s) {
    const p = new THREE.Mesh(new THREE.ConeGeometry(s, s * 0.7, 9), dirtMat);
    p.position.set(x, s * 0.35 - 0.05, z);
    p.rotation.y = Math.random() * Math.PI;
    p.castShadow = true; p.receiveShadow = true;
    scene.add(p);
  }
  function rock(x, z, s) {
    const r = new THREE.Mesh(new THREE.DodecahedronGeometry(s, 0), rockMat);
    r.position.set(x, s * 0.5, z);
    r.rotation.set(Math.random(), Math.random(), Math.random());
    r.castShadow = true; r.receiveShadow = true;
    scene.add(r);
  }
  dirtPile(0.4, 2.6, 1.3); dirtPile(-1.4, 2.9, 1.0); dirtPile(1.8, 3.0, 0.9);
  dirtPile(-6, -2.4, 1.1); dirtPile(6, -2.6, 1.0);
  rock(2.6, 4.0, 0.4); rock(-3.0, 3.6, 0.35); rock(-8, -3, 0.5); rock(8, 2.8, 0.45);

  // ===== Pipes (axis along X, resting on the trench floor) =====
  const pipeRadius = 0.7;
  const pipeLen = 2.2;
  const pipeRestY = TRENCH_FLOOR_TOP + pipeRadius; // sits ON the floor
  function makePipe() {
    const g = new THREE.Group();
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(pipeRadius, pipeRadius, pipeLen, 32, 1, true), pipeMat);
    tube.rotation.z = Math.PI / 2; // align axis to X
    tube.castShadow = true; tube.receiveShadow = true;
    const bore = new THREE.Mesh(new THREE.CylinderGeometry(pipeRadius * 0.78, pipeRadius * 0.78, pipeLen + 0.02, 32, 1, true), pipeInner);
    bore.rotation.z = Math.PI / 2;
    g.add(tube, bore);
    [-1, 1].forEach((s) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(pipeRadius * 1.04, 0.09, 12, 28), steelMat);
      ring.position.x = (s * pipeLen) / 2;
      ring.rotation.y = Math.PI / 2;
      ring.castShadow = true;
      g.add(ring);
    });
    return g;
  }
  // Laid pipes behind the dig (-X)
  const firstLaidX = -2.6;
  const pipeStep = pipeLen + 0.2;
  for (let i = 0; i < 7; i++) {
    const p = makePipe();
    p.position.set(firstLaidX - i * pipeStep, pipeRestY, 0);
    scene.add(p);
  }
  // Pipe being lowered into the trench ahead of laid section (+X), settles on floor
  const liftingPipe = makePipe();
  const liftPipeX = 2.6;
  liftingPipe.position.set(liftPipeX, pipeRestY, 0);
  scene.add(liftingPipe);

  // ===== "Hydra" mobile hydraulic crane (opposite the excavator) that lifts the pipe =====
  // Helper: stretch/orient a unit-height cylinder between two world points (cables, rams)
  const UP = new THREE.Vector3(0, 1, 0);
  function linkBetween(mesh, a, b) {
    const dir = new THREE.Vector3().subVectors(b, a);
    const len = dir.length();
    mesh.scale.set(1, Math.max(0.05, len), 1);
    mesh.position.copy(a).add(b).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(UP, dir.normalize());
  }

  const crane = new THREE.Group();
  crane.position.set(liftPipeX, 0, -4.2); // opposite side of the trench, faces +z
  scene.add(crane);

  // Chassis + wheels (pick-and-carry mobile crane)
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.7, 4.4), exYellow);
  chassis.position.set(0, 0.95, 0); chassis.castShadow = true; crane.add(chassis);
  const cWeight = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.0, 0.7), exYellowDark);
  cWeight.position.set(0, 1.1, -2.0); cWeight.castShadow = true; crane.add(cWeight); // counterweight
  [-1, 1].forEach((sx) => [-1, 1].forEach((sz) => {
    const w = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.4, 20), trackMat);
    w.rotation.z = Math.PI / 2; w.position.set(sx * 1.05, 0.55, sz * 1.45); w.castShadow = true; crane.add(w);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.42, 12), steelMat);
    hub.rotation.z = Math.PI / 2; hub.position.copy(w.position); crane.add(hub);
  }));
  // Operator cab (front)
  const crCab = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.0, 1.0), exYellow);
  crCab.position.set(0.55, 1.85, 1.5); crCab.castShadow = true; crane.add(crCab);
  const crGlass = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.7, 0.85), glassMat);
  crGlass.position.set(0.6, 1.95, 1.55); crane.add(crGlass);

  // Boom pivot (luffs up toward the trench)
  const boomBase = new THREE.Group();
  boomBase.position.set(0, 1.4, 0.5);
  boomBase.rotation.x = 0.722; // angle so the tip sits above the trench centre
  crane.add(boomBase);
  // Telescopic boom: outer + inner segments
  const boomOuter = new THREE.Mesh(new THREE.BoxGeometry(0.48, 3.3, 0.48), exYellow);
  boomOuter.position.set(0, 1.65, 0); boomOuter.castShadow = true; boomBase.add(boomOuter);
  const boomInner = new THREE.Mesh(new THREE.BoxGeometry(0.34, 3.0, 0.34), exYellowDark);
  boomInner.position.set(0, 4.1, 0); boomInner.castShadow = true; boomBase.add(boomInner);
  // Boom-head pulley
  const pulley = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.3, 14), steelMat);
  pulley.rotation.x = Math.PI / 2; pulley.position.set(0, 5.5, 0); boomBase.add(pulley);

  // Luffing hydraulic ram (chassis -> boom underside)
  const ramAnchorA = new THREE.Object3D(); ramAnchorA.position.set(0, 1.0, 1.3); crane.add(ramAnchorA);
  const ramAnchorB = new THREE.Object3D(); ramAnchorB.position.set(0, 2.0, 0); boomBase.add(ramAnchorB);
  const luffRam = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 1, 14), ramMat);
  luffRam.castShadow = true; scene.add(luffRam);

  // Boom tip (hook anchor), cable, hook block
  const boomTip = new THREE.Object3D(); boomTip.position.set(0, 5.5, 0); boomBase.add(boomTip);
  const craneCable = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1, 8),
    new THREE.MeshStandardMaterial({ color: '#0c0c10', roughness: 0.9, metalness: 0.3 }));
  craneCable.castShadow = true; scene.add(craneCable);
  const hookBlock = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.4, 0.3), steelMat);
  hookBlock.castShadow = true; scene.add(hookBlock);
  // Two short slings from the hook block to the pipe lug
  const slingGeo = new THREE.CylinderGeometry(0.035, 0.035, 1, 6);
  const slingMat = new THREE.MeshStandardMaterial({ color: '#222', roughness: 0.8 });
  const slings = [-1, 1].map(() => { const s = new THREE.Mesh(slingGeo, slingMat); s.castShadow = true; scene.add(s); return s; });
  const pipeLug = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.16, 1.2), steelMat);
  pipeLug.castShadow = true; scene.add(pipeLug);

  // Fixed world anchors (boom is static, so compute once)
  const tipWorldPos = new THREE.Vector3();
  const ramAWorld = new THREE.Vector3();
  const ramBWorld = new THREE.Vector3();
  scene.updateMatrixWorld(true);
  ramAnchorA.getWorldPosition(ramAWorld);
  ramAnchorB.getWorldPosition(ramBWorld);
  linkBetween(luffRam, ramAWorld, ramBWorld);
  boomTip.getWorldPosition(tipWorldPos);

  const tmpHookTop = new THREE.Vector3();
  const tmpLugL = new THREE.Vector3();
  const tmpLugR = new THREE.Vector3();
  function updateCrane() {
    // Pipe hangs directly under the boom tip
    liftingPipe.position.x = tipWorldPos.x;
    liftingPipe.position.z = tipWorldPos.z;
    const pipeTopY = liftingPipe.position.y + pipeRadius;
    // Hook block sits just above the pipe
    hookBlock.position.set(tipWorldPos.x, pipeTopY + 0.55, tipWorldPos.z);
    // Main cable: boom tip -> hook block
    tmpHookTop.set(tipWorldPos.x, hookBlock.position.y + 0.2, tipWorldPos.z);
    linkBetween(craneCable, tipWorldPos, tmpHookTop);
    // Slings: hook block -> pipe lug ends
    pipeLug.position.set(tipWorldPos.x, pipeTopY + 0.08, tipWorldPos.z);
    tmpLugL.set(tipWorldPos.x - 0.5, pipeTopY, tipWorldPos.z);
    tmpLugR.set(tipWorldPos.x + 0.5, pipeTopY, tipWorldPos.z);
    linkBetween(slings[0], hookBlock.position, tmpLugL);
    linkBetween(slings[1], hookBlock.position, tmpLugR);
  }
  updateCrane();

  // ===== Tracked excavator (faces -Z, digs into the trench in front) =====
  const excavator = new THREE.Group();
  const EXC_Z = 4.2;
  excavator.position.set(0, 0, EXC_Z);
  scene.add(excavator);

  function buildTrack(zSide) {
    const t = new THREE.Group();
    const len = 4.6, beltH = 0.9;
    const belt = new THREE.Mesh(new THREE.BoxGeometry(len, beltH, 0.85), trackMat);
    belt.castShadow = true; belt.receiveShadow = true; t.add(belt);
    [-1, 1].forEach((e) => {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(beltH / 2, beltH / 2, 0.87, 22), trackMat);
      wheel.rotation.z = Math.PI / 2; wheel.position.x = (e * len) / 2; wheel.castShadow = true; t.add(wheel);
    });
    const pads = 14;
    for (let i = 0; i < pads; i++) {
      const pad = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.12, 0.9), exYellowDark);
      pad.position.set(-len / 2 + 0.25 + (i / (pads - 1)) * (len - 0.5), -beltH / 2 - 0.02, 0);
      pad.castShadow = true; t.add(pad);
    }
    t.position.set(0, 0.5, zSide * 1.0);
    return t;
  }
  excavator.add(buildTrack(-1), buildTrack(1));

  const frame = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.4, 2.6), trackMat);
  frame.position.set(0, 0.8, 0); frame.castShadow = true; excavator.add(frame);
  const slew = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.2, 0.4, 26), steelMat);
  slew.position.set(0, 1.15, 0); slew.castShadow = true; excavator.add(slew);

  // Upperstructure (fixed facing -Z so the dig plane is stable)
  const house = new THREE.Group();
  house.position.set(0, 1.45, 0);
  excavator.add(house);

  const body = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.2, 2.4), exYellow);
  body.position.set(-0.2, 0.6, 0); body.castShadow = true; body.receiveShadow = true; house.add(body);
  const counter = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.5, 2.5), exYellowDark);
  counter.position.set(-1.9, 0.55, 0); counter.castShadow = true; house.add(counter); // heavy rear
  const cab = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.5, 1.25), exYellow);
  cab.position.set(0.85, 1.35, 0.78); cab.castShadow = true; house.add(cab);
  const cabGlass = new THREE.Mesh(new THREE.BoxGeometry(1.35, 1.05, 1.1), glassMat);
  cabGlass.position.set(0.9, 1.5, 0.82); house.add(cabGlass);
  const stack = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.6, 12), trackMat);
  stack.position.set(-1.0, 1.5, -0.7); stack.castShadow = true; house.add(stack);
  const beacon = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.2, 12),
    new THREE.MeshStandardMaterial({ color: '#ff7b00', emissive: '#ff6a00', emissiveIntensity: 1 }));
  beacon.position.set(0.3, 2.2, 0.3); house.add(beacon);

  // --- Digging arm (built pointing +Y from each pivot; rotated about X by IK) ---
  const boomLen = 3.6, stickLen = 2.8, bucketReach = 0.6;
  const armA = boomLen, armB = stickLen + bucketReach; // IK segment lengths

  const boomPivot = new THREE.Group();
  boomPivot.position.set(0, 0.5, -1.5); // front of house (toward trench)
  house.add(boomPivot);
  const boom = new THREE.Mesh(new THREE.BoxGeometry(0.5, boomLen, 0.5), exYellow);
  boom.position.set(0, boomLen / 2, 0); boom.castShadow = true; boomPivot.add(boom);
  const boomRam = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 2.0, 12), ramMat);
  boomRam.position.set(0, boomLen * 0.4, 0.42); boomRam.castShadow = true; boomPivot.add(boomRam);

  const stickPivot = new THREE.Group();
  stickPivot.position.set(0, boomLen, 0);
  boomPivot.add(stickPivot);
  const stick = new THREE.Mesh(new THREE.BoxGeometry(0.4, stickLen, 0.4), exYellow);
  stick.position.set(0, stickLen / 2, 0); stick.castShadow = true; stickPivot.add(stick);
  const stickRam = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 1.7, 12), ramMat);
  stickRam.position.set(0, stickLen * 0.45, 0.34); stickRam.castShadow = true; stickPivot.add(stickRam);

  const bucketPivot = new THREE.Group();
  bucketPivot.position.set(0, stickLen, 0);
  stickPivot.add(bucketPivot);
  const bucket = new THREE.Group();
  const bBack = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.8, 0.16), exYellowDark);
  bBack.position.set(0, 0.4, 0.3); bucket.add(bBack);
  const bBottom = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.16, 0.78), exYellowDark);
  bBottom.position.set(0, 0.05, 0.0); bucket.add(bBottom);
  for (let i = -2; i <= 2; i++) {
    const tooth = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.3, 8), steelMat);
    tooth.position.set(i * 0.19, 0.02, -0.4); tooth.rotation.x = Math.PI / 2; bucket.add(tooth);
  }
  bucket.traverse((m) => { if (m.isMesh) m.castShadow = true; });
  bucketPivot.add(bucket);
  const bucketTip = new THREE.Object3D();
  bucketTip.position.set(0, 0.05, -0.42);
  bucketPivot.add(bucketTip);

  // ===== Gravity dirt clods =====
  const GRAVITY = -17;
  const clodGeo = new THREE.DodecahedronGeometry(0.12, 0);
  const clodMatA = new THREE.MeshStandardMaterial({ color: '#6b4f2c', roughness: 1 });
  const clodMatB = new THREE.MeshStandardMaterial({ color: '#4d371e', roughness: 1 });
  const clods = [];
  const CLOD_COUNT = 80;
  for (let i = 0; i < CLOD_COUNT; i++) {
    const m = new THREE.Mesh(clodGeo, i % 2 ? clodMatA : clodMatB);
    m.castShadow = true; m.visible = false; m.scale.setScalar(0.6 + Math.random() * 0.9);
    scene.add(m);
    clods.push({ mesh: m, vel: new THREE.Vector3(), spin: new THREE.Vector3(), life: 0, active: false });
  }
  let clodCursor = 0;
  function emitClods(origin, n) {
    for (let k = 0; k < n; k++) {
      const c = clods[clodCursor];
      clodCursor = (clodCursor + 1) % CLOD_COUNT;
      c.active = true; c.life = 1.8 + Math.random() * 0.8; c.mesh.visible = true;
      c.mesh.position.copy(origin).add(new THREE.Vector3((Math.random() - 0.5) * 0.5, 0.1, (Math.random() - 0.5) * 0.5));
      c.vel.set((Math.random() - 0.5) * 2.2, 4.5 + Math.random() * 3, 2.2 + Math.random() * 2.2); // toss toward +z spoil pile
      c.spin.set((Math.random() - 0.5) * 9, (Math.random() - 0.5) * 9, (Math.random() - 0.5) * 9);
    }
  }
  function updateClods(dt) {
    for (const c of clods) {
      if (!c.active) continue;
      c.vel.y += GRAVITY * dt;
      c.mesh.position.addScaledVector(c.vel, dt);
      c.mesh.rotation.x += c.spin.x * dt; c.mesh.rotation.y += c.spin.y * dt;
      c.life -= dt;
      const inTrench = Math.abs(c.mesh.position.z) < TRENCH_HALF;
      const floorY = inTrench ? TRENCH_FLOOR_TOP + 0.1 : GROUND_Y + 0.1;
      if (c.mesh.position.y <= floorY) {
        c.mesh.position.y = floorY;
        c.vel.y *= -0.3; c.vel.x *= 0.55; c.vel.z *= 0.55; c.spin.multiplyScalar(0.5);
        if (Math.abs(c.vel.y) < 0.6) c.vel.y = 0;
      }
      if (c.life <= 0) { c.active = false; c.mesh.visible = false; }
    }
  }

  // ===== 2-bone inverse kinematics (in the Z-Y plane, X fixed) =====
  const S = new THREE.Vector3();
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function driveArm(Tz, Ty, curl) {
    boomPivot.getWorldPosition(S);                 // shoulder (Sz, Sy)
    const dz = Tz - S.z, dy = Ty - S.y;
    let d = Math.hypot(dz, dy);
    d = clamp(d, Math.abs(armA - armB) + 0.02, armA + armB - 0.02);
    const base = Math.atan2(dy, dz);
    const cosA = clamp((armA * armA + d * d - armB * armB) / (2 * armA * d), -1, 1);
    const A = Math.acos(cosA);
    const theta1 = base - A;                       // boom direction (z from +z, y up)
    const Ez = S.z + armA * Math.cos(theta1);
    const Ey = S.y + armA * Math.sin(theta1);
    const theta2 = Math.atan2(Ty - Ey, Tz - Ez);   // stick direction
    const boomRot = Math.PI / 2 - theta1;
    const stickWorld = Math.PI / 2 - theta2;
    boomPivot.rotation.x = boomRot;
    stickPivot.rotation.x = stickWorld - boomRot;  // relative
    bucketPivot.rotation.x = curl;                 // relative bucket curl
  }

  // --- Resize + parallax ---
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
  let mx = 0, my = 0;
  window.addEventListener('mousemove', (e) => {
    mx = e.clientX / window.innerWidth - 0.5;
    my = e.clientY / window.innerHeight - 0.5;
  });

  // ===== Animation =====
  const clock = new THREE.Clock();
  const tipWorld = new THREE.Vector3();
  let t = 0;

  // Dig & dump targets (z, y) in the fixed plane
  const DIG = { z: 0.6, y: -1.35 };   // inside the trench, below ground
  const DUMP = { z: 2.3, y: 1.4 };    // up over the spoil pile, near the machine
  let emitted = false;

  function animate() {
    requestAnimationFrame(animate);
    const dt = Math.min(clock.getDelta(), 0.05);
    t += dt;

    // Work cycle 0..1 : 0 = down digging, 1 = up dumping
    const raw = (Math.sin(t * 0.55) + 1) / 2;
    const smooth = raw * raw * (3 - 2 * raw); // smoothstep
    const Tz = DIG.z + (DUMP.z - DIG.z) * smooth;
    const Ty = DIG.y + (DUMP.y - DIG.y) * smooth;
    const curl = 0.4 + (1 - smooth) * 1.2;     // bucket curls when low (scooping)
    driveArm(Tz, Ty, curl);

    // Emit dirt right at the bottom of the dig stroke (gravity throws it out)
    if (smooth < 0.12 && !emitted) {
      bucketTip.getWorldPosition(tipWorld);
      emitClods(tipWorld, 10);
      emitted = true;
    }
    if (smooth > 0.4) emitted = false;
    updateClods(dt);

    beacon.material.emissiveIntensity = 0.6 + Math.abs(Math.sin(t * 4)) * 1.3;

    // The crane lowers the pipe from its hook down onto the trench floor, then lifts it
    const pr = (Math.sin(t * 0.4 - 1.0) + 1) / 2;
    const fall = pr * pr;                       // accelerate down = weighty
    const pipeHighY = 4.0;
    liftingPipe.position.y = Math.max(pipeRestY, pipeHighY - fall * (pipeHighY - pipeRestY));
    liftingPipe.rotation.z = 0;
    updateCrane(); // keep cable + slings + hook attached to the pipe

    excavator.position.y = Math.sin(t * 1.1) * 0.012;

    // Camera gentle orbit + parallax, framed on the dig zone
    const orbit = t * 0.05;
    const baseX = Math.cos(orbit) * 22;
    const baseZ = Math.sin(orbit) * 22;
    camera.position.x += (baseX + mx * 5 - camera.position.x) * 0.02;
    camera.position.z += (baseZ - camera.position.z) * 0.02;
    camera.position.y += (9 - my * 3.5 - camera.position.y) * 0.02;
    camera.lookAt(0, 0.2, 0);

    renderer.render(scene, camera);
  }
  animate();

  window.__sceneReady = true;
}
