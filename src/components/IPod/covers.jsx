// Album covers drawn in SVG, one per station: two-tone blocks, heavy type and one simple motif.

const COVERS = {
  "piano-corner": { bg: "#14233b", fg: "#efe4cf", accent: "#d89845", lines: ["PIANO", "CORNER"] },
  "mellow-sax": { bg: "#2f4a52", fg: "#f1ead9", accent: "#e3b25a", lines: ["MELLOW", "SAX"] },
  "cocktail-hour": { bg: "#7a1f2b", fg: "#f7e6d0", accent: "#f2a65a", lines: ["COCKTAIL", "HOUR"] },
  "lofi-jazz": { bg: "#3b2d5c", fg: "#f6e9f2", accent: "#f29cb7", lines: ["LO-FI", "JAZZ"] },
  "guitar-patio": { bg: "#e2cfa6", fg: "#234a38", accent: "#c4623a", lines: ["GUITAR", "PATIO"] },
  "swing-time": { bg: "#e5b22e", fg: "#1b1b1b", accent: "#1b1b1b", lines: ["SWING", "TIME"] },
};

const FONT = "Inter, 'Helvetica Neue', Arial, sans-serif";

const polar = (cx, cy, radius, degrees) => {
  const radians = (degrees * Math.PI) / 180;
  return `${(cx + radius * Math.cos(radians)).toFixed(1)},${(cy + radius * Math.sin(radians)).toFixed(1)}`;
};

function Motif({ id, c }) {
  switch (id) {
    case "piano-corner":
      return (
        <g>
          {Array.from({ length: 8 }, (_, i) => (
            <rect key={i} x={14 + i * 21.5} y={96} width={20} height={78} rx={2} fill={i === 5 ? c.accent : c.fg} />
          ))}
          {[1, 2, 4, 5, 6].map((i) => (
            <rect key={i} x={8 + i * 21.5} y={96} width={12} height={48} rx={1.5} fill="#0b1526" />
          ))}
        </g>
      );
    case "mellow-sax":
      return (
        <g>
          <circle cx={140} cy={118} r={46} fill={c.accent} />
          {Array.from({ length: 10 }, (_, i) => (
            <line key={i} x1={24 + i * 20} y1={82} x2={6 + i * 20} y2={176} stroke={c.fg} strokeOpacity={0.4} strokeWidth={2} strokeLinecap="round" />
          ))}
        </g>
      );
    case "cocktail-hour":
      return (
        <g strokeLinecap="round" strokeLinejoin="round">
          <polygon points="103,101 161,101 132,134" fill={c.accent} />
          <polygon points="92,90 172,90 132,136" fill="none" stroke={c.fg} strokeWidth={5} />
          <line x1={132} y1={136} x2={132} y2={170} stroke={c.fg} strokeWidth={5} />
          <line x1={110} y1={172} x2={154} y2={172} stroke={c.fg} strokeWidth={5} />
          <line x1={146} y1={98} x2={168} y2={72} stroke={c.fg} strokeWidth={3} />
          <circle cx={146} cy={98} r={7} fill={c.fg} />
        </g>
      );
    case "lofi-jazz":
      return (
        <g>
          <circle cx={150} cy={150} r={72} fill="#1b1430" />
          {[60, 48, 36].map((r) => (
            <circle key={r} cx={150} cy={150} r={r} fill="none" stroke={c.accent} strokeOpacity={0.45} strokeWidth={1.5} />
          ))}
          <circle cx={150} cy={150} r={22} fill={c.accent} />
          <circle cx={150} cy={150} r={3.5} fill={c.bg} />
        </g>
      );
    case "guitar-patio":
      return (
        <g>
          <circle cx={128} cy={126} r={48} fill="none" stroke={c.accent} strokeWidth={4} />
          <circle cx={128} cy={126} r={39} fill={c.fg} />
          {Array.from({ length: 6 }, (_, i) => (
            <line key={i} x1={56} y1={110 + i * 6.4} x2={200} y2={110 + i * 6.4} stroke={c.accent} strokeWidth={1.6} />
          ))}
        </g>
      );
    case "swing-time":
      return (
        <g fill={c.accent}>
          {Array.from({ length: 6 }, (_, i) => (
            <polygon key={i} points={`200,200 ${polar(200, 200, 132, 184 + i * 15)} ${polar(200, 200, 132, 191.5 + i * 15)}`} />
          ))}
          <circle cx={200} cy={200} r={50} />
        </g>
      );
    default:
      return null;
  }
}

export function StationCover({ station, className, decorative = false }) {
  const c = COVERS[station.id];
  if (!c) return null;
  return (
    <svg
      className={className}
      viewBox="0 0 200 200"
      role={decorative ? undefined : "img"}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : station.name.en}
    >
      <rect width={200} height={200} fill={c.bg} />
      <Motif id={station.id} c={c} />
      <g fill={c.fg} fontFamily={FONT} fontWeight={900}>
        <text x={14} y={38} fontSize={27} letterSpacing={-0.5}>
          {c.lines[0]}
        </text>
        <text x={14} y={64} fontSize={27} letterSpacing={-0.5}>
          {c.lines[1]}
        </text>
        <text x={14} y={191} fontSize={10} fontWeight={700} letterSpacing={1.2}>
          CAFÉ FOCUS RADIO
        </text>
      </g>
    </svg>
  );
}
