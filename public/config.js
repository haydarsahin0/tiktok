// Tablet / GitHub Pages modunda ayarlar tarayıcının hafızasında (localStorage) durur.
// Her lig (taraftar, manifest...) kendi ayarlarını ve kayıtlarını ayrı tutar.
export const LIG_ID = globalThis.LIG?.id || new URLSearchParams(location.search).get('lig') || 'taraftar';
const KEY = `${LIG_ID}.config`;
const SAVE_KEY = `${LIG_ID}.save`;

export const DEFAULT_CONFIG = {
  username: '',
  source: 'relay', // 'relay' (ücretsiz aktarıcı) | 'euler'
  relayUrl: '',
  relayKey: '',
  apiKey: '',
  demo: false,
  mode: 'matchday', // futbol ligi: 'matchday' (Süper Lig maç günü) | 'classic' (klasik yarış)
  audio: { music: true, musicVolume: 0.35, sfx: true, sfxVolume: 0.6 },
  rules: {
    roundMinutes: 60,
    championSeconds: 15,
    pointsPerCoin: 100,
    pointsPerLike: 1,
    pointsPerFollow: 50,
    pointsPerShare: 50,
    pointsPerJoin: 10,
    maxUsers: 5000,
    matchday: { periodMinutes: 10 },
  },
};

function safe(fn, fallback) {
  try { return fn(); } catch { return fallback; }
}

export function loadConfig() {
  const saved = safe(() => JSON.parse(localStorage.getItem(KEY) || '{}'), {});
  return { ...DEFAULT_CONFIG, ...saved, rules: { ...DEFAULT_CONFIG.rules, ...(saved.rules || {}) } };
}

export function saveConfig(cfg) {
  safe(() => localStorage.setItem(KEY, JSON.stringify(cfg)));
}

export function makeStorage(key) {
  return {
    read: () => safe(() => localStorage.getItem(key), null),
    write: (text) => safe(() => localStorage.setItem(key, text)),
    clear: () => safe(() => localStorage.removeItem(key)),
  };
}
export const browserStorage = makeStorage(SAVE_KEY);
// Maç Günü modu kendi kaydını ayrı tutar (puan tablosu, hafta, skorlar)
export const matchdayStorage = makeStorage(`${LIG_ID}.matchday`);

// Yayın ekranı ile ayarlar sayfası arasında haberleşme (aynı tarayıcıda iki sekme)
export function channel() {
  return 'BroadcastChannel' in window ? new BroadcastChannel(`${LIG_ID}-ligi`) : { postMessage() {}, onmessage: null };
}
