'use strict';
/* ══════════════════════════════════════════════════════════════════════════
   BIOMES. Chaque biome apporte :
     • des morceaux de niveau propres (avec ses obstacles) ;
     • ses ennemis (mêmes lettres que partout, mais un comportement et une apparence à lui) ;
     • ses couleurs (provisoires : l'habillage DKC remplacera « pal »).
   On change de biome après RULES.biomeGoal bonnes réponses. Après le dernier,
   on repart du premier, plus difficile.

   Lettres propres aux biomes (en plus de celles de world.js) :
       i  glace (solide, on glisse et on accélère)
       t  champignon-trampoline (solide, rebond automatique très haut)
       k  branche fragile (traversable, casse peu après qu'on a marché dessus)
       b  boule qui roule vers le joueur (boule de neige / tronc) : on saute par-dessus… ou dessus pour rebondir
       v  stalactite : tombe quand on approche, puis reste plantée un moment dans le sol
       a  lanceur (écureuil) : jette des projectiles en cloche
       d  plongeur (aigle, hibou) : pique sur le joueur quand il passe dessous
       O  emplacement de bonus « défi » (souvent choisi, même très haut : récompense d'un passage difficile)
   ══════════════════════════════════════════════════════════════════════════ */

// Cheminée à gravir en sautant d'un mur à l'autre (même plan dans les deux biomes, habillé différemment).
// C'est un DÉFI FACULTATIF : les deux murs sont suspendus, on peut passer dessous et continuer ;
// seul celui qui grimpe en rebondissant attrape le bonus « défi » tout en haut.
const CHIMNEY = [
  '..........##........',
  '..........##........',
  '..........##........',
  '..........##...##...',
  '..........##.O.##...',
  '..........##...##...',
  '..........##...##...',
  '..........##...##...',
  '...............##...',
  '...............##...',
  '....................',
  '....................',
  '####################',
  '####################'];

const BIOMES = [
  {
    id: 'montagne', name: 'Montagne de Beau Soleil', short: 'Montagne',
    pal: {
      sky: ['#16205a', '#4a5aa8', '#b99ac4', '#e8c6c0'], far: '#6e70b4', mid: '#4b5494',
      ground: ['#34416f', '#38467a'], edgeL: '#4a5a94', edgeR: '#232c52', cap: '#eef3ff', capShade: '#b8c6ec',
      plankTop: '#e4ebff', plank: '#8a6a4a', ice: '#bfe6ff', iceShade: '#7fbfe8', spike: ['#ffffff', '#c9d2f0'],
    },
    enemies: {
      e: { kind: 'bonhomme de neige', color: '#f2f5ff', speed: .45 },
      h: { kind: 'chamois', color: '#b98a5a' },
      f: { kind: 'corbeau', color: '#3a3f5c' },
      d: { kind: 'aigle', color: '#6b4a2a' },
      s: { kind: 'boule à pointes', color: '#9fd8ff' },
      a: { kind: 'marmotte', color: '#a0784e' },
      b: { kind: 'boule de neige', color: '#f4f7ff' },
      v: { kind: 'stalactite', color: '#cfefff' },
    },
    chunks: [
      chunk(0, 'plaque de glace', [
        '.....o.o.o..........',
        '....................',
        '####iiiiiiiiii######',
        '####################']),
      chunk(1, 'stalactites', [
        '......#############.......',
        '......#############.......',
        '........v...v...v.........',
        '..........................',
        '..........o.......o.......',
        '..........................',
        '..........................',
        '##########################',
        '##########################']),
      chunk(1, 'boules de neige', [
        '..........o.........o........',
        '.............................',
        '.......................b.....b',
        '##############################',
        '##############################']),
      chunk(1, 'aigles', [
        '.........d.........d.......',
        '...........................',
        '...........................',
        '..........o........o.......',
        '...........................',
        '.......e...................',
        '###########################',
        '###########################']),
      chunk(2, 'glace et ravin', [
        '...........o.o.o........',
        '........................',
        '........................',
        '........................',
        '####iiiiiii......#######',
        '###########......#######']),
      chunk(2, 'cheminée de glace', CHIMNEY),
      chunk(2, 'avalanche', [
        '..........#########...........',
        '............v...v.............',
        '..........o.........O.........',
        '..............................',
        '.................b.........b..',
        '########iiiiiiiiiiiii#########',
        '##############################']),
    ],
  },
  {
    id: 'foret', name: 'La Forêt cubique', short: 'Forêt',
    pal: {
      sky: ['#10261c', '#2f6a44', '#9cc878', '#e6e2a4'], far: '#2f5a3a', mid: '#1f4a2c',
      ground: ['#5a3d2b', '#62432f'], edgeL: '#7a5638', edgeR: '#3c281c', cap: '#5fae3f', capShade: '#3e7f2a',
      plankTop: '#8fce5a', plank: '#6b4a2a', ice: '#bfe6ff', iceShade: '#7fbfe8', spike: ['#9ad06a', '#4f8a32'],
    },
    enemies: {
      e: { kind: 'sanglier', color: '#6b4a3a', speed: .5, charge: true },
      h: { kind: 'grenouille', color: '#4caf50' },
      f: { kind: 'guêpe', color: '#e8b830' },
      d: { kind: 'hibou', color: '#8a6a4a' },
      s: { kind: 'hérisson', color: '#7a5a4a' },
      a: { kind: 'écureuil', color: '#c46a2a' },
      b: { kind: 'tronc', color: '#7a5230' },
      v: { kind: 'pomme de pin', color: '#8a5a2a' },
    },
    chunks: [
      chunk(0, 'champignon', [
        '.........O.............',
        '.......................',
        '.......................',
        '.......................',
        '.......................',
        '.......................',
        '.......................',
        '.......t........e......',
        '#######################',
        '#######################']),
      chunk(1, 'branches fragiles', [
        '.........o..............',
        '........................',
        '.......kkkk....kkkk.....',
        '........................',
        '........................',
        '####................####',
        '####................####']),
      chunk(1, 'troncs', [
        '.........o...........o......',
        '............................',
        '.....................b.....b',
        '############################',
        '############################']),
      chunk(1, 'écureuil', [
        '.........o...........a....',
        '....................#####.',
        '..........................',
        '##########################',
        '##########################']),
      chunk(1, 'sanglier', [
        '..........o.o.o...........',
        '..........................',
        '....................e.....',
        '##########################',
        '##########################']),
      chunk(2, 'trampolines en série', [
        '..............O................',
        '...............................',
        '...............................',
        '...............................',
        '...............................',
        '...............................',
        '...............................',
        '.....t.......t.........t.......',
        '######....######....######.####',
        '######....######....######.####']),
      chunk(2, 'cheminée des chênes', CHIMNEY),
      chunk(2, 'hiboux', [
        '.......d..........d.........',
        '............................',
        '............................',
        '.........o.........o........',
        '............................',
        '..........kkkkk.............',
        '............................',
        '####.................#######',
        '####.................#######']),
    ],
  },
];
