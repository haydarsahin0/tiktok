/* 12. Hafta — sahne 8: puan tablosu. "Dikkat: sadece bu hafta yorumlarla belli oluyor." */
const TBL = { x0: 70, x1: 960, top: 375, row0: 412, rh: 54 };
const BASE = {}; VERI.table.forEach((r) => (BASE[r.id] = r));
// "ya şöyle olursa": +3'ler her maçta iki takım arasında gidip gelir, hiçbir sonuca oturmaz
const WI0 = T.tablo + 0.75, WIS = 0.68;
const wiState = (t) => (t < WI0 ? -1 : Math.floor((t - WI0) / WIS));
const WI_CACHE = {};
function wiOf(k) {
  if (WI_CACHE[k]) return WI_CACHE[k];
  const got = {};
  if (k >= 0) { const r = rng(4000 + k * 31); VERI.w12.forEach(([h, a], j) => { got[(r() < 0.5) !== (k % 2 === 1 && j % 2 === 0) ? h : a] = 1; }); }
  const pts = (id) => BASE[id].p + (got[id] ? 3 : 0);
  const order = VERI.table.map((r) => r.id).sort((a, b) => pts(b) - pts(a) || BASE[b].av - BASE[a].av || BASE[b].af - BASE[a].af);
  const rank = {}; order.forEach((id, i) => (rank[id] = i));
  return (WI_CACHE[k] = { got, rank, pts });
}
function drawTable(t, o = {}) {
  const { alpha = 1 } = o; if (alpha <= 0) return;
  const k = wiState(t), cur = wiOf(k), prv = wiOf(k - 1), tk = k < 0 ? 0 : t - (WI0 + k * WIS), mv = eInOut(prog(tk, 0, 0.26));
  ctx.save(); ctx.globalAlpha *= alpha;
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 18; rr(TBL.x0, TBL.top, TBL.x1 - TBL.x0, 1392 - TBL.top, 26); ctx.fillStyle = PAPER; ctx.fill(); ctx.restore();
  txt('#', 112, 394, { size: 24, weight: 800, color: '#8a857a' }); txt('TAKIM', 208, 394, { size: 24, weight: 800, color: '#8a857a', align: 'left', spacing: 2 });
  txt('O', 800, 394, { size: 24, weight: 800, color: '#8a857a' }); txt('P', 900, 394, { size: 24, weight: 800, color: '#8a857a' });
  for (let i = 0; i < 18; i++) if (i % 2) { ctx.fillStyle = 'rgba(0,0,0,.045)'; ctx.fillRect(TBL.x0 + 8, TBL.row0 + i * TBL.rh, TBL.x1 - TBL.x0 - 16, TBL.rh); }
  ctx.fillStyle = 'rgba(0,0,0,.12)'; ctx.fillRect(TBL.x0 + 20, TBL.row0 + 4 * TBL.rh - 1, TBL.x1 - TBL.x0 - 40, 2); ctx.fillRect(TBL.x0 + 20, TBL.row0 + 15 * TBL.rh - 1, TBL.x1 - TBL.x0 - 40, 2);
  const rows = VERI.table.map((r) => ({ id: r.id, y: TBL.row0 + TBL.rh / 2 + lerp(prv.rank[r.id], cur.rank[r.id], mv) * TBL.rh, up: prv.rank[r.id] - cur.rank[r.id] }));
  rows.sort((a, b) => Math.abs(a.up) - Math.abs(b.up));
  rows.forEach(({ id, y, up }) => {
    const moving = mv > 0 && mv < 1 && up !== 0, lift = moving ? 1 : 0;
    if (lift > 0) { ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.3)'; ctx.shadowBlur = 20; rr(TBL.x0 + 6, y - TBL.rh / 2 + 2, TBL.x1 - TBL.x0 - 12, TBL.rh - 4, 10); ctx.fillStyle = up > 0 ? '#e3fbf9' : '#fde8ec'; ctx.fill(); ctx.restore(); }
    const rk = Math.round(lerp(prv.rank[id], cur.rank[id], mv)) + 1, has = cur.got[id] ? 1 : 0, had = prv.got[id] ? 1 : 0;
    txt(String(rk), 112, y, { size: 36, color: rk <= 4 ? '#0b7f7a' : rk >= 16 ? '#c3173d' : INK });
    sticker(id, 172, y, 44);
    txt(TM[id].short, 206, y, { size: 40, weight: 800, color: INK, align: 'left', max: 420 });
    txt('11', 800, y, { size: 36, weight: 800, color: '#77726a' });
    const sw = lerp(had, has, eOut(prog(tk, 0, 0.3)));
    if (sw > 0.02) { ctx.save(); ctx.translate(708, y); ctx.scale(sw, 1); rr(-42, -21, 84, 42, 21); ctx.fillStyle = GOLD; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#a86f00'; ctx.stroke(); txt('+3', 0, 0, { size: 34, color: '#5a3a00' }); ctx.restore(); }
    const p = BASE[id].p + (tk > 0.15 ? has : had) * 3;
    txt(String(p), 900, y, { size: 44, color: (tk > 0.15 ? has : had) ? '#b07800' : INK });
  });
  ctx.restore();
}
// üst şerit: başlık → DİKKAT (sarı-siyah) → CANLI (kırmızı)
function hazard(x, w, y, h) { ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); ctx.fillStyle = '#111'; ctx.fillRect(x, y, w, h); ctx.fillStyle = WARN; for (let k = -2; k < w / 30 + 2; k++) { ctx.beginPath(); ctx.moveTo(x + k * 30, y + h); ctx.lineTo(x + k * 30 + 15, y + h); ctx.lineTo(x + k * 30 + 15 + h, y); ctx.lineTo(x + k * 30 + h, y); ctx.fill(); } ctx.restore(); }
function band(t, x, y, s, mode, flipQ = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(lerp(-0.012, -0.035, clamp((s - 0.78) / 0.5, 0, 1))); ctx.scale(s, s * Math.max(0.02, Math.abs(Math.cos(flipQ * Math.PI))));
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.55)'; ctx.shadowBlur = 30; ctx.fillStyle = mode === 'live' ? RD : WARN; ctx.fillRect(-640, -62, 1280, 124); ctx.restore();
  if (mode !== 'live') { hazard(-640, 1280, -62, 14); hazard(-640, 1280, 48, 14); }
  if (mode === 'dikkat') txt('⚠ DİKKAT', 0, 0, { size: 104, color: '#111', spacing: 6 });
  else if (mode === 'sadece') { emoji('💬', -360, 0, 62); txt('SADECE BU HAFTA: YORUMLARLA', 40, 0, { size: 74, color: '#111', max: 700 }); }
  else { const pu = 0.5 + 0.5 * Math.sin(t * 8); ctx.fillStyle = '#fff'; ctx.globalAlpha = 0.5 + 0.5 * pu; ctx.beginPath(); ctx.arc(-300, 0, 20, 0, TAU); ctx.fill(); ctx.globalAlpha = 1; txt('CANLI · HER HAFTA', 30, 0, { size: 80, color: '#fff', spacing: 3, max: 560 }); }
  ctx.restore();
}
const BAND_Y = 316, BAND_S = 0.78, COIN_P = [1000, 470, 46];
function tableBand(t) {
  const d = C.dikkat, inq = prog(t, d - 0.08, d + 0.08), up = eInOut(prog(t, d + 0.28, d + 0.48));
  if (inq <= 0) {
    ctx.save(); rr(250, 278, 580, 80, 40); ctx.fillStyle = 'rgba(255,255,255,.1)'; ctx.fill(); ctx.restore();
    duo('PUAN TABLOSU', 540, 318, 66, { off: 3, spacing: 3 });
    return;
  }
  const s = lerp(lerp(2.4, 1.3, eOut5(inq)), BAND_S, up), y = lerp(880, BAND_Y, up);
  band(t, 540, y, s, t < C.sadece - 0.05 ? 'dikkat' : 'sadece', bell(t, C.sadece - 0.15, C.sadece + 0.05) * 0.5);
}
function sTable(t) {
  bgNeutral(t, 0.6);
  radial(540, 900, 900, hexA(GOLD, 0.12));
  const inq = eOut(prog(t, T.tablo - 0.2, T.tablo + 0.35));
  ctx.save(); ctx.translate(0, (1 - inq) * -500); drawTable(t); ctx.restore();
  const dim = bell(t, C.dikkat - 0.05, C.dikkat + 0.7) * 0.55;
  if (dim > 0) { ctx.fillStyle = `rgba(0,0,0,${dim})`; ctx.fillRect(0, 0, W, H); }
  tableBand(t);
  if (t >= T.tablo + 0.5) coin(COIN_P[0], COIN_P[1], COIN_P[2], { glow: 0.5, rot: 0.1 });
  ring(t, T.tablo + 0.5, COIN_P[0], COIN_P[1], GOLD, 500, 22, 0.5);
}
// +3 parası: düellodan tabloya uçuş (sahneler arası, üst katmanda)
window.coinFlight = (t) => {
  const a = T.tablo - 0.18, b = T.tablo + 0.5; if (t < a || t >= b) return;
  const q = prog(t, a, b), e = eInOut(q);
  coin(lerp(810, COIN_P[0], e), lerp(300, COIN_P[1], e) - 260 * Math.sin(q * Math.PI), lerp(110, COIN_P[2], e), { flip: q * TAU * 2, glow: 0.8 });
};
