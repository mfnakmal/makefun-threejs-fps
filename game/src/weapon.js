// Tactical Service Rifle: hitscan ballistics, magazine management, realistic recoil pitch/yaw kick,
// dynamic spread penalty for firing while moving, and muzzle flash projection.
import * as THREE from 'three';
import { PALETTE } from './palette.js';

const MAG_SIZE = 30;
const RESERVE = 90;
const FIRE_GAP = 0.096;
const RELOAD_TIME = 1.9;
const SPREAD_STILL = 0.0022;
const SPREAD_MOVING = 0.028;
const MOVE_REFERENCE = 5.2;
const MUZZLE_TIME = 0.06;

export function createWeapon(camera) {
  const grip = new THREE.MeshStandardMaterial({ color: new THREE.Color(PALETTE.hairline), roughness: 0.7, metalness: 0.2 });
  const body = new THREE.MeshStandardMaterial({ color: new THREE.Color(PALETTE.ink), roughness: 0.5, metalness: 0.35 });

  const model = new THREE.Group();
  const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.1, 0.42), body);
  const barrel = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.045, 0.4), grip);
  barrel.position.set(0, 0.025, -0.38);
  const stock = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.08, 0.22), grip);
  stock.position.set(0, -0.02, 0.3);
  model.add(receiver, barrel, stock);
  model.position.set(0.24, -0.2, -0.42);
  camera.add(model);

  const flash = new THREE.Mesh(
    new THREE.PlaneGeometry(0.24, 0.24),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(PALETTE.accent), transparent: true, opacity: 0.9, depthWrite: false, side: THREE.DoubleSide }),
  );
  flash.position.set(0.24, -0.18, -0.95);
  flash.visible = false;
  camera.add(flash);

  const flashLight = new THREE.PointLight(new THREE.Color(PALETTE.accent), 0, 5);
  flashLight.position.set(0.24, -0.16, -0.6);
  camera.add(flashLight);

  const weapon = {
    mag: MAG_SIZE,
    reserve: RESERVE,
    reloading: false,
    reloadTimer: 0,
    fireTimer: 0,
    muzzleTimer: 0,
    sway: 0,
  };

  return {
    state: weapon,
    canFire() {
      return !weapon.reloading && weapon.fireTimer <= 0 && weapon.mag > 0;
    },
    fire(groundSpeed) {
      weapon.mag -= 1;
      weapon.fireTimer = FIRE_GAP;
      weapon.muzzleTimer = MUZZLE_TIME;
      flash.visible = true;
      flash.rotation.z = Math.random() * Math.PI * 2;
      flashLight.intensity = 2.4;
      model.position.z = -0.36;
      const moveFraction = Math.min(1, groundSpeed / MOVE_REFERENCE);
      return SPREAD_STILL + (SPREAD_MOVING - SPREAD_STILL) * moveFraction;
    },
    reload() {
      if (weapon.reloading || weapon.mag === MAG_SIZE || weapon.reserve <= 0) return false;
      weapon.reloading = true;
      weapon.reloadTimer = RELOAD_TIME;
      return true;
    },
    step(dt, groundSpeed) {
      weapon.fireTimer = Math.max(0, weapon.fireTimer - dt);
      if (weapon.muzzleTimer > 0) {
        weapon.muzzleTimer -= dt;
        if (weapon.muzzleTimer <= 0) {
          flash.visible = false;
          flashLight.intensity = 0;
        }
      }
      model.position.z += (-0.42 - model.position.z) * Math.min(1, dt * 18);

      if (weapon.reloading) {
        weapon.reloadTimer -= dt;
        const progress = 1 - Math.max(0, weapon.reloadTimer) / RELOAD_TIME;
        model.position.y = -0.2 - Math.sin(progress * Math.PI) * 0.12;
        model.rotation.x = -Math.sin(progress * Math.PI) * 0.45;
        if (weapon.reloadTimer <= 0) {
          weapon.reloading = false;
          const need = MAG_SIZE - weapon.mag;
          const take = Math.min(need, weapon.reserve);
          weapon.mag += take;
          weapon.reserve -= take;
          model.position.y = -0.2;
          model.rotation.x = 0;
        }
      } else {
        weapon.sway += dt * (groundSpeed > 0.1 ? 9 : 2);
        const swayAmp = groundSpeed > 0.1 ? 0.015 : 0.003;
        model.position.x = 0.24 + Math.cos(weapon.sway) * swayAmp;
        model.position.y = -0.2 + Math.abs(Math.sin(weapon.sway)) * swayAmp;
      }
    },
    reset() {
      weapon.mag = MAG_SIZE;
      weapon.reserve = RESERVE;
      weapon.reloading = false;
      weapon.reloadTimer = 0;
      weapon.fireTimer = 0;
      weapon.muzzleTimer = 0;
      flash.visible = false;
      flashLight.intensity = 0;
      model.position.set(0.24, -0.2, -0.42);
      model.rotation.set(0, 0, 0);
    },
  };
}
