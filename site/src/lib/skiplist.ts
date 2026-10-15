/* A skip list as towers: every added value is a tower of some height, and level L is the sorted
   list of towers taller than L. Search, add and erase follow solutions/4.cpp (go right while the next
   value is smaller, otherwise go down; a new value grows one more level for every coin flip that
   comes up heads). The coin is seeded so the page is reproducible. doubly.test.ts checks the
   answers against the compiled solution. */

export const LEVELS = 4;

export interface Tower {
  id: number;
  val: number;
  height: number;
}

export interface SkipState {
  /** Bottom-level order (sorted, ties: newest first, as the solution inserts before equal values). */
  towers: Tower[];
  nextId: number;
  seed: number;
}

export interface SkipStep {
  kind: 'start' | 'move' | 'apply' | 'drop' | 'ok' | 'error';
  message: string;
  towers: Tower[];
  /** Where the search pointer is: a tower id (0 = head) and a level. */
  at: { id: number; level: number } | null;
  /** Cells visited so far, as "id:level". */
  path: string[];
  /** Comparisons made so far. */
  comparisons: number;
  /** Coin flips of an add, in order (true = heads). */
  flips?: boolean[];
  result?: boolean;
}

/** The example from the README: three levels over 30..90. */
export function readmeSkipList(): SkipState {
  const heights: [number, number][] = [[30, 3], [40, 1], [50, 2], [60, 1], [70, 2], [80, 1], [90, 3]];
  return { towers: heights.map(([val, height], i) => ({ id: i + 1, val, height })), nextId: heights.length + 1, seed: 7 };
}

const coin = (seed: number): [boolean, number] => {
  const next = (seed * 1103515245 + 12345) % 2147483648;
  return [(next >> 16) % 2 === 1, next];
};

/** Towers on a level, in order. */
const level = (towers: Tower[], L: number) => towers.filter((t) => t.height > L);

interface Walk {
  steps: SkipStep[];
  /** For each level (top first), the tower id we stopped on (0 = head). */
  pre: number[];
  comparisons: number;
}

/* The descent all three operations share: at each level go right while the next value is smaller. */
function descend(towers: Tower[], target: number, verb: string, stopWhenFound: boolean): Walk & { found: boolean } {
  const steps: SkipStep[] = [];
  const path: string[] = ['0:' + (LEVELS - 1)];
  let comparisons = 0;
  let id = 0;
  const pre: number[] = [];
  const snap = (kind: SkipStep['kind'], message: string, L: number) =>
    steps.push({ kind, message, towers: towers.map((t) => ({ ...t })), at: { id, level: L }, path: [...path], comparisons });

  snap('start', `${verb}: започваме от най-горното ниво, в началото (head).`, LEVELS - 1);
  for (let L = LEVELS - 1; L >= 0; L--) {
    const row = level(towers, L);
    let pos = id === 0 ? -1 : row.findIndex((t) => t.id === id);
    for (;;) {
      const next = row[pos + 1];
      if (!next) {
        snap('move', `Ниво ${L + 1}: нататък няма нищо (nullptr).`, L);
        break;
      }
      comparisons++;
      if (next.val < target) {
        pos++;
        id = next.id;
        path.push(`${id}:${L}`);
        snap('move', `Ниво ${L + 1}: ${next.val} < ${target}, вървим надясно.`, L);
      } else {
        snap('move', `Ниво ${L + 1}: ${next.val} ≥ ${target}, тук спираме.`, L);
        if (stopWhenFound && next.val === target) {
          path.push(`${next.id}:${L}`);
          return { steps, pre, comparisons, found: true };
        }
        break;
      }
    }
    pre.push(id);
    if (L > 0) path.push(`${id}:${L - 1}`);
  }
  return { steps, pre, comparisons, found: false };
}

