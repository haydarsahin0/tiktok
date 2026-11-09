/* Son On Saniye — çekirdek: tuval, seslendirme zamanları, yardımcılar, takım verisi. */
const W = 1080, H = 1920, FPS = 30;
const FONT = '"Barlow Condensed", "Arial Narrow", Arial, sans-serif';
const EMO = '"Noto Color Emoji", "Apple Color Emoji", sans-serif';
const main = document.getElementById('c');
const M = main.getContext('2d');
const mk = (w = W, h = H) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const LA = mk(), LB = mk(), LC = mk(), LD = mk(), LE = mk();
let ctx = LA.getContext('2d');

// ---------- seslendirme zamanları ----------
const getJSON = (u) => { const x = new XMLHttpRequest(); x.open('GET', u, false); x.send(); return JSON.parse(x.responseText); };
const VO = getJSON('son10-cues.json');
const PROMO = { vo: 'son10-ses.mp3', voOffset: 0, voTrim: VO.trim, voGain: 2.3, out: 'taraftar-ligi-son10.mp4' };
const norm = (w) => w.toLocaleLowerCase('tr-TR').replace(/[^a-zçğıöşü0-9']/g, '');
function cue(word, nth = 1) {
  let k = 0;
  for (const w of VO.words) if (norm(w.w) === norm(word) && ++k === nth) return w.s;
  throw new Error('kelime bulunamadı: ' + word);
}
const C = {
  son: cue('Son'), on: cue('on'), saniye: cue('saniye'), takimin: cue('Takımın'), sifir: cue('sıfır'), geride: cue('geride'),
  ve: cue('Ve'), maci: cue('maçı'), cevir: cue('çevirebilecek'), tek: cue('tek'), kisi: cue('kişi'), su: cue('şu'), videoyu: cue('videoyu'), izliyor: cue('izliyor'),
  yorumlara: cue('Yorumlara'), takimini: cue('takımını'), yaziyorsun: cue('yazıyorsun'),
  sahaya: cue('Sahaya'), forma: cue('forma'), dusuyor: cue('düşüyor'), o: cue('O'), forma2: cue('forma', 2), sensin: cue('sensin'),
  bar: cue('Bar'), doluyor: cue('doluyor'), altmis: cue('Altmış'), altmis2: cue('altmış', 2), uc: cue('üç'), durma: cue('Durma'), yaz: cue('yaz'),
  altmis3: cue('Altmış', 3), bes: cue('beş'), gol: cue('Gol'),
  ama: cue('Ama'), sevinme: cue('sevinme'), ayni: cue('Aynı'), anda: cue('anda'), sekiz: cue('sekiz'), mac: cue('maç'), oynaniyor: cue('oynanıyor'),
  ve2: cue('Ve', 2), rakibin: cue('rakibin'), atti: cue('attı'),
  puan: cue('Puan'), tablosu: cue('tablosu'), gozunun: cue('gözünün'), degisiyor: cue('değişiyor'),
  en: cue('En'), destek: cue('destek'), veren: cue('veren'), mi: cue('mi'), kaptan: cue('Kaptan'), oluyor: cue('oluyor'),
  adi: cue('Adı'), herkesin: cue('herkesin'), ekraninda: cue('ekranında'),
  burada: cue('Burada'), skoru: cue('skoru'), futbolcu: cue('futbolcu'), degil: cue('değil'), taraftar: cue('taraftar'), yaziyor: cue('yazıyor'),
  her: cue('Her'), aksam: cue('akşam'), canli: cue('canlı'), yayinda: cue('yayında'),
  ve3: cue('Ve', 3), tur: cue('tur'), ayni2: cue('aynı', 2), yerde: cue('yerde'), dugum: cue('düğümleniyor'),
};
// Döngü: son kelimeden kısa bir nefes sonra video başa döner
const DUR = Math.round((VO.duration + 0.3) * FPS) / FPS;

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
const smooth = (t) => t * t * (3 - 2 * t);
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const frameSeed = (t) => Math.floor(t * FPS + 0.5);
const hexA = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };

// renkler
const INK = '#070b14', RED = '#ff2d46', LIME = '#c8ff3d', YEL = '#ffd400', ICE = '#e9f1ff', NAVY = '#0f1b33';

const TEAM = {
  gs: { n: 'GALATASARAY', code: 'GS', c: ['#A90432', '#FDB912'] }, fb: { n: 'FENERBAHÇE', code: 'FB', c: ['#002D72', '#FFED00'] },
  bjk: { n: 'BEŞİKTAŞ', code: 'BJK', c: ['#16181d', '#FFFFFF'] }, ts: { n: 'TRABZONSPOR', code: 'TS', c: ['#7A1E48', '#5DADE2'] },
  amd: { n: 'AMEDSPOR', code: 'AMD', c: ['#00843D', '#D71920'] }, kas: { n: 'KASIMPAŞA', code: 'KSP', c: ['#0B2D5B', '#FFFFFF'] },
  koc: { n: 'KOCAELİSPOR', code: 'KOC', c: ['#00843D', '#111111'] }, ibf: { n: 'BAŞAKŞEHİR', code: 'İBF', c: ['#F26522', '#1B2A4A'] },
  cor: { n: 'ÇORUM FK', code: 'ÇOR', c: ['#D71920', '#111111'] }, riz: { n: 'RİZESPOR', code: 'RİZ', c: ['#009A44', '#1F6BB4'] },
  erz: { n: 'ERZURUMSPOR', code: 'ERZ', c: ['#0072BC', '#FFFFFF'] }, goz: { n: 'GÖZTEPE', code: 'GÖZ', c: ['#E30613', '#FFD100'] },
  aln: { n: 'ALANYASPOR', code: 'ALN', c: ['#F7941D', '#00A651'] }, gb: { n: 'GENÇLERBİRLİĞİ', code: 'GB', c: ['#D71920', '#111111'] },
  gfk: { n: 'GAZİANTEP FK', code: 'GFK', c: ['#b0122e', '#111111'] }, sam: { n: 'SAMSUNSPOR', code: 'SAM', c: ['#f4f4f4', '#E30A17'] },
  kon: { n: 'KONYASPOR', code: 'KON', c: ['#00843D', '#FFFFFF'] }, eyp: { n: 'EYÜPSPOR', code: 'EYP', c: ['#5B2C83', '#FFD100'] },
};
const CYCLE = ['gs', 'fb', 'bjk', 'ts', 'amd', 'goz', 'kon', 'sam', 'koc', 'riz', 'ibf', 'eyp'];

function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function setFont(size, weight = 900, italic = false) { ctx.font = `${italic ? 'italic ' : ''}${weight} ${size}px ${FONT}`; }
function txt(s, x, y, o = {}) {
  const { size = 60, weight = 900, italic = false, color = '#fff', align = 'center', stroke = 0, strokeColor = 'rgba(0,0,0,.85)', max = 0, alpha = 1, glow = 0, glowColor = '#000', grad = null, spacing = 0 } = o;
  let sz = size;
  ctx.letterSpacing = spacing ? `${spacing}px` : '0px';
  setFont(sz, weight, italic);
  if (max) while (sz > 10 && ctx.measureText(s).width > max) { sz -= 2; setFont(sz, weight, italic); }
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.textAlign = align; ctx.textBaseline = 'middle';
  if (glow) { ctx.shadowColor = glowColor; ctx.shadowBlur = glow; }
  if (stroke) { ctx.lineJoin = 'round'; ctx.lineWidth = stroke; ctx.strokeStyle = strokeColor; ctx.strokeText(s, x, y + sz * 0.04); ctx.shadowBlur = 0; }
  if (grad) { const g = ctx.createLinearGradient(0, y - sz * 0.42, 0, y + sz * 0.4); grad.forEach((c, i) => g.addColorStop(i / (grad.length - 1), c)); ctx.fillStyle = g; } else ctx.fillStyle = color;
  ctx.fillText(s, x, y + sz * 0.04);
  ctx.restore();
  ctx.letterSpacing = '0px';
}
function tw(s, size, weight = 900, italic = false, spacing = 0) { ctx.letterSpacing = spacing ? `${spacing}px` : '0px'; setFont(size, weight, italic); const w = ctx.measureText(s).width; ctx.letterSpacing = '0px'; return w; }
// büyükten küçüğe çakılan yazı (p: 0..1)
function slam(s, x, y, p, o = {}, from = 2.6, rot = 0) {
  if (p <= 0) return;
  const sc = lerp(from, 1, eBack(clamp(p, 0, 1), 1.4));
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc);
  txt(s, 0, 0, { ...o, alpha: (o.alpha ?? 1) * clamp(p * 4, 0, 1) });
  ctx.restore();
}
// eğik etiket: renkli paralelkenar üstünde yazı
function tag(s, x, y, o = {}) {
  const { size = 60, bg = RED, color = '#fff', padX = 0.45, skew = -0.18, alpha = 1, weight = 900, max = 0 } = o;
  let sz = size; let w = tw(s, sz, weight, true);
  if (max && w > max) { sz = Math.floor((sz * max) / w); w = tw(s, sz, weight, true); }
  const bw = w + sz * padX * 2, bh = sz * 1.18;
  ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(x, y); ctx.transform(1, 0, skew, 1, 0, 0);
  ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(-bw / 2 + 8, -bh / 2 + 10, bw, bh);
  ctx.fillStyle = bg; ctx.fillRect(-bw / 2, -bh / 2, bw, bh);
  ctx.restore();
  txt(s, x, y, { size: sz, weight, italic: true, color, alpha });
  return bw;
}
function emoji(e, x, y, size, rot = 0, alpha = 1) {
  if (size < 2 || alpha <= 0) return;
  ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(x, y); ctx.rotate(rot);
  ctx.font = `${size}px ${EMO}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(e, 0, size * 0.04); ctx.restore();
}
function bgGrad(c0, c1, c2) {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, c0); g.addColorStop(0.55, c1); g.addColorStop(1, c2);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
function radial(x, y, r, col, a = 1) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore();
}
function rays(cx, cy, rot, col, n = 18, alpha = 0.14) {
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot); ctx.globalAlpha *= alpha; ctx.fillStyle = col;
  for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2, w = (Math.PI / n) * 0.55; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a - w) * 2600, Math.sin(a - w) * 2600); ctx.lineTo(Math.cos(a + w) * 2600, Math.sin(a + w) * 2600); ctx.fill(); }
  ctx.restore();
}
// analitik konfeti: patlamadan geçen süreye göre konum
function confetti(t, t0, x0, y0, colors, n, seed, spread = 1) {
  const dt = t - t0;
  if (dt < 0 || dt > 3.2) return;
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    const a = r() * Math.PI * 2, sp = (500 + r() * 1300) * spread;
    const vx = Math.cos(a) * sp, vy = Math.sin(a) * sp - 800;
    const drag = 1 - Math.exp(-2.2 * dt);
    const x = x0 + (vx / 2.2) * drag, y = y0 + (vy / 2.2) * drag + 430 * dt * dt;
    const s = 12 + r() * 20, rot = r() * 6 + dt * (r() * 12 - 6);
    ctx.save(); ctx.globalAlpha = clamp(1.4 - dt / 2.3, 0, 1); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(1, Math.cos(dt * 9 + i));
    ctx.fillStyle = colors[i % colors.length]; ctx.fillRect(-s / 2, -s / 4, s, s / 2); ctx.restore();
  }
}
function ring(t, t0, x, y, col, maxR = 700, w = 22, dur = 0.6) {
  const p = prog(t, t0, t0 + dur);
  if (p <= 0 || p >= 1) return;
  ctx.save(); ctx.globalAlpha *= 1 - p; ctx.lineWidth = w * (1 - p) + 2; ctx.strokeStyle = col;
  ctx.beginPath(); ctx.arc(x, y, 40 + eOut(p) * maxR, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
}
// arma: çapraz iki renkli yuvarlak
function crest(tm, x, y, r, label = true) {
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.clip();
  ctx.fillStyle = tm.c[0]; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  ctx.fillStyle = tm.c[1]; ctx.beginPath(); ctx.moveTo(x + r * 0.15, y - r); ctx.lineTo(x + r, y - r); ctx.lineTo(x + r, y + r); ctx.lineTo(x - r * 0.55, y + r); ctx.closePath(); ctx.fill();
  ctx.restore();
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.lineWidth = Math.max(3, r * 0.1); ctx.strokeStyle = '#fff'; ctx.stroke();
  if (label) txt(tm.code, x, y, { size: r * 0.78, stroke: Math.max(4, r * 0.2), max: r * 1.6 });
}
function jerseyPath(cx, top, w) {
  const p = [[-0.16, 0], [0, 0.11], [0.16, 0], [0.33, 0.05], [0.52, 0.24], [0.41, 0.37], [0.3, 0.29], [0.3, 0.98], [-0.3, 0.98], [-0.3, 0.29], [-0.41, 0.37], [-0.52, 0.24], [-0.33, 0.05]];
  ctx.beginPath(); p.forEach(([px, py], i) => (i ? ctx.lineTo : ctx.moveTo).call(ctx, cx + px * w, top + py * w)); ctx.closePath();
}
// forma: gövde ana renk, kollar ve yaka ikinci renk
function jersey(c, cx, top, w, label = '', o = {}) {
  ctx.save(); jerseyPath(cx, top, w); ctx.fillStyle = c[0]; ctx.fill(); ctx.clip();
  ctx.fillStyle = c[1];
  ctx.fillRect(cx - w * 0.6, top, w * 0.3, w * 0.42); ctx.fillRect(cx + w * 0.3, top, w * 0.3, w * 0.42);
  ctx.fillRect(cx - w * 0.3, top + w * 0.86, w * 0.6, w * 0.14);
  const g = ctx.createLinearGradient(cx - w * 0.5, 0, cx + w * 0.5, 0); g.addColorStop(0, 'rgba(0,0,0,.28)'); g.addColorStop(0.35, 'rgba(255,255,255,.1)'); g.addColorStop(1, 'rgba(0,0,0,.22)');
  ctx.fillStyle = g; ctx.fillRect(cx - w, top, w * 2, w);
  ctx.restore();
  ctx.save(); jerseyPath(cx, top, w); ctx.lineWidth = Math.max(2, w * 0.022); ctx.lineJoin = 'round'; ctx.strokeStyle = o.line || 'rgba(255,255,255,.92)'; ctx.stroke(); ctx.restore();
  if (label) txt(label, cx, top + w * 0.56, { size: w * 0.3, italic: true, color: o.text || '#fff', stroke: w * 0.05, max: w * 0.52 });
}
// sabit genişlikli rakam yazımı (sayaç titremesin)
function digits(s, x, y, size, o = {}) {
  const { color = '#fff', weight = 900, italic = true, cell = 0.5, alpha = 1, glow = 0, glowColor = RED } = o;
  let wsum = 0; const ws = [];
  for (const ch of s) { const cw = (ch === ':' || ch === '.' ? 0.26 : ch === '%' ? 0.62 : ch === ' ' ? 0.22 : cell) * size; ws.push(cw); wsum += cw; }
  let cx = o.align === 'left' ? x : o.align === 'right' ? x - wsum : x - wsum / 2;
  [...s].forEach((ch, i) => { txt(ch, cx + ws[i] / 2, y, { size, weight, italic, color, alpha, glow, glowColor }); cx += ws[i]; });
  return wsum;
}
const pad2 = (n) => String(n).padStart(2, '0');
// "00:09.84" / "24:57"
function fmtClock(s, cs = true) {
  s = Math.max(0, s);
  const m = Math.floor(s / 60), ss = Math.floor(s % 60), c = Math.floor((s * 100) % 100);
  return `${pad2(m)}:${pad2(ss)}` + (cs ? `.${pad2(c)}` : '');
}
function paint(cv, fn, t) {
  const c = cv.getContext('2d');
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.filter = 'none';
  const prev = ctx; ctx = c; fn(t); ctx = prev;
  return cv;
}
// resimler
const img = (src) => { const i = new Image(); i.src = src; return i; };
const LOGO = img('../logo/taraftar-ligi-sade.png');
const IMGS = [LOGO];
