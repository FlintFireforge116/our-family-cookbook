const wrap = body => `<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">${body}</svg>`

export const icons = {
  recipes: wrap('<path d="M11 37h42c-2 12-10 18-21 18S13 49 11 37Z"/><path d="M16 37c2-9 9-14 16-14s14 5 16 14"/><path d="M24 18c1-4 4-7 8-7s7 3 8 7"/><path d="M21 30c4-2 7 3 11 0s7 2 11 0"/>'),
  add: wrap('<path d="M13 12h28a8 8 0 0 1 8 8v32H20a7 7 0 0 1-7-7V12Z"/><path d="M20 18h20M20 25h16"/><path d="M45 36v16M37 44h16"/>'),
  tags: wrap('<path d="M10 18v16l20 20 24-24-20-20H18a8 8 0 0 0-8 8Z"/><circle cx="22" cy="22" r="4"/><path d="M34 29h11M31 35h9"/>'),
  random: wrap('<path d="M11 42h8c12 0 14-20 26-20h8"/><path d="m46 15 8 7-8 7"/><path d="M11 22h8c5 0 8 3 11 8"/><path d="M35 37c3 4 6 5 10 5h8"/><path d="m46 35 8 7-8 7"/>'),
  week: wrap('<rect x="10" y="13" width="44" height="41" rx="6"/><path d="M20 9v9M44 9v9M10 25h44"/><path d="M19 33h7M31 33h7M43 33h3M19 42h7M31 42h7M43 42h3"/>'),
  settings: wrap('<circle cx="32" cy="32" r="8"/><path d="M32 9v7M32 48v7M9 32h7M48 32h7M16 16l5 5M43 43l5 5M48 16l-5 5M21 43l-5 5"/>'),
  clock: wrap('<circle cx="32" cy="32" r="22"/><path d="M32 19v14l10 6"/>'),
  book: wrap('<path d="M12 14h18a8 8 0 0 1 8 8v31a8 8 0 0 0-8-8H12V14Z"/><path d="M52 14H38v39a8 8 0 0 1 8-8h6V14Z"/>'),
  home: wrap('<path d="m9 31 23-20 23 20"/><path d="M16 27v27h32V27M27 54V39h10v15"/>'),
  back: wrap('<path d="m39 13-19 19 19 19"/>'),
  camera: wrap('<path d="M13 20h9l4-6h12l4 6h9a5 5 0 0 1 5 5v25H8V25a5 5 0 0 1 5-5Z"/><circle cx="32" cy="35" r="10"/>'),
}

export function heroStillLife() {
  return `<svg class="hero-still-life" viewBox="0 0 360 132" aria-hidden="true">
    <path class="shelf" d="M18 112h326M30 113v9M329 113v9"/>
    <path class="jar" d="M48 61h46l-4 49H52l-4-49Zm6-10h34v10H54Z"/>
    <path class="utensil" d="M61 53 51 16M70 51 69 12M79 52l12-34"/>
    <path class="plant" d="M116 107V66M116 75c-18-15-29-1-16 9M117 82c18-17 31-3 17 9M116 65c-13-15-22-3-12 7M117 64c13-14 24-2 13 7"/>
    <path class="pot" d="M98 91h37l-4 20h-29l-4-20Z"/>
    <rect class="book book1" x="157" y="65" width="82" height="15" rx="3"/><rect class="book book2" x="150" y="80" width="92" height="15" rx="3"/><rect class="book book3" x="159" y="95" width="79" height="15" rx="3"/>
    <path class="board" d="M267 42c0-8 6-14 14-14s14 6 14 14v9h12v59h-52V51h12V42Z"/><circle cx="281" cy="42" r="4"/>
    <path class="lemon" d="M319 92c10-7 20 0 18 10-2 10-17 11-22 3-4-6-1-10 4-13Z"/>
    <path class="leaf" d="M321 91c2-8 9-10 14-7-2 7-8 10-14 7Z"/>
  </svg>`
}
