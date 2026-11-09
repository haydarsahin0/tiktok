/* Sahne 4-6: sahaya düşen forma, dolan bar, gol + "ama sevinme". */

// ---------- 4) saha (kuş bakışı) ----------
const SPOT = { x: 540, y: 880 }, FALL0 = C.forma - 0.12, LAND = C.dusuyor + 0.3;
const SQUAD = [[230, 600, 0], [840, 540, 0], [270, 1180, 0], [820, 1210, 0], [540, 470, 1], [170, 900, 1], [910, 880, 1]];
function pitchTop(t) {
  for (let i = 0; i < 12; i++) { ctx.fillStyle = i % 2 ? '#14602f' : '#187038'; ctx.fillRect(-200, i * 170 - 60, W + 400, 170); }
  ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = 9;
  ctx.beginPath(); ctx.moveTo(-200, 800); ctx.lineTo(W + 200, 800); ctx.stroke();
  ctx.beginPath(); ctx.arc(540, 800, 290, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(540, 800, 14, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill();
  ctx.strokeRect(190, -40, 700, 250); ctx.strokeRect(190, 1640, 700, 300);
  // projektör ışığı
  radial(540, 800, 1300, 'rgba(255,255,220,.13)');
}
function sPitch(t) {
  const crash = eOut5(prog(t, C.sensin - 0.04, C.sensin + 0.22));
  const z = 1 + 0.07 * prog(t, T4, C.sensin) + 0.62 * crash + 0.05 * prog(t, C.sensin + 0.22, T5 + 0.2);
  const landed = t >= LAND, since = t - LAND;
  ctx.fillStyle = '#0d3b24'; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.translate(SPOT.x, SPOT.y - 40 * crash); ctx.scale(z, z); ctx.translate(-SPOT.x, -SPOT.y);
  pitchTop(t);
  // diğer taraftarlar
  SQUAD.forEach(([x, y, side], i) => {
    const c = side ? RIVAL.c : HERO.c;
    const hop = landed ? Math.max(0, Math.sin(clamp((since - Math.hypot(x - SPOT.x, y - SPOT.y) / 2600) * 9, 0, Math.PI))) * 38 : 0;
    const bob = Math.sin(t * 3 + i * 1.7) * 6;
    ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(x, y + 140, 62, 18, 0, 0, Math.PI * 2); ctx.fill();
    jersey(c, x, y - hop + bob, 130, side ? RIVAL.code : HERO.code, { text: side ? '#b0122e' : '#fff' });
  });
  // düşen forma
  if (t >= FALL0) {
    const p = prog(t, FALL0, LAND), e = p * p;
    const sh = lerp(0.12, 0.5, e);
    ctx.fillStyle = `rgba(0,0,0,${sh})`; ctx.beginPath(); ctx.ellipse(SPOT.x, SPOT.y + 150, lerp(420, 130, e), lerp(120, 34, e), 0, 0, Math.PI * 2); ctx.fill();
    if (landed) {
      ring(t, LAND, SPOT.x, SPOT.y + 100, '#fff', 620, 30, 0.55); ring(t, LAND + 0.08, SPOT.x, SPOT.y + 100, LIME, 420, 18, 0.5);
      // toz
      const r = rng(9);
      for (let i = 0; i < 22; i++) { const a = r() * 6.28, d = eOut(clamp(since / 0.5, 0, 1)) * (160 + r() * 240), al = clamp(1 - since / 0.6, 0, 1) * 0.5; if (al <= 0) continue; ctx.fillStyle = `rgba(230,255,220,${al})`; ctx.beginPath(); ctx.arc(SPOT.x + Math.cos(a) * d, SPOT.y + 130 + Math.sin(a) * d * 0.35, 10 + r() * 20, 0, Math.PI * 2); ctx.fill(); }
    }
    const sc = landed ? 1 : lerp(7.5, 1, e);
    const sq = landed ? 1 - 0.22 * Math.exp(-since * 9) * Math.cos(since * 26) : 1;
    ctx.save(); ctx.translate(SPOT.x, SPOT.y + 140); ctx.rotate(landed ? 0 : (1 - e) * 0.9); ctx.scale(sc / sq, sc * sq); ctx.globalAlpha = clamp(p * 5, 0, 1);
    const glow = prog(t, C.o, C.o + 0.3);
    if (glow > 0) { ctx.shadowColor = LIME; ctx.shadowBlur = 60 * glow; }
    jersey(HERO.c, 0, -300, 300, 'SEN', { line: glow > 0.5 ? LIME : 'rgba(255,255,255,.92)' });
    ctx.restore();
    // hız çizgileri
    if (!landed) { ctx.strokeStyle = `rgba(255,255,255,${0.5 * (1 - p)})`; ctx.lineWidth = 6; const r = rng(4); for (let i = 0; i < 14; i++) { const a = r() * 6.28, d0 = 260 + r() * 300; ctx.beginPath(); ctx.moveTo(SPOT.x + Math.cos(a) * d0, SPOT.y + Math.sin(a) * d0); ctx.lineTo(SPOT.x + Math.cos(a) * (d0 + 260 * (1 - p)), SPOT.y + Math.sin(a) * (d0 + 260 * (1 - p))); ctx.stroke(); } }
  }
  ctx.restore();
  // spot: sen hariç her şey kararır
  if (t >= C.o - 0.05) {
    const k = prog(t, C.o - 0.05, C.forma2 + 0.2);
    const cy = SPOT.y - 40 * crash - 10;
    const g = ctx.createRadialGradient(SPOT.x, cy, 190 * z, SPOT.x, cy, 620 * z); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(2,6,12,${0.8 * k})`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }
  if (t >= C.sensin - 0.02) {
    const p = prog(t, C.sensin - 0.02, C.sensin + 0.2);
    ctx.save(); ctx.translate(540, 420); const sc = lerp(2.6, 1, eBack(p, 1.4)); ctx.scale(sc, sc); ctx.rotate(-0.045); ctx.globalAlpha = clamp(p * 4, 0, 1);
    tag('ARTIK SAHADASIN', 0, 0, { size: 112, bg: LIME, color: '#0a0f12' }); ctx.restore();
  }
}

// ---------- 5) bar doluyor ----------
const PCT_K = [[T5 - 0.3, 46], [C.altmis - 0.02, 58.8], [C.altmis + 0.14, 60.2], [C.altmis2, 60.9], [C.uc + 0.06, 63.1], [C.uc + 0.3, 63.5], [C.durma + 0.1, 62.3], [C.yaz, 61.6], [C.yaz + 0.3, 62.6],
  [C.altmis3, 63.7], [C.bes - 0.05, 64.6], [C.bes + 0.07, 65.05], [T6 + 0.5, 65.6]];
function pctAt(t) {
  if (t <= PCT_K[0][0]) return PCT_K[0][1];
  for (let i = 1; i < PCT_K.length; i++) if (t < PCT_K[i][0]) return lerp(PCT_K[i - 1][1], PCT_K[i][1], smooth(prog(t, PCT_K[i - 1][0], PCT_K[i][0])));
  return PCT_K[PCT_K.length - 1][1];
}
const BARX = (p) => 840 - (65 - p) * 42;
const STORM = ['GS', 'GS 💛❤️', 'GALATASARAY', 'gs', 'CİMBOM', 'GS GS GS', 'Gs', 'ASLAN 🦁', 'GS!!', 'galatasaray'];
function sBar(t) {
  const pct = pctAt(t), fx = BARX(pct);
  const stall = bell(t, C.uc + 0.3, C.yaz + 0.25), hit = t >= C.bes + 0.05, sinceHit = t - (C.bes + 0.05);
  const urge = prog(t, C.durma - 0.05, C.durma + 0.1) * (1 - prog(t, C.altmis3 - 0.1, C.altmis3 + 0.1));
  // sağ: rakip tarafı
  bgGrad('#0a0f1e', '#111a33', '#0a0f1e');
  ctx.save(); ctx.globalAlpha = 0.06; txt('RAKİP', 900, 1500, { size: 300, italic: true }); ctx.restore();
  // sol: takımının rengi dolar
  const edge = (y) => fx + Math.sin(y / 120 + t * 5) * 16 + Math.sin(y / 53 - t * 8) * 8 + stall * Math.sin(y / 31 + t * 40) * 9;
  ctx.save(); ctx.beginPath(); ctx.moveTo(0, 0); for (let y = 0; y <= H; y += 24) ctx.lineTo(edge(y), y); ctx.lineTo(0, H); ctx.closePath(); ctx.clip();
  const g = ctx.createLinearGradient(0, 0, fx, 0); g.addColorStop(0, '#5e0220'); g.addColorStop(0.7, '#c00a3c'); g.addColorStop(1, '#ff2f5f'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // akan çapraz şeritler
  ctx.fillStyle = 'rgba(253,185,18,.16)'; const off = (t * 420) % 240;
  for (let x = -H; x < W; x += 240) { ctx.beginPath(); ctx.moveTo(x + off, H); ctx.lineTo(x + off + 90, H); ctx.lineTo(x + off + 90 + H * 0.5, 0); ctx.lineTo(x + off + H * 0.5, 0); ctx.fill(); }
  // yorum balonları öne doğru akar
  const r = rng(31), storm = prog(t, C.yaz - 0.1, C.yaz + 0.1);
  const N = 26;
  for (let i = 0; i < N; i++) {
    const lane = 380 + r() * 900, sp = 0.55 + r() * 0.5, ph = r(), late = i >= 10;
    if (late && storm <= 0) { continue; }
    const q = ((t * sp + ph) % 1), x = lerp(-260, fx - 40, eIn(q) * 0.4 + q * 0.6), a = clamp(q * 5, 0, 1) * clamp((1 - q) * 6, 0, 1) * (late ? storm : 1);
    const s = STORM[i % STORM.length], sz = 44 + r() * 30, w = tw(s, sz, 900) + 50;
    ctx.save(); ctx.globalAlpha = a * 0.95; rr(x - w, lane - sz * 0.7, w, sz * 1.4, sz * 0.7); ctx.fillStyle = 'rgba(8,10,20,.55)'; ctx.fill();
    txt(s, x - w / 2, lane, { size: sz, color: '#fff' }); ctx.restore();
  }
  ctx.restore();
  // ön kenar ışığı
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = 'rgba(255,220,160,.9)'; ctx.lineWidth = 10; ctx.shadowColor = '#ffb347'; ctx.shadowBlur = 50;
  ctx.beginPath(); for (let y = 0; y <= H; y += 24) (y ? ctx.lineTo : ctx.moveTo).call(ctx, edge(y), y); ctx.stroke();
  const r2 = rng(frameSeed(t) * 5 + 2);
  for (let i = 0; i < 26; i++) { const y = r2() * H; ctx.fillStyle = `rgba(255,230,170,${0.3 + r2() * 0.6})`; ctx.beginPath(); ctx.arc(edge(y) + 10 + r2() * 70, y, 3 + r2() * 7, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
  // gol çizgisi
  const gx = BARX(65), lp = 0.6 + 0.4 * Math.sin(t * 10);
  ctx.save(); ctx.strokeStyle = hit ? '#fff' : YEL; ctx.lineWidth = hit ? 16 : 9; ctx.setLineDash(hit ? [] : [44, 26]); ctx.lineDashOffset = -t * 120; ctx.shadowColor = YEL; ctx.shadowBlur = 30 + 30 * lp;
  ctx.beginPath(); ctx.moveTo(gx, 330); ctx.lineTo(gx, 1560); ctx.stroke(); ctx.restore();
  ctx.save(); ctx.translate(gx + 62, 1010); ctx.rotate(Math.PI / 2); tag('GOL ÇİZGİSİ %65', 0, 0, { size: 64, bg: YEL, color: '#0a0f12', skew: 0 }); ctx.restore();
  if (hit) { ring(t, C.bes + 0.05, gx, 760, '#fff', 1300, 50, 0.6); ctx.fillStyle = `rgba(255,255,255,${0.7 * clamp(1 - sinceHit / 0.3, 0, 1)})`; ctx.fillRect(0, 0, W, H); }
  // rakip bastırıyor
  if (stall > 0.02) {
    for (let i = 0; i < 3; i++) { const q = ((t * 1.8 + i / 3) % 1); txt('◀', lerp(1040, fx + 80, q), 560 + i * 250, { size: 110, color: '#8fb0ff', alpha: stall * Math.sin(q * Math.PI) * 0.8 }); }
  }
  // dev yüzde
  const n = Math.floor(pct), tick = pct - n;
  const pop = 1 + 0.12 * Math.exp(-tick * 14) + (hit ? 0.25 * Math.exp(-sinceHit * 6) : 0);
  ctx.save(); ctx.translate(500, 610); ctx.scale(pop, pop); ctx.rotate(-0.03);
  txt('%' + n, 0, 0, { size: 400, italic: true, color: hit ? YEL : '#fff', stroke: 28, strokeColor: '#05070c', glow: hit ? 70 : 0, glowColor: YEL });
  ctx.restore();
  const left = 65 - n;
  if (!hit) tag(left > 0 ? `GOLE ${left} KALDI` : 'GOL GELİYOR', 500, 850, { size: 84, bg: stall > 0.3 ? RED : '#0a0f12', color: '#fff' });
  // "DURMA, YAZ!"
  if (urge > 0) {
    const p = prog(t, C.durma - 0.05, C.durma + 0.14), sh = rng(frameSeed(t) + 3);
    ctx.save(); ctx.translate(540 + (sh() - 0.5) * 16, 1130 + (sh() - 0.5) * 16); ctx.rotate(-0.06); const sc = lerp(3, 1, eBack(p, 1.3)) * (1 + 0.06 * Math.sin(t * 30)); ctx.scale(sc, sc); ctx.globalAlpha = urge;
    txt(t >= C.yaz - 0.03 ? 'DURMA, YAZ!' : 'DURMA!', 0, 0, { size: 230, italic: true, color: LIME, stroke: 30, strokeColor: '#05070c' });
    ctx.restore();
  }
}

// ---------- 6) GOL → "ama sevinme" ----------
const FRZ = C.ama + 0.06;
function matchCard(y, home, away, sh, sa, o = {}) {
  const { flip = 1, w = 940, h = 250, hi = 0, flipA = 1, hiA = 0 } = o;
  ctx.save(); ctx.translate(540, y);
  rr(-w / 2, -h / 2, w, h, 40); ctx.fillStyle = 'rgba(10,15,30,.94)'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = hi || hiA ? YEL : 'rgba(160,185,255,.3)'; ctx.stroke();
  crest(home, -w / 2 + 130, 0, 84); crest(away, w / 2 - 130, 0, 84);
  ctx.save(); ctx.translate(-88, 0); ctx.scale(1, flip); digits(String(sh), 0, 0, 190, { color: hi ? YEL : '#fff', glow: hi ? 30 : 0, glowColor: YEL }); ctx.restore();
  txt('–', 0, -6, { size: 110, color: 'rgba(255,255,255,.5)' });
  ctx.save(); ctx.translate(88, 0); ctx.scale(1, flipA); digits(String(sa), 0, 0, 190, { color: hiA ? YEL : '#fff', glow: hiA ? 30 : 0, glowColor: YEL }); ctx.restore();
  ctx.restore();
}
function sGoal(t) {
  const tf = Math.min(t, FRZ), d = tf - T6, frozen = prog(t, C.ama, C.ama + 0.15);
  bgGrad('#3a0114', '#a90432', '#3a0114');
  rays(540, 700, tf * 0.9, '#FDB912', 16, 0.34);
  radial(540, 700, 1000, 'rgba(255,220,120,.5)');
  const p = prog(d, 0, 0.22);
  ctx.save(); ctx.translate(540, 660); const sc = lerp(4.5, 1, eBack(p, 1.2)) * (1 + 0.04 * Math.sin(tf * 22)); ctx.scale(sc, sc); ctx.rotate(-0.05);
  txt('GOL!', 0, 0, { size: 520, italic: true, grad: ['#ffffff', '#ffe36b', '#FDB912'], stroke: 40, strokeColor: '#3a0114', glow: 60, glowColor: 'rgba(0,0,0,.6)' });
  ctx.restore();
  // skor kartı: 0 → 1 döner
  const fp = prog(d, 0.12, 0.42), flip = fp < 0.5 ? 1 - fp * 2 : (fp - 0.5) * 2;
  ctx.save(); ctx.translate(0, (1 - eOut(prog(d, 0.05, 0.3))) * 500);
  matchCard(1060, HERO, RIVAL, fp < 0.5 ? 0 : 1, 1, { flip: Math.max(0.05, flip), hi: fp >= 0.5 ? 1 : 0 });
  ctx.restore();
  confetti(tf, T6 + 0.02, 540, 700, ['#FDB912', '#ffffff', '#ff2f5f', '#ffe36b'], 170, 21, 1.15);
  confetti(tf, T6 + 0.1, 200, 1000, ['#FDB912', '#ffffff', '#ff2f5f'], 60, 22, 0.8); confetti(tf, T6 + 0.1, 880, 1000, ['#FDB912', '#ffffff', '#ff2f5f'], 60, 23, 0.8);
  // donma: "daha bitmedi"
  if (frozen > 0) {
    ctx.fillStyle = `rgba(4,6,12,${0.62 * frozen})`; ctx.fillRect(0, 0, W, H);
    const q = prog(t, C.sevinme - 0.03, C.sevinme + 0.16);
    if (q > 0) { ctx.save(); ctx.translate(540, 850); ctx.rotate(-0.07); const s2 = lerp(2.8, 1, eBack(q, 1.3)); ctx.scale(s2, s2); ctx.globalAlpha = clamp(q * 4, 0, 1); tag('DAHA BİTMEDİ', 0, 0, { size: 150, bg: '#fff', color: '#0a0f12' }); ctx.restore(); }
  }
}
