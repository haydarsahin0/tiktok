'use strict';
/* Video 5 sesi — stadyum dünyası: saat tıkı + kalp atışı gerilimi, gol uğultusu, tribün alkış ritmi (1-2, 1-2-3, 1-2-3-4, HEY HEY) ve koro.
 * Önceki videolardaki elektronik altyapıdan bilerek farklı. Döngü: son vuruşlar baştaki ızgaraya oturur. */
function sesKur() {
  const SR = 44100, ac = new OfflineAudioContext(2, Math.ceil(SR * DUR), SR), MUTE = window.SES_MUTE || {};
  const comp = ac.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 3; comp.attack.value = 0.004; comp.release.value = 0.18;
  const master = ac.createGain(); master.gain.value = 0.6; master.connect(comp).connect(ac.destination);
  const rev = ac.createConvolver(), ir = ac.createBuffer(2, Math.floor(SR * 2.2), SR);
  { const R = rng(11); for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < d.length; i++) d[i] = (R() * 2 - 1) * Math.pow(1 - i / d.length, 2.6); } }
  rev.buffer = ir; const revG = ac.createGain(); revG.gain.value = 0.2; rev.connect(revG).connect(master);
  const bus = (name, send) => { const g = ac.createGain(), o = ac.createGain(); o.gain.value = MUTE[name] ? 0 : 1; g.connect(o).connect(master); const s = ac.createGain(); s.gain.value = send; o.connect(s).connect(rev); return g; };
  const music = bus('music', 0.5), sfx = bus('sfx', 0.7), crowd = bus('crowd', 0.45);
  sfx.gain.value = 0.8;
  const nb = ac.createBuffer(1, SR * 4, SR); { const d = nb.getChannelData(0), R = rng(12); let l = 0; for (let i = 0; i < d.length; i++) { l = 0.96 * l + 0.04 * (R() * 2 - 1); d[i] = l * 5 + (R() * 2 - 1) * 0.15; } }
  const T0 = (t) => Math.max(0, t);
  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
  const vca = (dest, pan = 0) => { const g = ac.createGain(); if (pan) { const p = ac.createStereoPanner(); p.pan.value = pan; g.connect(p).connect(dest); } else g.connect(dest); return g; };
  const env = (g, t, pk, a, d) => { t = T0(t); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(pk, 0.0002), t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); };
  const hold = (g, t, pk, a, len, r = 0.08) => { t = T0(t); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(pk, t + a); g.gain.setValueAtTime(pk, Math.max(t + a, t + len - r)); g.gain.linearRampToValueAtTime(0.0001, t + len); };
  const osc = (type, f, t, stop, dest) => { t = T0(t); const o = ac.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t); o.connect(dest); o.start(t); o.stop(Math.max(stop, t + 0.01)); return o; };
  const R0 = rng(13);
  const noise = (t, dur, dest) => { const s = ac.createBufferSource(); s.buffer = nb; s.connect(dest); s.start(T0(t), R0() * 1.4, Math.min(dur, 2.5)); };
  const noiseL = (t, dur, dest) => { const s = ac.createBufferSource(); s.buffer = nb; s.loop = true; s.connect(dest); s.start(T0(t), R0() * 3); s.stop(T0(t) + dur); };
  const filt = (type, f, q = 0.7) => { const b = ac.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q; return b; };
  const lfo = (hz, depth, param, t, dur) => { const o = ac.createOscillator(); o.frequency.value = hz; const g = ac.createGain(); g.gain.value = depth; o.connect(g).connect(param); o.start(T0(t)); o.stop(T0(t) + dur); };

  // ---- gerilim sesleri ----
  const tick = (t, v = 1, hi = true) => { const g = vca(music); env(g, t, 0.15 * v, 0.001, 0.05); osc('sine', hi ? 1480 : 990, t, t + 0.08, g); const g2 = vca(music), f = filt('bandpass', hi ? 3200 : 2200, 4); f.connect(g2); env(g2, t, 0.5 * v, 0.001, 0.02); noise(t, 0.03, f); };
  const heart = (t, v = 1) => [[0, 1, 64], [0.19, 0.7, 54]].forEach(([d, a, f0]) => { const g = vca(music); env(g, t + d, 0.6 * v * a, 0.006, 0.2); const o = osc('sine', f0, t + d, t + d + 0.3, g); o.frequency.exponentialRampToValueAtTime(34, T0(t + d) + 0.16);
    const g2 = vca(music), f = filt('lowpass', 300); f.connect(g2); env(g2, t + d, 0.5 * v * a, 0.004, 0.09); noise(t + d, 0.12, f); osc('triangle', f0 * 3, t + d, t + d + 0.12, f); });
  // ---- tribün ----
  const stomp = (t, v = 1) => { const g = vca(music); env(g, t, 0.7 * v, 0.004, 0.26); const o = osc('sine', 150, t, t + 0.35, g); o.frequency.exponentialRampToValueAtTime(58, T0(t) + 0.12); const g2 = vca(music), f = filt('lowpass', 520, 0.8); f.connect(g2); env(g2, t, 1.1 * v, 0.003, 0.11); noise(t, 0.14, f); };
  const clapS = (t, v = 1) => [0, 0.011, 0.021, 0.034].forEach((d, i) => { const g = vca(music, [-0.5, 0.4, -0.15, 0.6][i]), f = filt('bandpass', [1250, 1700, 1050, 2100][i], 1.1); f.connect(g); env(g, t + d, 0.55 * v * (i ? 0.7 : 1), 0.002, 0.09 + i * 0.012); noise(t + d, 0.14, f); });
  const formants = (dest, set) => { const src = ac.createGain(); set.forEach(([fq, q, a]) => { const f = filt('bandpass', fq, q), ga = ac.createGain(); ga.gain.value = a; src.connect(f).connect(ga).connect(dest); }); return src; };
  const hey = (t, v = 1, len = 0.2) => { const g = vca(crowd); hold(g, t, 0.9 * v, 0.03, len, len * 0.4); const src = formants(g, [[720, 5, 1], [1150, 6, 0.7], [2500, 7, 0.3]]); noise(t, len + 0.02, src); const sg = ac.createGain(); sg.gain.value = 0.1; sg.connect(src); [196, 247, 294, 185].forEach((hz, i) => osc('sawtooth', hz * (1 + i * 0.004), t, t + len + 0.02, sg)); };
  const choir = (notes, t, len, v = 1) => { const g = vca(music); hold(g, t, 0.5 * v, 0.25, len + 0.1, 0.3); const src = formants(g, [[650, 4, 1], [1080, 5, 0.6], [2400, 6, 0.25]]); const sg = ac.createGain(); sg.gain.value = 0.07; sg.connect(src); notes.forEach((m) => [-7, 0, 6].forEach((c) => osc('sawtooth', mtof(m) * Math.pow(2, c / 1200), t, t + len + 0.15, sg))); };
  const brass = (m, t, len, v = 1) => { t = T0(t); const g = vca(music), f = filt('lowpass', 900, 1.2); f.connect(g); f.frequency.setValueAtTime(500, t); f.frequency.linearRampToValueAtTime(2200, t + 0.08); f.frequency.linearRampToValueAtTime(1200, t + len); hold(g, t, 0.06 * v, 0.04, len, len * 0.3); osc('sawtooth', mtof(m), t, t + len + 0.02, f); osc('sawtooth', mtof(m) * 1.006, t, t + len + 0.02, f); osc('sawtooth', mtof(m - 12), t, t + len + 0.02, f); };
  const sub = (m, t, len, v = 1) => { const g = vca(music); env(g, t, 0.4 * v, 0.01, len); osc('sine', mtof(m), t, t + len + 0.05, g); const g2 = vca(music), f = filt('lowpass', 500); f.connect(g2); env(g2, t, 0.14 * v, 0.01, len * 0.8); osc('sawtooth', mtof(m + 12), t, t + len + 0.05, f); };
  const roar = (t, dur, v = 1, dark = false) => { t = T0(t); const g = vca(crowd); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.6 * v, t + 0.12); g.gain.linearRampToValueAtTime(0.38 * v, t + dur * 0.45); g.gain.linearRampToValueAtTime(0.0001, t + dur);
    [[dark ? 480 : 700, 0.7, 1], [dark ? 900 : 1500, 0.9, 0.55], [dark ? 1800 : 2900, 1.2, 0.2]].forEach(([fq, q, a], i) => { const f = filt('bandpass', fq, q); f.frequency.setValueAtTime(fq * 0.8, t); f.frequency.linearRampToValueAtTime(fq * 1.15, t + dur * 0.3); f.frequency.linearRampToValueAtTime(fq * 0.9, t + dur);
      const ga = ac.createGain(); ga.gain.value = a; lfo(3.1 + i * 1.7, a * 0.25, ga.gain, t, dur + 0.1); f.connect(ga).connect(g); noiseL(t, dur + 0.05, f); }); };
  return { SR, ac, music, sfx, crowd, T0, mtof, vca, env, hold, osc, noise, noiseL, filt, lfo, tick, heart, stomp, clapS, hey, choir, brass, sub, roar };
}

