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
    <Eyebrow>What Excel sees</Eyebrow>
    <Title>One row per Hebrew form. Three Latvian columns, three Greek columns, plus leftovers.</Title>
    <Subtitle style={{ marginTop: 14, fontSize: 26 }}>
      Each Hebrew/Greek form needs <b>verse</b>, <b>form</b>, and <b>form_en</b> (English transliteration). Words that didn't map go into a final <Code>LEFTOVER</Code> row.
    </Subtitle>
    <div style={{ flex: 1, marginTop: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0 }}>
      <div style={{ background: '#FFF', border: `1px solid ${COLORS.rule}`, width: '100%', maxWidth: 1500, boxShadow: '0 18px 40px rgba(31,26,20,0.10)', overflow: 'hidden' }}>
        {(() => {
          const cols = '60px 60px 1.1fr 0.9fr 0.95fr 0.95fr 0.95fr 0.9fr 0.9fr 0.9fr';
          const headers = ['#', 'verse', 'form (Heb)', 'form_en', 'lv 1694', 'lv 1965', 'lv 2024', 'gr 1', 'gr 2', 'gr 3'];
          const rows = [
            { n: 1, v: 1, w: 'אַ֥שְֽׁרֵי', en: 'ʾaš·rê', lv1: 'Swehtigs', lv2: 'Svētīgs', lv3: 'Svētīgs', g1: 'μακάριος', g2: '', g3: '' },
            { n: 2, v: 1, w: 'הָאִ֗ישׁ', en: 'hā·ʾîš', lv1: 'tas Wihrs', lv2: 'tas vīrs', lv3: 'tas cilvēks', g1: 'ἀνήρ', g2: '', g3: '' },
            { n: 3, v: 1, w: 'בַּעֲצַ֪ת', en: 'ba·ʿă·ṣaṯ', lv1: 'pehz Padohma', lv2: 'pēc padoma', lv3: 'padomam', g1: 'ἐν', g2: 'βουλῇ', g3: '', edited: true },
            { n: 4, v: 1, w: 'רְ֭שָׁעִים', en: 'rə·šā·ʿîm', lv1: 'to bezdeewigo', lv2: 'bezdievīgo', lv3: 'ļauno', g1: 'ἀσεβῶν', g2: '', g3: '' },
            { n: 5, v: 1, w: 'וּבְמוֹשַׁ֥ב', en: 'ū·ḇə·mō·wōšaḇ', lv1: 'un eekẜch tahs Ꞩeh̄ẜchanas', lv2: 'un sēdes vietā', lv3: 'nedz arī sēž', g1: 'καὶ', g2: 'ἐπὶ', g3: 'καθέδραν' },
            { leftover: true, lv3: 'ļauno', g3: '' },
          ];
          return (
            <React.Fragment>
              <div style={{ background: '#1E6E3D', color: '#FFF', display: 'grid', gridTemplateColumns: cols, fontFamily: FONTS.sans, fontSize: 15, fontWeight: 600 }}>
                {headers.map((h, i) => (
                  <div key={i} style={{ padding: '12px 12px', borderRight: '1px solid #2D8A4F' }}>{h}</div>
                ))}
              </div>
              {rows.map((row, i) => {
                if (row.leftover) {
                  return (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: cols, borderTop: `2px solid ${COLORS.accent}`, background: '#FBE9D6', fontFamily: FONTS.serif, fontSize: 18, alignItems: 'center' }}>
                      <div style={{ padding: '12px 12px', fontFamily: FONTS.mono, fontSize: 14, color: COLORS.accent, gridColumn: '1 / 3', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>LEFTOVER</div>
                      <div style={{ padding: '12px 12px', gridColumn: '3 / 5', fontStyle: 'italic', color: COLORS.inkSoft }}>words not mapped to any form</div>
                      <div style={{ padding: '12px 12px' }}></div>
                      <div style={{ padding: '12px 12px' }}></div>
                      <div style={{ padding: '12px 12px', color: COLORS.latvian, fontWeight: 600 }}>{row.lv3}</div>
                      <div style={{ padding: '12px 12px' }}></div>
                      <div style={{ padding: '12px 12px' }}></div>
                      <div style={{ padding: '12px 12px' }}></div>
                    </div>
                  );
                }
                return (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: cols, borderBottom: `1px solid ${COLORS.ruleSoft}`, background: row.edited ? '#FFF6D6' : i % 2 ? '#FAF7EE' : '#FFF', fontFamily: FONTS.serif, fontSize: 18, alignItems: 'center' }}>
                    <div style={{ padding: '11px 12px', fontFamily: FONTS.mono, fontSize: 15, color: COLORS.inkMute }}>{row.n}</div>
                    <div style={{ padding: '11px 12px', fontFamily: FONTS.mono, fontSize: 15, color: COLORS.inkMute }}>{row.v}</div>
                    <div style={{ padding: '11px 12px', fontFamily: FONTS.hebrew, fontSize: 22, color: COLORS.hebrew, direction: 'rtl' }}>{row.w}</div>
                    <div style={{ padding: '11px 12px', fontStyle: 'italic', color: COLORS.inkSoft, fontSize: 15 }}>{row.en}</div>
                    <div style={{ padding: '11px 12px', color: COLORS.fraktur, fontFamily: FONTS.fraktur, fontSize: 19 }}>{row.lv1}</div>
                    <div style={{ padding: '11px 12px', color: COLORS.latvian }}>{row.lv2}</div>
                    <div style={{ padding: '11px 12px', color: COLORS.latvian, fontWeight: row.edited ? 600 : 400 }}>{row.lv3}{row.edited && <span style={{ color: '#B86A30', marginLeft: 8, fontFamily: FONTS.mono, fontSize: 13 }}>← moved</span>}</div>
                    <div style={{ padding: '11px 12px', fontFamily: FONTS.greek, color: COLORS.greek, fontSize: 19 }}>{row.g1}</div>
                    <div style={{ padding: '11px 12px', fontFamily: FONTS.greek, color: COLORS.greek, fontSize: 19 }}>{row.g2}</div>
                    <div style={{ padding: '11px 12px', fontFamily: FONTS.greek, color: COLORS.greek, fontSize: 19 }}>{row.g3}</div>
                  </div>
                );
              })}
            </React.Fragment>
          );
        })()}
      </div>
    </div>
    <SlideFooter section="04 · Contribute" />
  </Slide>
);

Object.assign(window, { Slide15_ContribHeader, Slide16_FourTracks, Slide17_AlignmentWhy, Slide18_AlignmentFlow, Slide19_ExcelMockup });
