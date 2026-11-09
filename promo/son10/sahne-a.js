/* Sahne 1-3: sayaç kancası, telefon (sonsuz zoom), yorum yazma. */
const T2 = C.ve - 0.1, T3 = C.yorumlara - 0.12, T4 = C.sahaya - 0.1, T5 = C.bar - 0.14, T6 = C.gol, T7 = C.ayni - 0.12,
  T8 = C.puan - 0.1, T9 = C.en - 0.1, T10 = C.burada - 0.1, T11 = C.her - 0.1, T12 = C.ve3 - 0.1;
const HERO = TEAM.gs, RIVAL = TEAM.sam;
const FF_END = DUR - 0.5; // ileri sarma burada 00:10.00'a oturur; son yarım saniye ilk kareyle aynı

// oyun saati: son 10 saniye (ağır çekim) → tur biter → yeni tur 25:00 → sona doğru ileri sarıp yine 00:10
function clock(t) {
  if (t < T6) return { s: 10 * (1 - t / T6), run: true };
  if (t < T7) return { s: 0, over: true };
  const s0 = 1500 - (T12 - T7);
  if (t < T12) return { s: 1500 - (t - T7), fresh: true };
  const p = prog(t, T12, FF_END);
  return { s: lerp(s0, 10, eInOut(p)), ff: p < 1 ? Math.sin(p * Math.PI) : 0 };
}
// her saniye vuruşu (0..1, vuruş anında 1)
function tickPulse(t) {
  const k = clock(t);
  if (!k.run) return 0;
  return Math.exp(-7 * (Math.ceil(k.s) - k.s));
}

