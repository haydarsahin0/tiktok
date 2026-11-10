/* 2. Tur — çekirdek (6. videodan): tuval katmanları, yardımcılar, yazı, takım verisi, logo çıkartmaları. (zaman.js'ten sonra yüklenir) */
const FONT = '"Barlow Condensed", "Arial Narrow", Arial, sans-serif';
const EMO = '"Noto Color Emoji", "Apple Color Emoji", sans-serif';
const main = document.getElementById('c');
const M = main.getContext('2d');
const mk = (w = W, h = H) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const LA = mk(), LB = mk(), LC = mk();
let ctx = LA.getContext('2d');

// ---------- yardımcılar ----------
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const prog = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
const eOut = (t) => 1 - Math.pow(1 - t, 3);
const eOut5 = (t) => 1 - Math.pow(1 - t, 5);
const eIn = (t) => t * t * t;
const eInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const eBack = (t, s = 1.7) => 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2);
const eElastic = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI) / 3) + 1);
const bell = (t, a, b) => { const p = prog(t, a, b); return p <= 0 || p >= 1 ? 0 : Math.sin(p * Math.PI); };
const win = (t, a, b, fi = 0.15, fo = 0.15) => Math.min(prog(t, a, a + fi), 1 - prog(t, b - fo, b)); // pencere: 0→1→0
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const frameSeed = (t) => Math.floor(t * FPS + 0.5);
const hexRGB = (hex) => { const n = parseInt(hex.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
const hexA = (hex, a) => { const [r, g, b] = hexRGB(hex); return `rgba(${r},${g},${b},${a})`; };
const shade = (hex, k) => { const c = hexRGB(hex).map((v) => clamp(Math.round(k < 0 ? v * (1 + k) : v + (255 - v) * k), 0, 255)); return `rgb(${c[0]},${c[1]},${c[2]})`; };
const lum = (hex) => { const [r, g, b] = hexRGB(hex); return (0.299 * r + 0.587 * g + 0.114 * b) / 255; };
const TAU = Math.PI * 2;

// ---------- renkler ----------
const BG = '#0c0c10', CY = '#25f4ee', RD = '#fe2c55', GOLD = '#ffcc33', PAPER = '#f5f1e8', INK = '#121218', WARN = '#ffd21f';

// ---------- takımlar (veri.js) ----------
const SAY = { ibfk: 'BAŞAKŞEHİR', corum: 'ÇORUM', amed: 'AMED', rize: 'RİZE', erzurum: 'ERZURUM', goztepe: 'GÖZTEPE', kasimpasa: 'KASIMPAŞA', alanya: 'ALANYA',
  gb: 'GENÇLERBİRLİĞİ', gfk: 'GAZİANTEP', gs: 'GALATASARAY', samsun: 'SAMSUN', kocaeli: 'KOCAELİ', fb: 'FENERBAHÇE', konya: 'KONYA', bjk: 'BEŞİKTAŞ', ts: 'TRABZON', eyup: 'EYÜP' };
const TM = {};
for (const [id, v] of Object.entries(VERI.teams)) TM[id] = { id, ...v, say: SAY[id], up: v.name.toLocaleUpperCase('tr-TR') };
const IDS = ['gs', 'fb', 'bjk', 'ts', 'ibfk', 'goztepe', 'samsun', 'konya', 'alanya', 'kasimpasa', 'gfk', 'rize', 'gb', 'eyup', 'kocaeli', 'amed', 'corum', 'erzurum'];
const REEL = ['gs', 'kocaeli', 'fb', 'konya', 'bjk', 'eyup', 'ts', 'amed', 'samsun', 'goztepe', 'rize', 'ibfk', 'gb', 'erzurum', 'alanya', 'gfk', 'kasimpasa', 'corum'];
// maç kartında iki yarının rengi: deplasman rengi ev sahibine çok yakınsa ikinci rengi
const cdist = (a, b) => { const x = hexRGB(a), y = hexRGB(b); return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]); };
const pairCols = (h, a) => { const ch = TM[h].c[0]; let ca = TM[a].c[0]; if (cdist(ch, ca) < 100) ca = TM[a].c[1]; return [ch, ca]; };

