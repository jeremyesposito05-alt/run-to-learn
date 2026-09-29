'use strict';
/* ══════════════════════════════════════════════════════════════════════════
   Contenu pédagogique, rangé par THÈME et par ANNÉE (échelle HarmoS de annees.js : 3 = 3P … 14 = DP 2).
   Chaque question = { q: énoncé, a: bonne réponse, bad: [2 erreurs typiques], why: explication }.
   • Les maths et la conjugaison sont GÉNÉRÉES par des règles (des milliers de questions, toujours justes).
   • Les autres thèmes viennent des banques de banques.js, que les enseignants peuvent compléter.
   ══════════════════════════════════════════════════════════════════════════ */
const Quiz = (() => {
  const SUBJECTS = { math: { label: 'Mathématiques' }, fr: { label: 'Français' }, en: { label: 'Anglais' }, de: { label: 'Allemand' } };
  const R = U.int, pick = U.pick;
  const MINUS = '−';
  const neg = n => (n < 0 ? MINUS + Math.abs(n) : String(n));          // −3 avec le vrai signe moins
  const par = n => (n < 0 ? `(${neg(n)})` : String(n));                 // (−3) entre parenthèses
  const dec = n => String(Math.round(n * 1000) / 1000).replace(".", ",").replace("-", MINUS); // virgule décimale
  const SUP = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹', '-': '⁻' };
  const sup = n => String(n).split('').map(c => SUP[c] || c).join('');
  const SUB = { 1: '₁', 2: '₂', 3: '₃', 4: '₄', 5: '₅', 6: '₆', 7: '₇', 8: '₈', 9: '₉', 0: '₀' };
  const sub = n => String(n).split('').map(c => SUB[c] || c).join('');
  const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
  const frac = (n, d) => { const g = gcd(n, d); return d / g === 1 ? String(n / g) : `${n / g}/${d / g}`; };

  // deux erreurs plausibles et distinctes (d'abord les erreurs « typiques », puis des voisins)
  function bad2(r, ans, typical = [], near = true) {
    const s = String(ans), out = [];
    for (const t of typical) { const v = String(t); if (v !== s && !out.includes(v) && v !== 'NaN') out.push(v); if (out.length === 2) break; }
    if (near) { const n = +String(ans).replace(',', '.').replace(MINUS, '-'); if (!isNaN(n)) for (const d of U.shuffle(r, [1, -1, 2, -2, 10, -10])) { const v = Number.isInteger(n) ? neg(n + d) : dec(n + d / 10); if (v !== s && !out.includes(v) && (n + d >= 0 || n < 0)) out.push(v); if (out.length === 2) break; } }
    return U.shuffle(r, out).slice(0, 2);
  }
  const Q = (q, a, bad, why = '') => ({ q, a: String(a), bad, why });
  const uniq2 = (ans, list) => [...new Set(list.map(String))].filter(x => x !== String(ans)).slice(0, 2);

  /* ═════════════ MATHÉMATIQUES ═════════════ */
  function addWhy(a, b, ans) { const t = (10 - (a % 10)) % 10; return t && b > t ? `${a} + ${t} = ${a + t}, puis + ${b - t} = ${ans}` : `${a} + ${b} = ${ans}`; }
  function subWhy(a, b, ans) { const t = Math.floor(b / 10) * 10, u = b % 10; if (t && u) return `${a} − ${t} = ${a - t}, puis − ${u} = ${ans}`; const d = a - Math.floor(a / 10) * 10; return b > d && a > 10 ? `${a} − ${d} = ${a - d}, puis − ${b - d} = ${ans}` : `${a} − ${b} = ${ans}`; }
  function mulWhy(a, b, ans) {
    const m = Math.max(a, b), n = Math.min(a, b);
    if (n === 1) return `multiplier par 1 ne change rien : ${ans}`;
    if (n === 10) return `× 10 : on ajoute un zéro à ${m} → ${ans}`;
    if (n === 2) return `× 2, c'est le double : le double de ${m} = ${ans}`;
    if (n === 5) return `× 5, c'est la moitié de × 10 : moitié de ${m * 10} = ${ans}`;
    if (n === 9) return `× 9 = × 10 − une fois : ${m * 10} − ${m} = ${ans}`;
    if (n === 4) return `× 4, c'est le double du double : ${m} → ${m * 2} → ${ans}`;
    return `${m} × ${n} = ${m} × ${n - 1} + ${m} = ${m * (n - 1)} + ${m} = ${ans}`;
  }
  const M = {
    add20(r) { const a = R(r, 1, 12), b = R(r, 1, 20 - a), s = a + b; return Q(`${a} + ${b} = ?`, s, bad2(r, s, [s - 1, s + 1]), addWhy(a, b, s)); },
    sub20(r) { const a = R(r, 6, 20), b = R(r, 1, a - 1), d = a - b; return Q(`${a} − ${b} = ?`, d, bad2(r, d, [a + b, d + 1]), subWhy(a, b, d)); },
    compare(r) {
      const a = R(r, 12, 98), rev = +String(a).split('').reverse().join(''), c = R(r, 10, 99);
      const set = [...new Set([a, rev === a || rev < 10 ? a + 10 : rev, c])]; while (set.length < 3) set.push(R(r, 10, 99));
      const s = set.slice(0, 3), mx = Math.max(...s);
      return { q: 'Quel est le plus grand nombre ?', a: String(mx), bad: s.filter(v => v !== mx).map(String).slice(0, 2), why: `on compare d'abord les dizaines, puis les unités : ${mx} est le plus grand` };
    },
    add100(r) { const a = R(r, 11, 69), b = R(r, 5, 99 - a), s = a + b; return Q(`${a} + ${b} = ?`, s, bad2(r, s, [s + 10, s - 10]), addWhy(a, b, s)); },
    sub100(r) { const a = R(r, 20, 99), b = R(r, 3, a - 5), d = a - b; return Q(`${a} − ${b} = ?`, d, bad2(r, d, [d + 10, a + b]), subWhy(a, b, d)); },
    addBig(r) {
      if (r() < .5) { const a = R(r, 120, 780), b = R(r, 110, 999 - a), s = a + b, h = Math.floor(b / 100) * 100; return Q(`${a} + ${b} = ?`, s, bad2(r, s, [s + 100, s - 10]), `${a} + ${h} = ${a + h}, puis + ${b - h} = ${s}`); }
      const a = R(r, 300, 999), b = R(r, 110, a - 50), d = a - b, h = Math.floor(b / 100) * 100; return Q(`${a} − ${b} = ?`, d, bad2(r, d, [d + 100, d - 10]), `${a} − ${h} = ${a - h}, puis − ${b - h} = ${d}`);
    },
    tab(r, lo, hi, bmax = 10) { const a = R(r, lo, hi), b = R(r, 1, bmax), p = a * b; return Q(`${a} × ${b} = ?`, p, bad2(r, p, [a * (b + 1), a * (b - 1), a + b]), mulWhy(a, b, p)); },
    div(r) { const q = R(r, 2, 10), b = R(r, 2, 10), a = q * b; return Q(`${a} ÷ ${b} = ?`, q, bad2(r, q, [q + 1, q - 1, b]), `${a} ÷ ${b} = ${q} car ${q} × ${b} = ${a}`); },
    mult2(r) { let a = R(r, 12, 49); if (a % 10 === 0) a++; const b = R(r, 3, 9), t = Math.floor(a / 10) * 10, u = a % 10, p = a * b; return Q(`${a} × ${b} = ?`, p, bad2(r, p, [t * b + u, p + b, p - 10]), `${t} × ${b} = ${t * b}, ${u} × ${b} = ${u * b}, donc ${t * b} + ${u * b} = ${p}`); },
    fracOf(r) { const d = pick(r, [2, 3, 4, 5, 10]), k = R(r, 1, d - 1), w = d * R(r, 2, 12), ans = w / d * k; return Q(`${k}/${d} de ${w} = ?`, ans, bad2(r, ans, [w / k, w - ans, w / d]), k === 1 ? `${w} ÷ ${d} = ${ans}` : `${w} ÷ ${d} = ${w / d}, puis × ${k} = ${ans}`); },
    decimals(r) {
      if (r() < .5) { const a = R(r, 11, 89), b = R(r, 11, 89), s = a + b, naive = `${Math.floor(a / 10) + Math.floor(b / 10)},${a % 10 + b % 10}`;
        return Q(`${dec(a / 10)} + ${dec(b / 10)} = ?`, dec(s / 10), bad2(r, dec(s / 10), [naive, dec((s + 10) / 10), dec((s + 1) / 10), dec((s - 10) / 10)], false), `on aligne les virgules : ${a} dixièmes + ${b} dixièmes = ${s} dixièmes = ${dec(s / 10)}`); }
      const n = R(r, 101, 999) / 100, f = pick(r, [10, 100]), op = r() < .5 ? '×' : '÷', ans = op === '×' ? n * f : n / f;
      return Q(`${dec(n)} ${op} ${f} = ?`, dec(ans), bad2(r, dec(ans), [dec(op === '×' ? n * f / 10 : n / f * 10), dec(n) + '0'], false), `${op} ${f} : les chiffres ${op === '×' ? 'avancent' : 'reculent'} de ${f === 10 ? 'un rang' : 'deux rangs'} → ${dec(ans)}`);
    },
    percent(r) {
      const p = pick(r, [10, 20, 25, 50, 75]), base = pick(r, [20, 40, 60, 80, 120, 200, 240, 400]), ans = base * p / 100;
      const how = { 10: `10 % = 1/10 : ${base} ÷ 10 = ${ans}`, 20: `20 % = 2 × 10 % : ${base / 10} × 2 = ${ans}`, 25: `25 % = 1/4 : ${base} ÷ 4 = ${ans}`, 50: `50 % = la moitié : ${base} ÷ 2 = ${ans}`, 75: `75 % = 3/4 : ${base} ÷ 4 × 3 = ${ans}` }[p];
      return Q(`${p} % de ${base} = ?`, ans, bad2(r, ans, [base - ans, p, base / p]), how);
    },
    priority(r) {
      const a = R(r, 2, 9), b = R(r, 2, 9), c = R(r, 2, 9);
      if (r() < .5) { const ans = a + b * c; return Q(`${a} + ${b} × ${c} = ?`, ans, bad2(r, ans, [(a + b) * c]), `la multiplication passe avant l'addition : ${b} × ${c} = ${b * c}, puis ${a} + ${b * c} = ${ans}`); }
      const ans = (a + b) * c; return Q(`(${a} + ${b}) × ${c} = ?`, ans, bad2(r, ans, [a + b * c]), `les parenthèses d'abord : ${a} + ${b} = ${a + b}, puis × ${c} = ${ans}`);
    },
    relatives(r) {
      let a = R(r, -12, 12) || 3, b = R(r, -12, 12) || -4; if (a > 0 && b > 0) b = -b;   // au moins un nombre négatif
      const op = pick(r, ['+', '−', '×']);
      const ans = op === '+' ? a + b : op === '−' ? a - b : a * b;
      const why = op === '×' ? `signes : ${a < 0 === b < 0 ? 'deux signes pareils donnent +' : 'deux signes différents donnent −'} → ${neg(ans)}`
        : op === '−' ? `soustraire ${par(b)}, c'est ajouter ${par(-b)} : ${neg(a)} + ${par(-b)} = ${neg(ans)}` : `${neg(a)} + ${par(b)} = ${neg(ans)}`;
      return Q(`${neg(a)} ${op} ${par(b)} = ?`, neg(ans), bad2(r, neg(ans), [neg(-ans), op === '−' ? neg(a + b) : op === '+' ? neg(a - b) : neg(Math.abs(ans))]), why);
    },
    powers(r) {
      const k = R(r, 0, 2);
      if (k === 0) { const b = R(r, 2, 5), e = R(r, 2, b === 2 ? 6 : 3), ans = b ** e; return Q(`${b}${sup(e)} = ?`, ans, bad2(r, ans, [b * e, e ** b]), `${b}${sup(e)} = ${Array(e).fill(b).join(' × ')} = ${ans}`); }
      if (k === 1) { const n = R(r, 2, 13), s = n * n; return Q(`√${s} = ?`, n, bad2(r, n, [n * 2, n + 1]), `${n} × ${n} = ${s}, donc √${s} = ${n}`); }
      const e = R(r, 2, 6), ans = 10 ** e; return Q(`10${sup(e)} = ?`, ans, bad2(r, ans, [10 * e, 10 ** (e - 1)], false), `10${sup(e)} = 1 suivi de ${e} zéros`);
    },
    equation(r) {
      const x = R(r, -5, 12), a = R(r, 2, 9), b = R(r, -15, 15) || 4, c = a * x + b;
      const lhs = `${a}x ${b < 0 ? MINUS : '+'} ${Math.abs(b)}`;
      return Q(`${lhs} = ${neg(c)} · x = ?`, neg(x), bad2(r, neg(x), [neg((c + b) / a), neg(c - b), neg(x + 1)].filter(v => !String(v).includes('.'))), `${b < 0 ? 'on ajoute ' + Math.abs(b) : 'on retire ' + b} des deux côtés : ${a}x = ${neg(c - b)}, puis on divise par ${a} : x = ${neg(x)}`);
    },
    proportion(r) {
      const things = [['cahiers', 'cahier'], ['stylos', 'stylo'], ['croissants', 'croissant'], ['billets', 'billet'], ['bouteilles', 'bouteille']], [pl, sg] = pick(r, things);
      const u = R(r, 2, 9), n1 = R(r, 2, 6); let n2 = R(r, 3, 12); if (n2 === n1) n2++;
      const ans = n2 * u;
      return Q(`${n1} ${pl} coûtent ${n1 * u} CHF. Combien coûtent ${n2} ${pl} ?`, `${ans} CHF`, bad2(r, `${ans} CHF`, [`${n1 * u + (n2 - n1)} CHF`, `${ans + u} CHF`], false), `1 ${sg} coûte ${n1 * u} ÷ ${n1} = ${u} CHF, donc ${n2} × ${u} = ${ans} CHF`);
    },
    pythagoras(r) {
      const [a, b, c] = pick(r, [[3, 4, 5], [5, 12, 13], [8, 15, 17], [6, 8, 10], [9, 12, 15], [7, 24, 25], [12, 16, 20]]);
      if (r() < .6) return Q(`Triangle rectangle : côtés de l'angle droit ${a} et ${b}. Hypoténuse ?`, c, bad2(r, c, [a + b, c + 1]), `${a}² + ${b}² = ${a * a} + ${b * b} = ${c * c}, et √${c * c} = ${c}`);
      return Q(`Triangle rectangle : hypoténuse ${c}, un côté ${a}. L'autre côté ?`, b, bad2(r, b, [c - a, b + 1]), `${c}² − ${a}² = ${c * c} − ${a * a} = ${b * b}, et √${b * b} = ${b}`);
    },
    linear(r) {
      if (r() < .6) {
        const m = R(r, -4, 5) || 2, p = R(r, -9, 9), x = R(r, -3, 6), ans = m * x + p;
        const f = `${m === 1 ? '' : m === -1 ? MINUS : neg(m)}x${p ? (p < 0 ? ` ${MINUS} ${-p}` : ` + ${p}`) : ''}`;
        return Q(`f(x) = ${f} · f(${neg(x)}) = ?`, neg(ans), bad2(r, neg(ans), [neg(m * x - p), neg(m + x + p)]), `on remplace x par ${par(x)} : ${neg(m)} × ${par(x)}${p ? (p < 0 ? ` ${MINUS} ${-p}` : ` + ${p}`) : ''} = ${neg(ans)}`);
      }
      const m = R(r, -3, 4) || 1, x1 = R(r, -2, 3), dx = R(r, 1, 4), y1 = R(r, -5, 6), x2 = x1 + dx, y2 = y1 + m * dx;
      return Q(`Pente de la droite passant par (${neg(x1)} ; ${neg(y1)}) et (${neg(x2)} ; ${neg(y2)}) ?`, neg(m), bad2(r, neg(m), [neg(-m), dx !== m * dx ? dec(dx / (m * dx)) : neg(m + 1)]), `pente = (${neg(y2)} ${MINUS} ${par(y1)}) ÷ (${neg(x2)} ${MINUS} ${par(x1)}) = ${neg(m * dx)} ÷ ${dx} = ${neg(m)}`);
    },
    expand(r) {
      const a = R(r, 2, 9), k = R(r, 2, 7), v = R(r, 0, 2);
      if (v === 0) return Q(`Développe : ${k}(x + ${a})`, `${k}x + ${k * a}`, [`${k}x + ${a}`, `${k + a}x`], `on multiplie chaque terme par ${k} : ${k} × x + ${k} × ${a}`);
      if (v === 1) return Q(`Développe : (x + ${a})²`, `x² + ${2 * a}x + ${a * a}`, [`x² + ${a * a}`, `x² + ${a}x + ${a * a}`], `(a + b)² = a² + 2ab + b² : x² + 2 × ${a}x + ${a}²`);
      return Q(`Développe : (x + ${a})(x ${MINUS} ${a})`, `x² ${MINUS} ${a * a}`, [`x² + ${a * a}`, `x² ${MINUS} ${2 * a}x`], `(a + b)(a − b) = a² − b² : x² − ${a}² = x² − ${a * a}`);
    },
    derivative(r) {
      const v = R(r, 0, 3);
      if (v === 0) { const a = R(r, 2, 9), n = R(r, 2, 5), c = a * n; return Q(`f(x) = ${a}x${sup(n)} · f′(x) = ?`, `${c}x${n - 1 > 1 ? sup(n - 1) : ''}`, [`${a}x${sup(n - 1)}`, `${c}x${sup(n)}`], `(xⁿ)′ = n·xⁿ⁻¹ : ${n} × ${a}x${n - 1 > 1 ? sup(n - 1) : ''} = ${c}x${n - 1 > 1 ? sup(n - 1) : ''}`); }
      if (v === 1) { const a = R(r, 2, 6), b = R(r, 2, 9), c = R(r, 1, 9); return Q(`f(x) = ${a}x² + ${b}x + ${c} · f′(x) = ?`, `${2 * a}x + ${b}`, [`${2 * a}x + ${b + c}`, `${a}x + ${b}`], `on dérive terme à terme : (${a}x²)′ = ${2 * a}x, (${b}x)′ = ${b}, (${c})′ = 0`); }
      if (v === 2) return Q('f(x) = eˣ · f′(x) = ?', 'eˣ', ['x·eˣ⁻¹', '0'], 'la fonction exponentielle est sa propre dérivée');
      return Q('f(x) = ln(x) · f′(x) = ?', '1/x', ['ln(x)/x', 'eˣ'], '(ln x)′ = 1/x pour x > 0');
    },
    logs(r) {
      const v = R(r, 0, 3);
      if (v === 0) { const k = R(r, 1, 6), n = 10 ** k; return Q(`log₁₀(${n}) = ?`, k, bad2(r, k, [n / 10, k + 1, k - 1, n], false), `10${sup(k)} = ${n}, donc log₁₀(${n}) = ${k}`); }
      if (v === 1) { const k = R(r, 2, 7), n = 2 ** k; return Q(`log₂(${n}) = ?`, k, bad2(r, k, [n / 2, k + 1, k - 1, n], false), `2${sup(k)} = ${n}, donc log₂(${n}) = ${k}`); }
      if (v === 2) { const k = R(r, 2, 6); return Q(`ln(e${sup(k)}) = ?`, k, [`e${sup(k)}`, String(k + 1)], 'ln et exp sont réciproques : ln(eᵏ) = k'); }
      return Q('e⁰ = ?', '1', ['0', 'e'], 'tout nombre non nul à la puissance 0 vaut 1');
    },
    sequences(r) {
      if (r() < .6) { const a = R(r, -5, 9), d = R(r, 2, 7), n = R(r, 4, 10), ans = a + (n - 1) * d;
        return Q(`Suite arithmétique : u${sub(1)} = ${neg(a)}, r = ${d}. u${sub(n)} = ?`, neg(ans), bad2(r, neg(ans), [neg(a + n * d), neg(a + (n - 2) * d)]), `uₙ = u₁ + (n − 1)·r = ${neg(a)} + ${n - 1} × ${d} = ${neg(ans)}`); }
      const a = R(r, 1, 5), q = pick(r, [2, 3]), n = R(r, 3, 6), ans = a * q ** (n - 1);
      return Q(`Suite géométrique : u${sub(1)} = ${a}, q = ${q}. u${sub(n)} = ?`, ans, bad2(r, ans, [a * q ** n, a + (n - 1) * q]), `uₙ = u₁·qⁿ⁻¹ = ${a} × ${q}${sup(n - 1)} = ${ans}`);
    },
    probability(r) {
      const v = R(r, 0, 3);
      if (v === 0) { const rr = R(r, 1, 7), b = R(r, 1, 9); return Q(`Une urne : ${rr} boules rouges et ${b} bleues. P(rouge) ?`, frac(rr, rr + b), uniq2(frac(rr, rr + b), [`${rr}/${b}`, frac(b, rr + b), "1/2", "1/3"]), `cas favorables ÷ cas possibles = ${rr} ÷ ${rr + b}`); }
      if (v === 1) { const ev = pick(r, [['un nombre pair', 3], ['un 6', 1], ['un nombre supérieur à 4', 2], ['un multiple de 3', 2]]); return Q(`On lance un dé. P(${ev[0]}) ?`, frac(ev[1], 6), uniq2(frac(ev[1], 6), [frac(ev[1] + 1, 6), frac(1, ev[1] + 1), "1/2", "1/3", "1/6"]), `${ev[1]} cas favorables sur 6 → ${frac(ev[1], 6)}`); }
      if (v === 2) return Q('Deux pièces lancées. P(deux « pile ») ?', '1/4', ['1/2', '1/3'], 'PP, PF, FP, FF : 1 cas sur 4 (1/2 × 1/2)');
      return Q('Jeu de 52 cartes. P(tirer un as) ?', '1/13', ['1/52', '1/4'], '4 as sur 52 cartes : 4/52 = 1/13');
    },
  };

  /* ═════════════ FRANÇAIS : conjugaison par règles ═════════════ */
  const V1 = ['chanter', 'parler', 'manger', 'danser', 'jouer', 'aimer', 'regarder', 'écouter', 'trouver', 'habiter', 'marcher', 'penser',
    'dessiner', 'sauter', 'gagner', 'chercher', 'lancer', 'porter', 'travailler', 'apporter', 'garder', 'rester', 'nager', 'commencer', 'avancer', 'ranger', 'bouger'];
  const PRON_SHOW = ['je', 'tu', 'il / elle', 'nous', 'vous', 'ils / elles'];
  const vowel = w => /^[aeéèêiîoôuûh]/.test(w);
  function stem(v, ending) { // manger → mange-ons ; lancer → lanç-ons (devant a, â, o)
    let r = v.slice(0, -2);
    if (/^[aâo]/.test(ending)) { if (r.endsWith('g')) r += 'e'; else if (r.endsWith('c')) r = r.slice(0, -1) + 'ç'; }
    return r;
  }
  const END = {
    pres: ['e', 'es', 'e', 'ons', 'ez', 'ent'], imp: ['ais', 'ais', 'ait', 'ions', 'iez', 'aient'],
    ps: ['ai', 'as', 'a', 'âmes', 'âtes', 'èrent'], subj: ['e', 'es', 'e', 'ions', 'iez', 'ent'],
  };
  const FUT = ['ai', 'as', 'a', 'ons', 'ez', 'ont'], COND = ['ais', 'ais', 'ait', 'ions', 'iez', 'aient'];
  function form(v, tense, p) {
    if (tense === 'fut') return v + FUT[p];
    if (tense === 'cond') return v + COND[p];
    const e = END[tense][p]; return stem(v, e) + e;
  }
  const LABEL = { pres: 'Présent', imp: 'Imparfait', fut: 'Futur', cond: 'Conditionnel', ps: 'Passé simple', subj: 'Subjonctif' };
  function prompt(tense, p, verb, first) {
    const pr = p === 0 && vowel(first) ? 'j’' : PRON_SHOW[p] + ' ';
    return tense === 'subj' ? `Subjonctif : il faut que ${pr}___ (${verb})`.replace('que j’', 'que j’') : `${LABEL[tense]} : ${pr}___ (${verb})`;
  }
  function conj(r, tense) {
    const v = pick(r, V1), p = R(r, 0, 5), ans = form(v, tense, p), raw = v.slice(0, -2), pool = [];
    const add = x => { if (x && x !== ans && !pool.includes(x)) pool.push(x); };
    // erreurs typiques en premier
    if (tense === 'pres' && p === 3 && /[gc]$/.test(raw)) add(raw + 'ons');
    if (tense === 'imp' && p <= 2 && /[gc]$/.test(raw)) add(raw + END.imp[p]);
    if (tense === 'imp' && p === 3 && raw.endsWith('g')) add(raw + 'eions');
    if (tense === 'fut') { if (p === 0) add(v + 'ais'); add(raw + (p === 0 ? 'rai' : FUT[p])); }
    if (tense === 'cond') { add(form(v, 'fut', p)); add(form(v, 'imp', p)); }
    if (tense === 'ps') { if (p === 5) add(raw + 'airent'); if (p === 2) add(raw + 'at'); add(form(v, 'imp', p)); }
    if (tense === 'subj') { if (p === 3 || p === 4) add(form(v, 'pres', p)); }
    for (let k = 0; k < 6; k++) add(form(v, tense, k));
    if (tense === 'pres') add(form(v, 'imp', p)); else add(form(v, 'pres', p));
    const why = tense === 'fut' ? `Futur : l'infinitif « ${v} » + -${FUT[p]} → ${ans}`
      : tense === 'cond' ? `Conditionnel : radical du futur « ${v} » + terminaison de l'imparfait -${COND[p]} → ${ans}`
      : tense === 'ps' ? `Passé simple des verbes en -er : -ai, -as, -a, -âmes, -âtes, -èrent → ${ans}`
      : tense === 'subj' ? `Subjonctif : radical de « ils ${form(v, 'pres', 5)} » + -${END.subj[p]} → que ${p === 0 && vowel(ans) ? 'j’' : PRON_SHOW[p].split(' ')[0] + ' '}${ans}`
      : (() => { const e = END[tense][p], sp = /^[aâo]/.test(e) && /[gc]$/.test(raw); return `${LABEL[tense]} : radical « ${raw}- » + -${e}` + (sp ? (raw.endsWith('g') ? ` · on garde un e pour le son « ge »` : ` · le c devient ç pour le son « s »`) : '') + ` → ${ans}`; })();
    return { q: prompt(tense, p, v, ans), a: ans, bad: [pool[0], ...U.shuffle(r, pool.slice(1))].slice(0, 2), why };
  }
  const IRR = {
    être: ['suis', 'es', 'est', 'sommes', 'êtes', 'sont'], avoir: ['ai', 'as', 'a', 'avons', 'avez', 'ont'],
    aller: ['vais', 'vas', 'va', 'allons', 'allez', 'vont'], faire: ['fais', 'fais', 'fait', 'faisons', 'faites', 'font'],
  };
  const IRR_ERR = { aller: { 5: 'allent', 3: 'vons' }, faire: { 4: 'faisez', 5: 'faisent' }, être: { 4: 'sommez', 5: 'sons' }, avoir: { 5: 'avent', 3: 'ons' } };
  const IRR_SUBJ = { être: ['sois', 'sois', 'soit', 'soyons', 'soyez', 'soient'], avoir: ['aie', 'aies', 'ait', 'ayons', 'ayez', 'aient'],
    aller: ['aille', 'ailles', 'aille', 'allions', 'alliez', 'aillent'], faire: ['fasse', 'fasses', 'fasse', 'fassions', 'fassiez', 'fassent'] };
  function irr(r, table = IRR, label = 'Présent') {
    const v = pick(r, Object.keys(table)), p = R(r, 0, 5), ans = table[v][p], pool = [];
    const add = x => { if (x && x !== ans && !pool.includes(x)) pool.push(x); };
    if (table === IRR) add((IRR_ERR[v] || {})[p]); else add(IRR[v][p]);
    U.shuffle(r, table[v].slice()).forEach(add);
    const line = PRON_SHOW.map((w, i) => (i === 0 && vowel(table[v][0]) ? 'j’' : w.split(' ')[0] + ' ') + table[v][i]).join(', ');
    const pr = p === 0 && vowel(ans) ? 'j’' : PRON_SHOW[p] + ' ';
    return { q: table === IRR ? `Présent : ${pr}___ (${v})` : `Subjonctif : il faut que ${pr}___ (${v})`, a: ans, bad: pool.slice(0, 2), why: `${v} au ${label.toLowerCase()} : ${table === IRR ? '' : 'que '}${line}` };
  }
  const PC = [
    { v: 'manger', aux: 'avoir', pp: 'mangé' }, { v: 'finir', aux: 'avoir', pp: 'fini' }, { v: 'prendre', aux: 'avoir', pp: 'pris' },
    { v: 'voir', aux: 'avoir', pp: 'vu' }, { v: 'faire', aux: 'avoir', pp: 'fait' }, { v: 'dire', aux: 'avoir', pp: 'dit' },
    { v: 'mettre', aux: 'avoir', pp: 'mis' }, { v: 'écrire', aux: 'avoir', pp: 'écrit' }, { v: 'lire', aux: 'avoir', pp: 'lu' },
    { v: 'aller', aux: 'être', pp: 'allé' }, { v: 'venir', aux: 'être', pp: 'venu' }, { v: 'partir', aux: 'être', pp: 'parti' },
    { v: 'arriver', aux: 'être', pp: 'arrivé' }, { v: 'tomber', aux: 'être', pp: 'tombé' }, { v: 'rester', aux: 'être', pp: 'resté' },
  ];
  const PC_P = [ // [affichage, avoir, être, genre, nombre, index imparfait]
    ['j’', 'ai', 'suis', 'm', 's', 0], ['tu ', 'as', 'es', 'm', 's', 1], ['il ', 'a', 'est', 'm', 's', 2], ['elle ', 'a', 'est', 'f', 's', 2],
    ['nous ', 'avons', 'sommes', 'm', 'p', 3], ['vous ', 'avez', 'êtes', 'm', 'p', 4], ['ils ', 'ont', 'sont', 'm', 'p', 5], ['elles ', 'ont', 'sont', 'f', 'p', 5],
  ];
  const IMP_AV = ['avais', 'avais', 'avait', 'avions', 'aviez', 'avaient'], IMP_ET = ['étais', 'étais', 'était', 'étions', 'étiez', 'étaient'];
  function compound(r, pqp) {
    const vb = pick(r, PC), p = pick(r, PC_P), etre = vb.aux === 'être';
    const agree = (g, n) => vb.pp + (g === 'f' ? 'e' : '') + (n === 'p' ? 's' : '');
    const auxOk = pqp ? (etre ? IMP_ET : IMP_AV)[p[5]] : (etre ? p[2] : p[1]), auxKo = pqp ? (etre ? IMP_AV : IMP_ET)[p[5]] : (etre ? p[1] : p[2]);
    const part = etre ? agree(p[3], p[4]) : vb.pp, ans = auxOk + ' ' + part, pool = [];
    const add = x => { if (x !== ans && !pool.includes(x)) pool.push(x); };
    add(auxKo + ' ' + (etre ? vb.pp : agree(p[3], p[4])));
    if (etre && (p[3] === 'f' || p[4] === 'p')) add(auxOk + ' ' + vb.pp);
    if (pqp) add((etre ? p[2] : p[1]) + ' ' + part);       // passé composé au lieu du plus-que-parfait
    add(auxOk + ' ' + vb.v);
    const shownRaw = p[0] === 'j’' && (etre || pqp) ? 'je ' : p[0], shown = pqp && p[0] === 'j’' ? 'j’' : shownRaw;
    const why = (pqp ? `Plus-que-parfait = auxiliaire à l'imparfait + participe. ` : '') + (etre ? `« ${vb.v} » se conjugue avec être : le participe s'accorde avec le sujet → ${part}` : `« ${vb.v} » se conjugue avec avoir : pas d'accord avec le sujet → ${vb.pp}`);
    return { q: `${pqp ? 'Plus-que-parfait' : 'Passé composé'} : ${shown}___ (${vb.v})`, a: ans, bad: U.shuffle(r, pool).slice(0, 2), why };
  }

  /* ═════════════ Banques (banques.js) ═════════════ */
  const BANKS = {};
  for (const [id, txt] of Object.entries(typeof BANQUES !== 'undefined' ? BANQUES : {})) {
    BANKS[id] = txt.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#')).map(l => l.split('|').map(s => s.trim()))
      .filter(p => p.length >= 4 && p[0] && p[1] && p[2] && p[3]).map(p => ({ q: p[0], a: p[1], bad: [p[2], p[3]], why: p[4] || '' }));
  }
  const bank = id => r => { const it = pick(r, BANKS[id]); return { q: it.q, a: it.a, bad: U.shuffle(r, it.bad.slice()), why: it.why }; };

  /* ═════════════ Catalogue des thèmes : matière, nom, années (HarmoS 3 = 3P … 14 = DP 2) ═════════════ */
  const T = (id, sub, name, y0, y1, gen, size) => ({ id, sub, name, years: [y0, y1], gen, size: size || (BANKS[id] ? BANKS[id].length : 20) });
  const THEMES = [
    T('m.add20', 'math', 'Additions jusqu’à 20', 3, 4, M.add20),
    T('m.sub20', 'math', 'Soustractions jusqu’à 20', 3, 4, M.sub20),
    T('m.compare', 'math', 'Comparer les nombres', 3, 4, M.compare),
    T('m.add100', 'math', 'Additions jusqu’à 100', 4, 5, M.add100),
    T('m.sub100', 'math', 'Soustractions jusqu’à 100', 4, 6, M.sub100),
    T('m.tab2510', 'math', 'Tables × 2, × 5, × 10', 4, 5, r => { const a = pick(r, [2, 5, 10]); return M.tab(r, a, a); }),
    T('m.tab', 'math', 'Tables × 2 à × 10', 5, 6, r => M.tab(r, 2, 10)),
    T('m.addBig', 'math', 'Additions et soustractions jusqu’à 1000', 5, 6, M.addBig),
    T('m.tabmix', 'math', 'Tables jusqu’à × 12', 6, 8, r => M.tab(r, 2, 12, 12)),
    T('m.div', 'math', 'Divisions', 6, 8, M.div),
    T('m.geo', 'math', 'Géométrie : formes, périmètre, aire', 4, 8, bank('m.geo')),
    T('m.mult2', 'math', 'Multiplier un nombre à deux chiffres', 7, 8, M.mult2),
    T('m.frac', 'math', 'Fractions d’un nombre', 7, 8, M.fracOf),
    T('m.dec', 'math', 'Nombres décimaux', 7, 9, M.decimals),
    T('m.pct', 'math', 'Pourcentages', 8, 11, M.percent),
    T('m.prio', 'math', 'Priorités des opérations', 9, 10, M.priority),
    T('m.rel', 'math', 'Nombres relatifs', 9, 10, M.relatives),
    T('m.pow', 'math', 'Puissances et racines carrées', 9, 11, M.powers),
    T('m.prop', 'math', 'Proportionnalité', 9, 11, M.proportion),
    T('m.eq1', 'math', 'Équations du premier degré', 10, 12, M.equation),
    T('m.pyth', 'math', 'Théorème de Pythagore', 11, 12, M.pythagoras),
    T('m.dev', 'math', 'Développer : identités remarquables', 11, 12, M.expand),
    T('m.lin', 'math', 'Fonctions affines', 11, 13, M.linear),
    T('m.proba', 'math', 'Probabilités', 12, 14, M.probability),
    T('m.seq', 'math', 'Suites arithmétiques et géométriques', 13, 14, M.sequences),
    T('m.deriv', 'math', 'Dérivées', 13, 14, M.derivative),
    T('m.log', 'math', 'Logarithmes et exponentielle', 13, 14, M.logs),

    T('f.pres1', 'fr', 'Présent des verbes en -er', 3, 5, r => conj(r, 'pres')),
    T('f.presirr', 'fr', 'Présent : être, avoir, aller, faire', 3, 5, r => irr(r)),
    T('f.homo1', 'fr', 'Homophones : a/à, et/est, on/ont, son/sont', 4, 7, bank('f.homo1')),
    T('f.voc', 'fr', 'Synonymes et contraires', 4, 7, bank('f.voc')),
    T('f.imp', 'fr', 'Imparfait', 5, 7, r => conj(r, 'imp')),
    T('f.fut', 'fr', 'Futur simple', 5, 7, r => conj(r, 'fut')),
    T('f.gram', 'fr', 'Nature des mots, pluriels, féminins', 5, 8, bank('f.gram')),
    T('f.pc', 'fr', 'Passé composé', 6, 8, r => compound(r, false)),
    T('f.cond', 'fr', 'Conditionnel présent', 7, 9, r => conj(r, 'cond')),
    T('f.ps', 'fr', 'Passé simple (verbes en -er)', 7, 9, r => conj(r, 'ps')),
    T('f.homo2', 'fr', 'Homophones : ces/ses/c’est/s’est, leur/leurs…', 7, 10, bank('f.homo2')),
    T('f.fonc', 'fr', 'Fonctions dans la phrase', 8, 11, bank('f.fonc')),
    T('f.subj', 'fr', 'Subjonctif présent', 9, 11, r => (r() < .6 ? conj(r, 'subj') : irr(r, IRR_SUBJ, 'Subjonctif'))),
    T('f.pqp', 'fr', 'Plus-que-parfait', 9, 11, r => compound(r, true)),
    T('f.figures', 'fr', 'Figures de style', 9, 14, bank('f.figures')),
    T('f.litt', 'fr', 'Genres et mouvements littéraires', 11, 14, bank('f.litt')),
    T('f.analyse', 'fr', 'Analyse de texte : tonalités, focalisation, registres', 12, 14, bank('f.analyse')),

    T('e.voc1', 'en', 'Vocabulaire A1 : animaux, couleurs, nombres', 3, 6, bank('e.voc1')),
    T('e.voc2', 'en', 'Vocabulaire A1 : maison, école, nature', 4, 7, bank('e.voc2')),
    T('e.be', 'en', 'A1 · To be, présent simple', 5, 8, bank('e.be')),
    T('e.irr', 'en', 'A2 · Pluriels et passés irréguliers', 7, 9, bank('e.irr')),
    T('e.cont', 'en', 'A2 · Présent simple ou présent continu', 7, 9, bank('e.cont')),
    T('e.comp', 'en', 'A2 · Comparatifs, superlatifs, modaux', 8, 10, bank('e.comp')),
    T('e.pp', 'en', 'B1 · Present perfect ou prétérit', 9, 11, bank('e.pp')),
    T('e.cond', 'en', 'B1 · Les conditionnels (if…)', 10, 12, bank('e.cond')),
    T('e.pass', 'en', 'B1-B2 · Passif et discours indirect', 11, 13, bank('e.pass')),
    T('e.phr', 'en', 'B2 · Phrasal verbs et expressions', 11, 14, bank('e.phr')),
    T('e.link', 'en', 'B2 · Connecteurs logiques (English B)', 12, 14, bank('e.link')),

    T('d.nom', 'de', 'A1 · Noms et articles', 5, 8, bank('d.nom')),
    T('d.adj', 'de', 'A1 · Couleurs et adjectifs', 5, 7, bank('d.adj')),
    T('d.phr', 'de', 'A1 · Premières phrases : sein, haben', 5, 8, bank('d.phr')),
    T('d.plur', 'de', 'A1-A2 · Pluriels et articles', 7, 9, bank('d.plur')),
    T('d.verb', 'de', 'A2 · Le présent des verbes', 7, 9, bank('d.verb')),
    T('d.akk', 'de', 'A2 · Accusatif et datif', 9, 11, bank('d.akk')),
    T('d.perf', 'de', 'A2 · Le Perfekt', 9, 11, bank('d.perf')),
    T('d.modal', 'de', 'A2 · Verbes de modalité', 9, 11, bank('d.modal')),
    T('d.neben', 'de', 'B1 · Subordonnées : weil, dass, wenn, als', 11, 13, bank('d.neben')),
    T('d.konj', 'de', 'B1-B2 · Konjunktiv II et Präteritum', 12, 14, bank('d.konj')),
  ];
  const byId = {}; THEMES.forEach(t => byId[t.id] = t);

  // Thèmes d'une matière pour une année : ceux de l'année, et ceux des années passées (révision)
  function themesFor(sub, y) {
    const all = THEMES.filter(t => t.sub === sub);
    return { mine: all.filter(t => t.years[0] <= y && y <= t.years[1]), before: all.filter(t => t.years[1] < y), after: all.filter(t => t.years[0] > y) };
  }
  function generate(r, themeId) { const t = byId[themeId]; const it = t.gen(r); it.t = themeId; return it; }

  /* ─── Session : une partie. Plusieurs thèmes = mélange (entrelacement). Révisions dues du carnet de mémoire. ─── */
  function Session(themeIds, seed, useMemory = true) {
    const r = U.rng(seed), recent = [], retry = [];
    let sinceRetry = 0;
    return {
      themes: themeIds, missed: [], asked: 0, right: 0, reviewed: 0, learned: 0,
      next() {
        let it = null;
        if (retry.length && sinceRetry >= 2) { it = retry.shift(); it = { ...it, bad: it.bad.slice(), retry: true }; sinceRetry = 0; }
        else {
          const due = useMemory ? Memory.due(themeIds).filter(e => !recent.includes(e.q)) : [];
          if (due.length && r() < .35) { const e = pick(r, due); it = { q: e.q, a: e.a, bad: U.shuffle(r, e.bad.slice()), why: e.why, t: e.t, review: true }; }
          else for (let k = 0; k < 12; k++) { it = generate(r, pick(r, themeIds)); if (!recent.includes(it.q)) break; }
          sinceRetry++;
        }
        recent.push(it.q); if (recent.length > 6) recent.shift();
        this.asked++;
        return it;
      },
      result(it, ok) {
        if (useMemory) { const before = Memory.box(it.t, it.q); Memory.record(it.t, it, ok); if (ok && before >= 3) this.learned++; }
        if (it.review) this.reviewed++;
        if (ok) { this.right++; return; }
        if (!this.missed.some(m => m.q === it.q)) this.missed.push({ q: it.q, a: it.a, why: it.why });
        if (!it.retry) retry.push(it);
      },
    };
  }

  // Autotest : chaque thème produit 200 questions valables (réponse jamais parmi les erreurs, 2 erreurs distinctes, pas de « NaN »)
  function selfTest() {
    const r = U.rng(7), errors = [];
    for (const t of THEMES) for (let n = 0; n < 200; n++) {
      let it; try { it = generate(r, t.id); } catch (e) { errors.push([t.id, 'plantage : ' + e.message]); break; }
      const bad = !it.q || !it.a || !it.bad || it.bad.length < 2 || it.bad.includes(it.a) || it.bad[0] === it.bad[1] || [it.q, it.a, ...it.bad, it.why || ''].some(s => /NaN|undefined|Infinity/.test(String(s)));
      if (bad) { errors.push([t.id, it]); break; }
    }
    for (const id of Object.keys(BANKS)) if (!byId[id]) errors.push([id, 'banque sans thème']);
    return errors;
  }

  return { SUBJECTS, THEMES, theme: id => byId[id], themesFor, generate, Session, selfTest, BANKS };
})();

