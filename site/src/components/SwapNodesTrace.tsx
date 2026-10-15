import { useMemo, useState } from 'react';
import { swapTrace } from '../lib/doubly';
import { ListDiagram, rowLayout, sandboxLayouts } from './ListDiagram';
import { TracePanel } from './TracePanel';
import { useStepper } from './useStepper';

/* Task 1: swap two nodes of a doubly linked list by relinking (swapNodes in solutions/1.cpp).
   Nodes keep their places while the pointers are rewired, so you can see every arrow move; the last
   step redraws the list in its new order. */

export default function SwapNodesTrace() {
  const [n, setN] = useState(5);
  const [i, setI] = useState(1);
  const [j, setJ] = useState(3);
  const ii = Math.min(i, n - 1), jj = Math.min(j, n - 1);
  const values = Array.from({ length: n }, (_, k) => k + 1);
  const run = useMemo(() => swapTrace(values, ii, jj), [n, ii, jj]);
  const st = useStepper(run.steps, 1000);
  const fixed = useMemo(() => rowLayout(run.steps[0].nodes.map((x) => x.id), 70), [run]);
  // sandboxLayouts follows `first`; here the list's start is called head.
  const final = useMemo(() => sandboxLayouts([{ ...run.steps[run.steps.length - 1], vars: [['first', run.steps[run.steps.length - 1].vars.find(([v]) => v === 'head')![1]]] }])[0], [run]);
  const step = st.step;
  const pos = st.atEnd ? final : fixed;

  return (
    <TracePanel
      stepper={st}
      label="Размяна на два възела"
      message={step.message}
      kind={step.kind}
      inputs={
        <>
          <label className="param">n = <b>{n}</b><input type="range" min={1} max={7} value={n} onChange={(e) => setN(Number(e.target.value))} /></label>
          <label className="param">първи: <b>{values[ii]}</b><input type="range" min={0} max={n - 1} value={ii} onChange={(e) => setI(Number(e.target.value))} /></label>
          <label className="param">втори: <b>{values[jj]}</b><input type="range" min={0} max={n - 1} value={jj} onChange={(e) => setJ(Number(e.target.value))} /></label>
        </>
      }
    >
      <ListDiagram step={step} pos={pos} label={`Двусвързан списък 1…${n}; разменяме ${values[ii]} и ${values[jj]}`} />
      {st.atEnd && (
        <p className="stats">
          <span>напред: <code>[{run.forward.join(', ')}]</code></span>
          <span>назад: <code>[{[...run.backward].reverse().join(', ')}]</code></span>
        </p>
      )}
    </TracePanel>
  );
}
