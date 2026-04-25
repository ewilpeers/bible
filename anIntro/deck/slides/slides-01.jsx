// Slides 1-4: Intro & overview (revised)

const Slide01_Title = () => (
  <Slide bg={COLORS.bg} padded={false}>
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: `radial-gradient(ellipse 80% 60% at 30% 40%, ${COLORS.bgAlt} 0%, ${COLORS.bg} 70%)`,
      }}
    />
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        padding: `${SPACING.paddingTop}px ${SPACING.paddingX}px ${SPACING.paddingBottom}px`,
        boxSizing: 'border-box',
        display: 'grid',
        gridTemplateColumns: '1.05fr 0.95fr',
        gap: 100,
        alignItems: 'center',
      }}
    >
      <div>
        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize: 28,
            color: COLORS.accent,
            letterSpacing: '0.18em',
            marginBottom: 40,
          }}
        >
          t.noit.pro
        </div>
        <Title size="display" style={{ fontSize: 110, lineHeight: 1.02, marginBottom: 36 }}>
          Hear every word.<br />Read every layer.
        </Title>
        <Subtitle style={{ fontSize: 38 }}>
          A multi-source Bible study with spoken pronunciations and four parallel translations — for Latvian readers.
        </Subtitle>
        <div style={{ marginTop: 60, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <Tag color={COLORS.greek}>Hebrew · Greek · Latvian</Tag>
          <Tag color={COLORS.accent}>1694 Glück Fraktur</Tag>
          <Tag color={COLORS.latvian}>Audio per word-form</Tag>
          <Tag color={COLORS.inkSoft}>Static HTML · open-source</Tag>
        </div>
      </div>
      <div
        style={{
          background: '#FFF',
          border: `1px solid ${COLORS.rule}`,
          borderRadius: 8,
          padding: 32,
          boxShadow: '0 18px 48px rgba(31,26,20,0.12)',
          transform: 'rotate(0.6deg)',
        }}
      >
        <div style={{ fontFamily: FONTS.sans, fontSize: 16, color: COLORS.inkMute, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 18 }}>
          📖 Psalms 27 · 1
        </div>
        <FrakturSample text="TAs KUNGS irr mans Gaiẜchums un manna Peſtiẜchana" />
        <div style={{ height: 1, background: COLORS.rule, margin: '24px 0' }} />
        <div style={{ fontFamily: FONTS.hebrew, fontSize: 36, color: COLORS.hebrew, direction: 'rtl', textAlign: 'right' }}>
          יְהוָ֤ה אוֹרִ֣י וְ֭יִשְׁעִי
        </div>
        <div style={{ fontFamily: FONTS.greek, fontSize: 28, color: COLORS.greek, marginTop: 16 }}>
          κύριος φωτισμός μου καὶ σωτήρ μου
        </div>
        <div style={{ marginTop: 22, display: 'flex', alignItems: 'center', gap: 12, color: COLORS.accent, fontFamily: FONTS.mono, fontSize: 18 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: '50%', background: COLORS.accent, color: '#FFF' }}>▶</span>
          h3068.mp3 · twice · base form
        </div>
      </div>
    </div>
  </Slide>
);

const Slide02_TwoBranches = () => (
  <Slide>
    <Eyebrow>What it is</Eyebrow>
    <Title>Two branches share one design.</Title>
    <Subtitle style={{ marginTop: 20 }}>
      The Old and New Testaments live as parallel sub-projects, with identical interlinear behaviour.
    </Subtitle>
    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, marginTop: 60 }}>
      <BranchCard
        path="/e/"
        repo="ewilpeers/bible"
        name="Old Testament"
        sources={['Hebrew (MT)', 'Greek (LXX, ABP)', 'Latvian 1694 (Glück)', 'Latvian 1965', 'Latvian 2024']}
        accent={COLORS.hebrew}
      />
      <BranchCard
        path="/g/"
        repo="ewilpeers/new-testament"
        name="New Testament"
        sources={['Greek (NT)', 'Latvian 1694 (Glück)', 'Latvian 1965', 'Latvian 2024']}
        accent={COLORS.greek}
      />
    </div>
    <SlideFooter section="01 · Overview" />
  </Slide>
);

