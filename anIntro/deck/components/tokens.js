// Design tokens — committed to projection density (1920×1080)
const TYPE_SCALE = {
  display: 96,
  title: 64,
  subtitle: 44,
  body: 34,
  small: 28,
  micro: 24,
  mono: 26,
};

const SPACING = {
  paddingTop: 100,
  paddingBottom: 80,
  paddingX: 110,
  titleGap: 52,
  itemGap: 28,
  blockGap: 64,
};

// Two-column scholarly aesthetic — warm parchment neutrals + scholarly accents
const COLORS = {
  bg: '#F5F1E8',           // parchment warm white
  bgAlt: '#EDE7D6',        // slightly deeper parchment for headers
  bgDark: '#2A2620',       // ink-dark for inverted slides
  ink: '#1F1A14',          // primary ink
  inkSoft: '#5A5246',      // secondary ink
  inkMute: '#8A8270',      // muted (captions)
  rule: '#C9BFA7',         // hairline rule
  ruleSoft: '#DCD3BC',     // softer rule
  hebrew: '#5C2E1F',       // deep oxblood for Hebrew
  greek: '#1F4A5C',        // teal-ink for Greek
  latvian: '#3D5C2E',      // forest green for Latvian
  fraktur: '#4A3520',      // dark sepia for Fraktur
  accent: '#A8541F',       // rubric red-orange (manuscript marginalia)
  highlight: '#F0DC9A',    // soft gold highlight
};

const FONTS = {
  serif: '"EB Garamond", "Cormorant Garamond", Georgia, serif',
  sans: '"Inter", "Helvetica Neue", Helvetica, Arial, sans-serif',
  mono: '"JetBrains Mono", "Source Code Pro", Menlo, monospace',
  hebrew: '"SBL Hebrew", "Ezra SIL", "Times New Roman", serif',
  greek: '"GFS Didot", "EB Garamond", "Times New Roman", serif',
  fraktur: '"UnifrakturMaguntia", "UnifrakturCook", serif',
};

window.TYPE_SCALE = TYPE_SCALE;
window.SPACING = SPACING;
window.COLORS = COLORS;
window.FONTS = FONTS;
