// 5v5 Tactical Bot Team AI Engine for KILNFIRE: Sensory Vision/Hearing, Objective Tactics, Hitboxes & Combat
import * as THREE from 'three';
import { PALETTE } from './palette.js';

export function createBotsSystem(scene, map, bombSystem, weaponsSystem, audioEngine, onRadioCallout, onKillEvent) {
  const ctVestMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(PALETTE.ctBlue), roughness: 0.6, metalness: 0.2 });
  const tVestMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(PALETTE.tRust), roughness: 0.6, metalness: 0.2 });
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xd4a373, roughness: 0.8 });
  const gearMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(PALETTE.hairline), roughness: 0.7, metalness: 0.3 });
  const weaponMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(PALETTE.crateMetal), roughness: 0.4, metalness: 0.7 });

  const bots = [];
  const hitMeshes = [];

  function buildBotMesh(team) {
    const root = new THREE.Group();

    // Torso (Vest)
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.72, 0.28), team === 'CT' ? ctVestMat : tVestMat);
    torso.position.y = 0.96;
    torso.castShadow = true;
    torso.userData.part = 'torso';

    // Head (Critical Hitbox)
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 10), skinMat);
    head.position.y = 1.48;
    head.castShadow = true;
    head.userData.part = 'head';

    // Helmet / Cap
    const helmet = new THREE.Mesh(new THREE.CylinderGeometry(0.165, 0.165, 0.1, 10), gearMat);
    helmet.position.y = 1.54;
    helmet.castShadow = true;

    // Legs
    const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.6, 0.18), gearMat);
    leftLeg.position.set(-0.14, 0.3, 0);
    leftLeg.castShadow = true;
    const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.6, 0.18), gearMat);
    rightLeg.position.set(0.14, 0.3, 0);
    rightLeg.castShadow = true;

    // Weapon model in hands
    const rifle = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 0.55), weaponMat);
    rifle.position.set(0.2, 1.05, 0.3);
    rifle.castShadow = true;

    root.add(torso, head, helmet, leftLeg, rightLeg, rifle);
    return { root, torso, head, leftLeg, rightLeg, rifle };
  }

  // Spawn definitions: 4 CT Teammates (CT 1..4, Player is CT 0) and 5 T Enemies (T 1..5)
  const botConfigs = [
    // CT Bots (Spawning at North)
    { id: 1, name: 'Vanguard', team: 'CT', spawn: new THREE.Vector3(-4, 0, -16), assignedSite: 'A' },
    { id: 2, name: 'Ghost', team: 'CT', spawn: new THREE.Vector3(-2, 0, -16), assignedSite: 'A' },
    { id: 3, name: 'Aegis', team: 'CT', spawn: new THREE.Vector3(2, 0, -16), assignedSite: 'B' },
    { id: 4, name: 'Specter', team: 'CT', spawn: new THREE.Vector3(4, 0, -16), assignedSite: 'B' },

    // T Bots (Spawning at South)
    { id: 5, name: 'Reaper', team: 'T', spawn: new THREE.Vector3(-4, 0, 16), isCarrier: true },
    { id: 6, name: 'Havoc', team: 'T', spawn: new THREE.Vector3(-2, 0, 16), isCarrier: false },
    { id: 7, name: 'Blitz', team: 'T', spawn: new THREE.Vector3(0, 0, 16), isCarrier: false },
    { id: 8, name: 'Venom', team: 'T', spawn: new THREE.Vector3(2, 0, 16), isCarrier: false },
    { id: 9, name: 'Apex', team: 'T', spawn: new THREE.Vector3(4, 0, 16), isCarrier: false },
  ];

  let targetSite = 'A'; // Team T round attack site decision

  for (const cfg of botConfigs) {
    const visual = buildBotMesh(cfg.team);
    scene.add(visual.root);

    const bot = {
      cfg,
      visual,
      health: 100,
      armor: 50,
      alive: true,
      state: 'IDLE', // 'IDLE', 'NAVIGATE', 'HOLD', 'COMBAT', 'PLANT', 'DEFUSE'
      targetWaypointIndex: 0,
      currentPos: cfg.spawn.clone(),
      velocity: new THREE.Vector3(),
      aimTarget: null,
      reactionTimer: 0.3,
      burstTimer: 0,
      burstCount: 0,
      walkCycle: Math.random() * Math.PI,
      isCarrier: cfg.isCarrier,
    };

    visual.torso.userData.bot = bot;
    visual.head.userData.bot = bot;
    hitMeshes.push(visual.torso, visual.head);
    bots.push(bot);
  }

  function resetRound(tSiteChoice = 'A') {
    targetSite = tSiteChoice;
    for (const bot of bots) {
      bot.health = 100;
      bot.armor = 50;
      bot.alive = true;
      bot.state = 'NAVIGATE';
      bot.reactionTimer = 0.2 + Math.random() * 0.25;
      bot.burstTimer = 0;
      bot.aimTarget = null;
      bot.currentPos.copy(bot.cfg.spawn);
      bot.visual.root.position.copy(bot.currentPos);
      bot.visual.root.visible = true;
      bot.visual.root.rotation.set(0, bot.cfg.team === 'CT' ? 0 : Math.PI, 0);

      // Initial waypoint route assignment
      if (bot.cfg.team === 'CT') {
        bot.targetWaypointIndex = bot.cfg.assignedSite === 'A' ? 4 : 5;
      } else {
        bot.targetWaypointIndex = targetSite === 'A' ? 16 : 19;
      }
    }
  }

  // Sensory System: Line of Sight Verification
  const raycaster = new THREE.Raycaster();
  function hasLineOfSight(fromPos, toPos) {
    const dir = new THREE.Vector3().subVectors(toPos, fromPos);
    const dist = dir.length();
    if (dist < 0.1) return true;
    dir.normalize();
    raycaster.set(fromPos, dir);
    raycaster.far = dist;
    const hits = raycaster.intersectObjects(map.shootables, false);
    return hits.length === 0;
  }

  function damageBot(bot, amount, isHead, attackerName = 'Player') {
    if (!bot.alive) return false;
    let actualDmg = isHead ? amount * 4 : amount;

    // Armor absorption (absorbs 66%)
    if (bot.armor > 0) {
      const absorbed = Math.min(bot.armor, Math.floor(actualDmg * 0.66));
      bot.armor -= absorbed;
      actualDmg -= absorbed;
    }
    bot.health -= actualDmg;

    if (bot.health <= 0) {
      bot.alive = false;
      bot.health = 0;
      bot.visual.root.visible = false;
      if (onKillEvent) {
        onKillEvent({
          victim: bot.cfg.name,
          victimTeam: bot.cfg.team,
          attacker: attackerName,
          isHeadshot: isHead,
        });
      }
      return true;
    }
    return false;
  }

  return {
    bots,
    hitMeshes,
    damageBot,
    resetRound,
    getAliveCount(team) {
      return bots.filter((b) => b.cfg.team === team && b.alive).length;
    },
    notifySound(soundPos, soundTeam) {
      for (const bot of bots) {
        if (!bot.alive || bot.cfg.team === soundTeam) continue;
        if (bot.currentPos.distanceTo(soundPos) < 26) {
          bot.visual.root.lookAt(soundPos.x, bot.currentPos.y, soundPos.z);
        }
      }
    },
    step(dt, playerRef, onBotShootPlayer) {
      for (const bot of bots) {
        if (!bot.alive) continue;

        const eyePos = bot.currentPos.clone().add(new THREE.Vector3(0, 1.45, 0));

        // 1. Vision Check for opposing enemies
        let nearestEnemy = null;
        let nearestDist = 999;

        // Check against player if player is enemy (Player is CT)
        if (bot.cfg.team === 'T' && playerRef.health > 0) {
          const pPos = playerRef.position.clone().add(new THREE.Vector3(0, 1.4, 0));
          const pDist = eyePos.distanceTo(pPos);
          if (pDist < 35 && hasLineOfSight(eyePos, pPos)) {
            nearestEnemy = { isPlayer: true, position: pPos, name: 'Player' };
            nearestDist = pDist;
          }
        }

        // Check against other bots
        if (!nearestEnemy) {
          for (const other of bots) {
            if (!other.alive || other.cfg.team === bot.cfg.team) continue;
            const oPos = other.currentPos.clone().add(new THREE.Vector3(0, 1.4, 0));
            const oDist = eyePos.distanceTo(oPos);
            if (oDist < nearestDist && hasLineOfSight(eyePos, oPos)) {
              nearestEnemy = { isPlayer: false, bot: other, position: oPos, name: other.cfg.name };
              nearestDist = oDist;
            }
          }
        }

        // 2. Combat State: Enemy spotted!
        if (nearestEnemy) {
          bot.visual.root.lookAt(nearestEnemy.position.x, bot.currentPos.y, nearestEnemy.position.z);
          bot.burstTimer -= dt;

          if (bot.burstTimer <= 0) {
            bot.burstTimer = 0.16; // Burst cadence
            // Bot shoots with spread
            const isHead = Math.random() < 0.22;
            const damage = isHead ? 44 : 18;

            if (nearestEnemy.isPlayer) {
              if (onBotShootPlayer) onBotShootPlayer(damage, isHead, bot.cfg.name);
            } else {
              damageBot(nearestEnemy.bot, damage, isHead, bot.cfg.name);
            }
          }
          continue; // Stop moving while firing for counter-strafe accuracy
        }

        // 3. Objective Navigation
        // T Bomb Carrier planting logic
        if (bot.isCarrier && bombSystem.state.status === 'IDLE') {
          const zone = bombSystem.checkInZone(bot.currentPos);
          if (zone) {
            bombSystem.startPlanting(bot.currentPos, bot.currentPos);
            if (onRadioCallout) onRadioCallout(bot.cfg.name, `Planting the Spike at Site ${zone}!`);
            continue;
          }
        }

        // CT Defusal logic
        if (bot.cfg.team === 'CT' && bombSystem.state.status === 'PLANTED') {
          const bombPos = map.siteZones[bombSystem.state.site]?.center;
          if (bombPos && bot.currentPos.distanceTo(bombPos) < 2.5 && bombSystem.state.status !== 'DEFUSING') {
            bombSystem.startDefusing(bot);
            if (onRadioCallout) onRadioCallout(bot.cfg.name, `I am defusing the Spike, cover me!`);
            continue;
          }
        }

        // Waypoint navigation traversal
        const targetWp = map.waypoints[bot.targetWaypointIndex];
        if (targetWp) {
          const dir = new THREE.Vector3().subVectors(targetWp.pos, bot.currentPos);
          dir.y = 0;
          const dist = dir.length();
          if (dist < 1.2) {
            // Pick next waypoint towards objective
            if (bot.cfg.team === 'T') {
              const targetNode = targetSite === 'A' ? 14 : 17;
              if (bot.targetWaypointIndex !== targetNode) {
                bot.targetWaypointIndex = targetNode;
              }
            } else {
              // CT rotate to planted site or hold
              if (bombSystem.state.status === 'PLANTED') {
                bot.targetWaypointIndex = bombSystem.state.site === 'A' ? 14 : 17;
              }
            }
          } else {
            dir.normalize();
            const moveSpeed = 3.6;
            bot.currentPos.addScaledVector(dir, moveSpeed * dt);
            bot.visual.root.position.copy(bot.currentPos);
            bot.visual.root.lookAt(targetWp.pos.x, bot.currentPos.y, targetWp.pos.z);

            // Stride walk animation
            bot.walkCycle += dt * 10;
            bot.visual.leftLeg.rotation.x = Math.sin(bot.walkCycle) * 0.45;
            bot.visual.rightLeg.rotation.x = -Math.sin(bot.walkCycle) * 0.45;
          }
        }
      }
    },
  };
}

