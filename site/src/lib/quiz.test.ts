import { describe, expect, it } from 'vitest';
import { week02Quiz } from '../data/quizzes/week02';
import { week03Quiz } from '../data/quizzes/week03';
import { week04Quiz } from '../data/quizzes/week04';
import { week05Quiz } from '../data/quizzes/week05';
import { type ArrayStackState, type StackOp, applyOp, emptyStack, runOps } from './arrayStack';
import { type DoublyOp, runDoublyOp } from './doubly';
import { type ListOp, type ListState, emptyList, listValues, runOp } from './linked';
import { type RingState, dequeue, emptyRing, enqueue, ringItems } from './queue';
import {
  type Answers,
  type Part,
  type Quiz,
  gradePart,
  isAnswered,
  parseNumber,
  partId,
  quizParts,
  scoreQuiz,
  scoreSkills,
  weakestSkill,
} from './quiz';

const mc: Part = { kind: 'mc', question: 'q', points: 4, options: ['a', 'b', 'c'], answer: 1 };
const multi: Part = { kind: 'multi', question: 'q', points: 3, options: ['a', 'b', 'c'], answer: [0, 2] };
const rows: Part = {
  kind: 'rows',
  question: 'q',
  points: 4,
  options: ['x', 'y'],
  rows: [
    { label: 'r1', answer: 0 },
    { label: 'r2', answer: 1 },
    { label: 'r3', answer: 0 },
    { label: 'r4', answer: 1 },
  ],
};
const num: Part = { kind: 'num', question: 'q', points: 2, answer: 6 };
const seq: Part = { kind: 'seq', question: 'q', points: 5, tokens: ['1', '3', '4', '7'], answer: ['7', '4', '1'] };

const allCorrect = (quiz: Quiz): Answers =>
  Object.fromEntries(
    quizParts(quiz).map(({ id, part }) => {
      switch (part.kind) {
        case 'mc':
          return [id, part.answer];
        case 'multi':
          return [id, part.answer];
        case 'rows':
          return [id, Object.fromEntries(part.rows.map((row, i) => [i, row.answer]))];
        case 'num':
          return [id, String(part.answer)];
        case 'seq':
          return [id, part.answer];
      }
    }),
  );

describe('grading one part', () => {
  it('scores a single choice all or nothing', () => {
    expect(gradePart(mc, 1)).toMatchObject({ got: 4, correct: true, answered: true });
    expect(gradePart(mc, 0)).toMatchObject({ got: 0, correct: false, answered: true });
    expect(gradePart(mc, undefined)).toMatchObject({ got: 0, answered: false });
  });

  it('wants the exact set for select-all, in any order', () => {
    expect(gradePart(multi, [2, 0]).got).toBe(3);
    expect(gradePart(multi, [0]).got).toBe(0);
    expect(gradePart(multi, [0, 1, 2]).got).toBe(0);
  });

  it('gives rows partial credit per row', () => {
    expect(gradePart(rows, { 0: 0, 1: 1, 2: 0, 3: 1 })).toMatchObject({ got: 4, correct: true, rowsRight: 4 });
    expect(gradePart(rows, { 0: 0, 1: 0, 2: 0, 3: 1 })).toMatchObject({ got: 3, correct: false, rowsRight: 3 });
    expect(gradePart(rows, {})).toMatchObject({ got: 0, answered: false, rowsRight: 0 });
  });

  it('accepts a decimal comma and rejects anything but a number', () => {
    expect(parseNumber('6')).toBe(6);
    expect(parseNumber(' 2,5 ')).toBe(2.5);
    expect(parseNumber('−3')).toBe(-3);
    expect(parseNumber('')).toBeNull();
    expect(parseNumber('шест')).toBeNull();
    expect(parseNumber('6 т.')).toBeNull();
    expect(gradePart(num, '6').got).toBe(2);
    expect(gradePart(num, '6.0').got).toBe(2);
    expect(gradePart(num, '7').got).toBe(0);
  });

  it('honours a tolerance when the part asks for one', () => {
    const loose: Part = { ...num, kind: 'num', answer: 2.5, tolerance: 0.1 };
    expect(gradePart(loose, '2,55').got).toBe(2);
    expect(gradePart(loose, '2,8').got).toBe(0);
  });

  it('wants the sequence in order and complete', () => {
    expect(gradePart(seq, ['7', '4', '1']).got).toBe(5);
    expect(gradePart(seq, ['7', '1', '4']).got).toBe(0);
    expect(gradePart(seq, ['7', '4']).got).toBe(0);
    expect(isAnswered(seq, [])).toBe(false);
  });

  it('counts a part answered only once every row has a choice', () => {
    expect(isAnswered(rows, { 0: 0, 1: 1, 2: 0 })).toBe(false);
    expect(isAnswered(rows, { 0: 0, 1: 1, 2: 0, 3: 1 })).toBe(true);
    expect(isAnswered(num, ' ')).toBe(false);
  });
});

