import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { hex, pointersTrace, POINTERS_CODE, swapTrace, SWAP_CODE, type Block, type Var } from '../lib/memory';
import { TracePanel } from './TracePanel';
import { useStepper } from './useStepper';

/* Stack and heap after each line of pointers.cpp, with an arrow for every pointer.
   Arrows are measured from the rendered boxes, so they follow any layout. */

const TRACES = {
  pointers: { steps: pointersTrace, code: [POINTERS_CODE] },
  swap: { steps: swapTrace, code: SWAP_CODE.segments },
};

interface Arrow {
  d: string;
  dangling: boolean;
  key: string;
}

export default function MemoryTrace({ trace }: { trace: keyof typeof TRACES }) {
  const steps = useMemo(() => TRACES[trace].steps(), [trace]);
  const st = useStepper(steps);
  const step = st.step;
  const touched = new Set(step.touched);

  const box = useRef<HTMLDivElement>(null);
  const code = useRef<HTMLPreElement>(null);

  // Keep the current line visible inside the code panel (scrolling only the panel, not the page).
  useLayoutEffect(() => {
    const pre = code.current;
    const line = pre?.querySelector<HTMLElement>('.code-line.current');
    if (!pre || !line) return;
    const top = line.offsetTop - pre.offsetTop;
    if (top < pre.scrollTop + 20 || top > pre.scrollTop + pre.clientHeight - 40) pre.scrollTop = top - pre.clientHeight / 2;
  }, [step]);
  const [arrows, setArrows] = useState<Arrow[]>([]);

  useLayoutEffect(() => {
    const root = box.current;
    if (!root) return;
    const draw = () => {
      const o = root.getBoundingClientRect();
      const out: Arrow[] = [];
      root.querySelectorAll<HTMLElement>('[data-ptr]').forEach((from) => {
        const target = root.querySelector<HTMLElement>(`[data-addr="${from.dataset.ptr}"]`);
        if (!target) return;
        const a = from.getBoundingClientRect();
        const x1 = a.right - o.left, y1 = a.top + a.height / 2 - o.top;
        let d: string;
        if (from.closest('.mem-col') === target.closest('.mem-col')) {
          // Stack to stack: loop out into the gap on the right and come back into the target's value box.
          const tv = (target.querySelector('.var-value') ?? target).getBoundingClientRect();
          const x2 = tv.right - o.left + 3, y2 = tv.top + tv.height / 2 - o.top;
          const bulge = Math.max(x1, x2) + 14 + Math.min(30, Math.abs(y2 - y1) / 5);
          d = `M${x1},${y1} C${bulge},${y1} ${bulge},${y2} ${x2},${y2}`;
        } else {
          const b = target.getBoundingClientRect();
          const x2 = b.left - o.left - 3, y2 = b.top + Math.min(b.height / 2, 18) - o.top;
          const mid = (x1 + x2) / 2;
          d = `M${x1},${y1} C${mid},${y1} ${mid},${y2} ${x2},${y2}`;
        }
        out.push({ d, dangling: from.dataset.dangling === 'true', key: `${from.dataset.name}-${from.dataset.ptr}` });
      });
      setArrows(out);
    };
    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(root);
    return () => ro.disconnect();
  }, [step]);

  return (
    <TracePanel stepper={st} label={trace === 'swap' ? 'swap' : 'Указатели'} message={step.message} kind={step.line === 0 ? 'start' : 'push'}>
      <div className="mem-body">
        <pre className="code numbered" aria-label="Код от pointers.cpp" ref={code}>
          {TRACES[trace].code.map((seg, si) => (
            <span key={si}>
              {si > 0 && <span className="code-line gap">⋮{'\n'}</span>}
              {seg.lines.map((line, i) => {
                const n = seg.from + i;
                return (
                  <span key={n} className={`code-line${step.line === n ? ' current' : ''}`}>
                    <span className="ln">{n}</span>{line}{'\n'}
                  </span>
                );
              })}
            </span>
          ))}
        </pre>

        <div className="memory-scroll">
        <div className="memory" ref={box}>
          <section className="mem-col" aria-label="Стек">
            <h5>Стек</h5>
            {[...step.frames].reverse().map((f, fi) => (
              <div key={`${f.fn}-${step.frames.length - fi}`} className="frame">
                <div className="frame-name">{f.fn}</div>
                {f.vars.length === 0 && <div className="muted small">няма променливи</div>}
                {f.vars.map((v) => <VarRow key={v.addr} v={v} hot={touched.has(v.addr)} />)}
              </div>
            ))}
          </section>
          <section className="mem-col" aria-label="Хийп">
            <h5>Хийп</h5>
            {step.heap.length === 0 && <div className="muted small heap-empty">празен: още няма new</div>}
            {step.heap.map((b) => <HeapBlock key={b.addr} b={b} hot={touched.has(b.addr)} />)}
          </section>
          <svg className="arrows" aria-hidden="true">
            <defs>
              <marker id={`ah-${trace}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" className="ah" /></marker>
              <marker id={`ahd-${trace}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" className="ah dangling" /></marker>
            </defs>
            {arrows.map((a) => (
              <path key={a.key} d={a.d} className={`arrow${a.dangling ? ' dangling' : ''}`} markerEnd={`url(#${a.dangling ? 'ahd' : 'ah'}-${trace})`} />
            ))}
          </svg>
        </div>
        </div>
      </div>

      <div className="console" aria-label="Изход">
        <span className="console-title">изход</span>
        {step.out.length ? step.out.map((l, i) => <div key={i} className={i === step.out.length - 1 ? 'new' : ''}>{l}</div>) : <div className="muted">(нищо още)</div>}
      </div>
    </TracePanel>
  );
}

function VarRow({ v, hot }: { v: Var; hot: boolean }) {
  const isPtr = v.kind === 'ptr';
  const shown = v.value === null ? '?' : isPtr ? hex(v.value) : v.kind === 'float' ? String(Number(Math.fround(v.value).toPrecision(6))) : String(v.value);
  return (
    <div className={`var${hot ? ' hot' : ''}`} data-addr={v.addr}>
      <span className="var-name"><code>{v.type}</code> {v.name}</span>
      <span
        className={`var-value${isPtr ? ' ptr' : ''}${v.dangling ? ' dangling' : ''}`}
        data-ptr={isPtr && v.value !== null ? v.value : undefined}
        data-dangling={v.dangling ? 'true' : undefined}
        data-name={v.name}
        title={v.dangling ? 'висящ указател: паметта е освободена' : undefined}
      >
        {shown}
      </span>
      <span className="var-addr">{hex(v.addr)}</span>
    </div>
  );
}

function HeapBlock({ b, hot }: { b: Block; hot: boolean }) {
  return (
    <div className={`block${b.freed ? ' freed' : ''}${hot ? ' hot' : ''}`} data-addr={b.addr}>
      <div className="block-head">
        <code>{b.type}</code> <span className="var-addr">{hex(b.addr)}</span>
        {b.freed && <span className="freed-tag">освободено</span>}
      </div>
      <div className="block-cells">
        {b.cells.map((c, i) => (
          <span key={i} className={`bcell${c === null ? ' garbage' : ''}`}>
            {c === null ? '?' : b.kind === 'float' ? String(Number(Math.fround(c).toPrecision(6))) : c}
          </span>
        ))}
      </div>
    </div>
  );
}
