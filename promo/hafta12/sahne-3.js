/* 12. Hafta — sahne 3: "Maçlar sırayla geliyor!" (kart destesi) + sahne 4/6: maç kartları (VS) */
const SEAM = [[0, 1120], [W, 640]]; // köşegen dikiş: ev sahibi sol/üst, deplasman sağ/alt
const seamY = (x) => lerp(SEAM[0][1], SEAM[1][1], x / W);

// küçük VS kartları (bir kez çizilir, 600x820)
const MINI = [];
let MINI_GEN = null;
function buildMini(cols, ids, label) {
  const c = mk(600, 820), prev = ctx; ctx = c.getContext('2d');
  rr(0, 0, 600, 820, 40); ctx.save(); ctx.clip();
  ctx.fillStyle = cols[0]; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(600, 0); ctx.lineTo(600, 330); ctx.lineTo(0, 560); ctx.fill();
  ctx.fillStyle = cols[1]; ctx.beginPath(); ctx.moveTo(0, 560); ctx.lineTo(600, 330); ctx.lineTo(600, 820); ctx.lineTo(0, 820); ctx.fill();
  ctx.globalAlpha = 0.12; ctx.drawImage(DOTS, 0, 0, 600, 1066); ctx.globalAlpha = 1;
  const g = ctx.createLinearGradient(0, 0, 0, 820); g.addColorStop(0, 'rgba(255,255,255,.12)'); g.addColorStop(1, 'rgba(0,0,0,.25)'); ctx.fillStyle = g; ctx.fillRect(0, 0, 600, 820);
  ctx.strokeStyle = BG; ctx.lineWidth = 22; ctx.beginPath(); ctx.moveTo(0, 560); ctx.lineTo(600, 330); ctx.stroke();
  ctx.restore();
  if (ids) { sticker(ids[0], 175, 250, 240); sticker(ids[1], 425, 610, 240); }
  else { txt('?', 175, 250, { size: 260, stroke: 16 }); txt('?', 425, 610, { size: 260, stroke: 16 }); }
  ctx.save(); ctx.translate(300, 445); ctx.beginPath(); ctx.arc(0, 0, 62, 0, TAU); ctx.fillStyle = BG; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = '#fff'; ctx.stroke(); duo('VS', 0, 2, 66, { off: 3 }); ctx.restore();
  if (label) { rr(24, 24, 150, 56, 28); ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fill(); txt(label, 99, 52, { size: 40, spacing: 1 }); }
  rr(3, 3, 594, 814, 38); ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.stroke();
  ctx = prev; return c;
}
function card(c, x, y, w, rot = 0, a = 1, dim = 0) {
  if (!c || a <= 0) return; const s = w / 600;
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.55)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 16; rr(-300, -410, 600, 820, 40); ctx.fillStyle = '#000'; ctx.fill(); ctx.restore();
  ctx.drawImage(c, -300, -410);
  if (dim > 0) { ctx.globalAlpha *= dim; rr(-300, -410, 600, 820, 40); ctx.fillStyle = '#000'; ctx.fill(); }
  ctx.restore();
}
window.prepScenes = () => {
  MATCHES.forEach((m, i) => MINI.push(buildMini(pairCols(m.home, m.away), [m.home, m.away], `MAÇ ${i + 1}`)));
  MINI_GEN = buildMini(['#0f6d72', '#8a1030'], null, '');
};

