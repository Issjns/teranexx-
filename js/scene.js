// ===== Terranex Elite Infraprojects — 3D Hero Scene =====
// Detailed tracked excavator (Poclain-style) with working hydraulic cylinders +
// a Hydra-style mobile crane (outriggers, telescopic boom, hook block) laying
// pipe into a trench. PBR environment reflections, clear-coat paint, dirt
// textures, gravity dirt, and inverse kinematics. Runs from a local file too.

const canvas = document.getElementById('scene3d');
if (canvas && typeof THREE !== 'undefined') {
  try { initScene(canvas); } catch (e) { console.error(e); }
}

function initScene(canvas) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#0a0e14');
  scene.fog = new THREE.FogExp2('#0a0e14', 0.015);

  const camera = new THREE.PerspectiveCamera(44, window.innerWidth / window.innerHeight, 0.1, 400);
  camera.position.set(17, 9.5, 21);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  if ('outputColorSpace' in renderer) renderer.outputColorSpace = THREE.SRGBColorSpace;

  // ===== Procedural PBR environment (gives metal/glass real reflections) =====
  function buildEnvironment() {
    const pmrem = new THREE.PMREMGenerator(renderer);
    const env = new THREE.Scene();
    const room = new THREE.Mesh(new THREE.BoxGeometry(30, 18, 30),
      new THREE.MeshBasicMaterial({ side: THREE.BackSide, color: 0x1c2630 }));
    env.add(room);
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    ceil.position.set(0, 8.8, 0); ceil.rotation.x = Math.PI / 2; env.add(ceil);
    const warm = new THREE.Mesh(new THREE.PlaneGeometry(12, 10), new THREE.MeshBasicMaterial({ color: 0xffcaa0 }));
    warm.position.set(-14.5, 2, 0); warm.rotation.y = Math.PI / 2; env.add(warm);
    const cool = new THREE.Mesh(new THREE.PlaneGeometry(12, 10), new THREE.MeshBasicMaterial({ color: 0x3a6088 }));
    cool.position.set(14.5, 2, 0); cool.rotation.y = -Math.PI / 2; env.add(cool);
    const tex = pmrem.fromScene(env, 0.04).texture;
    pmrem.dispose();
    return tex;
  }
  let envTex = null;
  try { envTex = buildEnvironment(); scene.environment = envTex; } catch (e) { /* ok without env */ }

  // ===== Lights =====
  scene.add(new THREE.HemisphereLight('#a8c8ff', '#241a0c', 0.5));
  const sun = new THREE.DirectionalLight('#ffe2b0', 2.1);
  sun.position.set(18, 28, 16);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.near = 1; sun.shadow.camera.far = 100;
  sun.shadow.camera.left = -30; sun.shadow.camera.right = 30;
  sun.shadow.camera.top = 30; sun.shadow.camera.bottom = -30;
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02;
  scene.add(sun);
  const rim = new THREE.SpotLight('#ff9a2e', 1.4, 80, Math.PI / 5, 0.5, 1.2);
  rim.position.set(-18, 15, -10); scene.add(rim);
  const fill = new THREE.PointLight('#3da9fc', 0.45, 70);
  fill.position.set(-12, 6, 14); scene.add(fill);

  // ===== Texture + material helpers =====
  function noiseTex(baseHex, vary, reps) {
    const c = document.createElement('canvas'); c.width = c.height = 256;
    const x = c.getContext('2d');
    const col = new THREE.Color(baseHex);
    x.fillStyle = `rgb(${col.r * 255 | 0},${col.g * 255 | 0},${col.b * 255 | 0})`;
    x.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 9000; i++) {
      const s = (Math.random() - 0.5) * vary;
      const r = Math.min(255, Math.max(0, col.r * 255 + s * 255));
      const g = Math.min(255, Math.max(0, col.g * 255 + s * 255));
      const b = Math.min(255, Math.max(0, col.b * 255 + s * 255));
      x.fillStyle = `rgba(${r | 0},${g | 0},${b | 0},0.5)`;
      x.fillRect(Math.random() * 256, Math.random() * 256, 2 + Math.random() * 3, 2 + Math.random() * 3);
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(reps, reps);
    if ('colorSpace' in t) t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }
  const paint = (color) => new THREE.MeshPhysicalMaterial({ color, metalness: 0.3, roughness: 0.4, clearcoat: 0.55, clearcoatRoughness: 0.28, envMapIntensity: 1.1 });
  const paintYellow = paint('#ffb400');
  const paintYellowDark = paint('#d99300');
  const steelMat = new THREE.MeshStandardMaterial({ color: '#b3bdc8', metalness: 0.92, roughness: 0.32, envMapIntensity: 1.3 });
  const darkSteel = new THREE.MeshStandardMaterial({ color: '#3a3f47', metalness: 0.85, roughness: 0.45, envMapIntensity: 1.0 });
  const chromeMat = new THREE.MeshStandardMaterial({ color: '#e6ecf2', metalness: 1.0, roughness: 0.12, envMapIntensity: 1.6 });
  const rubberMat = new THREE.MeshStandardMaterial({ color: '#16161b', metalness: 0.1, roughness: 0.9 });
  const glassMat = new THREE.MeshPhysicalMaterial({ color: '#bfeaff', metalness: 0, roughness: 0.06, transparent: true, opacity: 0.32, envMapIntensity: 2.0, clearcoat: 1, clearcoatRoughness: 0.05 });
  const pipeMat = new THREE.MeshStandardMaterial({ color: '#2f6f4f', roughness: 0.5, metalness: 0.3, envMapIntensity: 0.9 });
  const pipeInner = new THREE.MeshStandardMaterial({ color: '#12302a', roughness: 0.95, side: THREE.DoubleSide });
  const rockMat = new THREE.MeshStandardMaterial({ color: '#574a3a', roughness: 1 });
  const grimeMat = new THREE.MeshStandardMaterial({ color: '#4a3a24', roughness: 1, metalness: 0.1 });

  const groundTex = noiseTex('#33424e', 0.18, 60);
  const dirtTex = noiseTex('#6b4f2c', 0.3, 6);
  const dirtDarkTex = noiseTex('#3a2c18', 0.3, 30);
  const groundMat = new THREE.MeshStandardMaterial({ map: groundTex, roughness: 1 });
  const dirtMat = new THREE.MeshStandardMaterial({ map: dirtTex, roughness: 1 });
  const dirtDarkMat = new THREE.MeshStandardMaterial({ map: dirtDarkTex, roughness: 1 });
  const wallMat = new THREE.MeshStandardMaterial({ map: noiseTex('#5a4226', 0.3, 40), roughness: 1 });

  // ===== World layout =====
  const GROUND_Y = 0, TRENCH_HALF = 1.3, TRENCH_FLOOR_TOP = -1.5;
  [1, -1].forEach((side) => {
    const slab = new THREE.Mesh(new THREE.BoxGeometry(260, 1.8, 130), groundMat);
    slab.position.set(0, -0.9, side * (TRENCH_HALF + 65));
    slab.receiveShadow = true; scene.add(slab);
  });
  const trenchFloor = new THREE.Mesh(new THREE.BoxGeometry(260, 0.3, TRENCH_HALF * 2), dirtDarkMat);
  trenchFloor.position.set(0, TRENCH_FLOOR_TOP - 0.15, 0); trenchFloor.receiveShadow = true; scene.add(trenchFloor);
  [1, -1].forEach((side) => {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(260, 1.5, 0.12), wallMat);
    wall.position.set(0, -0.75, side * TRENCH_HALF);
    wall.receiveShadow = true; wall.castShadow = true; scene.add(wall);
  });
  function dirtPile(x, z, s) {
    const p = new THREE.Mesh(new THREE.ConeGeometry(s, s * 0.7, 10), dirtMat);
    p.position.set(x, s * 0.35 - 0.05, z); p.rotation.y = Math.random() * Math.PI;
    p.castShadow = true; p.receiveShadow = true; scene.add(p);
  }
  function rock(x, z, s) {
    const r = new THREE.Mesh(new THREE.DodecahedronGeometry(s, 0), rockMat);
    r.position.set(x, s * 0.5, z); r.rotation.set(Math.random(), Math.random(), Math.random());
    r.castShadow = true; r.receiveShadow = true; scene.add(r);
  }
  dirtPile(0.4, 2.7, 1.3); dirtPile(-1.5, 3.0, 1.0); dirtPile(1.9, 3.1, 0.9);
  dirtPile(-6, -2.5, 1.1); dirtPile(6, -2.7, 1.0);
  rock(2.7, 4.1, 0.4); rock(-3.1, 3.7, 0.35); rock(-8, -3, 0.5); rock(8, 2.9, 0.45);

  // ===== Pipes =====
  const pipeRadius = 0.7, pipeLen = 2.2, pipeRestY = TRENCH_FLOOR_TOP + pipeRadius;
  function makePipe() {
    const g = new THREE.Group();
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(pipeRadius, pipeRadius, pipeLen, 36, 1, true), pipeMat);
    tube.rotation.z = Math.PI / 2; tube.castShadow = true; tube.receiveShadow = true;
    const bore = new THREE.Mesh(new THREE.CylinderGeometry(pipeRadius * 0.8, pipeRadius * 0.8, pipeLen + 0.02, 36, 1, true), pipeInner);
    bore.rotation.z = Math.PI / 2;
    g.add(tube, bore);
    [-1, 1].forEach((s) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(pipeRadius * 1.05, 0.09, 14, 32), steelMat);
      ring.position.x = (s * pipeLen) / 2; ring.rotation.y = Math.PI / 2; ring.castShadow = true; g.add(ring);
    });
    return g;
  }
  const firstLaidX = -2.6, pipeStep = pipeLen + 0.2;
  for (let i = 0; i < 7; i++) {
    const p = makePipe(); p.position.set(firstLaidX - i * pipeStep, pipeRestY, 0); scene.add(p);
  }
  const liftingPipe = makePipe();
  const liftPipeX = 2.6;
  liftingPipe.position.set(liftPipeX, pipeRestY, 0);
  scene.add(liftingPipe);

  // ===== Hydraulic cylinder helper (barrel + chrome rod that telescope) =====
  const UP = new THREE.Vector3(0, 1, 0);
  function linkBetween(mesh, a, b) {
    const dir = new THREE.Vector3().subVectors(b, a);
    const len = dir.length();
    mesh.scale.set(1, Math.max(0.04, len), 1);
    mesh.position.copy(a).add(b).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(UP, dir.normalize());
  }
  const rams = [];          // {barrel, rod, a, b, barrelLen}
  const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _e = new THREE.Vector3(), _d = new THREE.Vector3();
  function makeRam(anchorA, anchorB, barrelLen, barrelR, rodR) {
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(barrelR, barrelR, 1, 14), darkSteel);
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(rodR, rodR, 1, 14), chromeMat);
    barrel.castShadow = true; rod.castShadow = true;
    scene.add(barrel, rod);
    rams.push({ barrel, rod, a: anchorA, b: anchorB, barrelLen });
  }
  function updateRams() {
    for (const r of rams) {
      r.a.getWorldPosition(_a); r.b.getWorldPosition(_b);
      _d.subVectors(_b, _a); const L = _d.length(); _d.normalize();
      const bl = Math.min(r.barrelLen, L * 0.62);
      _e.copy(_a).addScaledVector(_d, bl);
      linkBetween(r.barrel, _a, _e);
      linkBetween(r.rod, _e, _b);
    }
  }
  const anchor = (parent, x, y, z) => { const o = new THREE.Object3D(); o.position.set(x, y, z); parent.add(o); return o; };

  // ===== Tracked excavator =====
  const excavator = new THREE.Group();
  const EXC_Z = 4.4;
  excavator.position.set(0, 0, EXC_Z);
  scene.add(excavator);

  function buildTrack(zSide) {
    const t = new THREE.Group();
    const len = 4.8, beltH = 1.0, w = 0.85;
    // side frame
    const sf = new THREE.Mesh(new THREE.BoxGeometry(len - 0.4, 0.5, w * 0.5), paintYellowDark);
    sf.position.set(0, 0.05, 0); sf.castShadow = true; t.add(sf);
    // belt top & bottom
    const top = new THREE.Mesh(new THREE.BoxGeometry(len - 0.6, 0.22, w), rubberMat);
    top.position.set(0, beltH / 2 - 0.1, 0); top.castShadow = true; t.add(top);
    const bot = new THREE.Mesh(new THREE.BoxGeometry(len - 0.6, 0.22, w), rubberMat);
    bot.position.set(0, -beltH / 2 + 0.1, 0); bot.castShadow = true; bot.receiveShadow = true; t.add(bot);
    // sprocket (front +x) & idler (rear -x)
    [-1, 1].forEach((e) => {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(beltH / 2, beltH / 2, w + 0.04, 24), darkSteel);
      wheel.rotation.z = Math.PI / 2; wheel.position.x = (e * (len - 0.6)) / 2; wheel.castShadow = true; t.add(wheel);
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, w + 0.08, 12), steelMat);
      cap.rotation.z = Math.PI / 2; cap.position.x = wheel.position.x; t.add(cap);
    });
    // road wheels (bottom) & return rollers (top)
    for (let i = 0; i < 4; i++) {
      const rw = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, w + 0.02, 14), steelMat);
      rw.rotation.z = Math.PI / 2;
      rw.position.set(-len / 2 + 1.0 + i * ((len - 2.0) / 3), -beltH / 2 + 0.05, 0);
      t.add(rw);
    }
    for (let i = 0; i < 2; i++) {
      const rr = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, w + 0.02, 12), steelMat);
      rr.rotation.z = Math.PI / 2;
      rr.position.set(-len / 4 + i * (len / 2), beltH / 2 - 0.08, 0);
      t.add(rr);
    }
    // grouser pads around the belt
    const pads = 26;
    for (let i = 0; i < pads; i++) {
      const a = (i / pads) * Math.PI * 2;
      const pad = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.1, w + 0.04), darkSteel);
      // distribute along an oval path
      pad.position.set(Math.cos(a) * (len / 2 - 0.2), Math.sin(a) * (beltH / 2 + 0.02), 0);
      pad.rotation.z = a;
      pad.castShadow = true;
      t.add(pad);
    }
    t.position.set(0, 0.55, zSide * 1.05);
    return t;
  }
  excavator.add(buildTrack(-1), buildTrack(1));

  const carBody = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.45, 2.7), paintYellowDark);
  carBody.position.set(0, 0.85, 0); carBody.castShadow = true; excavator.add(carBody);
  const slew = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.2, 0.38, 28), steelMat);
  slew.position.set(0, 1.12, 0); slew.castShadow = true; excavator.add(slew);

  // Upperstructure (fixed facing -Z)
  const house = new THREE.Group();
  house.position.set(0, 1.42, 0); excavator.add(house);

  const body = new THREE.Mesh(new THREE.BoxGeometry(3.3, 1.15, 2.4), paintYellow);
  body.position.set(-0.15, 0.6, 0); body.castShadow = true; body.receiveShadow = true; house.add(body);
  // engine deck detail
  const deck = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.25, 2.0), paintYellowDark);
  deck.position.set(-0.6, 1.25, 0); house.add(deck);
  const louver = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.7, 1.6), darkSteel);
  louver.position.set(-1.8, 0.6, 0); house.add(louver);
  // curved counterweight (heavy rear)
  const counter = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.25, 1.5, 24, 1, false, -Math.PI / 2, Math.PI), paintYellowDark);
  counter.rotation.x = Math.PI / 2; counter.position.set(-1.95, 0.55, 0); counter.scale.set(1, 0.7, 1); counter.castShadow = true; house.add(counter);
  // Cab with frame mullions + glass
  const cab = new THREE.Mesh(new THREE.BoxGeometry(1.45, 1.5, 1.25), paintYellow);
  cab.position.set(0.9, 1.35, 0.78); cab.castShadow = true; house.add(cab);
  const cabGlassF = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.15, 1.05), glassMat);
  cabGlassF.position.set(1.66, 1.4, 0.8); house.add(cabGlassF);
  const cabGlassS = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.15, 0.06), glassMat);
  cabGlassS.position.set(0.95, 1.4, 1.42); house.add(cabGlassS);
  // handrail
  const rail = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.025, 8, 16, Math.PI), steelMat);
  rail.position.set(-1.0, 1.45, 1.0); rail.rotation.x = Math.PI / 2; house.add(rail);
  // exhaust + beacon + work light
  const stack = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.13, 0.55, 12), darkSteel);
  stack.position.set(-1.1, 1.6, -0.6); stack.castShadow = true; house.add(stack);
  const stackCap = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.08, 12), darkSteel);
  stackCap.position.set(-1.1, 1.9, -0.6); house.add(stackCap);
  const beacon = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.18, 12),
    new THREE.MeshStandardMaterial({ color: '#ff7b00', emissive: '#ff6a00', emissiveIntensity: 1 }));
  beacon.position.set(0.3, 2.2, 0.3); house.add(beacon);
  const workLight = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.16, 0.1),
    new THREE.MeshStandardMaterial({ color: '#fff7e0', emissive: '#fff0c0', emissiveIntensity: 0.8 }));
  workLight.position.set(1.0, 2.0, 0.9); house.add(workLight);

  // --- Arm: boom -> stick -> bucket (IK) with hydraulic cylinders ---
  const boomLen = 3.6, stickLen = 2.8, bucketReach = 0.6;
  const armA = boomLen, armB = stickLen + bucketReach;

  const boomPivot = new THREE.Group();
  boomPivot.position.set(0, 0.5, -1.5); house.add(boomPivot);
  // tapered boom (two beams)
  const boom = new THREE.Mesh(new THREE.BoxGeometry(0.5, boomLen, 0.5), paintYellow);
  boom.position.set(0, boomLen / 2, 0.02); boom.castShadow = true; boomPivot.add(boom);
  const boomKnee = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.5, 0.62), paintYellow);
  boomKnee.position.set(0, boomLen * 0.55, 0.06); boomPivot.add(boomKnee);

  const stickPivot = new THREE.Group();
  stickPivot.position.set(0, boomLen, 0); boomPivot.add(stickPivot);
  const stick = new THREE.Mesh(new THREE.BoxGeometry(0.4, stickLen, 0.4), paintYellow);
  stick.position.set(0, stickLen / 2, 0); stick.castShadow = true; stickPivot.add(stick);

  const bucketPivot = new THREE.Group();
  bucketPivot.position.set(0, stickLen, 0); stickPivot.add(bucketPivot);
  const bucket = new THREE.Group();
  const bBack = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.85, 0.16), paintYellowDark);
  bBack.position.set(0, 0.42, 0.3); bucket.add(bBack);
  // curved bucket bottom
  const bBowl = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.98, 16, 1, false, 0, Math.PI), grimeMat);
  bBowl.rotation.z = Math.PI / 2; bBowl.rotation.y = Math.PI; bBowl.position.set(0, 0.05, 0.0); bucket.add(bBowl);
  for (let i = -2; i <= 2; i++) {
    const tooth = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.32, 8), steelMat);
    tooth.position.set(i * 0.19, 0.0, -0.45); tooth.rotation.x = Math.PI / 2; bucket.add(tooth);
  }
  bucket.traverse((m) => { if (m.isMesh) m.castShadow = true; });
  bucketPivot.add(bucket);
  const bucketTip = anchor(bucketPivot, 0, 0.0, -0.46);

  // Cylinders: boom (x2), stick, bucket
  makeRam(anchor(house, 0.34, 0.15, -0.95), anchor(boomPivot, 0.34, 1.7, 0.42), 1.3, 0.12, 0.075);
  makeRam(anchor(house, -0.34, 0.15, -0.95), anchor(boomPivot, -0.34, 1.7, 0.42), 1.3, 0.12, 0.075);
  makeRam(anchor(boomPivot, 0, 3.0, 0.42), anchor(stickPivot, 0, 0.7, 0.34), 1.4, 0.12, 0.07);
  makeRam(anchor(stickPivot, 0, 1.9, 0.36), anchor(bucketPivot, 0, 0.35, 0.18), 1.1, 0.1, 0.06);

  // ===== Hydra mobile crane =====
  const crane = new THREE.Group();
  crane.position.set(liftPipeX, 0, -4.6); scene.add(crane);
  const crChassis = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.7, 4.6), paintYellow);
  crChassis.position.set(0, 0.95, 0); crChassis.castShadow = true; crane.add(crChassis);
  const crDeck = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.2, 3.6), paintYellowDark);
  crDeck.position.set(0, 1.35, 0); crane.add(crDeck);
  // wheels
  [-1, 1].forEach((sx) => [-1.5, -0.4, 1.5].forEach((sz) => {
    const w = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.42, 22), rubberMat);
    w.rotation.z = Math.PI / 2; w.position.set(sx * 1.1, 0.55, sz); w.castShadow = true; crane.add(w);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.44, 10), steelMat);
    hub.rotation.z = Math.PI / 2; hub.position.copy(w.position); crane.add(hub);
  }));
  // outriggers (deployed)
  [-1, 1].forEach((sx) => [-1, 1].forEach((sz) => {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.18, 0.18), steelMat);
    arm.position.set(sx * 1.4, 0.7, sz * 1.9); crane.add(arm);
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.7, 12), chromeMat);
    leg.position.set(sx * 1.75, 0.35, sz * 1.9); leg.castShadow = true; crane.add(leg);
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.1, 14), darkSteel);
    pad.position.set(sx * 1.75, 0.05, sz * 1.9); pad.castShadow = true; pad.receiveShadow = true; crane.add(pad);
  }));
  // operator cab
  const crCab = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.05, 1.1), paintYellow);
  crCab.position.set(0.55, 1.95, 1.45); crCab.castShadow = true; crane.add(crCab);
  const crGlass = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.75, 0.92), glassMat);
  crGlass.position.set(1.07, 2.02, 1.47); crane.add(crGlass);
  const crBeacon = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.16, 12),
    new THREE.MeshStandardMaterial({ color: '#ff7b00', emissive: '#ff6a00', emissiveIntensity: 1 }));
  crBeacon.position.set(0.55, 2.55, 1.45); crane.add(crBeacon);
  // slewing turntable + boom foot
  const turn = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.9, 0.4, 22), steelMat);
  turn.position.set(0, 1.5, -0.2); crane.add(turn);

  const boomBase = new THREE.Group();
  boomBase.position.set(0, 1.65, 0.4); boomBase.rotation.x = 0.74; crane.add(boomBase);
  // 3-section telescopic boom (nested, decreasing)
  const sec1 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 2.6, 0.5), paintYellow);
  sec1.position.set(0, 1.3, 0); sec1.castShadow = true; boomBase.add(sec1);
  const sec2 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 2.4, 0.4), paintYellowDark);
  sec2.position.set(0, 3.0, 0); sec2.castShadow = true; boomBase.add(sec2);
  const sec3 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 2.2, 0.3), paintYellow);
  sec3.position.set(0, 4.6, 0); sec3.castShadow = true; boomBase.add(sec3);
  // boom-head with sheaves
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.45), darkSteel);
  head.position.set(0, 5.7, 0); head.castShadow = true; boomBase.add(head);
  [-0.12, 0.12].forEach((zz) => {
    const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.1, 16), chromeMat);
    sh.rotation.z = Math.PI / 2; sh.position.set(0, 5.7, zz); boomBase.add(sh);
  });
  // luffing ram (chassis -> boom underside)
  makeRam(anchor(crane, 0, 1.15, 1.5), anchor(boomBase, 0, 2.1, -0.05), 1.6, 0.14, 0.09);

  // Hook hardware: boom tip anchor, 2 cable falls, hook block, hook, slings
  const boomTip = anchor(boomBase, 0, 5.75, 0);
  const cableMat = new THREE.MeshStandardMaterial({ color: '#0c0c10', roughness: 0.9, metalness: 0.4 });
  const fall1 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1, 8), cableMat); fall1.castShadow = true; scene.add(fall1);
  const fall2 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1, 8), cableMat); fall2.castShadow = true; scene.add(fall2);
  const hookBlock = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.5, 0.26), darkSteel); hookBlock.castShadow = true; scene.add(hookBlock);
  const hook = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.05, 10, 18, Math.PI * 1.4), steelMat); hook.castShadow = true; scene.add(hook);
  const slingMat = new THREE.MeshStandardMaterial({ color: '#2a2a2a', roughness: 0.8 });
  const sling1 = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1, 6), slingMat); sling1.castShadow = true; scene.add(sling1);
  const sling2 = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1, 6), slingMat); sling2.castShadow = true; scene.add(sling2);
  const pipeLug = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.16, 1.1), steelMat); pipeLug.castShadow = true; scene.add(pipeLug);

  const tipWorldPos = new THREE.Vector3();
  scene.updateMatrixWorld(true);
  boomTip.getWorldPosition(tipWorldPos);
  const hp = new THREE.Vector3(), lugL = new THREE.Vector3(), lugR = new THREE.Vector3(), t1 = new THREE.Vector3(), t2 = new THREE.Vector3();
  function updateCrane() {
    liftingPipe.position.x = tipWorldPos.x; liftingPipe.position.z = tipWorldPos.z;
    const pipeTopY = liftingPipe.position.y + pipeRadius;
    hookBlock.position.set(tipWorldPos.x, pipeTopY + 0.6, tipWorldPos.z);
    hook.position.set(tipWorldPos.x, pipeTopY + 0.35, tipWorldPos.z); hook.rotation.x = Math.PI / 2;
    hp.copy(hookBlock.position).setY(hookBlock.position.y + 0.25);
    t1.set(tipWorldPos.x, tipWorldPos.y, tipWorldPos.z - 0.12);
    t2.set(tipWorldPos.x, tipWorldPos.y, tipWorldPos.z + 0.12);
    linkBetween(fall1, t1, hp.clone().setZ(hp.z - 0.06));
    linkBetween(fall2, t2, hp.clone().setZ(hp.z + 0.06));
    pipeLug.position.set(tipWorldPos.x, pipeTopY + 0.08, tipWorldPos.z);
    lugL.set(tipWorldPos.x - 0.45, pipeTopY, tipWorldPos.z);
    lugR.set(tipWorldPos.x + 0.45, pipeTopY, tipWorldPos.z);
    linkBetween(sling1, hookBlock.position, lugL);
    linkBetween(sling2, hookBlock.position, lugR);
  }

  // ===== Gravity dirt clods =====
  const GRAVITY = -17;
  const clodGeo = new THREE.DodecahedronGeometry(0.12, 0);
  const clods = [];
  const CLOD_COUNT = 80;
  for (let i = 0; i < CLOD_COUNT; i++) {
    const m = new THREE.Mesh(clodGeo, i % 2 ? dirtMat : grimeMat);
    m.castShadow = true; m.visible = false; m.scale.setScalar(0.6 + Math.random() * 0.9);
    scene.add(m);
    clods.push({ mesh: m, vel: new THREE.Vector3(), spin: new THREE.Vector3(), life: 0, active: false });
  }
  let clodCursor = 0;
  function emitClods(origin, n) {
    for (let k = 0; k < n; k++) {
      const c = clods[clodCursor]; clodCursor = (clodCursor + 1) % CLOD_COUNT;
      c.active = true; c.life = 1.8 + Math.random() * 0.8; c.mesh.visible = true;
      c.mesh.position.copy(origin).add(new THREE.Vector3((Math.random() - 0.5) * 0.5, 0.1, (Math.random() - 0.5) * 0.5));
      c.vel.set((Math.random() - 0.5) * 2.2, 4.5 + Math.random() * 3, 2.2 + Math.random() * 2.2);
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

  // ===== 2-bone inverse kinematics for the excavator arm =====
  const S = new THREE.Vector3();
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  function driveArm(Tz, Ty, curl) {
    boomPivot.getWorldPosition(S);
    const dz = Tz - S.z, dy = Ty - S.y;
    let d = clamp(Math.hypot(dz, dy), Math.abs(armA - armB) + 0.02, armA + armB - 0.02);
    const base = Math.atan2(dy, dz);
    const cosA = clamp((armA * armA + d * d - armB * armB) / (2 * armA * d), -1, 1);
    const A = Math.acos(cosA);
    const theta1 = base - A;
    const Ez = S.z + armA * Math.cos(theta1), Ey = S.y + armA * Math.sin(theta1);
    const theta2 = Math.atan2(Ty - Ey, Tz - Ez);
    boomPivot.rotation.x = Math.PI / 2 - theta1;
    stickPivot.rotation.x = (Math.PI / 2 - theta2) - boomPivot.rotation.x;
    bucketPivot.rotation.x = curl;
  }

  // --- Resize + parallax ---
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
  let mx = 0, my = 0;
  window.addEventListener('mousemove', (e) => { mx = e.clientX / window.innerWidth - 0.5; my = e.clientY / window.innerHeight - 0.5; });

  // ===== Animation =====
  const clock = new THREE.Clock();
  const tipWorld = new THREE.Vector3();
  let t = 0, emitted = false;
  const DIG = { z: 0.6, y: -1.35 }, DUMP = { z: 2.3, y: 1.4 };

  function animate() {
    requestAnimationFrame(animate);
    const dt = Math.min(clock.getDelta(), 0.05);
    t += dt;

    const raw = (Math.sin(t * 0.55) + 1) / 2;
    const smooth = raw * raw * (3 - 2 * raw);
    driveArm(DIG.z + (DUMP.z - DIG.z) * smooth, DIG.y + (DUMP.y - DIG.y) * smooth, 0.4 + (1 - smooth) * 1.2);

    if (smooth < 0.12 && !emitted) { bucketTip.getWorldPosition(tipWorld); emitClods(tipWorld, 10); emitted = true; }
    if (smooth > 0.4) emitted = false;
    updateClods(dt);
    updateRams();

    beacon.material.emissiveIntensity = 0.6 + Math.abs(Math.sin(t * 4)) * 1.3;
    crBeacon.material.emissiveIntensity = 0.6 + Math.abs(Math.sin(t * 4 + 1)) * 1.3;

    const pr = (Math.sin(t * 0.4 - 1.0) + 1) / 2;
    const fall = pr * pr;
    const pipeHighY = 4.0;
    liftingPipe.position.y = Math.max(pipeRestY, pipeHighY - fall * (pipeHighY - pipeRestY));
    liftingPipe.rotation.z = 0;
    updateCrane();

    excavator.position.y = Math.sin(t * 1.1) * 0.012;

    const orbit = t * 0.05;
    camera.position.x += (Math.cos(orbit) * 23 + mx * 5 - camera.position.x) * 0.02;
    camera.position.z += (Math.sin(orbit) * 23 - camera.position.z) * 0.02;
    camera.position.y += (9.5 - my * 3.5 - camera.position.y) * 0.02;
    camera.lookAt(0, 0.4, 0);

    renderer.render(scene, camera);
  }
  animate();
  window.__sceneReady = true;
}
