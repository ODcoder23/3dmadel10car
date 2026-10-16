// Dev showroom for the HD cars: /showroom.html?car=zephyr&view=hero&ui=0
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { HD_CARS } from './js/hd/index.js';

const q = new URLSearchParams(location.search), $ = id => document.getElementById(id);
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene(); scene.background = new THREE.Color(0x2b3038); scene.fog = new THREE.Fog(0x2b3038, 14, 40);
scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), .04).texture;
scene.environmentIntensity = .75;
const camera = new THREE.PerspectiveCamera(32, innerWidth / innerHeight, .05, 200);
const controls = new OrbitControls(camera, renderer.domElement); controls.target.set(0, .55, 0); controls.enableDamping = true; controls.maxPolarAngle = Math.PI / 2 - .02;
const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(-5, 9, -6); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
Object.assign(key.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: 1, far: 30 }); key.shadow.bias = -.0004; scene.add(key);
scene.add(new THREE.HemisphereLight(0xdfe8ff, 0x30343a, .5));
const floor = new THREE.Mesh(new THREE.CircleGeometry(30, 64), new THREE.MeshPhysicalMaterial({ color: 0x3a3f47, roughness: .32, metalness: .1, clearcoat: .6 }));
floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);

const VIEWS = { hero: [-5.2, 1.9, -5.6], front: [0, .75, -8.5], side: [8.5, .8, 0], rear: [0, 1.4, 8.5], top: [0, 15, .001], three: [5.6, 2.2, 5.2], low: [-3.6, .35, -3.8] };
function setView(v) {
  const p = VIEWS[v] || VIEWS.hero; camera.position.set(...p); controls.target.set(0, v === 'top' ? 0 : .55, 0);
  camera.fov = ['top', 'side', 'front', 'rear'].includes(v) ? 22 : 32; camera.updateProjectionMatrix(); controls.update();
}

let car = null, finish = 'gloss', wire = false, lightsOn = true;
function load(i) {
  if (car) { scene.remove(car.group); car.dispose(); }
  const { spec, build } = HD_CARS[i]; car = build({ detail: q.get('detail') || 'high' }); scene.add(car.group); car.setFinish(finish);
  car.group.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  $('name').textContent = spec.name; $('info').textContent = `${car.group.userData.triangles.toLocaleString()} triangles · ${spec.length} m`;
  document.querySelectorAll('#cars button').forEach((b, k) => b.classList.toggle('on', k === i)); applyWire(); applyLights();
  window.__car = car;
}
function applyWire() { car.group.traverse(o => { if (o.isMesh) o.material.wireframe = wire; }); }
function applyLights() { car.materials.led.emissiveIntensity = lightsOn ? 2.4 : 0; car.materials.drl.emissiveIntensity = lightsOn ? 2.2 : .2; car.materials.tail.emissiveIntensity = lightsOn ? 1.2 : .1; }

$('cars').innerHTML = HD_CARS.map(c => `<button>${c.spec.name}</button>`).join('');
document.querySelectorAll('#cars button').forEach((b, k) => b.onclick = () => load(k));
$('views').innerHTML = Object.keys(VIEWS).map(v => `<button data-v="${v}">${v}</button>`).join('');
document.querySelectorAll('#views button').forEach(b => b.onclick = () => setView(b.dataset.v));
const PAINTS = ['#bfc5cc', '#e8eaec', '#14161a', '#c2271d', '#1f5fd6', '#f2b51c', '#1f8a5b', '#7a3fd0'];
$('paints').innerHTML = PAINTS.map(c => `<button class="sw" style="background:${c}" data-c="${c}"></button>`).join('');
document.querySelectorAll('#paints button').forEach(b => b.onclick = () => car.setPaint(b.dataset.c));
$('finishes').innerHTML = ['gloss', 'metallic', 'matte', 'pearl'].map(f => `<button data-f="${f}">${f}</button>`).join('');
document.querySelectorAll('#finishes button').forEach(b => b.onclick = () => { finish = b.dataset.f; car.setFinish(finish); });
$('spin').onclick = e => { controls.autoRotate = !controls.autoRotate; e.target.classList.toggle('on', controls.autoRotate); };
$('wire').onclick = e => { wire = !wire; applyWire(); e.target.classList.toggle('on', wire); };
$('lights').onclick = e => { lightsOn = !lightsOn; applyLights(); e.target.classList.toggle('on', lightsOn); };
if (q.get('ui') === '0') $('ui').classList.add('hide');

