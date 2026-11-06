/* Taraftar Ligi — yayın ekranı (1080x1920 dikey) */
(() => {
  const W = 1080;
  const H = 1920;
  const params = new URLSearchParams(location.search);
  const TRANSPARENT = params.get('transparent') === '1';
  const SOUND = params.get('sound') === '1';
  const TOP_N = 8;
  const FONT = '"Baloo 2", "Segoe UI", Arial, sans-serif';

  if (TRANSPARENT) document.body.classList.add('transparent');
  const canvas = document.getElementById('c');
  const ctx = canvas.getContext('2d');

  // ---------- durum ----------
  let TEAMS = {};
  let teamOrder = [];
  let state = null;
  let timeOffset = 0;
  const columns = new Map(); // teamId -> {x, h, pts}
  const fans = new Map(); // uid -> {x, y, bubble, bubbleUntil, bounce}
  const banners = []; // büyük hediye kartları
  const toasts = []; // küçük bildirimler
  const particles = [];
  let flash = null; // lider değişti yazısı
  let ball = { x: 540, y: 1150, t: 1, from: null, to: null };
  let goalText = null;
  let tickerX = 0;
  const imgCache = new Map();

  const serverNow = () => Date.now() + timeOffset;
  const fmt = (n) => Math.round(n).toLocaleString('tr-TR');
  const team = (id) => TEAMS[id] || { id, name: id, short: id, code: '?', colors: ['#666', '#ccc'] };
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const ease = (t) => 1 - Math.pow(1 - t, 3);

  function image(url) {
    if (!url) return null;
    let img = imgCache.get(url);
    if (!img) {
      img = new Image();
      img.referrerPolicy = 'no-referrer';
      img.src = url;
      img.onerror = () => { img.failed = true; };
      imgCache.set(url, img);
      if (imgCache.size > 400) imgCache.delete(imgCache.keys().next().value);
    }
    return img.complete && !img.failed && img.naturalWidth ? img : null;
  }

  // ---------- veri girişi ----------
  // Veri iki yerden gelebilir: Node sunucusu (WebSocket) ya da tarayıcının içinde
  // çalışan oyun (GitHub Pages / tablet). İkisi de bu fonksiyonları çağırır (bkz. main.js).
  window.Overlay = {
    setTeams(teams) {
      TEAMS = Object.fromEntries(teams.map((t) => [t.id, t]));
      teamOrder = teams.map((t) => t.id);
    },
    setState(s) {
      state = s;
      timeOffset = s.now - Date.now();
      syncFans();
    },
    event(e) { onEvent(e); },
  };

  // ---------- olaylar ----------
  function onEvent(e) {
    switch (e.type) {
      case 'gift': {
        const big = e.points >= 5000;
        banners.push({ kind: 'gift', e, dur: big ? 4200 : e.points >= 1000 ? 3000 : 2000 });
        if (banners.length > 6) banners.splice(1, banners.length - 6);
        bounceTeam(e.team);
        shootBall(e.team, e.points);
        if (e.points >= 1000) confetti(540, 1150, team(e.team).colors, Math.min(160, 30 + e.points / 100));
        sound(big ? 'goal' : 'pop');
        break;
      }
      case 'needTeam':
        banners.push({ kind: 'need', e, dur: 3500 });
        break;
      case 'pendingApplied':
        toast(`⚽ ${e.user.name} • bekleyen ${fmt(e.points)} puan ${team(e.team).name}'a eklendi!`, e.team);
        bounceTeam(e.team);
        break;
      case 'join':
        toast(`${e.user.name} ${team(e.team).name} taraftarı oldu!`, e.team);
        sound('tick');
        break;
      case 'transfer':
        toast(`🔁 ${e.user.name} transfer: ${team(e.from).short} → ${team(e.team).short}`, e.team);
        break;
      case 'follow':
        toast(`➕ ${e.user.name} takip etti • ${team(e.team).short} +${fmt(e.points)}`, e.team);
        break;
      case 'share':
        toast(`📣 ${e.user.name} paylaştı • ${team(e.team).short} +${fmt(e.points)}`, e.team);
        break;
      case 'chat': {
        const f = fans.get(e.user.id);
        if (f) { f.bubble = e.text; f.bubbleUntil = performance.now() + 4500; }
        break;
      }
      case 'leader':
        flash = { team: e.team, start: performance.now(), dur: 2800 };
        sound('goal');
        break;
      case 'champion':
        sound('goal');
        break;
      case 'roundStart':
        columns.clear();
        toast('🟢 Yeni tur başladı! Takımını yaz, sahaya çık!', null);
        break;
      default:
    }
  }

  function toast(text, teamId) {
    toasts.push({ text, team: teamId });
    if (toasts.length > 8) toasts.splice(1, 1);
  }

  function bounceTeam(teamId) {
    const t = performance.now();
    for (const f of fans.values()) if (f.team === teamId) f.bounce = t + Math.random() * 200;
  }

  function shootBall(teamId, points) {
    const left = Math.random() < 0.5;
    ball = { x: 540, y: 1150, t: 0, from: { x: 540, y: 1150 }, to: { x: left ? 232 : 848, y: 1150 + (Math.random() * 60 - 30) }, team: teamId };
    if (points >= 500) goalText = { team: teamId, start: performance.now() + 450, big: points >= 5000 };
  }

  function confetti(x, y, colors, n) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = 6 + Math.random() * 14;
      particles.push({
        x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 8,
        r: 6 + Math.random() * 8, rot: Math.random() * 6, vr: Math.random() * 0.4 - 0.2,
        c: colors[i % colors.length], life: 1,
      });
    }
    if (particles.length > 900) particles.splice(0, particles.length - 900);
  }

  // ---------- ses (isteğe bağlı: ?sound=1) ----------
  let audio = null;
  function sound(kind) {
    if (!SOUND) return;
    try {
      audio = audio || new AudioContext();
      const t = audio.currentTime;
      if (kind === 'goal') {
        // kalabalık uğultusu: filtrelenmiş gürültü
        const len = audio.sampleRate * 1.6;
        const buf = audio.createBuffer(1, len, audio.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.sin((i / len) * Math.PI);
        const src = audio.createBufferSource();
        src.buffer = buf;
        const f = audio.createBiquadFilter();
        f.type = 'bandpass'; f.frequency.value = 900; f.Q.value = 0.6;
        const g = audio.createGain(); g.gain.value = 0.5;
        src.connect(f).connect(g).connect(audio.destination);
        src.start(t);
      }
      const o = audio.createOscillator();
      const g = audio.createGain();
      o.type = kind === 'tick' ? 'triangle' : 'square';
      o.frequency.setValueAtTime(kind === 'tick' ? 880 : 1760, t);
      if (kind === 'goal') o.frequency.setValueAtTime(2200, t + 0.12);
      g.gain.setValueAtTime(kind === 'tick' ? 0.05 : 0.08, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + (kind === 'goal' ? 0.5 : 0.15));
      o.connect(g).connect(audio.destination);
      o.start(t); o.stop(t + 0.6);
    } catch { /* ses yoksa geç */ }
  }

  // ---------- taraftar halkası ----------
  const RING = { cx: 540, cy: 1150, rx: 468, ry: 222 };
  function syncFans() {
    const list = state.fans;
    const rank = Object.fromEntries(state.teams.map((t, i) => [t.id, i]));
    // Aynı takımın taraftarları yan yana dursun (tribün grupları)
    const sorted = [...list].sort((a, b) => (rank[a.team] ?? 99) - (rank[b.team] ?? 99) || b.points - a.points);
    const ids = new Set();
    const n = sorted.length;
    sorted.forEach((f, i) => {
      ids.add(f.id);
      const ang = -Math.PI / 2 + (i / Math.max(n, 1)) * Math.PI * 2;
      const tx = RING.cx + Math.cos(ang) * RING.rx;
      const ty = RING.cy + Math.sin(ang) * RING.ry;
      let cur = fans.get(f.id);
      if (!cur) {
        cur = { x: RING.cx + Math.cos(ang) * RING.rx * 1.25, y: RING.cy + Math.sin(ang) * RING.ry * 1.25, bounce: 0, bubble: '', bubbleUntil: 0 };
        fans.set(f.id, cur);
      }
      Object.assign(cur, { tx, ty, team: f.team, name: f.name, avatar: f.avatar, points: f.points });
    });
    for (const id of fans.keys()) if (!ids.has(id)) fans.delete(id);
  }

  // ---------- çizim yardımcıları ----------
  function rr(x, y, w, h, r) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
  }

  function text(str, x, y, { size = 32, weight = 800, color = '#fff', align = 'center', base = 'middle', stroke = 0, strokeColor = 'rgba(0,0,0,.85)', max = 0 } = {}) {
    let s = size;
    ctx.font = `${weight} ${s}px ${FONT}`;
    if (max) {
      while (s > 10 && ctx.measureText(str).width > max) { s -= 1; ctx.font = `${weight} ${s}px ${FONT}`; }
    }
    ctx.textAlign = align;
    ctx.textBaseline = base;
    if (stroke) {
      ctx.lineJoin = 'round';
      ctx.lineWidth = stroke;
      ctx.strokeStyle = strokeColor;
      ctx.strokeText(str, x, y);
    }
    ctx.fillStyle = color;
    ctx.fillText(str, x, y);
  }

  function stripes(x, y, w, h, colors, count = 5) {
    ctx.fillStyle = colors[0];
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = colors[1];
    const sw = w / (count * 2 - 1);
    for (let i = 1; i < count * 2 - 1; i += 2) ctx.fillRect(x + i * sw, y, sw, h);
  }

  function jerseyPath(cx, top, w) {
    const p = [
      [-0.16, 0], [0, 0.11], [0.16, 0], [0.33, 0.05], [0.52, 0.24], [0.41, 0.37], [0.3, 0.29],
      [0.3, 0.98], [-0.3, 0.98], [-0.3, 0.29], [-0.41, 0.37], [-0.52, 0.24], [-0.33, 0.05],
    ];
    ctx.beginPath();
    p.forEach(([px, py], i) => (i ? ctx.lineTo : ctx.moveTo).call(ctx, cx + px * w, top + py * w));
    ctx.closePath();
  }

  function jersey(t, cx, top, w) {
    ctx.save();
    jerseyPath(cx, top, w);
    ctx.shadowColor = 'rgba(0,0,0,.5)';
    ctx.shadowBlur = 14;
    ctx.fillStyle = t.colors[0];
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.clip();
    stripes(cx - w * 0.3, top, w * 0.6, w, t.colors, 3);
    // kollar ana renkte
    ctx.fillStyle = t.colors[0];
    ctx.fillRect(cx - w * 0.6, top, w * 0.3, w * 0.45);
    ctx.fillRect(cx + w * 0.3, top, w * 0.3, w * 0.45);
    ctx.restore();
    ctx.save();
    jerseyPath(cx, top, w);
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(255,255,255,.9)';
    ctx.stroke();
    ctx.restore();
    text(t.code, cx, top + w * 0.58, { size: w * 0.26, stroke: 7, max: w * 0.56 });
  }

  function badge(t, x, y, r) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.clip();
    stripes(x - r, y - r, r * 2, r * 2, t.colors, 3);
    ctx.restore();
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.lineWidth = Math.max(2, r * 0.12);
    ctx.strokeStyle = '#fff';
    ctx.stroke();
    text(t.code, x, y + 1, { size: r * 0.72, stroke: Math.max(3, r * 0.2), max: r * 1.7 });
  }

  function avatar(user, x, y, r, t) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.closePath();
    const img = image(user.avatar);
    if (img) {
      ctx.clip();
      ctx.drawImage(img, x - r, y - r, r * 2, r * 2);
    } else {
      ctx.fillStyle = t.colors[0];
      ctx.fill();
      text((user.name || '?').trim().charAt(0).toLocaleUpperCase('tr-TR'), x, y + 2, { size: r * 1.1, color: t.colors[1] === t.colors[0] ? '#fff' : t.colors[1], stroke: 4 });
    }
    ctx.restore();
    // iki renkli halka
    ctx.lineWidth = Math.max(3, r * 0.22);
    ctx.beginPath();
    ctx.arc(x, y, r + ctx.lineWidth / 2, -Math.PI / 2, Math.PI / 2);
    ctx.strokeStyle = t.colors[0];
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, r + ctx.lineWidth / 2, Math.PI / 2, Math.PI * 1.5);
    ctx.strokeStyle = t.colors[1];
    ctx.stroke();
  }

  // ---------- sahneler ----------
  function drawBackground(now) {
    if (TRANSPARENT) { ctx.clearRect(0, 0, W, H); return; }
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#071226');
    g.addColorStop(0.42, '#0c2a3f');
    g.addColorStop(0.47, '#0e3b2a');
    g.addColorStop(1, '#061a12');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    // projektör ışıkları
    for (const side of [-1, 1]) {
      const x = side < 0 ? 60 : W - 60;
      const lg = ctx.createRadialGradient(x, 180, 10, x, 180, 900);
      lg.addColorStop(0, 'rgba(255,255,230,.22)');
      lg.addColorStop(1, 'rgba(255,255,230,0)');
      ctx.fillStyle = lg;
      ctx.beginPath();
      ctx.moveTo(x, 170);
      ctx.lineTo(W / 2 + side * -60, 880);
      ctx.lineTo(W / 2 + side * 460, 880);
      ctx.closePath();
      ctx.fill();
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = `rgba(255,255,220,${0.7 + 0.3 * Math.sin(now / 500 + i)})`;
        ctx.beginPath();
        ctx.arc(x + (i - 1) * 22 * side, 170, 8, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function drawHeader(now) {
    const g = ctx.createLinearGradient(0, 0, W, 0);
    g.addColorStop(0, 'rgba(200,16,46,.92)');
    g.addColorStop(1, 'rgba(120,8,28,.92)');
    rr(20, 20, W - 40, 128, 28);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(255,255,255,.25)';
    ctx.stroke();
    // ay-yıldız esintili küçük süs
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(86, 84, 34, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#b10e28';
    ctx.beginPath(); ctx.arc(96, 84, 27, 0, Math.PI * 2); ctx.fill();
    text('⚽', 86, 86, { size: 34 });
    text('TARAFTAR LİGİ', 140, 66, { size: 58, align: 'left', stroke: 8 });
    const round = state?.round?.number ?? 1;
    const fanTotal = state ? state.teams.reduce((s, t) => s + t.fans, 0) : 0;
    text(`TUR ${round}  •  ${fmt(fanTotal)} taraftar sahada`, 142, 118, { size: 28, weight: 600, align: 'left', color: '#ffe3e8' });

    // tur sayacı
    const cx = W - 104;
    const cy = 84;
    ctx.beginPath(); ctx.arc(cx, cy, 56, 0, Math.PI * 2);
    ctx.fillStyle = '#0b0f1a'; ctx.fill();
    const r = state?.round;
    let label = '∞';
    let frac = 1;
    if (r && r.endsAt) {
      const left = Math.max(0, r.endsAt - serverNow());
      const total = r.endsAt - r.startedAt;
      frac = clamp(left / total, 0, 1);
      const m = Math.floor(left / 60000);
      const s = Math.floor((left % 60000) / 1000);
      label = m >= 60
        ? `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}:${String(s).padStart(2, '0')}`
        : `${m}:${String(s).padStart(2, '0')}`;
    }
    ctx.lineWidth = 10;
    ctx.beginPath(); ctx.arc(cx, cy, 50, 0, Math.PI * 2); ctx.strokeStyle = 'rgba(255,255,255,.15)'; ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, 50, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * frac);
    ctx.strokeStyle = frac < 0.1 ? '#ff4d4d' : '#ffd400';
    ctx.lineCap = 'round'; ctx.stroke(); ctx.lineCap = 'butt';
    text(label, cx, cy - 4, { size: 30, max: 84 });
    text('TUR', cx, cy + 26, { size: 16, weight: 600, color: '#aab' });
  }

  function drawRace(now, dt) {
    const base = 828;
    const topLimit = 380;
    // alan
    rr(20, 168, W - 40, 708, 30);
    ctx.fillStyle = 'rgba(0,0,0,.28)';
    ctx.fill();
    text('CANLI PUAN DURUMU', 44, 196, { size: 26, align: 'left', color: '#ffd400', stroke: 5 });
    text('🎁 hediye at, takımın yükselsin!', W - 44, 196, { size: 24, weight: 600, align: 'right', color: '#dfe' });

    // çim zemin
    const grass = ctx.createLinearGradient(0, base, 0, base + 46);
    grass.addColorStop(0, '#2fae4f'); grass.addColorStop(1, '#1a7a35');
    rr(36, base, W - 72, 40, 12);
    ctx.fillStyle = grass; ctx.fill();

    if (!state) return;
    const top = state.teams.slice(0, TOP_N);
    const leaderPts = Math.max(1, top[0]?.points || 0);
    const colW = 104;
    const gap = (W - 72 - TOP_N * colW) / (TOP_N - 1);
    const k = 1 - Math.pow(0.002, dt / 1000); // kare hızından bağımsız yumuşak geçiş

    const visible = new Set(top.map((t) => t.id));
    for (const id of columns.keys()) if (!visible.has(id)) columns.delete(id);

    // önce arkadakiler, sonra lider (lider en üstte çizilsin)
    const order = top.map((t, i) => ({ t, i })).reverse();
    for (const { t, i } of order) {
      const tm = team(t.id);
      const targetX = 36 + i * (colW + gap) + colW / 2;
      const minH = t.points > 0 ? 72 : 52;
      const targetH = minH + (t.points / leaderPts) * (base - topLimit - minH);
      let c = columns.get(t.id);
      if (!c) { c = { x: targetX, h: 0, pts: 0, pulse: 0 }; columns.set(t.id, c); }
      if (t.points > c.lastPts) c.pulse = now;
      c.lastPts = t.points;
      c.x = lerp(c.x, targetX, k);
      c.h = lerp(c.h, targetH, k * 0.8);
      c.pts = lerp(c.pts, t.points, k);
      const pulse = clamp(1 - (now - c.pulse) / 600, 0, 1);

      const x = c.x - colW / 2;
      const yTop = base - c.h;
      // sütun
      ctx.save();
      rr(x, yTop, colW, c.h + 6, [18, 18, 0, 0]);
      ctx.clip();
      stripes(x, yTop, colW, c.h + 6, tm.colors, 3);
      const shade = ctx.createLinearGradient(x, 0, x + colW, 0);
      shade.addColorStop(0, 'rgba(255,255,255,.25)');
      shade.addColorStop(0.5, 'rgba(255,255,255,0)');
      shade.addColorStop(1, 'rgba(0,0,0,.35)');
      ctx.fillStyle = shade;
      ctx.fillRect(x, yTop, colW, c.h + 6);
      if (pulse) { ctx.fillStyle = `rgba(255,255,255,${0.45 * pulse})`; ctx.fillRect(x, yTop, colW, c.h + 6); }
      ctx.restore();
      rr(x, yTop, colW, c.h + 6, [18, 18, 0, 0]);
      ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.stroke();

      // forma + puan
      const jw = 96 + pulse * 14;
      const jy = yTop - jw * 0.98 + 10 + Math.sin(now / 300 + i) * 2;
      jersey(tm, c.x, jy, jw);
      text(fmt(c.pts), c.x, jy - 22, { size: 30, stroke: 7, max: colW + gap - 4 });
      if (i === 0 && t.points > 0) text('👑', c.x, jy - 62 + Math.sin(now / 250) * 4, { size: 46 });

      // sıra numarası
      ctx.beginPath(); ctx.arc(c.x, base - 26, 19, 0, Math.PI * 2);
      ctx.fillStyle = i === 0 ? '#ffd400' : 'rgba(0,0,0,.65)'; ctx.fill();
      text(String(i + 1), c.x, base - 24, { size: 26, color: i === 0 ? '#111' : '#fff' });
      // isim
      text(tm.short, c.x, base + 21, { size: 22, stroke: 5, max: colW + gap - 6 });
      if (t.fans && c.h > 130) text(`👥 ${t.fans}`, c.x, base - 62, { size: 20, weight: 600, stroke: 5 });
    }

    // lider değişti
    if (flash) {
      const p = (now - flash.start) / flash.dur;
      if (p >= 1) flash = null;
      else {
        const tm = team(flash.team);
        const a = p < 0.15 ? p / 0.15 : p > 0.8 ? (1 - p) / 0.2 : 1;
        ctx.save();
        ctx.globalAlpha = a;
        ctx.translate(W / 2, 470);
        ctx.rotate(-0.06);
        ctx.scale(0.8 + 0.2 * ease(Math.min(1, p * 4)), 0.8 + 0.2 * ease(Math.min(1, p * 4)));
        rr(-460, -86, 920, 172, 26);
        ctx.fillStyle = tm.colors[0]; ctx.fill();
        ctx.lineWidth = 8; ctx.strokeStyle = tm.colors[1]; ctx.stroke();
        text('ZİRVE DEĞİŞTİ!', 0, -34, { size: 54, stroke: 10, color: '#ffd400' });
        text(`${tm.name.toLocaleUpperCase('tr-TR')} LİDER`, 0, 34, { size: 58, stroke: 10, max: 860 });
        ctx.restore();
      }
    }
  }

  function drawStadium(now, dt) {
    const { cx, cy } = RING;
    // tribün
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, cy, 528, 268, 0, 0, Math.PI * 2);
    const sg = ctx.createRadialGradient(cx, cy, 200, cx, cy, 540);
    sg.addColorStop(0, '#24313f'); sg.addColorStop(1, '#0f1720');
    ctx.fillStyle = sg; ctx.fill();
    ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.stroke();
    ctx.restore();

    // saha
    const pw = 620;
    const ph = 250;
    const px = cx - pw / 2;
    const py = cy - ph / 2;
    ctx.save();
    rr(px, py, pw, ph, 18);
    ctx.clip();
    for (let i = 0; i < 10; i++) {
      ctx.fillStyle = i % 2 ? '#2e9e48' : '#36b153';
      ctx.fillRect(px + (i * pw) / 10, py, pw / 10 + 1, ph);
    }
    ctx.restore();
    ctx.strokeStyle = 'rgba(255,255,255,.85)';
    ctx.lineWidth = 4;
    rr(px + 10, py + 10, pw - 20, ph - 20, 6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, py + 10); ctx.lineTo(cx, py + ph - 10); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, 46, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeRect(px + 10, cy - 62, 70, 124);
    ctx.strokeRect(px + pw - 80, cy - 62, 70, 124);
    // kaleler
    ctx.fillStyle = 'rgba(255,255,255,.9)';
    ctx.fillRect(px - 4, cy - 34, 14, 68);
    ctx.fillRect(px + pw - 10, cy - 34, 14, 68);

    // top
    if (ball.t < 1) {
      ball.t = Math.min(1, ball.t + dt / 650);
      const e = ease(ball.t);
      ball.x = lerp(ball.from.x, ball.to.x, e);
      ball.y = lerp(ball.from.y, ball.to.y, e) - Math.sin(e * Math.PI) * 90;
      if (ball.t >= 1) setTimeout(() => { ball = { x: 540, y: 1150, t: 1 }; }, 700);
    }
    const bs = 18 + (ball.t < 1 ? Math.sin(ball.t * Math.PI) * 10 : 0);
    ctx.fillStyle = 'rgba(0,0,0,.3)';
    ctx.beginPath(); ctx.ellipse(ball.x, (ball.to?.y ?? cy) + 18, bs, bs * 0.35, 0, 0, Math.PI * 2); ctx.fill();
    text('⚽', ball.x, ball.y, { size: bs * 2.1 });

    // taraftarlar
    const k = 1 - Math.pow(0.01, dt / 1000);
    const list = [...fans.values()];
    const n = list.length;
    const r = n > 50 ? 19 : n > 30 ? 23 : 27;
    list.sort((a, b) => a.y - b.y);
    for (const f of list) {
      f.x = lerp(f.x, f.tx, k);
      f.y = lerp(f.y, f.ty, k);
      const tm = team(f.team);
      const b = f.bounce && now > f.bounce ? Math.max(0, 1 - (now - f.bounce) / 900) : 0;
      const hop = b ? Math.abs(Math.sin(b * Math.PI * 3)) * 26 : Math.sin(now / 400 + f.x) * 2;
      avatar(f, f.x, f.y - hop, r, tm);
      const name = f.name.length > 10 ? `${f.name.slice(0, 9)}…` : f.name;
      ctx.font = `700 15px ${FONT}`;
      const w = ctx.measureText(name).width + 14;
      rr(f.x - w / 2, f.y + r + 4, w, 21, 10);
      ctx.fillStyle = 'rgba(0,0,0,.7)'; ctx.fill();
      text(name, f.x, f.y + r + 15, { size: 15, weight: 700 });
    }
    // konuşma balonları en üstte
    for (const f of list) {
      if (f.bubbleUntil > now && f.bubble) {
        const msg = f.bubble.length > 26 ? `${f.bubble.slice(0, 25)}…` : f.bubble;
        ctx.font = `700 22px ${FONT}`;
        const w = ctx.measureText(msg).width + 26;
        const bx = clamp(f.x - w / 2, 10, W - 10 - w);
        const by = f.y - r - 54;
        rr(bx, by, w, 38, 14);
        ctx.fillStyle = '#fff'; ctx.fill();
        ctx.beginPath(); ctx.moveTo(f.x - 8, by + 37); ctx.lineTo(f.x + 8, by + 37); ctx.lineTo(f.x, by + 48); ctx.fill();
        text(msg, bx + w / 2, by + 20, { size: 22, color: '#111' });
      }
    }

    if (!n) {
      rr(cx - 290, cy - 40, 580, 80, 20);
      ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fill();
      text('Takımını yaz, sahaya ilk sen çık! 👇', cx, cy, { size: 32 });
    }

    // GOL yazısı
    if (goalText && now > goalText.start) {
      const p = (now - goalText.start) / 1400;
      if (p >= 1) goalText = null;
      else {
        const tm = team(goalText.team);
        ctx.save();
        ctx.globalAlpha = p > 0.75 ? (1 - p) / 0.25 : 1;
        ctx.translate(cx, cy - 150);
        const s = 0.6 + ease(Math.min(1, p * 3)) * (goalText.big ? 0.7 : 0.45);
        ctx.scale(s, s);
        text(goalText.big ? 'GOOOOL!!' : 'GOL!', 0, 0, { size: 120, stroke: 16, color: tm.colors[1] === '#FFFFFF' || tm.colors[1] === '#111111' ? '#ffd400' : tm.colors[1], strokeColor: tm.colors[0] });
        ctx.restore();
      }
    }
  }

  function drawBanners(now) {
    // küçük bildirimler: stadyumla bilgi şeridi arasında tek satır, sırayla
    let tt = toasts[0];
    if (tt) {
      if (!tt.shown) tt.shown = now;
      const dur = Math.max(1100, 3000 - (toasts.length - 1) * 600);
      const age = now - tt.shown;
      if (age > dur) { toasts.shift(); tt = null; }
      if (tt) {
        const a = clamp(Math.min(age / 150, (dur - age) / 250), 0, 1);
        ctx.save();
        ctx.globalAlpha = a;
        ctx.font = `700 24px ${FONT}`;
        const msg = tt.text.length > 56 ? `${tt.text.slice(0, 55)}…` : tt.text;
        const w = Math.min(W - 60, ctx.measureText(msg).width + (tt.team ? 70 : 40));
        const yy = 1446;
        rr(W / 2 - w / 2, yy - 20, w, 40, 20);
        ctx.fillStyle = 'rgba(0,0,0,.8)'; ctx.fill();
        if (tt.team) badge(team(tt.team), W / 2 - w / 2 + 22, yy, 15);
        text(msg, W / 2 + (tt.team ? 14 : 0), yy + 1, { size: 24, weight: 700, max: w - 56 });
        ctx.restore();
      }
    }

    // büyük hediye kartı (sırayla)
    const b = banners[0];
    if (!b) return;
    if (!b.start) b.start = now;
    const p = (now - b.start) / b.dur;
    if (p >= 1) { banners.shift(); return; }
    const a = p < 0.08 ? p / 0.08 : p > 0.88 ? (1 - p) / 0.12 : 1;
    const e = b.e;
    const tm = b.kind === 'gift' ? team(e.team) : { colors: ['#f5b400', '#7a4a00'], name: '', code: '?' };
    ctx.save();
    ctx.globalAlpha = a;
    const y = 1150 + (1 - ease(Math.min(1, p * 8))) * 60;
    ctx.translate(W / 2, y);
    const g = ctx.createLinearGradient(-400, 0, 400, 0);
    g.addColorStop(0, tm.colors[0]);
    g.addColorStop(1, shadeColor(tm.colors[0], -0.45));
    rr(-410, -88, 820, 176, 30);
    ctx.fillStyle = g; ctx.fill();
    ctx.lineWidth = 7; ctx.strokeStyle = tm.colors[1]; ctx.stroke();
    avatar(e.user, -320, 0, 56, b.kind === 'gift' ? tm : { colors: ['#333', '#ffd400'] });
    const gi = image(e.image);
    if (gi) ctx.drawImage(gi, 250, -70, 80, 80);
    text(e.user.name, -240, -46, { size: 38, align: 'left', stroke: 7, max: b.kind === 'gift' ? 470 : 600 });
    if (b.kind === 'gift') {
      text(`${e.gift}${e.count > 1 ? ` x${e.count}` : ''}  →  ${tm.name.toLocaleUpperCase('tr-TR')}`, -240, 4, { size: 30, weight: 700, align: 'left', stroke: 6, color: '#fff', max: 600 });
      text(`+${fmt(e.points)} PUAN`, -240, 52, { size: 46, align: 'left', stroke: 8, color: '#ffd400' });
      badge(tm, 330, 40, 40);
    } else {
      text(`${e.gift} gönderdi • ${fmt(e.points)} puan bekliyor!`, -240, 6, { size: 30, weight: 700, align: 'left', stroke: 6, max: 620 });
      text('👇 Takımını yaz, puanın takımına gitsin!', -240, 52, { size: 32, align: 'left', stroke: 7, color: '#ffd400', max: 620 });
    }
    ctx.restore();
  }

  function shadeColor(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    const f = (c) => clamp(Math.round(c + (amt < 0 ? c * amt : (255 - c) * amt)), 0, 255);
    return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`;
  }

  function drawInfo() {
    const y = 1478;
    rr(20, y, W - 40, 128, 28);
    ctx.fillStyle = 'rgba(255,212,0,.95)'; ctx.fill();
    text('💬 Takımının ADINI ya da PLAKASINI yaz → TARAFTAR OL!', W / 2, y + 42, { size: 36, color: '#111', max: W - 80 });
    const r = state?.rules || { pointsPerCoin: 100, pointsPerLike: 1, pointsPerFollow: 50 };
    text(`🎁 1 jeton = ${fmt(r.pointsPerCoin)} puan    ❤️ beğeni = ${fmt(r.pointsPerLike)} puan    ➕ takip = ${fmt(r.pointsPerFollow)} puan`, W / 2, y + 94, { size: 27, weight: 700, color: '#3a2a00', max: W - 80 });
  }

  function drawPanels() {
    const y = 1624;
    const h = 214;
    const pw = (W - 60) / 2;
    for (const [i, title] of [[0, '👑 TURUN KRALLARI'], [1, '🏆 ŞAMPİYONLUKLAR']]) {
      const x = 20 + i * (pw + 20);
      rr(x, y, pw, h, 24);
      ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fill();
      text(title, x + 22, y + 30, { size: 26, align: 'left', color: '#ffd400' });
    }
    if (!state) return;
    const mv = state.mvps.slice(0, 4);
    if (!mv.length) text('İlk hediyeyi atan kral olur!', 20 + pw / 2, y + 120, { size: 24, weight: 600, color: '#ccd' });
    mv.forEach((m, i) => {
      const yy = y + 76 + i * 40;
      const tm = team(m.team);
      text(`${i + 1}.`, 42, yy, { size: 24, align: 'left', color: i === 0 ? '#ffd400' : '#fff' });
      avatar(m, 92, yy, 15, tm);
      text(m.name, 118, yy, { size: 23, weight: 700, align: 'left', max: pw - 230 });
      text(fmt(m.points), 20 + pw - 18, yy, { size: 23, align: 'right', color: '#9f9' });
    });
    const x2 = 40 + pw;
    const tr = state.trophies.slice(0, 4);
    if (!tr.length) text('İlk kupa kimin olacak?', x2 + pw / 2, y + 120, { size: 24, weight: 600, color: '#ccd' });
    tr.forEach((t, i) => {
      const yy = y + 76 + i * 40;
      const tm = team(t.team);
      badge(tm, x2 + 36, yy, 16);
      text(tm.name, x2 + 64, yy, { size: 23, weight: 700, align: 'left', max: pw - 160 });
      text(`${t.count} 🏆`, x2 + pw - 18, yy, { size: 23, align: 'right', color: '#ffd400' });
    });
  }

  function drawTicker(dt) {
    const y = 1852;
    rr(20, y, W - 40, 52, 26);
    ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fill();
    if (!state) return;
    const rest = state.teams.slice(TOP_N).filter((t) => t.points > 0);
    let msg;
    if (rest.length) {
      msg = rest.slice(0, 25).map((t, i) => `${TOP_N + i + 1}. ${team(t.id).name} ${fmt(t.points)}`).join('   ⚽   ');
    } else {
      msg = `Süper Lig'den Anadolu'ya ${teamOrder.length} takım: ${teamOrder.map((id) => team(id).name).join(' • ')}`;
    }
    msg += '      ';
    ctx.font = `700 26px ${FONT}`;
    const w = ctx.measureText(msg).width;
    tickerX -= dt * 0.09;
    if (tickerX < -w) tickerX += w;
    ctx.save();
    rr(20, y, W - 40, 52, 26);
    ctx.clip();
    for (let x = tickerX + 40; x < W; x += w) text(msg, x, y + 28, { size: 26, weight: 700, align: 'left', color: '#e6f0ff' });
    ctx.restore();
  }

  function drawStatus() {
    const live = state?.live;
    if (live?.debug && params.get('debug') === '1') {
      // Hata ayıklama: TikTok'tan gelen son olay türleri
      rr(20, 1180, W - 40, 26 * live.debug.length + 20, 12);
      ctx.fillStyle = 'rgba(0,0,0,.85)'; ctx.fill();
      live.debug.forEach((line, i) => text(line, 36, 1202 + i * 26, { size: 18, weight: 600, align: 'left', color: '#9f9', max: W - 72 }));
    }
    if (!live || live.state === 'connected') return;
    const label = {
      demo: 'DEMO MODU',
      connecting: 'TikTok\'a bağlanıyor…',
      reconnecting: 'Yeniden bağlanıyor…',
      offline: 'Yayın bekleniyor',
      error: 'Bağlantı hatası',
      idle: 'Hazırlanıyor',
      auth: 'API anahtarı hatalı — ayarlara bak',
      setup: 'DEMO • Ayarlar için ekrana dokun',
    }[live.state] || live.state;
    ctx.font = `700 20px ${FONT}`;
    const lw = Math.max(300, ctx.measureText(label).width + 40);
    rr(W / 2 - lw / 2, 156, lw, 30, 15);
    ctx.fillStyle = live.state === 'demo' || live.state === 'setup' ? 'rgba(80,80,255,.8)' : 'rgba(200,60,0,.85)'; ctx.fill();
    text(label, W / 2, 172, { size: 20, weight: 700 });
  }

  function drawChampion(now) {
    const c = state?.champion;
    if (!c || !state.championUntil || serverNow() > state.championUntil) return;
    const tm = team(c.team);
    ctx.fillStyle = 'rgba(3,6,12,.92)';
    ctx.fillRect(0, 0, W, H);
    // ışık hüzmeleri
    ctx.save();
    ctx.translate(W / 2, 640);
    ctx.rotate(now / 3000);
    for (let i = 0; i < 12; i++) {
      ctx.rotate(Math.PI / 6);
      ctx.fillStyle = i % 2 ? `${tm.colors[0]}55` : `${tm.colors[1]}44`;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-90, -1200); ctx.lineTo(90, -1200); ctx.fill();
    }
    ctx.restore();
    if (Math.random() < 0.5) confetti(Math.random() * W, -20, tm.colors.concat(['#ffd400']), 3);
    text(`TUR ${c.round} ŞAMPİYONU`, W / 2, 300, { size: 64, stroke: 12, color: '#ffd400' });
    const s = 1 + Math.sin(now / 300) * 0.04;
    ctx.save(); ctx.translate(W / 2, 400); ctx.scale(s, s); jersey(tm, 0, 0, 380); ctx.restore();
    text('🏆', W / 2 - 240, 560, { size: 120 });
    text('🏆', W / 2 + 240, 560, { size: 120 });
    text(tm.name.toLocaleUpperCase('tr-TR'), W / 2, 860, { size: 96, stroke: 14, max: W - 80 });
    text(`${fmt(c.points)} puan  •  ${c.trophies}. şampiyonluk`, W / 2, 950, { size: 44, stroke: 8, color: '#ffd400' });
    if (c.runnerUp) text(`2. ${team(c.runnerUp.team).name} — ${fmt(c.runnerUp.points)}`, W / 2, 1020, { size: 34, weight: 700, stroke: 6, color: '#ddd' });
    if (c.mvps?.length) {
      text('Şampiyonluğu getiren krallar', W / 2, 1110, { size: 36, color: '#fff', stroke: 6 });
      c.mvps.slice(0, 3).forEach((m, i) => {
        const x = W / 2 + (i - (Math.min(3, c.mvps.length) - 1) / 2) * 300;
        avatar(m, x, 1220, 60, team(m.team));
        text(m.name, x, 1310, { size: 30, stroke: 6, max: 280 });
        text(fmt(m.points), x, 1350, { size: 28, color: '#9f9', stroke: 6 });
      });
    }
    const left = Math.max(0, Math.ceil((state.championUntil - serverNow()) / 1000));
    text(`Yeni tur ${left} sn içinde başlıyor — takımını yaz, hazır ol!`, W / 2, 1450, { size: 34, weight: 700, stroke: 6, max: W - 60 });
  }

  function drawParticles(dt) {
    const f = dt / 16.7;
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.vy += 0.45 * f;
      p.vx *= 0.99;
      p.x += p.vx * f;
      p.y += p.vy * f;
      p.rot += p.vr * f;
      p.life -= 0.006 * f;
      if (p.life <= 0 || p.y > H + 40) { particles.splice(i, 1); continue; }
      ctx.save();
      ctx.globalAlpha = Math.min(1, p.life * 2);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2);
      ctx.restore();
    }
  }

  // ---------- döngü ----------
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(100, now - last);
    last = now;
    drawBackground(now);
    drawHeader(now);
    drawRace(now, dt);
    drawStadium(now, dt);
    drawBanners(now);
    drawInfo();
    drawPanels();
    drawTicker(dt);
    drawStatus();
    drawChampion(now);
    drawParticles(dt);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
