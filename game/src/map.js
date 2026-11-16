// 3-Lane Industrial Foundry Map for KILNFIRE Engine
// Features Mediterranean Sunset Sky Dome, Site A (Kiln Hall), Site B (Glaze Court),
// Mid Courtyard, shipping containers, procedural materials, and AI navigation nodes.
import * as THREE from 'three';
import { PALETTE } from './palette.js';

export function createMap(scene, textures) {
  const group = new THREE.Group();
  scene.add(group);

  const colliders = [];
  const shootables = [];

  // Materials with procedural textures
  const brickMat = new THREE.MeshStandardMaterial({
    map: textures.brick,
    roughness: 0.85,
    metalness: 0.05,
  });
  textures.brick.repeat.set(6, 2);

  const floorMat = new THREE.MeshStandardMaterial({
    map: textures.floor,
    roughness: 0.75,
    metalness: 0.15,
  });
  textures.floor.repeat.set(16, 16);

  const crateMat = new THREE.MeshStandardMaterial({
    map: textures.crate,
    roughness: 0.5,
    metalness: 0.4,
  });

  const hazardMat = new THREE.MeshStandardMaterial({
    map: textures.hazard,
    roughness: 0.6,
    metalness: 0.2,
  });
  textures.hazard.repeat.set(3, 3);

  const tilesMat = new THREE.MeshStandardMaterial({
    map: textures.tiles,
    roughness: 0.6,
    metalness: 0.15,
  });
  textures.tiles.repeat.set(3, 3);

  const containerGreenMat = new THREE.MeshStandardMaterial({
    map: textures.containerGreen,
    roughness: 0.55,
    metalness: 0.45,
  });

  const containerTealMat = new THREE.MeshStandardMaterial({
    map: textures.containerTeal,
    roughness: 0.55,
    metalness: 0.45,
  });

  const steelMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(PALETTE.hairline),
    roughness: 0.45,
    metalness: 0.7,
  });

  const darkMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(PALETTE.surface),
    roughness: 0.9,
    metalness: 0.1,
  });

  const foliageMat = new THREE.MeshStandardMaterial({
    color: 0x225522,
    roughness: 0.9,
    metalness: 0.05,
  });

  function addBox(w, h, d, x, y, z, material, addsCollider = true) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    mesh.position.set(x, y + h / 2, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    if (addsCollider) {
      colliders.push(new THREE.Box3().setFromObject(mesh));
      shootables.push(mesh);
    }
    return mesh;
  }

  // 0. Mediterranean Sunset Sky Dome
  const skyDome = new THREE.Mesh(
    new THREE.SphereGeometry(95, 24, 16),
    new THREE.MeshBasicMaterial({ map: textures.sky, side: THREE.BackSide }),
  );
  skyDome.position.set(0, 0, 0);
  scene.add(skyDome);

  // Background Chimneys & Industrial Silhouettes
  const chimneyMat = new THREE.MeshBasicMaterial({ color: 0x1f1418 });
  const c1 = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.8, 28, 12), chimneyMat);
  c1.position.set(28, 10, -32);
  const c2 = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.4, 22, 12), chimneyMat);
  c2.position.set(36, 8, -26);
  const c3 = new THREE.Mesh(new THREE.BoxGeometry(14, 16, 8), chimneyMat);
  c3.position.set(-32, 6, -34);
  scene.add(c1, c2, c3);

  // 1. Floor Pavement
  addBox(64, 0.4, 52, 0, -0.4, 0, floorMat);

  // 2. Perimeter Boundary Walls (Height 4.6m so sunset sky is open and visible)
  addBox(64, 4.6, 0.8, 0, 0, -24, brickMat); // North Wall
  addBox(64, 4.6, 0.8, 0, 0, 24, brickMat);  // South Wall
  addBox(0.8, 4.6, 48, -30, 0, 0, brickMat); // West Wall
  addBox(0.8, 4.6, 48, 30, 0, 0, brickMat);  // East Wall

  // 3. Central Dividers & 3-Lane Architecture
  // West Lane Wall (Mid to B Alley)
  addBox(0.8, 4.2, 14, -8, 0, -10, brickMat);
  addBox(0.8, 4.2, 14, -8, 0, 10, brickMat);
  // East Lane Wall (Mid to A Long)
  addBox(0.8, 4.2, 14, 8, 0, -10, brickMat);
  addBox(0.8, 4.2, 14, 8, 0, 10, brickMat);

  // Overhead Steel Trusses
  addBox(64, 0.5, 0.5, 0, 5.2, 0, steelMat, false);
  addBox(64, 0.5, 0.5, 0, 5.2, -10, steelMat, false);
  addBox(64, 0.5, 0.5, 0, 5.2, 10, steelMat, false);

  // 4. SITE A (East foundry yard, x = +17, z = 0)
  // Raised platform
  addBox(9.0, 0.5, 9.0, 17, 0, 0, steelMat);
  // Planting Zone (Hazard border)
  addBox(5.0, 0.05, 5.0, 17, 0.5, 0, hazardMat, false);
  // Green Shipping Container
  addBox(6.0, 2.6, 2.4, 23, 0, -3, containerGreenMat);
  // Cover crates at Site A
  addBox(1.6, 1.6, 1.6, 14, 0.5, -2, crateMat);
  addBox(1.6, 1.6, 1.6, 19, 0.5, 2, crateMat);
  addBox(2.2, 1.2, 1.2, 22, 0, 5, crateMat);
  // Planters with green shrubs
  addBox(3.0, 0.7, 1.0, 12, 0, 4, darkMat);
  addBox(2.8, 0.6, 0.8, 12, 0.7, 4, foliageMat, false);

  // Sign A (KILN HALL SITE A)
  const signAMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2.4, 1.2),
    new THREE.MeshBasicMaterial({ map: textures.signA, side: THREE.DoubleSide }),
  );
  signAMesh.position.set(8.5, 2.8, -3.0);
  signAMesh.rotation.y = Math.PI / 2;
  group.add(signAMesh);

  // 5. SITE B (West industrial hangar, x = -17, z = 0)
  // Checkered Tile foundation
  addBox(9.5, 0.4, 9.5, -17, 0, 0, tilesMat);
  // Planting Zone (Hazard border)
  addBox(5.0, 0.05, 5.0, -17, 0.4, 0, hazardMat, false);
  // Teal Shipping Container
  addBox(6.0, 2.6, 2.4, -23, 0, -3, containerTealMat);
  // Crates at Site B
  addBox(1.8, 1.8, 1.8, -14, 0.4, -2.5, crateMat);
  addBox(1.8, 1.8, 1.8, -19, 0.4, 2.5, crateMat);
  addBox(1.5, 1.2, 2.5, -24, 0, 5, crateMat);
  // Planters at B
  addBox(3.0, 0.7, 1.0, -12, 0, 4, darkMat);
  addBox(2.8, 0.6, 0.8, -12, 0.7, 4, foliageMat, false);

  // Sign B (GLAZE COURT SITE B)
  const signBMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2.4, 1.2),
    new THREE.MeshBasicMaterial({ map: textures.signB, side: THREE.DoubleSide }),
  );
  signBMesh.position.set(-8.5, 2.8, 3.0);
  signBMesh.rotation.y = -Math.PI / 2;
  group.add(signBMesh);

  // 6. MID COURTYARD (Center plaza, x = 0, z = 0)
  // Central generator monolith
  addBox(2.6, 3.4, 2.6, 0, 0, 0, steelMat);
  // Mid trench barricades & crates
  addBox(3.2, 1.2, 0.8, -3.5, 0, -4.5, crateMat);
  addBox(3.2, 1.2, 0.8, 3.5, 0, 4.5, crateMat);

  // 7. CT SPAWN (North, z = -17)
  addBox(8.0, 0.05, 4.0, 0, 0.01, -17, new THREE.MeshBasicMaterial({ color: PALETTE.ctBlue, transparent: true, opacity: 0.35 }), false);
  addBox(2.2, 1.4, 1.0, -5, 0, -18, crateMat);
  addBox(2.2, 1.4, 1.0, 5, 0, -18, crateMat);

  // 8. T SPAWN (South, z = +17)
  addBox(8.0, 0.05, 4.0, 0, 0.01, 17, new THREE.MeshBasicMaterial({ color: PALETTE.tRust, transparent: true, opacity: 0.35 }), false);

  // Lighting: Sunset Mediterranean atmospheric illumination
  const ambient = new THREE.HemisphereLight(0xe67e22, 0x3d2817, 1.1);
  scene.add(ambient);

  const sun = new THREE.DirectionalLight(0xffeedd, 2.2);
  sun.position.set(22, 28, -16);
  sun.target.position.set(0, 0, 0);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -32;
  sun.shadow.camera.right = 32;
  sun.shadow.camera.top = 28;
  sun.shadow.camera.bottom = -28;
  sun.shadow.camera.far = 70;
  sun.shadow.bias = -0.0003;
  scene.add(sun, sun.target);

  // Beacon Lights
  const lightA = new THREE.PointLight(new THREE.Color(PALETTE.siteA), 1.8, 16);
  lightA.position.set(17, 3.5, 0);
  scene.add(lightA);

  const lightB = new THREE.PointLight(new THREE.Color(PALETTE.siteB), 1.8, 16);
  lightB.position.set(-17, 3.5, 0);
  scene.add(lightB);

  // Tactical Site Zones
  const siteZones = {
    A: { center: new THREE.Vector3(17, 0.5, 0), radius: 3.5 },
    B: { center: new THREE.Vector3(-17, 0.4, 0), radius: 3.5 },
  };

  // Strategic AI Navigation Waypoints
  const waypoints = [
    { id: 0, pos: new THREE.Vector3(0, 0, -16), tag: 'ct_spawn', links: [1, 2, 3] },
    { id: 1, pos: new THREE.Vector3(6, 0, -15), tag: 'ct_a_exit', links: [0, 4] },
    { id: 2, pos: new THREE.Vector3(-6, 0, -15), tag: 'ct_b_exit', links: [0, 5] },
    { id: 3, pos: new THREE.Vector3(0, 0, -10), tag: 'mid_north', links: [0, 6, 7] },

    { id: 4, pos: new THREE.Vector3(14, 0, -10), tag: 'a_long_north', links: [1, 8] },
    { id: 5, pos: new THREE.Vector3(-14, 0, -10), tag: 'b_alley_north', links: [2, 9] },
    { id: 6, pos: new THREE.Vector3(0, 0, -3), tag: 'mid_center_north', links: [3, 10, 11] },
    { id: 7, pos: new THREE.Vector3(0, 0, 3), tag: 'mid_center_south', links: [6, 12, 13] },

    { id: 8, pos: new THREE.Vector3(16, 0, -3), tag: 'a_entry', links: [4, 14, 10] },
    { id: 14, pos: new THREE.Vector3(17, 0.5, 0), tag: 'site_a', links: [8, 15] },
    { id: 15, pos: new THREE.Vector3(16, 0, 4), tag: 'a_south', links: [14, 16] },

    { id: 9, pos: new THREE.Vector3(-16, 0, -3), tag: 'b_entry', links: [5, 17, 11] },
    { id: 17, pos: new THREE.Vector3(-17, 0.4, 0), tag: 'site_b', links: [9, 18] },
    { id: 18, pos: new THREE.Vector3(-16, 0, 4), tag: 'b_south', links: [17, 19] },

    { id: 10, pos: new THREE.Vector3(5, 0, -1), tag: 'connector_a_north', links: [8, 6] },
    { id: 11, pos: new THREE.Vector3(-5, 0, -1), tag: 'connector_b_north', links: [9, 6] },
    { id: 12, pos: new THREE.Vector3(5, 0, 2), tag: 'connector_a_south', links: [15, 7] },
    { id: 13, pos: new THREE.Vector3(-5, 0, 2), tag: 'connector_b_south', links: [18, 7] },

    { id: 16, pos: new THREE.Vector3(14, 0, 12), tag: 'a_long_south', links: [15, 20] },
    { id: 19, pos: new THREE.Vector3(-14, 0, 12), tag: 'b_alley_south', links: [18, 20] },
    { id: 20, pos: new THREE.Vector3(0, 0, 16), tag: 't_spawn', links: [16, 19, 7] },
  ];

  return {
    group,
    colliders,
    shootables,
    siteZones,
    waypoints,
  };
}
