# 6. videonun yorumlarından 12. hafta 1. tur sonuçları.
# Kurallar: her kullanıcının en fazla 2 yorumu sayılır (ilk yazdıkları), kanalın kendi yorumu sayılmaz,
# takım adı tanınmayan yorum geçersiz. Büyük dörde karşı oynayan Anadolu takımının puanı x1,5.
# Turu %65'ten fazla alan takım 1 gol atar (çifte gol yok). Oy yoksa ya da %65 geçilmezse gol yok.
import json, re, sys, unicodedata
src, out = sys.argv[1], sys.argv[2]
BIG = {'gs', 'fb', 'bjk', 'ts'}
MATCHES = [('ibfk','corum'),('amed','rize'),('erzurum','goztepe'),('kasimpasa','alanya'),('gb','gfk'),('gs','samsun'),('kocaeli','fb'),('konya','bjk'),('ts','eyup')]
AL = {'gs':['galatasaray','gs','cimbom','gala'],'fb':['fenerbahce','fb','fener'],'bjk':['besiktas','bjk','besikats','bes','besıktas'],'ts':['trabzonspor','trabzon','ts'],
 'ibfk':['basaksehir','ibfk'],'corum':['corum','corumfk'],'amed':['amedspor','amed'],'rize':['rizespor','rize','caykurrizespor'],'erzurum':['erzurumspor','erzurum'],
 'goztepe':['goztepe'],'kasimpasa':['kasimpasa'],'alanya':['alanyaspor','alanya'],'gb':['genclerbirligi','gencler'],'gfk':['gaziantep','gaziantepfk','gfk','antep'],
 'samsun':['samsunspor','samsun'],'kocaeli':['kocaelispor','kocaeli'],'konya':['konyaspor','konya'],'eyup':['eyupspor','eyup']}
def key(s):
    s = s.replace('ı','i').replace('İ','i').lower()
    s = unicodedata.normalize('NFKD', s); s = ''.join(c for c in s if not unicodedata.combining(c))
    return re.sub(r'[^a-z]', '', s)
LOOK = {key(a): t for t, al in AL.items() for a in al}
d = json.load(open(src)); cs = sorted(d['comments'], key=lambda c: (c['time'], c['cid']))
per, votes, rej = {}, {t: 0 for t in AL}, {'kanal': 0, 'tanınmadı': 0, 'limit (2+)': 0}
for c in cs:
    if c['user'] == 'taraftarligitr': rej['kanal'] += 1; continue
    t = LOOK.get(key(c['text'] or ''))
    if not t: rej['tanınmadı'] += 1; continue
    n = per.get(c['uid'], 0)
    if n >= 2: rej['limit (2+)'] += 1; continue
    per[c['uid']] = n + 1; votes[t] += 1
res = []
for h, a in MATCHES:
    mh = 1.5 if (a in BIG and h not in BIG) else 1; ma = 1.5 if (h in BIG and a not in BIG) else 1
    ph, pa = votes[h] * mh, votes[a] * ma; tot = ph + pa
    sh = ph / tot if tot else None
    hg = 1 if sh is not None and sh > 0.65 else 0; ag = 1 if sh is not None and (1 - sh) > 0.65 else 0
    res.append({'home': h, 'away': a, 'votesHome': votes[h], 'votesAway': votes[a], 'multHome': mh, 'multAway': ma, 'ptsHome': ph, 'ptsAway': pa,
                'shareHome': None if sh is None else round(sh, 4), 'hg': hg, 'ag': ag})
fans = len([c for c in cs if c['user'] != 'taraftarligitr'])
summary = {'week': 12, 'period': 1, 'video': 'https://www.tiktok.com/@taraftarligitr/video/7706557518062832929', 'fetchedAt': d['fetched'],
  'stats': {'apiCommentCount': d['meta']['total'], 'fanComments': fans, 'countedComments': sum(votes.values()), 'rejected': rej, 'uniqueCommenters': len({c['uid'] for c in cs if c['user'] != 'taraftarligitr'})},
  'votes': {k: v for k, v in votes.items() if v}, 'matches': res}
json.dump(summary, open(out, 'w'), ensure_ascii=False, indent=1)
for r in res: print(f"{r['home']:>9} {r['hg']}-{r['ag']} {r['away']:<9}  oy {r['votesHome']}-{r['votesAway']}  puan {r['ptsHome']}-{r['ptsAway']}  pay {r['shareHome']}")
print(json.dumps(summary['stats'], ensure_ascii=False)); print(summary['votes'])
