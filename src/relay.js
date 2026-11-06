import { EventEmitter } from 'node:events';
import { WebSocketServer } from 'ws';
import { TikTokBridge } from './tiktok.js';
import { startDemo } from '../public/core/demo.js';

// Aktarıcı (relay): TikTok yayınını sunucuda dinler, olayları tarayıcıya (tablete) iletir.
// Oyunun kendisi tablette çalışır; sunucu sadece "postacı"dır, hiçbir şey saklamaz.
// Tablet şu adrese bağlanır: wss://<sunucu>/relay?user=<tiktok_kullanıcı_adı>[&key=<RELAY_KEY>]

class FakeBridge extends EventEmitter {
  // Test için: gerçek TikTok yerine sahte izleyiciler
  start() {
    this.emit('status', { state: 'connected', message: 'test (sahte izleyiciler)' });
    this.stopDemo = startDemo({
      onChat: (u, t) => this.emit('chat', u, t),
      onGift: (u, g) => this.emit('gift', u, g),
      onLike: (u, c) => this.emit('like', u, c),
    });
    return Promise.resolve();
  }
  stop() { this.stopDemo?.(); }
}

export function createRelay({ signApiKey, key = '', allowedUsers = [], fake = false } = {}) {
  const wss = new WebSocketServer({ noServer: true });
  const rooms = new Map(); // kullanıcı adı -> { bridge, clients:Set, status, idleTimer }

  function room(username) {
    let r = rooms.get(username);
    if (r) {
      clearTimeout(r.idleTimer);
      return r;
    }
    const bridge = fake || username === 'test' ? new FakeBridge() : new TikTokBridge(username, { signApiKey });
    r = { bridge, clients: new Set(), status: { state: 'connecting', username, viewers: 0, message: '' } };
    const send = (msg) => {
      const data = JSON.stringify(msg);
      for (const c of r.clients) if (c.readyState === 1) c.send(data);
    };
    bridge.on('status', (s) => { r.status = { ...r.status, ...s }; send({ type: 'status', status: r.status }); });
    bridge.on('chat', (user, text) => send({ type: 'chat', user, text }));
    bridge.on('gift', (user, gift) => send({ type: 'gift', user, gift }));
    bridge.on('like', (user, count) => send({ type: 'like', user, count }));
    bridge.on('social', (user, kind) => send({ type: 'social', user, kind }));
    bridge.start().catch((err) => console.error('[aktarıcı] başlatılamadı:', err));
    rooms.set(username, r);
    console.log(`[aktarıcı] @${username} dinleniyor`);
    return r;
  }

  wss.on('connection', (ws, username) => {
    const r = room(username);
    r.clients.add(ws);
    ws.send(JSON.stringify({ type: 'status', status: r.status }));
    // Bağlantı canlı mı? (bazı barındırma servisleri boşta kalan bağlantıyı keser)
    const ping = setInterval(() => { if (ws.readyState === 1) ws.ping(); }, 25000);
    ws.on('close', () => {
      clearInterval(ping);
      r.clients.delete(ws);
      if (!r.clients.size) {
        // Kimse dinlemiyorsa 2 dk sonra TikTok bağlantısını kapat
        r.idleTimer = setTimeout(() => {
          r.bridge.stop();
          rooms.delete(username);
          console.log(`[aktarıcı] @${username} bırakıldı`);
        }, 120000);
      }
    });
  });

  // http sunucusunun 'upgrade' olayına bağlanır
  return function handleUpgrade(req, socket, head) {
    const url = new URL(req.url, 'http://x');
    if (url.pathname !== '/relay') return false;
    const username = (url.searchParams.get('user') || '').replace(/^@/, '').trim().toLowerCase();
    const ok = /^[a-z0-9._]{2,40}$/.test(username)
      && (!key || url.searchParams.get('key') === key)
      && (!allowedUsers.length || allowedUsers.includes(username) || username === 'test');
    if (!ok) {
      socket.write('HTTP/1.1 403 Forbidden\r\n\r\n');
      socket.destroy();
      return true;
    }
    wss.handleUpgrade(req, socket, head, (ws) => wss.emit('connection', ws, username));
    return true;
  };
}
