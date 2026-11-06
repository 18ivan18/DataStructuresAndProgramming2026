import { useMemo, useState } from 'react';
import type { ReactElement } from 'react';
import {
  exprTreeTrace,
  giftsTrace,
  layout,
  levelOrderTrace,
  parseEdges,
  parseLevelArray,
  pathsTrace,
  traversalTrace,
  type Cell,
  type Mode,
  type Order,
  type TNode,
  type TreeStep,
} from '../lib/tree';
import { QueueView, TreeDiagram } from './TreeDiagram';
import { StackView } from './StackView';
import { TracePanel } from './TracePanel';
import { useStepper } from './useStepper';

type Task = 'traverse' | 'levels' | 'zigzag' | 'right' | 'paths' | 'expr' | 'gifts';

const DEFAULT_INPUT: Record<Task, string> = {
  traverse: '1 null 2 3',
  levels: '3 9 20 null null 15 7',
  zigzag: '3 9 20 null null 15 7',
  right: '1 2 3 null 5 null 4',
  paths: '1 2 3 null 5',
  expr: '2-3/(5*2)+1',
  gifts: '0 1, 0 2, 1 3, 1 4, 1 5, 1 6, 4 7, 7 8',
};

const PRESETS: Partial<Record<Task, string[]>> = {
  traverse: ['1 null 2 3', '1 2 3 4 5 null 6', '1', '1 2'],
  levels: ['3 9 20 null null 15 7', '1 2 3 4 5 6 7', '1 2 null 3 null 4'],
  zigzag: ['3 9 20 null null 15 7', '1 2 3 4 5 6 7'],
  right: ['1 2 3 null 5 null 4', '1 null 3', '1 2 3 4'],
  paths: ['1 2 3 null 5', '1', '1 2 null 3 null 4'],
  expr: ['2-3/(5*2)+1', '3*4-2*5', '1+2+3+4+5', '2*(3+4)'],
  gifts: ['0 1, 0 2, 1 3, 1 4, 1 5, 1 6, 4 7, 7 8', '0 1, 1 2, 2 3, 3 4', '0 1, 0 2, 0 3'],
};

const INPUT_LABEL: Record<Task, string> = {
  traverse: 'дърво',
  levels: 'дърво',
  zigzag: 'дърво',
  right: 'дърво',
  paths: 'дърво',
  expr: 'израз',
  gifts: 'двойки началник–подчинен',
};

const VARIANTS: [Order, Mode, string][] = [
  ['pre', 'rec', 'preorder'],
  ['in', 'rec', 'inorder'],
  ['post', 'rec', 'postorder'],
  ['in', 'iter', 'inorder без рекурсия'],
];

const blank = (message: string): TreeStep => ({ kind: 'error', message, marks: {}, aux: [], out: [] });

export default function TreeTaskTrace({ task }: { task: Task }): ReactElement {
  const [input, setInput] = useState(DEFAULT_INPUT[task]);
  const [variant, setVariant] = useState(task === 'traverse' ? 1 : 0);

  const { steps, cells, nodes } = useMemo((): { steps: TreeStep[]; cells: Map<number, Cell>; nodes: TNode[] } => {
    if (task === 'expr') {
      const run = exprTreeTrace(input);
      return { steps: run.steps, cells: layout(run.tree), nodes: [...run.tree.nodes.values()] };
    }
    const tree = task === 'gifts' ? parseEdges(input) : parseLevelArray(input);
    const nodes = [...tree.nodes.values()];
    const cells = layout(tree);
    if (!nodes.length && task === 'gifts') return { steps: [blank('Въведи поне една двойка числа.')], cells, nodes };
    const gen =
      task === 'gifts'
        ? giftsTrace(tree)
        : task === 'paths'
          ? pathsTrace(tree)
          : task === 'traverse'
            ? traversalTrace(tree, VARIANTS[variant][0], VARIANTS[variant][1])
            : levelOrderTrace(tree, task === 'levels' ? 'levels' : task === 'zigzag' ? 'zigzag' : 'right');
    return { steps: [...gen], cells, nodes };
  }, [input, variant, task]);

  const st = useStepper(steps, 850);
  const step = st.step;
  const shown = step.nodes ?? nodes;
  const side = step.aux.length > 0;

  const diagram = (
    <TreeDiagram nodes={shown} cells={cells} marks={step.marks} badges={step.badges} label={`Дърво: ${input}`} minWidth={task === 'gifts' ? 300 : 240} />
  );

  return (
    <TracePanel
      stepper={st}
      label={task}
      message={step.message}
      kind={step.kind}
      inputs={
        <>
          {PRESETS[task] && (
            <div className="presets" role="group" aria-label="Примери">
              {PRESETS[task]!.map((p) => (
                <button key={p} type="button" aria-pressed={p === input} onClick={() => setInput(p)}>
                  <code>{p}</code>
                </button>
              ))}
            </div>
          )}
          <label className="param grow">
            {INPUT_LABEL[task]} <input type="text" value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false} />
          </label>
          {task === 'traverse' && (
            <div className="presets" role="group" aria-label="Обхождане">
              {VARIANTS.map(([, , name], i) => (
                <button key={name} type="button" aria-pressed={i === variant} onClick={() => setVariant(i)}>
                  {name}
                </button>
              ))}
            </div>
          )}
        </>
      }
    >
      {side ? (
        <div className="trace-body">
          {diagram}
          <div className="tn-side">
            {step.aux.map((p) =>
              p.shape === 'stack' ? (
                <StackView
                  key={p.label}
                  title={p.label}
                  minSlots={3}
                  items={p.items.map((v, i) => ({ key: `${i}-${v}`, label: v, tone: i === p.items.length - 1 ? 'ok' : undefined }))}
                />
              ) : (
                <QueueView key={p.label} title={p.label} items={p.items} plain={p.shape === 'row'} />
              ),
            )}
          </div>
        </div>
      ) : (
        diagram
      )}

      {step.out.length > 0 && (
        <p className="tn-out">
          <span>резултат</span> <code>[{step.out.join(', ')}]</code>
        </p>
      )}
      {step.levels !== undefined && step.levels.length > 0 && (
        <div className="tn-out">
          <span>нива</span>
          <code>
            {step.levels.map((l, i) => (
              <span key={i}>
                [{l.join(', ')}]{i < step.levels!.length - 1 ? ', ' : ''}
              </span>
            ))}
          </code>
        </div>
      )}
      {step.paths !== undefined && step.paths.length > 0 && (
        <p className="tn-out">
          <span>пътища</span> <code>{step.paths.map((p) => `"${p}"`).join(', ')}</code>
        </p>
      )}
    </TracePanel>
  );
}
