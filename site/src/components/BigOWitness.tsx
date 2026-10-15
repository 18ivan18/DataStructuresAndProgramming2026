import { useState } from 'react';
import { firstViolation, PAIRS, type Bound } from '../lib/complexity';

/* The definitions of O, Ω and Θ as a game: pick c (or c₁, c₂) and n₀ and see whether
   0 ≤ f(n) ≤ c·g(n) (and so on) holds for every n from n₀ up to the edge of the chart. */

const W = 640, H = 260, PAD = { l: 52, r: 74, t: 14, b: 28 };
const BOUNDS: { id: Bound; label: string; def: string }[] = [
  { id: 'O', label: 'O', def: '∃c > 0, ∃n₀ : ∀n ≥ n₀ : 0 ≤ f(n) ≤ c·g(n)' },
  { id: 'Omega', label: 'Ω', def: '∃c > 0, ∃n₀ : ∀n ≥ n₀ : 0 ≤ c·g(n) ≤ f(n)' },
  { id: 'Theta', label: 'Θ', def: '∃c₁, c₂ > 0, ∃n₀ : ∀n ≥ n₀ : 0 ≤ c₁·g(n) ≤ f(n) ≤ c₂·g(n)' },
];
const WINDOWS = [20, 100, 1000];

// Constants move on a log scale: slider position s gives 10^(s/20), from 0.01 to 100.
const toC = (s: number) => Number((10 ** (s / 20)).toPrecision(2));
const toS = (c: number) => Math.round(20 * Math.log10(c));
const nice = (x: number) => {
  const p = 10 ** Math.floor(Math.log10(Math.max(x, 1e-9)));
  return p * ([1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].find((m) => m * p >= x) ?? 10);
};
const num = (x: number) => (Math.abs(x) >= 1e5 ? x.toExponential(2) : Number(x.toPrecision(4)).toLocaleString('bg-BG'));

