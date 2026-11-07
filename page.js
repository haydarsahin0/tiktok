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

  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') keepAwake(); });
  keepAwake();
})();
