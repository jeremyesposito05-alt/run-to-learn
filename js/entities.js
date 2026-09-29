'use strict';
/* ══════════════════════════════════════════════════════════════════════════
   Entités : le joueur, les ennemis et obstacles vivants, les projectiles, les bonus.
   Tous les réglages de sensation de jeu sont regroupés dans FEEL.
   ══════════════════════════════════════════════════════════════════════════ */
const FEEL = {
  jump: -5.9,        // vitesse de départ du saut
  djump: -5.0,       // double saut
  wallJump: -6.2,    // rebond contre un mur (à la Super Meat Boy)
  wallSlide: 1.4,    // vitesse de glissade maximale le long d'un mur
  gravHold: .25,     // gravité quand on MAINTIENT le saut en montant (saut long)
  grav: .46,         // gravité normale (saut court si on relâche tôt)
  maxFall: 6.5, fastFall: 9,
  coyote: 6,         // images pendant lesquelles on peut encore sauter après avoir quitté le bord
  buffer: 8,         // images pendant lesquelles un appui trop précoce est mémorisé
  stompBounce: -4.6, stompBounceHeld: -6.4,
  trampoline: -7.8, trampolineHeld: -9.2,
  accel: .12, iceAccel: .03, iceSpeed: 1.25,
};

const Player = {
  x: 0, y: 0, w: 12, h: 26, vx: 0, vy: 0, on: false, coyote: 0, buf: 0, jumps: 0, inv: 0,
  prevBottom: 0, anim: 0, squash: 0, safe: { x: 0, y: 0 }, dbl: 0, dir: 1, wallT: 0, wallSide: 0, blocked: 0,
  reset(x, y) {
    Object.assign(this, { x, y, vx: 0, vy: 0, on: false, coyote: 0, buf: 0, jumps: 0, inv: 0, anim: 0, squash: 0, dbl: 0, drop: 0, grace: 0, glow: 0, dir: 1, wallT: 0, wallSide: 0, blocked: 0 });
    this.safe = { x, y };
  },
  get cx() { return this.x + this.w / 2; },
  get cy() { return this.y + this.h / 2; },
  under() { return World.tile(Math.floor(this.cx / TILE), Math.floor((this.y + this.h + 1) / TILE)); },
  update() {
    // ── Course automatique (plus rapide et moins de prise sur la glace) ──
    const ice = this.on && this.under() === 'i';
    const target = Game.runSpeed() * this.dir * (ice ? FEEL.iceSpeed : 1);
    this.vx += (target - this.vx) * (ice ? FEEL.iceAccel : FEEL.accel);

    // ── Saut : tampon + coyote + saut contre un mur + double saut ──
    const press = Input.takePress();
    if (press) this.buf = FEEL.buffer;
    if (this.buf > 0) {
      if (this.on || this.coyote > 0) {
        this.vy = FEEL.jump; this.on = false; this.coyote = 0; this.jumps = 1; this.buf = 0; this.squash = -1;
        Sound.jump(); FX.burst(this.cx, this.y + this.h, 4, '#e8ecff', .8, .02, 12);
      } else if (this.wallT > 0) {                       // rebond contre le mur : on repart dans l'autre sens
        this.dir = -this.wallSide; this.vx = this.dir * Math.max(2.2, Game.runSpeed());
        this.vy = FEEL.wallJump; this.jumps = 1; this.buf = 0; this.wallT = 0; this.squash = -1;
        Sound.jump(); FX.burst(this.wallSide > 0 ? this.x + this.w : this.x, this.cy, 6, '#ffffff', 1.2, 0, 12);
      } else if (press && this.jumps < 2) {
        this.vy = FEEL.djump; this.jumps = 2; this.buf = 0; this.dbl = 16;
        Sound.djump(); FX.burst(this.cx, this.y + this.h, 8, '#8fd4ff', 1.4, 0, 14);
      } else this.buf--;
    }

    // ── Gravité variable : maintenir = sauter plus haut ; flèche bas = descente rapide ──
    let g = this.vy < 0 && Input.held ? FEEL.gravHold : FEEL.grav;
    if (Input.down && !this.on) g *= 2;
    this.vy = Math.min(this.vy + g, Input.down ? FEEL.fastFall : FEEL.maxFall);
    if (this.wallT > 0 && this.vy > FEEL.wallSlide && !Input.down) this.vy = FEEL.wallSlide;   // glissade le long du mur

    // ↓ sur une plateforme traversable : on passe à travers
    if (Input.down && this.on && isOneWay(this.under())) { this.drop = 10; this.on = false; }
    if (this.drop > 0) this.drop--;

    const wasOn = this.on, vyBefore = this.vy;
    this.prevBottom = this.y + this.h;
    const res = moveBox(this, this.vx, this.vy, !(this.drop > 0));
    // marche d'une seule case : on la monte tout seul (sinon un enfant reste coincé contre le rebord)
    if (res.wall && wasOn && this.vx >= 0) {
      const cx = Math.floor((this.x + this.w + 1) / TILE), fr = Math.floor((this.y + this.h - 1) / TILE);
      if (World.solid(cx, fr) && !World.solid(cx, fr - 1) && !World.solid(cx, fr - 2) &&
          !World.solid(Math.floor(this.x / TILE), fr - 2)) { this.y = fr * TILE - this.h; this.x += 1; res.wall = false; res.landed = true; }
    }
    this.on = res.landed;
    if (res.landed) {
      if (!wasOn && vyBefore > 2.5) { this.squash = 1; Sound.land(); FX.burst(this.cx, this.y + this.h, 5, '#f4f6ff', .9, .03, 14); }
      this.vy = 0; this.jumps = 0; this.coyote = 0; this.dir = 1; this.wallT = 0;
      if (groundAt(this.x + 1, this.y + this.h) && groundAt(this.x + this.w - 1, this.y + this.h)) { this.safe.x = this.x; this.safe.y = this.y; }
      const t = this.under();
      if (t === 't') {                                     // champignon-trampoline
        this.vy = Input.held ? FEEL.trampolineHeld : FEEL.trampoline; this.on = false; this.jumps = 1; this.squash = -1;
        Sound.tone(260, .16, 'square', .05, 500); FX.burst(this.cx, this.y + this.h, 8, '#ffd0e0', 1.4, .05, 14);
      } else if (t === 'k') {                              // branche fragile : elle va casser
        for (let cx = Math.floor(this.x / TILE); cx <= Math.floor((this.x + this.w - 1) / TILE); cx++) Game.crumble(cx, Math.floor((this.y + this.h + 1) / TILE));
      }
    } else if (wasOn && this.jumps === 0) this.coyote = FEEL.coyote;
    else if (this.coyote > 0) this.coyote--;
    if (res.bumped) this.vy = .5;
    // contact avec un GRAND mur en l'air (≥ 4 cases, comme dans les cheminées) : glissade et rebond au prochain appui.
    // Les bords de trous et les petits murs ne comptent pas : là, on garde le double saut et le rattrapage après une chute.
    let tall = 0;
    if (res.wall && !this.on) { const wx = Math.floor((this.dir > 0 ? this.x + this.w + 1 : this.x - 1) / TILE); for (let r = Math.floor((this.y + this.h - 1) / TILE); r >= 0 && World.solid(wx, r); r--) tall++; }
    if (tall >= 4) { this.wallT = 6; this.wallSide = this.dir; }
    else if (this.wallT > 0) this.wallT--;
    if (res.wall) this.vx = 0;
    this.blocked = res.wall && this.on ? this.blocked + 1 : 0;   // coincé au sol contre un mur (sert à l'aide « Saute ! »)

    // ── Pics ──
    const cy = Math.floor((this.y + this.h - 4) / TILE);
    for (let cx = Math.floor((this.x + 2) / TILE); cx <= Math.floor((this.x + this.w - 3) / TILE); cx++)
      if (World.tile(cx, cy) === '^') { Game.hurt(RULES.spikes); break; }

    if (this.inv > 0) this.inv--;
    if (this.grace > 0) this.grace--;
    if (this.glow > 0) this.glow--;
    if (this.dbl > 0) this.dbl--;
    this.squash *= .8;
    if (this.on) this.anim += Math.abs(this.vx) * .09;
    if (this.y > WORLD_H + 48) Game.pitFall();
  },
};

