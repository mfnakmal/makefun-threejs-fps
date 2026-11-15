# KILNFIRE: 5v5 Round-Based Tactical FPS

[![make.fun · threejs-fps-02](https://make.fun/badge/threejs-fps-02.svg)](https://make.fun/bounty/threejs-fps-02?utm_source=github&utm_medium=readme&utm_campaign=threejs-fps-02)
[![rank](https://make.fun/badge/threejs-fps-02/mfnakmal/makefun-threejs-fps/rank.svg)](https://make.fun/bounty/threejs-fps-02/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=threejs-fps-02)
[![reward](https://make.fun/badge/threejs-fps-02/mfnakmal/makefun-threejs-fps/reward.svg)](https://make.fun/bounty/threejs-fps-02?utm_source=github&utm_medium=readme&utm_campaign=threejs-fps-02)

Autonomous 5v5 round-based tactical first-person shooter built in pure Three.js 0.187.0 for make.fun's [threejs-fps-02](https://make.fun/bounty/threejs-fps-02) bounty ($1,000 prize pool).

## Features
- **5v5 Round-Based Tactical Gunplay**: Defend or infiltrate an industrial foundry across 15 competitive rounds.
- **Full Buy Economy (`B` key)**: Standard competitive cash flow ($800 pistol round, $3,250 win bonus, $1,400-$2,400 loss streak bonus, $300 kill rewards, armor shields).
- **Spike Plant & Defuse**: Dynamic objective zones at Site A (elevated casting platform) and Site B (industrial warehouse) with 45s fuse countdown, accelerating audio beeps, and defusal mechanics.
- **Tactical Bot AI Team**: 5v5 bot roster with sensory vision raycasting, sound hearing bus, angle holding, counter-strafe burst shooting, and tactical radio callouts.
- **Diverse Arsenal**:
  - `P12 Osprey`: Precision sidearm with high mobility and clean 1-tap headshot.
  - `Viper-9`: 800 RPM submachine gun designed for close-quarters mobility.
  - `Vandal-K`: Pinpoint first-shot assault rifle with 1-tap lethal headshot damage.
  - `Apex .50`: High-caliber bolt-action sniper rifle with lethal 1-shot elimination.
- **Procedural Canvas Textures**: In-memory generated textures for weathered kiln brick, concrete slabs, metal cargo containers, and hazard warning zones.
- **Procedural Web Audio Engine**: Zero-asset audio synthesis covering gunshots, mechanical reloads, hitmarkers, bomb beeps, and low-frequency explosions.
- **Zero Runtime Dependencies**: Pure ES modules and vendored Three.js 0.187.0 conforming strictly to gate caps.

## Run Locally
```bash
node serve.ts
# Open http://localhost:8080
```
