/* Week 3: the circular ArrayQueue from ArrayQueue.h, and the task solutions as step-by-step
   traces. queue.test.ts checks all of it against the compiled C++ (scripts/reference.cpp). */

/* ---------- ArrayQueue.h: circular buffer ---------- */

export const QUEUE_INIT_CAPACITY = 8;

export interface RingState {
  /** The whole array, as in memory: cells outside the live range keep stale values (or null if never written). */
  cells: (number | null)[];
  first: number;
  n: number;
}

export interface RingResult {
  state: RingState;
  /** Index written by enqueue or read by dequeue (in the array before any resize). */
  index: number;
  resize: { from: number; to: number } | null;
  value: number;
}

export const emptyRing = (): RingState => ({ cells: Array(QUEUE_INIT_CAPACITY).fill(null), first: 0, n: 0 });

/** The live elements, front first. */
export const ringItems = (s: RingState) => Array.from({ length: s.n }, (_, i) => s.cells[(s.first + i) % s.cells.length]!);

/** Whether array index i currently holds a live element. */
export const isLive = (s: RingState, i: number) => (i - s.first + s.cells.length) % s.cells.length < s.n;

// resize(): copy the live elements to the start of a new array, then first = 0.
function resize(s: RingState, capacity: number): RingState {
  const cells: (number | null)[] = Array(capacity).fill(null);
  for (let i = 0; i < s.n; i++) cells[i] = s.cells[(s.first + i) % s.cells.length];
  return { cells, first: 0, n: s.n };
}

export function enqueue(s: RingState, value: number): RingResult {
  let state = s, r: RingResult['resize'] = null;
  if (s.n >= s.cells.length) {
    r = { from: s.cells.length, to: s.cells.length * 2 };
    state = resize(s, r.to);
  }
  const cells = [...state.cells];
  const index = (state.first + state.n) % cells.length;
  cells[index] = value;
  return { state: { cells, first: state.first, n: state.n + 1 }, index, resize: r, value };
}

export function dequeue(s: RingState): RingResult {
  if (s.n === 0) throw new Error('Empty queue!');
  const index = s.first;
  const value = s.cells[index]!;
  let state: RingState = { cells: s.cells, first: (s.first + 1) % s.cells.length, n: s.n - 1 };
  let r: RingResult['resize'] = null;
  // Same rule as the header: halve when a quarter full (C++ integer division).
  if (state.n === Math.floor(s.cells.length / 4) && state.n > 0) {
    r = { from: s.cells.length, to: Math.floor(s.cells.length / 2) };
    state = resize(state, r.to);
  }
  return { state, index, resize: r, value };
}

/* ---------- shared step shape ---------- */

export interface Step {
  kind: 'start' | 'push' | 'pop' | 'move' | 'apply' | 'keep' | 'drop' | 'ok' | 'error';
  message: string;
}

/* ---------- task 2: queue with two stacks (solutions/2.cpp) ---------- */

export type QueueOp = { op: 'push'; x: number } | { op: 'pop' } | { op: 'peek' } | { op: 'empty' };

export interface TwoStacksStep extends Step {
  /** Index of the operation in the script being executed. */
  at: number;
  s1: number[];
  s2: number[];
  /** The queue the two stacks represent, front first (kept separately, to check the stacks against). */
  queue: number[];
  /** Value an operation returned, on its last step. */
  returned?: number | boolean;
  /** Element moved from s1 to s2 at this step. */
  moved?: number;
  /** Elementary stack operations so far (push or pop on s1/s2). */
  work: number;
}

export function parseQueueScript(text: string): QueueOp[] {
  return text.split(/[,;\n]+/).map((t) => t.trim()).filter(Boolean).flatMap((t): QueueOp[] => {
    const m = /^push\s*\(?\s*(-?\d+)\s*\)?$/i.exec(t);
    if (m) return [{ op: 'push', x: Number(m[1]) }];
    if (/^pop(\(\))?$/i.test(t)) return [{ op: 'pop' }];
    if (/^peek(\(\))?$/i.test(t)) return [{ op: 'peek' }];
    if (/^empty(\(\))?$/i.test(t)) return [{ op: 'empty' }];
    return [];
  });
}

