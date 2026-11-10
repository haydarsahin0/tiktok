/* 2. Tur — yeni öğeler: skor tabelası (split-flap), damga, kilit, tur izleyici, kale, anonim avatar, tik. */
function check(x, y, s, col, a = 1) { if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.scale(s, s); ctx.strokeStyle = col; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(-18, 0); ctx.lineTo(-5, 14); ctx.lineTo(20, -14); ctx.stroke(); ctx.restore(); }
// küçük etiket (yuvarlak kenarlı)
function tag(s, x, y, o = {}) {
  const { size = 34, bg = RD, color = '#fff', a = 1, sc = 1, rot = 0, pad = 22 } = o; if (a <= 0 || sc <= 0.01) return;
  const w = tw(s, size, 900, 1) + pad * 2, h = size * 1.45;
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc);
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.45)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 5; rr(-w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = bg; ctx.fill(); ctx.restore();
  txt(s, 0, 0, { size, color, spacing: 1 }); ctx.restore();
}
// başlık çipi (6. videodaki "12. HAFTA" çipinin genel hâli)
function chipT(s, x, y, a = 1, sc = 1, size = 54) {
  if (a <= 0) return; const w = tw(s, size, 900, 2) + 110;
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.scale(sc, sc);
  rr(-w / 2, -42, w, 84, 42); ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,.3)'; ctx.stroke();
  ctx.fillStyle = RD; ctx.beginPath(); ctx.arc(-w / 2 + 42, 0, 11, 0, TAU); ctx.fill();
  duo(s, 18, 0, size, { off: 3, spacing: 2 });
  ctx.restore();
}
// mürekkep damgası: p 0..1 çakılma
function stamp(s, x, y, size, p, o = {}) {
  if (p <= 0) return;
  const { col = RD, rot = -0.08, a = 1, fill = false } = o, q = clamp(p, 0, 1), sc = lerp(2.6, 1, eOut5(q));
  const w = tw(s, size, 900, 4) + size * 0.9, h = size * 1.5;
  ctx.save(); ctx.globalAlpha *= a * clamp(q * 5, 0, 1); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc);
  if (fill) { rr(-w / 2, -h / 2, w, h, 18); ctx.fillStyle = col; ctx.fill(); }
  else { rr(-w / 2, -h / 2, w, h, 18); ctx.fillStyle = 'rgba(10,10,14,.72)'; ctx.fill(); }
  ctx.lineWidth = 10; ctx.strokeStyle = fill ? '#fff' : col; rr(-w / 2, -h / 2, w, h, 18); ctx.stroke();
  ctx.lineWidth = 3; rr(-w / 2 + 14, -h / 2 + 14, w - 28, h - 28, 10); ctx.stroke();
  txt(s, 0, 2, { size, color: fill ? '#fff' : col, spacing: 4 });
  ctx.restore();
}
// split-flap rakam karosu
function tile(x, y, ch, w = 62, h = 84, col = '#fff', bg = '#1b1b24') {
  rr(x - w / 2, y - h / 2, w, h, 10); ctx.fillStyle = bg; ctx.fill();
  txt(ch, x, y, { size: h * 0.86, color: col });
  ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(x - w / 2, y - 1.5, w, 3);
}
function flap(x, y, a, b, p, w = 62, h = 84, col = '#fff', bg = '#1b1b24') {
  if (p <= 0 || a === b) return tile(x, y, p >= 1 ? b : a, w, h, col, bg);
  if (p >= 1) return tile(x, y, b, w, h, col, bg);
  const half = (top, ch, sy = 1) => {
    ctx.save(); ctx.beginPath(); ctx.rect(x - w / 2 - 2, top ? y - h / 2 - 2 : y, w + 4, h / 2 + 2); ctx.clip();
    ctx.translate(x, y); ctx.scale(1, sy); ctx.translate(-x, -y); tile(x, y, ch, w, h, col, bg);
    if (sy < 1) { ctx.fillStyle = `rgba(0,0,0,${0.5 * (1 - sy)})`; ctx.fillRect(x - w / 2, y - h / 2, w, h); }
    ctx.restore();
  };
  half(true, b); half(false, a); // arkadaki: yeni üst, eski alt
  if (p < 0.5) half(true, a, Math.cos(p * Math.PI)); else half(false, b, -Math.cos(p * Math.PI));
}
// ---------- skor tabelası: 9 maç (6. videodaki sıra) ----------
const BOARD = { x0: 150, x1: 930, y0: 420, step: 104, h: 88 };
const boardY = (k) => BOARD.y0 + k * BOARD.step;
// o.flip(k)->0..1, o.dim(k)->0..1, o.dx(k), o.a(k), o.hot(k)
function scoreRow(k, t, o = {}) {
  const r = RESULTS[k], y = boardY(k) + (o.dy ? o.dy(k) : 0), dx = o.dx ? o.dx(k) : 0, a = o.a ? o.a(k) : 1, fl = o.flip ? o.flip(k) : 0, dim = o.dim ? o.dim(k) : 0, hot = o.hot ? o.hot(k) : 0;
  if (a <= 0) return;
  const { x0, x1, h } = BOARD, w = x1 - x0, cx = (x0 + x1) / 2;
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(dx, 0);
  const [ch, ca] = pairCols(r.home, r.away);
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.45)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 6; rr(x0, y - h / 2, w, h, 22); ctx.fillStyle = '#17171f'; ctx.fill(); ctx.restore();
  ctx.save(); rr(x0, y - h / 2, w, h, 22); ctx.clip();
  const g = ctx.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, hexA(ch, 0.55)); g.addColorStop(0.4, hexA(ch, 0.06)); g.addColorStop(0.6, hexA(ca, 0.06)); g.addColorStop(1, hexA(ca, 0.55)); ctx.fillStyle = g; ctx.fillRect(x0, y - h / 2, w, h);
  if (hot > 0) { ctx.fillStyle = hexA(GOLD, 0.35 * hot); ctx.fillRect(x0, y - h / 2, w, h); }
  ctx.restore();
  rr(x0, y - h / 2, w, h, 22); ctx.lineWidth = 3; ctx.strokeStyle = hot > 0 ? hexA(GOLD, 0.4 + 0.6 * hot) : 'rgba(255,255,255,.16)'; ctx.stroke();
  sticker(r.home, x0 + 46, y, 70); sticker(r.away, x1 - 46, y, 70);
  txt(TM[r.home].short, x0 + 92, y, { size: 44, align: 'left', max: 196, color: '#fff' });
  txt(TM[r.away].short, x1 - 92, y, { size: 44, align: 'right', max: 196, color: '#fff' });
  const goalCol = (v) => (fl >= 1 && v > 0 ? GOLD : '#fff');
  flap(cx - 40, y, '0', String(r.hg), fl, 58, 74, goalCol(r.hg)); flap(cx + 40, y, '0', String(r.ag), fl, 58, 74, goalCol(r.ag));
  txt('-', cx, y, { size: 44, color: 'rgba(255,255,255,.6)' });
  if (dim > 0) { ctx.globalAlpha *= dim; rr(x0, y - h / 2, w, h, 22); ctx.fillStyle = '#000'; ctx.fill(); }
  ctx.restore();
}
function board(t, o = {}) { for (let k = 0; k < 9; k++) scoreRow(k, t, o); }

