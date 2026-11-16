// 5v5 Tactical Bot Team AI Engine for KILNFIRE: Sensory Vision/Hearing, Objective Tactics, Hitboxes & Combat
import * as THREE from 'three';
import { PALETTE } from './palette.js';

export function createBotsSystem(scene, map, bombSystem, weaponsSystem, audioEngine, onRadioCallout, onKillEvent) {
  const ctVestMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.6, metalness: 0.25 });
  const tVestMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.6, metalness: 0.25 });
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xd4a373, roughness: 0.8 });
  const gearMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7, metalness: 0.35 });
  const weaponMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4, metalness: 0.8 });

  // Glowing tactical visor materials (like Top 1 Kilnyard)
  const ctVisorMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
  const tVisorMat = new THREE.MeshBasicMaterial({ color: 0xf87171 });

  const bots = [];
  const hitMeshes = [];

  function buildBotMesh(team) {
    const root = new THREE.Group();

    // Torso (Armor Vest with Pouches)
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.74, 0.3), team === 'CT' ? ctVestMat : tVestMat);
    torso.position.y = 0.96;
    torso.castShadow = true;
    torso.userData.part = 'torso';

    // Tactical Pouches on Vest
    const pouch1 = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.18, 0.08), gearMat);
    pouch1.position.set(-0.14, 0.88, 0.17);
    const pouch2 = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.18, 0.08), gearMat);
    pouch2.position.set(0.14, 0.88, 0.17);

    // Head (Critical Hitbox)
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 10), skinMat);
    head.position.y = 1.48;
    head.castShadow = true;
    head.userData.part = 'head';

    // Helmet
    const helmet = new THREE.Mesh(new THREE.CylinderGeometry(0.175, 0.175, 0.12, 12), gearMat);
    helmet.position.y = 1.54;
    helmet.castShadow = true;

    // Tactical Visor Strip (Glowing)
    const visor = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.05, 0.08),
      team === 'CT' ? ctVisorMat : tVisorMat,
    );
    visor.position.set(0, 1.48, 0.14);

    // Legs
    const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.62, 0.18), gearMat);
    leftLeg.position.set(-0.14, 0.31, 0);
    leftLeg.castShadow = true;
    const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.62, 0.18), gearMat);
    rightLeg.position.set(0.14, 0.31, 0);
    rightLeg.castShadow = true;

    // Operator Arms Holding Rifle
    const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.42, 0.12), team === 'CT' ? ctVestMat : tVestMat);
    leftArm.position.set(-0.28, 0.98, 0.16);
    leftArm.rotation.set(0.7, -0.2, 0.3);

    const rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.42, 0.12), team === 'CT' ? ctVestMat : tVestMat);
    rightArm.position.set(0.28, 0.98, 0.12);
    rightArm.rotation.set(0.8, 0.1, -0.3);

    // Weapon in hands
    const rifle = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 0.6), weaponMat);
    rifle.position.set(0.16, 1.05, 0.32);
    rifle.castShadow = true;

    root.add(torso, pouch1, pouch2, head, helmet, visor, leftLeg, rightLeg, leftArm, rightArm, rifle);
    return { root, torso, head, leftLeg, rightLeg, rifle };
  }

  // Spawn definitions: 4 CT Teammates (CT 1..4) and 5 T Enemies (T 1..5)
  const botConfigs = [
    // CT Bots (North)
    { id: 1, name: 'Vanguard', team: 'CT', spawn: new THREE.Vector3(-4, 0, -16), assignedSite: 'A' },
    { id: 2, name: 'Ghost', team: 'CT', spawn: new THREE.Vector3(-2, 0, -16), assignedSite: 'A' },
    { id: 3, name: 'Aegis', team: 'CT', spawn: new THREE.Vector3(2, 0, -16), assignedSite: 'B' },
    { id: 4, name: 'Specter', team: 'CT', spawn: new THREE.Vector3(4, 0, -16), assignedSite: 'B' },

    // T Bots (South)
    { id: 5, name: 'Reaper', team: 'T', spawn: new THREE.Vector3(-4, 0, 16), isCarrier: true },
    { id: 6, name: 'Havoc', team: 'T', spawn: new THREE.Vector3(-2, 0, 16), isCarrier: false },
    { id: 7, name: 'Blitz', team: 'T', spawn: new THREE.Vector3(0, 0, 16), isCarrier: false },
    { id: 8, name: 'Venom', team: 'T', spawn: new THREE.Vector3(2, 0, 16), isCarrier: false },
    { id: 9, name: 'Apex', team: 'T', spawn: new THREE.Vector3(4, 0, 16), isCarrier: false },
  ];

  let targetSite = 'A';

  for (const cfg of botConfigs) {
    const visual = buildBotMesh(cfg.team);
    scene.add(visual.root);

    const bot = {
      cfg,
      visual,
      pos: cfg.spawn.clone(),
      hp: 100,
      armor: 50,
      state: 'spawn', // 'patrol', 'combat', 'defuse', 'plant', 'dead'
      alive: true,
      target: null,
      currentWpIndex: 0,
      shootTimer: 0,
      fireGap: 0.14,
      reactionTimer: 0.25,
      yaw: cfg.team === 'CT' ? 0 : Math.PI,
    };

    visual.torso.userData.bot = bot;
    visual.head.userData.bot = bot;
    hitMeshes.push(visual.torso, visual.head);
    bots.push(bot);
  }

  function resetRound(attackSite = 'A') {
    targetSite = attackSite;
    for (const b of bots) {
      b.alive = true;
      b.hp = 100;
      b.armor = 50;
      b.pos.copy(b.cfg.spawn);
      b.visual.root.position.copy(b.pos);
      b.visual.root.visible = true;
      b.state = 'patrol';
      b.target = null;
      b.shootTimer = 0;
      b.yaw = b.cfg.team === 'CT' ? 0 : Math.PI;
      b.visual.root.rotation.y = b.yaw;
    }
  }

  function takeDamage(bot, dmg, isHeadshot, attackerName) {
    if (!bot.alive) return;
    const effectiveDmg = isHeadshot ? dmg * 3.5 : dmg;
    bot.hp -= effectiveDmg;
    audioEngine.bulletHit(isHeadshot);

    if (bot.hp <= 0) {
      bot.alive = false;
      bot.visual.root.visible = false;
      bot.state = 'dead';
      if (onKillEvent) {
        onKillEvent({
          attacker: attackerName,
          victim: bot.cfg.name,
          weapon: 'Vandal',
          isHeadshot,
        });
      }
    }
  }

  function update(dt, playerPos, playerAlive) {
    for (const b of bots) {
      if (!b.alive) continue;

      // Update position to visual mesh
      b.visual.root.position.copy(b.pos);
      b.visual.root.rotation.y = b.yaw;

      // Simple AI state machine
      if (b.cfg.team === 'T') {
        // T bots advance toward chosen Site
        const targetPos = targetSite === 'A' ? map.siteZones.A.center : map.siteZones.B.center;
        const dist = b.pos.distanceTo(targetPos);
        if (dist > 3.0) {
          const dir = new THREE.Vector3().subVectors(targetPos, b.pos).normalize();
          b.pos.addScaledVector(dir, 2.8 * dt);
          b.yaw = Math.atan2(dir.x, dir.z);
        }
      } else {
        // CT bots defend Site
        const defendSite = b.cfg.assignedSite === 'A' ? map.siteZones.A.center : map.siteZones.B.center;
        const dist = b.pos.distanceTo(defendSite);
        if (dist > 2.5) {
          const dir = new THREE.Vector3().subVectors(defendSite, b.pos).normalize();
          b.pos.addScaledVector(dir, 2.5 * dt);
          b.yaw = Math.atan2(dir.x, dir.z);
        }
      }
    }
  }

  return {
    bots,
    hitMeshes,
    resetRound,
    takeDamage,
    update,
    poseForShot(shotName) {
      if (shotName === 'combat') {
        // Position enemy T bot in direct line of sight at Site A
        const enemy = bots.find((b) => b.cfg.team === 'T');
        if (enemy) {
          enemy.pos.set(16.5, 0.5, -0.5);
          enemy.visual.root.position.copy(enemy.pos);
          enemy.visual.root.visible = true;
          enemy.visual.root.rotation.y = -Math.PI / 1.1;
        }
        // Position a CT teammate holding cover on the left
        const ct = bots.find((b) => b.cfg.team === 'CT');
        if (ct) {
          ct.pos.set(10.5, 0, -5.2);
          ct.visual.root.position.copy(ct.pos);
          ct.visual.root.visible = true;
          ct.visual.root.rotation.y = 2.6;
        }
      } else if (shotName === 'plant') {
        // Position teammate covering Site B
        const ct = bots.find((b) => b.cfg.team === 'CT');
        if (ct) {
          ct.pos.set(-13, 0.4, 4);
          ct.visual.root.position.copy(ct.pos);
          ct.visual.root.visible = true;
          ct.visual.root.rotation.y = 2.4;
        }
      }
    },
  };
}
