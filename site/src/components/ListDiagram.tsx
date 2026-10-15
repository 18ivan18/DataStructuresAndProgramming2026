import type { ListStep, LNode } from '../lib/linked';

/* A singly linked list as boxes and arrows. Positions come from the caller (a row, a ρ-shape for a
   cycle, ...); the diagram only routes arrows: straight to a neighbour, an arc over the row when
   skipping forward, an arc under the row when pointing back. */

export type Pos = Map<number, { x: number; y: number }>;

const W = 46, H = 30;
export const SLOT = 78;

// Each pointer variable keeps one colour across all widgets.
const VAR_CLASS: Record<string, string> = {
  first: 'v-head', head: 'v-head', dummy: 'v-head',
  last: 'v-last',
  prev: 'v-prev', previous: 'v-prev', slow: 'v-prev',
  curr: 'v-curr', current: 'v-curr', iter: 'v-curr', fast: 'v-last',
  next: 'v-tmp', node: 'v-new', toRemove: 'v-tmp', oldFirst: 'v-tmp', tmp: 'v-tmp', toBeDeleted: 'v-tmp',
};
const varClass = (name: string) => VAR_CLASS[name] ?? 'v-tmp';

/** Nodes in a row, in the given order. */
export function rowLayout(ids: number[], y = 70): Pos {
  return new Map(ids.map((id, i) => [id, { x: 50 + i * SLOT, y }]));
}

/* Where a line from the centre of one box towards (tx, ty) leaves the box. */
function edge(cx: number, cy: number, tx: number, ty: number, w = W / 2 + 2, h = H / 2 + 2) {
  const dx = tx - cx, dy = ty - cy;
  const s = Math.min(Math.abs(dx) > 0 ? w / Math.abs(dx) : Infinity, Math.abs(dy) > 0 ? h / Math.abs(dy) : Infinity);
  return { x: cx + dx * s, y: cy + dy * s };
}

function arrowPath(a: { x: number; y: number }, b: { x: number; y: number }, self: boolean): string {
  if (self) return `M${a.x + W / 2 - 6},${a.y - H / 2} C${a.x + 30},${a.y - 60} ${a.x - 30},${a.y - 60} ${a.x - W / 2 + 6},${a.y - H / 2 - 2}`;
  const sameRow = Math.abs(a.y - b.y) < 4;
  const dx = b.x - a.x;
  if (sameRow && dx > 0 && dx <= SLOT * 1.2) return `M${a.x + W / 2},${a.y} L${b.x - W / 2 - 4},${b.y}`;
  if (sameRow && dx > 0) {
    const h = 24 + dx * 0.12;
    return `M${a.x + 8},${a.y - H / 2} Q${(a.x + b.x) / 2},${a.y - H / 2 - h * 2} ${b.x - 8},${b.y - H / 2 - 5}`;
  }
  if (sameRow && dx < 0) {
    const h = 22 + -dx * 0.12;
    return `M${a.x - 8},${a.y + H / 2} Q${(a.x + b.x) / 2},${a.y + H / 2 + h * 2} ${b.x + 8},${b.y + H / 2 + 5}`;
  }
  const p = edge(a.x, a.y, b.x, b.y), q = edge(b.x, b.y, a.x, a.y, W / 2 + 6, H / 2 + 6);
  return `M${p.x},${p.y} L${q.x},${q.y}`;
}

// In a doubly linked list next arrows run on an upper lane and previous arrows on a lower one.
const LANE = 7;

/* A straight arrow between two boxes, shifted sideways by `off`. Arrows in opposite directions get
   shifted to opposite sides, so next and prev never overlap, whatever the angle (e.g. on a circle). */
function sideLine(a: { x: number; y: number }, b: { x: number; y: number }, off: number): string {
  const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
  const nx = (-dy / len) * off, ny = (dx / len) * off;
  const p = edge(a.x + nx, a.y + ny, b.x + nx, b.y + ny), q = edge(b.x + nx, b.y + ny, a.x + nx, a.y + ny, W / 2 + 6, H / 2 + 6);
  return `M${p.x},${p.y} L${q.x},${q.y}`;
}

function prevPath(a: { x: number; y: number }, b: { x: number; y: number }): string {
  if (a === b || (a.x === b.x && a.y === b.y)) return `M${a.x - W / 2 + 6},${a.y + H / 2} C${a.x - 30},${a.y + 60} ${a.x + 30},${a.y + 60} ${a.x + W / 2 - 6},${a.y + H / 2 + 2}`;
  const sameRow = Math.abs(a.y - b.y) < 4;
  const dx = a.x - b.x;
  if (sameRow && dx > 0 && dx <= SLOT * 1.2) return `M${a.x - W / 2},${a.y + LANE} L${b.x + W / 2 + 4},${b.y + LANE}`;
  if (sameRow) {
    const h = 22 + Math.abs(dx) * 0.12;
    return `M${a.x - 8},${a.y + H / 2} Q${(a.x + b.x) / 2},${a.y + H / 2 + h * 2} ${b.x + 8},${b.y + H / 2 + 5}`;
  }
  return sideLine(a, b, LANE);
}

