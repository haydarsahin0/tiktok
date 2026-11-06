// Tablet / GitHub Pages modunda ayarlar tarayıcının hafızasında (localStorage) durur.
const KEY = 'taraftar.config';
const SAVE_KEY = 'taraftar.save';

export const DEFAULT_CONFIG = {
  username: '',
  apiKey: '',
  demo: false,
  rules: {
    roundMinutes: 60,
    championSeconds: 15,
    pointsPerCoin: 100,
    pointsPerLike: 1,
    pointsPerFollow: 50,
    pointsPerShare: 50,
    pointsPerJoin: 10,
    maxUsers: 5000,
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

export const browserStorage = {
  read: () => safe(() => localStorage.getItem(SAVE_KEY), null),
  write: (text) => safe(() => localStorage.setItem(SAVE_KEY, text)),
  clear: () => safe(() => localStorage.removeItem(SAVE_KEY)),
};

// Yayın ekranı ile ayarlar sayfası arasında haberleşme (aynı tarayıcıda iki sekme)
export function channel() {
  return 'BroadcastChannel' in window ? new BroadcastChannel('taraftar-ligi') : { postMessage() {}, onmessage: null };
}
