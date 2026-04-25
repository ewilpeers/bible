// Slides 5-9: Architecture & pipeline

const Slide05_Static = () => (
  <Slide>
    <Eyebrow>Architecture</Eyebrow>
    <Title>The site is just static HTML.</Title>
    <Subtitle style={{ marginTop: 20 }}>
      No server, no database, no JS framework — Jupyter notebooks generate one HTML file per chapter.
    </Subtitle>
    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 36, marginTop: 64, alignItems: 'stretch' }}>
      {[
        { n: '01', label: 'Notebook', text: 'Jupyter pulls and merges sources, fixes alignment, applies corrections.', mono: '*.ipynb' },
        { n: '02', label: 'JSON', text: 'Per-chapter JSON files in bible/<book>/<chapter>.json hold the canonical data.', mono: 'bible/psalms/27.json' },
        { n: '03', label: 'HTML', text: 'A render notebook templates each JSON into a self-contained chapter page.', mono: 'psalms/27.html' },
      ].map((s) => (
        <div
          key={s.n}
          style={{
            background: '#FFF',
            border: `1px solid ${COLORS.rule}`,
            padding: 36,
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
          }}
        >
          <div style={{ fontFamily: FONTS.mono, fontSize: 28, color: COLORS.accent }}>{s.n}</div>
          <div style={{ fontFamily: FONTS.serif, fontSize: 38, fontWeight: 500 }}>{s.label}</div>
          <Body style={{ fontSize: 26, color: COLORS.inkSoft }}>{s.text}</Body>
          <div style={{ marginTop: 'auto', fontFamily: FONTS.mono, fontSize: 20, color: COLORS.greek, background: COLORS.bgAlt, padding: '8px 14px', alignSelf: 'flex-start' }}>
            {s.mono}
          </div>
        </div>
      ))}
    </div>
    <SlideFooter section="02 · Architecture" />
  </Slide>
);

const Slide06_FiveIngredients = () => (
  <Slide>
    <Eyebrow>The data behind a chapter</Eyebrow>
    <Title>Five ingredients build a chapter page.</Title>
    <div style={{ flex: 1, marginTop: 60, display: 'flex', flexDirection: 'column', gap: 22 }}>
      {[
        { src: 'Hebrew (BHS)', via: 'matched by Strong\'s number', use: 'Original-language text + lemmata', color: COLORS.hebrew },
        { src: 'Greek (LXX / ABP / GNT)', via: 'aligned to Hebrew via CCATS-style mapping', use: 'Greek interlinear column', color: COLORS.greek },
        { src: 'Latvian 1694 (Glück / Fürecker)', via: 'OCR\'d from Fraktur scans', use: 'Historical Fraktur layer', color: COLORS.fraktur },
        { src: 'Latvian 1965', via: 'imported from public-domain editions', use: 'Modern reading column', color: COLORS.latvian },
        { src: 'Strong\'s + morphology + audio', via: 'merged from BLB / interlinear sources', use: 'Click-a-word lookup data', color: COLORS.accent },
      ].map((row, i) => (
        <div
          key={i}
          style={{
            display: 'grid',
            gridTemplateColumns: '60px 1.4fr 1.6fr 1fr',
            gap: 28,
            alignItems: 'center',
            padding: '22px 24px',
            background: i % 2 === 0 ? '#FFF' : 'transparent',
            border: `1px solid ${COLORS.ruleSoft}`,
          }}
        >
          <div style={{ fontFamily: FONTS.mono, fontSize: 28, color: row.color }}>{String(i + 1).padStart(2, '0')}</div>
          <div style={{ fontFamily: FONTS.serif, fontSize: 28, fontWeight: 500, color: row.color }}>{row.src}</div>
          <div style={{ fontFamily: FONTS.serif, fontSize: 24, color: COLORS.inkSoft, fontStyle: 'italic' }}>{row.via}</div>
          <div style={{ fontFamily: FONTS.serif, fontSize: 24, color: COLORS.ink }}>{row.use}</div>
        </div>
      ))}
    </div>
    <SlideFooter section="02 · Architecture" />
  </Slide>
);

