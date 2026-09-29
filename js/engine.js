'use strict';
/* ══════════════════════════════════════════════════════════════════════════
   Run to Learn — moteur, couche 1 : constantes, outils, entrées, boucle, effets.
   Aucune dépendance. Fonctionne en ouvrant index.html par double-clic.
   ══════════════════════════════════════════════════════════════════════════ */
// résolution interne (agrandie sans lissage) : 216 px de haut ; la largeur s'adapte à l'écran (384 en 16:9, jusqu'à 468 sur un iPhone)
let VIEW_W = 384; const VIEW_H = 216;
const TILE = 16, ROWS = 14;             // une case = 16 px ; le monde fait 14 cases de haut
const WORLD_H = ROWS * TILE;
const STEP = 1000 / 60;                 // la logique tourne à 60 Hz fixes, quel que soit l'écran

const U = {
  clamp: (v, a, b) => v < a ? a : v > b ? b : v,
  lerp: (a, b, t) => a + (b - a) * t,
  // générateur pseudo-aléatoire à graine (xorshift) : une partie est rejouable à l'identique
  rng(seed) { let s = (seed >>> 0) || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; },
  pick: (r, a) => a[Math.floor(r() * a.length)],
  int: (r, a, b) => a + Math.floor(r() * (b - a + 1)),
  shuffle(r, a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; },
  overlap: (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y,
};

/* ─── Entrées : clavier, souris / tactile, manette ─────────────────────── */
const Input = {
  keyHeld: false, pointerHeld: false, padHeld: false, padDown: false, keyDown: false,
  presses: 0,           // appuis de saut non encore consommés par la logique
  clicks: [],           // clics / touchers, en coordonnées 384×216 (pour choisir une réponse)
  hover: null,          // position de la souris, en coordonnées 384×216
  onKey: null,          // rappel pour toutes les touches (menus, pause, choix 1-2-3…)
  _padPrev: false, _padStartPrev: false, _padUp: false, _padDn: false,
  init(target) {
    const JUMP = ['Space', 'ArrowUp', 'KeyW', 'KeyZ'];
    const toLow = e => { const r = target.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * VIEW_W, y: (e.clientY - r.top) / r.height * VIEW_H }; };
    const typing = e => e.target && /^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName);   // on tape son prénom : le jeu n'écoute pas
    addEventListener('keydown', e => {
      if (typing(e)) return;
      if (JUMP.includes(e.code)) { e.preventDefault(); if (!e.repeat) { this.presses++; } this.keyHeld = true; }
      else if (e.code === 'ArrowDown' || e.code === 'KeyS') { e.preventDefault(); this.keyDown = true; }
      if (!e.repeat && this.onKey) this.onKey(e.code);
    });
    target.addEventListener('pointermove', e => { if (e.pointerType === 'mouse') this.hover = toLow(e); });
    target.addEventListener('pointerleave', () => this.hover = null);
    target.addEventListener('pointerdown', e => this.clicks.push(toLow(e)));
    // iPhone : deux touchers rapprochés déclenchaient la sélection de texte, la loupe et le menu copier-coller.
    // On les bloque sur la zone de jeu (les boutons des menus restent normaux).
    const stop = e => { if (!(e.target.closest && e.target.closest('button'))) e.preventDefault(); };
    target.addEventListener('touchstart', stop, { passive: false });
    target.addEventListener('touchend', stop, { passive: false });
    addEventListener('dblclick', e => e.preventDefault());
    addEventListener('selectstart', e => { if (!(e.target.closest && e.target.closest('input,select,textarea'))) e.preventDefault(); });
    addEventListener('contextmenu', e => e.preventDefault());
    addEventListener('gesturestart', e => e.preventDefault());
    addEventListener('keyup', e => {
      if (typing(e)) return;
      if (JUMP.includes(e.code)) this.keyHeld = false;
      else if (e.code === 'ArrowDown' || e.code === 'KeyS') this.keyDown = false;
    });
    target.addEventListener('pointerdown', e => { e.preventDefault(); this.presses++; this.pointerHeld = true; Sound.unlock(); });
    addEventListener('pointerup', () => this.pointerHeld = false);
    addEventListener('pointercancel', () => this.pointerHeld = false);
    addEventListener('blur', () => { this.keyHeld = this.pointerHeld = this.keyDown = false; });
  },
  poll() { // la manette ne génère pas d'événements : on la lit à chaque pas
    const gp = navigator.getGamepads ? navigator.getGamepads()[0] : null;
    if (!gp) { this.padHeld = this.padDown = false; return; }
    const b = !!(gp.buttons[0]?.pressed || gp.buttons[1]?.pressed);
    if (b && !this._padPrev) this.presses++;
    this._padPrev = this.padHeld = b;
    this.padDown = (gp.axes[1] || 0) > .5 || !!gp.buttons[13]?.pressed;
    const st = !!gp.buttons[9]?.pressed;
    if (st && !this._padStartPrev && this.onKey) this.onKey('Escape');
    this._padStartPrev = st;
    const up = !!gp.buttons[12]?.pressed || (gp.axes[1] || 0) < -.5, dn = !!gp.buttons[13]?.pressed || (gp.axes[1] || 0) > .5;
    if (up && !this._padUp && this.onKey) this.onKey('ArrowUp');
    if (dn && !this._padDn && this.onKey) this.onKey('ArrowDown');
    this._padUp = up; this._padDn = dn;
  },
  takeClicks() { const c = this.clicks; this.clicks = []; return c; },
  get held() { return this.keyHeld || this.pointerHeld || this.padHeld; },
  get down() { return this.keyDown || this.padDown; },
  takePress() { const p = this.presses > 0; this.presses = 0; return p; },
  clear() { this.presses = 0; this.clicks = []; },
};