function sDeck(t) {
  bgNeutral(t);
  const fanIn = (j) => eBack(prog(t, T.maclar + 0.05 + j * 0.035, T.maclar + 0.4 + j * 0.035), 1.2);
  const gather = eInOut(prog(t, C.geliyor - 0.05, C.geliyor + 0.3));
  // yelpaze: 9 maç kartı; "sırayla" derken tek tek kalkar
  for (let j = 8; j >= 0; j--) {
    const f = fanIn(j), ang = (j - 4) * 0.15 * f * (1 - gather);
    const lift = 60 * bell(t, C.sirayla + j * 0.065, C.sirayla + j * 0.065 + 0.22);
    const R = 560, px = 540, py = 1380;
    let x = px + Math.sin(ang) * R, y = py - Math.cos(ang) * R - lift, w = 330;
    if (j === 0) { const g = eInOut(prog(t, C.geliyor, C.geliyor + 0.35)); x = lerp(x, DECK_CARD[0], g); y = lerp(y, DECK_CARD[1], g); w = lerp(330, DECK_CARD[2], g); }
    card(MINI[j], x, y, w, ang * 0.9, clamp(f * 2, 0, 1), j === 0 ? 0 : 0.45 * gather);
  }
  // önde: düellodan kalan genel kart, "sırayla"da aşağı düşer
  const drop = eIn(prog(t, C.sirayla - 0.1, C.sirayla + 0.3));
  if (drop < 1) card(MINI_GEN, DECK_CARD[0], DECK_CARD[1] + drop * 1400, DECK_CARD[2], drop * 0.5, 1);
  slamDuo('12. HAFTA · 9 MAÇ', 540, 1290, 120, prog(t, C.maclar, C.maclar + 0.18), { max: 900 });
}

// ---------- maç kartı ----------
function chipYaz(id, x, y, a = 1, s = 1) {
  if (a <= 0) return;
  const name = TM[id].say, wn = Math.min(tw(name, 46), 330), w = wn + 170;
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.scale(s, s);
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 6; rr(-w / 2, -34, w, 68, 34); ctx.fillStyle = '#fff'; ctx.fill(); ctx.restore();
  emoji('💬', -w / 2 + 38, 0, 36);
  txt('yaz:', -w / 2 + 92, 0, { size: 34, weight: 800, color: '#777' });
  txt(name, -w / 2 + 122 + wn / 2, 0, { size: 46, color: INK, max: 330 });
  ctx.restore();
}
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
function scramble(t, seed) { const r = rng(frameSeed(t) * 13 + seed); return r() < 0.35 ? '?' : String(Math.floor(r() * 999)); }

