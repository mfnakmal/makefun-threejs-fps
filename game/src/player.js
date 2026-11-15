// First-Person Tactical Controller for KILNFIRE: Inertia, Crouching, Collision, Health & Objective Interaction
import * as THREE from 'three';

const EYE_STAND = 1.65;
const EYE_CROUCH = 1.05;
const RADIUS = 0.35;
const GRAVITY = 19.6;
const JUMP_IMPULSE = 5.2;

const SPEED_WALK = 3.8;
const SPEED_SPRINT = 5.6;
const SPEED_CROUCH = 1.9;
const ACCEL = 38.0;
const FRICTION = 14.0;

export function createPlayer(colliders, audioEngine) {
  const state = {
    position: new THREE.Vector3(0, 0, -16), // Spawns at CT Spawn
    velocity: new THREE.Vector3(),
    yaw: 0,
    pitch: 0,
    eye: EYE_STAND,
    onGround: true,
    crouching: false,
    sprinting: false,
    health: 100,
    armor: 50,
    alive: true,
    strideDist: 0,
  };

  const forward = new THREE.Vector3();
  const right = new THREE.Vector3();
  const wishDir = new THREE.Vector3();
  const playerBox = new THREE.Box3();

  function look(dx, dy) {
    state.yaw -= dx * 0.0022;
    state.pitch = Math.max(-1.54, Math.min(1.54, state.pitch - dy * 0.0022));
  }

  function recoil(pitchDelta, yawDelta) {
    state.pitch = Math.max(-1.54, Math.min(1.54, state.pitch + pitchDelta));
    state.yaw += yawDelta;
  }

  function groundSpeed() {
    return Math.hypot(state.velocity.x, state.velocity.z);
  }

  function damage(amount, isHead, attackerName = 'Enemy') {
    if (!state.alive) return false;
    let actualDmg = isHead ? amount * 4 : amount;

    if (state.armor > 0) {
      const absorbed = Math.min(state.armor, Math.floor(actualDmg * 0.66));
      state.armor -= absorbed;
      actualDmg -= absorbed;
    }
    state.health -= actualDmg;

    if (state.health <= 0) {
      state.health = 0;
      state.alive = false;
      return true;
    }
    return false;
  }

  function step(dt, keys) {
    if (!state.alive) return;

    state.crouching = keys.has('ControlLeft') || keys.has('KeyC');
    state.sprinting = !state.crouching && keys.has('ShiftLeft');

    // Smooth crouch eye transition
    const targetEye = state.crouching ? EYE_CROUCH : EYE_STAND;
    state.eye += (targetEye - state.eye) * Math.min(1, dt * 14);

    // Direction vectors from camera yaw
    forward.set(-Math.sin(state.yaw), 0, -Math.cos(state.yaw));
    right.set(Math.cos(state.yaw), 0, -Math.sin(state.yaw));

    wishDir.set(0, 0, 0);
    if (keys.has('KeyW')) wishDir.add(forward);
    if (keys.has('KeyS')) wishDir.sub(forward);
    if (keys.has('KeyD')) wishDir.add(right);
    if (keys.has('KeyA')) wishDir.sub(right);

    const hasInput = wishDir.lengthSq() > 0.001;
    if (hasInput) wishDir.normalize();

    // Target max speed
    const maxSpeed = state.crouching ? SPEED_CROUCH : state.sprinting ? SPEED_SPRINT : SPEED_WALK;

    // Tactical acceleration & friction (counter-strafing precision)
    const currentSpeed = groundSpeed();
    if (currentSpeed > 0.001) {
      const drop = currentSpeed * FRICTION * dt;
      const newSpeed = Math.max(0, currentSpeed - drop);
      const ratio = newSpeed / currentSpeed;
      state.velocity.x *= ratio;
      state.velocity.z *= ratio;
    }

    if (hasInput) {
      const currentProj = state.velocity.x * wishDir.x + state.velocity.z * wishDir.z;
      const addSpeed = Math.max(0, maxSpeed - currentProj);
      const accelSpeed = Math.min(addSpeed, ACCEL * dt * maxSpeed);
      state.velocity.x += wishDir.x * accelSpeed;
      state.velocity.z += wishDir.z * accelSpeed;
    }

    // Jump
    if (keys.has('Space') && state.onGround && !state.crouching) {
      state.velocity.y = JUMP_IMPULSE;
      state.onGround = false;
    }

    // Gravity
    state.velocity.y -= GRAVITY * dt;

    // Footstep audio processing
    const stepMove = groundSpeed() * dt;
    if (state.onGround && stepMove > 0.01) {
      state.strideDist += stepMove;
      const stepInterval = state.sprinting ? 1.6 : 2.2;
      if (state.strideDist >= stepInterval) {
        state.strideDist = 0;
        audioEngine.footstep();
      }
    }

    // Axis-separated AABB collision against world colliders
    // X-axis move
    state.position.x += state.velocity.x * dt;
    updatePlayerBox();
    for (const box of colliders) {
      if (playerBox.intersectsBox(box)) {
        if (state.velocity.x > 0) state.position.x = box.min.x - RADIUS;
        else if (state.velocity.x < 0) state.position.x = box.max.x + RADIUS;
        state.velocity.x = 0;
        updatePlayerBox();
      }
    }

    // Z-axis move
    state.position.z += state.velocity.z * dt;
    updatePlayerBox();
    for (const box of colliders) {
      if (playerBox.intersectsBox(box)) {
        if (state.velocity.z > 0) state.position.z = box.min.z - RADIUS;
        else if (state.velocity.z < 0) state.position.z = box.max.z + RADIUS;
        state.velocity.z = 0;
        updatePlayerBox();
      }
    }

    // Y-axis move (Floor & platforms)
    state.position.y += state.velocity.y * dt;
    if (state.position.y <= 0) {
      state.position.y = 0;
      state.velocity.y = 0;
      state.onGround = true;
    } else {
      updatePlayerBox();
      state.onGround = false;
      for (const box of colliders) {
        if (playerBox.intersectsBox(box)) {
          if (state.velocity.y < 0) {
            state.position.y = box.max.y;
            state.velocity.y = 0;
            state.onGround = true;
          } else if (state.velocity.y > 0) {
            state.position.y = box.min.y - (state.crouching ? 1.1 : 1.8);
            state.velocity.y = 0;
          }
          updatePlayerBox();
        }
      }
    }
  }

  function updatePlayerBox() {
    const height = state.crouching ? 1.1 : 1.8;
    playerBox.min.set(state.position.x - RADIUS, state.position.y, state.position.z - RADIUS);
    playerBox.max.set(state.position.x + RADIUS, state.position.y + height, state.position.z + RADIUS);
  }

  function reset() {
    state.position.set(0, 0, -16);
    state.velocity.set(0, 0, 0);
    state.yaw = 0;
    state.pitch = 0;
    state.health = 100;
    state.armor = 50;
    state.alive = true;
    state.onGround = true;
  }

  return {
    state,
    look,
    recoil,
    groundSpeed,
    damage,
    step,
    reset,
  };
}
