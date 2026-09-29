'use strict';
/* ══════════════════════════════════════════════════════════════════════════
   Pilote automatique : joue à la place du joueur.
   • derrière le menu (démonstration animée) ;
   • pour les tests : Autopilot.simulate(10000) joue ~3 minutes en une fraction
     de seconde et rapporte chutes, coups, bonus attrapés, blocages, réponses.
     Dans la console :  Autopilot.simulate(10000, {sub:'fr', lvl:4, level:'n3', accuracy:.7})
   ══════════════════════════════════════════════════════════════════════════ */
const Autopilot = {
  holdT: 0, accuracy: 1, answerAt: 30,
  reset(accuracy = 1) { this.holdT = 0; this.accuracy = accuracy; },
  press(h) { Input.presses++; Input.keyHeld = true; this.holdT = h; },
  danger() {
    const p = Player, fy = p.y + p.h;
    for (let dx = 6; dx <= 34; dx += 4) {
      const x = p.x + p.w + dx, cx = Math.floor(x / TILE);
      if (!groundAt(x, fy)) return 'trou';
      for (let r = Math.floor(p.y / TILE); r <= Math.floor((fy - 1) / TILE); r++) if (World.solid(cx, r)) return 'mur';
      if (World.tile(cx, Math.floor((fy - 2) / TILE)) === '^') return 'pics';
    }
    for (const e of Game.enemies) if (!e.dead && e.x > p.x && e.x - p.x < 46 && Math.abs(e.y - p.y) < 30) return 'ennemi';
    return null;
  },
  step() {
    const p = Player, f = Game.focus;
    if (f) { // écran-question : répond après un temps de « lecture »
      Input.keyHeld = false; this.holdT = 0;
      if (f.phase === 'choose' && f.lock === 0 && f.t === 1) this.answerAt = 20 + (Math.random() * 60 | 0);
      if (f.phase === 'choose' && f.lock === 0 && f.t >= this.answerAt) Game.choose(Math.random() < this.accuracy ? f.correct : (f.correct + 1 + (Math.random() * 2 | 0)) % 3);
      return;
    }
    if (this.holdT > 0) { if (--this.holdT === 0) Input.keyHeld = false; }
    // glisse le long d'un mur : on rebondit (cheminées)
    if (!p.on && p.wallT > 0 && p.vy > -1 && this.holdT === 0) {
      // seulement à l'intérieur d'une cheminée (un autre mur à moins de 4 cases derrière soi)
      const back = Math.floor((p.wallSide > 0 ? p.x - 1 : p.x + p.w + 1) / TILE);
      let inside = false;
      for (let row = Math.floor(p.y / TILE) - 3; row <= Math.floor(p.cy / TILE); row++) for (let d = 0; d < 4; d++) if (World.solid(back - p.wallSide * d, row)) inside = true;
      if (inside) { this.press(14); return; }
    }
    // projectile qui arrive : on saute
    if (p.on && this.holdT === 0 && Game.shots.some(s => s.x > p.x && s.x - p.x < 60 && Math.abs(s.y - p.cy) < 30)) { this.press(10); return; }
    // viser le prochain bonus question
    const o = [...Game.orbs.filter(o => !o.done), ...Game.blasons.filter(b => !b.got)].filter(o => o.x + o.w > p.x).sort((a, b) => a.x - b.x)[0];
    if (o) {
      const dx = o.x + o.w / 2 - p.cx, rise = p.cy - (o.y + o.h / 2);
      if (p.on && rise > 16 && dx > 0 && dx < 18 + Math.min(70, rise * .8) && this.holdT === 0) { this.press(24); return; }
      if (!p.on && p.jumps === 1 && p.vy > -1.2 && rise > 10 && dx > 0 && dx < 60) { this.press(20); return; }
    }
    if (this.holdT > 0) return;
    // un bonus bas juste devant : petit saut (sinon on passe par-dessus)
    const low = o && o.x - p.cx < 90 && o.x > p.cx && p.cy - (o.y + o.h / 2) < 16;
    if (p.on && this.danger()) this.press(low ? 2 : 18);
    else if (!p.on && p.vy > 1.5 && !groundAt(p.cx, p.y + p.h + 60) && p.jumps < 2) this.press(14);
  },
  // Simulation accélérée, sans affichage
  simulate(steps = 10000, o = {}) {
    const opts = { themes: ['m.tab'], level: 'n2', ...o, sim: true };
    UI.hideAll(); Game.start(opts); this.reset(o.accuracy ?? 1);
    const rep = { falls: [], hurts: [], stuck: [] };
    const oP = Game.pitFall, oH = Game.hurt;
    Game.pitFall = function () { rep.falls.push(Math.round(Player.x / TILE)); oP.call(Game); };
    Game.hurt = function (d, e) { if (Player.inv === 0 && Game.boost === 0) rep.hurts.push((e ? e.kind : 'pics') + '@' + Math.round(Player.x / TILE)); oH.call(Game, d, e); };
    let still = 0, frames = 0, typAcc = 0;
    for (let i = 0; i < steps && Game.state === 'play'; i++) {
      if (Game.typing) { typAcc += (o.cps || 4) / 60; while (typAcc >= 1) { typAcc--; Typing.botType(o.err || 0); } } else this.step();   // mode frappe : le pilote tape au clavier
      Game.update(); frames++;
      if (!Game.focus && Game.intro === 0 && Math.abs(Player.vx) < .3) { if (++still === 60) rep.stuck.push(Math.round(Player.x / TILE)); } else still = 0;
    }
    Game.pitFall = oP; Game.hurt = oH; Input.keyHeld = Input.keyDown = false;
    const S = Game.session;
    const out = { niveau: opts.level, secondes: Math.round(frames / 60), fin: Game.state === 'over' ? 'endurance à zéro' : 'toujours en vie', cases: Math.round(Player.x / TILE),
      endurance: Math.round(Game.energy), difficulté: +Game.diff.toFixed(2), bonus: `${Game.caught} attrapés / ${Game.missedOrbs} manqués`,
      réponses: `${S.right} / ${S.asked}`, écrasés: Game.stomps, chutes: rep.falls.length, coups: rep.hurts.length, blocages: rep.stuck };
    startDemo(); UI.show('title');
    return out;
  },
};