export function ListDiagram({ step, pos, label, minWidth = 0, guide }: { step: ListStep; pos: Pos; label: string; minWidth?: number; guide?: { cx: number; cy: number; r: number } }) {
  const nodes = step.nodes.filter((n) => pos.has(n.id));
  const changed = new Set(step.changed), valueChanged = new Set(step.valueChanged), prevChanged = new Set(step.prevChanged ?? []);
  const doubly = nodes.some((n) => n.prev !== undefined);

  // Variables pointing at nodes are drawn above them; nullptr ones are listed apart.
  const at = new Map<number, string[]>();
  const nulls: string[] = [];
  for (const [name, target] of step.vars) {
    if (target === null) nulls.push(name);
    else if (pos.has(target)) at.set(target, [...(at.get(target) ?? []), name]);
  }

  const xs = [...pos.values()].map((p) => p.x), ys = [...pos.values()].map((p) => p.y);
  const maxStack = Math.max(0, ...[...at.values()].map((v) => v.length));
  // A guide (the circle of a circular list) keeps the frame steady, even when the list is empty.
  if (guide) xs.push(guide.cx - guide.r, guide.cx + guide.r), ys.push(guide.cy - guide.r, guide.cy + guide.r);
  const minX = Math.min(10, ...xs.map((x) => x - W - (doubly ? 30 : 0)));
  const maxX = Math.max(minWidth, minX + 160, ...xs.map((x) => x + W + 40));
  const minY = Math.min(...ys, 70) - H / 2 - 18 - maxStack * 17 - 30, maxY = Math.max(...ys, 70) + H / 2 + 60;

  return (
    <div className="diagram-scroll">
    <svg className="list-diagram" viewBox={`${minX} ${minY} ${maxX - minX} ${maxY - minY}`} role="img" aria-label={label}>
      <defs>
        <marker id="ld-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" className="ld-ah" /></marker>
        <marker id="ld-arrow-prev" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" className="ld-ah prev" /></marker>
        <marker id="ld-arrow-hot" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" className="ld-ah hot" /></marker>
      </defs>

      {guide && <circle cx={guide.cx} cy={guide.cy} r={guide.r} className="ld-guide" />}

      {nodes.filter((n) => !n.freed).map((n) => {
        const a = pos.get(n.id)!;
        if (n.next === null) {
          return (
            <g key={`e${n.id}`} className={`ld-edge${changed.has(n.id) ? ' hot' : ''}`}>
              <path d={`M${a.x + W / 2},${a.y - (doubly ? LANE : 0)} L${a.x + W / 2 + 16},${a.y - (doubly ? LANE : 0)}`} />
              <text x={a.x + W / 2 + 19} y={a.y - (doubly ? LANE : 0)} className="ld-null">∅</text>
            </g>
          );
        }
        const b = pos.get(n.next);
        if (!b) return null;
        const lane = doubly ? { x: a.x, y: a.y - LANE } : a;
        const laneB = doubly ? { x: b.x, y: b.y - LANE } : b;
        const offRow = doubly && Math.abs(a.y - b.y) >= 4;
        return (
          <path key={`e${n.id}`} d={offRow ? sideLine(a, b, LANE) : arrowPath(lane, laneB, n.next === n.id)} className={`ld-edge${changed.has(n.id) ? ' hot' : ''}`} markerEnd={`url(#${changed.has(n.id) ? 'ld-arrow-hot' : 'ld-arrow'})`} />
        );
      })}

      {doubly && nodes.filter((n) => !n.freed).map((n) => {
        const a = pos.get(n.id)!;
        const hot = prevChanged.has(n.id);
        if (n.prev == null) {
          return (
            <g key={`p${n.id}`} className={`ld-edge prev${hot ? ' hot' : ''}`}>
              <path d={`M${a.x - W / 2},${a.y + LANE} L${a.x - W / 2 - 16},${a.y + LANE}`} />
              <text x={a.x - W / 2 - 19} y={a.y + LANE} className="ld-null" textAnchor="end">∅</text>
            </g>
          );
        }
        const b = pos.get(n.prev);
        if (!b) return null;
        return <path key={`p${n.id}`} d={prevPath(a, b)} className={`ld-edge prev${hot ? ' hot' : ''}`} markerEnd={`url(#${hot ? 'ld-arrow-hot' : 'ld-arrow-prev'})`} />;
      })}

      {nodes.map((n) => {
        const p = pos.get(n.id)!;
        return (
          <g key={n.id} className={`ld-node${n.freed ? ' freed' : ''}${n.val === 'd' ? ' dummy' : ''}${valueChanged.has(n.id) ? ' val-hot' : ''}`} transform={`translate(${p.x},${p.y})`}>
            <rect x={-W / 2} y={-H / 2} width={W} height={H} rx={6} />
            <line x1={W / 2 - 13} x2={W / 2 - 13} y1={-H / 2} y2={H / 2} className="ld-split" />
            <text x={doubly ? 0 : -6} y={1}>{n.val === 'd' ? 'dummy' : n.val}</text>
            <circle cx={W / 2 - 6.5} cy={doubly ? -LANE : 0} r={2.5} className="ld-dot" />
            {doubly && <circle cx={-W / 2 + 6.5} cy={LANE} r={2.5} className="ld-dot prev" />}
            {doubly && <line x1={-W / 2 + 13} x2={-W / 2 + 13} y1={-H / 2} y2={H / 2} className="ld-split" />}
            {(at.get(n.id) ?? []).map((name, i) => (
              <g key={name} className={`ld-var ${varClass(name)}`} transform={`translate(0,${-H / 2 - 14 - i * 17})`}>
                <text y={0}>{name}</text>
              </g>
            ))}
            {at.has(n.id) && <line x1={0} x2={0} y1={-H / 2 - 7} y2={-H / 2 - 1} className="ld-var-tick" />}
          </g>
        );
      })}

      {nulls.length > 0 && (
        <text x={minX + 8} y={maxY - 10} className="ld-nulls">
          {nulls.map((name, i) => (
            <tspan key={name} className={`ld-var ${varClass(name)}`}>{i ? ', ' : ''}{name}</tspan>
          ))}
          <tspan> = nullptr</tspan>
        </text>
      )}
    </svg>
    </div>
  );
}

