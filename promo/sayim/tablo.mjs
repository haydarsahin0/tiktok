// 11. hafta sonu tablosu + 12. hafta 1. tur anlık skorları (maçlar şimdi bitse) → sıralı tablo
import fs from 'fs';
import { baseStandings, applyResult, sortTable } from '../../public/core/matchday.js';
const tur = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const st = baseStandings();
for (const m of tur.matches) applyResult(st, m.home, m.away, m.hg, m.ag);
const t = sortTable(st);
fs.writeFileSync(process.argv[3], JSON.stringify(t.map((r, i) => ({ pos: i + 1, ...r })), null, 1));
t.forEach((r, i) => console.log(String(i + 1).padStart(2), r.id.padEnd(10), r.p, r.pts, r.gd));
