// ====== 三維場景 ======
const stage = document.getElementById("stage");
const info = document.getElementById("info");

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  55,
  stage.clientWidth / stage.clientHeight,
  0.1,
  100
);
camera.position.set(6, 6, 6);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(stage.clientWidth, stage.clientHeight);
stage.appendChild(renderer.domElement);

// 光
scene.add(new THREE.AmbientLight(0xffffff, 0.85));
const dir = new THREE.DirectionalLight(0xffffff, 0.7);
dir.position.set(5, 7, 6);
scene.add(dir);

// 3×3×3 群組
const group = new THREE.Group();
scene.add(group);

const cubeSize = 0.95;
const gap = 1.02;
const geo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);

function colorFor(x, y, z) {
  // 白底用亮色系
  const palette = [
    0xff6666, 0xffa94d, 0xffe166,
    0x8bd17c, 0x57d4d4, 0x6ea8ff,
    0xb190ff, 0xff84c1, 0xffffff
  ];
  const idx = (x + 1) * 9 + (y + 1) * 3 + (z + 1);
  return palette[(idx + (x !== 0) + (y !== 0) + (z !== 0)) % palette.length];
}

let id = 1;
for (let x = -1; x <= 1; x++) {
  for (let y = -1; y <= 1; y++) {
    for (let z = -1; z <= 1; z++) {
      const mat = new THREE.MeshStandardMaterial({
        color: colorFor(x, y, z),
        roughness: 0.4,
        metalness: 0.0
      });
      const cube = new THREE.Mesh(geo, mat);
      cube.position.set(x * gap, y * gap, z * gap);
      cube.userData = { id: id++, grid: { x, y, z } };
      group.add(cube);
    }
  }
}
group.rotation.set(0.4, 0.6, 0);

// ====== 手勢滑動旋轉（pointer drag） ======
let dragging = false, lastX = 0, lastY = 0;
let rotX = group.rotation.x * 180 / Math.PI;
let rotY = group.rotation.y * 180 / Math.PI;
const DRAG_SENSITIVITY = 0.4;

function getXY(e){
  if (e.touches && e.touches[0]) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
  return { x: e.clientX, y: e.clientY };
}
function onPointerDown(e){
  const p = getXY(e);
  dragging = true; lastX = p.x; lastY = p.y;
}
function onPointerMove(e){
  if(!dragging) return;
  const p = getXY(e);
  const dx = p.x - lastX, dy = p.y - lastY;
  rotY += dx * DRAG_SENSITIVITY;
  rotX -= dy * DRAG_SENSITIVITY;
  group.rotation.y = THREE.MathUtils.degToRad(rotY);
  group.rotation.x = THREE.MathUtils.degToRad(rotX);
  lastX = p.x; lastY = p.y;
}
function onPointerUp(){ dragging = false; }

stage.addEventListener("pointerdown", onPointerDown);
window.addEventListener("pointermove", onPointerMove, { passive: true });
window.addEventListener("pointerup", onPointerUp);

// 滾輪縮放（可選）
stage.addEventListener("wheel", (e) => {
  e.preventDefault();
  const delta = Math.sign(e.deltaY);
  camera.position.multiplyScalar(1 + delta * 0.08);
}, { passive: false });

// ====== 點選小方塊 → 左側顯示文字 ======
const ray = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let downPos = null;

function setPointer(e) {
  const rect = renderer.domElement.getBoundingClientRect();
  const p = getXY(e);
  pointer.x = ((p.x - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((p.y - rect.top) / rect.height) * 2 + 1;
}
stage.addEventListener("pointerdown", (e) => {
  const p = getXY(e);
  downPos = { x: p.x, y: p.y, t: performance.now() };
});
stage.addEventListener("pointerup", (e) => {
  if (!downPos) return;
  const p = getXY(e);
  const moved = Math.hypot(p.x - downPos.x, p.y - downPos.y);
  const elapsed = performance.now() - downPos.t;
  if (moved <= 6 && elapsed < 500) {
    setPointer(e);
    ray.setFromCamera(pointer, camera);
    const hit = ray.intersectObjects(group.children, false)[0];
    if (hit) {
      const { id, grid } = hit.object.userData;
      const hex = "#" + hit.object.material.color.getHexString().toUpperCase();
      info.textContent = `你選取了 Cubie #${id}，座標 (${grid.x}, ${grid.y}, ${grid.z})，顏色 ${hex}`;
    }
  }
  downPos = null;
});

// ====== 自適應 ======
function onResize() {
  const w = stage.clientWidth, h = stage.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}
window.addEventListener("resize", onResize);
onResize();

// 迴圈
(function tick(){
  requestAnimationFrame(tick);
  renderer.render(scene, camera);
})();