/* ─── Ennemis et obstacles vivants ───
   La physique dépend de la lettre ; le nom, la couleur et les particularités viennent du biome. */
const ENEMY_BASE = {
  e: { w: 14, h: 12, speed: .55, stomp: true },     // marcheur
  s: { w: 14, h: 12, speed: .4, stomp: false },     // à pointes : on ne l'écrase pas
  h: { w: 14, h: 14, stomp: true },                 // sauteur
  f: { w: 14, h: 12, speed: .35, stomp: true },     // volant
  d: { w: 16, h: 12, stomp: true },                 // plongeur
  a: { w: 14, h: 14, stomp: true },                 // lanceur
  b: { w: 16, h: 16, stomp: false },                // boule qui roule (on rebondit dessus)
  v: { w: 10, h: 14, stomp: false },                // stalactite
};
function makeEnemy(ch, cx, cy) {
  const d = { ...ENEMY_BASE[ch], ...(Game.biome.enemies[ch] || {}) }, bottom = (cy + 1) * TILE;
  const air = ch === 'f' || ch === 'd';
  return { ch, ...d, x: cx * TILE + (ch === 'v' ? 3 : 1), y: air ? cy * TILE + 2 : ch === 'v' ? cy * TILE : bottom - d.h, baseY: cy * TILE + 2,
    vy: 0, on: false, dir: -1, t: 0, wait: 40 + (cx % 3) * 20, dead: false, squash: 0, state: 'idle', st: 0 };
}
function updateEnemy(e) {
  if (e.x > Game.camX + VIEW_W + 40) return;          // endormi tant qu'il n'est pas à l'écran
  e.t++;
  const P = Player;
  if (e.ch === 'e' || e.ch === 's') {
    let sp = e.speed;
    if (e.charge && e.x - P.x > 0 && e.x - P.x < 130 && Math.abs(e.y - P.y - P.h + e.h) < 24) { e.dir = -1; sp = 1.9; e.state = 'charge'; } else e.state = 'idle';
    const ahead = e.dir < 0 ? e.x - 1 : e.x + e.w + 1;
    if (e.on && !groundAt(ahead, e.y + e.h) && e.state !== 'charge') e.dir *= -1;  // fait demi-tour au bord
    e.vy = Math.min(e.vy + .4, 6);
    const r = moveBox(e, e.dir * sp, e.vy); e.on = r.landed; if (r.landed) e.vy = 0; if (r.wall) e.dir *= -1;
  } else if (e.ch === 'h') {
    e.vy = Math.min(e.vy + .32, 6);
    if (e.on && --e.wait <= 0) { e.vy = -5.4; e.on = false; e.wait = 70; e.squash = -1; }
    const r = moveBox(e, e.on ? 0 : -.5, e.vy);
    if (r.landed && !e.on) e.squash = 1;
    e.on = r.landed; if (r.landed) e.vy = 0;
  } else if (e.ch === 'f') {
    e.x -= e.speed; e.y = e.baseY + Math.sin(e.t * .05) * 14;
  } else if (e.ch === 'd') {                          // plane, puis pique quand le joueur passe dessous
    if (e.state === 'idle') { e.y = e.baseY + Math.sin(e.t * .06) * 4; if (e.st > 0) e.st--; else if (P.cx > e.x - 70 && P.cx < e.x + 10 && P.y > e.y) { e.state = 'dive'; Sound.tone(900, .2, 'sawtooth', .025, -500); } }
    else if (e.state === 'dive') { e.y += 3.4; e.x -= .9; if (e.y > e.baseY + 96 || World.solid(Math.floor((e.x + 8) / TILE), Math.floor((e.y + e.h) / TILE))) e.state = 'rise'; }
    else { e.y -= 1.3; if (e.y <= e.baseY) { e.y = e.baseY; e.state = 'idle'; e.st = 90; } }
  } else if (e.ch === 'a') {                          // lance un projectile en cloche vers le joueur
    e.vy = Math.min(e.vy + .4, 6); const r = moveBox(e, 0, e.vy); e.on = r.landed; if (r.landed) e.vy = 0;
    if (++e.st >= 100 && P.x < e.x && e.x - P.x < 300) { e.st = 0; e.squash = -1; Game.shoot(e.x, e.y + 2, -2.3, -3.4, .14); }
  } else if (e.ch === 'b') {                          // roule vers le joueur, tombe dans les trous, se brise contre un mur
    e.vy = Math.min(e.vy + .4, 7);
    const r = moveBox(e, -1.7, e.vy); if (r.landed) e.vy = 0;
    if (r.wall) { e.dead = true; FX.burst(e.x + 8, e.y + 8, 12, e.color, 1.6, .1, 18); }
  } else if (e.ch === 'v') {                          // stalactite : tremble, tombe, reste plantée puis disparaît
    if (e.state === 'idle' && P.cx > e.x - 115 && P.cx < e.x + 10) { e.state = 'shake'; e.st = 18; }
    else if (e.state === 'shake' && --e.st <= 0) e.state = 'fall';
    else if (e.state === 'fall') {
      e.vy = Math.min(e.vy + .35, 8); e.y += e.vy;
      if (World.solid(Math.floor((e.x + 5) / TILE), Math.floor((e.y + e.h) / TILE))) { e.y = Math.floor((e.y + e.h) / TILE) * TILE - e.h + 4; e.state = 'stuck'; e.st = 150; Sound.tone(1400, .08, 'triangle', .04); FX.burst(e.x + 5, e.y + e.h, 8, e.color, 1.2, .08, 14); }
    } else if (e.state === 'stuck' && --e.st <= 0) e.dead = true;
  }
  e.squash *= .8;
  if (e.y > WORLD_H + 40) e.dead = true;
}
function hitTest(e) {
  const p = Player;
  if (e.dead || !U.overlap(p, e)) return;
  if (e.ch === 'v' && e.state === 'idle') return;      // encore accrochée au plafond
  if (Game.boost > 0) { Game.killEnemy(e, 'SMASH'); p.vy = Math.min(p.vy, -2); return; }
  const fromAbove = p.vy > 0 && p.prevBottom <= e.y + 6;
  if (e.ch === 'b' && fromAbove) {                      // on rebondit sur la boule sans la casser
    p.y = e.y - p.h; p.vy = Input.held ? FEEL.stompBounceHeld : FEEL.stompBounce; p.jumps = 1; p.squash = -1; Sound.tone(300, .08, 'square', .04, 200);
  } else if (e.stomp && fromAbove) {
    Game.killEnemy(e, 'stomp');
    // rebond + double saut rechargé (jumps = 1 : il reste un saut en l'air)
    p.y = e.y - p.h; p.vy = Input.held ? FEEL.stompBounceHeld : FEEL.stompBounce; p.jumps = 1; p.squash = -1; p.dbl = 10;
  } else Game.hurt(RULES.hit, e);
}

