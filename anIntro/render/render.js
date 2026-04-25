// Render every slide component to static HTML by:
//  (1) loading tokens.js which assigns to window/global
//  (2) transpiling each .jsx file with @babel/preset-react
//  (3) eval-ing them in a shared sandbox so the components register on the
//      sandbox global (mirroring the browser's `window.X = ...` pattern)
//  (4) rendering each top-level Slide component with renderToStaticMarkup

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const babel = require('@babel/core');
const React = require('react');
const ReactDOMServer = require('react-dom/server');

const ROOT = path.resolve(__dirname, '..');
const DECK = path.join(ROOT, 'deck');

// Sandbox global. Mirrors `window` in the browser. tokens.js, primitives.jsx,
// verse-card.jsx, and slides-*.jsx all attach things to it.
const sandbox = {
  console,
  React,
  // React's classic JSX transform calls React.createElement directly, so React
  // must be in scope. Put it on globalThis too just in case.
};
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
vm.createContext(sandbox);

function loadFile(relPath, isJsx) {
  const abs = path.join(ROOT, relPath);
  let code = fs.readFileSync(abs, 'utf8');
  if (isJsx) {
    code = babel.transformSync(code, {
      presets: [['@babel/preset-react', { runtime: 'classic' }]],
      filename: abs,
    }).code;
  }
  // Run in shared sandbox so all `const Foo = ...` end up on sandbox via
  // the explicit `Object.assign(window, {...})` calls the source files do.
  // BUT — top-level `const`/`let` in a vm script are *script-scoped* and not
  // visible across separate runInContext calls. The source files rely on
  // primitives like Slide/Title/COLORS being globally available to slides.
  // Wrap each file in an IIFE that assigns its declared names to window,
  // OR just concatenate everything into one script. Concatenation is simpler.
  return code;
}

// Concatenate everything into a single script so `const` decls in one file
// are visible to the next. Order matches the HTML's <script> tags.
const parts = [
  loadFile('deck/components/tokens.js', false),
  loadFile('deck/components/primitives.jsx', true),
  loadFile('deck/components/verse-card.jsx', true),
  loadFile('deck/slides/slides-01.jsx', true),
  loadFile('deck/slides/slides-02.jsx', true),
  loadFile('deck/slides/slides-03.jsx', true),
  loadFile('deck/slides/slides-04.jsx', true),
  loadFile('deck/slides/slides-05.jsx', true),
  loadFile('deck/slides/slides-06.jsx', true),
];

const combined = parts.join('\n;\n');

// Execute. The token file does `window.TYPE_SCALE = TYPE_SCALE` etc.,
// primitives does `Object.assign(window, {Slide, ...})`, slide files do
// `window.Slide01_Title = Slide01_Title`. After running, all of those live
// on `sandbox`.
vm.runInContext(combined, sandbox, { filename: 'combined-deck.js' });

const SLIDES = [
  ['s01', 'Slide01_Title'],
  ['s02', 'Slide02_TwoBranches'],
  ['s03', 'Slide03_ClickableWord'],
  ['s04', 'Slide04_Fraktur'],
  ['s05', 'Slide05_Static'],
  ['s06', 'Slide06_FiveIngredients'],
  ['s07', 'Slide07_Pipeline'],
  ['s08', 'Slide08_JSONShape'],
  ['s09', 'Slide09_SectionDup'],
  ['s10', 'Slide10_Prereqs'],
  ['s11', 'Slide11_Step1'],
  ['s12', 'Slide12_Step2'],
  ['s13', 'Slide13_Step3'],
  ['s14', 'Slide14_DataFlow'],
  ['s15', 'Slide15_ContribHeader'],
  ['s16', 'Slide16_FourTracks'],
  ['s17', 'Slide17_AlignmentWhy'],
  ['s18', 'Slide18_AlignmentFlow'],
  ['s19', 'Slide19_ExcelMockup'],
  ['s20', 'Slide20_OCR'],
  ['s21', 'Slide21_Cut'],
  ['s22', 'Slide22_CCATS'],
  ['s23', 'Slide23_CCATS_Status'],
  ['s24', 'Slide24_SearchProblem'],
  ['s25', 'Slide25_SearchSolution'],
  ['s26', 'Slide26_KnownIssues'],
  ['s27', 'Slide27_CTA'],
  ['s28', 'Slide28_End'],
];

