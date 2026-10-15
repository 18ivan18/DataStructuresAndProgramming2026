import { useMemo, useState } from 'react';
import { cycleTrace, deleteNodeTrace, removeNthTrace, reverseTrace, type ListStep } from '../lib/linked';
import { ListDiagram, rhoLayout, rowLayout, type Pos } from './ListDiagram';
import { TracePanel } from './TracePanel';
import { useStepper } from './useStepper';

/* The week 4 tasks that are pure pointer work, on one diagram: reverse (1), Floyd's cycle
   detection (2), deleting a node you only have a pointer to (6), removing the n-th from the end (7). */

type Task = 'reverse' | 'cycle' | 'delete' | 'nth';

const parse = (s: string) => s.trim().split(/[\s,]+/).map(Number).filter((v) => Number.isInteger(v)).slice(0, 9);

export default function ListTaskTrace({ task }: { task: Task }) {
  const [input, setInput] = useState(task === 'cycle' ? '3 2 0 -4 5 8' : task === 'delete' ? '4 5 1 9' : '1 2 3 4 5');
  const [k, setK] = useState(task === 'cycle' ? 2 : 1);
  const values = parse(input);
  const n = values.length;
  // k means: cycle → pos (-1..n-1); delete → index of the node (0..n-2); nth → n (1..n).
  const kMin = task === 'cycle' ? -1 : task === 'delete' ? 0 : 1;
  const kMax = task === 'cycle' ? n - 1 : task === 'delete' ? n - 2 : n;
  const kk = Math.max(kMin, Math.min(k, kMax));
  const ok = n >= (task === 'delete' ? 2 : 1);

  const { steps, pos } = useMemo((): { steps: ListStep[]; pos: Pos } => {
    if (!ok) return { steps: [{ kind: 'error', message: task === 'delete' ? 'Трябват поне два възела.' : 'Въведи числа.', nodes: [], vars: [], changed: [], valueChanged: [], hops: 0 }], pos: new Map() };
    if (task === 'cycle') {
      const r = cycleTrace(values, kk);
      return { steps: r.steps, pos: rhoLayout(r.ids, kk) };
    }
    const s = task === 'reverse' ? reverseTrace(values) : task === 'delete' ? deleteNodeTrace(values, kk) : removeNthTrace(values, kk);
    // Nodes keep their starting places, so changed arrows are easy to see.
    return { steps: s, pos: rowLayout(s[0].nodes.map((x) => x.id), task === 'reverse' ? 80 : 70) };
  }, [input, kk, task]);
  const st = useStepper(steps, 900);
  const step = st.step;

  const kLabel = task === 'cycle' ? 'pos (накъде сочи последният, -1 = без цикъл)' : task === 'delete' ? 'възел за изтриване' : 'n от края';

  return (
    <TracePanel
      stepper={st}
      label={task}
      message={step.message}
      kind={step.kind}
      inputs={
        <>
          <label className="param">списък <input type="text" value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false} /></label>
          {task !== 'reverse' && ok && (
            <label className="param">
              {kLabel} = <b>{task === 'delete' ? `${values[kk]} (индекс ${kk})` : kk}</b>
              <input type="range" min={kMin} max={kMax} value={kk} onChange={(e) => setK(Number(e.target.value))} />
            </label>
          )}
        </>
      }
    >
      {ok && <ListDiagram step={step} pos={pos} label={`Свързан списък: ${values.join(', ')}`} minWidth={task === 'cycle' ? 300 : 0} />}
      {ok && task === 'cycle' && <p className="muted small">Бавният прави една стъпка, бързият две. Ако има цикъл, бързият влиза в него и рано или късно догонва бавния.</p>}
    </TracePanel>
  );
}
