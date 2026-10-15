/* Week 4: linked lists as pointer diagrams. A ListMachine holds nodes and named pointer variables
   and records a snapshot after every pointer change. The sandbox runs SinglyLinkedList.h's methods
   line by line; the task traces follow week04/solutions. linked.test.ts checks both against the
   compiled C++. */

import { SINGLY_LINKED_LIST_H } from './singlyLinkedListSource';

export interface LNode {
  id: number;
  /** Shown in the box; 'd' marks a dummy head. */
  val: number | 'd';
  next: number | null;
  /** Doubly linked lists only: the previous node (absent for singly linked nodes). */
  prev?: number | null;
  freed?: boolean;
}

export interface ListStep {
  kind: 'start' | 'push' | 'pop' | 'move' | 'apply' | 'keep' | 'drop' | 'ok' | 'error';
  message: string;
  nodes: LNode[];
  /** Pointer variables, in display order. null = nullptr; absent = out of scope. */
  vars: [name: string, target: number | null][];
  /** Line of the shown source (1-based), if any. */
  line?: number;
  /** Nodes whose next pointer changed at this step. */
  changed: number[];
  /** Nodes whose previous pointer changed at this step (doubly linked lists). */
  prevChanged?: number[];
  /** Nodes whose value changed at this step. */
  valueChanged: number[];
  /** Pointer hops so far (iter = iter->next and the like). */
  hops: number;
  result?: string;
}

export class ListMachine {
  nodes = new Map<number, LNode>();
  vars = new Map<string, number | null>();
  steps: ListStep[] = [];
  hops = 0;
  private nextId: number;
  private changed: number[] = [];
  private prevChanged: number[] = [];
  private valueChanged: number[] = [];

  constructor(nodes: LNode[] = [], vars: [string, number | null][] = [], nextId = 1) {
    nodes.forEach((n) => this.nodes.set(n.id, { ...n }));
    vars.forEach(([k, v]) => this.vars.set(k, v));
    this.nextId = Math.max(nextId, ...nodes.map((n) => n.id + 1), 1);
  }

  create(val: number | 'd'): number {
    const id = this.nextId++;
    this.nodes.set(id, { id, val, next: null });
    return id;
  }
  node(id: number) {
    const n = this.nodes.get(id);
    if (!n || n.freed) throw new Error(`no live node ${id}`);
    return n;
  }
  get(name: string): number | null {
    if (!this.vars.has(name)) throw new Error(`no variable ${name}`);
    return this.vars.get(name)!;
  }
  set(name: string, target: number | null) {
    this.vars.set(name, target);
  }
  drop(name: string) {
    this.vars.delete(name);
  }
  /** name = name->next, counted as one hop. */
  advance(name: string) {
    this.set(name, this.node(this.get(name)!).next);
    this.hops++;
  }
  setNext(id: number, target: number | null) {
    this.node(id).next = target;
    this.changed.push(id);
  }
  setPrev(id: number, target: number | null) {
    this.node(id).prev = target;
    this.prevChanged.push(id);
  }
  setVal(id: number, val: number) {
    this.node(id).val = val;
    this.valueChanged.push(id);
  }
  free(id: number) {
    this.node(id).freed = true;
  }
  snap(kind: ListStep['kind'], message: string, line?: number, result?: string) {
    this.steps.push({
      kind,
      message,
      line,
      result,
      nodes: [...this.nodes.values()].map((n) => ({ ...n })),
      vars: [...this.vars.entries()],
      changed: this.changed,
      prevChanged: this.prevChanged,
      valueChanged: this.valueChanged,
      hops: this.hops,
    });
    this.changed = [];
    this.prevChanged = [];
    this.valueChanged = [];
  }
}

/** Values reached by following next from `start` (stops on a cycle). */
export function valuesFrom(nodes: LNode[], start: number | null): (number | 'd')[] {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const out: (number | 'd')[] = [];
  const seen = new Set<number>();
  for (let id = start; id !== null && !seen.has(id); id = byId.get(id)!.next) {
    seen.add(id);
    out.push(byId.get(id)!.val);
  }
  return out;
}

