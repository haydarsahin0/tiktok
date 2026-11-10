/* 7. video "2. Tur Başladı" — ortak zaman çizelgesi ve veri. Görüntü ve ses yalnızca buradaki adlara göre hizalanır.
   Bu dosyadaki adlar değiştirilmez/silinmez (yeni sabit eklenebilir; PROMO.voFx/voGain'i yalnızca ses agent'ı ayarlar). */
const W = 1080, H = 1920, FPS = 30;
const getJSON = (u) => { const x = new XMLHttpRequest(); x.open('GET', u, false); x.send(); return JSON.parse(x.responseText); };
const VO = getJSON('tur2-cues.json');
const PROMO = { vo: 'tur2-ses.mp3', voOffset: 0, voTrim: VO.trim, voGain: 1.75, lufs: -12,
  voFx: "highpass=f=75,acompressor=threshold=-32dB:ratio=4:attack=2:release=90:makeup=4,equalizer=f=220:t=q:w=1.1:g=-1.5,equalizer=f=3200:t=q:w=1.2:g=3,alimiter=limit=0.5:attack=2:release=40:level=0:latency=1",
  out: 'taraftar-ligi-tur2.mp4' };
const norm = (w) => w.toLocaleLowerCase('tr-TR').replace(/[^a-zçğıöşü0-9']/g, '');
function cueW(word, nth = 1) { let k = 0; for (const w of VO.words) if (norm(w.w) === norm(word) && ++k === nth) return w; throw new Error('kelime bulunamadı: ' + word); }
const cue = (word, nth = 1) => cueW(word, nth).s;

// kelime başlangıçları (sn, kırpılmış sese göre)
const C = {
  birinci: cue('Birinci'), tur: cue('tur'), bitti: cue('bitti'), ve: cue('ve'), skorlar: cue('skorlar'), degisti: cue('değişti'),
  yirmi: cue('Yirmi'), yedi: cue('yedi'), yorum: cue('yorum'), geldi: cue('geldi'), kurallara: cue('kurallara'), uyan: cue('uyan'), on: cue('on'), altisini: cue('altısını'), saydik: cue('saydık'),
  besiktas: cue('Beşiktaş'), en: cue('en'), cok: cue('çok'), yazilan: cue('yazılan'), takim: cue('takım'), oldu: cue('oldu'),
  konya: cue('Konya'), deplasmaninda: cue('deplasmanında'), bir: cue('bir'), sifir: cue('sıfır'), onde: cue('önde'),
  galatasaray: cue('Galatasaray'), samsunspora: cue("Samsunspor'a"), golunu: cue('golünü'), atti: cue('attı'),
  fenerbahce: cue('Fenerbahçe'), kocaelide: cue("Kocaeli'de"), one: cue('öne'), gecti: cue('geçti'),
  amedspor: cue('Amedspor'), ve2: cue('ve', 2), gaziantep: cue('Gaziantep'), golunu2: cue('golünü', 2), buldu: cue('buldu'),
  basaksehir: cue('Başakşehir'), corum: cue('Çorum'), erzurum: cue('Erzurum'), goztepe: cue('Göztepe'), kasimpasa: cue('Kasımpaşa'), alanya: cue('Alanya'), trabzonspor: cue('Trabzonspor'), eyup: cue('Eyüp'),
  sizin: cue('sizin'), maclarinizda: cue('maçlarınızda'), henuz: cue('henüz'), gol: cue('gol'), yok: cue('yok'), taraftariniz: cue('Taraftarınız'), neredeydi: cue('neredeydi'),
  maclar: cue('Maçlar'), simdi: cue('şimdi'), bitse: cue('bitse'), puan: cue('puan'), tablosu: cue('tablosu'), boyle: cue('böyle'),
  ama: cue('Ama'), alti: cue('altı'), turun: cue('turun'), sadece: cue('sadece'), biri: cue('biri'), bitti2: cue('bitti', 2),
  ikinci: cue('İkinci'), tur2: cue('tur', 2), basladi: cue('başladı'),
  takimin: cue('Takımın'), yuzde: cue('yüzde'), altmis: cue('altmış'), besi: cue('beşi'), gecerse: cue('geçerse'), golu: cue('golü'), atar: cue('atar'),
  dort: cue('Dört'), buyuklere: cue('büyüklere'), karsi: cue('karşı'), oynayan: cue('oynayan'), anadolu: cue('Anadolu'), takiminin: cue('takımının'), her: cue('her'), yorumu: cue('yorumu'), bir2: cue('bir', 2), bucuk: cue('buçuk'), sayilir: cue('sayılır'),
  bir3: cue('Bir', 3), kisi: cue('kişi'), on2: cue('on', 2), bir4: cue('bir', 4), kez: cue('kez'), yazdi: cue('yazdı'),
  sadece2: cue('sadece', 2), ikisi: cue('ikisi'), sayildi: cue('sayıldı'), herkesin: cue('herkesin'), en2: cue('en', 2), fazla: cue('fazla'), iki: cue('iki'), yorumu2: cue('yorumu', 2), gecerli: cue('geçerli'),
  ve3: cue('Ve', 3), en3: cue('en', 3), onemlisi: cue('önemlisi'), yorumunun: cue('yorumunun'), sayilmasi: cue('sayılması'), icin: cue('için'), videoyu: cue('videoyu'), begenmen: cue('beğenmen'), sart: cue('şart'),
  begen: cue('Beğen'), takip: cue('takip'), et: cue('et'), takimini: cue('takımını'), yorumlara: cue('yorumlara'), yaz: cue('yaz'), cunku: cue('çünkü'),
};

// süre: son kelime bitince kısa nefes; "çünkü → birinci tur bitti…" kesintisiz bağlanır. Tam kare sayısı.
const DUR = Math.ceil((cueW('çünkü').e + 0.12) * FPS) / FPS;

// ---------- 12. hafta 1. tur sonuçları (6. videonun yorumlarından sayıldı: promo/sayim/hafta12-tur1.json) ----------
// Sıra, 6. videodaki maç sırasıdır. votes = sayılan yorum, pts = çarpanlı puan, hg/ag = 1. tur golleri.
const TUR1 = getJSON('sayim/hafta12-tur1.json');
const RESULTS = TUR1.matches.map((m, i) => ({ i, home: m.home, away: m.away, votesHome: m.votesHome, votesAway: m.votesAway, ptsHome: m.ptsHome, ptsAway: m.ptsAway, shareHome: m.shareHome, hg: m.hg, ag: m.ag, goal: m.hg + m.ag > 0 }));
const STATS = { fanComments: TUR1.stats.fanComments, counted: TUR1.stats.countedComments, spamCut: TUR1.stats.rejected['limit (2+)'], invalid: TUR1.stats.rejected['tanınmadı'], commenters: TUR1.stats.uniqueCommenters };
// Maçlar şimdi bitse puan durumu (11. hafta sonu + 1. tur skorları; 18 takım, sıralı): pos, id, p, w, d, l, gf, ga, gd, pts
const TABLE = getJSON('sayim/hafta12-tur1-tablo.json');
// 11. hafta sonu tablosu (yer değiştirme animasyonu için başlangıç): basit hesap, aynı kaynaktan
const ROUNDS_TOTAL = 6, ROUND_NOW = 2, GOAL_SHARE = 0.65, ANADOLU_MULT = 1.5, MAX_PER_USER = 2;

// sahne başlangıçları ve ortak olay anları (sn). Sahne, kelimeden ~0.1 sn önce açılır.
const T = {
  hook: 0,                          // 1: "Birinci tur bitti… ve skorlar değişti!"
  turBitti: C.bitti,                // "1. TUR BİTTİ" damgası / düdük
  skorFlip: C.skorlar,              // 9 maçın skorları döner
  stats: C.yirmi - 0.1,             // 2: istatistik: 27 yorum → 16 sayıldı
  statCut: C.kurallara,             // elenenler düşer (spam 10, geçersiz 1)
  statCount: C.altisini,            // "16" sayacı oturur
  bjk: C.besiktas - 0.1,            // 3: Beşiktaş golü (Konya 0-1 BJK), oy 7
  bjkGoal: C.onde,                  // skor 0-1 çakılır
  gs: C.galatasaray - 0.1,          // 4: GS 1-0 Samsun
  gsGoal: C.atti,
  fb: C.fenerbahce - 0.1,           // 5: Kocaeli 0-1 FB
  fbGoal: C.gecti,
  amedGfk: C.amedspor - 0.1,        // 6: Amed 1-0 Rize ve GB 0-1 Gaziantep (ikili)
  gfkHit: C.gaziantep,
  noGoal: C.basaksehir - 0.1,       // 7: gol olmayan 4 maç; isim başına kart vurur
  noGoalNames: [C.basaksehir, C.corum, C.erzurum, C.goztepe, C.kasimpasa, C.alanya, C.trabzonspor, C.eyup],
  henuzYok: C.henuz,                // "HENÜZ GOL YOK" damgası
  nerede: C.taraftariniz,           // "Taraftarınız neredeydi?"
  tablo: C.maclar - 0.1,            // 8: anlık puan tablosu
  tabloShuffle: C.puan,             // satırlar yeni sıraya kayar
  ama: C.ama,                       // "6 TURUN 1'İ" ilerleme
  ikinci: C.ikinci - 0.1,           // 9: "2. TUR BAŞLADI" (büyük vuruş)
  kural65: C.takimin - 0.1,         // 10: kural 1 — %65 çizgisi
  kuralAnadolu: C.dort - 0.1,       // 11: kural 2 — Anadolu ×1,5
  kuralSpam: C.bir3 - 0.1,          // 12: kural 3 — 11 yorum yazılıyor, 9'u siliniyor, 2 sayılıyor
  spamCut: C.sadece2,
  begeni: C.ve3 - 0.1,              // 13: EN ÖNEMLİSİ — beğeni şartı (kilit/kalp)
  begeniLock: C.yorumunun,
  begeniUnlock: C.begenmen,
  cta: C.begen - 0.1,               // 14: Beğen → takip et → takımını yaz
  heart: C.begen,
  tap: C.takip + 0.08,
  pill: C.takimini,
  settle: C.cunku,                  // her şey t=0 düzenine oturur
  end: DUR,
};
