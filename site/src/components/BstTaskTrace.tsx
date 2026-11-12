import { useMemo, useState } from 'react';
import type { ReactElement } from 'react';
import {
  deleteTrace,
  insertTrace,
  iteratorTrace,
  kthTrace,
  parseOps,
  parseValues,
  searchTrace,
  serializeTrace,
  sortedTrace,
  treeOf,
  validateTrace,
  type BstStep,
} from '../lib/bst';
import { layout, parseLevelArray, type Cell } from '../lib/tree';
import { QueueView, TreeDiagram, COLW, ROWH } from './TreeDiagram';
import { StackView } from './StackView';
import { TokenTape } from './TokenTape';
import { TracePanel } from './TracePanel';
import { useStepper } from './useStepper';

export type BstTask = 'validate' | 'kth' | 'serialize' | 'sorted' | 'search' | 'insert' | 'delete' | 'iterator' | 'iterator2';

/* The tree (or the sorted sequence) each task starts from. */
const DEFAULT_TREE: Record<BstTask, string> = {
  validate: '5 1 4 null null 3 6',
  kth: '5 3 6 2 4 null null 1',
  serialize: '5 3 8 2 4 7',
  sorted: '-10 -3 0 5 9',
  search: '4 2 7 1 3',
  insert: '40 20 60 10 30 50 70',
  delete: '5 3 6 2 4 null 7',
  iterator: '7 3 15 null null 9 20',
  iterator2: '7 3 15 null null 9 20',
};

const TREE_PRESETS: Record<BstTask, string[]> = {
  validate: ['2 1 3', '5 1 4 null null 3 6', '10 5 15 1 12', '2 2', '5 3 8 1 4 7 9'],
  kth: ['3 1 4 null 2', '5 3 6 2 4 null null 1', '8 4 12 2 6 10 14'],
  serialize: ['2 1 3', '5 3 8 2 4 7', '1 null 2 null 3', '4 2 6 1 3 5 7'],
  sorted: ['-10 -3 0 5 9', '1 2 3 4 5 6 7', '1 2', '1 2 3 4 5 6 7 8 9 10'],
  search: ['4 2 7 1 3', '8 4 12 2 6 10 14', '1 null 2 null 3 null 4'],
  insert: ['4 2 7 1 3', '40 20 60 10 30 50 70', '1 null 2 null 3'],
  delete: ['5 3 6 2 4 null 7', '5 3 8 2 4 7 9 null null null null 6', '2 1', '5 3 6 2 4 null null 1'],
  iterator: ['7 3 15 null null 9 20', '4 2 6 1 3 5 7', '1 null 2 null 3'],
  iterator2: ['7 3 15 null null 9 20', '4 2 6 1 3 5 7'],
};

/** The second input: the value a task works with, or the calls an iterator gets. */
const DEFAULT_ARG: Partial<Record<BstTask, string>> = {
  kth: '3',
  search: '2',
  insert: '25',
  delete: '3',
  iterator: 'next next hasNext next next hasNext',
  iterator2: 'next next prev next hasNext next next next prev prev',
};

const ARG_LABEL: Partial<Record<BstTask, string>> = {
  kth: 'k',
  search: 'търсим',
  insert: 'вмъкваме',
  delete: 'трием',
  iterator: 'извиквания',
  iterator2: 'извиквания',
};

const ARG_PRESETS: Partial<Record<BstTask, string[]>> = {
  iterator: ['next next hasNext next next hasNext', 'next next next next next hasNext'],
  iterator2: ['next next prev next hasNext next next next prev prev', 'next next next prev prev hasPrev next'],
};

const TREE_LABEL: Record<BstTask, string> = {
  validate: 'дърво',
  kth: 'дърво',
  serialize: 'дърво',
  sorted: 'сортиран списък',
  search: 'дърво',
  insert: 'дърво',
  delete: 'дърво',
  iterator: 'дърво',
  iterator2: 'дърво',
};

const OUT_LABEL: Record<BstTask, string> = {
  validate: 'isValidBST',
  kth: 'inorder дотук',
  serialize: 'низ',
  sorted: 'inorder',
  search: 'резултат',
  insert: 'резултат',
  delete: 'резултат',
  iterator: 'извиквания',
  iterator2: 'извиквания',
};

