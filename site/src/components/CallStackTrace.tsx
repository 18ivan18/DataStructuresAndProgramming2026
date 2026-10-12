import { useMemo, useState } from 'react';
import { collect, FACT_CODE, factorialTrace } from '../lib/traces';
import { StackView } from './StackView';
import { TracePanel } from './TracePanel';
import { useStepper } from './useStepper';

export default function CallStackTrace() {
  const [n, setN] = useState(4);
  const steps = useMemo(() => collect(factorialTrace(n)), [n]);
  const st = useStepper(steps);
  const step = st.step;

  const items = step.stack.map((f, i) => ({
    key: `${f.fn}-${i}`,
    label: f.fn === 'main' ? 'main()' : `fact(n = ${f.n})`,
    sub: f.fn === 'main'
      ? step.kind === 'ok' ? `получи ${step.result}` : `чака fact(${n})`
      : f.got !== undefined ? `${f.n} * ${f.got} = ${f.n * f.got}` : i < step.stack.length - 1 ? `чака fact(${f.n - 1})` : undefined,
    tone: f.fn === 'main' ? ('muted' as const) : undefined,
  }));

  return (
    <TracePanel
      stepper={st}
      label="Стек на извикванията"
      message={step.message}
      kind={step.kind}
      inputs={
        <label className="param">
          <span>fact(<b>{n}</b>)</span>
          <input type="range" min={1} max={7} value={n} onChange={(e) => setN(Number(e.target.value))} aria-label="n" />
        </label>
      }
    >
      <div className="trace-body">
        <pre className="code" aria-label="Код">
          {FACT_CODE.map((line, i) => (
            <span key={i} className={`code-line${step.line === i + 1 ? ' current' : ''}`}>{line}{'\n'}</span>
          ))}
        </pre>
        <StackView title="Стек на извикванията" items={items} minSlots={n + 1} />
      </div>
    </TracePanel>
  );
}
