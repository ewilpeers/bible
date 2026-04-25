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

// Shared bits used by the two real-result slides (Isaiah 2:4, Ezekiel 3:26).
// Both slides illustrate the same Colab query — 'māc', kopīgie (LEN ∩ LEN) — but
// pair them deliberately: Isaiah catches a *family* of inflections (pārmāca,
// mācīsies, nemācīsies) where the Greek is ἐλέγξει; Ezekiel catches the direct
// match where the Greek is ἐλέγχοντα.
const SearchHighlight = ({ children }) => (
  <span style={{ background: COLORS.highlight, padding: '0 3px', borderRadius: 2 }}>{children}</span>
);

const SearchLine = ({ flag, label, font, color, dir, fontSize = 22, children, lineHeight = 1.5 }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minHeight: 0 }}>
    <div style={{ fontFamily: FONTS.sans, fontSize: 14, color: COLORS.inkMute, letterSpacing: '0.06em' }}>
      <span style={{ marginRight: 6 }}>{flag}</span>{label}
    </div>
    <div
      style={{
        fontFamily: font,
        fontSize,
        color: color || COLORS.ink,
        lineHeight,
        direction: dir || 'ltr',
        background: '#FFF',
        border: `1px solid ${COLORS.ruleSoft}`,
        borderRadius: 4,
        padding: '10px 14px',
      }}
    >
      {children}
    </div>
  </div>
);

// Parameterized slide. `n` is the verse-shown index (1 or 2 of 35). `note` is
// the one-line linguistic annotation rendered below the result.
const SearchResultSlide = ({ eyebrow, title, n, verseRef, badge, hebrew, lv1694, greekLxx, greekAbp, lv1965, lv2024, note }) => (
  <Slide>
    <Eyebrow>{eyebrow}</Eyebrow>
    <Title style={{ fontSize: 48 }}>{title}</Title>

    {/* Query bar — mirrors the Colab page header */}
    <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 14, padding: '12px 18px', background: COLORS.bgAlt, border: `1px solid ${COLORS.ruleSoft}`, borderRadius: 6 }}>
      <span style={{ fontFamily: FONTS.sans, fontSize: 13, letterSpacing: '0.12em', textTransform: 'uppercase', color: COLORS.inkMute }}>Query</span>
      <span style={{ fontFamily: FONTS.mono, fontSize: 18, color: COLORS.ink }}>'māc'</span>
      <span style={{ fontFamily: FONTS.sans, fontSize: 14, color: COLORS.inkMute }}>·</span>
      <span style={{ fontFamily: FONTS.serif, fontStyle: 'italic', fontSize: 18, color: COLORS.inkSoft }}>kopīgie (LEN ∩ LEN)</span>
      <span style={{ flex: 1 }} />
      <span style={{ fontFamily: FONTS.mono, fontSize: 14, color: COLORS.accent, letterSpacing: '0.1em', textTransform: 'uppercase' }}>35 verses returned · showing {n}</span>
    </div>

    {/* Verse card */}
    <div style={{ flex: 1, marginTop: 16, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div
        style={{
          background: '#FFF',
          border: `1px solid ${COLORS.rule}`,
          borderLeft: `5px solid ${COLORS.greek}`,
          borderRadius: 6,
          padding: '18px 24px',
          boxShadow: '0 12px 30px rgba(31,26,20,0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          minHeight: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 28, height: 28, borderRadius: '50%',
              background: '#E74C3C', color: '#FFF',
              fontFamily: FONTS.sans, fontSize: 14, fontWeight: 700,
            }}
          >{badge}</span>
          <span style={{ fontFamily: FONTS.sans, fontWeight: 700, fontSize: 17, color: COLORS.ink, background: COLORS.bgAlt, padding: '6px 14px', borderRadius: 999 }}>
            {verseRef}
          </span>
        </div>

        {/* Row 1: Hebrew + Latvian 1694 (Fraktur) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <SearchLine flag="🇮🇱" label="Hebrew" font={FONTS.hebrew} color={COLORS.hebrew} dir="rtl" fontSize={22}>
            {hebrew}
          </SearchLine>
          <SearchLine flag="🇱🇻" label="Latvian (1694)" font={FONTS.fraktur} color={COLORS.fraktur} fontSize={20}>
            {lv1694}
          </SearchLine>
        </div>

        {/* Row 2: Greek LXX + ABP, and Latvian 1965 with always-open 2024 popup */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, minHeight: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <SearchLine flag="🇬🇷" label="Greek LXX" font={FONTS.greek} color={COLORS.greek} fontSize={18}>
              {greekLxx}
            </SearchLine>
            <SearchLine flag="🇬🇷" label="Greek ABP" font={FONTS.greek} color={COLORS.greek} fontSize={18}>
              {greekAbp}
            </SearchLine>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minHeight: 0 }}>
            <SearchLine flag="🇱🇻" label="Latvian (1965)" font={FONTS.serif} color={COLORS.latvian} fontSize={18}>
              {lv1965}
            </SearchLine>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span
                style={{
                  flexShrink: 0,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 22, height: 22, borderRadius: '50%',
                  background: '#2C3E50', color: '#FFF',
                  fontFamily: FONTS.sans, fontSize: 13, fontWeight: 700,
                  marginTop: 4,
                }}
              >ⓘ</span>
              <div
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  background: '#EAF4FB',
                  border: '1px solid #AED6F1',
                  borderRadius: 6,
                }}
              >
                <div style={{ fontFamily: FONTS.sans, fontSize: 13, fontWeight: 700, color: '#2471A3', marginBottom: 3, letterSpacing: '0.04em' }}>
                  🇱🇻 Latvian (2024)
                </div>
                <div style={{ fontFamily: FONTS.serif, fontSize: 17, color: '#2C3E50', lineHeight: 1.45 }}>
                  {lv2024}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Footnote: highlight legend + the slide-specific linguistic annotation */}
    <div style={{ marginTop: 14, display: 'flex', gap: 22, alignItems: 'baseline', fontFamily: FONTS.sans, fontSize: 14, color: COLORS.inkMute }}>
      <span><SearchHighlight>highlight</SearchHighlight> &nbsp;= where the regex matched in each text</span>
      <span>·</span>
      <span style={{ fontStyle: 'italic', color: COLORS.inkSoft }}>{note}</span>
    </div>

    <SlideFooter section="05 · Search" />
  </Slide>
);

