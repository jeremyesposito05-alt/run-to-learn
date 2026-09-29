'use strict';
/* ══════════════════════════════════════════════════════════════════════════
   Règles de la partie.
   • Des BONUS QUESTION apparaissent sur le parcours, parfois difficiles à attraper.
     En laisser passer un coûte de l'endurance : il faut prendre des risques.
   • En attraper un fige le jeu et ouvre l'écran-question (minuté selon le niveau).
   • Écraser un ennemi : rebond, double saut rechargé, endurance regagnée.
   • 5 bonnes réponses d'affilée : invincible quelques secondes.
   • Endurance à zéro : fin de partie.
   Puis les menus (HTML) et le démarrage.
   ══════════════════════════════════════════════════════════════════════════ */
// drain : endurance perdue à chaque image (60 par seconde) — c'est le compte à rebours de la partie
const LEVELS = {
  n1: { label: 'Niveau 1', hint: 'Découverte · pas de chrono · plus lent', speed: 1.8, ramp: .6, timer: 0, perChar: 0, hard: 0, every: [1, 2], drain: .016 },
  n2: { label: 'Niveau 2', hint: 'Chrono moyen · plus rapide', speed: 2.2, ramp: .9, timer: 9, perChar: .1, hard: .3, every: [1, 2], drain: .024 },
  n3: { label: 'Niveau 3', hint: 'Chrono court · rapide · bonus difficiles', speed: 2.6, ramp: 1.1, timer: 5, perChar: .06, hard: .6, every: [1, 2], drain: .042 },
};
// Tous les chiffres d'équilibrage au même endroit
const RULES = {
  correct: 22,      // endurance rendue par une bonne réponse (la « carotte »)
  wrong: 0,         // une mauvaise réponse ne rapporte rien (le compte à rebours suffit comme punition)
  missed: 0,        // un bonus raté : l'occasion est perdue, rien de plus
  stomp: 6,         // rendue en écrasant un ennemi
  hit: 15, spikes: 12, pit: 18, shot: 10,
  invincibleEvery: 5, invincibleTime: 360,   // 5 bonnes d'affilée = 6 s d'invincibilité
  biomeGoal: 8,     // bonnes réponses pour passer au biome suivant
  biomeReward: 30,  // endurance offerte en arrivant dans un nouveau biome
  stageHarder: .25, // chaque biome franchi rend la suite plus difficile (morceaux, vitesse, dérive)
};
// Les 3 blasons cachés d'un biome apparaissent dans ces morceaux (3e, 7e et 12e du biome)
const BLASON_AT = [3, 7, 12];
// Écran-question : descente vers l'arrêt, affichage du résultat, reprise (en images de 1/60 s)
const FOCUS = { in: 18, resultOk: 50, resultKo: 130, resultWhy: 240, out: 14, lockInput: 14 };
const FOCUS_BOX = i => ({ x: Math.round((VIEW_W - 244) / 2), y: 66 + i * 40, w: 244, h: 32 });

