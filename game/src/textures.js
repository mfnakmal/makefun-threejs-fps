// Procedural Canvas Texture Generator for KILNFIRE Engine
// Generates high-fidelity materials completely in-memory with zero network or asset requests.
import * as THREE from 'three';
import { PALETTE } from './palette.js';

export function createProceduralTextures() {
  function createBrickTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = PALETTE.brickDark;
    ctx.fillRect(0, 0, 512, 512);

    const rows = 16;
    const cols = 8;
    const rowH = 512 / rows;
    const colW = 512 / cols;

    for (let r = 0; r < rows; r++) {
      const offsetX = (r % 2) * (colW / 2);
      for (let c = -1; c < cols + 1; c++) {
        const x = c * colW + offsetX;
        const y = r * rowH;

        // Subtle variation in brick tone
        const toneRand = Math.sin(r * 12.9898 + c * 78.233) * 0.5 + 0.5;
        ctx.fillStyle = toneRand > 0.5 ? PALETTE.brickLight : PALETTE.brickDark;
        ctx.fillRect(x + 2, y + 2, colW - 4, rowH - 4);

        // Mortar lines
        ctx.strokeStyle = '#1a1412';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 1, y + 1, colW - 2, rowH - 2);

        // Weathering speckles
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        for (let i = 0; i < 4; i++) {
          const sx = x + 4 + ((i * 17) % (colW - 8));
          const sy = y + 4 + ((i * 23) % (rowH - 8));
          ctx.fillRect(sx, sy, 3, 2);
        }
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  function createFloorTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = PALETTE.concrete;
    ctx.fillRect(0, 0, 512, 512);

    // Grid slabs
    ctx.strokeStyle = '#1e242c';
    ctx.lineWidth = 4;
    const slabSize = 128;
    for (let x = 0; x <= 512; x += slabSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 512);
      ctx.stroke();
    }
    for (let y = 0; y <= 512; y += slabSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y);
      ctx.stroke();
    }

    // Surface grime and noise
    ctx.fillStyle = 'rgba(15, 17, 21, 0.08)';
    for (let i = 0; i < 120; i++) {
      const rx = (i * 37) % 512;
      const ry = (i * 61) % 512;
      ctx.fillRect(rx, ry, (i % 5) * 4 + 2, (i % 3) * 4 + 2);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  function createMetalCrateTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = PALETTE.crateMetal;
    ctx.fillRect(0, 0, 256, 256);

    // Frame border
    ctx.strokeStyle = '#3e4856';
    ctx.lineWidth = 14;
    ctx.strokeRect(7, 7, 242, 242);

    // Diagonal structural cross-brace
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(14, 14);
    ctx.lineTo(242, 242);
    ctx.moveTo(242, 14);
    ctx.lineTo(14, 242);
    ctx.stroke();

    // Rivets
    ctx.fillStyle = '#6c7a8e';
    const corners = [
      [22, 22], [234, 22], [22, 234], [234, 234],
      [128, 22], [128, 234], [22, 128], [234, 128],
    ];
    for (const [cx, cy] of corners) {
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  function createHazardTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#111418';
    ctx.fillRect(0, 0, 256, 256);

    ctx.fillStyle = PALETTE.warningYellow;
    const stripeW = 32;
    for (let x = -256; x < 512; x += stripeW * 2) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + stripeW, 0);
      ctx.lineTo(x + stripeW + 256, 256);
      ctx.lineTo(x + 256, 256);
      ctx.closePath();
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  function createSignTexture(text, bgColor, textColor) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, 256, 128);

    ctx.strokeStyle = textColor;
    ctx.lineWidth = 6;
    ctx.strokeRect(6, 6, 244, 116);

    ctx.fillStyle = textColor;
    ctx.font = 'bold 52px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 128, 64);

    return new THREE.CanvasTexture(canvas);
  }

  return {
    brick: createBrickTexture(),
    floor: createFloorTexture(),
    crate: createMetalCrateTexture(),
    hazard: createHazardTexture(),
    signA: createSignTexture('SITE A', '#064e3b', '#34d399'),
    signB: createSignTexture('SITE B', '#78350f', '#fbbf24'),
  };
}