describe.each([
  ['week 2', week02Quiz],
  ['week 3', week03Quiz],
  ['week 4', week04Quiz],
  ['week 5', week05Quiz],
])('the %s quiz', (_name, quiz) => {
  it('gives every task a known skill and at least one part', () => {
    const ids = new Set(quiz.skills.map((s) => s.id));
    for (const task of quiz.tasks) {
      expect(ids.has(task.skill), task.id).toBe(true);
      expect(task.parts.length, task.id).toBeGreaterThan(0);
      expect(task.explain.length, task.id).toBeGreaterThan(0);
    }
  });

  it('keeps task and part ids unique', () => {
    const tasks = quiz.tasks.map((t) => t.id);
    const parts = quizParts(quiz).map((p) => p.id);
    expect(new Set(tasks).size).toBe(tasks.length);
    expect(new Set(parts).size).toBe(parts.length);
  });

  it('points at answers that exist', () => {
    for (const { id, part } of quizParts(quiz)) {
      expect(part.points, id).toBeGreaterThan(0);
      if (part.kind === 'mc') expect(part.options[part.answer], id).toBeDefined();
      if (part.kind === 'multi') {
        expect(part.answer.length, id).toBeGreaterThan(0);
        for (const i of part.answer) expect(part.options[i], id).toBeDefined();
      }
      if (part.kind === 'rows') for (const row of part.rows) expect(part.options[row.answer], row.label).toBeDefined();
      if (part.kind === 'seq') for (const token of part.answer) expect(part.tokens, id).toContain(token);
    }
  });

  it('uses every skill it declares', () => {
    const used = new Set(quiz.tasks.map((t) => t.skill));
    for (const skill of quiz.skills) expect(used.has(skill.id), skill.id).toBe(true);
  });

  it('scores a full sheet as full marks and an empty one as zero', () => {
    const full = scoreQuiz(quiz, allCorrect(quiz));
    expect(full.got).toBe(full.max);
    expect(full.answered).toBe(full.total);
    expect(weakestSkill(scoreSkills(quiz, allCorrect(quiz)))).toBeNull();

    const empty = scoreQuiz(quiz, {});
    expect(empty.got).toBe(0);
    expect(empty.answered).toBe(0);
    expect(empty.max).toBe(full.max);
  });

  it('names the skill with the lowest share as the weakest', () => {
    const answers = allCorrect(quiz);
    const dropped = quiz.tasks.find((t) => t.parts.length === 1 && t.parts[0].kind === 'mc')!;
    delete answers[partId(dropped.id, 0)];
    expect(weakestSkill(scoreSkills(quiz, answers))!.skill.id).toBe(dropped.skill);
  });

  it('splits the points across skills without losing any', () => {
    const skills = scoreSkills(quiz, allCorrect(quiz));
    const total = scoreQuiz(quiz, {});
    expect(skills.reduce((sum, s) => sum + s.max, 0)).toBe(total.max);
  });
});

const taskIn = (quiz: Quiz, id: string) => quiz.tasks.find((t) => t.id === id)!;
const task = (id: string) => taskIn(week02Quiz, id);
const task3 = (id: string) => taskIn(week03Quiz, id);
const task4 = (id: string) => taskIn(week04Quiz, id);
const task5 = (id: string) => taskIn(week05Quiz, id);

const numIn = (quiz: Quiz, taskId: string, index: number): number => {
  const part = taskIn(quiz, taskId).parts[index];
  if (part.kind !== 'num') throw new Error(`${taskId}.${index} is ${part.kind}, not num`);
  return part.answer;
};
const numAnswer = (taskId: string, index: number): number => numIn(week02Quiz, taskId, index);

const pushes = (n: number): StackOp[] => Array.from({ length: n }, (_, i) => ({ kind: 'push', value: i + 1 }) as StackOp);

function reachableStates(maxItems: number): Set<string> {
  const key = (s: ArrayStackState): string => `${s.items.length}:${s.capacity}`;
  const seen = new Set([key(emptyStack())]);
  const queue: ArrayStackState[] = [emptyStack()];
  while (queue.length) {
    const state = queue.shift()!;
    const steps: StackOp[] = state.items.length < maxItems ? [{ kind: 'push', value: 1 }] : [];
    if (state.items.length) steps.push({ kind: 'pop' });
    for (const step of steps) {
      const next = applyOp(state, step).state;
      if (seen.has(key(next))) continue;
      seen.add(key(next));
      queue.push(next);
    }
  }
  return seen;
}

