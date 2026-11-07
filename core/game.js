import { FOOTBALL } from './teams.js';

// Bu dosya hem tarayıcıda (GitHub Pages / tablet) hem Node sunucusunda çalışır.
// Kayıt yeri dışarıdan verilir: storage = { read(): string|null, write(text) }

class Emitter {
  constructor() { this.handlers = {}; }
  on(name, fn) { (this.handlers[name] ||= []).push(fn); return this; }
  emit(name, ...args) {
    for (const fn of this.handlers[name] || []) {
      try { fn(...args); } catch (err) { console.error(err); }
    }
  }
}

export const DEFAULT_RULES = {
  pointsPerCoin: 100, // 1 TikTok coin (elmas) = 100 puan
  pointsPerLike: 1,
  pointsPerFollow: 50,
  pointsPerShare: 50,
  pointsPerJoin: 10, // turda ilk kez takımını yazana
  roundMinutes: 60, // 0 = tur hiç bitmez, puanlar birikir
  championSeconds: 15, // şampiyonluk ekranı süresi
  captainMinPoints: 1000, // kaptanlık değişimi en az bu puanla duyurulur (10 jeton)
  captainCooldownSec: 20, // aynı takımda iki kaptan duyurusu arası en az süre
  maxUsers: 20000, // kayıtlı taraftar sınırı (en eski silinir)
};

const now = () => Date.now();

export class Game extends Emitter {
  constructor({ rules = {}, storage = null, clock = now, roster = FOOTBALL } = {}) {
    super();
    this.roster = roster;
    this.rules = { ...DEFAULT_RULES, ...rules };
    this.storage = storage;
    this.clock = clock;
    this.dirty = true;

    this.users = {}; // uid -> { name, avatar, team, seen }
    this.trophies = {}; // teamId -> şampiyonluk sayısı
    this.history = []; // son şampiyonlar
    this.totals = { coins: 0, likes: 0 };
    this.championUntil = 0;
    this.lastChampion = null;
    this.newRound(1);
    this.load();
  }

  // ---------- tur yönetimi ----------

  newRound(number) {
    const t = this.clock();
    const minutes = this.rules.roundMinutes;
    this.round = { number, startedAt: t, endsAt: minutes > 0 ? t + minutes * 60_000 : 0 };
    this.points = {}; // teamId -> puan
    this.fans = {}; // uid -> { team, points, pending } (bu turda aktif olanlar)
    this.leader = null;
    this.captains = {}; // teamId -> uid (duyuru takibi için)
    this.captainChangedAt = {};
    this.dirty = true;
  }

  tick() {
    const t = this.clock();
    if (this.championUntil && t >= this.championUntil) {
      this.championUntil = 0;
      this.emit('event', { type: 'roundStart', round: this.round.number });
      this.dirty = true;
    }
    if (!this.championUntil && this.round.endsAt && t >= this.round.endsAt) {
      this.finishRound();
    }
  }

  finishRound() {
    const ranking = this.ranking();
    const top = ranking[0];
    if (top && top.points > 0) {
      this.trophies[top.id] = (this.trophies[top.id] || 0) + 1;
      const mvps = this.mvps(3).filter((m) => m.team === top.id);
      this.lastChampion = {
        round: this.round.number,
        team: top.id,
        points: top.points,
        trophies: this.trophies[top.id],
        runnerUp: ranking[1] && ranking[1].points > 0 ? { team: ranking[1].id, points: ranking[1].points } : null,
        mvps: mvps.length ? mvps : this.mvps(3).slice(0, 3),
        at: this.clock(),
      };
      this.history.unshift(this.lastChampion);
      this.history = this.history.slice(0, 30);
      this.championUntil = this.clock() + this.rules.championSeconds * 1000;
      this.emit('event', { type: 'champion', ...this.lastChampion });
    }
    this.newRound(this.round.number + 1);
    if (this.championUntil) {
      // Yeni turun sayacı şampiyonluk ekranı bittikten sonra başlasın
      const shift = this.championUntil - this.clock();
      this.round.startedAt += shift;
      if (this.round.endsAt) this.round.endsAt += shift;
    }
  }

  resetRound() {
    this.newRound(this.round.number + 1);
    this.emit('event', { type: 'roundStart', round: this.round.number });
  }

  // ---------- olaylar ----------

  touchUser(user) {
    if (!user || !user.id) return null;
    const existing = this.users[user.id] || {};
    const u = {
      ...existing,
      name: user.name || existing.name || user.id,
      avatar: user.avatar || existing.avatar || '',
      seen: this.clock(),
    };
    this.users[user.id] = u;
    this.dirty = true;
    return u;
  }

