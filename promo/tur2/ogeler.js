/* 2. Tur — tekrar eden öğeler (6. videodan): yorum kutusu, +3 parası, yorum baloncukları, düello çubuğu, VS, kor, kalp, ok, arka plan. */

// ---------- yorum baloncukları: avatar (logo) + nick + TAKIM ----------
const NICKS = [['aslan_1905', 'gs'], ['kadıköylü', 'fb'], ['çarşı_34', 'bjk'], ['bordo61', 'ts'], ['timsah16', 'kocaeli'], ['dadaş25', 'erzurum'], ['göz_göz35', 'goztepe'],
  ['amed.21', 'amed'], ['çaykur53', 'rize'], ['kırmızışimşek', 'samsun'], ['kartal_42', 'konya'], ['turuncu_ibfk', 'ibfk'], ['kasımpaşalı', 'kasimpasa'], ['alanya07', 'alanya'],
  ['ankaralı06', 'gb'], ['antep27', 'gfk'], ['eyüp.34', 'eyup'], ['çorumlu19', 'corum'], ['cimbom_kız', 'gs'], ['sarılacivert', 'fb'], ['kara.kartal', 'bjk'], ['fırtına61', 'ts'],
  ['yeşilbeyaz42', 'konya'], ['kocaeli41', 'kocaeli']];
const BUB = [];
function buildBubbles() {
  NICKS.forEach(([nick, id]) => {
    const name = TM[id].say, prev = ctx, c0 = mk(10, 10); ctx = c0.getContext('2d');
    const wn = tw(name, 46, 900), wk = tw(nick, 26, 600), w = Math.ceil(Math.max(wn, wk) + 140), h = 104;
    const c = mk(w + 20, h + 24); ctx = c.getContext('2d');
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.4)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 6; rr(10, 8, w, h, 52); ctx.fillStyle = 'rgba(255,255,255,.97)'; ctx.fill(); ctx.restore();
    sticker(id, 10 + 52, 8 + 52, 80);
    txt(nick, 10 + 106, 8 + 32, { size: 26, weight: 600, color: '#6c6c78', align: 'left' });
    txt(name, 10 + 104, 8 + 68, { size: 46, color: INK, align: 'left' });
    ctx = prev; BUB.push(c);
  });
}
function bubble(i, x, y, s = 1, a = 1, rot = 0) {
  const c = BUB[((i % BUB.length) + BUB.length) % BUB.length]; if (!c || a <= 0 || s <= 0.01) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); ctx.drawImage(c, -c.width / 2, -c.height / 2); ctx.restore();
}

// ---------- imleç: süreye tam bölünen periyotla yanıp söner (döngü) ----------
const BLINK_N = Math.round(DUR / 0.9);
const blink = (t) => (Math.cos((TAU * t * BLINK_N) / DUR) > -0.25 ? 1 : 0);

// ---------- yorum kutusu ----------
function pill(x, y, o = {}) {
  const { w = 780, h = 124, alpha = 1, typed = '', t = 0, send = 0, scale = 1, glow = 0.5 } = o; if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(x, y); ctx.scale(scale, scale);
  radial(0, 0, w * 0.62, hexA(CY, 0.16 * glow + 0.06));
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.55)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 10; rr(-w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = '#1e1e27'; ctx.fill(); ctx.restore();
  rr(-w / 2, -h / 2, w, h, h / 2); ctx.lineWidth = 4; const g = ctx.createLinearGradient(-w / 2, 0, w / 2, 0); g.addColorStop(0, hexA(CY, 0.9)); g.addColorStop(1, hexA(RD, 0.9)); ctx.strokeStyle = g; ctx.stroke();
  emoji('💬', -w / 2 + 66, 0, 54);
  const tx = -w / 2 + 116;
  let cx = tx;
  if (typed) { const sz = txt(typed, tx, 0, { size: 58, color: '#fff', align: 'left', max: w - 270 }); cx = tx + tw(typed, sz) + 8; }
  else txt('Takımını yaz…', tx, 0, { size: 56, weight: 800, color: 'rgba(255,255,255,.5)', align: 'left' });
  if (blink(t)) { ctx.fillStyle = CY; ctx.fillRect(typed ? cx : tx - 10, -32, 6, 64); }
  const bs = 1 + 0.25 * send;
  ctx.save(); ctx.translate(w / 2 - 66, 0); ctx.scale(bs, bs); ctx.beginPath(); ctx.arc(0, 0, 44, 0, TAU); ctx.fillStyle = RD; ctx.fill();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(-17, -19); ctx.lineTo(23, 0); ctx.lineTo(-17, 19); ctx.lineTo(-10, 0); ctx.closePath(); ctx.fill(); ctx.restore();
  ctx.restore();
}