// ---------- yazı ----------
function setFont(size, weight = 900) { ctx.font = `${weight} ${size}px ${FONT}`; }
function tw(s, size, weight = 900, spacing = 0) { ctx.letterSpacing = `${spacing}px`; setFont(size, weight); const w = ctx.measureText(s).width; ctx.letterSpacing = '0px'; return w; }
function fit(s, size, max, weight = 900, spacing = 0) { let sz = size; while (sz > 12 && tw(s, sz, weight, spacing) > max) sz -= 2; return sz; }
function txt(s, x, y, o = {}) {
  const { size = 60, weight = 900, color = '#fff', align = 'center', stroke = 0, strokeColor = 'rgba(8,8,12,.92)', max = 0, alpha = 1, glow = 0, glowColor = '#000', spacing = 0 } = o;
  const sz = max ? fit(s, size, max, weight, spacing) : size;
  if (alpha <= 0) return sz;
  ctx.save(); ctx.globalAlpha *= alpha; ctx.letterSpacing = `${spacing}px`; setFont(sz, weight);
  ctx.textAlign = align; ctx.textBaseline = 'middle';
  if (glow) { ctx.shadowColor = glowColor; ctx.shadowBlur = glow; }
  if (stroke) { ctx.lineJoin = 'round'; ctx.lineWidth = stroke; ctx.strokeStyle = strokeColor; ctx.strokeText(s, x, y + sz * 0.05); ctx.shadowBlur = 0; }
  ctx.fillStyle = color; ctx.fillText(s, x, y + sz * 0.05);
  ctx.restore(); ctx.letterSpacing = '0px';
  return sz;
}
// "sosyal uygulama" ikili ofset yazı: camgöbeği sol-üst, kırmızı sağ-alt, beyaz üstte
function duo(s, x, y, size, o = {}) {
  const { max = 0, alpha = 1, off = size * 0.045, color = '#fff', align = 'center', spacing = 0, stroke = 0 } = o;
  const sz = max ? fit(s, size, max, 900, spacing) : size;
  const d = (sz / size) * off;
  txt(s, x - d, y - d * 0.6, { size: sz, color: CY, align, alpha, spacing });
  txt(s, x + d, y + d * 0.6, { size: sz, color: RD, align, alpha, spacing });
  txt(s, x, y, { size: sz, color, align, alpha, spacing, stroke, strokeColor: 'rgba(8,8,12,.5)' });
  return sz;
}
// büyükten küçüğe çakılan yazı (p 0..1), ezilip esneme ile
function slamDuo(s, x, y, size, p, o = {}, rot = 0) {
  if (p <= 0) return;
  const q = clamp(p, 0, 1), sc = lerp(o.from || 2.8, 1, eBack(q, 1.3));
  const sq = q > 0.55 && q < 1 ? 1 + 0.12 * Math.sin(prog(q, 0.55, 1) * Math.PI) : 1;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc * sq, sc / sq);
  duo(s, 0, 0, size, { ...o, alpha: (o.alpha ?? 1) * clamp(q * 4, 0, 1) });
  ctx.restore();
}
function emoji(e, x, y, size, rot = 0, alpha = 1) {
  if (size < 2 || alpha <= 0) return;
  ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(x, y); ctx.rotate(rot);
  ctx.font = `${size}px ${EMO}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(e, 0, size * 0.05); ctx.restore();
}
const fmtN = (n) => Math.round(n).toLocaleString('tr-TR');

// ---------- çizim yardımcıları ----------
function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function radial(x, y, r, col, a = 1) {
  if (a <= 0) return;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore();
}
function ring(t, t0, x, y, col, maxR = 700, w = 22, dur = 0.6) {
  const p = prog(t, t0, t0 + dur);
  if (p <= 0 || p >= 1) return;
  ctx.save(); ctx.globalAlpha *= 1 - p; ctx.lineWidth = w * (1 - p) + 2; ctx.strokeStyle = col;
  ctx.beginPath(); ctx.arc(x, y, 30 + eOut(p) * maxR, 0, TAU); ctx.stroke(); ctx.restore();
}
function rays(cx, cy, rot, col, n = 16, alpha = 0.14, len = 1600) {
  if (alpha <= 0) return;
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot); ctx.globalAlpha *= alpha; ctx.fillStyle = col;
  for (let i = 0; i < n; i++) { const a = (i / n) * TAU, w = (Math.PI / n) * 0.5; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a - w) * len, Math.sin(a - w) * len); ctx.lineTo(Math.cos(a + w) * len, Math.sin(a + w) * len); ctx.fill(); }
  ctx.restore();
}
// kıvılcım patlaması (analitik)
function sparks(t, t0, x, y, cols, n, seed, sp = 1, life = 0.7) {
  const dt = t - t0; if (dt < 0 || dt > life) return;
  const r = rng(seed), q = dt / life;
  ctx.save(); ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const a = r() * TAU, v = (300 + r() * 900) * sp, d = (v / 4) * (1 - Math.exp(-4 * dt));
    const px = x + Math.cos(a) * d, py = y + Math.sin(a) * d + 200 * dt * dt, l = 10 + 40 * (1 - q) * r();
    ctx.globalAlpha = 1 - q; ctx.strokeStyle = cols[i % cols.length]; ctx.lineWidth = 3 + 5 * (1 - q);
    ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px - Math.cos(a) * l, py - Math.sin(a) * l); ctx.stroke();
  }
  ctx.restore();
}
// mürekkep sıçraması (damga)
function splat(x, y, r0, col, seed, a = 1) {
  const r = rng(seed); ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = col;
  for (let i = 0; i < 26; i++) { const an = r() * TAU, d = r0 * (0.9 + r() * 0.9), s = 4 + r() * 18 * (1.3 - d / (r0 * 1.8)); ctx.beginPath(); ctx.arc(x + Math.cos(an) * d * 1.5, y + Math.sin(an) * d * 0.7, Math.max(2, s), 0, TAU); ctx.fill(); }
  ctx.restore();
}
function paint(cv, fn, t) {
  const c = cv.getContext('2d');
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.filter = 'none';
  const prev = ctx; ctx = c; fn(t); ctx = prev;
  return cv;
}
// desenler: noktalı raster ve çapraz çizgiler (bir kez)
const DOTS = (() => { const c = mk(1080, 1920), g = c.getContext('2d'); g.fillStyle = '#fff'; for (let y = 0; y < 1920; y += 22) for (let x = (y / 22) % 2 ? 11 : 0; x < 1080; x += 22) { const r = 2.2 + 3.2 * (y / 1920); g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); } return c; })();
const STRIPES = (() => { const c = mk(1080, 1920), g = c.getContext('2d'); g.strokeStyle = '#fff'; g.lineWidth = 16; for (let k = -1920; k < 1080 + 1920; k += 56) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k + 1920 * 0.6, 1920); g.stroke(); } return c; })();

// ---------- resimler ----------
const IMG = {}, IMGS = [];
function loadImg(key, src) { const i = new Image(); IMG[key] = i; IMGS.push(new Promise((res) => { i.onload = () => res(); i.onerror = () => res(); })); i.src = src; return i; }
for (const id of IDS) loadImg(id, 'logos/' + id + '.png');
loadImg('tl', '../logo/taraftar-ligi-sade.png');
const okImg = (i) => i && i.complete && i.naturalWidth > 0;

// ---------- logo çıkartması: açık disk + kalın koyu çerçeve + yumuşak gölge (hazır() sonrası bir kez üretilir) ----------
const STK = {}, STKS = 300; // tuval 300x300, disk yarıçapı 118
function buildSticker(id) {
  const c = mk(STKS, STKS), g = c.getContext('2d'), R = 118, cx = 150, cy = 146;
  g.save(); g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 22; g.shadowOffsetY = 10;
  g.beginPath(); g.arc(cx, cy, R + 9, 0, TAU); g.fillStyle = '#16161c'; g.fill(); g.restore();
  g.beginPath(); g.arc(cx, cy, R, 0, TAU); const gr = g.createRadialGradient(cx - 30, cy - 40, 10, cx, cy, R); gr.addColorStop(0, '#ffffff'); gr.addColorStop(1, '#ecebe6'); g.fillStyle = gr; g.fill();
  const im = IMG[id];
  if (okImg(im)) {
    const k = Math.min((R * 1.5) / im.naturalWidth, (R * 1.5) / im.naturalHeight), w = im.naturalWidth * k, h = im.naturalHeight * k;
    g.imageSmoothingQuality = 'high'; g.drawImage(im, cx - w / 2, cy - h / 2, w, h);
  } else { // GEÇİCİ: logo dosyası yoksa takım renginde disk + kısaltma
    const tm = TM[id]; g.beginPath(); g.arc(cx, cy, R * 0.78, 0, TAU); g.fillStyle = tm.c[0]; g.fill(); g.lineWidth = 10; g.strokeStyle = tm.c[1]; g.stroke();
    g.font = `900 ${R * 0.6}px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 8; g.strokeStyle = '#000'; g.strokeText(tm.code, cx, cy + 4); g.fillStyle = '#fff'; g.fillText(tm.code, cx, cy + 4);
    g.font = `900 22px ${FONT}`; g.fillStyle = '#f0f'; g.fillText('GEÇİCİ', cx, cy + R * 0.62);
  }
  STK[id] = c;
}
function buildAvatar() {
  const c = mk(STKS, STKS), g = c.getContext('2d'), R = 118, cx = 150, cy = 146;
  g.save(); g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = 24; g.shadowOffsetY = 10; g.beginPath(); g.arc(cx, cy, R + 9, 0, TAU); g.fillStyle = '#fff'; g.fill(); g.restore();
  g.save(); g.beginPath(); g.arc(cx, cy, R, 0, TAU); g.clip(); g.fillStyle = '#101018'; g.fillRect(0, 0, STKS, STKS);
  const im = IMG.tl; if (okImg(im)) { const k = Math.min((R * 1.62) / im.naturalWidth, (R * 1.62) / im.naturalHeight), w = im.naturalWidth * k, h = im.naturalHeight * k; g.drawImage(im, cx - w / 2, cy - h / 2, w, h); }
  g.restore(); STK.tl = c;
}
// çıkartma çiz: d = disk çapı (px). o: alpha, rot, sx/sy (ezilme), dim (karartma 0..1), gray
function sticker(id, x, y, d, o = {}) {
  const c = STK[id]; if (!c || d < 2) return;
  const { alpha = 1, rot = 0, sx = 1, sy = 1, dim = 0, gray = 0 } = o; if (alpha <= 0) return;
  const s = d / 236; // disk çapı 236 px
  ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s * sx, s * sy);
  if (gray > 0) ctx.filter = `grayscale(${gray}) brightness(${1 - gray * 0.3})`;
  ctx.drawImage(c, -150, -146);
  ctx.filter = 'none';
  if (dim > 0) { ctx.globalAlpha *= dim; ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(0, 0, 127, 0, TAU); ctx.fill(); }
  ctx.restore();
}