export function* twoStacksTrace(ops: QueueOp[]): Generator<TwoStacksStep> {
  const s1: number[] = [], s2: number[] = [], queue: number[] = [];
  let work = 0;
  const snap = (step: Omit<TwoStacksStep, 's1' | 's2' | 'queue' | 'work'>): TwoStacksStep => ({ ...step, s1: [...s1], s2: [...s2], queue: [...queue], work });

  yield snap({ kind: 'start', at: -1, message: 'Два празни стека: s1 приема новите елементи, s2 връща най-старите.' });
  for (let at = 0; at < ops.length; at++) {
    const o = ops[at];
    if (o.op === 'push') {
      s1.push(o.x);
      queue.push(o.x);
      work++;
      yield snap({ kind: 'push', at, message: `push(${o.x}): слагаме го на върха на s1. Винаги O(1).` });
      continue;
    }
    if (o.op === 'empty') {
      const e = s1.length === 0 && s2.length === 0;
      yield snap({ kind: 'ok', at, returned: e, message: `empty(): ${e ? 'и двата стека са празни, true' : 'има елементи, false'}.` });
      continue;
    }
    if (s1.length === 0 && s2.length === 0) {
      yield snap({ kind: 'error', at, message: `${o.op}() върху празна опашка: условието гарантира, че това не се случва.` });
      return;
    }
    // pop() refills s2 when it is empty. peek() in the solution reads s2's top, or the remembered
    // front of s1, without moving anything.
    if (o.op === 'pop' && s2.length === 0) {
      yield snap({ kind: 'apply', at, message: `pop(): s2 е празен, затова преливаме целия s1 в s2. Така най-старият елемент отива на върха на s2.` });
      while (s1.length) {
        const x = s1.pop()!;
        s2.push(x);
        work += 2;
        yield snap({ kind: 'move', at, moved: x, message: `Преместваме ${x} от s1 в s2.` });
      }
    }
    if (o.op === 'pop') {
      const x = s2.pop()!;
      queue.shift();
      work++;
      yield snap({ kind: 'pop', at, returned: x, message: `pop() връща ${x} от върха на s2.` });
    } else {
      const x = s2.length ? s2[s2.length - 1] : s1[0];
      yield snap({ kind: 'ok', at, returned: x, message: s2.length ? `peek(): върхът на s2 е ${x}.` : `peek(): s2 е празен, но решението помни кой е влязъл пръв в s1: ${x}. Нищо не се мести.` });
    }
  }
}

/* ---------- task 8: the battle on the bridge (solutions/8.cpp) ---------- */

export type WarriorState = 'waiting' | 'stack' | 'queue' | 'dead' | 'passed';

export interface BridgeStep extends Step {
  /** State of every warrior, by input position. */
  states: WarriorState[];
  /** Positions of right-movers waiting on the bridge, bottom first (top = nearest the fight). */
  stack: number[];
  /** Positions of the left-movers in the current group, front first. */
  queue: number[];
  /** The two positions fighting at this step. */
  duel?: [pos: number, neg: number];
  /** Survivors in input order, on the final step. */
  result?: number[];
}

/* As in the solution: a right-mover (positive) waits on a stack, because the most recent one is
   the one a left-mover meets first. A run of consecutive left-movers (negatives) is collected in a
   queue, because the first of them fights first. Each duel is stack top against queue front. */
