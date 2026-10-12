import type { ReactNode } from 'react';
import { StepControls, stepperKeys } from './StepControls';
import type { Stepper } from './useStepper';

/* Frame shared by every step-through widget: inputs on top, the transport bar, the current
   message, then the widget's own picture. */
export function TracePanel({ stepper, label, inputs, message, kind, children }: {
  stepper: Stepper<unknown>;
  label: string;
  inputs?: ReactNode;
  message: string;
  kind: string;
  children: ReactNode;
}) {
  return (
    <div className="playground" tabIndex={-1} onKeyDown={stepperKeys(stepper)}>
      {inputs && <div className="pg-options">{inputs}</div>}
      <StepControls stepper={stepper} label={label} />
      <p className={`now ${kind}`} aria-live="polite">{message}</p>
      {children}
    </div>
  );
}

/* Example buttons plus a free-text field: pick one of ours, or type your own. */
export function Presets({ presets, value, onChange, label }: { presets: string[]; value: string; onChange: (v: string) => void; label: string }) {
  return (
    <>
      <div className="presets" role="group" aria-label="Примери">
        {presets.map((p) => (
          <button key={p} type="button" aria-pressed={p === value} onClick={() => onChange(p)}>
            <code>{p}</code>
          </button>
        ))}
      </div>
      <label className="param grow">
        {label}
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} spellCheck={false} />
      </label>
    </>
  );
}
