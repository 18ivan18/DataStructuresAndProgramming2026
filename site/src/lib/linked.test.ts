import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { cycleTrace, deleteNodeTrace, emptyList, HEADER_LINES, lineIn, listValues, methodRange, removeNthTrace, reverseTrace, runOp, valuesFrom, type ListOp, type ListState } from './linked';
import { SINGLY_LINKED_LIST_H } from './singlyLinkedListSource';
import cpp from './__fixtures__/cpp.json';

const HEADER = new URL('../../../week04/implementation/SinglyLinkedList/SinglyLinkedList.h', import.meta.url);

describe('SinglyLinkedList sandbox matches SinglyLinkedList.h', () => {
  const toOp = ([k, a, b]: number[]): ListOp =>
    [{ op: 'pushFront', x: a }, { op: 'pushBack', x: a }, { op: 'insertAt', i: a, x: b }, { op: 'popFront' }, { op: 'removeAt', i: a }, { op: 'removeAll', x: a }, { op: 'at', i: a }, { op: 'find', x: a }][k] as ListOp;

  it('agrees on contents and return value after each of 400 calls', () => {
    let s: ListState = emptyList();
    cpp.singlyLinkedList.forEach((c, t) => {
      const r = runOp(s, toOp(c.op));
      s = r.after;
      expect([t, r.returned, listValues(s)]).toEqual([t, c.returned, c.after]);
      expect(s.n).toBe(c.after.length);
      // last really is the last node
      expect(s.last === null ? null : s.nodes.find((x) => x.id === s.last)!.next).toBe(null);
      expect(valuesFrom(s.nodes, s.last).length).toBe(s.n ? 1 : 0);
    });
  });

  it('only points at lines that exist, inside the method being run', () => {
    let s: ListState = emptyList();
    for (const c of cpp.singlyLinkedList) {
      const r = runOp(s, toOp(c.op));
      s = r.after;
      for (const st of r.steps) expect(st.line && HEADER_LINES[st.line - 1]).toBeTruthy();
    }
  });

  it('throws like the header on bad input and leaves the list alone', () => {
    const s = runOp(emptyList(), { op: 'pushBack', x: 1 }).after;
    for (const o of [{ op: 'removeAt', i: 1 }, { op: 'insertAt', i: 3, x: 0 }, { op: 'at', i: -1 }] as ListOp[]) {
      const r = runOp(s, o);
      expect(r.returned).toBe('out_of_range');
      expect(listValues(r.after)).toEqual([1]);
    }
    expect(runOp(emptyList(), { op: 'popFront' }).returned).toBe('length_error');
  });

  it('counts the walk: at(i) costs i hops, pushBack none', () => {
    let s = emptyList();
    for (let i = 1; i <= 6; i++) s = runOp(s, { op: 'pushBack', x: i }).after;
    expect(runOp(s, { op: 'at', i: 4 }).steps.at(-1)!.hops).toBe(4);
    expect(runOp(s, { op: 'pushBack', x: 7 }).steps.at(-1)!.hops).toBe(0);
  });

  it.skipIf(!existsSync(HEADER))('embeds the current header', () => {
    expect(SINGLY_LINKED_LIST_H).toBe(readFileSync(HEADER, 'utf8'));
    expect(lineIn('insertAt', 'previous->next = node;')).toBeGreaterThan(methodRange('insertAt')[0]);
  });
});

describe('week 4 task traces match the solutions', () => {
  for (const [i, c] of cpp.week4.entries()) {
    it(`case ${i}: [${c.values.join(', ')}]`, () => {
      const rev = reverseTrace(c.values).at(-1)!;
      const prev = rev.vars.find(([n]) => n === 'prev')![1];
      expect(valuesFrom(rev.nodes, prev)).toEqual(c.reversed);

      expect(cycleTrace(c.values, c.pos).start).toBe(c.cycleStart);

      if (c.values.length >= 2) {
        const del = deleteNodeTrace(c.values, c.del).at(-1)!;
        const head = del.vars.find(([n]) => n === 'head')![1];
        expect(valuesFrom(del.nodes, head)).toEqual(c.afterDelete);
      }

      const rem = removeNthTrace(c.values, c.nth).at(-1)!;
      const dummy = rem.vars.find(([n]) => n === 'dummy')![1]!;
      expect(valuesFrom(rem.nodes, dummy).slice(1)).toEqual(c.afterRemoveNth);
    });
  }

  it('reverses in place: every next pointer is changed exactly once', () => {
    const steps = reverseTrace([1, 2, 3, 4, 5]);
    expect(steps.flatMap((s) => s.changed).sort()).toEqual([1, 2, 3, 4, 5]);
  });
});
