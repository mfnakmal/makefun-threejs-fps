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

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  function createFloorTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Sandstone cobblestone paving
    ctx.fillStyle = PALETTE.concrete;
    ctx.fillRect(0, 0, 512, 512);

    const tileSize = 64;
    for (let x = 0; x < 512; x += tileSize) {
      for (let y = 0; y < 512; y += tileSize) {
        const noise = Math.sin(x * 0.05) * Math.cos(y * 0.05);
        ctx.fillStyle = noise > 0 ? PALETTE.concrete : PALETTE.concreteDark;
        ctx.fillRect(x + 2, y + 2, tileSize - 4, tileSize - 4);

        // Seams
        ctx.strokeStyle = '#2d3748';
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, tileSize, tileSize);

        // Cobble flecks
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.fillRect(x + 8, y + 8, tileSize - 16, tileSize - 16);
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  function createMetalCrateTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = PALETTE.crateWood;
    ctx.fillRect(0, 0, 256, 256);

    // Cross brace frame
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 14;
    ctx.strokeRect(7, 7, 242, 242);

    // Diagonal braces
    ctx.beginPath();
    ctx.moveTo(14, 14);
    ctx.lineTo(242, 242);
    ctx.moveTo(242, 14);
    ctx.lineTo(14, 242);
    ctx.stroke();

    // Rivets
    ctx.fillStyle = '#1e293b';
    const rivets = [20, 128, 236];
    for (const rx of rivets) {
      for (const ry of rivets) {
        ctx.beginPath();
        ctx.arc(rx, ry, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  function createHazardTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, 256, 256);

    ctx.fillStyle = PALETTE.warningYellow;
    const stripeW = 32;
    for (let i = -256; i < 512; i += stripeW * 2) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + stripeW, 0);
      ctx.lineTo(i + stripeW + 256, 256);
      ctx.lineTo(i + 256, 256);
      ctx.closePath();
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  function createSignTexture(text, subtitle, bgColor, textColor) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#181a1f';
    ctx.fillRect(0, 0, 512, 256);

    ctx.strokeStyle = textColor;
    ctx.lineWidth = 10;
    ctx.strokeRect(10, 10, 492, 236);

    ctx.fillStyle = bgColor;
    ctx.fillRect(20, 20, 472, 216);

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(subtitle, 256, 75);

    ctx.fillStyle = textColor;
    ctx.font = '900 68px monospace';
    ctx.fillText(text, 256, 155);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  function createSkyTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Warm Mediterranean sunset dusk sky gradient
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0.0, '#36151e'); // Deep dusk zenith
    grad.addColorStop(0.3, '#78281f'); // Crimson mid sky
    grad.addColorStop(0.65, '#c24b23'); // Warm sunset terracotta
    grad.addColorStop(0.85, '#e67e22'); // Amber lower atmosphere
    grad.addColorStop(1.0, '#f39c12'); // Glowing golden horizon
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // Subtle sun flare glow on horizon
    const sunGrad = ctx.createRadialGradient(256, 420, 10, 256, 420, 160);
    sunGrad.addColorStop(0, 'rgba(255, 235, 180, 0.45)');
    sunGrad.addColorStop(1, 'rgba(255, 140, 40, 0.0)');
    ctx.fillStyle = sunGrad;
    ctx.fillRect(0, 260, 512, 252);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  function createContainerTexture(mainColor, stencilText) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = mainColor;
    ctx.fillRect(0, 0, 512, 256);

    // Corrugated vertical ridges
    for (let x = 0; x < 512; x += 32) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.fillRect(x, 0, 8, 256);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.fillRect(x + 8, 0, 8, 256);
    }

    // Heavy steel border
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 12;
    ctx.strokeRect(6, 6, 500, 244);

    // Stencil marking
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(stencilText, 256, 138);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  function createTilesTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Teal/cyan tactical grid tiles (like Top 1 Site B)
    ctx.fillStyle = '#0f3a36';
    ctx.fillRect(0, 0, 256, 256);

    const step = 32;
    for (let x = 0; x < 256; x += step) {
      for (let y = 0; y < 256; y += step) {
        ctx.fillStyle = '#0d5c54';
        ctx.fillRect(x + 2, y + 2, step - 4, step - 4);
        ctx.strokeStyle = '#14b8a6';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 1, y + 1, step - 2, step - 2);
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  return {
    brick: createBrickTexture(),
    floor: createFloorTexture(),
    crate: createMetalCrateTexture(),
    hazard: createHazardTexture(),
    sky: createSkyTexture(),
    containerGreen: createContainerTexture('#1e463a', 'KILN-SITE A'),
    containerTeal: createContainerTexture('#1e3a4c', 'DEPOT-09'),
    tiles: createTilesTexture(),
    signA: createSignTexture('SITE A', 'KILN HALL', '#14532d', '#4ade80'),
    signB: createSignTexture('SITE B', 'GLAZE COURT', '#713f12', '#facc15'),
  };
}
