// Sunucusuz mod: oyun tamamen bu tarayıcı sekmesinde çalışır (GitHub Pages / tablet / telefon).
import { TEAMS } from './core/teams.js';
import { Game } from './core/game.js';
import { startDemo } from './core/demo.js';
import { connectEuler } from './euler.js';
import { loadConfig, browserStorage, channel } from './config.js';

export function startLocal(O) {
  const cfg = loadConfig();
  const bc = channel();
  const game = new Game({ rules: cfg.rules, storage: browserStorage });
  const configured = cfg.username && cfg.apiKey && !cfg.demo;
  let live = { state: configured ? 'idle' : cfg.demo ? 'demo' : 'setup', username: cfg.username, viewers: 0, message: '', debug: null };

  O.setTeams(TEAMS);
  game.on('event', (e) => {
    O.event(e);
    bc.postMessage({ type: 'event', event: e });
  });

  const push = () => {
    game.tick();
    const s = { ...game.snapshot(), live };
    O.setState(s);
    bc.postMessage({ type: 'state', state: s });
  };
  setInterval(push, 250);
  push();

  setInterval(() => game.save(), 5000);
  const flush = () => game.save(true);
  addEventListener('pagehide', flush);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(); });

  let stopDemo = null;
  let conn = null;
  if (configured) {
    conn = connectEuler({
      username: cfg.username,
      apiKey: cfg.apiKey,
      url: cfg.wsUrl, // sadece test için başka sunucu adresi
      onChat: (u, t) => game.onChat(u, t),
      onGift: (u, g) => game.onGift(u, g),
      onLike: (u, c) => game.onLike(u, c),
      onSocial: (u, k) => game.onSocial(u, k),
      onStatus: (patch) => { live = { ...live, ...patch }; },
      onDebug: (lines) => { live = { ...live, debug: lines }; },
    });
  } else {
    // Ayar yapılmamışsa ayarlar butonunu göster, demo ile başla ki ekran boş görünmesin
    if (!cfg.demo) document.getElementById('tap')?.classList.add('show');
    stopDemo = startDemo(game, { speed: 1 });
  }

  // Ayarlar sayfasından gelen komutlar
  bc.onmessage = ({ data: msg }) => {
    if (!msg || typeof msg !== 'object') return;
    if (msg.type === 'sim') {
      const u = { id: msg.user || 'Test', name: msg.user || 'Test', avatar: '' };
      if (msg.kind === 'chat') game.onChat(u, msg.text || '');
      else if (msg.kind === 'gift') game.onGift(u, { name: msg.giftName || 'Hediye', coins: Number(msg.coins) || 1, count: Number(msg.count) || 1 });
      else if (msg.kind === 'like') game.onLike(u, Number(msg.count) || 10);
      else if (msg.kind === 'follow' || msg.kind === 'share') game.onSocial(u, msg.kind);
    } else if (msg.type === 'finishRound') {
      game.finishRound();
    } else if (msg.type === 'resetRound') {
      game.resetRound();
    } else if (msg.type === 'wipe') {
      stopDemo?.();
      conn?.stop();
      browserStorage.clear();
      game.storage = null; // kapanırken eski veriyi geri yazmasın
      location.reload();
    } else if (msg.type === 'reload') {
      game.save(true);
      location.reload();
    }
  };
}
