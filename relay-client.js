// Ücretsiz aktarıcıya bağlantı (Euler'siz yol).
// Aktarıcı = bulutta (ör. Render) çalışan bu projenin sunucusu, RELAY_ONLY=1 modunda.
// TikTok olaylarını alır, buraya hazır biçimde iletir: {type:'chat'|'gift'|'like'|'social'|'status', ...}

export function relayBase(url) {
  return String(url || '').trim().replace(/\/+$/, '').replace(/\/relay.*$/, '');
}

export function connectRelay({ url, username, key, onChat, onGift, onLike, onSocial, onStatus, onDebug }) {
  const base = relayBase(url) || location.origin;
  const wsBase = base.replace(/^http/, 'ws');
  let ws = null;
  let stopped = false;
  let timer = null;
  let backoff = 2000;
  const debug = [];
  const note = (line) => {
    debug.unshift(`${new Date().toLocaleTimeString('tr-TR')} ${line}`);
    debug.length = Math.min(debug.length, 8);
    onDebug?.([...debug]);
  };

  // Ücretsiz sunucular boşta kalınca uyur; 4 dakikada bir dürterek uyanık tutarız
  const wake = () => fetch(`${base}/api/ping`, { cache: 'no-store' }).catch(() => {});
  const pinger = setInterval(wake, 4 * 60 * 1000);

  function open() {
    if (stopped) return;
    const params = new URLSearchParams({ user: username.replace(/^@/, '') });
    if (key) params.set('key', key);
    onStatus({ state: 'connecting', message: 'Aktarıcıya bağlanıyor (uyuyorsa ~1 dk sürebilir)' });
    wake();
    ws = new WebSocket(`${wsBase}/relay?${params}`);

    ws.onopen = () => { backoff = 2000; note('aktarıcıya bağlandı'); };
    ws.onmessage = (m) => {
      let msg;
      try { msg = JSON.parse(m.data); } catch { return; }
      if (msg.type === 'chat') onChat(msg.user, msg.text);
      else if (msg.type === 'gift') onGift(msg.user, msg.gift);
      else if (msg.type === 'like') onLike(msg.user, msg.count);
      else if (msg.type === 'social') onSocial(msg.user, msg.kind);
      else if (msg.type === 'status') {
        const s = msg.status || {};
        onStatus({ state: s.state || 'connecting', message: s.message || '', viewers: s.viewers || 0 });
        note(`durum: ${s.state}${s.message ? ` — ${s.message}` : ''}`);
        return;
      }
      if (msg.type !== 'like') note(`${msg.type}: ${msg.user?.name || ''} ${msg.text || msg.gift?.name || msg.kind || ''}`);
    };
    ws.onclose = (e) => {
      if (stopped) return;
      onStatus({ state: 'reconnecting', message: `Aktarıcı bağlantısı koptu (${e.code})` });
      note(`aktarıcı kapandı: ${e.code}`);
      timer = setTimeout(open, backoff);
      backoff = Math.min(backoff * 2, 30000);
    };
    ws.onerror = () => note('aktarıcıya ulaşılamadı (adres doğru mu? uyanıyor olabilir)');
  }

  open();
  return {
    stop() { stopped = true; clearTimeout(timer); clearInterval(pinger); try { ws?.close(); } catch { /* yok */ } },
  };
}

// Bu sayfa bir aktarıcı sunucusundan mı açıldı? (Render adresini doğrudan açınca)
export async function sameOriginRelay() {
  try {
    const r = await fetch('api/ping', { cache: 'no-store' });
    if (!r.ok) return false;
    const j = await r.json();
    return Boolean(j.relay);
  } catch {
    return false;
  }
}
