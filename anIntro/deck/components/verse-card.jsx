// Reusable mock of the t.noit.pro verse rendering — the core "what the site looks like" element.
// Recreated, not copied, from the captures.

const LangLine = ({ flag, label, lang, text, font, color, fraktur, style }) => (
  <div style={{ marginBottom: 14, ...style }}>
    <div
      style={{
        fontFamily: FONTS.sans,
        fontSize: 18,
        color: COLORS.inkMute,
        letterSpacing: '0.06em',
        marginBottom: 4,
        display: 'flex',
        gap: 10,
        alignItems: 'baseline',
      }}
    >
      <span style={{ fontSize: 18 }}>{flag}</span>
      <span style={{ textTransform: 'uppercase' }}>{label}</span>
    </div>
    <div
      style={{
        fontFamily: font,
        fontSize: fraktur ? 32 : 26,
        color: color || COLORS.ink,
        lineHeight: 1.45,
        fontStyle: 'normal',
      }}
      dir={lang === 'he' ? 'rtl' : 'ltr'}
    >
      {text}
    </div>
  </div>
);

// A faux interlinear morphology row
const MorphRow = ({ word, translit, latvian, strong, morph, def, isHebrew, isGreek }) => (
  <tr style={{ borderBottom: `1px solid ${COLORS.ruleSoft}` }}>
    <td style={{ padding: '10px 12px', verticalAlign: 'top' }}>
      <div
        style={{
          fontFamily: isHebrew ? FONTS.hebrew : FONTS.greek,
          fontSize: 22,
          color: isHebrew ? COLORS.hebrew : COLORS.greek,
          fontWeight: 600,
        }}
        dir={isHebrew ? 'rtl' : 'ltr'}
      >
        {word}
      </div>
      {translit && (
        <div style={{ fontFamily: FONTS.serif, fontSize: 14, color: COLORS.inkMute, fontStyle: 'italic' }}>
          {translit}
        </div>
      )}
    </td>
    <td style={{ padding: '10px 12px', verticalAlign: 'top', fontFamily: FONTS.serif, fontSize: 18, color: COLORS.latvian, fontWeight: 600 }}>
      {latvian}
    </td>
    <td style={{ padding: '10px 12px', verticalAlign: 'top', fontFamily: FONTS.mono, fontSize: 14, color: COLORS.accent }}>
      {strong}
    </td>
    <td style={{ padding: '10px 12px', verticalAlign: 'top', fontFamily: FONTS.serif, fontSize: 14, fontStyle: 'italic', color: '#B86A30' }}>
      {morph}
    </td>
    <td style={{ padding: '10px 12px', verticalAlign: 'top', fontFamily: FONTS.serif, fontSize: 13, color: COLORS.inkSoft, lineHeight: 1.35 }}>
      {def}
    </td>
  </tr>
);

