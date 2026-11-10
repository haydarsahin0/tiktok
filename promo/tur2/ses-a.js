'use strict';
/* 2. Tur (7. video) — ses (1/2): motor + çalgılar + müzik yatağı.
 * Kimlik: askerî/okul BANDOSU × stadyum — marş trampeti (aksanlı onaltılıklar, buzz/press rulolar), büyük davul (bas davul),
 * el zilleri (vuruşta çarpma / 2-4'te boğuk "çık"), tuba "um" + trombon/korno "pa" (um-pa), trompet fanfar cevapları
 * (yalnızca konuşma aralarında), zil-lir (glockenspiel) parıltısı, stadyum uğultusu + gol kükremesi.
 * Ton: Si♭ majör (bando tonu); golsüz maçlarda Sol minör. Izgara: DUR = tam 29 ölçü (4/4, ~117.6 BPM, düz marş — swing yok).
 * Döngü: son ölçü (T.settle'dan) trampet rulosu + tuba yürüyüşü F7 → t=0'daki Si♭ vuruşuna çözülür; bitişten taşan kuyruk başa katlanır.
 * Yalnızca zaman.js küresellerine dayanır; tüm yardımcılar window.SES7 içinde. */
window.SES7 = (() => {
  const BARS = 29, BAR = DUR / BARS, BEAT = BAR / 4, S16 = BEAT / 4, BPM = 60 / BEAT;
  const stepT = (k) => k * S16;
  const rng = (seed) => { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  const lerp = (a, b, p) => a + (b - a) * p;
  const prog = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
  // seslendirmedeki gerçek nefes araları (işlenmiş VO, <-45 dB, ≥0.24 sn; tur2-ses.mp3'ten ölçüldü — kelime işaretleri aralıksız olduğu için)
  const GAPS = [[2.76, 3.18], [6.64, 6.96], [9.06, 9.36], [11.46, 11.70], [14.00, 14.28], [16.28, 16.56], [18.90, 19.18], [28.68, 29.02], [30.24, 30.60],
    [33.04, 33.50], [35.74, 36.10], [37.26, 37.56], [40.14, 40.46], [44.64, 44.96], [46.68, 46.96], [48.34, 48.62], [50.96, 51.24], [55.42, 55.64]];
  // büyük vuruşlar (ızgara bunların çevresinde susar)
  const GOALS = [T.bjkGoal, T.gsGoal, T.fbGoal, C.amedspor, T.gfkHit];
  const BIGS = [T.turBitti, ...GOALS, T.ikinci, T.begeni, T.begeniUnlock];
  const nearHit = (t, w) => BIGS.some((b) => t > b - w * 0.5 && t < b + w);
  // akorlar: tuba (um 1 / um 3), "pa" sesleri (trombon/korno), trompet üçlüsü
  const CH = {
    Bb: { tu: [34, 41], pa: [58, 62, 65], tp: [65, 70, 74] }, Eb: { tu: [39, 34], pa: [58, 63, 67], tp: [67, 70, 75] },
    F7: { tu: [41, 36], pa: [57, 63, 65], tp: [65, 69, 72] }, Gm: { tu: [31, 38], pa: [58, 62, 67], tp: [62, 67, 70] },
    Cm: { tu: [36, 31], pa: [55, 60, 63], tp: [63, 67, 72] }, D7: { tu: [38, 33], pa: [57, 60, 66], tp: [62, 66, 69] },
    Fs: { tu: [41, 41], pa: [58, 60, 65], tp: [65, 70, 72] },
  };
  const PROG = ['Bb', 'F7', 'Eb', 'Bb', 'Eb', 'F7', 'Bb', 'Eb', 'F7', 'Bb', 'Gm', 'Cm', 'D7', 'Gm', 'D7', 'Eb', 'Bb', 'Fs', 'Bb', 'Eb', 'F7', 'Bb', 'Eb', 'F7', 'Bb', 'Gm', 'Eb', 'Bb', 'F7'];
  const chordAt = (t) => CH[PROG[clamp(Math.floor((t + 0.03) / BAR), 0, BARS - 1)]];

  function kur() {
    const SR = 44100, N = Math.round(DUR * SR), TAILS = 2.8, PRE = 264; // PRE: kompresörün 6 ms ön-gecikmesi telafisi
    const ac = new OfflineAudioContext(2, N + PRE + Math.round(TAILS * SR), SR), MUTE = window.SES_MUTE || {};
    const comp = ac.createDynamicsCompressor(); comp.threshold.value = -12; comp.knee.value = 8; comp.ratio.value = 2.8; comp.attack.value = 0.003; comp.release.value = 0.18;
    const master = ac.createGain(); master.gain.value = 0.3; master.connect(comp).connect(ac.destination);
    // stadyum yankısı: 2 sn, 25 ms ön-gecikme, yumuşak ve geniş (6. videonun kısa sokak yankısından farklı)
    const rev = ac.createConvolver(), ir = ac.createBuffer(2, Math.floor(SR * 2.0), SR);
    { const R = rng(7001), pd = Math.floor(0.025 * SR); for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = pd; i < d.length; i++) { const x = (i - pd) / (d.length - pd); d[i] = (R() * 2 - 1) * Math.pow(1 - x, 2.4) * (x < 0.05 ? x / 0.05 : 1) * 0.8; } } }
    rev.buffer = ir; const revLP = ac.createBiquadFilter(); revLP.type = 'lowpass'; revLP.frequency.value = 4200; const revHP = ac.createBiquadFilter(); revHP.type = 'highpass'; revHP.frequency.value = 180;
    const revG = ac.createGain(); revG.gain.value = 0.2; rev.connect(revHP).connect(revLP).connect(revG).connect(master);
    const bus = (name, send) => { const g = ac.createGain(), o = ac.createGain(); o.gain.value = MUTE[name] ? 0 : 1; g.connect(o).connect(master); const s = ac.createGain(); s.gain.value = send; o.connect(s).connect(rev); return g; };
    const music0 = bus('music', 0.3), sfx = bus('sfx', 0.25), other0 = bus('other', 0.45);
    // müzik: konuşma bandında hafif oyuk (2.4 kHz, -3.5 dB) → ducking → bölüm seviyesi
    const dip = ac.createBiquadFilter(); dip.type = 'peaking'; dip.frequency.value = 2400; dip.Q.value = 0.8; dip.gain.value = -3.5;
    const duck = ac.createGain(), secG = ac.createGain(); duck.connect(dip).connect(secG).connect(music0);
    { // bölüm seviyesi (yalnızca müzik): sonda başa eşit değere döner → döngüde seviye sıçramaz
      const SV = [[0, 1], [T.stats, 0.85], [T.bjk, 0.9], [T.gfkHit + 0.9, 0.72], [T.noGoal, 0.8], [T.nerede + 0.1, 0.62], [T.tablo, 0.85], [T.ikinci + 0.02, 0.95], [T.kural65, 0.95], [T.kuralSpam, 0.88], [T.begeni, 0.75], [T.cta, 1.05], [T.settle, 1]];
      const MG = 0.55; // yatağın genel seviyesi (ölçüme göre: konuşma altı yatak ≈ -28 dBFS RMS)
      secG.gain.setValueAtTime(MG * SV[0][1], 0); for (let i = 1; i < SV.length; i++) { secG.gain.setValueAtTime(MG * SV[i - 1][1], SV[i][0] - 0.04); secG.gain.linearRampToValueAtTime(MG * SV[i][1], SV[i][0] + 0.04); }
    }
    const duckO = ac.createGain(); duckO.connect(other0);
    { // ducking: konuşmada taban (1), ölçülen nefes aralarında açılır (UP); son aralık (T.settle sonrası) yok → döngü başı = sonu
      const UP = 1.3;
      [duck, duckO].forEach((g) => { g.gain.setValueAtTime(1, 0); for (const [a, b] of GAPS) { if (BIGS.some((x) => a - x > -0.05 && a - x < 0.6) || BIGS.some((x) => x - b > -0.05 && x - b < 0.3)) continue; /* büyük vuruşa bitişik aralık açılmaz */ g.gain.setValueAtTime(1, a); g.gain.linearRampToValueAtTime(UP, a + 0.06); g.gain.setValueAtTime(UP, b - 0.07); g.gain.linearRampToValueAtTime(1, b - 0.01); } });
    }
    const music = duck, other = duckO;
    const wn = ac.createBuffer(1, SR * 3, SR); { const d = wn.getChannelData(0), R = rng(7002); for (let i = 0; i < d.length; i++) d[i] = R() * 2 - 1; }
    const R0 = rng(7003);
    const T0 = (t) => Math.max(0, t);
    const out = (dest, pan = 0) => { const g = ac.createGain(); g.gain.value = 0; if (pan) { const p = ac.createStereoPanner(); p.pan.value = clamp(pan, -1, 1); g.connect(p).connect(dest); } else g.connect(dest); return g; };
    const perc = (g, t, pk, a, d) => { t = T0(t); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(pk, t + a); g.gain.setTargetAtTime(0, t + a, d / 6.9); };
    const hold = (g, t, pk, a, len, r = 0.05) => { t = T0(t); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(pk, t + a); g.gain.setValueAtTime(pk, Math.max(t + a, t + len - r)); g.gain.linearRampToValueAtTime(0, t + len); };
    const osc = (type, f, t, len, dest) => { t = T0(t); const o = ac.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t); o.connect(dest); o.start(t); o.stop(t + Math.max(0.02, len)); return o; };
    const noise = (t, len, dest, rate = 1) => { t = T0(t); const s = ac.createBufferSource(); s.buffer = wn; s.loop = true; s.playbackRate.value = rate; s.connect(dest); s.start(t, R0() * 2.5); s.stop(t + Math.max(0.02, len)); return s; };
    const filt = (type, f, q = 0.707, dest) => { const b = ac.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q; if (dest) b.connect(dest); return b; };
    const lfo = (hz, depth, param, t, len, type = 'sine') => { const o = ac.createOscillator(); o.type = type; o.frequency.value = hz; const g = ac.createGain(); g.gain.value = depth; o.connect(g).connect(param); o.start(T0(t)); o.stop(T0(t) + len); };

    // ---------------- çalgılar ----------------
    // marş trampeti: gergin, tiz deri + parlak tel; acc → kenar (rimshot) çıtı
    const snare = (t, v = 1, pan = -0.12, dest = music) => {
      const g = out(dest, pan), hp = filt('highpass', 3200, 0.7, g), pk = filt('peaking', 6500, 1.2, hp); pk.gain.value = 4; perc(g, t, 0.36 * v, 0.001, 0.06 + 0.08 * v); noise(t, 0.18, pk);
      const g2 = out(dest, pan); perc(g2, t, 0.3 * v, 0.001, 0.05); const o = osc('triangle', 420, t, 0.07, g2); o.frequency.exponentialRampToValueAtTime(300, T0(t) + 0.03);
      const g3 = out(dest, pan), bp = filt('bandpass', 1900, 1.4, g3); perc(g3, t, 0.26 * v * v, 0.0005, 0.02); noise(t, 0.03, bp);
    };
    // buzz/press rulo: yoğun 32'likler (len sn, v0→v1 kreşendo)
    const roll = (t, len, v0, v1, pan = -0.12, dest = music) => { const st = S16 / 2.5; for (let x = 0; x < len - 0.005; x += st) { const p = x / len; snare(t + x + (R0() - 0.5) * 0.003, lerp(v0, v1, p * p) * (0.85 + R0() * 0.2), pan, dest); } };
    // büyük davul (marş): derin yuvarlak gümbürtü + keçe tokmak
    const bass = (t, v = 1, pan = 0, dest = music) => {
      const g = out(dest, pan); perc(g, t, 0.62 * v, 0.004, 0.55); const o = osc('sine', 92, t, 0.6, g); o.frequency.exponentialRampToValueAtTime(52, T0(t) + 0.08);
      const g2 = out(dest, pan); perc(g2, t, 0.18 * v, 0.004, 0.3); osc('sine', 52 * 1.59, t, 0.32, g2);
      const g3 = out(dest, pan), lp = filt('lowpass', 520, 0.8, g3); perc(g3, t, 0.4 * v, 0.002, 0.05); noise(t, 0.07, lp);
    };
    // el zilleri: open = çarpma (uzun çınlama), değilse göğse bastırılmış "çık"
    const cymbal = (t, v = 1, open = true, pan = 0.25, dest = music) => {
      const d = open ? 1.6 : 0.09;
      const g = out(dest, pan), hp = filt('highpass', 5200, 0.6, g), pk = filt('peaking', 8200, 0.9, hp); pk.gain.value = 5; perc(g, t, 0.24 * v, 0.002, d); noise(t, d + 0.1, pk);
      if (open) [[3170, 0.015], [4230, 0.012], [5370, 0.01], [7110, 0.008]].forEach(([f, a]) => { const g2 = out(dest, pan); perc(g2, t, a * v, 0.002, d * 0.7); osc('square', f, t, d, filt('highpass', 3000, 0.7, g2)); });
      const g3 = out(dest, pan), bp = filt('bandpass', 2600, 1, g3); perc(g3, t, 0.12 * v, 0.001, open ? 0.06 : 0.025); noise(t, 0.08, bp);
    };
    // pirinç nefesli: 2 testere (± sent), atakta perde kayması, parlaklık velocity ile açılır; uzun notalarda gecikmeli vibrato
    // kind: 'tp' trompet, 'tb' trombon/korno, 'tu' tuba
    const horn = (t, m, len, v = 1, pan = 0, kind = 'tb', dest = music, glide = 0) => {
      t = T0(t); const f = mtof(m), K = { tp: [5.5, 2.2, 0.032], tb: [3.2, 1.6, 0.04], tu: [5, 2.5, 0.16] }[kind];
      const g = out(dest, pan), lp = filt('lowpass', f * 1.5, kind === 'tu' ? 0.6 : 1.1, g);
      const top = Math.min(kind === 'tu' ? 900 : 7000, f * K[0] * (0.6 + 0.6 * v));
      lp.frequency.setValueAtTime(f * 1.2, t); lp.frequency.linearRampToValueAtTime(top, t + 0.035); lp.frequency.setTargetAtTime(Math.min(top, f * K[1] * 1.6), t + 0.06, 0.12);
      hold(g, t, K[2] * v, kind === 'tu' ? 0.02 : 0.018, len, Math.min(0.08, len * 0.4));
      const cents = kind === 'tu' ? [0, 4] : [-7, 6];
      cents.forEach((c) => { const ff = f * Math.pow(2, c / 1200), o = osc(kind === 'tu' ? 'triangle' : 'sawtooth', ff * 0.985, t, len + 0.03, lp); o.frequency.linearRampToValueAtTime(ff, t + 0.03);
        if (glide) { o.frequency.setValueAtTime(ff, t + len * 0.35); o.frequency.exponentialRampToValueAtTime(ff * Math.pow(2, glide / 12), t + len); }
        if (len > 0.35) lfo(5.4, ff * 0.006, o.frequency, t + 0.18, len - 0.15); });
      if (kind === 'tu') { const o2 = osc('sawtooth', f, t, len + 0.03, filt('lowpass', 380, 0.7, g)); o2.frequency.setValueAtTime(f * 0.99, t); o2.frequency.linearRampToValueAtTime(f, t + 0.03); }
    };
    const chord = (t, ms, len, v, kind, pan = 0, dest = music, glide = 0) => ms.forEach((m, i) => horn(t + i * 0.004, m, len, v, pan + (i - (ms.length - 1) / 2) * 0.22, kind, dest, glide));
    // zil-lir (glockenspiel): saf tiz çan
    const glock = (t, m, v = 1, pan = 0.35, dest = music) => { const f = mtof(m); [[1, 1, 0.9], [2.76, 0.25, 0.3], [5.4, 0.1, 0.12]].forEach(([r, a, d]) => { const g = out(dest, pan); perc(g, t, 0.05 * a * v, 0.001, d); osc('sine', f * r, t, d + 0.05, g); }); };
    // hakem düdüğü: tek odacık + bilye titremesi (FM), keskin atak
    const whistle = (t, len, v = 1, pan = 0.1, dest = other) => {
      t = T0(t); const g = out(dest, pan); hold(g, t, 0.07 * v, 0.006, len, 0.03);
      const o = osc('sine', 2700, t, len + 0.02, g); o.frequency.setValueAtTime(2500, t); o.frequency.linearRampToValueAtTime(2750, t + 0.02); lfo(43, 160, o.frequency, t, len + 0.02);
      const o2 = osc('sine', 5450, t, len + 0.02, (() => { const x = ac.createGain(); x.gain.value = 0.18; x.connect(g); return x; })()); lfo(43, 320, o2.frequency, t, len + 0.02);
      const gn = out(dest, pan), bp = filt('bandpass', 2700, 3, gn); hold(gn, t, 0.06 * v, 0.006, len, 0.03); noise(t, len + 0.02, bp);
    };
    // stadyum kalabalığı: süreğen uğultu ve kükreme (bandpass gürültü katmanları + yavaş dalgalanma)
    const crowd = (t, len, v = 1, att = 0.08, dest = other) => { t = T0(t); const g = out(dest, 0); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.24 * v, t + att); g.gain.setTargetAtTime(0.1 * v, t + att + 0.1, len * 0.35); g.gain.setValueAtTime(0.1 * v, t + len * 0.75); g.gain.linearRampToValueAtTime(0, t + len);
      [[520, 0.7, 1, -0.6], [1150, 0.9, 0.6, 0.6], [2300, 1.1, 0.25, -0.1], [300, 0.8, 0.5, 0.2]].forEach(([fq, q, a, pn]) => { const pp = ac.createStereoPanner(); pp.pan.value = pn; const ga = ac.createGain(); ga.gain.value = a; const f = filt('bandpass', fq, q); f.connect(ga).connect(pp).connect(g); lfo(2.5 + a * 4, a * 0.25, ga.gain, t, len); noise(t, len, f); }); };
    return { SR, N, PRE, ac, music, sfx, other, duck, T0, out, perc, hold, osc, noise, filt, lfo, rng, R0, snare, roll, bass, cymbal, horn, chord, glock, whistle, crowd };
  }

  // ---------------- müzik yatağı ----------------
  // bölümler: sn = trampet (onaltılık aksan kalıbı), sl = trampet hafif (yalnız 8'likler/kenar), bd = büyük davul, cy = zil "çık" 2-4, tu = tuba, pa = um-pa "pa"
  const SECT = [
    [0, 'hook', { sn: 0.62, bd: 0.75, cy: 0.55, tu: 0.9, pa: 0.75 }],
    [T.stats, 'stats', { sl: 0.55, bd: 0.6, cy: 0, tu: 0.75, pa: 0.55 }],
    [T.bjk, 'gol', { sn: 0.6, bd: 0.8, cy: 0.5, tu: 0.95, pa: 0.8, gl: 0.5 }],
    [T.noGoal, 'golsuz', { sl: 0.32, bd: 0.5, cy: 0, tu: 0.7, pa: 0, legato: 1 }],
    [T.nerede + 0.1, 'nerede', { tick: 0.5, bd: 0.32, tu: 0.45, legato: 1 }],
    [T.tablo, 'tablo', { sl: 0.5, bd: 0.6, cy: 0.3, tu: 0.85, pa: 0.6, gl: 0.45 }],
    [T.ama - 0.02, 'ama', { build: 1 }],
    [T.ikinci + 0.02, 'kural', { sn: 0.62, bd: 0.8, cy: 0.55, tu: 0.95, pa: 0.8 }],
    [T.kuralAnadolu, 'kural2', { sn: 0.6, bd: 0.8, cy: 0.5, tu: 0.95, pa: 0.75, tenor: 0.6 }],
    [T.kuralSpam, 'kural3', { sn: 0.64, bd: 0.75, cy: 0.5, tu: 0.9, pa: 0.75, gl: 0.4 }],
    [T.begeni - 0.02, 'begeni', { heart: 1 }],
    [T.begeniUnlock + 0.15, 'acilis', { sl: 0.5, bd: 0.6, cy: 0.35, tu: 0.85, pa: 0.65 }],
    [T.cta - 0.02, 'cta', { sn: 0.66, bd: 0.85, cy: 0.6, tu: 0.95, pa: 0.85, gl: 0.5 }],
    [T.settle - 0.02, 'son', { fill: 1 }],
  ];
  const secAt = (t) => { let s = SECT[0]; for (const x of SECT) if (t >= x[0]) s = x; return s; };
  const SN = [1, 0.28, 0.42, 0.3, 0.85, 0.28, 0.5, 0.32, 0.9, 0.28, 0.42, 0.3, 0.85, 0.35, 0.55, 0.7]; // marş kadansı (R l R l …)

  function muzik(A) {
    const { ac, music, other, T0, out, perc, filt, noise, osc, lfo, rng, snare, roll, bass, cymbal, horn, chord, glock } = A;
    const R = rng(7010), hum = () => 0.9 + R() * 0.2, jit = () => (R() - 0.5) * 0.004;
    for (let k = 0; k < BARS * 16; k++) {
      const t = stepT(k), p = k % 16, bar = Math.floor(k / 16), [, name, L] = secAt(t), ch = CH[PROG[bar]];
      if (L.fill) continue;
      const nh = nearHit(t, 0.32), nh2 = nearHit(t, 0.16);
      if (L.build) { // "Ama altı turun sadece biri bitti": Fsus/F gerilimi — tuba uzun, davul çeyrek nabız, trampet rulosu kreşendo → 2. TUR vuruşu
        if (p % 4 === 0 && t < T.ikinci - 0.1) bass(t, 0.35 + 0.25 * prog(t, T.ama, T.ikinci), 0);
        if (p === 0) horn(t, ch.tu[0], BAR * 0.95, 0.75, 0, 'tu');
        if (p % 2 === 0 && t < T.ikinci - 1.2) snare(t + jit(), (p % 4 ? 0.22 : 0.38) * hum());
        continue;
      }
      if (L.heart) { // EN ÖNEMLİSİ: her şey kararır — kalp atışı davul (lub-dub), alçak tuba pedalı
        if (p === 0 || p === 8) { if (!nh) { bass(t, 0.5, 0); bass(t + S16 * 1.3, 0.3, 0); } }
        if (p === 0) horn(t, ch.tu[0], BAR * 0.98, 0.5, 0, 'tu');
        continue;
      }
      if (L.tick) { // "neredeydi?": saat gibi kenar tıkı + tuba pedalı
        if (p % 4 === 0) { const g = out(music, p % 8 ? 0.3 : -0.3), bp = filt('bandpass', 2300, 3, g); perc(g, t, 0.16 * L.tick, 0.0005, 0.03); noise(t, 0.04, bp); }
        if (p === 0) { bass(t, L.bd, 0); horn(t, ch.tu[0], BAR * 0.95, L.tu * 0.8, 0, 'tu'); }
        continue;
      }
      // büyük davul: 1 ve 3 (tam bölümlerde 4'ün "ve"sinde öncü)
      if ((p === 0 || p === 8) && L.bd && !nh) bass(t + jit(), L.bd * (p === 0 ? 1 : 0.85) * hum());
      if (p === 14 && L.bd && L.sn && bar % 2 === 1 && !nh) bass(t, L.bd * 0.5);
      // tuba: um (1 ve 3), legato bölümde ölçü başına uzun nota
      if (L.tu && !nh) {
        if (L.legato) { if (p === 0) horn(t, ch.tu[0], BAR * 0.5, L.tu * 0.85, 0, 'tu'); if (p === 8) horn(t, ch.tu[1], BAR * 0.45, L.tu * 0.7, 0, 'tu'); }
        else if (p === 0 || p === 8) horn(t, ch.tu[p ? 1 : 0], BEAT * 0.62, L.tu * hum(), 0, 'tu');
        else if (p === 14 && bar % 4 === 3) { const nx = CH[PROG[(bar + 1) % BARS]].tu[0]; horn(t, nx - 1 + (nx - 1 < 30 ? 12 : 0), BEAT * 0.4, L.tu * 0.6, 0, 'tu'); } // kromatik yürüme
      }
      // "pa": trombon/korno 2 ve 4'te kısa vuruş (konuşma bandında: kısık ve kısa)
      if (L.pa && (p === 4 || p === 12) && !nh2) chord(t + jit(), ch.pa, BEAT * 0.32, L.pa * 0.55 * hum(), 'tb', 0.1);
      // trampet
      if (L.sn && !nh2) { snare(t + jit(), L.sn * SN[p] * hum()); if (p === 14 && bar % 4 === 1) roll(t, S16 * 2, L.sn * 0.35, L.sn * 0.8); }
      if (L.sl && (p % 2 === 0) && !nh2) snare(t + jit(), L.sl * (p % 8 === 4 ? 0.9 : p % 4 === 0 ? 0.55 : 0.3) * hum());
      if (L.cy && (p === 4 || p === 12) && !nh2) cymbal(t, L.cy * 0.6, false);
      // tenor davullar (quad): 2. kural bölümünde ölçü sonunda iniş
      if (L.tenor && p >= 10 && p % 2 === 0 && bar % 2 === 1 && !nh2) { const f = [330, 262, 208][(p - 10) / 2]; const g = out(music, 0.4 - (p - 10) * 0.08); perc(g, t, 0.26 * L.tenor, 0.002, 0.16); const o = osc('sine', f * 1.3, t, 0.2, g); o.frequency.exponentialRampToValueAtTime(f, T0(t) + 0.03); }
      // zil-lir: bölüm başlarında/ölçü sonunda kısa arpej (seyrek; konuşmayı örtmesin)
      if (L.gl && bar % 4 === 2 && (p === 10 || p === 12 || p === 14) && !nh2) glock(t, ch.tp[(p - 10) / 2] + 12, L.gl);
    }
    // --- bölüm başlarında zil çarpması
    [T.bjk + 0.1, T.tablo + 0.1, T.cta + 0.1].forEach((t) => cymbal(t, 0.55, true));
    // --- konuşma aralarında trompet cevapları (çağrı-cevap): kısa fanfar
    const fan = (t, ms, v = 0.8, pan = 0.2) => ms.forEach(([dt, m, l]) => { horn(t + dt, m, l, v, pan, 'tp'); horn(t + dt + 0.003, m - 4, l, v * 0.6, -pan, 'tp'); });
    fan(2.78, [[0, 65, 0.11], [0.13, 70, 0.11], [0.26, 74, 0.14]]);           // "değişti!" → ta-ta-taa (Si♭ arpeji)
    fan(6.66, [[0, 70, 0.08], [0.1, 70, 0.08], [0.2, 77, 0.12]], 0.7, -0.2); // "saydık." → Beşiktaş'a giriş
    fan(33.06, [[0, 67, 0.12], [0.16, 70, 0.12], [0.32, 75, 0.12]], 0.6);    // "böyle." → tablo
    fan(40.16, [[0, 72, 0.1], [0.12, 77, 0.16]], 0.6, -0.2);                  // "atar." → %65 kuralı kapanır
    fan(48.36, [[0, 69, 0.1], [0.12, 72, 0.15]], 0.55);                       // "sayıldı:" → kişi başı 2
    // --- "Ama … bitti" → 2. TUR: trampet rulosu kreşendosu (nefes arasında doruk)
    roll(T.ikinci - 1.15, 1.13, 0.1, 0.34);
    // --- "son": T.settle'dan döngü sınırına öncü dolgu: trampet rulosu kreşendo + tuba F–G–A → t=0'daki Si♭'ye çözülür
    {
      const b0 = (BARS - 1) * BAR, st = (j) => b0 + stepT(j);
      roll(T.settle + 0.02, DUR - T.settle - 0.05, 0.22, 0.9);
      [[8, 41], [12, 43], [14, 45]].forEach(([j, m]) => { if (st(j) >= T.settle - 0.03) horn(st(j), m - 12 + (m - 12 < 30 ? 12 : 0), S16 * (j === 8 ? 3.6 : 1.8), 1.0, 0, 'tu'); });
      [[10, 0.35], [12, 0.45], [14, 0.55]].forEach(([j, v]) => bass(st(j), v));
      [10, 12, 14].forEach((j, i) => chord(st(j), [[57, 60, 65], [57, 63, 65], [58, 62, 65]][i].map((m) => m + (i === 2 ? 0 : 0)), S16 * 1.4, 0.35 + i * 0.12, 'tb', 0.1));
    }
    // --- t=0: inişin vuruşu (döngüde dolgunun çözüldüğü yer) — konuşma ("Birinci") hemen başladığı için pirinç kısa
    bass(0, 0.5); cymbal(0, 0.28, true); horn(0, 34, BEAT * 0.8, 0.7, 0, 'tu'); chord(0.005, CH.Bb.pa, 0.16, 0.32, 'tb');
    // --- büyük vuruşların müzik katmanı
    bass(T.turBitti, 0.75); cymbal(T.turBitti, 0.5, true); horn(T.turBitti, 34, 0.5, 0.8, 0, 'tu');
    GOALS.forEach((t, i) => { const big = i < 3, c = chordAt(t); bass(t, big ? 0.5 : 0.38); cymbal(t, big ? 0.3 : 0.22, true, i % 2 ? -0.3 : 0.3);
      horn(t, c.tu[0], 0.45, 0.55, 0, 'tu'); chord(t + 0.004, c.tp, big ? 0.24 : 0.16, big ? 0.45 : 0.35, 'tp', 0); chord(t + 0.004, c.pa.map((m) => m - 12), big ? 0.28 : 0.18, 0.3, 'tb'); });
    // 2. TUR BAŞLADI: tam bando vuruşu — davul ×2, zil, tuba, trompet+trombon akoru (kısa, "İkinci" hemen arkasından geliyor)
    { const t = T.ikinci; bass(t, 0.6); bass(t + 0.012, 0.3, 0.3); cymbal(t, 0.4, true, -0.2); cymbal(t + 0.01, 0.3, true, 0.35); horn(t, 34, 0.6, 0.6, 0, 'tu'); horn(t, 46, 0.45, 0.4, 0, 'tu');
      chord(t + 0.004, [65, 70, 74, 77], 0.26, 0.45, 'tp'); chord(t + 0.004, [50, 53, 58, 62], 0.3, 0.38, 'tb'); }
    // beğeni açılışı: kilit kırılınca pirinç yükselişi (Si♭ arpeji) → CTA
    { const t = T.begeniUnlock + 0.12; horn(t, 34, 0.5, 0.9, 0, 'tu'); bass(t, 0.8); cymbal(t + 0.02, 0.5, true); [[0, 58], [0.09, 62], [0.18, 65], [0.27, 70]].forEach(([d, m]) => horn(t + d, m, 0.16, 0.55, 0.1, 'tb')); }
    // CTA girişi: tutti kısa vuruş
    { const t = T.cta + 0.1; chord(t, CH.Bb.pa, 0.2, 0.55, 'tb'); horn(t, 34, 0.4, 0.9, 0, 'tu'); }
    // stadyum uğultusu: tüm video boyunca alçak süreğen kalabalık (golsüz/beğeni bölümlerinde iner; sonda başla aynı)
    {
      const g = out(other, 0), lv = [[0, 0.06], [T.noGoal, 0.035], [T.nerede, 0.02], [T.tablo, 0.045], [T.ikinci, 0.07], [T.kural65 + 0.5, 0.05], [T.begeni, 0.02], [T.cta, 0.06]];
      g.gain.setValueAtTime(lv[0][1], 0); for (let i = 1; i < lv.length; i++) { g.gain.setValueAtTime(lv[i - 1][1], lv[i][0]); g.gain.linearRampToValueAtTime(lv[i][1], lv[i][0] + 0.4); } g.gain.setValueAtTime(0.06, T.cta + 0.4);
      [[420, 0.6, 1, -0.7], [900, 0.8, 0.55, 0.7], [1800, 1, 0.2, 0]].forEach(([fq, q, a, pn]) => { const pp = ac.createStereoPanner(); pp.pan.value = pn; const ga = ac.createGain(); ga.gain.value = a; const f = filt('bandpass', fq, q); f.connect(ga).connect(pp).connect(g); noise(0, DUR, f, 0.97 + a * 0.05); });
    }
  }

  return { BARS, BAR, BEAT, S16, BPM, GAPS, GOALS, BIGS, CH, PROG, chordAt, kur, muzik, rng, clamp, lerp, prog, mtof };
})();
