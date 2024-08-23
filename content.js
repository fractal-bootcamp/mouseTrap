let circle;
let posX = 0;
let posY = 0;

function createCircle() {
  circle = document.createElement('div');
  circle.style.position = 'fixed';
  circle.style.width = '50px';
  circle.style.height = '50px';
  circle.style.borderRadius = '50%';
  circle.style.backgroundColor = 'red';
  circle.style.zIndex = '9999';
  updateCirclePosition();
  document.body.appendChild(circle);
}

function updateCirclePosition() {
  circle.style.left = posX + 'px';
  circle.style.top = posY + 'px';
}

function moveCircle(dx, dy) {
  posX += dx;
  posY += dy;
  updateCirclePosition();
}

document.addEventListener('keydown', function(event) {
  const step = 10;
  switch(event.key) {
    case 'ArrowUp':
      moveCircle(0, -step);
      break;
    case 'ArrowDown':
      moveCircle(0, step);
      break;
    case 'ArrowLeft':
      moveCircle(-step, 0);
      break;
    case 'ArrowRight':
      moveCircle(step, 0);
      break;
  }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "initializeCircle") {
    createCircle();
  }
});