/* ─── Boucle : pas fixe + accumulateur ───────────────────────────────────── */
const Loop = {
  acc: 0, last: 0, fps: 60, _fc: 0, _ft: 0,
  start(update, render) {
    const frame = t => {
      if (!this.last) this.last = t;
      const dt = Math.min(250, t - this.last); this.last = t;   // onglet en arrière-plan : pas de rattrapage infini
      this.acc += dt; this._fc++; this._ft += dt;
      if (this._ft >= 500) { this.fps = Math.round(this._fc * 1000 / this._ft); this._fc = 0; this._ft = 0; }
      let n = 0;
      while (this.acc >= STEP && n < 5) { update(); this.acc -= STEP; n++; }
      if (n === 5) this.acc = 0;
      render();
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  },
};

/* ─── Effets : tremblement, gel d'impact, particules (réserve recyclée) ───── */
const FX = {
  shakeT: 0, shakeMag: 0, sx: 0, sy: 0, freeze: 0,
  parts: [], pool: [],
  shake(mag, t = 10) { if (mag >= this.shakeMag || this.shakeT <= 0) { this.shakeMag = mag; this.shakeT = t; } },
  hitstop(f) { this.freeze = Math.max(this.freeze, f); },
  spawn(x, y, vx, vy, life, color, size = 1, grav = 0) {
    const p = this.pool.pop() || {};
    p.x = x; p.y = y; p.vx = vx; p.vy = vy; p.life = p.max = life; p.color = color; p.size = size; p.grav = grav;
    this.parts.push(p);
  },
  burst(x, y, n, color, speed = 1.5, grav = 0, life = 18) {
    for (let i = 0; i < n; i++) { const a = Math.random() * 6.283, s = speed * (.4 + Math.random() * .6); this.spawn(x, y, Math.cos(a) * s, Math.sin(a) * s, life + (Math.random() * 8 | 0), color, 1 + (Math.random() < .3), grav); }
  },
  update() {
    if (this.shakeT > 0) { this.shakeT--; const m = this.shakeMag * (this.shakeT / 10); this.sx = Math.round((Math.random() * 2 - 1) * m); this.sy = Math.round((Math.random() * 2 - 1) * m); }
    else { this.sx = this.sy = 0; this.shakeMag = 0; }
    const ps = this.parts;
    for (let i = ps.length - 1; i >= 0; i--) {
      const p = ps[i]; p.x += p.vx; p.y += p.vy; p.vy += p.grav; p.vx *= .97;
      if (--p.life <= 0) { ps[i] = ps[ps.length - 1]; ps.pop(); this.pool.push(p); }
    }
  },
  reset() { this.parts.length = 0; this.shakeT = 0; this.freeze = 0; this.sx = this.sy = 0; },
};

/* ─── Son : petites synthèses 16 bits (aucun fichier à charger) ─────────── */
const Sound = {
  ctx: null, muted: false,
  unlock() { if (!this.ctx) { try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { } } },
  tone(f, d = .08, type = 'square', v = .05, slide = 0) {
    if (!this.ctx || this.muted || (typeof Game !== 'undefined' && Game.demo)) return;
    const c = this.ctx, o = c.createOscillator(), g = c.createGain(), t = c.currentTime;
    o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, f + slide), t + d);
    g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.0001, t + d);
    o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + d + .02);
  },
  jump() { this.tone(330, .09, 'square', .04, 260); },
  djump() { this.tone(520, .1, 'square', .04, 320); },
  land() { this.tone(110, .05, 'triangle', .07); },
  gem() { this.tone(1320, .05, 'square', .03); setTimeout(() => this.tone(1760, .07, 'square', .025), 45); },
  stomp() { this.tone(200, .12, 'square', .06, -120); },
  hurt() { this.tone(160, .25, 'sawtooth', .05, -100); },
  good() { [660, 880, 1100].forEach((f, i) => setTimeout(() => this.tone(f, .1, 'square', .04), i * 70)); },
  bad() { this.tone(220, .18, 'square', .045); setTimeout(() => this.tone(165, .28, 'square', .045), 150); },
  boost() { [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => this.tone(f, .09, 'square', .04), i * 55)); },
  announce() { this.tone(988, .06, 'triangle', .05); setTimeout(() => this.tone(1318, .09, 'triangle', .05), 80); },
  over() { [392, 330, 262, 196].forEach((f, i) => setTimeout(() => this.tone(f, .2, 'triangle', .06), i * 160)); },
};
