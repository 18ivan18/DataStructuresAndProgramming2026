import { useMemo, useState } from 'react';
import type { ReactElement } from 'react';
import { kGroupTrace, oddEvenTrace, palindromeTrace, partitionTrace, reorderTrace, shuffleTrace, type PrepRun, type PrepStep } from '../lib/week06';
import { ListDiagram, SLOT, rowLayout, type Pos } from './ListDiagram';
import { StackView } from './StackView';
import { TracePanel } from './TracePanel';
import { useStepper } from './useStepper';

type Task = 'kgroup' | 'palindrome' | 'reorder' | 'oddeven' | 'partition' | 'shuffle';

const DEFAULT_INPUT: Record<Task, string> = {
  kgroup: '1 2 3 4 5',
  palindrome: '1 2 3 2 1',
  reorder: '1 2 3 4 5',
  oddeven: '2 1 3 5 6 4 7',
  partition: '1 4 3 2 5 2',
  shuffle: '1 2 3 4 5',
};

const LANE_LABEL: Partial<Record<Task, [string, string]>> = {
  partition: ['по-малките', 'останалите'],
  oddeven: ['нечетни позиции', 'четни позиции'],
};

const parse = (text: string): number[] =>
  text
    .trim()
    .split(/[\s,]+/)
    .map(Number)
    .filter((v) => Number.isInteger(v))
    .slice(0, 9);

function laneLayout(ids: number[], lanes: number[], dummies?: number[]): Pos {
  const pos: Pos = new Map();
  const left = dummies ? 150 : 56;
  dummies?.forEach((id, i) => pos.set(id, { x: 54, y: i === 0 ? 46 : 150 }));
  const used = [0, 0];
  ids.forEach((id, i) => {
    const lane = lanes[i];
    pos.set(id, { x: left + used[lane] * SLOT, y: lane === 0 ? 46 : 150 });
    used[lane]++;
  });
  return pos;
}

const blank = (message: string): PrepStep => ({ kind: 'error', message, nodes: [], vars: [], changed: [], valueChanged: [], hops: 0 });

export default function PrepTaskTrace({ task }: { task: Task }): ReactElement {
  const [input, setInput] = useState(DEFAULT_INPUT[task]);
  const [k, setK] = useState(task === 'partition' ? 3 : 2);
  const values = parse(input);
  const n = values.length;
  const kMax = task === 'kgroup' ? Math.max(1, n) : 9;
  const kk = Math.max(1, Math.min(k, kMax));
  const ok = n >= 1;

  const { steps, pos } = useMemo((): { steps: PrepStep[]; pos: Pos } => {
    if (!ok) return { steps: [blank('Въведи поне едно число.')], pos: new Map() };
    const run: PrepRun =
      task === 'kgroup'
        ? kGroupTrace(values, kk)
        : task === 'palindrome'
          ? palindromeTrace(values)
          : task === 'reorder'
            ? reorderTrace(values)
            : task === 'oddeven'
              ? oddEvenTrace(values)
              : task === 'partition'
                ? partitionTrace(values, kk)
                : shuffleTrace(values);
    return { steps: run.steps, pos: run.lanes ? laneLayout(run.ids, run.lanes, run.dummies) : rowLayout(run.ids, 70) };
  }, [input, kk, task]);

  const st = useStepper(steps, 900);
  const step = st.step;
  const lanes = LANE_LABEL[task];
  const diagram = ok && <ListDiagram step={step} pos={pos} label={`Свързан списък: ${values.join(', ')}`} minWidth={task === 'partition' ? 360 : 0} />;

  return (
    <TracePanel
      stepper={st}
      label={task}
      message={step.message}
      kind={step.kind}
      inputs={
        <>
          <label className="param">
            списък <input type="text" value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false} />
          </label>
          {(task === 'kgroup' || task === 'partition') && ok && (
            <label className="param">
              {task === 'kgroup' ? 'k' : 'x'} = <b>{kk}</b>
              <input type="range" min={1} max={kMax} value={kk} onChange={(e) => setK(Number(e.target.value))} />
            </label>
          )}
        </>
      }
    >
      {step.stack !== undefined ? (
        <div className="trace-body">
          {diagram}
          <StackView title="Стек: първата половина" minSlots={3} items={step.stack.map((v, i) => ({ key: `${i}-${v}`, label: String(v), tone: i === step.stack!.length - 1 ? 'ok' : undefined }))} />
        </div>
      ) : (
        diagram
      )}
      {ok && lanes && (
        <p className="muted small">
          Горната верига е {lanes[0]}, долната — {lanes[1]}. Възлите стоят на местата си: променят се само стрелките.
        </p>
      )}
    </TracePanel>
  );
}
