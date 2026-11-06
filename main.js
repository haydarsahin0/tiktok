// Yayın ekranının veri kaynağını seçer:
//  - Node sunucusu varsa (bilgisayar / bulut sunucu): ondan canlı veri alır
//  - Yoksa (GitHub Pages, tablet): oyunu tarayıcının içinde çalıştırır
const O = window.Overlay;

async function hasServer() {
  try {
    const r = await fetch('api/state', { cache: 'no-store' });
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

if (await hasServer()) {
  connectServer();
} else {
  const { startLocal } = await import('./local.js');
  startLocal(O);
}