const Game = {
  state: 'menu', opts: null, level: LEVELS.n1, session: null,
  camX: 0, camY: 0, frame: 0, intro: 0, diff: 0, mercy: 0,
  energy: 100, score: 0, stomps: 0, chain: 0, combo: 0, bestCombo: 0, streak: 0, wrongRow: 0, caught: 0, missedOrbs: 0,
  boost: 0, enemies: [], orbs: [], shots: [], blasons: [], banner: null, popups: [], focus: null, tAcc: 0, sinceOrb: 0, orbEvery: 2, _spots: [],
  biome: BIOMES[0], biomeIdx: 0, stage: 0, biomeRight: 0, trans: null, biomeCard: 0, crumbles: new Map(), seed: 1,

  start(opts) {
    this.opts = opts; this.demo = !!opts.demo; this.level = LEVELS[opts.level] || LEVELS.n1;
    this.persist = !opts.demo && !opts.sim;              // la démo et les simulations n'écrivent rien dans les carnets
    this.seed = (Date.now() & 0xffffff) | 1;
    this.session = Quiz.Session(opts.sub, opts.lvl, this.seed ^ 0x5bd1e995, this.persist);
    Object.assign(this, { frame: 0, mercy: 0, energy: 100, score: 0, stomps: 0, chain: 0, combo: 0, bestCombo: 0, streak: 0, wrongRow: 0,
      caught: 0, missedOrbs: 0, boost: 0, banner: null, popups: [], focus: null, tAcc: 0, stage: 0, trans: null, meters: 0,
      blasonsRun: 0, newBiomes: 0 });
    FX.reset(); Input.clear();
    this.enterBiome(0);
    this.state = 'play';
  },
  // Construit un biome neuf : nouveau monde, nouveaux morceaux, nouveaux ennemis
  enterBiome(k) {
    if (k > 0) this.meters += Math.floor(Player.x / TILE);
    this.biomeIdx = k % BIOMES.length; this.biome = BIOMES[this.biomeIdx]; this.stage = k; this.biomeRight = 0;
    Object.assign(this, { camX: 0, camY: 0, intro: 70, diff: 0, enemies: [], orbs: [], shots: [], blasons: [], sinceOrb: 0, orbEvery: 2, _spots: [], biomeCard: 200, chunkN: 0 });
    this.crumbles = new Map();
    this.firstVisit = Carnet.seeBiome(this.biome.id); if (this.firstVisit && k > 0) this.newBiomes++;
    World.reset(); Gen.reset(this.seed + k * 7919, this.biome);
    this.extend();
    Player.reset(3 * TILE, 12 * TILE - Player.h);
  },
  biomeTitle() { const lap = Math.floor(this.stage / BIOMES.length); return this.biome.name + (lap ? ' · ' + ['', 'II', 'III', 'IV', 'V'][Math.min(lap, 4)] : ''); },
  runSpeed() {
    if (this.intro > 0) return 0;
    return (this.level.speed + Math.min(1, this.diff) * this.level.ramp + Math.min(this.stage, 6) * .1) * (this.boost > 0 ? 1.3 : 1);
  },
  shoot(x, y, vx, vy, g) { this.shots.push({ x, y, vx, vy, g, w: 6, h: 6, t: 0, dead: false }); },
  crumble(cx, cy) { const k = cx + ',' + cy; if (!this.crumbles.has(k) && World.tile(cx, cy) === 'k') { this.crumbles.set(k, 26); Sound.tone(180, .05, 'triangle', .04); } },
  spawn(ch, cx, cy) {
    if (ch === 'o') Game._spots.push({ cx, cy });                         // emplacement possible d'un bonus question
    else if (ch === 'O') Game._spots.push({ cx, cy, force: true });       // emplacement « défi »
    else Game.enemies.push(makeEnemy(ch, cx, cy));
  },
  extend() { // on garde toujours deux écrans et demi d'avance
    while (World.end * TILE < this.camX + VIEW_W * 2.5) {
      const startCx = World.end; this._spots = [];
      const ch = Gen.next(this.diff); World.append(ch, this.spawn);
      if (ch === START_CHUNK) continue;
      this.chunkN++;
      let orbSpot = null;
      if (++this.sinceOrb >= this.orbEvery) {
        orbSpot = this.placeOrb(startCx, ch.w);
        if (orbSpot) this.sinceOrb = 0;                     // pas d'emplacement valable : on réessaie au morceau suivant
        const [a, b] = this.level.every; this.orbEvery = U.int(Gen.r, a, b);
      }
      const bi = BLASON_AT.indexOf(this.chunkN);
      if (bi >= 0) this.placeBlason(startCx, ch.w, bi, orbSpot);
    }
  },
  // Blason caché : on prend l'emplacement le PLUS difficile du morceau (celui que le bonus n'a pas pris)
  placeBlason(startCx, w, idx, orbSpot) {
    const below = (cx, cy) => { for (let y = cy + 1; y < ROWS; y++) if (World.solid(cx, y) || isOneWay(World.tile(cx, y))) return y; return -1; };
    const cands = this._spots.filter(s => !orbSpot || s.cx !== orbSpot.cx || s.cy !== orbSpot.cy)
      .map(s => { const g = below(s.cx, s.cy); return { ...s, hard: s.force ? 7 : g < 0 ? 5 : g - s.cy }; }).filter(s => s.cy >= 1 && s.hard <= 7);
    let s = cands.sort((a, b) => b.hard - a.hard)[0];
    if (!s) {                                               // pas d'emplacement dessiné : haut au-dessus du sol, il faut sauter fort
      for (let d = 0; d < w && !s; d++) { const cx = startCx + Math.floor(w * .5) + d - (w >> 2); for (let y = 3; y < ROWS; y++) if (World.solid(cx, y)) { if (!World.solid(cx, y - 5) && y - 5 >= 1) s = { cx, cy: y - 5 }; break; } }
    }
    if (s) this.blasons.push(makeBlason(s.cx, s.cy, idx));
  },
  onBlason(b) {
    const r = Carnet.found(this.biome.id, b.idx);
    FX.burst(b.x + 6, b.y + 7, 26, '#F3BE31', 2.6, .03, 28); FX.burst(b.x + 6, b.y + 7, 12, '#ffffff', 1.8, 0, 20); FX.hitstop(4);
    [784, 988, 1175, 1568].forEach((f, i) => setTimeout(() => Sound.tone(f, .12, 'square', .045), i * 70));
    if (r.isNew || !this.persist) { this.blasonsRun++; this.score += 500; }
    const n = Carnet.count(this.biome.id);
    if (r.skin) this.say(`3 blasons ! Nouvelle tenue : ${r.skin.name}`, '#F3BE31', 200);
    else this.say(r.isNew ? `Blason trouvé ! ${n} / 3 · ${this.biome.short}` : 'Blason déjà dans ton carnet', r.isNew ? '#F3BE31' : '#b9c3e8', 110);
  },
  // Choisit où poser le bonus : plus le niveau est haut et plus on avance, plus l'emplacement est difficile
  placeOrb(startCx, w) {
    const ground = cx => { for (let y = 0; y < ROWS; y++) if (World.solid(cx, y) || isOneWay(World.tile(cx, y))) return y; return -1; };
    const below = (cx, cy) => { for (let y = cy + 1; y < ROWS; y++) if (World.solid(cx, y) || isOneWay(World.tile(cx, y))) return y; return -1; };
    const forced = this._spots.filter(s => s.force);
    if (forced.length && Gen.r() < .75) { const s = U.pick(Gen.r, forced); this.orbs.push(makeOrb(s.cx, s.cy, 6)); return s; }
    let cands = this._spots.filter(s => !s.force).map(s => {
      const g = below(s.cx, s.cy);
      if (g >= 0) return { ...s, hard: g - s.cy };              // difficulté = hauteur à atteindre (2 : en courant, 4 : saut, 6 : double saut)
      // au-dessus d'un trou : on place le bonus au sommet d'un saut lancé depuis le bord (sinon on passe par-dessus)
      let edge = -1; for (let d = 1; d < 8 && edge < 0; d++) { const l = ground(s.cx - d); if (l > 0) edge = l; }
      return edge < 0 ? null : { cx: s.cx, cy: edge - 5, hard: 6 };
    }).filter(s => s && s.hard <= 6 && s.cy >= 1);             // trop haut même avec le double saut : écarté
    if (!cands.length) {                                       // aucun emplacement dessiné : on pose le bonus sur le sol, à portée de course
      for (let d = 0; d < w * .5 && !cands.length; d++) { const cx = startCx + Math.floor(w * .45) + d, g = ground(cx); if (g > 2 && !World.solid(cx, g - 1) && !World.solid(cx, g - 2)) cands = [{ cx, cy: g - 2, hard: 2 }]; }
      if (!cands.length) return false;
    }
    cands.sort((a, b) => a.hard - b.hard);
    const p = U.clamp(this.level.hard + this.diff * .35 + (Gen.r() - .5) * .5, 0, .999);
    const s = cands[Math.floor(p * cands.length)];
    this.orbs.push(makeOrb(s.cx, s.cy, s.hard)); return s;
  },

  update() {
    Input.poll();
    if (this.state !== 'play') return;
    if (FX.freeze > 0) { FX.freeze--; return; }      // gel d'impact
    if (this.trans) { this.updateTrans(); return; }
    if (this.focus) { this.updateFocus(); return; }
    this.simStep();
  },
  // Un pas de simulation du monde (60 par seconde ; moins pendant la descente vers l'arrêt)
  simStep() {
    this.frame++;
    if (this.intro > 0) { this.intro--; Input.clear(); }

    Player.update();
    if (Player.on) this.chain = 0;
    for (const e of this.enemies) { updateEnemy(e); hitTest(e); }
    for (const o of this.orbs) updateOrb(o);
    for (const b of this.blasons) updateBlason(b);
    for (const s of this.shots) updateShot(s);
    for (const [k, t] of this.crumbles) {                  // branches fragiles qui cassent
      if (t <= 1) { const [cx, cy] = k.split(',').map(Number); World.setTile(cx, cy, '.'); this.crumbles.delete(k); FX.burst(cx * TILE + 8, cy * TILE + 3, 8, this.biome.pal.plank, 1.2, .12, 18); }
      else this.crumbles.set(k, t - 1);
    }
    if (this.boost > 0) this.boost--;
    // le compte à rebours : l'endurance baisse en continu (un peu plus vite à chaque biome franchi)
    if (this.intro === 0 && !this.demo) this.energy -= this.level.drain * (1 + Math.min(this.stage, 6) * .12);
    if (this.demo) { this.energy = 100; if (Player.x > 16000) startDemo(); }
    if (Player.blocked === 50) this.say('Saute !  (contre un mur : saute encore pour rebondir)', '#fff4c8', 120);

    // difficulté : grandit avec la distance et à chaque biome franchi, baisse un peu après deux erreurs de suite
    this.diff = U.clamp(this.stage * RULES.stageHarder + Player.x / 20000 + this.mercy, 0, 1.2);

    this.camX = Math.max(0, Player.x - 104);
    this.camY += (U.clamp(Player.y < 36 ? Player.y - 36 : WORLD_H - VIEW_H, -40, WORLD_H - VIEW_H) - this.camY) * .1;

    this.extend();
    const left = this.camX - 160;                          // marge : le rebond contre un mur peut faire reculer
    World.trim(Math.floor(left / TILE) - 1);
    if (this.frame % 30 === 0) {
      this.enemies = this.enemies.filter(e => !e.dead && e.x > left);
      this.orbs = this.orbs.filter(o => !o.done);
      this.blasons = this.blasons.filter(b => !b.got && b.x > left);
    }
    this.shots = this.shots.filter(s => !s.dead);
    if (this.biomeCard > 0) this.biomeCard--;
    for (const p of this.popups) { p.y -= .5; p.t--; } this.popups = this.popups.filter(p => p.t > 0);
    if (this.banner && this.banner.t > 0) this.banner.t--;
    FX.update();
    if (this.energy <= 0) this.gameOver();
  },

  /* ─── Bonus question ─── */
  catchOrb(o) {
    o.done = true; this.caught++;
    FX.burst(o.x + 7, o.y + 7, 16, '#fff4c8', 2, 0, 18); FX.hitstop(3);
    const it = this.session.next(), labels = U.shuffle(Math.random, [it.a, ...it.bad]);
    const L = this.level, chars = it.q.length + labels.join('').length;
    const time = L.timer ? Math.round((L.timer + chars * L.perChar) * 60) : 0;   // un peu plus de temps pour les questions longues
    this.focus = { it, labels, correct: labels.indexOf(it.a), phase: 'in', t: 0, sel: -1, chosen: -1, lock: FOCUS.in + FOCUS.lockInput, time, timeMax: time };
    this.tAcc = 0; Input.clear(); Sound.announce();
  },
  missOrb(o) {
    o.done = true; this.missedOrbs++;
    if (this.demo) return;
    this.energy -= RULES.missed;
    this.pop('Raté…', o.x + 7, o.y - 4, '#b9c3e8'); Sound.tone(330, .12, 'triangle', .04, -120);
  },
  /* ─── Changement de biome : iris qui se ferme, nouveau monde, iris qui s'ouvre ─── */
  startTransition() { this.trans = { phase: 'out', t: 0 }; Sound.boost(); },
  updateTrans() {
    const T = this.trans; T.t++;
    if (T.phase === 'out' && T.t >= 45) {
      this.enterBiome(this.stage + 1);
      this.energy = Math.min(100, this.energy + RULES.biomeReward);
      T.phase = 'in'; T.t = 0; Sound.announce();
    } else if (T.phase === 'in' && T.t >= 40) this.trans = null;
    FX.update();
  },

  /* ─── Écran-question ─── */
  updateFocus() {
    const f = this.focus;
    f.t++; if (f.lock > 0) f.lock--;
    if (f.phase === 'in') {                       // ralenti progressif jusqu'à l'arrêt
      this.tAcc += Math.max(0, 1 - f.t / FOCUS.in);
      while (this.tAcc >= 1) { this.tAcc--; this.simStep(); }
      if (f.t >= FOCUS.in) { f.phase = 'choose'; f.t = 0; }
    } else if (f.phase === 'choose') {
      for (const c of Input.takeClicks()) for (let i = 0; i < 3; i++) if (f.lock === 0 && U.overlap({ x: c.x, y: c.y, w: 1, h: 1 }, FOCUS_BOX(i))) this.choose(i);
      if (f.phase === 'choose' && Input.hover) for (let i = 0; i < 3; i++) if (U.overlap({ x: Input.hover.x, y: Input.hover.y, w: 1, h: 1 }, FOCUS_BOX(i))) f.sel = i;
      if (f.phase === 'choose' && Input.takePress() && f.lock === 0 && f.sel >= 0) this.choose(f.sel);
      if (f.phase === 'choose' && f.timeMax && !this.demo) {
        if (--f.time <= 0) this.choose(-1);                     // temps écoulé
        else if (f.time <= 180 && f.time % 60 === 0) Sound.tone(1200, .04, 'square', .03);
      }
    } else if (f.phase === 'result') {
      // une erreur reste affichée plus longtemps (avec l'explication) ; toucher l'écran permet de repartir plus tôt
      const minT = f.chosen === f.correct ? FOCUS.resultOk : (f.it.why ? FOCUS.resultWhy : FOCUS.resultKo);
      const skip = f.t > 40 && ((Input.takeClicks().length > 0) | Input.takePress());
      if (f.t >= minT || skip) { f.phase = 'out'; f.t = 0; }
    } else if (f.phase === 'out') {               // la course repart en douceur
      this.tAcc += Math.min(1, f.t / FOCUS.out);
      while (this.tAcc >= 1) { this.tAcc--; this.simStep(); }
      if (f.t >= FOCUS.out) {
        this.focus = null; Input.clear();
        Player.grace = 40;                                  // protection INVISIBLE à la reprise (le clignotement est réservé aux coups)
        if (f.chosen === f.correct) {                       // récompense visuelle : aura dorée, étincelles, gain affiché
          Player.glow = 60; FX.burst(Player.cx, Player.cy, 22, '#F3BE31', 2.4, .04, 26); FX.burst(Player.cx, Player.cy, 10, '#ffffff', 1.6, 0, 18);
          this.pop('+' + RULES.correct + ' endurance', Player.cx, Player.y - 10, '#8ff0b8');
        }
        if (this.biomeRight >= RULES.biomeGoal && this.energy > 0) this.startTransition();   // biome terminé !
      }
    }
    FX.update();
    if (this.energy <= 0 && f.phase === 'out') { this.focus = null; this.gameOver(); }
  },
  focusKey(code) {
    const f = this.focus; if (!f || f.phase !== 'choose') return false;
    const n = { Digit1: 0, Digit2: 1, Digit3: 2, Numpad1: 0, Numpad2: 1, Numpad3: 2 }[code];
    if (n !== undefined) { if (f.lock === 0) this.choose(n); return true; }
    if (code === 'ArrowUp' || code === 'KeyW') { f.sel = f.sel <= 0 ? 2 : f.sel - 1; Sound.tone(660, .03, 'square', .03); return true; }
    if (code === 'ArrowDown' || code === 'KeyS') { f.sel = f.sel < 0 || f.sel === 2 ? 0 : f.sel + 1; Sound.tone(660, .03, 'square', .03); return true; }
    if (code === 'Enter' && f.lock === 0 && f.sel >= 0) { this.choose(f.sel); return true; }
    return false;
  },
  choose(i) {
    const f = this.focus; if (!f || f.phase !== 'choose') return;
    f.chosen = i; f.sel = i; f.phase = 'result'; f.t = 0;
    const ok = i === f.correct;
    this.session.result(f.it, ok);
    if (ok) {
      this.combo++; this.streak++; this.wrongRow = 0; this.bestCombo = Math.max(this.bestCombo, this.combo); this.biomeRight++;
      this.energy = Math.min(100, this.energy + RULES.correct);
      f.pts = 100 * Math.min(this.combo, 5); this.score += f.pts;
      Sound.good();
      if (this.streak % RULES.invincibleEvery === 0) { this.boost = RULES.invincibleTime; f.mega = true; Sound.boost(); }
    } else {
      this.combo = 0; this.streak = 0; this.wrongRow++;
      if (this.wrongRow >= 2) this.mercy = Math.max(-.25, this.mercy - .08);
      this.energy -= RULES.wrong; f.timeout = i < 0;
      Sound.bad(); FX.shake(3, 10);
    }
  },

  say(text, color, t) { this.banner = { text, color, t }; },
  pop(text, x, y, color = '#fff') { this.popups.push({ text, x, y, color, t: 40 }); },

  hurt(dmg, e) {
    const p = Player; if (p.inv > 0 || p.grace > 0 || this.boost > 0) return;
    this.energy -= dmg; p.inv = 70; p.vy = -3.5; p.jumps = 1;
    FX.shake(4, 12); FX.hitstop(4); Sound.hurt(); this.pop('Aïe !', p.cx, p.y - 6, '#ffb0b0');
  },
  pitFall() {
    // on réapparaît APRÈS le trou : la chute coûte de l'endurance, pas une série d'échecs au même endroit
    const p = Player; this.energy -= RULES.pit;
    const top = cx => { for (let y = 2; y < ROWS; y++) if (World.solid(cx, y)) return (World.tile(cx, y - 1) === '.' && !World.solid(cx, y - 2)) ? y : -1; return -1; };
    let cx = Math.max(Math.floor(p.x / TILE), Math.floor(p.safe.x / TILE)) + 1, row = -1;
    for (; cx < World.end - 2; cx++) { const t = top(cx); if (t > 0 && top(cx + 1) === t && top(cx + 2) === t) { row = t; break; } }
    if (row < 0) { cx = Math.floor(p.safe.x / TILE); row = Math.floor((p.safe.y + p.h) / TILE); }
    p.x = cx * TILE + 2; p.y = row * TILE - p.h - 2; p.vy = 0; p.vx = 0; p.inv = 90; p.on = false;
    FX.burst(p.cx, p.cy, 14, '#8fd4ff', 1.6, 0, 20);
    FX.shake(5, 14); Sound.hurt(); this.pop('Oups !  −' + RULES.pit, p.cx, p.y - 6, '#ffb0b0');
  },
  killEnemy(e, how) {
    e.dead = true; this.stomps++; this.chain++;
    const pts = 50 * this.chain; this.score += pts;
    if (how === 'stomp') this.energy = Math.min(100, this.energy + RULES.stomp);
    FX.burst(e.x + e.w / 2, e.y + e.h / 2, 12, how === 'SMASH' ? '#F3BE31' : '#ffffff', 1.8, .08, 20);
    FX.hitstop(3); FX.shake(2, 6); Sound.stomp();
    this.pop((this.chain > 1 ? `+${pts} × ${this.chain}` : '+' + pts) + (how === 'stomp' ? '  ♥' : ''), e.x + e.w / 2, e.y - 4, '#fff4c8');
  },

  gameOver() {
    if (this.state !== 'play') return;
    this.state = 'over'; Sound.over();
    this.meters += Math.floor(Player.x / TILE);
    Carnet.endRun(this.stage);
    this.score += this.meters + this.stage * 1000;       // chaque biome franchi vaut 1000 points
    UI.showOver();
  },
  togglePause() {
    if (this.demo) return;
    if (this.state === 'play') { this.state = 'pause'; UI.show('pause'); }
    else if (this.state === 'pause') { this.state = 'play'; UI.hideAll(); Input.clear(); }
  },
};