// Verse 1 of 35 — Isaiah 2:4 ("swords into plowshares").
// The match catches *related inflections* across all four texts: Latvian 1694
// has TWO hits (pārmācīs and mācīsies), Latvian 1965/2024 have nemācīsies.
// Greek here is ἐλέγξει ("will rebuke") — a future inflection of the verb
// that Ezekiel 3:26 uses as a participle (ἐλέγχοντα). One regex, two senses.
const Slide26_SearchExample_Isaiah = () => (
  <SearchResultSlide
    eyebrow="Track 05 · Search · A real result (1 of 35)"
    title="One needle catches a family of inflections."
    n={1}
    badge={4}
    verseRef="Isaiah 2:4"
    hebrew={<>וְשָׁפַט֙ בֵּ֣ין הַגּוֹיִ֔ם וְהוֹ<SearchHighlight>כִ֖יח</SearchHighlight>ַ לְעַמִּ֣ים רַבִּ֑ים וְכִתְּת֨וּ חַרְבוֹתָ֜ם לְאִתִּ֗ים וַחֲנִיתֽוֹתֵיהֶם֙ לְמַזְמֵר֔וֹת לֹא יִשָּׂ֨א ג֤וֹי אֶל גּוֹי֙ חֶ֔רֶב וְלֹא יִלְמְד֥וּ ע֖וֹד מִלְחָמָֽה׃ פ</>}
    lv1694={<>Un wiꞥſch teeẜahs ſtarp teem Pagaꞥeem un pahr<SearchHighlight>mahz</SearchHighlight>ihs daudſ Łaudis un tee ẜakals ẜawus Sohbiꞥus par Lemmeẜcheem un ẜawus Ꞩchꞣehpus par Zirpeem Jo Tauta prett Tautu nekahdu Sohbinu pazels un ne <SearchHighlight>mahz</SearchHighlight>iẜees wairs Kaŗŗu</>}
    greekLxx={<>καὶ κρινεῖ ἀνὰ μέσον τῶν ἐθνῶν καὶ ἐ<SearchHighlight>λέγ</SearchHighlight>ξει λαὸν πολύν καὶ συγκόψουσιν τὰς μαχαίρας αὐτῶν εἰς ἄροτρα καὶ τὰς ζιβύνας αὐτῶν εἰς δρέπανα καὶ οὐ λήμψεται ἔτι ἔθνος ἐπ ἔθνος μάχαιραν καὶ οὐ μὴ μάθωσιν ἔτι πολεμεῖν</>}
    greekAbp={<>και κρινεί αναμέσον των εθνών και εξε<SearchHighlight>λέγ</SearchHighlight>ξει λαόν πολύν και συγκόψουσι τας μαχαίρας αυτών εις άροτρα και τας ζιβύνας αυτών εις δρέπανα και ου λήψεται έθνος επ' έθνος μάχαιραν και ου μη μάθωσιν έτι πολεμείν</>}
    lv1965={<>Tad Viņš spriedīs tiesu tautu starpā un tiesās daudzas tautas Viņi tad pārkals savus zobenus par lemešiem un savus šķēpus par vīnadārza dārznieku nažiem Tauta pret tautu nepacels vairs zobena un ne<SearchHighlight>māc</SearchHighlight>īsies vairs karot</>}
    lv2024={<>Viņš tiesās ļaudis spriedīs par daudzām tautām tad tie pārkals savus zobenus arklos un savus šķēpus ecēšās tauta pret tautu vairs zobenu necels un karot vairs ne<SearchHighlight>māc</SearchHighlight>īsies</>}
    note={<>Note — Greek here is <b>ἐλέγξει</b> (future "will rebuke"). Latvian 1694 hits <i>twice</i> — <b>pārmācīs</b> and <b>mācīsies</b> — both share the regex root <Code style={{ fontSize: '0.85em' }}>māc</Code>.</>}
  />
);

// Verse 2 of 35 — Ezekiel 3:26. Different sense, same regex.
// Latvian "pamācītāju" maps directly to Greek participle ἐλέγχοντα ("rebuker").
// Together with Isaiah 2:4 these illustrate how a single regex picks up
// both the future-tense and participial uses of the same Greek verb family.
const Slide27_SearchExample_Ezekiel = () => (
  <SearchResultSlide
    eyebrow="Track 05 · Search · A real result (2 of 35)"
    title="Same needle, the direct semantic match."
    n={2}
    badge={26}
    verseRef="Ezekiel 3:26"
    hebrew={<>וּלְשֽׁוֹנְךָ֙ אַדְבִּ֣יק אֶל חִכֶּ֔ךָ וְנֶֽאֱלַ֔מְתָּ וְלֹא תִֽהְיֶ֥ה לָהֶ֖ם לְאִ֣ישׁ מוֹ<SearchHighlight>כִ֑יח</SearchHighlight>ַ כִּ֛י בֵּ֥ית מְרִ֖י הֵֽמָּה׃</>}
    lv1694={<>Un es likẜchu tawu Mehli pee tawa Schohda peelipt ka tew buhs mehmam palikt un teem wairs par Pahr<SearchHighlight>maz</SearchHighlight>itaju ne buht jo tee irr weens pahrgalwigs Nams</>}
    greekLxx={<>καὶ τὴν γλῶσσάν σου συνδήσω καὶ ἀποκωφωθήσῃ καὶ οὐκ ἔσῃ αὐτοῖς εἰς ἄνδρα ἐ<SearchHighlight>λέγ</SearchHighlight>χοντα διότι οἶκος παραπικραίνων ἐστίν</>}
    greekAbp={<>και την γλώσσάν σου συνδήσω τω λάρυγγί σου και αποκωφωθήση και ουκ έση αυτοίς εις άνδρα ε<SearchHighlight>λέγ</SearchHighlight>χοντα διότι οίκος παραπικραίνων εστί</>}
    lv1965={<>Es likšu tavai mēlei pielipt pie tava žokļa ka tu paliec mēms un nebūsi tiem vairs par pa<SearchHighlight>māc</SearchHighlight>ītāju jo tie ir pretestības pilna cilts</>}
    lv2024={<>Un tavu mēli es pielipināšu aukslējām ka tu būsi mēms Tu nebūsi ar tiem lai katrs lemj pats jo tie ir dumpīga saime</>}
    note={<>Note — Greek here is <b>ἐλέγχοντα</b> (participle "rebuker"). Latvian <b>pamācītāju</b> is the noun form — a direct semantic match. Same regex; different inflection from Isaiah's <b>ἐλέγξει</b>.</>}
  />
);

const Slide28_KnownIssues = () => (
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

const Slide29_CTA = () => (
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

const Slide30_End = () => (
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

Object.assign(window, { Slide24_SearchProblem, Slide25_SearchSolution, Slide26_SearchExample_Isaiah, Slide27_SearchExample_Ezekiel, Slide28_KnownIssues, Slide29_CTA, Slide30_End });
