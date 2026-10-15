import { describe, expect, it } from 'vitest';
import { bridgeTrace, dequeue, emptyRing, enqueue, isLive, mazeTrace, README_MAZE, ringItems, twoStacksTrace, windowTrace, type QueueOp, type RingState } from './queue';
import { collect } from './traces';
import cpp from './__fixtures__/cpp.json';

describe('ring buffer matches ArrayQueue.h', () => {
  it('has the same n, capacity, first and dequeued value after every one of 400 operations', () => {
    let s: RingState = emptyRing();
    const got = cpp.arrayQueue.ops.map((op) => {
      const r = op > 0 ? enqueue(s, op) : dequeue(s);
      s = r.state;
      return [s.n, s.cells.length, s.first, op > 0 ? -1 : r.value];
    });
    expect(got).toEqual(cpp.arrayQueue.after);
  });

  it('is FIFO and wraps around instead of moving elements', () => {
    let s = emptyRing();
    for (let i = 1; i <= 6; i++) s = enqueue(s, i).state;
    for (let i = 0; i < 3; i++) s = dequeue(s).state; // 3 left: above capacity / 4, so no shrink
    const r = enqueue(enqueue(enqueue(s, 7).state, 8).state, 9); // indices 6, 7, then 9 wraps to 0
    expect(r.index).toBe(0);
    expect(r.state.cells.length).toBe(8);
    expect(ringItems(r.state)).toEqual([4, 5, 6, 7, 8, 9]);
    expect(isLive(r.state, 0)).toBe(true);
    expect(isLive(r.state, 1)).toBe(false);
  });

  it('unrolls the ring to the front of the new array when it grows', () => {
    let s = emptyRing();
    for (let i = 1; i <= 8; i++) s = enqueue(s, i).state;
    for (let i = 0; i < 3; i++) s = dequeue(s).state;
    for (let i = 9; i <= 11; i++) s = enqueue(s, i).state; // full again, wrapped
    const r = enqueue(s, 12);
    expect(r.resize).toEqual({ from: 8, to: 16 });
    expect(r.state.first).toBe(0);
    expect(r.state.cells.slice(0, 9)).toEqual([4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });
});

describe('task 2: queue with two stacks matches solutions/2.cpp', () => {
  it('returns the same values for the same calls', () => {
    const ops: QueueOp[] = cpp.myQueue.map(([o]) => (o > 0 ? { op: 'push', x: o } : o === 0 ? { op: 'pop' } : o === -1 ? { op: 'peek' } : { op: 'empty' }));
    const steps = collect(twoStacksTrace(ops));
    const returned = ops.map((_, at) => {
      const last = steps.filter((s) => s.at === at).at(-1)!;
      return last.returned === undefined ? -100 : last.returned === true ? 1 : last.returned === false ? 0 : last.returned;
    });
    expect(returned).toEqual(cpp.myQueue.map(([, r]) => r));
  });

  it('always pops the front of the real queue, even in the middle of a transfer', () => {
    const ops: QueueOp[] = [{ op: 'push', x: 1 }, { op: 'push', x: 2 }, { op: 'push', x: 3 }, { op: 'pop' }, { op: 'push', x: 4 }, { op: 'pop' }, { op: 'pop' }, { op: 'pop' }];
    const steps = collect(twoStacksTrace(ops));
    for (const s of steps) if (s.kind === 'pop') expect(s.returned).toBe(steps[steps.indexOf(s) - 1].queue[0]);
    // outside a transfer the stacks spell the queue: s2 from the top down, then s1 from the bottom up
    for (const s of steps.filter((x) => x.kind !== 'move' && x.kind !== 'apply')) expect([...[...s.s2].reverse(), ...s.s1]).toEqual(s.queue);
  });

  it('moves every element from s1 to s2 at most once: amortised O(1)', () => {
    const n = 50;
    const ops: QueueOp[] = [...Array.from({ length: n }, (_, i) => ({ op: 'push' as const, x: i })), ...Array.from({ length: n }, () => ({ op: 'pop' as const }))];
    const steps = collect(twoStacksTrace(ops));
    expect(steps.filter((s) => s.kind === 'move')).toHaveLength(n);
    expect(steps.at(-1)!.work).toBe(4 * n); // push + (pop + push) per move + pop
  });
});

describe('task 6: sliding window maximum matches solutions/6.cpp', () => {
  it('on the README example', () => {
    expect(collect(windowTrace([1, 3, -1, -3, 5, 3, 6, 7], 3)).at(-1)!.out).toEqual([3, 3, 5, 5, 6, 7]);
  });
  it.each(cpp.window.map((c, i) => [i, c] as const))('random case %i', (_, c) => {
    expect(collect(windowTrace(c.nums, c.k)).at(-1)!.out).toEqual(c.out);
  });
});

describe('task 7: BFS in a maze matches solutions/7.cpp', () => {
  it('finds 12 on the README maze, along a path of 13 cells', () => {
    const last = collect(mazeTrace(README_MAZE, [0, 0], [7, 5])).at(-1)!;
    expect(last.result).toBe(12);
    expect(last.path).toHaveLength(13);
    // every step of the path is one move onto a free cell
    last.path!.slice(1).forEach(([r, c], i) => {
      const [pr, pc] = last.path![i];
      expect(Math.abs(r - pr) + Math.abs(c - pc)).toBe(1);
      expect(README_MAZE[r][c]).toBe(1);
    });
  });
  it.each(cpp.maze.map((m, i) => [i, m] as const))('random maze %i', (_, m) => {
    expect(collect(mazeTrace(m.grid, [0, 0], [7, 7])).at(-1)!.result).toBe(m.dist);
  });
});

describe('task 8: the battle on the bridge matches solutions/8.cpp', () => {
  it('on the README example', () => {
    expect(collect(bridgeTrace([-1, -2, 4, 5, 6, -3, -6, -7, -8, 2, 3])).at(-1)!.result).toEqual([-1, -2, -7, -8, 2, 3]);
  });
  it.each(cpp.bridge.map((c, i) => [i, c] as const))('random case %i', (_, c) => {
    expect(collect(bridgeTrace(c.input)).at(-1)!.result).toEqual(c.output);
  });
  it('pairs the top of the stack with the front of the queue in every duel', () => {
    for (const s of collect(bridgeTrace([3, 5, 1, -2, -4, -6, 2, -2]))) {
      if (!s.duel) continue;
      expect(s.duel[0]).toBeLessThan(s.duel[1]);
    }
  });
});
