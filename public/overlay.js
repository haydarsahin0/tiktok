/* Taraftar Ligi — yayın ekranı (genişlik 1080, yükseklik ekrana göre: en az 1920)
 *
 * GÜVENLİ BÖLGE: TikTok canlı yayınında ekranın üstünü (yayıncı adı, izleyici sayısı, kapat)
 * ve altını (yorumlar, yorum kutusu, hediye butonları) uygulama kapatır. Bu yüzden önemli her şey
 * ortadaki "çekirdek" alanda (1080 x 1260) çizilir; üst ve alt kenarlarda sadece süs vardır.
 * Kontrol için adrese ?guides=1 ekle: kapanan bölgeler kırmızı gösterilir.
 */
(() => {
  const W = 1080;
  let H = 1920;
  const CORE_H = 1260; // önemli içeriğin yüksekliği
  const SAFE_TOP = 0.125; // ekranın üst %12,5'i kapanabilir
  const SAFE_BOTTOM = 0.215; // ekranın alt %21,5'i kapanabilir
  let CORE_Y = 240; // çekirdeğin ekrandaki başlangıcı (resize ile hesaplanır)

  const params = new URLSearchParams(location.search);
  const TRANSPARENT = params.get('transparent') === '1';
  const GUIDES = params.get('guides') === '1';
  let TOP_N = 8; // setTeams'te yarışan sayısına göre ayarlanır
  const MAX_FANS = 56;
  const FONT = '"Baloo 2", "Segoe UI", Arial, sans-serif';

  if (TRANSPARENT) document.body.classList.add('transparent');
  const canvas = document.getElementById('c');
  const ctx = canvas.getContext('2d');

  // ---------- ekran boyutu ----------
  // Uzun telefonlarda (19.5:9 vb.) siyah şerit kalmasın diye tuval ekranın boyuna uzar.
  function resize() {
    const vw = innerWidth;
    const vh = innerHeight;
    const nextH = Math.round(Math.min(2600, Math.max(1920, (W * vh) / vw)));
    if (nextH !== H || canvas.height !== nextH) {
      H = nextH;
      canvas.width = W;
      canvas.height = H;
    }
    const cssW = Math.min(vw, (vh * W) / H);
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${(cssW * H) / W}px`;
    const bandTop = H * SAFE_TOP;
    const band = H * (1 - SAFE_TOP - SAFE_BOTTOM);
    CORE_Y = Math.round(bandTop + Math.max(0, (band - CORE_H) / 2));
  }
  addEventListener('resize', resize);
  resize();

  // ---------- çekirdek düzeni (çekirdek içi koordinatlar) ----------
  const L = {
    header: { y: 0, h: 100 },
    raceTop: 110,
    base: 556, // sütunların zemini
    topLimit: 300, // en uzun sütunun tepesi
    stadium: { cx: 540, cy: 800 },
    toastY: 1022,
    info: { y: 1044, h: 126 },
    kings: { y: 1178, h: 82 },
  };
  const RING = { cx: 540, cy: L.stadium.cy, rx: 466, ry: 158 };
  const PITCH = { w: 540, h: 172 };

  // ---------- takıma özel kutlamalar ----------
  // kind: horon | roar | fly | crawl | shout | rain | lightning | fireworks
  const CELEB = {
    ts: { kind: 'horon', title: 'HORON ZAMANI!', sound: 'horon' },
    gs: { kind: 'roar', emoji: '🦁', title: 'CİMBOM BOM BOM!', sound: 'roar' },
    fb: { kind: 'fly', emoji: '🐤', count: 7, title: 'SARI KANARYALAR!', sound: 'chirp' },
    bjk: { kind: 'fly', emoji: '🦅', count: 1, title: 'KARA KARTAL KANATLANDI!', sound: 'wings' },
    konya: { kind: 'fly', emoji: '🦅', count: 1, title: 'ANADOLU KARTALI!', sound: 'wings' },
    bursa: { kind: 'crawl', emoji: '🐊', title: 'TİMSAH UYANDI!', sound: 'chomp' },
    antalya: { kind: 'crawl', emoji: '🦂', title: 'AKREPLER GELİYOR!', sound: 'chomp' },
    denizli: { kind: 'crawl', emoji: '🐓', title: 'HOROZ ÖTTÜ!', sound: 'chant' },
    sivas: { kind: 'shout', shout: 'YİĞİDO!', title: 'YİĞİDOLAR ZİRVEDE!', sound: 'chant' },
    goztepe: { kind: 'shout', shout: 'GÖZ GÖZ!', title: 'GÖZTEPE COŞTU!', sound: 'chant' },
    ksk: { kind: 'shout', shout: 'KAF KAF!', title: 'KAFKAFLAR ZİRVEDE!', sound: 'chant' },
    eskisehir: { kind: 'shout', shout: 'ES ES!', title: 'ES ES ZİRVEDE!', sound: 'chant' },
    amed: { kind: 'shout', shout: 'AMED!', title: 'AMED ZİRVEDE!', sound: 'chant' },
    altay: { kind: 'shout', shout: 'ALTAY!', title: 'İZMİR\'İN ALTAY\'I!', sound: 'chant' },
    erzurum: { kind: 'rain', emoji: '❄️', title: 'DADAŞLAR GELDİ!', sound: 'sparkle' },
    rize: { kind: 'rain', emoji: '☕', title: 'ÇAY DEMLENDİ!', sound: 'sparkle' },
    giresun: { kind: 'rain', emoji: '🌰', title: 'ÇOTANAK GÜCÜ!', sound: 'sparkle' },
    ordu: { kind: 'rain', emoji: '🌰', title: 'FINDIK GİBİ ORDU!', sound: 'sparkle' },
    malatya: { kind: 'rain', emoji: '🍑', title: 'KAYISI GÜCÜ!', sound: 'sparkle' },
    urfa: { kind: 'rain', emoji: '🌶️', title: 'İSOT GİBİ URFA!', sound: 'sparkle' },
    gfk: { kind: 'rain', emoji: '🥜', title: 'FISTIK GİBİ ANTEP!', sound: 'sparkle' },
    kayseri: { kind: 'rain', emoji: '⭐', title: 'KAYSERİ YILDIZLARI!', sound: 'sparkle' },
    samsun: { kind: 'lightning', title: 'KIRMIZI ŞİMŞEK!', sound: 'thunder' },
  };
  const DEFAULT_CELEB = { kind: 'fireworks', title: 'ZİRVE BİZİM!', sound: 'fireworks' };

  // ---------- tema: futbol varsayılan; başka lig sayfası window.LIG.theme ile değiştirir ----------
  const T = {
    title: 'TARAFTAR LİGİ',
    fansLabel: 'taraftar sahada',
    icon: 'jersey', // jersey | idol
    arena: 'pitch', // pitch | stage
    logo: 'crescent', // crescent | star
    ball: '⚽',
    goal: ['GOL!', 'GOOOOL!!'],
    headerColors: ['rgba(200,16,46,.95)', 'rgba(120,8,28,.95)'],
    bg: ['#050d1d', '#0c2a3f', '#0e3b2a', '#04140d'],
    light: 'rgba(255,255,230,.18)',
    infoColor: 'rgba(255,212,0,.96)',
    stand: ['#24313f', '#0f1720'],
    instruction: 'Takımının ADINI ya da PLAKASINI yaz → TARAFTAR OL!',
    captainLine: 'En çok hediye atan, takımının KAPTANI olur!',
    captainCard: 'YENİ KAPTAN!',
    kingsTitle: '👑 TURUN KRALLARI',
    trophiesTitle: '🏆 KUPALAR',
    emptyLine: 'Takımını yaz, sahaya ilk sen çık! 👇',
    needLine: '👇 Takımını yaz, puanın takımına gitsin!',
    roundStart: '🟢 Yeni tur başladı! Takımını yaz, sahaya çık!',
    joinToast: (u, t) => `${u} ${t} taraftarı oldu!`,
    transferToast: (u, from, to) => `🔁 ${u} transfer: ${from} → ${to}`,
    tickerAll: (names) => `Süper Lig'den Anadolu'ya ${names.length} takım: ${names.join(' • ')}`,
    championTitle: (n) => `TUR ${n} ŞAMPİYONU`,
    championMvps: 'Şampiyonluğu getiren krallar',
    leaderSub: (name) => `${name} ZİRVEDE`,
    topN: 8,
    celebrations: CELEB,
    defaultCelebration: DEFAULT_CELEB,
    ...(window.LIG?.theme || {}),
  };
  const CELEB_DUR = 4800;
  const CELEB_COOLDOWN = 25000; // kutlamalar en fazla 25 sn'de bir (daha sık lider değişirse kısa yazı)

  // ---------- durum ----------
  let TEAMS = {};
  let teamOrder = [];
  let state = null;
  let timeOffset = 0;
  const columns = new Map();
  const fans = new Map();
  const banners = [];
  const toasts = [];
  const particles = [];
  const emojiParts = [];
  let flash = null;
  let celeb = null;
  let lastCelebAt = -1e9;
  let shakeUntil = 0;
  let ball = { x: RING.cx, y: RING.cy, t: 1, from: null, to: null };
  let goalText = null;
  let tickerX = 0;
  let lastOrder = null;
  const imgCache = new Map();

  const serverNow = () => Date.now() + timeOffset;
  const fmt = (n) => Math.round(n).toLocaleString('tr-TR');
  const team = (id) => TEAMS[id] || { id, name: id, short: id, code: '?', colors: ['#666', '#ccc'] };
  const upper = (s) => String(s).toLocaleUpperCase('tr-TR');
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const ease = (t) => 1 - Math.pow(1 - t, 3);
  const sfx = (name, ...args) => { try { window.TaraftarAudio?.[name](...args); } catch { /* sessiz */ } };

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

  // ---------- veri girişi (main.js / local.js çağırır) ----------
  window.Overlay = {
    setTeams(teams) {
      TEAMS = Object.fromEntries(teams.map((t) => [t.id, t]));
      teamOrder = teams.map((t) => t.id);
      TOP_N = Math.min(T.topN, teams.length);
    },
    setState(s) {
      const order = s.teams.slice(0, TOP_N).filter((t) => t.points > 0).map((t) => t.id);
      if (lastOrder && order.some((id, i) => {
        const before = lastOrder.indexOf(id);
        return before === -1 ? lastOrder.length > i : before > i;
      })) sfx('rankUp');
      lastOrder = order;
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
        trimBanners();
        bounceTeam(e.team);
        shootBall(e.team, e.points);
        if (e.points >= 1000) confetti(RING.cx, RING.cy, team(e.team).colors, Math.min(160, 30 + e.points / 100));
        sfx('gift', e.points);
        break;
      }
      case 'needTeam':
        banners.push({ kind: 'need', e, dur: 3500 });
        trimBanners();
        break;
      case 'captain':
        banners.push({ kind: 'captain', e, dur: 3200 });
        trimBanners();
        sfx('gift', 1500);
        break;
      case 'pendingApplied':
        toast(`⚽ ${e.user.name} • bekleyen ${fmt(e.points)} puan ${team(e.team).name}'a eklendi!`, e.team);
        bounceTeam(e.team);
        break;
      case 'join':
        toast(T.joinToast(e.user.name, team(e.team).name), e.team);
        break;
      case 'transfer':
        toast(T.transferToast(e.user.name, team(e.from).short, team(e.team).short), e.team);
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
        startCelebration(e.team, e.force);
        break;
      case 'champion':
        celeb = null;
        sfx('champion');
        break;
      case 'roundStart':
        columns.clear();
        toast(T.roundStart, null);
        break;
      default:
    }
  }

  function trimBanners() {
    if (banners.length > 6) banners.splice(1, banners.length - 6);
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
    const gx = T.arena === 'stage'
      ? RING.cx + (Math.random() * 300 - 150)
      : RING.cx + (left ? -1 : 1) * (PITCH.w / 2 - 10);
    ball = { x: RING.cx, y: RING.cy, t: 0, from: { x: RING.cx, y: RING.cy }, to: { x: gx, y: RING.cy + (Math.random() * 40 - 20) }, team: teamId };
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

  function startCelebration(teamId, force = false) {
    const now = performance.now();
    if (!force && now - lastCelebAt < CELEB_COOLDOWN) {
      // Çok sık lider değişiyorsa: sadece kısa "zirve değişti" yazısı
      flash = { team: teamId, start: now, dur: 2600 };
      sfx('leader');
      return;
    }
    lastCelebAt = now;
    const cfg = T.celebrations[teamId] || T.defaultCelebration;
    celeb = { team: teamId, cfg, start: now, dur: CELEB_DUR, pulses: 0, bolts: [], fired: 0 };
    flash = null;
    if (cfg.kind === 'roar') shakeUntil = now + 1100;
    bounceTeam(teamId);
    confetti(RING.cx, RING.cy - 60, team(teamId).colors.concat(['#ffd400']), 80);
    sfx('celebrate', cfg.sound);
  }

  // ---------- taraftar halkası ----------
  function syncFans() {
    const rank = Object.fromEntries(state.teams.map((t, i) => [t.id, i]));
    const list = state.fans.slice(0, MAX_FANS);
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
        cur = { x: RING.cx + Math.cos(ang) * RING.rx * 1.2, y: RING.cy + Math.sin(ang) * RING.ry * 1.2, bounce: 0, bubble: '', bubbleUntil: 0 };
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
      text(upper((user.name || '?').trim().charAt(0)), x, y + 2, { size: r * 1.1, color: t.colors[1] === t.colors[0] ? '#fff' : t.colors[1], stroke: 4 });
    }
    ctx.restore();
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

  function starPath(x, y, R, points = 10, inner = 0.45) {
    ctx.beginPath();
    for (let i = 0; i < points; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / (points / 2);
      const r = i % 2 ? R * inner : R;
      ctx[i ? 'lineTo' : 'moveTo'](x + r * Math.cos(a), y + r * Math.sin(a));
    }
    ctx.closePath();
  }

  // Manifest Ligi: forma yerine üyenin parlak rozeti (harf + yıldız)
  function idolBadge(t, cx, top, w) {
    const r = w * 0.46;
    const y = top + w * 0.5;
    ctx.save();
    ctx.shadowColor = t.colors[0];
    ctx.shadowBlur = 22;
    const g = ctx.createRadialGradient(cx - r * 0.3, y - r * 0.35, r * 0.1, cx, y, r);
    g.addColorStop(0, t.colors[1]);
    g.addColorStop(0.45, t.colors[0]);
    g.addColorStop(1, shadeColor(t.colors[0], -0.4));
    ctx.beginPath(); ctx.arc(cx, y, r, 0, Math.PI * 2);
    ctx.fillStyle = g; ctx.fill();
    ctx.restore();
    ctx.lineWidth = Math.max(3, w * 0.045);
    ctx.strokeStyle = '#fff';
    ctx.beginPath(); ctx.arc(cx, y, r, 0, Math.PI * 2); ctx.stroke();
    text(t.code, cx, y + w * 0.03, { size: w * 0.5, stroke: Math.max(5, w * 0.07), strokeColor: shadeColor(t.colors[0], -0.55) });
    starPath(cx + r * 0.78, y - r * 0.78, w * 0.16);
    ctx.fillStyle = '#fff6b0'; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = '#b8860b'; ctx.stroke();
  }

  function drawIcon(t, cx, top, w) {
    if (T.icon === 'idol') idolBadge(t, cx, top, w);
    else jersey(t, cx, top, w);
  }

  // Kaptan pazıbandı: sarı daire içinde "C"
  function armband(x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = '#ffd400';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#111';
    ctx.stroke();
    text('C', x, y + 1, { size: r * 1.4, color: '#111' });
  }

  function shadeColor(hex, amt) {
    const n = parseInt(String(hex).slice(1), 16);
    const f = (c) => clamp(Math.round(c + (amt < 0 ? c * amt : (255 - c) * amt)), 0, 255);
    return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`;
  }

  // ---------- arka plan (tüm ekran) ----------
  function drawBackground(now) {
    if (TRANSPARENT) { ctx.clearRect(0, 0, W, H); return; }
    const g = ctx.createLinearGradient(0, 0, 0, H);
    const mid = (CORE_Y + L.base) / H;
    g.addColorStop(0, T.bg[0]);
    g.addColorStop(clamp(mid - 0.02, 0, 1), T.bg[1]);
    g.addColorStop(clamp(mid + 0.03, 0, 1), T.bg[2]);
    g.addColorStop(1, T.bg[3]);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    const ly = CORE_Y + 60;
    for (const side of [-1, 1]) {
      const x = side < 0 ? 40 : W - 40;
      const lg = ctx.createRadialGradient(x, ly, 10, x, ly, 800);
      lg.addColorStop(0, T.light);
      lg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = lg;
      ctx.beginPath();
      ctx.moveTo(x, ly);
      ctx.lineTo(W / 2 + side * -80, CORE_Y + L.base);
      ctx.lineTo(W / 2 + side * 440, CORE_Y + L.base);
      ctx.closePath();
      ctx.fill();
    }
    // Üst kenar süsü (kapanabilir bölge, önemli bilgi yok)
    if (CORE_Y > 120) text(`${T.ball}  ${T.title}  ${T.ball}`, W / 2, CORE_Y * 0.55, { size: 40, color: 'rgba(255,255,255,.12)' });
  }

  // ---------- çekirdek: başlık ----------
  function drawHeader() {
    const { y, h } = L.header;
    const g = ctx.createLinearGradient(0, 0, W, 0);
    g.addColorStop(0, T.headerColors[0]);
    g.addColorStop(1, T.headerColors[1]);
    rr(20, y, W - 40, h, 26);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(255,255,255,.25)';
    ctx.stroke();
    const cy = y + h / 2;
    if (T.logo === 'star') {
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(72, cy, 32, 0, Math.PI * 2); ctx.fill();
      starPath(72, cy, 24, 10);
      ctx.fillStyle = '#c2185b'; ctx.fill();
    } else {
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(72, cy, 30, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#b10e28';
      ctx.beginPath(); ctx.arc(81, cy, 24, 0, Math.PI * 2); ctx.fill();
      text('⚽', 74, cy + 2, { size: 30 });
    }
    text(T.title, 118, cy - 16, { size: 48, align: 'left', stroke: 8, max: W - 300 });
    const round = state?.round?.number ?? 1;
    const fanTotal = state ? state.teams.reduce((s, t) => s + t.fans, 0) : 0;
    text(`TUR ${round}  •  ${fmt(fanTotal)} ${T.fansLabel}`, 120, cy + 26, { size: 24, weight: 600, align: 'left', color: '#ffe3e8' });

    // tur sayacı
    const cx = W - 76;
    ctx.beginPath(); ctx.arc(cx, cy, 44, 0, Math.PI * 2);
    ctx.fillStyle = '#0b0f1a'; ctx.fill();
    const r = state?.round;
    let label = '∞';
    let frac = 1;
    if (r && r.endsAt) {
      const left = Math.max(0, r.endsAt - serverNow());
      frac = clamp(left / (r.endsAt - r.startedAt), 0, 1);
      const m = Math.floor(left / 60000);
      const s = Math.floor((left % 60000) / 1000);
      label = m >= 60 ? `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`;
    }
    ctx.lineWidth = 8;
    ctx.beginPath(); ctx.arc(cx, cy, 39, 0, Math.PI * 2); ctx.strokeStyle = 'rgba(255,255,255,.15)'; ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, 39, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * frac);
    ctx.strokeStyle = frac < 0.1 ? '#ff4d4d' : '#ffd400';
    ctx.lineCap = 'round'; ctx.stroke(); ctx.lineCap = 'butt';
    text(label, cx, cy - 4, { size: 24, max: 66 });
    text('TUR', cx, cy + 20, { size: 13, weight: 600, color: '#aab' });
  }

  // ---------- çekirdek: puan yarışı (sütunlar + kaptanlar) ----------
  function drawRace(now, dt) {
    const { base, topLimit, raceTop } = L;
    rr(20, raceTop, W - 40, base - raceTop + 52, 26);
    ctx.fillStyle = 'rgba(0,0,0,.28)';
    ctx.fill();

    const grass = ctx.createLinearGradient(0, base, 0, base + 40);
    grass.addColorStop(0, '#2fae4f'); grass.addColorStop(1, '#1a7a35');
    rr(36, base, W - 72, 36, 12);
    ctx.fillStyle = grass; ctx.fill();

    if (!state) return;
    const top = state.teams.slice(0, TOP_N);
    const leaderPts = Math.max(1, top[0]?.points || 0);
    const colW = TOP_N >= 8 ? 104 : Math.min(150, (W - 72 - (TOP_N - 1) * 24) / TOP_N);
    const gap = TOP_N > 1 ? (W - 72 - TOP_N * colW) / (TOP_N - 1) : 0;
    const k = 1 - Math.pow(0.002, dt / 1000);

    const visible = new Set(top.map((t) => t.id));
    for (const id of columns.keys()) if (!visible.has(id)) columns.delete(id);

    const order = top.map((t, i) => ({ t, i })).reverse();
    for (const { t, i } of order) {
      const tm = team(t.id);
      const targetX = 36 + i * (colW + gap) + colW / 2;
      const minH = t.points > 0 ? 64 : 48;
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

      // forma + puan + taç
      const jw = 84 + pulse * 12;
      const jy = yTop - jw * 0.98 + 8 + Math.sin(now / 300 + i) * 2;
      drawIcon(tm, c.x, jy, jw);
      text(fmt(c.pts), c.x, jy - 18, { size: 28, stroke: 7, max: colW + gap - 4 });
      if (i === 0 && t.points > 0) text('👑', c.x, jy - 52 + Math.sin(now / 250) * 3, { size: 40 });

      // kaptan: sütunun içinde, formanın hemen altında
      const cap = t.captain;
      if (cap && c.h >= 108) {
        const big = c.h >= 160;
        const ar = big ? 23 : 18;
        const ay = yTop + ar + 12;
        avatar(cap, c.x, ay, ar, tm);
        armband(c.x + ar * 0.8, ay - ar * 0.75, big ? 10 : 8);
        if (big) {
          const name = cap.name.length > 9 ? `${cap.name.slice(0, 8)}…` : cap.name;
          ctx.font = `700 15px ${FONT}`;
          const w = Math.min(colW - 4, ctx.measureText(name).width + 12);
          rr(c.x - w / 2, ay + ar + 6, w, 20, 9);
          ctx.fillStyle = 'rgba(0,0,0,.75)'; ctx.fill();
          text(name, c.x, ay + ar + 16, { size: 15, weight: 700, max: colW - 10 });
        }
      }

      ctx.beginPath(); ctx.arc(c.x, base - 22, 17, 0, Math.PI * 2);
      ctx.fillStyle = i === 0 ? '#ffd400' : 'rgba(0,0,0,.65)'; ctx.fill();
      text(String(i + 1), c.x, base - 20, { size: 23, color: i === 0 ? '#111' : '#fff' });
      text(tm.short, c.x, base + 19, { size: 21, stroke: 5, max: colW + gap - 6 });
      if (t.fans && c.h > 220) text(`👥 ${t.fans}`, c.x, base - 56, { size: 19, weight: 600, stroke: 5 });
    }

    // Kısa "zirve değişti" yazısı (kutlama yokken)
    if (flash) {
      const p = (now - flash.start) / flash.dur;
      if (p >= 1) flash = null;
      else titleBand(team(flash.team), 'ZİRVE DEĞİŞTİ!', `${upper(team(flash.team).name)} LİDER`, p);
    }
  }

  // Sütunların üstünde eğik, takım renginde başlık bandı
  function titleBand(tm, title, sub, p) {
    const a = p < 0.12 ? p / 0.12 : p > 0.82 ? (1 - p) / 0.18 : 1;
    const s = 0.8 + 0.2 * ease(Math.min(1, p * 4));
    ctx.save();
    ctx.globalAlpha = clamp(a, 0, 1);
    ctx.translate(W / 2, 330);
    ctx.rotate(-0.05);
    ctx.scale(s, s);
    rr(-470, -82, 940, 164, 26);
    ctx.fillStyle = tm.colors[0]; ctx.fill();
    ctx.lineWidth = 8; ctx.strokeStyle = tm.colors[1]; ctx.stroke();
    text(title, 0, -30, { size: 58, stroke: 10, color: '#ffd400', max: 880 });
    text(sub, 0, 36, { size: 44, stroke: 9, max: 860 });
    ctx.restore();
  }

  function drawPitch(cx, cy) {
    const pw = PITCH.w;
    const ph = PITCH.h;
    const px = cx - pw / 2;
    const py = cy - ph / 2;
    ctx.save();
    rr(px, py, pw, ph, 16);
    ctx.clip();
    for (let i = 0; i < 10; i++) {
      ctx.fillStyle = i % 2 ? '#2e9e48' : '#36b153';
      ctx.fillRect(px + (i * pw) / 10, py, pw / 10 + 1, ph);
    }
    ctx.restore();
    ctx.strokeStyle = 'rgba(255,255,255,.85)';
    ctx.lineWidth = 4;
    rr(px + 8, py + 8, pw - 16, ph - 16, 6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, py + 8); ctx.lineTo(cx, py + ph - 8); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, 36, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeRect(px + 8, cy - 46, 56, 92);
    ctx.strokeRect(px + pw - 64, cy - 46, 56, 92);
    ctx.fillStyle = 'rgba(255,255,255,.9)';
    ctx.fillRect(px - 4, cy - 26, 12, 52);
    ctx.fillRect(px + pw - 8, cy - 26, 12, 52);

  }

  // Manifest Ligi: konser sahnesi (ışıklı zemin + sallanan spotlar + mikrofon)
  function drawStageFloor(now, cx, cy) {
    const pw = PITCH.w;
    const ph = PITCH.h;
    const px = cx - pw / 2;
    const py = cy - ph / 2;
    // spot ışıkları (sahnenin üstünden)
    const spots = ['rgba(255,63,164,.22)', 'rgba(0,184,217,.2)', 'rgba(123,47,247,.22)', 'rgba(255,214,0,.16)'];
    spots.forEach((c, i) => {
      const sx = px + (i + 0.5) * (pw / spots.length);
      const sw = Math.sin(now / 900 + i * 1.7) * 90;
      ctx.beginPath();
      ctx.moveTo(sx, py - 150);
      ctx.lineTo(sx + sw - 70, py + ph);
      ctx.lineTo(sx + sw + 70, py + ph);
      ctx.closePath();
      ctx.fillStyle = c;
      ctx.fill();
    });
    // sahne zemini
    ctx.save();
    rr(px, py, pw, ph, 18);
    const g = ctx.createLinearGradient(0, py, 0, py + ph);
    g.addColorStop(0, '#3a1466');
    g.addColorStop(1, '#16062e');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.clip();
    // ışıklı kareler
    const cols = 12;
    const rows = 4;
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const on = (Math.sin(now / 300 + i * 0.9 + j * 1.3) + 1) / 2;
        ctx.fillStyle = `rgba(255,${120 + j * 30},${220 - i * 8},${0.06 + on * 0.16})`;
        ctx.fillRect(px + (i * pw) / cols + 2, py + (j * ph) / rows + 2, pw / cols - 4, ph / rows - 4);
      }
    }
    ctx.restore();
    rr(px, py, pw, ph, 18);
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(255,255,255,.55)';
    ctx.stroke();
    // ön kenar ışık şeridi
    const edge = ctx.createLinearGradient(px, 0, px + pw, 0);
    edge.addColorStop(0, '#ff3fa4'); edge.addColorStop(0.5, '#ffd400'); edge.addColorStop(1, '#00b8d9');
    ctx.fillStyle = edge;
    ctx.fillRect(px + 10, py + ph - 8, pw - 20, 5);
    text('🎤', cx, cy - 4, { size: 54 });
  }

  // ---------- çekirdek: stadyum ----------
  function drawStadium(now, dt) {
    const { cx, cy } = RING;
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, cy, 528, 198, 0, 0, Math.PI * 2);
    const sg = ctx.createRadialGradient(cx, cy, 150, cx, cy, 540);
    sg.addColorStop(0, T.stand[0]); sg.addColorStop(1, T.stand[1]);
    ctx.fillStyle = sg; ctx.fill();
    ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.stroke();
    ctx.restore();

    if (T.arena === 'stage') drawStageFloor(now, cx, cy);
    else drawPitch(cx, cy);

    // top
    if (ball.t < 1) {
      ball.t = Math.min(1, ball.t + dt / 650);
      const e = ease(ball.t);
      ball.x = lerp(ball.from.x, ball.to.x, e);
      ball.y = lerp(ball.from.y, ball.to.y, e) - Math.sin(e * Math.PI) * 70;
      if (ball.t >= 1) setTimeout(() => { ball = { x: cx, y: cy, t: 1 }; }, 700);
    }
    const bs = 16 + (ball.t < 1 ? Math.sin(ball.t * Math.PI) * 9 : 0);
    if (T.arena !== 'stage' || ball.t < 1) {
      ctx.fillStyle = 'rgba(0,0,0,.3)';
      ctx.beginPath(); ctx.ellipse(ball.x, (ball.to?.y ?? cy) + 16, bs, bs * 0.35, 0, 0, Math.PI * 2); ctx.fill();
      text(T.ball, ball.x, ball.y, { size: bs * 2.1 });
    }

    // taraftarlar (horon kutlamasında o takımın taraftarları sahaya iner, el ele oynar)
    const k = 1 - Math.pow(0.01, dt / 1000);
    const list = [...fans.values()];
    const n = list.length;
    const r = n > 40 ? 19 : n > 24 ? 22 : 26;
    const horon = celeb && celeb.cfg.kind === 'horon' ? celeb : null;
    let dancers = [];
    if (horon) {
      dancers = list.filter((f) => f.team === horon.team).slice(0, 12);
      const m = dancers.length;
      const span = Math.min(470, Math.max(0, m - 1) * 52);
      const sway = Math.sin(now / 260) * 14;
      dancers.forEach((f, i) => {
        const u = m > 1 ? i / (m - 1) : 0.5;
        f.dx = cx - span / 2 + u * span + sway;
        f.dy = cy + 18 + Math.pow(u - 0.5, 2) * 70 + Math.sin(now / 55 + i * 0.7) * 5; // omuz titretme
      });
    }
    const dancing = new Set(dancers);
    for (const f of list) {
      const tx = dancing.has(f) ? f.dx : f.tx;
      const ty = dancing.has(f) ? f.dy : f.ty;
      f.x = lerp(f.x, tx, dancing.has(f) ? Math.min(1, k * 3) : k);
      f.y = lerp(f.y, ty, dancing.has(f) ? Math.min(1, k * 3) : k);
    }
    // el ele tutuşma çizgisi
    if (dancers.length > 1) {
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.strokeStyle = team(horon.team).colors[1] === '#FFFFFF' ? '#fff' : team(horon.team).colors[1];
      ctx.beginPath();
      dancers.forEach((f, i) => (i ? ctx.lineTo(f.x, f.y + r * 0.9) : ctx.moveTo(f.x, f.y + r * 0.9)));
      ctx.stroke();
      ctx.lineCap = 'butt';
    }
    list.sort((a, b) => a.y - b.y);
    for (const f of list) {
      const tm = team(f.team);
      const b = f.bounce && now > f.bounce ? Math.max(0, 1 - (now - f.bounce) / 900) : 0;
      const hop = b ? Math.abs(Math.sin(b * Math.PI * 3)) * 24 : Math.sin(now / 400 + f.x) * 2;
      avatar(f, f.x, f.y - hop, r, tm);
      if (dancing.has(f)) continue; // horon sırasında isimler üst üste binmesin
      const name = f.name.length > 10 ? `${f.name.slice(0, 9)}…` : f.name;
      ctx.font = `700 15px ${FONT}`;
      const w = ctx.measureText(name).width + 14;
      rr(f.x - w / 2, f.y + r + 4, w, 21, 10);
      ctx.fillStyle = 'rgba(0,0,0,.7)'; ctx.fill();
      text(name, f.x, f.y + r + 15, { size: 15, weight: 700 });
    }
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
      rr(cx - 280, cy - 36, 560, 72, 20);
      ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fill();
      text(T.emptyLine, cx, cy, { size: 30, max: 540 });
    }

    if (goalText && now > goalText.start) {
      const p = (now - goalText.start) / 1400;
      if (p >= 1) goalText = null;
      else {
        const tm = team(goalText.team);
        ctx.save();
        ctx.globalAlpha = p > 0.75 ? (1 - p) / 0.25 : 1;
        ctx.translate(cx, cy - 120);
        const s = 0.6 + ease(Math.min(1, p * 3)) * (goalText.big ? 0.65 : 0.4);
        ctx.scale(s, s);
        const c2 = tm.colors[1];
        text(goalText.big ? T.goal[1] : T.goal[0], 0, 0, { size: 120, stroke: 16, color: c2 === '#FFFFFF' || c2 === '#111111' ? '#ffd400' : c2, strokeColor: tm.colors[0] });
        ctx.restore();
      }
    }
  }

  // ---------- takım kutlaması ----------
  function drawCelebration(now) {
    if (!celeb) return;
    const t = now - celeb.start;
    const p = t / celeb.dur;
    if (p >= 1) { celeb = null; return; }
    const { cfg } = celeb;
    const tm = team(celeb.team);
    const { cx, cy } = RING;
    const fade = p > 0.85 ? (1 - p) / 0.15 : 1;

    if (cfg.kind === 'horon') {
      // uçuşan notalar
      ctx.save();
      ctx.globalAlpha = fade;
      for (let j = 0; j < 7; j++) {
        const yy = cy - 30 - ((t / 6 + j * 37) % 150);
        text(j % 2 ? '♪' : '♫', cx - 240 + j * 80, yy, { size: 34, color: '#ffd400', stroke: 5 });
      }
      ctx.restore();
    } else if (cfg.kind === 'roar') {
      const s = 0.4 + ease(Math.min(1, p * 2.5)) * 1.9;
      ctx.save();
      ctx.globalAlpha = fade;
      for (let j = 0; j < 3; j++) {
        const rp = ((t / 900) + j / 3) % 1;
        ctx.beginPath();
        ctx.arc(cx, cy, 60 + rp * 420, 0, Math.PI * 2);
        ctx.lineWidth = 10 * (1 - rp);
        ctx.strokeStyle = j % 2 ? tm.colors[1] : tm.colors[0];
        ctx.globalAlpha = fade * (1 - rp);
        ctx.stroke();
      }
      ctx.globalAlpha = fade;
      ctx.translate(cx, cy - 20);
      ctx.scale(s, s);
      text(cfg.emoji, 0, 0, { size: 90 });
      ctx.restore();
    } else if (cfg.kind === 'fly') {
      const count = cfg.count || 1;
      const size = count > 1 ? 70 : 150;
      for (let j = 0; j < count; j++) {
        const u = clamp(p * 1.25 - j * 0.06, 0, 1);
        const x = lerp(W + 160, -160, u);
        const y = (count > 1 ? 420 + (j % 3) * 70 : 520) + Math.sin(u * Math.PI * 3 + j) * 50 + (count > 1 ? 0 : -Math.sin(u * Math.PI) * 140);
        text(cfg.emoji, x, y, { size });
      }
    } else if (cfg.kind === 'crawl') {
      const u = clamp(p * 1.1, 0, 1);
      const x = lerp(W + 140, -140, u);
      const y = cy + 150;
      const chomp = Math.abs(Math.sin(t / 120));
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.sin(t / 150) * 0.06);
      ctx.scale(1, 0.9 + chomp * 0.2);
      text(cfg.emoji, 0, 0, { size: 150 });
      ctx.restore();
    } else if (cfg.kind === 'shout') {
      const beats = [0.04, 0.3, 0.56];
      beats.forEach((b, j) => {
        if (p >= b && celeb.pulses <= j) { celeb.pulses = j + 1; bounceTeam(celeb.team); }
      });
      const lastBeat = beats.filter((b) => p >= b).pop() ?? 0;
      const bp = clamp((p - lastBeat) / 0.26, 0, 1);
      ctx.save();
      ctx.globalAlpha = fade * (1 - bp * 0.5);
      ctx.translate(cx, cy - 10);
      const s = 0.7 + ease(bp) * 0.6;
      ctx.scale(s, s);
      text(cfg.shout, 0, 0, { size: 110, stroke: 16, color: '#fff', strokeColor: tm.colors[0] });
      ctx.restore();
    } else if (cfg.kind === 'rain') {
      if (p < 0.65 && Math.random() < 0.5) {
        emojiParts.push({ x: Math.random() * W, y: 120, vy: 3 + Math.random() * 4, rot: Math.random() * 6, vr: Math.random() * 0.1 - 0.05, ch: cfg.emoji, size: 34 + Math.random() * 26 });
      }
    } else if (cfg.kind === 'lightning') {
      const strikes = [0.03, 0.22, 0.45];
      strikes.forEach((b, j) => {
        if (p >= b && celeb.fired <= j) {
          celeb.fired = j + 1;
          const x0 = 150 + Math.random() * (W - 300);
          const pts = [[x0, 120]];
          for (let y = 120; y < cy; y += 70) pts.push([pts[pts.length - 1][0] + (Math.random() * 120 - 60), y + 70]);
          celeb.bolts.push({ pts, at: now });
        }
      });
      for (const bolt of celeb.bolts) {
        const age = now - bolt.at;
        if (age > 350) continue;
        const a = 1 - age / 350;
        ctx.save();
        ctx.globalAlpha = a * 0.35;
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, -CORE_Y, W, H);
        ctx.globalAlpha = a;
        ctx.strokeStyle = '#fff6a8';
        ctx.lineWidth = 10;
        ctx.shadowColor = tm.colors[0];
        ctx.shadowBlur = 30;
        ctx.beginPath();
        bolt.pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
        ctx.stroke();
        ctx.restore();
      }
    } else {
      // havai fişek
      const shots = [0.02, 0.18, 0.34, 0.5];
      shots.forEach((b, j) => {
        if (p >= b && celeb.fired <= j) {
          celeb.fired = j + 1;
          confetti(150 + Math.random() * (W - 300), 180 + Math.random() * 250, tm.colors.concat(['#ffd400', '#fff']), 70);
        }
      });
    }

    titleBand(tm, cfg.title, T.leaderSub(upper(tm.name)), p);
  }

  function drawEmojiParts(dt) {
    const f = dt / 16.7;
    for (let i = emojiParts.length - 1; i >= 0; i--) {
      const e = emojiParts[i];
      e.y += e.vy * f;
      e.rot += e.vr * f;
      if (e.y > CORE_H) { emojiParts.splice(i, 1); continue; }
      ctx.save();
      ctx.globalAlpha = clamp((CORE_H - e.y) / 200, 0, 1);
      ctx.translate(e.x, e.y);
      ctx.rotate(e.rot);
      text(e.ch, 0, 0, { size: e.size });
      ctx.restore();
    }
  }

  // ---------- kartlar ve bildirimler ----------
  function drawBanners(now) {
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
        const yy = L.toastY;
        rr(W / 2 - w / 2, yy - 19, w, 38, 19);
        ctx.fillStyle = 'rgba(0,0,0,.8)'; ctx.fill();
        if (tt.team) badge(team(tt.team), W / 2 - w / 2 + 22, yy, 15);
        text(msg, W / 2 + (tt.team ? 14 : 0), yy + 1, { size: 24, weight: 700, max: w - 56 });
        ctx.restore();
      }
    }

    const b = banners[0];
    if (!b) return;
    if (!b.start) b.start = now;
    const p = (now - b.start) / b.dur;
    if (p >= 1) { banners.shift(); return; }
    const a = p < 0.08 ? p / 0.08 : p > 0.88 ? (1 - p) / 0.12 : 1;
    const e = b.e;
    const tm = b.kind === 'need' ? { colors: ['#f5b400', '#7a4a00'], name: '', code: '?' } : team(e.team);
    ctx.save();
    ctx.globalAlpha = a;
    const y = RING.cy + (1 - ease(Math.min(1, p * 8))) * 50;
    ctx.translate(W / 2, y);
    const g = ctx.createLinearGradient(-400, 0, 400, 0);
    if (b.kind === 'captain') {
      g.addColorStop(0, '#ffd400');
      g.addColorStop(1, '#b8860b');
    } else {
      g.addColorStop(0, tm.colors[0]);
      g.addColorStop(1, shadeColor(tm.colors[0], -0.45));
    }
    rr(-410, -84, 820, 168, 30);
    ctx.fillStyle = g; ctx.fill();
    ctx.lineWidth = 7; ctx.strokeStyle = b.kind === 'captain' ? tm.colors[0] : tm.colors[1]; ctx.stroke();
    avatar(e.user, -320, 0, 54, b.kind === 'need' ? { colors: ['#333', '#ffd400'] } : tm);
    if (b.kind === 'captain') {
      armband(-280, -40, 18);
      text(T.captainCard, -238, -44, { size: 36, align: 'left', color: '#111', max: 560 });
      text(e.user.name, -238, 4, { size: 40, align: 'left', stroke: 7, max: 520 });
      text(`${tm.name} • ${fmt(e.points)} puan`, -238, 50, { size: 28, weight: 700, align: 'left', color: '#3a2a00', max: 520 });
      badge(tm, 330, 0, 44);
    } else {
      const gi = image(e.image);
      if (gi) ctx.drawImage(gi, 250, -70, 80, 80);
      text(e.user.name, -240, -44, { size: 38, align: 'left', stroke: 7, max: b.kind === 'gift' ? 470 : 600 });
      if (b.kind === 'gift') {
        text(`${e.gift}${e.count > 1 ? ` x${e.count}` : ''}  →  ${upper(tm.name)}`, -240, 4, { size: 30, weight: 700, align: 'left', stroke: 6, max: 600 });
        text(`+${fmt(e.points)} PUAN`, -240, 50, { size: 46, align: 'left', stroke: 8, color: '#ffd400' });
        badge(tm, 330, 38, 40);
      } else {
        text(`${e.gift} gönderdi • ${fmt(e.points)} puan bekliyor!`, -240, 6, { size: 30, weight: 700, align: 'left', stroke: 6, max: 620 });
        text(T.needLine, -240, 50, { size: 32, align: 'left', stroke: 7, color: '#ffd400', max: 620 });
      }
    }
    ctx.restore();
  }

  // ---------- basit simgeler (emoji yerine; her cihazda aynı) ----------
  function giftIcon(x, y, r) {
    ctx.fillStyle = '#c8102e';
    ctx.fillRect(x - r, y - r * 0.55, r * 2, r * 1.55);
    ctx.fillStyle = '#e8213d';
    ctx.fillRect(x - r * 1.15, y - r * 0.95, r * 2.3, r * 0.5);
    ctx.fillStyle = '#ffd400';
    ctx.fillRect(x - r * 0.18, y - r * 0.95, r * 0.36, r * 1.95);
    ctx.beginPath();
    ctx.ellipse(x - r * 0.45, y - r * 1.15, r * 0.42, r * 0.25, -0.5, 0, Math.PI * 2);
    ctx.ellipse(x + r * 0.45, y - r * 1.15, r * 0.42, r * 0.25, 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
  function heartIcon(x, y, r) {
    ctx.fillStyle = '#e8213d';
    ctx.beginPath();
    ctx.moveTo(x, y + r * 0.95);
    ctx.bezierCurveTo(x - r * 1.5, y - r * 0.1, x - r * 0.9, y - r * 1.25, x, y - r * 0.45);
    ctx.bezierCurveTo(x + r * 0.9, y - r * 1.25, x + r * 1.5, y - r * 0.1, x, y + r * 0.95);
    ctx.fill();
  }
  function plusIcon(x, y, r) {
    ctx.fillStyle = '#1f6fd1';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.fillRect(x - r * 0.55, y - r * 0.14, r * 1.1, r * 0.28);
    ctx.fillRect(x - r * 0.14, y - r * 0.55, r * 0.28, r * 1.1);
  }

  function drawInfo() {
    const { y, h } = L.info;
    rr(20, y, W - 40, h, 26);
    ctx.fillStyle = T.infoColor; ctx.fill();
    text(T.instruction, W / 2, y + 30, { size: 34, color: '#111', max: W - 80 });
    // Puan satırı: emoji yok (her telefonda farklı genişlikte çiziliyordu); simgeler elle çizilir,
    // her bilgi kendi üçte birlik bölümünde ortalanır, taşamaz.
    const r = state?.rules || { pointsPerCoin: 100, pointsPerLike: 1, pointsPerFollow: 50 };
    const items = [
      [giftIcon, `1 jeton = ${fmt(r.pointsPerCoin)} puan`],
      [heartIcon, `beğeni = ${fmt(r.pointsPerLike)} puan`],
      [plusIcon, `takip = ${fmt(r.pointsPerFollow)} puan`],
    ];
    const colW = (W - 80) / 3;
    items.forEach(([icon, label], i) => {
      const cx = 40 + colW * i + colW / 2;
      ctx.font = `700 25px ${FONT}`;
      const tw = Math.min(ctx.measureText(label).width, colW - 60);
      const x0 = cx - (tw + 34) / 2;
      icon(x0 + 12, y + 68, 12);
      text(label, x0 + 34, y + 69, { size: 25, weight: 700, color: '#3a2a00', align: 'left', max: colW - 60 });
      if (i) { ctx.fillStyle = 'rgba(58,42,0,.35)'; ctx.fillRect(40 + colW * i - 1, y + 56, 2, 26); }
    });
    // Kaptan satırı: emoji yerine sütunlardaki sarı "C" bandı (her telefonda aynı görünür)
    const msg = T.captainLine;
    ctx.font = `800 26px ${FONT}`;
    const tw = ctx.measureText(msg).width;
    const total = tw + 40;
    const x0 = W / 2 - total / 2;
    rr(x0 - 14, y + 86, total + 28, 34, 17);
    ctx.fillStyle = 'rgba(122,30,0,.14)'; ctx.fill();
    armband(x0 + 13, y + 103, 13);
    text(msg, x0 + 40, y + 104, { size: 26, color: '#7a1e00', align: 'left' });
  }

  // Krallar ve kupalar: tek sıra, kompakt
  function drawKings() {
    const { y, h } = L.kings;
    const pw = (W - 60) / 2;
    for (const [i, title] of [[0, T.kingsTitle], [1, T.trophiesTitle]]) {
      const x = 20 + i * (pw + 20);
      rr(x, y, pw, h, 22);
      ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fill();
      text(title, x + 18, y + 18, { size: 19, align: 'left', color: '#ffd400' });
    }
    if (!state) return;
    const slot = (pw - 20) / 3;
    const mv = state.mvps.slice(0, 3);
    if (!mv.length) text('İlk hediyeyi atan kral olur!', 20 + pw / 2, y + 54, { size: 21, weight: 600, color: '#ccd' });
    mv.forEach((m, i) => {
      const ex = 30 + i * slot;
      const tm = team(m.team);
      avatar(m, ex + 18, y + 55, 16, tm);
      text(m.name, ex + 42, y + 46, { size: 17, weight: 700, align: 'left', max: slot - 48 });
      text(fmt(m.points), ex + 42, y + 66, { size: 16, weight: 700, align: 'left', color: '#9f9', max: slot - 48 });
    });
    const x2 = 40 + pw;
    const tr = state.trophies.slice(0, 3);
    if (!tr.length) text('İlk kupa kimin olacak?', x2 + pw / 2, y + 54, { size: 21, weight: 600, color: '#ccd' });
    tr.forEach((t, i) => {
      const ex = x2 + 10 + i * slot;
      const tm = team(t.team);
      badge(tm, ex + 18, y + 55, 16);
      text(tm.short, ex + 42, y + 46, { size: 17, weight: 700, align: 'left', max: slot - 48 });
      text(`${t.count} 🏆`, ex + 42, y + 66, { size: 16, weight: 700, align: 'left', color: '#ffd400' });
    });
  }

  // Alt kenarda kayan yazı (kapanabilir bölge: önemsiz bilgi)
  function drawTicker(dt) {
    const y = CORE_Y + CORE_H + 18;
    if (y + 48 > H) return;
    rr(20, y, W - 40, 46, 23);
    ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fill();
    if (!state) return;
    const rest = state.teams.slice(TOP_N).filter((t) => t.points > 0);
    const all = T.tickerAll(teamOrder.map((id) => team(id).name));
    let msg = rest.length
      ? `${rest.slice(0, 25).map((t, i) => `${TOP_N + i + 1}. ${team(t.id).name} ${fmt(t.points)}`).join('   ⚽   ')}${rest.length < 4 ? `      ${all}` : ''}`
      : all;
    msg += '      ';
    ctx.font = `700 24px ${FONT}`;
    const w = ctx.measureText(msg).width;
    tickerX -= dt * 0.09;
    if (tickerX < -w) tickerX += w;
    ctx.save();
    rr(20, y, W - 40, 46, 23);
    ctx.clip();
    for (let x = tickerX + 40; x < W; x += w) text(msg, x, y + 24, { size: 24, weight: 700, align: 'left', color: '#c8d6ea' });
    ctx.restore();
  }

  function drawStatus() {
    const live = state?.live;
    if (live?.debug && params.get('debug') === '1') {
      rr(20, 640, W - 40, 26 * live.debug.length + 20, 12);
      ctx.fillStyle = 'rgba(0,0,0,.85)'; ctx.fill();
      live.debug.forEach((line, i) => text(line, 36, 662 + i * 26, { size: 18, weight: 600, align: 'left', color: '#9f9', max: W - 72 }));
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
      setup: 'DEMO • Ayarlar: sol üst köşeye 3 kez dokun',
    }[live.state] || live.state;
    ctx.font = `700 19px ${FONT}`;
    const lw = Math.max(280, ctx.measureText(label).width + 36);
    rr(W / 2 - lw / 2, L.raceTop + 8, lw, 28, 14);
    ctx.fillStyle = live.state === 'demo' || live.state === 'setup' ? 'rgba(80,80,255,.85)' : 'rgba(200,60,0,.9)'; ctx.fill();
    text(label, W / 2, L.raceTop + 23, { size: 19, weight: 700 });
  }

  function drawChampion(now) {
    const c = state?.champion;
    if (!c || !state.championUntil || serverNow() > state.championUntil) return false;
    const tm = team(c.team);
    ctx.save();
    ctx.translate(0, -CORE_Y);
    ctx.fillStyle = 'rgba(3,6,12,.93)';
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
    ctx.save();
    ctx.translate(W / 2, 260);
    ctx.rotate(now / 3000);
    for (let i = 0; i < 12; i++) {
      ctx.rotate(Math.PI / 6);
      ctx.fillStyle = i % 2 ? `${tm.colors[0]}55` : `${tm.colors[1]}44`;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-90, -1300); ctx.lineTo(90, -1300); ctx.fill();
    }
    ctx.restore();
    if (Math.random() < 0.5) confetti(Math.random() * W, -20, tm.colors.concat(['#ffd400']), 3);
    text(T.championTitle(c.round), W / 2, 40, { size: 60, stroke: 12, color: '#ffd400' });
    const s = 1 + Math.sin(now / 300) * 0.04;
    ctx.save(); ctx.translate(W / 2, 90); ctx.scale(s, s); drawIcon(tm, 0, 0, 300); ctx.restore();
    text('🏆', W / 2 - 230, 250, { size: 110 });
    text('🏆', W / 2 + 230, 250, { size: 110 });
    text(upper(tm.name), W / 2, 470, { size: 88, stroke: 14, max: W - 80 });
    text(`${fmt(c.points)} puan  •  ${c.trophies}. şampiyonluk`, W / 2, 550, { size: 42, stroke: 8, color: '#ffd400' });
    if (c.runnerUp) text(`2. ${team(c.runnerUp.team).name} — ${fmt(c.runnerUp.points)}`, W / 2, 610, { size: 32, weight: 700, stroke: 6, color: '#ddd' });
    if (c.mvps?.length) {
      text(T.championMvps, W / 2, 690, { size: 34, stroke: 6 });
      c.mvps.slice(0, 3).forEach((m, i) => {
        const x = W / 2 + (i - (Math.min(3, c.mvps.length) - 1) / 2) * 300;
        avatar(m, x, 790, 56, team(m.team));
        text(m.name, x, 872, { size: 28, stroke: 6, max: 280 });
        text(fmt(m.points), x, 910, { size: 26, color: '#9f9', stroke: 6 });
      });
    }
    const left = Math.max(0, Math.ceil((state.championUntil - serverNow()) / 1000));
    text(`Yeni tur ${left} sn içinde başlıyor — takımını yaz, hazır ol!`, W / 2, 1010, { size: 32, weight: 700, stroke: 6, max: W - 60 });
    return true;
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
      if (p.life <= 0 || p.y > H) { particles.splice(i, 1); continue; }
      ctx.save();
      ctx.globalAlpha = Math.min(1, p.life * 2);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2);
      ctx.restore();
    }
  }

  // Kontrol için: TikTok arayüzünün kapatabileceği bölgeler (?guides=1)
  function drawGuides() {
    ctx.save();
    ctx.fillStyle = 'rgba(255,0,0,.28)';
    ctx.fillRect(0, 0, W, H * SAFE_TOP);
    ctx.fillRect(0, H * (1 - SAFE_BOTTOM), W, H * SAFE_BOTTOM);
    ctx.strokeStyle = '#0f0';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, CORE_Y, W - 4, CORE_H);
    text('TikTok üst arayüzü (yayıncı, izleyici sayısı)', W / 2, H * SAFE_TOP / 2, { size: 30, stroke: 6 });
    text('TikTok alt arayüzü (yorumlar, butonlar)', W / 2, H * (1 - SAFE_BOTTOM / 2), { size: 30, stroke: 6 });
    ctx.restore();
  }

  // ---------- döngü ----------
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(100, now - last);
    last = now;
    drawBackground(now);
    drawTicker(dt);

    ctx.save();
    ctx.translate(0, CORE_Y);
    if (now < shakeUntil) ctx.translate((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10);
    const champ = state?.champion && state.championUntil && serverNow() <= state.championUntil;
    if (!champ) {
      drawHeader();
      drawRace(now, dt);
      drawStadium(now, dt);
      drawCelebration(now);
      drawEmojiParts(dt);
      drawBanners(now);
      drawInfo();
      drawKings();
      drawStatus();
    } else {
      drawChampion(now);
    }
    drawParticles(dt);
    ctx.restore();

    if (GUIDES) drawGuides();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
