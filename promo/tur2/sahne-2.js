/* 2. Tur — sahne 3-5: gol kartları (Konya 0-1 BJK, GS 1-0 Samsun, Kocaeli 0-1 FB); sahne 6: Amed 1-0 Rize + GB 0-1 Gaziantep */
const SEAM = [[0, 1120], [W, 640]];
const seamY = (x) => lerp(SEAM[0][1], SEAM[1][1], x / W);
const RI = (h) => RESULTS.findIndex((r) => r.home === h);
function half(top, col, off) {
  ctx.save(); ctx.translate(off, 0);
  ctx.beginPath();
  if (top) { ctx.moveTo(-40, -40); ctx.lineTo(W + 40, -40); ctx.lineTo(W + 40, seamY(W + 40)); ctx.lineTo(-40, seamY(-40)); }
  else { ctx.moveTo(-40, seamY(-40)); ctx.lineTo(W + 40, seamY(W + 40)); ctx.lineTo(W + 40, H + 40); ctx.lineTo(-40, H + 40); }
  ctx.closePath(); ctx.clip();
  ctx.fillStyle = col; ctx.fillRect(-60, -60, W + 120, H + 120);
  const g = ctx.createLinearGradient(0, top ? 0 : H, 0, top ? 1000 : 700); g.addColorStop(0, 'rgba(255,255,255,.14)'); g.addColorStop(1, 'rgba(0,0,0,.28)'); ctx.fillStyle = g; ctx.fillRect(-60, -60, W + 120, H + 120);
  ctx.globalAlpha = lum(col) > 0.7 ? 0.08 : 0.13; ctx.drawImage(top ? DOTS : STRIPES, 0, 0);
  ctx.restore();
}
// küçük yorum: anonim avatar + arma + takım adı
function miniComment(x, y, id, s = 1, a = 1, rot = 0) {
  if (a <= 0) return; const w = 250, h = 66;
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.4)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 5; rr(-w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = '#fbfbfd'; ctx.fill(); ctx.restore();
  anon(-w / 2 + 34, 0, 48, '#8a8a98'); sticker(id, -w / 2 + 86, 0, 46);
  txt(TM[id].short, -w / 2 + 116, 0, { size: 36, color: INK, align: 'left', max: 124 });
  ctx.restore();
}
// skor plakası (flap)
function scorePlate(x, y, hg, ag, p, s = 1, a = 1, hotH = 0, hotA = 0) {
  if (a <= 0 || s <= 0.01) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.scale(s, s);
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 30; rr(-170, -82, 340, 164, 30); ctx.fillStyle = BG; ctx.fill(); ctx.restore();
  rr(-170, -82, 340, 164, 30); ctx.lineWidth = 6; ctx.strokeStyle = '#fff'; ctx.stroke();
  flap(-72, 0, '0', String(hg), p, 104, 128, hotH && p >= 1 ? GOLD : '#fff');
  flap(72, 0, '0', String(ag), p, 104, 128, hotA && p >= 1 ? GOLD : '#fff');
  txt('-', 0, 0, { size: 70, color: 'rgba(255,255,255,.7)' });
  ctx.restore();
}
// %65 çizgili oy çubuğu: f = ev sahibi payı
const barCol = (c, id) => (lum(c) < 0.12 ? TM[id].c[1] : c);
function voteBar(t, y, f, cl, ca, vh, vaw, a = 1, cnt = 1) {
  if (a <= 0) return;
  const x = 540, w = 680, x0 = x - w / 2;
  duelBar(x, y, w, f, cl, ca, { h: 46, alpha: a });
  ctx.save(); ctx.globalAlpha *= a;
  for (const g of [1 - GOAL_SHARE, GOAL_SHARE]) { const gx = x0 + w * g; ctx.fillStyle = '#fff'; ctx.fillRect(gx - 3, y - 40, 6, 80); txt('%65', gx, y + 62, { size: 30, stroke: 6 }); }
  txt(String(Math.round(vh * cnt)), x0 - 54, y, { size: 62, stroke: 10 });
  txt(String(Math.round(vaw * cnt)), x0 + w + 54, y, { size: 62, stroke: 10 });
  ctx.restore();
}
// cfg: tA/tB çarpma (ilk/ikinci gelen yarı), firstAway, bar0/bar1, goal, score, end, extra
function goalCard(t, i, cfg) {
  const m = RESULTS[i], [cl, ca] = pairCols(m.home, m.away);
  const tH = cfg.firstAway ? cfg.tB : cfg.tA, tAw = cfg.firstAway ? cfg.tA : cfg.tB;
  const pH = prog(t, tH - 0.14, tH), pA = prog(t, tAw - 0.14, tAw), both = Math.max(tH, tAw);
  const z = 1 + 0.05 * prog(t, cfg.t0, cfg.end);
  ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.translate(540, 880); ctx.scale(z, z); ctx.translate(-540, -880);
  if (pH > 0) half(true, cl, -(1 - eOut5(pH)) * 1200);
  if (pA > 0) half(false, ca, (1 - eOut5(pA)) * 1200);
  const sc = m.hg > 0 ? 'h' : 'a', gx = sc === 'h' ? 245 : 770, gy = sc === 'h' ? 600 : 1060;
  rays(gx, gy, t * 0.5, '#fff', 14, 0.12 * prog(t, cfg.goal, cfg.goal + 0.2), 1400);
  embers(t, 36, 500 + i, 0.9 * prog(t, cfg.goal - 0.1, cfg.goal + 0.2), 0, W, H + 40, 1500);
  if (pA > 0 && pH > 0) { ctx.save(); ctx.strokeStyle = BG; ctx.lineWidth = 34; ctx.beginPath(); ctx.moveTo(-40, seamY(-40)); ctx.lineTo(W + 40, seamY(W + 40)); ctx.stroke(); ctx.restore(); }
  if (cfg.extra) cfg.extra(t, 'back');
  const side = (home) => {
    const id = home ? m.home : m.away, p = home ? pH : pA, tl = home ? tH : tAw, x = home ? 245 : 770, y = home ? 600 : 1060, d = 290, k = home ? -1 : 1;
    if (p <= 0) return;
    const sq = bell(t, tl, tl + 0.25), off = (1 - eOut5(p)) * 900 * k, scored = (home ? m.hg : m.ag) > 0 && t >= cfg.goal;
    if (scored) { ring(t, cfg.goal, x, y, GOLD, 620, 26, 0.55); radial(x, y, 300, hexA(GOLD, 0.35)); }
    sticker(id, x + off, y, d * (1 + (scored ? 0.08 * bell(t, cfg.goal, cfg.goal + 0.35) : 0)), { sx: 1 + 0.18 * sq, sy: 1 - 0.16 * sq, rot: 0.05 * k });
    const nx = home ? 655 : 405, ny = home ? 560 : 1090;
    txt(TM[id].say, nx + off, ny, { size: 88, stroke: 14, max: 450, alpha: prog(t, tl - 0.04, tl + 0.08) });
    const v = home ? m.votesHome : m.votesAway, ta = prog(t, cfg.bar0, cfg.bar0 + 0.2);
    tag(`${v} YORUM`, nx, ny + 88, { size: 40, bg: v > 0 ? '#fff' : 'rgba(20,20,26,.8)', color: v > 0 ? INK : '#bbb', a: ta, sc: eBack(ta) });
  };
  side(true); side(false);
  // skor plakası: ikinci yarıyla gelir, golde döner
  const pl = prog(t, both - 0.02, both + 0.18), gp = prog(t, cfg.score, cfg.score + 0.26);
  const gol = win(t, cfg.goal, cfg.score + 0.05, 0.12, 0.1);
  scorePlate(540, 880, m.hg, m.ag, gp, lerp(1.8, 1, eBack(pl, 2)) * (1 + 0.12 * bell(t, cfg.score + 0.2, cfg.score + 0.45)), clamp(pl * 3, 0, 1) * (1 - 0.6 * gol), m.hg > 0, m.ag > 0);
  sparks(t, both, 540, 880, ['#fff', GOLD, CY, RD], 18, 40 + i, 0.9, 0.6);
  sparks(t, cfg.score + 0.2, 540, 880, [GOLD, '#fff'], 26, 60 + i, 1.2, 0.7);
  // oy çubuğu
  const ba = prog(t, both + 0.05, both + 0.25), bf = eInOut(prog(t, cfg.bar0, cfg.bar1)), share = m.shareHome ?? 0.5;
  voteBar(t, 1275, lerp(0.5, share, bf), barCol(cl, m.home), barCol(ca, m.away), m.votesHome, m.votesAway, ba, bf);
  // top: çubuktan plakaya
  const bq = prog(t, cfg.goal - 0.22, cfg.goal);
  if (bq > 0 && bq < 1) { const sx = 540 - 340 + 680 * share; emoji('⚽', lerp(sx, 540, bq), lerp(1275, 880, bq) - 240 * Math.sin(bq * Math.PI), 90, bq * 8); }
  if (gol > 0) slamDuo('GOL!', 540, 880, 230, prog(t, cfg.goal, cfg.goal + 0.14), { color: GOLD, alpha: gol }, -0.06);
  sparks(t, cfg.goal, 540, 880, [GOLD, '#fff', CY, RD], 40, 80 + i, 1.5, 0.8);
  if (cfg.extra) cfg.extra(t, 'front');
  ctx.restore();
  flash(t, cfg.goal, 0.6, 0.1); flash(t, tH, 0.25, 0.08); flash(t, tAw, 0.25, 0.08);
}
function sBjk(t) {
  goalCard(t, RI('konya'), { t0: T.bjk, tA: C.besiktas + 0.05, tB: C.konya + 0.04, firstAway: true, bar0: C.deplasmaninda, bar1: C.bir - 0.1, goal: C.bir, score: C.onde + 0.03, end: T.gs,
    extra: (t, layer) => {
      if (layer === 'back') { // BJK yorumları akar (7)
        const nV = RESULTS[RI('konya')].votesAway, gone = prog(t, C.konya - 0.2, C.konya);
        let got = 0;
        for (let k = 0; k < nV; k++) { const st = C.en + 0.05 + k * 0.2, dt = t - st; if (dt >= 0.8) got++; if (dt < 0 || dt >= 0.8) continue; const q = eInOut(dt / 0.8), sy = 1240 + (k % 3) * 70;
          const bx = (1 - q) * (1 - q) * -200 + 2 * (1 - q) * q * 380 + q * q * 770, by = (1 - q) * (1 - q) * sy + 2 * (1 - q) * q * (sy + 40) + q * q * 1060;
          miniComment(bx, by, 'bjk', lerp(0.9, 0.25, q), q > 0.85 ? (1 - q) / 0.15 : 1, 0.05); }
        for (let k = 0; k < got; k++) ring(t, C.en + 0.05 + k * 0.2 + 0.8, 770, 1060, '#fff', 260, 10, 0.35);
        if (got > 0 && gone < 1) { ctx.save(); ctx.globalAlpha = 1 - gone; duo(String(got), 420, 600, 300, { color: GOLD }); txt('YORUM', 700, 640, { size: 90, stroke: 12, spacing: 4 }); ctx.restore(); }
        return;
      }
      const ra = prog(t, C.en - 0.05, C.en + 0.12);
      if (ra > 0) { ctx.save(); ctx.translate(540, 300); ctx.rotate(-0.04); ctx.scale(lerp(1.6, 1, eOut5(ra)), lerp(1.6, 1, eOut5(ra))); ctx.globalAlpha = clamp(ra * 3, 0, 1);
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 24; ctx.fillStyle = GOLD; ctx.fillRect(-640, -56, 1280, 112); ctx.restore();
        txt('★ EN ÇOK YAZILAN ★', 0, 0, { size: 80, color: '#1a1200', spacing: 4 }); ctx.restore(); }
    } });
}
function sGs(t) { goalCard(t, RI('gs'), { t0: T.gs, tA: C.galatasaray + 0.04, tB: C.samsunspora + 0.04, bar0: C.samsunspora + 0.15, bar1: C.golunu + 0.15, goal: C.atti, score: C.atti + 0.16, end: T.fb }); }
function sFb(t) { goalCard(t, RI('kocaeli'), { t0: T.fb, tA: C.fenerbahce + 0.05, tB: C.kocaelide + 0.04, firstAway: true, bar0: C.kocaelide + 0.15, bar1: C.one + 0.1, goal: C.gecti, score: C.gecti + 0.16, end: T.amedGfk }); }

