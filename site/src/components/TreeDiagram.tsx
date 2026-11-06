import type { ReactElement } from 'react';
import type { Cell, Mark, TNode } from '../lib/tree';

export const R = 17;
export const COLW = 52;
export const ROWH = 64;

export const cellX = (col: number): number => 40 + col * COLW;
export const cellY = (row: number): number => 34 + row * ROWH;

function trim(ax: number, ay: number, bx: number, by: number, pad: number): { x: number; y: number } {
  const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy) || 1;
  return { x: ax + (dx / len) * pad, y: ay + (dy / len) * pad };
}

export function TreeDiagram({
  nodes,
  cells,
  marks,
  label,
  badges,
  stubs = true,
  minWidth = 0,
}: {
  nodes: TNode[];
  cells: Map<number, Cell>;
  marks: Record<number, Mark>;
  label: string;
  badges?: Record<number, string>;
  stubs?: boolean;
  minWidth?: number;
}): ReactElement {
  const shown = nodes.filter((n) => cells.has(n.id));
  const here = new Set(shown.map((n) => n.id));
  const at = (id: number): { x: number; y: number } => {
    const c = cells.get(id)!;
    return { x: cellX(c.col), y: cellY(c.row) };
  };

  const xs = [...cells.values()].map((c) => cellX(c.col));
  const ys = [...cells.values()].map((c) => cellY(c.row));
  const minX = Math.min(...xs, 40) - R - 20;
  const maxX = Math.max(minWidth + minX, Math.max(...xs, 40) + R + 20);
  const minY = Math.min(...ys, 34) - R - 16;
  const maxY = Math.max(...ys, 34) + R + 18;

  return (
    <div className="diagram-scroll">
      <svg
        className="tree-diagram"
        viewBox={`${minX} ${minY} ${maxX - minX} ${maxY - minY}`}
        style={{ maxWidth: `${Math.round((maxX - minX) * 1.35)}px` }}
        role="img"
        aria-label={label}
      >
        {shown.map((n) => {
          const a = at(n.id);
          const kids = n.kids.filter((k): k is number => k !== null && here.has(k));
          const lone = n.kids.length === 2 && kids.length === 1 && stubs;
          const slot = lone ? (n.kids[0] === null || !here.has(n.kids[0] as number) ? 0 : 1) : -1;
          return (
            <g key={`e${n.id}`}>
              {kids.map((k) => {
                const b = at(k);
                const p = trim(a.x, a.y, b.x, b.y, R);
                const q = trim(b.x, b.y, a.x, a.y, R + 1);
                return <path key={k} d={`M${p.x},${p.y} L${q.x},${q.y}`} className="tn-edge" />;
              })}
              {lone && (
                <g className="tn-stub">
                  <path d={`M${a.x + (slot === 0 ? -8 : 8)},${a.y + R - 4} L${a.x + (slot === 0 ? -26 : 26)},${a.y + 30}`} />
                  <text x={a.x + (slot === 0 ? -30 : 30)} y={a.y + 36} textAnchor={slot === 0 ? 'end' : 'start'}>
                    ∅
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {shown.map((n) => {
          const p = at(n.id);
          const mark = marks[n.id];
          return (
            <g key={n.id} className={`tn-node${mark ? ` ${mark}` : ''}`} transform={`translate(${p.x},${p.y})`}>
              <circle r={R} />
              <text y={1}>{n.val}</text>
              {badges?.[n.id] !== undefined && (
                <g className="tn-badge" transform={`translate(${R - 2},${-R + 2})`}>
                  <circle r={9} />
                  <text y={1}>{badges[n.id]}</text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function QueueView({ items, title, empty = 'празна', plain = false }: { items: string[]; title: string; empty?: string; plain?: boolean }): ReactElement {
  return (
    <figure className="queue-view" aria-label={`${title}: ${items.length ? items.join(', ') : empty}`}>
      <figcaption>{title}</figcaption>
      <ol className="bfs-queue">
        {items.map((item, i) => (
          <li key={`${i}-${item}`} className={!plain && i === 0 ? 'front' : undefined}>
            {item}
          </li>
        ))}
        {!items.length && <li className="qv-empty">{empty}</li>}
      </ol>
      {!plain && items.length > 1 && <p className="muted small qv-note">отпред е вляво</p>}
    </figure>
  );
}
