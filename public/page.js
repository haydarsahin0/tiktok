/* Yayın sayfası ortak davranışı (futbol ve Manifest ligi): tam ekran, ekran kapanmasın, ses, gizli ayarlar */
// Yayın modu: dokununca tam ekran (adres çubuğu gizlenir), ekran kapanmaz, ses açılır
(() => {
  const de = document.documentElement;
  const standalone = matchMedia('(display-mode: standalone), (display-mode: fullscreen)').matches || navigator.standalone === true;
  const canFullscreen = Boolean(de.requestFullscreen || de.webkitRequestFullscreen);
  const isFullscreen = () => Boolean(document.fullscreenElement || document.webkitFullscreenElement);
  const isTouch = matchMedia('(pointer: coarse)').matches;
  const tap = document.getElementById('tap');
  let lock = null;

  async function keepAwake() {
    try { if ('wakeLock' in navigator && !lock) { lock = await navigator.wakeLock.request('screen'); lock.onrelease = () => { lock = null; }; } } catch { /* desteklenmiyor */ }
  }
  function enterFullscreen() {
    const fn = de.requestFullscreen || de.webkitRequestFullscreen;
    if (!fn || isFullscreen() || standalone) return;
    try {
      const r = fn.call(de, { navigationUI: 'hide' });
      if (r && r.catch) r.catch(() => {});
    } catch { /* izin verilmedi */ }
  }
  function go() {
    tap.classList.remove('show');
    enterFullscreen();
    keepAwake();
    window.TaraftarAudio?.unlock(true);
  }

  // iPhone Safari tam ekrana izin vermez: tek yol "Ana Ekrana Ekle"
  if (!canFullscreen && !standalone) {
    document.getElementById('tapTitle').textContent = '📱 Adres çubuğunu gizlemek için';
    document.getElementById('tapText').innerHTML = 'Safari\'de <b>Paylaş</b> ⬆️ → <b>Ana Ekrana Ekle</b>,<br>sonra ana ekrandaki <b>Taraftar Ligi</b> simgesinden aç.<br><br>Şimdilik devam etmek için dokun.';
  }
  if (isTouch && !standalone) tap.classList.add('show');

  document.getElementById('settings').addEventListener('click', (e) => e.stopPropagation());
  document.addEventListener('click', go);

  // Gizli ayarlar kısayolu (yayında buton görünmesin): sol üst köşeye 3 kez hızlı dokun
  let corner = [];
  document.addEventListener('click', (e) => {
    if (e.clientX > innerWidth * 0.25 || e.clientY > innerHeight * 0.15) return;
    const now = Date.now();
    corner = corner.filter((t) => now - t < 1500).concat(now);
    if (corner.length >= 3) location.href = window.LIG?.settingsUrl || 'ayarlar.html';
  });

  // Yayın sonu / mola kartı: sağ üst köşeye 3 kez hızlı dokun (tekrar 3 dokunuş kapatır).
  // Yayını bitirmeden önce izleyiciler bu kartı görür; bu sırada ekran paylaşımını durdurursun.
  const theme = window.LIG?.theme || {};
  const outro = document.createElement('div');
  outro.id = 'outro';
  outro.hidden = true;
  const title = theme.title || 'TARAFTAR LİGİ';
  const manifest = window.LIG?.id === 'manifest';
  outro.innerHTML = `
    <div class="o-card">
      <div class="o-logo">${manifest ? '⭐' : '⚽'}</div>
      <div class="o-title">${title}</div>
      <div class="o-big">Bugünlük bu kadar! 👋</div>
      <div class="o-text">Katılan, yorum yazan ve hediye atan herkese teşekkürler 💛</div>
      <div class="o-follow">➕ TAKİP ET</div>
      <div class="o-text">${manifest ? 'Yarın yine buradayız, favorini zirveye taşı!' : 'Yarın yine buradayız, takımını şampiyon yap!'}</div>
    </div>`;
  const css = document.createElement('style');
  css.textContent = `
    #outro { position: fixed; inset: 0; z-index: 5; display: flex; align-items: center; justify-content: center;
      background: radial-gradient(circle at 50% 40%, ${manifest ? '#7b2ff7, #12051f 70%' : '#c8102e, #05080f 70%'});
      font-family: "Baloo 2", system-ui, sans-serif; color: #fff; text-align: center; padding: 6vh 6vw; }
    #outro[hidden] { display: none; }
    #outro .o-card { max-width: 92vw; display: flex; flex-direction: column; align-items: center; gap: 1.6vh; animation: o-pop .5s ease-out; }
    #outro .o-logo { font-size: 9vh; line-height: 1; }
    #outro .o-title { font-size: 4.2vh; font-weight: 800; letter-spacing: .05em; color: #ffd400; text-shadow: 0 3px 0 rgba(0,0,0,.4); }
    #outro .o-big { font-size: 5.4vh; font-weight: 800; line-height: 1.1; text-shadow: 0 4px 0 rgba(0,0,0,.4); }
    #outro .o-text { font-size: 2.5vh; font-weight: 600; opacity: .92; max-width: 80vw; }
    #outro .o-follow { margin: 1vh 0; padding: 1.4vh 5vh; border-radius: 999px; background: #fe2c55; font-size: 3.4vh; font-weight: 800;
      box-shadow: 0 0 0 0 rgba(254,44,85,.7); animation: o-pulse 1.6s infinite; }
    @keyframes o-pop { from { transform: scale(.85); opacity: 0; } to { transform: scale(1); opacity: 1; } }
    @keyframes o-pulse { 70% { box-shadow: 0 0 0 3vh rgba(254,44,85,0); } 100% { box-shadow: 0 0 0 0 rgba(254,44,85,0); } }`;
  document.head.appendChild(css);
  document.body.appendChild(outro);
  let corner2 = [];
  document.addEventListener('click', (e) => {
    if (e.clientX < innerWidth * 0.75 || e.clientY > innerHeight * 0.15) return;
    const now = Date.now();
    corner2 = corner2.filter((t) => now - t < 1500).concat(now);
    if (corner2.length >= 3) {
      corner2 = [];
      outro.hidden = !outro.hidden;
    }
  });

  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') keepAwake(); });
  keepAwake();
})();