/* ─── Projectiles (glands, boules…) ─── */
function updateShot(s) {
  s.x += s.vx; s.y += s.vy; s.vy += s.g; s.t++;
  if (World.solid(Math.floor((s.x + 3) / TILE), Math.floor((s.y + 3) / TILE)) || s.y > WORLD_H + 20) { s.dead = true; FX.burst(s.x + 3, s.y + 3, 5, '#c89050', 1, .08, 10); return; }
  if (U.overlap(Player, s)) { s.dead = true; if (Game.boost > 0) FX.burst(s.x, s.y, 6, '#F3BE31', 1.4, 0, 12); else Game.hurt(RULES.shot); }
}

/* ─── Bonus question ─── */
function makeOrb(cx, cy, hard) { return { x: cx * TILE + 1, y: cy * TILE + 1, w: 14, h: 14, hard, done: false, ph: (cx * 7 + cy) % 40 }; }
function updateOrb(o) {
  if (o.done) return;
  const hit = { x: o.x - 2, y: o.y - 2, w: o.w + 4, h: o.h + 4 };   // un peu plus large que le dessin : attraper doit rester juste
  if (U.overlap(Player, hit)) Game.catchOrb(o);
  else if (o.x + o.w < Player.x - 6 && Player.dir > 0) Game.missOrb(o);   // passé derrière le joueur : manqué
}

/* ─── Blasons cachés (3 par biome, placés aux endroits les plus difficiles) ─── */
function makeBlason(cx, cy, idx) { return { x: cx * TILE + 2, y: cy * TILE + 1, w: 12, h: 14, idx, got: false, known: Carnet.has(Game.biome.id, idx) }; }
function updateBlason(b) {
  if (b.got) return;
  if (U.overlap(Player, { x: b.x - 2, y: b.y - 2, w: b.w + 4, h: b.h + 4 })) { b.got = true; Game.onBlason(b); }
}
