/* 2. Tur — sahne 10: kural 1 (%65 = gol); sahne 11: kural 2 (Anadolu ×1,5); sahne 12: kural 3 (kişi başı 2 yorum) */
function sRule65(t) {
  bgNeutral(t, 0.9);
  chipT('KURAL 1', 540, 300, prog(t, T.kural65, T.kural65 + 0.2));
  // takımlar: armalar döner, "geçerse"de durur
  const k = Math.floor(Math.min(t, C.gecerse) / 0.42), L = IDS[(k * 5) % 18], R0 = IDS[(k * 7 + 3) % 18], R = R0 === L ? IDS[(k * 7 + 4) % 18] : R0;
  const ina = eBack(prog(t, T.kural65 + 0.05, T.kural65 + 0.35));
  sticker(L, 270, 660, 210 * ina); sticker(R, 810, 660, 210 * ina);
  txt('SENİN TAKIMIN', 270, 800, { size: 46, spacing: 2, stroke: 8, alpha: ina }); txt('RAKİBİN', 810, 800, { size: 46, spacing: 2, stroke: 8, alpha: ina, color: '#bbb' });
  vsBadge(540, 660, 0.7 * ina, t, ina);
  // %65
  const big = prog(t, C.yuzde, C.yuzde + 0.18), eq = prog(t, C.atar, C.atar + 0.16);
  if (eq <= 0) slamDuo('%65', 540, 470, 170, big, { color: GOLD });
  else slamDuo('%65 = GOL', 540, 470, 150, eq, { color: GOLD, max: 880 });
  // çubuk
  const push = eInOut(prog(t, C.gecerse - 0.1, C.gecerse + 0.45)), f = 0.5 + 0.22 * push + 0.015 * Math.sin(t * 9) * (1 - push);
  const x0 = 160, bw = 760, lx = x0 + bw * GOAL_SHARE, ld = eOut5(prog(t, C.altmis, C.altmis + 0.25)), over = f >= GOAL_SHARE;
  duelBar(540, 960, bw, f, CY, RD, { h: 60, alpha: ina });
  if (ld > 0) { ctx.save(); ctx.translate(0, -(1 - ld) * 300); ctx.globalAlpha = ld; ctx.fillStyle = over ? GOLD : '#fff'; ctx.shadowColor = over ? GOLD : '#fff'; ctx.shadowBlur = over ? 30 : 10; ctx.fillRect(lx - 5, 900, 10, 120); ctx.restore(); txt('%65', lx, 1060, { size: 44, stroke: 8, alpha: ld, color: over ? GOLD : '#fff' }); }
  ring(t, C.gecerse + 0.3, lx, 960, GOLD, 300, 14, 0.45);
  // kale + top
  const ga = prog(t, C.golu - 0.3, C.golu), bq = prog(t, C.golu, C.atar), bul = bell(t, C.atar, C.atar + 0.4);
  goalFrame(540, 1300, 380, 160, 40 * bul, ga);
  if (bq > 0) { const bx = lerp(x0 + bw * f, 540, eIn(bq)), by = lerp(960, 1225, eIn(bq)) - 120 * Math.sin(bq * Math.PI); emoji('⚽', bx, by, lerp(80, 60, bq), bq * 9); }
  sparks(t, C.atar, 540, 1230, [GOLD, '#fff', CY], 30, 1500, 1.1, 0.7);
  flash(t, C.atar, 0.5, 0.1);
}
const BIG4 = [['gs', 'samsun'], ['fb', 'kocaeli'], ['bjk', 'konya'], ['ts', 'eyup']];
function block(x, y, w, h, s, a, mult) {
  if (a <= 0 || s <= 0.01) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x + w / 2, y); ctx.scale(s, s);
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.4)'; ctx.shadowBlur = 12; rr(-w / 2 + 4, -h / 2, w - 8, h, 22); ctx.fillStyle = '#fbfbfd'; ctx.fill(); ctx.restore();
  ctx.fillStyle = '#fbfbfd'; ctx.beginPath(); ctx.moveTo(-w / 2 + 24, h / 2 - 2); ctx.lineTo(-w / 2 + 18, h / 2 + 18); ctx.lineTo(-w / 2 + 44, h / 2 - 2); ctx.fill();
  anon(-w / 2 + 40, 0, 46, '#8a8a98');
  ctx.fillStyle = '#d4d4dc'; rr(-w / 2 + 72, -12, Math.max(10, w - 104), 10, 5); ctx.fill(); rr(-w / 2 + 72, 6, Math.max(10, (w - 104) * 0.6), 9, 5); ctx.fill();
  if (mult > 0) tag('×1,5', w / 2 - 24, -h / 2 - 4, { size: 30, bg: GOLD, color: '#2a1a00', sc: eBack(mult, 2), a: clamp(mult * 3, 0, 1), pad: 14 });
  ctx.restore();
}
function sRuleAnadolu(t) {
  bgNeutral(t, 0.9);
  chipT('KURAL 2', 540, 300, 1);
  const u = Math.max(0, t - T.kuralAnadolu - 0.1) / 1.05, pk = Math.floor(u) % 4, sx = u < 0.5 ? 1 : Math.max(0.05, 1 - Math.pow(1 - clamp((u % 1) / 0.12, 0, 1), 2));
  const [b4, an] = BIG4[pk], hiA = prog(t, C.anadolu - 0.05, C.anadolu + 0.15);
  const ina = eBack(prog(t, T.kuralAnadolu + 0.02, T.kuralAnadolu + 0.32));
  txt('4 BÜYÜK', 270, 430, { size: 54, spacing: 3, stroke: 8, alpha: prog(t, C.dort, C.dort + 0.15) });
  txt('ANADOLU', 810, 430, { size: 54, spacing: 3, stroke: 8, color: GOLD, alpha: hiA });
  sticker(b4, 270, 600, 220 * ina, { sx }); sticker(an, 810, 600, 220 * ina * (1 + 0.12 * hiA), { sx });
  if (hiA > 0) ring(t, C.anadolu, 810, 600, GOLD, 360, 14, 0.5);
  vsBadge(540, 600, 0.62 * ina, t, ina);
  // satırlar: 3'er yorum, Anadolu'nun her biri ×1,5 büyür
  const rows = [[b4, 850, C.karsi, 0], [an, 1010, C.takiminin, 1]];
  for (const [id, y, t0, isA] of rows) {
    const ra = prog(t, t0 - 0.1, t0 + 0.1); if (ra <= 0) continue;
    sticker(id, 130, y, 96 * eBack(ra), { sx });
    const grow = isA ? eInOut(prog(t, C.bucuk - 0.1, C.bucuk + 0.3)) : 0, bw = 150 * lerp(1, ANADOLU_MULT, grow);
    for (let k = 0; k < 3; k++) {
      const bp = prog(t, t0 + k * 0.1, t0 + k * 0.1 + 0.18), mult = isA ? prog(t, C.her + k * 0.12, C.her + k * 0.12 + 0.15) : 0;
      block(190 + k * bw, y, bw, 84, eBack(bp), clamp(bp * 3, 0, 1), mult);
    }
    const ex = 190 + 3 * bw + 20;
    txt(isA ? '×1,5' : '×1', ex, y, { size: 54, align: 'left', color: isA ? GOLD : '#ccc', stroke: 8, alpha: isA ? prog(t, C.bucuk, C.bucuk + 0.2) : prog(t, t0 + 0.3, t0 + 0.5) });
  }
  slamDuo('ANADOLU ×1,5', 540, 1220, 130, prog(t, C.bucuk + 0.02, C.bucuk + 0.18), { color: GOLD, max: 860 });
  sparks(t, C.bucuk + 0.1, 540, 1220, [GOLD, '#fff'], 30, 1600, 1.2, 0.7);
  flash(t, C.bucuk + 0.02, 0.4, 0.1);
}
// ---------- kural 3: bir kişi 11 kez yazar ----------
const SPAM_N = 11;
const spIn = (k) => C.bir3 + 0.05 + k * ((C.yazdi + 0.25 - C.bir3) / SPAM_N);
const PHN = { x0: 140, y0: 360, w: 620, h: 990 };
function sRuleSpam(t) {
  bgNeutral(t, 0.9);
  chipT('KURAL 3', 450, 290, 1, 0.85);
  const { x0, y0, w, h } = PHN, cx = x0 + w / 2;
  const pin = eOut5(prog(t, T.kuralSpam, T.kuralSpam + 0.35));
  ctx.save(); ctx.translate(0, (1 - pin) * 300); ctx.globalAlpha = clamp(pin * 2, 0, 1);
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.7)'; ctx.shadowBlur = 50; rr(x0 - 16, y0 - 16, w + 32, h + 32, 56); ctx.fillStyle = '#050507'; ctx.fill(); ctx.restore();
  rr(x0 - 16, y0 - 16, w + 32, h + 32, 56); ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.stroke();
  ctx.save(); rr(x0, y0, w, h, 42); ctx.clip(); ctx.fillStyle = '#15151d'; ctx.fillRect(x0, y0, w, h);
  txt('Yorumlar', cx, y0 + 50, { size: 40, weight: 800, color: '#ddd' }); ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(x0, y0 + 88, w, 2);
  for (let k = 0; k < SPAM_N; k++) {
    const dt = t - spIn(k); if (dt < 0) continue;
    const j = k - 2, strike = j >= 0 ? eOut(prog(t, C.sadece2 + j * 0.04, C.sadece2 + j * 0.04 + 0.15)) : 0, fly = j >= 0 ? eIn(prog(t, C.ikisi + j * 0.035, C.ikisi + j * 0.035 + 0.35)) : 0;
    const y = y0 + 130 + k * 76, x = x0 + (fly * 900), a = clamp(dt * 8, 0, 1) * (1 - fly), pop = eBack(prog(dt, 0, 0.15));
    if (a <= 0) continue;
    ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.rotate(fly * 0.4); ctx.translate(0, (1 - pop) * 30);
    if (strike > 0) { ctx.fillStyle = hexA(RD, 0.16 * strike); ctx.fillRect(10, -34, w - 20, 68); }
    anon(56, 0, 52, '#6a6a78');
    ctx.fillStyle = 'rgba(255,255,255,.22)'; rr(96, -26, 120, 12, 6); ctx.fill(); // ad gizli
    txt('Beşiktaş', 96, 10, { size: 40, weight: 800, color: strike > 0 ? '#999' : '#fff', align: 'left' });
    txt(`#${k + 1}`, w - 40, 0, { size: 30, weight: 800, color: '#777', align: 'right' });
    if (strike > 0) { ctx.fillStyle = RD; ctx.fillRect(90, 6, 190 * strike, 7); }
    const ok = k < MAX_PER_USER ? prog(t, C.sayildi - 0.05, C.sayildi + 0.15) : 0;
    if (ok > 0) { ctx.beginPath(); ctx.arc(w - 120, 0, 26 * eBack(ok, 2), 0, TAU); ctx.fillStyle = '#1fbf6a'; ctx.fill(); check(w - 120, 0, 0.75 * eBack(ok, 2), '#fff'); }
    ctx.restore();
  }
  ctx.restore();
  ctx.restore();
  // sayaç: ×N (aynı kişi)
  let n = 0; for (let k = 0; k < SPAM_N; k++) if (t >= spIn(k)) n++;
  const okc = t >= C.sayildi, bump = n > 0 ? bell(t, spIn(n - 1), spIn(n - 1) + 0.12) : 0, ca = prog(t, spIn(0) - 0.1, spIn(0) + 0.1);
  if (ca > 0) {
    ctx.save(); ctx.translate(850, 560); const s = (1 + 0.15 * bump + 0.2 * bell(t, C.sayildi, C.sayildi + 0.3)) * eBack(ca); ctx.scale(s, s);
    ctx.beginPath(); ctx.arc(0, 0, 82, 0, TAU); ctx.fillStyle = okc ? '#1fbf6a' : RD; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = '#fff'; ctx.stroke();
    txt(okc ? `${MAX_PER_USER} ✓` : `×${n}`, 0, 0, { size: 78, color: '#fff' });
    ctx.restore();
    anon(850, 700, 70, '#6a6a78', ca); txt('AYNI KİŞİ', 850, 770, { size: 32, spacing: 2, stroke: 6, alpha: ca });
  }
  // kural bandı
  const ba = prog(t, C.herkesin - 0.05, C.herkesin + 0.15);
  if (ba > 0) { ctx.save(); ctx.translate(540, 1040); ctx.rotate(-0.04); const s = lerp(1.6, 1, eOut5(ba)); ctx.scale(s, s); ctx.globalAlpha = clamp(ba * 3, 0, 1);
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 24; ctx.fillStyle = GOLD; ctx.fillRect(-640, -64, 1280, 128); ctx.restore();
    txt(`KİŞİ BAŞI ${MAX_PER_USER} YORUM`, 0, 0, { size: 92, color: '#1a1200', spacing: 3 }); ctx.restore(); }
  flash(t, C.sadece2, 0.25, 0.08); flash(t, C.herkesin, 0.3, 0.08);
}
