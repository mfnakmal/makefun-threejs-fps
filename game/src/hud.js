// Tactical Tournament HUD & Buy Menu UI for KILNFIRE
export function createHud() {
  const elRadar = document.getElementById('radar');
  const radarCtx = elRadar ? elRadar.getContext('2d') : null;

  const elHp = document.getElementById('hp-value');
  const elArmor = document.getElementById('armor-value');
  const elMoney = document.getElementById('money-value');
  const elAmmoMag = document.getElementById('ammo-mag');
  const elAmmoRes = document.getElementById('ammo-reserve');
  const elWeaponName = document.getElementById('weapon-name');
  const elTimer = document.getElementById('round-timer');
  const elRoundNum = document.getElementById('round-number');
  const elScoreCT = document.getElementById('score-ct');
  const elScoreT = document.getElementById('score-t');
  const elActionPrompt = document.getElementById('action-prompt');
  const elActionTitle = document.getElementById('action-title');
  const elActionFill = document.getElementById('action-bar-fill');
  const elRadioFeed = document.getElementById('radio-feed');
  const elBuyMenu = document.getElementById('buy-menu');
  const elVictoryModal = document.getElementById('victory-modal');
  const elOverlay = document.getElementById('overlay');

  function renderRadar(playerX = 0, playerZ = 0, playerYaw = 0, zoneTag = 'SITE A') {
    const elZoneTag = document.querySelector('.radar-zone-tag');
    if (elZoneTag) elZoneTag.textContent = zoneTag;
    if (!radarCtx) return;
    const ctx = radarCtx;
    const cx = 65;
    const cy = 65;
    const r = 60;

    ctx.clearRect(0, 0, 130, 130);

    // Background circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.clip();

    // Map outline / corridors relative to player
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-playerYaw);

    const scale = 1.8;
    const offX = -playerX * scale;
    const offZ = -playerZ * scale;

    // Boundary corridors
    ctx.fillStyle = 'rgba(51, 65, 85, 0.5)';
    ctx.fillRect(offX - 40, offZ - 40, 80, 80);
    ctx.fillStyle = 'rgba(30, 41, 59, 0.8)';
    ctx.fillRect(offX - 12, offZ - 36, 24, 72); // Mid lane
    ctx.fillRect(offX + 16, offZ - 20, 20, 40); // A lane
    ctx.fillRect(offX - 36, offZ - 20, 20, 40); // B lane

    // Site A marker
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(offX + 28, offZ, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('A', offX + 28, offZ);

    // Site B marker
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(offX - 28, offZ, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillText('B', offX - 28, offZ);

    // CT Teammates blips (Blue)
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(offX + 18, offZ + 8, 3.5, 0, Math.PI * 2);
    ctx.arc(offX - 8, offZ - 12, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // T Enemy blips (Red detected blips)
    ctx.fillStyle = '#f87171';
    ctx.beginPath();
    ctx.arc(offX + 26, offZ - 6, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Radar grid rings
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, 25, 0, Math.PI * 2);
    ctx.arc(cx, cy, 45, 0, Math.PI * 2);
    ctx.stroke();

    // Player arrow in center (pointing UP)
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.moveTo(cx, cy - 8);
    ctx.lineTo(cx + 6, cy + 6);
    ctx.lineTo(cx, cy + 3);
    ctx.lineTo(cx - 6, cy + 6);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  // Initial radar draw
  renderRadar(12, -2, 0.75);

  return {
    renderRadar,
    setHp(val) {
      if (elHp) elHp.textContent = val;
    },
    setArmor(val) {
      if (elArmor) elArmor.textContent = val;
    },
    setMoney(val) {
      if (elMoney) elMoney.textContent = `$${val}`;
    },
    setAmmo(mag, res) {
      if (elAmmoMag) elAmmoMag.textContent = mag;
      if (elAmmoRes) elAmmoRes.textContent = ` / ${res}`;
    },
    setWeaponName(name) {
      if (elWeaponName) elWeaponName.textContent = name;
    },
    setScore(ct, t) {
      if (elScoreCT) elScoreCT.textContent = ct;
      if (elScoreT) elScoreT.textContent = t;
    },
    setTimer(text) {
      if (elTimer) elTimer.textContent = text;
    },
    setRound(text) {
      if (elRoundNum) elRoundNum.textContent = text;
    },
    showActionPrompt(show, title = 'Arming the charge', progress = 0.65) {
      if (!elActionPrompt) return;
      elActionPrompt.hidden = !show;
      if (elActionTitle) elActionTitle.textContent = title;
      if (elActionFill) elActionFill.style.width = `${Math.round(progress * 100)}%`;
    },
    setRadioCallout(show, msg = 'Contact at Kiln Hall Site A, rotating') {
      if (!elRadioFeed) return;
      elRadioFeed.hidden = !show;
      if (show) elRadioFeed.innerHTML = `<span class="radio-tag">RADIO</span> ${msg}`;
    },
    toggleBuyMenu(open) {
      if (elBuyMenu) elBuyMenu.hidden = !open;
    },
    showVictoryScoreboard(open) {
      if (elVictoryModal) elVictoryModal.hidden = !open;
    },
    hideOverlay() {
      if (elOverlay) elOverlay.hidden = true;
    },
  };
}
