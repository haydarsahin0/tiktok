import test from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../src/game.js';
import { findTeam, normalize } from '../src/teams.js';
import { readGift, readUser } from '../src/tiktok.js';

const user = (id) => ({ id, name: id, avatar: '' });

test('normalize Türkçe karakterleri sadeleştirir', () => {
  assert.equal(normalize('FENERBAHÇE!!'), 'fenerbahce');
  assert.equal(normalize('İstanbulspor'), 'istanbulspor');
  assert.equal(normalize('KARŞIYAKA'), 'karsiyaka');
});

test('findTeam ad, takma ad ve plaka tanır', () => {
  assert.deepEqual(findTeam('Trabzonspor'), { id: 'ts', exact: true });
  assert.deepEqual(findTeam('61'), { id: 'ts', exact: true });
  assert.deepEqual(findTeam('58'), { id: 'sivas', exact: true });
  assert.equal(findTeam('hadi cimbom be').id, 'gs');
  assert.equal(findTeam('hadi cimbom be').exact, false);
  assert.equal(findTeam('Anadolu Kartalı').id, 'konya');
  assert.equal(findTeam('adana demirspor').id, 'ads');
  assert.equal(findTeam('fenerbahceee').id, 'fb');
  assert.equal(findTeam('34'), null); // İstanbul'da birden fazla takım var
  assert.equal(findTeam('merhaba'), null);
  assert.equal(findTeam('bolum'), null);
});

test('takıma katılma, hediye ve beğeni puanı', () => {
  const g = new Game({ rules: { pointsPerCoin: 100, pointsPerJoin: 10, pointsPerLike: 1 } });
  g.onChat(user('a'), 'trabzon');
  assert.equal(g.points.ts, 10);
  g.onGift(user('a'), { coins: 1, count: 5 });
  assert.equal(g.points.ts, 510);
  g.onLike(user('a'), 20);
  assert.equal(g.points.ts, 530);
  // aynı turda tekrar yazmak katılım puanı vermez
  g.onChat(user('a'), 'trabzon');
  assert.equal(g.points.ts, 530);
});

test('takımı olmayanın hediyesi takımını yazınca eklenir', () => {
  const g = new Game({ rules: { pointsPerCoin: 100, pointsPerJoin: 0 } });
  const events = [];
  g.on('event', (e) => events.push(e.type));
  g.onGift(user('b'), { coins: 10, count: 1 });
  assert.equal(g.points.sivas, undefined);
  assert.ok(events.includes('needTeam'));
  g.onChat(user('b'), 'sivas');
  assert.equal(g.points.sivas, 1000);
  assert.ok(events.includes('pendingApplied'));
});

test('takım değiştirmek için sadece takım adını yazmak gerekir', () => {
  const g = new Game();
  g.onChat(user('c'), 'fener');
  g.onChat(user('c'), 'galatasaray maçı izledim'); // geçerken bahsetmek değiştirmez
  assert.equal(g.users.c.team, 'fb');
  g.onChat(user('c'), 'GS');
  assert.equal(g.users.c.team, 'gs');
});

test('tur bitince şampiyon kupa alır ve puanlar sıfırlanır', () => {
  let t = 1_000_000;
  const g = new Game({ clock: () => t, rules: { roundMinutes: 1, championSeconds: 10 } });
  g.onChat(user('a'), 'bursa');
  g.onGift(user('a'), { coins: 3 });
  g.onChat(user('b'), 'goztepe');
  t += 61_000;
  g.tick();
  assert.equal(g.trophies.bursa, 1);
  assert.equal(g.round.number, 2);
  assert.deepEqual(g.points, {});
  assert.ok(g.snapshot().champion);
  // kullanıcının takımı hatırlanır
  g.onGift(user('a'), { coins: 1 });
  assert.ok(g.points.bursa > 0);
  t += 11_000;
  g.tick();
  assert.equal(g.snapshot().champion, null);
});

test('TikTok olay alanları iki formatta da okunur', () => {
  assert.deepEqual(readUser({ user: { uniqueId: 'x', nickname: 'X', profilePictureUrl: 'p' } }), { id: 'x', name: 'X', avatar: 'p' });
  assert.deepEqual(readUser({ user: { displayId: 'y', nickname: 'Y', avatarThumb: { urlList: ['q'] } } }), { id: 'y', name: 'Y', avatar: 'q' });
  const g1 = readGift({ repeatCount: 3, repeatEnd: 1, gift: { diamondCount: 5, name: 'Kalp', type: 1 } });
  assert.equal(g1.coins, 5); assert.equal(g1.count, 3); assert.equal(g1.repeatEnd, true); assert.equal(g1.type, 1);
  const g2 = readGift({ repeatCount: 1, diamondCount: 99, giftName: 'Şapka', giftType: 2 });
  assert.equal(g2.coins, 99); assert.equal(g2.name, 'Şapka');
});
