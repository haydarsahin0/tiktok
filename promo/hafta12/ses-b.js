'use strict';
/* 12. Hafta (6. video) — ses (2/2): görüntüdeki her olayın efekti + window.renderAudio.
 * Ev sahibi = sol, deplasman = sağ. Her geçişin "whoosh"u farklı karakterde. */
window.SES12.fx = (A) => {
  const S = window.SES12, { prog, lerp, rng } = S, { ac, sfx, other, T0, out, perc, hold, osc, noise, filt, lfo, caixa, tamborim, apito, hey } = A;
  const R = rng(1220);
  // ---- efekt sesleri ----
  const pop = (t, f = 700, v = 1, pan = 0) => { const g = out(sfx, pan); perc(g, t, 0.2 * v, 0.002, 0.07); const o = osc('sine', f * 0.55, t, 0.1, g); o.frequency.exponentialRampToValueAtTime(f * 1.5, T0(t) + 0.045);
    const g2 = out(sfx, pan), bp = filt('bandpass', f * 3, 3, g2); perc(g2, t, 0.06 * v, 0.0005, 0.01); noise(t, 0.02, bp); };
  const tick = (t, f = 1800, v = 1, pan = 0) => { const g = out(sfx, pan), bp = filt('bandpass', f, 6, g); perc(g, t, 0.18 * v, 0.0005, 0.02); osc('square', f, t, 0.03, bp); };
  const thud = (t, v = 1, pan = 0, f0 = 120, f1 = 44, d = 0.45) => { const g = out(sfx, pan); perc(g, t, 0.75 * v, 0.003, d); const o = osc('sine', f0, t, d + 0.05, g); o.frequency.exponentialRampToValueAtTime(f1, T0(t) + d * 0.6);
    const g2 = out(sfx, pan), lp = filt('lowpass', 900, 0.8, g2); perc(g2, t, 0.5 * v, 0.002, 0.08); noise(t, 0.1, lp); };
  // damga: tok vuruş + mürekkep "şap" + kâğıt çatırtısı
  const stamp = (t, v = 1, pan = 0) => { thud(t, 0.8 * v, pan, 140, 50, 0.32);
    const g = out(sfx, pan), bp = filt('bandpass', 950, 0.8, g); perc(g, t, 0.55 * v, 0.001, 0.11); noise(t, 0.14, bp);
    const g2 = out(sfx, pan), hp = filt('highpass', 3500, 0.7, g2); perc(g2, t + 0.004, 0.35 * v, 0.0005, 0.035); noise(t, 0.05, hp);
    for (let i = 0; i < 5; i++) { const x = t + 0.03 + R() * 0.12, gg = out(sfx, pan + (R() - 0.5) * 0.8), b2 = filt('bandpass', 2000 + R() * 3000, 3, gg); perc(gg, x, 0.12 * v, 0.0005, 0.015); noise(x, 0.02, b2); } };
  // takım adı vuruşu (surdo müzikte): sticker "çak" + ince çıt; büyükte şok dalgası
  const nameHit = (t, v = 1, pan = 0, big = false) => {
    const g = out(sfx, pan), bp = filt('bandpass', 1300, 0.9, g); perc(g, t, 0.42 * v, 0.001, 0.07); noise(t, 0.09, bp);
    const g2 = out(sfx, pan), hp = filt('highpass', 4200, 0.7, g2); perc(g2, t, 0.25 * v, 0.0005, 0.025); noise(t, 0.04, hp);
    if (big) shock(t, 0.65 * v, pan * 0.5); };
  const shock = (t, v = 1, pan = 0) => { t = T0(t); const g = out(sfx, pan), lp = filt('lowpass', 3000, 0.8, g); lp.frequency.setValueAtTime(3500, t); lp.frequency.exponentialRampToValueAtTime(160, t + 0.45); perc(g, t, 0.35 * v, 0.004, 0.5); noise(t, 0.55, lp);
    const g2 = out(sfx, pan); perc(g2, t, 0.45 * v, 0.004, 0.5); const o = osc('sine', 78, t, 0.55, g2); o.frequency.exponentialRampToValueAtTime(34, t + 0.45); };
  // VS kıvılcımı: elektrikli çıtırtı
  const spark = (t, v = 1, pan = 0) => { for (let i = 0; i < 9; i++) { const x = t + i * 0.012 + R() * 0.01, g = out(sfx, pan + (R() - 0.5) * 0.3), hp = filt('highpass', 5000 + R() * 3000, 1, g); perc(g, x, (0.22 - i * 0.02) * v, 0.0003, 0.008); noise(x, 0.012, hp); }
    const g = out(sfx, pan), bp = filt('bandpass', 2400, 5, g); perc(g, t, 0.05 * v, 0.002, 0.12); osc('sawtooth', 120, t, 0.14, bp); };
  // metal para: inarmonik çınlama
  const coin = (t, v = 1, pan = 0, f0 = 1900, d = 0.9) => { [[1, 1, 1], [2.32, 0.6, 0.7], [4.25, 0.35, 0.45], [6.63, 0.2, 0.3], [1.007, 0.6, 1]].forEach(([r, a, dd]) => { const g = out(sfx, pan); perc(g, t, 0.045 * a * v, 0.0008, d * dd); osc('sine', f0 * r, t, d * dd + 0.05, g); });
    const g = out(sfx, pan), hp = filt('highpass', 6000, 0.7, g); perc(g, t, 0.2 * v, 0.0004, 0.01); noise(t, 0.02, hp); };
  const sparkle = (t, n = 8, len = 0.4, v = 1, pan = 0, spread = 0.6) => { for (let i = 0; i < n; i++) { const x = t + (i / n) * len + R() * 0.02, f = 2600 + R() * 3600, g = out(sfx, pan + (R() - 0.5) * spread); perc(g, x, 0.035 * v * (1 - (i / n) * 0.5), 0.001, 0.12 + R() * 0.1); osc('sine', f, x, 0.25, g); } };
  // genel "whoosh": her geçiş için farklı parametre (filtre türü, yön, ton, titreşim, pan yolu)
  const whoosh = (t, len, o = {}) => {
    t = T0(t); const v = o.v ?? 1, g = out(sfx, 0), p = ac.createStereoPanner(); g.disconnect(); g.connect(p).connect(sfx);
    p.pan.setValueAtTime(o.p0 ?? 0, t); p.pan.linearRampToValueAtTime(o.p1 ?? 0, t + len);
    const f = filt(o.type || 'bandpass', o.f0 || 400, o.q ?? 1.2, g); f.frequency.setValueAtTime(o.f0 || 400, t); f.frequency.exponentialRampToValueAtTime(o.f1 || 3500, t + len * (o.fAt ?? 0.8));
    const pk = o.peak ?? 0.65; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.5 * v, t + len * pk); g.gain.linearRampToValueAtTime(0, t + len);
    const src = ac.createGain(); src.connect(f); noise(t, len + 0.02, src, o.rate || 1);
    if (o.am) { src.gain.value = 0.5; lfo(o.am, 0.5, src.gain, t, len + 0.02, 'triangle'); }
    if (o.tone) { const gt = ac.createGain(); gt.gain.value = o.toneV ?? 0.08; gt.connect(g); const oo = osc(o.toneType || 'sine', o.tone[0], t, len + 0.02, gt); oo.frequency.exponentialRampToValueAtTime(o.tone[1], t + len); }
  };
  const flick = (t, v = 1, pan = 0) => { const g = out(sfx, pan), bp = filt('bandpass', 2600, 1.5, g); perc(g, t, 0.3 * v, 0.001, 0.03); noise(t, 0.04, bp); const g2 = out(sfx, pan), b2 = filt('bandpass', 700, 1, g2); perc(g2, t + 0.006, 0.15 * v, 0.001, 0.05); noise(t, 0.06, b2); };
  const knock = (t, v = 1, pan = 0) => { const g = out(sfx, pan); perc(g, t, 0.35 * v, 0.001, 0.09); const o = osc('triangle', 240, t, 0.12, g); o.frequency.exponentialRampToValueAtTime(150, T0(t) + 0.06); const g2 = out(sfx, pan), bp = filt('bandpass', 1100, 2, g2); perc(g2, t, 0.2 * v, 0.0005, 0.02); noise(t, 0.03, bp); };
  const fallTone = (t, len, f0, f1, v = 1, pan = 0, type = 'sine') => { t = T0(t); const g = out(sfx, pan); hold(g, t, 0.06 * v, 0.02, len, len * 0.4); const o = osc(type, f0, t, len + 0.02, g); o.frequency.exponentialRampToValueAtTime(f1, t + len); };
  const ding = (t, v = 1, pan = 0, f = 1318.5) => { [[1, 1, 0.7], [2, 0.3, 0.4], [3.01, 0.12, 0.25]].forEach(([r, a, d]) => { const g = out(sfx, pan); perc(g, t, 0.09 * a * v, 0.002, d); osc('sine', f * r, t, d + 0.05, g); }); };
  const bloop = (t, v = 1, pan = 0) => { t = T0(t); const g = out(sfx, pan), lp = filt('lowpass', 1400, 1.5, g); perc(g, t, 0.35 * v, 0.006, 0.22); const o = osc('sine', 190, t, 0.25, lp); o.frequency.exponentialRampToValueAtTime(560, t + 0.08); o.frequency.exponentialRampToValueAtTime(480, t + 0.2); const o2 = osc('triangle', 380, t, 0.2, lp); o2.frequency.exponentialRampToValueAtTime(1100, t + 0.08); };
  const key = (t, v = 1, pan = 0) => { const g = out(sfx, pan), bp = filt('bandpass', 3200 + R() * 800, 2.2, g); perc(g, t, 0.28 * v, 0.0005, 0.016); noise(t, 0.025, bp); const g2 = out(sfx, pan); perc(g2, t, 0.08 * v, 0.001, 0.025); osc('sine', 340 + R() * 60, t, 0.04, g2); };
  const rip = (t, len, v = 1, pan = 0) => { t = T0(t); const g = out(sfx, pan), bp = filt('bandpass', 1800, 0.8, g); hold(g, t, 0.4 * v, 0.004, len, len * 0.5); const am = ac.createGain(); am.gain.value = 0.5; am.connect(bp); const lo = ac.createOscillator(); lo.type = 'square'; lo.frequency.setValueAtTime(90, t); lo.frequency.linearRampToValueAtTime(35, t + len); const lg = ac.createGain(); lg.gain.value = 0.5; lo.connect(lg).connect(am.gain); lo.start(t); lo.stop(t + len + 0.02); noise(t, len + 0.02, am); };
  const crowdSwell = (t, len, v = 1) => { t = T0(t); const g = out(other, 0); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.22 * v, t + 0.1); g.gain.linearRampToValueAtTime(0.12 * v, t + len * 0.5); g.gain.linearRampToValueAtTime(0, t + len);
    [[650, 0.8, 1, -0.5], [1300, 1, 0.5, 0.5], [2600, 1.2, 0.2, 0]].forEach(([fq, q, a, pn]) => { const pp = ac.createStereoPanner(); pp.pan.value = pn; const ga = ac.createGain(); ga.gain.value = a; const f = filt('bandpass', fq, q); f.connect(ga).connect(pp).connect(g); lfo(4 + a * 3, a * 0.3, ga.gain, t, len); noise(t, len, f); }); };
  const hitH = (h) => S.HITS.find((x) => x.i === h.i && x.home === h.home).t;

  // ===== 1) kanca =====
  // "Bu videonun yorumları": baloncuklar pilden fışkırır
  [0.04, 0.2, 0.34, 0.5, 0.66, 0.84, 1.02, 1.2, 1.36].forEach((x, i) => pop(x, 520 + i * 55, 0.55 + i * 0.03, (R() - 0.5) * 1.2));
  whoosh(T.stamp - 0.16, 0.16, { f0: 900, f1: 4500, q: 0.8, v: 0.5 });     // damga iniyor (kısa hava kesişi)
  stamp(T.stamp, 1, -0.1);
  // +3 parası kameraya döner: dönme vızıltısı + çınlama + altın parıltı
  whoosh(T.coinFlip - 0.12, 0.22, { type: 'bandpass', f0: 1800, f1: 5200, q: 3, am: 38, v: 0.35 });
  coin(T.coinFlip + 0.08, 0.9, 0); sparkle(T.coinFlip + 0.1, 7, 0.35, 0.8);
  // sarkaç: sol-sağ salınımlar, her dönüşte çift değişir
  { const n = 4, d = (C.karar - C.kimin) / n; for (let i = 0; i < n; i++) { const t = C.kimin + i * d, s = i % 2 ? 1 : -1; whoosh(t - 0.05, d * 0.9, { type: 'lowpass', f0: 600, f1: 2600, q: 2, p0: -s * 0.6, p1: s * 0.6, peak: 0.5, v: 0.45 }); tick(t + d * 0.8, 1500 + i * 120, 0.6, s * 0.6); } }
  // "karar veriyor": baloncuklar paraya emilir → manşet çakılır
  whoosh(T.hookSlam - 0.34, 0.34, { type: 'highpass', f0: 3000, f1: 300, q: 0.9, peak: 0.95, v: 0.5, tone: [400, 1600], toneV: 0.05 });
  for (let i = 0; i < 6; i++) pop(T.hookSlam - 0.3 + i * 0.045, 900 + i * 140, 0.4, (R() - 0.5) * 1.4);
  thud(T.hookSlam, 0.9, 0, 130, 40, 0.6); shock(T.hookSlam, 0.6);

  // ===== 2) kural =====
  whoosh(T.kural - 0.06, 0.26, { type: 'bandpass', f0: 3800, f1: 600, q: 1.6, p0: -0.8, p1: 0.8, peak: 0.4, v: 0.75, fAt: 1 });  // yatay hızlı pan
  knock(C.kural, 0.9, 0); knock(C.tek, 1, 0);
  // düello ikiye açılır: fermuar/yırtılma, iki yana açılan
  { const t = T.split; [-1, 1].forEach((s) => whoosh(t, 0.3, { type: 'bandpass', f0: 700, f1: 4800, q: 4, am: 55, p0: 0, p1: s * 0.85, v: 0.45, peak: 0.3 })); thud(t + 0.02, 0.4, 0, 90, 50, 0.3); }
  // iki yana yağan baloncuklar + yarışan sayaçlar (sol önde)
  for (let x = T.split + 0.12; x < C.uc2 - 0.1; x += 0.12 + R() * 0.1) pop(x, 600 + R() * 500, 0.35, -0.65);
  for (let x = T.split + 0.18; x < C.uc2 - 0.1; x += 0.15 + R() * 0.12) pop(x, 560 + R() * 450, 0.3, 0.65);
  for (let x = C.yorumlarda, i = 0; x < C.uc2 - 0.08; i++) { tick(x, 2400 + (i % 4) * 90, 0.35, -0.7); x += lerp(0.13, 0.07, prog(x, C.yorumlarda, C.uc2)); }
  for (let x = C.yorumlarda + 0.05, i = 0; x < C.uc2 - 0.08; i++) { tick(x, 2100 + (i % 4) * 80, 0.3, 0.7); x += lerp(0.15, 0.09, prog(x, C.yorumlarda, C.uc2)); }
  // dikiş her kelimede kaybedene (sağa) itilir
  [C.rakibinden, C.daha, C.cok, C.adi, C.yazilan, C.takim].forEach((x, i) => knock(x, 0.5 + i * 0.05, 0.35));
  // +3 kazanana düşer: düşüş sesi → para + şok dalgası; kaybeden söner
  fallTone(T.coinDrop - 0.3, 0.3, 2400, 700, 0.8, -0.4);
  coin(T.coinDrop, 1.1, -0.45, 1650, 1.0); thud(T.coinDrop, 0.85, -0.4, 120, 42, 0.55); shock(T.coinDrop + 0.01, 0.7, -0.3);
  fallTone(T.coinDrop + 0.25, 0.55, 520, 170, 0.7, 0.6, 'triangle');

  // ===== 3) deste =====
  whoosh(T.maclar - 0.05, 0.22, { type: 'lowpass', f0: 300, f1: 4200, q: 1, v: 0.55 });
  for (let i = 0; i < 8; i++) flick(T.maclar + 0.12 + i * 0.065, 0.55, lerp(-0.7, 0.7, i / 7));
  // kamera ilk karta dalar: yükselen tonlu dalış
  whoosh(T.dive - 0.02, T.m[0] - T.dive + 0.04, { type: 'bandpass', f0: 250, f1: 3000, q: 2.2, peak: 0.92, v: 0.7, tone: [140, 900], toneV: 0.07, toneType: 'triangle' });

  // ===== 4/6) maç kartları =====
  // her kart başka bir geçişle gelir (0 = dalış, yukarıda)
  const TR = [null,
    (t) => whoosh(t - 0.14, 0.24, { type: 'bandpass', f0: 2600, f1: 900, q: 1.4, p0: -0.9, p1: 0.4, v: 0.6, peak: 0.55 }),                         // kayma (yatay)
    (t) => { whoosh(t - 0.12, 0.2, { type: 'highpass', f0: 1200, f1: 5000, q: 0.8, v: 0.45 }); flick(t - 0.05, 0.7, 0); flick(t + 0.02, 0.6, 0); },   // dikey dönüş (kanat çırpar)
    (t) => whoosh(t - 0.2, 0.28, { type: 'bandpass', f0: 300, f1: 2400, q: 3, v: 0.55, peak: 0.85, tone: [220, 880], toneV: 0.06 }),              // önceki VS'nin içinden zoom
    (t) => whoosh(t - 0.12, 0.22, { type: 'bandpass', f0: 5500, f1: 1400, q: 5, p0: -0.6, p1: 0.6, v: 0.5, am: 70 }),                              // çapraz kesik silme (metalik)
    (t) => { whoosh(t - 0.25, 0.25, { type: 'lowpass', f0: 200, f1: 6000, q: 0.7, v: 0.5, peak: 0.98 }); },                                          // büyük dört: emilip "snap"
    (t) => whoosh(t - 0.2, 0.26, { type: 'bandpass', f0: 900, f1: 1800, q: 2, p0: 0.8, p1: -0.8, am: 14, v: 0.6, peak: 0.6 }),                      // dönerek gelir
    (t) => whoosh(t - 0.18, 0.24, { type: 'lowpass', f0: 2500, f1: 250, q: 3, v: 0.65, peak: 0.4, fAt: 1, tone: [600, 90], toneV: 0.09 }),          // zoom-through (alçalan "vuum")
    (t) => whoosh(t - 0.14, 0.2, { type: 'highpass', f0: 6000, f1: 1500, q: 1.2, p0: 0.9, p1: -0.2, v: 0.6, peak: 0.5 }),                          // sağdan hava kesişi
  ];
  MATCHES.forEach((m) => {
    const tH = hitH({ i: m.i, home: true }), tA = hitH({ i: m.i, home: false });
    if (TR[m.i]) TR[m.i](T.m[m.i]);
    tick(T.m[m.i] + 0.16, 900 + m.i * 110, 0.5, -0.2); // ilerleme: n. dilim dolar
    nameHit(tH, m.big ? 1.15 : 0.9, -0.55, m.big); nameHit(tA, m.big ? 1.15 : 0.9, 0.55, m.big); spark(tA + 0.03, m.big ? 0.9 : 0.6, 0.15);
    if (m.big) {
      apito(T.m[m.i] - 0.09, 0.07, 0.8, 0.3, 30); apito(T.m[m.i] + 0.0, 0.12, 0.9, 0.3, 30);
      hey(tH + 0.02, 0.75);
      for (let j = 0; j < 6; j++) tick(tA + 0.25 + j * 0.07 + R() * 0.02, 1400 + R() * 1400, 0.2, R() > 0.5 ? 0.5 : -0.5); // "?" sayaç karışması
      for (let j = 0; j < 4; j++) pop(tA + 0.15 + j * 0.09, 650 + R() * 400, 0.3, j % 2 ? 0.7 : -0.7); // iki yandan uçuşan baloncuklar
    }
  });
  // 9/9: ilerleme çubuğu tamamlanır ve patlar
  { const t = MATCHES[8].tAway + 0.5; sparkle(t, 10, 0.3, 0.9, 0, 1.4); pop(t, 1100, 0.6, 0); }

  // ===== 5) ortam ısınıyor: yalnızca çok uzak, seyrek kor çıtırtıları (fısıltı temiz kalsın) =====
  for (let x = T.isin + 0.3; x < T.m[5] - 0.3; x += 0.18 + R() * 0.25) { const g = out(sfx, (R() - 0.5) * 1.6), hp = filt('highpass', 7000, 0.7, g); perc(g, x, 0.03, 0.0004, 0.006); noise(x, 0.01, hp); }

  // ===== 7) sen yazmazsan =====
  whoosh(T.sen - 0.04, 0.3, { type: 'bandpass', f0: 2800, f1: 350, q: 1.1, v: 0.6, peak: 0.3, fAt: 1, tone: [900, 200], toneV: 0.05 });   // hızlı geri çekiliş
  for (let i = 0; i < 9; i++) flick(T.sen + 0.12 + i * 0.03, 0.35, lerp(-0.7, 0.7, (i % 3) / 2));                                       // 3x3 duvar oturur
  whoosh(T.sen + 0.5, 0.28, { type: 'lowpass', f0: 250, f1: 1800, q: 1.8, v: 0.5, peak: 0.9 });                                         // tek düelloya itiş
  tick(T.sen + 0.85, 600, 0.35, -0.6); tick(T.sen + 1.0, 600, 0.3, -0.6);                                                               // sol: sayaç 0'da takılı
  // rakip taraf yorumla dolar: sağda hızlanan baloncuk seli + roket sayaç
  for (let x = T.flood, i = 0; x < C.ve - 0.05; i++) { pop(x, 600 + (i % 6) * 70 + R() * 80, 0.35 + 0.2 * prog(x, T.flood, C.ve), 0.55 + R() * 0.35); x += lerp(0.11, 0.04, prog(x, T.flood, C.ve)); }
  for (let x = T.flood + 0.05, i = 0; x < C.ve - 0.08; i++) { tick(x, 1500 + i * 40, 0.3, 0.75); x += lerp(0.09, 0.035, prog(x, T.flood, C.ve)); }
  knock(C.yazar, 0.8, -0.4); thud(C.yazar, 0.35, -0.5, 100, 50, 0.25);                                                                // dikiş sola itilir

  // ===== 7b) para rakibe kayar, kamera parayla tabloya uçar =====
  { const t = T.coinFly, d = 0.65, g = out(sfx, 0), pp = ac.createStereoPanner(); g.disconnect(); g.connect(pp).connect(sfx); pp.pan.setValueAtTime(-0.5, t); pp.pan.linearRampToValueAtTime(0.7, t + d);
    const bp = filt('bandpass', 2400, 6, g); bp.frequency.setValueAtTime(1800, t); bp.frequency.linearRampToValueAtTime(3200, t + d); hold(g, t, 0.5, 0.03, d, 0.2); noise(t, d + 0.02, bp, 0.7); // metal kayma sürtünmesi
    coin(t, 0.5, -0.5, 2100, 0.5); }
  whoosh(T.coinFly + 0.6, T.tablo - T.coinFly - 0.6, { type: 'bandpass', f0: 500, f1: 2600, q: 1.3, p0: 0.7, p1: 0, am: 22, v: 0.55, peak: 0.85, tone: [1700, 2600], toneV: 0.03 }); // uçuş (dönen para)

  // ===== 8) tablo: para tabloya konar — dolgun, tatmin edici darbe + dönerek duran para tıkırtısı =====
  { const t = T.tablo; thud(t, 1.15, 0, 150, 38, 0.7); coin(t, 1.2, 0, 1500, 1.2); shock(t, 0.55, 0);
    const g = out(sfx, 0), bp = filt('bandpass', 420, 1, g); perc(g, t, 0.5, 0.002, 0.15); noise(t, 0.18, bp); // kâğıt kart "tok"
    let x = t + 0.11, gap = 0.1, v = 0.75; while (gap > 0.012 && x < C.dikkat - 0.05) { coin(x, v, (R() - 0.5) * 0.3, 2350 + R() * 120, 0.18); x += gap; gap *= 0.8; v *= 0.9; } }
  // satırlar yer değiştirir: +3 çipleri döner, satırlar kayar (ses yumuşak, sürekli)
  for (let x = T.tablo + 0.7, i = 0; x < T.canli - 0.2; x += 0.58, i++) { if (Math.abs(x - T.band) < 0.15 || Math.abs(x - T.band2) < 0.15) continue; flick(x, 0.3, i % 2 ? 0.45 : -0.45); whoosh(x + 0.04, 0.22, { type: 'bandpass', f0: 500 + (i % 3) * 200, f1: 1400, q: 1, v: 0.18, p0: 0, p1: i % 2 ? 0.4 : -0.4 }); }
  // DİKKAT şeridi: bant yırtılıp çakılır
  rip(T.band - 0.18, 0.2, 0.7, -0.3); knock(T.band, 1, 0); thud(T.band, 0.45, 0, 110, 55, 0.25);
  // SADECE BU HAFTA: YORUMLARLA + 12. HAFTA damgası + yorum simgesi
  stamp(T.band2 + 0.02, 0.85, 0.25); pop(T.band2 + 0.25, 980, 0.6, 0.3);

  // ===== 9) canlı =====
  whoosh(T.canli - 0.05, 0.4, { type: 'lowpass', f0: 3000, f1: 300, q: 1.5, v: 0.5, peak: 0.25, fAt: 1 }); knock(T.canli + 0.33, 0.5, 0); // tablo geri yatar, telefon kayıp gelir
  { const t = T.canliFlip; flick(t - 0.03, 0.7, 0); whoosh(t - 0.06, 0.12, { type: 'highpass', f0: 2000, f1: 6000, v: 0.3 }); ding(t + 0.05, 0.8, 0, 880); ding(t + 0.18, 0.6, 0, 880); } // CANLI rozeti
  for (let x = T.canliFlip + 0.3, i = 0; x < T.cta - 0.15; x += 0.24 + R() * 0.1, i++) pop(x, 1000 + (i % 4) * 150, 0.22, 0.75); // sağda yükselen kalpler
  for (let x = T.canli + 0.6, i = 0; x < T.cta - 0.2; x += 0.5, i++) tick(x, 2600, 0.18, -0.4); // skor tikleri
  whoosh(T.push - 0.05, 0.6, { type: 'lowpass', f0: 180, f1: 1400, q: 2.5, v: 0.55, peak: 0.85, tone: [70, 140], toneV: 0.12 });   // telefona itiş (basınç)
  { const t = T.goal; apito(t - 0.02, 0.09, 0.8, -0.3, 0); apito(t + 0.1, 0.22, 0.9, -0.3, 26); crowdSwell(t + 0.03, 0.8, 0.9); thud(t, 0.55, -0.3, 110, 50, 0.35); sparkle(t + 0.05, 6, 0.25, 0.6, -0.3); }

  // ===== 10) çağrı =====
  whoosh(T.cta - 0.03, 0.26, { type: 'bandpass', f0: 3000, f1: 700, q: 2, v: 0.5, fAt: 1, tone: [1500, 400], toneV: 0.05 }); pop(T.cta + 0.25, 640, 0.6, 0); // ekran avatara küçülür
  { const t = T.tap; const g = out(sfx, 0.2), bp = filt('bandpass', 2200, 1.4, g); perc(g, t, 0.35, 0.0005, 0.02); noise(t, 0.03, bp); knock(t, 0.4, 0.2); // dokunuş
    ding(t + 0.06, 1, 0.3, 1318.5); ding(t + 0.16, 0.8, 0.35, 1975.5); }                                                           // takip "ding" + onay
  { const t = T.heart; bloop(t, 1, 0); sparkle(t + 0.08, 12, 0.45, 0.8, 0, 1.2); for (let j = 0; j < 5; j++) pop(t + 0.1 + j * 0.06, 800 + j * 110, 0.3, (R() - 0.5) * 1.2); // kalp + parıltı
    for (let x = t + 0.12, i = 0; x < T.pill - 0.04; i++) { tick(x, 3000 + i * 60, 0.14, 0.5); x += 0.045; } }                             // beğeni sayacı döner
  whoosh(T.pill - 0.05, 0.5, { type: 'bandpass', f0: 600, f1: 2200, q: 1.5, p0: 0.8, p1: -0.8, am: 6, v: 0.45, peak: 0.6 });        // logolar yörüngeye döner
  for (let j = 0; j < 4; j++) pop(T.pill + 0.35 + j * 0.08, 700 + j * 90, 0.3, (j % 2 ? 0.5 : -0.5));
  // klavye tıkları → gönder "pop"
  { const t0 = C.takiminin + 0.05, t1 = C.yaz - 0.08; for (let x = t0; x < t1; x += 0.075 + R() * 0.07) key(x, 0.7 + R() * 0.3, (R() - 0.5) * 0.3); }
  { const t = C.yaz + 0.02; pop(t, 980, 1.1, 0); whoosh(t + 0.02, 0.2, { type: 'highpass', f0: 1500, f1: 6000, q: 0.8, v: 0.3, p0: 0, p1: 0.4 }); ding(t + 0.1, 0.4, 0, 2093); }
};

