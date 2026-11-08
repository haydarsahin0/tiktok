// Tanıtım videosunu üretir: node promo/render.cjs [--preview]
// Kareleri (renderFrame) ve sesi (renderAudio) tarayıcıda üretir, ffmpeg ile MP4 yapar.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const DIR = __dirname;
const OUT = process.env.OUT || path.join(DIR, 'out');
const preview = process.argv.includes('--preview');

// Ekran görüntüsünü tuvale çizip dışa aktarabilmek için sayfa aynı kökenli bir yerel sunucudan açılır
function serve(root) {
  const http = require('http');
  const types = { '.html': 'text/html; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.js': 'text/javascript' };
  const srv = http.createServer((req, res) => {
    const file = path.join(root, decodeURIComponent(req.url.split('?')[0]));
    if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((r) => srv.listen(0, '127.0.0.1', () => r(srv)));
}

(async () => {
  fs.mkdirSync(path.join(OUT, 'frames'), { recursive: true });
  const srv = await serve(path.dirname(DIR));
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 540, height: 960 } });
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  await p.goto(`http://127.0.0.1:${srv.address().port}/promo/promo.html`);
  await p.evaluate(() => window.ready);
  const { FPS, DUR } = await p.evaluate(() => ({ FPS: 30, DUR: 27 }));
  const grab = (t, q = 0.93) => p.evaluate(([t, q]) => { window.renderFrame(t); return document.getElementById('c').toDataURL('image/jpeg', q); }, [t, q]);
  const save = (file, dataUrl) => fs.writeFileSync(file, Buffer.from(dataUrl.split(',')[1], 'base64'));

  if (preview) {
    const times = (process.env.TIMES || '0.7,1.6,2.6,4.6,6.2,9.4,10.6,12.3,13.2,16.7,18.3,19.8,20.6,21.4,22.3,24.2,25.6').split(',').map(Number);
    for (const t of times) save(path.join(OUT, `prev_${t.toFixed(1)}.jpg`), await grab(t, 0.85));
    console.log('önizleme kareleri:', times.length, 'hatalar:', errs);
    await b.close();
    srv.close();
    return;
  }

  const n = Math.round(FPS * DUR);
  const t0 = Date.now();
  for (let f = 0; f < n; f++) {
    save(path.join(OUT, 'frames', `f${String(f).padStart(4, '0')}.jpg`), await grab(f / FPS));
    if (f % 90 === 0) console.log(`kare ${f}/${n} (${((Date.now() - t0) / 1000).toFixed(0)} sn)`);
  }
  const wav = await p.evaluate(() => window.renderAudio());
  fs.writeFileSync(path.join(OUT, 'audio.wav'), Buffer.from(wav, 'base64'));
  await b.close();
  srv.close();
  console.log('hatalar:', errs);

  const mp4 = path.join(OUT, 'taraftar-ligi-tanitim.mp4');
  execFileSync('ffmpeg', ['-y', '-v', 'error',
    '-framerate', String(FPS), '-i', path.join(OUT, 'frames', 'f%04d.jpg'),
    '-i', path.join(OUT, 'audio.wav'),
    '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-profile:v', 'high',
    '-c:a', 'aac', '-b:a', '192k', '-ar', '44100',
    '-shortest', '-movflags', '+faststart', mp4], { stdio: 'inherit' });
  console.log('hazır:', mp4);
})();
