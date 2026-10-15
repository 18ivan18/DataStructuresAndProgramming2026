import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { DOUBLY, DOUBLY_METHODS, doublyOf, runDoublyOp, type DoublyOp } from '../lib/doubly';
import { emptyList, listValues, runOp, SINGLY, type CodeIndex, type ListOp, type ListState, type ListStep, type OpRun } from '../lib/linked';
import { ListDiagram, sandboxLayouts } from './ListDiagram';
import { TracePanel } from './TracePanel';
import { useStepper } from './useStepper';

/* A linked list class, one method call at a time: pick an operation, run it, and step through the
   header's own lines with every pointer drawn. The list carries over to the next call.
   kind="singly" runs SinglyLinkedList.h (week 4), kind="doubly" DoublyLinkedList.h (week 5). */

type Arg = 'i' | 'x';
interface Config {
  header: string;
  label: string;
  code: CodeIndex;
  methods: string[];
  ops: { op: string; args: Arg[] }[];
  defaultOp: string;
  start: () => ListState;
  run: (s: ListState, call: { op: string; i?: number; x?: number }) => OpRun;
}

const CONFIGS: Record<'singly' | 'doubly', Config> = {
  singly: {
    header: 'SinglyLinkedList.h',
    label: 'Едносвързан списък с указателите first и last',
    code: SINGLY,
    methods: ['pushFront', 'pushBack', 'insertAt', 'popFront', 'removeAt', 'removeAll', 'at', 'find', 'nodeAt'],
    ops: [
      { op: 'pushFront', args: ['x'] }, { op: 'pushBack', args: ['x'] }, { op: 'insertAt', args: ['i', 'x'] }, { op: 'popFront', args: [] },
      { op: 'removeAt', args: ['i'] }, { op: 'removeAll', args: ['x'] }, { op: 'at', args: ['i'] }, { op: 'find', args: ['x'] },
    ],
    defaultOp: 'insertAt',
    start: () => [3, 7, 1, 7].reduce((s, x) => runOp(s, { op: 'pushBack', x }).after, emptyList()),
    run: (s, call) => runOp(s, call as ListOp),
  },
  doubly: {
    header: 'DoublyLinkedList.h',
    label: 'Двусвързан списък с указателите first и last',
    code: DOUBLY,
    methods: DOUBLY_METHODS,
    ops: [
      { op: 'pushFront', args: ['x'] }, { op: 'pushBack', args: ['x'] }, { op: 'insertAt', args: ['i', 'x'] }, { op: 'popFront', args: [] },
      { op: 'popBack', args: [] }, { op: 'removeAt', args: ['i'] }, { op: 'at', args: ['i'] }, { op: 'front', args: [] }, { op: 'back', args: [] }, { op: 'find', args: ['x'] },
    ],
    defaultOp: 'at',
    start: () => doublyOf([4, 8, 15, 16, 23, 42]),
    run: (s, call) => runDoublyOp(s, call as DoublyOp),
  },
};

export default function ListSandbox({ kind = 'singly' }: { kind?: 'singly' | 'doubly' }) {
  const cfg = CONFIGS[kind];
  const [base, setBase] = useState<ListState>(cfg.start);
  const [run, setRun] = useState<OpRun | null>(null);
  const [op, setOp] = useState(cfg.defaultOp);
  const [i, setI] = useState(kind === 'doubly' ? 4 : 2);
  const [x, setX] = useState(5);

  const idle = (s: ListState): ListStep => ({
    kind: 'start',
    message: `Избери операция и натисни „Изпълни“. Ще минем ред по ред през ${cfg.header}.`,
    nodes: s.nodes,
    vars: [['first', s.first], ['last', s.last]],
    changed: [],
    valueChanged: [],
    hops: 0,
  });
  const steps = useMemo(() => (run ? run.steps : [idle(base)]), [run, base]);
  const layouts = useMemo(() => sandboxLayouts(steps), [steps]);
  const st = useStepper(steps, 800);
  const step = st.step;

  const args = cfg.ops.find((o) => o.op === op)!.args;
  const execute = () => {
    const r = cfg.run(base, { op, ...(args.includes('i') ? { i } : {}), ...(args.includes('x') ? { x } : {}) });
    setRun(r);
    setBase(r.after);
  };

  // The method whose lines the current step points at (nodeAt and removeNode run inside others).
  const method = step.line ? cfg.code.methodAt(step.line, cfg.methods) : undefined;
  const [from, to] = method ? cfg.code.methodRange(method) : [0, -1];
  const code = useRef<HTMLPreElement>(null);
  useLayoutEffect(() => {
    const line = code.current?.querySelector<HTMLElement>('.code-line.current');
    if (code.current && line) code.current.scrollTop = line.offsetTop - code.current.offsetTop - code.current.clientHeight / 3;
  }, [step]);

  const shown = run && st.atEnd ? run.after : null;

  return (
    <TracePanel
      stepper={st}
      label={cfg.header}
      message={step.message}
      kind={step.kind}
      inputs={
        <>
          <div className="segmented" role="radiogroup" aria-label="Операция">
            {cfg.ops.map((o) => (
              <button key={o.op} type="button" role="radio" aria-checked={o.op === op} onClick={() => setOp(o.op)}><code>{o.op}</code></button>
            ))}
          </div>
          {args.includes('i') && <label className="param">index <input type="number" value={i} onChange={(e) => setI(Number(e.target.value))} /></label>}
          {args.includes('x') && <label className="param">{op === 'removeAll' || op === 'find' ? 'стойност' : 'el'} <input type="number" value={x} onChange={(e) => setX(Number(e.target.value))} /></label>}
          <button type="button" className="btn primary" onClick={execute}>Изпълни</button>
          <button type="button" className="btn ghost" onClick={() => { setBase(cfg.start()); setRun(null); }}>отначало</button>
        </>
      }
    >
      <div className="list-body">
        <div className="list-main">
          <ListDiagram step={step} pos={layouts[st.index]} label={cfg.label} minWidth={420} />
          <p className="stats">
            {(!run || st.atEnd) && <span>n = <b>{base.n}</b></span>}
            <span><b>{step.hops}</b> стъпки по указатели</span>
            {run && st.atEnd && <span>върна <b>{run.returned}</b></span>}
            {shown && <span>списък: <code>[{listValues(shown).join(', ')}]</code></span>}
          </p>
        </div>
        {method && (
          <pre className="code numbered list-code" ref={code} aria-label={`Кодът на ${method}`}>
            {cfg.code.lines.slice(from - 1, to).map((line, k) => (
              <span key={from + k} className={`code-line${step.line === from + k ? ' current' : ''}`}>
                <span className="ln">{from + k}</span>{line.replace(/\t/g, '    ')}{'\n'}
              </span>
            ))}
          </pre>
        )}
      </div>
    </TracePanel>
  );
}
