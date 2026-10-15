import { useMemo, useState } from 'react';
import { dequeTrace, label, linkedDequeTrace, parseDequeScript } from '../lib/deque';
import { circleGeometry, circleLayout, ListDiagram } from './ListDiagram';
import { collect } from '../lib/traces';
import { Ring } from './Ring';
import { TokenTape } from './TokenTape';
import { Presets, TracePanel } from './TracePanel';
import { useStepper } from './useStepper';

/* Task 2: one deque, two implementations driven by the same calls. Left: the array from
   solutions/2.cpp, as a ring. Right: a circular doubly linked list, each node drawn where the array
   keeps the same element. The linked steps set the pace (one per pointer change); the array view
   catches up when each call finishes. */

const PRESETS: { label: string; k: number; script: string }[] = [
  { label: 'примерът', k: 3, script: 'insertLast(1), insertLast(2), insertFront(3), insertFront(4), getRear, isFull, deleteLast, insertFront(4), getFront' },
  { label: 'навиване', k: 5, script: 'insertFront(1), insertFront(2), insertLast(3), insertFront(4), getFront, getRear, deleteLast, deleteLast, insertLast(5), insertLast(6), getRear' },
  { label: 'празен', k: 2, script: 'deleteFront, getFront, insertLast(7), deleteLast, deleteLast, isEmpty' },
];

export default function DequeTrace() {
  const [k, setK] = useState(PRESETS[0].k);
  const [script, setScript] = useState(PRESETS[0].script);
  const ops = parseDequeScript(script);
  const arraySteps = useMemo(() => collect(dequeTrace(k, ops)), [k, script]);
  const linkedSteps = useMemo(() => linkedDequeTrace(k, ops), [k, script]);
  const st = useStepper(linkedSteps, 900);
  const linked = st.step;
  // The array is one step per call: show the state after this call once the call has finished.
  const step = arraySteps[linked.final ? linked.at + 1 : Math.max(0, linked.at)];
  const rear = (step.first + step.n - 1 + k) % k;
  const pos = useMemo(() => circleLayout(linked.slots, k), [linked, k]);

  return (
    <TracePanel
      stepper={st}
      label="Цикличен дек"
      message={linked.message}
      kind={linked.kind}
      inputs={
        <>
          <div className="presets" role="group" aria-label="Примери">
            {PRESETS.map((p) => (
              <button key={p.label} type="button" aria-pressed={p.script === script && p.k === k} onClick={() => { setK(p.k); setScript(p.script); }}>{p.label}</button>
            ))}
          </div>
          <label className="param">k = <b>{k}</b><input type="range" min={1} max={8} value={k} onChange={(e) => setK(Number(e.target.value))} /></label>
          <Presets presets={[]} value={script} onChange={setScript} label="операции:" />
        </>
      }
    >
      <div className="hof-body">
        <div className="hof-row">
          <span className="hof-label">операции</span>
          <TokenTape tokens={ops.map(label)} at={linked.at} bad={linked.final && linked.returned === false ? [linked.at] : []} />
        </div>
      </div>
      <div className="deque-views">
        <section aria-labelledby="dq-array">
          <h4 id="dq-array">Масив с capacity {k} (solutions/2.cpp)</h4>
          <Ring
            cells={step.cells}
            first={step.first}
            n={step.n}
            hit={step.hit ?? null}
            markers={step.n ? [{ index: step.first, label: 'front', cls: 'm-first' }, { index: rear, label: 'rear', cls: 'm-rear' }] : [{ index: step.first, label: 'first (празен)', cls: 'm-end' }]}
            label={`Цикличен дек върху масив с капацитет ${k}, first = ${step.first}, n = ${step.n}`}
          />
          <p className="muted small">first = <b>{step.first}</b>, n = <b>{step.n}</b>{linked.final && step.formula ? <> · <code>{step.formula}</code></> : null}</p>
          {!linked.final && <p className="muted small">Масивът прави цялото извикване наведнъж: обновява се, когато списъкът завърши своите стъпки.</p>}
        </section>
        <section aria-labelledby="dq-linked">
          <h4 id="dq-linked">Цикличен двусвързан списък</h4>
          <ListDiagram step={linked} pos={pos} guide={circleGeometry(k)} label={`Цикличен двусвързан списък с ${Object.keys(linked.slots).length} възела`} />
          <p className="muted small">само head; краят е head-&gt;prev, nullptr няма</p>
        </section>
      </div>
      {linked.final && linked.returned !== undefined && <p className={`verdict ${linked.returned === false ? 'bad' : 'good'}`}>връща <b>{String(linked.returned)}</b> · отпред назад: <code>[{Array.from({ length: step.n }, (_, i) => step.cells[(step.first + i) % k]).join(', ')}]</code></p>}
    </TracePanel>
  );
}
