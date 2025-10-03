const cube = document.querySelector(".cube");
const wrap = document.getElementById("cubeWrap");

let rotateX = 20;   // 與 CSS 初始角度一致
let rotateY = 35;
const strength = 270;  // 旋轉靈敏度（越大越敏感）

// 滑鼠拖曳旋轉
let dragging = false, lastX = 0, lastY = 0;

function onPointerDown(e){
  dragging = true;
  lastX = e.clientX ?? e.touches?.[0].clientX;
  lastY = e.clientY ?? e.touches?.[0].clientY;
}
function onPointerMove(e){
  const cx = e.clientX ?? e.touches?.[0].clientX;
  const cy = e.clientY ?? e.touches?.[0].clientY;
  if (dragging) {
    const dx = cx - lastX;
    const dy = cy - lastY;
    // 根據拖曳距離累積角度
    rotateY += dx * 0.4;
    rotateX -= dy * 0.4;
    cube.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    lastX = cx; lastY = cy;
  } else {
    // 非拖曳時也可用「滑鼠移動」帶動
    const rect = wrap.getBoundingClientRect();
    const nx = (cx - rect.left) / rect.width  - 0.5; // -0.5..0.5
    const ny = (cy - rect.top)  / rect.height - 0.5;
    const rx = -(ny) * strength;
    const ry =  (nx) * strength;
    cube.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
  }
}
function onPointerUp(){ dragging = false; }

// 綁定滑鼠與觸控
wrap.addEventListener("pointerdown", onPointerDown);
window.addEventListener("pointermove", onPointerMove, { passive: true });
window.addEventListener("pointerup", onPointerUp);