/* ══════════════════════════════════════════════════════════════════════════
   Carnet de mémoire (répétition espacée, boîtes de Leitner), un par profil, conservé sur l'appareil.
   Juste : la question monte d'une boîte et revient plus tard ; fausse : elle retombe en boîte 1 et revient vite.
   Espacer les rappels améliore nettement la mémoire à long terme (Cepeda et al. 2006) ;
   se tester vaut mieux que relire (Roediger & Karpicke 2006).
   ══════════════════════════════════════════════════════════════════════════ */
const Memory = (() => {
  const H = 36e5, GAP = [0, 0, 20 * H, 3 * 24 * H, 7 * 24 * H, 21 * 24 * H]; // délai avant retour, par boîte
  let KEY = 'rtl-memoire-v2:invite', data = {};
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { } };
  const key = (t, q) => t + '|' + q;
  return {
    use(profileId) { KEY = 'rtl-memoire-v2:' + profileId; try { data = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { data = {}; } },
    due(themeIds, now = Date.now()) { const set = new Set(themeIds); return Object.values(data).filter(e => set.has(e.t) && e.due <= now && e.box < 5); },
    box(t, q) { const e = data[key(t, q)]; return e ? e.box : 0; },
    record(t, it, ok) {
      const k = key(t, it.q), e = data[k] || { q: it.q, a: it.a, bad: it.bad.slice(0, 2), why: it.why || '', t, box: 1, seen: 0, ok: 0 };
      e.seen++; e.last = Date.now();
      if (ok) { e.ok++; e.box = Math.min(5, e.box + 1); } else e.box = 1;
      e.due = Date.now() + GAP[e.box];
      data[k] = e; save();
    },
    // maîtrise d'un thème : 0 à 1 (une question en boîte 4 ou 5 compte comme « possédée »)
    mastery(t) {
      const es = Object.values(data).filter(e => e.t === t), pts = es.reduce((s, e) => s + Math.min(e.box - 1, 3) / 3, 0), size = (Quiz.theme(t) || {}).size || 20;
      return { seen: es.length, pct: Math.min(1, pts / size), owned: es.filter(e => e.box >= 4).length };
    },
    stars(t) { const m = this.mastery(t).pct; return m >= .9 ? 3 : m >= .6 ? 2 : m >= .3 ? 1 : 0; },
    totalOwned() { return Object.values(data).filter(e => e.box >= 4).length; },
    reset() { data = {}; save(); },
  };
})();
