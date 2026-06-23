// ===== Terranex Elite Infraprojects — 3D Hero Scene =====
// A tracked hydraulic excavator (Poclain-style) digging a trench and laying
// pipes underground, with gravity-driven dirt physics and cinematic graphics.
// Uses the global THREE object loaded via js/three.min.js (classic script),
// so the site works even when opened directly from a file (file://).

const canvas = document.getElementById('scene3d');
if (canvas && typeof THREE !== 'undefined') {
  initScene(canvas);
}

function initScene(canvas) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#0a0e14');
  scene.fog = new THREE.FogExp2('#0a0e14', 0.018);

  // --- Camera ---
  const camera = new THREE.PerspectiveCamera(43, window.innerWidth / window.innerHeight, 0.1, 250);
  camera.position.set(16, 10, 20);
  camera.lookAt(0, 1.5, 0);

  // --- Renderer (cinematic) ---
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  if ('outputColorSpace' in renderer) renderer.outputColorSpace = THREE.SRGBColorSpace;

  // --- Lighting rig ---
  scene.add(new THREE.HemisphereLight('#a8c8ff', '#1a1206', 0.6));

  const sun = new THREE.DirectionalLight('#ffe2b0', 2.1);
  sun.position.set(14, 24, 12);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 80;
  sun.shadow.camera.left = -30;
  sun.shadow.camera.right = 30;
  sun.shadow.camera.top = 30;
  sun.shadow.camera.bottom = -30;
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.02;
  scene.add(sun);

  // Warm amber rim + cool fill for depth
  const rim = new THREE.SpotLight('#ff9a2e', 1.4, 60, Math.PI / 5, 0.5, 1.2);
  rim.position.set(-14, 12, -6);
  scene.add(rim);
  const fill = new THREE.PointLight('#3da9fc', 0.5, 50);
  fill.position.set(-10, 5, 12);
  scene.add(fill);

  // ===== Materials =====
  const groundMat = new THREE.MeshStandardMaterial({ color: '#27333f', roughness: 1, metalness: 0 });
  const dirtMat = new THREE.MeshStandardMaterial({ color: '#6b4f2c', roughness: 1 });
  const dirtDarkMat = new THREE.MeshStandardMaterial({ color: '#3e2f1a', roughness: 1 });
  const exYellow = new THREE.MeshStandardMaterial({ color: '#ffb400', roughness: 0.45, metalness: 0.35 });
  const exYellowDark = new THREE.MeshStandardMaterial({ color: '#e09600', roughness: 0.5, metalness: 0.3 });
  const trackMat = new THREE.MeshStandardMaterial({ color: '#15151a', roughness: 0.85, metalness: 0.3 });
  const steelMat = new THREE.MeshStandardMaterial({ color: '#aab4c0', roughness: 0.35, metalness: 0.85 });
  const ramMat = new THREE.MeshStandardMaterial({ color: '#cdd6e0', roughness: 0.2, metalness: 0.95 });
  const glassMat = new THREE.MeshStandardMaterial({ color: '#8fe0ff', roughness: 0.08, metalness: 0.25, transparent: true, opacity: 0.45 });
  const pipeMat = new THREE.MeshStandardMaterial({ color: '#2f6f4f', roughness: 0.55, metalness: 0.25 });
  const pipeInner = new THREE.MeshStandardMaterial({ color: '#12302a', roughness: 0.95, side: THREE.DoubleSide });
  const rockMat = new THREE.MeshStandardMaterial({ color: '#574a3a', roughness: 1 });

  // ===== Ground with trench =====
  const ground = new THREE.Group();
  scene.add(ground);

  const trenchWidth = 2.4;
  const fieldDepth = 50;
  const halfGap = trenchWidth / 2;
  const groundTopY = 0;
  [-1, 1].forEach((side) => {
    const w = 22;
    const slab = new THREE.Mesh(new THREE.BoxGeometry(w, 1.8, fieldDepth), groundMat);
    slab.position.set(side * (halfGap + w / 2), -0.9, 0);
    slab.receiveShadow = true;
    ground.add(slab);
  });
  const trenchFloor = new THREE.Mesh(new THREE.BoxGeometry(trenchWidth, 0.3, fieldDepth), dirtDarkMat);
  trenchFloor.position.set(0, -1.55, 0);
  trenchFloor.receiveShadow = true;
  ground.add(trenchFloor);
  [-1, 1].forEach((side) => {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.4, fieldDepth), dirtMat);
    wall.position.set(side * halfGap, -1.0, 0);
    wall.receiveShadow = true;
    wall.castShadow = true;
    ground.add(wall);
  });

  // Scattered rocks & dirt piles for richness
  function dirtPile(x, z, s) {
    const pile = new THREE.Mesh(new THREE.ConeGeometry(s, s * 0.7, 8), dirtMat);
    pile.position.set(x, s * 0.35 - 0.05, z);
    pile.rotation.y = Math.random() * Math.PI;
    pile.castShadow = true;
    pile.receiveShadow = true;
    ground.add(pile);
  }
  function rock(x, z, s) {
    const r = new THREE.Mesh(new THREE.DodecahedronGeometry(s, 0), rockMat);
    r.position.set(x, s * 0.5, z);
    r.rotation.set(Math.random(), Math.random(), Math.random());
    r.castShadow = true;
    r.receiveShadow = true;
    ground.add(r);
  }
  dirtPile(-3.0, 5, 1.2); dirtPile(3.1, 3, 1.0); dirtPile(-3.4, -3, 0.9); dirtPile(3.4, -6, 1.1);
  rock(-2.2, 7, 0.4); rock(2.4, 6, 0.3); rock(-2.6, -7, 0.45); rock(2.0, -4, 0.35);

  // ===== Pipes =====
  const pipeRadius = 0.9;
  const pipeLen = 3.4;
  function makePipe() {
    const g = new THREE.Group();
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(pipeRadius, pipeRadius, pipeLen, 36, 1, true), pipeMat);
    tube.rotation.z = Math.PI / 2;
    tube.castShadow = true;
    tube.receiveShadow = true;
    const bore = new THREE.Mesh(new THREE.CylinderGeometry(pipeRadius * 0.78, pipeRadius * 0.78, pipeLen + 0.02, 36, 1, true), pipeInner);
    bore.rotation.z = Math.PI / 2;
    g.add(tube, bore);
    [-1, 1].forEach((s) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(pipeRadius * 1.03, 0.11, 14, 36), steelMat);
      ring.position.x = (s * pipeLen) / 2;
      ring.rotation.y = Math.PI / 2;
      ring.castShadow = true;
      g.add(ring);
    });
    return g;
  }

  const laidPipes = new THREE.Group();
  scene.add(laidPipes);
  const startZ = -4;
  for (let i = 0; i < 6; i++) {
    const p = makePipe();
    p.position.set(0, -1.05, startZ + i * (pipeLen + 0.18));
    p.rotation.y = Math.PI / 2;
    laidPipes.add(p);
  }
  const dropZ = startZ + 6 * (pipeLen + 0.18);

  // Pipe currently being lowered (animated with gravity feel)
  const liftingPipe = makePipe();
  liftingPipe.rotation.y = Math.PI / 2;
  scene.add(liftingPipe);

  // ===== Tracked Hydraulic Excavator (Poclain-style) =====
  const excavator = new THREE.Group();
  excavator.position.set(-4.4, 0, dropZ + 3.0);
  excavator.rotation.y = Math.PI * 0.06;
  scene.add(excavator);

  // --- Crawler tracks ---
  function buildTrack(side) {
    const t = new THREE.Group();
    const len = 5.0;
    const beltH = 0.95;
    // main belt (rounded box look via box + end cylinders)
    const belt = new THREE.Mesh(new THREE.BoxGeometry(0.9, beltH, len), trackMat);
    belt.castShadow = true; belt.receiveShadow = true;
    t.add(belt);
    [-1, 1].forEach((e) => {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(beltH / 2, beltH / 2, 0.92, 22), trackMat);
      wheel.rotation.x = Math.PI / 2;
      wheel.position.z = (e * len) / 2;
      wheel.castShadow = true;
      t.add(wheel);
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.96, 12), steelMat);
      hub.rotation.x = Math.PI / 2;
      hub.position.z = (e * len) / 2;
      t.add(hub);
    });
    // track pads (grousers)
    const padCount = 16;
    for (let i = 0; i < padCount; i++) {
      const pad = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.12, 0.22), exYellowDark);
      pad.position.set(0, -beltH / 2 - 0.02, -len / 2 + 0.3 + (i / (padCount - 1)) * (len - 0.6));
      pad.castShadow = true;
      t.add(pad);
    }
    t.position.set(side * 1.35, 0.55, 0);
    return t;
  }
  excavator.add(buildTrack(-1), buildTrack(1));

  // Undercarriage cross-frame
  const frame = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.4, 2.0), trackMat);
  frame.position.set(0, 0.75, 0);
  frame.castShadow = true;
  excavator.add(frame);

  // Slew ring (turntable)
  const slew = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.25, 0.45, 28), steelMat);
  slew.position.set(0, 1.15, 0);
  slew.castShadow = true;
  excavator.add(slew);

  // --- Rotating house (upperstructure) ---
  const house = new THREE.Group();
  house.position.set(0, 1.4, 0);
  excavator.add(house);

  // Main body / engine housing
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.2, 3.4), exYellow);
  body.position.set(0, 0.6, -0.2);
  body.castShadow = true; body.receiveShadow = true;
  house.add(body);

  // Counterweight (heavy rear) — gives the gravity/weight feel
  const counter = new THREE.Mesh(new THREE.BoxGeometry(2.7, 1.5, 0.9), exYellowDark);
  counter.position.set(0, 0.55, -1.9);
  counter.castShadow = true;
  house.add(counter);

  // Cabin
  const cab = new THREE.Mesh(new THREE.BoxGeometry(1.25, 1.5, 1.55), exYellow);
  cab.position.set(0.78, 1.35, 0.85);
  cab.castShadow = true;
  house.add(cab);
  const cabGlass = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.05, 1.35), glassMat);
  cabGlass.position.set(0.82, 1.5, 0.88);
  house.add(cabGlass);

  // Exhaust stack
  const stack = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.6, 12), trackMat);
  stack.position.set(-0.7, 1.5, -1.0);
  stack.castShadow = true;
  house.add(stack);
  // Beacon
  const beacon = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.2, 12),
    new THREE.MeshStandardMaterial({ color: '#ff7b00', emissive: '#ff6a00', emissiveIntensity: 1 }));
  beacon.position.set(0.2, 2.2, 0.3);
  house.add(beacon);

  // ===== Boom -> Stick -> Bucket (the digging arm) =====
  // Boom pivot at front of house
  const boomPivot = new THREE.Group();
  boomPivot.position.set(0.2, 0.5, 1.6);
  house.add(boomPivot);

  // Boom (curved look via two segments)
  const boomLen = 3.6;
  const boom = new THREE.Mesh(new THREE.BoxGeometry(0.55, boomLen, 0.55), exYellow);
  boom.position.set(0, boomLen / 2, 0);
  boom.castShadow = true;
  boomPivot.add(boom);
  // Boom hydraulic ram
  const boomRam = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 2.2, 12), ramMat);
  boomRam.position.set(0.42, 1.0, 0);
  boomRam.rotation.z = -0.28;
  boomPivot.add(boomRam);

  // Stick pivot at top of boom
  const stickPivot = new THREE.Group();
  stickPivot.position.set(0, boomLen, 0);
  boomPivot.add(stickPivot);
  const stickLen = 2.8;
  const stick = new THREE.Mesh(new THREE.BoxGeometry(0.42, stickLen, 0.42), exYellow);
  stick.position.set(0, -stickLen / 2, 0);
  stick.castShadow = true;
  stickPivot.add(stick);
  const stickRam = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.9, 12), ramMat);
  stickRam.position.set(0.34, -0.8, 0);
  stickRam.rotation.z = 0.22;
  stickPivot.add(stickRam);

  // Bucket pivot at end of stick
  const bucketPivot = new THREE.Group();
  bucketPivot.position.set(0, -stickLen, 0);
  stickPivot.add(bucketPivot);
  const bucket = new THREE.Group();
  const bucketBack = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.85, 0.18), exYellowDark);
  bucketBack.position.set(0, -0.4, 0.32);
  bucket.add(bucketBack);
  const bucketBottom = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.18, 0.85), exYellowDark);
  bucketBottom.position.set(0, -0.78, 0.0);
  bucket.add(bucketBottom);
  // Teeth
  for (let i = -2; i <= 2; i++) {
    const tooth = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.32, 8), steelMat);
    tooth.position.set(i * 0.2, -0.82, -0.42);
    tooth.rotation.x = -Math.PI / 2;
    tooth.castShadow = true;
    bucket.add(tooth);
  }
  bucket.traverse((m) => { if (m.isMesh) m.castShadow = true; });
  bucketPivot.add(bucket);

  // Helper to read the bucket tip position in world space
  const bucketTip = new THREE.Object3D();
  bucketTip.position.set(0, -0.85, -0.42);
  bucketPivot.add(bucketTip);
  const tipWorld = new THREE.Vector3();
  const hookWorld = new THREE.Vector3();

  // ===== Gravity particle system (dirt clods) =====
  const GRAVITY = -16;
  const clodGeo = new THREE.DodecahedronGeometry(0.12, 0);
  const clodMatA = new THREE.MeshStandardMaterial({ color: '#6b4f2c', roughness: 1 });
  const clodMatB = new THREE.MeshStandardMaterial({ color: '#523a20', roughness: 1 });
  const clods = [];
  const CLOD_COUNT = 70;
  for (let i = 0; i < CLOD_COUNT; i++) {
    const m = new THREE.Mesh(clodGeo, i % 2 ? clodMatA : clodMatB);
    m.castShadow = true;
    m.visible = false;
    m.scale.setScalar(0.6 + Math.random() * 0.9);
    scene.add(m);
    clods.push({ mesh: m, vel: new THREE.Vector3(), spin: new THREE.Vector3(), life: 0, active: false });
  }
  let clodCursor = 0;
  function emitClods(origin, n) {
    for (let k = 0; k < n; k++) {
      const c = clods[clodCursor];
      clodCursor = (clodCursor + 1) % CLOD_COUNT;
      c.active = true;
      c.life = 1.6 + Math.random() * 0.8;
      c.mesh.visible = true;
      c.mesh.position.copy(origin).add(new THREE.Vector3((Math.random() - 0.5) * 0.6, 0.1, (Math.random() - 0.5) * 0.6));
      // toss up and toward the spoil pile (positive X side)
      c.vel.set(1.5 + Math.random() * 2.5, 4 + Math.random() * 3, (Math.random() - 0.5) * 2.5);
      c.spin.set((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8);
    }
  }
  function updateClods(dt) {
    for (const c of clods) {
      if (!c.active) continue;
      c.vel.y += GRAVITY * dt;
      c.mesh.position.addScaledVector(c.vel, dt);
      c.mesh.rotation.x += c.spin.x * dt;
      c.mesh.rotation.y += c.spin.y * dt;
      c.life -= dt;
      // land on ground or in trench
      const inTrench = Math.abs(c.mesh.position.x) < halfGap;
      const floorY = inTrench ? -1.3 : groundTopY + 0.1;
      if (c.mesh.position.y <= floorY) {
        c.mesh.position.y = floorY;
        c.vel.y *= -0.32;          // small bounce
        c.vel.x *= 0.55;
        c.vel.z *= 0.55;
        c.spin.multiplyScalar(0.5);
        if (Math.abs(c.vel.y) < 0.6) { c.vel.y = 0; }
      }
      if (c.life <= 0) { c.active = false; c.mesh.visible = false; }
    }
  }

  // --- Resize ---
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // --- Mouse parallax ---
  let mx = 0, my = 0;
  window.addEventListener('mousemove', (e) => {
    mx = e.clientX / window.innerWidth - 0.5;
    my = e.clientY / window.innerHeight - 0.5;
  });

  // ===== Animation loop =====
  const clock = new THREE.Clock();
  let t = 0;
  let lastDigPhase = 0;

  function animate() {
    requestAnimationFrame(animate);
    const dt = Math.min(clock.getDelta(), 0.05);
    t += dt;

    // Dig cycle 0..1 (sweep): house swings, arm reaches into trench, lifts, dumps
    const cycle = (Math.sin(t * 0.5) + 1) / 2;

    // House swing toward the trench and back
    house.rotation.y = -0.55 + Math.sin(t * 0.5) * 0.5;

    // Arm articulation
    boomPivot.rotation.x = 0.35 + cycle * 0.55;     // boom lowers as it digs
    stickPivot.rotation.x = -0.6 - cycle * 0.85;    // stick curls in
    bucketPivot.rotation.x = 0.5 + cycle * 1.0;     // bucket scoops

    // Beacon pulse
    beacon.material.emissiveIntensity = 0.6 + Math.abs(Math.sin(t * 4)) * 1.3;

    // Emit dirt when the bucket reaches the bottom of the dig (gravity!)
    bucketTip.getWorldPosition(tipWorld);
    const digging = cycle > 0.82 && lastDigPhase <= 0.82;
    if (digging && tipWorld.y < 0.4) emitClods(tipWorld, 9);
    lastDigPhase = cycle;
    updateClods(dt);

    // Lifting pipe descends into the trench with an easing "weight" then loops
    const pipeT = (Math.sin(t * 0.32 - 1.2) + 1) / 2;     // 0..1
    const eased = pipeT * pipeT;                          // accelerate downward = gravity feel
    liftingPipe.position.set(0, 4.2 - eased * 5.1, dropZ);
    liftingPipe.position.y = Math.max(liftingPipe.position.y, -1.05);
    liftingPipe.rotation.z = Math.sin(t * 0.32) * 0.05;

    // Idle machine bob
    excavator.position.y = Math.sin(t * 1.1) * 0.012;

    // Camera gentle orbit + parallax
    const orbit = t * 0.05;
    const baseX = Math.cos(orbit) * 24;
    const baseZ = Math.sin(orbit) * 24;
    camera.position.x += (baseX + mx * 5 - camera.position.x) * 0.02;
    camera.position.z += (baseZ - camera.position.z) * 0.02;
    camera.position.y += (10 - my * 3.5 - camera.position.y) * 0.02;
    camera.lookAt(0, 1.2, 0);

    renderer.render(scene, camera);
  }
  animate();

  window.__sceneReady = true;
}
