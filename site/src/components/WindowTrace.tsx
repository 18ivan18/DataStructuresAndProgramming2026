import { useMemo, useState } from 'react';
import { windowTrace } from '../lib/queue';
import { collect } from '../lib/traces';
import { Presets, TracePanel } from './TracePanel';
import { useStepper } from './useStepper';

const PRESETS = ['1 3 -1 -3 5 3 6 7', '9 8 7 6 5 4 3', '1 2 3 4 5 6 7', '4 -2 5 1 1 1 0 6'];

export default function WindowTrace() {
  const [input, setInput] = useState(PRESETS[0]);
  const [k, setK] = useState(3);
  const nums = input.trim().split(/[\s,]+/).map(Number).filter((x) => Number.isFinite(x)).slice(0, 16);
  const kk = Math.max(1, Math.min(k, nums.length));
  // Memoised, including the empty case: a new array on every render would make the stepper reset itself.
  const steps = useMemo(() => (nums.length ? collect(windowTrace(nums, kk)) : [{ kind: 'start' as const, i: -1, dq: [], out: [], message: 'Въведи числа.' }]), [nums.join(' '), kk]);
  const st = useStepper(steps);
  const step = st.step;
  const lo = step.i - kk + 1;

  return (
    <TracePanel
      stepper={st}
      label="Плъзгащ се прозорец"
      message={step.message}
      kind={step.kind === 'keep' ? 'ok' : step.kind === 'drop' ? 'error' : step.kind}
      inputs={
        <>
          <Presets presets={PRESETS} value={input} onChange={setInput} label="или свои:" />
          <label className="param">k = <b>{kk}</b><input type="range" min={1} max={Math.max(1, nums.length)} value={kk} onChange={(e) => setK(Number(e.target.value))} /></label>
        </>
      }
    >
      <ol className="window-cells" aria-label="Масивът">
        {nums.map((v, i) => {
          const inWin = i >= lo && i <= step.i && step.i < nums.length;
          return (
            <li key={i} className={`wcell${inWin ? ' in' : ''}${i === step.i ? ' current' : ''}${i === step.removed ? ' removed' : ''}${step.dq.includes(i) ? ' kept' : ''}`}>
              <span className="v">{v}</span>
              <span className="i">{i}</span>
            </li>
          );
        })}
      </ol>
      <div className="hof-body">
        <div className="hof-row">
          <span className="hof-label">deque</span>
          <div className="deque">
            <span className="muted small-inline">front</span>
            {step.dq.length ? step.dq.map((i, j) => (
              <span key={i} className={`dq-cell${j === 0 ? ' max' : ''}`}><b>{nums[i]}</b><span className="i">[{i}]</span></span>
            )) : <span className="muted">празен</span>}
            <span className="muted small-inline">back</span>
          </div>
        </div>
        <div className="hof-row">
          <span className="hof-label">максимуми</span>
          <div>{step.out.length ? <code>[{step.out.join(', ')}]</code> : <span className="muted">[ ]</span>}</div>
        </div>
      </div>
    </TracePanel>
  );
}
