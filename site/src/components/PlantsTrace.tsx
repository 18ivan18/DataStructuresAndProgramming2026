import { useMemo, useState } from 'react';
import { collect, plantsTrace } from '../lib/traces';
import { StackView } from './StackView';
import { Presets, TracePanel } from './TracePanel';
import { useStepper } from './useStepper';

const PRESETS = ['3 6 2 7 5', '6 5 8 4 7 10 9', '3 4 1 5 1', '9 1 8 7 6 5 4 3'];
const MAX = 16;

export default function PlantsTrace() {
  const [input, setInput] = useState(PRESETS[0]);
  const p = input.trim().split(/\s+/).map(Number).filter((x) => Number.isFinite(x)).slice(0, MAX);
  const steps = useMemo(() => collect(plantsTrace(p.length ? p : [0])), [p.join(' ')]);
  const st = useStepper(steps);
  const step = st.step;

  const stackOf: Record<number, number> = {};
  step.stack.forEach((run, k) => run.forEach((x) => (stackOf[x.at] = k)));
  const dying = new Set(step.dying ?? []);
  const top = Math.max(1, ...p);
  const cmp = step.compare;

  return (
    <TracePanel stepper={st} label="Отровни цветя" message={step.message} kind={step.kind} inputs={<Presets presets={PRESETS} value={input} onChange={setInput} label={`или свои (до ${MAX}):`} />}>
      <p className="day-badge">{step.day === 0 ? 'Подготовка' : `Ден ${step.day}`}</p>
      <ol className="garden" aria-label="Цветята, отляво надясно">
        {p.map((v, i) => {
          const dead = step.died[i];
          const state = dying.has(i) ? 'dying' : dead !== undefined ? 'dead' : 'alive';
          const k = stackOf[i];
          return (
            <li key={i} className={`plant ${state}${k !== undefined ? ` s${k % 2}` : ''}`} title={`p[${i}] = ${v}`}>
              <span className="stem" style={{ height: `${(v / top) * 100}%` }} />
              <span className="pv">{v}</span>
              <span className="pi">{dead !== undefined ? `† ден ${dead}` : `p[${i}]`}</span>
            </li>
          );
        })}
      </ol>
      <div className="stacks-row">
        {step.stack.map((run, k) => (
          <div key={run.map((x) => x.at).join('-')} className={`stack-col${cmp && (k === cmp.left || k === cmp.right) ? (cmp.merge ? ' cmp merge' : ' cmp') : ''}`}>
            <StackView
              title={`стек ${k + 1}`}
              minSlots={1}
              items={[...run].reverse().map((x) => ({ key: String(x.at), label: String(x.value), sub: `p[${x.at}]`, tone: dying.has(x.at) ? 'bad' : undefined }))}
            />
          </div>
        ))}
      </div>
      {step.kind === 'ok' && <p className="verdict good">Отговор: <b>{String(step.result)}</b></p>}
    </TracePanel>
  );
}
