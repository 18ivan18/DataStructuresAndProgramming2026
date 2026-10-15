import { useMemo, useState } from 'react';
import { bridgeTrace } from '../lib/queue';
import { collect } from '../lib/traces';
import { StackView } from './StackView';
import { Presets, TracePanel } from './TracePanel';
import { useStepper } from './useStepper';

const PRESETS = ['-1 -2 4 5 6 -3 -6 -7 -8 2 3', '5 3 -4 -6 2 -1', '2 4 -4 -2', '3 3 3 -9 1 -1'];
const STATE_LABEL = { waiting: 'чака', stack: 'на моста →', queue: 'в групата ←', dead: 'падна', passed: 'премина' } as const;

export default function BridgeTrace() {
  const [input, setInput] = useState(PRESETS[0]);
  const a = input.trim().split(/[\s,]+/).map(Number).filter((x) => Number.isInteger(x) && x !== 0).slice(0, 16);
  const steps = useMemo(() => collect(bridgeTrace(a)), [a.join(' ')]);
  const st = useStepper(steps);
  const step = st.step;
  const [p, q] = step.duel ?? [-1, -1];

  return (
    <TracePanel stepper={st} label="Битка на моста" message={step.message} kind={step.kind} inputs={<Presets presets={PRESETS} value={input} onChange={setInput} label="или свои (без 0):" />}>
      <ol className="warriors" aria-label="Бойците по реда на входа">
        {a.map((v, i) => (
          <li key={i} className={`warrior ${step.states[i]}${i === p || i === q ? ' fighting' : ''}`} title={STATE_LABEL[step.states[i]]}>
            <span className="dir">{v > 0 ? '→' : '←'}</span>
            <span className="v">{Math.abs(v)}</span>
            <span className="st">{step.states[i] === 'dead' ? '✕' : step.states[i] === 'passed' ? '✓' : ''}</span>
          </li>
        ))}
      </ol>

      <div className="battle">
        <div className="stack-col">
          <StackView title="Стек: вървят надясно" minSlots={3} items={step.stack.map((i) => ({ key: String(i), label: `${a[i]} →`, tone: i === p ? 'bad' : undefined }))} />
        </div>
        <div className="arena" aria-live="polite">
          {step.duel ? (
            <>
              <span className="fighter right">{a[p]} →</span>
              <span className="vs">⚔</span>
              <span className="fighter left">← {-a[q]}</span>
            </>
          ) : <span className="muted small-inline">върхът на стека срещу началото на опашката</span>}
        </div>
        <div className="queue-col">
          <p className="queue-title">Опашка: групата наляво</p>
          <div className="deque">
            <span className="muted small-inline">начало</span>
            {step.queue.length ? step.queue.map((i) => <span key={i} className={`dq-cell${i === q ? ' fight' : ''}`}><b>← {-a[i]}</b></span>) : <span className="muted">празна</span>}
          </div>
        </div>
      </div>

      {step.result && <p className="verdict good">Преминаха: <code>{step.result.length ? step.result.join(' ') : '(никой)'}</code></p>}
    </TracePanel>
  );
}
