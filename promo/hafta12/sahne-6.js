/* 12. Hafta — sahne 9: canlı yayın. "Diğer bütün haftalar canlı yayında, gözünün önünde oynanacak."
   sahne 10: çağrı. "Kaçırmamak için takip et, videoyu beğen, ve takımının adını hemen yorumlara yaz… çünkü" → t=0 düzeni */
const PH = { x: 540, y: 880, w: 560, h: 980 };
function liveScreen(t) {
  const x0 = PH.x - PH.w / 2, y0 = PH.y - PH.h / 2;
  const g = ctx.createLinearGradient(0, y0, 0, y0 + PH.h); g.addColorStop(0, '#16161f'); g.addColorStop(1, '#0a0a10'); ctx.fillStyle = g; ctx.fillRect(x0, y0, PH.w, PH.h);
  radial(PH.x, y0 + 300, 420, hexA(CY, 0.12)); radial(PH.x, y0 + PH.h - 100, 420, hexA(RD, 0.14));
  // üst: CANLI + izleyici
  const pu = 0.6 + 0.4 * Math.sin(t * 8);
  rr(x0 + 24, y0 + 40, 150, 52, 12); ctx.fillStyle = RD; ctx.fill();
  ctx.fillStyle = `rgba(255,255,255,${pu})`; ctx.beginPath(); ctx.arc(x0 + 50, y0 + 66, 9, 0, TAU); ctx.fill();
  txt('CANLI', x0 + 112, y0 + 66, { size: 36, spacing: 2 });
  txt('👁 ' + fmtN(24180 + Math.floor((t - T.canli) * 137) * 3), x0 + PH.w - 30, y0 + 66, { size: 34, weight: 800, align: 'right', color: '#ddd' });
  txt('TARAFTAR LİGİ', PH.x, y0 + 130, { size: 40, spacing: 4, color: '#fff' });
  // maç karoları (13. hafta fikstürü, skor yok: taraftar çubukları)
  VERI.w13.slice(0, 4).forEach(([h, a], k) => {
    const cx = x0 + 145 + (k % 2) * 270, cy = y0 + 255 + Math.floor(k / 2) * 190, [cl, ca] = pairCols(h, a);
    const gl = k === 0 ? 1 - prog(t, T.goal, T.goal + 0.8) : 0, isG = k === 0 && t >= T.goal;
    rr(cx - 125, cy - 82, 250, 164, 18); ctx.fillStyle = isG && gl > 0 ? hexA(GOLD, 0.3 + 0.5 * gl) : 'rgba(255,255,255,.07)'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = isG && gl > 0 ? GOLD : 'rgba(255,255,255,.18)'; ctx.stroke();
    sticker(h, cx - 62, cy - 18, 82); sticker(a, cx + 62, cy - 18, 82);
    txt('VS', cx, cy - 18, { size: 30, color: '#bbb' });
    const f = 0.5 + 0.18 * Math.sin(t * (1.7 + k * 0.4) + k * 2);
    duelBar(cx, cy + 52, 200, f, cl, ca, { h: 16 });
    if (isG && gl > 0) { slamDuo('GOL!', cx, cy - 18, 90, prog(t, T.goal, T.goal + 0.12), { color: GOLD, off: 4 }); ring(t, T.goal, cx, cy, GOLD, 300, 14, 0.5); }
  });
  // canlı puan durumu (ilk 5)
  const ty = y0 + 560;
  txt('CANLI PUAN DURUMU', x0 + 32, ty, { size: 30, weight: 800, color: '#aaa', align: 'left', spacing: 2 });
  VERI.table.slice(0, 5).forEach((r, i) => {
    const y = ty + 46 + i * 44;
    txt(String(i + 1), x0 + 44, y, { size: 32, color: '#ccc' }); sticker(r.id, x0 + 90, y, 34);
    txt(TM[r.id].short, x0 + 120, y, { size: 32, weight: 800, align: 'left', color: '#fff' }); txt(String(r.p), x0 + PH.w - 120, y, { size: 34, color: GOLD });
  });
  // akan yorumlar
  ctx.save(); ctx.beginPath(); ctx.rect(x0, y0 + 812, PH.w, 168); ctx.clip();
  for (let k = 0; k < 8; k++) { const ph = ((t * 0.9 + k / 4) % 2) / 2, y = y0 + 1000 - ph * 240; bubble(k * 3 + 1, x0 + 170 + (k % 2) * 30, y, 0.5, Math.sin(ph * Math.PI)); }
  ctx.restore();
  // kalpler (sağ kenar)
  for (let k = 0; k < 9; k++) { const r = rng(700 + k), ph = (t * 0.7 + r()) % 1; heart(x0 + PH.w - 50 + Math.sin(t * 3 + k) * 18, y0 + PH.h - 80 - ph * 420, 34 + r() * 20, k % 3 ? RD : '#ff8fb1', Math.sin(ph * Math.PI)); }
}
function sLive(t) {
  bgNeutral(t, 0.7);
  // tablo geriye yatar ve kararır
  const tilt = eInOut(prog(t, T.canli, T.canli + 0.45));
  ctx.save(); ctx.translate(540, lerp(0, -220, tilt)); ctx.translate(0, 900); ctx.scale(lerp(1, 0.8, tilt), lerp(1, 0.5, tilt)); ctx.translate(-540, -900);
  drawTable(t, { alpha: 1 - 0.75 * tilt }); ctx.restore();
  const flip = prog(t, C.canli - 0.12, C.canli + 0.18);
  band(t, 540, 318, 1, flip < 0.5 ? 'sadece' : 'live', flip);
  // telefon ekranı aşağıdan gelir, "gözünün önünde" ekran kadrajı doldurur
  const sl = eOut5(prog(t, T.canli + 0.1, T.canli + 0.55)), push = eInOut(prog(t, T.push - 0.05, T.push + 0.4));
  ctx.save(); ctx.translate(0, (1 - sl) * 1300); ctx.translate(540, 880); const z = lerp(1, 1.6, push); ctx.scale(z, z); ctx.translate(-540, -880);
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.7)'; ctx.shadowBlur = 60; rr(PH.x - PH.w / 2 - 22, PH.y - PH.h / 2 - 22, PH.w + 44, PH.h + 44, 64); ctx.fillStyle = '#050507'; ctx.fill(); ctx.restore();
  rr(PH.x - PH.w / 2 - 22, PH.y - PH.h / 2 - 22, PH.w + 44, PH.h + 44, 64); ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.stroke();
  ctx.save(); rr(PH.x - PH.w / 2, PH.y - PH.h / 2, PH.w, PH.h, 44); ctx.clip(); liveScreen(t); ctx.restore();
  ctx.restore();
}

