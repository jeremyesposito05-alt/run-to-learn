'use strict';
/* ══════════════════════════════════════════════════════════════════════════
   MODE FRAPPE AU CLAVIER : taper EST l'action (comme dans « The Typing of the Dead »).
   • Chaque obstacle qui approche (trou, mur, pics, ennemi) porte un mot.
     Le taper « arme » l'action : CubeBoy saute tout seul au bon moment, ou pulvérise l'ennemi.
   • Un bonus attrapé ouvre un défi : recopier une phrase (précision et vitesse).
   • Leçons progressives, pour le clavier suisse (QWERTZ) ou français (AZERTY).
   Nécessite un vrai clavier (ordinateur, tablette avec clavier).
   ══════════════════════════════════════════════════════════════════════════ */
const LAYOUTS = {
  ch: { name: 'Clavier suisse (QWERTZ)', home: 'asdfghjklé', top: 'qwertzuiop', bottom: 'yxcvbnm' },
  fr: { name: 'Clavier français (AZERTY)', home: 'qsdfghjklm', top: 'azertyuiop', bottom: 'wxcvbn' },
};
const WORDS = (
  'le la les un une des et est il elle on nous vous ils sa son ses mon ma mes ton ta tes du de au aux par pour sur sous dans avec sans mais ou donc car ni que qui oui non ' +
  'bien bon beau belle petit grand gros rouge bleu vert jaune noir blanc chat chien lapin cheval vache poule loup ours lion tigre souris oiseau poisson arbre fleur herbe ' +
  'feuille soleil lune ciel nuage pluie neige vent mer lac mont montagne ski luge sapin bois roche pierre sable ile port bateau train avion bus velo route rue ville maison ' +
  'porte table chaise lit livre cahier stylo crayon gomme sac classe jeu jouer courir sauter manger boire dormir lire dire faire aller venir voir parler chanter danser ' +
  'nager rire aimer donner prendre mettre ami amie papa maman bebe famille pain lait eau jus pomme poire banane orange tarte gateau sucre sel soupe riz pates fromage ' +
  'tomate carotte salade matin midi soir nuit jour mois an hiver automne printemps lundi mardi jeudi samedi dimanche deux trois quatre cinq six sept huit neuf dix cent ' +
  'mille main pied bras dos nez bouche dent cou robe pull bonnet gant botte veste jupe fils fille jaja kaki gaga haha dada lala sale salle halle fade gala sage aide ' +
  'ferme terre pere mere frere tour rire pour tout sort trop port prix vide dire rose rare sur purse type quart poste perte poser tirer ruse jeter tete'
).split(' ');
const WORDS_ACC = ('école été forêt fête père mère frère élève télé café bébé fée clé thé pré dé épée étoile rivière lumière fenêtre tête hôtel château ' +
  'bientôt déjà là voilà où côté ça garçon leçon français maïs élan éclair génie légume numéro écureuil chèvre hérisson télésiège').split(' ');
const NAMES = 'Lana Logan Villars Genève Lausanne Berne Zurich Suisse Europe Paris Léa Noé Emma Hugo Chloé Jules Alpes Rhône Léman Soleil'.split(' ');
const PHRASES_SIMPLE = ['le chat dort', 'un ami joue au ballon', 'la neige tombe sur le sapin', 'le train part ce matin', 'mon chien court vite',
  'il fait beau ce soir', 'nous jouons dans la cour', 'la lune brille la nuit', 'un oiseau chante', 'je lis un livre', 'le lapin mange une carotte',
  'papa fait une tarte', 'la vache est dans le champ', 'le bus part vers midi', 'elle aime le jus de pomme'];
const PHRASES_FULL = ['Le soleil brille sur les Alpes.', 'Léa mange une pomme.', 'Il neige à Villars !', 'Où est mon cahier ?', 'Le garçon a déjà fini ses leçons.',
  'Noé nage dans le lac Léman.', "Quelle belle journée d'été !", 'La forêt est pleine de mystères.', 'Le chamois grimpe sur la roche.', "J'aime le chocolat suisse.",
  'Demain, nous irons à Genève.', 'Ça sent bon le pain chaud.', 'Le télésiège monte vers le sommet.', 'Chloé et Hugo construisent un bonhomme de neige.'];

