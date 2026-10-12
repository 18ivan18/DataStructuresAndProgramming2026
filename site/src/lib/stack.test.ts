import { describe, expect, it } from 'vitest';
import { applyOp, emptyStack, runOps, type StackOp } from './arrayStack';
import { bracketsTrace, collect, factorialTrace, plantsByDays, plantsTrace, rpnTrace } from './traces';
import cpp from './__fixtures__/cpp.json';
import { FAMILIES, plantsCost } from './plantsCost';

const toOps = (ops: number[]): StackOp[] => ops.map((v) => (v > 0 ? { kind: 'push', value: v } : { kind: 'pop' }));

describe('ArrayStack matches ArrayStack.h', () => {
  for (const [name, { ops, after }] of Object.entries(cpp.arrayStack)) {
    it(name, () => {
      const got = runOps(toOps(ops)).map((r) => [r.state.items.length, r.state.capacity, r.popped ?? -1]);
      expect(got).toEqual(after);
    });
  }

  it('charts every copy: n pushes cost under 3n steps', () => {
    for (const n of [1, 8, 9, 100, 1000]) {
      const total = runOps(Array.from({ length: n }, (_, i) => ({ kind: 'push', value: i + 1 }) as StackOp)).reduce((s, r) => s + r.cost, 0);
      expect(total).toBeLessThan(3 * n);
    }
  });

  it('thrashes at the boundary when shrinking at half, and not at a quarter', () => {
    const full = runOps(Array.from({ length: 9 }, (_, i) => ({ kind: 'push', value: i + 1 }) as StackOp)).at(-1)!.state;
    const wobble = toOps([0, 1, 0, 1, 0, 1, 0, 1]);
    const resizes = (rule: 'half' | 'quarter') => runOps(wobble, rule, full).filter((r) => r.resize).length;
    expect(resizes('quarter')).toBe(0);
    expect(resizes('half')).toBe(wobble.length);
  });

  it('refuses to pop an empty stack, like the header', () => {
    expect(() => applyOp(emptyStack(), { kind: 'pop' })).toThrow('Empty ArrayStack!');
  });
});

describe('traces match the week 2 solutions', () => {
  for (const [s, valid] of Object.entries(cpp.brackets)) {
    it(`isValid("${s}") = ${valid}`, () => {
      expect(collect(bracketsTrace(s)).at(-1)!.result).toBe(valid);
    });
  }

  for (const { tokens, value } of cpp.rpn) {
    it(`evalRPN(${tokens.join(' ')}) = ${value}`, () => {
      expect(collect(rpnTrace(tokens)).at(-1)!.result).toBe(value);
    });
  }

  it('reports malformed RPN instead of guessing', () => {
    expect(collect(rpnTrace(['1', '+'])).at(-1)!.kind).toBe('error');
    expect(collect(rpnTrace(['1', '2'])).at(-1)!.kind).toBe('error');
    expect(collect(rpnTrace(['1', '0', '/'])).at(-1)!.kind).toBe('error');
  });
});

describe('call stack', () => {
  it.each([1, 2, 5, 7])('fact(%i) returns n! and leaves only main', (n) => {
    const steps = collect(factorialTrace(n));
    const last = steps.at(-1)!;
    expect(last.result).toBe([1, 1, 2, 6, 24, 120, 720, 5040][n]);
    expect(last.stack).toEqual([{ fn: 'main', n }]);
    expect(Math.max(...steps.map((s) => s.stack.length))).toBe(n + 1);
  });
});

describe('poisonous plants', () => {
  const answer = (p: number[]) => collect(plantsTrace(p)).at(-1)!.result;

  it.each([
    [[3, 6, 2, 7, 5], 2],
    [[6, 5, 8, 4, 7, 10, 9], 2],
    [[3, 4, 1, 5, 1], 1], // solutions/8.cpp as written says 2
    [[5], 0],
    [[4, 3, 2, 1], 0],
    [[1, 2, 3, 4, 5], 1],
  ])('%j survives after %i days', (p, days) => {
    expect(answer(p)).toBe(days);
    expect(plantsByDays(p)).toBe(days);
  });

  it('agrees with the day-by-day simulation on 20000 random gardens', () => {
    let seed = 1;
    const rand = (m: number) => ((seed = (seed * 1103515245 + 12345) % 2147483648), seed % m);
    for (let t = 0; t < 20000; t++) {
      const p = Array.from({ length: 1 + rand(10) }, () => 1 + rand(7));
      expect(answer(p), p.join(' ')).toBe(plantsByDays(p));
    }
  });

  it('records the day each plant died', () => {
    expect(collect(plantsTrace([3, 6, 2, 7, 5])).at(-1)!.died).toEqual({ 1: 1, 3: 1, 4: 2 });
  });
});

describe('task 8 cost comparison', () => {
  it.each([1, 2, 5, 50, 501])('the worst-case garden has n = %i plants and about n/2 days', (n) => {
    const p = FAMILIES.worst(n);
    expect(p).toHaveLength(n);
    expect(plantsCost(p).days).toBe(plantsByDays(p));
    if (n >= 50) expect(plantsCost(p).days).toBeGreaterThan(n / 2 - 2);
  });

  it('counts days the same way as the simulation', () => {
    for (const n of [10, 100, 1000]) {
      const p = FAMILIES.random(n);
      expect(plantsCost(p).days).toBe(plantsByDays(p));
    }
  });

  it('is linear for the linked idea and quadratic for brute force and 8.cpp in the worst case', () => {
    const at = (n: number) => plantsCost(FAMILIES.worst(n));
    const [a, b] = [at(400), at(800)];
    // doubling n: linear roughly doubles, quadratic roughly quadruples
    expect(b.stacksLinear / a.stacksLinear).toBeLessThan(2.2);
    expect(b.brute / a.brute).toBeGreaterThan(3.6);
    expect(b.stacksCpp / a.stacksCpp).toBeGreaterThan(3.6);
  });
});