  fan(uid) {
    if (!this.fans[uid]) this.fans[uid] = { team: null, points: 0, pending: 0, joined: false };
    return this.fans[uid];
  }

  publicUser(uid) {
    const u = this.users[uid] || {};
    return { id: uid, name: u.name || uid, avatar: u.avatar || '', team: u.team || null };
  }

  addPoints(uid, teamId, amount, reason) {
    if (!amount) return;
    const before = this.leader;
    this.points[teamId] = (this.points[teamId] || 0) + amount;
    const f = this.fan(uid);
    f.points += amount;
    f.team = teamId;
    this.dirty = true;
    this.updateCaptain(teamId, uid);
    const lead = this.ranking()[0];
    if (lead && lead.points > 0 && lead.id !== before) {
      this.leader = lead.id;
      if (before) this.emit('event', { type: 'leader', team: lead.id, previous: before, reason });
    }
  }

  // Takım kaptanı: o takımın bu turda en çok puan getiren taraftarı
  updateCaptain(teamId, uid) {
    const cur = this.captains[teamId];
    if (cur === uid) return;
    const f = this.fans[uid];
    const curF = cur && this.fans[cur];
    if (cur && curF && curF.team === teamId && curF.points >= f.points) return;
    this.captains[teamId] = uid;
    const t = this.clock();
    const cooldown = this.rules.captainCooldownSec * 1000;
    if (cur && f.points >= this.rules.captainMinPoints && t - (this.captainChangedAt[teamId] || 0) >= cooldown) {
      this.captainChangedAt[teamId] = t;
      this.emit('event', { type: 'captain', team: teamId, user: this.publicUser(uid), points: f.points, previous: this.publicUser(cur) });
    }
  }

  captainsByTeam() {
    const best = {};
    for (const [uid, f] of Object.entries(this.fans)) {
      if (!f.team || f.points <= 0) continue;
      const b = best[f.team];
      if (!b || f.points > b.points) best[f.team] = { uid, points: f.points };
    }
    return best;
  }

  onChat(user, text) {
    const u = this.touchUser(user);
    if (!u) return;
    const match = this.roster.findTeam(text);
    const f = this.fan(user.id);

    if (match && (!u.team || (match.exact && match.id !== u.team))) {
      const from = u.team;
      u.team = match.id;
      f.team = match.id;
      this.dirty = true;
      this.emit('event', from
        ? { type: 'transfer', user: this.publicUser(user.id), team: match.id, from }
        : { type: 'join', user: this.publicUser(user.id), team: match.id });
    }

    if (u.team) {
      f.team = u.team;
      if (!f.joined) {
        f.joined = true;
        this.addPoints(user.id, u.team, this.rules.pointsPerJoin, 'join');
      }
      if (f.pending) {
        const p = f.pending;
        f.pending = 0;
        this.addPoints(user.id, u.team, p, 'gift');
        this.emit('event', { type: 'pendingApplied', user: this.publicUser(user.id), team: u.team, points: p });
      }
      this.emit('event', { type: 'chat', user: this.publicUser(user.id), text: String(text).slice(0, 60) });
    }
  }

  onGift(user, gift) {
    const u = this.touchUser(user);
    if (!u) return;
    const coins = Math.max(0, Math.round((gift.coins || 0) * (gift.count || 1)));
    if (!coins) return;
    this.totals.coins += coins;
    const points = coins * this.rules.pointsPerCoin;
    const f = this.fan(user.id);
    const base = { user: this.publicUser(user.id), gift: gift.name || 'Hediye', image: gift.image || '', count: gift.count || 1, coins, points };
    if (u.team) {
      f.joined = true;
      this.addPoints(user.id, u.team, points, 'gift');
      this.emit('event', { type: 'gift', team: u.team, ...base });
    } else {
      f.pending += points;
      this.dirty = true;
      this.emit('event', { type: 'needTeam', ...base });
    }
  }

  onLike(user, count) {
    const u = this.touchUser(user);
    if (!u) return;
    this.totals.likes += count;
    if (u.team) this.addPoints(user.id, u.team, count * this.rules.pointsPerLike, 'like');
  }

  onSocial(user, kind) {
    const u = this.touchUser(user);
    if (!u || !u.team) return;
    const pts = kind === 'follow' ? this.rules.pointsPerFollow : this.rules.pointsPerShare;
    this.addPoints(user.id, u.team, pts, kind);
    this.emit('event', { type: kind, user: this.publicUser(user.id), team: u.team, points: pts });
  }

