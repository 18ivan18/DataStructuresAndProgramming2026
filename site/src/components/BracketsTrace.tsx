import { useMemo, useState } from 'react';
import { bracketsTrace, collect } from '../lib/traces';
import { StackView } from './StackView';
import { TokenTape } from './TokenTape';
import { Presets, TracePanel } from './TracePanel';
import { useStepper } from './useStepper';

const PRESETS = ['{[]}', '()[]{}', '([)]', '(]', '((([[{}]])))', '()(()'];

export default function BracketsTrace() {
  const [input, setInput] = useState('{[]}');
  const s = input.replace(/\s+/g, '');
  const steps = useMemo(() => collect(bracketsTrace(s)), [s]);
  const st = useStepper(steps);
  const step = st.step;

  // Every pair matched so far stays highlighted.
  const matched = steps.slice(0, st.index + 1).flatMap((x) => x.matched ?? []);

  return (
    <TracePanel stepper={st} label="Валидни скоби" message={step.message} kind={step.kind} inputs={<Presets presets={PRESETS} value={input} onChange={setInput} label="или напиши свои:" />}>
      <div className="trace-body">
        <div>
          <TokenTape tokens={[...s]} at={step.at} matched={matched} bad={step.bad} />
          {step.result !== undefined && <p className={`verdict ${step.result ? 'good' : 'bad'}`}>{step.result ? 'true: валиден' : 'false: невалиден'}</p>}
        </div>
        <StackView title="Стек от отварящи скоби" items={step.stack.map((b) => ({ key: String(b.at), label: b.ch, sub: `поз. ${b.at}`, tone: step.bad?.includes(b.at) ? 'bad' : undefined }))} />
      </div>
    </TracePanel>
  );
}
