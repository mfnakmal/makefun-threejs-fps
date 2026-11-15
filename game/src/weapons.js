// Tactical Arsenal Engine for KILNFIRE: Hitscan Ballistics, Viewmodels, Recoil & Spray Mechanics
import * as THREE from 'three';
import { PALETTE } from './palette.js';

export const WEAPON_DEFS = {
  pistol: {
    name: 'P12 Osprey',
    type: 'sidearm',
    price: 200,
    magSize: 12,
    reserve: 48,
    fireGap: 0.18,
    reloadTime: 1.5,
    damageBody: 28,
    damageHead: 112,
    spreadStill: 0.002,
    spreadMoving: 0.016,
    recoilPitch: 0.02,
    recoilYaw: 0.006,
    auto: false,
  },
  smg: {
    name: 'Viper-9',
    type: 'primary',
    price: 1500,
    magSize: 30,
    reserve: 90,
    fireGap: 0.075,
    reloadTime: 1.8,
    damageBody: 22,
    damageHead: 70,
    spreadStill: 0.004,
    spreadMoving: 0.012,
    recoilPitch: 0.012,
    recoilYaw: 0.009,
    auto: true,
  },
  rifle: {
    name: 'Vandal-K',
    type: 'primary',
    price: 2900,
    magSize: 25,
    reserve: 75,
    fireGap: 0.105,
    reloadTime: 2.1,
    damageBody: 40,
    damageHead: 160,
    spreadStill: 0.001,
    spreadMoving: 0.038,
    recoilPitch: 0.024,
    recoilYaw: 0.014,
    auto: true,
  },
  sniper: {
    name: 'Apex .50',
    type: 'primary',
    price: 4500,
    magSize: 5,
    reserve: 15,
    fireGap: 1.25,
    reloadTime: 2.8,
    damageBody: 150,
    damageHead: 300,
    spreadStill: 0.0002,
    spreadMoving: 0.09,
    recoilPitch: 0.065,
    recoilYaw: 0.018,
    auto: false,
  },
};

