import { useMemo, useState } from 'react';
import { bin, hex, xorList, xorTraverse } from '../lib/doubly';
import { collect } from '../lib/traces';
import { TracePanel } from './TracePanel';
import { useStepper } from './useStepper';

/* Task 7: an XOR linked list keeps one field, link = addr(prev) ^ addr(next). Walking it needs the
   address you came from: next = prev ^ link. The same links work in both directions. */

export default function XorListTrace() {
  const [backwards, setBackwards] = useState(false);
  const list = useMemo(() => xorList([1, 2, 3, 4, 5]), []);
  const steps = useMemo(() => collect(xorTraverse(list, backwards)), [list, backwards]);
  const st = useStepper(steps, 1100);
  const step = st.step;

  return (
    <TracePanel
      stepper={st}
      label="XOR списък"
      message={step.message}
      kind={step.kind === 'move' ? 'push' : step.kind}
      inputs={
        <div className="segmented" role="radiogroup" aria-label="Посока">
          <button type="button" role="radio" aria-checked={!backwards} onClick={() => setBackwards(false)}>от началото</button>
          <button type="button" role="radio" aria-checked={backwards} onClick={() => setBackwards(true)}>от края</button>
        </div>
      }
    >
      <ol className="xor-nodes" aria-label="Възлите и техните link полета">
        {list.map((x, k) => (
          <li key={x.addr} className={`xor-node${step.at === k ? ' here' : ''}${step.visited.includes(k) && step.at !== k ? ' seen' : ''}`}>
            <span className="xor-addr">адрес {hex(x.addr)}</span>
            <span className="xor-val">{x.val}</span>
            <span className="xor-link">link = {hex(x.link)}</span>
            <span className="xor-why">{k ? hex(list[k - 1].addr) : '0'} ^ {k + 1 < list.length ? hex(list[k + 1].addr) : '0'}</span>
          </li>
        ))}
      </ol>
      <div className="xor-calc">
        <p className="muted small">prev = {hex(step.prev)}, curr = {step.curr ? hex(step.curr) : 'nullptr'}</p>
        {step.calc && (
          <pre className="xor-bits" aria-label="Изчисление по битове">
            {`  prev        ${bin(step.calc.a)}   ${hex(step.calc.a)}\n^ curr->link ${bin(step.calc.b)}   ${hex(step.calc.b)}\n  ──────────────────────────\n  next        ${bin(step.calc.result)}   ${step.calc.result ? hex(step.calc.result) : 'nullptr'}`}
          </pre>
        )}
      </div>
    </TracePanel>
  );
}
