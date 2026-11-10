/* 2. Tur — sahne 13: "Ve en önemlisi: yorumunun sayılması için videoyu beğenmen şart." (kilit → kalp → açılır)
   sahne 14: "Beğen, takip et, takımını yorumlara yaz… çünkü" → t=0 tabelası */
function heartPath(s) {
  ctx.scale(s / 100, s / 100); ctx.beginPath(); ctx.moveTo(0, 35); ctx.bezierCurveTo(-60, -5, -55, -60, -25, -60); ctx.bezierCurveTo(-8, -60, 0, -45, 0, -35); ctx.bezierCurveTo(0, -45, 8, -60, 25, -60); ctx.bezierCurveTo(55, -60, 60, -5, 0, 35); ctx.closePath();
}
function bigComment(x, y, s, valid, a = 1) {
  if (a <= 0 || s <= 0.01) return; const w = 660, h = 170;
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.scale(s, s);
  ctx.save(); ctx.shadowColor = valid > 0 ? hexA('#1fbf6a', 0.8) : 'rgba(0,0,0,.5)'; ctx.shadowBlur = 30 + 30 * valid; rr(-w / 2, -h / 2, w, h, 44); ctx.fillStyle = valid > 0 ? '#fbfbfd' : lerpCol(valid); ctx.fill(); ctx.restore();
  ctx.fillStyle = valid > 0 ? '#fbfbfd' : lerpCol(valid); ctx.beginPath(); ctx.moveTo(-w / 2 + 60, h / 2 - 4); ctx.lineTo(-w / 2 + 50, h / 2 + 40); ctx.lineTo(-w / 2 + 110, h / 2 - 4); ctx.fill();
  if (valid > 0) { rr(-w / 2, -h / 2, w, h, 44); ctx.lineWidth = 8; ctx.strokeStyle = '#1fbf6a'; ctx.stroke(); }
  anon(-w / 2 + 90, 0, 110, valid > 0 ? '#8a8a98' : '#55555f');
  txt('senin yorumun', -w / 2 + 170, -36, { size: 34, weight: 800, color: '#8a8a98', align: 'left' });
  txt('TAKIMININ ADI', -w / 2 + 170, 22, { size: 70, color: valid > 0 ? INK : '#77777f', align: 'left' });
  ctx.restore();
}
const lerpCol = () => '#c9c9d2';
function sLike(t) {
  ctx.fillStyle = '#060609'; ctx.fillRect(0, 0, W, H);
  // spot ışığı
  const sp = eOut(prog(t, C.ve3 - 0.05, C.ve3 + 0.4));
  ctx.save(); ctx.globalAlpha = 0.55 * sp; const g = ctx.createLinearGradient(0, 0, 0, 1500); g.addColorStop(0, 'rgba(255,250,230,.55)'); g.addColorStop(1, 'rgba(255,250,230,0)'); ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(460, -20); ctx.lineTo(620, -20); ctx.lineTo(1000, 1500); ctx.lineTo(80, 1500); ctx.closePath(); ctx.fill(); ctx.restore();
  radial(540, 900, 700, 'rgba(255,240,200,.18)', sp);
  ctx.save(); ctx.globalAlpha = 0.04; ctx.drawImage(DOTS, 0, 0); ctx.restore();
  slamDuo('EN ÖNEMLİSİ', 540, 360, 140, prog(t, C.onemlisi - 0.05, C.onemlisi + 0.12), { color: GOLD }, -0.03);
  const unlock = prog(t, T.begeniUnlock + 0.06, T.begeniUnlock + 0.3), valid = prog(t, T.begeniUnlock + 0.25, T.begeniUnlock + 0.45);
  const bc = eBack(prog(t, T.begeniLock - 0.05, T.begeniLock + 0.25));
  bigComment(540, 700, bc, valid, clamp(bc * 2, 0, 1));
  // kilit
  const lk = prog(t, C.sayilmasi - 0.05, C.sayilmasi + 0.12), fly = eIn(prog(t, T.begeniUnlock + 0.3, T.begeniUnlock + 0.8));
  if (lk > 0 && fly < 1) padlock(830 + fly * 300, 610 + fly * fly * 900 - 40 * eOut(unlock), lerp(2, 0.85, eOut5(lk)), eOut(unlock), clamp(lk * 4, 0, 1) * (1 - fly), fly * 2.5 + 0.1);
  if (lk > 0) sparks(t, C.sayilmasi + 0.07, 830, 650, ['#fff', GOLD], 16, 1700, 0.8, 0.5);
  // damga: SAYILMADI → SAYILDI
  const sm = prog(t, C.icin - 0.05, C.icin + 0.1);
  if (sm > 0 && valid < 1) stamp('SAYILMADI', 470, 870, 80, sm, { col: RD, rot: -0.07, a: 1 - valid });
  if (valid > 0) stamp('SAYILDI', 470, 870, 80, valid, { col: '#1fbf6a', rot: -0.07, fill: true });
  if (valid > 0) check(660, 870, 1.6 * eBack(valid, 2), '#1fbf6a');
  // kalp: "videoyu" görünür, "beğenmen"de çift dokunuş
  const ha = eBack(prog(t, C.videoyu - 0.05, C.videoyu + 0.25)), tapT = T.begeniUnlock;
  if (ha > 0) {
    const filled = t >= tapT, pop = bell(t, tapT, tapT + 0.3), hx = 420, hy = 1150, s = 300 * ha * (1 + 0.25 * pop);
    if (filled) radial(hx, hy, 380, hexA(RD, 0.45));
    ctx.save(); ctx.translate(hx, hy); heartPath(s); if (filled) { ctx.fillStyle = RD; ctx.shadowColor = RD; ctx.shadowBlur = 40; ctx.fill(); } else { ctx.fillStyle = 'rgba(255,255,255,.06)'; ctx.fill(); ctx.lineWidth = 9 * 100 / s; ctx.strokeStyle = '#fff'; ctx.stroke(); } ctx.restore();
    // dokunuş halkaları (çift)
    for (const dt of [-0.18, 0]) { ring(t, tapT + dt, hx + 20, hy - 10, '#fff', 260, 12, 0.35); const q = prog(t, tapT + dt - 0.05, tapT + dt + 0.05); if (q > 0 && q < 1) { ctx.beginPath(); ctx.arc(hx + 20, hy - 10, 40, 0, TAU); ctx.fillStyle = `rgba(255,255,255,${0.6 * Math.sin(q * Math.PI)})`; ctx.fill(); } }
    if (filled) { const r = rng(1800); for (let k = 0; k < 12; k++) { const dt = t - tapT, a = r() * TAU, v = 300 + r() * 500, q = clamp(dt / 0.9, 0, 1); if (q < 1) heart(hx + Math.cos(a) * v * eOut(q), hy + Math.sin(a) * v * eOut(q) - 120 * q, 50 + r() * 40, k % 2 ? RD : '#ff8fb1', 1 - q, (r() - 0.5)); } }
    sparks(t, tapT, hx, hy, [RD, '#fff', '#ff8fb1'], 30, 1900, 1.3, 0.7);
  }
  // sağ kenardaki beğeni düğmesini gösteren ok
  const ar = prog(t, tapT + 0.2, tapT + 0.45);
  if (ar > 0) { const pu = 0.5 + 0.5 * Math.sin((t - tapT) * 10); arrow(640 + 30 * pu, 1060, -0.17, 300 * eOut(ar), GOLD, ar); }
  // BEĞEN = YORUMUN SAYILIR
  slamDuo('BEĞEN = YORUMUN SAYILIR', 540, 1340, 84, prog(t, C.sart - 0.03, C.sart + 0.13), { max: 860, color: '#fff' });
  flash(t, tapT, 0.55, 0.1); flash(t, C.sayilmasi, 0.25, 0.06);
}
// ---------- CTA ----------
const TYPE = ['BEŞİKTAŞ', 'GALATASARAY', 'TRABZONSPOR', 'AMEDSPOR'];
function typedAt(t) {
  const t0 = C.takimini + 0.15, t1 = T.settle - 0.05, slot = (t1 - t0) / TYPE.length;
  if (t < t0 || t >= t1) return { s: '', send: 0 };
  const k = Math.floor((t - t0) / slot), u = (t - t0 - k * slot) / slot, w = TYPE[k];
  return { s: w.slice(0, Math.ceil(w.length * clamp(u / 0.65, 0, 1))), send: bell(u, 0.72, 0.95) };
}
const CTA_X = [215, 510, 805], CTA_Y = 640;
function sCta(t) {
  bgNeutral(t);
  const out = eIn(prog(t, T.settle - 0.02, T.settle + 0.25)), A = 1 - out;
  if (A > 0) {
    ctx.save(); ctx.globalAlpha = A; ctx.translate(540, 800); ctx.scale(1 - 0.3 * out, 1 - 0.3 * out); ctx.translate(-540, -800);
    chipT('2. TUR BAŞLADI', 540, 300, prog(t, T.cta, T.cta + 0.2));
    const beat = [T.heart, C.takip, T.pill], lab = ['BEĞEN', 'TAKİP ET', 'TAKIMINI YAZ'];
    for (let k = 0; k < 3; k++) {
      const p = prog(t, beat[k] - 0.06, beat[k] + 0.2); if (p <= 0) continue;
      const x = CTA_X[k], s = eBack(p, 2) * (1 + 0.1 * bell(t, beat[k], beat[k] + 0.3));
      ring(t, beat[k], x, CTA_Y, k === 0 ? RD : k === 1 ? '#fff' : CY, 300, 14, 0.45);
      ctx.save(); ctx.translate(x, CTA_Y); ctx.scale(s, s);
      if (k === 0) { ctx.beginPath(); ctx.arc(0, 0, 95, 0, TAU); ctx.fillStyle = '#1e1e27'; ctx.fill(); heart(0, 8, 150, RD); }
      else if (k === 1) {
        sticker('tl', 0, 0, 180);
        const tapped = t >= T.tap, bs = 1 + 0.35 * bell(t, T.tap, T.tap + 0.2);
        ctx.save(); ctx.translate(0, 92); ctx.scale(bs, bs); ctx.beginPath(); ctx.arc(0, 0, 34, 0, TAU); ctx.fillStyle = tapped ? '#fff' : RD; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = BG; ctx.stroke();
        if (tapped) check(0, 0, 0.9, RD); else { ctx.fillStyle = '#fff'; ctx.fillRect(-15, -4, 30, 8); ctx.fillRect(-4, -15, 8, 30); } ctx.restore();
      } else { ctx.beginPath(); ctx.arc(0, 0, 95, 0, TAU); ctx.fillStyle = '#1e1e27'; ctx.fill(); emoji('💬', 0, 4, 110); }
      ctx.restore();
      txt(lab[k], x, CTA_Y + 170, { size: 52, spacing: 2, stroke: 8, alpha: clamp(p * 3, 0, 1), color: k === 0 ? '#ff6b8a' : k === 2 ? CY : '#fff' });
    }
    if (t >= T.heart) { const r = rng(2100); for (let k = 0; k < 8; k++) { const ph = ((t - T.heart) * 0.9 + r()) % 1; heart(CTA_X[0] + Math.sin(t * 3 + k) * 30, CTA_Y - 60 - ph * 260, 34 + r() * 20, k % 2 ? RD : '#ff8fb1', Math.sin(ph * Math.PI) * 0.8); } }
    const pa = eOut5(prog(t, T.pill - 0.05, T.pill + 0.3));
    if (pa > 0) {
      const ty = typedAt(t); pill(540, 1060 + (1 - pa) * 400, { w: 800, h: 124, t, typed: ty.s, send: ty.send, alpha: pa });
      const pu = Math.abs(Math.sin((t - T.pill) * 6));
      arrow(540, 1170 + 20 * pu, Math.PI / 2, 140, CY, prog(t, C.yaz - 0.05, C.yaz + 0.15));
    }
    ctx.restore();
  }
  // "çünkü" → t=0 tabelası
  const rowP = (k) => eOut5(prog(t, T.settle + 0.05 + k * 0.035, T.settle + 0.35 + k * 0.035));
  if (t >= T.settle) {
    chipT('12. HAFTA · 1. TUR', 540, 300, prog(t, T.settle + 0.15, T.settle + 0.4));
    board(t, { a: (k) => clamp(rowP(k) * 3, 0, 1), dx: (k) => (1 - rowP(k)) * (k % 2 ? 1 : -1) * 1100 });
  }
}