export function* bridgeTrace(a: number[]): Generator<BridgeStep> {
  const states: WarriorState[] = a.map(() => 'waiting');
  const stack: number[] = [];
  let queue: number[] = [];
  const snap = (step: Omit<BridgeStep, 'states' | 'stack' | 'queue'>): BridgeStep => ({ ...step, states: [...states], stack: [...stack], queue: [...queue] });
  const w = (i: number) => (a[i] > 0 ? `${a[i]}` : `${a[i]}`);

  yield snap({ kind: 'start', message: 'Положителните вървят надясно (→), отрицателните наляво (←). Обработваме ги отляво надясно.' });

  for (let i = 0; i < a.length; i++) {
    if (a[i] > 0) {
      stack.push(i);
      states[i] = 'stack';
      yield snap({ kind: 'push', message: `${w(i)} върви надясно: слагаме го на стека. Ако дойде някой отсреща, ще се бие пръв, защото е най-близо.` });
      continue;
    }
    if (stack.length === 0) {
      states[i] = 'passed';
      yield snap({ kind: 'ok', message: `${w(i)} върви наляво и пред него няма никой, който върви надясно: минава моста.` });
      continue;
    }
    // Collect the whole run of left-movers that arrive together.
    queue = [i];
    while (i + 1 < a.length && a[i + 1] < 0) queue.push(++i);
    queue.forEach((q) => (states[q] = 'queue'));
    yield snap({ kind: 'apply', message: `Група, която върви наляво: ${queue.map(w).join(', ')}. Влизат в опашка: първият в групата ще се бие пръв.` });

    while (stack.length && queue.length) {
      const p = stack[stack.length - 1], q = queue[0];
      const P = a[p], Q = -a[q];
      const duel: [number, number] = [p, q];
      if (P === Q) {
        stack.pop(); queue.shift();
        states[p] = states[q] = 'dead';
        yield snap({ kind: 'error', duel, message: `${P} срещу ${a[q]}: равни сили, падат и двамата.` });
      } else if (P < Q) {
        stack.pop();
        states[p] = 'dead';
        yield snap({ kind: 'error', duel, message: `${P} срещу ${a[q]}: ${Q} > ${P}, ${P} пада. ${a[q]} продължава срещу следващия от стека.` });
      } else {
        queue.shift();
        states[q] = 'dead';
        yield snap({ kind: 'error', duel, message: `${P} срещу ${a[q]}: ${P} > ${Q}, ${a[q]} пада. ${P} остава на върха и чака следващия от опашката.` });
      }
    }

    if (queue.length) {
      const passing = [...queue];
      passing.forEach((q) => (states[q] = 'passed'));
      queue = [];
      yield snap({ kind: 'ok', message: `Стекът се изпразни: ${passing.map(w).join(', ')} минават моста.` });
    } else {
      yield snap({ kind: 'keep', message: stack.length ? `Групата свърши. ${stack.map(w).join(', ')} остават на моста и чакат.` : 'Групата свърши, а мостът остана празен.' });
    }
  }

  stack.forEach((p) => (states[p] = 'passed'));
  const result = a.filter((_, i) => states[i] === 'passed');
  stack.length = 0;
  yield snap({ kind: 'ok', result, message: result.length ? `Никой не идва повече. Преминаха, в реда от входа: ${result.join(' ')}.` : 'Никой не премина моста.' });
}

/* ---------- task 6: sliding window maximum (solutions/6.cpp) ---------- */

export interface WindowStep extends Step {
  /** Index just read. */
  i: number;
  /** Deque of indices, front first. */
  dq: number[];
  out: number[];
  /** Index that left the deque at this step. */
  removed?: number;
}

export function* windowTrace(nums: number[], k: number): Generator<WindowStep> {
  const dq: number[] = [];
  const out: number[] = [];
  const snap = (step: Omit<WindowStep, 'dq' | 'out'>): WindowStep => ({ ...step, dq: [...dq], out: [...out] });

  yield snap({ kind: 'start', i: -1, message: `Deque-ът пази ИНДЕКСИ, а стойностите им намаляват отпред назад. Отпред винаги е максимумът на прозореца.` });
  for (let i = 0; i < nums.length; i++) {
    if (dq.length && dq[0] <= i - k) {
      const r = dq.shift()!;
      yield snap({ kind: 'drop', i, removed: r, message: `Индекс ${r} (стойност ${nums[r]}) вече е извън прозореца [${i - k + 1}..${i}]: pop_front.` });
    }
    while (dq.length && nums[i] > nums[dq[dq.length - 1]]) {
      const r = dq.pop()!;
      yield snap({ kind: 'drop', i, removed: r, message: `${nums[i]} > ${nums[r]}: индекс ${r} никога вече няма да е максимум, защото ${nums[i]} е по-голямо и ще остане в прозореца по-дълго. pop_back.` });
    }
    dq.push(i);
    yield snap({ kind: 'push', i, message: `push_back(${i}): стойността ${nums[i]} влиза отзад.` });
    if (i >= k - 1) {
      out.push(nums[dq[0]]);
      yield snap({ kind: 'keep', i, message: `Прозорецът [${i - k + 1}..${i}] е пълен: максимумът е отпред, nums[${dq[0]}] = ${nums[dq[0]]}.` });
    }
  }
  yield snap({ kind: 'ok', i: nums.length, message: `Готово: [${out.join(', ')}]. Всеки индекс влиза и излиза от deque-а най-много веднъж: O(n).` });
}

