import { ListMachine, type ListStep } from './linked';

/* Week 5, task 2: the circular deque from solutions/2.cpp, as steps. A fixed array of capacity k,
   the index of the front element and the count n; both ends move around the ring. deque.test.ts
   checks every return value and the internal first and n against the compiled solution. */

export type DequeOp =
  | { op: 'insertFront' | 'insertLast'; x: number }
  | { op: 'deleteFront' | 'deleteLast' | 'getFront' | 'getRear' | 'isEmpty' | 'isFull' };

export interface DequeStep {
  kind: 'start' | 'push' | 'pop' | 'ok' | 'error';
  message: string;
  /** Index of the operation in the script; -1 before the first. */
  at: number;
  /** The array as in memory: cells outside the live range keep old values (null = never written). */
  cells: (number | null)[];
  first: number;
  n: number;
  /** Array index written, read or released by this operation. */
  hit?: number;
  /** The index formula with real numbers, e.g. "(0 - 1 + 3) % 3 = 2". */
  formula?: string;
  returned?: number | boolean;
}

export function parseDequeScript(text: string): DequeOp[] {
  return text.split(/[,;\n]+/).map((t) => t.trim()).filter(Boolean).flatMap((t): DequeOp[] => {
    const m = /^(insertFront|insertLast)\s*\(?\s*(-?\d+)\s*\)?$/.exec(t);
    if (m) return [{ op: m[1] as 'insertFront' | 'insertLast', x: Number(m[2]) }];
    const n = /^(deleteFront|deleteLast|getFront|getRear|isEmpty|isFull)(\(\))?$/.exec(t);
    return n ? [{ op: n[1] as 'deleteFront' }] : [];
  });
}

export const label = (o: DequeOp) => ('x' in o ? `${o.op}(${o.x})` : `${o.op}()`);

export function* dequeTrace(k: number, ops: DequeOp[]): Generator<DequeStep> {
  const cells: (number | null)[] = Array(k).fill(null);
  let first = 0, n = 0;
  const snap = (s: Omit<DequeStep, 'cells' | 'first' | 'n'>): DequeStep => ({ ...s, cells: [...cells], first, n });

  yield snap({ kind: 'start', at: -1, message: `Масив с капацитет ${k}, first = 0, n = 0. Двата края ще се движат в кръг.` });
  for (let at = 0; at < ops.length; at++) {
    const o = ops[at];
    const full = n === k, empty = n === 0;
    if (o.op === 'insertFront' || o.op === 'insertLast') {
      if (full) {
        yield snap({ kind: 'error', at, returned: false, message: `${o.op}(${o.x}): декът е пълен (n = ${k}), връща false.` });
        continue;
      }
      if (o.op === 'insertFront') {
        const before = first;
        first = (first - 1 + k) % k;
        cells[first] = o.x;
        n++;
        yield snap({ kind: 'push', at, hit: first, returned: true, formula: `first = (${before} - 1 + ${k}) % ${k} = ${first}`, message: `insertFront(${o.x}): началото отстъпва с една клетка назад${before === 0 ? ' и се навива в края на масива' : ''}, после arr[${first}] = ${o.x}. Връща true.` });
      } else {
        const idx = (first + n) % k;
        cells[idx] = o.x;
        n++;
        yield snap({ kind: 'push', at, hit: idx, returned: true, formula: `(first + n) % k = (${first} + ${n - 1}) % ${k} = ${idx}`, message: `insertLast(${o.x}): пишем в първата свободна клетка след края, arr[${idx}] = ${o.x}.${idx < first ? ' Навива се в началото на масива.' : ''} Връща true.` });
      }
      continue;
    }
    if ((o.op === 'deleteFront' || o.op === 'deleteLast') && empty) {
      yield snap({ kind: 'error', at, returned: false, message: `${o.op}(): декът е празен, връща false.` });
      continue;
    }
    if (o.op === 'deleteFront') {
      const before = first;
      first = (first + 1) % k;
      n--;
      yield snap({ kind: 'pop', at, hit: before, returned: true, formula: `first = (${before} + 1) % ${k} = ${first}`, message: `deleteFront(): началото минава една клетка напред. Нищо не се трие: старата стойност остава в arr[${before}], но вече не е част от дека.` });
    } else if (o.op === 'deleteLast') {
      const idx = (first + n - 1) % k;
      n--;
      yield snap({ kind: 'pop', at, hit: idx, returned: true, formula: `n = ${n}`, message: `deleteLast(): само n-- (сега ${n}). Краят е (first + n - 1) % k, затова клетка ${idx} просто излиза от дека. O(1).` });
    } else if (o.op === 'getFront') {
      yield snap({ kind: 'ok', at, hit: empty ? undefined : first, returned: empty ? -1 : cells[first]!, formula: empty ? undefined : `arr[first] = arr[${first}]`, message: empty ? 'getFront(): празен, връща -1.' : `getFront(): arr[${first}] = ${cells[first]}.` });
    } else if (o.op === 'getRear') {
      const idx = (first + n - 1) % k;
      yield snap({ kind: 'ok', at, hit: empty ? undefined : idx, returned: empty ? -1 : cells[idx]!, formula: empty ? undefined : `(first + n - 1) % k = (${first} + ${n} - 1) % ${k} = ${idx}`, message: empty ? 'getRear(): празен, връща -1.' : `getRear(): arr[${idx}] = ${cells[idx]}.` });
    } else if (o.op === 'isEmpty') {
      yield snap({ kind: 'ok', at, returned: empty, message: `isEmpty(): n == 0 → ${empty}.` });
    } else {
      yield snap({ kind: 'ok', at, returned: full, message: `isFull(): n == capacity → ${full}.` });
    }
  }
}