// A faithful-feeling reproduction of one verse card from the site
const VerseCard = ({ ref, branch = 'OT', style, scale = 1, showMorph = true, compact = false }) => {
  const isOT = branch === 'OT';
  const lines = isOT
    ? [
        { flag: '🇮🇱', label: 'Hebrew', lang: 'he', text: 'לְדָוִ֨ד  יְהוָ֤ה ׀ אוֹרִ֣י וְ֭יִשְׁעִי מִמִּ֣י אִירָ֑א', font: FONTS.hebrew, color: COLORS.hebrew },
        { flag: '🇱🇻', label: 'Latvian (1694)', lang: 'lv', text: 'TAs KUNGS irr mans Gaiẜchums un manna Peſtiẜchana', font: FONTS.fraktur, color: COLORS.fraktur, fraktur: true },
        { flag: '🇬🇷', label: 'Greek (LXX, ABP)', lang: 'el', text: 'κύριος φωτισμός μου καὶ σωτήρ μου, τίνα φοβηθήσομαι', font: FONTS.greek, color: COLORS.greek },
        { flag: '🇱🇻', label: 'Latvian (1965)', lang: 'lv', text: 'Tas Kungs ir mans gaišums un mana pestīšana, no kā man bīties', font: FONTS.serif, color: COLORS.latvian },
      ]
    : [
        { flag: '🇬🇷', label: 'Greek', lang: 'el', text: 'Περὶ δὲ ὧν ἐγράψατε καλὸν ἀνθρώπῳ γυναικὸς μὴ ἅπτεσθαι', font: FONTS.greek, color: COLORS.greek },
        { flag: '🇱🇻', label: 'Latvian (65)', lang: 'lv', text: 'Bet attiecībā uz to ko man rakstījāt — cilvēkam ir labi sievu neaizskart', font: FONTS.serif, color: COLORS.latvian },
        { flag: '🇱🇻', label: 'Latvian (1694)', lang: 'lv', text: 'BEt par to juhs man eẜẜat rakſtijuẜchi (buhs jums ſinnat) tam Zilwekam labbu eẜẜam', font: FONTS.fraktur, color: COLORS.fraktur, fraktur: true },
        { flag: '🇱🇻', label: 'Latvian (2024)', lang: 'lv', text: 'Par to ko jūs rakstījāt ir labi vīrietim atturēties no sievietes', font: FONTS.serif, color: COLORS.latvian },
      ];

  const morphRows = isOT
    ? [
        { word: 'לְדָוִ֨ד', translit: 'lə·ḏā·wiḏ', latvian: 'Dāvida, dziesma', strong: 'H1732', morph: 'Prep-l|N-prop', def: 'David — beloved, son of Jesse', isHebrew: true },
        { word: 'יְהוָ֤ה', translit: 'Yah·weh', latvian: 'Tas Kungs', strong: 'H3068', morph: 'N-prop-MS', def: 'The proper name of the God of Israel', isHebrew: true },
        { word: 'אוֹרִ֣י', translit: 'ʾō·w·rî', latvian: 'mans gaišums', strong: 'H216', morph: 'N-MSC|1CS', def: 'Light, illumination', isHebrew: true },
      ]
    : [
        { word: 'Περὶ', translit: 'Peri', latvian: 'attiecībā, uz', strong: 'G4012', morph: 'Prep', def: 'Around, about, concerning, with respect to', isGreek: true },
        { word: 'δὲ', translit: 'de', latvian: 'Bet', strong: 'G1161', morph: 'Conj', def: 'A primary particle; but, and', isGreek: true },
        { word: 'ὧν', translit: 'hōn', latvian: 'to, ko', strong: 'G3739', morph: 'RelPro-GNP', def: 'Who, which, what, that', isGreek: true },
      ];

  return (
    <div
      style={{
        background: '#FFFFFF',
        border: `1px solid ${COLORS.rule}`,
        borderLeft: `5px solid ${COLORS.accent}`,
        borderRadius: 8,
        padding: compact ? 18 : 26,
        boxShadow: '0 4px 14px rgba(31, 26, 20, 0.08)',
        transformOrigin: 'top left',
        transform: `scale(${scale})`,
        ...style,
      }}
    >
      <div
        style={{
          display: 'inline-block',
          fontFamily: FONTS.sans,
          fontSize: 16,
          fontWeight: 600,
          color: COLORS.ink,
          background: COLORS.bgAlt,
          padding: '6px 16px',
          borderRadius: 999,
          marginBottom: 18,
          letterSpacing: '0.04em',
        }}
      >
        {ref || (isOT ? 'Psalms 27:1' : '1 Corinthians 7:1')}
      </div>
      {lines.map((l, i) => (
        <LangLine key={i} {...l} />
      ))}
      {showMorph && (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 14, tableLayout: 'fixed' }}>
          <thead>
            <tr style={{ background: COLORS.greek, color: '#fff' }}>
              <th style={{ padding: '8px 12px', textAlign: 'left', fontFamily: FONTS.sans, fontSize: 14, fontWeight: 600, width: '20%' }}>
                {isOT ? 'Hebrew' : 'Greek'}
              </th>
              <th style={{ padding: '8px 12px', textAlign: 'left', fontFamily: FONTS.sans, fontSize: 14, fontWeight: 600, width: '20%' }}>Latvian</th>
              <th style={{ padding: '8px 12px', textAlign: 'left', fontFamily: FONTS.sans, fontSize: 14, fontWeight: 600, width: '12%' }}>Strong's</th>
              <th style={{ padding: '8px 12px', textAlign: 'left', fontFamily: FONTS.sans, fontSize: 14, fontWeight: 600, width: '18%' }}>Morphology</th>
              <th style={{ padding: '8px 12px', textAlign: 'left', fontFamily: FONTS.sans, fontSize: 14, fontWeight: 600, width: '30%' }}>Definition</th>
            </tr>
          </thead>
          <tbody>
            {morphRows.map((r, i) => (
              <MorphRow key={i} {...r} />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

// A small fraktur sample card for the 1694 visual
const FrakturSample = ({ text, style }) => (
  <div
    style={{
      fontFamily: FONTS.fraktur,
      fontSize: 38,
      color: COLORS.fraktur,
      lineHeight: 1.45,
      ...style,
    }}
  >
    {text}
  </div>
);

Object.assign(window, { LangLine, MorphRow, VerseCard, FrakturSample });
