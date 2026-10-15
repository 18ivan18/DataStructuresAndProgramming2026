import { useMemo, useState } from 'react';
import { mazeTrace, README_MAZE, type Cell } from '../lib/queue';
import { collect } from '../lib/traces';
import { TracePanel } from './TracePanel';
import { useStepper } from './useStepper';

type Tool = 'wall' | 'dest';

// Deterministic "random" mazes, so a refresh shows the same one.
function randomMaze(seed: number) {
  let s = seed;
  return Array.from({ length: 10 }, () => Array.from({ length: 10 }, () => ((s = (s * 1103515245 + 12345) % 2147483648), s % 100 < 70 ? 1 : 0)));
}

export default function MazeTrace() {
  const [grid, setGrid] = useState(README_MAZE);
  const [dest, setDest] = useState<Cell>([7, 5]);
  const [tool, setTool] = useState<Tool>('wall');
  const [seed, setSeed] = useState(1);
  const src: Cell = [0, 0];
  const steps = useMemo(() => collect(mazeTrace(grid, src, dest)), [JSON.stringify(grid), dest.join()]);
  const st = useStepper(steps, 450);
  const step = st.step;

  const onPath = new Set((step.path ?? []).map(([r, c]) => `${r},${c}`));
  const added = new Set((step.added ?? []).map(([r, c]) => `${r},${c}`));
  const queued = new Set(step.queue.map(([r, c]) => `${r},${c}`));
  const click = (r: number, c: number) => {
    if ((r === src[0] && c === src[1]) || (r === dest[0] && c === dest[1])) return;
    if (tool === 'dest') {
      if (grid[r][c]) setDest([r, c]);
      return;
    }
    setGrid(grid.map((row, i) => row.map((v, j) => (i === r && j === c ? 1 - v : v))));
  };

  return (
    <TracePanel
      stepper={st}
      label="BFS в лабиринт"
      message={step.message}
      kind={step.kind === 'drop' ? 'push' : step.kind}
      inputs={
        <>
          <div className="presets" role="group" aria-label="Лабиринт">
            <button type="button" onClick={() => { setGrid(README_MAZE); setDest([7, 5]); }}>от условието</button>
            <button type="button" onClick={() => { const g = randomMaze(seed); g[0][0] = 1; g[9][9] = 1; setGrid(g); setDest([9, 9]); setSeed(seed + 1); }}>случаен</button>
            <button type="button" onClick={() => setGrid(grid.map((r) => r.map(() => 1)))}>без стени</button>
          </div>
          <div className="segmented" role="radiogroup" aria-label="Клик върху клетка">
            <button type="button" role="radio" aria-checked={tool === 'wall'} onClick={() => setTool('wall')}>клик: стена</button>
            <button type="button" role="radio" aria-checked={tool === 'dest'} onClick={() => setTool('dest')}>клик: цел</button>
          </div>
        </>
      }
    >
      <div className="trace-body maze-body">
        <div className="maze" role="grid" aria-label={`Лабиринт 10 на 10, начало (0, 0), цел (${dest[0]}, ${dest[1]})`}>
          {grid.map((row, r) => row.map((v, c) => {
            const k = `${r},${c}`;
            const d = step.dist[r][c];
            const isSrc = r === src[0] && c === src[1], isDest = r === dest[0] && c === dest[1];
            const cls = [
              'mcell',
              v ? 'open' : 'wall',
              d >= 0 ? 'reached' : '',
              queued.has(k) ? 'queued' : '',
              added.has(k) ? 'added' : '',
              step.current && step.current[0] === r && step.current[1] === c ? 'current' : '',
              onPath.has(k) ? 'path' : '',
              isSrc ? 'src' : '',
              isDest ? 'dest' : '',
            ].filter(Boolean).join(' ');
            return (
              <button key={k} type="button" className={cls} onClick={() => click(r, c)} aria-label={`(${r}, ${c})${v ? '' : ' стена'}${d >= 0 ? `, разстояние ${d}` : ''}`}>
                {isSrc ? 'S' : isDest ? 'G' : d >= 0 ? d : ''}
              </button>
            );
          }))}
        </div>
        <div>
          <ul className="maze-legend" aria-hidden="true">
            <li><span className="mcell src" /> начало</li>
            <li><span className="mcell dest" /> цел</li>
            <li><span className="mcell wall" /> стена</li>
            <li><span className="mcell reached" /> посетена (числото е разстоянието)</li>
            <li><span className="mcell queued" /> в опашката</li>
            <li><span className="mcell current" /> вадим я сега</li>
          </ul>
          <p className="muted small" style={{ marginTop: '0.8rem' }}>Опашката ({step.queue.length}), отпред назад:</p>
          <ol className="bfs-queue">
            {step.queue.slice(0, 14).map(([r, c], i) => <li key={`${r},${c}`} className={i === 0 ? 'front' : ''}>({r}, {c}) <span className="muted">{step.dist[r][c]}</span></li>)}
            {step.queue.length > 14 && <li className="muted">… още {step.queue.length - 14}</li>}
          </ol>
          {step.result !== undefined && <p className={`verdict ${step.result >= 0 ? 'good' : 'bad'}`}>{step.result >= 0 ? <>Най-къс път: <b>{step.result}</b> стъпки</> : <>Няма път: <b>-1</b></>}</p>}
        </div>
      </div>
    </TracePanel>
  );
}
