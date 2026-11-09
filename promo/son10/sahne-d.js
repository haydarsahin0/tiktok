/* Sahne 9-11: kaptan yarışı + telefon duvarı, kinetik yazı, canlı yayın. */

// ---------- 9) en çok destek veren kaptan ----------
const FANS = [['aslan_1905', 84, 97, '#FDB912'], ['cimbomlu34', 71, 86, '#ff7a59'], ['ultrAslan', 62, 78, '#ffd9a0'], ['sarı_kırmızı', 51, 64, '#ff5c8a'], ['SEN', 16, 131, LIME]];
const CAP = C.kaptan - 0.02, WALL0 = C.adi - 0.12, WALL1 = C.herkesin + 0.1;
function fanVal(i, t) {
  const [, v0, v1] = FANS[i];
  const p = i === 4 ? eInOut(prog(t, T9 + 0.05, C.mi + 0.05)) : prog(t, T9 - 0.3, CAP + 0.4);
  return lerp(v0, v1, p);
}
function capCard(t) {
  bgGrad('#2a010e', '#8a0328', '#2a010e');
  rays(540, 700, t * 0.6, '#FDB912', 16, 0.26);
  radial(540, 720, 950, 'rgba(255,214,90,.5)');
  emoji('👑', 540, 460 + 10 * Math.sin(t * 4), 270, 0.05 * Math.sin(t * 3));
  ctx.save(); ctx.translate(540, 760); ctx.rotate(-0.04); tag('KAPTAN', 0, 0, { size: 230, bg: YEL, color: '#0a0f12' }); ctx.restore();
  txt('SENİN ADIN', 540, 1030, { size: 200, italic: true, color: LIME, stroke: 24, strokeColor: '#12060a', max: 960 });
  txt('★  TURUN KAPTANI  ★', 540, 1200, { size: 74, weight: 800, color: '#fff', spacing: 4 });
}
function fanRace(t) {
  bgGrad('#0a0613', '#1b0a20', '#07060f');
  radial(200, 400, 900, 'rgba(169,4,50,.4)'); radial(950, 1300, 900, 'rgba(253,185,18,.14)');
  const hp = prog(t, C.en - 0.02, C.en + 0.18);
  ctx.save(); ctx.translate(540, 345); const hs = lerp(2.3, 1, eBack(hp, 1.4)); ctx.scale(hs, hs); ctx.rotate(-0.03); ctx.globalAlpha = clamp(hp * 4, 0, 1);
  tag('EN ÇOK DESTEK', 0, 0, { size: 96, bg: '#fff', color: '#0a0f12' }); ctx.restore();
  const vals = FANS.map((_, i) => fanVal(i, t));
  const order = [0, 1, 2, 3, 4];
  const rank = (i) => { let r = 0; for (let j = 0; j < 5; j++) if (j !== i) r += smooth(clamp((vals[j] - vals[i]) / 7 + 0.5, 0, 1)); return r; };
  const ranks = order.map(rank);
  // yorumlar SEN çubuğuna akar
  const meY = 520 + ranks[4] * 158, meX = 500 + (vals[4] / 140) * 500;
  const r = rng(13);
  for (let i = 0; i < 12; i++) {
    const ph = r(), sx = 80 + r() * 900, q = ((t * 2.2 + ph) % 1), e = eIn(q);
    const x = lerp(sx, meX - 40, e), y = lerp(1330, meY + 20, eOut(q));
    ctx.save(); ctx.globalAlpha = clamp(q * 6, 0, 1) * clamp((1 - q) * 5, 0, 1) * (1 - prog(t, C.mi, C.mi + 0.2)); const s = 1 - 0.5 * e; ctx.translate(x, y); ctx.scale(s, s);
    rr(-70, -38, 140, 76, 38); ctx.fillStyle = LIME; ctx.fill(); txt('GS', 0, 0, { size: 54, color: '#0a0f12' }); ctx.restore();
  }
  [...order].sort((a, b) => (a === 4) - (b === 4)).forEach((i) => {
    const [name, , , col] = FANS[i], me = i === 4, y = 520 + ranks[i] * 158, w = 250 + (vals[i] / 140) * 500;
    const inP = eOut5(prog(t, T9 - 0.05 + i * 0.04, T9 + 0.3 + i * 0.04));
    ctx.save(); ctx.globalAlpha = clamp(inP * 2, 0, 1); ctx.translate(-(1 - inP) * 400, y);
    const top = ranks[i] < 0.5;
    if (me) { ctx.shadowColor = LIME; ctx.shadowBlur = 40; }
    rr(250, -34, w, 84, 18); ctx.fillStyle = me ? LIME : hexA(col, 0.55); ctx.fill(); ctx.shadowBlur = 0;
    ctx.beginPath(); ctx.arc(160, 8, 58, 0, Math.PI * 2); ctx.fillStyle = me ? LIME : col; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = '#fff'; ctx.stroke();
    txt(me ? 'S' : name[0].toLocaleUpperCase('tr-TR'), 160, 8, { size: 70, color: '#0a0f12' });
    txt(name, 270, 8, { size: me ? 64 : 54, italic: true, align: 'left', color: me ? '#0a0f12' : '#fff' });
    digits(String(Math.round(vals[i])), 250 + w - 16, 8, 62, { align: 'right', color: me ? '#0a0f12' : '#fff' });
    txt(String(Math.round(ranks[i]) + 1) + '.', 60, 8, { size: 64, italic: true, color: top ? YEL : 'rgba(255,255,255,.5)' });
    ctx.restore();
  });
  if (t >= C.mi) { ring(t, C.mi, 160, 528, YEL, 520, 26, 0.45); const p = prog(t, C.mi, C.mi + 0.16); emoji('👑', 160, 432, 110 * eBack(p, 2), -0.2); }
}
function phoneWall(t) {
  const zo = eInOut(prog(t, WALL0, WALL1)), s = Math.pow(5.4, 1 - zo), cy = lerp(960, 860, zo);
  const card = paint(LE, capCard, t);
  ctx.fillStyle = '#04060c'; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.translate(540, cy); ctx.rotate(-0.07 * zo); ctx.scale(s, s);
  for (let c = -3; c <= 3; c++) for (let rw = -3; rw <= 3; rw++) {
    const odd = Math.abs(c) % 2, x = c * 228, y = rw * 392 + odd * 196;
    if (Math.abs(x) * s > 900 || Math.abs(y) * s > 1500) continue;
    const d = Math.hypot(c, rw + odd * 0.5), litAt = d < 0.1 ? -9 : C.adi + 0.28 + d * 0.24, lit = t >= litAt, since = t - litAt;
    const pop = lit && d > 0.1 ? 1 + 0.1 * Math.exp(-since * 9) : 1;
    ctx.save(); ctx.translate(x, y); ctx.scale(pop, pop);
    rr(-108, -186, 216, 372, 32); ctx.fillStyle = '#141824'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = lit ? '#6b7592' : '#2b3246'; ctx.stroke();
    ctx.save(); rr(-100, -178, 200, 356, 24); ctx.clip();
    if (lit) { ctx.drawImage(card, -100, -178, 200, 356); if (since < 0.3 && d > 0.1) { ctx.fillStyle = `rgba(255,255,255,${0.9 * (1 - since / 0.3)})`; ctx.fillRect(-100, -178, 200, 356); } }
    else { ctx.fillStyle = '#0a1020'; ctx.fillRect(-100, -178, 200, 356); ctx.fillStyle = 'rgba(160,185,255,.14)'; rr(-70, -60, 140, 44, 10); ctx.fill(); rr(-70, 4, 140, 14, 7); ctx.fill(); rr(-70, 30, 90, 14, 7); ctx.fill(); }
    ctx.restore();
    ctx.restore();
  }
  ctx.restore();
  // kenar karartma + son vurgu
  const g = ctx.createRadialGradient(540, 860, 300, 540, 860, 1150); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${0.6 * zo})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const ep = prog(t, C.ekraninda - 0.02, C.ekraninda + 0.18);
  if (ep > 0) { ctx.save(); ctx.translate(540, 1292); const k = lerp(2.6, 1, eBack(ep, 1.4)); ctx.scale(k, k); ctx.rotate(-0.04); ctx.globalAlpha = clamp(ep * 4, 0, 1); tag('HERKES SENİ GÖRÜYOR', 0, 0, { size: 104, bg: LIME, color: '#0a0f12' }); ctx.restore(); }
}
function sCaptain(t) {
  if (t < CAP + 0.25) fanRace(Math.min(t, CAP + 0.25));
  if (t >= CAP) {
    const p = prog(t, CAP, CAP + 0.22);
    if (t < WALL0) {
      // kart çakılır
      ctx.fillStyle = `rgba(0,0,0,${0.5 * p})`; ctx.fillRect(0, 0, W, H);
      const card = paint(LE, capCard, t), k = lerp(0.2, 1, eBack(p, 1.1));
      ctx.save(); ctx.translate(540, 960); ctx.scale(k, k); ctx.rotate((1 - p) * -0.25); ctx.drawImage(card, -540, -960); ctx.restore();
    } else phoneWall(t);
    confetti(t, CAP + 0.1, 540, 700, ['#FDB912', '#ffffff', LIME, '#ff2f5f'], 120, 61, 1.1);
    ctx.fillStyle = `rgba(255,255,255,${0.7 * clamp(1 - (t - CAP - 0.12) / 0.2, 0, 1) * clamp((t - CAP) / 0.12, 0, 1)})`; ctx.fillRect(0, 0, W, H);
  }
}

