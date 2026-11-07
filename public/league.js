// Hangi lig oynanıyor? Sayfa window.LIG ile ya da ?lig=... ile söyler. Varsayılan: futbol.
import { FOOTBALL } from './core/teams.js';
import { LIG_ID } from './config.js';

export async function loadLeague() {
  if (LIG_ID === 'manifest') {
    const m = await import('./core/manifest.js');
    return { id: 'manifest', roster: m.MANIFEST, demo: m.MANIFEST_DEMO };
  }
  return { id: 'taraftar', roster: FOOTBALL, demo: {} };
}