/* ---------- the same deque as a circular doubly linked list ---------- */


export interface LinkedDequeStep extends ListStep {
  /** Index of the call being run; -1 before the first. */
  at: number;
  /** The last step of a call: its return value is known and the array view catches up. */
  final: boolean;
  returned?: number | boolean;
  /** For each node, the array index the same element has in the array version, for the layout. */
  slots: Record<number, number>;
}

/* A circular doubly linked list keeps only `head` (the front); the back is head->prev, and no
   pointer is ever nullptr. Capacity k is just a limit on n, to match the array version. */
export function linkedDequeTrace(k: number, ops: DequeOp[]): LinkedDequeStep[] {
  const m = new ListMachine([], [['head', null]]);
  const slots: Record<number, number> = {};
  let n = 0, at = -1, first = 0; // first mirrors the array's front index, only for the layout
  const out: LinkedDequeStep[] = [];
  const snap = (kind: ListStep['kind'], message: string, final = false, returned?: number | boolean) => {
    m.snap(kind, message);
    const s = m.steps[m.steps.length - 1];
    const live = Object.fromEntries(Object.entries(slots).filter(([id]) => !m.nodes.get(Number(id))!.freed));
    out.push({ ...s, at, final, returned, slots: live });
  };

  snap('start', `Празен цикличен двусвързан списък: head = nullptr. Капацитетът ${k} е само ограничение за n.`, true);

  for (at = 0; at < ops.length; at++) {
    const o = ops[at];
    const head = m.get('head');
    if (o.op === 'insertFront' || o.op === 'insertLast') {
      if (n === k) {
        snap('error', `${o.op}(${o.x}): n = ${k}, пълен е. Връща false.`, true, false);
        continue;
      }
      const node = m.create(o.x);
      m.node(node).prev = null;
      m.set('node', node);
      slots[node] = o.op === 'insertFront' ? (first - 1 + k) % k : (first + n) % k;
      snap('push', `new Node(${o.x}).`);
      if (head === null) {
        m.setNext(node, node);
        m.setPrev(node, node);
        snap('apply', 'Единствен възел: next и prev сочат към самия него. Това е кръгът с дължина 1.');
        m.set('head', node);
      } else {
        const tail = m.node(head).prev!;
        m.set('tail', tail);
        snap('move', 'tail = head->prev: краят е точно преди началото в кръга.');
        m.setNext(node, head); m.setPrev(node, tail);
        snap('apply', 'node->next = head, node->prev = tail: новият възел застава между края и началото.');
        m.setNext(tail, node); m.setPrev(head, node);
        snap('apply', 'tail->next = node, head->prev = node: кръгът минава през него.');
        if (o.op === 'insertFront') {
          m.set('head', node);
          snap('apply', 'head = node: при insertFront той става новото начало. При insertLast head не се мести, и той е новият край.');
        }
        m.drop('tail');
      }
      if (o.op === 'insertFront') first = slots[node];
      m.drop('node');
      n++;
      snap('ok', `${o.op}(${o.x}) връща true. n = ${n}. Колкото и да е голям списъкът, пипаме само 4 указателя.`, true, true);
      continue;
    }
    if (o.op === 'deleteFront' || o.op === 'deleteLast') {
      if (n === 0) {
        snap('error', `${o.op}(): празен, връща false.`, true, false);
        continue;
      }
      const victim = o.op === 'deleteFront' ? head! : m.node(head!).prev!;
      m.set('node', victim);
      snap('move', o.op === 'deleteFront' ? 'node = head.' : 'node = head->prev: краят.');
      if (n === 1) {
        m.set('head', null);
        snap('apply', 'Последният елемент: head = nullptr.');
      } else {
        const p = m.node(victim).prev!, q = m.node(victim).next;
        m.setNext(p, q); m.setPrev(q!, p);
        snap('apply', 'node->prev->next = node->next, node->next->prev = node->prev: съседите го прескачат.');
        if (o.op === 'deleteFront') {
          m.set('head', q);
          snap('apply', 'head = head->next.');
        }
      }
      if (o.op === 'deleteFront') first = (first + 1) % k;
      m.free(victim);
      m.drop('node');
      n--;
      snap('ok', `delete; ${o.op}() връща true. n = ${n}.`, true, true);
      continue;
    }
    let returned: number | boolean;
    let message: string;
    if (o.op === 'getFront') { returned = n ? (m.node(head!).val as number) : -1; message = n ? `getFront(): head->val = ${returned}.` : 'getFront(): празен, -1.'; }
    else if (o.op === 'getRear') { returned = n ? (m.node(m.node(head!).prev!).val as number) : -1; message = n ? `getRear(): head->prev->val = ${returned}. Без обхождане: краят е съседът на началото.` : 'getRear(): празен, -1.'; }
    else if (o.op === 'isEmpty') { returned = n === 0; message = `isEmpty(): ${returned}.`; }
    else { returned = n === k; message = `isFull(): n == k → ${returned}.`; }
    snap('ok', message, true, returned);
  }
  return out;
}
