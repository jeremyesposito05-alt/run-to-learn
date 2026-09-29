'use strict';
/* ══════════════════════════════════════════════════════════════════════════
   Contenu pédagogique. Chaque question = { q: énoncé, a: bonne réponse, bad: [≥2 mauvaises] }.
   Les portes du jeu ont 3 couloirs : 1 bonne réponse + 2 mauvaises.
   Les réponses restent courtes (elles s'affichent sur des panneaux).
   ══════════════════════════════════════════════════════════════════════════ */
const Quiz = (() => {
  const SUBJECTS = {
    math: { label: 'Mathématiques', levels: ['Additions jusqu’à 20', 'Additions jusqu’à 100', 'Soustractions', 'Tables × 2 à × 5', 'Tables × 6 à × 10', 'Tables mélangées', 'Divisions', 'Géométrie'] },
    fr:   { label: 'Français', levels: ['Présent (verbes en -er)', 'Présent : être, avoir, aller, faire', 'Imparfait', 'Futur simple', 'Passé composé', 'Vocabulaire', 'Grammaire'] },
    en:   { label: 'Anglais', levels: ['Vocabulaire 1', 'Vocabulaire 2', 'Phrases', 'Grammaire'] },
    de:   { label: 'Allemand', levels: ['Noms et articles', 'Couleurs et adjectifs', 'Phrases', 'Grammaire'] },
  };

  /* ─── Mathématiques ─── */
  function numBad(r, ans, extra = []) {
    const c = new Set(extra.filter(v => v > 0 && v !== ans));
    [1, -1, 2, -2, 10, -10].forEach(d => { if (ans + d > 0) c.add(ans + d); });
    return U.shuffle(r, [...c]).slice(0, 2).map(String);
  }
  function mathQ(r, lvl) {
    let a, b, q, ans, extra = [];
    switch (lvl) {
      case 1: a = U.int(r, 1, 12); b = U.int(r, 1, 20 - a); ans = a + b; q = `${a} + ${b} = ?`; break;
      case 2: a = U.int(r, 11, 69); b = U.int(r, 5, 99 - a); ans = a + b; q = `${a} + ${b} = ?`; extra = [ans + 10, ans - 10]; break;
      case 3: a = U.int(r, 20, 99); b = U.int(r, 3, a - 5); ans = a - b; q = `${a} − ${b} = ?`; extra = [a + b]; break;
      case 4: a = U.int(r, 2, 5); b = U.int(r, 1, 10); ans = a * b; q = `${a} × ${b} = ?`; extra = [a * (b + 1), a * (b - 1), a + b]; break;
      case 5: a = U.int(r, 6, 10); b = U.int(r, 2, 10); ans = a * b; q = `${a} × ${b} = ?`; extra = [a * (b + 1), a * (b - 1), (a + 1) * b]; break;
      case 6: a = U.int(r, 2, 12); b = U.int(r, 2, 12); ans = a * b; q = `${a} × ${b} = ?`; extra = [a * (b + 1), a * (b - 1), (a - 1) * b]; break;
      case 7: ans = U.int(r, 2, 10); b = U.int(r, 2, 10); a = ans * b; q = `${a} ÷ ${b} = ?`; extra = [ans + 1, ans - 1, b]; break;
      default: return bank(r, 'geo');
    }
    return { q, a: String(ans), bad: numBad(r, ans, extra), why: mathWhy(lvl, a, b, ans) };
  }
  // Une STRATÉGIE, pas seulement le résultat (feedback « de processus », Hattie & Timperley 2007)
  function mathWhy(lvl, a, b, ans) {
    if (lvl <= 2) {                                   // addition : passer par la dizaine
      const toTen = (10 - (a % 10)) % 10;
      if (toTen && b > toTen) return `${a} + ${toTen} = ${a + toTen}, puis + ${b - toTen} = ${ans}`;
      return `${a} + ${b} = ${ans}`;
    }
    if (lvl === 3) {                                  // soustraction : d'abord les dizaines, puis les unités
      const t = Math.floor(b / 10) * 10, u = b % 10;
      if (t && u) return `${a} − ${t} = ${a - t}, puis − ${u} = ${ans}`;
      return `${a} − ${b} = ${ans}`;
    }
    if (lvl >= 4 && lvl <= 6) {                       // multiplication : s'appuyer sur un fait connu, avec le plus petit facteur
      const m = Math.max(a, b), n = Math.min(a, b);
      if (n === 1) return `${a} × ${b} = ${m} : multiplier par 1 ne change rien`;
      if (n === 10) return `× 10 : on ajoute un zéro à ${m} → ${ans}`;
      if (n === 2) return `× 2, c’est le double : le double de ${m} = ${ans}`;
      if (n === 5) return `× 5, c’est la moitié de × 10 : moitié de ${m * 10} = ${ans}`;
      if (n === 9) return `× 9 = × 10 − une fois : ${m * 10} − ${m} = ${ans}`;
      if (n === 4) return `× 4, c’est le double du double : ${m} → ${m * 2} → ${ans}`;
      return `${m} × ${n} = ${m} × ${n - 1} + ${m} = ${m * (n - 1)} + ${m} = ${ans}`;
    }
    if (lvl === 7) return `${a} ÷ ${b} = ${ans} car ${ans} × ${b} = ${a}`;
    return '';
  }

  /* ─── Français : conjugaison générée par règles ─── */
  const V1 = ['chanter', 'parler', 'manger', 'danser', 'jouer', 'aimer', 'regarder', 'écouter', 'trouver', 'habiter', 'marcher', 'penser',
    'dessiner', 'sauter', 'gagner', 'chercher', 'lancer', 'porter', 'travailler', 'apporter', 'garder', 'rester', 'nager', 'commencer', 'avancer', 'ranger', 'bouger'];
  const PRON = ['je', 'tu', 'il', 'nous', 'vous', 'ils'];
  const PRON_SHOW = ['je', 'tu', 'il / elle', 'nous', 'vous', 'ils / elles'];
  const vowel = w => /^[aeéèêiîoôuûh]/.test(w);
  // radical d'un verbe en -er devant une terminaison : manger → mange-ons, lancer → lanç-ons
  function stem(v, ending) {
    let r = v.slice(0, -2);
    if (/^[ao]/.test(ending)) { if (r.endsWith('g')) r += 'e'; else if (r.endsWith('c')) r = r.slice(0, -1) + 'ç'; }
    return r;
  }
  const END = { pres: ['e', 'es', 'e', 'ons', 'ez', 'ent'], imp: ['ais', 'ais', 'ait', 'ions', 'iez', 'aient'] };
  const FUT = ['ai', 'as', 'a', 'ons', 'ez', 'ont'];
  function form(v, tense, p) {
    if (tense === 'fut') return v + FUT[p];
    const e = END[tense][p]; return stem(v, e) + e;
  }
  function prompt(tenseLabel, p, verb) { // « j'___ » devant voyelle
    const pr = p === 0 && vowel(verb) ? 'j’' : PRON_SHOW[p] + ' ';
    return `${tenseLabel} : ${pr}___ (${verb})`;
  }
  function conjQ(r, tense) {
    const v = U.pick(r, V1), p = U.int(r, 0, 5), ans = form(v, tense, p);
    const label = { pres: 'Présent', imp: 'Imparfait', fut: 'Futur' }[tense];
    const pool = new Set();
    // erreurs typiques d'abord
    const raw = v.slice(0, -2);
    if (tense === 'pres' && p === 3 && (raw.endsWith('g') || raw.endsWith('c'))) pool.add(raw + 'ons');            // mangons, lancons
    if (tense === 'imp' && p <= 2 && (raw.endsWith('g') || raw.endsWith('c'))) pool.add(raw + END.imp[p]);          // mangais, lancais
    if (tense === 'imp' && p === 3 && raw.endsWith('g')) pool.add(raw + 'eions');                                   // mangeions
    if (tense === 'fut' && p === 0) pool.add(v + 'ais');                                                            // chanterais (conditionnel)
    if (tense === 'fut') pool.add(raw + (p === 0 ? 'rai' : FUT[p]));                                                 // chantrai / chantas
    for (let k = 0; k < 6; k++) { const f = form(v, tense, k); if (f !== ans) pool.add(f); }
    if (tense === 'pres') pool.add(form(v, 'imp', p)); else if (tense === 'imp') pool.add(form(v, 'pres', p));
    pool.delete(ans);
    const list = [...pool], typical = list.slice(0, 1), rest = U.shuffle(r, list.slice(1));
    return { q: prompt(label, p, v), a: ans, bad: [...typical, ...rest].slice(0, 2), why: conjWhy(v, tense, p, ans) };
  }
  // La règle qui produit la forme, avec le cas particulier quand il y en a un
  function conjWhy(v, tense, p, ans) {
    const raw = v.slice(0, -2), who = PRON_SHOW[p];
    if (tense === 'fut') return `Futur : on garde l’infinitif « ${v} » et on ajoute -${FUT[p]} → ${ans}`;
    const e = END[tense][p], special = /^[ao]/.test(e) && (raw.endsWith('g') || raw.endsWith('c'));
    const base = tense === 'pres' ? `Présent : radical « ${raw}- » + -${e} avec « ${who} »` : `Imparfait : radical « ${raw}- » + -${e} avec « ${who} »`;
    if (special && raw.endsWith('g')) return base + ` · on ajoute un e pour garder le son « ge » : ${ans}`;
    if (special && raw.endsWith('c')) return base + ` · le c devient ç pour garder le son « s » : ${ans}`;
    return base + ` → ${ans}`;
  }
  const IRR = {
    être: ['suis', 'es', 'est', 'sommes', 'êtes', 'sont'], avoir: ['ai', 'as', 'a', 'avons', 'avez', 'ont'],
    aller: ['vais', 'vas', 'va', 'allons', 'allez', 'vont'], faire: ['fais', 'fais', 'fait', 'faisons', 'faites', 'font'],
  };
  const IRR_ERR = { aller: { 5: 'allent', 3: 'vons' }, faire: { 4: 'faisez', 5: 'faisent' }, être: { 4: 'sommez', 5: 'sons' }, avoir: { 5: 'avent', 3: 'ons' } };
  function irrQ(r) {
    const v = U.pick(r, Object.keys(IRR)), p = U.int(r, 0, 5), ans = IRR[v][p];
    const pool = new Set(); const err = IRR_ERR[v][p]; if (err) pool.add(err);
    U.shuffle(r, IRR[v].slice()).forEach(f => { if (f !== ans) pool.add(f); });
    pool.delete(ans);
    const pr = p === 0 && vowel(ans) ? 'j’' : PRON_SHOW[p] + ' ';
    // on montre toute la conjugaison : voir le verbe entier aide à le retenir
    const line = PRON_SHOW.map((w, i) => (i === 0 && vowel(IRR[v][0]) ? 'j’' : w.split(' ')[0] + ' ') + IRR[v][i]).join(', ');
    return { q: `Présent : ${pr}___ (${v})`, a: ans, bad: [...pool].slice(0, 2), why: `${v} au présent : ${line}` };
  }
  const PC = [
    { v: 'manger', aux: 'avoir', pp: 'mangé' }, { v: 'finir', aux: 'avoir', pp: 'fini' }, { v: 'prendre', aux: 'avoir', pp: 'pris' },
    { v: 'voir', aux: 'avoir', pp: 'vu' }, { v: 'faire', aux: 'avoir', pp: 'fait' }, { v: 'dire', aux: 'avoir', pp: 'dit' },
    { v: 'mettre', aux: 'avoir', pp: 'mis' }, { v: 'écrire', aux: 'avoir', pp: 'écrit' }, { v: 'lire', aux: 'avoir', pp: 'lu' },
    { v: 'aller', aux: 'être', pp: 'allé' }, { v: 'venir', aux: 'être', pp: 'venu' }, { v: 'partir', aux: 'être', pp: 'parti' },
    { v: 'arriver', aux: 'être', pp: 'arrivé' }, { v: 'tomber', aux: 'être', pp: 'tombé' }, { v: 'rester', aux: 'être', pp: 'resté' },
  ];
  const PC_P = [ // [affichage, avoir, être, genre, nombre]
    ['j’', 'ai', 'suis', 'm', 's'], ['tu ', 'as', 'es', 'm', 's'], ['il ', 'a', 'est', 'm', 's'], ['elle ', 'a', 'est', 'f', 's'],
    ['nous ', 'avons', 'sommes', 'm', 'p'], ['vous ', 'avez', 'êtes', 'm', 'p'], ['ils ', 'ont', 'sont', 'm', 'p'], ['elles ', 'ont', 'sont', 'f', 'p'],
  ];
  function pcQ(r) {
    const vb = U.pick(r, PC), p = U.pick(r, PC_P), etre = vb.aux === 'être';
    const agree = (g, n) => vb.pp + (g === 'f' ? 'e' : '') + (n === 'p' ? 's' : '');
    const ans = (etre ? p[2] : p[1]) + ' ' + (etre ? agree(p[3], p[4]) : vb.pp);
    const pool = new Set();
    pool.add((etre ? p[1] : p[2]) + ' ' + (etre ? vb.pp : agree(p[3], p[4])));   // mauvais auxiliaire
    if (etre && (p[3] === 'f' || p[4] === 'p')) pool.add(p[2] + ' ' + vb.pp);   // oubli de l'accord
    if (etre && p[3] === 'm' && p[4] === 's') pool.add(p[2] + ' ' + vb.pp + 's');
    pool.add((etre ? p[2] : p[1]) + ' ' + vb.v);                                 // infinitif au lieu du participe
    pool.delete(ans);
    const shown = p[0] === 'j’' && etre ? 'je ' : p[0];
    const why = etre ? `« ${vb.v} » se conjugue avec être : le participe s’accorde avec le sujet (${shown.trim()} →${agree(p[3], p[4])})`
                     : `« ${vb.v} » se conjugue avec avoir : pas d’accord avec le sujet → ${vb.pp}`;
    return { q: `Passé composé : ${shown}___ (${vb.v})`, a: ans, bad: U.shuffle(r, [...pool]).slice(0, 2), why };
  }

  /* ─── Banques fixes ─── */
  const BANKS = {
    geo: [['Côtés d’un triangle ?', '3', ['4', '5']], ['Faces d’un cube ?', '6', ['4', '8']], ['Côtés d’un carré ?', '4', ['3', '5']],
      ['Côtés d’un hexagone ?', '6', ['5', '8']], ['Côtés d’un pentagone ?', '5', ['4', '6']], ['Un angle droit mesure…', '90°', ['45°', '180°']],
      ['Triangle aux 3 côtés égaux ?', 'équilatéral', ['isocèle', 'rectangle']], ['Solide sans arête ?', 'la sphère', ['le cube', 'le cône']],
      ['Faces d’une pyramide à base carrée ?', '5', ['4', '6']], ['Sommets d’un cube ?', '8', ['6', '12']]],
    'fr:6': [['Synonyme de « content »', 'heureux', ['triste', 'fatigué']], ['Synonyme de « rapide »', 'vite', ['lent', 'calme']],
      ['Contraire de « chaud »', 'froid', ['tiède', 'sec']], ['Synonyme de « beau »', 'joli', ['laid', 'bizarre']],
      ['Contraire de « jour »', 'nuit', ['matin', 'midi']], ['Contraire de « grand »', 'petit', ['moyen', 'long']],
      ['Synonyme de « ami »', 'copain', ['ennemi', 'voisin']], ['Contraire de « commencer »', 'finir', ['démarrer', 'ouvrir']],
      ['Synonyme de « fatigué »', 'épuisé', ['reposé', 'actif']], ['Contraire de « facile »', 'difficile', ['simple', 'gentil']],
      ['Synonyme de « effrayé »', 'apeuré', ['joyeux', 'calme']], ['Contraire de « ouvrir »', 'fermer', ['porter', 'monter']]],
    'fr:7': [['Nature de « chien » ?', 'nom', ['verbe', 'adjectif']], ['Nature de « courir » ?', 'verbe', ['nom', 'adjectif']],
      ['Nature de « belle » ?', 'adjectif', ['nom', 'verbe']], ['Nature de « lentement » ?', 'adverbe', ['adjectif', 'verbe']],
      ['Nature de « nous » ?', 'pronom', ['nom', 'verbe']], ['Pluriel de « cheval »', 'chevaux', ['chevals', 'chevaus']],
      ['Pluriel de « bijou »', 'bijoux', ['bijous', 'bijoues']], ['Pluriel de « journal »', 'journaux', ['journals', 'journeaux']],
      ['Féminin de « acteur »', 'actrice', ['acteuse', 'acteure']], ['Féminin de « boulanger »', 'boulangère', ['boulangeuse', 'boulangeure']],
      ['Féminin de « chanteur »', 'chanteuse', ['chantrice', 'chanteure']], ['Pluriel de « œil »', 'yeux', ['œils', 'œux']]],
    'en:1': [['« Dog » en français ?', 'chien', ['chat', 'oiseau']], ['« Cat » en français ?', 'chat', ['chien', 'lapin']],
      ['« Red » en français ?', 'rouge', ['bleu', 'vert']], ['« Blue » en français ?', 'bleu', ['rouge', 'noir']],
      ['« Bird » en français ?', 'oiseau', ['poisson', 'chat']], ['« Green » en français ?', 'vert', ['jaune', 'bleu']],
      ['« Fish » en français ?', 'poisson', ['chien', 'oiseau']], ['« Yellow » en français ?', 'jaune', ['rouge', 'blanc']],
      ['« Big » en français ?', 'grand', ['petit', 'lourd']], ['« Ten » en chiffres ?', '10', ['9', '11']],
      ['« Five » en chiffres ?', '5', ['4', '6']], ['« Horse » en français ?', 'cheval', ['vache', 'chèvre']]],
    'en:2': [['« House » en français ?', 'maison', ['école', 'jardin']], ['« School » en français ?', 'école', ['maison', 'rue']],
      ['« Book » en français ?', 'livre', ['stylo', 'cahier']], ['« Tree » en français ?', 'arbre', ['fleur', 'herbe']],
      ['« Apple » en français ?', 'pomme', ['poire', 'banane']], ['« Water » en français ?', 'eau', ['lait', 'jus']],
      ['« Window » en français ?', 'fenêtre', ['porte', 'mur']], ['« Chair » en français ?', 'chaise', ['table', 'lit']],
      ['« Sun » en français ?', 'soleil', ['lune', 'étoile']], ['« Rain » en français ?', 'pluie', ['neige', 'vent']]],
    'en:3': [['I ___ a student.', 'am', ['is', 'are']], ['She ___ to school.', 'goes', ['go', 'going']], ['They ___ happy.', 'are', ['is', 'am']],
      ['He ___ a book.', 'reads', ['read', 'reading']], ['We ___ friends.', 'are', ['is', 'am']], ['I ___ an apple every day.', 'eat', ['eats', 'eating']],
      ['My dog ___ very fast.', 'runs', ['run', 'running']], ['The children ___ in the park.', 'play', ['plays', 'playing']],
      ['I live ___ France.', 'in', ['on', 'at']], ['There ___ a dog in the garden.', 'is', ['are', 'am']],
      ['There ___ many children.', 'are', ['is', 'am']], ['How old ___ you?', 'are', ['is', 'do']], ['What ___ your name?', 'is', ['are', 'do']],
      ['I ___ not understand.', 'do', ['does', 'am']], ['She ___ not like spiders.', 'does', ['do', 'is']]],
    'en:4': [['Pluriel de « child »', 'children', ['childs', 'childrens']], ['Pluriel de « mouse »', 'mice', ['mouses', 'mices']],
      ['Pluriel de « foot »', 'feet', ['foots', 'feets']], ['Passé de « go »', 'went', ['goed', 'gone']], ['Passé de « eat »', 'ate', ['eated', 'eaten']],
      ['Passé de « see »', 'saw', ['seed', 'seen']], ['Passé de « have »', 'had', ['haved', 'has']], ['Passé de « run »', 'ran', ['runned', 'runs']],
      ['Pluriel de « man »', 'men', ['mans', 'mens']], ['Pluriel de « tooth »', 'teeth', ['tooths', 'teeths']],
      ['Pluriel de « sheep »', 'sheep', ['sheeps', 'sheepes']], ['Passé de « make »', 'made', ['maked', 'making']],
      ['Passé de « come »', 'came', ['comed', 'comes']], ['Passé de « swim »', 'swam', ['swimmed', 'swum']]],
    'de:1': [['« Maison » en allemand ?', 'das Haus', ['der Hund', 'die Katze']], ['« Chat » en allemand ?', 'die Katze', ['der Hund', 'das Haus']],
      ['« Chien » en allemand ?', 'der Hund', ['die Katze', 'der Fisch']], ['« Voiture » en allemand ?', 'das Auto', ['der Bus', 'das Rad']],
      ['« École » en allemand ?', 'die Schule', ['das Haus', 'das Buch']], ['« Livre » en allemand ?', 'das Buch', ['die Schule', 'das Heft']],
      ['« Eau » en allemand ?', 'das Wasser', ['die Milch', 'der Saft']], ['« Pain » en allemand ?', 'das Brot', ['der Apfel', 'das Ei']],
      ['« Table » en allemand ?', 'der Tisch', ['der Stuhl', 'die Bank']], ['« Chaise » en allemand ?', 'der Stuhl', ['der Tisch', 'das Bett']],
      ['« Arbre » en allemand ?', 'der Baum', ['die Blume', 'der Wald']], ['« Fleur » en allemand ?', 'die Blume', ['der Baum', 'das Gras']],
      ['« Soleil » en allemand ?', 'die Sonne', ['der Mond', 'der Stern']], ['« Enfant » en allemand ?', 'das Kind', ['der Mann', 'die Frau']],
      ['« Mère » en allemand ?', 'die Mutter', ['der Vater', 'die Schwester']], ['« Père » en allemand ?', 'der Vater', ['die Mutter', 'der Bruder']]],
    'de:2': [['« Rouge » en allemand ?', 'rot', ['blau', 'grün']], ['« Bleu » en allemand ?', 'blau', ['rot', 'schwarz']],
      ['« Vert » en allemand ?', 'grün', ['blau', 'weiß']], ['« Noir » en allemand ?', 'schwarz', ['weiß', 'grau']],
      ['« Grand » en allemand ?', 'groß', ['klein', 'alt']], ['« Petit » en allemand ?', 'klein', ['groß', 'neu']],
      ['« Rapide » en allemand ?', 'schnell', ['langsam', 'schön']], ['« Vieux » en allemand ?', 'alt', ['neu', 'jung']],
      ['« Beau » en allemand ?', 'schön', ['hässlich', 'kalt']], ['« Froid » en allemand ?', 'kalt', ['warm', 'heiß']]],
    'de:3': [['« Bonjour » en allemand ?', 'Guten Tag', ['Tschüss', 'Danke']], ['« Merci » en allemand ?', 'Danke', ['Bitte', 'Hallo']],
      ['« S’il te plaît » en allemand ?', 'Bitte', ['Danke', 'Ja']], ['« Au revoir » en allemand ?', 'Tschüss', ['Hallo', 'Danke']],
      ['Ich ___ müde. (être)', 'bin', ['bist', 'ist']], ['Er ___ ein Buch. (avoir)', 'hat', ['habe', 'hast']],
      ['Wir ___ Freunde. (être)', 'sind', ['seid', 'bin']], ['Du ___ nett. (être)', 'bist', ['bin', 'sind']],
      ['Ich ___ zehn Jahre alt. (être)', 'bin', ['habe', 'ist']], ['Sie ___ zwei Brüder. (elle, avoir)', 'hat', ['ist', 'haben']]],
    'de:4': [['Pluriel de « das Haus »', 'die Häuser', ['die Hause', 'die Hauser']], ['Pluriel de « der Hund »', 'die Hunde', ['die Hunds', 'die Hunden']],
      ['Article de « Katze »', 'die', ['der', 'das']], ['Article de « Buch »', 'das', ['der', 'die']], ['Article de « Mann »', 'der', ['die', 'das']],
      ['Pluriel de « das Kind »', 'die Kinder', ['die Kinds', 'die Kindes']], ['Pluriel de « die Blume »', 'die Blumen', ['die Blume', 'die Blumes']],
      ['Article de « Sonne »', 'die', ['der', 'das']], ['Article de « Baum »', 'der', ['die', 'das']], ['Article de « Mädchen »', 'das', ['die', 'der']],
      ['Pluriel de « der Stuhl »', 'die Stühle', ['die Stuhls', 'die Stühlen']], ['Pluriel de « das Auto »', 'die Autos', ['die Auto', 'die Auten']]],
  };
  function bank(r, key) { const b = BANKS[key], it = U.pick(r, b); return { q: it[0], a: it[1], bad: U.shuffle(r, it[2].slice()).slice(0, 2), why: it[3] || '' }; }

  // Chaque matière reçoit un dernier thème « Tout mélangé » : mélanger les types de questions
  // oblige à choisir la bonne stratégie, ce qui améliore nettement les résultats (Rohrer & Taylor 2007).
  for (const s of Object.values(SUBJECTS)) { s.base = s.levels.length; s.levels.push('Tout mélangé'); }
  const isMix = (sub, lvl) => lvl === SUBJECTS[sub].base + 1;

  function generate(r, sub, lvl) {
    if (isMix(sub, lvl)) { const L = U.int(r, 1, SUBJECTS[sub].base), it = generate(r, sub, L); it.lvl = L; return it; }
    let it;
    if (sub === 'math') it = mathQ(r, lvl);
    else if (sub === 'fr') it = lvl === 1 ? conjQ(r, 'pres') : lvl === 2 ? irrQ(r) : lvl === 3 ? conjQ(r, 'imp') : lvl === 4 ? conjQ(r, 'fut') : lvl === 5 ? pcQ(r) : bank(r, 'fr:' + lvl);
    else it = bank(r, sub + ':' + lvl);
    it.lvl = lvl; return it;
  }
  // nombre de questions à « posséder » pour maîtriser un thème (banques fixes : toutes ; générateurs : 20)
  function themeSize(sub, lvl) {
    if (isMix(sub, lvl)) return 20 * SUBJECTS[sub].base;
    const key = sub === 'math' && lvl === 8 ? 'geo' : sub + ':' + lvl;
    return BANKS[key] ? BANKS[key].length : 20;
  }

  /* ─── Session : évite les répétitions immédiates, fait revenir les erreurs (dans la partie ET d'une partie à l'autre) ─── */
  function Session(sub, lvl, seed, useMemory = true) {
    const r = U.rng(seed), recent = [], retry = [];
    let sinceRetry = 0;
    return {
      sub, lvl, missed: [], asked: 0, right: 0, reviewed: 0, learned: 0,
      next() {
        let it = null;
        if (retry.length && sinceRetry >= 2) { it = retry.shift(); it = { ...it, bad: it.bad.slice(), retry: true }; sinceRetry = 0; }
        else {
          // révision espacée : environ une question sur trois vient du carnet de mémoire, quand elle est « due »
          const due = useMemory ? Memory.due(sub, isMix(sub, lvl) ? 0 : lvl).filter(e => !recent.includes(e.q)) : [];
          if (due.length && r() < .35) { const e = U.pick(r, due); it = { q: e.q, a: e.a, bad: U.shuffle(r, e.bad.slice()), why: e.why, lvl: e.lvl, review: true, box: e.box }; }
          else for (let t = 0; t < 12; t++) { it = generate(r, sub, lvl); if (!recent.includes(it.q)) break; }
          sinceRetry++;
        }
        recent.push(it.q); if (recent.length > 6) recent.shift();
        this.asked++;
        return it;
      },
      result(it, ok) {
        if (useMemory) { const before = Memory.box(sub, it.lvl || lvl, it.q); Memory.record(sub, it.lvl || lvl, it, ok); if (ok && before >= 3) this.learned++; }
        if (it.review) this.reviewed++;
        if (ok) { this.right++; return; }
        if (!this.missed.some(m => m.q === it.q)) this.missed.push({ q: it.q, a: it.a, why: it.why });
        if (!it.retry) retry.push(it);
      },
    };
  }

  // Vérification rapide des générateurs (console) : bonne réponse jamais parmi les mauvaises, 2 mauvaises distinctes
  function selfTest() {
    const r = U.rng(7), errors = [];
    for (const [sub, s] of Object.entries(SUBJECTS)) s.levels.forEach((_, i) => {
      for (let n = 0; n < 200; n++) {
        const it = generate(r, sub, i + 1);
        if (!it.q || !it.a || it.bad.length < 2 || it.bad.includes(it.a) || it.bad[0] === it.bad[1]) { errors.push([sub, i + 1, it]); break; }
      }
    });
    return errors;
  }

  return { SUBJECTS, Session, generate, selfTest, themeSize, isMix, _form: form };
})();