/** Builds a fresh list in a machine, returning the node ids in order. */
function build(m: ListMachine, values: number[]): number[] {
  const ids = values.map((v) => m.create(v));
  ids.forEach((id, i) => (m.node(id).next = ids[i + 1] ?? null));
  return ids;
}

/* ---------- SinglyLinkedList.h, one method call at a time ---------- */

export interface CodeIndex {
  lines: string[];
  /** 1-based line range of a method (from its `template` line to its closing brace). */
  methodRange: (name: string) => [from: number, to: number];
  /** 1-based number of the nth line in method `name` containing `text`. */
  lineIn: (name: string, text: string, nth?: number) => number;
  /** The method whose range contains a line, among `names`. */
  methodAt: (line: number, names: string[]) => string | undefined;
}

/** Finds methods and lines in a header by their text, so traces never hardcode line numbers. */
export function codeIndex(source: string): CodeIndex {
  const lines = source.split('\n');
  const methodRange = (name: string): [number, number] => {
    const sig = lines.findIndex((l) => l.includes(`::${name}(`));
    if (sig < 0) throw new Error(`no method ${name}`);
    let end = sig;
    while (lines[end] !== '}') end++;
    return [sig, end + 1]; // 0-based sig - 1 is the template line, i.e. line `sig` counting from 1
  };
  const lineIn = (name: string, text: string, nth = 1) => {
    const [from, to] = methodRange(name);
    let seen = 0;
    for (let i = from; i <= to; i++) if (lines[i - 1].includes(text) && ++seen === nth) return i;
    throw new Error(`no "${text}" in ${name}`);
  };
  const methodAt = (line: number, names: string[]) => names.find((m) => { const [a, b] = methodRange(m); return line >= a && line <= b; });
  return { lines, methodRange, lineIn, methodAt };
}

export const SINGLY = codeIndex(SINGLY_LINKED_LIST_H);
export const HEADER_LINES = SINGLY.lines;
export const methodRange = SINGLY.methodRange;
export const lineIn = SINGLY.lineIn;

export interface ListState {
  nodes: LNode[];
  first: number | null;
  last: number | null;
  n: number;
}

export const emptyList = (): ListState => ({ nodes: [], first: null, last: null, n: 0 });

export type ListOp =
  | { op: 'pushFront' | 'pushBack' | 'removeAll' | 'find'; x: number }
  | { op: 'insertAt'; i: number; x: number }
  | { op: 'removeAt' | 'at'; i: number }
  | { op: 'popFront' };

export interface OpRun {
  steps: ListStep[];
  /** The list after the call (freed nodes dropped), or the unchanged list if it threw. */
  after: ListState;
  /** Shown to the user: the returned value, or the exception. */
  returned: string;
  /** Method whose code the steps point into. */
  method: string;
}