/* ─── Sauvegarde (meilleurs scores, sur cet ordinateur) ─── */
const Save = {
  key: 'rtl-moteur-v2',
  load() { try { return JSON.parse(localStorage.getItem(this.key)) || {}; } catch (e) { return {}; } },
  best(id, score) { const d = this.load(), old = d[id] || 0; if (score > old) { d[id] = score; try { localStorage.setItem(this.key, JSON.stringify(d)); } catch (e) { } } return old; },
};

/* ─── Menus ─── */
const UI = {
  sel: { sub: 'math', lvl: 1, level: 'n1' },
  $: id => document.getElementById(id),
  hideAll() { document.querySelectorAll('.panel').forEach(p => p.hidden = true); },
  show(id) { this.hideAll(); this.$(id).hidden = false; const b = this.$(id).querySelector('button'); if (b) b.focus(); },
  init() {
    const subs = this.$('subjects');
    for (const [k, s] of Object.entries(Quiz.SUBJECTS)) {
      const b = document.createElement('button'); b.textContent = s.label; b.className = 'big';
      b.onclick = () => { this.sel.sub = k; this.levels(); }; subs.appendChild(b);
    }
    const modes = this.$('modes');
    for (const [k, m] of Object.entries(LEVELS)) {
      const b = document.createElement('button'); b.className = 'big'; b.innerHTML = `${m.label}<small>${m.hint}</small>`;
      b.onclick = () => { this.sel.level = k; Sound.unlock(); this.hideAll(); Game.start({ ...this.sel }); }; modes.appendChild(b);
    }
    document.querySelectorAll('[data-go]').forEach(b => b.onclick = () => this.show(b.dataset.go));
    this.$('btn-resume').onclick = () => Game.togglePause();
    this.$('btn-pause').onclick = () => Game.togglePause();
    this.$('btn-pause').addEventListener('pointerdown', e => e.stopPropagation());
    this.$('btn-quit').onclick = () => { startDemo(); this.show('title'); };
    this.$('btn-again').onclick = () => { this.hideAll(); Game.start({ ...this.sel }); };
    this.$('btn-menu').onclick = () => { startDemo(); this.show('title'); };
    this.$('btn-carnet').onclick = () => this.carnet();
    this.show('title');
  },
  stars(n) { return '<span class="stars" aria-label="' + n + ' étoile' + (n > 1 ? 's' : '') + ' sur 3">' + '★'.repeat(n) + '<i>' + '★'.repeat(3 - n) + '</i></span>'; },
  levels() {
    const s = Quiz.SUBJECTS[this.sel.sub], box = this.$('level-list'); box.innerHTML = '';
    this.$('level-title').textContent = s.label;
    s.levels.forEach((l, i) => {
      const b = document.createElement('button'), m = Memory.mastery(this.sel.sub, i + 1);
      b.className = Quiz.isMix(this.sel.sub, i + 1) ? 'mix' : '';
      b.innerHTML = `${esc(l)}${this.stars(Memory.stars(this.sel.sub, i + 1))}<small>${m.seen ? Math.round(m.pct * 100) + ' % maîtrisé' : 'jamais joué'}${Quiz.isMix(this.sel.sub, i + 1) ? ' · révision de toute la matière' : ''}</small>`;
      b.onclick = () => { this.sel.lvl = i + 1; this.show('mode'); }; box.appendChild(b);
    });
    this.show('levels');
  },
  // Carnet d'explorateur : biomes, blasons, tenues, maîtrise
  carnet() {
    const bx = this.$('carnet-biomes'); bx.innerHTML = '';
    BIOMES.forEach(b => {
      const c = Carnet.data.biomes[b.id], seen = c && c.seen, d = document.createElement('div'); d.className = 'biome' + (seen ? '' : ' locked');
      d.innerHTML = seen ? `<b>${esc(b.name)}</b><span class="shields">${[0, 1, 2].map(i => `<i class="${Carnet.has(b.id, i) ? 'on' : ''}"></i>`).join('')}</span><small>${Carnet.count(b.id)} / 3 blasons</small>`
                         : `<b>???</b><small>Réussis 8 questions dans le biome précédent pour le découvrir</small>`;
      bx.appendChild(d);
    });
    const soon = document.createElement('div'); soon.className = 'biome locked'; soon.innerHTML = '<b>D’autres mondes…</b><small>Ils arrivent bientôt</small>'; bx.appendChild(soon);
    const sx = this.$('carnet-skins'); sx.innerHTML = '';
    SKINS.forEach(s => {
      const ok = Carnet.unlocked(s), b = document.createElement('button'); b.className = 'skin' + (Carnet.skin().id === s.id ? ' on' : '');
      b.disabled = !ok; b.innerHTML = `<span class="swatch" style="background:${s.body};border-color:${s.trim}"></span>${esc(s.name)}<small>${ok ? (Carnet.skin().id === s.id ? 'Portée' : 'Porter') : esc(s.hint)}</small>`;
      b.onclick = () => { Carnet.data.skin = s.id; try { localStorage.setItem(Carnet.KEY, JSON.stringify(Carnet.data)); } catch (e) { } this.carnet(); };
      sx.appendChild(b);
    });
    const mx = this.$('carnet-mastery'); let rows = '';
    for (const [k, s] of Object.entries(Quiz.SUBJECTS)) s.levels.forEach((l, i) => { const m = Memory.mastery(k, i + 1); if (m.seen && !Quiz.isMix(k, i + 1)) rows += `<div class="miss"><span>${esc(s.label)} · ${esc(l)}</span><b>${this.stars(Memory.stars(k, i + 1))} ${Math.round(m.pct * 100)} %</b></div>`; });
    mx.innerHTML = `<h3>Ce que tu as retenu · ${Memory.totalOwned()} question${Memory.totalOwned() > 1 ? 's' : ''} pour de bon</h3>` + (rows || '<p class="sub">Joue une partie : chaque question réussie entre dans ton carnet de mémoire.</p>');
    this.show('carnet');
  },
  showOver() {
    const G = Game, S = G.session, id = `${G.opts.sub}:${G.opts.lvl}:${G.opts.level}`, old = Save.best(id, G.score);
    this.$('over-stats').innerHTML = `
      <div><b>${G.score}</b>points</div><div><b>${G.stage + 1}</b>biome${G.stage ? 's' : ''} · ${esc(G.biome.short)}</div><div><b>${G.meters}</b>mètres</div>
      <div><b>${S.right} / ${S.asked}</b>bonnes réponses</div><div><b>${G.caught} / ${G.caught + G.missedOrbs}</b>bonus attrapés</div>
      <div><b>${G.blasonsRun}</b>blason${G.blasonsRun > 1 ? 's' : ''} trouvé${G.blasonsRun > 1 ? 's' : ''}</div>`;
    const notes = [];
    if (G.score > old) notes.push(old ? `Nouveau record ! (ancien : ${old})` : 'Premier record enregistré !'); else notes.push(`Record à battre : ${old}`);
    if (G.newBiomes) notes.push(`Nouveau biome découvert !`);
    if (S.learned) notes.push(`${S.learned} question${S.learned > 1 ? 's' : ''} retenue${S.learned > 1 ? 's' : ''} pour de bon`);
    if (S.reviewed) notes.push(`${S.reviewed} révision${S.reviewed > 1 ? 's' : ''} d’anciennes questions`);
    this.$('over-best').textContent = notes.join(' · ');
    const m = this.$('over-missed');
    m.innerHTML = S.missed.length ? '<h3>À revoir · elles reviendront dans ta prochaine partie</h3>' + S.missed.map(x => `<div class="miss"><span>${esc(x.q)}${x.why ? `<em>${esc(x.why)}</em>` : ''}</span><b>${esc(x.a)}</b></div>`).join('') : (S.asked ? '<h3>Aucune erreur, bravo !</h3>' : '');
    this.show('over');
  },
};
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ─── Démarrage ─── */
function boot() {
  const cv = document.getElementById('game');
  Render.init(cv); Input.init(cv); UI.init();
  Input.onKey = code => {
    if (Game.state === 'play' && !Game.demo && Game.focusKey(code)) return;
    if (code === 'Escape' || code === 'KeyP') Game.togglePause();
    else if (code === 'KeyH') Render.debug = !Render.debug;
    else if (code === 'KeyM') Sound.muted = !Sound.muted;
  };
  startDemo();   // derrière le menu : le pilote automatique joue une partie de démonstration
  Loop.start(() => { if (Game.demo) Autopilot.step(); Game.update(); }, () => {
    Render.frame();
    document.body.classList.toggle('playing', Game.state === 'play' && !Game.demo);   // affiche le bouton pause
  });
  // captures d'écran pour les aperçus : #apercu, #apercu-course, #apercu-course-foret, #apercu-transition
  const hash = location.hash.slice(1), foret = hash.endsWith('-foret'), shot = hash.replace('-foret', '');
  if (shot === 'apercu-transition') {
    UI.hideAll(); Game.start({ sub: 'math', lvl: 6, level: 'n2' }); Game.intro = 0;
    for (let i = 0; i < 200; i++) Game.update();
    Game.startTransition(); for (let i = 0; i < 70; i++) Game.update();   // iris rouvert à moitié sur la forêt
    Game.biomeCard = 150; Game.trans = null; FX.freeze = 1e9;
  }
  if (shot === 'apercu' || shot === 'apercu-course') {
    UI.hideAll(); Game.start({ sub: 'math', lvl: 6, level: 'n2' }); if (foret) Game.enterBiome(1); Autopilot.reset(1);
    for (let i = 0; i < 8000; i++) {
      if (shot === 'apercu' && Game.focus && Game.focus.phase === 'choose' && Game.frame > 900) { Game.focus.sel = 1; Game.focus.lock = 1e9; Game.focus.time = Math.round(Game.focus.timeMax * .6); FX.freeze = 1e9; break; }
      if (shot === 'apercu-course' && !Game.focus && Game.frame > 900 && Game.orbs.some(o => !o.done && o.x - Player.x < 150 && o.x > Player.x + 40)) { FX.freeze = 1e9; break; }
      Autopilot.step(); Game.update();
    }
    Autopilot.step = () => { };
  }
  const err = Quiz.selfTest(); if (err.length) console.warn('Questions à corriger :', err); else console.log('Questions : autotest OK');
}
function startDemo() { Game.start({ sub: 'math', lvl: 6, level: 'n2', demo: true }); Autopilot.reset(.8); }
boot();