const SLIDE_LABELS = [
  '01 Title','02 Two Branches','03 Clickable Word','04 Fraktur Layer','05 Static HTML',
  '06 Five Ingredients','07 Notebook Pipeline','08 JSON Source of Truth','09 Self-host Header',
  '10 Prerequisites','11 Step 1 — Clone','12 Step 2 — Render Notebook','13 Step 3 — Open Browser',
  '14 Data Flow','15 Contribute Header','16 Four Tracks','17 Alignment — Why','18 Alignment — Workflow',
  '19 Alignment — Excel','20 OCR Track','21 Page-cut Tool','22 CCATS — What','23 CCATS — Status',
  '24 Search — Problem','25 Search — Solution','26 Known Issues','27 Try / Contribute','28 Q&A',
];

const sections = [];
for (let i = 0; i < SLIDES.length; i++) {
  const [id, name] = SLIDES[i];
  const Comp = sandbox[name];
  if (!Comp) {
    console.error(`MISSING: ${name}`);
    sections.push(`<section data-label="${SLIDE_LABELS[i]}"><div id="${id}"><!-- missing component ${name} --></div></section>`);
    continue;
  }
  let html;
  try {
    const element = React.createElement(Comp);
    html = ReactDOMServer.renderToStaticMarkup(element);
  } catch (e) {
    console.error(`ERROR rendering ${name}:`, e.message);
    html = `<!-- render error: ${e.message} -->`;
  }
  sections.push(`<section data-label="${SLIDE_LABELS[i]}"><div id="${id}">${html}</div></section>`);
  process.stdout.write(`${name} ${html.length} bytes\n`);
}

// Read the original HTML to preserve <head> stylesheet and the deck-stage script.
const origHtml = fs.readFileSync(path.join(ROOT, 't.noit.pro Overview.html'), 'utf8');

// Splice in the rendered sections, drop the React/Babel scripts and the JSX <script> tags.
let out = origHtml;

// Replace the body of <deck-stage>...</deck-stage> with our rendered sections.
out = out.replace(
  /<deck-stage[^>]*>[\s\S]*?<\/deck-stage>/,
  `<deck-stage width="1920" height="1080">\n    ${sections.join('\n    ')}\n  </deck-stage>`
);

// Strip the React, ReactDOM, Babel CDN scripts.
out = out.replace(/\s*<script src="https:\/\/unpkg\.com\/react@[^"]*"[^>]*><\/script>/g, '');
out = out.replace(/\s*<script src="https:\/\/unpkg\.com\/react-dom@[^"]*"[^>]*><\/script>/g, '');
out = out.replace(/\s*<script src="https:\/\/unpkg\.com\/@babel\/standalone@[^"]*"[^>]*><\/script>/g, '');

// Strip the tokens.js + JSX local script tags (no longer needed).
out = out.replace(/\s*<script src="deck\/components\/tokens\.js"><\/script>/g, '');
out = out.replace(/\s*<script type="text\/babel" src="deck\/[^"]*\.jsx"><\/script>/g, '');

// Strip the inline mounting <script type="text/babel">...</script>.
out = out.replace(/\s*<script type="text\/babel">[\s\S]*?<\/script>/g, '');

const outPath = path.join(ROOT, 't.noit.pro Overview.static.html');
fs.writeFileSync(outPath, out);
console.log(`\nWrote ${outPath}`);
console.log(`Output size: ${out.length} bytes`);
