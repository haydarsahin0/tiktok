// Maç Günü modu: gerçek Süper Lig puan durumu ve fikstüründen devam eden "Taraftar Ligi".
// Her maç günü sıradaki haftanın maçları aynı anda oynanır: 6 tur x 25 dk.
// Bir turda maçın toplam puanının %65'inden fazlasını alan takım GOL atar (%85+ = 2 gol).
// Büyük dörtten biri (GS, FB, BJK, TS) Anadolu takımıyla oynuyorsa Anadolu takımının puanı x1,5 sayılır.
// Maç bitince 3/1/0 puanla tablo güncellenir; tablo oyunun kendi maçlarıyla ilerler.
import { Game } from './game.js';
import { SUPERLIG } from './superlig-data.js';

export const MATCHDAY_DEFAULTS = {
  periodMinutes: 25,
  periods: 6,
  goalShare: 0.65,
  doubleShare: 0.85,
  minPeriodPoints: 500,
  underdogBonus: 1.5,
  breakSeconds: 25,
};

export const BIG_CLUBS = new Set(['gs', 'fb', 'bjk', 'ts']);

const DATA_ID = `${SUPERLIG.source} — ${SUPERLIG.updated}`;

const emptyRow = () => ({ p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 });

export function applyResult(standings, home, away, hg, ag) {
  for (const [t, f, a] of [[home, hg, ag], [away, ag, hg]]) {
    const s = (standings[t] ||= emptyRow());
    s.p += 1; s.gf += f; s.ga += a;
    if (f > a) { s.w += 1; s.pts += 3; } else if (f === a) { s.d += 1; s.pts += 1; } else s.l += 1;
  }
}

// Gerçek sonuçlardan başlangıç puan durumu
export function baseStandings(data = SUPERLIG) {
  const st = {};
  for (const wk of data.weeks) for (const m of wk.matches) {
    st[m.home] ||= emptyRow();
    st[m.away] ||= emptyRow();
    if (m.hg !== undefined) applyResult(st, m.home, m.away, m.hg, m.ag);
  }
  return st;
}

// Henüz oynanmamış maçlar, hafta hafta
export function pendingWeeks(data = SUPERLIG) {
  return data.weeks
    .map((wk) => ({ week: wk.week, matches: wk.matches.filter((m) => m.hg === undefined).map((m) => ({ home: m.home, away: m.away })) }))
    .filter((wk) => wk.matches.length);
}

export function sortTable(standings) {
  return Object.entries(standings)
    .map(([id, s]) => ({ id, ...s, gd: s.gf - s.ga }))
    .sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.id.localeCompare(b.id));
}

export class MatchDayGame extends Game {
  constructor({ rules = {}, ...opts } = {}) {
    const md = { ...MATCHDAY_DEFAULTS, ...(rules.matchday || {}) };
    super({ ...opts, rules: { ...rules, roundMinutes: md.periodMinutes } });
    this.mdRules = md;
    // Gerçek lig verisi güncellendiyse (yeni sonuçlar eklendiyse) eski maç günü kaydı yerine
    // güncel tablo ve sıradaki haftadan başlanır. Taraftarlar, kaptanlar ve kupalar korunur.
    if (!this.md || !this.md.current || this.md.source !== DATA_ID) this.initFromData();
    else if (this.md.current.phase === 'playing' && !this.round.endsAt) this.startPeriod();
  }

  // ---------- kayıt ----------
  load() {
    super.load();
    try {
      const text = this.storage?.read();
      const data = text ? JSON.parse(text) : null;
      if (data?.md) this.md = data.md;
    } catch { /* yok */ }
  }

  toJSON() {
    return { ...super.toJSON(), md: this.md };
  }

  // ---------- sezon / maç günü ----------
  initFromData() {
    this.md = {
      season: SUPERLIG.season,
      source: DATA_ID,
      standings: baseStandings(SUPERLIG),
      queue: pendingWeeks(SUPERLIG),
      current: null,
      lastResults: null,
      recentGoals: [],
    };
    this.startMatchday();
  }

