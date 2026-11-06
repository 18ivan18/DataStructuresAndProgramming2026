import { describe, expect, it } from 'vitest';
import {
  exprTreeTrace,
  giftsTrace,
  height,
  inorderString,
  layout,
  levelOrderTrace,
  levelStrings,
  parseEdges,
  parseLevelArray,
  pathsTrace,
  size,
  traversalTrace,
  traversalValues,
  type Mode,
  type Order,
  type Tree,
  type TreeStep,
} from './tree';
import cpp from './__fixtures__/cpp.json';

const text = (tokens: (number | null)[]): string => tokens.map((t) => (t === null ? 'null' : String(t))).join(' ');
const cases = cpp.week7.map((c, i) => [i, c] as const);
const exprCases = cpp.week7expr.map((c, i) => [i, c] as const);
const giftCases = cpp.week7gifts.map((c, i) => [i, c] as const);

const run = (gen: Generator<TreeStep>): TreeStep[] => [...gen];
const last = (steps: TreeStep[]): TreeStep => steps[steps.length - 1];
const numbers = (out: string[]): number[] => out.map(Number);

describe('the level order array is read the way the examples are written', () => {
  it('builds [1,null,2,3] as a right child with a left child of its own', () => {
    const tree = parseLevelArray('1 null 2 3');
    expect(size(tree)).toBe(3);
    expect(height(tree)).toBe(3);
    expect(traversalValues(tree, 'in')).toEqual(['1', '3', '2']);
  });

  it('ignores the children of a nullptr', () => {
    expect(traversalValues(parseLevelArray('1 2 3 null null 15 7'), 'pre')).toEqual(['1', '2', '3', '15', '7']);
  });

  it('accepts the bracket notation of the task', () => {
    expect(traversalValues(parseLevelArray('[3,9,20,null,null,15,7]'), 'in')).toEqual(['9', '3', '15', '20', '7']);
  });

  it('is empty for an empty input', () => {
    expect(size(parseLevelArray('[]'))).toBe(0);
    expect(size(parseLevelArray('null'))).toBe(0);
  });
});

describe('task 1: inorder agrees with solutions/1.cpp', () => {
  it.each(cases)('case %i, recursively', (_, c) => {
    const steps = run(traversalTrace(parseLevelArray(text(c.tokens)), 'in', 'rec'));
    expect(numbers(last(steps).out)).toEqual(c.inorderRec);
  });

  it.each(cases)('case %i, with a stack', (_, c) => {
    const steps = run(traversalTrace(parseLevelArray(text(c.tokens)), 'in', 'iter'));
    expect(numbers(last(steps).out)).toEqual(c.inorder);
  });

  it.each(cases)('case %i: preorder and postorder visit every node once', (_, c) => {
    const tree = parseLevelArray(text(c.tokens));
    for (const order of ['pre', 'post'] as Order[]) {
      expect(last(run(traversalTrace(tree, order, 'rec'))).out).toEqual(traversalValues(tree, order));
    }
  });

  it('never keeps more frames than the height of the tree', () => {
    const tree = parseLevelArray('1 2 3 4 5 null 6');
    for (const [order, mode] of [['pre', 'rec'], ['in', 'rec'], ['post', 'rec'], ['in', 'iter']] as [Order, Mode][]) {
      const deepest = Math.max(...run(traversalTrace(tree, order, mode)).map((s) => s.aux[0].items.length));
      expect(deepest).toBe(height(tree));
    }
  });

  it('pushes the whole left edge before it writes anything down', () => {
    const steps = run(traversalTrace(parseLevelArray('4 2 6 1 3 5 7'), 'in', 'iter'));
    const firstVisit = steps.findIndex((s) => s.out.length === 1);
    expect(steps[firstVisit].out).toEqual(['1']);
    expect(steps[firstVisit - 1].aux[0].items).toEqual(['4', '2', '1']);
  });

  it('writes the root first in preorder and last in postorder', () => {
    const tree = parseLevelArray('1 2 3');
    expect(last(run(traversalTrace(tree, 'pre', 'rec'))).out).toEqual(['1', '2', '3']);
    expect(last(run(traversalTrace(tree, 'post', 'rec'))).out).toEqual(['2', '3', '1']);
  });
});

