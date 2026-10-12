/* Stack algorithms from week 2 as generators of snapshots, replayed by useStepper.
   isValid and evalRPN follow solutions/2.cpp and solutions/4.cpp step for step;
   stack.test.ts checks their answers against the compiled solutions. */

export type TraceKind = 'start' | 'push' | 'pop' | 'apply' | 'call' | 'return' | 'ok' | 'error';

export interface TraceStep<T> {
  kind: TraceKind;
  /** Index of the input token being processed; -1 before the first, length after the last. */
  at: number;
  /** Stack contents, bottom first. */
  stack: T[];
  message: string;
  /** Final answer, on the last step. */
  result?: boolean | number;
}

/* ---------- task 2: valid brackets ---------- */

const PAIR: Record<string, string> = { ')': '(', ']': '[', '}': '{' };

export interface Bracket {
  ch: string;
  /** Where it stands in the input, to highlight the pair it closes. */
  at: number;
}

export interface BracketStep extends TraceStep<Bracket> {
  /** Input positions of a pair that just matched. */
  matched?: [number, number];
  /** Input positions that make the string invalid. */
  bad?: number[];
}

export function* bracketsTrace(s: string): Generator<BracketStep> {
  const stack: Bracket[] = [];
  const snap = (step: Omit<BracketStep, 'stack'>): BracketStep => ({ ...step, stack: [...stack] });

  yield snap({ kind: 'start', at: -1, message: 'Започваме с празен стек.' });

  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if ('([{'.includes(c)) {
      stack.push({ ch: c, at: i });
      yield snap({ kind: 'push', at: i, message: `„${c}“ е отваряща скоба: слагаме я на върха на стека.` });
    } else if (c in PAIR) {
      if (stack.length === 0) {
        yield snap({ kind: 'error', at: i, bad: [i], result: false, message: `„${c}“ затваря, но стекът е празен: няма какво да затвори. Невалиден.` });
        return;
      }
      const top = stack.pop()!;
      if (top.ch !== PAIR[c]) {
        yield snap({ kind: 'error', at: i, bad: [top.at, i], result: false, message: `„${c}“ трябва да затвори „${PAIR[c]}“, а на върха е „${top.ch}“. Невалиден.` });
        return;
      }
      yield snap({ kind: 'pop', at: i, matched: [top.at, i], message: `„${c}“ затваря „${top.ch}“ от върха: махаме я.` });
    } else {
      yield snap({ kind: 'error', at: i, bad: [i], result: false, message: `„${c}“ не е скоба. Невалиден.` });
      return;
    }
  }

  if (stack.length) {
    yield snap({ kind: 'error', at: s.length, bad: stack.map((b) => b.at), result: false, message: `Входът свърши, а ${stack.length === 1 ? 'една скоба остана отворена' : `${stack.length} скоби останаха отворени`}. Невалиден.` });
  } else {
    yield snap({ kind: 'ok', at: s.length, result: true, message: 'Входът свърши и стекът е празен: всяка скоба е затворена. Валиден.' });
  }
}

/* ---------- task 4: reverse Polish notation ---------- */

const OPS: Record<string, (a: number, b: number) => number> = {
  '+': (a, b) => a + b,
  '-': (a, b) => a - b,
  '*': (a, b) => a * b,
  // C++ `/` on ints truncates towards zero; this is what solutions/4.cpp computes.
  '/': (a, b) => Math.trunc(a / b),
};

export interface RpnStep extends TraceStep<number> {
  /** Left operand, operator, right operand and value, when an operator was just applied. */
  applied?: { left: number; op: string; right: number; value: number };
}

