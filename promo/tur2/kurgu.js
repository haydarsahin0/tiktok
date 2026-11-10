/* 2. Tur — kurgu: sahne sırası, geçişler, kamera, altyazı, renderFrame. */
const S = (n, ...a) => (t) => (window[n] ? window[n](t, ...a) : (bgNeutral(t), txt(n, 540, 900, { size: 80 })));
const SC = [
  [0, S('sHook')], [T.stats, S('sStats')], [T.bjk, S('sBjk')], [T.gs, S('sGs')], [T.fb, S('sFb')], [T.amedGfk, S('sAmedGfk')],
  [T.noGoal, S('sNoGoal')], [T.tablo, S('sTable')], [T.ikinci, S('sIkinci')], [T.kural65, S('sRule65')], [T.kuralAnadolu, S('sRuleAnadolu')],
  [T.kuralSpam, S('sRuleSpam')], [T.begeni, S('sLike')], [T.cta, S('sCta')],
];
// her sahneye GİRİŞ geçişi: [tür, süre, ...]
const TR = [null, ['flipV', 0.3], ['zin', 0.3, 540, 380], ['diag', 0.34], ['whipL', 0.3], ['slide', 0.3],
  ['spin', 0.34], ['whipU', 0.28], ['flash', 0.2], ['zout', 0.42, 540, 470], ['punch', 0.3],
  ['whipD', 0.32], ['iris', 0.5, 540, 700, 60], ['zin', 0.3, 420, 1150]];

