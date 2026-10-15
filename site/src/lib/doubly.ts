/* Week 5: DoublyLinkedList.h one call at a time, task 1 (swapping two nodes) and task 7 (the XOR
   list). Built on the week 4 ListMachine; doubly.test.ts checks all of it against the compiled C++. */

import { codeIndex, ListMachine, type ListState, type ListStep, type LNode, type OpRun } from './linked';
import { DOUBLY_LINKED_LIST_H } from './doublyLinkedListSource';

export const DOUBLY = codeIndex(DOUBLY_LINKED_LIST_H);
export const DOUBLY_METHODS = ['pushFront', 'pushBack', 'insertAt', 'popFront', 'popBack', 'removeAt', 'at', 'front', 'back', 'find', 'nodeAt', 'removeNode'];

export type DoublyOp =
  | { op: 'pushFront' | 'pushBack' | 'find'; x: number }
  | { op: 'insertAt'; i: number; x: number }
  | { op: 'removeAt' | 'at'; i: number }
  | { op: 'popFront' | 'popBack' | 'front' | 'back' };

/** A doubly linked list built from values, as the state the sandbox starts from. */
export function doublyOf(values: number[]): ListState {
  const nodes: LNode[] = values.map((v, i) => ({ id: i + 1, val: v, next: i + 2 <= values.length ? i + 2 : null, prev: i ? i : null }));
  return { nodes, first: nodes.length ? 1 : null, last: nodes.length ? nodes.length : null, n: nodes.length };
}