export function* rpnTrace(tokens: string[]): Generator<RpnStep> {
  const stack: number[] = [];
  const snap = (step: Omit<RpnStep, 'stack'>): RpnStep => ({ ...step, stack: [...stack] });

  yield snap({ kind: 'start', at: -1, message: 'Започваме с празен стек.' });

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (!(t in OPS)) {
      const value = Number(t);
      if (!Number.isInteger(value)) {
        yield snap({ kind: 'error', at: i, message: `„${t}“ не е нито цяло число, нито оператор.` });
        return;
      }
      stack.push(value);
      yield snap({ kind: 'push', at: i, message: `${value} е число: слагаме го на стека.` });
      continue;
    }
    if (stack.length < 2) {
      yield snap({ kind: 'error', at: i, message: `„${t}“ иска два операнда, а в стека ${stack.length === 1 ? 'има само един' : 'няма нито един'}.` });
      return;
    }
    // The first pop is the RIGHT operand: it went on the stack last.
    const right = stack.pop()!;
    const left = stack.pop()!;
    if (t === '/' && right === 0) {
      yield snap({ kind: 'error', at: i, message: `${left} / 0: деление на нула.` });
      return;
    }
    const value = OPS[t](left, right);
    stack.push(value);
    yield snap({
      kind: 'apply',
      at: i,
      applied: { left, op: t, right, value },
      message: `„${t}“: махаме ${right} (десен операнд) и ${left} (ляв), слагаме ${left} ${t} ${right} = ${value}.`,
    });
  }

  if (stack.length === 1) {
    yield snap({ kind: 'ok', at: tokens.length, result: stack[0], message: `Изразът свърши и в стека е останало едно число: ${stack[0]}.` });
  } else {
    yield snap({ kind: 'error', at: tokens.length, message: stack.length ? `Изразът свърши, а в стека има ${stack.length} числа: липсва оператор.` : 'Празен израз.' });
  }
}

/* ---------- the call stack: recursive factorial ---------- */

export interface Frame {
  fn: string;
  n: number;
  /** Value fact(n - 1) returned to this frame, once it has. */
  got?: number;
}

export interface CallStep extends TraceStep<Frame> {
  /** Line of FACT_CODE being executed (1-based). */
  line: number;
}

export const FACT_CODE = ['int fact(int n) {', '    if (n <= 1)', '        return 1;', '    return n * fact(n - 1);', '}'];

export function* factorialTrace(n: number): Generator<CallStep> {
  const stack: Frame[] = [{ fn: 'main', n }];
  const snap = (step: Omit<CallStep, 'stack' | 'at'>): CallStep => ({ ...step, at: -1, stack: stack.map((f) => ({ ...f })) });

  yield snap({ kind: 'start', line: 0, message: `main извиква fact(${n}).` });

  // Calls go down to the base case...
  for (let k = n; k >= 1; k--) {
    stack.push({ fn: 'fact', n: k });
    yield snap({ kind: 'call', line: 2, message: `Нова рамка за fact(${k}) отива на върха: тя пази своето собствено n = ${k}.` });
    if (k > 1) yield snap({ kind: 'call', line: 4, message: `${k} > 1, затова fact(${k}) чака fact(${k - 1}). Рамката остава в стека.` });
  }

  // ...then each frame returns to the one below it.
  let value = 1;
  yield snap({ kind: 'return', line: 3, message: 'n = 1: базов случай, връщаме 1 без ново извикване.' });
  for (let k = 1; k <= n; k++) {
    stack.pop();
    const caller = stack[stack.length - 1];
    if (caller.fn === 'main') {
      yield snap({ kind: 'ok', line: 0, result: value, message: `Рамката на fact(${k}) се маха и main получава ${value}. Стекът е както в началото.` });
      return;
    }
    caller.got = value;
    const next = caller.n * value;
    yield snap({ kind: 'return', line: 4, message: `Рамката на fact(${k}) се маха. fact(${caller.n}) продължава оттам, където спря: ${caller.n} * ${value} = ${next}.` });
    value = next;
  }
}

export const collect = <T>(gen: Generator<T>): T[] => [...gen];

/* ---------- task 8: poisonous plants, with a vector of stacks ---------- */

export interface Plant {
  /** Position in the original input. */
  at: number;
  value: number;
}

export interface PlantsStep extends TraceStep<Plant[]> {
  /** Day being simulated; 0 while the stacks are built. */
  day: number;
  /** Positions of the plants that die at this step. */
  dying?: number[];
  /** Stacks (left to right) being compared, and whether they merge. */
  compare?: { left: number; right: number; merge: boolean };
  /** Day on which each dead plant died, by position. */
  died: Record<number, number>;
}

