// Slides 9-15: Duplicate the rendering — section header + walkthrough

const Slide09_SectionDup = () => (
  <Slide bg={COLORS.bgDark} color="#E8DDC4" padded={false}>
    <div style={{ position: 'absolute', inset: 0, padding: `${SPACING.paddingTop}px ${SPACING.paddingX}px`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div style={{ fontFamily: FONTS.sans, fontSize: 22, color: '#9A8E70', letterSpacing: '0.3em', textTransform: 'uppercase' }}>
        Part 02
      </div>
      <div>
        <div style={{ fontFamily: FONTS.mono, fontSize: 200, color: COLORS.accent, lineHeight: 1, opacity: 0.85 }}>03</div>
        <Title style={{ color: '#F2E8D0', fontSize: 110, lineHeight: 1.05, marginTop: 30 }}>
          Duplicate the rendering<br />on your machine.
        </Title>
        <Subtitle style={{ marginTop: 30, color: '#C9BC9C', fontSize: 38 }}>
          A four-step recipe to render any chapter from JSON.
        </Subtitle>
      </div>
      <div style={{ fontFamily: FONTS.mono, fontSize: 22, color: '#7A6F58', letterSpacing: '0.1em' }}>
        t.noit.pro · self-host
      </div>
    </div>
  </Slide>
);

const Slide10_Prereqs = () => (
  <Slide>
    <Eyebrow>Before you start</Eyebrow>
    <Title>You'll need three things.</Title>
    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 36, marginTop: 70, alignItems: 'stretch' }}>
      {[
        { label: 'Python 3.10+', body: 'Standard CPython. Anaconda or a venv both work.', mono: 'python --version' },
        { label: 'Jupyter', body: 'JupyterLab or classic Notebook — every step is a notebook.', mono: 'pip install jupyterlab' },
        { label: 'A browser', body: 'The output is plain HTML. No build server required.', mono: 'open psalms/27.html' },
      ].map((c, i) => (
        <div key={i} style={{ background: '#FFF', border: `1px solid ${COLORS.rule}`, padding: 40, display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div style={{ fontFamily: FONTS.mono, fontSize: 24, color: COLORS.accent }}>{String(i + 1).padStart(2, '0')}</div>
          <Title size="subtitle" style={{ fontSize: 44 }}>{c.label}</Title>
          <Body style={{ fontSize: 26, color: COLORS.inkSoft }}>{c.body}</Body>
          <div style={{ marginTop: 'auto', fontFamily: FONTS.mono, fontSize: 20, color: '#E8E0CC', background: COLORS.bgDark, padding: '10px 14px' }}>
            $ {c.mono}
          </div>
        </div>
      ))}
    </div>
    <SlideFooter section="03 · Self-host" />
  </Slide>
);

const Slide11_Step1 = () => (
  <Slide>
    <Eyebrow>Step 1</Eyebrow>
    <Title>Clone the repo for the branch you want.</Title>
    <Subtitle style={{ marginTop: 18 }}>
      OT and NT are separate repositories with the same shape.
    </Subtitle>
    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 50, marginTop: 56, alignItems: 'stretch' }}>
      <CodeBlock label="Old Testament — /e/">
{`$ git clone \\
    https://github.com/ewilpeers/bible.git
$ cd bible

# layout
.
├── bible/             ← canonical JSON + rendered HTML
│   ├── psalms/27.json
│   └── psalms/27.html
├── 6HTML_render_OT.ipynb
├── 7excel_import_export.ipynb
└── ...`}
      </CodeBlock>
      <CodeBlock label="New Testament — /g/">
{`$ git clone \\
    https://github.com/ewilpeers/new-testament.git
$ cd new-testament

# same shape, different sources
.
├── bible/
│   ├── 1_corinthians/7.json
│   └── 1_corinthians/7.html
├── HTML_render_NT.ipynb
└── ...`}
      </CodeBlock>
    </div>
    <SlideFooter section="03 · Self-host" />
  </Slide>
);