export default function BigOWitness() {
  const [pairId, setPairId] = useState('quad');
  const [bound, setBound] = useState<Bound>('O');
  const [c1, setC1] = useState(2);
  const [c2, setC2] = useState(4);
  const [n0, setN0] = useState(1);
  const [N, setN] = useState(20);
  const pair = PAIRS.find((p) => p.id === pairId)!;

  // In Θ mode c1 is the lower constant and c2 the upper; in O and Ω there is only c (= c1).
  const upper = bound === 'O' ? c1 : bound === 'Theta' ? c2 : null;
  const lower = bound === 'Omega' ? c1 : bound === 'Theta' ? c1 : null;
  const bad = firstViolation(pair, bound, c1, c2, n0, N);

  const samples = Array.from({ length: Math.min(N, 300) }, (_, i) => 1 + (i * (N - 1)) / (Math.min(N, 300) - 1));
  const series = [
    { key: 'f', label: `f(n) = ${pair.pf}`, short: 'f(n)', fn: pair.fn },
    ...(upper !== null ? [{ key: 'up', label: `${bound === 'Theta' ? 'c₂' : 'c'}·g(n) = ${upper}·${pair.pg}`, short: `${upper}·g(n)`, fn: (n: number) => upper * pair.gn(n) }] : []),
    ...(lower !== null ? [{ key: 'lo', label: `${bound === 'Theta' ? 'c₁' : 'c'}·g(n) = ${lower}·${pair.pg}`, short: `${lower}·g(n)`, fn: (n: number) => lower * pair.gn(n) }] : []),
  ];
  const all = series.flatMap((s) => samples.map(s.fn));
  const yMax = nice(Math.max(...all));
  const yMin = Math.min(0, ...all) < 0 ? -nice(-Math.min(...all)) : 0;
  const x = (n: number) => PAD.l + ((n - 1) / (N - 1)) * (W - PAD.l - PAD.r);
  const y = (v: number) => PAD.t + (H - PAD.t - PAD.b) * (1 - (v - yMin) / (yMax - yMin));

  return (
    <div className="playground">
      <div className="pg-options">
        <div className="segmented" role="radiogroup" aria-label="Функции">
          {PAIRS.map((p) => (
            <button key={p.id} type="button" role="radio" aria-checked={p.id === pairId} onClick={() => setPairId(p.id)}>
              {p.pf} <span className="muted">vs</span> {p.pg}
            </button>
          ))}
        </div>
        <div className="segmented" role="radiogroup" aria-label="Означение">
          {BOUNDS.map((b) => (
            <button key={b.id} type="button" role="radio" aria-checked={b.id === bound} onClick={() => setBound(b.id)}>{b.label}</button>
          ))}
        </div>
      </div>
      <p className="definition"><code>f ∈ {BOUNDS.find((b) => b.id === bound)!.label}(g)</code> ⇔ {BOUNDS.find((b) => b.id === bound)!.def}</p>

      <div className="pg-options sliders">
        <label className="param">
          {bound === 'Theta' ? 'c₁' : 'c'} = <b>{c1}</b>
          <input type="range" min={-40} max={40} value={toS(c1)} onChange={(e) => setC1(toC(Number(e.target.value)))} />
        </label>
        {bound === 'Theta' && (
          <label className="param">
            c₂ = <b>{c2}</b>
            <input type="range" min={-40} max={40} value={toS(c2)} onChange={(e) => setC2(toC(Number(e.target.value)))} />
          </label>
        )}
        <label className="param">
          n₀ = <b>{n0}</b>
          <input type="range" min={1} max={N} value={Math.min(n0, N)} onChange={(e) => setN0(Number(e.target.value))} />
        </label>
        <label className="param">
          до N =
          <select value={N} onChange={(e) => { const v = Number(e.target.value); setN(v); setN0((x) => Math.min(x, v)); }}>
            {WINDOWS.map((w) => <option key={w}>{w}</option>)}
          </select>
        </label>
      </div>

      <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${series.map((s) => s.label).join('; ')}; n от 1 до ${N}`}>
        <rect className="before-n0" x={PAD.l} y={PAD.t} width={Math.max(0, x(Math.min(n0, N)) - PAD.l)} height={H - PAD.t - PAD.b} />
        {[yMin, yMin === 0 ? yMax / 2 : 0, yMax].map((t) => (
          <g key={t} className="grid">
            <line x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} />
            <text x={PAD.l - 6} y={y(t)}>{num(t)}</text>
          </g>
        ))}
        <text className="axis-label" x={PAD.l} y={H - 6}>n = 1</text>
        <text className="axis-label end" x={W - PAD.r} y={H - 6}>n = {N}</text>
        {n0 > 1 && <text className="axis-label n0" x={x(Math.min(n0, N))} y={H - 6}>n₀ = {n0}</text>}
        {series.map((s) => (
          <g key={s.key} className={`series ${s.key}`}>
            <polyline points={samples.map((n) => `${x(n)},${y(s.fn(n))}`).join(' ')} />
          </g>
        ))}
        {series.map((s) => (
          <text key={s.key} className={`end-label ${s.key}`} x={W - PAD.r + 6} y={Math.min(H - PAD.b, Math.max(PAD.t + 6, y(s.fn(N))))}>{s.short}</text>
        ))}
        {bad !== null && (
          <g className="violation">
            <line x1={x(bad)} x2={x(bad)} y1={PAD.t} y2={H - PAD.b} />
            <circle cx={x(bad)} cy={y(pair.fn(bad))} r={5} />
          </g>
        )}
      </svg>
      <ul className="legend">
        {series.map((s) => <li key={s.key}><span className={`swatch line ${s.key}`} />{s.label}</li>)}
        <li><span className="swatch before" />n &lt; n₀: не ни интересува</li>
      </ul>

      <p className={`verdict ${bad === null ? 'good' : 'bad'}`}>
        {bad === null
          ? `✓ Неравенството е вярно за всяко n от ${n0} до ${N}.`
          : `✗ Нарушено при n = ${bad}: f(${bad}) = ${num(pair.fn(bad))}, ${upper !== null && pair.fn(bad) > upper * pair.gn(bad) ? `а ${upper}·g(${bad}) = ${num(upper * pair.gn(bad))}` : lower !== null && pair.fn(bad) < lower * pair.gn(bad) ? `а ${lower}·g(${bad}) = ${num(lower * pair.gn(bad))}` : 'а дефиницията иска f(n) ≥ 0'}. Пробвай друго ${bound === 'Theta' ? 'c₁, c₂' : 'c'} или по-голямо n₀.`}
      </p>
      <details className="hint">
        <summary>Подсказка: дали изобщо е възможно?</summary>
        <p>{pair.note}</p>
      </details>
      <p className="muted small">Графиката проверява само до N. Че неравенството важи за всяко n ≥ n₀, се доказва на хартия.</p>
    </div>
  );
}