export function search(state: SkipState, target: number): SkipStep[] {
  const w = descend(state.towers, target, `search(${target})`, true);
  const linear = state.towers.findIndex((t) => t.val >= target) + 1 || state.towers.length;
  const last = w.steps[w.steps.length - 1];
  w.steps.push({
    ...last,
    kind: w.found ? 'ok' : 'error',
    result: w.found,
    message: `${w.found ? `Намерихме ${target}` : `${target} го няма`}: ${w.comparisons} сравнения. Обхождане само на долното ниво би направило ${linear}.` +
      (w.comparisons >= linear ? ' При толкова малко елементи няма печалба: добави още (+8 произволни) и потърси пак.' : ''),
  });
  return w.steps;
}

export function add(state: SkipState, num: number): { steps: SkipStep[]; after: SkipState } {
  const w = descend(state.towers, num, `add(${num})`, false);
  // pre[k] is the stop on level LEVELS-1-k; the new tower goes right after the bottom stop.
  const bottom = w.pre[w.pre.length - 1];
  const towers = state.towers.map((t) => ({ ...t }));
  const at = bottom === 0 ? 0 : towers.findIndex((t) => t.id === bottom) + 1;
  const tower: Tower = { id: state.nextId, val: num, height: 1 };
  towers.splice(at, 0, tower);
  const flips: boolean[] = [];
  let seed = state.seed;
  const snap = (kind: SkipStep['kind'], message: string) =>
    w.steps.push({ kind, message, towers: towers.map((t) => ({ ...t })), at: { id: tower.id, level: tower.height - 1 }, path: [], comparisons: w.comparisons, flips: [...flips] });
  snap('apply', `Вмъкваме ${num} на долното ниво, след последния по-малък елемент.`);
  for (;;) {
    if (tower.height >= LEVELS) {
      snap('ok', `Стигнахме най-горното ниво: ${num} остава с височина ${tower.height}.`);
      break;
    }
    const [heads, s] = coin(seed);
    seed = s;
    flips.push(heads);
    if (!heads) {
      snap('ok', `Хвърляме монета: тура. ${num} спира на височина ${tower.height}. Средно половината елементи стигат ниво 2, четвърт ниво 3…`);
      break;
    }
    tower.height++;
    snap('apply', `Хвърляме монета: ези. ${num} се качва на ниво ${tower.height}.`);
  }
  return { steps: w.steps, after: { towers, nextId: state.nextId + 1, seed } };
}

export function erase(state: SkipState, num: number): { steps: SkipStep[]; after: SkipState; found: boolean } {
  const towers = state.towers.map((t) => ({ ...t }));
  const steps: SkipStep[] = [];
  let found = false, comparisons = 0, id = 0;
  const snap = (kind: SkipStep['kind'], message: string, L: number, result?: boolean) =>
    steps.push({ kind, message, towers: towers.map((t) => ({ ...t })), at: { id, level: L }, path: [], comparisons, result });
  snap('start', `erase(${num}): слизаме както при търсене и махаме ${num} от всяко ниво, на което го срещнем.`, LEVELS - 1);
  for (let L = LEVELS - 1; L >= 0; L--) {
    const row = level(towers, L);
    let pos = id === 0 ? -1 : row.findIndex((t) => t.id === id);
    while (row[pos + 1] && row[pos + 1].val < num) {
      comparisons++;
      pos++;
      id = row[pos].id;
    }
    const next = row[pos + 1];
    if (next) comparisons++;
    if (next && next.val === num) {
      found = true;
      next.height = L; // its node on this level is unlinked; the levels above went first
      snap('drop', `Ниво ${L + 1}: махаме ${num} (pre->next = p->next).`, L);
    }
  }
  const after = { towers: towers.filter((t) => t.height > 0), nextId: state.nextId, seed: state.seed };
  snap(found ? 'ok' : 'error', found ? `Изтрит. ${comparisons} сравнения.` : `${num} го няма: връща false.`, 0, found);
  steps[steps.length - 1].towers = after.towers.map((t) => ({ ...t }));
  steps[steps.length - 1].at = null; // the walk is over: nothing to point at
  return { steps, after, found };
}
