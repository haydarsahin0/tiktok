#!/usr/bin/env python3
"""Süper Lig sonuçlarını ve fikstürünü Vikipedi'den çekip public/core/superlig-data.js dosyasını yeniden üretir.

Kullanım (proje klasöründe):  python3 scripts/superlig-guncelle.py
Not: Oyun bu dosyayı sadece İLK açılışta (ya da maç günü kayıtları silinince) başlangıç noktası olarak kullanır.
Oyun başladıktan sonra puan tablosunu oyunun kendi maçları belirler.
"""
import os, subprocess, sys, tempfile, urllib.request

URL = 'https://tr.wikipedia.org/w/index.php?title=%C5%9Eablon:2026-27_S%C3%BCper_Lig_puan_durumu&action=raw'
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
req = urllib.request.Request(URL, headers={'User-Agent': 'TaraftarLigi/1.0 (fan game)'})
raw = urllib.request.urlopen(req, timeout=30).read().decode('utf-8')
with tempfile.NamedTemporaryFile('w', suffix='.txt', delete=False, encoding='utf-8') as f:
    f.write(raw)
sys.argv = [sys.argv[0], f.name, os.path.join(root, 'public', 'core', 'superlig-data.js')]
# --- ayrıştırma ---
import re, sys, json
raw = open(sys.argv[1], encoding='utf-8').read()
CODE = {'GAL':'gs','BJK':'bjk','AME':'amed','KAS':'kasimpasa','ÇYR':'rize','KOC':'kocaeli','GFK':'gfk','ALA':'alanya',
        'TRA':'ts','ÇFK':'corum','FNB':'fb','GEN':'gb','İBF':'ibfk','SAM':'samsun','EFK':'erzurum','KON':'konya','EYÜ':'eyup','GÖZ':'goztepe'}
update = re.search(r'\|update=([^\n|]+)', raw).group(1).strip()
weeks = {}
for m in re.finditer(r'<!-- (\d+)\. Hafta -->\n(.*?)(?=\n<!--|\n\n)', raw, re.S):
    wk = int(m.group(1))
    for part in m.group(2).split('|match_')[1:]:
        key, val = part.split('=', 1)
        h, a = key.strip().split('_')
        val = val.strip()
        played = 'kısaltma' not in val
        sc = re.search(r'(\d+)-(\d+)\s*\]*\s*$', val) if played else None
        if played: assert sc, (wk, key, val)
        weeks.setdefault(wk, []).append({'home': CODE[h], 'away': CODE[a], **({'hg': int(sc.group(1)), 'ag': int(sc.group(2))} if sc else {})})
assert len(weeks) == 34 and all(len(v) == 9 for v in weeks.values())
teams = sorted(set(CODE.values()))
st = {t: dict(p=0,w=0,d=0,l=0,gf=0,ga=0,pts=0) for t in teams}
for ms in weeks.values():
    for m in ms:
        if 'hg' not in m: continue
        for t, f, a in ((m['home'], m['hg'], m['ag']), (m['away'], m['ag'], m['hg'])):
            s = st[t]; s['p'] += 1; s['gf'] += f; s['ga'] += a
            if f > a: s['w'] += 1; s['pts'] += 3
            elif f == a: s['d'] += 1; s['pts'] += 1
            else: s['l'] += 1
table = sorted(teams, key=lambda t: (-st[t]['pts'], -(st[t]['gf']-st[t]['ga']), -st[t]['gf']))
for i, t in enumerate(table, 1):
    s = st[t]; print(f"{i:2} {t:10} O{s['p']:2} G{s['w']} B{s['d']} M{s['l']} {s['gf']}-{s['ga']} AV{s['gf']-s['ga']:+d} P{s['pts']}")
pending = [(wk, m['home'] + '-' + m['away']) for wk, ms in sorted(weeks.items()) for m in ms if 'hg' not in m]
print('güncelleme:', update, '| oynanmamış ilk maçlar:', pending[:6], '| toplam oynanmamış:', len(pending))
out = {'season': '2026-27', 'source': 'Vikipedi: Şablon:2026-27 Süper Lig puan durumu (kaynak TFF)', 'updated': update,
       'weeks': [{'week': wk, 'matches': weeks[wk]} for wk in sorted(weeks)]}
js = ("// Trendyol Süper Lig 2026-27: gerçek sonuçlar ve fikstür (oyunun başlangıç noktası).\n"
      f"// Kaynak: {out['source']}, güncelleme: {update}.\n"
      "// Skoru olan maçlar oynanmıştır; olmayanlar oyunda Taraftar Ligi maç günü olarak oynanır.\n"
      "// Takım kodları public/core/teams.js içindeki id'lerdir. Yenilemek için: scripts/superlig-guncelle.py\n"
      "export const SUPERLIG = " + json.dumps(out, ensure_ascii=False) .replace('{"week"', '\n {"week"') + ";\n")
open(sys.argv[2], 'w', encoding='utf-8').write(js)