function sesMuzik(A) {
  const { ac, music, crowd, T0, vca, osc, noiseL, filt, lfo, tick, heart, stomp, clapS, hey, choir, brass, sub } = A;
  // --- A bölümü: saat + kalp (0 → gol). Izgara gole tam oturur; sondaki vuruşlar aynı ızgaranın devamı (döngü) ---
  const TA = T6 / 34;
  for (let k = 0; k < 34; k++) {
    const t = k * TA; if (t > C.bes) break;
    const urg = prog(t, T5, C.bes), lvl = t >= T2 && t < T5 ? 0.6 : 1;
    tick(t, lvl * (0.8 + 0.5 * urg), k % 2 === 0);
    if (k % 2 === 0 || t >= C.durma) heart(t, 0.9 + 0.4 * urg);
    if (t >= T5) tick(t + TA / 2, 0.6 + 0.4 * urg, false);
    if (t >= C.durma) { tick(t + TA / 4, 0.5, true); tick(t + (3 * TA) / 4, 0.5, true); }
  }
  for (let k = 1; k <= 4; k++) { const t = DUR - k * TA, v = lerp(1, 0.45, (k - 1) / 3); tick(t, 0.8 * v, k % 2 === 0); if (k % 2 === 0) heart(t, 0.9 * v); }
  // dron: frekanslar döngüye tam sayıda sığar → sınırda faz kopmaz
  const q = (f) => Math.round(f * DUR) / DUR, dg = vca(music), df = filt('lowpass', 420); df.connect(dg);
  [73.42, 110, 146.83].forEach((f) => { osc('sawtooth', q(f), 0, DUR, df); osc('sawtooth', q(f * 1.004), 0, DUR, df); });
  const dm = ac.createGain(); dm.gain.value = 0.25; dm.connect(dg); osc('sine', q(293.66), 0, DUR, dm); osc('sine', q(440), 0, DUR, dm);
  const V0 = 0.05; dg.gain.setValueAtTime(V0, 0); dg.gain.linearRampToValueAtTime(0.1, C.bes); dg.gain.linearRampToValueAtTime(0.0001, T6 + 0.05); dg.gain.setValueAtTime(0.0001, T12); dg.gain.linearRampToValueAtTime(V0, DUR);
  // tribün uğultusu (sürekli yatak)
  const mg = vca(crowd), mf = filt('bandpass', 650, 0.5); mf.connect(mg); noiseL(0, DUR, mf); lfo(0.7, 0.008, mg.gain, 0, DUR);
  const M0 = 0.035; mg.gain.setValueAtTime(M0, 0); mg.gain.setValueAtTime(M0, T5); mg.gain.linearRampToValueAtTime(0.11, C.bes); mg.gain.setValueAtTime(0.11, T6); mg.gain.linearRampToValueAtTime(0.07, T7); mg.gain.setValueAtTime(0.07, T12); mg.gain.linearRampToValueAtTime(M0, DUR);
  // "Ama sevinme": tribün bıçak gibi kesilir
  crowd.gain.setValueAtTime(1, C.ama - 0.04); crowd.gain.linearRampToValueAtTime(0.05, C.ama + 0.22); crowd.gain.setValueAtTime(0.05, T7 - 0.2); crowd.gain.linearRampToValueAtTime(1, T7);
  heart(C.sevinme + 0.02, 1.1);
  // --- B bölümü: tribün alkışı + koro (4 tur, T7 → T12) ---
  const S = (T12 - T7) / 64, CL = [0, 2, 4, 5, 6, 8, 9, 10, 11];
  const CHD = [[50, 57, 62, 65], [46, 53, 58, 62], [53, 57, 60, 65], [48, 55, 60, 64]], ROOT = [38, 34, 41, 36];
  const MEL = [[[0, 62, 3], [4, 65, 3], [8, 69, 5]], [[0, 70, 3], [4, 69, 3], [8, 65, 5]], [[0, 65, 3], [4, 69, 3], [8, 72, 5]], [[0, 67, 3], [4, 72, 3], [8, 76, 4]]];
  for (let c = 0; c < 4; c++) {
    const t0 = T7 + c * 16 * S;
    choir(CHD[c], t0, 16 * S, c === 3 ? 1.15 : 0.9);
    for (let s = 0; s < 16; s++) {
      const t = t0 + s * S, brk = t >= T10 - 0.06 && t < C.taraftar - 0.06;
      if (s % 4 === 0) { stomp(t, brk ? 0.8 : 1); sub(ROOT[c], t, 3 * S, brk ? 0.7 : 1); }
      if (brk) continue;
      if (CL.includes(s)) clapS(t, s % 4 === 0 ? 1 : 0.8);
      if (s === 13 || s === 14) { hey(t, 0.8, S * 0.8); clapS(t, 1); stomp(t, 0.7); }
    }
    MEL[c].forEach(([s, m, l]) => { const t = t0 + s * S; if (!(t >= T10 - 0.06 && t < C.taraftar - 0.06)) brass(m, t, l * S, 1); });
  }
  stomp(T12, 1.1); hey(T12, 0.9, 0.3); clapS(T12, 1);
  // konuşurken altyapı kısılır; son kelimeden sonra açılmaz (döngü başı da kısık başlar)
  const FULL = 0.8, DUCK = 0.5, spans = [];
  for (const w of VO.words) { const a = w.s - 0.08, b = w.e + 0.12; if (spans.length && a - spans[spans.length - 1][1] < 0.4) spans[spans.length - 1][1] = b; else spans.push([a, b]); }
  music.gain.setValueAtTime(DUCK, 0);
  spans.forEach(([a, b], i) => { if (a > 0.2) { music.gain.setValueAtTime(FULL, a - 0.06); music.gain.linearRampToValueAtTime(DUCK, a + 0.04); } if (i < spans.length - 1) { music.gain.setValueAtTime(DUCK, b); music.gain.linearRampToValueAtTime(FULL, b + 0.18); } });
}