// ---------- CTA ----------
const AV = { x: 540, y: 600, d: 300 };
const TYPE = ['GALATASARAY', 'TRABZON', 'AMED', 'FENERBAHÇE'];
function typedAt(t) { // yazılıp gönderilen takım adları
  const t0 = C.takiminin, t1 = C.cunku - 0.05, slot = (t1 - t0) / TYPE.length;
  if (t < t0 || t >= t1) return { s: '', send: 0 };
  const k = Math.floor((t - t0) / slot), u = (t - t0 - k * slot) / slot, w = TYPE[k];
  return { s: w.slice(0, Math.ceil(w.length * clamp(u / 0.65, 0, 1))), send: bell(u, 0.72, 0.95), k, sentAt: t0 + k * slot + slot * 0.8 };
}
function check(x, y, s, col) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.strokeStyle = col; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(-18, 0); ctx.lineTo(-5, 14); ctx.lineTo(20, -14); ctx.stroke(); ctx.restore(); }
function sCta(t) {
  bgNeutral(t);
  const back = prog(t, C.ve2 - 0.05, C.ve2 + 1.0); // yörünge geri gelir
  const settle = prog(t, T.settle - 0.1, T.settle + 0.45);
  // 1) avatar + takip et
  const avOut = eIn(prog(t, C.videoyu - 0.1, C.videoyu + 0.15));
  if (avOut < 1) {
    const s = 1 - avOut;
    sticker('tl', AV.x, AV.y, AV.d * s * (1 + 0.06 * bell(t, T.tap, T.tap + 0.25)));
    const tapped = t >= T.tap, by = AV.y + AV.d / 2 + 10;
    ctx.save(); ctx.globalAlpha = s; ctx.translate(AV.x, by); const bs = (1 + 0.35 * bell(t, T.tap, T.tap + 0.2)) * s; ctx.scale(bs, bs);
    ctx.beginPath(); ctx.arc(0, 0, 46, 0, TAU); ctx.fillStyle = tapped ? '#fff' : RD; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = BG; ctx.stroke();
    if (tapped) check(0, 0, 1.3, RD); else { ctx.fillStyle = '#fff'; ctx.fillRect(-20, -5, 40, 10); ctx.fillRect(-5, -20, 10, 40); }
    ctx.restore();
    ring(t, T.tap, AV.x, by, '#fff', 200, 14, 0.45);
    const fi = prog(t, T.tap - 0.4, T.tap), fo = prog(t, T.tap + 0.1, T.tap + 0.4);
    if (fi > 0 && fo < 1) emoji('👆', lerp(760, AV.x + 30, eOut(fi)), lerp(1250, by + 70, eOut(fi)) - 20 * bell(t, T.tap - 0.05, T.tap + 0.1), 120, -0.2, 1 - fo);
    slamDuo('TAKİP ET', 500, 1060, 190, prog(t, C.takip - 0.06, C.takip + 0.1), { alpha: s });
    const aa = prog(t, C.et, C.et + 0.15) * s;
    arrow(800 + 14 * Math.sin(t * 12), 1060, 0, 190, '#fff', aa);
  }
  // 2) beğen: dev kalp
  const hIn = Math.max(prog(t, C.videoyu + 0.05, T.heart + 0.12) * 0.01, prog(t, T.heart - 0.06, T.heart + 0.12)), h0 = eBack(prog(t, C.videoyu + 0.05, C.videoyu + 0.25), 2), hOut = eIn(prog(t, C.ve2 - 0.05, C.ve2 + 0.25));
  [C.videoyu + 0.2, C.videoyu + 0.34].forEach((tt) => ring(t, tt, 560, 760, '#fff', 160, 10, 0.3));
  if (hIn > 0 && hOut < 1) {
    const s = Math.max(0.32 * h0 * (1 + 0.08 * Math.sin(t * 20)), eBack(prog(t, T.heart - 0.06, T.heart + 0.12), 2.2)) * (1 - hOut);
    radial(540, 760, 600, hexA(RD, 0.4 * s));
    heart(540, 780, 520 * s * (1 + 0.04 * Math.sin(t * 14)), RD, 1, -0.06);
    for (let k = 0; k < 16; k++) { const r = rng(800 + k), a = r() * TAU, dt = t - T.heart, d = eOut(clamp(dt / 0.7, 0, 1)) * (260 + r() * 260); if (dt > 0 && dt < 0.9) heart(540 + Math.cos(a) * d, 760 + Math.sin(a) * d - dt * 120, 40 + r() * 40, k % 2 ? RD : '#ff8fb1', 1 - dt / 0.9, a); }
    ctx.save(); ctx.globalAlpha = 1 - hOut; txt('❤ ' + fmtN(lerp(9800, 12418, eOut(prog(t, T.heart, T.heart + 0.6)))), 540, 1040, { size: 66, stroke: 10 }); ctx.restore();
    slamDuo('BEĞEN', 470, 1190, 200, prog(t, C.begen - 0.04, C.begen + 0.12), { alpha: 1 - hOut });
    arrow(720 + 14 * Math.sin(t * 12), 1190, 0, 240, '#fff', prog(t, C.begen + 0.15, C.begen + 0.3) * (1 - hOut));
  }
  // 3) yaz: yörünge, para, yorum kutusu t=0 düzenine döner
  if (back > 0) {
    const ci = eOut(prog(t, C.ve2, C.ve2 + 0.45));
    orbit(t, { fly: back, coin: { y: lerp(-260, ORB.coinY, ci), flip: (1 - ci) * 10, alpha: 1 } });
    const pin = eOut5(prog(t, C.ve2 + 0.05, C.ve2 + 0.4)), ty = typedAt(t);
    pill(540, lerp(1700, ORB.pillY, pin), { t, typed: ty.s, send: ty.send });
    // gönderilen adlar baloncuk olup yükselir
    for (let k = 0; k < TYPE.length; k++) {
      const slot = (C.cunku - 0.05 - C.takiminin) / TYPE.length, st = C.takiminin + k * slot + slot * 0.8, dt = t - st;
      if (dt < 0 || dt > 0.9) continue;
      const id = { GALATASARAY: 'gs', TRABZON: 'ts', AMED: 'amed', FENERBAHÇE: 'fb' }[TYPE[k]], bi = NICKS.findIndex((n) => n[1] === id);
      bubble(bi, 540 + (k % 2 ? 160 : -160) * eOut(clamp(dt * 3, 0, 1)), ORB.pillY - 60 - dt * 560, 0.78, Math.min(1, (0.9 - dt) * 4));
    }
    const wa = prog(t, C.takiminin - 0.05, C.takiminin + 0.1) * (1 - settle);
    slamDuo('TAKIMINI YAZ', 540, 1262, 150, prog(t, C.takiminin - 0.06, C.takiminin + 0.1), { alpha: 1 - settle });
    for (const sx of [150, 930]) { const b = 16 * Math.abs(Math.sin(t * 7)); arrow(sx, 1215 + b, Math.PI / 2, 110, CY, wa); }
  }
  chip(540, 360, prog(t, T.settle - 0.3, T.settle + 0.3));
}