describe('task 2: the paths agree with solutions/2.cpp', () => {
  it.each(cases)('case %i', (_, c) => {
    expect(last(run(pathsTrace(parseLevelArray(text(c.tokens))))).paths ?? []).toEqual(c.paths);
  });

  it('builds every path from the leaf upwards', () => {
    const steps = run(pathsTrace(parseLevelArray('1 2 3 null 5')));
    const leaf = steps.find((s) => s.message.includes('листо'));
    expect(leaf?.paths).toEqual(['5']);
    expect(last(steps).paths).toEqual(['1->2->5', '1->3']);
  });

  it('reports a missing child as an empty list', () => {
    const steps = run(pathsTrace(parseLevelArray('1 2 3 null 5')));
    expect(steps.filter((s) => s.message.includes('nullptr'))).toHaveLength(1);
  });
});

describe('tasks 3, 4 and 5: the level order agrees with solutions/3.cpp, 4.cpp and 5.cpp', () => {
  it.each(cases)('case %i, level by level', (_, c) => {
    const steps = run(levelOrderTrace(parseLevelArray(text(c.tokens)), 'levels'));
    expect((last(steps).levels ?? []).map(numbers)).toEqual(c.levels);
  });

  it.each(cases)('case %i, zigzag', (_, c) => {
    const steps = run(levelOrderTrace(parseLevelArray(text(c.tokens)), 'zigzag'));
    expect((last(steps).levels ?? []).map(numbers)).toEqual(c.zigzag);
  });

  it.each(cases)('case %i, from the right', (_, c) => {
    const steps = run(levelOrderTrace(parseLevelArray(text(c.tokens)), 'right'));
    expect(numbers(last(steps).out)).toEqual(c.right);
  });

  it('holds exactly one level in the queue at the end of each round', () => {
    const tree = parseLevelArray('1 2 3 4 5 6 7');
    const steps = run(levelOrderTrace(tree, 'levels'));
    const rounds = steps.filter((s) => s.message.startsWith('Ниво'));
    expect(rounds.map((s) => s.aux[0].items.length)).toEqual([2, 4, 0]);
  });

  it('reverses only every second level in zigzag', () => {
    const steps = run(levelOrderTrace(parseLevelArray('1 2 3 4 5 6 7'), 'zigzag'));
    expect(last(steps).levels).toEqual([['1'], ['3', '2'], ['4', '5', '6', '7']]);
  });

  it('sees the deepest node even when it is a left child', () => {
    expect(last(run(levelOrderTrace(parseLevelArray('1 2 3 4'), 'right'))).out).toEqual(['1', '3', '4']);
  });
});

describe('task 6: the expression tree agrees with solutions/6.cpp', () => {
  it.each(exprCases)('case %i', (_, c) => {
    const built = exprTreeTrace(c.s);
    expect(built.ok).toBe(true);
    expect(inorderString(built.tree)).toBe(c.inorder);
    expect(levelStrings(built.tree)).toEqual(c.levels);
  });

  it('gives the operands back in the order they were read', () => {
    const built = exprTreeTrace('2-3/(5*2)+1');
    const cells = layout(built.tree);
    const inOrderOfX = [...built.tree.nodes.values()].sort((a, b) => cells.get(a.id)!.col - cells.get(b.id)!.col).map((n) => n.val);
    expect(inOrderOfX.join('')).toBe('2-3/5*2+1');
  });

  it('pops the right operand first', () => {
    const built = exprTreeTrace('3-1');
    const root = built.tree.nodes.get(built.tree.root!)!;
    expect(root.val).toBe('-');
    expect(built.tree.nodes.get(root.kids[0]!)!.val).toBe('3');
    expect(built.tree.nodes.get(root.kids[1]!)!.val).toBe('1');
  });

  it('leaves no node for the brackets', () => {
    expect(size(exprTreeTrace('2*(3+4)').tree)).toBe(5);
  });

  it('groups equal operators from the left', () => {
    const root = exprTreeTrace('1+2+3').tree;
    expect(levelStrings(root)).toEqual(['+', '+3', '12']);
  });

  it('refuses an expression it cannot read', () => {
    for (const bad of ['', '2+', '2%3', '2+3)']) {
      const built = exprTreeTrace(bad);
      expect(built.ok).toBe(false);
      expect(last(built.steps).kind).toBe('error');
    }
  });
});