load(Math.max(0, HD_CARS.findIndex(c => c.spec.id === q.get('car')))); setView(q.get('view') || 'hero');
if (q.get('paint')) car.setPaint('#' + q.get('paint'));
addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });
// ?view=sheet: hero, side, front, rear and top in one frame, for comparing against the carimg/ design sheets
const SHEET = [['hero', 0, .38, .62, .62], ['side', 0, 0, .62, .38], ['front', .62, .66, .38, .34], ['rear', .62, .33, .38, .33], ['top', .62, 0, .38, .33]];
const sheetCam = new THREE.PerspectiveCamera(32, 1, .05, 200);
function renderSheet() {
  const W = innerWidth, Hh = innerHeight; renderer.setScissorTest(true);
  for (const [v, x, y, w, h] of SHEET) {
    const p = VIEWS[v]; sheetCam.position.set(...p); sheetCam.fov = v === 'hero' ? 30 : v === 'top' ? 21 : 20; sheetCam.aspect = (w * W) / (h * Hh);
    if (v === 'top') sheetCam.up.set(-1, 0, 0); else sheetCam.up.set(0, 1, 0);
    sheetCam.updateProjectionMatrix(); sheetCam.lookAt(0, v === 'top' ? 0 : .6, 0);
    if (v === 'side' || v === 'top') { sheetCam.position.set(...(v === 'side' ? [10, .75, 0] : [0, 11, .001])); sheetCam.fov = v === 'side' ? 14 : 18; sheetCam.updateProjectionMatrix(); sheetCam.lookAt(0, v === 'side' ? .62 : 0, 0); }
    renderer.setViewport(x * W, y * Hh, w * W, h * Hh); renderer.setScissor(x * W, y * Hh, w * W, h * Hh); renderer.render(scene, sheetCam);
  }
  renderer.setScissorTest(false);
}
const sheet = q.get('view') === 'sheet';
renderer.setAnimationLoop(() => { controls.update(); if (sheet) renderSheet(); else renderer.render(scene, camera); window.__frames = (window.__frames || 0) + 1; });

// ?view=lineup&angle=hero|side|front|rear|top: all cars in a 5×2 grid, to check that no two look alike
if (q.get('view') === 'lineup') {
  scene.remove(car.group);
  const all = HD_CARS.map(({ build }) => { const c = build({ detail: q.get('detail') || 'high' }); c.group.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); scene.add(c.group); return c; });
  const ang = q.get('angle') || 'hero', cam = new THREE.PerspectiveCamera(ang === 'hero' ? 24 : 22, 1, .05, 200);
  renderer.setAnimationLoop(() => {
    const W = innerWidth, Hh = innerHeight, w = W / 5, h = Hh / 2; renderer.setScissorTest(true);
    all.forEach((c, i) => {
      all.forEach((o, k) => { o.group.visible = k === i; });
      cam.position.set(...(ang === 'side' ? [10, .75, 0] : VIEWS[ang]).map((v, k) => k === 1 && ang !== 'top' ? v * 1.3 : v * 1.75)); cam.up.set(ang === 'top' ? -1 : 0, ang === 'top' ? 0 : 1, 0);
      cam.aspect = w / h; cam.updateProjectionMatrix(); cam.lookAt(0, ang === 'top' ? 0 : .6, 0);
      const x = (i % 5) * w, y = (1 - Math.floor(i / 5)) * h; renderer.setViewport(x, y, w, h); renderer.setScissor(x, y, w, h); renderer.render(scene, cam);
    });
    renderer.setScissorTest(false); window.__frames = (window.__frames || 0) + 1;
  });
}
