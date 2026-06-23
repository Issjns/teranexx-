// ===== Terranex Elite Infraprojects — 3D Hero Scene =====
// A JCB-style backhoe excavator digging a trench and laying pipes underground.
// Uses the global THREE object loaded via js/three.min.js (classic script),
// so the site works even when opened directly from a file (file://).

const canvas = document.getElementById('scene3d');
if (canvas && typeof THREE !== 'undefined') {
  initScene(canvas);
}

function initScene(canvas) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#0a0e14');
  scene.fog = new THREE.Fog('#0a0e14', 22, 60);

  // --- Camera ---
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.set(14, 9, 18);
  camera.lookAt(0, 1, 0);

  // --- Renderer ---
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // --- Lighting ---
  scene.add(new THREE.HemisphereLight('#9fc3ff', '#1b1306', 0.55));

  const sun = new THREE.DirectionalLight('#ffd9a0', 1.5);
  sun.position.set(12, 20, 10);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 60;
  sun.shadow.camera.left = -25;
  sun.shadow.camera.right = 25;
  sun.shadow.camera.top = 25;
  sun.shadow.camera.bottom = -25;
  scene.add(sun);

  const fill = new THREE.PointLight('#ffb000', 0.6, 40);
  fill.position.set(-8, 6, 8);
  scene.add(fill);

  // --- Materials ---
  const groundMat = new THREE.MeshStandardMaterial({ color: '#243140', roughness: 1, metalness: 0 });
  const dirtMat = new THREE.MeshStandardMaterial({ color: '#5a4326', roughness: 1 });
  const dirtDarkMat = new THREE.MeshStandardMaterial({ color: '#3e2f1a', roughness: 1 });
  const jcbYellow = new THREE.MeshStandardMaterial({ color: '#ffb400', roughness: 0.5, metalness: 0.3 });
  const jcbDark = new THREE.MeshStandardMaterial({ color: '#1c1c20', roughness: 0.7, metalness: 0.4 });
  const steelMat = new THREE.MeshStandardMaterial({ color: '#9aa6b2', roughness: 0.4, metalness: 0.7 });
  const glassMat = new THREE.MeshStandardMaterial({ color: '#7fd3ff', roughness: 0.1, metalness: 0.2, transparent: true, opacity: 0.5 });
  const pipeMat = new THREE.MeshStandardMaterial({ color: '#2f6f4f', roughness: 0.6, metalness: 0.2 });
  const pipeInner = new THREE.MeshStandardMaterial({ color: '#14342a', roughness: 0.9, side: THREE.DoubleSide });

  // --- Ground with trench ---
  const ground = new THREE.Group();
  scene.add(ground);

  const trenchWidth = 2.2;
  const fieldDepth = 40;
  const halfGap = trenchWidth / 2;
  // Two ground slabs leaving a trench gap along Z axis
  [-1, 1].forEach((side) => {
    const w = 18;
    const slab = new THREE.Mesh(new THREE.BoxGeometry(w, 1.6, fieldDepth), groundMat);
    slab.position.set(side * (halfGap + w / 2), -0.8, 0);
    slab.receiveShadow = true;
    ground.add(slab);
  });
  // Trench floor
  const trenchFloor = new THREE.Mesh(new THREE.BoxGeometry(trenchWidth, 0.3, fieldDepth), dirtDarkMat);
  trenchFloor.position.set(0, -1.45, 0);
  trenchFloor.receiveShadow = true;
  ground.add(trenchFloor);
  // Trench walls
  [-1, 1].forEach((side) => {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.3, fieldDepth), dirtMat);
    wall.position.set(side * halfGap, -0.95, 0);
    wall.receiveShadow = true;
    ground.add(wall);
  });

  // --- Laid pipes (already placed in the trench) ---
  const pipeRadius = 0.85;
  const pipeLen = 3.2;
  function makePipe() {
    const g = new THREE.Group();
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(pipeRadius, pipeRadius, pipeLen, 32, 1, true), pipeMat);
    tube.rotation.z = Math.PI / 2;
    tube.castShadow = true;
    tube.receiveShadow = true;
    const bore = new THREE.Mesh(new THREE.CylinderGeometry(pipeRadius * 0.78, pipeRadius * 0.78, pipeLen + 0.02, 32, 1, true), pipeInner);
    bore.rotation.z = Math.PI / 2;
    g.add(tube, bore);
    // collar rings
    [-1, 1].forEach((s) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(pipeRadius * 1.02, 0.1, 12, 32), steelMat);
      ring.position.x = s * pipeLen / 2;
      ring.rotation.y = Math.PI / 2;
      g.add(ring);
    });
    return g;
  }

  const laidPipes = new THREE.Group();
  scene.add(laidPipes);
  const startZ = -3;
  for (let i = 0; i < 5; i++) {
    const p = makePipe();
    p.position.set(0, -0.95, startZ + i * (pipeLen + 0.15));
    p.rotation.y = Math.PI / 2; // align pipe length along Z
    laidPipes.add(p);
  }

  // --- Pipe being lowered by the machine (animated) ---
  const liftingPipe = makePipe();
  liftingPipe.rotation.y = Math.PI / 2;
  scene.add(liftingPipe);
  const dropZ = startZ + 5 * (pipeLen + 0.15);

  // --- Dirt piles beside trench ---
  function dirtPile(x, z, s) {
    const pile = new THREE.Mesh(new THREE.ConeGeometry(s, s * 0.7, 7), dirtMat);
    pile.position.set(x, s * 0.35 - 0.05, z);
    pile.rotation.y = Math.random() * Math.PI;
    pile.castShadow = true;
    pile.receiveShadow = true;
    scene.add(pile);
  }
  dirtPile(-2.4, 4, 1.1); dirtPile(2.5, 2, 0.9); dirtPile(-2.7, -2, 0.8); dirtPile(2.8, -5, 1.0);

  // ===== JCB Backhoe Excavator =====
  const jcb = new THREE.Group();
  jcb.position.set(-3.6, 0, dropZ + 2.4);
  jcb.rotation.y = Math.PI * 0.04;
  scene.add(jcb);

  // Wheels
  function wheel(x, z, r) {
    const w = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.5, 20), jcbDark);
    w.rotation.z = Math.PI / 2;
    w.position.set(x, r, z);
    w.castShadow = true;
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.4, r * 0.4, 0.52, 12), steelMat);
    hub.rotation.z = Math.PI / 2;
    hub.position.copy(w.position);
    jcb.add(w, hub);
  }
  wheel(-0.95, 1.0, 0.85);
  wheel(0.95, 1.0, 0.85);
  wheel(-0.95, -1.0, 0.55);
  wheel(0.95, -1.0, 0.55);

  // Chassis
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.8, 3.0), jcbYellow);
  chassis.position.set(0, 1.5, 0);
  chassis.castShadow = true;
  jcb.add(chassis);

  // Cabin
  const cabFrame = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.3, 1.5), jcbYellow);
  cabFrame.position.set(0, 2.65, 0.4);
  cabFrame.castShadow = true;
  jcb.add(cabFrame);
  const glass = new THREE.Mesh(new THREE.BoxGeometry(1.55, 1.0, 1.35), glassMat);
  glass.position.set(0, 2.7, 0.42);
  jcb.add(glass);
  // Roof beacon
  const beacon = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.18, 12), new THREE.MeshStandardMaterial({ color: '#ff7b00', emissive: '#ff6a00', emissiveIntensity: 1 }));
  beacon.position.set(0, 3.45, 0.4);
  jcb.add(beacon);

  // Front loader bucket (decorative, front of machine)
  const loaderArm = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 1.6), steelMat);
  loaderArm.position.set(-0.7, 1.6, 1.6);
  loaderArm.rotation.x = -0.3;
  jcb.add(loaderArm);
  const loaderArm2 = loaderArm.clone(); loaderArm2.position.x = 0.7; jcb.add(loaderArm2);
  const loaderBucket = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.7, 0.7), jcbDark);
  loaderBucket.position.set(0, 1.0, 2.5);
  loaderBucket.rotation.x = 0.4;
  jcb.add(loaderBucket);

  // ===== Backhoe arm (the part that digs / lays pipe) =====
  // Pivot mounted at rear of machine
  const armBase = new THREE.Group();
  armBase.position.set(0, 1.9, -1.4);
  jcb.add(armBase);

  // Boom (first segment) — pivots at armBase origin
  const boomPivot = new THREE.Group();
  armBase.add(boomPivot);
  const boom = new THREE.Mesh(new THREE.BoxGeometry(0.4, 3.4, 0.4), jcbYellow);
  boom.position.set(0, 1.7, 0); // extends up from pivot
  boom.castShadow = true;
  boomPivot.add(boom);

  // Stick / dipper (second segment) — pivots at top of boom
  const stickPivot = new THREE.Group();
  stickPivot.position.set(0, 3.4, 0);
  boomPivot.add(stickPivot);
  const stick = new THREE.Mesh(new THREE.BoxGeometry(0.32, 2.8, 0.32), jcbYellow);
  stick.position.set(0, -1.4, 0); // extends down from its pivot
  stick.castShadow = true;
  stickPivot.add(stick);

  // Hook / coupler at end of stick that carries the pipe
  const hookPivot = new THREE.Group();
  hookPivot.position.set(0, -2.8, 0);
  stickPivot.add(hookPivot);
  const coupler = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.7, 12), steelMat);
  coupler.position.set(0, -0.35, 0);
  hookPivot.add(coupler);
  // Sling cables
  [-0.6, 0.6].forEach((x) => {
    const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.2, 6), jcbDark);
    cable.position.set(x, -1.0, 0);
    cable.rotation.z = -x * 0.4;
    hookPivot.add(cable);
  });

  // Hydraulic cylinders (visual flair)
  const hyd1 = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 2.2, 10), steelMat);
  hyd1.position.set(0.35, 0.9, 0);
  hyd1.rotation.z = -0.25;
  boomPivot.add(hyd1);

  // World position helper for attaching the lifting pipe to the hook
  const hookWorld = new THREE.Vector3();

  // --- Resize ---
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // --- Mouse parallax ---
  const target = { x: 14, y: 9 };
  let mx = 0, my = 0;
  window.addEventListener('mousemove', (e) => {
    mx = (e.clientX / window.innerWidth - 0.5);
    my = (e.clientY / window.innerHeight - 0.5);
  });

  // --- Animation loop ---
  const clock = new THREE.Clock();
  let t = 0;

  function animate() {
    requestAnimationFrame(animate);
    const dt = clock.getDelta();
    t += dt;

    // Work cycle (0..1 repeating): swing out, lower pipe, release, swing back
    const cycle = (Math.sin(t * 0.45) + 1) / 2; // smooth 0..1

    // Backhoe arm motion
    boomPivot.rotation.x = -0.5 - cycle * 0.55;   // boom dips toward trench
    stickPivot.rotation.x = 0.9 - cycle * 0.7;    // stick reaches out
    armBase.rotation.y = Math.sin(t * 0.45) * 0.18; // slight swing

    // Beacon pulse
    beacon.material.emissiveIntensity = 0.6 + Math.abs(Math.sin(t * 4)) * 1.2;

    // Lifting pipe follows the hook, descending into trench, then loops
    hookPivot.getWorldPosition(hookWorld);
    liftingPipe.position.x = hookWorld.x;
    liftingPipe.position.z = hookWorld.z;
    // pipe hangs below the coupler
    liftingPipe.position.y = Math.max(hookWorld.y - 1.6, -0.95);
    liftingPipe.rotation.z = Math.sin(t * 0.45) * 0.04;

    // Idle machine bob
    jcb.position.y = Math.sin(t * 1.2) * 0.015;

    // Camera gentle orbit + parallax
    const orbit = t * 0.06;
    const baseX = Math.cos(orbit) * 22;
    const baseZ = Math.sin(orbit) * 22;
    camera.position.x += (baseX + mx * 4 - camera.position.x) * 0.02;
    camera.position.z += (baseZ - camera.position.z) * 0.02;
    camera.position.y += (9 - my * 3 - camera.position.y) * 0.02;
    camera.lookAt(0, 0.5, 0);

    renderer.render(scene, camera);
  }
  animate();

  // Signal ready (used by preloader)
  window.__sceneReady = true;
}
