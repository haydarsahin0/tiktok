/* 12. Hafta — sahne 1: kanca. "Bu videonun yorumları, on ikinci haftada üç puanı kimin alacağına karar veriyor." */
const SWING = [['kocaeli', 'fb'], ['konya', 'bjk'], ['gs', 'samsun'], ['ts', 'eyup']];
const HS = (C.karar - C.kimin) / 4; // yarım salınım
const BURST = Array.from({ length: 12 }, (_, k) => 0.12 + k * 0.105); // kutudan fırlayan baloncuklar

function stamp(x, y, p, t, seed, label = '12. HAFTA', a = 1) {
  if (p <= 0 || a <= 0) return;
  const q = clamp(p, 0, 1), sc = lerp(3.2, 1, eOut5(q)), sq = q < 1 ? 1 + 0.16 * Math.sin(prog(q, 0.6, 1) * Math.PI) : 1;
  ctx.save(); ctx.globalAlpha *= a * clamp(q * 5, 0, 1); ctx.translate(x, y); ctx.rotate(-0.12); ctx.scale(sc * sq, sc / sq);
  if (q >= 1) splat(0, 0, 330, hexA(RD, 0.85), seed);
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 30; rr(-380, -130, 760, 260, 26); ctx.fillStyle = RD; ctx.fill(); ctx.restore();
  rr(-356, -106, 712, 212, 16); ctx.lineWidth = 8; ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.stroke();
  txt(label, 0, 4, { size: 190, color: '#fff', spacing: 4, max: 660 });
  ctx.restore();
}