export function runDoublyOp(state: ListState, o: DoublyOp): OpRun {
  const m = new ListMachine(state.nodes, [['first', state.first], ['last', state.last]]);
  const L = DOUBLY.lineIn;
  let n = state.n;
  let method: string = o.op;

  const done = (returned: string): OpRun => ({
    steps: m.steps,
    after: { nodes: [...m.nodes.values()].filter((x) => !x.freed), first: m.get('first'), last: m.get('last'), n },
    returned,
    method,
  });
  const fail = (msg: string, line: number): OpRun => {
    m.snap('error', msg, line);
    return { steps: m.steps, after: state, returned: msg.split(':')[0], method };
  };

  // nodeAt walks from whichever end is closer: that is what the previous pointers buy.
  const nodeAt = (index: number, into: string, caller: string) => {
    const fromFront = index < Math.floor(n / 2);
    m.snap('move', `nodeAt(${index}): ${index} ${fromFront ? '<' : '≥'} n / 2 = ${Math.floor(n / 2)}, затова тръгваме от ${fromFront ? 'началото' : 'края'}.`, L('nodeAt', 'if (index < n / 2)'));
    if (fromFront) {
      m.set('iter', m.get('first'));
      m.snap('move', 'iter = first.', L('nodeAt', 'Node *iter = first;'));
      for (let k = 0; k < index; k++) {
        m.advance('iter');
        m.snap('move', `iter = iter->next (${k + 1} от ${index}).`, L('nodeAt', 'iter = iter->next;'));
      }
    } else {
      m.set('iter', m.get('last'));
      m.snap('move', 'iter = last.', L('nodeAt', 'Node *iter = last;'));
      for (let k = n - 1; k > index; k--) {
        m.set('iter', m.node(m.get('iter')!).prev ?? null);
        m.hops++;
        m.snap('move', `iter = iter->previous (${n - k} от ${n - 1 - index}): назад, отзад напред.`, L('nodeAt', 'iter = iter->previous;'));
      }
    }
    const at = m.get('iter');
    m.drop('iter');
    m.set(into, at);
    m.snap('keep', `nodeAt връща възела на индекс ${index}: ${into} сочи към него.`, L(caller, 'nodeAt('));
  };

  // removeNode: the one place that unlinks a node; popFront, popBack and removeAt all call it.
  const removeNode = (name: string, caller: string): string => {
    m.snap('move', `${caller} вика removeNode(${name}).`, L(caller, 'removeNode('));
    method = 'removeNode';
    const id = m.get(name)!;
    m.set('node', id);
    if (name !== 'node') m.drop(name);
    const node = m.node(id);
    const item = String(node.val);
    if (node.prev != null) {
      m.setNext(node.prev, node.next);
      m.snap('apply', 'node->previous->next = node->next: предишният прескача възела.', L('removeNode', 'node->previous->next = node->next;'));
    } else {
      m.set('first', node.next);
      m.snap('apply', 'Няма предишен, значи е първият: first = node->next.', L('removeNode', 'first = node->next;'));
    }
    if (node.next != null) {
      m.setPrev(node.next, node.prev ?? null);
      m.snap('apply', 'node->next->previous = node->previous: следващият също го прескача, назад.', L('removeNode', 'node->next->previous = node->previous;'));
    } else {
      m.set('last', node.prev ?? null);
      m.snap('apply', 'Няма следващ, значи е последният: last = node->previous.', L('removeNode', 'last = node->previous;'));
    }
    m.free(id);
    m.drop('node');
    n--;
    m.snap('drop', `delete node, n-- → ${n}.`, L('removeNode', 'delete node;'));
    m.snap('ok', `Връща ${item}. Без обхождане: O(1), стига да имаме указател към възела.`, L('removeNode', 'return item;'));
    return item;
  };

  const pushFront = (x: number) => {
    method = 'pushFront';
    const node = m.create(x);
    m.node(node).prev = null;
    m.set('node', node);
    m.snap('push', `new Node(${x}): next и previous са nullptr.`, L('pushFront', 'new Node(el)'));
    if (n === 0) {
      m.set('first', node); m.set('last', node);
      m.snap('apply', 'Празен списък: first = last = node.', L('pushFront', 'first = last = node;'));
    } else {
      m.setNext(node, m.get('first'));
      m.snap('apply', 'node->next = first.', L('pushFront', 'node->next = first;'));
      m.setPrev(m.get('first')!, node);
      m.snap('apply', 'first->previous = node: и обратната връзка.', L('pushFront', 'first->previous = node;'));
      m.set('first', node);
      m.snap('apply', 'first = node.', L('pushFront', 'first = node;'));
    }
    m.drop('node');
    n++;
    m.snap('ok', `n++ → ${n}. O(1).`, L('pushFront', 'n++;'));
  };
  const pushBack = (x: number) => {
    method = 'pushBack';
    const node = m.create(x);
    m.node(node).prev = null;
    m.set('node', node);
    m.snap('push', `new Node(${x}).`, L('pushBack', 'new Node(el)'));
    if (n === 0) {
      m.set('first', node); m.set('last', node);
      m.snap('apply', 'Празен списък: first = last = node.', L('pushBack', 'first = last = node;'));
    } else {
      m.setPrev(node, m.get('last'));
      m.snap('apply', 'node->previous = last.', L('pushBack', 'node->previous = last;'));
      m.setNext(m.get('last')!, node);
      m.snap('apply', 'last->next = node.', L('pushBack', 'last->next = node;'));
      m.set('last', node);
      m.snap('apply', 'last = node.', L('pushBack', 'last = node;', 2));
    }
    m.drop('node');
    n++;
    m.snap('ok', `n++ → ${n}. O(1).`, L('pushBack', 'n++;'));
  };

  const range = DOUBLY.methodRange;
  switch (o.op) {
    case 'pushFront':
      m.snap('start', `pushFront(${o.x})`, range('pushFront')[0]);
      pushFront(o.x);
      return done('void');
    case 'pushBack':
      m.snap('start', `pushBack(${o.x})`, range('pushBack')[0]);
      pushBack(o.x);
      return done('void');
    case 'insertAt': {
      m.snap('start', `insertAt(${o.i}, ${o.x})`, range('insertAt')[0]);
      if (o.i < 0 || o.i > n) return fail(`out_of_range: индекс ${o.i} е извън [0, ${n}].`, L('insertAt', 'throw'));
      if (o.i === 0) { pushFront(o.x); return done('void'); }
      if (o.i === n) { pushBack(o.x); return done('void'); }
      nodeAt(o.i, 'current', 'insertAt');
      method = 'insertAt';
      const cur = m.get('current')!;
      const node = m.create(o.x);
      m.node(node).prev = null;
      m.set('node', node);
      m.snap('push', `new Node(${o.x}): ще влезе точно преди current.`, L('insertAt', 'new Node(el)'));
      m.setPrev(node, m.node(cur).prev ?? null);
      m.snap('apply', 'node->previous = current->previous.', L('insertAt', 'node->previous = current->previous;'));
      m.setNext(node, cur);
      m.snap('apply', 'node->next = current. Новият вече знае и двамата си съседи, а те още не знаят за него.', L('insertAt', 'node->next = current;'));
      m.setNext(m.node(cur).prev!, node);
      m.snap('apply', 'current->previous->next = node: предишният сочи напред към новия.', L('insertAt', 'current->previous->next = node;'));
      m.setPrev(cur, node);
      m.snap('apply', 'current->previous = node: и current сочи назад към него. Ако тези два реда се разменят, current->previous вече ще е новият възел.', L('insertAt', 'current->previous = node;'));
      m.drop('node'); m.drop('current');
      n++;
      m.snap('ok', `n++ → ${n}. Четири указателя вместо два.`, L('insertAt', 'n++;'));
      return done('void');
    }
    case 'popFront':
    case 'popBack': {
      m.snap('start', `${o.op}()`, range(o.op)[0]);
      if (n === 0) return fail('length_error: списъкът е празен.', L(o.op, 'throw'));
      m.set('node', m.get(o.op === 'popFront' ? 'first' : 'last'));
      return done(removeNode('node', o.op));
    }
    case 'removeAt': {
      m.snap('start', `removeAt(${o.i})`, range('removeAt')[0]);
      if (o.i < 0 || o.i >= n) return fail(`out_of_range: индекс ${o.i} е извън [0, ${n - 1}].`, L('removeAt', 'throw'));
      nodeAt(o.i, 'node', 'removeAt');
      return done(removeNode('node', 'removeAt'));
    }
    case 'at': {
      m.snap('start', `at(${o.i})`, range('at')[0]);
      if (o.i < 0 || o.i >= n) return fail(`out_of_range: индекс ${o.i} е извън [0, ${n - 1}].`, L('at', 'throw'));
      nodeAt(o.i, 'node', 'at');
      const v = String(m.node(m.get('node')!).val);
      m.drop('node');
      m.snap('ok', `Връща ${v} след ${m.hops} стъпки по указатели.`, L('at', 'return nodeAt(index)->data;'));
      method = 'at';
      return done(v);
    }
    case 'front':
    case 'back': {
      m.snap('start', `${o.op}()`, range(o.op)[0]);
      if (n === 0) return fail('length_error: списъкът е празен.', L(o.op, 'throw'));
      const v = String(m.node(m.get(o.op === 'front' ? 'first' : 'last')!).val);
      m.snap('ok', `Връща ${v}. O(1).`, L(o.op, o.op === 'front' ? 'return first->data;' : 'return last->data;'));
      return done(v);
    }
    case 'find': {
      m.snap('start', `find(${o.x})`, range('find')[0]);
      m.set('iter', m.get('first'));
      m.snap('move', 'iter = first, index = 0.', L('find', 'Node *iter = first;'));
      let index = 0;
      while (m.get('iter') !== null) {
        if (m.node(m.get('iter')!).val === o.x) {
          m.drop('iter');
          m.snap('ok', `Намерен на индекс ${index}.`, L('find', 'return index;'));
          return done(String(index));
        }
        m.advance('iter');
        index++;
        m.snap('move', `Не е ${o.x}: iter = iter->next, index = ${index}.`, L('find', 'iter = iter->next;'));
      }
      m.drop('iter');
      m.snap('ok', 'Стигнахме nullptr: няма го, връща -1.', L('find', 'return -1;'));
      return done('-1');
    }
  }
}

