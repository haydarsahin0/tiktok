// Manifest Ligi kadrosu: grup üyeleri yarışır, hayranlar hediyeleriyle yükseltir.
// Not: Hayran yapımı bir oyundur; renkler ve sembol harfleri oyun için seçilmiştir.
//  colors: [ana renk, ikinci renk], code: rozetteki harf, short: sütun altındaki ad
import { makeRoster } from './roster.js';

export const MEMBERS = [
  { id: 'hilal', name: 'Hilal', short: 'HİLAL', code: 'H', colors: ['#ff3fa4', '#ffd1ea'], aliases: ['hilal', 'hilo'] },
  { id: 'zoktay', name: 'Zoktay', short: 'ZOKTAY', code: 'Z', colors: ['#7b2ff7', '#d9c4ff'], aliases: ['zoktay'] },
  { id: 'mina', name: 'Mina', short: 'MİNA', code: 'M', colors: ['#00b8d9', '#c9f6ff'], aliases: ['mina'] },
  { id: 'esin', name: 'Esin', short: 'ESİN', code: 'E', colors: ['#ff8a00', '#ffe2b8'], aliases: ['esin'] },
  { id: 'lidya', name: 'Lidya', short: 'LİDYA', code: 'L', colors: ['#e0115f', '#ffc2d8'], aliases: ['lidya'] },
  { id: 'sueda', name: 'Sueda', short: 'SUEDA', code: 'S', colors: ['#16b364', '#c8f7dc'], aliases: ['sueda'] },
];

export const MANIFEST = makeRoster(MEMBERS);

// Demo (sahte izleyiciler) için
export const MANIFEST_DEMO = {
  favorites: MEMBERS.map((m) => m.id),
  names: ['manifestaşkı', 'Hilalfan', 'zoktaystan', 'Mina💜', 'esinin1numarası', 'lidyacım', 'suedafan', 'popkraliçesi',
    'Elif', 'Zeynep_34', 'Defne', 'Ece', 'Selin', 'Ada', 'Buse', 'İrem', 'Nil', 'Melis', 'Asya', 'Duru'],
  chats: ['kraliçe', 'seni seviyoruz', 'harikasın', 'en iyisi o', 'bas bas', 'zirveye', 'efsane', 'çok güzel', '💜💜💜'],
};
