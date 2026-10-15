/* Week 1, complexity: growth classes, how long they take, the asymptotic definitions as a
   checkable inequality, and the cases of `contains` from week01/complexity.cpp. */

/* ---------- growth classes, in log10 so 2^n and n! never overflow ---------- */

const LOG10_2 = Math.log10(2);

// Lanczos approximation (g = 7), accurate to about 15 digits for x > 0.
const LANCZOS = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
function lnGamma(x: number): number {
  if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - lnGamma(1 - x);
  x -= 1;
  let a = LANCZOS[0];
  const t = x + 7.5;
  for (let i = 1; i < 9; i++) a += LANCZOS[i] / (x + i);
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
}

/** log10(n!) as log10 Γ(n + 1): exact at whole numbers and smooth in between, so the chart's line is too. */
export function log10Factorial(n: number): number {
  return n < 1 ? 0 : lnGamma(n + 1) / Math.LN10;
}

export interface GrowthClass {
  id: string;
  label: string;
  /** log10 of the number of operations; -Infinity means none. */
  log10Ops: (n: number) => number;
}

export const CLASSES: GrowthClass[] = [
  { id: '1', label: 'O(1)', log10Ops: () => 0 },
  { id: 'log', label: 'O(log n)', log10Ops: (n) => Math.log10(Math.log2(n)) },
  { id: 'n', label: 'O(n)', log10Ops: (n) => Math.log10(n) },
  { id: 'nlog', label: 'O(n log n)', log10Ops: (n) => Math.log10(n * Math.log2(n)) },
  { id: 'n2', label: 'O(n²)', log10Ops: (n) => 2 * Math.log10(n) },
  { id: 'exp', label: 'O(2ⁿ)', log10Ops: (n) => n * LOG10_2 },
  { id: 'fact', label: 'O(n!)', log10Ops: (n) => log10Factorial(n) },
];

/* ---------- durations ---------- */

const MINUTE = 60, HOUR = 3600, DAY = 86400, YEAR = 365.25 * DAY;
export const UNIVERSE_AGE_YEARS = 13.8e9;

export type Speed = 'fast' | 'ok' | 'slow' | 'never';

/** Human duration for 10^log10Seconds seconds, in Bulgarian. */
export function formatDuration(log10Seconds: number): { text: string; speed: Speed } {
  if (log10Seconds < 0 || !Number.isFinite(log10Seconds)) return { text: '< 1 сек', speed: 'fast' };
  const s = 10 ** log10Seconds;
  const r = (x: number) => Math.round(x).toLocaleString('bg-BG');
  if (s < MINUTE) return { text: `${r(s)} сек`, speed: 'ok' };
  if (s < HOUR) return { text: `${r(s / MINUTE)} мин`, speed: 'ok' };
  if (s < DAY) return { text: `${r(s / HOUR)} ч`, speed: 'slow' };
  if (s < YEAR) return { text: `${r(s / DAY)} дни`, speed: 'slow' };
  const log10Years = log10Seconds - Math.log10(YEAR);
  if (log10Years < 3) return { text: `${r(10 ** log10Years)} години`, speed: 'never' };
  if (log10Years < 6) return { text: `${r(10 ** (log10Years - 3))} хил. години`, speed: 'never' };
  if (log10Years < 9) return { text: `${r(10 ** (log10Years - 6))} млн. години`, speed: 'never' };
  if (log10Years < 12) return { text: `${r(10 ** (log10Years - 9))} млрд. години`, speed: 'never' };
  const k = Math.floor(log10Years);
  const universes = log10Years - Math.log10(UNIVERSE_AGE_YEARS);
  return { text: `≈ ${(10 ** (log10Years - k)).toFixed(1)}·10^${k} години (10^${Math.floor(universes)} пъти възрастта на Вселената)`, speed: 'never' };
}

/** log10 of the seconds a class needs for input n at the given operations per second. */
export const log10Seconds = (c: GrowthClass, n: number, opsPerSecond: number) => c.log10Ops(n) - Math.log10(opsPerSecond);

/* ---------- asymptotic definitions as a check ---------- */

export type Bound = 'O' | 'Omega' | 'Theta';

export interface FnPair {
  id: string;
  /** TeX, for the page. */
  f: string;
  g: string;
  /** Plain text, for the widget (no maths renderer on the client). */
  pf: string;
  pg: string;
  fn: (n: number) => number;
  gn: (n: number) => number;
  /** What is true, for the explanation under the chart. */
  holds: Record<Bound, boolean>;
  note: string;
}

export const PAIRS: FnPair[] = [
  {
    id: 'quad', f: '3n^2 + 10n + 5', g: 'n^2', pf: '3n² + 10n + 5', pg: 'n²', fn: (n) => 3 * n * n + 10 * n + 5, gn: (n) => n * n,
    holds: { O: true, Omega: true, Theta: true },
    note: 'Пример: c = 4, n₀ = 11 за O; c = 3, n₀ = 1 за Ω. По-малките събираеми спират да имат значение.',
  },
  {
    id: 'lin', f: '100n', g: 'n^2', pf: '100n', pg: 'n²', fn: (n) => 100 * n, gn: (n) => n * n,
    holds: { O: true, Omega: false, Theta: false },
    note: 'O важи с c = 1, n₀ = 100: константата 100 само отлага момента. Ω не важи: каквото и малко c да избереш, c·n² рано или късно задминава 100n.',
  },
  {
    id: 'nlogn', f: 'n \\log_2 n', g: 'n', pf: 'n·log₂n', pg: 'n', fn: (n) => n * Math.log2(n), gn: (n) => n,
    holds: { O: false, Omega: true, Theta: false },
    note: 'O не важи: f(n)/g(n) = log₂ n расте без граница, затова при всяко c нарушението само се мести надясно. Опитай да увеличиш c и N.',
  },
  {
    id: 'half', f: '\\tfrac{1}{2}n^2 - 3n', g: 'n^2', pf: '½n² − 3n', pg: 'n²', fn: (n) => n * n / 2 - 3 * n, gn: (n) => n * n,
    holds: { O: true, Omega: true, Theta: true },
    note: 'Θ с c₁ = ¼, c₂ = ½, n₀ = 12. Отначало f е отрицателна, затова n₀ е задължително: дефиницията иска 0 ≤ f(n).',
  },
];

/** First n in [n0, N] where the definition fails, or null if it holds on the whole range. */
export function firstViolation(p: FnPair, bound: Bound, c1: number, c2: number, n0: number, N: number): number | null {
  for (let n = Math.max(1, n0); n <= N; n++) {
    const f = p.fn(n), g = p.gn(n);
    const ok =
      bound === 'O' ? 0 <= f && f <= c1 * g :
      bound === 'Omega' ? 0 <= c1 * g && c1 * g <= f :
      0 <= c1 * g && c1 * g <= f && f <= c2 * g;
    if (!ok) return n;
  }
  return null;
}

/* ---------- best, average and worst case of contains() ---------- */

/** Comparisons contains() in complexity.cpp makes: up to and including the match, or all n. */
export function containsComparisons(arr: number[], el: number): number {
  const i = arr.indexOf(el);
  return i === -1 ? arr.length : i + 1;
}
