/* Sahne 7-8: aynı anda 9 maç, canlı puan tablosu. */

// ---------- 7) dokuz maç aynı anda ----------
const MATCHES = [['ibf', 'cor', 1, 0, 0.62], ['amd', 'riz', 1, 0, 0.58], ['erz', 'goz', 0, 0, 0.47], ['kas', 'aln', 0, 0, 0.52], ['gb', 'gfk', 0, 1, 0.4],
  ['gs', 'sam', 1, 1, 0.66], ['koc', 'fb', 0, 0, 0.5], ['kon', 'bjk', 1, 0, 0.55], ['ts', 'eyp', 1, 0, 0.6]];
const ROW0 = 438, ROWP = 98, MINE = 5, FBROW = 6;
const rowY = (i) => ROW0 + i * ROWP;
const FBGOAL = C.atti + 0.03, SCAN0 = C.sekiz - 0.02, SCAN1 = C.mac + 0.5;
const SCAN_ORDER = [0, 1, 2, 3, 4, 6, 7, 8];
function matchRow(i, t, sa, glow = 0, mine = false) {
  const [h, a, sh, , pr0] = MATCHES[i], home = TEAM[h], away = TEAM[a];
  rr(-480, -43, 960, 86, 22); ctx.fillStyle = mine ? 'rgba(34,46,20,.96)' : 'rgba(14,22,44,.94)'; ctx.fill();
  ctx.lineWidth = mine || glow > 0.05 ? 5 : 2; ctx.strokeStyle = mine ? LIME : glow > 0.05 ? hexA(LIME, glow) : 'rgba(160,185,255,.22)'; ctx.stroke();
  crest(home, -428, -3, 30, false); crest(away, 428, -3, 30, false);
  txt(home.code, -380, -5, { size: 58, italic: true, align: 'left' });
  txt(away.code, 380, -5, { size: 58, italic: true, align: 'right' });
  rr(-96, -36, 192, 64, 14); ctx.fillStyle = '#04060c'; ctx.fill();
  digits(String(sh), -44, -5, 60, { italic: false }); txt(':', 0, -8, { size: 50, color: 'rgba(255,255,255,.5)' }); digits(String(sa), 44, -5, 60, { italic: false, color: i === FBROW && sa ? YEL : '#fff' });
  // canlı baskı çubuğu
  let pr = pr0 + 0.05 * Math.sin(t * 2.3 + i * 1.9) + 0.02 * Math.sin(t * 6.1 + i);
  if (i === FBROW) pr = lerp(pr, 0.27, eInOut(prog(t, C.rakibin - 0.1, C.atti)));
  ctx.fillStyle = 'rgba(143,176,255,.75)'; ctx.fillRect(-440, 33, 880, 6);
  ctx.fillStyle = LIME; ctx.fillRect(-440, 33, 880 * pr, 6);
  if (mine) { ctx.save(); ctx.translate(-480, -43); ctx.rotate(-0.08); tag('SEN', 0, 0, { size: 40, bg: LIME, color: '#0a0f12' }); ctx.restore(); }
}
function sList(t) {
  bgGrad('#060913', '#0c1430', '#070a14');
  radial(540, 300, 1000, 'rgba(255,45,70,.16)'); radial(900, 1500, 900, 'rgba(60,110,255,.22)');
  const fbS = t >= FBGOAL ? 1 : 0;
  const zs = lerp(2.6, 1, eOut5(prog(t, T7 - 0.12, T7 + 0.6)));
  const zp = eInOut(prog(t, C.ve2 - 0.08, C.rakibin + 0.12));
  // liste
  ctx.save();
  if (zs > 1.001) { ctx.translate(540, lerp(rowY(MINE), 1060, (zs - 1) / 1.6)); ctx.scale(zs, zs); ctx.translate(-540, -rowY(MINE)); }
  else if (zp > 0) { ctx.translate(540, 860); ctx.scale(1 - 0.07 * zp, 1 - 0.07 * zp); ctx.translate(-540, -860); }
  const scanP = prog(t, SCAN0, SCAN1) * SCAN_ORDER.length;
  for (let i = 0; i < MATCHES.length; i++) {
    const born = T7 + 0.1 + Math.abs(i - MINE) * 0.055, inP = i === MINE ? 1 : eOut5(prog(t, born, born + 0.32));
    if (inP <= 0) continue;
    const k = SCAN_ORDER.indexOf(i), gl = k >= 0 ? bell(scanP, k - 0.1, k + 1.5) : 0;
    ctx.save(); ctx.globalAlpha = clamp(inP * 2, 0, 1);
    ctx.translate(540 + (1 - inP) * (i % 2 ? 420 : -420), rowY(i)); const s = 1 + 0.04 * gl; ctx.scale(s, s);
    matchRow(i, t, i === FBROW ? fbS : MATCHES[i][3], gl, i === MINE);
    ctx.restore();
  }
  ctx.restore();
  // başlık
  const hp = prog(t, C.ayni - 0.02, C.ayni + 0.18);
  if (hp > 0 && t < SCAN0) { ctx.save(); ctx.translate(540, 338); const s = lerp(2.4, 1, eBack(hp, 1.4)); ctx.scale(s, s); ctx.rotate(-0.03); ctx.globalAlpha = clamp(hp * 4, 0, 1); tag('AYNI ANDA', 0, 0, { size: 92, bg: RED }); ctx.restore(); }
  if (t >= SCAN0) {
    const n = clamp(Math.floor(scanP) + 1, 1, 8), f = scanP - Math.floor(scanP), pop = scanP < 8 ? 1 + 0.16 * Math.exp(-f * 7) : 1;
    ctx.save(); ctx.translate(540, 338); ctx.scale(pop, pop); ctx.rotate(-0.03); ctx.globalAlpha = 1 - 0.75 * zp; tag(`+${n} MAÇ DAHA`, 0, 0, { size: 92, bg: LIME, color: '#0a0f12' }); ctx.restore();
  }
  // odak: Kocaeli – Fenerbahçe kartı listeden öne çıkar
  if (zp > 0) {
    ctx.fillStyle = `rgba(3,5,10,${0.74 * zp})`; ctx.fillRect(0, 0, W, H);
    const since = t - FBGOAL, hit = since >= 0;
    const cy = lerp(rowY(FBROW), 800, zp), cs = lerp(0.42, 1, eBack(zp, 1.2));
    const sh = hit ? rng(frameSeed(t)) : null, jx = hit ? (sh() - 0.5) * 30 * Math.exp(-since * 7) : 0;
    if (hit) radial(830, cy, 900, 'rgba(255,237,0,.5)', clamp(1 - since / 0.5, 0, 1));
    ctx.save(); ctx.translate(540 + jx, cy); ctx.scale(cs, cs); ctx.translate(-540, 0); ctx.globalAlpha = clamp(zp * 3, 0, 1);
    const fp = prog(since, 0, 0.22), flip = fp < 0.5 ? 1 - fp * 2 : (fp - 0.5) * 2;
    matchCard(0, TEAM.koc, TEAM.fb, 0, fp < 0.5 ? 0 : 1, { flipA: hit ? Math.max(0.05, flip) : 1, hiA: fp >= 0.5 ? 1 : 0 });
    // baskı çubuğu: FB tarafı %65'i geçer
    const pr = lerp(0.5, 0.71, eInOut(prog(t, C.rakibin - 0.1, C.atti))) + 0.012 * Math.sin(t * 30);
    rr(70, 168, 940, 46, 23); ctx.fillStyle = 'rgba(0,132,61,.8)'; ctx.fill();
    ctx.save(); rr(70, 168, 940, 46, 23); ctx.clip(); ctx.fillStyle = '#FFED00'; ctx.fillRect(1010 - 940 * pr, 168, 940 * pr, 46); ctx.restore();
    ctx.fillStyle = '#fff'; ctx.fillRect(1010 - 940 * 0.65 - 3, 154, 6, 74);
    txt('GOL %65', 1010 - 940 * 0.65, 262, { size: 44, italic: true, color: '#fff' });
    txt('%' + Math.round(pr * 100), 990, 262, { size: 56, italic: true, align: 'right', color: '#FFED00' });
    ctx.restore();
    // "RAKİBİN" oku
    const rp = prog(t, C.rakibin - 0.02, C.rakibin + 0.16);
    if (rp > 0) { ctx.save(); ctx.translate(800, cy - 215); const s = lerp(2.6, 1, eBack(rp, 1.4)); ctx.scale(s, s); ctx.rotate(0.05); ctx.globalAlpha = clamp(rp * 4, 0, 1); tag('RAKİBİN', 0, 0, { size: 100, bg: RED }); ctx.restore();
      ctx.save(); ctx.globalAlpha = clamp(rp * 4, 0, 1); ctx.fillStyle = RED; ctx.beginPath(); ctx.moveTo(835, cy - 150); ctx.lineTo(905, cy - 150); ctx.lineTo(870, cy - 104 + 8 * Math.sin(t * 12)); ctx.closePath(); ctx.fill(); ctx.restore(); }
    if (hit) {
      ring(t, FBGOAL, 628, cy, '#FFED00', 1100, 44, 0.5);
      const gp = prog(since, 0, 0.18);
      ctx.save(); ctx.translate(540, 1165); const s = lerp(3.4, 1, eBack(gp, 1.3)); ctx.scale(s, s); ctx.rotate(-0.06); ctx.globalAlpha = clamp(gp * 4, 0, 1);
      tag('GOL! FENERBAHÇE', 0, 0, { size: 124, bg: '#FFED00', color: '#002D72' }); ctx.restore();
      confetti(t, FBGOAL, 780, cy, ['#FFED00', '#002D72', '#ffffff'], 70, 51, 0.8);
      ctx.fillStyle = `rgba(255,255,255,${0.6 * clamp(1 - since / 0.16, 0, 1)})`; ctx.fillRect(0, 0, W, H);
    }
  }
}

