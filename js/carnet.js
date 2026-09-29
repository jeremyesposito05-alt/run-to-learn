'use strict';
/* ══════════════════════════════════════════════════════════════════════════
   Carnet d'explorateur : ce que le joueur garde d'une partie à l'autre.
   • biomes découverts, blasons trouvés (3 cachés par biome, comme les lettres K-O-N-G de DKC) ;
   • tenues de CubeBoy, débloquées par l'exploration ET par l'apprentissage ;
   • record et biome le plus lointain.
   Tout est gagné en jouant et en apprenant : rien à acheter, rien qui se perd
   si l'on ne revient pas (pas de « série quotidienne » punitive : Zagal et al. 2013, motifs sombres).
   ══════════════════════════════════════════════════════════════════════════ */
const SKINS = [
  { id: 'base', name: 'Tenue Beau Soleil', body: '#1f5fbf', trim: '#6fb6ff', hair: '#6b3a1a', need: null, hint: 'Tenue de départ' },
  { id: 'neige', name: 'Tenue des neiges', body: '#e8eef8', trim: '#4fa8ff', hair: '#6b3a1a', need: 'montagne', hint: 'Trouve les 3 blasons de la Montagne' },
  { id: 'bois', name: 'Tenue des bois', body: '#3e7f2a', trim: '#9ad06a', hair: '#4a2a12', need: 'foret', hint: 'Trouve les 3 blasons de la Forêt' },
  { id: 'or', name: 'Tenue du savant', body: '#d9a21e', trim: '#fff4c8', hair: '#6b3a1a', need: 'owned:40', hint: 'Retiens 40 questions pour de bon (carnet de mémoire)' },
];

const Carnet = {
  KEY: "rtl-carnet-v2:invite",
  data: { biomes: {}, skin: "base", maxStage: 0, runs: 0 },
  use(profileId) {   // un carnet par profil
    this.KEY = "rtl-carnet-v2:" + profileId; this.data = { biomes: {}, skin: "base", maxStage: 0, runs: 0 };
    try { const d = JSON.parse(localStorage.getItem(this.KEY)); if (d && d.biomes) this.data = Object.assign(this.data, d); } catch (e) { }
  },
  save() { if (!Game.persist) return; try { localStorage.setItem(this.KEY, JSON.stringify(this.data)); } catch (e) { } },
  biome(id) { return this.data.biomes[id] || (this.data.biomes[id] = { seen: false, blasons: [false, false, false] }); },
  seeBiome(id) { if (!Game.persist) return false; const b = this.biome(id), first = !b.seen; b.seen = true; this.save(); return first; },
  has(id, i) { return !!(this.data.biomes[id] && this.data.biomes[id].blasons[i]); },
  count(id) { return this.data.biomes[id] ? this.data.biomes[id].blasons.filter(Boolean).length : 0; },
  found(id, i) {   // → { isNew, all, skin }
    if (!Game.persist) return { isNew: false, all: false };
    const b = this.biome(id), isNew = !b.blasons[i]; b.blasons[i] = true; this.save();
    const all = isNew && b.blasons.every(Boolean), skin = all ? SKINS.find(s => s.need === id) : null;
    return { isNew, all, skin };
  },
  unlocked(s) {
    if (!s.need) return true;
    if (s.need.startsWith('owned:')) return Memory.totalOwned() >= +s.need.slice(6);
    return this.count(s.need) === 3;
  },
  skin() { const s = SKINS.find(k => k.id === this.data.skin); return s && this.unlocked(s) ? s : SKINS[0]; },
  endRun(stage) { if (!Game.persist) return; this.data.runs++; this.data.maxStage = Math.max(this.data.maxStage, stage); this.save(); },
};
