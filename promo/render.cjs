// Tanıtım videosunu üretir: node promo/render.cjs [sayfa] [--preview]
//   sayfa: promo (varsayılan, ilk tanıtım) | dongu (döngülü tanıtım)
// Kareleri (renderFrame) ve sesi (renderAudio) tarayıcıda üretir, ffmpeg ile MP4 yapar.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const DIR = __dirname;
const OUT = process.env.OUT || path.join(DIR, 'out');
const preview = process.argv.includes('--preview');
const PAGE = process.argv.slice(2).find((a) => !a.startsWith('--')) || 'promo';

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
  // 3D sayfa için yazılımsal WebGL (GPU olmayan makinelerde de çalışır)
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 540, height: 960 } });
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(`http://127.0.0.1:${srv.address().port}/promo/${PAGE}.html`);
  await p.evaluate(() => window.ready);
  const { FPS, DUR, C, PR, PV } = await p.evaluate(() => ({ FPS, DUR, C, PR: PROMO, PV: typeof PREVIEW === 'undefined' ? null : PREVIEW }));
  const OFF = PR.voOffset, TRIM = PR.voTrim || 0;
  console.log('süre:', DUR, 'sn');
  const grab = (t, q = 0.93) => p.evaluate(([t, q]) => { window.renderFrame(t); return document.getElementById('c').toDataURL('image/jpeg', q); }, [t, q]);
  const save = (file, dataUrl) => fs.writeFileSync(file, Buffer.from(dataUrl.split(',')[1], 'base64'));

  if (preview) {
    const times = process.env.TIMES ? process.env.TIMES.split(',').map(Number)
      : PV || [C.sen + 0.3, C.tiktok + 0.5, C.superlig + 0.6, C.plaka + 0.4, C.taraftari, C.begen + 0.3, C.baski + 0.3, C.uc + 0.2, C.bir + 0.2, C.gol + 0.4, C.gecen + 0.9, C.tablo + 0.6, C.hafta + 0.6, C.celebs + 1.3, C.horon + 0.4, C.aslan + 0.2, C.timsah + 0.3, C.yigido + 0.3, C.saat + 0.6, C.takipEt + 0.6];
    for (const [i, t] of times.entries()) save(path.join(OUT, `prev_${String(i).padStart(2, '0')}_${t.toFixed(2)}.jpg`), await grab(t, 0.85));
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

  const mp4 = path.join(OUT, PR.out);
  execFileSync('ffmpeg', ['-y', '-v', 'error',
    '-framerate', String(FPS), '-i', path.join(OUT, 'frames', 'f%04d.jpg'),
    '-i', path.join(OUT, 'audio.wav'),
    '-i', path.join(DIR, PR.vo),
    // seslendirme: baştaki sessizlik kırpılır, gerekirse geciktirilir, müziğin üstüne biner; sonra TikTok seviyesine (-14 LUFS)
    '-filter_complex', `[2:a]atrim=start=${TRIM},asetpts=PTS-STARTPTS,adelay=${Math.round(OFF * 1000)}|${Math.round(OFF * 1000)},aformat=channel_layouts=stereo,${PR.voFx ? PR.voFx + ',' : ''}volume=${process.env.VO_GAIN || PR.voGain || '1.6'}[vo];` +
      `[1:a][vo]amix=inputs=2:normalize=0:duration=first,loudnorm=I=${PR.lufs || -14}:TP=-1.5:LRA=11[a]`,
    '-map', '0:v', '-map', '[a]',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-profile:v', 'high',
    '-c:a', 'aac', '-b:a', '192k', '-ar', '44100',
    '-shortest', '-movflags', '+faststart', mp4], { stdio: 'inherit' });
  console.log('hazır:', mp4);
})();
