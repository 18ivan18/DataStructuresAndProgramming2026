import { useMemo, useState } from 'react';
import { emptyStack, runOps, type ShrinkRule, type StackOp } from '../lib/arrayStack';

/* Cost of every operation on an ArrayStack, with the running average.
   "Растеж": n pushes; the average stays under 3 although single pushes cost up to n.
   "Около границата": fill to 9, then alternate pop/push; compares the /4 rule with the obvious /2. */

type Mode = 'grow' | 'wobble';

const W = 640, H = 220, PAD = { l: 34, r: 8, t: 22, b: 26 };

export default function AmortizedChart() {
  const [mode, setMode] = useState<Mode>('grow');
  const [count, setCount] = useState(40);
  const [rule, setRule] = useState<ShrinkRule>('quarter');
  const [hover, setHover] = useState<number | null>(null);

  const { ops, results, skip } = useMemo(() => {
    if (mode === 'grow') {
      const ops: StackOp[] = Array.from({ length: count }, (_, i) => ({ kind: 'push', value: i + 1 }));
      return { ops, results: runOps(ops, rule), skip: 0 };
    }
    // Fill to 9 (just past the first doubling), then hover around the boundary. Only the hovering is charted.
    const fill = runOps(Array.from({ length: 9 }, (_, i) => ({ kind: 'push', value: i + 1 }) as StackOp), rule);
    const ops: StackOp[] = Array.from({ length: 16 }, (_, i) => (i % 2 ? { kind: 'push', value: 100 + i } : { kind: 'pop' }));
    return { ops, results: runOps(ops, rule, fill.at(-1)?.state ?? emptyStack()), skip: 9 };
  }, [mode, count, rule]);

  const total = results.reduce((s, r) => s + r.cost, 0);
  // Round the axis up to a readable number: 4, 8, 10, 20, 40, 50, 100, ...
  const peak = Math.max(4, ...results.map((r) => r.cost));
  const maxCost = [4, 8, 10, 20, 40, 50, 100, 200, 400, 500, 1000].find((m) => m >= peak) ?? peak;
  const slot = (W - PAD.l - PAD.r) / results.length;
  const barW = Math.max(1.5, Math.min(18, slot - 2));
  const x = (i: number) => PAD.l + i * slot + (slot - barW) / 2;
  const y = (v: number) => PAD.t + (H - PAD.t - PAD.b) * (1 - v / maxCost);
  let running = 0;
  const avg = results.map((r, i) => ((running += r.cost), running / (i + 1)));
  const ticks = [0, maxCost / 2, maxCost];
  const resizes = results.filter((r) => r.resize).length;
  const h = hover !== null ? results[hover] : null;

  return (
    <div className="playground">
      <div className="pg-options">
        <div className="segmented" role="radiogroup" aria-label="Сценарий">
          <button type="button" role="radio" aria-checked={mode === 'grow'} onClick={() => setMode('grow')}>Растеж: n × push</button>
          <button type="button" role="radio" aria-checked={mode === 'wobble'} onClick={() => setMode('wobble')}>Около границата</button>
        </div>
        {mode === 'grow' ? (
          <label className="param">
            n = <b>{count}</b>
            <input type="range" min={4} max={130} value={count} onChange={(e) => setCount(Number(e.target.value))} />
          </label>
        ) : (
          <div className="segmented" role="radiogroup" aria-label="Кога pop смалява масива">
            <button type="button" role="radio" aria-checked={rule === 'quarter'} onClick={() => setRule('quarter')}>смаляване при n = cap/4</button>
            <button type="button" role="radio" aria-checked={rule === 'half'} onClick={() => setRule('half')}>при n = cap/2</button>
          </div>
        )}
      </div>

      <p className="stats">
        <span><b>{results.length}</b> операции</span>
        <span><b>{total}</b> стъпки общо</span>
        <span>средно <b>{(total / results.length).toFixed(2)}</b> на операция</span>
        <span><b>{resizes}</b> преоразмерявания</span>
      </p>

      <div className="chart-wrap" onMouseLeave={() => setHover(null)}>
        <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Цена на всяка операция: ${results.length} операции, ${total} стъпки, ${resizes} преоразмерявания`}>
          {ticks.map((t) => (
            <g key={t} className="grid">
              <line x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} />
              <text x={PAD.l - 6} y={y(t)}>{t}</text>
            </g>
          ))}
          {results.map((r, i) => (
            <g key={i}>
              <rect className={`bar${r.resize ? ' resize' : ''}${hover === i ? ' hover' : ''}`} x={x(i)} y={y(r.cost)} width={barW} height={Math.max(0, y(0) - y(r.cost))} rx={Math.min(3, barW / 2)} />
              {r.resize && resizes <= 8 && (
                <text className="bar-label" x={x(i) + barW / 2} y={y(r.cost) - 5}>{r.resize.from}→{r.resize.to}</text>
              )}
              {/* Hit target: the whole column, wider and taller than the bar. */}
              <rect className="hit" x={PAD.l + i * slot} y={PAD.t} width={slot} height={H - PAD.t - PAD.b} onMouseEnter={() => setHover(i)} />
            </g>
          ))}
          <polyline className="avg" points={avg.map((a, i) => `${x(i) + barW / 2},${y(a)}`).join(' ')} />
          <text className="axis-label" x={PAD.l} y={H - 6}>операция {skip + 1}</text>
          <text className="axis-label end" x={W - PAD.r} y={H - 6}>операция {skip + results.length}</text>
        </svg>
        {h && hover !== null && (
          <div className="tooltip" style={{ left: `${((x(hover) + barW / 2) / W) * 100}%` }}>
            <b>{ops[hover].kind === 'push' ? `push(${(ops[hover] as { value: number }).value})` : 'pop()'}</b> · операция {skip + hover + 1}
            <br />
            цена {h.cost}{h.resize ? ` (1 + копиране на ${h.resize.copied}: ${h.resize.from} → ${h.resize.to})` : ''}
            <br />
            n = {h.state.items.length}, capacity = {h.state.capacity} · средно досега {avg[hover].toFixed(2)}
          </div>
        )}
      </div>

      <ul className="legend">
        <li><span className="swatch op" />обикновена операция (цена 1)</li>
        <li><span className="swatch resize" />с преоразмеряване (1 + копираните)</li>
        <li><span className="swatch line" />средна цена до момента</li>
      </ul>
    </div>
  );
}
