// Kadro: yarışanların listesi + yorumdan isim tanıma. Futbol ligi (teams.js) ve
// Manifest ligi (manifest.js) aynı motoru kullanır.

// Türkçe karakterleri sadeleştirip küçük harfe çevirir: "Fenerbahçe!!" -> "fenerbahce"
export function normalize(text) {
  return String(text || '')
    .replace(/İ/g, 'i')
    .replace(/I/g, 'ı')
    .toLowerCase()
    .replace(/ı/g, 'i')
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/â/g, 'a')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/**
 * @param {Array<{id:string,name:string,aliases:string[],plate?:string}>} teams
 * @returns {{ teams, byId, findTeam }}
 */
export function makeRoster(teams) {
  const byId = Object.fromEntries(teams.map((t) => [t.id, t]));
  // Uzun adlar önce denenir ("adana demirspor" kısa eşleşmelerden önce gelsin diye)
  const aliasList = [];
  const plates = new Map();
  for (const team of teams) {
    for (const alias of new Set([...(team.aliases || []), team.name, team.id])) {
      const a = normalize(alias);
      if (a) aliasList.push({ alias: a, id: team.id });
    }
    if (team.plate) plates.set(team.plate, team.id);
  }
  aliasList.sort((x, y) => y.alias.length - x.alias.length);

  /**
   * Yorumdaki yarışanı bulur.
   * @returns {{ id: string, exact: boolean } | null}
   *   exact = mesajın tamamı ad/plaka mı (taraf değiştirmek için gerekli)
   */
  function findTeam(text) {
    const norm = normalize(text);
    if (!norm) return null;

    const plate = norm.replace(/\s+/g, '');
    if (/^\d{1,2}$/.test(plate)) {
      const id = plates.get(plate.padStart(2, '0'));
      return id ? { id, exact: true } : null;
    }

    const padded = ` ${norm} `;
    const squashed = norm.replace(/\s+/g, '');
    for (const { alias, id } of aliasList) {
      if (padded.includes(` ${alias} `)) return { id, exact: norm === alias };
    }
    // "Trabzonspor61" gibi bitişik yazımlar
    for (const { alias, id } of aliasList) {
      if (alias.length >= 5 && !alias.includes(' ') && squashed.startsWith(alias) && squashed.length - alias.length <= 4) {
        return { id, exact: true };
      }
    }
    // "hilaaal", "fenerrrr" gibi harf uzatmaları: 3+ tekrar eden harfi teke indirip yeniden dene
    const collapsed = norm.replace(/([a-z])\1{2,}/g, '$1');
    if (collapsed !== norm) return findTeam(collapsed);
    return null;
  }

  return { teams, byId, findTeam };
}
