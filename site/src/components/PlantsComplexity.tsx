import { useMemo, useState } from 'react';
import { FAMILIES, plantsCost, type PlantsCost } from '../lib/plantsCost';

/* Steps per plant for three solutions of task 8, as n grows ("с копиране" is solutions/8.cpp). Per plant, so linear work is a
   flat line and quadratic work climbs. Same unit for every series, one axis. */

type Family = keyof typeof FAMILIES;
type Series = 'stacksLinear' | 'brute' | 'stacksCpp';

const SERIES: { key: Series; label: string; short: string }[] = [
  { key: 'stacksLinear', label: 'стекове с O(1) сливане', short: 'O(1) сливане' },
  { key: 'brute', label: 'груба сила, ден по ден', short: 'груба сила' },
  { key: 'stacksCpp', label: 'стекове, с копиране при сравнение и сливане', short: 'с копиране' },
];
const NS = [100, 200, 400, 600, 800, 1000, 1200, 1400, 1600, 1800, 2000];
const W = 640, H = 240, PAD = { l: 44, r: 96, t: 14, b: 28 };
const fmt = (x: number) => x.toLocaleString('bg-BG');

export default function PlantsComplexity() {
  const [family, setFamily] = useState<Family>('worst');
  const [hover, setHover] = useState<number | null>(null);
  const rows = useMemo<PlantsCost[]>(() => NS.map((n) => plantsCost(FAMILIES[family](n))), [family]);

  const perPlant = (r: PlantsCost, s: Series) => r[s] / r.n;
  const peak = Math.max(...rows.flatMap((r) => SERIES.map((s) => perPlant(r, s.key))));
  const maxY = niceCeil(peak);
  const x = (n: number) => PAD.l + ((n - NS[0]) / (NS[NS.length - 1] - NS[0])) * (W - PAD.l - PAD.r);
  const y = (v: number) => PAD.t + (H - PAD.t - PAD.b) * (1 - v / maxY);
  const shown = rows[hover ?? rows.length - 1];

  return (
    <div className="playground">
      <div className="pg-options">
        <div className="segmented" role="radiogroup" aria-label="Вход">
          <button type="button" role="radio" aria-checked={family === 'worst'} onClick={() => setFamily('worst')}>Най-лош случай</button>
          <button type="button" role="radio" aria-checked={family === 'random'} onClick={() => setFamily('random')}>Случайни количества</button>
        </div>
        <span className="muted small-inline">
          {family === 'worst' ? 'n, n−1, …, 1, после n/2, …, 2: умира по едно цвете на ден, n/2 дни' : 'количества от 1 до n: малко дни'}
        </span>
      </div>

      <div className="chart-wrap" onMouseLeave={() => setHover(null)}>
        <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Стъпки на цвете при n от ${NS[0]} до ${NS[NS.length - 1]}`}>
          {[0, maxY / 2, maxY].map((t) => (
            <g key={t} className="grid">
              <line x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} />
              <text x={PAD.l - 6} y={y(t)}>{t}</text>
            </g>
          ))}
          <text className="axis-label" x={PAD.l} y={H - 6}>n = {NS[0]}</text>
          <text className="axis-label end" x={W - PAD.r} y={H - 6}>n = {NS[NS.length - 1]}</text>
          {hover !== null && <line className="crosshair" x1={x(NS[hover])} x2={x(NS[hover])} y1={PAD.t} y2={H - PAD.b} />}
          {SERIES.map((s) => (
            <g key={s.key} className={`series ${s.key}`}>
              <polyline points={rows.map((r) => `${x(r.n)},${y(perPlant(r, s.key))}`).join(' ')} />
              {rows.map((r, i) => <circle key={r.n} cx={x(r.n)} cy={y(perPlant(r, s.key))} r={hover === i ? 5 : 3.5} />)}
            </g>
          ))}
          {/* Direct labels at the right end, nudged apart when the lines finish close together. */}
          {placeLabels(SERIES.map((s) => ({ key: s.key, text: s.short, y: y(perPlant(rows[rows.length - 1], s.key)) }))).map((l) => (
            <text key={l.key} className={`end-label ${l.key}`} x={W - PAD.r + 8} y={l.y}>{l.text}</text>
          ))}
          {NS.map((n, i) => (
            <rect key={n} className="hit" x={x(n) - (W - PAD.l - PAD.r) / NS.length / 2} y={PAD.t} width={(W - PAD.l - PAD.r) / NS.length} height={H - PAD.t - PAD.b} onMouseEnter={() => setHover(i)} />
          ))}
        </svg>
      </div>

      <ul className="legend">
        {SERIES.map((s) => (
          <li key={s.key}><span className={`swatch line ${s.key}`} />{s.label}</li>
        ))}
      </ul>

      <table className="cost-table">
        <caption>
          При n = {fmt(shown.n)}: {fmt(shown.days)} {shown.days === 1 ? 'ден' : 'дни'}
          {hover === null && <span className="muted"> (посочи графиката за друго n)</span>}
        </caption>
        <thead><tr><th>решение</th><th>стъпки</th><th>на цвете</th></tr></thead>
        <tbody>
          {SERIES.map((s) => (
            <tr key={s.key}>
              <td><span className={`swatch line ${s.key}`} /> {s.label}</td>
              <td>{fmt(shown[s.key])}</td>
              <td>{perPlant(shown, s.key).toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function placeLabels(labels: { key: string; text: string; y: number }[], gap = 13) {
  const sorted = [...labels].sort((a, b) => a.y - b.y);
  for (let i = 1; i < sorted.length; i++) if (sorted[i].y - sorted[i - 1].y < gap) sorted[i].y = sorted[i - 1].y + gap;
  return sorted;
}

/** Smallest of 1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8 (times a power of ten) that is at least x. */
function niceCeil(x: number) {
  const p = 10 ** Math.floor(Math.log10(x));
  return p * ([1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].find((m) => m * p >= x) ?? 10);
}
