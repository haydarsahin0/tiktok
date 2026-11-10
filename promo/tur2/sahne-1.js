/* 2. Tur — sahne 1: "Birinci tur bitti… ve skorlar değişti!" (9 maçlık tabela, t=0 = son kare)
   sahne 2: "Yirmi yedi yorum geldi, kurallara uyan on altısını saydık." */
const GOALROWS = RESULTS.filter((r) => r.goal).map((r) => r.i);
const flipAt = (k) => T.skorFlip + 0.06 + GOALROWS.indexOf(k) * 0.11;
// t=0 düzeni (döngü başı ve sonu): 0-0 tabela + "12. HAFTA · 1. TUR" çipi
function restBoard(t, o = {}) {
  bgNeutral(t);
  chipT('12. HAFTA · 1. TUR', 540, 300, o.chipA ?? 1);
  board(t, o);
}
function sHook(t) {
  const st = prog(t, T.turBitti, T.turBitti + 0.16), up = eInOut(prog(t, C.ve - 0.12, C.ve + 0.2));
  const dimRows = 0.5 * st * (1 - up), dg = eOut(prog(t, C.degisti, C.degisti + 0.3));
  restBoard(t, {
    chipA: 1 - prog(t, C.ve - 0.05, C.ve + 0.1),
    flip: (k) => (RESULTS[k].goal ? prog(t, flipAt(k), flipAt(k) + 0.24) : 0),
    dim: (k) => dimRows + (RESULTS[k].goal ? 0 : 0.42 * dg),
    hot: (k) => (RESULTS[k].goal ? 0.5 * eOut(prog(t, flipAt(k) + 0.2, flipAt(k) + 0.35)) + 0.5 * bell(t, flipAt(k) + 0.2, flipAt(k) + 0.6) : 0),
  });
  for (const k of GOALROWS) { const tk = flipAt(k) + 0.22; sparks(t, tk, 540, boardY(k), [GOLD, '#fff', CY], 10, 300 + k, 0.5, 0.45); }
  // düdük halkası + damga, sonra küçülüp çipin yerine oturur
  ring(t, T.turBitti, 540, 840, '#fff', 700, 20, 0.5); ring(t, T.turBitti + 0.05, 540, 840, RD, 500, 12, 0.45);
  if (st > 0) {
    ctx.save(); ctx.translate(540, lerp(840, 300, up)); const s = lerp(1, 0.56, up); ctx.scale(s, s);
    stamp('1. TUR BİTTİ', 0, 0, 120, st, { rot: lerp(-0.08, 0, up), fill: up > 0.5 });
    ctx.restore();
    if (t < T.turBitti + 0.5) splat(540, 840, 260, hexA(RD, 0.5), 41, 1 - prog(t, T.turBitti + 0.1, T.turBitti + 0.5));
  }
  flash(t, T.turBitti, 0.45, 0.1);
}

