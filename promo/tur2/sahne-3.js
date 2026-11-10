/* 2. Tur — sahne 7: golsüz 4 maç ("…sizin maçlarınızda henüz gol yok. Taraftarınız neredeydi?")
   sahne 8: anlık puan tablosu + 6 turluk izleyici; sahne 9: "İkinci tur başladı!" */
const NOGOAL = RESULTS.filter((r) => !r.goal).map((r) => r.i);
const desat = (hex, k = 0.55) => { const [r, g, b] = hexRGB(hex), m = (r + g + b) / 3; return `rgb(${[r, g, b].map((v) => Math.round(lerp(v, m * 0.8, k))).join(',')})`; };
const NG = { cx: [305, 725], cy: [560, 1010], w: 380, h: 420 };
function ngCard(t, j) {
  const m = RESULTS[NOGOAL[j]], x = NG.cx[j % 2], y = NG.cy[Math.floor(j / 2)], tH = T.noGoalNames[2 * j] + 0.03, tA = T.noGoalNames[2 * j + 1] + 0.03;
  const p = prog(t, tH - 0.16, tH + 0.06); if (p <= 0) return;
  const s = eBack(p, 1.5), [cl, ca] = pairCols(m.home, m.away), sad = eOut(prog(t, T.henuzYok, T.henuzYok + 0.4)), w = NG.w, h = NG.h;
  ctx.save(); ctx.translate(x, y + 18 * sad); ctx.rotate((j % 2 ? 0.02 : -0.02) * sad); ctx.scale(s, s);
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 34; ctx.shadowOffsetY = 12; rr(-w / 2, -h / 2, w, h, 32); ctx.fillStyle = '#000'; ctx.fill(); ctx.restore();
  ctx.save(); rr(-w / 2, -h / 2, w, h, 32); ctx.clip();
  ctx.fillStyle = desat(cl); ctx.beginPath(); ctx.moveTo(-w / 2, -h / 2); ctx.lineTo(w / 2, -h / 2); ctx.lineTo(w / 2, -h * 0.18); ctx.lineTo(-w / 2, h * 0.12); ctx.fill();
  ctx.fillStyle = desat(ca); ctx.beginPath(); ctx.moveTo(-w / 2, h * 0.12); ctx.lineTo(w / 2, -h * 0.18); ctx.lineTo(w / 2, h / 2); ctx.lineTo(-w / 2, h / 2); ctx.fill();
  ctx.fillStyle = `rgba(0,0,0,${0.15 + 0.3 * sad})`; ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.strokeStyle = BG; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(-w / 2, h * 0.12); ctx.lineTo(w / 2, -h * 0.18); ctx.stroke();
  ctx.restore();
  rr(-w / 2 + 2, -h / 2 + 2, w - 4, h - 4, 30); ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.stroke();
  const ph = prog(t, tH - 0.08, tH + 0.1), pa = prog(t, tA - 0.08, tA + 0.1);
  if (ph > 0) sticker(m.home, -82, -100, 150 * eBack(ph, 2), { gray: 0.35 + 0.4 * sad });
  if (pa > 0) sticker(m.away, 82, 40, 150 * eBack(pa, 2), { gray: 0.35 + 0.4 * sad });
  ctx.save(); ctx.translate(0, 150); rr(-110, -44, 220, 88, 20); ctx.fillStyle = BG; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.stroke();
  tile(-46, 0, '0', 64, 72, '#bbb'); tile(46, 0, '0', 64, 72, '#bbb'); txt('-', 0, 0, { size: 40, color: '#888' }); ctx.restore();
  ctx.restore();
  ring(t, tH, x - 82, y - 100, '#fff', 260, 10, 0.4); ring(t, tA, x + 82, y + 40, '#fff', 260, 10, 0.4);
  // "Taraftarınız neredeydi?" soru işareti zıplar
  const qa = prog(t, T.nerede + j * 0.12, T.nerede + j * 0.12 + 0.15);
  if (qa > 0) { const b = Math.abs(Math.sin((t - T.nerede) * 7 + j)); txt('?', x + 92, y - 120 - 40 * b, { size: 150, color: '#fff', stroke: 14, alpha: qa, glow: 30, glowColor: CY }); }
}
function sNoGoal(t) {
  bgNeutral(t, 0.5);
  for (let j = 0; j < 4; j++) ngCard(t, j);
  const sp = prog(t, T.henuzYok, T.henuzYok + 0.16), up = eInOut(prog(t, T.nerede - 0.05, T.nerede + 0.3));
  if (sp > 0) { ctx.save(); ctx.translate(lerp(515, 540, up), lerp(785, 278, up)); const s = lerp(1, 0.56, up); ctx.scale(s, s); stamp('HENÜZ GOL YOK', 0, 0, 110, sp, { rot: lerp(-0.07, 0, up), col: '#d8d8e0', fill: false }); ctx.restore(); }
  flash(t, T.henuzYok, 0.2, 0.08);
  const pa = eOut5(prog(t, T.nerede + 0.05, T.nerede + 0.4));
  if (pa > 0) pill(540, 1310, { w: 780, h: 116, t, alpha: clamp(pa * 2, 0, 1), scale: lerp(0.6, 1, eBack(pa)) });
}

