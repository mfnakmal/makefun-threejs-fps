// Tactical Arsenal Engine for KILNFIRE: Hitscan Ballistics, Viewmodels with Hands, Recoil & Spray Mechanics
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
  spike: {
    name: 'C4 Spike',
    type: 'objective',
    price: 0,
    magSize: 1,
    reserve: 0,
    fireGap: 1.0,
    reloadTime: 0,
    damageBody: 500,
    damageHead: 500,
    spreadStill: 0,
    spreadMoving: 0,
    recoilPitch: 0,
    recoilYaw: 0,
    auto: false,
  },
};

export function createWeaponsSystem(camera, scene, audioEngine) {
  const metalMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(PALETTE.crateMetal),
    roughness: 0.35,
    metalness: 0.8,
  });
  const darkMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(PALETTE.surface),
    roughness: 0.7,
    metalness: 0.2,
  });
  const accentMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(PALETTE.accent),
    roughness: 0.4,
    metalness: 0.5,
  });
  const sleeveMat = new THREE.MeshStandardMaterial({
    color: 0x1e3a4c, // Deep navy CT operator sleeve
    roughness: 0.85,
    metalness: 0.1,
  });
  const gloveMat = new THREE.MeshStandardMaterial({
    color: 0x22262b, // Tactical reinforced leather glove
    roughness: 0.6,
    metalness: 0.25,
  });
  const spikeCanisterMat = new THREE.MeshStandardMaterial({
    color: 0x4d7c0f, // Olive-drab explosive canisters
    roughness: 0.5,
    metalness: 0.3,
  });

  const weaponRoot = new THREE.Group();
  weaponRoot.position.set(0.2, -0.22, -0.42);
  camera.add(weaponRoot);

  // Multi-pointed 3D Muzzle Flash Star
  const flashGroup = new THREE.Group();
  const flashMat = new THREE.MeshBasicMaterial({
    color: 0xfff380,
    transparent: true,
    opacity: 0.95,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const flashOrangeMat = new THREE.MeshBasicMaterial({
    color: 0xff7700,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

  // Cross flares
  const flare1 = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.08), flashMat);
  const flare2 = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 0.32), flashMat);
  const flare3 = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.24), flashOrangeMat);
  flare3.rotation.z = Math.PI / 4;
  const coreSpark = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }));

  flashGroup.add(flare1, flare2, flare3, coreSpark);
  flashGroup.position.set(0.2, -0.19, -0.96);
  flashGroup.visible = false;
  camera.add(flashGroup);

  const flashLight = new THREE.PointLight(0xffaa33, 0, 9);
  flashLight.position.set(0.2, -0.17, -0.6);
  camera.add(flashLight);

  // Procedural viewmodels for each weapon type
  const viewmodels = {};

  function addArmsToGroup(group, leftHandPos, rightHandPos) {
    // Right Arm (Trigger Hand)
    const rForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, 0.32, 8), sleeveMat);
    rForearm.position.set(rightHandPos.x + 0.1, rightHandPos.y - 0.12, rightHandPos.z + 0.18);
    rForearm.rotation.set(0.65, -0.2, -0.3);

    const rGlove = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.075, 0.09), gloveMat);
    rGlove.position.copy(rightHandPos);
    rGlove.rotation.set(-0.25, 0, 0);

    // Left Arm (Handguard Support Hand)
    const lForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.052, 0.36, 8), sleeveMat);
    lForearm.position.set(leftHandPos.x - 0.14, leftHandPos.y - 0.14, leftHandPos.z + 0.16);
    lForearm.rotation.set(0.75, 0.35, 0.45);

    const lGlove = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.07, 0.09), gloveMat);
    lGlove.position.copy(leftHandPos);
    lGlove.rotation.set(0.15, 0.2, -0.3);

    group.add(rForearm, rGlove, lForearm, lGlove);
  }

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

    // Two-handed pistol grip
    addArmsToGroup(group, new THREE.Vector3(-0.02, -0.06, 0.02), new THREE.Vector3(0.02, -0.06, 0.02));
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

    addArmsToGroup(group, new THREE.Vector3(-0.04, -0.03, -0.16), new THREE.Vector3(0.02, -0.06, 0.09));
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

    // Operator gloved arms cradling rifle
    addArmsToGroup(group, new THREE.Vector3(-0.035, -0.03, -0.24), new THREE.Vector3(0.02, -0.06, 0.12));
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

    addArmsToGroup(group, new THREE.Vector3(-0.04, -0.03, -0.28), new THREE.Vector3(0.02, -0.06, 0.16));
    group.add(body, longBarrel, muzzleBrake, scope, stock);
    return group;
  }

  function buildSpikeModel() {
    const group = new THREE.Group();
    // Central core
    const core = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.11, 0.24), darkMat);
    // Two explosive canisters
    const can1 = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.26, 12), spikeCanisterMat);
    can1.rotation.x = Math.PI / 2;
    can1.position.set(-0.11, -0.02, 0);
    const can2 = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.26, 12), spikeCanisterMat);
    can2.rotation.x = Math.PI / 2;
    can2.position.set(0.11, -0.02, 0);

    // Glowing LED countdown keypad
    const keypad = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.02, 0.12),
      new THREE.MeshBasicMaterial({ color: 0xff5500 }),
    );
    keypad.position.set(0, 0.065, 0);

    // Both hands holding the bomb in front
    const rGlove = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.08, 0.1), gloveMat);
    rGlove.position.set(0.16, -0.01, 0);
    const lGlove = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.08, 0.1), gloveMat);
    lGlove.position.set(-0.16, -0.01, 0);

    group.add(core, can1, can2, keypad, rGlove, lGlove);
    return group;
  }

  viewmodels.pistol = buildPistolModel();
  viewmodels.smg = buildSmgModel();
  viewmodels.rifle = buildRifleModel();
  viewmodels.sniper = buildSniperModel();
  viewmodels.spike = buildSpikeModel();

  for (const model of Object.values(viewmodels)) {
    weaponRoot.add(model);
    model.visible = false;
  }

  // Active loadout
  const inventory = {
    primary: 'rifle',
    sidearm: 'pistol',
    armor: 50,
    hasSpike: false,
  };

  const ammoPool = {
    pistol: { mag: WEAPON_DEFS.pistol.magSize, reserve: WEAPON_DEFS.pistol.reserve },
    smg: { mag: WEAPON_DEFS.smg.magSize, reserve: WEAPON_DEFS.smg.reserve },
    rifle: { mag: WEAPON_DEFS.rifle.magSize, reserve: WEAPON_DEFS.rifle.reserve },
    sniper: { mag: WEAPON_DEFS.sniper.magSize, reserve: WEAPON_DEFS.sniper.reserve },
    spike: { mag: 1, reserve: 0 },
  };

  let currentKey = 'rifle';
  let activeSlot = 'primary';
  viewmodels[currentKey].visible = true;

  const state = {
    fireTimer: 0,
    reloadTimer: 0,
    recoilPitchAcc: 0,
    recoilYawAcc: 0,
    muzzleTimer: 0,
    breatheTime: 0,
  };

  function switchWeapon(key) {
    if (!WEAPON_DEFS[key]) return;
    if (state.reloadTimer > 0) return;
    currentKey = key;
    for (const [k, m] of Object.entries(viewmodels)) {
      m.visible = k === key;
    }
    audioEngine.weaponEquip(key);
  }

  return {
    inventory,
    ammoPool,
    state,
    get currentDef() {
      return WEAPON_DEFS[currentKey];
    },
    get currentKey() {
      return currentKey;
    },
    switchSlot(slot) {
      if (slot === 'primary') {
        activeSlot = 'primary';
        switchWeapon(inventory.primary);
      } else if (slot === 'sidearm') {
        activeSlot = 'sidearm';
        switchWeapon(inventory.sidearm);
      } else if (slot === 'spike') {
        activeSlot = 'spike';
        switchWeapon('spike');
      }
    },
    buyWeapon(weaponKey, price) {
      const def = WEAPON_DEFS[weaponKey];
      if (!def) return false;
      if (def.type === 'primary') {
        inventory.primary = weaponKey;
        activeSlot = 'primary';
        switchWeapon(weaponKey);
      } else if (def.type === 'sidearm') {
        inventory.sidearm = weaponKey;
        activeSlot = 'sidearm';
        switchWeapon(weaponKey);
      }
      ammoPool[weaponKey].mag = def.magSize;
      ammoPool[weaponKey].reserve = def.reserve;
      return true;
    },
    fire(groundSpeed = 0, isCrouching = false) {
      if (state.fireTimer > 0 || state.reloadTimer > 0) return null;
      const def = WEAPON_DEFS[currentKey];
      const ammo = ammoPool[currentKey];
      if (ammo.mag <= 0) {
        audioEngine.emptyClick();
        state.fireTimer = 0.25;
        return null;
      }

      ammo.mag -= 1;
      state.fireTimer = def.fireGap;
      state.muzzleTimer = 0.06;

      // Audio
      audioEngine.gunshot(currentKey);

      // Flash
      flashGroup.visible = true;
      flashGroup.rotation.z = Math.random() * Math.PI * 2;
      flashLight.intensity = currentKey === 'sniper' ? 5.5 : 3.2;

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
        damageBody: def.damageBody,
        damageHead: def.damageHead,
        spread,
        pitchKick: def.recoilPitch,
        yawKick: def.recoilYaw,
      };
    },
    showCombatMuzzleFlash() {
      flashGroup.visible = true;
      flashLight.intensity = 3.5;
      weaponRoot.position.z = -0.36;
      weaponRoot.rotation.x = 0.08;
    },
    reload() {
      const def = WEAPON_DEFS[currentKey];
      const ammo = ammoPool[currentKey];
      if (state.reloadTimer > 0 || ammo.mag >= def.magSize || ammo.reserve <= 0) return;
      state.reloadTimer = def.reloadTime;
      audioEngine.reloadStart();
    },
    update(dt) {
      state.breatheTime += dt * 2.2;
      const bobX = Math.sin(state.breatheTime * 0.5) * 0.003;
      const bobY = Math.cos(state.breatheTime) * 0.003;
      weaponRoot.position.x = 0.2 + bobX;
      weaponRoot.position.y = -0.22 + bobY;

      // Fire timer decay
      if (state.fireTimer > 0) state.fireTimer -= dt;

      // Reload completion
      if (state.reloadTimer > 0) {
        state.reloadTimer -= dt;
        weaponRoot.rotation.x = -0.4 * Math.sin((state.reloadTimer / WEAPON_DEFS[currentKey].reloadTime) * Math.PI);
        if (state.reloadTimer <= 0) {
          const def = WEAPON_DEFS[currentKey];
          const ammo = ammoPool[currentKey];
          const needed = def.magSize - ammo.mag;
          const transfer = Math.min(needed, ammo.reserve);
          ammo.mag += transfer;
          ammo.reserve -= transfer;
          state.reloadTimer = 0;
          weaponRoot.rotation.x = 0;
          audioEngine.reloadFinish();
        }
      }

      // Muzzle flash decay
      if (state.muzzleTimer > 0) {
        state.muzzleTimer -= dt;
        if (state.muzzleTimer <= 0) {
          flashGroup.visible = false;
          flashLight.intensity = 0;
        }
      }

      // Weapon kickback recovery
      weaponRoot.position.z += (-0.42 - weaponRoot.position.z) * dt * 14;
      weaponRoot.rotation.x += (0 - weaponRoot.rotation.x) * dt * 12;

      // Recoil accumulation recovery
      state.recoilPitchAcc += (0 - state.recoilPitchAcc) * dt * 4.5;
      state.recoilYawAcc += (0 - state.recoilYawAcc) * dt * 4.5;
    },
  };
}
