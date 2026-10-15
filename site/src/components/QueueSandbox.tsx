import { useState } from 'react';
import { dequeue, emptyRing, enqueue, ringItems, type RingResult, type RingState } from '../lib/queue';
import { Ring } from './Ring';

/* One queue, two representations: ArrayQueue.h's circular array drawn as a ring, and
   LinkedQueue.h's chain with first and last pointers. Every operation goes to both. */

interface Node {
  value: number;
  addr: string;
}

interface State {
  ring: RingState;
  nodes: Node[]; // front first
  next: number;
  allocs: number;
  last: { op: 'enqueue' | 'dequeue' | 'peek'; ring: RingResult | null; node: Node | null } | null;
}

const address = (k: number) => `0x${(0x5581d3c0 + (((k + 7) * 2654435761) % 0x3fff) * 16).toString(16)}`;
const initial: State = { ring: emptyRing(), nodes: [], next: 1, allocs: 0, last: null };

export default function QueueSandbox() {
  const [s, setS] = useState(initial);
  const [value, setValue] = useState('');

  const enq = (st: State, v: number): State => {
    const r = enqueue(st.ring, v);
    const node = { value: v, addr: address(st.allocs) };
    return { ring: r.state, nodes: [...st.nodes, node], next: v + 1, allocs: st.allocs + 1, last: { op: 'enqueue', ring: r, node } };
  };
  const deq = (st: State): State => {
    if (!st.nodes.length) return st;
    const r = dequeue(st.ring);
    return { ...st, ring: r.state, nodes: st.nodes.slice(1), last: { op: 'dequeue', ring: r, node: st.nodes[0] } };
  };
  const doEnq = (times = 1) => {
    setS((st) => {
      let out = st;
      for (let i = 0; i < times; i++) out = enq(out, i === 0 && value.trim() !== '' && Number.isFinite(Number(value)) ? Number(value) : out.next);
      return out;
    });
    setValue('');
  };
  const doDeq = (times = 1) => setS((st) => Array.from({ length: times }).reduce<State>((acc) => deq(acc), st));
  const n = s.ring.n;

  return (
    <div className="playground sandbox">
      <div className="pg-options">
        <label className="param">
          стойност
          <input type="number" value={value} placeholder={String(s.next)} onChange={(e) => setValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && doEnq()} />
        </label>
        <button type="button" className="btn primary" onClick={() => doEnq()}>enqueue</button>
        <button type="button" className="btn" onClick={() => doDeq()} disabled={!n}>dequeue</button>
        <button type="button" className="btn" onClick={() => setS((st) => (st.nodes.length ? { ...st, last: { op: 'peek', ring: null, node: st.nodes[0] } } : st))} disabled={!n}>peek</button>
        <button type="button" className="btn" onClick={() => doEnq(5)}>enqueue ×5</button>
        <button type="button" className="btn" onClick={() => doDeq(3)} disabled={!n}>dequeue ×3</button>
        <button type="button" className="btn ghost" onClick={() => setS(initial)}>изчисти</button>
      </div>

      <div className="sandbox-grid">
        <section aria-labelledby="qs-ring">
          <h4 id="qs-ring">Последователно, циклично: <code>ArrayQueue</code></h4>
          <p className="muted small">n = {n}, capacity = {s.ring.cells.length}, first = {s.ring.first}</p>
          <Ring
            cells={s.ring.cells}
            first={s.ring.first}
            n={s.ring.n}
            hit={s.last?.ring && !s.last.ring.resize ? s.last.ring.index : null}
            resized={!!s.last?.ring?.resize}
            markers={[
              ...(s.ring.n > 0 ? [{ index: s.ring.first, label: 'first', cls: 'm-first' }] : []),
              { index: (s.ring.first + s.ring.n) % s.ring.cells.length, label: s.ring.n === s.ring.cells.length ? 'пълен' : 'следващ запис', cls: 'm-end' },
            ]}
            label={`Цикличен масив с капацитет ${s.ring.cells.length}: ${ringItems(s.ring).join(', ') || 'празен'}, first = ${s.ring.first}`}
          />
          <p className="effect">{ringEffect(s)}</p>
        </section>

        <section aria-labelledby="qs-linked">
          <h4 id="qs-linked">Свързано: <code>LinkedQueue</code></h4>
          <p className="muted small">n = {n}, два указателя: first и last</p>
          <ol className="chain" aria-label="Свързана опашка от началото към края">
            <li className="head">first</li>
            {s.nodes.length === 0 && <><li className="arrow" aria-hidden="true">→</li><li className="null">nullptr</li></>}
            {s.nodes.flatMap((node, i) => [
              <li key={`${node.addr}-a`} className="arrow" aria-hidden="true">→</li>,
              <li key={node.addr} className={`node${i === 0 ? ' top' : ''}${i === s.nodes.length - 1 ? ' last' : ''}`}>
                <span className="addr">{i === s.nodes.length - 1 ? `last → ${node.addr}` : node.addr}</span>
                <span className="box"><span className="data">{node.value}</span><span className="next">next</span></span>
              </li>,
            ])}
            {s.nodes.length > 0 && <><li className="arrow" aria-hidden="true">→</li><li className="null">nullptr</li></>}
          </ol>
          <p className="effect">{linkedEffect(s)}</p>
        </section>
      </div>
    </div>
  );
}

function ringEffect({ last, ring }: State) {
  if (!last) return 'Добави няколко елемента и махни някои отпред: краят ще се навие в началото на масива, без да мести нищо.';
  if (last.op === 'peek') return `peek() връща arr[first] = arr[${ring.first}] = ${last.node!.value}.`;
  const r = last.ring!;
  const cap = ring.cells.length;
  if (last.op === 'enqueue') {
    if (r.resize) return `Масивът беше пълен: нов с капацитет ${r.resize.to}, в който елементите се подреждат от индекс 0 (кръгът се „разгъва“), first = 0. После ${r.value} отива на индекс ${r.index}.`;
    const wrapped = r.index < ring.first;
    return `arr[(first + n) % capacity] = arr[(${ring.first} + ${ring.n - 1}) % ${cap}] = arr[${r.index}] = ${r.value}.${wrapped ? ' Краят се навива в началото на масива: там има свободно място.' : ''}`;
  }
  if (r.resize) return `Връщаме ${r.value}. Останаха ${ring.n}, точно четвърт: масивът се смалява до ${r.resize.to} и се подрежда от индекс 0.`;
  return `Връщаме arr[${r.index}] = ${r.value}, first = (${r.index} + 1) % ${cap} = ${ring.first}. Нищо не се мести: O(1). Старата стойност остава в клетката, но вече не е част от опашката.`;
}

function linkedEffect({ last, nodes }: State) {
  if (!last) return 'enqueue добавя след last, dequeue маха от first. И двете са O(1), защото пазим и двата края.';
  const node = last.node!;
  if (last.op === 'peek') return `peek() връща first->data = ${node.value}.`;
  if (last.op === 'enqueue')
    return nodes.length === 1
      ? `new Node(${node.value}) на ${node.addr}. Опашката беше празна, затова first и last сочат новия възел.`
      : `new Node(${node.value}) на ${node.addr}: старият last->next сочи към него, после last = новият възел.`;
  return nodes.length === 0
    ? `first = first->next (nullptr), delete на ${node.addr}. Опашката е празна, затова и last = nullptr.`
    : `first = first->next (${nodes[0].addr}), delete на ${node.addr}. last не се пипа.`;
}
