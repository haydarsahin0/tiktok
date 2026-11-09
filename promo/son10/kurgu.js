/* Kurgu: sahne sırası, geçişler, kamera, üst skor şeridi, altyazı, son işlem. */
const LF = mk();
const SC = [[0, sHook], [T2, sPhone], [T3, sType], [T4, sPitch], [T5, sBar], [T6, sGoal], [T7, sList], [T8, sTable], [T9, sCaptain], [T10, sWords], [T11, sLive], [T12, sHook]];
// her sahneye GİRİŞ geçişi: [tür, süre, odakX, odakY]
const TR = [null, ['cut'], ['zin', 0.34, 540, 1150], ['whipU', 0.3], ['zin', 0.36, 540, 840], ['flash', 0.26], ['fade', 0.2], ['whipL', 0.28], ['zin', 0.3, 540, 478], ['wipe', 0.34], ['zin', 0.32, 540, 1050], ['zout', 0.4, 540, 600]];

function drawZoom(cv, fx, fy, s, a, blur = 0) {
  const n = blur > 0.01 ? 5 : 1;
  for (let i = 0; i < n; i++) {
    const k = s * (1 + blur * i * 0.05);
    ctx.save(); ctx.globalAlpha = a * (i ? 0.22 : 1); ctx.translate(fx, fy); ctx.scale(k, k); ctx.translate(-fx, -fy); ctx.drawImage(cv, 0, 0); ctx.restore();
  }
}
function drawSmear(cv, dx, dy, sx, sy) {
  for (let i = 0; i < 6; i++) { ctx.save(); ctx.globalAlpha = i ? 0.2 : 1; ctx.drawImage(cv, dx + sx * i * 0.16, dy + sy * i * 0.16); ctx.restore(); }
}
function compose(t) {
  let i = 0;
  for (let k = 1; k < SC.length; k++) { const d = TR[k][1] || 0; if (t >= SC[k][0] - d / 2) i = k; }
  const tr = TR[i], d = tr ? tr[1] || 0 : 0, T = SC[i][0];
  const out = LC.getContext('2d'); out.setTransform(1, 0, 0, 1, 0, 0); out.globalAlpha = 1; out.filter = 'none';
  if (!tr || tr[0] === 'cut' || t >= T + d / 2) { paint(LC, SC[i][1], t); return; }
  const p = prog(t, T - d / 2, T + d / 2), e = eInOut(p), b = Math.sin(p * Math.PI);
  const kind = tr[0];
  if (kind === 'flash') {
    paint(LC, SC[p < 0.5 ? i - 1 : i][1], t);
    out.fillStyle = `rgba(255,255,255,${0.95 * Math.pow(b, 1.5)})`; out.fillRect(0, 0, W, H); return;
  }
  const A = paint(LA, SC[i - 1][1], t), B = paint(LB, SC[i][1], t);
  const prev = ctx; ctx = out;
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  if (kind === 'fade') { ctx.drawImage(A, 0, 0); ctx.globalAlpha = p; ctx.drawImage(B, 0, 0); ctx.globalAlpha = 1; }
  else if (kind === 'zin') {
    const [, , fx, fy] = tr;
    drawZoom(A, fx, fy, Math.pow(5, e), 1, b);
    drawZoom(B, 540, 860, lerp(0.7, 1, eOut(p)), prog(e, 0.3, 0.72), b * 0.6);
    ctx.fillStyle = `rgba(255,255,255,${0.22 * b})`; ctx.fillRect(0, 0, W, H);
  } else if (kind === 'zout') {
    const [, , fx, fy] = tr;
    drawZoom(B, fx, fy, Math.pow(4, 1 - e), 1, b);
    drawZoom(A, 540, 760, lerp(1, 0.55, e), 1 - prog(e, 0.25, 0.7), b * 0.6);
    ctx.fillStyle = `rgba(255,255,255,${0.18 * b})`; ctx.fillRect(0, 0, W, H);
  } else if (kind === 'whipU') {
    drawSmear(A, 0, -e * H, 0, -b * 520); drawSmear(B, 0, (1 - e) * H, 0, b * 520);
  } else if (kind === 'whipL') {
    drawSmear(A, -e * W, 0, -b * 420, 0); drawSmear(B, (1 - e) * W, 0, b * 420, 0);
  } else if (kind === 'wipe') {
    ctx.drawImage(A, 0, 0);
    const ex = lerp(-320, W + 320, e);
    ctx.save(); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(ex + 260, 0); ctx.lineTo(ex - 260, H); ctx.lineTo(0, H); ctx.closePath(); ctx.clip(); ctx.drawImage(B, 0, 0); ctx.restore();
    ctx.save(); ctx.strokeStyle = LIME; ctx.lineWidth = 34; ctx.shadowColor = LIME; ctx.shadowBlur = 40; ctx.beginPath(); ctx.moveTo(ex + 270, -20); ctx.lineTo(ex - 270, H + 20); ctx.stroke();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(ex + 330, -20); ctx.lineTo(ex - 210, H + 20); ctx.stroke(); ctx.restore();
  }
  ctx = prev;
}

