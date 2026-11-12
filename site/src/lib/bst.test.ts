import { describe, expect, it } from 'vitest';
import {
  bstFromInsertions,
  deleteTrace,
  heightOf,
  inorderValues,
  insertTrace,
  isBst,
  iteratorTrace,
  kthTrace,
  parseOps,
  schemeString,
  searchPath,
  searchTrace,
  serializeTrace,
  sortedTrace,
  treeOf,
  validateTrace,
  type BstStep,
  type IterOp,
} from './bst';
import { levelArray, parseLevelArray } from './tree';
import cpp from './__fixtures__/cpp.json';

const validCases = cpp.week8valid.map((c, i) => [i, c] as const);
const cases = cpp.week8.map((c, i) => [i, c] as const);

const run = (gen: Generator<BstStep>): BstStep[] => [...gen];
const last = (steps: BstStep[]): BstStep => steps[steps.length - 1];
const shape = (step: BstStep): string[] => levelArray(treeOf(step.nodes, step.root));
const text = (tokens: (number | null)[]): string => tokens.map((t) => (t === null ? 'null' : String(t))).join(' ');
const treeOfCase = (tokens: string[]): ReturnType<typeof parseLevelArray> => parseLevelArray(tokens.join(' '));

describe('task 1: validation agrees with solutions/1.cpp', () => {
  it.each(validCases)('case %i', (_, c) => {
    const tree = parseLevelArray(text(c.tokens));
    expect(last(run(validateTrace(tree))).result).toBe(String(c.valid));
    expect(isBst(tree)).toBe(c.valid);
  });

  it('is not fooled by a node that respects its parent but not its grandparent', () => {
    /* 3 is the left child of 6, so it is fine against its parent — but it sits in the right
       subtree of 5, where everything has to be bigger than 5. */
    const steps = run(validateTrace(parseLevelArray('5 4 6 null null 3 7')));
    expect(last(steps).result).toBe('false');
    expect(last(steps).message).toContain('3 не е в (5, 6)');
  });

  it('narrows the window on the way down', () => {
    const steps = run(validateTrace(parseLevelArray('5 3 8 1 4 7 9')));
    expect(last(steps).result).toBe('true');
    /* Every frame on the stack carries the window its ancestors left it. */
    const frames = steps.flatMap((s) => s.aux[0]?.items ?? []);
    expect(frames).toContain('5 ∈ (-∞, +∞)');
    expect(frames).toContain('4 ∈ (3, 5)');
    expect(frames).toContain('7 ∈ (5, 8)');
  });

  it('rejects a duplicate, because the order has to be strict', () => {
    expect(last(run(validateTrace(parseLevelArray('2 2')))).result).toBe('false');
    expect(last(run(validateTrace(parseLevelArray('2 null 2')))).result).toBe('false');
  });
});

describe('task 2: the k-th smallest agrees with solutions/2.cpp', () => {
  it.each(cases)('case %i', (_, c) => {
    expect(last(run(kthTrace(treeOfCase(c.tokens), c.k))).result).toBe(String(c.kth));
  });

  it.each(cases)('case %i stops as soon as it has k values', (_, c) => {
    const steps = run(kthTrace(treeOfCase(c.tokens), c.k));
    expect(last(steps).out.map(Number)).toEqual(c.sorted.slice(0, c.k));
  });

  it('refuses a k outside the tree', () => {
    for (const k of [0, 4, -1]) expect(last(run(kthTrace(parseLevelArray('2 1 3'), k))).kind).toBe('error');
  });

  it('keeps at most the height in the stack', () => {
    const tree = parseLevelArray('8 4 12 2 6 10 14 1');
    const steps = run(kthTrace(tree, 8));
    expect(Math.max(...steps.map((s) => s.aux[0]?.items.length ?? 0))).toBeLessThanOrEqual(heightOf(tree));
  });
});

describe('task 3: serialization agrees with solutions/3.cpp', () => {
  it.each(cases)('case %i writes the preorder', (_, c) => {
    const steps = run(serializeTrace(treeOfCase(c.tokens)));
    const written = steps.find((s) => s.tape !== undefined)!;
    expect(written.tape).toEqual(c.preorder);
  });

  it.each(cases)('case %i rebuilds the same tree', (_, c) => {
    expect(shape(last(run(serializeTrace(treeOfCase(c.tokens)))))).toEqual(c.tokens);
  });

  it('needs no null at all, because the order says where the split is', () => {
    const steps = run(serializeTrace(parseLevelArray('5 3 8 2 4 7')));
    expect(last(steps).result).toBe('5 3 2 4 8 7');
    expect(last(steps).result!.includes('null')).toBe(false);
  });

  it('says so for the empty tree', () => {
    expect(last(run(serializeTrace(parseLevelArray('[]')))).result).toBe('""');
  });
});

