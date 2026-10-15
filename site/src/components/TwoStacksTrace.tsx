import { useMemo, useState } from 'react';
import { parseQueueScript, twoStacksTrace } from '../lib/queue';
import { collect } from '../lib/traces';
import { StackView } from './StackView';
import { TokenTape } from './TokenTape';
import { Presets, TracePanel } from './TracePanel';
import { useStepper } from './useStepper';

const PRESETS = [
  'push 1, push 2, peek, pop, empty',
  'push 1, push 2, push 3, pop, push 4, pop, pop, pop',
  'push 1, push 2, push 3, push 4, push 5, pop, pop, pop, pop, pop',
];

export default function TwoStacksTrace() {
  const [script, setScript] = useState(PRESETS[1]);
  const ops = parseQueueScript(script);
  const steps = useMemo(() => collect(twoStacksTrace(ops)), [script]);
  const st = useStepper(steps);
  const step = st.step;
  const labels = ops.map((o) => (o.op === 'push' ? `push ${o.x}` : o.op));
  const done = steps.slice(0, st.index + 1);
  const opsDone = new Set(done.map((s) => s.at).filter((a) => a >= 0)).size;
  const logical = step.queue;

  return (
    <TracePanel stepper={st} label="Опашка с два стека" message={step.message} kind={step.kind === 'move' ? 'apply' : step.kind} inputs={<Presets presets={PRESETS} value={script} onChange={setScript} label="или свои операции:" />}>
      <div className="hof-body">
        <div className="hof-row">
          <span className="hof-label">операции</span>
          <TokenTape tokens={labels} at={step.at} />
        </div>
        <div className="hof-row">
          <span className="hof-label">опашката</span>
          <div className="logical-queue">
            <span className="muted small-inline">начало →</span>
            {logical.length ? logical.map((x, i) => <span key={i} className="lq-cell">{x}</span>) : <span className="muted">празна</span>}
            <span className="muted small-inline">← край</span>
          </div>
        </div>
      </div>
      <div className="stacks-row two-stacks">
        <div className="stack-col">
          <StackView title="s1: вход" items={step.s1.map((x, i) => ({ key: `s1-${x}-${i}`, label: String(x) }))} minSlots={5} />
        </div>
        <div className={`transfer${step.kind === 'move' ? ' on' : ''}`} aria-hidden="true">{step.kind === 'move' ? `${step.moved} →` : '→'}</div>
        <div className="stack-col">
          <StackView title="s2: изход" items={step.s2.map((x, i) => ({ key: `s2-${x}-${i}`, label: String(x), tone: step.kind === 'move' && i === step.s2.length - 1 ? 'ok' : undefined }))} minSlots={5} />
        </div>
      </div>
      <p className="stats">
        <span><b>{opsDone}</b> операции</span>
        <span><b>{step.work}</b> push/pop върху стековете</span>
        <span>средно <b>{opsDone ? (step.work / opsDone).toFixed(2) : '0'}</b> на операция</span>
      </p>
    </TracePanel>
  );
}