// ---------- sahne 2: istatistik ----------
const ST = (() => {
  const n = STATS.fanComments, r = rng(2711), idx = [...Array(n).keys()];
  for (let i = n - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
  const kind = Array(n).fill('ok'); idx.slice(0, STATS.spamCut).forEach((k) => (kind[k] = 'spam')); idx.slice(STATS.spamCut, STATS.spamCut + STATS.invalid).forEach((k) => (kind[k] = 'bad'));
  const votes = []; RESULTS.forEach((m) => { for (let v = 0; v < m.votesHome; v++) votes.push(m.home); for (let v = 0; v < m.votesAway; v++) votes.push(m.away); });
  const team = Array(n).fill(null); let vi = 0; kind.forEach((k, i) => { if (k === 'ok') team[i] = votes[vi++]; });
  const cut = []; kind.forEach((k, i) => { if (k !== 'ok') cut.push(i); });
  return { n, kind, team, cut };
})();
const stIn = (k) => C.yirmi + 0.02 + k * ((C.geldi + 0.2 - C.yirmi) / ST.n);
const stTag = (j) => T.statCut + 0.04 + j * 0.04;
const stFall = (j) => T.statCut + 0.62 + j * 0.035;
const stPos0 = (k) => ({ x: 285 + (k % 3) * 255, y: 652 + Math.floor(k / 3) * 76 });
const stSlot = (k) => { const v = ST.team.slice(0, k).filter(Boolean).length; return { x: 405 + (v % 2) * 270, y: 652 + Math.floor(v / 2) * 76 }; };
const stPos = (k, t) => { const a = stPos0(k); if (!ST.team[k]) return a; const b = stSlot(k), e = eInOut(prog(t, T.statCount - 0.35, T.statCount - 0.02)); return { x: lerp(a.x, b.x, e), y: lerp(a.y, b.y, e) }; };
function stTile(k, t) {
  const p = stPos(k, t), dt = t - stIn(k); if (dt < 0) return;
  const kind = ST.kind[k], j = ST.cut.indexOf(k), tg = j >= 0 ? prog(t, stTag(j), stTag(j) + 0.12) : 0;
  const fd = j >= 0 ? t - stFall(j) : -1, drop = eOut5(prog(dt, 0, 0.22));
  let x = p.x, y = p.y - (1 - drop) * 140, rot = 0, a = clamp(dt * 8, 0, 1);
  if (fd > 0) { const r = rng(90 + k); y += 1900 * fd * fd; x += (r() - 0.5) * 500 * fd; rot = (r() - 0.5) * 3 * fd; a *= 1 - prog(fd, 0.35, 0.6); }
  if (a <= 0) return;
  const w = 238, h = 62, rev = ST.team[k] ? eBack(prog(t, T.statCount + 0.03 + (k % 9) * 0.02, T.statCount + 0.25 + (k % 9) * 0.02)) : 0;
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.rotate(rot);
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.4)'; ctx.shadowBlur = 12; ctx.shadowOffsetY = 4; rr(-w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = tg > 0 ? (kind === 'bad' ? '#6b6550' : '#5a4950') : '#fbfbfd'; ctx.fill(); ctx.restore();
  anon(-w / 2 + 32, 0, 46, tg > 0 ? '#3a3a44' : '#8a8a98');
  if (rev > 0) { sticker(ST.team[k], -w / 2 + 82, 0, 44 * rev); txt(TM[ST.team[k]].short, -w / 2 + 110, 0, { size: 34, color: INK, align: 'left', max: 84, alpha: clamp(rev, 0, 1) }); }
  else { ctx.fillStyle = tg > 0 ? 'rgba(255,255,255,.25)' : '#d4d4dc'; rr(-w / 2 + 66, -14, 120, 12, 6); ctx.fill(); rr(-w / 2 + 66, 6, 80, 10, 5); ctx.fill(); }
  if (tg > 0) tag(kind === 'spam' ? 'SPAM' : 'GEÇERSİZ', 54, 0, { size: 28, bg: kind === 'spam' ? RD : WARN, color: kind === 'spam' ? '#fff' : INK, sc: lerp(2, 1, eOut(tg)), a: tg, rot: -0.1 });
  if (rev > 0) check(w / 2 - 26, 0, 0.8 * clamp(rev, 0, 1.2), '#1fbf6a');
  ctx.restore();
}
function sStats(t) {
  bgNeutral(t, 0.9);
  for (let k = 0; k < ST.n; k++) stTile(k, t);
  let n = 0; for (let k = 0; k < ST.n; k++) if (t >= stIn(k)) n++;
  ST.cut.forEach((k, j) => { if (t >= stFall(j) + 0.12) n--; });
  const done = t >= T.statCount, pu = bell(t, T.statCount, T.statCount + 0.3);
  const bump = (() => { for (let k = ST.n - 1; k >= 0; k--) if (t >= stIn(k)) return bell(t, stIn(k), stIn(k) + 0.1); return 0; })();
  ctx.save(); ctx.translate(540, 380); const s = 1 + 0.08 * bump + 0.15 * pu; ctx.scale(s, s);
  radial(0, 0, 360, hexA(done ? '#1fbf6a' : CY, 0.25));
  duo(String(n), 0, 0, 230, { color: done ? '#7dffb4' : '#fff' });
  ctx.restore();
  const lf = prog(t, T.statCount - 0.1, T.statCount + 0.1);
  if (lf < 1) txt('YORUM GELDİ', 540, 532, { size: 56, spacing: 4, alpha: prog(t, C.yorum, C.yorum + 0.15) * (1 - lf) });
  if (lf > 0) slamDuo('SAYILDI', 520, 532, 64, lf, { color: '#7dffb4', spacing: 4 }); if (lf > 0) check(650, 532, 1.1 * eBack(lf, 2), '#7dffb4');
  txt(`${STATS.commenters} KİŞİ YORUM YAPTI`, 540, 590, { size: 34, weight: 800, color: '#aab', spacing: 2, alpha: prog(t, C.geldi, C.geldi + 0.2) });
  const ta = prog(t, T.statCut + 0.5, T.statCut + 0.7);
  tag(`−${STATS.spamCut} SPAM · KİŞİ BAŞI ${MAX_PER_USER}+`, 400, 1336, { size: 36, bg: RD, a: ta, sc: lerp(1.4, 1, eOut(ta)) });
  tag(`−${STATS.invalid} GEÇERSİZ`, 770, 1336, { size: 36, bg: WARN, color: INK, a: ta, sc: lerp(1.4, 1, eOut(ta)) });
  flash(t, T.statCount, 0.25, 0.1);
}