// ---------- sahne 6: iki kompakt kart ----------
function miniCard(t, i, y, tIn, fromLeft, tGoal) {
  const m = RESULTS[i], [cl, ca] = pairCols(m.home, m.away), p = eOut5(prog(t, tIn - 0.2, tIn)), off = (1 - p) * 1200 * (fromLeft ? -1 : 1);
  if (p <= 0) return;
  const x0 = 100, w = 820, h = 440, top = y - h / 2;
  ctx.save(); ctx.translate(off, 0);
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 14; rr(x0, top, w, h, 36); ctx.fillStyle = '#000'; ctx.fill(); ctx.restore();
  ctx.save(); rr(x0, top, w, h, 36); ctx.clip();
  ctx.fillStyle = cl; ctx.beginPath(); ctx.moveTo(x0, top); ctx.lineTo(x0 + w * 0.58, top); ctx.lineTo(x0 + w * 0.42, top + h); ctx.lineTo(x0, top + h); ctx.fill();
  ctx.fillStyle = ca; ctx.beginPath(); ctx.moveTo(x0 + w * 0.58, top); ctx.lineTo(x0 + w, top); ctx.lineTo(x0 + w, top + h); ctx.lineTo(x0 + w * 0.42, top + h); ctx.fill();
  ctx.globalAlpha = 0.12; ctx.drawImage(DOTS, 0, 0); ctx.globalAlpha = 1;
  const g = ctx.createLinearGradient(0, top, 0, top + h); g.addColorStop(0, 'rgba(255,255,255,.12)'); g.addColorStop(1, 'rgba(0,0,0,.3)'); ctx.fillStyle = g; ctx.fillRect(x0, top, w, h);
  ctx.strokeStyle = BG; ctx.lineWidth = 18; ctx.beginPath(); ctx.moveTo(x0 + w * 0.58, top); ctx.lineTo(x0 + w * 0.42, top + h); ctx.stroke();
  const gl = t >= tGoal ? 1 - prog(t, tGoal, tGoal + 0.5) : 0; if (gl > 0) { ctx.fillStyle = hexA(GOLD, 0.45 * gl); ctx.fillRect(x0, top, w, h); }
  ctx.restore();
  rr(x0 + 3, top + 3, w - 6, h - 6, 34); ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.stroke();
  const sideX = (home) => (home ? x0 + 150 : x0 + w - 150);
  for (const home of [true, false]) {
    const id = home ? m.home : m.away, x = sideX(home), scored = (home ? m.hg : m.ag) > 0 && t >= tGoal, v = home ? m.votesHome : m.votesAway;
    if (scored) { ring(t, tGoal, x, y - 50, GOLD, 420, 18, 0.5); radial(x, y - 50, 200, hexA(GOLD, 0.4)); }
    sticker(id, x, y - 50, 190 * (1 + (scored ? 0.12 * bell(t, tGoal, tGoal + 0.3) : 0)));
    txt(TM[id].short, x, y + 92, { size: 58, stroke: 10, max: 270 });
    tag(`${v} YORUM`, x, y + 158, { size: 32, bg: v > 0 ? '#fff' : 'rgba(20,20,26,.8)', color: v > 0 ? INK : '#bbb' });
    if (scored) slamDuo('GOL!', x, y - 170, 90, prog(t, tGoal, tGoal + 0.12), { color: GOLD, off: 4 });
  }
  scorePlate(540, y - 20, m.hg, m.ag, prog(t, tGoal, tGoal + 0.26), 0.82 * (1 + 0.1 * bell(t, C.buldu, C.buldu + 0.3)), 1, m.hg > 0, m.ag > 0);
  sparks(t, tGoal + 0.15, 540, y - 20, [GOLD, '#fff', CY], 26, 700 + i, 1.1, 0.7);
  ctx.restore();
}
function sAmedGfk(t) {
  bgNeutral(t, 0.8);
  chipT('2 MAÇTA DAHA GOL', 540, 300, prog(t, C.golunu2 - 0.1, C.golunu2 + 0.1), lerp(1.4, 1, eOut(prog(t, C.golunu2 - 0.1, C.golunu2 + 0.15))));
  miniCard(t, RI('amed'), 620, C.amedspor + 0.03, true, C.amedspor + 0.12);
  miniCard(t, RI('gb'), 1110, C.ve2 + 0.03, false, C.gaziantep + 0.06);
  flash(t, C.amedspor + 0.12, 0.35, 0.08); flash(t, C.gaziantep + 0.06, 0.35, 0.08);
}
