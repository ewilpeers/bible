// Slides 15-19: Contributor section header + alignment workflow

const Slide15_ContribHeader = () => (
  <Slide bg={COLORS.bg} padded={false}>
    <div
      style={{
        position: 'absolute',
        inset: 0,
        padding: `${SPACING.paddingTop}px ${SPACING.paddingX}px ${SPACING.paddingBottom}px`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ fontFamily: FONTS.sans, fontSize: 22, color: COLORS.inkMute, letterSpacing: '0.3em', textTransform: 'uppercase' }}>
        Part 03 · Contribute
      </div>
      <div>
        <div style={{ fontFamily: FONTS.mono, fontSize: 200, color: COLORS.accent, lineHeight: 1, opacity: 0.85 }}>04</div>
        <Title style={{ fontSize: 110, lineHeight: 1.05, marginTop: 30 }}>
          Contributors are wanted.<br />Small fixes count.
        </Title>
        <Subtitle style={{ marginTop: 30, fontSize: 38 }}>
          Four parallel tracks — pick the one that suits your skills.
        </Subtitle>
      </div>
      <div style={{ fontFamily: FONTS.mono, fontSize: 22, color: COLORS.inkSoft, letterSpacing: '0.1em' }}>
        github.com/ewilpeers
      </div>
    </div>
  </Slide>
);