window.SES12.wav = (buf, N, PRE) => {
  // döngü katlaması: N'den taşan kuyruk başa eklenir (çevrimsel render); PRE = kompresör gecikmesi
  const len = buf.length, ch = 2, out = new DataView(new ArrayBuffer(44 + N * ch * 2));
  const ws = (o, s) => { for (let i = 0; i < s.length; i++) out.setUint8(o + i, s.charCodeAt(i)); };
  ws(0, 'RIFF'); out.setUint32(4, 36 + N * ch * 2, true); ws(8, 'WAVE'); ws(12, 'fmt '); out.setUint32(16, 16, true); out.setUint16(20, 1, true); out.setUint16(22, ch, true);
  out.setUint32(24, 44100, true); out.setUint32(28, 44100 * ch * 2, true); out.setUint16(32, ch * 2, true); out.setUint16(34, 16, true); ws(36, 'data'); out.setUint32(40, N * ch * 2, true);
  const L = buf.getChannelData(0), Rr = buf.getChannelData(1), q = (x) => Math.round(Math.max(-1, Math.min(1, x)) * 32767);
  let o = 44; for (let i = 0; i < N; i++) { const a = i + PRE, b = a + N; out.setInt16(o, q(L[a] + (b < len ? L[b] : 0)), true); out.setInt16(o + 2, q(Rr[a] + (b < len ? Rr[b] : 0)), true); o += 4; }
  const bytes = new Uint8Array(out.buffer); let bin = ''; for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(bin);
};
window.renderAudio = async () => { const S = window.SES12, A = S.kur(); S.muzik(A); S.fx(A); return S.wav(await A.ac.startRendering(), A.N, A.PRE); };
