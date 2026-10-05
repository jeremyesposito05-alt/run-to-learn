'use strict';
/* ══════════════════════════════════════════════════════════════════════════
   Rendu PROVISOIRE (formes simples). Toute l'apparence du jeu est ici et
   seulement ici : l'habillage « Donkey Kong Country » remplacera ce fichier
   sans toucher au moteur. Les couleurs de chaque biome sont dans biomes.js (pal).

   Deux couches :
   • le monde, dessiné à 384×216 puis agrandi sans lissage (pixels nets) ;
   • le texte, dessiné par-dessus à la pleine résolution de l'écran
     (lisible pour des enfants, accents et majuscules allemandes compris).
   ══════════════════════════════════════════════════════════════════════════ */
const Render = {
  out: null, o: null, low: null, c: null, S: 3, B: 3, texts: [], debug: false, bg: {},
  init(canvas) {
    this.out = canvas; this.o = canvas.getContext('2d');
    this.low = document.createElement('canvas'); this.low.width = VIEW_W; this.low.height = VIEW_H;
    this.c = this.low.getContext('2d');
    // sonde pour lire les marges de sécurité de l'écran (encoche de l'iPhone), en pixels CSS
    this.probe = document.createElement('div');
    this.probe.style.cssText = 'position:fixed;left:0;top:0;width:0;height:0;visibility:hidden;padding-left:env(safe-area-inset-left,0px);padding-right:env(safe-area-inset-right,0px)';
    document.body.appendChild(this.probe);
    this.padL = 0; this.padR = 0;
    addEventListener('resize', () => this.fit()); addEventListener('orientationchange', () => setTimeout(() => this.fit(), 250)); this.fit();
  },
  fit() {
    const aw = innerWidth || 384, ah = innerHeight || 216, dpr = devicePixelRatio || 1;   // fenêtre de taille nulle (rotation, onglet caché) : valeurs de secours
    // la largeur du monde suit la forme de l'écran : un iPhone voit plus loin devant lui au lieu d'avoir des bandes noires
    const w = Math.max(384, Math.min(468, Math.round(VIEW_H * aw / ah / 2) * 2)) || 384;
    if (w !== VIEW_W) { VIEW_W = w; this.low.width = VIEW_W; this.low.height = VIEW_H; this.bg = {}; }
    // grand écran : agrandissement par multiples entiers (pixels parfaits) ; petit écran (téléphone) : on remplit l'écran
    const fitS = Math.min(aw / VIEW_W, ah / VIEW_H), s = fitS >= 3 ? Math.floor(fitS) : fitS;
    const cs = getComputedStyle(this.probe);   // marges de l'encoche, converties en pixels du jeu
    this.padL = Math.ceil((parseFloat(cs.paddingLeft) || 0) / s); this.padR = Math.ceil((parseFloat(cs.paddingRight) || 0) / s);
    this.S = s; this.B = Math.max(1, Math.round(s * dpr));
    this.out.width = VIEW_W * this.B; this.out.height = VIEW_H * this.B;
    const cssS = fitS >= 3 ? this.B / dpr : s;           // taille affichée : jamais plus grande que l'écran
    this.out.style.width = Math.floor(VIEW_W * cssS) + 'px'; this.out.style.height = Math.floor(VIEW_H * cssS) + 'px';
  },
  // texte en file d'attente, coordonnées dans l'espace 384×216
  text(s, x, y, o = {}) { x += this.tdx || 0; this.texts.push({ s, x, y, size: o.size || 8, runs: o.runs || null, color: o.color || '#fff', align: o.align || 'center', stroke: o.stroke ?? '#10143a', maxW: o.maxW || 0, weight: o.weight || 'bold' }); },

  /* ─── décors précalculés, un jeu par biome ─── */
  background(b) {
    if (this.bg[b.id]) return this.bg[b.id];
    const sky = document.createElement('canvas'); sky.width = VIEW_W; sky.height = VIEW_H; const x = sky.getContext('2d');
    const g = x.createLinearGradient(0, 0, 0, VIEW_H); b.pal.sky.forEach((c, i, a) => g.addColorStop(i / (a.length - 1), c));
    x.fillStyle = g; x.fillRect(0, 0, VIEW_W, VIEW_H);
    const pines = b.id === 'foret';   // la forêt : des cimes de sapins plutôt que des montagnes
    return this.bg[b.id] = { sky, far: this._ridge(512, 58, 150, 7, pines), mid: this._ridge(384, 36, 176, 13, pines) };
  },
  _ridge(period, amp, base, seed, pines) {
    const h = [];
    for (let i = 0; i < period; i++) {
      const t = i / period * 6.283; let v = base - amp * (.55 + .25 * Math.sin(t * 2 + seed) + .15 * Math.sin(t * 5 + seed * 2) + .05 * Math.sin(t * 11));
      if (pines) { const k = (i + seed * 5) % 22; v -= (k < 11 ? k : 22 - k) * 2.4; }
      h.push(v);
    }
    return { period, h };
  },
  _drawRidge(r, par, color, camX, camY) {
    const c = this.c, off = camX * par; c.fillStyle = color;
    for (let x = 0; x < VIEW_W; x += 2) { const i = Math.floor(((x + off) % r.period + r.period) % r.period), y = Math.round(r.h[i] - camY * par); c.fillRect(x, y, 2, VIEW_H - y); }
  },

  /* ─── décor : ciel, deux crêtes, météo ; pendant un changement de biome, fondu de l'ancien vers le nouveau ─── */
  scenery(cx, cy) {
    const c = this.c, bl = Game.blend(), ease = t => { t = U.clamp(t, 0, 1); return t * t * (3 - 2 * t); };
    const layers = (b, aSky, aFar, aMid) => {
      const bg = this.background(b), P = b.pal;
      if (aSky > 0) { c.globalAlpha = aSky; c.drawImage(bg.sky, 0, 0); }
      if (aFar > 0) { c.globalAlpha = aFar; this._drawRidge(bg.far, .12, P.far, cx, cy); }
      if (aMid > 0) { c.globalAlpha = aMid; this._drawRidge(bg.mid, .3, P.mid, cx, cy); }
      c.globalAlpha = 1;
    };
    if (!bl) { layers(Game.biome, 1, 1, 1); this.weather(Game.biome, 1, cx); return; }
    // le lointain change d'abord, le plan proche ensuite : le paysage « arrive » pendant qu'on court
    const p = bl.p;
    layers(bl.from, 1, 1, 1);
    layers(bl.to, ease(p * 1.3), ease(p * 1.5 - .2), ease(p * 1.8 - .45));
    this.weather(bl.from, 1 - ease(p * 1.6 - .2), cx); this.weather(bl.to, ease(p * 1.6 - .3), cx);
  },
  // météo propre à chaque biome : flocons en montagne, feuilles en forêt (particules d'écran, sans mémoire)
  weather(b, a, cx) {
    if (a <= 0.02) return;
    const c = this.c, f = Game.frame, leaves = b.id === 'foret';
    c.globalAlpha = a * (leaves ? .9 : .75);
    for (let i = 0; i < 26; i++) {
      const sp = leaves ? .35 + (i % 4) * .08 : .45 + (i % 5) * .12, drift = leaves ? Math.sin(f * .03 + i) * 10 : Math.sin(f * .02 + i * 1.7) * 4;
      const x = ((i * 97 + f * (leaves ? .5 : .25) - cx * .6) % (VIEW_W + 20) + VIEW_W + 20) % (VIEW_W + 20) - 10 + drift;
      const y = ((i * 53 + f * sp) % (VIEW_H + 10)) - 5;
      if (leaves) { c.fillStyle = i % 3 ? '#c8862e' : '#7fb04a'; c.fillRect(Math.round(x), Math.round(y), 2 + ((f >> 3) + i) % 2, 2); }
      else { c.fillStyle = '#ffffff'; const s = i % 4 === 0 ? 2 : 1; c.fillRect(Math.round(x), Math.round(y), s, s); }
    }
    c.globalAlpha = 1;
  },
  // l'arche de la frontière : deux piliers, un linteau, une banderole au nom du biome qui commence
  arch() {
    const n = Game.next, b = Game.border; if (!n && !b) return;
    const c = this.c, bio = n ? n.biome : Game.biome, P = bio.pal, x0 = (n ? n.x : b.x) + ARCH_DX - 24, gy = 12 * TILE, top = gy - 88;
    const post = x => { c.fillStyle = '#10143a'; c.fillRect(x - 1, top - 1, 10, gy - top + 1); c.fillStyle = P.plank; c.fillRect(x, top, 8, gy - top); c.fillStyle = P.plankTop; c.fillRect(x, top, 2, gy - top); };
    post(x0); post(x0 + 56);
    c.fillStyle = '#10143a'; c.fillRect(x0 - 6, top - 9, 76, 12); c.fillStyle = P.plank; c.fillRect(x0 - 5, top - 8, 74, 10); c.fillStyle = P.plankTop; c.fillRect(x0 - 5, top - 8, 74, 2);
    // banderole (accent doré) qui ondule un peu
    const w = Math.sin(Game.frame * .08) * 1.5;
    c.fillStyle = '#10143a'; c.fillRect(x0 + 2, top + 3, 60, 17 + Math.round(w)); c.fillStyle = '#F3BE31'; c.fillRect(x0 + 3, top + 3, 58, 1);
    c.fillStyle = '#1A2047'; c.fillRect(x0 + 3, top + 4, 58, 15 + Math.round(w));
    const sx = x0 + 32 - Math.round(Game.camX) + FX.sx, sy = top + 12 - Math.round(Game.camY) + FX.sy;
    this.text(n ? 'Biome ' + (n.k + 1) : 'Biome ' + (Game.stage + 1), sx, sy - 3, { size: 4.5, color: '#b9c3e8', weight: 'normal', stroke: '' });
    this.text(bio.short, sx, sy + 3, { size: 6.5, color: '#fff4c8', stroke: '' });
  },

  /* ─── image complète ─── */
  frame() {
    const c = this.c, G = Game, cx = Math.round(G.camX), cy = Math.round(G.camY), P = G.biome.pal;
    this.texts.length = 0;
    c.save(); c.translate(FX.sx, FX.sy);
    this.scenery(cx, cy);
    c.translate(-cx, -cy);
    this.tiles(cx, cy, P);
    this.arch();
    for (const o of G.orbs) if (!o.done) this.orb(o);
    for (const b of G.blasons) if (!b.got) this.blason(b.x, b.y + Math.round(Math.sin(G.frame * .07 + b.idx) * 2), b.known ? .45 : 1, true);
    for (const e of G.enemies) if (!e.dead) this.enemy(e);
    if (G.typing && G.state === "play" && Typing.target && !G.focus) this.typeBubble(Typing.target);
    for (const s of G.shots) { c.fillStyle = '#10143a'; c.fillRect(Math.round(s.x) - 1, Math.round(s.y) - 1, 8, 8); c.fillStyle = '#b87a3a'; c.fillRect(Math.round(s.x), Math.round(s.y), 6, 6); c.fillStyle = '#6b4020'; c.fillRect(Math.round(s.x), Math.round(s.y), 6, 2); }
    this.player();
    for (const p of FX.parts) { c.globalAlpha = Math.min(1, p.life / 8); c.fillStyle = p.color; c.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size); }
    c.globalAlpha = 1;
    for (const p of G.popups) this.text(p.text, p.x - cx + FX.sx, p.y - cy + FX.sy, { size: 8, color: p.color });
    if (this.debug) this.hitboxes();
    c.restore();
    this.hud();
    // agrandissement sans lissage, puis texte net par-dessus
    const o = this.o, B = this.B; o.imageSmoothingEnabled = false;
    o.drawImage(this.low, 0, 0, VIEW_W * B, VIEW_H * B);
    o.textBaseline = 'middle';
    for (const t of this.texts) {
      o.font = `${t.weight} ${t.size * B}px 'Trebuchet MS', Calibri, 'Segoe UI', sans-serif`; o.textAlign = t.align;
      if (t.runs) {   // texte en plusieurs couleurs (mode frappe : lettres tapées, lettre suivante, reste)
        const ws = t.runs.map(r => o.measureText(r.s).width), tot = ws.reduce((a, b) => a + b, 0); let xx = t.align === 'center' ? t.x * B - tot / 2 : t.x * B;
        o.textAlign = 'left'; o.lineJoin = 'round'; o.lineWidth = Math.max(2, B * 1.4); o.strokeStyle = t.stroke || '#10143a';
        t.runs.forEach((r, i) => { o.strokeText(r.s, xx, t.y * B); o.fillStyle = r.color; o.fillText(r.s, xx, t.y * B); if (r.under) { o.fillStyle = r.color; o.fillRect(xx, t.y * B + t.size * B * .55, Math.max(ws[i], B * 3), Math.max(1, B * .6)); } xx += ws[i]; });
        continue;
      }
      const mw = t.maxW ? t.maxW * B : undefined;
      if (t.stroke) { o.lineJoin = 'round'; o.lineWidth = Math.max(2, B * 1.4); o.strokeStyle = t.stroke; o.strokeText(t.s, t.x * B, t.y * B, mw); }
      o.fillStyle = t.color; o.fillText(t.s, t.x * B, t.y * B, mw);
    }
  },

  tiles(camX, camY, P) {
    const c = this.c, x0 = Math.floor(camX / TILE) - 1, x1 = x0 + Math.ceil(VIEW_W / TILE) + 2;
    for (let tx = x0; tx <= x1; tx++) for (let ty = 0; ty < ROWS; ty++) {
      const t = World.tile(tx, ty); if (t === '.') continue;
      const P = Game.bioAt(tx * TILE).pal;              // pendant un passage, chaque colonne garde les couleurs de son biome
      const X = tx * TILE, Y = ty * TILE;
      if (t === '#' || t === 'i') {
        const topOpen = !World.solid(tx, ty - 1), ice = t === 'i';
        c.fillStyle = ice ? ((tx + ty) % 2 ? P.ice : P.iceShade) : P.ground[(tx + ty) % 2]; c.fillRect(X, Y, TILE, TILE);
        if (!World.solid(tx - 1, ty)) { c.fillStyle = P.edgeL; c.fillRect(X, Y, 1, TILE); }
        if (!World.solid(tx + 1, ty)) { c.fillStyle = P.edgeR; c.fillRect(X + TILE - 1, Y, 1, TILE); }
        if (topOpen && !ice) { c.fillStyle = P.cap; c.fillRect(X, Y, TILE, 4); c.fillStyle = P.capShade; c.fillRect(X, Y + 4, TILE, 1); if ((tx * 7) % 3 === 0) { c.fillStyle = P.cap; c.fillRect(X + 5, Y + 5, 3, 2); } }
        if (ice) { c.fillStyle = '#ffffff'; c.fillRect(X, Y, TILE, 2); if ((tx + (Game.frame >> 4)) % 5 === 0) c.fillRect(X + 4, Y + 4, 5, 1); }
      } else if (t === 'r') {                                  // obstacle naturel : rocher enneigé (montagne) ou souche (forêt)
        const top = World.tile(tx, ty - 1) !== 'r', wood = Game.bioAt(X).id === 'foret';
        c.fillStyle = '#10143a'; c.fillRect(X + 1, Y, 14, TILE);
        c.fillStyle = wood ? '#7a5230' : '#6f7896'; c.fillRect(X + 2, Y, 12, TILE);
        c.fillStyle = wood ? '#93683e' : '#8d97b6'; c.fillRect(X + 2, Y, 3, TILE);
        c.fillStyle = wood ? '#5a3a20' : '#4f5876'; c.fillRect(X + 11, Y, 3, TILE);
        if (top) { if (wood) { c.fillStyle = '#d8b07a'; c.fillRect(X + 2, Y, 12, 3); c.fillStyle = '#93683e'; c.fillRect(X + 6, Y + 1, 4, 1); c.fillStyle = '#4caf50'; c.fillRect(X + 1, Y + 3, 3, 2); }
                   else { c.fillStyle = '#eef3ff'; c.fillRect(X + 1, Y, 14, 4); c.fillRect(X + 4, Y + 4, 4, 2); } }
      } else if (t === 't') {                                  // champignon-trampoline
        c.fillStyle = '#f1e6d0'; c.fillRect(X + 6, Y + 8, 4, 8);
        c.fillStyle = '#10143a'; c.fillRect(X, Y + 1, TILE, 8); c.fillStyle = '#d9412f'; c.fillRect(X + 1, Y + 2, TILE - 2, 6);
        c.fillStyle = '#ffffff'; c.fillRect(X + 3, Y + 3, 2, 2); c.fillRect(X + 10, Y + 4, 2, 2);
      } else if (t === '=' || t === 'k') {
        const left = Game.crumbles.get(tx + ',' + ty), sh = left !== undefined ? ((Game.frame >> 1) % 2 ? 1 : -1) : 0;
        if (t === 'k') { c.fillStyle = '#6b4a2a'; c.fillRect(X, Y + 1 + sh, TILE, 4); c.fillStyle = '#8a6238'; c.fillRect(X, Y + 1 + sh, TILE, 1); c.fillStyle = '#4caf50'; if (tx % 2) c.fillRect(X + 5, Y - 1 + sh, 4, 2); }
        else { c.fillStyle = P.plankTop; c.fillRect(X, Y, TILE, 3); c.fillStyle = P.plank; c.fillRect(X, Y + 3, TILE, 3); c.fillStyle = '#10143a'; c.fillRect(X, Y + 6, TILE, 1); }
      } else if (t === '^') {
        for (let k = 0; k < 2; k++) for (let r = 0; r < 8; r++) { const hw = Math.floor((r + 1) / 2); c.fillStyle = r < 2 ? P.spike[0] : P.spike[1]; c.fillRect(X + k * 8 + 4 - hw, Y + 8 + r, hw * 2, 1); }
      }
    }
  },
  enemy(e) {
    const c = this.c, sq = e.squash || 0, h = Math.round(e.h * (1 - sq * .25));
    let x = Math.round(e.x), y = Math.round(e.y + e.h - h);
    if (e.ch === 'v') {                                       // stalactite : triangle pointe en bas
      if (e.state === 'shake') x += (Game.frame >> 1) % 2 ? 1 : -1;
      for (let r = 0; r < e.h; r++) { const hw = Math.max(1, Math.round((e.h - r) / e.h * e.w / 2)); c.fillStyle = r < 3 ? '#ffffff' : e.color; c.fillRect(x + e.w / 2 - hw, y + r, hw * 2, 1); }
      return;
    }
    if (e.ch === 'b') {                                       // boule qui roule
      const r = Math.floor(e.t / 4) % 4;
      c.fillStyle = '#10143a'; c.fillRect(x + 2, y - 1, 12, 18); c.fillRect(x - 1, y + 2, 18, 12);
      c.fillStyle = e.color; c.fillRect(x + 2, y, 12, 16); c.fillRect(x, y + 2, 16, 12);
      c.fillStyle = 'rgba(0,0,0,.18)'; if (r < 2) c.fillRect(x + 3 + r * 5, y + 2, 3, 12); else c.fillRect(x + 2, y + 3 + (r - 2) * 5, 12, 3);
      return;
    }
    c.fillStyle = '#10143a'; c.fillRect(x - 1, y - 1, e.w + 2, h + 2);
    c.fillStyle = e.color; c.fillRect(x, y, e.w, h);
    c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(x + 1, y + 1, e.w - 2, 2);
    const ex = e.dir < 0 ? x + 2 : x + e.w - 7, angry = e.state === 'charge' || e.state === 'dive';
    c.fillStyle = angry ? '#ff5a5a' : '#fff'; c.fillRect(ex, y + 3, 2, 3); c.fillRect(ex + 3, y + 3, 2, 3);
    c.fillStyle = '#10143a'; c.fillRect(ex + (e.dir < 0 ? 0 : 1), y + 4, 1, 2); c.fillRect(ex + 3 + (e.dir < 0 ? 0 : 1), y + 4, 1, 2);
    if (e.kind === 'bonhomme de neige') { c.fillStyle = '#ff8a2a'; c.fillRect(x - 2, y + 6, 3, 2); c.fillStyle = '#10143a'; c.fillRect(x + 2, y - 3, 10, 3); }
    if (e.kind === 'sanglier') { c.fillStyle = '#fff4c8'; c.fillRect(x - 1, y + 8, 2, 3); }
    if (e.ch === 's') { c.fillStyle = '#f2f2ff'; for (let k = 0; k < 4; k++) c.fillRect(x + 1 + k * 3, y - 3 - (k % 2), 2, 3); }
    if (e.ch === 'f' || e.ch === 'd') { const up = e.state === 'dive' ? 1 : (Game.frame >> 3) % 2; c.fillStyle = e.ch === 'd' ? '#c9a878' : '#fff4c8'; c.fillRect(x - 4, y + (up ? 0 : 4), 5, 3); c.fillRect(x + e.w - 1, y + (up ? 0 : 4), 5, 3); }
    if (e.ch === 'a') { c.fillStyle = '#10143a'; c.fillRect(x + e.w - 1, y - 7, 8, 12); c.fillStyle = e.color; c.fillRect(x + e.w, y - 6, 6, 10); }   // queue touffue
    if (e.ch === 'e' || e.ch === 's') { const st = (e.t >> 3) % 2; c.fillStyle = '#10143a'; c.fillRect(x + 2 + st, y + h, 3, 1); c.fillRect(x + e.w - 5 - st, y + h, 3, 1); }
  },
  player() {
    const p = Player, c = this.c; if (p.inv > 0 && (p.inv >> 2) % 2) return;
    const sq = p.squash, sx = 1 + sq * .22, sy = 1 - sq * .22;
    const w = Math.round(p.w * sx), h = Math.round(p.h * sy), x = Math.round(p.x + (p.w - w) / 2), y = Math.round(p.y + p.h - h), d = p.dir;
    if (Game.boost > 0) { c.fillStyle = (Game.frame >> 1) % 2 ? '#F3BE31' : '#fff2a8'; c.fillRect(x - 2, y - 2, w + 4, h + 4); }
    else if (p.glow > 0) {                                  // aura dorée après une bonne réponse : elle s'élargit puis s'éteint
      const g = p.glow / 60, r = 2 + Math.round((1 - g) * 4) + ((Game.frame >> 2) % 2);
      c.globalAlpha = .35 + .45 * g; c.fillStyle = '#F3BE31'; c.fillRect(x - r, y - r, w + r * 2, h + r * 2);
      c.globalAlpha = .6 * g; c.fillStyle = '#fff4c8'; c.fillRect(x - 1, y - 1, w + 2, h + 2); c.globalAlpha = 1;
      if (Game.frame % 4 === 0) FX.spawn(p.x + Math.random() * p.w, p.y + Math.random() * p.h, 0, -.6, 16, '#fff4c8', 1, 0);
    }
    const run = p.on ? Math.sin(p.anim) : 0, legA = Math.round(run * 3), air = !p.on;
    c.fillStyle = '#10143a';
    c.fillRect(x + 1 + (air ? -1 : legA), y + h - 6, 4, 6); c.fillRect(x + w - 5 + (air ? 1 : -legA), y + h - 6 + (air ? -2 : 0), 4, 6);
    const sk = Carnet.skin();
    c.fillStyle = sk.body; c.fillRect(x, y + 11, w, h - 16);
    c.fillStyle = sk.trim; c.fillRect(x + 1, y + 12, w - 2, 1); c.fillRect(x + 5, y + 14, 2, 4);
    c.fillStyle = '#f0b27a'; c.fillRect(x, y, w, 11);
    c.fillStyle = sk.hair; c.fillRect(x - 1, y - 2, w + 2, 4); c.fillRect(d > 0 ? x - 1 : x + w - 1, y, 2, 5);
    c.fillStyle = '#10143a'; if (d > 0) { c.fillRect(x + w - 5, y + 4, 2, 3); c.fillRect(x + w - 2, y + 4, 1, 3); } else { c.fillRect(x + 3, y + 4, 2, 3); c.fillRect(x + 1, y + 4, 1, 3); }
    if (p.dbl > 0) { c.fillStyle = '#8fd4ff'; c.fillRect(x - 3, y + h + 1, w + 6, 1); }
    if (p.wallT > 0 && !p.on && p.vy > 0 && Game.frame % 3 === 0) FX.spawn(p.wallSide > 0 ? p.x + p.w : p.x, p.y + p.h - 4, -p.wallSide * .4, -.3, 10, '#ffffff', 1, 0);   // étincelles de glissade
  },
  blason(x, y, alpha, glow) { // petit écusson bleu et or (provisoire)
    const c = this.c, X = Math.round(x), Y = Math.round(y);
    c.globalAlpha = alpha;
    if (glow) { c.globalAlpha = alpha * (.25 + .15 * Math.sin(Game.frame * .15)); c.fillStyle = '#fff4c8'; c.fillRect(X - 3, Y - 3, 16, 17); c.globalAlpha = alpha; }
    const rows = [10, 10, 10, 10, 10, 10, 8, 6, 4, 2];
    rows.forEach((w, r) => { const o = (10 - w) / 2; c.fillStyle = '#10143a'; c.fillRect(X + o - 1, Y + r, w + 2, 1); c.fillStyle = r === 0 ? '#F3BE31' : '#14387F'; c.fillRect(X + o, Y + r, w, 1); });
    c.fillStyle = '#F3BE31'; c.fillRect(X + 4, Y + 2, 2, 5); c.fillRect(X + 2, Y + 3, 6, 2);   // croix dorée
    c.fillRect(X - 1, Y, 1, 7); c.fillRect(X + 10, Y, 1, 7);
    c.globalAlpha = 1;
  },
  orb(o) { // bonus question provisoire : bulle dorée pulsante avec un « ? »
    const c = this.c, bob = Math.round(Math.sin((Game.frame + o.ph * 4) * .09) * 2), x = Math.round(o.x), y = Math.round(o.y) + bob;
    const pulse = (Game.frame >> 3) % 2;
    c.globalAlpha = .35; c.fillStyle = '#fff4c8'; c.fillRect(x - 2 - pulse, y - 2 - pulse, 18 + pulse * 2, 18 + pulse * 2); c.globalAlpha = 1;
    c.fillStyle = '#10143a'; c.fillRect(x - 1, y - 1, 16, 16);
    c.fillStyle = '#F3BE31'; c.fillRect(x, y, 14, 14);
    c.fillStyle = '#fff4c8'; c.fillRect(x + 1, y + 1, 12, 2); c.fillStyle = '#c9901a'; c.fillRect(x + 1, y + 11, 12, 2);
    this.text('?', x + 7 - Math.round(Game.camX) + FX.sx, y + 7.5 - Math.round(Game.camY) + FX.sy, { size: 10, color: '#10143a', stroke: '' });
  },
  focusCard() { // écran-question : le monde est figé derrière
    const c = this.c, f = Game.focus;
    const a = f.phase === 'in' ? f.t / FOCUS.in : f.phase === 'out' ? 1 - f.t / FOCUS.out : 1;
    c.globalAlpha = .62 * a; c.fillStyle = '#060a20'; c.fillRect(0, 0, VIEW_W, VIEW_H); c.globalAlpha = 1;
    if (a >= .5 && f.kind === 'type') return this.typeCard(f, a);
    if (a < .5) return;
    c.globalAlpha = a;
    const cx0 = Math.round((VIEW_W - 272) / 2), bx0 = cx0 + 14;   // carte centrée, quelle que soit la largeur de l'écran
    c.fillStyle = '#1A2047'; c.fillRect(cx0, 10, 272, 196);
    c.fillStyle = '#F3BE31'; c.fillRect(cx0, 10, 272, 1); c.fillRect(cx0, 205, 272, 1);
    this.text(f.it.q, VIEW_W / 2, 34, { size: f.it.q.length > 34 ? 9 : 11, maxW: 256 });
    // minuteur (absent au niveau 1)
    if (f.timeMax) {
      const r = U.clamp(f.time / f.timeMax, 0, 1), col = r > .5 ? '#3fcf7a' : r > .25 ? '#F3BE31' : '#ff5a5a';
      c.fillStyle = '#10143a'; c.fillRect(bx0, 50, 244, 5); c.fillStyle = col; c.fillRect(bx0, 50, Math.round(244 * r), 5);
      if (f.phase === 'choose') this.text(Math.ceil(f.time / 60) + ' s', bx0 + 250, 52.5, { size: 6.5, align: 'left', color: col, stroke: '' });
    }
    const res = f.phase === 'result' || f.phase === 'out';
    for (let i = 0; i < 3; i++) {
      const b = FOCUS_BOX(i);
      let fill = i === f.sel ? '#0087CC' : '#14387F', border = i === f.sel ? '#ffffff' : '#3d5a9e';
      if (res) { if (i === f.correct) { fill = '#1f6b45'; border = '#8ff0b8'; } else if (i === f.chosen) { fill = '#7a2330'; border = '#ff9a9a'; } else { fill = '#1c2250'; border = '#2e3666'; } }
      c.fillStyle = fill; c.fillRect(b.x, b.y, b.w, b.h);
      c.fillStyle = border; c.fillRect(b.x, b.y, b.w, 1); c.fillRect(b.x, b.y + b.h - 1, b.w, 1); c.fillRect(b.x, b.y, 1, b.h); c.fillRect(b.x + b.w - 1, b.y, 1, b.h);
      c.fillStyle = '#10143a'; c.fillRect(b.x + 6, b.y + 7, 18, 18);
      this.text(String(i + 1), b.x + 15, b.y + 16.5, { size: 9, color: '#F3BE31', stroke: '' });
      this.text(f.labels[i], b.x + b.w / 2 + 10, b.y + 16.5, { size: 11, maxW: b.w - 44, color: res && i !== f.correct && i !== f.chosen ? '#6c7096' : '#fff' });
    }
    if (f.phase === 'choose' || f.phase === 'in') this.text('Touche ta réponse · ou 1, 2, 3 · ou ↑ ↓ puis Espace', VIEW_W / 2, 196, { size: 6.5, color: '#b9c3e8', weight: 'normal', stroke: '' });
    else if (f.chosen === f.correct) this.text((f.mega ? 'Exact !  Invincible !' : `Exact !  +${f.pts}`) + (f.it.review ? '  · tu l’as retenue !' : ''), VIEW_W / 2, 196, { size: 9, color: f.mega ? '#F3BE31' : '#8ff0b8' });
    else {                                                  // la correction, puis la stratégie qui y mène
      this.text((f.timeout ? 'Temps écoulé ! ' : '') + 'La bonne réponse : ' + f.it.a, VIEW_W / 2, f.it.why ? 186 : 196, { size: 8.5, maxW: 260, color: '#ffb0b0' });
      if (f.it.why) this.text(f.it.why, VIEW_W / 2, 198, { size: 6.5, maxW: 262, color: '#fff4c8', weight: 'normal', stroke: '' });
      if (f.t > 40) this.text('touche pour continuer', cx0 + 266, 16, { size: 5, align: 'right', color: '#6c7096', weight: 'normal', stroke: '' });
    }
    c.globalAlpha = 1;
  },
  // Mode frappe : le mot à taper, au-dessus de l'obstacle (lettres tapées en or, lettre suivante soulignée)
  typeBubble(t) {
    const c = this.c, G = Game, word = t.word, done = t.typed;
    const wx = t.kind === 'enemy' ? t.e.x + t.e.w / 2 : t.x + 8, wy = (t.kind === 'enemy' ? t.e.y - 18 : Player.y - 20);
    const w = Math.max(28, word.length * 7 + 12), x = Math.round(wx - w / 2), y = Math.round(wy - 9);
    c.fillStyle = t.armed ? '#1f6b45' : Typing.flash > 0 ? '#7a2330' : '#10143a'; c.globalAlpha = .9; c.fillRect(x, y, w, 17); c.globalAlpha = 1;
    c.fillStyle = t.armed ? '#8ff0b8' : '#F3BE31'; c.fillRect(x, y, w, 1); c.fillRect(x, y + 16, w, 1);
    if (!t.armed) { c.fillStyle = '#F3BE31'; c.fillRect(Math.round(wx) - 2, y + 17, 4, 3); }   // petite flèche vers l'obstacle
    const sx = wx - Math.round(G.camX) + FX.sx, sy = y + 8.5 - Math.round(G.camY) + FX.sy;
    if (t.armed) this.text('✓ ' + word, sx, sy, { size: 9, color: '#8ff0b8' });
    else this.text('', sx, sy, { size: 10, runs: [{ s: word.slice(0, done), color: '#F3BE31' }, { s: word.charAt(done), color: '#ffffff', under: true }, { s: word.slice(done + 1), color: '#9aa3c8' }].filter(r => r.s) });
  },
  // Mode frappe : défi de phrase quand on attrape un bonus
  typeCard(f, a) {
    const c = this.c, cx0 = Math.round((VIEW_W - 300) / 2);
    c.globalAlpha = a;
    c.fillStyle = '#1A2047'; c.fillRect(cx0, 30, 300, 150);
    c.fillStyle = '#F3BE31'; c.fillRect(cx0, 30, 300, 1); c.fillRect(cx0, 179, 300, 1);
    this.text('Défi de frappe · recopie la phrase', VIEW_W / 2, 44, { size: 7, color: '#b9c3e8', weight: 'normal', stroke: '' });
    if (f.timeMax) {
      const r = U.clamp(f.time / f.timeMax, 0, 1), col = r > .5 ? '#3fcf7a' : r > .25 ? '#F3BE31' : '#ff5a5a';
      c.fillStyle = '#10143a'; c.fillRect(cx0 + 20, 54, 260, 4); c.fillStyle = col; c.fillRect(cx0 + 20, 54, Math.round(260 * r), 4);
    }
    const res = f.phase === 'result' || f.phase === 'out', t = f.text, d = f.typed;
    c.fillStyle = Typing.flash > 0 && !res ? '#7a2330' : '#0f1640'; c.fillRect(cx0 + 12, 76, 276, 36);
    this.text('', VIEW_W / 2, 94, { size: t.length > 34 ? 9 : 11, runs: [{ s: t.slice(0, d), color: '#F3BE31' }, { s: t.charAt(d) === ' ' ? '␣' : t.charAt(d), color: '#ffffff', under: true }, { s: t.slice(d + 1), color: '#9aa3c8' }].filter(r => r.s) });
    if (!res) {
      const next = t.charAt(d);
      this.text(next === ' ' ? 'Touche suivante : espace' : 'Touche suivante : ' + next, VIEW_W / 2, 128, { size: 8, color: '#fff4c8' });
      this.text(f.errs ? `${f.errs} erreur${f.errs > 1 ? 's' : ''} · regarde l’écran, pas le clavier` : 'Tape sans regarder le clavier', VIEW_W / 2, 146, { size: 6.5, color: '#9aa3c8', weight: 'normal', stroke: '' });
    } else {
      const ok = f.chosen === f.correct, pct = Math.round((f.acc || 0) * 100);
      this.text(ok ? `Réussi !  +${f.pts}` : f.typed >= t.length ? 'Presque : vise 80 % de précision' : 'Temps écoulé', VIEW_W / 2, 130, { size: 11, color: ok ? '#8ff0b8' : '#ffb0b0' });
      this.text(`Précision ${pct} %${f.cpm ? ` · ${f.cpm} mots/min` : ''}`, VIEW_W / 2, 150, { size: 8, color: '#fff4c8' });
    }
    c.globalAlpha = 1;
  },
  hud() {
    const c = this.c, G = Game;
    if (G.state === 'menu' || G.demo) return;
    // jauges de gauche et de droite décalées hors de l'encoche de l'iPhone
    c.save(); c.translate(this.padL, 0); this.tdx = this.padL;
    // endurance
    const e = U.clamp(G.energy / 100, 0, 1), col = e > .5 ? '#3fcf7a' : e > .25 ? '#F3BE31' : '#ff5a5a';
    c.fillStyle = '#10143a'; c.fillRect(7, 7, 94, 9); c.fillStyle = '#2a2f55'; c.fillRect(8, 8, 92, 7);
    c.fillStyle = col; c.fillRect(8, 8, Math.round(92 * e), 7); c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(8, 8, Math.round(92 * e), 2);
    if (e < .25 && (G.frame >> 3) % 2) { c.fillStyle = '#fff'; c.fillRect(8, 8, Math.round(92 * e), 7); }
    this.text('Endurance', 54, 22, { size: 5.5, color: '#b9c3e8', weight: 'normal', stroke: '' });
    // les 3 blasons du biome : pleins s'ils sont dans le carnet, en creux sinon
    for (let i = 0; i < 3; i++) this.blason(8 + i * 11, 26, Carnet.has(G.biome.id, i) ? 1 : .22, false);
    // invincibilité
    if (G.boost > 0) {
      c.fillStyle = '#10143a'; c.fillRect(7, 38, 94, 5); c.fillStyle = (G.frame >> 2) % 2 ? '#F3BE31' : '#fff2a8'; c.fillRect(8, 39, Math.round(92 * G.boost / RULES.invincibleTime), 3);
      this.text('Invincible !', 54, 49, { size: 6.5, color: '#F3BE31' });
    }
    c.restore(); this.tdx = 0;
    // progression dans le biome : 8 bonnes réponses pour passer au suivant
    const n = RULES.biomeGoal, bw = n * 9 - 2, bx = Math.round((VIEW_W - bw) / 2);
    for (let i = 0; i < n; i++) { c.fillStyle = '#10143a'; c.fillRect(bx + i * 9 - 1, 7, 9, 7); c.fillStyle = i < G.biomeRight ? '#8ff0b8' : '#2a2f55'; c.fillRect(bx + i * 9, 8, 7, 5); }
    if (!G.focus) this.text(G.biome.short + ' · ' + Math.min(G.biomeRight, n) + ' / ' + n, VIEW_W / 2, 20, { size: 5.5, color: '#b9c3e8', weight: 'normal', stroke: '' });
    // série vers l'invincibilité : 5 cases
    c.save(); c.translate(-this.padR, 0); this.tdx = -this.padR;
    for (let i = 0; i < RULES.invincibleEvery; i++) {
      const on = i < G.streak % RULES.invincibleEvery || (G.boost > 0 && G.streak > 0 && G.streak % RULES.invincibleEvery === 0);
      c.fillStyle = '#10143a'; c.fillRect(VIEW_W - 70 + i * 13, 19, 11, 7); c.fillStyle = on ? '#F3BE31' : '#2a2f55'; c.fillRect(VIEW_W - 69 + i * 13, 20, 9, 5);
    }
    this.text('Série', VIEW_W - 74, 22.5, { align: 'right', size: 5.5, color: '#b9c3e8', weight: 'normal', stroke: '' });
    this.text(String(G.score).padStart(6, '0'), VIEW_W - 8, 11, { align: 'right', size: 9, color: '#fff4c8' });
    c.restore(); this.tdx = 0;
    if (G.focus) { this.focusCard(); return; }
    const b = G.banner;
    if (b && b.t > 0) { const a = Math.min(1, b.t / 12); c.globalAlpha = .8 * a; c.fillStyle = '#10143a'; c.fillRect(0, 44, VIEW_W, 22); c.globalAlpha = 1; this.text(b.text, VIEW_W / 2, 55, { size: 10, maxW: 370, color: b.color }); }
    // arrivée dans un biome : un bandeau léger sous le haut de l'écran (la course ne s'arrête pas)
    if (G.biomeCard > 0) {
      const a = Math.min(1, G.biomeCard / 20, (200 - G.biomeCard) / 12), slide = Math.round((1 - Math.min(1, (200 - G.biomeCard) / 14)) * -10);
      const w = 200, x = Math.round((VIEW_W - w) / 2), y = 72 + slide;
      c.globalAlpha = .82 * a; c.fillStyle = '#10143a'; c.fillRect(x, y, w, 26); c.globalAlpha = a; c.fillStyle = '#F3BE31'; c.fillRect(x, y + 25, w, 1); c.globalAlpha = 1;
      if (a > .4) { this.text((G.firstVisit && G.stage ? 'Nouveau biome · ' : 'Biome ') + (G.stage + 1), VIEW_W / 2, y + 7, { size: 5.5, color: '#b9c3e8', weight: 'normal', stroke: '' }); this.text(G.biomeTitle(), VIEW_W / 2, y + 17, { size: 10, color: '#fff4c8' }); }
    }
    if (G.intro > 0) this.text(G.intro > 40 ? 'Prêt ?' : 'Partez !', VIEW_W / 2, 124, { size: 20, color: '#fff4c8' });
    if (G.state === 'pause') { c.fillStyle = 'rgba(10,15,38,.55)'; c.fillRect(0, 0, VIEW_W, VIEW_H); }
    if (G.typing) this.text(`${Typing.wpm()} mots/min · précision ${Math.round(Typing.acc() * 100)} %`, 8 + this.padL, VIEW_H - 8, { align: 'left', size: 6.5, color: '#fff4c8' });
    if (this.debug) this.text(`${Loop.fps} i/s · biome ${G.stage + 1} · difficulté ${G.diff.toFixed(2)} · vitesse ${Player.vx.toFixed(2)} · ${G.enemies.length} ennemis`, 6, VIEW_H - 8, { align: 'left', size: 6, weight: 'normal' });
  },
  hitboxes() {
    const c = this.c; c.strokeStyle = '#00ff88'; c.lineWidth = 1;
    const box = b => c.strokeRect(Math.round(b.x) + .5, Math.round(b.y) + .5, b.w - 1, b.h - 1);
    box(Player); for (const e of Game.enemies) if (!e.dead) box(e);
    c.strokeStyle = '#ffdd00'; for (const o of Game.orbs) if (!o.done) box(o);
    c.strokeStyle = '#ff5aff'; for (const s of Game.shots) box(s);
  },
};