// ---------- kamera ----------
const PUNCH = [[C.geride, 0.05], [C.tek, 0.04], [C.izliyor + 0.3, 0.07], [SEND, 0.04], [LAND, 0.06], [C.altmis, 0.03], [C.uc + 0.05, 0.03], [C.durma, 0.04], [C.bes + 0.05, 0.06], [T6, 0.1],
  [C.sevinme, 0.04], [FBGOAL, 0.07], [C.mi, 0.03], [CAP, 0.06], [C.degil, 0.04], [C.taraftar, 0.07], [C.canli, 0.04]];
const SHAKE = [[C.geride, 14, 0.25], [LAND, 22, 0.35], [T6, 30, 0.5], [FBGOAL, 24, 0.35], [CAP, 14, 0.3], [C.taraftar, 18, 0.3]];
function camera(t) {
  let s = 1, x = 0, y = 0;
  for (const [t0, a] of PUNCH) if (t >= t0 && t < t0 + 0.4) { const q = 1 - (t - t0) / 0.4; s += a * q * q; }
  const r = rng(frameSeed(t) * 7 + 1);
  for (const [t0, a, d] of SHAKE) if (t >= t0 && t < t0 + d) { const q = 1 - (t - t0) / d, k = a * q * q; x += (r() - 0.5) * 2 * k; y += (r() - 0.5) * 2 * k; s += k / 500; }
  return { s, x, y };
}

// ---------- üst skor şeridi ----------
function hud(t) {
  if (t < T3 - 0.05 || t > T12 + 0.2) return;
  const inP = eBack(prog(t, T3 - 0.05, T3 + 0.3), 1.3), outP = prog(t, T12 - 0.15, T12 + 0.15);
  const k = clock(t), scored = t >= T6, since = t - T6;
  const hot = k.run && k.s < 3.2 ? 0.5 + 0.5 * Math.sin(t * 22) : 0;
  ctx.save(); ctx.globalAlpha = 1 - outP; ctx.translate(540, 224 - (1 - inP) * 320 - outP * 200);
  ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 8;
  rr(-310, -50, 620, 100, 50); ctx.fillStyle = 'rgba(6,9,18,.92)'; ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.lineWidth = 3; ctx.strokeStyle = k.run ? hexA(RED, 0.55 + 0.45 * hot) : 'rgba(255,255,255,.22)'; ctx.stroke();
  // sol: sayaç / canlı
  if (k.run) {
    ctx.fillStyle = hexA(RED, 0.5 + 0.5 * Math.sin(t * 9)); ctx.beginPath(); ctx.arc(-272, 0, 11, 0, Math.PI * 2); ctx.fill();
    const sc = 1 + 0.08 * tickPulse(t);
    ctx.save(); ctx.translate(-136, -2); ctx.scale(sc, sc); digits(fmtClock(k.s), 0, 0, 66, { color: k.s < 3.2 ? RED : '#fff', glow: 14 * hot, glowColor: RED }); ctx.restore();
  } else {
    ctx.fillStyle = hexA(RED, 0.55 + 0.45 * Math.sin(t * 7)); ctx.beginPath(); ctx.arc(-236, 0, 13, 0, Math.PI * 2); ctx.fill();
    txt(t < T7 ? 'TUR BİTTİ' : 'CANLI', -128, -2, { size: 58, italic: true, color: t < T7 ? YEL : '#fff', spacing: 2 });
  }
  ctx.fillStyle = 'rgba(255,255,255,.2)'; ctx.fillRect(4, -30, 3, 60);
  // sağ: skor
  crest(HERO, 62, 0, 28, false); crest(RIVAL, 258, 0, 28, false);
  const pop = scored && since < 0.6 ? 1 + 0.7 * Math.pow(1 - since / 0.6, 2) : 1;
  ctx.save(); ctx.translate(126, -2); ctx.scale(pop, pop); digits(scored ? '1' : '0', 0, 0, 68, { color: scored && since < 2 ? YEL : '#fff', glow: pop > 1.02 ? 24 : 0, glowColor: YEL }); ctx.restore();
  txt('–', 160, -5, { size: 50, color: 'rgba(255,255,255,.5)' });
  digits('1', 194, -2, 68, { color: '#fff' });
  ctx.restore();
}