/** Layout for the sandbox: the list in order on one row; nodes that are not (or no longer) linked
    from `first` sit below it, near where they belong. Positions carry over between steps. */
export function sandboxLayouts(steps: ListStep[]): Pos[] {
  const out: Pos[] = [];
  let prev: Pos = new Map();
  for (const st of steps) {
    const byId = new Map(st.nodes.map((n) => [n.id, n]));
    const first = st.vars.find(([v]) => v === 'first')?.[1] ?? null;
    const order: number[] = [];
    const seen = new Set<number>();
    for (let id = first; id !== null && !seen.has(id) && byId.has(id); id = byId.get(id)!.next) {
      seen.add(id);
      order.push(id);
    }
    const pos = rowLayout(order, 70);
    for (const n of st.nodes) {
      if (pos.has(n.id)) continue;
      const before = prev.get(n.id);
      const target = n.next !== null ? pos.get(n.next) : undefined;
      pos.set(n.id, {
        x: target ? target.x - SLOT / 2 : before ? before.x : 50 + order.length * SLOT,
        y: 150,
      });
    }
    out.push(pos);
    prev = pos;
  }
  return out;
}

/** Layout for a list whose last node points back to index `pos`: a tail, then a circle (a ρ). */
export function rhoLayout(ids: number[], pos: number): Pos {
  if (pos < 0) return rowLayout(ids, 90);
  const out: Pos = new Map();
  ids.slice(0, pos).forEach((id, i) => out.set(id, { x: 50 + i * SLOT, y: 90 }));
  const loop = ids.slice(pos);
  const r = Math.max(SLOT * 0.75, (loop.length * SLOT) / (2 * Math.PI));
  const cx = 50 + pos * SLOT + r, cy = 90;
  loop.forEach((id, i) => {
    const a = Math.PI + (i / loop.length) * 2 * Math.PI; // start at the left, go clockwise over the top
    out.set(id, { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
  });
  return out;
}

export type { LNode };

/** Geometry of the circle a circular list is drawn on, for k places. */
export function circleGeometry(k: number) {
  const r = Math.max(78, (k * SLOT * 1.1) / (2 * Math.PI));
  return { cx: r + 70, cy: r + 60, r };
}

/** Nodes on a circle of k places, node at place i where the array version keeps index i. */
export function circleLayout(slots: Record<number, number>, k: number): Pos {
  const { cx, cy, r } = circleGeometry(k);
  return new Map(Object.entries(slots).map(([id, slot]) => {
    const a = -Math.PI / 2 + ((slot + 0.5) / k) * 2 * Math.PI;
    return [Number(id), { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }];
  }));
}