// ---------- 10) kinetik yazı: skoru taraftar yazıyor ----------
function sWords(t) {
  const taraf = t >= C.taraftar - 0.02, since = t - (C.taraftar - 0.02);
  bgGrad('#05070f', '#0b1226', '#05070f');
  // akan çapraz şeritler
  ctx.save(); ctx.globalAlpha = 0.05; ctx.fillStyle = '#fff'; const off = (t * 160) % 220;
  for (let x = -H; x < W + 200; x += 220) { ctx.beginPath(); ctx.moveTo(x + off, H); ctx.lineTo(x + off + 80, H); ctx.lineTo(x + off + 80 + H * 0.45, 0); ctx.lineTo(x + off + H * 0.45, 0); ctx.fill(); }
  ctx.restore();
  if (taraf) { radial(540, 1050, 1100, 'rgba(200,255,61,.34)', clamp(since * 6, 0, 1)); rays(540, 1050, t * 0.5, LIME, 14, 0.08 * clamp(since * 6, 0, 1)); }
  const zoom = 1 + 0.05 * prog(t, T10, T11);
  ctx.save(); ctx.translate(540, 850); ctx.scale(zoom, zoom); ctx.translate(-540, -850);
  // BURADA / SKORU
  const b = eOut5(prog(t, C.burada - 0.03, C.burada + 0.26));
  if (b > 0) txt('BURADA', lerp(-500, 540, b), 420, { size: 180, italic: true, color: '#fff', alpha: clamp(b * 3, 0, 1) });
  const sk = eOut5(prog(t, C.skoru - 0.03, C.skoru + 0.26));
  if (sk > 0) txt('SKORU', lerp(1600, 540, sk), 596, { size: 230, italic: true, color: YEL, alpha: clamp(sk * 3, 0, 1) });
  // FUTBOLCU → çizilir
  const fu = prog(t, C.futbolcu - 0.03, C.futbolcu + 0.18), dg = prog(t, C.degil - 0.02, C.degil + 0.12);
  if (fu > 0) {
    const sh = rng(frameSeed(t) + 9), jit = bell(t, C.degil - 0.02, C.degil + 0.3) * 14;
    ctx.save(); ctx.translate((sh() - 0.5) * jit, (sh() - 0.5) * jit + dg * 8); ctx.translate(540, 815); ctx.rotate(0.03 * dg); ctx.translate(-540, -815);
    slam('FUTBOLCU', 540, 815, fu, { size: 228, italic: true, color: dg > 0 ? '#7c869f' : '#fff', alpha: 1 - 0.35 * dg, max: 940 }, 2.4);
    if (dg > 0) {
      ctx.strokeStyle = RED; ctx.lineWidth = 30; ctx.lineCap = 'round'; ctx.shadowColor = RED; ctx.shadowBlur = 30;
      ctx.beginPath(); ctx.moveTo(70, 868); ctx.lineTo(lerp(70, 1010, eOut(dg)), lerp(868, 768, eOut(dg))); ctx.stroke(); ctx.shadowBlur = 0;
    }
    ctx.restore();
    const dp = prog(t, C.degil + 0.05, C.degil + 0.22);
    if (dp > 0) { ctx.save(); ctx.translate(850, 705); const k = lerp(3, 1, eBack(dp, 1.4)); ctx.scale(k, k); ctx.rotate(0.12); ctx.globalAlpha = clamp(dp * 4, 0, 1); tag('DEĞİL', 0, 0, { size: 104, bg: RED }); ctx.restore(); }
  }
  // TARAFTAR
  if (taraf) {
    ring(t, C.taraftar, 540, 1050, LIME, 1200, 44, 0.6);
    const p = prog(since, 0, 0.2);
    slam('TARAFTAR', 540, 1050, p, { size: 262, italic: true, color: LIME, stroke: 28, strokeColor: '#05070c', glow: 60, glowColor: 'rgba(200,255,61,.6)', max: 1000 }, 3.4, -0.035);
    confetti(t, C.taraftar, 540, 1050, [LIME, '#ffffff', '#7dff6b'], 90, 71, 1);
  }
  // YAZIYOR. (harf harf)
  if (t >= C.yaziyor - 0.02) {
    const word = 'YAZIYOR.', n = clamp(Math.floor((t - C.yaziyor + 0.02) / 0.05) + 1, 0, word.length), s = word.slice(0, n);
    const full = tw(word, 210, 900, true), x0 = 540 - full / 2;
    txt(s, x0, 1272, { size: 210, italic: true, align: 'left', color: '#fff' });
    const cx = x0 + tw(s, 210, 900, true) + 14;
    if (n < word.length || Math.sin(t * 16) > -0.2) { ctx.fillStyle = LIME; ctx.fillRect(cx, 1192, 16, 160); }
  }
  ctx.restore();
}

