// Yayın ekranının veri kaynağını seçer:
//  - Node sunucusu varsa (bilgisayar / bulut sunucu): ondan canlı veri alır
//  - Yoksa (GitHub Pages, tablet): oyunu tarayıcının içinde çalıştırır
const O = window.Overlay;

async function hasServer() {
  try {
    const r = await fetch(new URL('api/state', import.meta.url), { cache: 'no-store' });
    return r.ok && (r.headers.get('content-type') || '').includes('json');
  } catch {
    return false;
  }
}

function connectServer() {
  const ws = new WebSocket(`${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws`);
  ws.onmessage = (m) => {
    const msg = JSON.parse(m.data);
    if (msg.type === 'teams') O.setTeams(msg.teams);
    else if (msg.type === 'state') O.setState(msg.state);
    else if (msg.type === 'event') O.event(msg.event);
  };
  ws.onclose = () => setTimeout(connectServer, 2000);
}

const LIG_ID = window.LIG?.id || 'taraftar';
if (LIG_ID === 'taraftar' && (await hasServer())) {
  connectServer();
} else {
  const { startLocal } = await import('./local.js');
  await startLocal(O);
}