const Slide16_FourTracks = () => (
  <Slide>
    <Eyebrow>Where help is most useful</Eyebrow>
    <Title>Four tracks, all open.</Title>
    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 32, marginTop: 60 }}>
      {[
        { t: 'Alignment edits', s: 'Move words between Latvian–Greek/Hebrew cells in Excel, export to JSON, open a PR.', tag: 'Linguists', c: COLORS.greek },
        { t: 'OCR — 1694 Glück Fraktur', s: 'Train and tune Qwen-VLLM-based OCR for the Fraktur source.', tag: 'ML / NLP', c: COLORS.hebrew },
        { t: 'Page-cut tool', s: 'A GUI to cut Fraktur scans along their wandering mid-line — without slicing through letters, so OCR sees clean half-pages.', tag: 'Python / GUI', c: COLORS.accent },
        { t: 'Hebrew ↔ LXX mapping', s: 'CCATS-style alignment; almost there, currently paused.', tag: 'Biblical scholars', c: COLORS.fraktur },
      ].map((track, i) => (
        <div key={i} style={{ background: '#FFF', border: `1px solid ${COLORS.rule}`, borderLeft: `6px solid ${track.c}`, padding: 40, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div style={{ fontFamily: FONTS.mono, fontSize: 22, color: track.c }}>{String(i + 1).padStart(2, '0')}</div>
            <Tag color={track.c}>{track.tag}</Tag>
          </div>
          <Title size="subtitle" style={{ fontSize: 44 }}>{track.t}</Title>
          <Body style={{ fontSize: 26, color: COLORS.inkSoft }}>{track.s}</Body>
        </div>
      ))}
    </div>
    <SlideFooter section="04 · Contribute" />
  </Slide>
);

const Slide17_AlignmentWhy = () => (
  <Slide>
    <Eyebrow>Track 01 · Alignment</Eyebrow>
    <Title>Word-by-word alignment is the heart of the project.</Title>
    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 60, marginTop: 56, minHeight: 0 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, justifyContent: 'center' }}>
        <Body style={{ fontSize: 30 }}>
          Each Hebrew form lists its Greek and Latvian counterparts. Editing means moving a word from one form's array to another's — or from <Code>leftover</Code> into a form.
        </Body>
        <Body style={{ fontSize: 26, color: COLORS.inkSoft }}>
          Most of this is correct. The fixes don't need code — they need a careful reader.
        </Body>
        <div style={{ marginTop: 8, padding: 24, background: COLORS.bgAlt, border: `1px solid ${COLORS.ruleSoft}` }}>
          <div style={{ fontFamily: FONTS.sans, fontSize: 16, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.inkMute, marginBottom: 12 }}>
            What an "edit" looks like
          </div>
          <pre style={{ fontFamily: FONTS.mono, fontSize: 17, color: COLORS.ink, margin: 0, lineHeight: 1.55 }}>
{`{ "hebrew":  "בַּעֲצַ֪ת",
  "greek":   ["ἐν", "βουλῇ"],
  "latvian": ["padomam"]   ← move "ļauno"
                              here from leftover
}`}
          </pre>
        </div>
      </div>
      <div style={{ minHeight: 0, display: 'flex', alignItems: 'center' }}>
        <div style={{ background: '#FFF', border: `1px solid ${COLORS.rule}`, padding: 28, width: '100%', boxShadow: '0 12px 30px rgba(31,26,20,0.08)' }}>
          <div style={{ fontFamily: FONTS.sans, fontSize: 14, color: COLORS.inkMute, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14 }}>
            Psalms 1:1 — verse object
          </div>
          <pre style={{ fontFamily: FONTS.mono, fontSize: 15, color: COLORS.ink, margin: 0, lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>
{`{
  "hebrew_words": [
    { "hebrew": "אַ֥שְֽׁרֵי",
      "greek":   ["μακάριος"],
      "latvian": ["Svētīgs"]      },

    { "hebrew": "הָאִ֗ישׁ",
      "greek":   ["ἀνήρ"],
      "latvian": ["tas", "cilvēks"] },

    { "hebrew": "בַּעֲצַ֪ת",
      "greek":   ["ἐν", "βουλῇ"],
      "latvian": ["padomam"]      },   `}<span style={{ color: '#B86A30' }}>{`← target`}</span>{`

    { "hebrew": "רְ֭שָׁעִים",
      "greek":   ["ἀσεβῶν"],
      "latvian": ["bezdievīgo"]   }
  ],
  "leftover_greek":   [],
  "leftover_latvian": [`}<span style={{ color: '#B86A30', textDecoration: 'line-through' }}>{`"ļauno"`}</span>{`]
}`}
          </pre>
        </div>
      </div>
    </div>
    <SlideFooter section="04 · Contribute" />
  </Slide>
);

const Slide18_AlignmentFlow = () => (
  <Slide>
    <Eyebrow>Track 01 · Workflow</Eyebrow>
    <Title>The alignment workflow is a four-step PR.</Title>
    <div style={{ flex: 1, marginTop: 60, display: 'flex', flexDirection: 'column', gap: 22 }}>
      {[
        { n: '1', t: 'Open a chapter in Excel', s: 'Run 7excel_import_export.ipynb in the export direction. You get one .xlsx per chapter.', mono: 'jupyter run 7excel_import_export.ipynb' },
        { n: '2', t: 'Move words between cells', s: 'Drag a Latvian gloss to the row of the Hebrew/Greek form it actually belongs to.', mono: 'edit psalms-27.xlsx' },
        { n: '3', t: 'Re-import to JSON', s: 'Run the same notebook in the import direction — bible/<book>/<chapter>.json is rewritten.', mono: 'jupyter run 7excel_import_export.ipynb' },
        { n: '4', t: 'Open a Pull Request', s: 'Push your branch, open a PR against the bible/ folder. Diff is JSON-only and easy to review.', mono: 'git push && gh pr create' },
      ].map((s) => (
        <div key={s.n} style={{ display: 'grid', gridTemplateColumns: '70px 1fr 1.6fr', gap: 28, alignItems: 'center', padding: '24px 24px', background: '#FFF', border: `1px solid ${COLORS.ruleSoft}` }}>
          <div style={{ fontFamily: FONTS.mono, fontSize: 38, color: COLORS.accent }}>{s.n}</div>
          <div>
            <div style={{ fontFamily: FONTS.serif, fontSize: 32, fontWeight: 500, marginBottom: 4 }}>{s.t}</div>
            <div style={{ fontFamily: FONTS.serif, fontSize: 22, color: COLORS.inkSoft }}>{s.s}</div>
          </div>
          <div style={{ fontFamily: FONTS.mono, fontSize: 20, color: '#E8E0CC', background: COLORS.bgDark, padding: '14px 18px' }}>$ {s.mono}</div>
        </div>
      ))}
    </div>
    <SlideFooter section="04 · Contribute" />
  </Slide>
);

const Slide19_ExcelMockup = () => (
  <Slide>
    <Eyebrow>What Excel sees — proverbs/9.xlsx</Eyebrow>
    <Title style={{ fontSize: 48 }}>One row per Hebrew form. Three Greek and three Latvian columns, plus <Code style={{ fontSize: '0.7em' }}>LEFTOVER</Code> rows.</Title>
    <div style={{ flex: 1, marginTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0 }}>
      <div style={{ background: '#FFF', border: `1px solid ${COLORS.rule}`, width: '100%', maxWidth: 1600, boxShadow: '0 18px 40px rgba(31,26,20,0.10)', overflow: 'hidden' }}>
        {(() => {
          // Real Excel structure from bible/proverbs/9.xlsx — Chapter 9 sheet.
          // Columns: verse, form, form_en, greek_1..3, latvian_1..3
          const cols = '60px 1.1fr 0.9fr 0.85fr 0.85fr 0.85fr 0.9fr 0.9fr 0.9fr';
          const headers = ['verse', 'form', 'form_en', 'greek_1', 'greek_2', 'greek_3', 'latvian_1', 'latvian_2', 'latvian_3'];
          // Rows. v = verse number on verse-start rows only. Empty strings stay empty.
          const rows = [
            // Verse 1 — 6 forms
            { v: 1, w: 'חָ֭כְמוֹת', en: 'Wisdom',           g1: 'ἡ',         g2: 'σοφία',     g3: '',       l1: 'Gudrība',  l2: '',        l3: ''      },
            { w: 'בָּנְתָ֣ה',     en: 'has built',         g1: 'ᾠκοδόμησεν', g2: '',          g3: '',       l1: 'darīja',   l2: 'sev',     l3: ''      },
            { w: 'בֵיתָ֑הּ',      en: 'her house',         g1: 'ἑαυτῇ',      g2: 'οἶκον',     g3: '',       l1: 'namu',     l2: '',        l3: ''      },
            { w: 'חָצְבָ֖ה',      en: 'she has hewn out',  g1: 'καὶ',        g2: 'ὑπήρεισεν', g3: '',       l1: 'un',       l2: 'izcirta', l3: ''      },
            { w: 'עַמּוּדֶ֣יהָ',  en: 'her pillars',       g1: 'στύλους',    g2: '',          g3: '',       l1: 'septiņus', l2: 'stabus',  l3: ''      },
            { w: 'שִׁבְעָֽה׃',    en: 'seven',             g1: 'ἑπτά',       g2: '',          g3: '',       l1: '',         l2: '',        l3: ''      },
            // Verse 2 — 7 forms
            { v: 2, w: 'טָבְחָ֣ה', en: 'She has slaughtered', g1: 'ἔσφαξεν',  g2: '',          g3: '',       l1: 'tā',       l2: 'nokāva',  l3: ''      },
            { w: 'טִ֭בְחָהּ',     en: 'her meat',          g1: 'τὰ',         g2: 'ἑαυτῆς',    g3: 'θύματα', l1: 'savus',    l2: 'kaujamos', l3: 'lopus' },
            { w: 'מָסְכָ֣ה',      en: 'she has mixed',     g1: 'ἐκέρασεν',   g2: '',          g3: '',       l1: 'sajauca',  l2: '',        l3: ''      },
            { w: 'יֵינָ֑הּ',      en: 'her wine',          g1: 'τὸν',        g2: 'ἑαυτῆς',    g3: 'οἶνον',  l1: 'savu',     l2: 'vīnu',    l3: ''      },
            { w: 'אַ֝֗ף',         en: 'also',              g1: 'καὶ',        g2: '',          g3: '',       l1: 'un',       l2: '',        l3: ''      },
            { w: 'עָֽרְכָ֥ה',     en: 'she has furnished', g1: 'ἡτοιμάσατο', g2: '',          g3: '',       l1: 'saklāja',  l2: '',        l3: ''      },
            { w: 'שֻׁלְחָנָֽהּ׃', en: 'her table',         g1: 'τὴν',        g2: 'ἑαυτῆς',    g3: 'τράπεζαν', l1: 'galdu', l2: '',        l3: ''      },
            // Leftover — verse 2 Greek words that didn't map to any Hebrew form
            { leftover: true, lang: 'greek', verse: 2, g1: 'εἰς', g2: 'κρατῆρα', g3: '', l1: '', l2: '', l3: '' },
          ];
          return (
            <React.Fragment>
              <div style={{ background: '#1E6E3D', color: '#FFF', display: 'grid', gridTemplateColumns: cols, fontFamily: FONTS.sans, fontSize: 15, fontWeight: 600 }}>
                {headers.map((h, i) => (
                  <div key={i} style={{ padding: '9px 12px', borderRight: '1px solid #2D8A4F' }}>{h}</div>
                ))}
              </div>
              {(() => {
                let dataIdx = 0; // track non-leftover index for striping
                return rows.map((row, i) => {
                  if (row.leftover) {
                    return (
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: cols, borderTop: `2px solid ${COLORS.accent}`, borderBottom: `1px solid ${COLORS.ruleSoft}`, background: '#FBE9D6', fontFamily: FONTS.serif, fontSize: 18, alignItems: 'center' }}>
                        <div style={{ padding: '9px 12px', fontFamily: FONTS.mono, fontSize: 13, color: COLORS.accent, gridColumn: '1 / 3', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>LEFTOVER · v{row.verse} · {row.lang}</div>
                        <div style={{ padding: '9px 12px', gridColumn: '3 / 4', fontStyle: 'italic', color: COLORS.inkSoft }}>words not mapped to any form</div>
                        <div style={{ padding: '9px 12px', fontFamily: FONTS.greek, color: COLORS.greek, fontSize: 19, fontWeight: 600 }}>{row.g1}</div>
                        <div style={{ padding: '9px 12px', fontFamily: FONTS.greek, color: COLORS.greek, fontSize: 19, fontWeight: 600 }}>{row.g2}</div>
                        <div style={{ padding: '9px 12px', fontFamily: FONTS.greek, color: COLORS.greek, fontSize: 19, fontWeight: 600 }}>{row.g3}</div>
                        <div style={{ padding: '9px 12px', color: COLORS.latvian, fontWeight: 600 }}>{row.l1}</div>
                        <div style={{ padding: '9px 12px', color: COLORS.latvian, fontWeight: 600 }}>{row.l2}</div>
                        <div style={{ padding: '9px 12px', color: COLORS.latvian, fontWeight: 600 }}>{row.l3}</div>
                      </div>
                    );
                  }
                  const isVerseStart = row.v != null;
                  const bg = isVerseStart ? '#FFF6D6' : (dataIdx % 2 ? '#FAF7EE' : '#FFF');
                  dataIdx++;
                  return (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: cols, borderBottom: `1px solid ${COLORS.ruleSoft}`, background: bg, fontFamily: FONTS.serif, fontSize: 18, alignItems: 'center' }}>
                      <div style={{ padding: '7px 12px', fontFamily: FONTS.mono, fontSize: 15, color: COLORS.inkMute }}>{isVerseStart ? row.v : ''}</div>
                      <div style={{ padding: '7px 12px', fontFamily: FONTS.hebrew, fontSize: 22, color: COLORS.hebrew, direction: 'rtl' }}>{row.w}</div>
                      <div style={{ padding: '7px 12px', fontStyle: 'italic', color: COLORS.inkSoft, fontSize: 15 }}>{row.en}</div>
                      <div style={{ padding: '7px 12px', fontFamily: FONTS.greek, color: COLORS.greek, fontSize: 19 }}>{row.g1}</div>
                      <div style={{ padding: '7px 12px', fontFamily: FONTS.greek, color: COLORS.greek, fontSize: 19 }}>{row.g2}</div>
                      <div style={{ padding: '7px 12px', fontFamily: FONTS.greek, color: COLORS.greek, fontSize: 19 }}>{row.g3}</div>
                      <div style={{ padding: '7px 12px', color: COLORS.latvian }}>{row.l1}</div>
                      <div style={{ padding: '7px 12px', color: COLORS.latvian }}>{row.l2}</div>
                      <div style={{ padding: '7px 12px', color: COLORS.latvian }}>{row.l3}</div>
                    </div>
                  );
                });
              })()}
            </React.Fragment>
          );
        })()}
      </div>
    </div>
    <SlideFooter section="04 · Contribute" />
  </Slide>
);

Object.assign(window, { Slide15_ContribHeader, Slide16_FourTracks, Slide17_AlignmentWhy, Slide18_AlignmentFlow, Slide19_ExcelMockup });