/* ---------- task 1: swap two nodes by relinking (swapNodes in solutions/1.cpp) ---------- */

export interface SwapRun {
  steps: ListStep[];
  /** Values front to back and back to front after the swap. */
  forward: number[];
  backward: number[];
}

export function swapTrace(values: number[], i: number, j: number): SwapRun {
  const st = doublyOf(values);
  const m = new ListMachine(st.nodes, [['head', st.first]]);
  const A = i + 1, B = j + 1; // node ids are positions + 1
  m.set('first', A);
  m.set('second', B);
  m.snap('start', `Разменяме възлите ${values[i]} и ${values[j]} само чрез указатели. Стойностите не се пипат.`);
  if (A === B) {
    m.snap('ok', 'Един и същ възел: няма какво да се прави.');
    return finish();
  }
  const fp = m.node(A).prev ?? null, fn = m.node(A).next, sp = m.node(B).prev ?? null, sn = m.node(B).next;
  m.set('firstPrevious', fp); m.set('firstNext', fn); m.set('secondPrevious', sp); m.set('secondNext', sn);
  m.snap('move', 'Запомняме четирите съседа, преди да пипнем каквото и да е.');

  if (fn === B) {
    m.setPrev(B, fp); m.setNext(B, A); m.setPrev(A, B); m.setNext(A, sn);
    m.snap('apply', 'Съседни са (first е точно преди second): second застава отпред, first отзад, и си сочат един друг.');
  } else if (sn === A) {
    m.setPrev(A, sp); m.setNext(A, B); m.setPrev(B, A); m.setNext(B, fn);
    m.snap('apply', 'Съседни са (second е точно преди first): същото, огледално.');
  } else {
    m.setPrev(A, sp); m.setNext(A, sn); m.setPrev(B, fp); m.setNext(B, fn);
    m.snap('apply', 'Не са съседни: всеки взема запомнените съседи на другия.');
  }
  for (const [who, label] of [[A, 'first'], [B, 'second']] as const) {
    const p = m.node(who).prev ?? null, q = m.node(who).next;
    if (p !== null) { m.setNext(p, who); m.snap('apply', `${label}->previous->next = ${label}: съседът отляво го сочи напред.`); }
    if (q !== null) { m.setPrev(q, who); m.snap('apply', `${label}->next->previous = ${label}: съседът отдясно го сочи назад.`); }
  }
  if (m.get('head') === A) { m.set('head', B); m.snap('apply', 'first беше началото, затова head = second.'); }
  else if (m.get('head') === B) { m.set('head', A); m.snap('apply', 'second беше началото, затова head = first.'); }
  for (const v of ['firstPrevious', 'firstNext', 'secondPrevious', 'secondNext']) m.drop(v);
  const r = finish();
  m.snap('ok', `Готово: напред [${r.forward.join(', ')}], назад [${r.backward.join(', ')}].`);
  return { ...r, steps: m.steps };

  function finish(): SwapRun {
    const fw: number[] = [];
    let tail: number | null = null;
    for (let id = m.get('head'); id !== null; id = m.node(id).next) { fw.push(m.node(id).val as number); tail = id; }
    const bw: number[] = [];
    for (let id = tail; id !== null; id = m.node(id).prev ?? null) bw.push(m.node(id).val as number);
    return { steps: m.steps, forward: fw, backward: bw.reverse() };
  }
}