export function createWeaponsSystem(camera, scene, audioEngine) {
  const metalMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(PALETTE.ink),
    roughness: 0.35,
    metalness: 0.8,
  });
  const darkMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(PALETTE.hairline),
    roughness: 0.7,
    metalness: 0.2,
  });
  const accentMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(PALETTE.accent),
    roughness: 0.4,
    metalness: 0.5,
  });

  const weaponRoot = new THREE.Group();
  weaponRoot.position.set(0.22, -0.2, -0.42);
  camera.add(weaponRoot);

  // Muzzle flash
  const flash = new THREE.Mesh(
    new THREE.PlaneGeometry(0.26, 0.26),
    new THREE.MeshBasicMaterial({
      color: new THREE.Color(PALETTE.accent),
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  );
  flash.position.set(0.22, -0.17, -0.96);
  flash.visible = false;
  camera.add(flash);

  const flashLight = new THREE.PointLight(new THREE.Color(PALETTE.accent), 0, 7);
  flashLight.position.set(0.22, -0.15, -0.6);
  camera.add(flashLight);

  // Procedural viewmodels for each weapon type
  const viewmodels = {};

  function buildPistolModel() {
    const group = new THREE.Group();
    const slide = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.065, 0.22), metalMat);
    slide.position.set(0, 0.03, -0.06);
    const grip = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.12, 0.07), darkMat);
    grip.position.set(0, -0.05, 0.02);
    grip.rotation.x = -0.22;
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.22, 8), darkMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.03, -0.07);
    group.add(slide, grip, barrel);
    return group;
  }

  function buildSmgModel() {
    const group = new THREE.Group();
    const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.08, 0.32), darkMat);
    const mag = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.16, 0.05), metalMat);
    mag.position.set(0, -0.1, -0.04);
    mag.rotation.x = 0.15;
    const grip = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.11, 0.06), darkMat);
    grip.position.set(0, -0.06, 0.1);
    grip.rotation.x = -0.25;
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.18, 8), metalMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.02, -0.22);
    const redDot = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.04, 0.08), accentMat);
    redDot.position.set(0, 0.06, 0.02);
    group.add(receiver, mag, grip, barrel, redDot);
    return group;
  }

  function buildRifleModel() {
    const group = new THREE.Group();
    const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.09, 0.42), metalMat);
    const handguard = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.075, 0.26), darkMat);
    handguard.position.set(0, 0.01, -0.28);
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.44, 8), darkMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.02, -0.38);
    const stock = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.09, 0.22), darkMat);
    stock.position.set(0, -0.02, 0.3);
    const curvedMag = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.2, 0.08), darkMat);
    curvedMag.position.set(0, -0.12, -0.04);
    curvedMag.rotation.x = 0.28;
    const sight = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.035, 0.05), accentMat);
    sight.position.set(0, 0.065, -0.15);
    group.add(receiver, handguard, barrel, stock, curvedMag, sight);
    return group;
  }

  function buildSniperModel() {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.09, 0.55), darkMat);
    const longBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.65, 8), metalMat);
    longBarrel.rotation.x = Math.PI / 2;
    longBarrel.position.set(0, 0.025, -0.55);
    const muzzleBrake = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.08), metalMat);
    muzzleBrake.position.set(0, 0.025, -0.88);
    const scope = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.3, 12), darkMat);
    scope.rotation.x = Math.PI / 2;
    scope.position.set(0, 0.085, -0.05);
    const stock = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.1, 0.28), darkMat);
    stock.position.set(0, -0.02, 0.38);
    group.add(body, longBarrel, muzzleBrake, scope, stock);
    return group;
  }

  viewmodels.pistol = buildPistolModel();
  viewmodels.smg = buildSmgModel();
  viewmodels.rifle = buildRifleModel();
  viewmodels.sniper = buildSniperModel();

  for (const model of Object.values(viewmodels)) {
    weaponRoot.add(model);
    model.visible = false;
  }

  // Active loadout
  const inventory = {
    primary: 'rifle', // or 'smg', 'sniper'
    sidearm: 'pistol',
    armor: 50,
    hasBomb: false,
    ammo: {
      pistol: { mag: WEAPON_DEFS.pistol.magSize, reserve: WEAPON_DEFS.pistol.reserve },
      smg: { mag: WEAPON_DEFS.smg.magSize, reserve: WEAPON_DEFS.smg.reserve },
      rifle: { mag: WEAPON_DEFS.rifle.magSize, reserve: WEAPON_DEFS.rifle.reserve },
      sniper: { mag: WEAPON_DEFS.sniper.magSize, reserve: WEAPON_DEFS.sniper.reserve },
    },
  };

  let activeSlot = 'primary'; // 'primary' or 'sidearm'
  let currentKey = 'rifle';
  viewmodels[currentKey].visible = true;

  const state = {
    fireTimer: 0,
    reloadTimer: 0,
    reloading: false,
    muzzleTimer: 0,
    swayTime: 0,
    recoilPitchAcc: 0,
    recoilYawAcc: 0,
    scoped: false,
  };

  // Visual Tracers
  const tracers = [];
  const tracerMat = new THREE.LineBasicMaterial({
    color: new THREE.Color(PALETTE.accent),
    transparent: true,
    opacity: 0.85,
  });

  function addTracer(start, end) {
    const geom = new THREE.BufferGeometry().setFromPoints([start, end]);
    const line = new THREE.Line(geom, tracerMat);
    scene.add(line);
    tracers.push({ line, life: 0.05 });
  }

  function switchWeapon(key) {
    if (!WEAPON_DEFS[key]) return;
    currentKey = key;
    for (const [k, m] of Object.entries(viewmodels)) {
      m.visible = k === currentKey;
    }
    state.reloading = false;
    state.reloadTimer = 0;
    state.fireTimer = 0.2; // Quick draw delay
  }

  return {
    inventory,
    state,
    getCurrentDef() {
      return WEAPON_DEFS[currentKey];
    },
    getCurrentKey() {
      return currentKey;
    },
    getCurrentAmmo() {
      return inventory.ammo[currentKey];
    },
    switchSlot(slot) {
      if (slot === 'primary' && inventory.primary) {
        activeSlot = 'primary';
        switchWeapon(inventory.primary);
      } else if (slot === 'sidearm') {
        activeSlot = 'sidearm';
        switchWeapon(inventory.sidearm);
      }
    },
    equip(weaponKey) {
      const def = WEAPON_DEFS[weaponKey];
      if (!def) return;
      if (def.type === 'primary') {
        inventory.primary = weaponKey;
        activeSlot = 'primary';
      } else {
        inventory.sidearm = weaponKey;
        activeSlot = 'sidearm';
      }
      inventory.ammo[weaponKey].mag = def.magSize;
      inventory.ammo[weaponKey].reserve = def.reserve;
      switchWeapon(weaponKey);
    },
    canFire() {
      const ammo = inventory.ammo[currentKey];
      return !state.reloading && state.fireTimer <= 0 && ammo.mag > 0;
    },
    fire(groundSpeed, isCrouching) {
      const def = WEAPON_DEFS[currentKey];
      const ammo = inventory.ammo[currentKey];
      if (ammo.mag <= 0) {
        audioEngine.emptyClick();
        state.fireTimer = 0.25;
        return null;
      }

      ammo.mag -= 1;
      state.fireTimer = def.fireGap;
      state.muzzleTimer = 0.05;

      // Audio
      audioEngine.gunshot(currentKey);

      // Flash
      flash.visible = true;
      flash.rotation.z = Math.random() * Math.PI * 2;
      flashLight.intensity = currentKey === 'sniper' ? 5.0 : 2.8;

      // Recoil kickback on weapon model
      weaponRoot.position.z = -0.34;
      weaponRoot.rotation.x = def.recoilPitch * 1.5;

      // Recoil accumulation
      state.recoilPitchAcc += def.recoilPitch;
      state.recoilYawAcc += (Math.random() - 0.5) * def.recoilYaw;

      // Spread calculation
      const moveFrac = Math.min(1, groundSpeed / 4.8);
      let spread = def.spreadStill + (def.spreadMoving - def.spreadStill) * moveFrac;
      if (isCrouching) spread *= 0.65;

      return {
        spread,
        damageBody: def.damageBody,
        damageHead: def.damageHead,
        pitchKick: def.recoilPitch,
        yawKick: (Math.random() - 0.5) * def.recoilYaw,
      };
    },
    reload() {
      const def = WEAPON_DEFS[currentKey];
      const ammo = inventory.ammo[currentKey];
      if (state.reloading || ammo.mag === def.magSize || ammo.reserve <= 0) return false;
      state.reloading = true;
      state.reloadTimer = def.reloadTime;
      audioEngine.reload();
      return true;
    },
    addTracer,
    reset() {
      state.fireTimer = 0;
      state.reloadTimer = 0;
      state.reloading = false;
      state.muzzleTimer = 0;
      state.recoilPitchAcc = 0;
      state.recoilYawAcc = 0;
      for (const [k, def] of Object.entries(WEAPON_DEFS)) {
        inventory.ammo[k].mag = def.magSize;
        inventory.ammo[k].reserve = def.reserve;
      }
      switchWeapon(inventory.primary || 'rifle');
    },
    step(dt, groundSpeed, isCrouching) {
      state.fireTimer = Math.max(0, state.fireTimer - dt);

      // Muzzle flash decay
      if (state.muzzleTimer > 0) {
        state.muzzleTimer -= dt;
        if (state.muzzleTimer <= 0) {
          flash.visible = false;
          flashLight.intensity = 0;
        }
      }

      // Recoil recovery
      state.recoilPitchAcc = Math.max(0, state.recoilPitchAcc - dt * 0.12);
      state.recoilYawAcc *= Math.max(0, 1 - dt * 10);

      // Viewmodel position recovery
      weaponRoot.position.z += (-0.42 - weaponRoot.position.z) * Math.min(1, dt * 20);
      weaponRoot.rotation.x += (0 - weaponRoot.rotation.x) * Math.min(1, dt * 18);

      // Reload animation
      const def = WEAPON_DEFS[currentKey];
      const ammo = inventory.ammo[currentKey];
      if (state.reloading) {
        state.reloadTimer -= dt;
        const progress = 1 - Math.max(0, state.reloadTimer) / def.reloadTime;
        weaponRoot.position.y = -0.2 - Math.sin(progress * Math.PI) * 0.14;
        weaponRoot.rotation.x = -Math.sin(progress * Math.PI) * 0.5;
        if (state.reloadTimer <= 0) {
          state.reloading = false;
          const need = def.magSize - ammo.mag;
          const take = Math.min(need, ammo.reserve);
          ammo.mag += take;
          ammo.reserve -= take;
          weaponRoot.position.y = -0.2;
          weaponRoot.rotation.x = 0;
        }
      } else {
        // Natural weapon sway & breathing bob
        state.swayTime += dt * (groundSpeed > 0.1 ? 8 : 2);
        const swayAmp = groundSpeed > 0.1 ? 0.016 : 0.003;
        weaponRoot.position.x = 0.22 + Math.cos(state.swayTime * 0.5) * swayAmp;
        weaponRoot.position.y = -0.2 + Math.sin(state.swayTime) * swayAmp;
      }

      // Update bullet tracers
      for (let i = tracers.length - 1; i >= 0; i--) {
        const tr = tracers[i];
        tr.life -= dt;
        if (tr.life <= 0) {
          scene.remove(tr.line);
          tr.line.geometry.dispose();
          tracers.splice(i, 1);
        }
      }
    },
  };
}

