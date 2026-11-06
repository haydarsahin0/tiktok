// Tarayıcıdan TikTok canlı yayınına bağlantı: Euler Stream WebSocket servisi.
// Tarayıcı TikTok'a doğrudan bağlanamadığı için (imza + CORS) bu aracı servis kullanılır.
// Adres biçimi Euler'in resmi SDK'sından: wss://ws.eulerstream.com?uniqueId=...&apiKey=...
import { readUser, readGift, readComment, readLikeCount, readSocialKind, isStreakInProgress } from './core/tiktok-data.js';

const URL_BASE = 'wss://ws.eulerstream.com';

const CLOSE = {
  4005: ['offline', 'Yayın bitti', 30000],
  4006: ['reconnecting', 'Bir süredir mesaj gelmedi', 5000],
  4400: ['error', 'Geçersiz ayar (kullanıcı adını kontrol et)', 60000],
  4401: ['auth', 'API anahtarı hatalı', 0],
  4403: ['auth', 'API anahtarının bu işleme izni yok', 0],
  4404: ['offline', 'Yayın açık değil, bekleniyor', 30000],
  4408: ['reconnecting', 'Bağlantı zaman aşımı', 5000],
  4429: ['error', 'Çok fazla bağlantı (aynı anahtarla başka sekme açık olabilir)', 60000],
  4500: ['reconnecting', 'TikTok bağlantıyı kapattı', 5000],
  4555: ['reconnecting', 'Bağlantı süresi doldu, yenileniyor', 2000],
};

// Gelen JSON'un içinden {type, data} biçimindeki olayları bulur (paketli ya da tek tek).
export function extractEvents(node, out = [], depth = 0) {
  if (!node || typeof node !== 'object' || depth > 5) return out;
  if (Array.isArray(node)) {
    for (const item of node) extractEvents(item, out, depth + 1);
    return out;
  }
  if (typeof node.type === 'string') {
    if (node.data && typeof node.data === 'object') { out.push({ type: node.type, data: node.data }); return out; }
    if (typeof node.json === 'string') {
      try { out.push({ type: node.type, data: JSON.parse(node.json) }); } catch { /* bozuk */ }
      return out;
    }
  }
  if (node.roomStatusEvent || node.state && ('closeCode' in node || 'roomId' in node)) {
    out.push({ type: 'roomStatus', data: node.roomStatusEvent || node });
  }
  for (const [k, v] of Object.entries(node)) {
    if (k !== 'roomStatusEvent' && v && typeof v === 'object') extractEvents(v, out, depth + 1);
  }
  return out;
}

// "WebcastChatMessage" -> "chat"
export const eventKind = (type) => type.replace(/^Webcast/, '').replace(/Message$/, '').toLowerCase();

export function connectEuler({ username, apiKey, url = URL_BASE, onChat, onGift, onLike, onSocial, onStatus, onDebug }) {
  let ws = null;
  let stopped = false;
  let timer = null;
  let backoff = 5000;
  const debug = [];
  const note = (line) => {
    debug.unshift(`${new Date().toLocaleTimeString('tr-TR')} ${line}`);
    debug.length = Math.min(debug.length, 8);
    onDebug?.([...debug]);
  };

  function handle({ type, data }) {
    const kind = eventKind(type);
    if (kind === 'chat') {
      const user = readUser(data);
      const text = readComment(data);
      if (user && text) onChat(user, text);
    } else if (kind === 'gift') {
      const gift = readGift(data);
      if (isStreakInProgress(gift)) return;
      const user = readUser(data);
      if (user) onGift(user, gift);
    } else if (kind === 'like') {
      const user = readUser(data);
      if (user) onLike(user, readLikeCount(data));
    } else if (kind === 'social' || kind === 'follow' || kind === 'share') {
      const user = readUser(data);
      const k = kind === 'social' ? readSocialKind(data) : kind;
      if (user && k) onSocial(user, k);
    } else if (kind === 'roomuser') {
      const viewers = Number(data.viewerCount ?? data.totalUser ?? data.total ?? 0);
      if (viewers) onStatus({ viewers });
    } else if (kind === 'roomstatus') {
      const st = String(data.state || '').toLowerCase();
      if (st.includes('connected') && !st.includes('dis')) onStatus({ state: 'connected', message: '' });
      else if (st) onStatus({ state: st.includes('offline') || st.includes('ended') ? 'offline' : 'reconnecting', message: data.closeCodeMessage || '' });
    } else if (kind === 'control' || kind === 'streamend') {
      onStatus({ state: 'offline', message: 'Yayın bitti' });
    }
  }

  function open() {
    if (stopped) return;
    const params = new URLSearchParams({ uniqueId: username.replace(/^@/, ''), apiKey });
    params.set('features.bundleEvents', 'true');
    onStatus({ state: 'connecting', message: '' });
    ws = new WebSocket(`${url || URL_BASE}?${params}`);
    ws.binaryType = 'arraybuffer';
    let gotData = false;

    ws.onmessage = (m) => {
      if (typeof m.data !== 'string') { note(`ikili veri geldi (${m.data.byteLength} bayt) — desteklenmiyor`); return; }
      let json;
      try { json = JSON.parse(m.data); } catch { note('JSON olmayan mesaj'); return; }
      const events = extractEvents(json);
      if (!gotData) {
        gotData = true;
        backoff = 5000;
        onStatus({ state: 'connected', message: '' });
      }
      if (!events.length) note(`tanınmayan mesaj: ${m.data.slice(0, 120)}`);
      const counts = {};
      for (const ev of events) {
        counts[ev.type] = (counts[ev.type] || 0) + 1;
        try { handle(ev); } catch (err) { note(`işlenemedi ${ev.type}: ${err.message}`); }
      }
      if (events.length) note(Object.entries(counts).map(([t, n]) => `${t}×${n}`).join(' '));
    };

    ws.onclose = (e) => {
      if (stopped) return;
      const [state, message, wait] = CLOSE[e.code] || ['reconnecting', `Bağlantı koptu (${e.code})`, backoff];
      onStatus({ state, message });
      note(`kapandı: ${e.code} ${e.reason || message}`);
      if (!wait) return; // anahtar hatalıysa tekrar denemenin anlamı yok
      timer = setTimeout(open, wait);
      if (!CLOSE[e.code]) backoff = Math.min(backoff * 2, 60000);
    };
    ws.onerror = () => note('bağlantı hatası');
  }

  open();
  return {
    stop() { stopped = true; clearTimeout(timer); try { ws?.close(); } catch { /* yok */ } },
  };
}