describe('the answers agree with the simulated ArrayStack', () => {
  it('about the ninth push', () => {
    const ninth = runOps(pushes(9)).at(-1)!;
    expect(ninth.resize!.copied).toBe(numAnswer('amortized-resize', 0));
    expect(ninth.state.capacity).toBe(numAnswer('amortized-resize', 1));
    expect(ninth.cost).toBe(numAnswer('amortized-resize', 2));
  });

  it('about a thousand pushes', () => {
    const run = runOps(pushes(1000));
    expect(run.reduce((sum, r) => sum + (r.resize?.copied ?? 0), 0)).toBe(numAnswer('amortized-count', 0));
    expect(run.at(-1)!.state.capacity).toBe(numAnswer('amortized-count', 1));
    expect(run.findIndex((r) => r.state.capacity === 32) + 1).toBe(numAnswer('amortized-count', 2));
  });

  it('about which (n, capacity) states a push/pop sequence can reach', () => {
    const states = task('read-states').parts[0];
    if (states.kind !== 'rows') throw new Error('read-states should be a rows part');
    const seen = reachableStates(40);
    for (const row of states.rows) {
      const [, n, capacity] = row.label.match(/n = (\d+).*capacity = (\d+)/)!;
      expect(seen.has(`${n}:${capacity}`) ? 0 : 1, row.label).toBe(row.answer);
    }
  });

  it('about what the pops of task „Какво връщат pop-овете“ return', () => {
    const ops: StackOp[] = [
      { kind: 'push', value: 3 },
      { kind: 'push', value: 7 },
      { kind: 'pop' },
      { kind: 'push', value: 1 },
      { kind: 'push', value: 4 },
      { kind: 'pop' },
      { kind: 'pop' },
    ];
    const run = runOps(ops);
    const popped = run.filter((r) => r.popped !== null).map((r) => String(r.popped));
    const [order, left] = task('lifo-pops').parts;
    if (order.kind !== 'seq' || left.kind !== 'num') throw new Error('lifo-pops should be a seq and a num');
    expect(popped).toEqual(order.answer);
    expect(run.at(-1)!.state.items.length).toBe(left.answer);
  });
});

describe('the week 3 answers agree with the simulated ArrayQueue', () => {
  const filled = (count: number): RingState => Array.from({ length: count }, (_, i) => i + 1).reduce((s, v) => enqueue(s, v).state, emptyRing());

  it('about what the traced calls return', () => {
    let s = enqueue(enqueue(emptyRing(), 1).state, 2).state;
    const returned: string[] = [];
    const first = dequeue(s);
    returned.push(String(first.value));
    s = enqueue(first.state, 3).state;
    const peeked = ringItems(s)[0];
    const second = dequeue(s);
    returned.push(String(second.value));
    const [order, peek] = task3('fifo-order').parts;
    if (order.kind !== 'seq' || peek.kind !== 'num') throw new Error('fifo-order should be a seq and a num');
    expect(returned).toEqual(order.answer);
    expect(peeked).toBe(peek.answer);
  });

  it('about where the end wraps round to', () => {
    let s = filled(8);
    for (let i = 0; i < 3; i++) s = dequeue(s).state;
    const [first, cells] = task3('ring-wrap').parts;
    if (first.kind !== 'num' || cells.kind !== 'multi') throw new Error('ring-wrap should be a num and a multi');
    expect(s.first).toBe(first.answer);
    const landed: number[] = [];
    for (const value of [9, 10, 11]) {
      const r = enqueue(s, value);
      landed.push(r.index);
      s = r.state;
    }
    expect(cells.answer.map((i) => cells.options[i])).toEqual(landed.map((i) => `\`arr[${i}]\``));
  });

  it('about the ring unrolling when it grows', () => {
    let s = filled(8);
    for (let i = 0; i < 3; i++) s = dequeue(s).state;
    for (const value of [9, 10, 11]) s = enqueue(s, value).state;
    expect([s.n, s.cells.length, s.first]).toEqual([8, 8, 3]); // the state the task describes
    const grown = enqueue(s, 12);
    const [capacity, first, index] = task3('ring-grow').parts;
    if (capacity.kind !== 'num' || first.kind !== 'num' || index.kind !== 'num') throw new Error('ring-grow should be three nums');
    expect(grown.state.cells.length).toBe(capacity.answer);
    expect(grown.state.first).toBe(first.answer);
    expect(grown.index).toBe(index.answer);
  });

  it('about how much a thousand enqueues copy', () => {
    let s = emptyRing();
    let copied = 0;
    for (let i = 1; i <= 1000; i++) {
      const r = enqueue(s, i);
      if (r.resize) copied += s.n; // resize moves the live elements, nothing else
      s = r.state;
    }
    const [capacity, moved] = task3('ring-amortized').parts;
    if (capacity.kind !== 'num' || moved.kind !== 'num') throw new Error('ring-amortized should be two nums');
    expect(s.cells.length).toBe(capacity.answer);
    expect(copied).toBe(moved.answer);
  });

  it('about which (n, capacity, first) states enqueue and dequeue can reach', () => {
    const key = (s: RingState): string => `${s.n}:${s.cells.length}:${s.first}`;
    const seen = new Set([key(emptyRing())]);
    const queue: RingState[] = [emptyRing()];
    while (queue.length) {
      const state = queue.shift()!;
      const steps = [...(state.n < 20 ? [enqueue(state, 1).state] : []), ...(state.n > 0 ? [dequeue(state).state] : [])];
      for (const next of steps) {
        if (seen.has(key(next))) continue;
        seen.add(key(next));
        queue.push(next);
      }
    }
    const states = task3('read-states').parts[0];
    if (states.kind !== 'rows') throw new Error('read-states should be a rows part');
    for (const row of states.rows) {
      const [, n, capacity, first] = row.label.match(/n = (\d+).*capacity = (\d+).*first = (\d+)/)!;
      expect(seen.has(`${n}:${capacity}:${first}`) ? 0 : 1, row.label).toBe(row.answer);
    }
  });
});