function drawZoom(cv, fx, fy, s, a, blur = 0) {
  const n = blur > 0.05 ? 4 : 1;
  for (let i = 0; i < n; i++) {
    const k = s * (1 + blur * i * 0.05);
    ctx.save(); ctx.globalAlpha = a * (i ? 0.25 : 1); ctx.translate(fx, fy); ctx.scale(k, k); ctx.translate(-fx, -fy); ctx.drawImage(cv, 0, 0); ctx.restore();
  }
}
function drawSmear(cv, dx, dy, sx, sy) {
  for (let i = 0; i < 5; i++) { ctx.save(); ctx.globalAlpha = i ? 0.22 : 1; ctx.drawImage(cv, dx + sx * i * 0.2, dy + sy * i * 0.2); ctx.restore(); }
}
function speedLines(b, dir, seed) {
  if (b <= 0.02) return;
  const r = rng(seed); ctx.save(); ctx.globalAlpha = 0.6 * b; ctx.fillStyle = '#fff';
  for (let i = 0; i < 26; i++) { const y = r() * H, x = r() * W, l = 200 + r() * 600, h = 3 + r() * 6; if (dir === 'h') ctx.fillRect(x - l / 2, y, l, h); else ctx.fillRect(x, y - l / 2, h, l); }
  ctx.restore();
}
function sceneAt(t) {
  let i = 0;
  for (let k = 1; k < SC.length; k++) { const d = TR[k][1] || 0; if (t >= SC[k][0] - d / 2) i = k; }
  return i;
}
function compose(t) {
  const i = sceneAt(t), tr = TR[i], d = tr ? tr[1] || 0 : 0, T0 = SC[i][0];
  const out = LC.getContext('2d'); out.setTransform(1, 0, 0, 1, 0, 0); out.globalAlpha = 1; out.filter = 'none';
  if (!tr || tr[0] === 'cut' || t >= T0 + d / 2) { paint(LC, SC[i][1], t); return; }
  const p = prog(t, T0 - d / 2, T0 + d / 2), e = eInOut(p), b = Math.sin(p * Math.PI), kind = tr[0];
  if (kind === 'flash') {
    paint(LC, SC[p < 0.5 ? i - 1 : i][1], t);
    out.fillStyle = `rgba(255,255,255,${0.95 * Math.pow(b, 1.2)})`; out.fillRect(0, 0, W, H); return;
  }
  const A = paint(LA, SC[i - 1][1], t), B = paint(LB, SC[i][1], t);
  const prev = ctx; ctx = out;
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  if (kind === 'fade') { ctx.drawImage(A, 0, 0); ctx.globalAlpha = e; ctx.drawImage(B, 0, 0); ctx.globalAlpha = 1; }
  else if (kind === 'zin') {
    const [, , fx, fy] = tr;
    drawZoom(A, fx, fy, Math.pow(6, eIn(p)), 1, b);
    drawZoom(B, 540, 860, lerp(0.6, 1, eOut(p)), prog(p, 0.35, 0.7), b * 0.6);
    ctx.fillStyle = `rgba(255,255,255,${0.3 * b})`; ctx.fillRect(0, 0, W, H);
  } else if (kind === 'zout') {
    const [, , fx, fy] = tr;
    drawZoom(B, fx, fy, Math.pow(3.4, 1 - eOut(p)), 1, b);
    drawZoom(A, fx, fy, lerp(1, 0.3, eOut(p)), 1 - prog(p, 0.2, 0.55), b * 0.5);
    ctx.fillStyle = `rgba(255,255,255,${0.15 * b})`; ctx.fillRect(0, 0, W, H);
  } else if (kind === 'whipL' || kind === 'slide') {
    drawSmear(A, -e * W, 0, -b * 420, 0); drawSmear(B, (1 - e) * W, 0, b * 420, 0);
    if (kind === 'slide') { ctx.fillStyle = BG; ctx.fillRect((1 - e) * W - 18, 0, 18, H); speedLines(b, 'h', 77 + i); }
  } else if (kind === 'whipU' || kind === 'whipD') {
    const s = kind === 'whipU' ? -1 : 1;
    drawSmear(A, 0, s * e * H, 0, s * b * 520); drawSmear(B, 0, -s * (1 - e) * H, 0, -s * b * 520); speedLines(b * 0.7, 'v', 91 + i);
  } else if (kind === 'flipV') {
    const c = Math.cos(p * Math.PI), cv = p < 0.5 ? A : B, sy = Math.max(0.01, Math.abs(c));
    ctx.save(); ctx.translate(540, 900); ctx.scale(1 - 0.12 * b, sy); ctx.translate(-540, -900); ctx.drawImage(cv, 0, 0); ctx.restore();
    ctx.fillStyle = `rgba(0,0,0,${0.5 * b})`; ctx.fillRect(0, 0, W, H);
  } else if (kind === 'diag') { // önceki kart dikiş boyunca ikiye ayrılır
    ctx.drawImage(B, 0, 0);
    const off = eIn(p) * 1400, nx = 0.4, ny = 0.92;
    ctx.save(); ctx.translate(-nx * off, -ny * off); ctx.beginPath(); ctx.moveTo(-50, -50); ctx.lineTo(W + 50, -50); ctx.lineTo(W + 50, 640); ctx.lineTo(-50, 1120); ctx.closePath(); ctx.clip(); ctx.drawImage(A, 0, 0); ctx.restore();
    ctx.save(); ctx.translate(nx * off, ny * off); ctx.beginPath(); ctx.moveTo(-50, 1120); ctx.lineTo(W + 50, 640); ctx.lineTo(W + 50, H + 50); ctx.lineTo(-50, H + 50); ctx.closePath(); ctx.clip(); ctx.drawImage(A, 0, 0); ctx.restore();
    ctx.save(); ctx.globalAlpha = b; ctx.strokeStyle = '#fff'; ctx.lineWidth = 14; ctx.shadowColor = CY; ctx.shadowBlur = 40; ctx.beginPath(); ctx.moveTo(-50, 1120); ctx.lineTo(W + 50, 640); ctx.stroke(); ctx.restore();
  } else if (kind === 'spin') {
    const ra = eIn(p), rb = 1 - eOut(p);
    if (p < 0.55) { ctx.save(); ctx.translate(540, 880); ctx.rotate(ra * 1.2); ctx.scale(1 - 0.5 * ra, 1 - 0.5 * ra); ctx.translate(-540, -880); ctx.drawImage(A, 0, 0); ctx.restore(); }
    ctx.save(); ctx.globalAlpha = prog(p, 0.35, 0.6); ctx.translate(540, 880); ctx.rotate(-rb * 1.4); ctx.scale(lerp(0.4, 1, eOut(p)), lerp(0.4, 1, eOut(p))); ctx.translate(-540, -880); ctx.drawImage(B, 0, 0); ctx.restore();
  } else if (kind === 'punch') {
    drawZoom(A, 540, 880, lerp(1, 0.75, e), 1 - prog(p, 0.4, 0.8));
    drawZoom(B, 540, 880, lerp(1.8, 1, eOut(p)), prog(p, 0.25, 0.55), b);
    ctx.fillStyle = `rgba(255,255,255,${0.35 * b})`; ctx.fillRect(0, 0, W, H);
  } else if (kind === 'shrink') { // önceki sahne karta küçülür
    const [, , cx, cy, cw, ch] = tr, q = eOut(prog(p, 0, 0.8));
    ctx.drawImage(B, 0, 0);
    const w = lerp(W, cw, q), h = lerp(H, ch, q), x = lerp(540, cx, q), y = lerp(960, cy, q);
    ctx.save(); ctx.globalAlpha = 1 - prog(p, 0.7, 1); rr(x - w / 2, y - h / 2, w, h, 40 * q); ctx.clip(); ctx.drawImage(A, x - w / 2, y - h / 2, w, h); ctx.restore();
  } else if (kind === 'iris') { // önceki sahne daireye küçülür
    const [, , cx, cy, r1] = tr, q = eInOut(p), r = lerp(1200, r1, q);
    ctx.drawImage(B, 0, 0);
    ctx.save(); ctx.globalAlpha = 1 - prog(p, 0.75, 1); ctx.beginPath(); ctx.arc(lerp(540, cx, q), lerp(900, cy, q), r, 0, TAU); ctx.clip();
    ctx.translate(lerp(540, cx, q), lerp(900, cy, q)); const s = lerp(1, 0.32, q); ctx.scale(s, s); ctx.translate(-540, -900); ctx.drawImage(A, 0, 0); ctx.restore();
  }
  ctx = prev;
}

