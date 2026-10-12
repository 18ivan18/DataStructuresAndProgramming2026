import { useMemo, useState } from 'react';
import { collect, rpnTrace } from '../lib/traces';
import { StackView } from './StackView';
import { TokenTape } from './TokenTape';
import { Presets, TracePanel } from './TracePanel';
import { useStepper } from './useStepper';

const PRESETS = ['2 1 + 3 *', '4 13 5 / +', '10 6 9 3 + -11 * / * 17 + 5 +', '7 -2 /'];

export default function RpnTrace() {
  const [input, setInput] = useState(PRESETS[0]);
  const tokens = input.trim().split(/\s+/).filter(Boolean);
  const steps = useMemo(() => collect(rpnTrace(tokens)), [input]);
  const st = useStepper(steps);
  const step = st.step;

  // Key each value by the step that put it there, so a result visibly replaces its two operands.
  const born: number[] = [];
  steps.slice(0, st.index + 1).forEach((x, i) => {
    if (x.kind === 'push') born.push(i);
    if (x.kind === 'apply') born.splice(-2, 2, i);
  });
  const items = step.stack.map((v, depth) => ({
    key: String(born[depth]),
    label: String(v),
    tone: step.applied && depth === step.stack.length - 1 ? ('ok' as const) : undefined,
  }));

  return (
    <TracePanel stepper={st} label="Обратен полски запис" message={step.message} kind={step.kind} inputs={<Presets presets={PRESETS} value={input} onChange={setInput} label="или свой (с интервали):" />}>
      <div className="trace-body">
        <div>
          <TokenTape tokens={tokens} at={step.at} bad={step.kind === 'error' && step.at < tokens.length ? [step.at] : []} />
          {step.applied && (
            <p className="applied">
              <code>{step.applied.left} {step.applied.op} {step.applied.right} = {step.applied.value}</code>
              {step.applied.op === '/' && step.applied.left % step.applied.right !== 0 && (
                <span className="muted"> (C++ отрязва към нулата: {step.applied.left} / {step.applied.right} = {(step.applied.left / step.applied.right).toFixed(2)} → {step.applied.value})</span>
              )}
            </p>
          )}
          {step.kind === 'ok' && <p className="verdict good">Резултат: <b>{String(step.result)}</b></p>}
        </div>
        <StackView title="Стек от числа" items={items} />
      </div>
    </TracePanel>
  );
}