const BranchCard = ({ path, repo, name, sources, accent }) => (
  <div
    style={{
      background: '#FFF',
      border: `1px solid ${COLORS.rule}`,
      borderTop: `6px solid ${accent}`,
      padding: 44,
      display: 'flex',
      flexDirection: 'column',
      gap: 22,
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <div style={{ fontFamily: FONTS.mono, fontSize: 38, color: accent }}>t.noit.pro{path}</div>
      <div style={{ fontFamily: FONTS.sans, fontSize: 22, color: COLORS.inkMute, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        Branch
      </div>
    </div>
    <Title size="subtitle" style={{ fontSize: 56, marginTop: 6 }}>{name}</Title>
    <Rule />
    <div style={{ fontFamily: FONTS.sans, fontSize: 16, color: COLORS.inkMute, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
      Sources
    </div>
    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {sources.map((s, i) => (
        <li key={i} style={{ fontFamily: FONTS.serif, fontSize: 26, color: COLORS.ink, display: 'flex', gap: 16 }}>
          <span style={{ color: accent, fontFamily: FONTS.mono, fontSize: 22 }}>—</span>
          {s}
        </li>
      ))}
    </ul>
    <div style={{ marginTop: 'auto', fontFamily: FONTS.mono, fontSize: 20, color: COLORS.inkSoft, paddingTop: 18 }}>
      github.com/{repo}
    </div>
  </div>
);

const Slide03_Pronunciation = () => (
  <Slide>
    <Eyebrow>The reading experience</Eyebrow>
    <Title>Hear the base form. Twice. No narration.</Title>
    <Subtitle style={{ marginTop: 18 }}>
      Each Hebrew or Greek form has a play button. It speaks the lemma cleanly — twice — then stops. No "now we hear...". A second link goes straight to the BLB Strong's page.
    </Subtitle>
    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '0.95fr 1.05fr', gap: 64, marginTop: 50, minHeight: 0 }}>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 22 }}>
        <Body>
          The verse appears in <b>four to five aligned languages</b>. Below it, an interlinear table lists every Hebrew/Greek form with its Latvian glosses.
        </Body>
        <Body style={{ color: COLORS.inkSoft }}>
          The forms themselves aren't clickable — but next to each one are two affordances:
        </Body>
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { ic: '▶', t: 'Play — pronounces the base form (lemma) twice', c: COLORS.accent },
            { ic: '↗', t: 'Link — opens the BLB Strong\'s details page in a new tab', c: COLORS.greek },
            { ic: '·', t: 'Audio files: h0001.mp3 (Hebrew) · g0001.mp3 (Greek)', c: COLORS.inkMute },
          ].map((row, i) => (
            <li key={i} style={{ fontFamily: FONTS.serif, fontSize: 26, display: 'flex', gap: 18, alignItems: 'baseline' }}>
              <span style={{ color: row.c, fontFamily: FONTS.mono, minWidth: 22 }}>{row.ic}</span>
              {row.t}
            </li>
          ))}
        </ul>
      </div>
      <div style={{ minHeight: 0, display: 'flex', alignItems: 'center' }}>
        <div style={{ background: '#FFF', border: `1px solid ${COLORS.rule}`, borderLeft: `5px solid ${COLORS.accent}`, padding: 26, width: 760, boxShadow: '0 4px 14px rgba(31,26,20,0.08)' }}>
          <div style={{ display: 'inline-block', fontFamily: FONTS.sans, fontSize: 14, fontWeight: 600, background: COLORS.bgAlt, padding: '6px 16px', borderRadius: 999, marginBottom: 14 }}>Psalms 27:1</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: COLORS.greek, color: '#FFF' }}>
                {['Hebrew', '', 'Latvian', 'Strong\'s'].map((h, i) => (
                  <th key={i} style={{ padding: '8px 10px', textAlign: 'left', fontFamily: FONTS.sans, fontSize: 13, fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { w: 'יְהוָ֤ה', tr: 'Yah·weh', lv: 'Tas Kungs', s: 'H3068' },
                { w: 'אוֹרִ֣י', tr: 'ʾō·w·rî', lv: 'mans gaišums', s: 'H216' },
                { w: 'וְ֭יִשְׁעִי', tr: 'wə·yiš·ʿî', lv: 'un mana pestīšana', s: 'H3468' },
              ].map((r, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${COLORS.ruleSoft}` }}>
                  <td style={{ padding: '12px 10px', verticalAlign: 'middle' }}>
                    <div style={{ fontFamily: FONTS.hebrew, fontSize: 24, color: COLORS.hebrew, direction: 'rtl', fontWeight: 600 }}>{r.w}</div>
                    <div style={{ fontFamily: FONTS.serif, fontSize: 13, color: COLORS.inkMute, fontStyle: 'italic' }}>{r.tr}</div>
                  </td>
                  <td style={{ padding: '12px 10px', verticalAlign: 'middle' }}>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: '50%', background: COLORS.accent, color: '#FFF', fontSize: 12 }}>▶</span>
                      <span style={{ fontFamily: FONTS.mono, fontSize: 12, color: COLORS.inkMute }}>×2</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 10px', verticalAlign: 'middle', fontFamily: FONTS.serif, fontSize: 18, color: COLORS.latvian, fontWeight: 600 }}>{r.lv}</td>
                  <td style={{ padding: '12px 10px', verticalAlign: 'middle' }}>
                    <a style={{ fontFamily: FONTS.mono, fontSize: 14, color: COLORS.greek, textDecoration: 'underline' }}>{r.s} ↗</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: 14, fontFamily: FONTS.sans, fontSize: 13, color: COLORS.inkMute, fontStyle: 'italic' }}>
            ▶ plays /strongs_p/h3068.mp3 — the form pronounced twice, no intro.
          </div>
        </div>
      </div>
    </div>
    <SlideFooter section="01 · Overview" />
  </Slide>
);

const Slide04_Fraktur = () => (
  <Slide bg={COLORS.bgDark} color="#E8DDC4">
    <Eyebrow color="#A89878">The 1694 layer</Eyebrow>
    <Title style={{ color: '#F2E8D0' }}>The Glück translation runs alongside modern Latvian.</Title>
    <Subtitle style={{ marginTop: 20, color: '#C9BC9C' }}>
      Ernst Glück's 1694 Bible — the first complete Latvian translation — is rendered verbatim in Fraktur, beside the 1965, 2024, and original-language texts.
    </Subtitle>
    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, marginTop: 60, alignItems: 'stretch' }}>
      <div
        style={{
          background: '#1B1813',
          border: '1px solid #3D3830',
          padding: 40,
          display: 'flex',
          flexDirection: 'column',
          gap: 22,
        }}
      >
        <div style={{ fontFamily: FONTS.sans, fontSize: 18, color: '#9A8E70', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          1694 — Glück Fraktur
        </div>
        <FrakturSample
          text="BEt par to juhs man eẜẜat rakſtijuẜchi (buhs jums ſinnat) tam Zilwekam labbu eẜẜam ja tas nekahdu Ꞩeewu aiskaŗŗ"
          style={{ color: '#E8D4A0', fontSize: 36, lineHeight: 1.5 }}
        />
        <div style={{ marginTop: 'auto', fontFamily: FONTS.mono, fontSize: 20, color: '#7A6F58' }}>
          1 Corinthians 7:1
        </div>
      </div>
      <div
        style={{
          background: '#1B1813',
          border: '1px solid #3D3830',
          padding: 40,
          display: 'flex',
          flexDirection: 'column',
          gap: 22,
        }}
      >
        <div style={{ fontFamily: FONTS.sans, fontSize: 18, color: '#9A8E70', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          2024 — Modern Latvian
        </div>
        <Body style={{ fontSize: 36, lineHeight: 1.5, color: '#E8DDC4', fontStyle: 'normal' }}>
          Par to ko jūs rakstījāt ir labi vīrietim atturēties no sievietes;
        </Body>
        <div style={{ marginTop: 'auto', fontFamily: FONTS.mono, fontSize: 20, color: '#7A6F58' }}>
          1 Corinthians 7:1
        </div>
      </div>
    </div>
    <SlideFooter section="01 · Overview" />
  </Slide>
);

Object.assign(window, { Slide01_Title, Slide02_TwoBranches, Slide03_Pronunciation, Slide03_ClickableWord: Slide03_Pronunciation, Slide04_Fraktur });