/** The literal reading of the task, used to check the stack solution. */
export function plantsByDays(p: number[]): number {
  let days = 0;
  for (;;) {
    const next = p.filter((v, i) => i === 0 || v <= p[i - 1]);
    if (next.length === p.length) return days;
    p = next;
    days++;
  }
}

/* solutions/8.cpp, drawn left to right. Each stack holds one run that never grows from left to
   right; its top is the run's leftmost plant, the only one that can be bigger than its left
   neighbour. In the C++ the vector holds the rightmost run first; here stacks[0] is the leftmost.
   One fix against the C++ as written: after a merge it skipped comparing the merged stack with the
   next one (an extra `i--`), which kills plants that should live, e.g. on 3 4 1 5 1. */
export function* plantsTrace(p: number[]): Generator<PlantsStep> {
  // Each stack is stored as its run, left to right: element 0 is the top.
  const stacks: Plant[][] = [];
  const died: Record<number, number> = {};
  let day = 0;
  const snap = (step: Omit<PlantsStep, 'stack' | 'died' | 'day' | 'at'>): PlantsStep => ({
    ...step,
    at: -1,
    day,
    died: { ...died },
    stack: stacks.map((s) => s.map((x) => ({ ...x }))),
  });
  const list = (xs: Plant[]) => xs.map((x) => x.value).join(', ');

  yield snap({ kind: 'start', message: 'Делим цветята на стекове. Нов стек започва там, където цвете е по-голямо от левия си съсед.' });

  // Build, scanning from the right as the C++ does.
  let run: Plant[] = [];
  for (let j = p.length - 1; j >= 0; j--) {
    run.unshift({ at: j, value: p[j] });
    if (j === 0 || p[j] > p[j - 1]) {
      stacks.unshift(run);
      yield snap({
        kind: 'push',
        message: j === 0
          ? `Най-левият стек: ${list(run)}. Неговият връх ${p[0]} няма ляв съсед и никога не умира.`
          : `Стек ${list(run)}: ${p[j]} > ${p[j - 1]} (левия съсед), затова тук започва нов стек. Върхът ${p[j]} е единственият от стека, който може да умре днес.`,
      });
      run = [];
    }
  }

  while (stacks.length > 1) {
    day++;
    const dying = stacks.slice(1).map((s) => s[0]);
    yield snap({ kind: 'pop', dying: dying.map((x) => x.at), message: `Ден ${day}: умира върхът на всеки стек освен най-левия (${list(dying)}).` });

    for (let k = stacks.length - 1; k >= 1; k--) {
      died[stacks[k].shift()!.at] = day;
      if (stacks[k].length === 0) stacks.splice(k, 1);
    }

    // Sweep left to right; after a merge, compare the merged stack with the next one too.
    let j = 0;
    while (j < stacks.length - 1) {
      const left = stacks[j], right = stacks[j + 1];
      const last = left[left.length - 1], first = right[0];
      const merge = last.value >= first.value;
      yield snap({
        kind: merge ? 'apply' : 'call',
        compare: { left: j, right: j + 1, merge },
        message: merge
          ? `Най-дясното в стек ${j + 1} е ${last.value}, върхът на стек ${j + 2} е ${first.value}: ${first.value} ≤ ${last.value}, така че ${first.value} няма да умре. Двата стека стават един.`
          : `Най-дясното в стек ${j + 1} е ${last.value}, върхът на стек ${j + 2} е ${first.value}: ${first.value} > ${last.value}, значи утре умира. Остават отделни.`,
      });
      if (merge) stacks.splice(j, 2, [...left, ...right]);
      else j++;
    }
  }

  yield snap({
    kind: 'ok',
    result: day,
    message: day === 0
      ? 'Само един стек: никое цвете не е по-голямо от левия си съсед. Отговор: 0.'
      : `Остана един стек: никое живо цвете не е по-голямо от левия си съсед. Отговор: ${day}.`,
  });
}
