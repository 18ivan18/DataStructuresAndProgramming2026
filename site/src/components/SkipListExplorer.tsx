import { useMemo, useState } from 'react';
import { add, erase, LEVELS, readmeSkipList, search, type SkipState, type SkipStep } from '../lib/skiplist';
import { TracePanel } from './TracePanel';
import { useStepper } from './useStepper';

/* A skip list drawn level by level: search goes right while the next value is smaller and down
   otherwise; add flips a coin to decide how tall the new element grows; erase unlinks it from
   every level it is on. Starts from the example in the README. */

type Op = 'search' | 'add' | 'erase';
const COL = 54, ROW = 50, CW = 38, CH = 28, LEFT = 62, TOP = 24;

export default function SkipListExplorer() {
  const [base, setBase] = useState<SkipState>(readmeSkipList);
  const [steps, setSteps] = useState<SkipStep[] | null>(null);
  const [op, setOp] = useState<Op>('search');
  const [value, setValue] = useState(80);

  const idle = useMemo<SkipStep[]>(() => [{ kind: 'start', message: 'Избери операция и стойност. Започваме с примера от условието.', towers: base.towers, at: null, path: [], comparisons: 0 }], [base]);
  const shown = steps ?? idle;
  const st = useStepper(shown, 700);
  const step = st.step;

  const run = () => {
    if (op === 'search') setSteps(search(base, value));
    else if (op === 'add') { const r = add(base, value); setSteps(r.steps); setBase(r.after); }
    else { const r = erase(base, value); setSteps(r.steps); setBase(r.after); }
  };
  const addRandom = () => {
    let s = base;
    for (let k = 0; k < 8; k++) s = add(s, 10 + Math.floor(((s.seed >> 8) % 90))).after;
    setBase(s);
    setSteps(null);
  };

  const towers = step.towers;
  const x = (k: number) => LEFT + (k + 1) * COL; // k = -1 is the head
  const y = (L: number) => TOP + (LEVELS - 1 - L) * ROW;
  const colOf = new Map(towers.map((t, k) => [t.id, k]));
  const onPath = new Set(step.path);
  const W = x(towers.length) + 30, H = y(0) + CH + 16;

  const cell = (id: number, L: number, label: string) => {
    const k = id === 0 ? -1 : colOf.get(id)!;
    const here = step.at && step.at.id === id && step.at.level === L;
    return (
      <g key={`${id}:${L}`} className={`sk-cell${id === 0 ? ' head' : ''}${onPath.has(`${id}:${L}`) ? ' path' : ''}${here ? ' here' : ''}`} transform={`translate(${x(k)},${y(L)})`}>
        <rect x={-CW / 2} y={0} width={CW} height={CH} rx={5} />
        <text x={0} y={CH / 2}>{label}</text>
      </g>
    );
  };

  return (
    <TracePanel
      stepper={st}
      label="Skip list"
      message={step.message}
      kind={step.kind}
      inputs={
        <>
          <div className="segmented" role="radiogroup" aria-label="Операция">
            {(['search', 'add', 'erase'] as Op[]).map((o) => (
              <button key={o} type="button" role="radio" aria-checked={o === op} onClick={() => setOp(o)}><code>{o}</code></button>
            ))}
          </div>
          <label className="param">стойност <input type="number" value={value} onChange={(e) => setValue(Number(e.target.value))} /></label>
          <button type="button" className="btn primary" onClick={run}>Изпълни</button>
          <button type="button" className="btn" onClick={addRandom}>+8 произволни</button>
          <button type="button" className="btn ghost" onClick={() => { setBase(readmeSkipList()); setSteps(null); }}>примерът</button>
        </>
      }
    >
      <div className="diagram-scroll">
        <svg className="skiplist" viewBox={`0 0 ${W} ${H}`} style={{ minWidth: Math.min(W, 900) * 0.8 }} role="img" aria-label={`Skip list с ${towers.length} елемента и ${LEVELS} нива`}>
          <defs><marker id="sk-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" className="sk-ah" /></marker></defs>
          {Array.from({ length: LEVELS }, (_, L) => {
            // Level L links the head and every tower taller than L.
            const chain = [-1, ...towers.map((t, k) => (t.height > L ? k : -2)).filter((k) => k >= 0)];
            return (
              <g key={L} className="sk-level">
                <text x={4} y={y(L) + CH / 2} className="sk-level-label">ниво {L + 1}</text>
                {chain.map((k, c) => {
                  const nextK = chain[c + 1];
                  const x1 = x(k) + CW / 2, x2 = nextK !== undefined ? x(nextK) - CW / 2 - 3 : x1 + 18;
                  return <line key={k} x1={x1} x2={x2} y1={y(L) + CH / 2} y2={y(L) + CH / 2} className={nextK === undefined ? 'sk-null' : 'sk-link'} markerEnd={nextK === undefined ? undefined : 'url(#sk-arrow)'} />;
                })}
              </g>
            );
          })}
          {towers.map((t, k) => t.height > 1 && <line key={`d${t.id}`} x1={x(k)} x2={x(k)} y1={y(t.height - 1) + CH} y2={y(0)} className="sk-down" />)}
          {Array.from({ length: LEVELS }, (_, L) => cell(0, L, 'head'))}
          {towers.flatMap((t) => Array.from({ length: t.height }, (_, L) => cell(t.id, L, String(t.val))))}
        </svg>
      </div>
      <p className="stats">
        <span><b>{towers.length}</b> елемента</span>
        <span><b>{step.comparisons}</b> сравнения</span>
        {step.flips && <span>монета: {step.flips.length ? step.flips.map((f, i) => <b key={i} className={f ? 'coin heads' : 'coin tails'}>{f ? 'ези' : 'тура'}</b>) : '—'}</span>}
      </p>
    </TracePanel>
  );
}