/* ══════════════════════════════════════════════════════════════════════════
   Carnet de mémoire (répétition espacée, boîtes de Leitner), conservé sur l'appareil.
   Chaque question vue entre dans une boîte de 1 à 5. Juste : elle monte d'une boîte et revient plus tard ;
   fausse : elle retombe en boîte 1 et revient vite. Espacer les rappels améliore nettement la mémoire
   à long terme (Cepeda et al. 2006) ; se tester vaut mieux que relire (Roediger & Karpicke 2006).
   ══════════════════════════════════════════════════════════════════════════ */
const Memory = (() => {
  const KEY = 'rtl-memoire-v1', H = 36e5, GAP = [0, 0, 20 * H, 3 * 24 * H, 7 * 24 * H, 21 * 24 * H]; // délai avant retour, par boîte
  let data = {};
  try { data = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { data = {}; }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { } };
  const key = (sub, lvl, q) => sub + ':' + lvl + '|' + q;
  const entries = (sub, lvl) => { const p = lvl ? sub + ':' + lvl + '|' : sub + ':'; return Object.keys(data).filter(k => k.startsWith(p)).map(k => data[k]); };
  return {
    due(sub, lvl, now = Date.now()) { return entries(sub, lvl).filter(e => e.due <= now && e.box < 5); },
    box(sub, lvl, q) { const e = data[key(sub, lvl, q)]; return e ? e.box : 0; },
    record(sub, lvl, it, ok) {
      const k = key(sub, lvl, it.q), e = data[k] || { q: it.q, a: it.a, bad: it.bad.slice(0, 2), why: it.why || '', lvl, box: 1, seen: 0, ok: 0 };
      e.seen++; e.last = Date.now();
      if (ok) { e.ok++; e.box = Math.min(5, e.box + 1); } else e.box = 1;
      e.due = Date.now() + GAP[e.box];
      data[k] = e; save();
    },
    // maîtrise d'un thème : 0 à 1 (une question en boîte 4 ou 5 compte comme « possédée »)
    mastery(sub, lvl) {
      const es = entries(sub, Quiz.isMix(sub, lvl) ? 0 : lvl), pts = es.reduce((s, e) => s + Math.min(e.box - 1, 3) / 3, 0);
      return { seen: es.length, pct: Math.min(1, pts / Quiz.themeSize(sub, lvl)), owned: es.filter(e => e.box >= 4).length };
    },
    stars(sub, lvl) { const m = this.mastery(sub, lvl).pct; return m >= .9 ? 3 : m >= .6 ? 2 : m >= .3 ? 1 : 0; },
    totalOwned() { return Object.values(data).filter(e => e.box >= 4).length; },
    reset() { data = {}; save(); },
  };
})();