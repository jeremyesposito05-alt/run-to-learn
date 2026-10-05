'use strict';
/* ══════════════════════════════════════════════════════════════════════════
   Le monde : une grille de cases de 16 px, 14 de haut, qui s'allonge vers la
   droite à mesure qu'on avance et s'efface derrière le joueur.

   Les niveaux sont faits de MORCEAUX dessinés en texte. Une lettre = une case.
   Les lignes sont alignées par le bas : la dernière ligne est le fond du monde.
       #  sol / mur (solide)          =  plateforme traversable par-dessous
       ^  pics (font mal)             o  emplacement possible d'un bonus question
       e  marcheur (écrasable)        h  sauteur (écrasable)
       f  volant (écrasable)          s  hérisson (à éviter)
       .  vide
   Pour ajouter un morceau : copier un bloc ci-dessous et le redessiner.
   Règle de raccord : commencer et finir par du sol sur les deux dernières lignes.
   ══════════════════════════════════════════════════════════════════════════ */
function chunk(tier, name, lines) {
  const w = Math.max(...lines.map(l => l.length)), rows = [];
  for (let i = 0; i < ROWS - lines.length; i++) rows.push('.'.repeat(w));
  for (const l of lines) rows.push(l.padEnd(w, '.'));
  return { tier, name, w, rows };
}

const CHUNKS = [
  // ─── Niveau 0 : on apprend à courir et sauter ───
  chunk(0, 'plat', [
    '...o.o.o.o..........',
    '....................',
    '####################',
    '####################']),
  chunk(0, 'petit trou', [
    '........oo..........',
    '....................',
    '....................',
    '########..##########',
    '########..##########']),
  chunk(0, 'marche', [
    '..........o.o.o.....',
    '....................',
    '.........###########',
    '####################',
    '####################']),
  chunk(0, 'un marcheur', [
    '......................',
    '.............e........',
    '######################',
    '######################']),
  chunk(0, 'pics', [
    '..........o.o.o.........',
    '........................',
    '...........^^...........',
    '########################',
    '########################']),
  chunk(0, 'trou moyen', [
    '.........ooo.........',
    '.....................',
    '.....................',
    '#######...###########',
    '#######...###########']),

  // ─── Niveau 1 : enchaînements ───
  chunk(1, 'passerelles', [
    '..............o.o.......',
    '.............=====......',
    '........................',
    '......oo................',
    '.....====...............',
    '........................',
    '####...............#####',
    '####...............#####']),
  chunk(1, 'volant sur le trou', [
    '.........f..............',
    '........................',
    '........................',
    '........ooo.............',
    '........................',
    '........................',
    '#######.....############',
    '#######.....############']),
  chunk(1, 'deux marcheurs', [
    '...........o.o.o.........',
    '..........=====..........',
    '...e..............e......',
    '#########################',
    '#########################']),
  chunk(1, 'champ de pics', [
    '......oooooo.........',
    '.....========........',
    '.....................',
    '....^^^^^^^^^^.......',
    '#####################',
    '#####################']),
  chunk(1, 'colline', [
    '..............o.o..........',
    '.............#####.........',
    '..........###########......',
    '.......#################...',
    '....######################.',
    '###########################',
    '###########################']),
  chunk(1, 'sauteur', [
    '.........................',
    '...........h.............',
    '#########################',
    '#########################']),

  // ─── Niveau 2 : il faut le double saut et du sang-froid ───
  chunk(2, 'grand ravin', [
    '...........o.o.o.......',
    '.......................',
    '.......................',
    '.......................',
    '.......................',
    '#####.........#########',
    '#####.........#########']),
  chunk(2, 'hérissons', [
    '...........ooo............',
    '..........................',
    '...s...............s......',
    '##########....############',
    '##########....############']),
  chunk(2, 'mur', [
    '..........ooo..........',
    '.......................',
    '..........###..........',
    '..........###..........',
    '..........###.......e..',
    '#######################',
    '#######################']),
  chunk(2, 'couloir des volants', [
    '........f..........f.....',
    '.........................',
    '.........................',
    '....ooo........ooo.......',
    '...=====......=====......',
    '.........................',
    '.........................',
    '###...................###',
    '###...................###']),
  chunk(2, 'escalier suspendu', [
    '.................o.o.......',
    '................====.......',
    '.............o.............',
    '...........====............',
    '.......o...................',
    '.....====..............h...',
    '.......................####',
    '###....................####',
    '###....................####']),
];
const START_CHUNK = chunk(0, 'départ', ['..............................', '..............................', '##############################', '##############################']);