function wavB64(buf, SR) {
  const n = buf.length, ch = 2, out = new DataView(new ArrayBuffer(44 + n * ch * 2));
  const ws = (o, s) => { for (let i = 0; i < s.length; i++) out.setUint8(o + i, s.charCodeAt(i)); };
  ws(0, 'RIFF'); out.setUint32(4, 36 + n * ch * 2, true); ws(8, 'WAVE'); ws(12, 'fmt '); out.setUint32(16, 16, true); out.setUint16(20, 1, true); out.setUint16(22, ch, true);
  out.setUint32(24, SR, true); out.setUint32(28, SR * ch * 2, true); out.setUint16(32, ch * 2, true); out.setUint16(34, 16, true); ws(36, 'data'); out.setUint32(40, n * ch * 2, true);
  const L = buf.getChannelData(0), Rr = buf.getChannelData(1);
  let o = 44; for (let i = 0; i < n; i++) { out.setInt16(o, clamp(L[i], -1, 1) * 32767, true); out.setInt16(o + 2, clamp(Rr[i], -1, 1) * 32767, true); o += 4; }
  const bytes = new Uint8Array(out.buffer); let bin = ''; const CHK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHK) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + CHK));
  return btoa(bin);
}
window.renderAudio = async () => { const A = sesKur(); sesMuzik(A); sesFx(A); return wavB64(await A.ac.startRendering(), A.SR); };