const pickLen = (r, list, a, b) => { const l = list.filter(w => w.length >= a && w.length <= b); return U.pick(r, l.length ? l : list); };
// mots faits seulement des touches autorisées (vrais mots si possible, sinon « pseudo-mots » d'entraînement)
function wordFrom(r, keys, fresh, maxLen = 5) {
  const real = WORDS.filter(w => w.length >= 2 && w.length <= maxLen && [...w].every(c => keys.includes(c)));
  if (real.length >= 6 && r() < .6) return U.pick(r, real);
  const n = U.int(r, 2, Math.min(4, maxLen)), src = fresh && r() < .6 ? fresh : keys;
  let w = ''; for (let i = 0; i < n; i++) w += src[U.int(r, 0, src.length - 1)]; return w;
}
const TYPING_LESSONS = [
  { id: 'k.index', name: 'Les index : f, j, g, h', tier: 'Débuter', goal: [8, 14], keys: L => 'fjgh', word: (r, L) => wordFrom(r, 'fjgh', 'fj', 3) },
  { id: 'k.home', name: 'La rangée de repos', tier: 'Débuter', goal: [10, 16], keys: L => LAYOUTS[L].home, word: (r, L) => wordFrom(r, LAYOUTS[L].home, '', 4) },
  { id: 'k.top', name: 'La rangée du haut', tier: 'Débuter', goal: [10, 18], keys: L => LAYOUTS[L].home + LAYOUTS[L].top, word: (r, L) => wordFrom(r, LAYOUTS[L].home + LAYOUTS[L].top, LAYOUTS[L].top, 5) },
  { id: 'k.bottom', name: 'La rangée du bas', tier: 'Débuter', goal: [12, 20], keys: L => LAYOUTS[L].home + LAYOUTS[L].top + LAYOUTS[L].bottom, word: (r, L) => wordFrom(r, LAYOUTS[L].home + LAYOUTS[L].top + LAYOUTS[L].bottom, LAYOUTS[L].bottom, 5) },
  { id: 'k.mots', name: 'Mots courants', tier: 'Progresser', goal: [15, 25], word: r => pickLen(r, WORDS, 2, 6) },
  { id: 'k.accents', name: 'Accents et majuscules', tier: 'Progresser', goal: [14, 24], exact: true, word: r => (r() < .35 ? U.pick(r, NAMES) : U.pick(r, WORDS_ACC)) },
  { id: 'k.phrases', name: 'Mots longs et phrases', tier: 'Maîtriser', goal: [18, 30], exact: true, word: r => (r() < .3 ? U.pick(r, WORDS_ACC) : pickLen(r, WORDS, 5, 9)) },
  { id: 'k.vitesse', name: 'Défi vitesse', tier: 'Maîtriser', goal: [25, 40], exact: true, fast: true, word: r => (r() < .3 ? U.pick(r, NAMES.concat(WORDS_ACC)) : pickLen(r, WORDS, 6, 12)) },
];
const lessonById = id => TYPING_LESSONS.find(l => l.id === id) || TYPING_LESSONS[0];

/* ─── Progrès de frappe, par profil (meilleure vitesse et précision par leçon) ─── */
const TypingProgress = {
  key: () => 'rtl-frappe-v1:' + (Profiles.activeId || 'invite'),
  load() { try { return JSON.parse(localStorage.getItem(this.key())) || {}; } catch (e) { return {}; } },
  record(id, wpm, acc) {
    if (!Game.persist) return { best: false };
    const d = this.load(), e = d[id] || { wpm: 0, acc: 0, runs: 0 }, best = wpm > e.wpm;
    e.runs++; if (acc >= .85) e.wpm = Math.max(e.wpm, wpm); e.acc = Math.max(e.acc, acc);
    d[id] = e; try { localStorage.setItem(this.key(), JSON.stringify(d)); } catch (err) { } return { best: best && acc >= .85, prev: d[id] };
  },
  stars(id) { const e = this.load()[id], L = lessonById(id); if (!e) return 0; return e.acc >= .9 ? (e.wpm >= L.goal[1] ? 3 : e.wpm >= L.goal[0] ? 2 : 1) : 0; },
  get(id) { return this.load()[id] || null; },
};