// ---------- kilit ----------
function padlock(x, y, s, open = 0, a = 1, rot = 0) {
  if (a <= 0 || s <= 0.01) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.save(); ctx.translate(open * 34, -open * 46); ctx.rotate(-open * 0.5);
  ctx.lineWidth = 26; ctx.strokeStyle = '#c9ccd6'; ctx.beginPath(); ctx.moveTo(-52, 0); ctx.lineTo(-52, -50); ctx.arc(0, -50, 52, Math.PI, 0); ctx.lineTo(52, open > 0.2 ? -30 : 0); ctx.stroke();
  ctx.restore();
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 20; rr(-86, -20, 172, 140, 26); const g = ctx.createLinearGradient(0, -20, 0, 120); g.addColorStop(0, '#ffd75a'); g.addColorStop(1, '#c48a00'); ctx.fillStyle = g; ctx.fill(); ctx.restore();
  ctx.fillStyle = '#4a3200'; ctx.beginPath(); ctx.arc(0, 38, 17, 0, TAU); ctx.fill(); ctx.fillRect(-7, 40, 14, 40);
  ctx.restore();
}
// ---------- tur izleyici: 6 parça ----------
function tracker(x, y, o = {}) {
  const { w = 820, h = 64, done = 1, lit = 0, a = 1, t = 0, sc = 1, label = '' } = o; if (a <= 0) return;
  const n = ROUNDS_TOTAL, gap = 14, sw = (w - gap * (n - 1)) / n;
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.scale(sc, sc);
  for (let i = 0; i < n; i++) {
    const sx = -w / 2 + i * (sw + gap), f = clamp(done - i, 0, 1);
    rr(sx, -h / 2, sw, h, 16); ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.stroke();
    if (f > 0) { ctx.save(); rr(sx, -h / 2, sw * f, h, 16); ctx.fillStyle = GOLD; ctx.fill(); ctx.restore(); }
    if (i === 1 && lit > 0) { const pu = 0.75 + 0.25 * Math.sin(t * 10); ctx.save(); ctx.shadowColor = CY; ctx.shadowBlur = 40 * lit; rr(sx, -h / 2, sw, h, 16); ctx.fillStyle = hexA(CY, 0.9 * lit * pu); ctx.fill(); ctx.restore(); }
    txt(String(i + 1), sx + sw / 2, 0, { size: h * 0.62, color: f > 0.5 ? '#3a2600' : i === 1 && lit > 0.5 ? INK : 'rgba(255,255,255,.55)' });
  }
  if (label) txt(label, 0, h / 2 + 52, { size: 54, spacing: 3, stroke: 8 });
  ctx.restore();
}
// ---------- kale ----------
function goalFrame(x, y, w, h, bulge = 0, a = 1) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y);
  ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 2;
  for (let i = 1; i < 10; i++) { const xx = -w / 2 + (i * w) / 10; ctx.beginPath(); ctx.moveTo(xx, -h); ctx.quadraticCurveTo(xx, -h / 2 + bulge * 0.6, xx * (1 + bulge * 0.002), 0); ctx.stroke(); }
  for (let j = 1; j < 5; j++) { const yy = -h + (j * h) / 5; ctx.beginPath(); ctx.moveTo(-w / 2, yy); ctx.quadraticCurveTo(0, yy + bulge, w / 2, yy); ctx.stroke(); }
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-w / 2, 0); ctx.lineTo(-w / 2, -h); ctx.lineTo(w / 2, -h); ctx.lineTo(w / 2, 0); ctx.stroke();
  ctx.restore();
}
// ---------- anonim avatar (silüet) ----------
function anon(x, y, d, col = '#5a5a68', a = 1) {
  if (a <= 0) return; const r = d / 2;
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y);
  ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fillStyle = col; ctx.fill(); ctx.clip();
  ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.beginPath(); ctx.arc(0, -r * 0.18, r * 0.36, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.ellipse(0, r * 0.78, r * 0.66, r * 0.5, 0, 0, TAU); ctx.fill();
  ctx.restore();
}
// flaş
function flash(t, t0, a = 0.7, d = 0.1) { const f = 1 - prog(t, t0, t0 + d); if (t >= t0 && f > 0) { ctx.fillStyle = `rgba(255,255,255,${a * f})`; ctx.fillRect(0, 0, W, H); } }