// ---------- 11) her akşam canlı yayında ----------
function sLive(t) {
  const d = t - T11;
  bgGrad('#12020a', '#3a0418', '#0a0208');
  radial(540, 660, 1000, 'rgba(255,45,110,.45)'); radial(540, 1700, 900, 'rgba(255,212,0,.12)');
  // yayılan halkalar
  for (let i = 0; i < 3; i++) { const q = ((d * 0.9 + i / 3) % 1 + 1) % 1; ctx.save(); ctx.globalAlpha = (1 - q) * 0.5; ctx.lineWidth = 8; ctx.strokeStyle = '#ff5c8a'; ctx.beginPath(); ctx.arc(540, 660, 250 + q * 420, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
  const lp = prog(d, -0.1, 0.25), ls = lerp(0.3, 1, eBack(lp, 1.6)) * (1 + 0.02 * Math.sin(d * 9));
  ctx.save(); ctx.translate(540, 660); ctx.scale(ls, ls);
  // dönen canlı halkası
  ctx.save(); ctx.rotate(d * 2.4); const cg = ctx.createConicGradient(0, 0, 0); ['#ff2d46', '#ff7ad9', '#ffd400', '#ff2d46'].forEach((c, i) => cg.addColorStop(i / 3, c));
  ctx.beginPath(); ctx.arc(0, 0, 250, 0, Math.PI * 2); ctx.fillStyle = cg; ctx.shadowColor = '#ff2d6e'; ctx.shadowBlur = 60; ctx.fill(); ctx.restore();
  ctx.beginPath(); ctx.arc(0, 0, 228, 0, Math.PI * 2); ctx.fillStyle = '#12020a'; ctx.fill();
  if (LOGO.complete && LOGO.naturalWidth) { ctx.save(); ctx.beginPath(); ctx.arc(0, 0, 214, 0, Math.PI * 2); ctx.clip(); ctx.drawImage(LOGO, -214, -214, 428, 428); ctx.restore(); }
  // CANLI rozeti
  const beat = 1 + 0.06 * Math.max(0, Math.sin(d * 10));
  ctx.save(); ctx.translate(0, 262); ctx.scale(beat, beat); rr(-150, -50, 300, 100, 24); ctx.fillStyle = RED; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = '#12020a'; ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(-98, 0, 14, 0, Math.PI * 2); ctx.fill(); txt('CANLI', 22, 0, { size: 76, color: '#fff', spacing: 3 }); ctx.restore();
  ctx.restore();
  // yükselen kalpler
  const r = rng(88);
  for (let i = 0; i < 12; i++) {
    const ph = r(), sp = 0.5 + r() * 0.35, q = ((d * sp + ph) % 1 + 1) % 1, x = 880 + Math.sin(q * 7 + i) * 60 + r() * 60, y = lerp(1380, 420, q);
    emoji(['❤️', '💛', '💚', '💙', '🤍'][i % 5], x, y, 56 + r() * 34, Math.sin(q * 9 + i) * 0.3, clamp(q * 6, 0, 1) * clamp((1 - q) * 3, 0, 1) * clamp(d * 3 + 0.3, 0, 1));
  }
  const h1 = prog(t, C.her - 0.03, C.her + 0.16), h2 = prog(t, C.aksam - 0.03, C.aksam + 0.16);
  const wH = tw('HER ', 220, 900, true), wA = tw('AKŞAM', 220, 900, true), x0 = 540 - (wH + wA) / 2;
  slam('HER', x0 + (wH - tw(' ', 220, 900, true)) / 2, 1085, h1, { size: 220, italic: true, color: '#fff', stroke: 22, strokeColor: '#12020a' }, 2.4);
  slam('AKŞAM', x0 + wH + wA / 2, 1085, h2, { size: 220, italic: true, color: '#fff', stroke: 22, strokeColor: '#12020a' }, 2.4);
  const cp = prog(t, C.canli - 0.03, C.canli + 0.18);
  if (cp > 0) { ring(t, C.canli, 540, 1275, LIME, 800, 30, 0.5); ctx.save(); ctx.translate(540, 1275); const k = lerp(2.8, 1, eBack(cp, 1.4)); ctx.scale(k, k); ctx.rotate(-0.04); ctx.globalAlpha = clamp(cp * 4, 0, 1); tag('CANLI YAYINDA', 0, 0, { size: 150, bg: LIME, color: '#0a0f12' }); ctx.restore(); }
}
