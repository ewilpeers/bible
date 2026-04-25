// Slides 20-23: OCR / cut-tool / CCATS sidestep tracks

const Slide20_OCR = () => (
  <Slide>
    <Eyebrow>Track 02 · OCR <span style={{ color: COLORS.accent, marginLeft: 12 }}>· in progress</span></Eyebrow>
    <Title>The 1694 Glück text comes from OCR'd Fraktur scans.</Title>
    <Subtitle style={{ marginTop: 20 }}>
      Repo: <Code>github.com/ewilpeers/lv_fraktur_ocr</Code> — actively being worked on.
    </Subtitle>
    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, marginTop: 56, minHeight: 0 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        <Body>
          A vision-LLM pipeline (Qwen-VL, served via vLLM) reads each Fraktur page and emits modern transcribed Latvian.
        </Body>
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            ['h100_vllm_qwen_ocr.ipynb', 'Page-level OCR with Qwen-VL on H100/H200'],
            ['h100_vllm_qwen_verse_extractor.ipynb', 'Verse-level extraction & cleanup'],
            ['gluck_1694_verses/', 'Per-verse Fraktur text, the input to /e/'],
          ].map(([f, d], i) => (
            <li key={i} style={{ fontFamily: FONTS.serif, fontSize: 24 }}>
              <span style={{ fontFamily: FONTS.mono, color: COLORS.greek, fontSize: 22 }}>{f}</span>
              <div style={{ color: COLORS.inkSoft, fontSize: 22, marginTop: 4 }}>{d}</div>
            </li>
          ))}
        </ul>
        <div style={{ marginTop: 'auto', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Tag color={COLORS.hebrew}>Qwen-VL</Tag>
          <Tag color={COLORS.hebrew}>vLLM</Tag>
          <Tag color={COLORS.hebrew}>Fraktur</Tag>
        </div>
      </div>
      <div style={{ background: COLORS.bgAlt, border: `1px solid ${COLORS.rule}`, padding: 36, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ fontFamily: FONTS.sans, fontSize: 18, color: COLORS.inkMute, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Sample input
        </div>
        <Placeholder label="GLÜCK 1694 · PAGE SCAN" height={220} />
        <div style={{ fontFamily: FONTS.sans, fontSize: 18, color: COLORS.inkMute, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 8 }}>
          Sample output
        </div>
        <FrakturSample text="TAs KUNGS irr mans Gaiẜchums un manna Peſtiẜchana" style={{ fontSize: 30, lineHeight: 1.5 }} />
      </div>
    </div>
    <SlideFooter section="04 · Contribute" />
  </Slide>
);

const Slide21_Cut = () => (
  <Slide>
    <Eyebrow>Track 03 · Page-cut tool <span style={{ color: COLORS.accent, marginLeft: 12 }}>· in progress</span></Eyebrow>
    <Title>Cutting pages along a wandering middle line — without slicing letters.</Title>
    <Subtitle style={{ marginTop: 18 }}>
      Glück 1694 is two-column. The seam is rarely vertical and often runs through letters — a bad cut bleeds half-letters into the next column and OCR fails on them.
    </Subtitle>
    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, marginTop: 50, minHeight: 0 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Body style={{ fontSize: 26 }}>
          Today: a small Python GUI lets a human nudge the cut path per page — clean cuts → clean OCR.
        </Body>
        <div style={{ padding: 24, background: COLORS.bgAlt, border: `1px solid ${COLORS.ruleSoft}`, borderLeft: `5px solid ${COLORS.accent}` }}>
          <div style={{ fontFamily: FONTS.sans, fontSize: 14, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.inkMute, marginBottom: 8 }}>
            Direction it's heading
          </div>
          <Body style={{ fontSize: 22, lineHeight: 1.45, margin: 0 }}>
            A future <b>Inkscape extension</b> — let the user adjust a Bézier curve through the seam directly in Inkscape, then export the two clean halves. Inkscape already has the curve-editing UX; we'd just plug in the import/export.
          </Body>
        </div>
        <Body style={{ fontSize: 22, color: COLORS.inkSoft, marginTop: 4 }}>
          Other welcome help: better automatic mid-line detection (CV / heuristics), batch mode for clean pages, faster review keyboard shortcuts.
        </Body>
        <div style={{ fontFamily: FONTS.mono, fontSize: 18, color: COLORS.inkSoft, marginTop: 'auto' }}>
          01.ocr/03.0.cut/cut_tool/
        </div>
      </div>
      <div style={{ background: '#FFF', border: `1px solid ${COLORS.rule}`, display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: '#E5DDC8', padding: '10px 16px', fontFamily: FONTS.mono, fontSize: 16, color: COLORS.ink, borderBottom: `1px solid ${COLORS.rule}` }}>
          cut_tool · GUI screenshot
        </div>
        <div style={{ flex: 1, position: 'relative', background: '#F5EFD8', padding: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, height: '100%', position: 'relative' }}>
            <div style={{ background: '#E8DAB6', padding: 18, borderRight: `1px dashed ${COLORS.accent}` }}>
              <FrakturSample text="TAs KUNGS irr mans Gaiẜchums un manna Peſtiẜchana preekẜch ka bij man bihtees" style={{ fontSize: 22, lineHeight: 1.4 }} />
            </div>
            <div style={{ background: '#E8DAB6', padding: 18 }}>
              <FrakturSample text="tas KUNGS irr manas Dſihwibas Stiprums preekẜch ka bij mann bailotees" style={{ fontSize: 22, lineHeight: 1.4 }} />
            </div>
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} preserveAspectRatio="none" viewBox="0 0 100 100">
              <path d="M 49,0 C 51,20 47,40 50,55 C 53,70 48,90 50,100" stroke={COLORS.accent} strokeWidth="0.6" fill="none" strokeDasharray="2,1" />
              <circle cx="49" cy="20" r="0.9" fill={COLORS.accent} />
              <circle cx="50" cy="55" r="0.9" fill={COLORS.accent} />
              <circle cx="48" cy="90" r="0.9" fill={COLORS.accent} />
            </svg>
          </div>
        </div>
        <div style={{ background: COLORS.bgAlt, padding: '10px 16px', fontFamily: FONTS.sans, fontSize: 16, color: COLORS.inkMute, borderTop: `1px solid ${COLORS.rule}`, display: 'flex', justifyContent: 'space-between' }}>
          <span>Drag handles to adjust mid-line · future: Inkscape Bézier</span>
          <span style={{ color: COLORS.accent }}>● Save · Next →</span>
        </div>
      </div>
    </div>
    <SlideFooter section="04 · Contribute" />
  </Slide>
);

const Slide22_CCATS = () => (
  <Slide>
    <Eyebrow>Track 04 · CCATS</Eyebrow>
    <Title>The Hebrew↔LXX mapping work uses the CCATS dataset.</Title>
    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, marginTop: 56 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <Body>
          CCATS (CATSS) is a long-standing scholarly dataset that aligns the Masoretic Hebrew with the Septuagint Greek at the word level — the same problem we have, solved decades ago.
        </Body>
        <Body>
          Importing it lets us correct Greek glosses against the Hebrew automatically, instead of by hand. Notebook: <Code>5correct_json_catss.ipynb</Code>.
        </Body>
        <div style={{ marginTop: 12, padding: 28, background: COLORS.bgAlt, border: `1px solid ${COLORS.ruleSoft}` }}>
          <div style={{ fontFamily: FONTS.sans, fontSize: 18, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.inkMute, marginBottom: 12 }}>
            Versification — the harder half
          </div>
          <Body style={{ fontSize: 22, color: COLORS.inkSoft }}>
            Hebrew, Greek, and English Bibles number their psalms (and many chapters) differently. The mapping table in the README handles dozens of these splits.
          </Body>
        </div>
      </div>
      <div style={{ background: '#FFF', border: `1px solid ${COLORS.rule}`, padding: 30 }}>
        <div style={{ fontFamily: FONTS.sans, fontSize: 16, color: COLORS.inkMute, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
          Versification example
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: FONTS.serif, fontSize: 22 }}>
          <thead>
            <tr style={{ background: COLORS.bgAlt }}>
              <th style={{ padding: '10px 14px', textAlign: 'left', fontFamily: FONTS.sans, fontSize: 16, fontWeight: 600 }}>English</th>
              <th style={{ padding: '10px 14px', textAlign: 'left', fontFamily: FONTS.sans, fontSize: 16, fontWeight: 600 }}>Hebrew</th>
              <th style={{ padding: '10px 14px', textAlign: 'left', fontFamily: FONTS.sans, fontSize: 16, fontWeight: 600 }}>Greek</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Ps 3:title', '3:1', '—'],
              ['Ps 3:1–8', '3:2–9', '—'],
              ['—', '11–113', '10–112'],
              ['Ps 51:1–19', '51:2–21', '—'],
              ['Joel 2:28–32', '3:1–5', '—'],
              ['Mal 4:1–6', '3:19–24', '—'],
            ].map((r, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${COLORS.ruleSoft}` }}>
                <td style={{ padding: '10px 14px' }}>{r[0]}</td>
                <td style={{ padding: '10px 14px', color: COLORS.hebrew }}>{r[1]}</td>
                <td style={{ padding: '10px 14px', color: COLORS.greek }}>{r[2]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    <SlideFooter section="04 · Contribute" />
  </Slide>
);

const Slide23_CCATS_Status = () => (
  <Slide>
    <Eyebrow>Track 04 · Status</Eyebrow>
    <Title>Almost finished — needs install + test, then a fuzzy-match copy from elsewhere.</Title>
    <div style={{ flex: 1, marginTop: 56, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <Body>
          The CCATS-driven correction pipeline is nearly producing usable output. What remains is mechanical: <b>install it, test on a chapter, then port a fuzzy-match step we already have working in another notebook</b>.
        </Body>
        <Body style={{ color: COLORS.inkSoft }}>
          Currently paused — attention is on the Glück 1694 Fraktur text. A contributor with a biblical-studies background could pick this up and finish it without touching the rest of the stack.
        </Body>
        <div style={{ padding: 22, background: COLORS.bgAlt, border: `1px solid ${COLORS.ruleSoft}`, borderLeft: `5px solid ${COLORS.greek}` }}>
          <div style={{ fontFamily: FONTS.sans, fontSize: 14, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.inkMute, marginBottom: 8 }}>
            Fuzzy match — already solved elsewhere
          </div>
          <Body style={{ fontSize: 22, lineHeight: 1.45, margin: 0 }}>
            CCATS Greek lemmas don't always exact-match LXX surface forms. We have a working similarity-based matcher in another notebook — copy it in, wire it up.
          </Body>
        </div>
      </div>
      <div style={{ background: '#FFF', border: `1px solid ${COLORS.rule}`, padding: 36, display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ fontFamily: FONTS.sans, fontSize: 18, color: COLORS.inkMute, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          What's left
        </div>
        {[
          { s: 'done', t: 'CCATS dataset imported and parsed' },
          { s: 'done', t: 'Versification table mapped to JSON' },
          { s: 'done', t: 'Hebrew↔LXX correction notebook drafted' },
          { s: 'todo', t: 'Install dependencies + smoke-test on one chapter' },
          { s: 'todo', t: 'Port fuzzy-match step from existing notebook' },
          { s: 'todo', t: 'Roll corrected glosses back into bible/<book>/*.json' },
          { s: 'todo', t: 'Re-render and visually diff against /e/' },
        ].map((row, i) => (
          <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'baseline', fontFamily: FONTS.serif, fontSize: 22 }}>
            <span style={{
              fontFamily: FONTS.mono, fontSize: 13, padding: '3px 10px', borderRadius: 4, color: '#FFF',
              background: row.s === 'done' ? COLORS.latvian : row.s === 'wip' ? COLORS.accent : COLORS.inkMute,
              minWidth: 60, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.1em',
            }}>{row.s}</span>
            <span style={{ color: row.s === 'todo' ? COLORS.inkSoft : COLORS.ink }}>{row.t}</span>
          </div>
        ))}
      </div>
    </div>
    <SlideFooter section="04 · Contribute" />
  </Slide>
);

Object.assign(window, { Slide20_OCR, Slide21_Cut, Slide22_CCATS, Slide23_CCATS_Status });