function sMatch(t, i) {
  const m = MATCHES[i], [cl, ca] = pairCols(m.home, m.away), big = m.big, K = big ? 1.25 : 1;
  const t0 = T.m[i], hL = landH(i), aL = landA(i);
  const pH = prog(t, hL - 0.14, hL), pA = prog(t, aL - 0.14, aL);
  const end = i < 8 ? (i === 4 ? T.isin : T.m[i + 1]) : T.sen;
  const z = 1 + 0.05 * prog(t, t0, end);
  ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.translate(540, 880); ctx.scale(z, z); ctx.translate(-540, -880);
  // boş kart: büyük soluk "MAÇ n"
  duo(`MAÇ ${i + 1}`, 540, 880, 260, { alpha: 0.18 * (1 - pA) });
  if (pH > 0) half(true, cl, -(1 - eOut5(pH)) * 1200);
  if (pA > 0) half(false, ca, (1 - eOut5(pA)) * 1200);
  if (big) { embers(t, 40, 500 + i, 0.9, 0, W, H + 40, 1500); rays(540, 880, t * 0.4, '#fff', 14, 0.06 * prog(t, aL, aL + 0.3), 1400); }
  if (pA > 0) { ctx.save(); ctx.strokeStyle = BG; ctx.lineWidth = 34; ctx.beginPath(); ctx.moveTo(-40, seamY(-40)); ctx.lineTo(W + 40, seamY(W + 40)); ctx.stroke();
    ctx.globalAlpha = prog(pA, 0.8, 1); ctx.strokeStyle = hexA('#ffffff', 0.85); ctx.lineWidth = 5; ctx.shadowColor = '#fff'; ctx.shadowBlur = 24; ctx.stroke(); ctx.restore(); }
  // uçuşan baloncuklar (büyük maçlar): iki takımın taraftarı
  if (big && t > aL) {
    const bi = (id) => NICKS.findIndex((n) => n[1] === id);
    for (let k = 0; k < 6; k++) {
      const side = k % 2, st = aL + 0.1 + k * 0.17, dt = t - st; if (dt < 0 || dt > 1.4) continue;
      const q = dt / 1.4, x = side ? lerp(-200, 330, eOut(q)) : lerp(1280, 760, eOut(q)), y = (side ? 1262 : 448) - q * 30 + (k % 3) * 12;
      bubble(bi(side ? m.away : m.home), x, y, 0.6, q > 0.75 ? (1 - q) / 0.25 : 1, side ? 0.06 : -0.06);
    }
  }
  // ev sahibi
  const dH = 280 * (big ? 1.12 : 1), hx = 245, hy = 600;
  if (pH > 0) {
    const sq = bell(t, hL, hL + 0.25);
    sticker(m.home, hx - (1 - eOut5(pH)) * 900, hy, dH, { sx: 1 + 0.18 * sq, sy: 1 - 0.16 * sq, rot: -0.05 });
    txt(TM[m.home].say, 655 - (1 - eOut5(pH)) * 900, 560, { size: 88, stroke: 14, max: 450, alpha: prog(t, hL - 0.04, hL + 0.08) });
    chipYaz(m.home, 655, 648, prog(t, hL + 0.05, hL + 0.2), eBack(prog(t, hL + 0.05, hL + 0.25)));
    if (big) { ring(t, hL, hx, hy, '#fff', 600, 26, 0.5); ring(t, hL + 0.06, hx, hy, GOLD, 420, 12, 0.45); }
  }
  // deplasman
  const ax = 770, ay = 1060;
  if (pA > 0) {
    const sq = bell(t, aL, aL + 0.25);
    sticker(m.away, ax + (1 - eOut5(pA)) * 900, ay, dH, { sx: 1 + 0.18 * sq, sy: 1 - 0.16 * sq, rot: 0.05 });
    txt(TM[m.away].say, 405 + (1 - eOut5(pA)) * 900, 1090, { size: 88, stroke: 14, max: 450, alpha: prog(t, aL - 0.04, aL + 0.08) });
    chipYaz(m.away, 405, 1180, prog(t, aL + 0.05, aL + 0.2), eBack(prog(t, aL + 0.05, aL + 0.25)));
    if (big) { ring(t, aL, ax, ay, '#fff', 600, 26, 0.5); ring(t, aL + 0.06, ax, ay, GOLD, 420, 12, 0.45); }
  } else txt('?', ax, ay, { size: 300, color: 'rgba(255,255,255,.12)' });
  // VS kıvılcımı
  const vs = prog(t, aL - 0.02, aL + 0.2);
  if (vs > 0) { vsBadge(540, 880, lerp(1.8, 1, eBack(vs, 2)) * (big ? 1.1 : 1), t, clamp(vs * 3, 0, 1)); sparks(t, aL, 540, 880, ['#fff', GOLD, CY, RD], big ? 30 : 18, 40 + i, big ? 1.3 : 0.9, 0.6); }
  // düello çubuğu: sonuç açık, 0–0, "?"
  const ba = prog(t, hL + 0.1, hL + 0.3);
  if (ba > 0) {
    duelBar(540, 1350, 680, 0.5, cl, ca, { h: 46, alpha: ba, q: 1, t });
    const sl = big && t > aL ? scramble(t, 1) : '0', sr = big && t > aL ? scramble(t, 2) : '0';
    txt(sl, 158, 1350, { size: 58, stroke: 10, alpha: ba }); txt(sr, 922, 1350, { size: 58, stroke: 10, alpha: ba });
  }
  ctx.restore();
  // flaşlar (büyük maçlar)
  if (big) for (const tl of [hL, aL]) { const f = 1 - prog(t, tl, tl + 0.1); if (t >= tl && f > 0) { ctx.fillStyle = `rgba(255,255,255,${0.55 * f})`; ctx.fillRect(0, 0, W, H); } }
}