// ---------- sahne 8: tablo ----------
const TBL = { x0: 90, x1: 930, top: 378, row0: 414, rh: 54 };
const BASE = {}; VERI.table.forEach((r, i) => (BASE[r.id] = { ...r, rank: i }));
const NOW = {}; TABLE.forEach((r, i) => (NOW[r.id] = { ...r, rank: i, d: r.pts - BASE[r.id].p }));
function drawTable(t) {
  const mv = eInOut(prog(t, T.tabloShuffle, T.tabloShuffle + 0.6)), chipP = prog(t, T.tabloShuffle - 0.25, T.tabloShuffle), tick = t >= T.tabloShuffle + 0.25;
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 18; rr(TBL.x0, TBL.top, TBL.x1 - TBL.x0, 1394 - TBL.top, 26); ctx.fillStyle = PAPER; ctx.fill(); ctx.restore();
  const hd = { size: 24, weight: 800, color: '#8a857a' };
  txt('#', 128, 396, hd); txt('TAKIM', 218, 396, { ...hd, align: 'left', spacing: 2 }); txt('O', 690, 396, hd); txt('P', 870, 396, hd);
  for (let i = 0; i < 18; i++) if (i % 2) { ctx.fillStyle = 'rgba(0,0,0,.045)'; ctx.fillRect(TBL.x0 + 8, TBL.row0 + i * TBL.rh, TBL.x1 - TBL.x0 - 16, TBL.rh); }
  const rows = VERI.table.map((r) => ({ id: r.id, y: TBL.row0 + TBL.rh / 2 + lerp(BASE[r.id].rank, NOW[r.id].rank, mv) * TBL.rh, up: BASE[r.id].rank - NOW[r.id].rank }));
  rows.sort((a, b) => Math.abs(a.up) - Math.abs(b.up));
  rows.forEach(({ id, y, up }) => {
    if (mv > 0 && mv < 1 && up !== 0) { ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.3)'; ctx.shadowBlur = 20; rr(TBL.x0 + 6, y - TBL.rh / 2 + 2, TBL.x1 - TBL.x0 - 12, TBL.rh - 4, 10); ctx.fillStyle = up > 0 ? '#e3fbf9' : '#fde8ec'; ctx.fill(); ctx.restore(); }
    const rk = Math.round(lerp(BASE[id].rank, NOW[id].rank, mv)) + 1, d = NOW[id].d;
    txt(String(rk), 128, y, { size: 36, color: rk <= 4 ? '#0b7f7a' : rk >= 16 ? '#c3173d' : INK });
    sticker(id, 186, y, 44);
    txt(TM[id].short, 218, y, { size: 40, weight: 800, color: INK, align: 'left', max: 400 });
    txt(String(tick ? NOW[id].p : BASE[id].o), 690, y, { size: 36, weight: 800, color: '#77726a' });
    if (d > 0 && chipP > 0) { ctx.save(); ctx.translate(785, y); ctx.scale(eBack(chipP, 2), 1); rr(-40, -21, 80, 42, 21); ctx.fillStyle = d >= 3 ? GOLD : '#d9d4c7'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = d >= 3 ? '#a86f00' : '#9a9486'; ctx.stroke(); txt('+' + d, 0, 0, { size: 32, color: d >= 3 ? '#5a3a00' : '#4a463e' }); ctx.restore(); }
    txt(String(tick ? NOW[id].pts : BASE[id].p), 870, y, { size: 44, color: tick && d >= 3 ? '#b07800' : INK });
  });
}
const TRK_Y = 900;
function sTable(t) {
  bgNeutral(t, 0.6);
  radial(540, 900, 900, hexA(GOLD, 0.1));
  duo('ANLIK PUAN DURUMU', 540, 292, 64, { off: 3, spacing: 3 });
  txt('maçlar şimdi bitse', 540, 345, { size: 34, weight: 800, color: '#aab', spacing: 2 });
  const inq = eOut(prog(t, T.tablo - 0.1, T.tablo + 0.4));
  const am = eInOut(prog(t, T.ama - 0.05, T.ama + 0.3));
  ctx.save(); ctx.translate(540, 900 + (1 - inq) * 900); const s = 1 - 0.06 * am; ctx.scale(s, s); ctx.translate(-540, -900); drawTable(t); ctx.restore();
  for (const id of TABLE.slice(0, 18).map((r) => r.id)) if (NOW[id].d >= 3) { const y = TBL.row0 + TBL.rh / 2 + NOW[id].rank * TBL.rh; sparks(t, T.tabloShuffle + 0.3, 785, y, [GOLD, '#fff'], 8, 1200 + NOW[id].rank, 0.4, 0.45); }
  if (am > 0) {
    ctx.fillStyle = `rgba(6,6,10,${0.72 * am})`; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.globalAlpha = am; ctx.translate(0, (1 - am) * 120);
    rr(90, 700, 900 - 90 + 30, 400, 36); ctx.fillStyle = 'rgba(20,20,28,.92)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,.2)'; ctx.stroke();
    duo(`${ROUNDS_TOTAL} TURUN SADECE 1'İ BİTTİ`, 540, 790, 70, { max: 760 });
    const seg = prog(t, C.biri - 0.1, C.biri + 0.25);
    tracker(540, TRK_Y, { done: eOut(seg), t, label: 'TUR 1/' + ROUNDS_TOTAL, w: 760 });
    ctx.restore();
    sparks(t, C.biri + 0.15, 540 - 380 + 59, TRK_Y, [GOLD, '#fff'], 14, 1300, 0.6, 0.5);
  }
}
function sIkinci(t) {
  bgNeutral(t, 1.2);
  const hit = prog(t, C.ikinci, C.ikinci + 0.15);
  rays(540, TRK_Y, t * 0.6, CY, 18, 0.12 * hit, 1600); rays(540, TRK_Y, -t * 0.5, RD, 12, 0.1 * hit, 1600);
  rr(90, 700, 840, 400, 36); ctx.fillStyle = 'rgba(20,20,28,.92)'; ctx.fill();
  tracker(540, TRK_Y, { done: 1, lit: eOut(hit), t, label: 'TUR 2/' + ROUNDS_TOTAL, w: 760 });
  ring(t, C.ikinci, 540 - 380 + 59 + 127, TRK_Y, CY, 700, 24, 0.6);
  slamDuo('2. TUR', 540, 470, 210, prog(t, C.ikinci + 0.02, C.ikinci + 0.18), { color: '#fff' }, -0.04);
  slamDuo('BAŞLADI!', 540, 640, 140, prog(t, C.basladi + 0.02, C.basladi + 0.18), { color: CY }, 0.03);
  sparks(t, C.basladi + 0.05, 540, 640, [CY, RD, '#fff', GOLD], 40, 1400, 1.5, 0.8);
  const pa = prog(t, C.basladi + 0.15, C.basladi + 0.4);
  if (pa > 0) pill(540, 1250, { w: 780, h: 116, t, alpha: clamp(pa * 2, 0, 1), scale: lerp(0.5, 1, eBack(pa)) });
  flash(t, C.ikinci, 0.8, 0.12); flash(t, C.basladi, 0.5, 0.1);
}
