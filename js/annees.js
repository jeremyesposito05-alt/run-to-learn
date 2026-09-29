'use strict';
/* ══════════════════════════════════════════════════════════════════════════
   Années scolaires : correspondance système suisse (HarmoS, Vaud) ↔ Beau Soleil (Grades, IB MYP / DP).
   Le jeu range tout son contenu sur l'échelle HarmoS « y » : 3 = 3P … 11 = 11S, puis 12-14 = secondaire II.
   Découpage validé par Jeremy Esposito (Beau Soleil) le 29.09.2026 : MYP 1 = Grade 6 = 8P, DP 1 = Grade 11.
   ══════════════════════════════════════════════════════════════════════════ */
const YEARS = [
  { y: 3,  ch: '3P',  grade: 1,  ib: 'PYP',   age: '6-7 ans',   cycle: 'Cycle 1' },
  { y: 4,  ch: '4P',  grade: 2,  ib: 'PYP',   age: '7-8 ans',   cycle: 'Cycle 1' },
  { y: 5,  ch: '5P',  grade: 3,  ib: 'PYP',   age: '8-9 ans',   cycle: 'Cycle 2' },
  { y: 6,  ch: '6P',  grade: 4,  ib: 'PYP',   age: '9-10 ans',  cycle: 'Cycle 2' },
  { y: 7,  ch: '7P',  grade: 5,  ib: 'PYP',   age: '10-11 ans', cycle: 'Cycle 2' },
  { y: 8,  ch: '8P',  grade: 6,  ib: 'MYP 1', age: '11-12 ans', cycle: 'Cycle 2' },
  { y: 9,  ch: '9S',  grade: 7,  ib: 'MYP 2', age: '12-13 ans', cycle: 'Cycle 3' },
  { y: 10, ch: '10S', grade: 8,  ib: 'MYP 3', age: '13-14 ans', cycle: 'Cycle 3' },
  { y: 11, ch: '11S', grade: 9,  ib: 'MYP 4', age: '14-15 ans', cycle: 'Cycle 3' },
  { y: 12, ch: '1re sec. II', grade: 10, ib: 'MYP 5', age: '15-16 ans', cycle: 'Secondaire II' },
  { y: 13, ch: '2e sec. II',  grade: 11, ib: 'DP 1',  age: '16-17 ans', cycle: 'Secondaire II' },
  { y: 14, ch: '3e sec. II',  grade: 12, ib: 'DP 2',  age: '17-18 ans', cycle: 'Secondaire II' },
];
const Years = {
  get: y => YEARS.find(e => e.y === y) || YEARS[0],
  label: y => { const e = Years.get(y); return `${e.ch} · Grade ${e.grade} · ${e.ib}`; },
  short: y => { const e = Years.get(y); return `${e.ch} · G${e.grade}`; },
  // année conseillée d'après la date de naissance (rentrée fin août, date limite suisse au 31 juillet)
  fromBirth(birth, now = new Date()) {
    const b = new Date(birth); if (isNaN(b)) return null;
    let schoolYear = now.getFullYear() - (now.getMonth() < 7 ? 1 : 0);       // année de la rentrée en cours
    let age = schoolYear - b.getFullYear() - (b.getMonth() > 6 ? 1 : 0);        // âge au 31 juillet
    return Math.max(3, Math.min(14, age - 3));                                   // 6 ans révolus → 3P
  },
};
