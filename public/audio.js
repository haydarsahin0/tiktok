/* Taraftar Ligi — ses motoru
 * Arka plan müziği ve efektler tamamen tarayıcıda üretilir (Web Audio), hazır ses dosyası yok.
 * Müzik özgündür: telif sorunu yok, TikTok yayında sesi kısmaz.
 * Ayarlar: tablette Ayarlar sayfası ya da adres parametreleri (?sound=0, ?music=0, ?sfx=0).
 */
(() => {
  const params = new URLSearchParams(location.search);
  const DEFAULTS = { music: true, musicVolume: 0.35, sfx: true, sfxVolume: 0.6 };
  let cfg = { ...DEFAULTS };
  try { Object.assign(cfg, JSON.parse(localStorage.getItem('taraftar.config') || '{}').audio || {}); } catch { /* yok */ }
  if (params.has('music')) cfg.music = params.get('music') !== '0';
  if (params.has('sfx')) cfg.sfx = params.get('sfx') !== '0';
  if (params.get('sound') === '0') { cfg.music = false; cfg.sfx = false; }

  // iPhone/iPad: zil sessizdeyken de çalabilmesi için ses oturumu "oynatma" olmalı (Safari 16.4+)
  try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch { /* yok */ }

  const BPM = 94;
  const EIGHTH = 60 / BPM / 2;
  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

  let ctx = null;
  let master, musicVol, duck, sfxVol, reverbIn, delayIn, noiseBuf, out;
  let musicOn = false;
  let schedTimer = null;
  let nextTime = 0;
  let step = 0;

  // ---------- kurulum ----------
  function impulse(seconds, decay) {
    const len = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return buf;
  }

  function init() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();

    // Ana çıkış: yumuşatma (tiz kesme) + sıkıştırıcı, hiçbir ses ani patlamasın
    const soft = ctx.createBiquadFilter();
    soft.type = 'lowpass';
    soft.frequency.value = 6500;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -20;
    comp.ratio.value = 4;
    comp.attack.value = 0.01;
    comp.release.value = 0.3;
    master = ctx.createGain();
    master.gain.value = 2.4; // ölçülü: müzik ≈ -28 LUFS (arka planda), efektler biraz önde
    master.connect(soft).connect(comp).connect(ctx.destination);
    out = comp;
    ctx.onstatechange = () => hint();

    // Yankı (stadyum havası)
    const reverb = ctx.createConvolver();
    reverb.buffer = impulse(2.4, 2.8);
    reverbIn = ctx.createGain();
    reverbIn.gain.value = 1;
    const reverbOut = ctx.createGain();
    reverbOut.gain.value = 0.3;
    reverbIn.connect(reverb).connect(reverbOut).connect(master);

    // Müzik kanalı: ses seviyesi -> efekt sırasında hafif kısma (duck)
    musicVol = ctx.createGain();
    musicVol.gain.value = 0;
    duck = ctx.createGain();
    duck.gain.value = 1;
    musicVol.connect(duck);
    duck.connect(master);
    const musicSend = ctx.createGain();
    musicSend.gain.value = 0.35;
    duck.connect(musicSend).connect(reverbIn);

    // Arpej için yumuşak eko
    const delay = ctx.createDelay(1);
    delay.delayTime.value = EIGHTH * 3;
    const fb = ctx.createGain();
    fb.gain.value = 0.25;
    const dlp = ctx.createBiquadFilter();
    dlp.type = 'lowpass';
    dlp.frequency.value = 2200;
    delayIn = ctx.createGain();
    delayIn.gain.value = 0.3;
    delayIn.connect(delay);
    delay.connect(dlp).connect(fb).connect(delay);
    dlp.connect(musicVol);

    // Efekt kanalı
    sfxVol = ctx.createGain();
    sfxVol.gain.value = cfg.sfx ? cfg.sfxVolume : 0;
    sfxVol.connect(master);
    const sfxSend = ctx.createGain();
    sfxSend.gain.value = 0.4;
    sfxVol.connect(sfxSend).connect(reverbIn);

    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate);
    const nd = noiseBuf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < nd.length; i++) { // pembe gürültüye yakın (daha yumuşak)
      last = 0.97 * last + 0.03 * (Math.random() * 2 - 1);
      nd[i] = last * 6;
    }
    return ctx;
  }

  function env(g, t, peak, attack, decay, sustain = 0.0001, hold = 0) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), t + attack);
    if (hold) g.gain.setValueAtTime(Math.max(peak, 0.0002), t + attack + hold);
    g.gain.exponentialRampToValueAtTime(Math.max(sustain, 0.0001), t + attack + hold + decay);
  }

  function osc(type, freq, t, stop, dest, detune = 0) {
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    o.detune.value = detune;
    o.connect(dest);
    o.start(t);
    o.stop(stop);
    return o;
  }

  function noise(t, dur, dest) {
    const s = ctx.createBufferSource();
    s.buffer = noiseBuf;
    s.connect(dest);
    s.start(t, Math.random() * 1.5, dur);
    return s;
  }

  // ---------- müzik enstrümanları ----------
  function pad(notes, t, dur) {
    for (const m of notes) {
      const g = ctx.createGain();
      const f = ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = 900;
      f.Q.value = 0.4;
      f.connect(g).connect(musicVol);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.022, t + 1.4);
      g.gain.setValueAtTime(0.022, t + dur - 0.4);
      g.gain.linearRampToValueAtTime(0.0001, t + dur + 1.2);
      osc('sawtooth', mtof(m), t, t + dur + 1.3, f, -6);
      osc('sawtooth', mtof(m), t, t + dur + 1.3, f, 6);
    }
  }

  function bass(m, t, len) {
    const g = ctx.createGain();
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = 260;
    f.connect(g).connect(musicVol);
    env(g, t, 0.16, 0.02, len, 0.0001);
    osc('triangle', mtof(m), t, t + len + 0.1, f);
  }

  function pluck(m, t, vel) {
    const g = ctx.createGain();
    g.connect(musicVol);
    g.connect(delayIn);
    env(g, t, 0.05 * vel, 0.005, 0.38);
    osc('triangle', mtof(m), t, t + 0.5, g);
    const g2 = ctx.createGain();
    g2.connect(g);
    env(g2, t, 0.35, 0.003, 0.25);
    osc('sine', mtof(m + 12), t, t + 0.3, g2);
  }

  function bell(m, t, vel) {
    // melodi: marimba benzeri yumuşak ses
    const g = ctx.createGain();
    g.connect(musicVol);
    g.connect(delayIn);
    env(g, t, 0.045 * vel, 0.004, 0.7);
    osc('sine', mtof(m), t, t + 0.8, g);
    const g2 = ctx.createGain();
    g2.connect(g);
    env(g2, t, 0.18, 0.003, 0.12);
    osc('sine', mtof(m) * 4.0, t, t + 0.15, g2);
  }

  function kick(t) {
    const g = ctx.createGain();
    g.connect(musicVol);
    env(g, t, 0.2, 0.004, 0.24);
    const o = osc('sine', 110, t, t + 0.3, g);
    o.frequency.exponentialRampToValueAtTime(42, t + 0.16);
  }

  function shaker(t, vel) {
    const g = ctx.createGain();
    const f = ctx.createBiquadFilter();
    f.type = 'highpass';
    f.frequency.value = 5500;
    f.connect(g).connect(musicVol);
    env(g, t, 0.02 * vel, 0.004, 0.06);
    noise(t, 0.08, f);
  }

  // ---------- beste ----------
  // Akor yürüyüşü (Do majör): C - G - Am - F, her akor 2 ölçü. 8 ölçülük döngü.
  const CHORDS = [
    { pad: [60, 64, 67], bass: 36, arp: [72, 76, 79, 84] },
    { pad: [59, 62, 67], bass: 43, arp: [71, 74, 79, 83] },
    { pad: [60, 64, 69], bass: 45, arp: [72, 76, 81, 84] },
    { pad: [60, 65, 69], bass: 41, arp: [72, 77, 81, 84] },
  ];
  const ARP = [0, 1, 2, 3, 2, 1, 2, -1]; // -1 = es (nefes)
  const PENTA = [72, 74, 76, 79, 81, 84];
  let seed = 7;
  const rand = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };

  function playStep(s, t) {
    const inLoop = s % 64; // 64 sekizlik = 8 ölçü
    const loop = Math.floor(s / 64);
    const chord = CHORDS[Math.floor(inLoop / 16)];
    const inBar = inLoop % 8;
    const section = loop % 4; // 0: sakin giriş, 1-3: ritimli, 2-3: melodili

    if (inLoop % 16 === 0) pad(chord.pad, t, 16 * EIGHTH);
    if (inBar === 0 || inBar === 4) bass(chord.bass, t, EIGHTH * 3);
    if (inBar === 7 && section > 0) bass(chord.bass + 12, t, EIGHTH * 0.8);

    const a = ARP[inBar];
    if (a >= 0) pluck(chord.arp[a], t, inBar % 4 === 0 ? 1 : 0.7);

    if (section > 0) {
      if (inBar === 0 || inBar === 4) kick(t);
      if (inBar % 2 === 1) shaker(t, 0.8);
      else if (section === 3) shaker(t, 0.4);
    }
    if (section >= 2 && rand() < 0.28) {
      const pool = PENTA.filter((n) => chord.arp.includes(n) || rand() < 0.4);
      bell(pool[Math.floor(rand() * pool.length)] || 79, t, 0.8);
    }
  }

  function scheduler() {
    if (!ctx) return;
    // Sekme arka planda kalıp geri gelirse biriken notaları çalma, kaldığı yerden devam et
    if (nextTime < ctx.currentTime - 0.5) nextTime = ctx.currentTime + 0.05;
    while (nextTime < ctx.currentTime + 0.3) {
      playStep(step, nextTime);
      nextTime += EIGHTH;
      step++;
    }
  }

  function startMusic() {
    if (!ctx || musicOn) return;
    musicOn = true;
    nextTime = ctx.currentTime + 0.1;
    schedTimer = setInterval(scheduler, 40);
    musicVol.gain.cancelScheduledValues(ctx.currentTime);
    musicVol.gain.setValueAtTime(musicVol.gain.value, ctx.currentTime);
    musicVol.gain.linearRampToValueAtTime(cfg.musicVolume, ctx.currentTime + 4); // yavaşça açılır
  }

  function stopMusic() {
    if (!ctx || !musicOn) return;
    musicOn = false;
    musicVol.gain.cancelScheduledValues(ctx.currentTime);
    musicVol.gain.setValueAtTime(musicVol.gain.value, ctx.currentTime);
    musicVol.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5);
    setTimeout(() => { if (!musicOn) clearInterval(schedTimer); }, 1600);
  }

  // Efekt çalarken müziği kısa süre hafifçe kıs
  function duckMusic(amount = 0.55, seconds = 1.2) {
    const t = ctx.currentTime;
    duck.gain.cancelScheduledValues(t);
    duck.gain.setValueAtTime(duck.gain.value, t);
    duck.gain.linearRampToValueAtTime(amount, t + 0.08);
    duck.gain.linearRampToValueAtTime(1, t + seconds);
  }

  // ---------- efektler ----------
  function chime(notes, t, gap, vol) {
    notes.forEach((m, i) => {
      const tt = t + i * gap;
      const g = ctx.createGain();
      g.connect(sfxVol);
      env(g, tt, vol, 0.006, 0.9);
      osc('sine', mtof(m), tt, tt + 1, g);
      const g2 = ctx.createGain();
      g2.connect(g);
      env(g2, tt, 0.25, 0.003, 0.45);
      osc('sine', mtof(m) * 2.01, tt, tt + 0.5, g2);
    });
  }

  function cheer(t, dur, vol) {
    // uzaktan gelen tezahürat: filtrelenmiş gürültü, yavaş yükselip iner
    const g = ctx.createGain();
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.setValueAtTime(700, t);
    f.frequency.linearRampToValueAtTime(1100, t + dur * 0.4);
    f.frequency.linearRampToValueAtTime(800, t + dur);
    f.Q.value = 0.7;
    f.connect(g).connect(sfxVol);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + dur * 0.3);
    g.gain.linearRampToValueAtTime(vol * 0.7, t + dur * 0.6);
    g.gain.linearRampToValueAtTime(0.0001, t + dur);
    noise(t, dur, f);
    noise(t + 0.03, dur, f);
  }

  function swoosh(t, vol) {
    const g = ctx.createGain();
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.Q.value = 1.2;
    f.frequency.setValueAtTime(350, t);
    f.frequency.exponentialRampToValueAtTime(2200, t + 0.35);
    f.connect(g).connect(sfxVol);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.15);
    g.gain.linearRampToValueAtTime(0.0001, t + 0.4);
    noise(t, 0.45, f);
  }

  function horn(notes, t, gap, last, vol) {
    // yumuşak boru (tiz kesilmiş testere dalgası)
    notes.forEach((m, i) => {
      const tt = t + i * gap;
      const len = i === notes.length - 1 ? last : gap * 0.9;
      const g = ctx.createGain();
      const f = ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = 1600;
      f.connect(g).connect(sfxVol);
      g.gain.setValueAtTime(0.0001, tt);
      g.gain.linearRampToValueAtTime(vol, tt + 0.04);
      g.gain.setValueAtTime(vol, tt + len - 0.08);
      g.gain.linearRampToValueAtTime(0.0001, tt + len + 0.15);
      osc('sawtooth', mtof(m), tt, tt + len + 0.2, f, -5);
      osc('triangle', mtof(m), tt, tt + len + 0.2, f, 5);
    });
  }

  function boom(t, vol) {
    const g = ctx.createGain();
    g.connect(sfxVol);
    env(g, t, vol, 0.01, 0.6);
    const o = osc('sine', 90, t, t + 0.7, g);
    o.frequency.exponentialRampToValueAtTime(38, t + 0.5);
  }

  // ---------- takım kutlama sesleri ----------
  function horonTune(t) {
    // Karadeniz horonu esintisi: hızlı kemençe benzeri ezgi (7/16 ritim: 2+2+3) + davul
    const s16 = 60 / 170 / 2; // hızlı on altılık
    const groups = [2, 2, 3];
    const melody = [76, 74, 76, 77, 76, 74, 72, 74, 76, 74, 72, 71, 72, 74, 76, 79, 77, 76, 74, 72, 74];
    let tt = t;
    let n = 0;
    for (let bar = 0; bar < 3; bar++) {
      for (const g of groups) {
        const dur = g * s16;
        const m = melody[n++ % melody.length];
        const gain = ctx.createGain();
        const f = ctx.createBiquadFilter();
        f.type = 'bandpass';
        f.frequency.value = 1500;
        f.Q.value = 0.8;
        f.connect(gain).connect(sfxVol);
        env(gain, tt, 0.05, 0.015, dur * 0.95, 0.0001);
        const o = osc('sawtooth', mtof(m), tt, tt + dur + 0.05, f);
        // kemençe titreşimi (vibrato)
        const lfo = ctx.createOscillator();
        const lg = ctx.createGain();
        lfo.frequency.value = 7;
        lg.gain.value = 9;
        lfo.connect(lg).connect(o.frequency);
        lfo.start(tt);
        lfo.stop(tt + dur + 0.05);
        // davul: grubun başında
        const k = ctx.createGain();
        k.connect(sfxVol);
        env(k, tt, 0.12, 0.004, 0.18);
        const ko = osc('sine', 120, tt, tt + 0.22, k);
        ko.frequency.exponentialRampToValueAtTime(55, tt + 0.12);
        tt += dur;
      }
    }
    cheer(t + 0.2, (tt - t) + 0.6, 0.05);
  }

  function roar(t) {
    // aslan kükremesi: alçak, titreşimli hırıltı (yumuşatılmış)
    const g = ctx.createGain();
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.setValueAtTime(500, t);
    f.frequency.linearRampToValueAtTime(260, t + 1.6);
    f.connect(g).connect(sfxVol);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.06, t + 0.25);
    g.gain.linearRampToValueAtTime(0.04, t + 1.0);
    g.gain.linearRampToValueAtTime(0.0001, t + 1.7);
    const trem = ctx.createGain();
    trem.connect(f);
    const lfo = ctx.createOscillator();
    const lg = ctx.createGain();
    lfo.frequency.value = 24;
    lg.gain.value = 0.5;
    lfo.connect(lg).connect(trem.gain);
    lfo.start(t);
    lfo.stop(t + 1.8);
    noise(t, 1.8, trem);
    const o = osc('sawtooth', 95, t, t + 1.8, trem);
    o.frequency.linearRampToValueAtTime(70, t + 1.6);
    cheer(t + 0.8, 2.4, 0.07);
  }

  function chirps(t) {
    // kanarya cıvıltısı: kısa, yumuşak yükselen tınlar
    for (let i = 0; i < 9; i++) {
      const tt = t + i * 0.13 + Math.random() * 0.05;
      const g = ctx.createGain();
      g.connect(sfxVol);
      env(g, tt, 0.035, 0.005, 0.09);
      const base = 2200 + Math.random() * 500;
      const o = osc('sine', base, tt, tt + 0.12, g);
      o.frequency.exponentialRampToValueAtTime(base * 1.35, tt + 0.08);
    }
    cheer(t + 0.4, 2.2, 0.06);
  }

  function wings(t) {
    swoosh(t, 0.07);
    swoosh(t + 0.45, 0.06);
    boom(t + 0.9, 0.1);
    cheer(t + 0.6, 2.4, 0.07);
  }

  function chomp(t) {
    for (const d of [0, 0.35, 0.7]) {
      boom(t + d, 0.12);
      const g = ctx.createGain();
      const f = ctx.createBiquadFilter();
      f.type = 'bandpass';
      f.frequency.value = 1200;
      f.connect(g).connect(sfxVol);
      env(g, t + d, 0.06, 0.003, 0.08);
      noise(t + d, 0.1, f);
    }
    cheer(t + 0.8, 2.2, 0.07);
  }

  function chant(t) {
    // tezahürat ritmi: "Yi-ği-do!" gibi üç vuruş, iki kez
    for (const rep of [0, 1.2]) {
      [0, 0.28, 0.56].forEach((d, i) => {
        const tt = t + rep + d;
        const g = ctx.createGain();
        const f = ctx.createBiquadFilter();
        f.type = 'bandpass';
        f.frequency.value = i === 2 ? 700 : 900;
        f.Q.value = 0.9;
        f.connect(g).connect(sfxVol);
        env(g, tt, i === 2 ? 0.13 : 0.09, 0.02, i === 2 ? 0.45 : 0.2);
        noise(tt, 0.55, f);
        boom(tt, i === 2 ? 0.12 : 0.07);
      });
    }
    cheer(t + 2.0, 1.8, 0.07);
  }

  function sparkle(t) {
    const notes = [84, 88, 91, 96, 91, 93, 96, 100];
    notes.forEach((m, i) => chime([m], t + i * 0.11, 0, 0.04));
    cheer(t + 0.3, 2.4, 0.06);
  }

  function thunder(t) {
    const g = ctx.createGain();
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = 300;
    f.connect(g).connect(sfxVol);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.18, t + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 2.2);
    noise(t, 2.3, f);
    swoosh(t, 0.04);
    cheer(t + 0.5, 2.2, 0.07);
  }

  function fireworks(t) {
    [0, 0.5, 0.9, 1.3].forEach((d) => {
      const g = ctx.createGain();
      const f = ctx.createBiquadFilter();
      f.type = 'highpass';
      f.frequency.value = 700;
      f.connect(g).connect(sfxVol);
      env(g, t + d, 0.07, 0.003, 0.35);
      noise(t + d, 0.4, f);
      boom(t + d, 0.06);
    });
    horn([67, 72, 76, 79], t + 0.1, 0.13, 0.5, 0.035);
    cheer(t + 0.3, 2.4, 0.07);
  }

  const CELEBRATION_SOUNDS = { horon: horonTune, roar, chirp: chirps, wings, chomp, chant, sparkle, thunder, fireworks };

  const last = { gift: 0, rank: 0, leader: 0 };
  const SMALL = [[84, 88], [86, 91], [88, 93], [91, 96], [84, 91]];
  const ready = () => ctx && ctx.state === 'running' && cfg.sfx;

  const api = {
    // Hediye: küçükte tek tıngırtı, büyükte arpej, çok büyükte tezahürat
    gift(points) {
      if (!ready()) return;
      const now = performance.now();
      const tier = points >= 5000 ? 3 : points >= 1000 ? 2 : 1;
      if (tier === 1 && now - last.gift < 350) return; // seri hediyede üst üste binmesin
      last.gift = now;
      const t = ctx.currentTime + 0.02;
      if (tier === 1) {
        chime(SMALL[Math.floor(Math.random() * SMALL.length)], t, 0.07, 0.07);
      } else if (tier === 2) {
        chime([79, 84, 88, 91], t, 0.075, 0.075);
        duckMusic(0.7, 0.9);
      } else {
        boom(t, 0.18);
        chime([72, 79, 84, 88, 91, 96], t + 0.05, 0.07, 0.07);
        cheer(t, 2.6, 0.09);
        duckMusic(0.5, 2.2);
      }
    },
    // Sıralamada yükselme
    rankUp() {
      if (!ready()) return;
      const now = performance.now();
      if (now - last.rank < 1500 || now - last.leader < 2500) return;
      last.rank = now;
      const t = ctx.currentTime + 0.02;
      swoosh(t, 0.05);
      chime([88], t + 0.25, 0, 0.045);
    },
    // Lider değişti: kısa boru + hafif tezahürat
    leader() {
      if (!ready()) return;
      const now = performance.now();
      if (now - last.leader < 3000) return;
      last.leader = now;
      const t = ctx.currentTime + 0.02;
      horn([67, 72, 76, 79], t, 0.13, 0.55, 0.045);
      cheer(t + 0.2, 2, 0.06);
      duckMusic(0.55, 1.8);
    },
    // Takım liderliği alınca o takıma özel kutlama sesi
    celebrate(kind) {
      if (!ready()) return;
      const fn = CELEBRATION_SOUNDS[kind] || fireworks;
      last.leader = performance.now();
      fn(ctx.currentTime + 0.03);
      duckMusic(0.4, 4);
    },
    champion() {
      if (!ready()) return;
      const t = ctx.currentTime + 0.02;
      horn([60, 64, 67, 72, 67, 72, 76, 79], t, 0.16, 1.2, 0.05);
      boom(t, 0.15);
      cheer(t + 0.1, 4.5, 0.1);
      duckMusic(0.35, 5);
    },
    // Tarayıcılar sesi ancak bir dokunuştan sonra açar
    unlock(fromGesture = false) {
      if (!cfg.music && !cfg.sfx) return;
      if (!init()) return;
      if (fromGesture) gestureUnlock();
      const p = ctx.resume ? ctx.resume() : Promise.resolve();
      Promise.resolve(p).then(() => {
        if (cfg.music) startMusic();
        hint();
      }).catch(() => {});
    },
    configure(next) {
      cfg = { ...cfg, ...next };
      if (!ctx) { if (cfg.music || cfg.sfx) api.unlock(); return; }
      const t = ctx.currentTime;
      sfxVol.gain.setTargetAtTime(cfg.sfx ? cfg.sfxVolume : 0, t, 0.1);
      if (cfg.music) {
        if (!musicOn) startMusic();
        else musicVol.gain.setTargetAtTime(cfg.musicVolume, t, 0.2);
      } else stopMusic();
      if (ctx.state !== 'running') api.unlock();
      hint();
    },
    // Test/kayıt için: çıkan sesin kopyası
    captureStream() {
      if (!init()) return null;
      const dest = ctx.createMediaStreamDestination();
      out.connect(dest);
      return dest.stream;
    },
    get running() { return Boolean(ctx && ctx.state === 'running'); },
    get config() { return { ...cfg }; },
  };

  // Dokunuş anında çağrılır: eski iOS'larda sesi açan sessiz tampon + sessiz modda da çalmayı
  // sağlayan, döngüde çalan sessiz bir <audio> öğesi.
  let htmlAudio = null;
  function silentWav() {
    const n = 4000; // 0.5 sn, 8 kHz, 8 bit sessizlik
    const b = new Uint8Array(44 + n);
    const w = (o, str) => { for (let i = 0; i < str.length; i++) b[o + i] = str.charCodeAt(i); };
    const u32 = (o, v) => { b[o] = v & 255; b[o + 1] = (v >> 8) & 255; b[o + 2] = (v >> 16) & 255; b[o + 3] = (v >> 24) & 255; };
    w(0, 'RIFF'); u32(4, 36 + n); w(8, 'WAVE'); w(12, 'fmt '); u32(16, 16);
    b[20] = 1; b[22] = 1; u32(24, 8000); u32(28, 8000); b[32] = 1; b[34] = 8;
    w(36, 'data'); u32(40, n); b.fill(128, 44);
    let bin = ''; for (const x of b) bin += String.fromCharCode(x);
    return `data:audio/wav;base64,${btoa(bin)}`;
  }
  function gestureUnlock() {
    try {
      const buf = ctx.createBuffer(1, 1, 22050);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(ctx.destination);
      src.start(0);
    } catch { /* yok */ }
    try {
      if (!htmlAudio) {
        htmlAudio = new Audio(silentWav());
        htmlAudio.loop = true;
        htmlAudio.setAttribute('playsinline', '');
      }
      if (htmlAudio.paused) htmlAudio.play().catch(() => {});
    } catch { /* yok */ }
  }

  function hint() {
    const el = document.getElementById('soundHint');
    if (!el) return;
    el.hidden = !(cfg.music || cfg.sfx) || api.running;
  }

  window.TaraftarAudio = api;
  // Ayarlar sayfası sesi sadece "dinle" butonlarıyla çalar (otomatik başlamaz)
  if (window.TARAFTAR_AUDIO_MANUAL) {
    api.preview = (on) => {
      if (!init()) return;
      gestureUnlock();
      ctx.resume?.().catch(() => {});
      if (on) { cfg.music = true; startMusic(); } else stopMusic();
    };
    api.unlockSfx = () => { if (init()) { gestureUnlock(); ctx.resume?.().catch(() => {}); } };
    return;
  }
  // Bazı ortamlar (OBS, bulut yayıncısı) dokunuş olmadan sesi açmaya izin verir
  if (cfg.music || cfg.sfx) {
    api.unlock();
    setTimeout(hint, 1500);
  }
  // Dokunmatik ekranlarda tarayıcılar sesi "parmak kalkınca" (touchend/click) açmaya izin verir,
  // parmağın değdiği an (pointerdown) sayılmaz. Hepsini dinliyoruz.
  const onGesture = () => api.unlock(true);
  for (const ev of ['touchend', 'pointerup', 'click', 'keydown']) addEventListener(ev, onGesture, { passive: true });
  // TikTok'a geçip geri dönünce (iOS sesi "interrupted" yapar) kendini toparlasın
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && ctx) {
      ctx.resume?.().catch(() => {});
      setTimeout(hint, 800);
    }
  });
})();
