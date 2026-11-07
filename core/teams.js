// Takım listesi. Yeni takım eklemek ya da renk düzeltmek için bu dosyayı düzenle.
//  id      : benzersiz kısa kimlik (değiştirme, kayıtlı puanlar buna bağlı)
//  name    : ekranda görünen ad
//  short   : sütunun altında görünen kısa ad (en fazla ~9 harf)
//  code    : rozetin içindeki kısaltma (2-4 harf)
//  colors  : [ana renk, ikinci renk]
//  aliases : yorumda yazılınca bu takıma katılınır (Türkçe karakter fark etmez)
//  plate   : sadece plaka yazılınca katılım (ör. "61"). Aynı şehirde birden fazla
//            büyük takım varsa (İstanbul, İzmir, Ankara, Adana) plaka verilmedi.

export const TEAMS = [
  // --- Büyükler ---
  { id: 'gs', name: 'Galatasaray', short: 'G.SARAY', code: 'GS', colors: ['#A90432', '#FDB912'], aliases: ['galatasaray', 'gs', 'cimbom', 'cim bom', 'aslan', 'g saray', 'gala'] },
  { id: 'fb', name: 'Fenerbahçe', short: 'F.BAHÇE', code: 'FB', colors: ['#002D72', '#FFED00'], aliases: ['fenerbahce', 'fb', 'fener', 'kanarya', 'f bahce'] },
  { id: 'bjk', name: 'Beşiktaş', short: 'BEŞİKTAŞ', code: 'BJK', colors: ['#111111', '#FFFFFF'], aliases: ['besiktas', 'bjk', 'kartal', 'kara kartal', 'carsi'] },
  { id: 'ts', name: 'Trabzonspor', short: 'TRABZON', code: 'TS', colors: ['#7A1E48', '#5DADE2'], aliases: ['trabzonspor', 'trabzon', 'ts', 'bordo mavi', 'firtina'], plate: '61' },
  { id: 'ibfk', name: 'Başakşehir', short: 'BAŞAKŞEHİR', code: 'İBFK', colors: ['#F26522', '#1B2A4A'], aliases: ['basaksehir', 'ibfk', 'ibb'] },

  // --- Anadolu ve diğer kulüpler ---
  { id: 'bursa', name: 'Bursaspor', short: 'BURSA', code: 'BUR', colors: ['#00843D', '#FFFFFF'], aliases: ['bursaspor', 'bursa', 'timsah', 'yesil timsah'], plate: '16' },
  { id: 'goztepe', name: 'Göztepe', short: 'GÖZTEPE', code: 'GÖZ', colors: ['#E30613', '#FFD100'], aliases: ['goztepe', 'goz goz'] },
  { id: 'samsun', name: 'Samsunspor', short: 'SAMSUN', code: 'SAM', colors: ['#E30A17', '#FFFFFF'], aliases: ['samsunspor', 'samsun'], plate: '55' },
  { id: 'sivas', name: 'Sivasspor', short: 'SİVAS', code: 'SVS', colors: ['#D7182A', '#FFFFFF'], aliases: ['sivasspor', 'sivas', 'yigido'], plate: '58' },
  { id: 'kayseri', name: 'Kayserispor', short: 'KAYSERİ', code: 'KAY', colors: ['#C8102E', '#FFD200'], aliases: ['kayserispor', 'kayseri'], plate: '38' },
  { id: 'konya', name: 'Konyaspor', short: 'KONYA', code: 'KON', colors: ['#00843D', '#FFFFFF'], aliases: ['konyaspor', 'konya', 'anadolu kartali'], plate: '42' },
  { id: 'antalya', name: 'Antalyaspor', short: 'ANTALYA', code: 'ANT', colors: ['#E2001A', '#FFFFFF'], aliases: ['antalyaspor', 'antalya', 'akrep'], plate: '07' },
  { id: 'alanya', name: 'Alanyaspor', short: 'ALANYA', code: 'ALN', colors: ['#F7941D', '#00A651'], aliases: ['alanyaspor', 'alanya'] },
  { id: 'kasimpasa', name: 'Kasımpaşa', short: 'KASIMPAŞA', code: 'KSP', colors: ['#0B2D5B', '#FFFFFF'], aliases: ['kasimpasa'] },
  { id: 'gfk', name: 'Gaziantep FK', short: 'G.ANTEP', code: 'GFK', colors: ['#D71920', '#111111'], aliases: ['gaziantep', 'gaziantep fk', 'antep', 'gfk'], plate: '27' },
  { id: 'hatay', name: 'Hatayspor', short: 'HATAY', code: 'HTY', colors: ['#7B1C2E', '#FFFFFF'], aliases: ['hatayspor', 'hatay'], plate: '31' },
  { id: 'rize', name: 'Çaykur Rizespor', short: 'RİZE', code: 'RİZ', colors: ['#009A44', '#1F6BB4'], aliases: ['rizespor', 'rize', 'caykur', 'caykur rizespor'], plate: '53' },
  { id: 'agu', name: 'Ankaragücü', short: 'ANKARAGÜCÜ', code: 'AGÜ', colors: ['#0A2A66', '#FFD100'], aliases: ['ankaragucu', 'mke', 'agu'] },
  { id: 'gb', name: 'Gençlerbirliği', short: 'GENÇLER', code: 'GB', colors: ['#D71920', '#111111'], aliases: ['genclerbirligi', 'gencler', 'gb'] },
  { id: 'eyup', name: 'Eyüpspor', short: 'EYÜP', code: 'EYP', colors: ['#5B2C83', '#FFD100'], aliases: ['eyupspor', 'eyup'] },
  { id: 'bodrum', name: 'Bodrum FK', short: 'BODRUM', code: 'BOD', colors: ['#00843D', '#FFFFFF'], aliases: ['bodrum', 'bodrumspor', 'bodrum fk'], plate: '48' },
  { id: 'kocaeli', name: 'Kocaelispor', short: 'KOCAELİ', code: 'KOC', colors: ['#00843D', '#111111'], aliases: ['kocaelispor', 'kocaeli', 'izmit'], plate: '41' },
  { id: 'sakarya', name: 'Sakaryaspor', short: 'SAKARYA', code: 'SAK', colors: ['#009A44', '#111111'], aliases: ['sakaryaspor', 'sakarya'], plate: '54' },
  { id: 'eskisehir', name: 'Eskişehirspor', short: 'ESKİŞEHİR', code: 'ES', colors: ['#D71920', '#111111'], aliases: ['eskisehirspor', 'eskisehir', 'es es', 'eses'], plate: '26' },
  { id: 'altay', name: 'Altay', short: 'ALTAY', code: 'ALT', colors: ['#111111', '#FFFFFF'], aliases: ['altay'] },
  { id: 'ksk', name: 'Karşıyaka', short: 'KARŞIYAKA', code: 'KSK', colors: ['#00843D', '#D71920'], aliases: ['karsiyaka', 'ksk', 'kaf kaf'] },
  { id: 'denizli', name: 'Denizlispor', short: 'DENİZLİ', code: 'DEN', colors: ['#00843D', '#111111'], aliases: ['denizlispor', 'denizli', 'horoz'], plate: '20' },
  { id: 'erzurum', name: 'Erzurumspor', short: 'ERZURUM', code: 'ERZ', colors: ['#0072BC', '#FFFFFF'], aliases: ['erzurumspor', 'erzurum', 'dadas'], plate: '25' },
  { id: 'ads', name: 'Adana Demirspor', short: 'A.DEMİR', code: 'ADS', colors: ['#0072BC', '#0A2A66'], aliases: ['adana demirspor', 'adana demir', 'demirspor', 'ads'] },
  { id: 'adanaspor', name: 'Adanaspor', short: 'ADANASPOR', code: 'ADN', colors: ['#F58220', '#FFFFFF'], aliases: ['adanaspor'] },
  { id: 'mersin', name: 'Mersin İdman Yurdu', short: 'MERSİN', code: 'MİY', colors: ['#D71920', '#0A2A66'], aliases: ['mersin', 'mersin idman yurdu', 'miy'], plate: '33' },
  { id: 'bolu', name: 'Boluspor', short: 'BOLU', code: 'BOL', colors: ['#D71920', '#FFFFFF'], aliases: ['boluspor', 'bolu'], plate: '14' },
  { id: 'pendik', name: 'Pendikspor', short: 'PENDİK', code: 'PEN', colors: ['#D71920', '#FFFFFF'], aliases: ['pendikspor', 'pendik'] },
  { id: 'amed', name: 'Amedspor', short: 'AMED', code: 'AMD', colors: ['#D71920', '#00843D'], aliases: ['amedspor', 'amed', 'diyarbakir'], plate: '21' },
  { id: 'corum', name: 'Çorum FK', short: 'ÇORUM', code: 'ÇOR', colors: ['#D71920', '#111111'], aliases: ['corum', 'corum fk', 'corumspor'], plate: '19' },
  { id: 'giresun', name: 'Giresunspor', short: 'GİRESUN', code: 'GİR', colors: ['#00843D', '#FFFFFF'], aliases: ['giresunspor', 'giresun', 'cotanak'], plate: '28' },
  { id: 'ordu', name: 'Orduspor', short: 'ORDU', code: 'ORD', colors: ['#5B2C83', '#FFFFFF'], aliases: ['orduspor', 'ordu'], plate: '52' },
  { id: 'elazig', name: 'Elazığspor', short: 'ELAZIĞ', code: 'ELZ', colors: ['#7B1C2E', '#FFFFFF'], aliases: ['elazigspor', 'elazig'], plate: '23' },
  { id: 'urfa', name: 'Şanlıurfaspor', short: 'URFA', code: 'URF', colors: ['#FFD100', '#00843D'], aliases: ['sanliurfaspor', 'sanliurfa', 'urfa', 'urfaspor'], plate: '63' },
  { id: 'balikesir', name: 'Balıkesirspor', short: 'BALIKESİR', code: 'BAL', colors: ['#D71920', '#FFFFFF'], aliases: ['balikesirspor', 'balikesir'], plate: '10' },
  { id: 'zonguldak', name: 'Zonguldak Kömürspor', short: 'ZONGULDAK', code: 'ZON', colors: ['#D71920', '#0A2A66'], aliases: ['zonguldak', 'komurspor', 'zonguldak komurspor'], plate: '67' },
  { id: 'karabuk', name: 'Karabükspor', short: 'KARABÜK', code: 'KRB', colors: ['#D71920', '#0072BC'], aliases: ['karabukspor', 'karabuk'], plate: '78' },
  { id: 'fkg', name: 'Fatih Karagümrük', short: 'K.GÜMRÜK', code: 'FKG', colors: ['#D71920', '#111111'], aliases: ['karagumruk', 'fatih karagumruk', 'fkg'] },
  { id: 'istanbulspor', name: 'İstanbulspor', short: 'İST.SPOR', code: 'İST', colors: ['#FFD100', '#111111'], aliases: ['istanbulspor'] },
  { id: 'umraniye', name: 'Ümraniyespor', short: 'ÜMRANİYE', code: 'ÜMR', colors: ['#D71920', '#FFFFFF'], aliases: ['umraniyespor', 'umraniye'] },
  { id: 'malatya', name: 'Yeni Malatyaspor', short: 'MALATYA', code: 'YMS', colors: ['#FFD100', '#111111'], aliases: ['malatyaspor', 'yeni malatyaspor', 'malatya', 'yms'], plate: '44' },
  { id: 'kecioren', name: 'Keçiörengücü', short: 'KEÇİÖREN', code: 'KEÇ', colors: ['#5B2C83', '#FFFFFF'], aliases: ['keciorengucu', 'kecioren'] },
  { id: 'sariyer', name: 'Sarıyer', short: 'SARIYER', code: 'SAR', colors: ['#0A2A66', '#FFFFFF'], aliases: ['sariyer', 'sariyerspor'] },
  { id: 'buca', name: 'Bucaspor', short: 'BUCA', code: 'BUC', colors: ['#FFD100', '#0A2A66'], aliases: ['bucaspor', 'buca'] },
  { id: 'dardanel', name: 'Dardanelspor', short: 'ÇANAKKALE', code: 'DAR', colors: ['#FFD100', '#0A2A66'], aliases: ['dardanelspor', 'dardanel', 'canakkale'], plate: '17' },
];

// Ad tanıma (yorumdaki takımı bulma) ortak kadro modülünde: roster.js
import { makeRoster, normalize } from './roster.js';

export const FOOTBALL = makeRoster(TEAMS);
export const TEAM_BY_ID = FOOTBALL.byId;
export const findTeam = FOOTBALL.findTeam;
export { normalize };