  newSeason() {
    // Sezon bitti: aynı fikstürle yeni Taraftar Ligi sezonu, tablo sıfırdan
    const table = sortTable(this.md.standings);
    this.emit('event', { type: 'seasonEnd', season: this.md.season, champion: table[0]?.id, table: table.slice(0, 4) });
    const standings = {};
    for (const id of Object.keys(this.md.standings)) standings[id] = emptyRow();
    const n = Number(String(this.md.season).slice(0, 4)) + 1;
    this.md.season = `${n}-${String(n + 1).slice(2)}`;
    this.md.standings = standings;
    this.md.queue = SUPERLIG.weeks.map((wk) => ({ week: wk.week, matches: wk.matches.map((m) => ({ home: m.home, away: m.away })) }));
  }

  startMatchday() {
    if (!this.md.queue.length) this.newSeason();
    const next = this.md.queue.shift();
    // Bekleyen (maçı olmayan taraftarların) puanları yeni maç gününe taşınır
    const pending = Object.entries(this.fans || {}).filter(([, f]) => f.pending).map(([uid, f]) => [uid, f.pending]);
    this.md.current = {
      week: next.week,
      matches: next.matches.map((m) => ({ ...m, hg: 0, ag: 0, goals: [], share: 0.5 })),
      period: 1,
      phase: 'playing',
      breakUntil: 0,
    };
    this.newRound(this.round?.number ? this.round.number + 1 : 1);
    this.startPeriod();
    this.emit('event', { type: 'matchdayStart', week: next.week, matches: this.md.current.matches.map((m) => [m.home, m.away]) });
    for (const [uid, pts] of pending) {
      const team = this.users[uid]?.team;
      const f = this.fan(uid);
      if (team && this.isPlaying(team)) {
        this.addPoints(uid, team, pts, 'gift');
        this.emit('event', { type: 'pendingApplied', user: this.publicUser(uid), team, points: pts });
      } else f.pending += pts;
    }
  }

  startPeriod() {
    const t = this.clock();
    this.points = {};
    this.leader = null;
    this.round = { number: this.md.current.period, startedAt: t, endsAt: t + this.mdRules.periodMinutes * 60_000 };
    this.dirty = true;
  }

  isPlaying(teamId) {
    const c = this.md?.current;
    return Boolean(c && c.phase === 'playing' && c.matches.some((m) => m.home === teamId || m.away === teamId));
  }

  multipliers(m) {
    const b = this.mdRules.underdogBonus;
    const hb = BIG_CLUBS.has(m.home);
    const ab = BIG_CLUBS.has(m.away);
    return { home: !hb && ab ? b : 1, away: hb && !ab ? b : 1 };
  }

  // Bu turun canlı durumu: ham puanlar, çarpanlı pay, gol olur mu?
  periodState(m) {
    const hp = this.points[m.home] || 0;
    const ap = this.points[m.away] || 0;
    const mult = this.multipliers(m);
    const hw = hp * mult.home;
    const aw = ap * mult.away;
    const share = hw + aw > 0 ? hw / (hw + aw) : 0.5;
    const enough = hp + ap >= this.mdRules.minPeriodPoints;
    let scorer = null;
    let count = 0;
    if (enough) {
      const lead = share >= 0.5 ? 'home' : 'away';
      const s = lead === 'home' ? share : 1 - share;
      if (s >= this.mdRules.doubleShare) count = 2;
      else if (s >= this.mdRules.goalShare) count = 1;
      if (count) scorer = lead;
    }
    return { hp, ap, mult, share, enough, scorer, count };
  }

  endPeriod() {
    const c = this.md.current;
    if (!c || c.phase !== 'playing') return;
    const goals = [];
    for (const m of c.matches) {
      const r = this.periodState(m);
      m.share = r.share;
      for (let i = 0; i < r.count; i++) {
        if (r.scorer === 'home') m.hg += 1; else m.ag += 1;
        const team = r.scorer === 'home' ? m.home : m.away;
        const g = { team, home: m.home, away: m.away, hg: m.hg, ag: m.ag, period: c.period, share: r.scorer === 'home' ? r.share : 1 - r.share, double: r.count === 2 };
        m.goals.push({ team, period: c.period });
        goals.push(g);
      }
    }
    for (const g of goals) this.emit('event', { type: 'goal', ...g });
    this.md.recentGoals = [...goals.reverse(), ...this.md.recentGoals].slice(0, 8);
    this.emit('event', { type: 'periodEnd', week: c.week, period: c.period, goals: goals.length });
    if (c.period >= this.mdRules.periods) this.fullTime();
    else {
      c.period += 1;
      this.startPeriod();
    }
  }

