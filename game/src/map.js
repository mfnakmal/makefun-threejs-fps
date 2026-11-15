// 3-Lane Industrial Foundry Map for KILNFIRE Engine
// Features Site A, Site B, Mid Courtyard, chokepoints, procedural materials, and AI navigation nodes.
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
  textures.brick.repeat.set(8, 2);

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

  // 1. Floor & Ceiling rafters
  addBox(56, 0.4, 44, 0, -0.4, 0, floorMat);

  // 2. Perimeter Boundary Walls (Height 6.5m)
  addBox(56, 6.5, 0.6, 0, 0, -22, brickMat); // North Wall (Behind CT Spawn)
  addBox(56, 6.5, 0.6, 0, 0, 22, brickMat);  // South Wall (Behind T Spawn)
  addBox(0.6, 6.5, 44, -28, 0, 0, brickMat); // West Wall (Site B boundary)
  addBox(0.6, 6.5, 44, 28, 0, 0, brickMat);  // East Wall (Site A boundary)

  // 3. Central Dividers & 3-Lane Architecture
  // West Lane Wall (Separating Mid and B Alley)
  addBox(0.8, 5.0, 14, -8, 0, -10, brickMat);
  addBox(0.8, 5.0, 14, -8, 0, 10, brickMat);
  // East Lane Wall (Separating Mid and A Long)
  addBox(0.8, 5.0, 14, 8, 0, -10, brickMat);
  addBox(0.8, 5.0, 14, 8, 0, 10, brickMat);

  // Overhead Steel Trusses & Arches across connectors
  addBox(56, 0.6, 0.6, 0, 5.8, 0, steelMat, false);
  addBox(56, 0.6, 0.6, 0, 5.8, -10, steelMat, false);
  addBox(56, 0.6, 0.6, 0, 5.8, 10, steelMat, false);

  // 4. SITE A (East foundry casting yard, x = +16, z = 0)
  // Raised platform
  addBox(8.0, 0.6, 8.0, 17, 0, 0, steelMat);
  // Planting Zone (Hazard stripes on floor)
  const zoneAMesh = addBox(4.5, 0.05, 4.5, 17, 0.6, 0, hazardMat, false);
  // Kiln Furnace Tower
  addBox(3.0, 5.5, 3.0, 24, 0, -4, brickMat);
  // Cover crates at Site A
  addBox(1.5, 1.5, 1.5, 15, 0.6, -2, crateMat);
  addBox(1.5, 1.5, 1.5, 19, 0.6, 2, crateMat);
  addBox(2.2, 1.2, 1.2, 22, 0, 6, crateMat);
  // Sign A
  const signAMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(1.8, 0.9),
    new THREE.MeshBasicMaterial({ map: textures.signA, side: THREE.DoubleSide }),
  );
  signAMesh.position.set(13, 3.2, -3.2);
  signAMesh.rotation.y = Math.PI / 2;
  group.add(signAMesh);

  // 5. SITE B (West industrial hangar, x = -16, z = 0)
  // Low foundation
  addBox(9.0, 0.4, 9.0, -17, 0, 0, darkMat);
  // Planting Zone (Hazard stripes)
  addBox(4.5, 0.05, 4.5, -17, 0.4, 0, hazardMat, false);
  // Storage Container stack
  addBox(4.0, 2.5, 2.0, -22, 0, -4, crateMat);
  addBox(2.0, 1.8, 2.0, -14, 0.4, -2.5, crateMat);
  addBox(2.0, 1.8, 2.0, -19, 0.4, 2.5, crateMat);
  addBox(1.5, 1.2, 2.5, -23, 0, 5, crateMat);
  // Sign B
  const signBMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(1.8, 0.9),
    new THREE.MeshBasicMaterial({ map: textures.signB, side: THREE.DoubleSide }),
  );
  signBMesh.position.set(-13, 3.2, 3.2);
  signBMesh.rotation.y = -Math.PI / 2;
  group.add(signBMesh);

  // 6. MID COURTYARD (Center plaza, x = 0, z = 0)
  // Central generator monolith
  addBox(2.4, 3.2, 2.4, 0, 0, 0, steelMat);
  // Mid trench barricades
  addBox(3.0, 1.1, 0.8, -3.5, 0, -4.5, crateMat);
  addBox(3.0, 1.1, 0.8, 3.5, 0, 4.5, crateMat);

  // 7. CT SPAWN (North, z = -16)
  addBox(6.0, 0.05, 4.0, 0, 0.01, -16, new THREE.MeshBasicMaterial({ color: PALETTE.ctBlue, transparent: true, opacity: 0.3 }), false);
  addBox(2.2, 1.4, 1.0, -4, 0, -17, crateMat);
  addBox(2.2, 1.4, 1.0, 4, 0, -17, crateMat);

  // 8. T SPAWN (South, z = +16)
  addBox(6.0, 0.05, 4.0, 0, 0.01, 16, new THREE.MeshBasicMaterial({ color: PALETTE.tRust, transparent: true, opacity: 0.3 }), false);
  addBox(2.5, 1.4, 1.2, -5, 0, 17, crateMat);
  addBox(2.5, 1.4, 1.2, 5, 0, 17, crateMat);

  // Lighting: High-contrast competitive arena illumination
  const ambient = new THREE.HemisphereLight(new THREE.Color(PALETTE.canvas), new THREE.Color(PALETTE.surface), 0.9);
  scene.add(ambient);

  const sun = new THREE.DirectionalLight(new THREE.Color(PALETTE.ink), 1.9);
  sun.position.set(16, 24, 12);
  sun.target.position.set(0, 0, 0);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -30;
  sun.shadow.camera.right = 30;
  sun.shadow.camera.top = 25;
  sun.shadow.camera.bottom = -25;
  sun.shadow.camera.far = 60;
  sun.shadow.bias = -0.0004;
  scene.add(sun, sun.target);

  // Site Beacon Lights
  const lightA = new THREE.PointLight(new THREE.Color(PALETTE.siteA), 1.5, 14);
  lightA.position.set(17, 3.5, 0);
  scene.add(lightA);

  const lightB = new THREE.PointLight(new THREE.Color(PALETTE.siteB), 1.5, 14);
  lightB.position.set(-17, 3.5, 0);
  scene.add(lightB);

  // Tactical Site Zones definitions for bomb plant/defuse
  const siteZones = {
    A: { center: new THREE.Vector3(17, 0.6, 0), radius: 3.2 },
    B: { center: new THREE.Vector3(-17, 0.4, 0), radius: 3.2 },
  };

  // Strategic AI Navigation Waypoints
  const waypoints = [
    // CT Spawns (0-3)
    { id: 0, pos: new THREE.Vector3(0, 0, -16), tag: 'ct_spawn', links: [1, 2, 3] },
    { id: 1, pos: new THREE.Vector3(6, 0, -15), tag: 'ct_a_exit', links: [0, 4] },
    { id: 2, pos: new THREE.Vector3(-6, 0, -15), tag: 'ct_b_exit', links: [0, 5] },
    { id: 3, pos: new THREE.Vector3(0, 0, -10), tag: 'mid_north', links: [0, 6, 7] },

    // Mid Area (4-7)
    { id: 4, pos: new THREE.Vector3(14, 0, -10), tag: 'a_long_north', links: [1, 8] },
    { id: 5, pos: new THREE.Vector3(-14, 0, -10), tag: 'b_alley_north', links: [2, 9] },
    { id: 6, pos: new THREE.Vector3(0, 0, -3), tag: 'mid_center_north', links: [3, 10, 11] },
    { id: 7, pos: new THREE.Vector3(0, 0, 3), tag: 'mid_center_south', links: [6, 12, 13] },

    // Site A Nodes (8, 14, 15)
    { id: 8, pos: new THREE.Vector3(16, 0, -3), tag: 'a_entry', links: [4, 14, 10] },
    { id: 14, pos: new THREE.Vector3(17, 0.6, 0), tag: 'site_a', links: [8, 15] },
    { id: 15, pos: new THREE.Vector3(16, 0, 4), tag: 'a_south', links: [14, 16] },

    // Site B Nodes (9, 17, 18)
    { id: 9, pos: new THREE.Vector3(-16, 0, -3), tag: 'b_entry', links: [5, 17, 11] },
    { id: 17, pos: new THREE.Vector3(-17, 0.4, 0), tag: 'site_b', links: [9, 18] },
    { id: 18, pos: new THREE.Vector3(-16, 0, 4), tag: 'b_south', links: [17, 19] },

    // Mid Connectors (10, 11, 12, 13)
    { id: 10, pos: new THREE.Vector3(5, 0, 0), tag: 'a_connector', links: [6, 8] },
    { id: 11, pos: new THREE.Vector3(-5, 0, 0), tag: 'b_connector', links: [6, 9] },
    { id: 12, pos: new THREE.Vector3(5, 0, 3), tag: 'mid_a_exit', links: [7, 16] },
    { id: 13, pos: new THREE.Vector3(-5, 0, 3), tag: 'mid_b_exit', links: [7, 19] },

    // T Area & T Spawn (16, 19, 20, 21, 22)
    { id: 16, pos: new THREE.Vector3(14, 0, 11), tag: 'a_long_south', links: [15, 20] },
    { id: 19, pos: new THREE.Vector3(-14, 0, 11), tag: 'b_alley_south', links: [18, 20] },
    { id: 20, pos: new THREE.Vector3(0, 0, 11), tag: 'mid_south', links: [7, 16, 19, 21] },
    { id: 21, pos: new THREE.Vector3(0, 0, 16), tag: 't_spawn', links: [20, 22] },
    { id: 22, pos: new THREE.Vector3(-4, 0, 15), tag: 't_spawn_b', links: [21, 19] },
  ];

  return {
    colliders,
    shootables,
    siteZones,
    waypoints,
    group,
  };
}

