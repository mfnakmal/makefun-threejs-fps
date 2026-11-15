// Tactical Input Controller for KILNFIRE: Pointer Lock, Movement & Weapon Interaction
export function createInput(canvasDom) {
  const keys = new Set();
  const mouseButtons = new Set();
  let mouseDeltaX = 0;
  let mouseDeltaY = 0;
  let isPointerLocked = false;

  window.addEventListener('keydown', (e) => {
    keys.add(e.code);
  });

  window.addEventListener('keyup', (e) => {
    keys.delete(e.code);
  });

  window.addEventListener('mousedown', (e) => {
    mouseButtons.add(e.button);
  });

  window.addEventListener('mouseup', (e) => {
    mouseButtons.delete(e.button);
  });

  window.addEventListener('mousemove', (e) => {
    if (document.pointerLockElement === canvasDom) {
      mouseDeltaX += e.movementX;
      mouseDeltaY += e.movementY;
    }
  });

  document.addEventListener('pointerlockchange', () => {
    isPointerLocked = document.pointerLockElement === canvasDom;
  });

  return {
    keys,
    mouseButtons,
    isPointerLocked() {
      return isPointerLocked;
    },
    requestPointerLock() {
      if (document.pointerLockElement !== canvasDom) {
        canvasDom.requestPointerLock?.();
      }
    },
    exitPointerLock() {
      if (document.pointerLockElement === canvasDom) {
        document.exitPointerLock?.();
      }
    },
    flushMouse() {
      const dx = mouseDeltaX;
      const dy = mouseDeltaY;
      mouseDeltaX = 0;
      mouseDeltaY = 0;
      return { dx, dy };
    },
  };
}
