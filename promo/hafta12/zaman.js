/* 12. Hafta (6. video) — zaman çizelgesi. Ortak sözleşme: görüntü ve ses yalnızca buradaki sabitlere göre hizalanır.
   Bu dosyadaki adlar değiştirilmez/silinmez (yeni sabit eklenebilir). */
const W = 1080, H = 1920, FPS = 30;
const getJSON = (u) => { const x = new XMLHttpRequest(); x.open('GET', u, false); x.send(); return JSON.parse(x.responseText); };
const VO = getJSON('hafta12-cues.json');
const PROMO = { vo: 'hafta12-ses.mp3', voOffset: 0, voTrim: VO.trim, voGain: 2.0, lufs: -12,
  voFx: "highpass=f=75,acompressor=threshold=-30dB:ratio=3.5:attack=4:release=110:makeup=3.5,equalizer=f=220:t=q:w=1.1:g=-1.5,equalizer=f=3200:t=q:w=1.2:g=3,volume=0:enable='between(t,34.28,35.00)'", out: 'taraftar-ligi-hafta12.mp4' };
const norm = (w) => w.toLocaleLowerCase('tr-TR').replace(/[^a-zçğıöşü0-9']/g, '');
function cueW(word, nth = 1) { let k = 0; for (const w of VO.words) if (norm(w.w) === norm(word) && ++k === nth) return w; throw new Error('kelime bulunamadı: ' + word); }
const cue = (word, nth = 1) => cueW(word, nth).s;

// kelime başlangıçları (sn)
const C = {
  bu: cue('Bu'), videonun: cue('videonun'), yorumlari: cue('yorumları'), on: cue('on'), ikinci: cue('ikinci'), haftada: cue('haftada'),
  uc: cue('üç'), puani: cue('puanı'), kimin: cue('kimin'), alacagina: cue('alacağına'), karar: cue('karar'), veriyor: cue('veriyor'),
  kural: cue('Kural'), tek: cue('tek'), yorumlarda: cue('yorumlarda'), rakibinden: cue('rakibinden'), daha: cue('daha'), cok: cue('çok'),
  adi: cue('adı'), yazilan: cue('yazılan'), takim: cue('takım'), uc2: cue('üç', 2), puani2: cue('puanı', 2), alir: cue('alır'),
  maclar: cue('Maçlar'), sirayla: cue('sırayla'), geliyor: cue('geliyor'),
  simdi: cue('Şimdi'), ortam: cue('ortam'), isiniyor: cue('ısınıyor'),
  sen: cue('Sen'), yazmazsan: cue('yazmazsan'), rakibin: cue('rakibin'), yazar: cue('yazar'),
  ve: cue('ve'), uc3: cue('üç', 3), puan: cue('puan'), onlara: cue('onlara'), gider: cue('gider'),
  dikkat: cue('Dikkat'), sadece: cue('sadece'), bu2: cue('bu', 2), hafta: cue('hafta'), yorumlarla: cue('yorumlarla'), belli: cue('belli'), oluyor: cue('oluyor'),
  diger: cue('Diğer'), butun: cue('bütün'), haftalar: cue('haftalar'), canli: cue('canlı'), yayinda: cue('yayında'),
  gozunun: cue('gözünün'), onunde: cue('önünde'), oynanacak: cue('oynanacak'),
  kacirmamak: cue('Kaçırmamak'), icin: cue('için'), takip: cue('takip'), et: cue('et'), videoyu: cue('videoyu'), begen: cue('beğen'),
  ve2: cue('ve', 2), takiminin: cue('takımının'), adini: cue('adını'), hemen: cue('hemen'), yorumlara: cue('yorumlara'), yaz: cue('yaz'), cunku: cue('çünkü'),
};

// süre: son kelime bitince kısa bir nefes; "çünkü → bu videonun…" kesintisiz bağlanır. Tam kare sayısı.
const DUR = Math.ceil((cueW('çünkü').e + 0.15) * FPS) / FPS;

// 12. hafta maçları (ev sahibi – deplasman), sırayla; tHome/tAway = takım adının söylendiği an
const MATCHES = [
  ['ibfk', 'corum', 'Başakşehir', 'Çorum'], ['amed', 'rize', 'Amedspor', 'Rizespor'], ['erzurum', 'goztepe', 'Erzurumspor', 'Göztepe'],
  ['kasimpasa', 'alanya', 'Kasımpaşa', 'Alanyaspor'], ['gb', 'gfk', 'Gençlerbirliği', 'Gaziantep'],
  ['gs', 'samsun', 'Galatasaray', 'Samsunspor'], ['kocaeli', 'fb', 'Kocaelispor', 'Fenerbahçe'], ['konya', 'bjk', 'Konyaspor', 'Beşiktaş'], ['ts', 'eyup', 'Trabzonspor', 'Eyüpspor'],
].map(([home, away, wh, wa], i) => ({ i, home, away, tHome: cue(wh), tAway: cue(wa), big: i >= 5 }));

// sahne başlangıçları ve ortak olay anları (sn). Sahne, kelimeden ~0.1 sn önce açılır.
const T = {
  hook: 0,
  stamp: C.ikinci,                 // "12. HAFTA" damgası vurur
  coinFlip: C.uc,                  // +3 parası kameraya döner
  swing: C.kimin,                  // para iki logo arasında sarkaç
  hookSlam: C.karar,               // "3 PUANI YORUMLAR VERİYOR" çakılır
  kural: C.kural - 0.12,           // sahne 2
  split: C.yorumlarda - 0.1,       // düello ikiye açılır
  coinDrop: C.uc2,                 // +3 kazanan tarafa düşer
  maclar: C.maclar - 0.12,         // sahne 3: kart destesi
  dive: C.geliyor + 0.25,          // kamera ilk karta dalar
  m: MATCHES.map((m) => m.tHome - 0.1), // sahne 4/6: maç kartı açılışları (9 adet)
  isin: C.simdi - 0.1,             // sahne 5: "ortam ısınıyor"
  sen: C.sen - 0.12,               // sahne 7: 3x3 duvar → genel düello
  flood: C.rakibin,                // rakip taraf yorumla dolar
  coinFly: C.ve,                   // +3 rakibe kayar, tabloya uçar
  tablo: C.gider + 0.5,            // sahne 8: puan tablosu (para tabloya konar)
  band: C.dikkat,                  // "DİKKAT" şeridi
  band2: C.sadece,                 // "SADECE BU HAFTA: YORUMLARLA"
  canli: C.diger - 0.1,            // sahne 9: canlı yayın
  canliFlip: C.canli,              // şerit kırmızıya döner, CANLI rozeti
  push: C.gozunun,                 // telefona doğru itiş
  goal: C.oynanacak + 0.15,        // canlı ekranda gol parlaması
  cta: C.kacirmamak - 0.1,         // sahne 10: çağrı
  tap: C.takip + 0.08,             // takip düğmesine dokunuş
  heart: C.begen,                  // kalp patlar
  pill: C.ve2,                     // yorum kutusu açılış yerine döner
  settle: C.cunku,                 // her şey t=0 düzenine oturur
  end: DUR,
};
