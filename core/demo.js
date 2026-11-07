import { FOOTBALL } from './teams.js';

// Gerçek yayın olmadan denemek için sahte izleyiciler üretir.
const NAMES = [
  'Mert Oto', 'Ecee', 'TFB manyağı', 'ZAFER KAYA', 'Bordo Mavi 1967', 'eylülege', 'Samed Akman', 'Karadeniz 61',
  'Yiğido58', 'Cimbom Aşkı', 'Kanarya_34', 'Çarşı Ruhu', 'Dadaş25', 'Timsah16', 'Akrep07', 'Horoz20', 'Anadolu Kartalı',
  'Kayseri38', 'Antepli Ali', 'Hatay Aslanı', 'Rizeli Çaycı', 'Göz Göz', 'Kaf Kaf', 'Altaylı', 'Es Es Gelin',
  'Bolulu Aşçı', 'Ordulu Fındık', 'Urfalı Sıra', 'Elazığ23', 'Amed21', 'Samsun55', 'Çorumlu Leblebi',
];
const GIFTS = [
  { name: 'Gül', coins: 1, w: 50 },
  { name: 'TikTok', coins: 1, w: 30 },
  { name: 'Parmak Kalp', coins: 5, w: 18 },
  { name: 'Dondurma', coins: 1, w: 20 },
  { name: 'Donut', coins: 30, w: 6 },
  { name: 'Şapka', coins: 99, w: 3 },
  { name: 'Aslan', coins: 29999, w: 0.05 },
  { name: 'Galaksi', coins: 1000, w: 0.4 },
];
const CHATS = ['hadi be', 'şampiyon biziz', 'bas bas', 'gol gol gol', 'kim tutar bizi', 'arayı açmayalım', 'hakem nerde', 'efsane yayın', 'yürü be'];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
function weighted(arr) {
  const total = arr.reduce((s, x) => s + x.w, 0);
  let r = Math.random() * total;
  for (const x of arr) if ((r -= x.w) <= 0) return x;
  return arr[0];
}

export function startDemo(game, { speed = 1, roster = FOOTBALL, favorites, names = NAMES, chats = CHATS } = {}) {
  // Demo'da sadece birkaç taraf öne çıksın ki yarış görünsün
  const favs = favorites || ['ts', 'gs', 'fb', 'bjk', 'sivas', 'bursa', 'goztepe', 'amed', 'samsun', 'erzurum', 'konya'];
  const users = names.map((name, i) => ({
    id: `demo_${i}`,
    name,
    avatar: '',
    want: Math.random() < 0.8 ? pick(favs) : pick(roster.teams).id,
  }));
  const joined = new Set();

  const step = () => {
    const u = pick(users);
    const r = Math.random();
    if (!joined.has(u.id) || r < 0.15) {
      const team = roster.byId[u.want];
      const say = Math.random() < 0.3 && team.plate ? team.plate : pick(team.aliases);
      game.onChat(u, say);
      joined.add(u.id);
    } else if (r < 0.45) {
      const g = weighted(GIFTS);
      game.onGift(u, { name: g.name, coins: g.coins, count: g.coins < 10 ? 1 + Math.floor(Math.random() * 8) : 1 });
    } else if (r < 0.75) {
      game.onLike(u, 1 + Math.floor(Math.random() * 15));
    } else {
      game.onChat(u, pick(chats));
    }
  };
  const timer = setInterval(step, Math.max(50, 700 / speed));
  return () => clearInterval(timer);
}