/* ─── Le contrôleur de la partie en mode frappe ─── */
const Typing = {
  on: false, lesson: null, layout: 'ch', r: null, target: null, lastX: -1e9, keys: 0, errors: 0, chars: 0, frames: 0, flash: 0,
  start(o) {
    Object.assign(this, { on: true, lesson: lessonById(o.lesson), layout: o.layout || 'ch', r: U.rng((Date.now() & 0xffff) | 1), target: null, lastX: -1e9, keys: 0, errors: 0, chars: 0, frames: 0, flash: 0 });
    return this;
  },
  stop() { this.on = false; this.target = null; },
  same(a, b) { return this.lesson.exact ? a === b : a.toLowerCase() === b.toLowerCase(); },
  newWord() { return this.lesson.word(this.r, this.layout); },
  wpm() { return this.frames > 60 ? Math.round(this.chars / 5 / (this.frames / 3600)) : 0; },
  acc() { return this.keys ? (this.keys - this.errors) / this.keys : 1; },
  speedFactor() { return ({ n1: .55, n2: .7, n3: .85 }[Game.opts.level] || .7) * (this.lesson.fast ? 1.15 : 1); },
  // prochain obstacle devant le joueur : trou, mur, pics ou ennemi
  scan() {
    const p = Player, fy = p.y + p.h, x0 = p.x + p.w + 24, x1 = p.x + VIEW_W - 130;
    let best = null;
    for (const e of Game.enemies) if (!e.dead && !(e.ch === 'v' && e.state === 'idle') && e.x > x0 - 10 && e.x < x1 && e.x > this.lastX + 16 && Math.abs(e.y - p.y) < 70)
      if (!best || e.x < best.x) best = { kind: 'enemy', x: e.x, e };
    for (let x = Math.max(x0, this.lastX + 40); x < (best ? best.x : x1); x += 4) {
      const cx = Math.floor(x / TILE);
      let wall = false; for (let r = Math.floor(p.y / TILE); r <= Math.floor((fy - 1) / TILE); r++) if (World.solid(cx, r)) wall = true;
      const pit = p.on && !groundAt(x, fy), spike = World.tile(cx, Math.floor((fy - 2) / TILE)) === '^';
      if (wall || pit || spike) { best = { kind: wall ? 'wall' : pit ? 'pit' : 'spike', x }; break; }
    }
    return best;
  },
  // appelé à chaque pas de simulation, avant le joueur
  step() {
    this.frames++;
    Input.presses = 0;                                             // en mode frappe, on ne saute pas soi-même
    const t = this.target, p = Player;
    if (t && (t.kind === 'enemy' ? (t.e.dead || t.e.x + t.e.w < p.x) : p.x > t.x + 36 && p.on)) { this.lastX = t.x; this.target = null; }
    if (!this.target) { const s = this.scan(); if (s) { s.word = this.newWord(); s.typed = 0; s.armed = false; this.target = s; } }
    const cur = this.target;
    if (cur && cur.armed && cur.kind !== 'enemy') Autopilot.step();  // le mot est tapé : CubeBoy saute tout seul, au bon moment
    else { Input.keyHeld = false; Autopilot.holdT = 0; }
    if (this.flash > 0) this.flash--;
  },
  // une touche tapée pendant la course ou pendant un défi
  onChar(ch) {
    if (ch === 'Backspace' || ch === 'Dead' || Game.state !== 'play') return;
    const f = Game.focus;
    if (f && f.kind === 'type') { if (f.phase === 'choose' && f.lock === 0) this.challengeChar(f, ch); return; }
    const t = this.target; if (!t || t.armed || Game.intro > 0) return;
    this.keys++;
    if (this.same(ch, t.word[t.typed])) {
      t.typed++; this.chars++; Sound.tone(700 + t.typed * 40, .03, 'square', .025);
      if (t.typed >= t.word.length) this.complete(t);
    } else { this.errors++; this.flash = 12; Sound.tone(140, .08, 'square', .04); }
  },
  complete(t) {
    t.armed = true; FX.burst(Player.cx, Player.y, 8, '#F3BE31', 1.4, 0, 14);
    Game.energy = Math.min(100, Game.energy + 1.5); Game.score += 10 * t.word.length;
    if (t.kind === 'enemy') { Game.killEnemy(t.e, 'SMASH'); FX.shake(3, 8); }
    else Sound.tone(1047, .08, 'triangle', .05);
  },
  /* ─── Défi de phrase (bonus attrapé) ─── */
  phrase() {
    const i = TYPING_LESSONS.indexOf(this.lesson);
    if (i <= 3) { let s = ''; for (let k = 0; k < 4; k++) s += (k ? ' ' : '') + this.newWord(); return s; }
    return i === 4 ? U.pick(this.r, PHRASES_SIMPLE) : U.pick(this.r, PHRASES_FULL);
  },
  challenge() {
    const text = this.phrase(), L = Game.level, per = { n1: 0, n2: .9, n3: .55 }[Game.opts.level] || 0;
    const time = per ? Math.round((3 + text.length * per) * 60) : 0;
    return { kind: 'type', text, typed: 0, errs: 0, t0: 0, it: { q: text, a: text, why: '' }, labels: [], correct: 0, phase: 'in', t: 0, sel: -1, chosen: -1, lock: FOCUS.in + 10, time, timeMax: time };
  },
  challengeChar(f, ch) {
    if (!f.t0) f.t0 = f.t || 1;
    this.keys++;
    if (this.same(ch, f.text[f.typed])) { f.typed++; this.chars++; Sound.tone(650 + (f.typed % 8) * 30, .025, 'square', .02); if (f.typed >= f.text.length) this.challengeEnd(f, true); }
    else { f.errs++; this.errors++; this.flash = 12; Sound.tone(140, .08, 'square', .04); }
  },
  challengeEnd(f, done) {
    f.acc = f.typed ? f.typed / (f.typed + f.errs) : 0;
    f.cpm = f.t0 ? Math.round(f.typed / Math.max(1, (f.t - f.t0) / 3600) / 5) : 0;   // mots par minute sur ce défi
    Game.choose(done && f.acc >= .8 ? 0 : 1);                                         // réussi si terminé avec au moins 80 % de précision
  },
  // pilote de test : tape la bonne lettre (ou se trompe parfois)
  botType(errRate = 0) {
    const f = Game.focus;
    const want = f && f.kind === 'type' ? (f.phase === 'choose' ? f.text[f.typed] : null) : (this.target && !this.target.armed ? this.target.word[this.target.typed] : null);
    if (want) this.onChar(Math.random() < errRate ? '#' : want);
  },
};
