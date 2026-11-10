'use strict';
/* 2. Tur (7. video) — ses (2/2): görüntüdeki her olayın efekti + window.renderAudio.
 * Her geçişin "whoosh"u farklı karakterde (hızlı yatay pan, dikey çevirme, zoom, bölünme, iris, çakma). */
window.SES7.fx = (A) => {
  const S = window.SES7, { prog, lerp, rng } = S, { ac, sfx, other, T0, out, perc, hold, osc, noise, filt, lfo, snare, bass, cymbal, horn, chord, glock, whistle, crowd } = A;
  const R = rng(7020);
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
  const shock = (t, v = 1, pan = 0) => { t = T0(t); const g = out(sfx, pan), lp = filt('lowpass', 3000, 0.8, g); lp.frequency.setValueAtTime(3500, t); lp.frequency.exponentialRampToValueAtTime(160, t + 0.45); perc(g, t, 0.35 * v, 0.004, 0.5); noise(t, 0.55, lp);
    const g2 = out(sfx, pan); perc(g2, t, 0.45 * v, 0.004, 0.5); const o = osc('sine', 78, t, 0.55, g2); o.frequency.exponentialRampToValueAtTime(34, t + 0.45); };
  // split-flap (havaalanı tabelası) pul çırpması: hızlı plastik tıkırtı dizisi, sonda oturma "tak"ı
  const flap = (t, n = 8, v = 1, pan = 0) => { for (let i = 0; i < n; i++) { const x = t + i * lerp(0.032, 0.05, i / n) + R() * 0.006, g = out(sfx, pan), bp = filt('bandpass', 2400 + R() * 900, 2.5, g); perc(g, x, 0.2 * v, 0.0004, 0.012); noise(x, 0.018, bp); }
    const te = t + n * 0.042, g = out(sfx, pan), bp = filt('bandpass', 1300, 1.5, g); perc(g, te, 0.3 * v, 0.0006, 0.03); noise(te, 0.04, bp); const g2 = out(sfx, pan); perc(g2, te, 0.1 * v, 0.001, 0.04); osc('triangle', 520, te, 0.05, g2); };
  const sparkle = (t, n = 8, len = 0.4, v = 1, pan = 0, spread = 0.6) => { for (let i = 0; i < n; i++) { const x = t + (i / n) * len + R() * 0.02, f = 2600 + R() * 3600, g = out(sfx, pan + (R() - 0.5) * spread); perc(g, x, 0.035 * v * (1 - (i / n) * 0.5), 0.001, 0.12 + R() * 0.1); osc('sine', f, x, 0.25, g); } };
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
  const ding = (t, v = 1, pan = 0, f = 1318.5) => { [[1, 1, 0.7], [2, 0.3, 0.4], [3.01, 0.12, 0.25]].forEach(([r, a, d]) => { const g = out(sfx, pan); perc(g, t, 0.09 * a * v, 0.002, d); osc('sine', f * r, t, d + 0.05, g); }); };
  const bloop = (t, v = 1, pan = 0) => { t = T0(t); const g = out(sfx, pan), lp = filt('lowpass', 1400, 1.5, g); perc(g, t, 0.35 * v, 0.006, 0.22); const o = osc('sine', 190, t, 0.25, lp); o.frequency.exponentialRampToValueAtTime(560, t + 0.08); o.frequency.exponentialRampToValueAtTime(480, t + 0.2); const o2 = osc('triangle', 380, t, 0.2, lp); o2.frequency.exponentialRampToValueAtTime(1100, t + 0.08); };
  const key = (t, v = 1, pan = 0) => { const g = out(sfx, pan), bp = filt('bandpass', 3200 + R() * 800, 2.2, g); perc(g, t, 0.28 * v, 0.0005, 0.016); noise(t, 0.025, bp); const g2 = out(sfx, pan); perc(g2, t, 0.08 * v, 0.001, 0.025); osc('sine', 340 + R() * 60, t, 0.04, g2); };
  // silgi/kazıma: üstü çizilen yorum (kısa sürtünme, aşağı kayan bant)
  const scratch = (t, len = 0.12, v = 1, pan = 0) => { t = T0(t); const g = out(sfx, pan), bp = filt('bandpass', 3800, 2, g); bp.frequency.setValueAtTime(4800, t); bp.frequency.exponentialRampToValueAtTime(1600, t + len); hold(g, t, 0.32 * v, 0.006, len, len * 0.6);
    const am = ac.createGain(); am.gain.value = 0.5; am.connect(bp); lfo(70 + R() * 30, 0.5, am.gain, t, len + 0.02, 'square'); noise(t, len + 0.02, am); };
  // file/ağ: top fileye gömülür — boğuk "puf" + ip hışırtısı
  const net = (t, v = 1, pan = 0) => { thud(t, 0.55 * v, pan, 95, 48, 0.3); const g = out(sfx, pan), bp = filt('bandpass', 1500, 0.7, g); t = T0(t); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.28 * v, t + 0.02); g.gain.setTargetAtTime(0, t + 0.03, 0.07); noise(t, 0.35, bp, 0.6); };
  // asma kilit: çelik mandal "klak" (iki tık + metal çınlaması)
  const lock = (t, v = 1, pan = 0) => { [0, 0.045].forEach((d, i) => { const g = out(sfx, pan), bp = filt('bandpass', i ? 2900 : 2100, 4, g); perc(g, t + d, 0.4 * v, 0.0004, 0.025); noise(t + d, 0.03, bp); });
    [[1730, 0.03, 0.35], [2950, 0.02, 0.25], [4310, 0.012, 0.18]].forEach(([f, a, d]) => { const g = out(sfx, pan); perc(g, t + 0.045, a * v, 0.001, d); osc('sine', f, t + 0.045, d + 0.05, g); });
    const g = out(sfx, pan); perc(g, t + 0.045, 0.25 * v, 0.001, 0.07); osc('triangle', 180, t + 0.045, 0.1, g); };
  const hitWhoosh = (t, v = 1) => whoosh(t - 0.22, 0.22, { type: 'highpass', f0: 600, f1: 5000, q: 0.8, peak: 0.95, v: 0.4 * v });
  // gol: kalabalık kükremesi + (müzikte trompet vuruşu, davul, zil) + file
  const goal = (t, v = 1, pan = 0) => { crowd(t + 0.02, 1.7 * v + 0.4, 0.75 * v); net(t + 0.01, 0.8 * v, pan); shock(t, 0.4 * v, pan * 0.5); sparkle(t + 0.06, 8, 0.4, 0.7 * v, pan, 1.2); };

  // ===== 1) kanca: "Birinci tur bitti… ve skorlar değişti!" =====
  hitWhoosh(T.turBitti, 0.9);
  whistle(T.turBitti - 0.01, 0.26, 0.85, 0.15); whistle(T.turBitti + 0.3, 0.12, 0.6, 0.15);   // hakem düdüğü (uzun + kısa)
  stamp(T.turBitti, 1.05, -0.05);
  // 5 skor döner (split-flap, satır satır), golsüz 4'ü sadece kısa titrer
  { let gi = 0; RESULTS.forEach((r, i) => { const pan = (i % 2 ? 0.45 : -0.45); if (r.goal) { flap(T.skorFlip + 0.02 + gi * 0.09, 9, 0.75, pan); gi++; } else flap(T.skorFlip + 0.05 + i * 0.03, 2, 0.25, pan); }); }

  // ===== 2) istatistik: 27 yorum → 16 sayıldı =====
  whoosh(T.stats - 0.08, 0.24, { type: 'bandpass', f0: 3600, f1: 700, q: 1.6, p0: -0.8, p1: 0.8, peak: 0.4, v: 0.6, fAt: 1 }); // hızlı yatay pan
  { const a = C.yirmi + 0.05, b = C.geldi + 0.25, n = STATS.fanComments; for (let i = 0; i < n; i++) { const x = a + (b - a) * Math.pow(i / n, 0.8); tick(x, 2000 + (i % 5) * 90, 0.32, -0.25); if (i % 2 === 0) pop(x + 0.02, 600 + R() * 500, 0.3, (R() - 0.5) * 1.4); } }
  // "kurallara": filtre süzgeci iner, 10 SPAM + 1 GEÇERSİZ düşer (aşağı kayan "fıt"lar), sayaç 16'ya iner
  whoosh(T.statCut - 0.05, 0.3, { type: 'lowpass', f0: 5000, f1: 500, q: 2, v: 0.45, peak: 0.3, fAt: 1 });
  for (let i = 0; i < STATS.spamCut; i++) { const x = T.statCut + 0.1 + i * 0.075; scratch(x, 0.07, 0.45, (i % 2 ? 0.5 : -0.5)); }
  { const x = T.statCut + 0.1 + STATS.spamCut * 0.075 + 0.05; const g = out(sfx, 0.3); perc(g, x, 0.1, 0.004, 0.2); const o = osc('square', 150, x, 0.22, filt('lowpass', 900, 1, g)); o.frequency.linearRampToValueAtTime(110, x + 0.2); } // GEÇERSİZ: alçak "bıp"
  for (let i = 0, n = STATS.fanComments - STATS.counted; i < n; i++) tick(T.statCut + 0.15 + i * 0.07, 1500 - i * 30, 0.26, 0.25);   // sayaç geri sayar
  stamp(T.statCount + 0.03, 0.55, 0.1); ding(T.statCount + 0.06, 0.8, 0, 1568);                                                       // "16 SAYILDI" oturur

  // ===== 3) Beşiktaş: Konya 0-1 BJK, 7 yorum =====
  whoosh(T.bjk - 0.12, 0.26, { type: 'bandpass', f0: 300, f1: 2600, q: 3, v: 0.55, peak: 0.85, tone: [200, 800], toneV: 0.05 });  // zoom-through
  { const t = C.en; whoosh(t - 0.05, 0.18, { type: 'highpass', f0: 1500, f1: 6000, q: 1, p0: -0.7, p1: 0.3, v: 0.35 }); knock(t + 0.12, 0.55, -0.2); }   // EN ÇOK YAZILAN şeridi
  pop(C.yazilan + 0.1, 900, 0.5, 0.4);                                                                                                       // 7 YORUM çipi
  { const a = C.konya + 0.1, b = T.bjkGoal - 0.15; for (let i = 0; i < 7; i++) tick(a + (b - a) * (i / 7), 1600 + i * 120, 0.35, 0.5); // oy barı dolar (7 oy), %65'i geçer
    whoosh(a, b - a, { type: 'bandpass', f0: 400, f1: 2200, q: 4, v: 0.22, peak: 0.95, tone: [300, 900], toneV: 0.035, toneType: 'triangle', p0: -0.5, p1: 0.5 }); ding(a + (b - a) * 0.65, 0.45, 0.3, 1760); }
  hitWhoosh(T.bjkGoal); goal(T.bjkGoal + 0.03, 1.1, 0.25); stamp(T.bjkGoal + 0.03, 0.6, 0.2);

  // ===== 4) GS 1-0 Samsun — dikey çevirme =====
  { const t = T.gs; whoosh(t - 0.12, 0.2, { type: 'highpass', f0: 1200, f1: 5000, q: 0.8, v: 0.45 }); flick(t - 0.04, 0.7, 0); flick(t + 0.03, 0.6, 0); }
  { const a = C.samsunspora, b = T.gsGoal - 0.15; for (let i = 0; i < 3; i++) tick(a + (b - a) * (i / 3), 1700 + i * 200, 0.35, -0.5); }
  hitWhoosh(T.gsGoal); goal(T.gsGoal + 0.03, 1.05, -0.25); stamp(T.gsGoal + 0.03, 0.55, -0.2);

  // ===== 5) Kocaeli 0-1 FB — çapraz kesik silme =====
  whoosh(T.fb - 0.12, 0.22, { type: 'bandpass', f0: 5500, f1: 1400, q: 5, p0: -0.6, p1: 0.6, v: 0.5, am: 70 });
  { const a = C.kocaelide, b = T.fbGoal - 0.12; for (let i = 0; i < 3; i++) tick(a + (b - a) * (i / 3), 1700 + i * 200, 0.35, 0.5); }
  hitWhoosh(T.fbGoal); goal(T.fbGoal + 0.03, 1.05, 0.25); stamp(T.fbGoal + 0.03, 0.55, 0.2);

  // ===== 6) Amed + Gaziantep — ekran ikiye bölünür (iki yana fermuar) =====
  { const t = T.amedGfk; [-1, 1].forEach((s) => whoosh(t - 0.06, 0.28, { type: 'bandpass', f0: 700, f1: 4800, q: 4, am: 55, p0: 0, p1: s * 0.85, v: 0.42, peak: 0.3 })); thud(t + 0.02, 0.35, 0, 90, 50, 0.25); }
  goal(C.amedspor + 0.04, 0.7, -0.45); pop(C.amedspor + 0.04, 820, 0.8, -0.5);
  goal(T.gfkHit + 0.04, 0.7, 0.45); pop(T.gfkHit + 0.04, 980, 0.8, 0.5);

  // ===== 7) gol yok — iris kapanır (alçalan "vuum"), 8 ad hafif pop, HENÜZ GOL YOK hüzünlü trombon =====
  whoosh(T.noGoal - 0.2, 0.3, { type: 'lowpass', f0: 2500, f1: 250, q: 3, v: 0.55, peak: 0.4, fAt: 1, tone: [600, 90], toneV: 0.07 });
  T.noGoalNames.forEach((t, i) => { pop(t + 0.03, 520 + (i % 4) * 60, 0.55, i % 2 ? 0.45 : -0.45); if (i % 2) tick(t + 0.2, 900, 0.25, 0.3); }); // kart vurur; maç (çift) tamamlanınca 0-0 "tık"
  stamp(T.henuzYok, 0.75, 0);
  { // hüzünlü trombon "vaa-vaa-vaa-vaaaa" (plancır sordin: lowpass açılıp kapanır), son nota sönerek iner
    const t0 = T.henuzYok + 0.04, notes = [[0, 58, 0.2], [0.24, 57, 0.2], [0.48, 56, 0.22], [0.74, 55, 0.75]];
    notes.forEach(([d, m, l], i) => { const t = t0 + d, g = out(sfx, -0.1), lp = filt('lowpass', 500, 4, g); lp.frequency.setValueAtTime(380, t); lp.frequency.linearRampToValueAtTime(1500, t + 0.08); lp.frequency.linearRampToValueAtTime(420, t + l);
      if (i === 3) { lfo(5.5, 300, lp.frequency, t + 0.1, l - 0.1); } hold(g, t, i === 3 ? 0.045 : 0.06, 0.02, l, l * 0.5);
      [-6, 5].forEach((c) => { const o = osc('sawtooth', mtofx(m) * Math.pow(2, c / 1200), t, l + 0.03, lp); if (i === 3) { o.frequency.setValueAtTime(mtofx(m) * Math.pow(2, c / 1200), t + 0.25); o.frequency.exponentialRampToValueAtTime(mtofx(m - 1.2), t + l); lfo(5.5, 2.5, o.frequency, t + 0.1, l); } }); });
  }
  // "Taraftarınız neredeydi?": boş yorum pili + yanıp sönen imleç, her kartın üstünde zıplayan soru işareti
  pop(T.nerede + 0.05, 640, 0.45, 0);
  for (let i = 0; i < 4; i++) { const t = T.nerede + 0.35 + i * 0.36, g = out(sfx, i % 2 ? 0.45 : -0.45); perc(g, t, 0.1, 0.004, 0.14); const o = osc('sine', 700 + i * 70, t, 0.16, g); o.frequency.exponentialRampToValueAtTime(1150 + i * 90, T0(t) + 0.06); o.frequency.exponentialRampToValueAtTime(820, T0(t) + 0.14); } // "boing"

  // ===== 8) anlık puan tablosu — kâğıt tablo kayarak gelir, satırlar karışır =====
  { const t = T.tablo; whoosh(t - 0.1, 0.3, { type: 'bandpass', f0: 600, f1: 2400, q: 0.9, p0: 0.7, p1: -0.2, v: 0.45 }); const g = out(sfx, 0), bp = filt('bandpass', 420, 1, g); perc(g, t + 0.18, 0.45, 0.002, 0.15); noise(t + 0.18, 0.18, bp); thud(t + 0.18, 0.3, 0, 110, 55, 0.25); }
  for (let i = 0; i < 12; i++) { const x = T.tabloShuffle + 0.02 + i * 0.06 + R() * 0.015; flick(x, 0.32 + 0.1 * (i % 3 === 0), lerp(-0.5, 0.5, (i * 7 % 12) / 11)); }   // satırlar kayar
  whoosh(T.tabloShuffle, 0.7, { type: 'bandpass', f0: 500, f1: 1600, q: 1, v: 0.22, p0: -0.3, p1: 0.3, am: 16, peak: 0.5 });
  for (let i = 0; i < 5; i++) ding(T.tabloShuffle + 0.8 + i * 0.09, 0.4, (i - 2) * 0.25, [1568, 1760, 1976, 2093, 2349][i]);                    // +3 çipleri
  // "Ama altı turun sadece biri bitti": 6 dilim belirir, 1. dilim dolar
  for (let i = 0; i < ROUNDS_TOTAL; i++) knock(C.alti + 0.05 + i * 0.06, 0.4, lerp(-0.6, 0.6, i / (ROUNDS_TOTAL - 1)));
  ding(C.biri + 0.05, 0.7, -0.5, 1046.5);

  // ===== 9) 2. TUR BAŞLADI — büyük vuruş + düdük =====
  whoosh(T.ikinci - 0.42, 0.42, { type: 'highpass', f0: 3000, f1: 300, q: 0.9, peak: 0.97, v: 0.5, tone: [300, 1400], toneV: 0.05 });
  { const t = T.ikinci; thud(t, 0.42, 0, 130, 38, 0.7); shock(t, 0.35, 0); stamp(t + 0.01, 0.3, 0); crowd(t + 0.03, 1.6, 0.75);
    whistle(t - 0.18, 0.1, 0.7, -0.15); whistle(t + 0.02, 0.32, 0.8, -0.15); ding(t + 0.12, 0.5, 0.3, 2093); pop(C.basladi + 0.4, 900, 0.5, 0.3); }   // 2. dilim yanar + pil "Takımını yaz…"

  // ===== 10) kural 1: %65 = GOL =====
  { const t = T.kural65; whoosh(t - 0.1, 0.22, { type: 'bandpass', f0: 2600, f1: 900, q: 1.4, p0: -0.9, p1: 0.4, v: 0.55, peak: 0.55 }); knock(t + 0.12, 0.8, 0); }
  whoosh(C.yuzde, C.gecerse - C.yuzde + 0.1, { type: 'lowpass', f0: 180, f1: 1400, q: 2.5, v: 0.4, peak: 0.9, tone: [70, 150], toneV: 0.09 });          // bar itilir
  ding(C.gecerse + 0.05, 0.55, 0.2, 1760); knock(C.gecerse + 0.05, 0.5, 0.2);                                                                     // %65 çizgisi geçilir
  { const t = C.golu; const g = out(sfx, 0.1), lp = filt('lowpass', 700, 1, g); perc(g, t, 0.4, 0.001, 0.08); noise(t, 0.1, lp); // top vuruşu
    whoosh(t, 0.3, { type: 'bandpass', f0: 900, f1: 3000, q: 2, p0: -0.2, p1: 0.6, v: 0.3 }); net(t + 0.3, 0.8, 0.5); crowd(t + 0.32, 0.9, 0.45); }

  // ===== 11) kural 2: Anadolu ×1,5 =====
  { const t = T.kuralAnadolu; whoosh(t - 0.14, 0.26, { type: 'bandpass', f0: 900, f1: 1800, q: 2, p0: 0.8, p1: -0.8, am: 14, v: 0.55, peak: 0.6 }); knock(t + 0.12, 0.8, 0); }
  [C.dort, C.karsi, C.anadolu, C.her].forEach((x, i) => flick(x + 0.05, 0.45, i % 2 ? 0.4 : -0.4));                                              // armalar döner
  for (let i = 0; i < 5; i++) pop(C.bir2 + 0.05 + i * 0.08, 900 + i * 90, 0.45, 0.45);                                                            // ×1,5 rozetleri
  whoosh(C.bucuk, 0.4, { type: 'bandpass', f0: 500, f1: 2000, q: 3, v: 0.25, peak: 0.85, p0: 0.2, p1: 0.5, tone: [400, 600], toneV: 0.03 });     // bar 1,5× büyür

  // ===== 12) kural 3: kişi başı 2 yorum =====
  { const t = T.kuralSpam; whoosh(t - 0.12, 0.24, { type: 'highpass', f0: 6000, f1: 1500, q: 1.2, p0: 0.9, p1: -0.2, v: 0.55, peak: 0.5 }); knock(t + 0.12, 0.8, 0); }
  { const a = C.on2, b = C.yazdi + 0.4; for (let i = 0; i < 11; i++) { const x = a + (b - a) * Math.pow(i / 10, 0.85); pop(x, 620 + i * 40, 0.4, 0.3); tick(x + 0.01, 2200 + i * 70, 0.22, -0.3); } } // 11 yorum + sayaç 1…11
  for (let i = 0; i < 9; i++) { const x = T.spamCut + 0.05 + i * 0.07; scratch(x, 0.09, 0.55, lerp(-0.4, 0.5, i / 8)); if (i % 3 === 2) whoosh(x, 0.18, { type: 'highpass', f0: 2000, f1: 6000, v: 0.18, p0: 0, p1: 0.8 }); } // 9'u çizilip uçar
  ding(C.ikisi + 0.25, 0.6, -0.2, 1318.5); ding(C.ikisi + 0.38, 0.6, -0.2, 1760);                                                              // 2 yeşil tik

  // ===== 13) BEĞENİ ŞARTI — spot düşer, kilit, kalp, kilit açılır =====
  { const t = T.begeni; whoosh(t - 0.2, 0.3, { type: 'lowpass', f0: 3000, f1: 200, q: 1.5, v: 0.5, peak: 0.3, fAt: 1 }); thud(t + 0.08, 0.55, 0, 110, 32, 0.9);  // her şey kararır
    const g = out(sfx, 0), bp = filt('bandpass', 1200, 0.6, g); perc(g, t + 0.1, 0.22, 0.002, 0.5); noise(t + 0.1, 0.5, bp, 0.5); }               // spot "klonk" yankısı
  lock(T.begeniLock + 0.02, 1, 0.05); stamp(C.sayilmasi + 0.03, 0.5, -0.1);                                                                    // kilit + SAYILMADI
  { const t = T.begeniUnlock; // çift dokunuş halkası → kalp patlar → kilit kırılır → açılış çanı
    [0, 0.11].forEach((d) => { const g = out(sfx, 0.2), bp = filt('bandpass', 2200, 1.4, g); perc(g, t + d, 0.3, 0.0005, 0.02); noise(t + d, 0.03, bp); });
    bloop(t + 0.14, 1.2, 0); sparkle(t + 0.2, 12, 0.45, 0.8, 0, 1.3); shock(t + 0.14, 0.35, 0);
    lock(t + 0.24, 0.7, 0); [1046.5, 1318.5, 1568, 2093].forEach((f, i) => ding(t + 0.3 + i * 0.07, 0.7, (i - 1.5) * 0.25, f)); }
  ding(C.sart + 0.05, 0.55, 0.4, 1568); ding(C.sart + 0.15, 0.55, 0.4, 2093);                                                                  // SAYILDI ✓
  for (let i = 0; i < 3; i++) tick(C.sart + 0.25 + i * 0.13, 1200, 0.18, 0.8);                                                                   // sağ kenara işaret eden ok (titreşim)

  // ===== 14) CTA: beğen → takip et → takımını yaz =====
  whoosh(T.cta - 0.05, 0.24, { type: 'bandpass', f0: 3000, f1: 700, q: 2, v: 0.45, fAt: 1, tone: [1500, 400], toneV: 0.04 });
  { const t = T.heart; bloop(t + 0.02, 1, 0); sparkle(t + 0.08, 10, 0.4, 0.75, 0, 1.2); for (let x = t + 0.15, i = 0; x < T.tap - 0.08; i++) { tick(x, 3000 + i * 60, 0.13, 0.5); x += 0.05; } }
  { const t = T.tap; const g = out(sfx, 0.2), bp = filt('bandpass', 2200, 1.4, g); perc(g, t, 0.35, 0.0005, 0.02); noise(t, 0.03, bp); knock(t, 0.4, 0.2); ding(t + 0.06, 0.9, 0.3, 1318.5); ding(t + 0.16, 0.75, 0.35, 1975.5); }
  { const t0 = T.pill + 0.06, t1 = C.yaz - 0.06; pop(T.pill, 700, 0.4, 0); for (let x = t0; x < t1; x += 0.07 + R() * 0.06) key(x, 0.65 + R() * 0.3, (R() - 0.5) * 0.3); }
  { const t = C.yaz + 0.03; pop(t, 980, 1, 0); whoosh(t + 0.02, 0.2, { type: 'highpass', f0: 1500, f1: 6000, q: 0.8, v: 0.28, p0: 0, p1: 0.4 }); ding(t + 0.1, 0.35, 0, 2093); }
  // "çünkü": her şey t=0 tablosuna oturur — ters "emme" (müzikte dolgu)
  whoosh(T.settle + 0.1, DUR - T.settle - 0.12, { type: 'bandpass', f0: 400, f1: 3000, q: 1.6, v: 0.3, peak: 0.95, p0: 0.4, p1: 0 });
  function mtofx(m) { return 440 * Math.pow(2, (m - 69) / 12); }
};

window.SES7.wav = (buf, N, PRE) => {
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
window.renderAudio = async () => { const S = window.SES7, A = S.kur(); S.muzik(A); S.fx(A); return S.wav(await A.ac.startRendering(), A.N, A.PRE); };
