/* A circular array drawn as a ring: cell i at angle i·360°/capacity, index 0 at the top. Live cells
   are filled, cells outside the live range show their stale value faded. Markers (first, rear, the
   next write, ...) point at cells from outside; several on one cell stack outwards. Used by the
   week 3 queue sandbox and the week 5 circular deque. */

export interface RingMarker {
  index: number;
  label: string;
  /** CSS class for its colour: m-first, m-end or m-rear. */
  cls: string;
}

export function Ring({ cells, first, n, hit = null, resized = false, markers, label }: {
  cells: (number | null)[];
  first: number;
  n: number;
  hit?: number | null;
  resized?: boolean;
  markers: RingMarker[];
  label: string;
}) {
  const cap = cells.length;
  const C = 160, R1 = 128, R0 = 82;
  const angle = (i: number) => (i / cap) * 2 * Math.PI - Math.PI / 2;
  // Rounded: the server (Node) and the browser can differ in the last digits of sin/cos, and unrounded
  // coordinates would make the hydrated SVG disagree with the server's HTML.
  const r2 = (v: number) => Math.round(v * 100) / 100;
  const pt = (a: number, r: number) => [r2(C + r * Math.cos(a)), r2(C + r * Math.sin(a))] as const;
  const gap = cap > 32 ? 0.004 : 0.012;
  const font = cap <= 16 ? 14 : cap <= 32 ? 10 : 7;
  const isLive = (i: number) => (i - first + cap) % cap < n;

  const stacked = new Map<number, number>();
  const marker = (m: RingMarker) => {
    const offset = (stacked.get(m.index) ?? 0) * 16;
    stacked.set(m.index, (stacked.get(m.index) ?? 0) + 1);
    const a = angle(m.index + 0.5);
    const [x, y] = pt(a, R1 + 14 + offset);
    const [x0, y0] = pt(a, R1 + 10 + offset), [x1, y1] = pt(a, R1 + 3);
    return (
      <g key={`${m.label}-${m.index}`} className={`ring-marker ${m.cls}`}>
        <line x1={x0} y1={y0} x2={x1} y2={y1} />
        <text x={x} y={y} textAnchor={Math.cos(a) > 0.3 ? 'start' : Math.cos(a) < -0.3 ? 'end' : 'middle'} dominantBaseline={Math.sin(a) > 0.3 ? 'hanging' : Math.sin(a) < -0.3 ? 'auto' : 'middle'}>{m.label}</text>
      </g>
    );
  };

  return (
    <svg className={`ring${resized ? ' resized' : ''}`} viewBox="-30 -20 380 360" role="img" aria-label={label}>
      {cells.map((v, i) => {
        const a0 = angle(i) + gap, a1 = angle(i + 1) - gap;
        const [ox0, oy0] = pt(a0, R1), [ox1, oy1] = pt(a1, R1), [ix1, iy1] = pt(a1, R0), [ix0, iy0] = pt(a0, R0);
        const large = a1 - a0 > Math.PI ? 1 : 0;
        const live = isLive(i);
        const [tx, ty] = pt(angle(i + 0.5), (R0 + R1) / 2);
        const [lx, ly] = pt(angle(i + 0.5), R0 - 11);
        // A ring of one cell is a full annulus: draw it as two half arcs.
        const d = cap === 1
          ? `M${C},${C - R1} A${R1},${R1} 0 1 1 ${C},${C + R1} A${R1},${R1} 0 1 1 ${C},${C - R1} M${C},${C - R0} A${R0},${R0} 0 1 0 ${C},${C + R0} A${R0},${R0} 0 1 0 ${C},${C - R0} Z`
          : `M${ox0},${oy0} A${R1},${R1} 0 ${large} 1 ${ox1},${oy1} L${ix1},${iy1} A${R0},${R0} 0 ${large} 0 ${ix0},${iy0} Z`;
        return (
          <g key={`${cap}-${i}`} className={`slot${live ? ' live' : v !== null ? ' stale' : ''}${i === first && n ? ' first' : ''}${hit === i ? ' hit' : ''}`}>
            <path d={d} fillRule="evenodd" />
            {v !== null && cap <= 64 && <text x={tx} y={cap === 1 ? C - (R0 + R1) / 2 : ty} fontSize={font} className="slot-v">{v}</text>}
            {cap <= 32 && <text x={lx} y={cap === 1 ? C - R0 + 11 : ly} className="slot-i">{i}</text>}
          </g>
        );
      })}
      {markers.map(marker)}
      <text x={C} y={C - 6} className="ring-center">{n} / {cap}</text>
      <text x={C} y={C + 14} className="ring-center small">елемента</text>
    </svg>
  );
}
