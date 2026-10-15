import { useMemo, useState } from 'react';
import { filterTrace, FILTERS, mapTrace, MAPS, reduceTrace, REDUCES, type HofStep } from '../lib/hof';
import { collect } from '../lib/traces';
import { TokenTape } from './TokenTape';
import { TracePanel } from './TracePanel';
import { useStepper } from './useStepper';

type Kind = 'map' | 'filter' | 'reduce';

const FUNCS = {
  map: Object.entries(MAPS).map(([id, f]) => ({ id, label: f.label, show: f.show })),
  filter: Object.entries(FILTERS).map(([id, f]) => ({ id, label: f.label, show: f.show })),
  reduce: Object.entries(REDUCES).map(([id, f]) => ({ id, label: f.label, show: `начало ${typeof f.init === 'string' ? '""' : f.init}` })),
};

export default function HofTrace() {
  const [kind, setKind] = useState<Kind>('reduce');
  const [fid, setFid] = useState('add');
  const [input, setInput] = useState('1 2 3');
  const arr = input.trim().split(/[\s,]+/).map(Number).filter((x) => Number.isFinite(x)).slice(0, 12);

  const steps = useMemo<HofStep[]>(() => {
    if (kind === 'map') return collect(mapTrace(arr, fid as keyof typeof MAPS));
    if (kind === 'filter') return collect(filterTrace(arr, fid as keyof typeof FILTERS));
    return collect(reduceTrace(arr, fid as keyof typeof REDUCES));
  }, [kind, fid, arr.join(' ')]);
  const st = useStepper(steps);
  const step = st.step;

  const pick = (k: Kind) => {
    setKind(k);
    setFid(FUNCS[k][0].id);
  };
  const decided = steps.slice(1, st.index + 1).filter((s) => s.kind === 'drop').map((s) => s.at);

  return (
    <TracePanel
      stepper={st}
      label={kind}
      message={step.message}
      kind={step.kind === 'drop' ? 'error' : step.kind === 'ok' ? 'ok' : 'push'}
      inputs={
        <>
          <div className="segmented" role="radiogroup" aria-label="Функция от по-висок ред">
            {(['map', 'filter', 'reduce'] as Kind[]).map((k) => (
              <button key={k} type="button" role="radio" aria-checked={k === kind} onClick={() => pick(k)}><code>{k}</code></button>
            ))}
          </div>
          <div className="presets" role="group" aria-label="Функция, която се подава">
            {FUNCS[kind].map((f) => (
              <button key={f.id} type="button" aria-pressed={f.id === fid} onClick={() => setFid(f.id)}>
                <code>{f.label}</code> <span className="muted">{f.show}</span>
              </button>
            ))}
          </div>
          <label className="param">
            масив
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false} />
          </label>
        </>
      }
    >
      <div className="hof-body">
        <div className="hof-row">
          <span className="hof-label">вход</span>
          <TokenTape tokens={arr.map(String)} at={step.at} bad={decided} />
        </div>
        <div className="hof-applied">{step.applied ? <code>{step.applied}</code> : <span className="muted">…</span>}</div>
        {kind === 'reduce' ? (
          <div className="hof-row">
            <span className="hof-label">акумулатор</span>
            <div className="acc">
              <code className="acc-value">{typeof step.acc === 'string' ? `"${step.acc}"` : String(step.acc)}</code>
              <code className="acc-expr">= {step.expr}</code>
            </div>
          </div>
        ) : (
          <div className="hof-row">
            <span className="hof-label">нов масив</span>
            {step.out.length ? (
              <ol className="tape" aria-label="Нов масив">
                {step.out.map((v, i) => (
                  <li key={i} className={`tape-cell${i === step.out.length - 1 && (step.kind === 'apply' || step.kind === 'keep') ? ' current' : ''}`}>{v}</li>
                ))}
              </ol>
            ) : <span className="muted">[ ]</span>}
          </div>
        )}
      </div>
    </TracePanel>
  );
}
