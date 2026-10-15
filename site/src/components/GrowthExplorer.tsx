import { useState, type ReactNode } from 'react';
import { CLASSES, formatDuration, log10Seconds, UNIVERSE_AGE_YEARS } from '../lib/complexity';

/* How the README table is made: operations for each class, divided by the machine's speed.
   Both axes are logarithmic; the horizontal lines turn operation counts into time. Seven
   series are too many to tell apart by colour, so every line is labelled directly and the
   selected class is highlighted. */

const W = 640, H = 300, PAD = { l: 50, r: 84, t: 12, b: 30 };
const SPEEDS = [
  { ops: 1e6, label: '10⁶ оп./сек (като в таблицата)' },
  { ops: 1e9, label: '10⁹ оп./сек (съвременен процесор)' },
];
const PRESETS = [10, 100, 1000, 1e4, 1e5, 1e6];
const YEAR = 365.25 * 86400;

const fmtN = (n: number) => n.toLocaleString('bg-BG');
function fmtOps(log10: number) {
  if (log10 < 0 || !Number.isFinite(log10)) return '0';
  if (log10 < 9) return Math.round(10 ** log10).toLocaleString('bg-BG');
  const k = Math.floor(log10);
  return `≈ ${(10 ** (log10 - k)).toFixed(1)}·10^${k}`;
}

/** Turns every "10^k" in a string into 10 with a real superscript. */
function sup(text: string): ReactNode {
  return text.split(/10\^(\d+)/).map((part, i) => (i % 2 ? <span key={i}>10<sup>{Number(part).toLocaleString('bg-BG')}</sup></span> : part));
}

export default function GrowthExplorer() {
  const [exp, setExp] = useState(30); // n = 10^(exp/10)
  const [speed, setSpeed] = useState(1e6);
  const [focus, setFocus] = useState('n2');
  const n = Math.round(10 ** (exp / 10));

  const yTop = Math.ceil(Math.log10(speed) + Math.log10(UNIVERSE_AGE_YEARS * YEAR)) + 2;
  // Rounded: server and browser can differ in the last digits of log/exp; see Ring.tsx.
  const r2 = (v: number) => Math.round(v * 100) / 100;
  const x = (log10n: number) => r2(PAD.l + (log10n / 6) * (W - PAD.l - PAD.r));
  const y = (log10ops: number) => r2(PAD.t + (H - PAD.t - PAD.b) * (1 - Math.max(0, log10ops) / yTop));
  const refs = [
    { label: '1 секунда', at: Math.log10(speed) },
    { label: '1 ден', at: Math.log10(speed * 86400) },
    { label: 'възрастта на Вселената', at: Math.log10(speed * UNIVERSE_AGE_YEARS * YEAR) },
  ];

  // Each line is drawn until it leaves the top of the chart; its label goes where it ends.
  const lines = CLASSES.map((c) => {
    const pts: [number, number][] = [];
    for (let t = 0; t <= 6.0001; t += 0.02) {
      const v = c.log10Ops(10 ** t);
      const yy = Number.isFinite(v) ? v : 0;
      pts.push([t, Math.min(yy, yTop)]);
      if (yy >= yTop) break;
    }
    const last = pts[pts.length - 1];
    return { c, pts, end: last, exits: last[1] >= yTop };
  });
  const labels = placeLabels(lines.map((l) => ({ id: l.c.id, text: l.c.label, x: l.exits ? x(l.end[0]) : W - PAD.r + 6, y: l.exits ? PAD.t + 10 : y(l.end[1]), exits: l.exits })));

  return (
    <div className="playground">
      <div className="pg-options">
        <label className="param">
          n = <b>{fmtN(n)}</b>
          <input type="range" min={0} max={60} value={exp} onChange={(e) => setExp(Number(e.target.value))} />
        </label>
        <div className="presets" role="group" aria-label="Редове от таблицата">
          {PRESETS.map((p) => (
            <button key={p} type="button" aria-pressed={p === n} onClick={() => setExp(Math.round(10 * Math.log10(p)))}>{fmtN(p)}</button>
          ))}
        </div>
        <div className="segmented" role="radiogroup" aria-label="Скорост">
          {SPEEDS.map((s) => (
            <button key={s.ops} type="button" role="radio" aria-checked={s.ops === speed} onClick={() => setSpeed(s.ops)}>{s.label}</button>
          ))}
        </div>
      </div>

      <p className="muted small chart-caption">Брой операции спрямо n. И двете оси са логаритмични: равни разстояния означават еднакво много пъти повече, не еднаква разлика.</p>
      <svg className="chart growth" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Брой операции за всеки клас при n от 1 до 1 000 000; избрано n = ${fmtN(n)}`}>
        {refs.map((r) => r.at <= yTop && (
          <g key={r.label} className="ref">
            <line x1={PAD.l} x2={W - PAD.r} y1={y(r.at)} y2={y(r.at)} />
            <text x={PAD.l + 4} y={y(r.at) - 4}>{r.label}</text>
          </g>
        ))}
        {[0, 2, 4, 6].map((t) => (
          <text key={t} className="axis-label tick" x={x(t)} y={H - 10}>{fmtN(10 ** t)}</text>
        ))}
        <text className="axis-label" x={PAD.l - 6} y={y(0)} textAnchor="end">1</text>
        <text className="axis-label" x={PAD.l - 6} y={PAD.t + 6} textAnchor="end">10<tspan dy="-5" fontSize="8">{yTop}</tspan></text>
        <line className="cursor" x1={x(exp / 10)} x2={x(exp / 10)} y1={PAD.t} y2={H - PAD.b} />
        {lines.map((l) => (
          <polyline key={l.c.id} className={`growth-line${l.c.id === focus ? ' focus' : ''}`} points={l.pts.map(([t, v]) => `${x(t)},${y(v)}`).join(' ')} onMouseEnter={() => setFocus(l.c.id)} />
        ))}
        {labels.map((l) => (
          <text key={l.id} className={`end-label growth-label${l.id === focus ? ' focus' : ''}${l.exits ? ' top' : ''}`} x={l.x} y={l.y}>{l.text}</text>
        ))}
      </svg>

      <table className="cost-table growth-table">
        <caption>При n = {fmtN(n)} и {speed === 1e6 ? '10⁶' : '10⁹'} операции в секунда</caption>
        <thead><tr><th>сложност</th><th>операции</th><th>време</th></tr></thead>
        <tbody>
          {CLASSES.map((c) => {
            const t = formatDuration(log10Seconds(c, n, speed));
            return (
              <tr key={c.id} className={c.id === focus ? 'focus' : ''} onMouseEnter={() => setFocus(c.id)} onFocus={() => setFocus(c.id)} tabIndex={0}>
                <td><b>{c.label}</b></td>
                <td>{sup(fmtOps(c.log10Ops(n)))}</td>
                <td><span className={`speed ${t.speed}`}>{sup(t.text)}</span></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function placeLabels<T extends { y: number; x: number; exits: boolean }>(labels: T[], gap = 12) {
  // Labels at the right edge are nudged apart vertically; labels at the top edge horizontally.
  const right = labels.filter((l) => !l.exits).sort((a, b) => b.y - a.y);
  for (let i = 1; i < right.length; i++) if (right[i - 1].y - right[i].y < gap) right[i].y = right[i - 1].y - gap;
  const top = labels.filter((l) => l.exits).sort((a, b) => a.x - b.x);
  for (let i = 1; i < top.length; i++) if (top[i].x - top[i - 1].x < 46) top[i].x = top[i - 1].x + 46;
  return labels;
}