const Slide12_Step2 = () => (
  <Slide>
    <Eyebrow>Step 2</Eyebrow>
    <Title>Run the render notebook by heading.</Title>
    <Subtitle style={{ marginTop: 18 }}>
      <Code>6HTML_render_OT.ipynb</Code> is split into per-chapter sections. Run them by heading — not <Code>Cell → Run All</Code>.
    </Subtitle>
    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, marginTop: 56 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <CodeBlock label="terminal">
{`$ pip install -r requirements.txt
$ jupyter lab    # or  jupyter notebook`}
        </CodeBlock>
        <div style={{ background: '#FFF', border: `1px solid ${COLORS.rule}`, padding: 28, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontFamily: FONTS.sans, fontSize: 18, color: COLORS.inkMute, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            How to run a heading
          </div>
          {[
            'Open the Headings (Table of Contents) tab in JupyterLab',
            'Right-click the heading you want',
            'Choose "Select and Run Cells for this Heading"',
            'Only that book/chapter section runs',
          ].map((t, i) => (
            <div key={i} style={{ display: 'flex', gap: 14, fontFamily: FONTS.serif, fontSize: 22, color: COLORS.ink, lineHeight: 1.4 }}>
              <span style={{ fontFamily: FONTS.mono, color: COLORS.accent, minWidth: 26 }}>{i + 1}.</span>
              <span>{t}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background: '#FFF', border: `1px solid ${COLORS.rule}`, padding: 32, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ fontFamily: FONTS.sans, fontSize: 18, color: COLORS.inkMute, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          What it does
        </div>
        {[
          'Loads each JSON in bible/<book>/*.json',
          'Loads Fraktur, Greek, Hebrew web fonts from bible/fonts/',
          'Renders one self-contained .html per chapter',
          'Writes audio links pointing at /strongs_p/h0001.mp3 (and g0001.mp3)',
          'Embeds Strong\'s, morphology, and BLB cross-links inline',
        ].map((t, i) => (
          <div key={i} style={{ display: 'flex', gap: 14, fontFamily: FONTS.serif, fontSize: 22, color: COLORS.ink, lineHeight: 1.4 }}>
            <span style={{ color: COLORS.accent, fontFamily: FONTS.mono }}>▸</span>
            <span>{t}</span>
          </div>
        ))}
      </div>
    </div>
    <SlideFooter section="03 · Self-host" />
  </Slide>
);

const Slide13_Step3 = () => (
  <Slide>
    <Eyebrow>Step 3</Eyebrow>
    <Title>Open any rendered chapter in your browser.</Title>
    <Subtitle style={{ marginTop: 18 }}>
      Each file is fully self-contained. Open it directly — no local server needed.
    </Subtitle>
    <div style={{ flex: 1, marginTop: 50, display: 'grid', gridTemplateColumns: '0.85fr 1.15fr', gap: 56, minHeight: 0 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <CodeBlock label="open the chapter">
{`$ open bible/psalms/27.html
$ open bible/1_corinthians/7.html`}
        </CodeBlock>
        <Body style={{ fontSize: 26, color: COLORS.inkSoft }}>
          What you get is bit-for-bit what runs at <Code>t.noit.pro/e/psalms/27.html</Code> — the deployment is just <code>git push</code> to a static host.
        </Body>
        <div style={{ background: '#FFF', border: `1px solid ${COLORS.rule}`, borderLeft: `5px solid ${COLORS.accent}`, padding: 22, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontFamily: FONTS.sans, fontSize: 14, color: COLORS.inkMute, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            One thing to know
          </div>
          <Body style={{ fontSize: 21, lineHeight: 1.4, margin: 0 }}>
            The <Code>strongs_p/</Code> folder of MP3s is checked into the repo. After cloning, the <Code>▶</Code> buttons just work — locally and in production.
          </Body>
        </div>
        <div style={{ marginTop: 'auto', display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <Tag color={COLORS.greek}>No server</Tag>
          <Tag color={COLORS.greek}>No DB</Tag>
          <Tag color={COLORS.greek}>No JS framework</Tag>
        </div>
      </div>
      <div style={{ minHeight: 0, display: 'flex', alignItems: 'center' }}>
        <VerseCard branch="OT" scale={0.7} style={{ width: 800 }} />
      </div>
    </div>
    <SlideFooter section="03 · Self-host" />
  </Slide>
);

const Slide14_DataFlow = () => (
  <Slide>
    <Eyebrow>Data flow at a glance</Eyebrow>
    <Title>From scraped sources to a chapter you can read.</Title>
    <div style={{ flex: 1, marginTop: 70, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 18, alignItems: 'stretch', width: '100%' }}>
        {[
          { t: 'Sources', s: 'BHS · LXX · BLB · Glück scans · Latvian 65/2024', c: COLORS.hebrew },
          { t: 'Notebooks', s: 'extract → merge → align → correct', c: COLORS.greek },
          { t: 'JSON', s: 'bible/<book>/<chapter>.json', c: COLORS.accent },
          { t: 'Render', s: '6HTML_render_OT.ipynb', c: COLORS.latvian },
          { t: 'HTML', s: 'one self-contained file per chapter', c: COLORS.fraktur },
        ].map((step, i, arr) => (
          <React.Fragment key={i}>
            <div style={{ background: '#FFF', border: `1px solid ${COLORS.rule}`, borderTop: `5px solid ${step.c}`, padding: 28, display: 'flex', flexDirection: 'column', gap: 12, position: 'relative' }}>
              <div style={{ fontFamily: FONTS.mono, fontSize: 20, color: step.c }}>{String(i + 1).padStart(2, '0')}</div>
              <div style={{ fontFamily: FONTS.serif, fontSize: 32, fontWeight: 500 }}>{step.t}</div>
              <div style={{ fontFamily: FONTS.serif, fontSize: 20, color: COLORS.inkSoft, lineHeight: 1.4 }}>{step.s}</div>
              {i < arr.length - 1 && (
                <div style={{ position: 'absolute', right: -16, top: '50%', fontFamily: FONTS.mono, fontSize: 28, color: COLORS.inkMute, transform: 'translateY(-50%)', zIndex: 2 }}>→</div>
              )}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
    <SlideFooter section="03 · Self-host" />
  </Slide>
);

Object.assign(window, { Slide09_SectionDup, Slide10_Prereqs, Slide11_Step1, Slide12_Step2, Slide13_Step3, Slide14_DataFlow });
