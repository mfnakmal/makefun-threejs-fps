// Tactical Map Architecture: a closed tactical CQB training hangar with high/low lanes,
// cover crates, a central sniper pillar, and an elevated bomb defusal site.
// Every box serves as an AABB collider for player movement and a solid bullet-stop surface.
import * as THREE from 'three';
import { PALETTE } from './palette.js';

export function createWorld(scene) {
  const group = new THREE.Group();
  scene.add(group);

  const materials = {};
  for (const name of Object.keys(PALETTE)) {
    materials[name] = new THREE.MeshStandardMaterial({
      color: new THREE.Color(PALETTE[name]),
      roughness: name === 'accent' || name === 'ink' ? 0.55 : 0.92,
      metalness: 0.03,
    });
  }

  const colliders = [];
  const shootables = [];

  function box(width, height, depth, x, y, z, material) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), materials[material]);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    colliders.push(new THREE.Box3().setFromObject(mesh));
    shootables.push(mesh);
    return mesh;
  }

  // A 24 x 24 m room, 4.6 m walls, open to the sky so one directional light reaches every corner.
  box(24.4, 0.4, 24.4, 0, -0.2, 0, 'canvas');
  box(0.4, 4.6, 24.4, -12.2, 2.3, 0, 'surface');
  box(0.4, 4.6, 24.4, 12.2, 2.3, 0, 'surface');
  box(24.4, 4.6, 0.4, 0, 2.3, -12.2, 'surface');
  box(24.4, 4.6, 0.4, 0, 2.3, 12.2, 'surface');

  // Tactical Cover: two lanes split by a pillar, crates to crouch behind, a raised platform at the back.
  box(1.2, 3.2, 1.2, 0, 1.6, -3.4, 'hairline');
  box(3.6, 1.1, 1.2, -4.4, 0.55, -1.2, 'hairline');
  box(1.2, 1.1, 3.6, 4.4, 0.55, -1.2, 'hairline');
  box(1.6, 0.7, 1.6, -7.6, 0.35, -6.2, 'hairline');
  box(1.6, 0.7, 1.6, 7.6, 0.35, -6.2, 'hairline');
  box(2.4, 0.9, 1.2, -2.4, 0.45, 5.4, 'hairline');
  box(2.4, 0.9, 1.2, 2.4, 0.45, 5.4, 'hairline');
  box(6.0, 0.5, 2.4, 0, 0.25, -10.0, 'surface');
  box(0.9, 1.6, 0.9, -10.4, 0.8, 8.4, 'hairline');
  box(0.9, 1.6, 0.9, 10.4, 0.8, 8.4, 'hairline');

  // Tactical Bomb Site and Buy Zone markers
  box(2.0, 0.05, 2.0, 0, 0.52, -10.0, 'accent'); // Bomb Site Alpha
  box(1.0, 0.8, 1.0, -1.8, 0.4, -9.5, 'hairline'); // Defusal cover block A
  box(1.0, 0.8, 1.0, 1.8, 0.4, -9.5, 'hairline'); // Defusal cover block B
  box(3.0, 0.02, 3.0, 0, 0.01, 8.5, 'hairline'); // CT Buy Zone spawn plate

  // Tactical Economy Definition
  const ECONOMY = {
    roundWinBonus: 3250,
    roundLossBonus: 1400,
    consecutiveLossIncrement: 500,
    killRewardRifle: 300,
    bombPlantBonus: 300,
    bombDefuseBonus: 300,
  };

  // High-contrast atmospheric lighting: hemisphere skylight, direct sunlight, and cool fill.
  const sky = new THREE.HemisphereLight(new THREE.Color(PALETTE.surface), new THREE.Color(PALETTE.canvas), 1.1);
  scene.add(sky);

  const key = new THREE.DirectionalLight(new THREE.Color(PALETTE.ink), 2.1);
  key.position.set(9, 14, 7);
  key.target.position.set(0, 0, -3);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.left = -16;
  key.shadow.camera.right = 16;
  key.shadow.camera.top = 16;
  key.shadow.camera.bottom = -16;
  key.shadow.camera.far = 48;
  key.shadow.bias = -0.0006;
  scene.add(key, key.target);

  const fill = new THREE.DirectionalLight(new THREE.Color(PALETTE.muted), 0.55);
  fill.position.set(-8, 9, 10);
  scene.add(fill);

  return { colliders, shootables, group };
}
