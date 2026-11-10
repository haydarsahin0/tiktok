'use strict';
/* 12. Hafta (6. video) — ses (1/2): motor + çalgılar + müzik yatağı.
 * Kimlik: sokak bandosu / batucada — surdo (3 boy), caixa (hayalet notalar, tremolo), tamborim, iki sesli agogô,
 * ganzá, apito (samba düdüğü), surdoyu izleyen sub bas, yalnızca en büyük vuruşlarda kısa nefesli "stab", "hey!".
 * Izgara: DUR = tam 21 ölçü (4/4, ~105.8 BPM). Takım adı vuruşları ızgarada değil, kelimenin üstünde.
 * Döngü: bitişten taşan kuyruk (yankı/çınlama) başa katlanır → DUR→0 geçişi kesintisiz.
 * Yalnızca zaman.js küresellerine dayanır; tüm yardımcılar window.SES12 içinde (ad çakışması yok). */
window.SES12 = (() => {
  const BARS = 21, BAR = DUR / BARS, BEAT = BAR / 4, S16 = BEAT / 4, BPM = 60 / BEAT;
  const MICRO = [0, 0.27, 0.51, 0.76]; // samba "ginga": 16'lıkların hafif kayması (vuruş oranı)
  const stepT = (k) => Math.floor(k / 4) * BEAT + MICRO[k % 4] * BEAT;
  const rng = (seed) => { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  const lerp = (a, b, p) => a + (b - a) * p;
  const prog = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
  // geç söylenen/erken işaretlenen adlar (Göztepe, Gaziantep, Fenerbahçe, Beşiktaş): vuruş işaretten 0.06 sn sonra
  const EARLY = { goztepe: 1, gfk: 1, fb: 1, bjk: 1 };
  const HITS = [];
  MATCHES.forEach((m) => { HITS.push({ t: m.tHome + (EARLY[m.home] ? 0.06 : 0), pan: -1, i: m.i, big: m.big, home: true }); HITS.push({ t: m.tAway + (EARLY[m.away] ? 0.06 : 0), pan: 1, i: m.i, big: m.big, home: false }); });
  // diğer büyük vuruşlar (ızgara bunların çevresinde susar)
  const BIGS = [T.stamp, T.hookSlam, T.coinDrop, T.tablo];
  const nearHit = (t, w) => HITS.some((h) => Math.abs(t - h.t) < w) || BIGS.some((b) => Math.abs(t - b) < w);

  function kur() {
    const SR = 44100, N = Math.round(DUR * SR), TAILS = 2.6, PRE = 264; // PRE: kompresörün 6 ms ön-gecikmesi telafisi
    const ac = new OfflineAudioContext(2, N + PRE + Math.round(TAILS * SR), SR), MUTE = window.SES_MUTE || {};
    const comp = ac.createDynamicsCompressor(); comp.threshold.value = -12; comp.knee.value = 8; comp.ratio.value = 2.6; comp.attack.value = 0.003; comp.release.value = 0.16;
    const master = ac.createGain(); master.gain.value = 0.5; master.connect(comp).connect(ac.destination);
    // sokak yankısı: kısa, erken yansımalı (duvarlar arası çınlama) — 1.1 sn
    const rev = ac.createConvolver(), ir = ac.createBuffer(2, Math.floor(SR * 1.1), SR);
    { const R = rng(1201); for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < d.length; i++) { const x = i / d.length; d[i] = (R() * 2 - 1) * Math.pow(1 - x, 3.2) * (x < 0.02 ? x / 0.02 : 1); }
      [0.011, 0.019, 0.027, 0.041, 0.058].forEach((e, j) => { const k = Math.floor((e + c * 0.003) * SR); d[k] += [0.5, -0.4, 0.35, -0.25, 0.2][j]; }); } }
    rev.buffer = ir; const revLP = ac.createBiquadFilter(); revLP.type = 'lowpass'; revLP.frequency.value = 5200; const revG = ac.createGain(); revG.gain.value = 0.22; rev.connect(revLP).connect(revG).connect(master);
    const bus = (name, send) => { const g = ac.createGain(), o = ac.createGain(); o.gain.value = MUTE[name] ? 0 : 1; g.connect(o).connect(master); const s = ac.createGain(); s.gain.value = send; o.connect(s).connect(rev); return g; };
    // ducking: konuşma varken yatak tabanda, nefes aralarında biraz açılır (son aralık açılmaz → döngü başı = sonu)
    const music0 = bus('music', 0.35), sfx = bus('sfx', 0.3), other0 = bus('other', 0.4);
    const duck = ac.createGain(); duck.connect(music0); const duckO = ac.createGain(); duckO.connect(other0);
    const music = duck, other = duckO;
    {
      const spans = []; for (const w of VO.words) { const a = w.s - 0.05, b = w.e + 0.04; if (spans.length && a - spans[spans.length - 1][1] < 0.12) spans[spans.length - 1][1] = b; else spans.push([a, b]); }
      const UP = 1.35;
      [duck, duckO].forEach((g) => { g.gain.setValueAtTime(1, 0); for (let i = 0; i < spans.length - 1; i++) { const b = spans[i][1], a = spans[i + 1][0]; if (a - b < 0.14 || b < 0.5) continue; g.gain.setValueAtTime(1, b); g.gain.linearRampToValueAtTime(UP, b + 0.05); g.gain.setValueAtTime(UP, a - 0.05); g.gain.linearRampToValueAtTime(1, a); } });
    }
    const wn = ac.createBuffer(1, SR * 3, SR); { const d = wn.getChannelData(0), R = rng(1202); for (let i = 0; i < d.length; i++) d[i] = R() * 2 - 1; }
    const R0 = rng(1203);
    const T0 = (t) => Math.max(0, t);
    const out = (dest, pan = 0) => { const g = ac.createGain(); g.gain.value = 0; if (pan) { const p = ac.createStereoPanner(); p.pan.value = clamp(pan, -1, 1); g.connect(p).connect(dest); } else g.connect(dest); return g; };
    // vurmalı zarf: atak a, sonra üstel sönüm (tau ~ d/6.9)
    const perc = (g, t, pk, a, d) => { t = T0(t); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(pk, t + a); g.gain.setTargetAtTime(0, t + a, d / 6.9); };
    const hold = (g, t, pk, a, len, r = 0.05) => { t = T0(t); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(pk, t + a); g.gain.setValueAtTime(pk, Math.max(t + a, t + len - r)); g.gain.linearRampToValueAtTime(0, t + len); };
    const osc = (type, f, t, len, dest) => { t = T0(t); const o = ac.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t); o.connect(dest); o.start(t); o.stop(t + Math.max(0.02, len)); return o; };
    const noise = (t, len, dest, rate = 1) => { t = T0(t); const s = ac.createBufferSource(); s.buffer = wn; s.loop = true; s.playbackRate.value = rate; s.connect(dest); s.start(t, R0() * 2.5); s.stop(t + Math.max(0.02, len)); return s; };
    const filt = (type, f, q = 0.707, dest) => { const b = ac.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q; if (dest) b.connect(dest); return b; };
    const lfo = (hz, depth, param, t, len, type = 'sine') => { const o = ac.createOscillator(); o.type = type; o.frequency.value = hz; const g = ac.createGain(); g.gain.value = depth; o.connect(g).connect(param); o.start(T0(t)); o.stop(T0(t) + len); };

    // ---------------- çalgılar ----------------
    // surdo: akortlu derin tok vuruş; open=false → abafado (elle susturulmuş)
    const surdo = (t, f, v = 1, pan = 0, open = true, dest = music) => {
      const dec = open ? 0.62 : 0.14;
      const g = out(dest, pan); perc(g, t, 0.95 * v, 0.003, dec); const o = osc('sine', f * 1.55, t, dec + 0.05, g); o.frequency.exponentialRampToValueAtTime(f, T0(t) + 0.045);
      const g2 = out(dest, pan); perc(g2, t, 0.28 * v, 0.003, dec * 0.45); const o2 = osc('sine', f * 2.02 * 1.3, t, dec * 0.5, g2); o2.frequency.exponentialRampToValueAtTime(f * 2.02, T0(t) + 0.04);
      const g3 = out(dest, pan), lp = filt('lowpass', 700, 0.9, g3); perc(g3, t, 0.55 * v, 0.002, 0.05); noise(t, 0.08, lp);
      const g4 = out(dest, pan), bp = filt('bandpass', 1900, 1.2, g4); perc(g4, t, 0.12 * v, 0.001, 0.014); noise(t, 0.03, bp);
    };
    // caixa: tel hışırtısı + gövde + çıt
    const caixa = (t, v = 1, pan = 0, dest = music) => {
      const g = out(dest, pan), hp = filt('highpass', 2600, 0.7, g); perc(g, t, 0.42 * v, 0.0015, 0.07 + 0.07 * v); noise(t, 0.2, hp);
      const g2 = out(dest, pan), bp = filt('bandpass', 1500, 0.9, g2); perc(g2, t, 0.32 * v, 0.001, 0.035); noise(t, 0.06, bp);
      const g3 = out(dest, pan); perc(g3, t, 0.22 * v, 0.001, 0.045); const o = osc('triangle', 330, t, 0.07, g3); o.frequency.exponentialRampToValueAtTime(205, T0(t) + 0.04);
    };
    // tamborim: sert, kuru, tiz "tak"
    const tamborim = (t, v = 1, pan = 0, dest = music) => {
      const g = out(dest, pan); perc(g, t, 0.2 * v, 0.001, 0.06); const o = osc('sine', 960, t, 0.08, g); o.frequency.exponentialRampToValueAtTime(780, T0(t) + 0.03);
      const g2 = out(dest, pan), bp = filt('bandpass', 3400, 1.6, g2); perc(g2, t, 0.4 * v, 0.0008, 0.018); noise(t, 0.03, bp);
    };
    // agogô: iki ağızlı çan (inarmonik kısmi sesler)
    const agogo = (t, hi, v = 1, pan = 0, dest = music) => {
      const f = hi ? 1046.5 : 784; // C6 / G5
      [[1, 0.16, 0.32], [2.71, 0.05, 0.12], [5.1, 0.02, 0.05]].forEach(([r, a, d]) => { const g = out(dest, pan); perc(g, t, a * v, 0.001, d); osc('sine', f * r, t, d + 0.03, g); });
      const g2 = out(dest, pan), bp = filt('bandpass', 4200, 2, g2); perc(g2, t, 0.12 * v, 0.0005, 0.008); noise(t, 0.015, bp);
    };
    // ganzá (shaker)
    const ganza = (t, v = 1, pan = 0, dest = music) => {
      const g = out(dest, pan), hp = filt('highpass', 6000, 0.7, g), bp = filt('peaking', 9000, 1, hp); bp.gain.value = 4;
      t = T0(t); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.16 * v, t + 0.014); g.gain.setTargetAtTime(0, t + 0.014, 0.012); noise(t, 0.09, bp);
    };
    // sub bas: surdoyu izleyen kısa nota
    const sub = (t, f, len, v = 1, dest = music) => { const g = out(dest); perc(g, t, 0.5 * v, 0.008, len); osc('sine', f, t, len + 0.05, g); const g2 = out(dest), lp = filt('lowpass', 380, 0.7, g2); perc(g2, t, 0.1 * v, 0.008, len * 0.6); osc('triangle', f * 2, t, len, lp); };
    // nefesli stab (A7): yalnızca büyük vuruşlarda
    const brass = (t, v = 1, len = 0.2, pan = 0, dest = music) => {
      t = T0(t); const g = out(dest, pan), lp = filt('lowpass', 900, 1.4, g); lp.frequency.setValueAtTime(700, t); lp.frequency.linearRampToValueAtTime(3400, t + 0.03); lp.frequency.exponentialRampToValueAtTime(1100, t + len);
      hold(g, t, 0.05 * v, 0.012, len, len * 0.5);
      [57, 61, 64, 67, 69].forEach((m, i) => { [-8, 7].forEach((c) => { const o = osc('sawtooth', mtof(m) * Math.pow(2, c / 1200), t, len + 0.03, lp); o.frequency.setValueAtTime(mtof(m) * Math.pow(2, c / 1200), t + len * 0.6); o.frequency.linearRampToValueAtTime(mtof(m - 0.6) * Math.pow(2, c / 1200), t + len); }); });
    };
    // apito (samba düdüğü): iki odacık + titrek + nefes
    const apito = (t, len, v = 1, pan = 0.25, trill = 34, dest = other) => {
      t = T0(t); const g = out(dest, pan); hold(g, t, 0.05 * v, 0.008, len, 0.025);
      const am = ac.createGain(); am.gain.value = 0.55; am.connect(g); lfo(trill, 0.45, am.gain, t, len + 0.02);
      const o1 = osc('sine', 2950, t, len + 0.02, am); o1.frequency.setValueAtTime(2750, t); o1.frequency.linearRampToValueAtTime(2950, t + 0.03);
      const o2 = osc('sine', 3460, t, len + 0.02, am); o2.frequency.setValueAtTime(3300, t); o2.frequency.linearRampToValueAtTime(3460, t + 0.03);
      const gn = out(dest, pan), bp = filt('bandpass', 3100, 4, gn); hold(gn, t, 0.08 * v, 0.008, len, 0.025); noise(t, len + 0.02, bp);
    };
    // kalabalık "hey!": 8 ses, "e" formantları, hızlı düşüş
    const hey = (t, v = 1, len = 0.24, dest = other) => {
      const R = rng(Math.floor(t * 1000));
      for (let k = 0; k < 8; k++) {
        const tt = T0(t + R() * 0.035), f0 = 150 + R() * 120, pan = (k / 7) * 1.6 - 0.8, g = out(dest, pan);
        tt; hold(g, tt, 0.12 * v, 0.02, len, len * 0.55);
        const src = ac.createGain(); [[560, 6, 1], [1750, 9, 0.6], [2600, 10, 0.25]].forEach(([fq, q, a]) => { const f = filt('bandpass', fq * (0.92 + R() * 0.16), q), ga = ac.createGain(); ga.gain.value = a; src.connect(f).connect(ga).connect(g); });
        const o = osc('sawtooth', f0, tt, len + 0.02, src); o.frequency.setValueAtTime(f0 * 1.06, tt); o.frequency.linearRampToValueAtTime(f0 * 1.12, tt + 0.06); o.frequency.exponentialRampToValueAtTime(f0 * 0.82, tt + len);
        const gn = ac.createGain(); gn.gain.value = 0.25; gn.connect(src); noise(tt, len, gn);
      }
    };
    return { SR, N, PRE, ac, music, sfx, other, duck, T0, out, perc, hold, osc, noise, filt, lfo, rng, R0, surdo, caixa, tamborim, agogo, ganza, sub, brass, apito, hey };
  }

  // ---------------- müzik yatağı ----------------
  // bölüm seviyeleri (0..1): s1/s2 = surdo primeira/segunda, s3 = terceira (senkoplu), cx = caixa, cg = caixa hayalet, tb = tamborim, ag = agogô, gz = ganzá, sb = sub
  const SECT = [
    [0, 'hook', { s1: 0.55, s2: 0.5, s3: 0, cx: 0, cg: 0.28, tb: 0.55, ag: 0, gz: 0.7, sb: 0.6 }],
    [T.kural, 'kural', { s1: 0.7, s2: 0.62, s3: 0.4, cx: 0.55, cg: 0.32, tb: 0.6, ag: 0.55, gz: 0.8, sb: 0.75 }],
    [T.m[0] - 0.05, 'mac', { s1: 0.42, s2: 0.38, s3: 0, cx: 0.32, cg: 0.25, tb: 0.42, ag: 0.4, gz: 0.6, sb: 0 }],
    [T.isin - 0.06, 'isin', {}],
    [T.m[5] - 0.02, 'buyuk', { s1: 0.72, s2: 0.66, s3: 0.42, cx: 0.62, cg: 0.32, tb: 0.65, ag: 0.6, gz: 0.85, sb: 0 }],
    [T.sen - 0.05, 'sen', { half: 1 }],
    [T.tablo - 0.02, 'tablo', { s1: 0.45, s2: 0, s3: 0, cx: 0, cg: 0, tb: 0, ag: 0, gz: 0.5, sb: 0.55, tick: 0.75 }],
    [T.canli - 0.05, 'canli', { build: 1 }],
    [T.cta - 0.05, 'cta', { s1: 0.7, s2: 0.64, s3: 0.4, cx: 0.55, cg: 0.32, tb: 0.6, ag: 0.55, gz: 0.8, sb: 0.7 }],
    [T.settle - 0.02, 'son', { fill: 1 }],
  ];
  const secAt = (t) => { let s = SECT[0]; for (const x of SECT) if (t >= x[0]) s = x; return s; };
  const TB = [1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0];       // tamborim: partido-alto benzeri
  const AG = { 0: 0, 3: 1, 6: 1, 8: 0, 10: 1, 12: 0, 14: 1 };       // agogô: 0 = pes (G5), 1 = tiz (C6)
  const CXV = [0.7, 0.28, 0.45, 0.9];                                // caixa vurgusu (16'lık konumu)
  const S3 = [2, 3, 6, 10, 11, 14];                                  // terceira

  function muzik(A) {
    const { ac, music, other, T0, out, perc, filt, noise, osc, lfo, rng, surdo, caixa, tamborim, agogo, ganza, sub, brass } = A;
    const R = rng(1210), F1 = 55, F2 = 73.42, F3 = 98; // surdolar: A1 / D2 / G2
    const hum = () => 0.88 + R() * 0.24, jit = () => (R() - 0.5) * 0.006;
    for (let k = 0; k < BARS * 16; k++) {
      const t = stepT(k), p = k % 16, bar = Math.floor(k / 16), [, name, L] = secAt(t);
      if (name === 'isin') continue;
      if (L.fill) continue; // son ölçü: aşağıdaki dolgu
      let lv = L;
      if (L.half) { // yarım tempo, gergin: surdo 1'de, rim 3'te, seyrek tamborim, sessizce kıpırdayan caixa
        const late = t >= T.coinFly ? 0.75 : 1;
        if (p === 0) { surdo(t, F1, 0.75 * late, 0, true); sub(t, F1, 0.9, 0.7 * late); }
        if (p === 8) { tamborim(t + jit(), 0.7 * late, 0.15); caixa(t, 0.45 * late, 0.1); }
        if (p === 14) surdo(t, F3, 0.3 * late, 0.3, false);
        if (p % 2 === 1) caixa(t + jit(), 0.12 * late * hum(), -0.15);
        if (p % 4 === 2) ganza(t + jit(), 0.45 * late, 0.3);
        continue;
      }
      if (L.build) { // canlı: adım adım dolar
        const b1 = t >= T.canliFlip - 0.05, b2 = t >= T.push - 0.05, b3 = t >= T.goal - 0.05;
        lv = { s1: 0.5 + (b2 ? 0.15 : 0), s2: b1 ? 0.5 : 0, s3: b3 ? 0.35 : 0, cx: b1 ? 0.35 + (b2 ? 0.15 : 0) : 0, cg: 0.25, tb: b2 ? 0.55 : 0, ag: b1 ? 0.5 : 0, gz: 0.7, sb: 0.6, tick: b1 ? 0 : 0.5 };
        // cta'ya giden son vuruşta caixa tremolo
        if (t >= T.cta - BEAT - 0.02) { for (let j = 0; j < 2; j++) caixa(t + j * S16 / 2, 0.25 + 0.45 * prog(t, T.cta - BEAT, T.cta), 0); continue; }
      }
      const nh = nearHit(t, 0.2), nh2 = nearHit(t, 0.11);
      if ((p === 4 || p === 12) && lv.s1) { if (!nh) { surdo(t + jit(), F1, lv.s1 * hum(), -0.1, true); if (lv.sb) sub(t, F1, 0.45, lv.sb); } }
      if ((p === 0 || p === 8) && lv.s2) { if (!nh) { surdo(t + jit(), F2, lv.s2 * hum(), 0.12, p === 8 ? true : bar % 2 === 1); if (lv.sb) sub(t, F2, 0.3, lv.sb * 0.8); } }
      if ((p === 15) && lv.s2 && !nh) surdo(t, F2, 0.3 * lv.s2, 0.12, false); // abafado öncü
      if (lv.s3 && S3.includes(p) && !nh) surdo(t + jit(), F3, lv.s3 * (p % 4 === 2 ? 1 : 0.7) * hum(), 0.35, p !== 3 && p !== 11);
      if (lv.cx && !nh2) caixa(t + jit(), lv.cx * CXV[p % 4] * hum(), -0.18);
      else if (lv.cg && (p % 4 === 3 || p % 4 === 1) && !nh2) caixa(t + jit(), lv.cg * (p % 4 === 3 ? 0.9 : 0.55) * hum(), -0.18);
      if (lv.tb && TB[p] && !nh2) tamborim(t + jit(), lv.tb * hum(), 0.38);
      if (lv.ag && AG[p] !== undefined && !nh2) agogo(t + jit(), AG[p], lv.ag * hum(), -0.4);
      if (lv.tick && !nh2) agogo(t, p % 3 === 0 ? 1 : 0, lv.tick * (p % 4 === 0 ? 1 : 0.55) * hum(), p % 2 ? 0.35 : -0.35); // tablo: tik-tak agogô
      if (lv.gz) ganza(t + jit(), lv.gz * [0.7, 0.4, 0.6, 1][p % 4] * hum(), 0.22);
    }
    // --- isin: neredeyse sessizlik — çok hafif alçak uğultu + yalnızca son ~0.4 sn kabaran yumuşak caixa tremolosu ---
    {
      const a = T.isin - 0.05, b = T.m[5], g = out(other), lp = filt('lowpass', 110, 0.8, g);
      g.gain.setValueAtTime(0, a); g.gain.linearRampToValueAtTime(0.05, a + 0.35); g.gain.setValueAtTime(0.05, b - 0.5); g.gain.linearRampToValueAtTime(0.09, b - 0.02); g.gain.linearRampToValueAtTime(0, b + 0.25);
      noise(a, b - a + 0.3, lp); const go = out(other); go.gain.setValueAtTime(0, a); go.gain.linearRampToValueAtTime(0.05, a + 0.4); go.gain.setValueAtTime(0.05, b - 0.4); go.gain.linearRampToValueAtTime(0, b + 0.2); osc('sine', 41.2, a, b - a + 0.25, go);
      for (let x = a + 0.4, j = 0; x < b - 0.03; x += S16 / 2, j++) { const p = prog(x, b - 0.42, b); caixa(x, 0.035 + 0.3 * p * p, (j % 2 ? 0.1 : -0.1)); }
    }
    // --- son ölçü: "çünkü" altında öncü dolgu → t=0'daki surdoya çözülür (t=0 ızgaranın ilk vuruşu) ---
    {
      const b0 = (BARS - 1) * BAR, st = (j) => b0 + stepT(j);
      for (let j = 0; j < 16; j++) { const t = st(j); if (t < T.settle - 0.03) continue; ganza(t, 0.6 * [0.7, 0.4, 0.6, 1][j % 4], 0.22); }
      [[8, F2, 0.45, true], [11, F3, 0.35, false], [12, F1, 0.5, true], [14, F3, 0.4, false], [15, F3, 0.5, true]].forEach(([j, f, v, o]) => { if (st(j) >= T.settle - 0.03) surdo(st(j), f, v, 0.3, o); });
      for (let j = 8; j < 16; j++) { const t = st(j); if (t < T.settle - 0.03) continue; const p = prog(t, st(8), st(15)); caixa(t, 0.25 + 0.3 * p, -0.15); if (j >= 12) caixa(t + S16 / 2, 0.2 + 0.3 * p, -0.15); }
      tamborim(st(13), 0.5, 0.38); tamborim(st(15), 0.6, 0.38);
    }
    // --- büyük vuruşların müzik katmanı ---
    surdo(T.stamp, F1, 1.0, -0.05); sub(T.stamp, F1, 0.6, 0.6);
    surdo(T.hookSlam, F1, 1.1, 0); sub(T.hookSlam, F1, 0.7, 0.7); brass(T.hookSlam + 0.005, 0.85, 0.22);
    surdo(T.coinDrop, F1, 1.1, -0.3); sub(T.coinDrop, F1, 0.7, 0.75); brass(T.coinDrop + 0.005, 0.85, 0.2, -0.2);
    surdo(T.tablo, F1, 1.0, 0); sub(T.tablo, F1, 0.8, 0.8);
    // takım adları: her adda büyük surdo (+ sub); büyük dörtte daha ağır + deplasmanda brass
    HITS.forEach((h) => { surdo(h.t, h.home ? F1 : F2 * 0.75, h.big ? 1.15 : 0.95, h.pan * 0.35); sub(h.t, h.home ? F1 : 41.2 * 1.335, 0.5, h.big ? 0.9 : 0.7);
      // ada yanıt: tamborim + abafado terceira, vuruştan 2-3 onaltılık sonra (ızgara yerine vuruşa göre fazlanır)
      tamborim(h.t + 2 * S16, 0.45, h.pan * 0.4); surdo(h.t + 3 * S16, F3, 0.35, h.pan * 0.4, false);
      if (h.big && !h.home) brass(h.t + 0.005, 0.8, 0.18, h.pan * 0.3); });
  }

  return { BARS, BAR, BEAT, S16, BPM, HITS, kur, muzik, rng, clamp, lerp, prog, mtof };
})();