/* ---------- task 7: shortest path in a maze with BFS (solutions/7.cpp) ---------- */

export type Cell = [row: number, col: number];

export interface MazeStep extends Step {
  /** Distance from the source for every reached cell; -1 = not reached yet. */
  dist: number[][];
  /** Queue contents, front first. */
  queue: Cell[];
  current?: Cell;
  /** Cells added at this step. */
  added?: Cell[];
  /** The shortest path, on the final step. */
  path?: Cell[];
  result?: number;
}

// Same neighbour order as the solution: up, left, right, down.
const MOVES: Cell[] = [[-1, 0], [0, -1], [0, 1], [1, 0]];

export function* mazeTrace(grid: number[][], src: Cell, dest: Cell): Generator<MazeStep> {
  const M = grid.length, N = grid[0].length;
  const dist = grid.map((r) => r.map(() => -1));
  const parent = new Map<string, Cell>();
  const queue: Cell[] = [];
  const key = (c: Cell) => `${c[0]},${c[1]}`;
  const snap = (step: Omit<MazeStep, 'dist' | 'queue'>): MazeStep => ({ ...step, dist: dist.map((r) => [...r]), queue: queue.map((c) => [...c] as Cell) });

  if (!grid[src[0]][src[1]] || !grid[dest[0]][dest[1]]) {
    yield snap({ kind: 'error', result: -1, message: 'Началото или целта е стена: няма път (-1).' });
    return;
  }
  dist[src[0]][src[1]] = 0;
  queue.push(src);
  yield snap({ kind: 'start', message: `Началото (${src[0]}, ${src[1]}) е на разстояние 0. Слагаме го в опашката и го маркираме като посетено.` });

  while (queue.length) {
    const cur = queue.shift()!;
    const d = dist[cur[0]][cur[1]];
    if (cur[0] === dest[0] && cur[1] === dest[1]) {
      const path: Cell[] = [cur];
      while (parent.has(key(path[0]))) path.unshift(parent.get(key(path[0]))!);
      yield snap({ kind: 'ok', current: cur, path, result: d, message: `Вадим целта (${cur[0]}, ${cur[1]}) от опашката: най-късият път е ${d} стъпки.` });
      return;
    }
    const added: Cell[] = [];
    for (const [dr, dc] of MOVES) {
      const r = cur[0] + dr, c = cur[1] + dc;
      if (r >= 0 && r < M && c >= 0 && c < N && grid[r][c] && dist[r][c] === -1) {
        dist[r][c] = d + 1;
        parent.set(key([r, c]), cur);
        queue.push([r, c]);
        added.push([r, c]);
      }
    }
    yield snap({
      kind: added.length ? 'push' : 'drop',
      current: cur,
      added,
      message: added.length
        ? `Вадим (${cur[0]}, ${cur[1]}) с разстояние ${d}. Нови съседи с разстояние ${d + 1}: ${added.map((c) => `(${c[0]}, ${c[1]})`).join(', ')}.`
        : `Вадим (${cur[0]}, ${cur[1]}) с разстояние ${d}: няма нови съседи.`,
    });
  }
  yield snap({ kind: 'error', result: -1, message: 'Опашката се изпразни, без да стигнем целта: няма път (-1).' });
}

/** The maze from the README, (0, 0) to (7, 5). */
export const README_MAZE = [
  [1, 1, 1, 1, 1, 0, 0, 1, 1, 1],
  [0, 1, 1, 1, 1, 1, 0, 1, 0, 1],
  [0, 0, 1, 0, 1, 1, 1, 0, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 1, 0, 1],
  [0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
  [1, 0, 1, 1, 1, 0, 0, 1, 1, 0],
  [0, 0, 0, 0, 1, 0, 0, 1, 0, 1],
  [0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [1, 1, 1, 1, 1, 0, 0, 1, 1, 1],
  [0, 0, 1, 0, 0, 1, 1, 0, 0, 1],
];
