// Tactical C4 / Spike Bomb Objective System for KILNFIRE
// Handles plant/defuse timers, accelerating beeps, visual 3D prop, detonation, and round outcomes.
import * as THREE from 'three';
import { PALETTE } from './palette.js';

export const BOMB_CONFIG = {
  plantDuration: 3.5,
  defuseDuration: 5.0,
  fuseDuration: 45.0,
  explosionRadius: 18.0,
  explosionDamage: 500,
};

export function createBombSystem(scene, siteZones, audioEngine) {
  // 3D Bomb Prop
  const bombGroup = new THREE.Group();
  const caseMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(PALETTE.hairline),
    roughness: 0.6,
    metalness: 0.5,
  });
  const ledMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(PALETTE.tRust) });

  const bombBody = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.18, 0.28), caseMat);
  const keypad = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.14), caseMat);
  keypad.position.set(0, 0.1, 0.02);
  const redLed = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), ledMat);
  redLed.position.set(-0.08, 0.12, 0.08);

  bombGroup.add(bombBody, keypad, redLed);
  bombGroup.visible = false;
  scene.add(bombGroup);

  const bombLight = new THREE.PointLight(new THREE.Color(PALETTE.tRust), 0, 6);
  bombGroup.add(bombLight);

  const state = {
    status: 'IDLE', // 'IDLE', 'PLANTING', 'PLANTED', 'DEFUSING', 'DEFUSED', 'DETONATED'
    site: null,     // 'A' or 'B'
    planter: null,
    defuser: null,
    plantTimer: 0,
    defuseTimer: 0,
    fuseRemaining: BOMB_CONFIG.fuseDuration,
    beepTimer: 0,
    carrierName: 'Attacker 1',
  };

  function checkInZone(pos) {
    if (pos.distanceTo(siteZones.A.center) <= siteZones.A.radius) return 'A';
    if (pos.distanceTo(siteZones.B.center) <= siteZones.B.radius) return 'B';
    return null;
  }

  return {
    state,
    checkInZone,
    canPlant(pos, isT) {
      if (!isT || state.status !== 'IDLE') return false;
      return checkInZone(pos) !== null;
    },
    startPlanting(planterRef, pos) {
      const site = checkInZone(pos);
      if (!site) return false;
      state.status = 'PLANTING';
      state.site = site;
      state.planter = planterRef;
      state.plantTimer = 0;
      return true;
    },
    cancelPlanting() {
      if (state.status === 'PLANTING') {
        state.status = 'IDLE';
        state.site = null;
        state.planter = null;
        state.plantTimer = 0;
      }
    },
    canDefuse(pos, isCT) {
      if (!isCT || state.status !== 'PLANTED') return false;
      return pos.distanceTo(bombGroup.position) <= 2.8;
    },
    startDefusing(defuserRef) {
      if (state.status !== 'PLANTED') return false;
      state.status = 'DEFUSING';
      state.defuser = defuserRef;
      state.defuseTimer = 0;
      return true;
    },
    cancelDefusing() {
      if (state.status === 'DEFUSING') {
        state.status = 'PLANTED';
        state.defuser = null;
        state.defuseTimer = 0;
      }
    },
    reset() {
      state.status = 'IDLE';
      state.site = null;
      state.planter = null;
      state.defuser = null;
      state.plantTimer = 0;
      state.defuseTimer = 0;
      state.fuseRemaining = BOMB_CONFIG.fuseDuration;
      state.beepTimer = 0;
      bombGroup.visible = false;
      bombLight.intensity = 0;
    },
    update(dt) {
      this.step(dt);
    },
    step(dt, onBombPlanted, onBombDefused, onBombDetonated) {
      // 1. Planting phase
      if (state.status === 'PLANTING') {
        state.plantTimer += dt;
        if (state.plantTimer >= BOMB_CONFIG.plantDuration) {
          state.status = 'PLANTED';
          state.fuseRemaining = BOMB_CONFIG.fuseDuration;
          state.beepTimer = 0;
          bombGroup.position.copy(state.planter.position);
          bombGroup.position.y += 0.1;
          bombGroup.visible = true;
          audioEngine.bombPlanted();
          if (onBombPlanted) onBombPlanted(state.site);
        }
        return;
      }

      // 2. Defusing or Planted fuse phase
      if (state.status === 'PLANTED' || state.status === 'DEFUSING') {
        state.fuseRemaining -= dt;

        if (state.status === 'DEFUSING') {
          state.defuseTimer += dt;
          if (state.defuseTimer >= BOMB_CONFIG.defuseDuration) {
            state.status = 'DEFUSED';
            bombLight.intensity = 0;
            audioEngine.bombDefused();
            if (onBombDefused) onBombDefused();
            return;
          }
        }

        // Fuse countdown check
        if (state.fuseRemaining <= 0) {
          state.status = 'DETONATED';
          bombGroup.visible = false;
          audioEngine.explosion();
          if (onBombDetonated) onBombDetonated(bombGroup.position);
          return;
        }

        // Accelerating beep rate calculation
        const fuseFrac = Math.max(0, state.fuseRemaining / BOMB_CONFIG.fuseDuration);
        const beepGap = 0.1 + fuseFrac * 0.9; // 1.0s at start, down to 0.1s at end!
        state.beepTimer -= dt;
        if (state.beepTimer <= 0) {
          state.beepTimer = beepGap;
          audioEngine.bombBeep(fuseFrac);
          bombLight.intensity = 3.5;
        } else {
          bombLight.intensity = Math.max(0, bombLight.intensity - dt * 14);
        }
      }
    },
  };
}