const steps = (task: BstTask, input: string, arg: string): BstStep[] => {
  if (task === 'sorted') return [...sortedTrace(parseValues(input).sort((a, b) => a - b))];
  const tree = parseLevelArray(input);
  switch (task) {
    case 'validate':
      return [...validateTrace(tree)];
    case 'kth':
      return [...kthTrace(tree, Number(arg) || 0)];
    case 'serialize':
      return [...serializeTrace(tree)];
    case 'search':
      return [...searchTrace(tree, Number(arg) || 0)];
    case 'insert':
      return [...insertTrace(tree, Number(arg) || 0)];
    case 'delete':
      return [...deleteTrace(tree, Number(arg) || 0)];
    default:
      return [...iteratorTrace(tree, parseOps(arg, task === 'iterator2'), task === 'iterator2')];
  }
};

export default function BstTaskTrace({ task }: { task: BstTask }): ReactElement {
  const [input, setInput] = useState(DEFAULT_TREE[task]);
  const [arg, setArg] = useState(DEFAULT_ARG[task] ?? '');

  const run = useMemo(() => {
    const list = steps(task, input, arg);
    const cells = list.map((step) => layout(treeOf(step.nodes, step.root)));
    const all = cells.flatMap((map) => [...map.values()]);
    const widest = Math.max(0, ...all.map((c: Cell) => c.col));
    const deepest = Math.max(0, ...all.map((c: Cell) => c.row));
    return { list, cells, width: Math.round((widest + 1) * COLW), height: Math.round((deepest + 1) * ROWH) };
  }, [task, input, arg]);

  const st = useStepper(run.list, 900);
  const index = Math.min(st.index, run.list.length - 1);
  const step = run.list[index];
  const cells = run.cells[index];
  const stacks = step.aux.filter((p) => p.shape === 'stack');
  const rows = step.aux.filter((p) => p.shape !== 'stack');
  const numeric = task === 'kth' || task === 'search' || task === 'insert' || task === 'delete';

  const diagram = (
    <TreeDiagram
      nodes={step.nodes}
      cells={cells}
      marks={step.marks}
      badges={step.badges}
      label={`Дърво: ${input}`}
      stubs={false}
      minWidth={Math.max(240, run.width)}
      minHeight={run.height}
    />
  );

  return (
    <TracePanel
      stepper={st}
      label={task}
      message={step.message}
      kind={step.kind}
      inputs={
        <>
          <div className="presets" role="group" aria-label="Примери">
            {TREE_PRESETS[task].map((preset) => (
              <button key={preset} type="button" aria-pressed={preset === input} onClick={() => setInput(preset)}>
                <code>{preset}</code>
              </button>
            ))}
          </div>
          <label className="param grow">
            {TREE_LABEL[task]} <input type="text" value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false} />
          </label>
          {ARG_LABEL[task] && numeric && (
            <label className="param">
              {ARG_LABEL[task]} <input type="number" value={arg} onChange={(e) => setArg(e.target.value)} />
            </label>
          )}
          {ARG_PRESETS[task] && (
            <div className="presets" role="group" aria-label="Извиквания">
              {ARG_PRESETS[task]!.map((preset) => (
                <button key={preset} type="button" aria-pressed={preset === arg} onClick={() => setArg(preset)}>
                  <code>{preset}</code>
                </button>
              ))}
            </div>
          )}
          {ARG_LABEL[task] && !numeric && (
            <label className="param grow">
              {ARG_LABEL[task]} <input type="text" value={arg} onChange={(e) => setArg(e.target.value)} spellCheck={false} />
            </label>
          )}
        </>
      }
    >
      {step.tape !== undefined && step.tape.length > 0 && <TokenTape tokens={step.tape} at={step.at ?? -1} matched={step.span ?? []} />}
      {stacks.length ? (
        <div className="trace-body">
          {diagram}
          <div className="tn-side">
            {stacks.map((p) => (
              <StackView
                key={p.label}
                title={p.label}
                minSlots={3}
                items={p.items.map((v, i) => ({ key: `${i}-${v}`, label: v, tone: i === p.items.length - 1 ? 'ok' : undefined }))}
              />
            ))}
          </div>
        </div>
      ) : (
        diagram
      )}
      {rows.length > 0 && (
        <div className="bst-rows">
          {rows.map((p) => (
            <QueueView key={p.label} title={p.label} items={p.items} plain empty="празен" />
          ))}
        </div>
      )}

      {step.out.length > 0 && (
        <p className="tn-out">
          <span>{OUT_LABEL[task]}</span> <code>{step.out.join(task === 'iterator' || task === 'iterator2' ? ' · ' : ', ')}</code>
        </p>
      )}
      {step.result !== undefined && (
        <p className="tn-out">
          <span>отговор</span> <code>{step.result}</code>
        </p>
      )}
    </TracePanel>
  );
}