  fullTime() {
    const c = this.md.current;
    for (const m of c.matches) applyResult(this.md.standings, m.home, m.away, m.hg, m.ag);
    c.phase = 'break';
    c.breakUntil = this.clock() + this.mdRules.breakSeconds * 1000;
    this.md.lastResults = { week: c.week, matches: c.matches.map(({ home, away, hg, ag }) => ({ home, away, hg, ag })) };
    this.points = {};
    this.dirty = true;
    this.emit('event', { type: 'fullTime', ...this.md.lastResults });
  }

  tick() {
    const c = this.md?.current;
    if (!c) return;
    const t = this.clock();
    if (c.phase === 'break') {
      if (t >= c.breakUntil) this.startMatchday();
      return;
    }
    if (this.round.endsAt && t >= this.round.endsAt) this.endPeriod();
  }

  // Yönetim butonları: "turu bitir" = bu turu hemen bitir, "sıfırla" = turu baştan başlat
  finishRound() { this.endPeriod(); }
  resetRound() { this.startPeriod(); }

  // ---------- olaylar: maçı olmayan takımın taraftarı ----------
  onGift(user, gift) {
    const u = this.touchUser(user);
    if (!u) return;
    if (!u.team || this.isPlaying(u.team)) { super.onGift(user, gift); return; }
    const coins = Math.max(0, Math.round((gift.coins || 0) * (gift.count || 1)));
    if (!coins) return;
    this.totals.coins += coins;
    const points = coins * this.rules.pointsPerCoin;
    this.fan(user.id).pending += points;
    this.dirty = true;
    const reason = this.md.current.phase === 'break' ? 'break' : 'notPlaying';
    this.emit('event', { type: 'notPlaying', reason, user: this.publicUser(user.id), team: u.team, gift: gift.name || 'Hediye', points });
  }

  onChat(user, text) {
    const f = this.fan(user.id);
    const stash = f.pending;
    f.pending = 0; // Game.onChat bekleyeni maçı olmayan takıma yazmasın
    super.onChat(user, text);
    const u = this.users[user.id];
    if (!u?.team) { f.pending = stash; return; }
    if (stash) {
      if (this.isPlaying(u.team)) {
        this.addPoints(user.id, u.team, stash, 'gift');
        this.emit('event', { type: 'pendingApplied', user: this.publicUser(user.id), team: u.team, points: stash });
      } else f.pending = stash;
    }
    if (!this.isPlaying(u.team) && this.md.current.phase === 'playing' && !f.notified) {
      f.notified = true;
      this.emit('event', { type: 'notPlaying', user: this.publicUser(user.id), team: u.team, points: 0 });
    }
  }

  // ---------- görünüm ----------
  snapshot() {
    const base = super.snapshot();
    const c = this.md.current;
    const live = JSON.parse(JSON.stringify(this.md.standings));
    const playing = new Set();
    const matches = c.matches.map((m) => {
      playing.add(m.home);
      playing.add(m.away);
      const r = c.phase === 'playing' ? this.periodState(m) : { hp: 0, ap: 0, mult: this.multipliers(m), share: m.share, enough: false, scorer: null, count: 0 };
      if (c.phase === 'playing') applyResult(live, m.home, m.away, m.hg, m.ag); // canlı puan durumu
      return { home: m.home, away: m.away, hg: m.hg, ag: m.ag, goals: m.goals, ...r };
    });
    const table = sortTable(c.phase === 'playing' ? live : this.md.standings).map((row) => ({ ...row, playing: playing.has(row.id) && c.phase === 'playing' }));
    return {
      ...base,
      mode: 'matchday',
      md: {
        season: this.md.season,
        week: c.week,
        period: c.period,
        periods: this.mdRules.periods,
        phase: c.phase,
        breakUntil: c.breakUntil,
        matches,
        table,
        lastResults: this.md.lastResults,
        recentGoals: this.md.recentGoals.slice(0, 4),
        next: this.md.queue[0] ? { week: this.md.queue[0].week, matches: this.md.queue[0].matches.slice(0, 3) } : null,
        rules: this.mdRules,
      },
    };
  }
}
