import { useState } from 'react';
import { applyOp, emptyStack, type ArrayStackState, type OpResult } from '../lib/arrayStack';

/* One stack, two physical representations. Every push and pop is applied to an ArrayStack
   (same rules as ArrayStack.h) and to a LinkedStack, so the same operation can be compared. */

interface Node {
  value: number;
  addr: string;
}

interface State {
  array: ArrayStackState;
  /** Linked nodes, bottom first: the last one is head. */
  nodes: Node[];
  next: number;
  /** Nodes allocated so far: feeds the fake addresses. */
  allocs: number;
  last: { op: 'push' | 'pop' | 'top'; array: OpResult | null; node: Node | null } | null;
}

// Heap addresses that look scattered, like real allocations. Deterministic, so the page renders the same every time.
const address = (k: number) => `0x${(0x5581c2a0 + (((k + 1) * 2654435761) % 0x3fff) * 16).toString(16)}`;

const initial: State = { array: emptyStack(), nodes: [], next: 1, allocs: 0, last: null };

export default function StackSandbox() {
  const [s, setS] = useState(initial);
  const [value, setValue] = useState('');
  const n = s.array.items.length;

  const push = (st: State, v: number): State => {
    const r = applyOp(st.array, { kind: 'push', value: v });
    const node = { value: v, addr: address(st.allocs) };
    return { array: r.state, nodes: [...st.nodes, node], next: v + 1, allocs: st.allocs + 1, last: { op: 'push', array: r, node } };
  };
  const doPush = (times = 1) => {
    setS((st) => {
      let out = st;
      for (let i = 0; i < times; i++) out = push(out, i === 0 && value.trim() !== '' && Number.isFinite(Number(value)) ? Number(value) : out.next);
      return out;
    });
    setValue('');
  };
  const doPop = () =>
    setS((st) => {
      if (!st.nodes.length) return st;
      const r = applyOp(st.array, { kind: 'pop' });
      return { ...st, array: r.state, nodes: st.nodes.slice(0, -1), last: { op: 'pop', array: r, node: st.nodes[st.nodes.length - 1] } };
    });
  const doTop = () => setS((st) => (st.nodes.length ? { ...st, last: { op: 'top', array: null, node: st.nodes[st.nodes.length - 1] } } : st));

  return (
    <div className="playground sandbox">
      <div className="pg-options">
        <label className="param">
          стойност
          <input type="number" value={value} placeholder={String(s.next)} onChange={(e) => setValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && doPush()} />
        </label>
        <button type="button" className="btn primary" onClick={() => doPush()}>push</button>
        <button type="button" className="btn" onClick={doPop} disabled={!n}>pop</button>
        <button type="button" className="btn" onClick={doTop} disabled={!n}>top</button>
        <button type="button" className="btn" onClick={() => doPush(5)}>push ×5</button>
        <button type="button" className="btn ghost" onClick={() => setS(initial)}>изчисти</button>
      </div>

      <div className="sandbox-grid">
        <section aria-labelledby="sb-array">
          <h4 id="sb-array">Последователно: <code>ArrayStack</code></h4>
          <p className="muted small">n = {n}, capacity = {s.array.capacity}, празни клетки: {s.array.capacity - n}</p>
          <ol className="cells" aria-label={`Масив с капацитет ${s.array.capacity}`}>
            {Array.from({ length: s.array.capacity }, (_, i) => (
              <li key={`${s.array.capacity}-${i}`} className={`cell${i < n ? ' full' : ''}${i === n - 1 ? ' top' : ''}${s.last?.array?.resize ? ' resized' : ''}`}>
                <span className="v">{i < n ? s.array.items[i] : ''}</span>
                <span className="i">{i}</span>
              </li>
            ))}
          </ol>
          <p className="effect">{arrayEffect(s)}</p>
        </section>

        <section aria-labelledby="sb-linked">
          <h4 id="sb-linked">Свързано: <code>LinkedStack</code></h4>
          <p className="muted small">n = {n}, указатели: {n} × 8 байта</p>
          <ol className="chain" aria-label="Свързан списък от върха надолу">
            <li className="head">head</li>
            {[...s.nodes].reverse().flatMap((node, i) => [
              <li key={`${node.addr}-arrow`} className="arrow" aria-hidden="true">→</li>,
              <li key={node.addr} className={`node${i === 0 ? ' top' : ''}`}>
                <span className="addr">{node.addr}</span>
                <span className="box">
                  <span className="data">{node.value}</span>
                  <span className="next">next</span>
                </span>
              </li>,
            ])}
            <li className="arrow" aria-hidden="true">→</li>
            <li className="null">nullptr</li>
          </ol>
          <p className="effect">{linkedEffect(s)}</p>
        </section>
      </div>
    </div>
  );
}

function arrayEffect({ last, array }: State) {
  if (!last) return 'Опитай push няколко пъти: на деветия масивът ще се напълни.';
  if (last.op === 'top') return `top() връща arr[n - 1] = ${last.node!.value}. O(1).`;
  const r = last.array!;
  if (last.op === 'push') {
    return r.resize
      ? `Масивът беше пълен (${r.resize.from}/${r.resize.from}): заделяме нов с капацитет ${r.resize.to}, копираме ${r.resize.copied} елемента, освобождаваме стария и записваме ${last.node!.value}. Цена: 1 + ${r.resize.copied}.`
      : `arr[${array.items.length - 1}] = ${last.node!.value}. Цена: 1.`;
  }
  return r.resize
    ? `Останаха ${array.items.length} от ${r.resize.from}, точно четвърт: смаляваме до ${r.resize.to} и копираме ${r.resize.copied}. Цена: 1 + ${r.resize.copied}.`
    : `--n, връщаме ${r.popped}. Клетката остава заделена. Цена: 1.`;
}

function linkedEffect({ last, nodes }: State) {
  if (!last) return 'Всеки възел е отделно парче памет; адресите не са един до друг.';
  const node = last.node!;
  if (last.op === 'top') return `top() връща head->data = ${node.value}. O(1).`;
  if (last.op === 'push') return `new Node(${node.value}) на ${node.addr}, next сочи старата глава, head сочи новия възел. Винаги O(1), без копиране.`;
  return `head = head->next${nodes.length ? ` (${nodes[nodes.length - 1].addr})` : ' (nullptr)'}, delete на ${node.addr}. O(1).`;
}