// ---------- gece stadı arka planı ----------
function nightBg(t, tint = 0) {
  bgGrad('#05070f', '#0a1124', '#060912');
  radial(120, 60, 900, 'rgba(120,160,255,.20)'); radial(960, 60, 900, 'rgba(120,160,255,.20)');
  // projektörler
  for (const x of [130, 950]) for (let i = 0; i < 4; i++) { ctx.fillStyle = 'rgba(235,242,255,.85)'; ctx.beginPath(); ctx.arc(x - 54 + i * 36, 96, 11, 0, Math.PI * 2); ctx.fill(); }
  // tribün ışık noktaları
  const r = rng(77);
  for (let i = 0; i < 140; i++) {
    const x = r() * W, y = 150 + r() * 420, ph = r() * 6.28, sp = 1.5 + r() * 3;
    ctx.globalAlpha = 0.10 + 0.14 * (0.5 + 0.5 * Math.sin(t * sp + ph)); ctx.fillStyle = i % 5 ? '#b9c8ff' : '#ffd9a0';
    ctx.beginPath(); ctx.arc(x, y, 2 + r() * 3, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
  // zemin: çim perspektifi
  ctx.save(); ctx.beginPath(); ctx.moveTo(0, 1500); ctx.lineTo(W, 1500); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.clip();
  const g = ctx.createLinearGradient(0, 1500, 0, H); g.addColorStop(0, '#0a2618'); g.addColorStop(1, '#0f3d24'); ctx.fillStyle = g; ctx.fillRect(0, 1500, W, 420);
  ctx.fillStyle = 'rgba(255,255,255,.035)';
  for (let i = -6; i < 7; i += 2) { ctx.beginPath(); ctx.moveTo(540 + i * 60, 1500); ctx.lineTo(540 + (i + 1) * 60, 1500); ctx.lineTo(540 + (i + 1) * 300, H); ctx.lineTo(540 + i * 300, H); ctx.fill(); }
  ctx.restore();
  const f = ctx.createLinearGradient(0, 1380, 0, 1560); f.addColorStop(0, 'rgba(6,9,18,1)'); f.addColorStop(1, 'rgba(6,9,18,0)'); ctx.fillStyle = f; ctx.fillRect(0, 1380, W, 180);
  if (tint > 0) { radial(540, 560, 1100, 'rgba(255,45,70,.5)', tint); }
}

// ---------- 1) kanca: dev sayaç + skor ----------
function bigClock(t, y) {
  const k = clock(t), pulse = tickPulse(t);
  const s = fmtClock(k.s), mainS = s.slice(0, 5), cs = s.slice(5);
  const sc = 1 + 0.035 * pulse;
  ctx.save(); ctx.translate(540, y); ctx.scale(sc, sc);
  if (k.ff > 0.02) {
    // ileri sarma: rakamlar dikeyde akar
    for (let i = 5; i >= 0; i--) { ctx.save(); ctx.globalAlpha = i ? 0.16 : 1; ctx.translate(0, -i * 26 * k.ff); digits(mainS, -95, 0, 300, { glow: i ? 0 : 40 }); digits(cs, 345, 44, 140, { color: '#ffb3bd' }); ctx.restore(); }
  } else {
    digits(mainS, -95, 0, 300, { glow: 30 + 50 * pulse, glowColor: RED });
    digits(cs, 345, 44, 140, { color: '#ff8d9b' });
  }
  ctx.restore();
}
function scoreCard(t, u, y) {
  // skor: sonda (u<0) 0-0 başlar, rakip atar → 0-1; başta 0-1
  const CONC = -1.25;
  const away = u >= 0 || u >= CONC ? 1 : 0;
  const hit = u < 0 ? bell(u, CONC, CONC + 0.45) : 0;
  rr(70, y - 170, 940, 340, 44); ctx.fillStyle = 'rgba(14,22,44,.92)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(160,185,255,.28)'; ctx.stroke();
  if (hit > 0) { ctx.save(); rr(70, y - 170, 940, 340, 44); ctx.clip(); radial(830, y, 520, 'rgba(255,45,70,.8)', hit); ctx.restore(); }
  // takımın: armalar sırayla döner (herkes kendi takımını görsün)
  const step = 0.34, q = u / step, idx = ((Math.floor(q) % CYCLE.length) + CYCLE.length) % CYCLE.length, f = q - Math.floor(q);
  const tm = TEAM[CYCLE[idx]], pin = eOut(clamp(f / 0.28, 0, 1));
  ctx.save(); ctx.beginPath(); ctx.rect(110, y - 150, 300, 232); ctx.clip();
  crest(tm, 255, y - 34 + (1 - pin) * 150, 96);
  if (f < 0.28) { const pm = TEAM[CYCLE[(idx + CYCLE.length - 1) % CYCLE.length]]; crest(pm, 255, y - 34 - pin * 190, 96); }
  ctx.restore();
  txt('TAKIMIN', 255, y + 118, { size: 60, italic: true, color: LIME, spacing: 2 });
  // rakip
  ctx.save(); ctx.beginPath(); ctx.arc(825, y - 34, 96, 0, Math.PI * 2); ctx.fillStyle = '#2a3145'; ctx.fill(); ctx.lineWidth = 9; ctx.strokeStyle = '#8089a3'; ctx.stroke(); ctx.restore();
  txt('?', 825, y - 34, { size: 110, color: '#aab3cc' });
  txt('RAKİP', 825, y + 118, { size: 60, italic: true, color: '#aab3cc', spacing: 2 });
  // skor
  digits('0', 452, y - 30, 210, { color: '#ffffff' });
  txt('–', 540, y - 36, { size: 120, color: 'rgba(255,255,255,.5)' });
  ctx.save(); ctx.translate(628, y - 30); const k = 1 + 0.5 * hit; ctx.scale(k, k);
  digits(String(away), 0, 0, 210, { color: away ? RED : '#ffffff', glow: away ? 26 : 0, glowColor: RED }); ctx.restore();
}
function supportBar(t, u, y, pct) {
  const x0 = 120, w = 840;
  txt('DESTEK', x0, y - 52, { size: 44, weight: 800, align: 'left', color: 'rgba(233,241,255,.7)', spacing: 3 });
  txt('%' + Math.round(pct), x0 + w, y - 52, { size: 50, italic: true, align: 'right', color: '#fff' });
  rr(x0, y - 20, w, 40, 20); ctx.fillStyle = 'rgba(255,255,255,.1)'; ctx.fill();
  ctx.save(); rr(x0, y - 20, w, 40, 20); ctx.clip();
  const g = ctx.createLinearGradient(x0, 0, x0 + w, 0); g.addColorStop(0, '#7dff6b'); g.addColorStop(1, LIME); ctx.fillStyle = g; ctx.fillRect(x0, y - 20, (w * pct) / 100, 40); ctx.restore();
  const gx = x0 + w * 0.65;
  ctx.fillStyle = YEL; ctx.fillRect(gx - 3, y - 34, 6, 68);
  txt('GOL %65', gx, y - 58, { size: 40, italic: true, color: YEL });
}
function sHook(t) {
  const u = t > DUR / 2 ? t - DUR : t;
  const pulse = tickPulse(t), k = clock(t);
  nightBg(t, 0.25 + 0.55 * pulse);
  // üst etiket
  const blink = 0.55 + 0.45 * Math.sin(u * 9);
  rr(350, 262, 380, 76, 38); ctx.fillStyle = 'rgba(255,45,70,.16)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = hexA(RED, 0.8); ctx.stroke();
  ctx.fillStyle = hexA(RED, blink); ctx.beginPath(); ctx.arc(394, 300, 13, 0, Math.PI * 2); ctx.fill();
  txt(k.ff > 0.02 ? 'TUR AKIYOR' : 'TUR BİTİYOR', 556, 300, { size: 50, italic: true, color: '#fff', spacing: 2 });
  if (k.ff > 0.02) txt('▶▶', 540, 395, { size: 54, color: hexA(LIME, k.ff), alpha: 0.9 });
  bigClock(t, 540);
  // eriyen çizgi
  const frac = clamp(k.s / 10, 0, 1);
  rr(140, 716, 800, 14, 7); ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fill();
  rr(140, 716, 800 * frac, 14, 7); ctx.fillStyle = RED; ctx.fill();
  scoreCard(t, u, 950);
  supportBar(t, u, 1215, 38 + 3 * Math.sin(u * 2.1) + 1.5 * Math.sin(u * 5.3));
  // "GERİDE" damgası
  if (u >= C.geride - 0.02 && u < 20) {
    const p = prog(u, C.geride - 0.02, C.geride + 0.2);
    ctx.save(); ctx.translate(540, 1330); ctx.rotate(-0.05); const sc = lerp(2.8, 1, eBack(p, 1.3)); ctx.scale(sc, sc); ctx.globalAlpha = clamp(p * 4, 0, 1);
    tag('1–0 GERİDESİN', 0, 0, { size: 96, bg: RED });
    ctx.restore();
  }
}

// ---------- 2) telefon: ekran ekranın içinde (sonsuz zoom) ----------
const PH = { x: 230, y: 330, w: 620, h: 1102 }, PK = W / PH.w, PCX = (PH.x * PK) / (PK - 1), PCY = (PH.y * PK) / (PK - 1);
let PIMG = null;
function hand(side) {
  // ekran ışığıyla aydınlanan el: avuç + başparmak + arkadan görünen parmaklar
  ctx.save(); if (side > 0) { ctx.translate(W, 0); ctx.scale(-1, 1); }
  const skin = ctx.createLinearGradient(0, 0, 260, 0); skin.addColorStop(0, '#5d3626'); skin.addColorStop(1, '#d39a76');
  ctx.fillStyle = skin; ctx.strokeStyle = 'rgba(255,220,200,.35)'; ctx.lineWidth = 4;
  // arkadaki parmak uçları (karşı elin değil, bu elin telefonu saran parmakları)
  for (let i = 0; i < 4; i++) { rr(168, 760 + i * 118, 64, 96, 32); ctx.fill(); ctx.stroke(); }
  // avuç
  ctx.beginPath(); ctx.moveTo(-40, 1050); ctx.quadraticCurveTo(120, 1010, 200, 1180); ctx.lineTo(250, 1520); ctx.quadraticCurveTo(300, 1760, 200, 1960); ctx.lineTo(-40, 1960); ctx.closePath(); ctx.fill(); ctx.stroke();
  // başparmak
  ctx.save(); ctx.translate(150, 1420); ctx.rotate(-0.42); rr(-52, -300, 104, 340, 52); ctx.fill(); ctx.stroke();
  rr(-34, -288, 68, 74, 26); ctx.fillStyle = 'rgba(255,235,220,.35)'; ctx.fill(); ctx.restore();
  ctx.restore();
}
function buildPhone() {
  PIMG = mk();
  paint(PIMG, () => {
    bgGrad('#060913', '#0b1226', '#070a14');
    const r = rng(41);
    for (let i = 0; i < 16; i++) { const x = r() * W, y = r() * H, rad = 60 + r() * 150; radial(x, y, rad, ['rgba(255,170,90,.16)', 'rgba(90,170,255,.14)', 'rgba(200,255,61,.08)'][i % 3]); }
    radial(540, 880, 1050, 'rgba(120,160,255,.22)');
    // telefon gövdesi
    hand(-1); hand(1);
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.7)'; ctx.shadowBlur = 60; ctx.shadowOffsetY = 20;
    rr(PH.x - 24, PH.y - 24, PH.w + 48, PH.h + 48, 84); ctx.fillStyle = '#12151d'; ctx.fill(); ctx.restore();
    rr(PH.x - 24, PH.y - 24, PH.w + 48, PH.h + 48, 84); ctx.lineWidth = 5; ctx.strokeStyle = '#3a4258'; ctx.stroke();
    rr(PH.x - 2, PH.y - 2, PH.w + 4, PH.h + 4, 62); ctx.fillStyle = '#000'; ctx.fill();
    // başparmak uçları çerçevenin üstünde
    for (const s of [-1, 1]) { ctx.save(); if (s > 0) { ctx.translate(W, 0); ctx.scale(-1, 1); } ctx.translate(150, 1420); ctx.rotate(-0.42); const g = ctx.createLinearGradient(-52, 0, 52, 0); g.addColorStop(0, '#8a5640'); g.addColorStop(1, '#dba682'); ctx.fillStyle = g; rr(-52, -300, 104, 200, 52); ctx.fill(); ctx.strokeStyle = 'rgba(255,225,205,.4)'; ctx.lineWidth = 4; ctx.stroke(); ctx.restore(); }
  }, 0);
}
function phoneZ(t) {
  const a = eInOut(prog(t, T2, C.tek - 0.12));
  const hold = 0.05 * prog(t, C.tek - 0.12, C.su);
  const b = eInOut(prog(t, C.su - 0.05, C.izliyor + 0.42));
  return a + hold + b * 2.0 + 0.04 * prog(t, C.izliyor + 0.42, T3 + 0.2);
}
function sPhone(t) {
  if (!PIMG) buildPhone();
  const z = phoneZ(t);
  const inner = paint(LD, sHook, t);
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  const top = Math.max(1, Math.ceil(z));
  for (let n = top; n >= 0; n--) {
    const s = Math.pow(PK, n - z);
    ctx.save(); ctx.translate(PCX, PCY); ctx.scale(s, s); ctx.translate(-PCX, -PCY);
    if (n === 0) { // en içteki: gerçek ekran (sahne 1)
      // (bir üst seviyenin ekran dikdörtgeni = tam tuval)
      ctx.beginPath(); ctx.roundRect(0, 0, W, H, 60 * PK * clamp(z * 6, 0, 1)); ctx.clip(); ctx.drawImage(inner, 0, 0);
    } else {
      if (n < top) { ctx.save(); ctx.translate(PCX, PCY); ctx.scale(PK, PK); ctx.translate(-PCX, -PCY); ctx.beginPath(); ctx.roundRect(PH.x, PH.y, PH.w, PH.h, 60); ctx.restore(); ctx.clip(); }
      ctx.drawImage(PIMG, 0, 0);
    }
    ctx.restore();
  }
  // yazılar (telefonun alt kısmı boş)
  if (t >= C.tek - 0.03 && t < C.su - 0.05) {
    const p = prog(t, C.tek - 0.03, C.tek + 0.16), out = 1 - prog(t, C.su - 0.25, C.su - 0.05);
    ctx.save(); ctx.globalAlpha = out; ctx.translate(540, 1262); const sc = lerp(2.4, 1, eBack(p, 1.5)); ctx.scale(sc, sc); ctx.rotate(-0.04);
    tag('TEK KİŞİ', 0, 0, { size: 150, bg: LIME, color: '#0a0f12' }); ctx.restore();
  }
  if (t >= C.izliyor + 0.3) {
    const p = prog(t, C.izliyor + 0.3, C.izliyor + 0.5);
    radial(540, 1150, 700, 'rgba(0,0,0,.75)', clamp(p * 2, 0, 1));
    ring(t, C.izliyor + 0.32, 540, 1150, LIME, 900, 30, 0.5);
    slam('SEN.', 540, 1150, p, { size: 420, italic: true, color: LIME, stroke: 26, strokeColor: '#05070c', glow: 50, glowColor: 'rgba(200,255,61,.6)' }, 3.2, -0.04);
  }
}

// ---------- 3) yorum yaz ----------
const CHAT = [['aslan_1905', 'GS 💛❤️', '#FDB912'], ['kadıköylü', 'FB', '#FFED00'], ['bordo61', 'TS 🔥', '#5DADE2'], ['çarşı', 'BJK', '#ffffff'], ['amedli21', 'AMED', '#3ddc84'], ['göztepe35', 'GÖZ GÖZ', '#FFD100'], ['sarıkanarya', 'FENER', '#FFED00']];
const SEND = C.yaziyorsun + 0.2;
function chatBubble(name, text, col, x, y, sc = 1, me = false) {
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
  const wn = tw(name, 40, 800), wt = tw(text, 58, 900), w = 96 + Math.max(wn, wt) + 44;
  rr(0, -62, w, 124, 62); ctx.fillStyle = me ? LIME : 'rgba(20,28,52,.92)'; ctx.fill();
  if (!me) { ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(160,185,255,.25)'; ctx.stroke(); }
  ctx.beginPath(); ctx.arc(60, 0, 40, 0, Math.PI * 2); ctx.fillStyle = me ? '#0a0f12' : col; ctx.fill();
  txt(name[0].toLocaleUpperCase('tr-TR'), 60, 0, { size: 46, color: me ? LIME : '#0a0f12' });
  txt(name, 116, -28, { size: 40, weight: 800, align: 'left', color: me ? 'rgba(10,15,18,.7)' : col });
  txt(text, 116, 22, { size: 58, align: 'left', color: me ? '#0a0f12' : '#fff' });
  ctx.restore();
  return w * sc;
}
function sType(t) {
  bgGrad('#060913', '#0c1430', '#070a14');
  radial(200, 500, 800, 'rgba(169,4,50,.35)'); radial(900, 1200, 800, 'rgba(0,45,114,.5)');
  const inY = 930, CY0 = 740, CP = 136;
  // sohbet akışı: adım adım yukarı kayan canlı yığın
  const sent = t >= SEND;
  const head = (Math.min(t, SEND) - (T3 - 0.6)) / 0.24;
  const shift = sent ? eOut(prog(t, SEND, SEND + 0.25)) * 1.25 : 0;
  const hk = Math.floor(head), hf = eOut(clamp((head - hk) * 2.4, 0, 1));
  for (let k = hk; k >= Math.max(0, hk - 5); k--) {
    const row = hk - k - 1 + hf + shift, m = CHAT[k % CHAT.length];
    const y = CY0 - row * CP;
    const a = (k === hk ? clamp((head - hk) * 5, 0, 1) : 1) * clamp((y - 320) / 130, 0, 1);
    if (a <= 0) continue;
    ctx.save(); ctx.globalAlpha = a; chatBubble(m[0], m[1], m[2], 80, y, 1); ctx.restore();
  }
  // gönderilen mesaj: giriş kutusundan sohbete uçar
  if (sent) {
    const p = eOut5(prog(t, SEND, SEND + 0.3));
    const y = lerp(inY, CY0, p), sc = lerp(1, 1.25, p);
    ring(t, SEND + 0.12, 300, CY0, LIME, 600, 24, 0.5);
    ctx.save(); ctx.shadowColor = 'rgba(200,255,61,.7)'; ctx.shadowBlur = 50 * p; chatBubble('SEN', 'GS', LIME, 80, y, sc, true); ctx.restore();
  }
  // giriş kutusu
  const g1 = t >= C.takimini, g2 = t >= C.takimini + 0.22;
  rr(70, inY - 72, 940, 144, 72); ctx.fillStyle = 'rgba(8,12,24,.95)'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = LIME; ctx.save(); ctx.shadowColor = LIME; ctx.shadowBlur = 24 + 14 * Math.sin(t * 8); ctx.stroke(); ctx.restore();
  const typed = sent ? '' : (g1 ? 'G' : '') + (g2 ? 'S' : '');
  if (!typed && !sent) txt('Takımını yaz...', 130, inY, { size: 62, weight: 600, align: 'left', color: 'rgba(233,241,255,.4)' });
  if (sent) txt('Takımını yaz...', 130, inY, { size: 62, weight: 600, align: 'left', color: 'rgba(233,241,255,.4)' });
  let cx = 130;
  if (typed) { txt(typed, 130, inY, { size: 96, align: 'left', color: '#fff' }); cx = 130 + tw(typed, 96) + 10; }
  if (!sent && Math.sin(t * 14) > -0.2) { ctx.fillStyle = LIME; ctx.fillRect(cx, inY - 44, 6, 88); }
  // gönder düğmesi
  const press = bell(t, SEND - 0.08, SEND + 0.14);
  ctx.save(); ctx.translate(918, inY); const bs = 1 - 0.18 * press + (g2 && !sent ? 0.06 * Math.sin(t * 16) : 0); ctx.scale(bs, bs);
  ctx.beginPath(); ctx.arc(0, 0, 54, 0, Math.PI * 2); ctx.fillStyle = g2 ? LIME : 'rgba(255,255,255,.15)'; ctx.fill();
  ctx.fillStyle = g2 ? '#0a0f12' : 'rgba(255,255,255,.5)'; ctx.beginPath(); ctx.moveTo(-18, -24); ctx.lineTo(26, 0); ctx.lineTo(-18, 24); ctx.lineTo(-8, 0); ctx.closePath(); ctx.fill(); ctx.restore();
  // klavye satırı
  const keys = ['A', 'S', 'D', 'F', 'G', 'H', 'J'], kw = 124, kx0 = 540 - (keys.length * (kw + 12) - 12) / 2, ky = 1180;
  keys.forEach((kch, i) => {
    const pt = kch === 'G' ? C.takimini : kch === 'S' ? C.takimini + 0.22 : -9;
    const pr = bell(t, pt - 0.05, pt + 0.2);
    const x = kx0 + i * (kw + 12);
    ctx.save(); ctx.translate(x + kw / 2, ky + 75 + pr * 8); const s = 1 - 0.1 * pr; ctx.scale(s, s);
    rr(-kw / 2, -75, kw, 150, 22); ctx.fillStyle = pr > 0.05 ? LIME : 'rgba(255,255,255,.12)'; ctx.fill();
    txt(kch, 0, 0, { size: 84, weight: 800, color: pr > 0.05 ? '#0a0f12' : 'rgba(255,255,255,.85)' }); ctx.restore();
    if (pr > 0.05) { ctx.save(); ctx.globalAlpha = pr; rr(x - 14, ky - 172, kw + 28, 162, 26); ctx.fillStyle = LIME; ctx.fill(); txt(kch, x + kw / 2, ky - 91, { size: 128, color: '#0a0f12' }); ctx.restore(); }
  });
}
