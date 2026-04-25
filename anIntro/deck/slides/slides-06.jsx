// Slides 24-28: Search, known issues, closing CTA

const Slide24_SearchProblem = () => (
  <Slide>
    <Eyebrow>Track 05 · Search · The problem</Eyebrow>
    <Title>Bible sites strip accents — but sometimes that's exactly what you don't want.</Title>
    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '0.95fr 1.05fr', gap: 60, marginTop: 56, minHeight: 0 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        <Body>
          Most search boxes are accent-insensitive by default — useful for casual reading, useless for study. There's no <b>way out</b> of it: no escape, no regex, no character classes.
        </Body>
        <Body style={{ color: COLORS.inkSoft }}>
          A scholar wants the opposite: <b>match this exact pointing</b>, or <b>match any vowel here, but specifically <Code>שׁ</Code> not <Code>שׂ</Code></b>, or <b>this Hebrew word AND its Greek counterpart in the same verse</b>.
        </Body>
        <div style={{ marginTop: 8, padding: 22, background: COLORS.bgAlt, border: `1px solid ${COLORS.ruleSoft}`, borderLeft: `5px solid ${COLORS.accent}` }}>
          <div style={{ fontFamily: FONTS.sans, fontSize: 14, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.inkMute, marginBottom: 8 }}>
            What's missing
          </div>
          <Body style={{ fontSize: 22, lineHeight: 1.45, margin: 0 }}>
            Regex. Character sets. A way to opt back <i>into</i> diacritic-sensitive matching when you need it.
          </Body>
        </div>
      </div>
      <div style={{ background: '#FFF', border: `1px solid ${COLORS.rule}`, padding: 28, minHeight: 0 }}>
        <div style={{ fontFamily: FONTS.sans, fontSize: 14, color: COLORS.inkMute, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14 }}>
          Queries you can't ask elsewhere
        </div>
        {[
          { q: 'שׁ[ָֻ]מ', d: 'shin (not sin) + qamatz OR qubutz + mem', ok: true },
          { q: 'יהוה.{0,20}אלהים', d: 'יהוה within 20 chars of אלהים', ok: true },
          { q: 'φῶς (exact accents)', d: 'match the form, not just the letters', ok: true },
          { q: 'gaiš.* AND φωτ.*', d: 'cross-language co-occurrence in a verse', ok: true },
          { q: '\\bgais\\b (no diacritics)', d: 'normalised — when you do want fuzzy', ok: true },
        ].map((row, i) => (
          <div key={i} style={{ borderBottom: `1px solid ${COLORS.ruleSoft}`, padding: '12px 4px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ fontFamily: FONTS.mono, fontSize: 19, color: COLORS.ink }}>
              {row.q}
            </div>
            <div style={{ fontFamily: FONTS.serif, fontSize: 17, color: COLORS.inkSoft, fontStyle: 'italic' }}>
              {row.d}
            </div>
          </div>
        ))}
      </div>
    </div>
    <SlideFooter section="05 · Search" />
  </Slide>
);

const Slide25_SearchSolution = () => (
  <Slide>
    <Eyebrow>Track 05 · Search · The solution</Eyebrow>
    <Title>A Colab notebook gives you regex + multi-language needles.</Title>
    <Subtitle style={{ marginTop: 18 }}>
      <Code>github.com/ewilpeers/bible/tree/master/xG_Collab</Code> — full Python, full regex, all four texts in one query.
    </Subtitle>
    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '0.9fr 1.1fr', gap: 60, marginTop: 50, minHeight: 0 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Body style={{ fontSize: 26 }}>
          Search a verse by listing <b>multiple needles</b> across languages — and use full <b>regex</b> on each one.
        </Body>
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            'Each needle is a Python regex',
            'Needles can span Hebrew, Greek, and Latvian in one query',
            'A verse hits if all needles match (configurable AND/OR)',
            'Diacritic-insensitive is just one mode — opt in or out per needle',
            'Free Google Colab — open and run',
          ].map((t, i) => (
            <li key={i} style={{ fontFamily: FONTS.serif, fontSize: 22, display: 'flex', gap: 14, alignItems: 'baseline' }}>
              <span style={{ color: COLORS.accent, fontFamily: FONTS.mono }}>▸</span>{t}
            </li>
          ))}
        </ul>
      </div>
      <div style={{ background: '#FFF', border: `1px solid ${COLORS.rule}`, padding: 26, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ fontFamily: FONTS.sans, fontSize: 14, color: COLORS.inkMute, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Multi-language regex query
        </div>
        <div style={{ background: '#1B1813', color: '#E8DDC4', padding: 18, fontFamily: FONTS.mono, fontSize: 16, lineHeight: 1.55, borderRadius: 4 }}>
          <span style={{ color: '#9A8E70' }}>{'# match Hebrew + Greek + Latvian in the same verse'}</span><br />
          needles = [<br />
          {'  '}<span style={{ color: '#E8B868' }}>r"אוֹר"</span>,{'        '}<span style={{ color: '#9A8E70' }}>{'# Hebrew (exact pointing)'}</span><br />
          {'  '}<span style={{ color: '#E8B868' }}>r"φωτ\w*"</span>,{'    '}<span style={{ color: '#9A8E70' }}>{'# Greek lemma stem'}</span><br />
          {'  '}<span style={{ color: '#E8B868' }}>r"gaiš\w+"</span>,{'    '}<span style={{ color: '#9A8E70' }}>{'# Latvian — any inflection'}</span><br />
          ]<br />
          <span style={{ color: COLORS.accent }}>search</span>(needles, mode=<span style={{ color: '#E8B868' }}>"AND"</span>)
        </div>
        <div style={{ fontFamily: FONTS.sans, fontSize: 14, color: COLORS.inkMute, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 6 }}>
          Hits
        </div>
        {[
          { ref: 'Psalms 27:1', heb: 'יְהוָ֤ה אוֹרִ֣י', gr: 'κύριος φωτισμός μου', lv: 'Tas Kungs ir mans gaišums' },
          { ref: 'Isaiah 60:1', heb: 'כִּי בָא אוֹרֵךְ', gr: 'ἥκει σου τὸ φῶς', lv: 'jo tavs gaišums atnāk' },
          { ref: 'John 8:12', heb: '—', gr: 'ἐγώ εἰμι τὸ φῶς', lv: 'Es esmu pasaules gaišums' },
        ].map((r, i) => (
          <div key={i} style={{ borderBottom: `1px solid ${COLORS.ruleSoft}`, padding: '8px 0', display: 'flex', flexDirection: 'column', gap: 3 }}>
            <div style={{ fontFamily: FONTS.mono, fontSize: 14, color: COLORS.accent }}>{r.ref}</div>
            <div style={{ fontFamily: FONTS.hebrew, fontSize: 18, color: COLORS.hebrew, direction: 'rtl', textAlign: 'right' }}>{r.heb}</div>
            <div style={{ fontFamily: FONTS.greek, fontSize: 16, color: COLORS.greek }}>{r.gr}</div>
            <div style={{ fontFamily: FONTS.serif, fontSize: 16, color: COLORS.latvian }}>{r.lv}</div>
          </div>
        ))}
      </div>
    </div>
    <SlideFooter section="05 · Search" />
  </Slide>
);

const Slide26_KnownIssues = () => (
  <Slide>
    <Eyebrow>Honesty</Eyebrow>
    <Title>Known issues are documented openly.</Title>
    <Subtitle style={{ marginTop: 18 }}>
      The README lists missing verses, audio bugs, and verses absent from Glück 1694. None of it is hidden.
    </Subtitle>
    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 36, marginTop: 56 }}>
      {[
        { t: 'Missing verses', n: '7', s: 'Greek-empty entries — Esther, Jeremiah, Proverbs.', c: COLORS.hebrew },
        { t: 'Audio bugs', n: '6+', s: 'Strong\'s ID swaps and split errors in BLB pronunciations.', c: COLORS.accent },
        { t: 'Glück gaps', n: '17', s: 'Verses present in MT but not in 1694 Glück — won\'t-fix, marked.', c: COLORS.fraktur },
      ].map((c, i) => (
        <div key={i} style={{ background: '#FFF', border: `1px solid ${COLORS.rule}`, borderTop: `5px solid ${c.c}`, padding: 36, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ fontFamily: FONTS.serif, fontSize: 88, color: c.c, lineHeight: 1, fontWeight: 500 }}>{c.n}</div>
          <Title size="subtitle" style={{ fontSize: 36 }}>{c.t}</Title>
          <Body style={{ fontSize: 22, color: COLORS.inkSoft }}>{c.s}</Body>
        </div>
      ))}
    </div>
    <Body style={{ marginTop: 30, fontSize: 24, color: COLORS.inkSoft }}>
      Open an issue with just the audio number prefixed <Code>h</Code> or <Code>g</Code> — that's all that's needed to file a fix.
    </Body>
    <SlideFooter section="05 · Search" />
  </Slide>
);

