// Sunucusuz mod: oyun tamamen bu tarayıcı sekmesinde çalışır (GitHub Pages / tablet / telefon).
import { Game } from './core/game.js';
import { startDemo } from './core/demo.js';
import { connectEuler } from './euler.js';
import { connectRelay, sameOriginRelay } from './relay-client.js';
import { loadConfig, browserStorage, channel } from './config.js';
import { loadLeague } from './league.js';

export async function startLocal(O) {
  const cfg = loadConfig();
  const bc = channel();
  const league = await loadLeague();
  const game = new Game({ rules: cfg.rules, storage: browserStorage, roster: league.roster });

  // TikTok verisi nereden gelecek?
  //  relay: ücretsiz aktarıcı (Render vb.) — bu sayfa aktarıcıdan açıldıysa adres otomatik
  //  euler: Euler Stream (ücretli API anahtarı)
  let source = null;
  let relayUrl = cfg.relayUrl;
  if (!cfg.demo && cfg.username) {
    if (cfg.source === 'euler') source = cfg.apiKey ? 'euler' : null;
    else {
      if (!relayUrl && (await sameOriginRelay())) relayUrl = location.origin;
      if (relayUrl) source = 'relay';
      else if (cfg.apiKey) source = 'euler';
    }
  }
  const configured = Boolean(source);
  let live = { state: configured ? 'idle' : cfg.demo ? 'demo' : 'setup', username: cfg.username, viewers: 0, message: '', debug: null };

  O.setTeams(league.roster.teams);
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
  const handlers = {
    username: cfg.username,
    onChat: (u, t) => game.onChat(u, t),
    onGift: (u, g) => game.onGift(u, g),
    onLike: (u, c) => game.onLike(u, c),
    onSocial: (u, k) => game.onSocial(u, k),
    onStatus: (patch) => { live = { ...live, ...patch }; },
    onDebug: (lines) => { live = { ...live, debug: lines }; },
  };
  if (source === 'relay') {
    conn = connectRelay({ ...handlers, url: relayUrl, key: cfg.relayKey });
  } else if (source === 'euler') {
    conn = connectEuler({ ...handlers, apiKey: cfg.apiKey, url: cfg.wsUrl /* sadece test için */ });
  } else {
    // Ayar yapılmamışsa ayarlar butonunu göster, demo ile başla ki ekran boş görünmesin
    if (!cfg.demo) document.getElementById('tap')?.classList.add('show');
    stopDemo = startDemo(game, { speed: 1, roster: league.roster, ...league.demo });
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
    } else if (msg.type === 'celebrate') {
      // Ayarlar sayfasından: bir takımın kutlamasını önizle
      const t = league.roster.findTeam(msg.text || '');
      if (t) O.event({ type: 'leader', team: t.id, force: true });
    } else if (msg.type === 'audio') {
      window.TaraftarAudio?.configure(msg.audio);
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