describe('task 4: the balanced tree of a sorted sequence agrees with solutions/4.cpp', () => {
  it.each(cases)('case %i', (_, c) => {
    expect(shape(last(run(sortedTrace(c.sorted))))).toEqual(c.balanced);
  });

  it.each(cases)('case %i comes out as short as possible', (_, c) => {
    const tree = treeOf(last(run(sortedTrace(c.sorted))).nodes, last(run(sortedTrace(c.sorted))).root);
    expect(inorderValues(tree)).toEqual(c.sorted);
    expect(heightOf(tree)).toBe(Math.ceil(Math.log2(c.sorted.length + 1)));
  });

  it('is empty for an empty list', () => {
    expect(shape(last(run(sortedTrace([]))))).toEqual([]);
  });
});

describe('task 5: search agrees with solutions/5.cpp', () => {
  it.each(cases)('case %i', (_, c) => {
    const steps = run(searchTrace(treeOfCase(c.tokens), c.find));
    expect(last(steps).result).toBe(c.found ? String(c.find) : 'nullptr');
  });

  it.each(cases)('case %i touches at most the height of the tree', (_, c) => {
    const tree = treeOfCase(c.tokens);
    expect(searchPath(tree, c.find).path.length).toBeLessThanOrEqual(heightOf(tree));
  });

  it('throws away a whole subtree at every comparison', () => {
    const steps = run(searchTrace(parseLevelArray('8 4 12 2 6 10 14'), 6));
    expect(last(steps).result).toBe('6');
    expect(steps.filter((s) => s.kind === 'move')).toHaveLength(2);
  });
});

describe('task 6: insertion agrees with solutions/6.cpp', () => {
  it.each(cases)('case %i', (_, c) => {
    expect(shape(last(run(insertTrace(treeOfCase(c.tokens), c.insert))))).toEqual(c.afterInsert);
  });

  it.each(cases)('case %i adds one leaf and moves nothing else', (_, c) => {
    const before = treeOfCase(c.tokens);
    const after = treeOf(last(run(insertTrace(before, c.insert))).nodes, last(run(insertTrace(before, c.insert))).root);
    expect(after.nodes.size).toBe(before.nodes.size + 1);
    expect(inorderValues(after)).toEqual([...inorderValues(before), c.insert].sort((a, b) => a - b));
    expect(isBst(after)).toBe(true);
  });

  it('makes the new value the root only when the tree was empty', () => {
    const steps = run(insertTrace(parseLevelArray('[]'), 7));
    expect(shape(last(steps))).toEqual(['7']);
  });
});

describe('task 7: deletion agrees with solutions/7.cpp', () => {
  it.each(cases)('case %i', (_, c) => {
    expect(shape(last(run(deleteTrace(treeOfCase(c.tokens), c.del))))).toEqual(c.afterDelete);
  });

  it.each(cases)('case %i keeps the order and loses only the key', (_, c) => {
    const before = treeOfCase(c.tokens);
    const after = treeOf(last(run(deleteTrace(before, c.del))).nodes, last(run(deleteTrace(before, c.del))).root);
    expect(inorderValues(after)).toEqual(inorderValues(before).filter((v) => v !== c.del));
    expect(isBst(after)).toBe(true);
  });

  it('lifts the only child when there is one', () => {
    expect(shape(last(run(deleteTrace(parseLevelArray('5 3 6 2 4 null 7'), 6))))).toEqual(['5', '3', '7', '2', '4']);
  });

  it('replaces a node with two children by the smallest value on its right', () => {
    const steps = run(deleteTrace(parseLevelArray('5 3 6 2 4 null 7'), 5));
    expect(shape(last(steps))).toEqual(['6', '3', '7', '2', '4']);
    expect(steps.some((s) => s.message.includes('най-малката в дясното поддърво'))).toBe(true);
  });

  it('leaves the tree alone when the key is not there', () => {
    const steps = run(deleteTrace(parseLevelArray('5 3 6 2 4 null 7'), 0));
    expect(shape(last(steps))).toEqual(['5', '3', '6', '2', '4', 'null', '7']);
  });
});