const Slide27_CTA = () => (
  <Slide bg={COLORS.bgDark} color="#E8DDC4" padded={false}>
    <div style={{ position: 'absolute', inset: 0, padding: `${SPACING.paddingTop}px ${SPACING.paddingX}px ${SPACING.paddingBottom}px`, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80 }}>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 30, borderRight: '1px solid #3D3830', paddingRight: 80 }}>
        <div style={{ fontFamily: FONTS.sans, fontSize: 22, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#9A8E70' }}>
          Read
        </div>
        <Title style={{ color: '#F2E8D0', fontSize: 88, lineHeight: 1.05 }}>Try it.</Title>
        <Body style={{ fontSize: 32, color: '#C9BC9C' }}>
          Open any chapter, click any word, hear it spoken.
        </Body>
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ fontFamily: FONTS.mono, fontSize: 32, color: COLORS.accent }}>t.noit.pro/e/</div>
          <div style={{ fontFamily: FONTS.mono, fontSize: 32, color: COLORS.accent }}>t.noit.pro/g/</div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 30 }}>
        <div style={{ fontFamily: FONTS.sans, fontSize: 22, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#9A8E70' }}>
          Contribute
        </div>
        <Title style={{ color: '#F2E8D0', fontSize: 88, lineHeight: 1.05 }}>Build with us.</Title>
        <Body style={{ fontSize: 32, color: '#C9BC9C' }}>
          Pick a track. Open a PR. The diff is JSON.
        </Body>
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            'github.com/ewilpeers/bible',
            'github.com/ewilpeers/new-testament',
            'github.com/ewilpeers/lv_fraktur_ocr',
          ].map((u, i) => (
            <div key={i} style={{ fontFamily: FONTS.mono, fontSize: 24, color: '#E8DDC4' }}>{u}</div>
          ))}
        </div>
      </div>
    </div>
  </Slide>
);

const Slide28_End = () => (
  <Slide bg={COLORS.bg} padded={false}>
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 36, padding: SPACING.paddingX }}>
      <div style={{ fontFamily: FONTS.mono, fontSize: 22, color: COLORS.inkMute, letterSpacing: '0.3em', textTransform: 'uppercase' }}>
        Paldies · Thank you
      </div>
      <Title style={{ fontSize: 140, lineHeight: 1, textAlign: 'center' }}>Questions?</Title>
      <FrakturSample text="tahds irr kà kahds Kohks pee Uhdens Uppehm ſtahdihts" style={{ fontSize: 32, color: COLORS.inkSoft, textAlign: 'center', marginTop: 30 }} />
      <div style={{ fontFamily: FONTS.mono, fontSize: 22, color: COLORS.accent, marginTop: 12 }}>t.noit.pro</div>
    </div>
  </Slide>
);

Object.assign(window, { Slide24_SearchProblem, Slide25_SearchSolution, Slide26_KnownIssues, Slide27_CTA, Slide28_End });