// Cases : # sol · i glace (glisse) · t champignon-trampoline (solides) ; = plateforme · k branche fragile (traversables)
const isSolid = t => t === '#' || t === 'i' || t === 't' || t === 'r';   // r : rocher / souche (obstacle naturel posé par le remplissage)
const isOneWay = t => t === '=' || t === 'k';
const ENTITY_CHARS = 'ehfsoObvad';

/* ─── Grille ─── */
const World = {
  cols: [], base: 0, end: 0,
  reset() { this.cols = []; this.base = 0; this.end = 0; },
  tile(cx, cy) { if (cy < 0 || cy >= ROWS) return '.'; const c = this.cols[cx - this.base]; return c ? c[cy] : '.'; },
  solid(cx, cy) { return isSolid(this.tile(cx, cy)); },
  setTile(cx, cy, t) { const c = this.cols[cx - this.base]; if (c && cy >= 0 && cy < ROWS) c[cy] = t; },
  append(ch, spawn) {
    for (let x = 0; x < ch.w; x++) {
      const col = [];
      for (let y = 0; y < ROWS; y++) {
        let t = ch.rows[y][x];
        if (ENTITY_CHARS.includes(t)) { spawn(t, this.end + x, y); t = '.'; }
        col.push(t);
      }
      this.cols.push(col);
    }
    this.end += ch.w;
  },
  // coupe le monde déjà construit à partir de la colonne cx (changement de biome : le nouveau commence plus tôt)
  cut(cx) { if (cx < this.end) { this.cols.length = Math.max(0, cx - this.base); this.end = cx; } },
  // une colonne « sol plat » : on peut y raccorder n'importe quel morceau
  plain(cx) { const c = this.cols[cx - this.base]; if (!c) return false; for (let y = 0; y < ROWS; y++) if (y >= ROWS - 2 ? !isSolid(c[y]) : c[y] !== '.') return false; return true; },
  trim(minCx) { while (this.base < minCx) { this.cols.shift(); this.base++; } },
};

/* Déplacement d'une boîte dans la grille, axe par axe (jamais plus de 16 px par pas : pas de traversée). */
function moveBox(b, dx, dy, oneWay = true) {
  const res = { wall: false, landed: false, bumped: false };
  b.x += dx;
  if (dx !== 0) {
    const cx = Math.floor((dx > 0 ? b.x + b.w - .001 : b.x) / TILE);
    const y0 = Math.floor(b.y / TILE), y1 = Math.floor((b.y + b.h - .001) / TILE);
    for (let cy = y0; cy <= y1; cy++) if (World.solid(cx, cy)) { b.x = dx > 0 ? cx * TILE - b.w : (cx + 1) * TILE; res.wall = true; break; }
  }
  const prevBottom = b.y + b.h;
  b.y += dy;
  const x0 = Math.floor(b.x / TILE), x1 = Math.floor((b.x + b.w - .001) / TILE);
  if (dy > 0) {
    const cy = Math.floor((b.y + b.h - .001) / TILE);
    for (let cx = x0; cx <= x1; cx++) {
      const t = World.tile(cx, cy);
      if (isSolid(t) || (oneWay && isOneWay(t) && prevBottom <= cy * TILE + .01)) { b.y = cy * TILE - b.h; res.landed = true; break; }
    }
  } else if (dy < 0) {
    const cy = Math.floor(b.y / TILE);
    for (let cx = x0; cx <= x1; cx++) if (World.solid(cx, cy)) { b.y = (cy + 1) * TILE; res.bumped = true; break; }
  }
  return res;
}
// Y a-t-il du sol (solide ou plateforme) sous le point (x, pieds) ?
function groundAt(x, feetY) { const t = World.tile(Math.floor(x / TILE), Math.floor((feetY + 1) / TILE)); return isSolid(t) || isOneWay(t); }

/* ─── Générateur : choisit les morceaux selon la difficulté ─── */
const Gen = {
  r: null, last: null, intro: 0, biome: null,
  reset(seed, biome) { this.r = U.rng(seed); this.last = null; this.intro = 0; this.biome = biome; },
  next(diff) {
    if (this.intro < 1) { this.intro++; return START_CHUNK; }
    const maxT = diff < .22 ? 0 : diff < .55 ? 1 : 2;
    // morceaux communs + morceaux propres au biome (plus fréquents : c'est eux qui donnent son caractère au biome)
    const pool = [];
    const add = (c, base) => { if (c.tier <= maxT && c !== this.last) { const w = base + (c.tier === maxT ? 2 : 0); for (let i = 0; i < w; i++) pool.push(c); } };
    for (const c of CHUNKS) add(c, 1);
    for (const c of (this.biome ? this.biome.chunks : [])) add(c, 3);
    const c = U.pick(this.r, pool); this.last = c; return c;
  },
};
