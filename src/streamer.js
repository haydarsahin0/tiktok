import { spawn } from 'node:child_process';
import fs from 'node:fs';

// Bilgisayarsız yayın: sunucuda sanal ekran (Xvfb) açar, oyunu Chromium'da gösterir,
// ffmpeg ile ekranı yakalayıp TikTok'un RTMP adresine gönderir. Biri çökerse yeniden başlatır.

const CHROME_CANDIDATES = [
  process.env.CHROMIUM_PATH,
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/usr/bin/google-chrome',
  '/opt/pw-browsers/chromium/chrome-linux/chrome',
].filter(Boolean);

export function streamTarget(env = process.env) {
  if (env.STREAM_URL) return env.STREAM_URL;
  if (env.STREAM_SERVER && env.STREAM_KEY) return `${env.STREAM_SERVER.replace(/\/+$/, '')}/${env.STREAM_KEY}`;
  return '';
}

function keepAlive(name, makeProcess, log) {
  let child = null;
  let stopped = false;
  let delay = 2000;
  const run = () => {
    if (stopped) return;
    const started = Date.now();
    child = makeProcess();
    child.stderr?.on('data', (d) => log(name, d));
    child.on('exit', (code) => {
      if (stopped) return;
      if (Date.now() - started > 60000) delay = 2000; // uzun süre çalıştıysa bekleme süresini sıfırla
      console.warn(`[yayın] ${name} kapandı (kod ${code}), ${delay / 1000} sn sonra yeniden başlıyor`);
      setTimeout(run, delay);
      delay = Math.min(delay * 2, 60000);
    });
  };
  run();
  return { stop: () => { stopped = true; child?.kill('SIGTERM'); } };
}

export function startStreamer({ port, target, width = 720, height = 1280, fps = 30, bitrate = '3000k', display = ':99' }) {
  const chrome = CHROME_CANDIDATES.find((p) => fs.existsSync(p));
  if (!chrome) {
    console.error('[yayın] Chromium bulunamadı. CHROMIUM_PATH ayarla ya da Docker imajını kullan.');
    return null;
  }
  const env = { ...process.env, DISPLAY: display };
  const quiet = process.env.STREAM_DEBUG ? (name, d) => process.stderr.write(`[${name}] ${d}`) : () => {};

  const xvfb = keepAlive('ekran', () => spawn('Xvfb', [display, '-screen', '0', `${width}x${height}x24`, '-nolisten', 'tcp'], { stdio: ['ignore', 'ignore', 'pipe'] }), quiet);

  // Çeviri önerisi gibi açılır pencereler yayında görünmesin
  const profile = '/tmp/taraftar-chrome';
  fs.mkdirSync(`${profile}/Default`, { recursive: true });
  fs.writeFileSync(`${profile}/Default/Preferences`, JSON.stringify({ translate: { enabled: false }, browser: { has_seen_welcome_page: true } }));

  let browser;
  let ffmpeg;
  setTimeout(() => {
    browser = keepAlive('tarayıcı', () => spawn(chrome, [
      '--no-sandbox', '--disable-dev-shm-usage', '--no-first-run', '--noerrdialogs', '--disable-infobars',
      '--disable-translate', '--disable-features=Translate', '--hide-scrollbars', '--autoplay-policy=no-user-gesture-required',
      `--window-size=${width},${height}`, '--window-position=0,0', '--kiosk',
      `--user-data-dir=${profile}`, '--lang=tr-TR', `--app=http://127.0.0.1:${port}/`,
    ], { env, stdio: ['ignore', 'ignore', 'pipe'] }), quiet);
  }, 1500);

  setTimeout(() => {
    ffmpeg = keepAlive('ffmpeg', () => spawn('ffmpeg', [
      '-hide_banner', '-loglevel', 'warning',
      '-f', 'x11grab', '-draw_mouse', '0', '-framerate', String(fps), '-video_size', `${width}x${height}`, '-i', `${display}.0`,
      '-f', 'lavfi', '-i', 'anullsrc=channel_layout=stereo:sample_rate=44100', // TikTok ses kanalı ister: sessiz ses
      '-c:v', 'libx264', '-preset', 'veryfast', '-tune', 'zerolatency', '-pix_fmt', 'yuv420p',
      '-b:v', bitrate, '-maxrate', bitrate, '-bufsize', `${parseInt(bitrate, 10) * 2}k`, '-g', String(fps * 2),
      '-c:a', 'aac', '-b:a', '128k',
      '-f', 'flv', target,
    ], { env, stdio: ['ignore', 'ignore', 'pipe'] }), (name, d) => process.stderr.write(`[ffmpeg] ${d}`));
    console.log(`[yayın] ${width}x${height} ${fps}fps görüntü gönderiliyor → ${target.replace(/\/[^/]+$/, '/****')}`);
  }, 6000);

  return {
    stop() { ffmpeg?.stop(); browser?.stop(); xvfb.stop(); },
  };
}