// ---------- kamera: vuruşlar + sarsıntı + hafif sürüklenme (t=0 ve sonda durgun) ----------
const HITS = [
  [T.turBitti, 0.05, 14], [T.skorFlip, 0.03, 6], [C.yirmi, 0.03, 0], [T.statCut, 0.03, 8], [T.statCount, 0.05, 10],
  [C.besiktas + 0.05, 0.05, 14], [C.konya + 0.04, 0.04, 12], [C.bir, 0.07, 22], [C.onde + 0.03, 0.05, 12],
  [C.galatasaray + 0.04, 0.05, 14], [C.samsunspora + 0.04, 0.04, 12], [C.atti, 0.07, 22],
  [C.fenerbahce + 0.05, 0.05, 14], [C.kocaelide + 0.04, 0.04, 12], [C.gecti, 0.07, 22],
  [C.amedspor + 0.12, 0.05, 14], [C.gaziantep + 0.06, 0.05, 14], [C.buldu, 0.03, 0],
  ...T.noGoalNames.map((x) => [x + 0.03, 0.02, 4]), [T.henuzYok, 0.05, 12], [T.nerede, 0.02, 0],
  [T.tabloShuffle, 0.03, 8], [C.biri, 0.03, 6], [C.ikinci, 0.08, 26], [C.basladi, 0.05, 16],
  [C.yuzde, 0.04, 8], [C.gecerse, 0.03, 6], [C.atar, 0.06, 18], [C.anadolu, 0.03, 6], [C.bucuk + 0.02, 0.05, 14],
  [C.on2, 0.03, 6], [C.sadece2, 0.04, 10], [C.sayildi, 0.03, 6], [C.herkesin, 0.04, 12],
  [C.onemlisi, 0.05, 12], [C.sayilmasi, 0.04, 14], [C.icin, 0.03, 8], [T.begeniUnlock, 0.07, 20], [C.sart, 0.04, 10],
  [T.heart, 0.04, 10], [T.tap, 0.04, 10], [T.pill, 0.04, 8], [C.cunku + 0.05, 0.02, 0],
];
function camera(t) {
  let s = 1, x = 0, y = 0;
  for (const [t0, a] of HITS) if (t >= t0 && t < t0 + 0.4) { const q = 1 - (t - t0) / 0.4; s += a * q * q; }
  const r = rng(frameSeed(t) * 7 + 1);
  for (const [t0, , a] of HITS) if (a > 0 && t >= t0 && t < t0 + 0.28) { const q = 1 - (t - t0) / 0.28, k = a * q * q; x += (r() - 0.5) * 2 * k; y += (r() - 0.5) * 2 * k; }
  const env = prog(t, 0.2, 1.2) * (1 - prog(t, T.settle - 0.2, T.settle + 0.45));
  x += env * 7 * Math.sin(t * 0.9); y += env * 6 * Math.sin(t * 0.7 + 1); s += env * 0.012 * (1 + Math.sin(t * 0.5));
  return { s, x, y };
}

