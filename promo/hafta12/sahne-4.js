/* 12. Hafta — sahne 5: "Şimdi ortam ısınıyor…" (fısıltı) + sahne 7: "Sen yazmazsan rakibin yazar… ve üç puan onlara gider." */

function sHeat(t) {
  const t0 = T.isin, t1 = T.m[5], z = 1 + 0.14 * eInOut(prog(t, t0, t1));
  ctx.fillStyle = '#0d0706'; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.translate(540, 900); ctx.scale(z, z); ctx.translate(-540, -900);
  const heat = prog(t, t0, t1);
  radial(540, 1700, 1300, hexA('#ff3d0a', 0.35 + 0.35 * heat));
  radial(540, 860, 700, hexA('#7a1405', 0.35));
  // sıradaki dört büyük maç: karanlıkta, kızaran kenarlar
  const pos = [[330, 650], [750, 650], [330, 1030], [750, 1030]];
  pos.forEach(([x, y], k) => {
    const a = prog(t, t0 + 0.15 + k * 0.12, t0 + 0.5 + k * 0.12), pu = 0.5 + 0.5 * Math.sin(t * 5 + k * 1.3);
    ctx.save(); ctx.globalAlpha = a; ctx.shadowColor = '#ff4a1c'; ctx.shadowBlur = 50 * (0.4 + heat) * pu; rr(x - 130, y - 178, 260, 356, 22); ctx.fillStyle = '#ff4a1c'; ctx.fill(); ctx.restore();
    card(MINI[5 + k], x, y - 8 * Math.sin(t * 1.5 + k), 260, (k % 2 ? 0.03 : -0.03), a, lerp(0.72, 0.35, heat));
  });
  embers(t, 70, 61, 0.5 + 0.6 * heat, 0, W, H + 30, 1700);
  ctx.restore();
  // fısıltı yazısı: harf harf, titrek
  const s1 = 'ŞİMDİ…', s2 = 'ORTAM ISINIYOR';
  txt(s1, 540, 1225, { size: 64, spacing: 10, color: '#ffd9b0', alpha: 0.85 * prog(t, C.simdi, C.simdi + 0.3) });
  const n = s2.length, sz = fit(s2, 150, 900, 900, 4);
  let x = 540 - tw(s2, sz, 900, 4) / 2;
  for (let k = 0; k < n; k++) {
    const ch = s2[k], cw = tw(ch, sz, 900, 4), ts = C.ortam + k * ((C.isiniyor + 0.5 - C.ortam) / n), a = prog(t, ts, ts + 0.18);
    const fl = 0.85 + 0.15 * Math.sin(t * 31 + k * 7);
    txt(ch, x + cw / 2, 1330 - 14 * (1 - eOut(a)), { size: sz, color: '#fff2e0', alpha: a * fl, glow: 30, glowColor: '#ff5a1c' });
    x += cw;
  }
}

// ---------- 3x3 duvar → tek düello ----------
const WALL = [282, 540, 798].flatMap((x, c) => [538, 884, 1230].map((y) => [x, y])).sort((a, b) => a[1] - b[1] || a[0] - b[0]);
function sSen(t) {
  ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
  const push = eIn(prog(t, C.yazmazsan - 0.08, C.yazmazsan + 0.2)), duA = prog(t, C.yazmazsan + 0.05, C.yazmazsan + 0.22);
  const follow = eIn(prog(t, C.gider, T.tablo)) * 700; // kamera parayı yukarı izler
  if (duA < 1) {
    bgNeutral(t);
    ctx.save(); ctx.translate(540, 884); const s = Math.pow(4.6, push); ctx.scale(s, s); ctx.translate(-540, -884);
    WALL.forEach(([x, y], k) => card(MINI[k], x, y + 6 * Math.sin(t * 3 + k), 240, 0, 1, k === 4 ? 0 : 0.4 * push));
    ctx.restore();
  }
  if (duA > 0) {
    ctx.save(); ctx.globalAlpha = duA; ctx.translate(0, follow);
    const nr = lerp(0, 2418, eOut(prog(t, C.rakibin, C.yazar + 0.45)));
    const f = lerp(0.5, 0.08, eOut(prog(t, C.rakibin, C.yazar + 0.35)));
    duel(t, { open: 1, pos: reelPos(t, 5), pillL: 1, nl: 0, nr, f, winR: prog(t, C.puan + 0.3, C.puan + 0.5), loseL: prog(t, C.onlara, C.onlara + 0.4) });
    rain(t, C.rakibin - 0.05, C.ve + 0.1, 30, 33, 0, 1.15);
    slamDuo('+3 RAKİBE GİDER', 540, 1240, 150, prog(t, C.onlara - 0.06, C.onlara + 0.1), { color: RD, max: 900 });
    ctx.restore();
  }
  // +3 parası: ortaya iner, rakibe kayar, yukarı uçar (kamera izler)
  if (t >= C.ve - 0.1 && t < T.tablo - 0.18) {
    const inq = eOut(prog(t, C.ve - 0.1, C.uc3 + 0.05)), sl = eInOut(prog(t, C.puan, C.puan + 0.38)), up = eIn(prog(t, C.gider, T.tablo - 0.18));
    const x = lerp(540, 810, sl), y = lerp(lerp(-200, 560, inq) + follow * 0, 300, up) - 40 * Math.sin(sl * Math.PI);
    coin(x, y, 110, { flip: (1 - inq) * 8 + sl * TAU + up * 9, glow: 0.8 });
    if (up > 0) speedLines(up * 0.8, 'v', 4);
  }
}
