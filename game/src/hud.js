// Tactical DOM HUD: precision crosshair, directional hitmarkers, ammo counters,
// round score readout, and mission status modal overlay.
const COPY = {
  start: {
    title: 'Tactical Greybox Range',
    copy: 'A closed tactical CQB training ground, hitscan service rifle, and reactive hostile bots. Click to engage.',
    action: 'Click to play',
  },
  paused: {
    title: 'Tactical Greybox Range',
    copy: 'Simulation paused. Click to resume combat training.',
    action: 'Click to resume',
  },
  end: {
    title: 'Objective Cleared',
    copy: 'All hostile combatants neutralized. Target sector secure.',
    action: 'Play again',
  },
};

export function createHud() {
  const overlay = document.getElementById('overlay');
  const title = document.getElementById('overlay-title');
  const copy = document.getElementById('overlay-copy');
  const play = document.getElementById('play');
  const ammo = document.getElementById('ammo');
  const ammoMag = document.getElementById('ammo-mag');
  const ammoReserve = document.getElementById('ammo-reserve');
  const scoreValue = document.getElementById('score-value');
  const hitmarker = document.getElementById('hitmarker');
  let hitTimer = 0;
  let lastMag = -1;
  let lastReserve = -1;
  let lastScore = -1;

  return {
    setAmmo(mag, reserve) {
      if (mag === lastMag && reserve === lastReserve) return;
      lastMag = mag;
      lastReserve = reserve;
      ammoMag.textContent = String(mag);
      ammoReserve.textContent = String(reserve);
    },
    setScore(score) {
      if (score === lastScore) return;
      lastScore = score;
      scoreValue.textContent = String(score);
    },
    showHit() {
      hitmarker.classList.add('on');
      hitTimer = 0.12;
    },
    step(dt) {
      if (hitTimer > 0) {
        hitTimer -= dt;
        if (hitTimer <= 0) hitmarker.classList.remove('on');
      }
    },
    showOverlay(kind, onPlay) {
      const data = COPY[kind];
      title.textContent = data.title;
      copy.textContent = data.copy;
      play.textContent = data.action;
      overlay.classList.add('on');
      play.onclick = () => {
        overlay.classList.remove('on');
        onPlay();
      };
    },
    hideOverlay() {
      overlay.classList.remove('on');
    },
    hideHud() {
      ammo.style.display = 'none';
      document.getElementById('score').style.display = 'none';
      document.getElementById('crosshair').style.display = 'none';
    },
  };
}
