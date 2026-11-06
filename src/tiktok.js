import { EventEmitter } from 'node:events';

import { readUser, readGift, readComment, readLikeCount, isStreakInProgress } from '../public/core/tiktok-data.js';

export { readUser, readGift };

/**
 * Yayına bağlanır, düşerse tekrar bağlanır. Şu olayları yayınlar:
 *  chat(user, text), gift(user, gift), like(user, count), social(user, 'follow'|'share'), status(obj)
 */
export class TikTokBridge extends EventEmitter {
  constructor(username, options = {}) {
    super();
    this.username = username.replace(/^@/, '');
    this.options = options;
    this.status = { state: 'idle', username: this.username, viewers: 0, message: '' };
    this.stopped = false;
    this.retryMs = 5000;
  }

  setStatus(patch) {
    this.status = { ...this.status, ...patch };
    this.emit('status', this.status);
  }

  async start() {
    const lib = await import('tiktok-live-connector');
    const Connection = lib.TikTokLiveConnection || lib.WebcastPushConnection;
    const E = lib.WebcastEvent || {};
    const C = lib.ControlEvent || {};
    const opts = { enableExtendedGiftInfo: true, processInitialData: false };
    if (this.options.signApiKey) opts.signApiKey = this.options.signApiKey;
    if (this.options.sessionId) {
      opts.session = { cookie: { sessionid: this.options.sessionId, 'tt-target-idc': this.options.targetIdc || 'useast2a' } };
    }
    this.conn = new Connection(this.username, opts);
    const on = (name, fn) => this.conn.on(name, (...args) => {
      try { fn(...args); } catch (err) { console.error(`[tiktok] ${name} işlenemedi:`, err); }
    });

    on(E.CHAT || 'chat', (data) => {
      const user = readUser(data);
      const text = readComment(data);
      if (user && text) this.emit('chat', user, text);
    });

    on(E.GIFT || 'gift', (data) => {
      const user = readUser(data);
      const gift = readGift(data);
      if (isStreakInProgress(gift)) return;
      if (user) this.emit('gift', user, gift);
    });

    on(E.LIKE || 'like', (data) => {
      const user = readUser(data);
      const count = readLikeCount(data);
      if (user && count > 0) this.emit('like', user, count);
    });

    on(E.FOLLOW || 'follow', (data) => {
      const user = readUser(data);
      if (user) this.emit('social', user, 'follow');
    });

    on(E.SHARE || 'share', (data) => {
      const user = readUser(data);
      if (user) this.emit('social', user, 'share');
    });

    on(E.ROOM_USER || 'roomUser', (data) => {
      const viewers = Number(data.viewerCount ?? data.total ?? data.totalUser ?? 0);
      if (viewers) this.setStatus({ viewers });
    });

    on(E.STREAM_END || 'streamEnd', () => {
      this.setStatus({ state: 'offline', message: 'Yayın bitti, tekrar başlaması bekleniyor' });
    });

    on(C.DISCONNECTED || 'disconnected', () => {
      if (this.stopped) return;
      this.setStatus({ state: 'reconnecting', message: 'Bağlantı koptu' });
      this.scheduleReconnect();
    });

    on(C.ERROR || 'error', (err) => {
      const msg = err?.info || err?.exception?.message || err?.message || String(err);
      console.error('[tiktok] hata:', msg);
    });

    this.connect();
  }

  async connect() {
    if (this.stopped || this.connecting) return;
    this.connecting = true;
    clearTimeout(this.timer);
    this.setStatus({ state: 'connecting', message: '' });
    try {
      const state = await this.conn.connect();
      this.retryMs = 5000;
      this.setStatus({ state: 'connected', message: `roomId ${state?.roomId || ''}`.trim() });
      console.log(`[tiktok] @${this.username} yayınına bağlandı`);
    } catch (err) {
      const msg = err?.message || String(err);
      const offline = /offline|not.*live|isn't online|UserOffline/i.test(msg) || err?.name === 'UserOfflineError';
      this.setStatus({ state: offline ? 'offline' : 'error', message: msg.slice(0, 160) });
      console.warn(`[tiktok] bağlanamadı (${offline ? 'yayın kapalı' : 'hata'}): ${msg}`);
      this.scheduleReconnect(offline ? 30000 : undefined);
    } finally {
      this.connecting = false;
    }
  }

  scheduleReconnect(ms) {
    clearTimeout(this.timer);
    const wait = ms ?? this.retryMs;
    this.retryMs = Math.min(this.retryMs * 2, 60000);
    this.timer = setTimeout(async () => {
      try { await this.conn.disconnect?.(); } catch { /* zaten kapalı */ }
      this.connect();
    }, wait);
  }

  async stop() {
    this.stopped = true;
    clearTimeout(this.timer);
    try { await this.conn?.disconnect?.(); } catch { /* yok say */ }
  }
}
