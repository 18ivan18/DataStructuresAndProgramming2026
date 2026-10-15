import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { DOUBLY, doublyOf, runDoublyOp, swapTrace, xorList, xorTraverse, type DoublyOp } from './doubly';
import { DOUBLY_LINKED_LIST_H } from './doublyLinkedListSource';
import { valuesFrom, type ListState } from './linked';
import { add, erase, readmeSkipList, search, type SkipState } from './skiplist';
import { collect } from './traces';
import cpp from './__fixtures__/cpp.json';

const HEADER = new URL('../../../week05/implementation/DoublyLinkedList/DoublyLinkedList.h', import.meta.url);

// Following previous pointers from last, back to front.
function backward(s: ListState): number[] {
  const byId = new Map(s.nodes.map((n) => [n.id, n]));
  const out: number[] = [];
  for (let id = s.last; id !== null; id = byId.get(id)!.prev ?? null) out.push(byId.get(id)!.val as number);
  return out;
}

describe('DoublyLinkedList sandbox matches DoublyLinkedList.h', () => {
  const toOp = ([k, a, b]: number[]): DoublyOp =>
    [{ op: 'pushFront', x: a }, { op: 'pushBack', x: a }, { op: 'insertAt', i: a, x: b }, { op: 'popFront' }, { op: 'popBack' }, { op: 'removeAt', i: a }, { op: 'at', i: a }, { op: 'front' }, { op: 'back' }, { op: 'find', x: a }][k] as DoublyOp;

  it('agrees on contents (both directions) and return value after each of 400 calls', () => {
    let s: ListState = doublyOf([]);
    cpp.doublyLinkedList.forEach((c, t) => {
      const r = runDoublyOp(s, toOp(c.op));
      s = r.after;
      expect([t, r.returned, valuesFrom(s.nodes, s.first)]).toEqual([t, c.returned, c.after]);
      expect([t, backward(s)]).toEqual([t, c.backward]);
      expect(s.n).toBe(c.after.length);
    });
  });

  it('walks from the closer end', () => {
    const s = doublyOf([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(runDoublyOp(s, { op: 'at', i: 1 }).steps.at(-1)!.hops).toBe(1);
    expect(runDoublyOp(s, { op: 'at', i: 6 }).steps.at(-1)!.hops).toBe(1);
    expect(runDoublyOp(s, { op: 'popBack' }).steps.at(-1)!.hops).toBe(0);
  });

  it('only points at real lines of the header', () => {
    let s = doublyOf([]);
    for (const c of cpp.doublyLinkedList) {
      const r = runDoublyOp(s, toOp(c.op));
      s = r.after;
      for (const st of r.steps) expect(st.line && DOUBLY.lines[st.line - 1]).toBeTruthy();
    }
  });

  it.skipIf(!existsSync(HEADER))('embeds the current header', () => {
    expect(DOUBLY_LINKED_LIST_H).toBe(readFileSync(HEADER, 'utf8'));
  });
});

describe('task 1: swapping nodes matches solutions/1.cpp', () => {
  it.each(cpp.swapNodes.map((c) => [c.n, c.i, c.j, c.after] as const))('n = %i, swap %i and %i', (n, i, j, after) => {
    const r = swapTrace(Array.from({ length: n }, (_, k) => k + 1), i, j);
    expect(r.forward).toEqual(after);
    expect(r.backward).toEqual(after); // the previous pointers agree with the next pointers
  });
});

describe('skip list matches solutions/4.cpp', () => {
  it('gives the same answer to every search and erase', () => {
    let s: SkipState = { towers: [], nextId: 1, seed: 5 };
    for (const [kind, v, r] of cpp.skiplist) {
      if (kind === 0) s = add(s, v).after;
      else if (kind === 1) expect(search(s, v).at(-1)!.result).toBe(r === 1);
      else {
        const e = erase(s, v);
        expect(e.found).toBe(r === 1);
        s = e.after;
      }
      // every level stays sorted, and is a sub-list of the one below
      const vals = s.towers.map((t) => t.val);
      expect(vals).toEqual([...vals].sort((a, b) => a - b));
    }
  });

  it('searches the README example in fewer comparisons than a linear scan', () => {
    const steps = search(readmeSkipList(), 80);
    expect(steps.at(-1)!.result).toBe(true);
    expect(steps.at(-1)!.comparisons).toBeLessThanOrEqual(7);
  });

  it('grows a new tower by coin flips, never above the top level', () => {
    let s = readmeSkipList();
    for (let i = 0; i < 30; i++) s = add(s, 100 + i).after;
    expect(Math.max(...s.towers.map((t) => t.height))).toBeLessThanOrEqual(4);
    expect(s.towers.filter((t) => t.val >= 100 && t.height > 1).length).toBeGreaterThan(5);
  });
});

describe('task 7: XOR list', () => {
  it('stores prev ^ next in every link and walks both ways from it', () => {
    const list = xorList([1, 2, 3, 4, 5]);
    expect(list[0].link).toBe(list[1].addr);
    expect(list[2].link).toBe(list[1].addr ^ list[3].addr);
    expect(collect(xorTraverse(list, false)).at(-1)!.visited).toEqual([0, 1, 2, 3, 4]);
    expect(collect(xorTraverse(list, true)).at(-1)!.visited).toEqual([4, 3, 2, 1, 0]);
  });
});