  // ---------- görünüm ----------

  ranking() {
    return Object.entries(this.points)
      .map(([id, points]) => ({ id, points }))
      .sort((a, b) => b.points - a.points);
  }

  mvps(n = 5) {
    return Object.entries(this.fans)
      .filter(([, f]) => f.points > 0 && f.team)
      .sort((a, b) => b[1].points - a[1].points)
      .slice(0, n)
      .map(([uid, f]) => ({ ...this.publicUser(uid), team: f.team, points: f.points }));
  }

  snapshot() {
    const fanCount = {};
    for (const f of Object.values(this.fans)) if (f.team) fanCount[f.team] = (fanCount[f.team] || 0) + 1;

    // Puanı olanlar önce, sonra taraftarı olanlar, sonra kupa sayısına göre diğerleri
    const ranked = this.ranking();
    const seen = new Set(ranked.map((r) => r.id));
    const rest = this.roster.teams.filter((t) => !seen.has(t.id))
      .map((t, i) => ({ id: t.id, points: 0, order: [fanCount[t.id] || 0, this.trophies[t.id] || 0, -i] }))
      .sort((a, b) => b.order[0] - a.order[0] || b.order[1] - a.order[1] || b.order[2] - a.order[2]);
    const caps = this.captainsByTeam();
    const teams = [...ranked, ...rest].map((r) => ({
      id: r.id,
      points: r.points,
      fans: fanCount[r.id] || 0,
      trophies: this.trophies[r.id] || 0,
      captain: caps[r.id] ? { ...this.publicUser(caps[r.id].uid), points: caps[r.id].points } : null,
    }));

    const activeFans = Object.entries(this.fans)
      .filter(([, f]) => f.team)
      .map(([uid, f]) => ({ ...this.publicUser(uid), team: f.team, points: f.points, seen: this.users[uid]?.seen || 0 }))
      .sort((a, b) => b.seen - a.seen)
      .slice(0, 72);

    return {
      round: this.round,
      now: this.clock(),
      championUntil: this.championUntil,
      champion: this.championUntil ? this.lastChampion : null,
      teams,
      fans: activeFans,
      mvps: this.mvps(5),
      trophies: Object.entries(this.trophies)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([team, count]) => ({ team, count })),
      history: this.history.slice(0, 5).map((h) => ({ round: h.round, team: h.team, points: h.points })),
      totals: this.totals,
      rules: this.rules,
    };
  }

  // ---------- kayıt ----------

  toJSON() {
    return {
      version: 1,
      users: this.users,
      trophies: this.trophies,
      history: this.history,
      totals: this.totals,
      round: this.round,
      points: this.points,
      fans: this.fans,
    };
  }

  load() {
    if (!this.storage) return;
    try {
      const text = this.storage.read();
      if (!text) return;
      const data = JSON.parse(text);
      this.users = data.users || {};
      this.trophies = data.trophies || {};
      this.history = data.history || [];
      this.totals = data.totals || this.totals;
      if (data.round) {
        // Program kapalıyken tur süresi dolduysa kaldığı yerden devam eder; tick() bitirir
        this.round = data.round;
        if (this.rules.roundMinutes > 0 && !this.round.endsAt) {
          this.round.endsAt = this.clock() + this.rules.roundMinutes * 60_000;
        }
        if (this.rules.roundMinutes === 0) this.round.endsAt = 0;
        this.points = data.points || {};
        this.fans = data.fans || {};
      }
      // Listeden çıkarılmış takımları temizle
      for (const map of [this.points, this.trophies]) {
        for (const id of Object.keys(map)) if (!this.roster.byId[id]) delete map[id];
      }
      this.leader = this.ranking()[0]?.id || null;
    } catch (err) {
      console.error('[kayıt] okunamadı, sıfırdan başlıyor:', err.message);
    }
  }

  save(force = false) {
    if (!this.storage || (!this.dirty && !force)) return;
    this.pruneUsers();
    this.storage.write(JSON.stringify(this.toJSON()));
    this.dirty = false;
  }

  pruneUsers() {
    const ids = Object.keys(this.users);
    if (ids.length <= this.rules.maxUsers) return;
    ids.sort((a, b) => (this.users[a].seen || 0) - (this.users[b].seen || 0));
    for (const id of ids.slice(0, ids.length - this.rules.maxUsers)) {
      if (!this.fans[id]) delete this.users[id];
    }
  }
}