// ---------- +3 parası ----------
const COIN = (() => {
  const c = mk(440, 440), g = c.getContext('2d'), R = 200, X = 220;
  let gr = g.createRadialGradient(X - 60, X - 70, 20, X, X, R); gr.addColorStop(0, '#fff3b0'); gr.addColorStop(0.45, GOLD); gr.addColorStop(1, '#c98a06');
  g.beginPath(); g.arc(X, X, R, 0, TAU); g.fillStyle = gr; g.fill();
  g.lineWidth = 14; g.strokeStyle = '#a86f00'; g.stroke();
  g.beginPath(); g.arc(X, X, R - 34, 0, TAU); g.lineWidth = 6; g.strokeStyle = 'rgba(140,90,0,.55)'; g.stroke();
  for (let i = 0; i < 40; i++) { const a = (i / 40) * TAU; g.beginPath(); g.arc(X + Math.cos(a) * (R - 17), X + Math.sin(a) * (R - 17), 4, 0, TAU); g.fillStyle = 'rgba(255,250,210,.7)'; g.fill(); }
  g.font = `900 210px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillStyle = 'rgba(120,70,0,.55)'; g.fillText('+3', X + 6, X + 18);
  gr = g.createLinearGradient(0, X - 90, 0, X + 90); gr.addColorStop(0, '#fffdf0'); gr.addColorStop(1, '#ffe7a0'); g.fillStyle = gr; g.fillText('+3', X, X + 10);
  g.lineWidth = 5; g.strokeStyle = '#8a5a00'; g.strokeText('+3', X, X + 10);
  g.save(); g.beginPath(); g.arc(X, X, R, 0, TAU); g.clip(); g.globalAlpha = 0.35; const sh = g.createLinearGradient(X - R, X - R, X + R, X + R); sh.addColorStop(0.3, 'rgba(255,255,255,0)'); sh.addColorStop(0.45, '#fff'); sh.addColorStop(0.6, 'rgba(255,255,255,0)'); g.fillStyle = sh; g.fillRect(0, 0, 440, 440); g.restore();
  return c;
})();
// r = yarıçap, flip = Y ekseni dönüş açısı (rad)
function coin(x, y, r, o = {}) {
  const { flip = 0, rot = 0, alpha = 1, glow = 0.5, shadow = true } = o; if (alpha <= 0 || r < 1) return;
  const cs = Math.cos(flip), sx = Math.max(0.04, Math.abs(cs)), th = r * 0.12 * Math.sqrt(1 - cs * cs);
  ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(x, y); ctx.rotate(rot);
  if (glow > 0) radial(0, 0, r * 2.4, hexA(GOLD, 0.45 * glow));
  if (shadow) { ctx.save(); ctx.globalAlpha *= 0.35; ctx.fillStyle = '#000'; ctx.beginPath(); ctx.ellipse(r * 0.08, r * 0.14, r * sx, r, 0, 0, TAU); ctx.fill(); ctx.restore(); }
  if (th > 0.5) { ctx.fillStyle = '#9a6400'; ctx.beginPath(); ctx.ellipse(Math.sign(Math.sin(flip) || 1) * th, 0, r * sx, r, 0, 0, TAU); ctx.fill(); }
  ctx.scale(sx * (r / 200), r / 200); ctx.drawImage(COIN, -220, -220);
  ctx.restore();
}

// ---------- düello çubuğu ----------
function duelBar(x, y, w, f, cl, cr, o = {}) {
  const { h = 50, alpha = 1, nl = '', nr = '', size = 64, q = 0, t = 0 } = o; if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha *= alpha;
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 18; rr(x - w / 2 - 6, y - h / 2 - 6, w + 12, h + 12, (h + 12) / 2); ctx.fillStyle = '#0b0b0f'; ctx.fill(); ctx.restore();
  ctx.save(); rr(x - w / 2, y - h / 2, w, h, h / 2); ctx.clip();
  const sx = x - w / 2 + w * f;
  ctx.fillStyle = cl; ctx.fillRect(x - w / 2, y - h / 2, sx - (x - w / 2), h);
  ctx.fillStyle = cr; ctx.fillRect(sx, y - h / 2, x + w / 2 - sx, h);
  ctx.globalAlpha *= 0.18; ctx.fillStyle = '#fff'; ctx.fillRect(x - w / 2, y - h / 2, w, h * 0.38);
  ctx.restore();
  ctx.save(); ctx.shadowColor = '#fff'; ctx.shadowBlur = 20; ctx.fillStyle = '#fff'; rr(sx - 6, y - h / 2 - 12, 12, h + 24, 6); ctx.fill(); ctx.restore();
  if (nl !== '') txt(nl, x - w / 2 + 4, y - h / 2 - size * 0.62, { size, align: 'left', stroke: 10, color: '#fff' });
  if (nr !== '') txt(nr, x + w / 2 - 4, y - h / 2 - size * 0.62, { size, align: 'right', stroke: 10, color: '#fff' });
  if (q > 0) { const p = 1 + 0.12 * Math.sin(t * 12); ctx.save(); ctx.translate(x, y); ctx.scale(p, p); ctx.beginPath(); ctx.arc(0, 0, 40, 0, TAU); ctx.fillStyle = '#fff'; ctx.globalAlpha *= q; ctx.fill(); txt('?', 0, 0, { size: 62, color: INK }); ctx.restore(); }
  ctx.restore();
}

// ---------- VS kıvılcımı ----------
function vsBadge(x, y, s, t, a = 1) {
  if (a <= 0 || s <= 0.01) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.scale(s, s);
  rays(0, 0, t * 0.8, '#fff', 12, 0.22, 260);
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 24; ctx.beginPath(); ctx.arc(0, 0, 86, 0, TAU); ctx.fillStyle = BG; ctx.fill(); ctx.restore();
  ctx.lineWidth = 7; ctx.strokeStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, 86, 0, TAU); ctx.stroke();
  duo('VS', 0, 2, 96, { off: 5 });
  ctx.restore();
}

// ---------- maç ilerlemesi (9 parça) ----------
function progress(fill, o = {}) {
  const { y = 322, alpha = 1, label = '', hot = 0, t = 0, burst = 0 } = o; if (alpha <= 0) return;
  const x0 = 110, w = 860, gap = 12, sw = (w - gap * 8) / 9, h = 20;
  ctx.save(); ctx.globalAlpha *= alpha;
  for (let i = 0; i < 9; i++) {
    const x = x0 + i * (sw + gap), f = clamp(fill - i, 0, 1);
    rr(x, y - h / 2, sw, h, h / 2); ctx.fillStyle = 'rgba(255,255,255,.2)'; ctx.fill();
    if (i >= 5 && hot > 0) { const pu = 0.55 + 0.45 * Math.sin(t * 9 + i); ctx.save(); ctx.shadowColor = RD; ctx.shadowBlur = 26 * hot * pu; rr(x, y - h / 2, sw, h, h / 2); ctx.fillStyle = hexA('#ff4a1c', 0.75 * hot * pu); ctx.fill(); ctx.restore(); }
    if (f > 0) { ctx.save(); ctx.shadowColor = '#fff'; ctx.shadowBlur = 14; rr(x, y - h / 2, sw * f, h, h / 2); ctx.fillStyle = burst > 0 ? GOLD : '#fff'; ctx.fill(); ctx.restore(); }
  }
  if (label) txt(label, 540, y + 50, { size: 46, spacing: 3, stroke: 8, color: '#fff' });
  ctx.restore();
}

// ---------- kor parçacıkları (yukarı süzülür) ----------
function embers(t, n, seed, a = 1, x0 = 0, x1 = W, y0 = H, rise = 1600) {
  if (a <= 0) return;
  const r = rng(seed); ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const life = 1.6 + r() * 1.6, ph = r(), x = lerp(x0, x1, r()), sz = 3 + r() * 7, sw = r() * 6;
    const age = ((t / life + ph) % 1), y = y0 - age * rise, xx = x + Math.sin(t * 2 + sw) * 30 * age;
    ctx.globalAlpha = a * Math.sin(age * Math.PI) * 0.9; ctx.fillStyle = i % 3 ? '#ff7a2a' : '#ffd36a';
    ctx.beginPath(); ctx.arc(xx, y, sz * (1 - age * 0.6), 0, TAU); ctx.fill();
  }
  ctx.restore();
}

// ---------- kalp ----------
function heart(x, y, s, col = RD, a = 1, rot = 0) {
  if (a <= 0 || s <= 0.5) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s / 100, s / 100);
  ctx.beginPath(); ctx.moveTo(0, 35); ctx.bezierCurveTo(-60, -5, -55, -60, -25, -60); ctx.bezierCurveTo(-8, -60, 0, -45, 0, -35); ctx.bezierCurveTo(0, -45, 8, -60, 25, -60); ctx.bezierCurveTo(55, -60, 60, -5, 0, 35); ctx.closePath();
  ctx.fillStyle = col; ctx.fill(); ctx.restore();
}
// ok (yön açısı a): CTA'da sağ kenara / aşağı işaret
function arrow(x, y, ang, len, col = '#fff', a = 1) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.rotate(ang); ctx.fillStyle = col; ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 14;
  ctx.beginPath(); ctx.moveTo(0, -14); ctx.lineTo(len - 48, -14); ctx.lineTo(len - 48, -38); ctx.lineTo(len, 0); ctx.lineTo(len - 48, 38); ctx.lineTo(len - 48, 14); ctx.lineTo(0, 14); ctx.closePath(); ctx.fill(); ctx.restore();
}

// ---------- arka plan: kömür + nefes alan camgöbeği/kırmızı ışıklar (DUR'a periyodik) ----------
function bgNeutral(t, k = 1) {
  ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
  const ph = (TAU * t * 3) / DUR;
  radial(160 + 40 * Math.sin(ph), 520, 760, hexA(CY, 0.2 * k));
  radial(930 - 40 * Math.sin(ph), 1360, 820, hexA(RD, 0.2 * k));
  ctx.save(); ctx.globalAlpha = 0.045; ctx.drawImage(DOTS, 0, 0); ctx.restore();
}

