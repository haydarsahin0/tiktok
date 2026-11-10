/* 12. Hafta — sahne 2: kural. "Kural tek: yorumlarda rakibinden daha çok adı yazılan takım, üç puanı alır." + ortak düello çizimi */

// slot makinesi makarası: iki taraf asla aynı kulübü göstermez (sağ = sol + 9)
function reelPos(t, speed = 6) { const u = t * speed, k = Math.floor(u); return k + eOut(u - k); }
function reel(x, y, pos, side, o = {}) {
  const { d = 240, alpha = 1, gray = 0, sc = 1 } = o, win = d * 1.18, k = Math.floor(pos), fr = pos - k;
  ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(x, y); ctx.scale(sc, sc);
  rr(-win / 2, -win / 2, win, win, 40); ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.stroke();
  ctx.save(); rr(-win / 2, -win / 2, win, win, 40); ctx.clip();
  const id0 = REEL[(k + side * 9) % 18], id1 = REEL[(k + 1 + side * 9) % 18], st = 1 + 0.25 * Math.sin(fr * Math.PI);
  sticker(id0, 0, fr * win, d, { sy: st, gray }); sticker(id1, 0, (fr - 1) * win, d, { sy: st, gray });
  const g = ctx.createLinearGradient(0, -win / 2, 0, win / 2); g.addColorStop(0, 'rgba(0,0,0,.55)'); g.addColorStop(0.22, 'rgba(0,0,0,0)'); g.addColorStop(0.78, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.55)');
  ctx.fillStyle = g; ctx.fillRect(-win / 2, -win / 2, win, win);
  ctx.restore(); ctx.restore();
  return fr < 0.5 ? REEL[(k + side * 9) % 18] : REEL[(k + 1 + side * 9) % 18];
}
// ortak düello sahnesi: sol camgöbeği (SENİN TAKIMIN), sağ kırmızı (RAKİBİN)
// o: open 0..1, pos (makara), nl/nr sayaç, f çubuk, win (sol kazanır 0..1), lose (sağ söner), pillL (solda boş yorum kutusu), winR (sağ kazanır)
function duel(t, o) {
  const { open = 1, pos = 0, nl = 0, nr = 0, f = 0.5, winL = 0, lose = 0, pillL = 0, winR = 0, loseL = 0 } = o;
  const ox = (1 - eOut(open)) * 560;
  ctx.save(); ctx.translate(-ox, 0);
  let g = ctx.createLinearGradient(0, 0, 540, H); g.addColorStop(0, '#0f6d72'); g.addColorStop(1, '#06262b'); ctx.fillStyle = g; ctx.fillRect(0, 0, 540, H);
  ctx.save(); ctx.globalAlpha = 0.12; ctx.beginPath(); ctx.rect(0, 0, 540, H); ctx.clip(); ctx.drawImage(DOTS, 0, 0); ctx.restore();
  radial(270, 660, 520, hexA(CY, 0.35 + 0.4 * winL));
  ctx.restore();
  ctx.save(); ctx.translate(ox, 0);
  g = ctx.createLinearGradient(540, 0, W, H); g.addColorStop(0, '#8a1030'); g.addColorStop(1, '#2e0612'); ctx.fillStyle = g; ctx.fillRect(540, 0, 540, H);
  ctx.save(); ctx.globalAlpha = 0.1; ctx.beginPath(); ctx.rect(540, 0, 540, H); ctx.clip(); ctx.drawImage(STRIPES, 0, 0); ctx.restore();
  radial(810, 660, 520, hexA(RD, 0.35 + 0.4 * winR));
  ctx.restore();
  if (open < 0.2) return;
  const a = prog(open, 0.4, 1);
  ctx.save(); ctx.globalAlpha *= a;
  txt('SENİN TAKIMIN', 270 - ox, 430, { size: 66, spacing: 2, stroke: 10, color: '#fff' });
  txt('RAKİBİN', 810 + ox, 430, { size: 66, spacing: 2, stroke: 10, color: '#fff' });
  // sol: makara ya da boş yorum kutusu
  if (pillL < 1) reel(270 - ox, 670, pos, 0, { alpha: 1 - pillL, gray: 0.9 * loseL, sc: 1 - 0.15 * loseL });
  if (pillL > 0) {
    ctx.save(); ctx.globalAlpha *= pillL; ctx.translate(270, 670); ctx.scale(0.56, 0.56); ctx.translate(-270, -670);
    pill(270, 670, { t, w: 760, glow: 0.2 }); ctx.restore();
    txt('…', 270, 560, { size: 90, color: 'rgba(255,255,255,.5)', alpha: pillL });
  }
  reel(810 + ox, 670, pos + 0.5, 1, { gray: 0.95 * lose, sc: 1 - 0.18 * lose, alpha: 1 - 0.3 * lose });
  ctx.restore();
  // dikiş + VS
  ctx.save(); ctx.fillStyle = BG; ctx.fillRect(540 - 10, 0, 20, H); ctx.restore();
  vsBadge(540, 670, 0.75 * a, t, a);
  // sayaçlar + çubuk
  ctx.save(); ctx.globalAlpha *= a;
  txt(fmtN(nl), 270, 905, { size: 120, stroke: 14, color: winL > 0.5 ? GOLD : '#fff' });
  txt(fmtN(nr), 810, 905, { size: 120, stroke: 14, color: winR > 0.5 ? GOLD : lose > 0.5 ? '#aaa' : '#fff' });
  duelBar(540, 1040, 880, f, CY, RD, { h: 54 });
  ctx.restore();
  if (lose > 0) { ctx.save(); ctx.globalCompositeOperation = 'saturation'; ctx.globalAlpha = 0.85 * lose; ctx.fillStyle = '#808080'; ctx.fillRect(540, 0, 540, H); ctx.restore(); }
  if (loseL > 0) { ctx.save(); ctx.globalCompositeOperation = 'saturation'; ctx.globalAlpha = 0.85 * loseL; ctx.fillStyle = '#808080'; ctx.fillRect(0, 0, 540, H); ctx.restore(); }
}
// sayaç adımları: her kelimede iki taraf da artar, sol öne geçer
const RULE_STEPS = [[C.yorumlarda, 120, 110], [C.rakibinden, 310, 300], [C.daha, 520, 470], [C.cok, 700, 610], [C.adi, 880, 760], [C.yazilan, 1090, 930], [C.takim, 1284, 1097]];
function stepVal(t, steps, k) { let v = 0; for (let i = 0; i < steps.length; i++) { const [t0] = steps[i], prev = i ? steps[i - 1][k] : 0; if (t >= t0) v = lerp(prev, steps[i][k], eOut(prog(t, t0, t0 + 0.22))); } return v; }
// yağan baloncuklar: tarafına düşer, sayaca girer
function rain(t, t0, t1, n, seed, sideBias = 0.5, rate = 1) {
  const r = rng(seed);
  for (let k = 0; k < n; k++) {
    const st = lerp(t0, t1, (k + r() * 0.6) / n), side = r() < sideBias ? 0 : 1, dt = (t - st) * rate;
    const jx = (r() - 0.5) * 200, life = 0.55;
    if (dt < 0 || dt > life) continue;
    const q = dt / life, x = (side ? 810 : 270) + jx * (1 - q), y = lerp(260, 900, eIn(q));
    bubble(k + Math.floor(r() * 24), x, y, lerp(0.62, 0.25, eIn(q)), q > 0.85 ? (1 - q) / 0.15 : 1, (r() - 0.5) * 0.3);
  }
}