describe('task 7: the gift counts agree with solutions/7.cpp', () => {
  it.each(giftCases)('case %i', (_, c) => {
    const tree = parseEdges(c.edges.flat().join(' '));
    if (c.n === 1) {
      expect(size(tree)).toBe(0);
      return;
    }
    const steps = run(giftsTrace(tree));
    const byPerson = Object.fromEntries([...tree.nodes.values()].map((n) => [n.val, last(steps).badges?.[n.id]]));
    expect(byPerson).toEqual(Object.fromEntries(c.gifts.map((g, i) => [String(i), String(g)])));
  });

  it('gives the boss one gift per other employee', () => {
    const tree = parseEdges('0 1, 0 2, 1 3, 1 4, 1 5, 1 6, 4 7, 7 8');
    const steps = run(giftsTrace(tree));
    expect(last(steps).aux[1].items).toEqual(['8', '6', '0', '0', '2', '0', '0', '1', '0']);
    expect(last(steps).badges?.[1]).toBe(String(size(tree) - 1));
  });

  it('counts a node only after all of its children', () => {
    const tree = parseEdges('0 1, 1 2, 2 3');
    const steps = run(giftsTrace(tree));
    const written = steps.filter((s) => s.kind === 'visit').map((s) => s.message);
    expect(written).toEqual(['gifts[3] = 0.', 'gifts[2] = 1.', 'gifts[1] = 2.', 'gifts[0] = 3.']);
  });

  it('keeps only the part of the input that hangs under the root', () => {
    expect(size(parseEdges('0 1, 5 6'))).toBe(2);
  });
});

describe('every trace stays consistent with the tree it is drawn on', () => {
  const trees: [string, Tree][] = [
    ['one node', parseLevelArray('1')],
    ['a left chain', parseLevelArray('1 2 null 3')],
    ['a full tree', parseLevelArray('1 2 3 4 5 6 7')],
    ['a lopsided tree', parseLevelArray('1 2 3 null 5 null 4')],
    ['nothing', parseLevelArray('')],
  ];

  it.each(trees)('%s: every step ends somewhere and marks only nodes that exist', (_, tree) => {
    const ids = new Set(tree.nodes.keys());
    const runs: TreeStep[][] = [
      run(traversalTrace(tree, 'pre', 'rec')),
      run(traversalTrace(tree, 'in', 'rec')),
      run(traversalTrace(tree, 'post', 'rec')),
      run(traversalTrace(tree, 'in', 'iter')),
      run(levelOrderTrace(tree, 'levels')),
      run(levelOrderTrace(tree, 'zigzag')),
      run(levelOrderTrace(tree, 'right')),
      run(pathsTrace(tree)),
    ];
    for (const steps of runs) {
      expect(steps.length).toBeGreaterThan(0);
      expect(last(steps).kind).toBe('ok');
      for (const step of steps) {
        for (const id of Object.keys(step.marks)) expect(ids.has(Number(id))).toBe(true);
        for (const panel of step.aux) expect(panel.items.length).toBeLessThanOrEqual(tree.nodes.size + 1);
      }
    }
  });

  it('places every node on its own spot', () => {
    for (const [, tree] of trees) {
      const cells = layout(tree);
      const spots = new Set([...cells.values()].map((c) => `${c.col}:${c.row}`));
      expect(spots.size).toBe(tree.nodes.size);
    }
  });

  it('puts a parent above its children and between them', () => {
    const tree = parseLevelArray('1 2 3 4 5 6 7');
    const cells = layout(tree);
    for (const node of tree.nodes.values()) {
      const kids = node.kids.filter((k): k is number => k !== null);
      for (const kid of kids) expect(cells.get(kid)!.row).toBe(cells.get(node.id)!.row + 1);
      if (kids.length === 2) {
        expect(cells.get(kids[0])!.col).toBeLessThan(cells.get(node.id)!.col);
        expect(cells.get(kids[1])!.col).toBeGreaterThan(cells.get(node.id)!.col);
      }
    }
  });
});