describe('tasks 8 and 9: the iterator agrees with solutions/8.cpp and 9.cpp', () => {
  const nexts = (n: number): IterOp[] => Array.from({ length: n }, () => 'next' as IterOp);

  it.each(cases)('case %i walks the whole tree in order', (_, c) => {
    const steps = run(iteratorTrace(treeOfCase(c.tokens), nexts(c.sorted.length), false));
    const values = last(steps)
      .out.filter((line) => line.startsWith('next'))
      .map((line) => Number(line.split('→ ')[1]));
    expect(values).toEqual(c.walked);
  });

  it.each(cases)('case %i never holds more than the height in the stack', (_, c) => {
    const tree = treeOfCase(c.tokens);
    const steps = run(iteratorTrace(tree, nexts(c.sorted.length), false));
    expect(Math.max(...steps.map((s) => s.aux[0].items.length))).toBeLessThanOrEqual(heightOf(tree));
  });

  it('answers hasNext without touching the tree', () => {
    const steps = run(iteratorTrace(parseLevelArray('7 3 15 null null 9 20'), ['next', 'next', 'hasNext', 'next'], false));
    expect(last(steps).out).toEqual(['next → 3', 'next → 7', 'hasNext → true', 'next → 9']);
  });

  it('is false at the end and true again as soon as prev has moved back', () => {
    const script = parseOps('next next prev next hasNext next next next hasNext hasPrev prev prev', true);
    const steps = run(iteratorTrace(parseLevelArray('7 3 15 null null 9 20'), script, true));
    expect(last(steps).out).toEqual([
      'next → 3',
      'next → 7',
      'prev → 3',
      'next → 7',
      'hasNext → true',
      'next → 9',
      'next → 15',
      'next → 20',
      'hasNext → false',
      'hasPrev → true',
      'prev → 15',
      'prev → 9',
    ]);
  });

  it.each(cases)('case %i: going back reads what was already seen', (_, c) => {
    const script: IterOp[] = [...nexts(Math.min(3, c.sorted.length)), 'prev', 'next', 'prev'];
    const steps = run(iteratorTrace(treeOfCase(c.tokens), script, true));
    const answers = last(steps).out.map((line) => line.split('→ ')[1]);
    /* The same contract the solution assumes: next() past the end and prev() before the first
       are not valid calls, and the widget says so instead of inventing a value. */
    const walk: string[] = [];
    let cursor = -1;
    for (const op of script) {
      if (op === 'next' && cursor + 1 < c.sorted.length) walk.push(String(c.sorted[++cursor]));
      else if (op === 'prev' && cursor > 0) walk.push(String(c.sorted[--cursor]));
      else walk.push('?');
    }
    expect(answers).toEqual(walk);
  });

  it('reads one call per word, whichever way it is written', () => {
    expect(parseOps('next, next(), hasNext, prev', true)).toEqual(['next', 'next', 'hasNext', 'prev']);
    expect(parseOps('n n h p', true)).toEqual(['next', 'next', 'hasNext', 'prev']);
    expect(parseOps('prev hasPrev', false)).toEqual(['next', 'hasNext']);
  });
});

describe('the shape of a BST is the order it was built in', () => {
  it('turns sorted input into a linked list', () => {
    const tree = bstFromInsertions([1, 2, 3, 4, 5, 6, 7]);
    expect(heightOf(tree)).toBe(7);
    expect(inorderValues(tree)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('is as short as possible when the middle comes first', () => {
    const tree = bstFromInsertions([4, 2, 6, 1, 3, 5, 7]);
    expect(heightOf(tree)).toBe(3);
    expect(searchPath(tree, 7).path).toHaveLength(3);
    expect(searchPath(bstFromInsertions([1, 2, 3, 4, 5, 6, 7]), 7).path).toHaveLength(7);
  });

  it.each(cases)('case %i: inserting in the recorded order gives the recorded tree', (_, c) => {
    const tree = bstFromInsertions(c.order);
    expect(levelArray(tree)).toEqual(c.tokens);
    expect(isBst(tree)).toBe(true);
    expect(inorderValues(tree)).toEqual(c.sorted);
  });

  it('writes the BST class example in Scheme form', () => {
    const tree = bstFromInsertions([10, 20, 25, 15, 5]);
    expect(schemeString(tree)).toBe('(10 (5 () ()) (20 (15 () ()) (25 () ())))');
    expect(schemeString(parseLevelArray('[]'))).toBe('()');
  });
});