function sRule(t) {
  ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
  const open = prog(t, T.split, T.split + 0.35);
  const nl = stepVal(t, RULE_STEPS, 1), nr = stepVal(t, RULE_STEPS, 2);
  const f = 0.5 + ((nl - nr) / Math.max(1, nl + nr)) * 2.2;
  const drop = T.coinDrop, land = drop + 0.12, winL = prog(t, land, land + 0.2), lose = prog(t, land + 0.05, land + 0.45);
  if (open > 0) duel(t, { open, pos: reelPos(t - T.split, lerp(6, 3, winL)), nl, nr, f, winL, lose });
  if (open < 1) {
    // KURAL TEK: büyük ikili yazı, ortadan ikiye açılır
    bgNeutral(t, 1 - open);
    ctx.save(); ctx.globalAlpha = 0.06 * (1 - open); ctx.translate(((t * 160) % 112) - 112, 0); ctx.drawImage(STRIPES, 0, 0); ctx.restore();
    const e = eIn(open) * 620;
    for (const side of [-1, 1]) {
      ctx.save(); ctx.beginPath(); side < 0 ? ctx.rect(0, 0, 540, H) : ctx.rect(540, 0, 540, H); ctx.clip(); ctx.translate(side * e, 0); ctx.globalAlpha = 1 - prog(open, 0.6, 1);
      slamDuo('KURAL', 540, 760, 330, prog(t, C.kural - 0.08, C.kural + 0.08), { off: 14 });
      slamDuo('TEK', 540, 1060, 400, prog(t, C.tek - 0.08, C.tek + 0.08), { off: 16 });
      ctx.restore();
    }
    if (open > 0) { ctx.save(); ctx.globalAlpha = bell(open, 0, 1); ctx.fillStyle = '#fff'; ctx.shadowColor = '#fff'; ctx.shadowBlur = 40; ctx.fillRect(536, 0, 8, H); ctx.restore(); }
  }
  if (open > 0) rain(t, T.split + 0.15, C.takim + 0.3, 22, 21, 0.55);
  // +3 parası kazanan tarafa düşer
  if (t >= drop - 0.25) {
    const q = prog(t, drop - 0.25, land), y = q < 1 ? lerp(-250, 600, eIn(q)) : 600 - 60 * Math.abs(Math.sin(prog(t, land, land + 0.4) * Math.PI)) * (1 - prog(t, land, land + 0.4));
    ring(t, land, 270, 640, GOLD, 650, 36, 0.55); ring(t, land + 0.08, 270, 640, '#fff', 500, 14, 0.5);
    sparks(t, land, 300, 600, [GOLD, '#fff', CY], 26, 77, 1.1, 0.6);
    coin(405, y, 92, { flip: (1 - q) * 6, glow: 0.8, sx: 1 });
  }
  slamDuo('+3 PUAN', 540, 1230, 190, prog(t, C.alir - 0.08, C.alir + 0.08), { color: GOLD, off: 8 });
  if (t > land) { ctx.fillStyle = `rgba(255,255,255,${0.5 * (1 - prog(t, land, land + 0.1))})`; ctx.fillRect(0, 0, W, H); }
}