function sHook(t) {
  bgNeutral(t);
  // kutuya hafif itiş (t=0'da durgun)
  const z = 1 + 0.1 * eOut(prog(t, 0.05, 1.3)) * (1 - eInOut(prog(t, 1.35, 1.75)));
  ctx.save(); ctx.translate(540, 1000); ctx.scale(z, z); ctx.translate(-540, -1000);

  const flip = prog(t, C.uc, C.uc + 0.5), gone = eIn(prog(t, C.uc - 0.05, C.uc + 0.35));
  const pend = t >= C.kimin - 0.06;
  // yörünge + para (sarkaç başlayınca para ayrı çizilir)
  if (!pend) {
    const fc = eOut(flip);
    if (flip > 0) rays(540, lerp(650, 800, fc), t * 0.6, GOLD, 18, 0.16 * fc, 1700);
    orbit(t, { spread: 1 + 1.4 * gone, alpha: 1 - gone, coin: { y: lerp(ORB.coinY, 800, fc), r: lerp(150, 330, eBack(flip, 1.2)), flip: eOut5(flip) * TAU * 3, glow: 0.55 + 0.6 * fc } });
    ring(t, C.puani, 540, 800, GOLD, 900, 30, 0.6);
  }
  chip(540, 360, 1 - prog(t, C.on, C.ikinci));
  pill(540, ORB.pillY, { t, alpha: 1 - prog(t, C.uc - 0.1, C.uc + 0.2), send: BURST.reduce((s, b) => s + bell(t, b - 0.02, b + 0.12), 0) });
  // baloncuklar kutudan fırlar
  BURST.forEach((b, k) => {
    const dt = t - b; if (dt < 0) return;
    const r = rng(50 + k), side = k % 2 ? 1 : -1, tx = 540 + side * (150 + r() * 120), f = eOut(prog(dt, 0, 0.35));
    const y = ORB.pillY - 60 - dt * 520 - 60 * f, blow = eIn(prog(t, C.uc - 0.1, C.uc + 0.3));
    const a = clamp(dt * 8, 0, 1) * (1 - prog(y, 560, 420)) * (1 - blow);
    bubble(k * 2 + 1, lerp(540, tx, f) + side * blow * 500, y, lerp(0.3, 0.8, eBack(prog(dt, 0, 0.3))), a, side * 0.05 * (1 - f) + (r() - 0.5) * 0.08);
  });
  ctx.restore();

  // "12. HAFTA" damgası
  const sp = prog(t, C.ikinci - 0.1, C.ikinci + 0.04), sOut = prog(t, C.uc - 0.08, C.uc + 0.14);
  ctx.save(); if (sOut > 0) { ctx.translate(540, 860); ctx.scale(1 + 1.2 * sOut, 1 + 1.2 * sOut); ctx.translate(-540, -860); }
  stamp(540, 860, sp, t, 11, '12. HAFTA', 1 - sOut);
  ctx.restore();

  // sarkaç: para iki logo arasında, çift her salınımda değişir
  if (pend) {
    const u = t - C.kimin, k = clamp(Math.floor(u / HS), 0, 3), done = prog(t, C.karar - 0.05, C.karar + 0.25);
    const [hm, aw] = SWING[k], [cl, cr] = pairCols(hm, aw);
    const cutA = 1 - prog(u - k * HS, 0, 0.08);
    ctx.save(); ctx.globalAlpha = 0.5 * (1 - done);
    ctx.fillStyle = cl; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(620, 0); ctx.lineTo(460, H); ctx.lineTo(0, H); ctx.fill();
    ctx.fillStyle = cr; ctx.beginPath(); ctx.moveTo(620, 0); ctx.lineTo(W, 0); ctx.lineTo(W, H); ctx.lineTo(460, H); ctx.fill(); ctx.restore();
    ctx.save(); ctx.globalAlpha = 0.05 * (1 - done); ctx.drawImage(STRIPES, 0, 0); ctx.restore();
    const A = 0.5, th = A * Math.sin((Math.PI * Math.min(u, 4 * HS)) / HS) * (1 - eOut(done));
    const ext = Math.abs(Math.sin((Math.PI * u) / HS));
    const L = 590, px = 540, py = 230, cx = px + Math.sin(th) * L, cy = lerp(py + Math.cos(th) * L, 640, eOut(done));
    const hitR = th > 0.4 ? ext : 0, hitL = th < -0.4 ? ext : 0;
    const sa = 1 - prog(t, C.karar - 0.05, C.karar + 0.1);
    sticker(hm, 255, 990, 230, { alpha: sa, sx: 1 - 0.12 * hitL, sy: 1 + 0.08 * hitL, rot: -0.12 * hitL });
    sticker(aw, 825, 990, 230, { alpha: sa, sx: 1 - 0.12 * hitR, sy: 1 + 0.08 * hitR, rot: 0.12 * hitR });
    txt(TM[hm].say, 255, 1150, { size: 62, stroke: 12, max: 420, alpha: sa });
    txt(TM[aw].say, 825, 1150, { size: 62, stroke: 12, max: 420, alpha: sa });
    ctx.save(); ctx.globalAlpha = sa; ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(px, py - 200); ctx.lineTo(cx, cy); ctx.stroke(); ctx.restore();
    rays(cx, cy, t, GOLD, 14, 0.1 + 0.1 * done, 1200);
    const absorb = BURST.length ? Array.from({ length: 14 }, (_, i) => bell(t, C.karar + 0.03 * i, C.karar + 0.03 * i + 0.16)).reduce((a, b) => a + b, 0) : 0;
    coin(cx, cy, lerp(170, 175, done) * (1 + 0.05 * absorb), { rot: -th * 0.6, glow: 0.7 + 0.3 * done });
    if (cutA > 0) { ctx.fillStyle = `rgba(255,255,255,${0.35 * cutA * (1 - done)})`; ctx.fillRect(0, 0, W, H); }
    // her şey paraya emilir
    for (let i = 0; i < 14; i++) {
      const r = rng(300 + i), ang = r() * TAU, d0 = 520 + r() * 260, t0 = C.karar - 0.25 + r() * 0.15, ts = C.karar + 0.03 * i;
      const app = eOut(prog(t, t0, t0 + 0.2)), suck = eIn(prog(t, ts, ts + 0.32)), d = d0 * (1 - suck), an = ang + suck * 2.2;
      if (suck >= 1) continue;
      bubble(i * 3 + 2, 540 + Math.cos(an) * d, 640 + Math.sin(an) * d * 1.2, 0.75 * (1 - suck * 0.8), app, an * 0.1);
    }
    ring(t, C.karar + 0.42, 540, 640, GOLD, 700, 26, 0.5);
    slamDuo('3 PUANI', 540, 1010, 230, prog(t, C.karar - 0.06, C.karar + 0.1), {}, -0.03);
    slamDuo('YORUMLAR VERİYOR', 540, 1180, 150, prog(t, C.veriyor - 0.06, C.veriyor + 0.1), { max: 900 }, -0.03);
  }
}