// ---------- 8) canlı puan tablosu ----------
const TBL = [['gs', 29], ['ts', 28], ['amd', 26], ['bjk', 22], ['kas', 21], ['fb', 20], ['koc', 20]];
const TR0 = 478, TRP = 116;
const FBPTS = C.tablosu + 0.1, FBUP0 = C.gozunun - 0.12, FBUP1 = C.gozunun + 0.46;
function tableRow(tm, rank, pts, o = {}) {
  const { hi = '', mine = false, delta = 0, dA = 0, ptCol = '#fff', pop = 1 } = o;
  rr(-470, -50, 940, 100, 22); ctx.fillStyle = hi ? 'rgba(46,42,8,.97)' : mine ? 'rgba(34,46,20,.96)' : 'rgba(14,22,44,.94)'; ctx.fill();
  ctx.lineWidth = hi || mine ? 5 : 2; ctx.strokeStyle = hi || (mine ? LIME : 'rgba(160,185,255,.22)'); ctx.stroke();
  txt(String(rank), -420, -3, { size: 64, italic: true, color: mine ? LIME : 'rgba(233,241,255,.6)' });
  crest(tm, -338, 0, 36, false);
  txt(tm.n, -282, -3, { size: 64, italic: true, align: 'left', max: 430 });
  if (dA > 0) txt((delta > 0 ? '▲' : '▼') + Math.abs(delta), 250, -3, { size: 50, color: delta > 0 ? '#3dff7a' : RED, alpha: dA });
  ctx.save(); ctx.translate(400, -3); ctx.scale(pop, pop); digits(String(pts), 0, 0, 80, { color: ptCol, glow: pop > 1.02 ? 26 : 0, glowColor: ptCol }); ctx.restore();
  if (mine) { ctx.save(); ctx.translate(-470, -50); ctx.rotate(-0.08); tag('SEN', 0, 0, { size: 40, bg: LIME, color: '#0a0f12' }); ctx.restore(); }
}
function sTable(t) {
  bgGrad('#07101f', '#0d1b3a', '#060912');
  rays(540, 240, t * 0.25, '#7da2ff', 14, 0.07);
  radial(540, 240, 900, 'rgba(120,160,255,.22)');
  const mv = eInOut(prog(t, FBUP0, FBUP1));
  const hp = prog(t, T8, T8 + 0.2);
  ctx.save(); ctx.translate(540, 340); const hs = lerp(2.2, 1, eBack(hp, 1.4)); ctx.scale(hs, hs); ctx.rotate(-0.03); ctx.globalAlpha = clamp(hp * 4, 0, 1);
  tag('CANLI PUAN TABLOSU', 0, 0, { size: 84, bg: YEL, color: '#0a0f12' }); ctx.restore();
  const draw = (i, lifted) => {
    const [id, p0] = TBL[i], tm = TEAM[id];
    let pos = i, pts = p0, o = {};
    if (id === 'fb') {
      pos = lerp(5, 3, mv);
      const c = t - FBPTS; pts = c < 0 ? 20 : c < 0.14 ? 21 : 22;
      const pp = c < 0 ? 0 : Math.exp(-(c < 0.14 ? c : c - 0.14) * 9);
      o = { hi: YEL, ptCol: c >= 0 ? '#3dff7a' : '#fff', pop: 1 + 0.35 * pp, delta: 2, dA: prog(t, FBUP1 - 0.1, FBUP1 + 0.1) };
    } else if (id === 'bjk' || id === 'kas') { pos = i + mv; o = { delta: -1, dA: prog(t, FBUP1 - 0.1, FBUP1 + 0.1) }; }
    else if (id === 'koc') { const c = t - FBPTS; pts = c < 0 ? 20 : 19; o = { ptCol: c >= 0 ? RED : '#fff', pop: 1 + (c >= 0 ? 0.3 * Math.exp(-c * 9) : 0) }; }
    else if (id === 'gs') o = { mine: true };
    if ((id === 'fb') !== lifted) return;
    const born = T8 - 0.02 + i * 0.04, inP = eOut5(prog(t, born, born + 0.3));
    if (inP <= 0) return;
    const lift = id === 'fb' ? Math.sin(Math.PI * mv) : 0;
    ctx.save(); ctx.globalAlpha = clamp(inP * 2, 0, 1); ctx.translate(540 + (1 - inP) * 500 + lift * 26, TR0 + pos * TRP); const s = 1 + 0.07 * lift; ctx.scale(s, s);
    if (lift > 0.02) { ctx.shadowColor = 'rgba(255,212,0,.8)'; ctx.shadowBlur = 50 * lift; rr(-470, -50, 940, 100, 22); ctx.fillStyle = '#000'; ctx.fill(); ctx.shadowBlur = 0; }
    tableRow(tm, Math.round(pos) + 1, pts, o);
    ctx.restore();
  };
  for (let i = 0; i < TBL.length; i++) draw(i, false);
  for (let i = 0; i < TBL.length; i++) draw(i, true);
  // hız izi
  if (mv > 0.02 && mv < 0.98) { const y = TR0 + lerp(5, 3, mv) * TRP; ctx.save(); ctx.globalAlpha = 0.5 * Math.sin(Math.PI * mv); const g = ctx.createLinearGradient(0, y, 0, y + 260); g.addColorStop(0, 'rgba(255,212,0,.5)'); g.addColorStop(1, 'rgba(255,212,0,0)'); ctx.fillStyle = g; ctx.fillRect(100, y + 40, 880, 220); ctx.restore(); }
  // fark kapanıyor
  const fp = prog(t, C.degisiyor - 0.02, C.degisiyor + 0.18);
  if (fp > 0) { ctx.save(); ctx.translate(540, 1318); const s = lerp(2.6, 1, eBack(fp, 1.4)); ctx.scale(s, s); ctx.rotate(-0.04); ctx.globalAlpha = clamp(fp * 4, 0, 1); tag('FARK 9 → 7', 0, 0, { size: 116, bg: RED }); ctx.restore(); }
}
