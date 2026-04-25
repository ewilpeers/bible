// Reusable slide layout primitives. Reads tokens from window.

const Slide = ({ children, bg, color, padded = true, style }) => (
  <div
    style={{
      width: '100%',
      height: '100%',
      background: bg || COLORS.bg,
      color: color || COLORS.ink,
      fontFamily: FONTS.serif,
      padding: padded ? `${SPACING.paddingTop}px ${SPACING.paddingX}px ${SPACING.paddingBottom}px` : 0,
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
      ...style,
    }}
  >
    {children}
  </div>
);

// Tiny eyebrow label, all caps, sans
const Eyebrow = ({ children, color }) => (
  <div
    style={{
      fontFamily: FONTS.sans,
      fontSize: TYPE_SCALE.micro,
      letterSpacing: '0.18em',
      textTransform: 'uppercase',
      color: color || COLORS.inkMute,
      fontWeight: 500,
      marginBottom: SPACING.itemGap,
    }}
  >
    {children}
  </div>
);

const Title = ({ children, size = 'title', style }) => (
  <h1
    style={{
      fontFamily: FONTS.serif,
      fontSize: TYPE_SCALE[size],
      lineHeight: 1.08,
      fontWeight: 500,
      margin: 0,
      letterSpacing: '-0.01em',
      textWrap: 'pretty',
      ...style,
    }}
  >
    {children}
  </h1>
);

const Subtitle = ({ children, style }) => (
  <p
    style={{
      fontFamily: FONTS.serif,
      fontSize: TYPE_SCALE.subtitle,
      lineHeight: 1.25,
      fontWeight: 400,
      fontStyle: 'italic',
      color: COLORS.inkSoft,
      margin: 0,
      textWrap: 'pretty',
      ...style,
    }}
  >
    {children}
  </p>
);

const Body = ({ children, style }) => (
  <p
    style={{
      fontFamily: FONTS.serif,
      fontSize: TYPE_SCALE.body,
      lineHeight: 1.45,
      fontWeight: 400,
      margin: 0,
      textWrap: 'pretty',
      ...style,
    }}
  >
    {children}
  </p>
);

const Small = ({ children, style, mono }) => (
  <p
    style={{
      fontFamily: mono ? FONTS.mono : FONTS.sans,
      fontSize: TYPE_SCALE.small,
      lineHeight: 1.5,
      color: COLORS.inkSoft,
      margin: 0,
      ...style,
    }}
  >
    {children}
  </p>
);

const Rule = ({ color, style }) => (
  <div
    style={{
      height: 1,
      background: color || COLORS.rule,
      width: '100%',
      ...style,
    }}
  />
);

// Footer slug shown bottom-left of every content slide
const SlideFooter = ({ section, num, total }) => (
  <div
    style={{
      position: 'absolute',
      left: SPACING.paddingX,
      right: SPACING.paddingX,
      bottom: 36,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      fontFamily: FONTS.sans,
      fontSize: TYPE_SCALE.micro - 4,
      color: COLORS.inkMute,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
    }}
  >
    <span>{section}</span>
    <span style={{ fontFamily: FONTS.mono, textTransform: 'none', letterSpacing: 0 }}>
      t.noit.pro
    </span>
  </div>
);

// Two-column scholarly layout — left/right panes, optional center rule
const TwoCol = ({ left, right, leftLabel, rightLabel, ratio = '1fr 1fr', gap = 80, style }) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: ratio,
      gap,
      flex: 1,
      minHeight: 0,
      ...style,
    }}
  >
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      {leftLabel && <Eyebrow>{leftLabel}</Eyebrow>}
      {left}
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, borderLeft: `1px solid ${COLORS.rule}`, paddingLeft: gap / 2, marginLeft: -gap / 2 }}>
      {rightLabel && <Eyebrow>{rightLabel}</Eyebrow>}
      {right}
    </div>
  </div>
);

// Numbered list item with serif typography
const NumberedItem = ({ n, title, body, style }) => (
  <div style={{ display: 'flex', gap: 32, alignItems: 'baseline', ...style }}>
    <div
      style={{
        fontFamily: FONTS.mono,
        fontSize: TYPE_SCALE.subtitle,
        color: COLORS.accent,
        fontWeight: 400,
        minWidth: 60,
      }}
    >
      {String(n).padStart(2, '0')}
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontFamily: FONTS.serif, fontSize: TYPE_SCALE.body, fontWeight: 500, marginBottom: 8 }}>
        {title}
      </div>
      {body && (
        <div style={{ fontFamily: FONTS.serif, fontSize: TYPE_SCALE.small, color: COLORS.inkSoft, lineHeight: 1.4 }}>
          {body}
        </div>
      )}
    </div>
  </div>
);

// Inline code chip
const Code = ({ children, style }) => (
  <span
    style={{
      fontFamily: FONTS.mono,
      fontSize: '0.85em',
      background: COLORS.bgAlt,
      border: `1px solid ${COLORS.ruleSoft}`,
      padding: '2px 10px',
      borderRadius: 4,
      ...style,
    }}
  >
    {children}
  </span>
);

// Block code with terminal-ish chrome
const CodeBlock = ({ children, label, style }) => (
  <div
    style={{
      background: COLORS.bgDark,
      color: '#E8E0CC',
      borderRadius: 6,
      fontFamily: FONTS.mono,
      fontSize: TYPE_SCALE.small,
      lineHeight: 1.5,
      overflow: 'hidden',
      ...style,
    }}
  >
    {label && (
      <div
        style={{
          padding: '12px 24px',
          borderBottom: '1px solid #3D3830',
          fontSize: TYPE_SCALE.micro - 4,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: '#9A9080',
        }}
      >
        {label}
      </div>
    )}
    <pre style={{ margin: 0, padding: '20px 24px', whiteSpace: 'pre-wrap' }}>{children}</pre>
  </div>
);

// Striped placeholder with monospace label
const Placeholder = ({ label, height = 200, style }) => (
  <div
    style={{
      background: `repeating-linear-gradient(135deg, ${COLORS.bgAlt} 0 12px, ${COLORS.ruleSoft} 12px 13px)`,
      border: `1px solid ${COLORS.rule}`,
      height,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: FONTS.mono,
      fontSize: TYPE_SCALE.micro,
      color: COLORS.inkMute,
      ...style,
    }}
  >
    {label}
  </div>
);

// Small tag/pill
const Tag = ({ children, color, bg, style }) => (
  <span
    style={{
      fontFamily: FONTS.sans,
      fontSize: TYPE_SCALE.micro - 4,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: color || COLORS.inkSoft,
      background: bg || 'transparent',
      border: `1px solid ${color || COLORS.rule}`,
      padding: '4px 12px',
      borderRadius: 999,
      display: 'inline-block',
      ...style,
    }}
  >
    {children}
  </span>
);

Object.assign(window, {
  Slide, Eyebrow, Title, Subtitle, Body, Small, Rule, SlideFooter,
  TwoCol, NumberedItem, Code, CodeBlock, Placeholder, Tag,
});
