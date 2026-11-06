import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { WebSocketServer } from 'ws';
import { Game } from './game.js';
import { TEAMS } from './teams.js';
import { TikTokBridge } from './tiktok.js';
import { startDemo } from './demo.js';
import { startStreamer, streamTarget } from './streamer.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
try { process.loadEnvFile(path.join(root, '.env')); } catch { /* .env yoksa sorun değil */ }

const env = process.env;
const num = (v, d) => (v === undefined || v === '' || Number.isNaN(Number(v)) ? d : Number(v));
const PORT = num(env.PORT, 3000);
const USERNAME = (env.TIKTOK_USERNAME || '').trim();
const DEMO = process.argv.includes('--demo') || env.DEMO === '1' || env.DEMO === 'true' || !USERNAME;
const ADMIN_TOKEN = env.ADMIN_TOKEN || '';

const ruleEnv = {
  pointsPerCoin: num(env.POINTS_PER_COIN, undefined),
  pointsPerLike: num(env.POINTS_PER_LIKE, undefined),
  pointsPerFollow: num(env.POINTS_PER_FOLLOW, undefined),
  pointsPerShare: num(env.POINTS_PER_SHARE, undefined),
  pointsPerJoin: num(env.POINTS_PER_JOIN, undefined),
  roundMinutes: num(env.ROUND_MINUTES, undefined),
  championSeconds: num(env.CHAMPION_SECONDS, undefined),
};
const game = new Game({
  file: path.join(root, 'data', 'state.json'),
  rules: Object.fromEntries(Object.entries(ruleEnv).filter(([, v]) => v !== undefined)),
});

let liveStatus = { state: DEMO ? 'demo' : 'idle', username: USERNAME, viewers: 0, message: '' };

// ---------- web sunucusu ----------
const app = express();
app.use(express.json());
app.use(express.static(path.join(root, 'public')));
app.get('/api/teams', (_req, res) => res.json(TEAMS));
app.get('/api/state', (_req, res) => res.json({ ...game.snapshot(), live: liveStatus }));

const requireAdmin = (req, res, next) => {
  if (!ADMIN_TOKEN || req.get('x-admin-token') === ADMIN_TOKEN || req.query.token === ADMIN_TOKEN) return next();
  res.status(401).json({ error: 'Yetkisiz. ADMIN_TOKEN gerekli.' });
};

// Yönetim paneli için test olayları
app.post('/api/admin/sim', requireAdmin, (req, res) => {
  const { kind, user = {}, text, coins, count, team } = req.body || {};
  const u = { id: String(user.id || user.name || 'test'), name: String(user.name || user.id || 'Test'), avatar: user.avatar || '' };
  if (kind === 'chat') game.onChat(u, String(text || team || ''));
  else if (kind === 'gift') game.onGift(u, { name: req.body.giftName || 'Test hediyesi', coins: Number(coins) || 1, count: Number(count) || 1 });
  else if (kind === 'like') game.onLike(u, Number(count) || 10);
  else if (kind === 'follow' || kind === 'share') game.onSocial(u, kind);
  else return res.status(400).json({ error: 'kind: chat | gift | like | follow | share' });
  res.json({ ok: true });
});
app.post('/api/admin/new-round', requireAdmin, (_req, res) => { game.resetRound(); res.json({ ok: true }); });
app.post('/api/admin/finish-round', requireAdmin, (_req, res) => { game.finishRound(); res.json({ ok: true }); });

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

function broadcast(msg) {
  const data = JSON.stringify(msg);
  for (const client of wss.clients) if (client.readyState === 1) client.send(data);
}

wss.on('connection', (ws) => {
  ws.send(JSON.stringify({ type: 'teams', teams: TEAMS }));
  ws.send(JSON.stringify({ type: 'state', state: { ...game.snapshot(), live: liveStatus } }));
});

game.on('event', (e) => broadcast({ type: 'event', event: e }));

// Ekran durumu saniyede 4 kez gönderilir
setInterval(() => {
  game.tick();
  broadcast({ type: 'state', state: { ...game.snapshot(), live: liveStatus } });
}, 250);

// Kayıt
setInterval(() => {
  try { game.save(); } catch (err) { console.error('[kayıt] yazılamadı:', err.message); }
}, 5000);

// ---------- TikTok ya da demo ----------
let bridge = null;
let stopDemo = null;
if (DEMO) {
  stopDemo = startDemo(game, { speed: num(env.DEMO_SPEED, 1) });
  console.log('[demo] Sahte izleyicilerle çalışıyor. Gerçek yayın için .env dosyasına TIKTOK_USERNAME yaz.');
} else {
  bridge = new TikTokBridge(USERNAME, { signApiKey: env.EULER_API_KEY, sessionId: env.TIKTOK_SESSION_ID });
  bridge.on('status', (s) => { liveStatus = s; });
  bridge.on('chat', (u, text) => game.onChat(u, text));
  bridge.on('gift', (u, g) => game.onGift(u, g));
  bridge.on('like', (u, c) => game.onLike(u, c));
  bridge.on('social', (u, kind) => game.onSocial(u, kind));
  bridge.start().catch((err) => console.error('[tiktok] başlatılamadı:', err));
}

server.listen(PORT, () => {
  console.log(`\n⚽ Taraftar Ligi çalışıyor`);
  console.log(`   Yayın ekranı : http://localhost:${PORT}/`);
  console.log(`   Yönetim      : http://localhost:${PORT}/admin.html${ADMIN_TOKEN ? '?token=...' : ''}`);
  console.log(`   Mod          : ${DEMO ? 'DEMO' : `@${USERNAME}`} | Tur: ${game.rules.roundMinutes || '∞'} dk\n`);
  const target = streamTarget(env);
  if (target) {
    streamer = startStreamer({
      port: PORT,
      target,
      width: num(env.STREAM_WIDTH, 720),
      height: num(env.STREAM_HEIGHT, 1280),
      fps: num(env.STREAM_FPS, 30),
      bitrate: env.STREAM_BITRATE || '3000k',
    });
  }
});
let streamer = null;

async function shutdown() {
  console.log('\nKapatılıyor, kaydediliyor...');
  stopDemo?.();
  streamer?.stop();
  await bridge?.stop();
  try { game.dirty = true; game.save(); } catch (err) { console.error(err); }
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('uncaughtException', (err) => console.error('[hata]', err));
process.on('unhandledRejection', (err) => console.error('[hata]', err));

