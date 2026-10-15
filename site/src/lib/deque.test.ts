import { describe, expect, it } from 'vitest';
import { dequeTrace, linkedDequeTrace, parseDequeScript, type DequeOp, type LinkedDequeStep } from './deque';
import { collect } from './traces';
import cpp from './__fixtures__/cpp.json';

const toOp = ([kind, x]: number[]): DequeOp =>
  kind === 0 ? { op: 'insertFront', x } : kind === 1 ? { op: 'insertLast', x } : { op: (['deleteFront', 'deleteLast', 'getFront', 'getRear', 'isEmpty', 'isFull'] as const)[kind - 2] };

describe('task 2: circular deque matches solutions/2.cpp', () => {
  it.each(cpp.circularDeque.map((c, i) => [i, c] as const))('case %i', (_, c) => {
    const steps = collect(dequeTrace(c.k, c.ops.map(toOp))).slice(1); // one step per call
    expect(steps).toHaveLength(c.ops.length);
    steps.forEach((s, q) => {
      const [, , r, first, n] = c.ops[q];
      const returned = s.returned === true ? 1 : s.returned === false ? 0 : s.returned;
      expect([q, returned, s.first, s.n]).toEqual([q, r, first, n]);
    });
  });

  it('runs the README example', () => {
    const ops = parseDequeScript('insertLast(1), insertLast(2), insertFront(3), insertFront(4), getRear, isFull, deleteLast, insertFront(4), getFront');
    expect(ops).toHaveLength(9);
    expect(collect(dequeTrace(3, ops)).slice(1).map((s) => s.returned)).toEqual([true, true, true, false, 2, true, true, true, 4]);
  });
});

describe('task 2: the same deque as a circular doubly linked list', () => {
  // Front to back, by following next from head; checks the circle closes and prev agrees.
  function walk(s: LinkedDequeStep, n: number): { ids: number[]; vals: number[] } {
    const byId = new Map(s.nodes.map((x) => [x.id, x]));
    const head = s.vars.find(([v]) => v === 'head')![1];
    const ids: number[] = [];
    for (let id = head, i = 0; i < n; i++) {
      ids.push(id!);
      const node = byId.get(id!)!;
      expect(byId.get(node.next!)!.prev).toBe(id); // next and prev agree
      id = node.next;
    }
    if (n) expect(byId.get(ids[n - 1])!.next).toBe(head); // the circle closes
    else expect(head).toBeNull();
    return { ids, vals: ids.map((id) => byId.get(id)!.val as number) };
  }

  it.each(cpp.circularDeque.map((c, i) => [i, c] as const))('case %i: same answers, same order, same places as the array', (_, c) => {
    const ops = c.ops.map(toOp);
    const linked = linkedDequeTrace(c.k, ops).filter((s) => s.final).slice(1);
    const array = collect(dequeTrace(c.k, ops)).slice(1);
    expect(linked).toHaveLength(c.ops.length);
    linked.forEach((s, q) => {
      const returned = s.returned === true ? 1 : s.returned === false ? 0 : s.returned;
      expect([q, returned]).toEqual([q, c.ops[q][2]]);
      const a = array[q];
      const { ids, vals } = walk(s, a.n);
      expect(vals).toEqual(Array.from({ length: a.n }, (_, i) => a.cells[(a.first + i) % c.k]));
      expect(ids.map((id) => s.slots[id])).toEqual(Array.from({ length: a.n }, (_, i) => (a.first + i) % c.k));
    });
  });
});