describe('the week 4 answers agree with the simulated SinglyLinkedList', () => {
  const run = (ops: ListOp[]): ListState => ops.reduce((state, op) => runOp(state, op).after, emptyList());

  it('about what the list holds after the traced calls', () => {
    const state = run([
      { op: 'pushBack', x: 1 },
      { op: 'pushBack', x: 2 },
      { op: 'pushFront', x: 3 },
      { op: 'insertAt', i: 2, x: 4 },
      { op: 'popFront' },
    ]);
    const [order, found] = task4('pointers-trace').parts;
    if (order.kind !== 'seq' || found.kind !== 'num') throw new Error('pointers-trace should be a seq and a num');
    expect(listValues(state).map(String)).toEqual(order.answer);
    expect(Number(runOp(state, { op: 'find', x: 4 }).returned)).toBe(found.answer);
  });

  it('about how many pointer hops indexing costs', () => {
    const ten = run(Array.from({ length: 10 }, (_, i) => ({ op: 'pushBack', x: i + 1 }) as ListOp));
    const hops = (index: number): number => runOp(ten, { op: 'at', i: index }).steps.at(-1)!.hops;
    expect(hops(3)).toBe(numIn(week04Quiz, 'pointers-hops', 0));
    expect(ten.nodes.map((_, i) => hops(i)).reduce((a, b) => a + b, 0)).toBe(numIn(week04Quiz, 'pointers-hops', 1));
  });
});

describe('the week 5 answers agree with the simulated DoublyLinkedList', () => {
  const run = (ops: DoublyOp[]): ListState => ops.reduce((state, op) => runDoublyOp(state, op).after, emptyList());

  it('about what the list holds after the traced calls', () => {
    const state = run([
      { op: 'pushBack', x: 1 },
      { op: 'pushFront', x: 2 },
      { op: 'insertAt', i: 1, x: 3 },
      { op: 'popBack' },
      { op: 'pushBack', x: 4 },
    ]);
    const [order, found] = task5('pointers-trace').parts;
    if (order.kind !== 'seq' || found.kind !== 'num') throw new Error('pointers-trace should be a seq and a num');
    expect(listValues(state).map(String)).toEqual(order.answer);
    expect(Number(runDoublyOp(state, { op: 'find', x: 3 }).returned)).toBe(found.answer);
  });

  it('about which end nodeAt walks from', () => {
    const ten = run(Array.from({ length: 10 }, (_, i) => ({ op: 'pushBack', x: i + 1 }) as DoublyOp));
    const ends = task5('read-nodeat').parts[0];
    if (ends.kind !== 'rows') throw new Error('read-nodeat should start with a rows part');
    for (const row of ends.rows) {
      const index = Number(row.label.match(/nodeAt\((\d+)\)/)![1]);
      const said = runDoublyOp(ten, { op: 'at', i: index }).steps.find((step) => step.message.includes('затова тръгваме от'))!.message;
      expect(said.includes('от края') ? 1 : 0, row.label).toBe(row.answer);
    }
  });

  it('about how many pointer hops indexing costs', () => {
    const ten = run(Array.from({ length: 10 }, (_, i) => ({ op: 'pushBack', x: i + 1 }) as DoublyOp));
    const hops = (index: number): number => runDoublyOp(ten, { op: 'at', i: index }).steps.at(-1)!.hops;
    expect(hops(7)).toBe(numIn(week05Quiz, 'read-nodeat', 1));
    expect(ten.nodes.map((_, i) => hops(i)).reduce((a, b) => a + b, 0)).toBe(numIn(week05Quiz, 'read-nodeat', 2));
  });
});
