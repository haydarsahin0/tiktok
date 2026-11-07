// Manifest Ligi kadrosu: grup üyeleri yarışır, hayranlar hediyeleriyle yükseltir.
// Not: Hayran yapımı bir oyundur; renkler ve sembol harfleri oyun için seçilmiştir.
//  colors: [ana renk, ikinci renk], code: rozetteki harf, short: sütun altındaki ad
//  photo: rozette gösterilecek fotoğraf (manifest/ sayfasına göre yol). Yoksa harf gösterilir.
import { makeRoster } from './roster.js';

export const MEMBERS = [
  { id: 'hilal', name: 'Hilal', short: 'HİLAL', code: 'H', colors: ['#8e2de2', '#e2ccff'], aliases: ['hilal', 'hilo'], photo: 'img/hilal.jpg' },
  { id: 'zoktay', name: 'Zoktay', short: 'ZOKTAY', code: 'Z', colors: ['#1e6bff', '#cfe0ff'], aliases: ['zoktay'], photo: 'img/zoktay.jpg' },
  { id: 'mina', name: 'Mina', short: 'MİNA', code: 'M', colors: ['#e3122d', '#ffc9cf'], aliases: ['mina'], photo: 'img/mina.jpg' },
  { id: 'esin', name: 'Esin', short: 'ESİN', code: 'E', colors: ['#ffc400', '#fff3b8'], aliases: ['esin'], photo: 'img/esin.jpg' },
  { id: 'lidya', name: 'Lidya', short: 'LİDYA', code: 'L', colors: ['#ff3fa4', '#ffd1ea'], aliases: ['lidya'], photo: 'img/lidya.jpg' },
  { id: 'sueda', name: 'Sueda', short: 'SUEDA', code: 'S', colors: ['#16b364', '#c8f7dc'], aliases: ['sueda'], photo: 'img/sueda.jpg' },
];

export const MANIFEST = makeRoster(MEMBERS);

// Demo (sahte izleyiciler) için
export const MANIFEST_DEMO = {
  favorites: MEMBERS.map((m) => m.id),
  names: ['manifestaşkı', 'Hilalfan', 'zoktaystan', 'Mina💜', 'esinin1numarası', 'lidyacım', 'suedafan', 'popkraliçesi',
    'Elif', 'Zeynep_34', 'Defne', 'Ece', 'Selin', 'Ada', 'Buse', 'İrem', 'Nil', 'Melis', 'Asya', 'Duru'],
  chats: ['kraliçe', 'seni seviyoruz', 'harikasın', 'en iyisi o', 'bas bas', 'zirveye', 'efsane', 'çok güzel', '💜💜💜'],
};