// ---------- altyazı: aktif kelime limon kutuda ----------
function subtitles(t) {
  if (t > T10 - 0.06 && t < T11 - 0.06) return; // kinetik yazı sahnesi kendi altyazısı
  const CH = VO.chunks;
  for (let ci = 0; ci < CH.length; ci++) {
    const ch = CH[ci], s0 = ch[0].s - 0.06, e0 = Math.min(ch[ch.length - 1].e + 0.3, ci + 1 < CH.length ? CH[ci + 1][0].s - 0.06 : 99);
    if (t < s0 || t >= e0) continue;
    const words = ch.map((w) => w.w.toLocaleUpperCase('tr-TR'));
    let size = 88;
    const meas = () => words.reduce((a, w) => a + tw(w, size, 900, true), 0) + (words.length - 1) * size * 0.34;
    while (size > 40 && meas() > 940) size -= 4;
    const total = meas(), pop = lerp(0.82, 1, eBack(prog(t, s0, s0 + 0.12), 1.6));
    ctx.save(); ctx.translate(540, 1466); ctx.scale(pop, pop);
    let x = -total / 2;
    words.forEach((w, wi) => {
      const ww = tw(w, size, 900, true), ws = ch[wi].s - 0.04, we = wi + 1 < ch.length ? ch[wi + 1].s - 0.04 : 99;
      const active = t >= ws && t < we, said = t >= ws;
      if (active) {
        const q = eOut(prog(t, ws, ws + 0.09));
        ctx.save(); ctx.translate(x + ww / 2, 0); ctx.transform(1, 0, -0.16, 1, 0, 0); ctx.scale(lerp(0.6, 1, q), 1);
        ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.fillRect(-ww / 2 - size * 0.16 + 6, -size * 0.56 + 8, ww + size * 0.32, size * 1.12);
        ctx.fillStyle = LIME; ctx.fillRect(-ww / 2 - size * 0.16, -size * 0.56, ww + size * 0.32, size * 1.12); ctx.restore();
        txt(w, x + ww / 2, 0, { size, italic: true, color: '#0a0f12' });
      } else txt(w, x + ww / 2, 0, { size, italic: true, color: '#fff', alpha: said ? 1 : 0.6, stroke: size * 0.2, strokeColor: 'rgba(5,7,12,.95)' });
      x += ww + size * 0.34;
    });
    ctx.restore();
  }
}

// ---------- son işlem ----------
const GRAIN = [0, 1, 2].map((s) => { const c = mk(270, 480), g = c.getContext('2d'), im = g.createImageData(270, 480), r = rng(100 + s); for (let i = 0; i < im.data.length; i += 4) { const v = 128 + (r() - 0.5) * 90; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; } g.putImageData(im, 0, 0); return c; });
window.renderFrame = (t) => {
  compose(t);
  const cam = camera(t);
  M.setTransform(1, 0, 0, 1, 0, 0); M.globalAlpha = 1; M.globalCompositeOperation = 'source-over'; M.filter = 'none';
  M.fillStyle = '#000'; M.fillRect(0, 0, W, H);
  // "ama sevinme": renk çekilir
  const frz = prog(t, C.ama, C.ama + 0.18) * (1 - prog(t, T7 - 0.1, T7 + 0.1));
  if (frz > 0.01) M.filter = `saturate(${1 - 0.8 * frz}) contrast(${1 + 0.1 * frz})`;
  M.save(); M.translate(540 + cam.x, 860 + cam.y); M.scale(cam.s, cam.s); M.translate(-540, -860); M.drawImage(LC, 0, 0); M.restore();
  M.filter = 'none';
  paint(main, (tt) => {
    hud(tt); subtitles(tt);
    const g = ctx.createRadialGradient(540, 900, 620, 540, 900, 1250); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.34)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.globalAlpha = 0.07; ctx.globalCompositeOperation = 'overlay'; ctx.imageSmoothingEnabled = true; ctx.drawImage(GRAIN[frameSeed(tt) % 3], 0, 0, W, H); ctx.restore();
  }, t);
};

const PREVIEW = [0.1, 1.5, 2.6, 4.0, 4.95, 6.3, 7.1, 7.33, 8.2, 8.9, 9.24, 10.0, 10.5, 11.6, 12.04, 12.6, 13.6, 14.8, 16.2, 16.68, 16.95, 17.9, 18.13, 18.4, 19.4, 20.9, 21.6, 21.77, 22.2, 23.0, 23.9, 24.15, 24.8, 25.5, 25.9, 26.8, 27.2, 28.0, 28.2, 29.1, 30.1, 31.2, 31.37, 32.0, 32.9, 33.18, 33.8, 34.6, 35.3];
window.ready = Promise.all([
  ...['600', '800', '900', 'italic 800', 'italic 900'].map((f) => document.fonts.load(`${f} 60px "Barlow Condensed"`, 'AĞİŞÇÖÜığşçöü09')),
  ...IMGS.map((i) => i.decode().catch(() => {})),
]);
if (!navigator.webdriver) {
  window.ready.then(() => { const t0 = performance.now(); const loop = () => { window.renderFrame(((performance.now() - t0) / 1000) % DUR); requestAnimationFrame(loop); }; loop(); });
}