const Slide07_Pipeline = () => (
  <Slide>
    <Eyebrow>The notebook pipeline</Eyebrow>
    <Title>Sources flow through numbered notebooks.</Title>
    <Subtitle style={{ marginTop: 18 }}>
      Each step is a Jupyter notebook in the repo root, run in order.
    </Subtitle>
    <div style={{ flex: 1, marginTop: 56, display: 'flex', flexDirection: 'column', gap: 12 }}>
      {[
        ['0.1', 'Extract_ibibl.com.ipynb', 'Scrape interlinear source data'],
        ['2', 'merge_Heb_lxx_enc_1965.ipynb', 'Align Hebrew ↔ LXX ↔ Latvian 1965'],
        ['3', 'prep_txt_promptData_Heb_gk_1965.ipynb', 'Build prompt-ready aligned text'],
        ['4', 'correct_json.ipynb', 'Sanity-check vs. the gold-truth source datasets — same words, none added, none lost'],
        ['5', 'correct_json_catss.ipynb', 'CCATS-style Hebrew↔LXX alignment corrections'],
        ['6', 'HTML_render_OT.ipynb', 'Render every chapter to HTML'],
        ['7', 'excel_import_export.ipynb', 'Round-trip JSON ↔ Excel for editing'],
      ].map(([n, file, desc]) => (
        <div key={n} style={{ display: 'grid', gridTemplateColumns: '90px 1fr 1.4fr', gap: 28, alignItems: 'baseline', padding: '14px 24px', borderBottom: `1px solid ${COLORS.ruleSoft}` }}>
          <div style={{ fontFamily: FONTS.mono, fontSize: 30, color: COLORS.accent }}>{n}</div>
          <div style={{ fontFamily: FONTS.mono, fontSize: 24, color: COLORS.greek }}>{file}</div>
          <div style={{ fontFamily: FONTS.serif, fontSize: 26, color: COLORS.inkSoft }}>{desc}</div>
        </div>
      ))}
    </div>
    <SlideFooter section="02 · Architecture" />
  </Slide>
);

const Slide08_JSONShape = () => (
  <Slide>
    <Eyebrow>The canonical format</Eyebrow>
    <Title>Hebrew leads. Greek and Latvian align to it.</Title>
    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '0.9fr 1.1fr', gap: 60, marginTop: 50, minHeight: 0 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <Body>
          One JSON file per chapter — an array of verses. Each verse is a list of <b>hebrew_words</b>, where each Hebrew form carries its Greek and Latvian arrays.
        </Body>
        <Body style={{ color: COLORS.inkSoft }}>
          A Hebrew form can map to multiple Greek tokens (or none), and to multiple Latvian words (or none). Verse-level Greek/Latvian that didn't map go into <Code>leftover_greek</Code> and <Code>leftover_latvian</Code>.
        </Body>
        <Body>
          The renderer is intentionally dumb — it walks the JSON and emits HTML. <b>If you can edit JSON, you can change the site.</b>
        </Body>
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Tag color={COLORS.greek}>bible/psalms/1.json</Tag>
          <Tag color={COLORS.greek}>bible/1_corinthians/7.json</Tag>
        </div>
      </div>
      <CodeBlock label="bible/psalms/1.json — verse 1 (real excerpt)" style={{ minHeight: 0 }}>
{`[
  {
    "hebrew_words": [
      { "hebrew": "אַ֥שְֽׁרֵי",
        "greek":   ["μακάριος"],
        "latvian": ["Svētīgs"] },

      { "hebrew": "הָאִ֗ישׁ",
        "greek":   ["ἀνήρ"],
        "latvian": ["tas", "cilvēks"] },

      { "hebrew": "בַּעֲצַ֪ת",
        "greek":   ["ἐν", "βουλῇ"],
        "latvian": ["padomam"] },

      { "hebrew": "וּבְמוֹשַׁ֥ב",
        "greek":   ["καὶ", "ἐπὶ", "καθέδραν"],
        "latvian": ["nedz", "arī", "sēž"] },

      { "hebrew": "לֹ֥א",
        "greek":   ["οὐκ"],
        "latvian": [] }
    ],
    "leftover_greek":   [],
    "leftover_latvian": []
  },
  { ... }
]`}
      </CodeBlock>
    </div>
    <SlideFooter section="02 · Architecture" />
  </Slide>
);

Object.assign(window, { Slide05_Static, Slide06_FiveIngredients, Slide07_Pipeline, Slide08_JSONShape });