/* ---------- task 7: the XOR linked list ---------- */

export interface XorNode {
  val: number;
  addr: number;
  /** addr(prev) ^ addr(next), with nullptr = 0. */
  link: number;
}

export interface XorStep {
  kind: 'start' | 'move' | 'ok';
  message: string;
  prev: number;
  curr: number;
  /** Index of the current node, or -1 once we are past the end. */
  at: number;
  /** The XOR just computed, to show bit by bit. */
  calc?: { a: number; b: number; result: number };
  visited: number[];
}

// Small, distinct 8-bit addresses keep the binary readable; real ones are 48-bit but XOR the same way.
const ADDRS = [0x14, 0x3c, 0x58, 0x6a, 0x93, 0xa5, 0xc1, 0xde];

export function xorList(values: number[]): XorNode[] {
  const addrs = values.map((_, i) => ADDRS[i % ADDRS.length]);
  return values.map((val, i) => ({ val, addr: addrs[i], link: (i ? addrs[i - 1] : 0) ^ (i + 1 < values.length ? addrs[i + 1] : 0) }));
}

export function* xorTraverse(list: XorNode[], backwards: boolean): Generator<XorStep> {
  const byAddr = new Map(list.map((x, i) => [x.addr, i]));
  let prev = 0, curr = list.length ? list[backwards ? list.length - 1 : 0].addr : 0;
  const visited: number[] = [];
  yield { kind: 'start', prev, curr, at: byAddr.get(curr) ?? -1, visited: [], message: `Тръгваме от ${backwards ? 'края' : 'началото'}: prev = nullptr (0), curr = ${hex(curr)}.` };
  while (curr !== 0) {
    const i = byAddr.get(curr)!;
    visited.push(i);
    const next = prev ^ list[i].link;
    yield { kind: 'move', prev, curr, at: i, visited: [...visited], calc: { a: prev, b: list[i].link, result: next }, message: `При ${list[i].val}: next = prev ^ curr->link = ${hex(prev)} ^ ${hex(list[i].link)} = ${next ? hex(next) : 'nullptr'}.` };
    prev = curr;
    curr = next;
  }
  yield { kind: 'ok', prev, curr, at: -1, visited: [...visited], message: `curr е nullptr: обходихме ${visited.map((k) => list[k].val).join(' → ')}. Същият link работи и в двете посоки.` };
}

export const hex = (a: number) => (a === 0 ? '0x00' : `0x${a.toString(16).padStart(2, '0')}`);
export const bin = (a: number) => a.toString(2).padStart(8, '0');