export function runOp(state: ListState, o: ListOp): OpRun {
  const m = new ListMachine(state.nodes, [['first', state.first], ['last', state.last]]);
  let n = state.n;
  let method: string = o.op;
  const L = lineIn;

  // nodeAt(index): iter walks from first, one hop per step. Its frame is drawn as `iter`.
  const nodeAt = (index: number, caller: string, into: string) => {
    m.set('iter', m.get('first'));
    m.snap('move', `${caller} вика nodeAt(${index}): iter = first.`, L('nodeAt', 'Node *iter = first;'));
    for (let k = 0; k < index; k++) {
      m.advance('iter');
      m.snap('move', `iter = iter->next (${k + 1} от ${index}). Няма как да скочим направо: минаваме през всеки възел.`, L('nodeAt', 'iter = iter->next;'));
    }
    const at = m.get('iter');
    m.drop('iter');
    m.set(into, at);
    m.snap('keep', `nodeAt връща възела на индекс ${index}: ${into} сочи към него.`, L(caller, `${into} = nodeAt(`));
  };
  const fail = (msg: string, line: number): OpRun => {
    m.snap('error', msg, line);
    return { steps: m.steps, after: state, returned: msg.split(':')[0], method };
  };
  const done = (returned: string): OpRun => {
    const live = [...m.nodes.values()].filter((x) => !x.freed);
    return { steps: m.steps, after: { nodes: live, first: m.get('first'), last: m.get('last'), n }, returned, method };
  };

  const pushFront = (x: number, from?: string) => {
    method = 'pushFront';
    const node = m.create(x);
    m.set('node', node);
    m.snap('push', `${from ? `${from} вика pushFront. ` : ''}new Node(${x}): нов възел, засега next = nullptr.`, L('pushFront', 'new Node(el)'));
    m.setNext(node, m.get('first'));
    m.snap('apply', 'node->next = first: новият възел сочи към досегашното начало.', L('pushFront', 'node->next = first;'));
    m.set('first', node);
    m.snap('apply', 'first = node: новият възел става начало. Редът е важен: ако първо сменим first, губим стария списък.', L('pushFront', 'first = node;'));
    if (m.get('last') === null) {
      m.set('last', node);
      m.snap('apply', 'Списъкът беше празен, затова last също сочи новия възел.', L('pushFront', 'last = node;'));
    }
    m.drop('node');
    n++;
    m.snap('ok', `n++ → ${n}. O(1): нито един възел не беше обходен.`, L('pushFront', 'n++;'));
  };
  const pushBack = (x: number, from?: string) => {
    method = 'pushBack';
    const node = m.create(x);
    m.set('node', node);
    m.snap('push', `${from ? `${from} вика pushBack. ` : ''}new Node(${x}).`, L('pushBack', 'new Node(el)'));
    if (n === 0) {
      m.set('first', node);
      m.set('last', node);
      m.snap('apply', 'Списъкът е празен: first = last = node.', L('pushBack', 'first = last = node;'));
    } else {
      m.setNext(m.get('last')!, node);
      m.snap('apply', 'last->next = node: досегашният последен сочи към новия.', L('pushBack', 'last->next = node;'));
      m.set('last', node);
      m.snap('apply', 'last = node. Благодарение на last това е O(1): не обхождаме списъка до края.', L('pushBack', 'last = node;', 2));
    }
    m.drop('node');
    n++;
    m.snap('ok', `n++ → ${n}.`, L('pushBack', 'n++;'));
  };
  const popFront = (from?: string): string => {
    method = 'popFront';
    if (n === 0) throw new Error('empty');
    const old = m.get('first')!;
    m.set('oldFirst', old);
    m.snap('move', `${from ? `${from} вика popFront. ` : ''}oldFirst = first: пазим възела, за да можем да го изтрием.`, L('popFront', 'Node *oldFirst = first;'));
    const item = m.node(old).val;
    m.set('first', m.node(old).next);
    m.snap('apply', 'first = first->next: началото се мести напред.', L('popFront', 'first = first->next;'));
    m.free(old);
    m.drop('oldFirst');
    n--;
    m.snap('drop', `delete oldFirst, n-- → ${n}.`, L('popFront', 'delete oldFirst;'));
    if (n === 0) {
      m.set('last', null);
      m.snap('apply', 'Списъкът опустя: last = nullptr, иначе би сочил към изтрит възел.', L('popFront', 'last = nullptr;'));
    }
    m.snap('ok', `Връща ${item}. O(1).`, L('popFront', 'return item;'));
    return String(item);
  };

  switch (o.op) {
    case 'pushFront':
      m.snap('start', `pushFront(${o.x})`, methodRange('pushFront')[0]);
      pushFront(o.x);
      return done('void');
    case 'pushBack':
      m.snap('start', `pushBack(${o.x})`, methodRange('pushBack')[0]);
      pushBack(o.x);
      return done('void');
    case 'popFront':
      m.snap('start', 'popFront()', methodRange('popFront')[0]);
      if (n === 0) return fail('length_error: списъкът е празен.', L('popFront', 'throw'));
      return done(popFront());
    case 'insertAt': {
      m.snap('start', `insertAt(${o.i}, ${o.x})`, methodRange('insertAt')[0]);
      if (o.i < 0 || o.i > n) return fail(`out_of_range: индекс ${o.i} е извън [0, ${n}].`, L('insertAt', 'throw'));
      if (o.i === 0) { pushFront(o.x, 'insertAt(0, …)'); return done('void'); }
      if (o.i === n) { pushBack(o.x, `insertAt(${n}, …)`); return done('void'); }
      nodeAt(o.i - 1, 'insertAt', 'previous');
      const node = m.create(o.x);
      m.set('node', node);
      m.snap('push', `new Node(${o.x}).`, L('insertAt', 'new Node(el)'));
      m.setNext(node, m.node(m.get('previous')!).next);
      m.snap('apply', 'node->next = previous->next: новият възел първо се закача за остатъка от списъка.', L('insertAt', 'node->next = previous->next;'));
      m.setNext(m.get('previous')!, node);
      m.snap('apply', 'previous->next = node: чак сега previous сочи към новия. В обратен ред остатъкът би се изгубил.', L('insertAt', 'previous->next = node;'));
      m.drop('node'); m.drop('previous');
      n++;
      m.snap('ok', `n++ → ${n}. O(n) заради обхождането до previous.`, L('insertAt', 'n++;'));
      return done('void');
    }
    case 'removeAt': {
      m.snap('start', `removeAt(${o.i})`, methodRange('removeAt')[0]);
      if (o.i < 0 || o.i >= n) return fail(`out_of_range: индекс ${o.i} е извън [0, ${n - 1}].`, L('removeAt', 'throw'));
      if (o.i === 0) return done(popFront('removeAt(0)'));
      nodeAt(o.i - 1, 'removeAt', 'previous');
      const prev = m.get('previous')!;
      const rem = m.node(prev).next!;
      m.set('toRemove', rem);
      m.snap('move', 'toRemove = previous->next.', L('removeAt', 'Node *toRemove = previous->next;'));
      const item = m.node(rem).val;
      m.setNext(prev, m.node(rem).next);
      m.snap('apply', 'previous->next = toRemove->next: прескачаме възела.', L('removeAt', 'previous->next = toRemove->next;'));
      if (m.get('last') === rem) {
        m.set('last', prev);
        m.snap('apply', 'Махаме последния: last = previous.', L('removeAt', 'last = previous;'));
      }
      m.free(rem);
      m.drop('toRemove'); m.drop('previous');
      n--;
      m.snap('drop', `delete toRemove, n-- → ${n}.`, L('removeAt', 'delete toRemove;'));
      m.snap('ok', `Връща ${item}.`, L('removeAt', 'return item;'));
      return done(String(item));
    }
    case 'removeAll': {
      m.snap('start', `removeAll(${o.x})`, methodRange('removeAll')[0]);
      m.set('current', m.get('first'));
      m.set('previous', null);
      m.snap('move', 'current = first, previous = nullptr.', L('removeAll', 'Node *current = first;'));
      let removed = 0;
      while (m.get('current') !== null) {
        const cur = m.get('current')!;
        if (m.node(cur).val !== o.x) {
          m.set('previous', cur);
          m.advance('current');
          m.snap('move', `${m.node(cur).val} ≠ ${o.x}: previous = current, current = current->next.`, L('removeAll', 'current = current->next;'));
          continue;
        }
        m.set('toRemove', cur);
        m.advance('current');
        m.snap('move', `${o.x} съвпада: toRemove = current, current = current->next.`, L('removeAll', 'current = current->next;', 2));
        if (m.get('previous') !== null) {
          m.setNext(m.get('previous')!, m.get('current'));
          m.snap('apply', 'previous->next = current: прескачаме го.', L('removeAll', 'previous->next = current;'));
        } else {
          m.set('first', m.get('current'));
          m.snap('apply', 'Няма previous, значи махаме началото: first = current.', L('removeAll', 'first = current;'));
        }
        if (m.get('last') === cur) {
          m.set('last', m.get('previous'));
          m.snap('apply', 'Махаме последния: last = previous.', L('removeAll', 'last = previous;'));
        }
        m.free(cur);
        m.drop('toRemove');
        n--;
        removed++;
        m.snap('drop', `delete toRemove, n-- → ${n}.`, L('removeAll', 'delete toRemove;'));
      }
      m.drop('current'); m.drop('previous');
      m.snap('ok', `Готово: махнати ${removed}. Едно обхождане, O(n).`, methodRange('removeAll')[1]);
      return done('void');
    }
    case 'at': {
      m.snap('start', `at(${o.i})`, methodRange('at')[0]);
      if (o.i < 0 || o.i >= n) return fail(`out_of_range: индекс ${o.i} е извън [0, ${n - 1}].`, L('at', 'throw'));
      m.set('iter', m.get('first'));
      m.snap('move', `at вика nodeAt(${o.i}): iter = first.`, L('nodeAt', 'Node *iter = first;'));
      for (let k = 0; k < o.i; k++) {
        m.advance('iter');
        m.snap('move', `iter = iter->next (${k + 1} от ${o.i}).`, L('nodeAt', 'iter = iter->next;'));
      }
      const v = m.node(m.get('iter')!).val;
      m.drop('iter');
      m.snap('ok', `Връща ${v}: ${o.i} стъпки по указатели. При масив arr[${o.i}] е един скок.`, L('at', 'return nodeAt(index)->data;'));
      method = 'at';
      return done(String(v));
    }
    case 'find': {
      m.snap('start', `find(${o.x})`, methodRange('find')[0]);
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

/** The list's values, front first. */
export const listValues = (s: ListState) => valuesFrom(s.nodes, s.first) as number[];

/* ---------- task 1: reverse iteratively (reverseIterative in solutions/1.cpp) ---------- */

export function reverseTrace(values: number[]): ListStep[] {
  const m = new ListMachine();
  const ids = build(m, values);
  m.set('head', ids[0] ?? null);
  m.set('prev', null);
  m.set('curr', ids[0] ?? null);
  m.set('next', null);
  m.snap('start', 'curr = head, prev = nullptr. Ще обърнем всяка стрелка една по една.');
  while (m.get('curr') !== null) {
    const c = m.get('curr')!;
    m.set('next', m.node(c).next);
    m.snap('move', 'next = curr->next: запомняме остатъка, преди да счупим връзката към него.');
    m.setNext(c, m.get('prev'));
    m.snap('apply', `curr->next = prev: ${m.node(c).val} вече сочи назад.`);
    m.set('prev', c);
    m.snap('move', 'prev = curr.');
    m.set('curr', m.get('next'));
    m.hops++;
    m.snap('move', 'curr = next: продължаваме с остатъка.');
  }
  m.drop('head');
  m.snap('ok', `curr е nullptr: prev е новото начало. Обърнат: [${valuesFrom([...m.nodes.values()], m.get('prev')).join(', ')}].`);
  return m.steps;
}

/* ---------- task 2: Floyd's cycle detection (detectCycleConstMemory in solutions/2.cpp) ---------- */

export interface CycleRun {
  steps: ListStep[];
  /** Index of the node where the cycle starts, or -1. */
  start: number;
  ids: number[];
}

export function cycleTrace(values: number[], pos: number): CycleRun {
  const m = new ListMachine();
  const ids = build(m, values);
  if (pos >= 0 && ids.length) m.node(ids[ids.length - 1]).next = ids[pos];
  const indexOf = (id: number | null) => (id === null ? -1 : ids.indexOf(id));
  m.set('slow', ids[0] ?? null);
  m.set('fast', ids[0] ?? null);
  m.snap('start', 'slow и fast тръгват от началото. slow прави една стъпка, fast две.');

  let met = false;
  while (m.get('fast') !== null) {
    m.advance('slow');
    if (m.node(m.get('fast')!).next === null) {
      m.set('fast', null);
      m.snap('ok', 'fast стигна края на списъка: няма цикъл.');
      return { steps: m.steps, start: -1, ids };
    }
    m.advance('fast');
    m.advance('fast');
    if (m.get('slow') === m.get('fast')) {
      m.snap('apply', `slow и fast се срещнаха на ${m.node(m.get('slow')!).val}: има цикъл. Бързият е догонил бавния.`);
      met = true;
      break;
    }
    m.snap('move', `slow → ${m.node(m.get('slow')!).val}, fast → ${m.get('fast') === null ? 'nullptr' : m.node(m.get('fast')!).val}.`);
  }
  if (!met) {
    m.snap('ok', 'fast стигна nullptr: няма цикъл.');
    return { steps: m.steps, start: -1, ids };
  }
  m.set('slow', ids[0]);
  m.snap('move', 'Втора фаза: slow се връща в началото, fast остава на срещата. Сега и двата правят по една стъпка.');
  while (m.get('slow') !== m.get('fast')) {
    m.advance('slow');
    m.advance('fast');
    m.snap('move', `slow → ${m.node(m.get('slow')!).val}, fast → ${m.node(m.get('fast')!).val}.`);
  }
  const start = indexOf(m.get('slow'));
  m.snap('ok', `Срещат се отново точно в началото на цикъла: възела ${m.node(m.get('slow')!).val} (индекс ${start}). Памет O(1).`);
  return { steps: m.steps, start, ids };
}

/* ---------- task 6: delete a node given only that node (deleteNode in solutions/6.cpp) ---------- */

export function deleteNodeTrace(values: number[], k: number): ListStep[] {
  const m = new ListMachine();
  const ids = build(m, values);
  m.set('head', ids[0]);
  m.set('node', ids[k]);
  m.snap('start', `Имаме само указател към ${values[k]}. Без предишния възел не можем да го прескочим.`);
  const nx = m.node(ids[k]).next!;
  m.setVal(ids[k], m.node(nx).val as number);
  m.snap('apply', `node->val = node->next->val: копираме ${m.node(nx).val} в него. Сега стойността се повтаря два пъти.`);
  m.set('tmp', nx);
  m.snap('move', 'tmp = node->next: следващият възел ще изтрием вместо този.');
  m.setNext(ids[k], m.node(nx).next);
  m.snap('apply', 'node->next = node->next->next: прескачаме копието.');
  m.free(nx);
  m.drop('tmp');
  m.snap('ok', `delete tmp. Списъкът: [${valuesFrom([...m.nodes.values()], ids[0]).join(', ')}]. Изтрихме „следващия“, но изглежда сякаш е изтрит подаденият.`);
  return m.steps;
}

/* ---------- task 7: remove the n-th from the end (removeNthFromEnd in solutions/7.cpp) ---------- */

export function removeNthTrace(values: number[], k: number): ListStep[] {
  const m = new ListMachine();
  const dummy = m.create('d');
  const ids = build(m, values);
  m.node(dummy).next = ids[0];
  m.set('dummy', dummy);
  m.set('slow', dummy);
  m.set('fast', dummy);
  m.snap('start', `dummyHead стои пред началото, за да няма специален случай при махане на първия. slow и fast тръгват от него.`);
  for (let i = 0; i < k + 1; i++) {
    m.advance('fast');
    m.snap('move', `fast = fast->next (${i + 1} от n + 1 = ${k + 1}): fast избързва.`);
  }
  m.snap('keep', `Между slow и fast вече има ${k} възела. Сега движим двата заедно.`);
  while (m.get('fast') !== null) {
    m.advance('slow');
    m.advance('fast');
    m.snap('move', 'slow = slow->next, fast = fast->next.');
  }
  const prev = m.get('slow')!;
  const rem = m.node(prev).next!;
  m.set('toBeDeleted', rem);
  m.snap('keep', `fast е nullptr, значи slow е точно преди ${k}-ия от края: ${m.node(rem).val}.`);
  m.setNext(prev, m.node(rem).next);
  m.snap('apply', 'slow->next = slow->next->next: прескачаме го.');
  m.free(rem);
  m.drop('toBeDeleted');
  m.snap('ok', `delete. Връщаме dummyHead.next: [${valuesFrom([...m.nodes.values()], m.node(dummy).next).join(', ')}]. Едно обхождане.`);
  return m.steps;
}
