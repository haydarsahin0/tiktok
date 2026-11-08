import test from 'node:test';
import assert from 'node:assert/strict';
import { MatchDayGame, baseStandings, pendingWeeks, sortTable } from '../public/core/matchday.js';

const user = (id) => ({ id, name: id, avatar: '' });

function setup() {
  let t = 1_000_000;
  const clock = () => t;
  const game = new MatchDayGame({ clock, rules: { pointsPerCoin: 100, pointsPerJoin: 0, pointsPerLike: 1 } });
  const events = [];
  game.on('event', (e) => events.push(e));
  return { game, events, advance: (ms) => { t += ms; game.tick(); } };
}

test('başlangıç puan durumu gerçek sonuçlardan hesaplanır', () => {
  const table = sortTable(baseStandings());
  assert.equal(table.length, 18);
  assert.equal(table[0].id, 'gs');
  assert.equal(table[0].pts, 28);
  assert.equal(table[0].p, 11);
  assert.equal(table.at(-1).id, 'eyup');
  const pend = pendingWeeks();
  assert.equal(pend[0].week, 11);
  assert.equal(pend[0].matches.length, 4);
});

test('ilk maç günü 11. haftanın kalan maçları, 0-0 başlar', () => {
  const { game } = setup();
  const s = game.snapshot();
  assert.equal(s.mode, 'matchday');
  assert.equal(s.md.week, 11);
  assert.deepEqual(s.md.matches.map((m) => `${m.home}-${m.away}`).sort(), ['alanya-ts', 'bjk-gb', 'corum-fb', 'rize-erzurum']);
  assert.ok(s.md.matches.every((m) => m.hg === 0 && m.ag === 0));
});

test('%65 üstü gol, %85 üstü çift gol, Anadolu takımına x1,5', () => {
  const { game, events, advance } = setup();
  game.onChat(user('f'), 'fener');
  game.onChat(user('c'), 'çorum');
  game.onGift(user('f'), { coins: 10 }); // FB 1000
  game.onGift(user('c'), { coins: 1 }); // Çorum 100 -> x1,5 = 150 ; FB payı 1000/1150 = %87 -> 2 gol
  const m = game.snapshot().md.matches.find((x) => x.away === 'fb');
  assert.equal(m.mult.home, 1.5);
  assert.equal(m.count, 2);
  advance(10 * 60_000);
  const after = game.snapshot().md.matches.find((x) => x.away === 'fb');
  assert.equal(after.ag, 2);
  assert.equal(events.filter((e) => e.type === 'goal').length, 2);
  // 2. tur: FB 1000, Çorum 500 (x1,5 = 750) -> FB %57: gol yok
  game.onGift(user('f'), { coins: 10 });
  game.onGift(user('c'), { coins: 5 });
  advance(10 * 60_000);
  assert.equal(game.snapshot().md.matches.find((x) => x.away === 'fb').ag, 2);
});

test('turda toplam 500 puan yoksa gol olmaz', () => {
  const { game, advance } = setup();
  game.onChat(user('b'), 'bjk');
  game.onLike(user('b'), 100); // 100 puan, %100 pay ama yetersiz
  advance(10 * 60_000);
  assert.equal(game.snapshot().md.matches.find((x) => x.home === 'bjk').hg, 0);
});

test('6 tur sonunda tablo güncellenir, ara verip sonraki haftaya geçer', () => {
  const { game, events, advance } = setup();
  game.onChat(user('t'), 'trabzon');
  game.onGift(user('t'), { coins: 10 }); // TS 1000 vs Alanya 0 -> 2 gol
  for (let i = 0; i < 6; i++) advance(10 * 60_000);
  assert.ok(events.some((e) => e.type === 'fullTime' && e.week === 11));
  const ts = game.snapshot().md.table.find((r) => r.id === 'ts');
  assert.equal(ts.p, 11);
  assert.equal(ts.pts, 25); // 22 + 3
  assert.equal(game.snapshot().md.phase, 'break');
  advance(26_000);
  const s = game.snapshot();
  assert.equal(s.md.phase, 'playing');
  assert.equal(s.md.week, 12);
  assert.equal(s.md.matches.length, 9);
});

test('maçı olmayan takımın taraftarının hediyesi bekletilir, maçı olan takımı yazınca eklenir', () => {
  const { game, events } = setup();
  game.onChat(user('g'), 'galatasaray'); // GS 11. haftanın kalan maçlarında yok
  assert.ok(events.some((e) => e.type === 'notPlaying'));
  game.onGift(user('g'), { coins: 3 });
  assert.equal(game.points.gs || 0, 0);
  game.onChat(user('g'), 'fb'); // maçı olan takıma geçer
  assert.equal(game.points.fb, 300);
  assert.ok(events.some((e) => e.type === 'pendingApplied'));
});

test('kayıt: kapatıp açınca maç günü kaldığı yerden devam eder', () => {
  let text = null;
  const storage = { read: () => text, write: (x) => { text = x; } };
  let t = 5_000_000;
  const g1 = new MatchDayGame({ clock: () => t, storage, rules: { pointsPerCoin: 100 } });
  g1.onChat(user('f'), 'fener');
  g1.onGift(user('f'), { coins: 10 });
  t += 10 * 60_000; g1.tick();
  g1.save(true);
  const g2 = new MatchDayGame({ clock: () => t, storage, rules: { pointsPerCoin: 100 } });
  const s = g2.snapshot();
  assert.equal(s.md.week, 11);
  assert.equal(s.md.period, 2);
  assert.equal(s.md.matches.find((x) => x.away === 'fb').ag, 2);
});
