import { describe, expect, it } from 'vitest';
import { valuesFrom } from './linked';
import { kGroupTrace, oddEvenTrace, palindromeTrace, partitionTrace, reorderTrace, shuffleTrace, type PrepRun } from './week06';
import cpp from './__fixtures__/cpp.json';

const result = (run: PrepRun): number[] => {
  const last = run.steps[run.steps.length - 1];
  const head = last.vars.find(([name]) => name === 'head');
  if (!head) throw new Error('the trace should end with a head pointer');
  return valuesFrom(last.nodes, head[1]) as number[];
};

const answer = (run: PrepRun): string | undefined => run.steps[run.steps.length - 1].result;

const cases = cpp.week6.map((c, i) => [i, c] as const);

describe('task 1: reverse every group of k matches solutions/1.cpp', () => {
  it.each(cases)('case %i', (_, c) => {
    expect(result(kGroupTrace(c.values, c.k))).toEqual(c.kGroup);
  });

  it('leaves a group shorter than k alone and keeps every node', () => {
    const run = kGroupTrace([1, 2, 3, 4, 5], 2);
    expect(result(run)).toEqual([2, 1, 4, 3, 5]);
    expect(run.steps[run.steps.length - 1].nodes.filter((n) => n.freed)).toHaveLength(0);
    expect([...result(run)].sort()).toEqual([1, 2, 3, 4, 5]);
  });
});

describe('task 2: palindrome matches solutions/2.cpp', () => {
  it.each(cases)('case %i', (_, c) => {
    expect(answer(palindromeTrace(c.palindromeOf))).toBe(String(c.palindrome));
  });

  it('empties the stack it filled when the list is a palindrome', () => {
    const run = palindromeTrace([1, 2, 3, 2, 1]);
    const last = run.steps[run.steps.length - 1];
    expect(last.result).toBe('true');
    expect(last.stack).toEqual([]);
    expect(Math.max(...run.steps.map((s) => s.stack?.length ?? 0))).toBe(3);
  });

  it('stops at the first mismatch', () => {
    const run = palindromeTrace([1, 2, 3, 4, 2, 1]);
    expect(answer(run)).toBe('false');
    expect(run.steps[run.steps.length - 1].kind).toBe('error');
  });
});

describe('task 4: reorder matches solutions/4.cpp', () => {
  it.each(cases)('case %i', (_, c) => {
    expect(result(reorderTrace(c.values))).toEqual(c.reorder);
  });
});

describe('task 6: odd and even positions match solutions/6.cpp', () => {
  it.each(cases)('case %i', (_, c) => {
    expect(result(oddEvenTrace(c.values))).toEqual(c.oddEven);
  });
});

describe('task 7: partition matches solutions/7.cpp', () => {
  it.each(cases)('case %i', (_, c) => {
    expect(result(partitionTrace(c.values, c.x))).toEqual(c.partition);
  });

  it('puts every node in the lane the diagram draws it in', () => {
    const run = partitionTrace([1, 4, 3, 2, 5, 2], 3);
    expect(result(run)).toEqual([1, 2, 2, 4, 3, 5]);
    expect(run.lanes).toEqual([0, 1, 1, 0, 1, 0]);
    expect(run.dummies).toHaveLength(2);
  });
});

describe('task 8: shuffle matches solutions/8.cpp', () => {
  it.each(cases)('case %i', (_, c) => {
    expect(result(shuffleTrace(c.values))).toEqual(c.shuffle);
  });

  it('moves the second half to the front in reverse, the middle staying in the first half', () => {
    expect(result(shuffleTrace([1, 2, 3, 4, 5]))).toEqual([5, 4, 1, 2, 3]);
    expect(result(shuffleTrace([1, 2, 3, 4]))).toEqual([4, 3, 1, 2]);
  });
});

describe('every trace', () => {
  const runs = (values: number[]): [string, PrepRun][] => [
    ['kGroup', kGroupTrace(values, 2)],
    ['palindrome', palindromeTrace(values)],
    ['reorder', reorderTrace(values)],
    ['oddEven', oddEvenTrace(values)],
    ['partition', partitionTrace(values, 3)],
    ['shuffle', shuffleTrace(values)],
  ];

  it('starts somewhere and ends with a message, for every length from 1 to 9', () => {
    for (let n = 1; n <= 9; n++) {
      const values = Array.from({ length: n }, (_, i) => i + 1);
      for (const [name, run] of runs(values)) {
        expect(run.steps.length, `${name} n=${n}`).toBeGreaterThan(0);
        expect(run.steps[run.steps.length - 1].message, `${name} n=${n}`).not.toBe('');
        expect(['ok', 'error'], `${name} n=${n}`).toContain(run.steps[run.steps.length - 1].kind);
      }
    }
  });

  it('never loses or leaks a node', () => {
    for (let n = 1; n <= 9; n++) {
      const values = Array.from({ length: n }, (_, i) => i + 1);
      for (const [name, run] of runs(values)) {
        if (name === 'palindrome') continue;
        const reachable = result(run);
        expect(reachable.slice().sort((a, b) => a - b), `${name} n=${n}`).toEqual(values);
      }
    }
  });
});
