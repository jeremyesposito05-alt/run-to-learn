'use strict';
/* ══════════════════════════════════════════════════════════════════════════
   Profils : plusieurs élèves sur un même appareil (tablette de classe, ordinateur familial).
   Chaque profil a son prénom, son année scolaire, son carnet de mémoire et son carnet d'explorateur.
   Tout reste sur l'appareil : rien n'est envoyé nulle part.
   ══════════════════════════════════════════════════════════════════════════ */
const Profiles = {
  KEY: 'rtl-profils-v1', list: [], activeId: null,
  load() {
    try { const d = JSON.parse(localStorage.getItem(this.KEY)); if (d) { this.list = d.list || []; this.activeId = d.active || null; } } catch (e) { }
    if (!this.active()) this.activeId = null;
    this.apply();
  },
  save() { try { localStorage.setItem(this.KEY, JSON.stringify({ list: this.list, active: this.activeId })); } catch (e) { } },
  active() { return this.list.find(p => p.id === this.activeId) || null; },
  apply() { const id = this.activeId || 'invite'; Memory.use(id); Carnet.use(id); },
  create(name, year) {
    const p = { id: 'p' + Date.now().toString(36), name: (name || 'Joueur').trim().slice(0, 16), year: +year || 4, created: Date.now() };
    this.list.push(p);
    // premier profil créé : il récupère le carnet d'explorateur de la version précédente (blasons, tenues)
    if (this.list.length === 1) { try { const old = localStorage.getItem('rtl-carnet-v1'); if (old && !localStorage.getItem('rtl-carnet-v2:' + p.id)) localStorage.setItem('rtl-carnet-v2:' + p.id, old); } catch (e) { } }
    this.select(p.id); return p;
  },
  select(id) { this.activeId = id; this.save(); this.apply(); },
  setYear(id, year) { const p = this.list.find(x => x.id === id); if (p) { p.year = +year; this.save(); } },
  remove(id) {
    this.list = this.list.filter(p => p.id !== id);
    try { localStorage.removeItem('rtl-memoire-v2:' + id); localStorage.removeItem('rtl-carnet-v2:' + id); } catch (e) { }
    if (this.activeId === id) this.activeId = this.list[0] ? this.list[0].id : null;
    this.save(); this.apply();
  },
  year() { const p = this.active(); return p ? p.year : 4; },
};
