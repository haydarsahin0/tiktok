'use strict';
/* Video 5 — sahne efektleri (kurgudaki her geçiş ve vuruşun sesi). */
function sesFx(A) {
  const { ac, sfx, T0, mtof, vca, env, hold, osc, noise, filt, lfo, roar, hey } = A;
  const whoosh = (t, dur = 0.35, v = 1, up = true, pan = 0) => { t = T0(t); const g = vca(sfx, pan), f = filt('bandpass', 400, 1.4); f.connect(g); f.frequency.setValueAtTime(up ? 250 : 3600, t); f.frequency.exponentialRampToValueAtTime(up ? 3600 : 250, t + dur); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.9 * v, t + dur * 0.55); g.gain.linearRampToValueAtTime(0.0001, t + dur); noise(t, dur + 0.02, f); };
  const boom = (t, v = 1) => { const g = vca(sfx); env(g, t, 0.85 * v, 0.004, 0.7); const o = osc('sine', 120, t, t + 0.8, g); o.frequency.exponentialRampToValueAtTime(36, T0(t) + 0.5); const g2 = vca(sfx), f = filt('lowpass', 1800); f.connect(g2); env(g2, t, 0.8 * v, 0.003, 0.22); noise(t, 0.3, f); };
  const hit = (t, v = 1) => { boom(t, 0.5 * v); const g = vca(sfx), f = filt('highpass', 2400); f.connect(g); env(g, t, 0.45 * v, 0.002, 0.1); noise(t, 0.13, f); };
  const pop = (t, hz = 700, v = 1, pan = 0) => { const g = vca(sfx, pan); env(g, t, 0.22 * v, 0.003, 0.1); const o = osc('sine', hz * 0.6, t, t + 0.14, g); o.frequency.exponentialRampToValueAtTime(hz * 1.4, T0(t) + 0.07); };
  const blip = (t, hz, v = 1, d = 0.06, pan = 0) => { const g = vca(sfx, pan), f = filt('lowpass', 3200); f.connect(g); env(g, t, 0.07 * v, 0.002, d); osc('square', hz, t, t + d + 0.04, f); };
  const ping = (t, hz, v = 1, pan = 0) => { const g = vca(sfx, pan); env(g, t, 0.1 * v, 0.003, 0.4); osc('sine', hz, t, t + 0.45, g); const g2 = vca(sfx, pan); env(g2, t, 0.04 * v, 0.002, 0.18); osc('sine', hz * 2.76, t, t + 0.22, g2); };
  const key = (t, v = 1) => { const g = vca(sfx), f = filt('bandpass', 2600, 2.5); f.connect(g); env(g, t, 1.2 * v, 0.001, 0.025); noise(t, 0.04, f); const g2 = vca(sfx); env(g2, t, 0.1 * v, 0.001, 0.04); osc('sine', 420, t, t + 0.06, g2); };
  const riser = (t, dur, v = 1) => { t = T0(t); const g = vca(sfx), f = filt('bandpass', 500, 2); f.connect(g); f.frequency.setValueAtTime(350, t); f.frequency.exponentialRampToValueAtTime(5200, t + dur); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.7 * v, t + dur); g.gain.linearRampToValueAtTime(0.0001, t + dur + 0.03); noise(t, dur + 0.03, f);
    const g2 = vca(sfx), f2 = filt('lowpass', 2600); f2.connect(g2); g2.gain.setValueAtTime(0.0001, t); g2.gain.linearRampToValueAtTime(0.05 * v, t + dur); g2.gain.linearRampToValueAtTime(0.0001, t + dur + 0.03); const o = osc('sawtooth', 180, t, t + dur + 0.03, f2); o.frequency.exponentialRampToValueAtTime(1400, t + dur); };
  const tapeStop = (t, dur = 0.35, v = 1) => { t = T0(t); const g = vca(sfx), f = filt('lowpass', 1600); f.connect(g); f.frequency.setValueAtTime(1600, t); f.frequency.exponentialRampToValueAtTime(110, t + dur); g.gain.setValueAtTime(0.16 * v, t); g.gain.linearRampToValueAtTime(0.0001, t + dur); const o = osc('sawtooth', 520, t, t + dur, f); o.frequency.exponentialRampToValueAtTime(36, t + dur); };
  const zap = (t, v = 1) => { t = T0(t); const g = vca(sfx), f = filt('highpass', 6000); f.connect(g); f.frequency.setValueAtTime(7000, t); f.frequency.exponentialRampToValueAtTime(900, t + 0.16); env(g, t, 0.9 * v, 0.004, 0.16); noise(t, 0.2, f); const g2 = vca(sfx); env(g2, t, 0.07 * v, 0.003, 0.14); const o = osc('square', 1900, t, t + 0.18, g2); o.frequency.exponentialRampToValueAtTime(160, t + 0.15); };
  const buzz = (t, dur = 0.22, v = 1) => { const g = vca(sfx), f = filt('lowpass', 900); f.connect(g); hold(g, t, 0.09 * v, 0.01, dur, 0.04); osc('square', 104, t, t + dur + 0.02, f); osc('square', 110, t, t + dur + 0.02, f); };
  const fall = (t, dur, v = 1) => { t = T0(t); const g = vca(sfx); hold(g, t, 0.08 * v, 0.04, dur, 0.05); const o = osc('sine', 2300, t, t + dur + 0.02, g); o.frequency.exponentialRampToValueAtTime(420, t + dur); lfo(18, 30, o.frequency, t, dur); };
  const slide = (t, dur, f0, f1, v = 1) => { t = T0(t); const g = vca(sfx); hold(g, t, 0.08 * v, 0.02, dur, 0.06); const o = osc('triangle', f0, t, t + dur + 0.02, g); o.frequency.exponentialRampToValueAtTime(f1, t + dur); };
  const airhorn = (t, dur, v = 1) => { t = T0(t); const g = vca(sfx), f = filt('lowpass', 2400, 2); f.connect(g); hold(g, t, 0.05 * v, 0.03, dur, 0.1); [233.1, 311.1, 466.2].forEach((hz) => { const o = osc('sawtooth', hz * 0.94, t, t + dur + 0.02, f); o.frequency.linearRampToValueAtTime(hz, t + 0.05); o.frequency.setValueAtTime(hz, t + dur - 0.12); o.frequency.linearRampToValueAtTime(hz * 0.9, t + dur); osc('square', hz * 1.01, t, t + dur + 0.02, f); }); };
  const whistle = (t, dur, v = 1) => { t = T0(t); const g = vca(sfx, 0.2); hold(g, t, 0.07 * v, 0.02, dur, 0.05); const tr = ac.createGain(); tr.gain.value = 0.6; tr.connect(g); lfo(32, 0.4, tr.gain, t, dur + 0.05); osc('sine', 2850, t, t + dur + 0.02, tr); osc('sine', 3010, t, t + dur + 0.02, tr); };
  const fanfare = (t, notes, gp, last, v = 1) => notes.forEach((m, i) => { const tt = T0(t + i * gp), len = i === notes.length - 1 ? last : gp * 0.92; const g = vca(sfx), f = filt('lowpass', 1500, 1); f.connect(g); f.frequency.setValueAtTime(700, tt); f.frequency.linearRampToValueAtTime(2600, tt + 0.05); hold(g, tt, 0.07 * v, 0.02, len, len * 0.3); osc('sawtooth', mtof(m), tt, tt + len + 0.02, f); osc('sawtooth', mtof(m) * 1.007, tt, tt + len + 0.02, f); osc('sawtooth', mtof(m + 7) * 0.997, tt, tt + len + 0.02, f); });
  const R = rng(21);

  // 1) kanca: saat + "geride" damgası
  boom(0.02, 0.7); hit(C.geride, 0.9); buzz(C.geride + 0.02, 0.3, 0.8);
  // 2) telefonun içine dalış (sonsuz zoom)
  whoosh(T2 - 0.15, 0.6, 0.6, true); slide(T2, C.tek - T2, 90, 360, 0.5);
  hit(C.tek, 0.7); hit(C.kisi, 0.8); riser(C.su - 0.05, C.izliyor + 0.3 - C.su, 0.7);
  boom(C.izliyor + 0.3, 1.2); ping(C.izliyor + 0.34, 1318, 0.9); ping(C.izliyor + 0.4, 1976, 0.7);
  // 3) yorum yazma
  whoosh(T3 - 0.17, 0.34, 0.7, true);
  for (let x = T3 - 0.1, i = 0; x < SEND - 0.05; x += 0.24, i++) pop(x, 520 + (i % 4) * 90, 0.45, i % 2 ? 0.4 : -0.4);
  key(C.takimini, 1); key(C.takimini + 0.22, 1); key(SEND - 0.04, 1.2);
  whoosh(SEND, 0.22, 0.5, true); pop(SEND + 0.02, 900, 1.1); ping(SEND + 0.12, 1568, 0.8); ping(SEND + 0.2, 2093, 0.7);
  // 4) forma sahaya düşüyor
  whoosh(T4 - 0.15, 0.3, 0.8, false); fall(FALL0, LAND - FALL0, 0.9);
  boom(LAND, 0.85); hit(LAND, 0.5); roar(LAND, 1.1, 0.3);
  ping(C.sensin, 1175, 0.9); ping(C.sensin + 0.07, 1760, 0.8); ping(C.sensin + 0.14, 2349, 0.6);
  // 5) bar doluyor: yüzdeyle tizleşen sayaç
  whoosh(T5 - 0.18, 0.36, 0.8, true);
  for (let x = T5 + 0.1; x < C.bes; x += 0.11) { const p = pctAt(x); blip(x, 300 + (p - 46) * 34, 0.8, 0.05, (p - 55) / 20); }
  hit(C.altmis, 0.5); hit(C.uc + 0.05, 0.6);
  hit(C.durma, 0.9); buzz(C.durma + 0.3, 0.25, 0.6); hit(C.yaz, 0.7);
  riser(C.yaz + 0.25, T6 - C.yaz - 0.3, 1);
  ping(C.bes + 0.05, 1568, 1.2); ping(C.bes + 0.05, 2349, 1); whoosh(T6 - 0.3, 0.28, 0.7, true);
  // 6) GOL
  boom(T6, 1.25); roar(T6, 2.2, 1.1); airhorn(T6 + 0.03, 0.55, 1); whistle(T6 + 0.08, 0.5, 0.8);
  tapeStop(C.ama - 0.03, 0.4, 1.3); hit(FRZ, 0.6); whoosh(T7 - 0.42, 0.42, 0.7, true);
  // 7) aynı anda sekiz maç
  for (let i = 0; i < 9; i++) pop(T7 + 0.05 + i * 0.05, 440 + i * 45, 0.5, (i - 4) / 6);
  SCAN_ORDER.forEach((_, i) => { const x = lerp(SCAN0, SCAN1, i / SCAN_ORDER.length); blip(x, 880 + i * 70, 1, 0.05, i % 2 ? 0.5 : -0.5); });
  whoosh(C.ve2 - 0.1, 0.4, 0.6, false); slide(C.ve2, FBGOAL - C.ve2, 140, 420, 0.9);
  boom(FBGOAL, 0.9); roar(FBGOAL, 1.3, 0.55, true); fanfare(FBGOAL + 0.04, [63, 62], 0.14, 0.36, 0.9);
  // 8) canlı puan tablosu
  whoosh(T8 - 0.14, 0.28, 0.8, true, -0.4);
  blip(FBPTS, 988, 1.1, 0.07); blip(FBPTS + 0.14, 1175, 1.1, 0.07);
  slide(FBUP0, FBUP1 - FBUP0, 420, 1250, 1); pop(FBUP1, 760, 0.9); blip(FBUP1 + 0.05, 520, 0.9, 0.07); blip(FBUP1 + 0.16, 440, 0.9, 0.07);
  hit(C.degisiyor, 0.9); blip(C.degisiyor + 0.04, 740, 1.2, 0.09); blip(C.degisiyor + 0.18, 554, 1.2, 0.12);
  // 9) kaptan
  whoosh(T9 - 0.15, 0.3, 0.8, true);
  for (let x = T9 + 0.25, i = 0; x < C.mi; x += 0.075, i++) pop(x, 500 + i * 42, 0.5, R() - 0.5);
  ping(C.mi, 2093, 0.9); ping(C.mi + 0.06, 2637, 0.8);
  boom(CAP, 0.95); fanfare(CAP + 0.02, [62, 65, 69, 74], 0.085, 0.42, 0.9); roar(CAP, 1.5, 0.45);
  whoosh(WALL0 - 0.05, 0.6, 0.7, false);
  for (let i = 0; i < 26; i++) { const x = C.adi + 0.28 + (i / 26) * (WALL1 + 0.5 - C.adi - 0.28) + R() * 0.03; ping(x, [1568, 1760, 2093, 2349, 2637][i % 5] * (i > 12 ? 1.5 : 1), 0.4, R() * 1.6 - 0.8); }
  hit(C.ekraninda, 0.8);
  // 10) kelimeler
  zap(T10 - 0.1, 0.5); whoosh(C.burada - 0.08, 0.22, 0.5, true, -0.6); whoosh(C.skoru - 0.08, 0.22, 0.5, true, 0.6);
  hit(C.futbolcu, 0.9); zap(C.degil, 1); buzz(C.degil + 0.04, 0.22, 0.9);
  boom(C.taraftar, 1.0); roar(C.taraftar, 1.4, 0.45); hey(C.taraftar + 0.02, 0.7, 0.3);
  for (let i = 0; i < 8; i++) key(C.yaziyor - 0.02 + i * 0.05, 0.8);
  // 11) her akşam canlı yayında
  whoosh(T11 - 0.16, 0.32, 0.8, true); hit(C.her, 0.7); hit(C.aksam, 0.8);
  pop(C.canli, 880, 1); ping(C.canli + 0.05, 1760, 0.8); ping(C.canli + 0.17, 1760, 0.8);
  for (let i = 0; i < 7; i++) pop(T11 + 0.25 + i * 0.22, 900 + (i % 3) * 160, 0.3, 0.6);
  // 12) başa sarma: ileri sarma cırcırı yavaşlayıp saatin tıkına oturur
  whoosh(T12 - 0.2, 0.4, 0.8, false); tapeStop(T12, 0.5, 0.9);
  { let x = T12 + 0.08, gap = 0.028, i = 0; while (x < FF_END - 0.05) { const p = prog(x, T12, FF_END); blip(x, lerp(2400, 700, p), 0.9 * (1 - 0.5 * p), 0.02, i % 2 ? 0.3 : -0.3); gap *= 1.07; x += gap; i++; } }
  { const t = T12 + 0.05, d = FF_END - t, g = vca(sfx), f = filt('bandpass', 2500, 1.4); f.connect(g); f.frequency.setValueAtTime(4200, t); f.frequency.exponentialRampToValueAtTime(380, t + d); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.35, t + 0.2); g.gain.linearRampToValueAtTime(0.0001, t + d); noise(t, d, f); }
}