// ---------- altyazı: tek satır, y≈1440; söylenen kelime altın ve büyür ----------
function subtitles(t) {
  const CH = VO.chunks;
  for (let ci = 0; ci < CH.length; ci++) {
    const ch = CH[ci], s0 = ch[0].s - 0.06, e0 = Math.min(ch[ch.length - 1].e + 0.3, ci + 1 < CH.length ? CH[ci + 1][0].s - 0.06 : DUR + 1);
    if (t < s0 || t >= e0) continue;
    const words = ch.map((w) => w.w.toLocaleUpperCase('tr-TR'));
    let size = 76; const gap = () => size * 0.28;
    const meas = () => words.reduce((a, w) => a + tw(w, size), 0) + (words.length - 1) * gap();
    while (size > 36 && meas() > 800) size -= 2;
    const total = meas(), pop = lerp(0.85, 1, eBack(prog(t, s0, s0 + 0.12), 1.6));
    ctx.save(); ctx.translate(540, 1442); ctx.scale(pop, pop);
    let x = -total / 2;
    words.forEach((w, wi) => {
      const ww = tw(w, size), ws = ch[wi].s - 0.04, we = wi + 1 < ch.length ? ch[wi + 1].s - 0.04 : 99;
      const active = t >= ws && t < we, said = t >= ws;
      const k = active ? 1 + 0.16 * (1 - eOut(prog(t, ws, ws + 0.14))) + 0.04 : 1;
      ctx.save(); ctx.translate(x + ww / 2, 0); ctx.scale(k, k);
      if (active) { txt(w, 3, 3, { size, color: RD, stroke: size * 0.22, strokeColor: 'rgba(5,5,8,.95)' }); txt(w, 0, 0, { size, color: GOLD }); }
      else txt(w, 0, 0, { size, color: '#fff', alpha: said ? 1 : 0.62, stroke: size * 0.22, strokeColor: 'rgba(5,5,8,.95)' });
      ctx.restore();
      x += ww + gap();
    });
    ctx.restore();
  }
}

// ---------- son işlem ----------
const GRAIN = [0, 1, 2].map((s) => { const c = mk(270, 480), g = c.getContext('2d'), im = g.createImageData(270, 480), r = rng(100 + s); for (let i = 0; i < im.data.length; i += 4) { const v = 128 + (r() - 0.5) * 80; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; } g.putImageData(im, 0, 0); return c; });
const VIG = (() => { const c = mk(), g = c.getContext('2d'), gr = g.createRadialGradient(540, 900, 640, 540, 900, 1300); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.38)'); g.fillStyle = gr; g.fillRect(0, 0, W, H); return c; })();
window.renderFrame = (t) => {
  compose(t);
  const cam = camera(t);
  M.setTransform(1, 0, 0, 1, 0, 0); M.globalAlpha = 1; M.globalCompositeOperation = 'source-over'; M.filter = 'none';
  M.fillStyle = '#000'; M.fillRect(0, 0, W, H);
  M.save(); M.translate(540 + cam.x, 900 + cam.y); M.scale(cam.s, cam.s); M.translate(-540, -900); M.drawImage(LC, 0, 0); M.restore();
  paint(main, (tt) => {
    subtitles(tt);
    ctx.drawImage(VIG, 0, 0);
    ctx.save(); ctx.globalAlpha = 0.06; ctx.globalCompositeOperation = 'overlay'; ctx.drawImage(GRAIN[frameSeed(tt) % 3], 0, 0, W, H); ctx.restore();
  }, t);
};

const PREVIEW = [...Array(Math.floor(DUR) + 1).keys()].concat([DUR - 1 / FPS]);
window.ready = Promise.all([
  ...['600', '800', '900'].map((f) => document.fonts.load(`${f} 60px "Barlow Condensed"`, 'AĞİŞÇÖÜığşçöü09')),
  document.fonts.load(`60px "Noto Color Emoji"`, '💬❤'),
  ...IMGS,
]).then(() => { IDS.forEach(buildSticker); buildAvatar();  });
if (!navigator.webdriver) {
  window.ready.then(() => { const t0 = performance.now(); const loop = () => { window.renderFrame(((performance.now() - t0) / 1000) % DUR); requestAnimationFrame(loop); }; loop(); });
}
