/* map, filter and reduce (foldl) from the week 1 README as step-by-step traces. */

export type Item = number | string;

export interface HofStep {
  kind: 'start' | 'apply' | 'keep' | 'drop' | 'ok';
  /** Index of the element being processed; -1 before, length after. */
  at: number;
  out: Item[];
  /** reduce only: accumulator and the expression it stands for. */
  acc?: Item;
  expr?: string;
  /** What happened to the current element, e.g. "square(3) = 9". */
  applied?: string;
  message: string;
  result?: Item[] | Item;
}

export const MAPS = {
  square: { label: 'square', show: 'x * x', fn: (x: number) => x * x },
  inc: { label: 'inc', show: 'x + 1', fn: (x: number) => x + 1 },
  twice: { label: 'twice', show: '2 * x', fn: (x: number) => 2 * x },
} as const;

export const FILTERS = {
  isEven: { label: 'isEven', show: 'x % 2 == 0', fn: (x: number) => x % 2 === 0 },
  isOdd: { label: 'isOdd', show: 'x % 2 != 0', fn: (x: number) => x % 2 !== 0 },
  big: { label: 'greaterThan2', show: 'x > 2', fn: (x: number) => x > 2 },
} as const;

export const REDUCES = {
  add: { label: '+', init: 0 as Item, fn: (a: Item, x: number): Item => (a as number) + x, expr: (e: string, x: number) => `(${e} + ${x})` },
  multiply: { label: '*', init: 1 as Item, fn: (a: Item, x: number): Item => (a as number) * x, expr: (e: string, x: number) => `(${e} * ${x})` },
  bigger: { label: 'bigger', init: 1 as Item, fn: (a: Item, x: number): Item => Math.max(a as number, x), expr: (e: string, x: number) => `bigger(${e}, ${x})` },
  append: { label: 'append', init: '' as Item, fn: (a: Item, x: number): Item => `${a}${x}`, expr: (e: string, x: number) => `(${e} + "${x}")` },
} as const;

const show = (x: Item) => (typeof x === 'string' ? `"${x}"` : String(x));

export function* mapTrace(arr: number[], id: keyof typeof MAPS): Generator<HofStep> {
  const { label, fn } = MAPS[id];
  const out: number[] = [];
  yield { kind: 'start', at: -1, out: [], message: `map прилага ${label} върху всеки елемент и пази резултатите в нов масив.` };
  for (let i = 0; i < arr.length; i++) {
    out.push(fn(arr[i]));
    yield { kind: 'apply', at: i, out: [...out], applied: `${label}(${arr[i]}) = ${out[i]}`, message: `${label}(${arr[i]}) = ${out[i]}: отива на позиция ${i} в новия масив.` };
  }
  yield { kind: 'ok', at: arr.length, out: [...out], result: [...out], message: `Готово: толкова елементи, колкото във входа, всеки преобразуван.` };
}

export function* filterTrace(arr: number[], id: keyof typeof FILTERS): Generator<HofStep> {
  const { label, fn } = FILTERS[id];
  const out: number[] = [];
  yield { kind: 'start', at: -1, out: [], message: `filter пита ${label} за всеки елемент и пази само тези, за които отговорът е true.` };
  for (let i = 0; i < arr.length; i++) {
    const keep = fn(arr[i]);
    if (keep) out.push(arr[i]);
    yield { kind: keep ? 'keep' : 'drop', at: i, out: [...out], applied: `${label}(${arr[i]}) = ${keep}`, message: keep ? `${label}(${arr[i]}) е true: ${arr[i]} остава.` : `${label}(${arr[i]}) е false: ${arr[i]} отпада.` };
  }
  yield { kind: 'ok', at: arr.length, out: [...out], result: [...out], message: `Готово: ${out.length} от ${arr.length} елемента минаха. Затова filter трябва да върне и новата големина.` };
}

export function* reduceTrace(arr: number[], id: keyof typeof REDUCES, init: Item = REDUCES[id].init): Generator<HofStep> {
  const { label, fn, expr } = REDUCES[id];
  let acc = init;
  let e = show(init);
  yield { kind: 'start', at: -1, out: [], acc, expr: e, message: `reduce започва от началната стойност ${show(init)} и я „свива“ с ${label}, елемент по елемент, отляво надясно.` };
  for (let i = 0; i < arr.length; i++) {
    const before = acc;
    acc = fn(acc, arr[i]);
    e = expr(e, arr[i]);
    yield { kind: 'apply', at: i, out: [], acc, expr: e, applied: `${label}(${show(before)}, ${arr[i]}) = ${show(acc)}`, message: `Акумулаторът ${show(before)} и елементът ${arr[i]} дават ${show(acc)}.` };
  }
  yield { kind: 'ok', at: arr.length, out: [], acc, expr: e, result: acc, message: `Готово: една стойност, ${show(acc)}.` };
}
