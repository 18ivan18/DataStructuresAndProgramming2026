import { useMemo, useState } from 'react';
import type { ReactElement } from 'react';
import { bstFromInsertions, heightOf, inorderValues, parseValues, searchPath } from '../lib/bst';
import { layout, type Mark } from '../lib/tree';
import { TreeDiagram } from './TreeDiagram';

/* Same numbers, different insertion order: the shape — and with it every cost — changes.
   The search path shows what the height actually buys. */

const PRESETS: [string, string][] = [
  ['4 2 6 1 3 5 7', 'добре разклонено'],
  ['1 2 3 4 5 6 7', 'сортирано: изродено'],
  ['7 6 5 4 3 2 1', 'обратно сортирано'],
  ['4 2 1 3 6 5 7', 'същата форма, друг ред'],
];

export default function BstShape(): ReactElement {
  const [order, setOrder] = useState(PRESETS[0][0]);
  const [target, setTarget] = useState('7');

  const values = useMemo(() => parseValues(order, 15), [order]);
  const tree = useMemo(() => bstFromInsertions(values), [values]);
  const cells = useMemo(() => layout(tree), [tree]);
  const wanted = Number(target);
  const { path, found } = useMemo(() => (Number.isFinite(wanted) ? searchPath(tree, wanted) : { path: [], found: false }), [tree, wanted]);

  const marks: Record<number, Mark> = {};
  path.forEach((id) => (marks[id] = 'path'));
  if (path.length) marks[path[path.length - 1]] = found ? 'current' : 'bad';

  const n = tree.nodes.size;
  const h = heightOf(tree);
  const best = n ? Math.ceil(Math.log2(n + 1)) : 0;
  const sorted = inorderValues(tree);

  return (
    <div className="playground">
      <div className="presets" role="group" aria-label="Ред на вмъкване">
        {PRESETS.map(([preset, name]) => (
          <button key={preset} type="button" aria-pressed={preset === order} onClick={() => setOrder(preset)}>
            {name}
          </button>
        ))}
      </div>
      <div className="pg-options">
        <label className="param grow">
          ред на вмъкване <input type="text" value={order} onChange={(e) => setOrder(e.target.value)} spellCheck={false} />
        </label>
        <label className="param">
          търсим <input type="number" value={target} onChange={(e) => setTarget(e.target.value)} />
        </label>
      </div>

      <TreeDiagram nodes={[...tree.nodes.values()]} cells={cells} marks={marks} label={`BST от ${order}`} minWidth={260} />

      <ul className="bst-facts">
        <li>
          inorder: <b>{sorted.join(', ') || '—'}</b> — винаги растящо, независимо от реда на вмъкване. Това е единственото, което не зависи от формата.
        </li>
        <li>
          {n} възела, височина <b>{h}</b>; най-доброто възможно е ⌈log₂({n} + 1)⌉ = <b>{best}</b>
          {n > 2 && h === n ? ' — дървото е изродено в свързан списък и всяка операция е O(n)' : h === best ? ' — това е минимумът' : ''}.
        </li>
        <li>
          Търсенето на {Number.isFinite(wanted) ? wanted : '—'} прави <b>{path.length}</b>{' '}
          {path.length === 1 ? 'сравнение' : 'сравнения'} и {found ? 'намира стойността' : 'стига до nullptr: няма я в дървото'}.
        </li>
      </ul>
      <p className="tn-note">
        Вмъкни числата сортирано: всяко следващо е по-голямо от всички предишни, затова всяко тръгва надясно и дървото се изражда в списък. Същите числа в друг ред
        дават височина около log₂n. Затова сложността на BST се пише <b>O(h)</b>, а не O(log n) — логаритъмът е обещание, което самото BST не дава. Балансираните
        дървета от седмица 10 го дават.
      </p>
    </div>
  );
}
