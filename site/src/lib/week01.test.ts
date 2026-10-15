import { describe, expect, it } from 'vitest';
import { CLASSES, containsComparisons, firstViolation, formatDuration, log10Factorial, log10Seconds, PAIRS } from './complexity';
import { filterTrace, mapTrace, reduceTrace } from './hof';
import { collect } from './traces';

const cls = (id: string) => CLASSES.find((c) => c.id === id)!;
const seconds = (id: string, n: number) => 10 ** log10Seconds(cls(id), n, 1e6);

describe('growth reproduces the README table (1 µs per operation)', () => {
  // [class, n, seconds the README cell stands for]
  const cells: [string, number, number][] = [
    ['n', 1e6, 1],
    ['nlog', 1e6, 20],
    ['n2', 1e4, 120], // "2 min"
    ['n2', 1e5, 3 * 3600], // "3 hours"
    ['n2', 1e6, 12 * 86400], // "12 days"
    ['fact', 10, 4], // "4 sec"
    ['exp', 100, 40170e12 * 365.25 * 86400], // "40170 trillion years"
  ];
  it.each(cells)('%s at n = %d ≈ %d s', (id, n, s) => {
    expect(seconds(id, n) / s).toBeGreaterThan(0.6);
    expect(seconds(id, n) / s).toBeLessThan(1.4);
  });

  it('keeps every "< 1 sec" cell under a second', () => {
    for (const [id, n] of [['1', 1e6], ['log', 1e6], ['n', 1e5], ['nlog', 1e4], ['n2', 1e3], ['exp', 10], ['fact', 1]] as const)
      // n² at n = 1000 is exactly 10^6 operations = 1 s; the README rounds that cell to "< 1 sec".
      expect(seconds(id, n), `${id} ${n}`).toBeLessThanOrEqual(1);
  });

  it('formats durations in words', () => {
    expect(formatDuration(log10Seconds(cls('n2'), 1e6, 1e6)).text).toBe('12 дни');
    expect(formatDuration(log10Seconds(cls('nlog'), 1e6, 1e6)).text).toBe('20 сек');
    expect(formatDuration(-3).text).toBe('< 1 сек');
    expect(formatDuration(log10Seconds(cls('exp'), 1000, 1e6)).text).toMatch(/възрастта на Вселената/);
  });

  it('computes log10(n!) exactly at whole numbers and smoothly in between', () => {
    expect(10 ** log10Factorial(10)).toBeCloseTo(3628800, -1);
    expect(log10Factorial(1001) - log10Factorial(1000)).toBeCloseTo(Math.log10(1001), 8);
    let exact = 0;
    for (let k = 2; k <= 2000; k++) exact += Math.log10(k);
    expect(log10Factorial(2000)).toBeCloseTo(exact, 6);
    // no steps: 10.5! sits strictly between 10! and 11!
    expect(log10Factorial(10.5)).toBeGreaterThan(log10Factorial(10));
    expect(log10Factorial(10.5)).toBeLessThan(log10Factorial(11));
  });
});

describe('asymptotic witnesses', () => {
  const pair = (id: string) => PAIRS.find((p) => p.id === id)!;
  it('accepts the witnesses the notes give', () => {
    expect(firstViolation(pair('quad'), 'O', 4, 0, 11, 1000)).toBeNull();
    expect(firstViolation(pair('quad'), 'Omega', 3, 0, 1, 1000)).toBeNull();
    expect(firstViolation(pair('lin'), 'O', 1, 0, 100, 1000)).toBeNull();
    expect(firstViolation(pair('half'), 'Theta', 0.25, 0.5, 12, 1000)).toBeNull();
    expect(firstViolation(pair('nlogn'), 'Omega', 1, 0, 2, 1000)).toBeNull();
  });
  it('rejects the ones that are too tight', () => {
    expect(firstViolation(pair('quad'), 'O', 4, 0, 1, 1000)).toBe(1);
    expect(firstViolation(pair('half'), 'Theta', 0.25, 0.5, 6, 1000)).toBe(6);
    // n log n is not O(n): even c = 10 fails once log2 n > 10
    expect(firstViolation(pair('nlogn'), 'O', 10, 0, 1, 5000)).toBe(1025);
  });
});

describe('contains()', () => {
  const arr = [7, 3, 9, 1];
  it('makes 1 comparison at best and n at worst', () => {
    expect(containsComparisons(arr, 7)).toBe(1);
    expect(containsComparisons(arr, 1)).toBe(4);
    expect(containsComparisons(arr, 42)).toBe(4);
  });
});

describe('map / filter / reduce match the README', () => {
  const last = <T,>(g: Generator<T>) => collect(g).at(-1)!;
  it('map square', () => expect(last(mapTrace([1, 2, 3], 'square')).result).toEqual([1, 4, 9]));
  it('filter isEven', () => expect(last(filterTrace([1, 2, 3], 'isEven')).result).toEqual([2]));
  it('reduce + 0', () => {
    const s = last(reduceTrace([1, 2, 3], 'add'));
    expect(s.result).toBe(6);
    expect(s.expr).toBe('(((0 + 1) + 2) + 3)');
  });
  it('reduce append ""', () => {
    const s = last(reduceTrace([1, 2, 3], 'append'));
    expect(s.result).toBe('123');
    expect(s.expr).toBe('((("" + "1") + "2") + "3")');
  });
  it.each([['add', 15], ['multiply', 120], ['bigger', 5]] as const)('task 5: [1..5] %s → %i', (op, v) => {
    expect(last(reduceTrace([1, 2, 3, 4, 5], op)).result).toBe(v);
  });
  it('bigger with init 1 is wrong for negative numbers (the question in task 5)', () => {
    expect(last(reduceTrace([-5, -2, -9], 'bigger')).result).toBe(1);
    expect(last(reduceTrace([-5, -2, -9], 'bigger', -Infinity)).result).toBe(-2);
  });
});
