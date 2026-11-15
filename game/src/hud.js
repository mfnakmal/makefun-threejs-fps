// Tactical Tournament HUD & Buy Menu UI for KILNFIRE
export function createHud() {
  const elCrosshair = document.getElementById('crosshair');
  const elHitmarker = document.getElementById('hitmarker');
  const elHp = document.getElementById('hp-value');
  const elHpBar = document.getElementById('hp-bar');
  const elArmor = document.getElementById('armor-value');
  const elArmorBar = document.getElementById('armor-bar');
  const elMoney = document.getElementById('money-value');
  const elAmmoMag = document.getElementById('ammo-mag');
  const elAmmoRes = document.getElementById('ammo-reserve');
  const elWeaponName = document.getElementById('weapon-name');
  const elTimer = document.getElementById('round-timer');
  const elRoundNum = document.getElementById('round-number');
  const elScoreCT = document.getElementById('score-ct');
  const elScoreT = document.getElementById('score-t');
  const elCtPips = document.getElementById('ct-pips');
  const elTPips = document.getElementById('t-pips');
  const elKillfeed = document.getElementById('killfeed');
  const elRadioFeed = document.getElementById('radio-feed');
  const elActionPrompt = document.getElementById('action-prompt');
  const elActionProgress = document.getElementById('action-progress');
  const elBuyMenu = document.getElementById('buy-menu');
  const elOverlay = document.getElementById('overlay');
  const elRoundBanner = document.getElementById('round-banner');

  let hitmarkerTimer = 0;

  return {
    showHit(isHeadshot) {
      if (elHitmarker) {
        elHitmarker.className = isHeadshot ? 'headshot' : 'on';
        hitmarkerTimer = isHeadshot ? 0.22 : 0.12;
      }
    },
    setHp(hp) {
      if (elHp) elHp.textContent = Math.max(0, Math.ceil(hp));
      if (elHpBar) elHpBar.style.width = `${Math.max(0, Math.min(100, hp))}%`;
    },
    setArmor(armor) {
      if (elArmor) elArmor.textContent = Math.max(0, Math.ceil(armor));
      if (elArmorBar) elArmorBar.style.width = `${Math.max(0, Math.min(100, (armor / 50) * 100))}%`;
    },
    setMoney(amt) {
      if (elMoney) elMoney.textContent = `$${amt.toLocaleString()}`;
    },
    setAmmo(mag, reserve) {
      if (elAmmoMag) elAmmoMag.textContent = mag;
      if (elAmmoRes) elAmmoRes.textContent = `/ ${reserve}`;
    },
    setWeapon(name) {
      if (elWeaponName) elWeaponName.textContent = name;
    },
    setTimer(text, isBomb = false) {
      if (elTimer) {
        elTimer.textContent = text;
        elTimer.style.color = isBomb ? '#e63946' : '#f0ede6';
      }
    },
    setScore(ct, t, round) {
      if (elScoreCT) elScoreCT.textContent = ct;
      if (elScoreT) elScoreT.textContent = t;
      if (elRoundNum) elRoundNum.textContent = `ROUND ${round} / 15`;
    },
    updatePips(ctAlive, tAlive) {
      if (elCtPips) {
        let html = '';
        for (let i = 0; i < 5; i++) {
          html += `<span class="pip ${i < ctAlive ? 'alive ct' : 'dead'}"></span>`;
        }
        elCtPips.innerHTML = html;
      }
      if (elTPips) {
        let html = '';
        for (let i = 0; i < 5; i++) {
          html += `<span class="pip ${i < tAlive ? 'alive t' : 'dead'}"></span>`;
        }
        elTPips.innerHTML = html;
      }
    },
    addKill(attacker, victim, weaponName, isHeadshot) {
      if (!elKillfeed) return;
      const row = document.createElement('div');
      row.className = 'kill-item';
      row.innerHTML = `<span class="kill-att">${attacker}</span> <span class="kill-wep">[${weaponName}${isHeadshot ? ' ★' : ''}]</span> <span class="kill-vic">${victim}</span>`;
      elKillfeed.prepend(row);
      setTimeout(() => {
        if (row.parentNode) row.parentNode.removeChild(row);
      }, 5000);
    },
    showRadio(sender, msg) {
      if (!elRadioFeed) return;
      elRadioFeed.textContent = `[RADIO] ${sender}: "${msg}"`;
      elRadioFeed.style.opacity = '1';
      setTimeout(() => {
        elRadioFeed.style.opacity = '0';
      }, 4000);
    },
    showActionPrompt(text, progress = null) {
      if (!elActionPrompt) return;
      elActionPrompt.style.display = 'block';
      elActionPrompt.querySelector('.text').textContent = text;
      const bar = elActionPrompt.querySelector('.bar');
      if (bar && progress !== null) {
        bar.style.display = 'block';
        bar.style.width = `${Math.min(100, Math.max(0, progress * 100))}%`;
      } else if (bar) {
        bar.style.display = 'none';
      }
    },
    hideActionPrompt() {
      if (elActionPrompt) elActionPrompt.style.display = 'none';
    },
    toggleBuyMenu(open, onBuyItem) {
      if (!elBuyMenu) return;
      elBuyMenu.hidden = !open;
      if (open && onBuyItem) {
        const buttons = elBuyMenu.querySelectorAll('[data-buy]');
        buttons.forEach((btn) => {
          btn.onclick = () => {
            const key = btn.getAttribute('data-buy');
            onBuyItem(key);
          };
        });
      }
    },
    isBuyMenuOpen() {
      return elBuyMenu && !elBuyMenu.hidden;
    },
    showRoundBanner(winner, reason) {
      if (!elRoundBanner) return;
      elRoundBanner.innerHTML = `<h2>${winner.toUpperCase()} WIN</h2><p>${reason}</p>`;
      elRoundBanner.style.display = 'block';
      setTimeout(() => {
        elRoundBanner.style.display = 'none';
      }, 4000);
    },
    showOverlay(type, onPlay) {
      if (!elOverlay) return;
      elOverlay.hidden = false;
      const btn = document.getElementById('play');
      if (btn && onPlay) btn.onclick = onPlay;
    },
    hideOverlay() {
      if (elOverlay) elOverlay.hidden = true;
    },
    step(dt, spread = 0) {
      if (hitmarkerTimer > 0) {
        hitmarkerTimer -= dt;
        if (hitmarkerTimer <= 0 && elHitmarker) {
          elHitmarker.className = '';
        }
      }
      // Dynamic crosshair expansion
      if (elCrosshair) {
        const gap = Math.min(24, Math.max(4, Math.floor(spread * 350)));
        elCrosshair.style.setProperty('--gap', `${gap}px`);
      }
    },
  };
}
