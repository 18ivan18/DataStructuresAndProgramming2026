/* ArrayStack.h as a pure function: same initial capacity, same doubling on push, same
   "halve when a quarter full" on pop. stack.test.ts checks it against the compiled C++.
   The shrink rule is a parameter so the page can show what goes wrong with the obvious one. */

export const INIT_CAPACITY = 8;

/** When pop shrinks the array. 'quarter' is the rule in ArrayStack.h. */
export type ShrinkRule = 'quarter' | 'half' | 'never';

export interface ArrayStackState {
  /** The n elements on the stack, bottom first. */
  items: number[];
  capacity: number;
}

export type StackOp = { kind: 'push'; value: number } | { kind: 'pop' };

export interface OpResult {
  state: ArrayStackState;
  /** Work done: 1 for the push or pop itself, plus 1 for every element a resize copies. */
  cost: number;
  resize: { from: number; to: number; copied: number } | null;
  popped: number | null;
}

export const emptyStack = (): ArrayStackState => ({ items: [], capacity: INIT_CAPACITY });

function shouldShrink(n: number, capacity: number, rule: ShrinkRule) {
  // C++ integer division; `n > 0` as in the header, so an empty stack keeps its array.
  if (rule === 'never' || n === 0) return false;
  return n === Math.floor(capacity / (rule === 'quarter' ? 4 : 2));
}

export function applyOp(state: ArrayStackState, op: StackOp, rule: ShrinkRule = 'quarter'): OpResult {
  const items = [...state.items];
  let { capacity } = state;

  if (op.kind === 'push') {
    let resize: OpResult['resize'] = null;
    if (items.length >= capacity) {
      resize = { from: capacity, to: capacity * 2, copied: items.length };
      capacity *= 2;
    }
    items.push(op.value);
    return { state: { items, capacity }, cost: 1 + (resize?.copied ?? 0), resize, popped: null };
  }

  if (items.length === 0) throw new Error('Empty ArrayStack!');
  const popped = items.pop()!;
  let resize: OpResult['resize'] = null;
  if (shouldShrink(items.length, capacity, rule)) {
    resize = { from: capacity, to: Math.floor(capacity / 2), copied: items.length };
    capacity = resize.to;
  }
  return { state: { items, capacity }, cost: 1 + (resize?.copied ?? 0), resize, popped };
}

/** Runs a whole sequence, keeping every intermediate result (for charts and tests). */
export function runOps(ops: StackOp[], rule: ShrinkRule = 'quarter', start = emptyStack()): OpResult[] {
  const results: OpResult[] = [];
  let state = start;
  for (const op of ops) {
    const r = applyOp(state, op, rule);
    results.push(r);
    state = r.state;
  }
  return results;
}
