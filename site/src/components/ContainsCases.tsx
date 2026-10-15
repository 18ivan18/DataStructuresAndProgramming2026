import { useState } from 'react';
import { containsComparisons } from '../lib/complexity';

/* contains() from complexity.cpp: how many comparisons, depending on where the element is.
   Click a cell to search for it; the bars show every possible position at once. */

const ARR = [4, 8, 15, 16, 23, 42, 7, 1, 30, 12];
const MISSING = 99;

export default function ContainsCases() {
  const [target, setTarget] = useState<number>(42);
  const n = ARR.length;
  const count = containsComparisons(ARR, target);
  const found = ARR.includes(target);
  const avgFound = (n + 1) / 2;

  const cases = [...ARR.map((v) => ({ v, label: String(v) })), { v: MISSING, label: 'няма го' }];

  return (
    <div className="playground">
      <p className="muted small">Кликни число, за да го търсиш, или потърси такова, което го няма.</p>
      <ol className="tape scan" aria-label="Масивът">
        {ARR.map((v, i) => (
          <li key={i}>
            <button type="button" className={`tape-cell${i < count - (found ? 1 : 0) ? ' done' : ''}${found && i === count - 1 ? ' matched' : ''}`} onClick={() => setTarget(v)} aria-pressed={v === target}>
              {v}
            </button>
          </li>
        ))}
        <li>
          <button type="button" className={`tape-cell missing${!found ? ' bad' : ''}`} onClick={() => setTarget(MISSING)} aria-pressed={!found}>
            {MISSING}?
          </button>
        </li>
      </ol>
      <p className="now">
        {found
          ? `contains(arr, ${n}, ${target}): ${count} ${count === 1 ? 'сравнение' : 'сравнения'}, ${count === 1 ? 'най-добрият случай' : count === n ? 'най-лошият случай за намерен елемент' : 'спира, щом го намери'}.`
          : `contains(arr, ${n}, ${MISSING}): ${n} сравнения, минава през целия масив и връща false. Най-лошият случай.`}
      </p>

      <div className="cases" role="img" aria-label={`Сравнения за всяка позиция: от 1 до ${n}; средно ${avgFound.toFixed(1)}`}>
        <div className="case-plot">
          {cases.map((c, i) => {
            const k = containsComparisons(ARR, c.v);
            return (
              <div key={i} className={`case${c.v === target ? ' on' : ''}`} style={{ height: `${(k / n) * 100}%` }} title={`${c.label}: ${k} сравнения`}>
                <span className="case-n">{k}</span>
              </div>
            );
          })}
          <div className="avg-line" style={{ bottom: `${(avgFound / n) * 100}%` }}><span>средно {avgFound.toFixed(1)}</span></div>
        </div>
        <div className="case-labels" aria-hidden="true">
          {cases.map((c, i) => <span key={i}>{c.label}</span>)}
        </div>
      </div>
      <ul className="case-legend">
        <li><b>Най-добър случай</b>: 1 сравнение, елементът е първи. O(1).</li>
        <li><b>Най-лош случай</b>: n = {n} сравнения, последен или липсва. O(n).</li>
        <li><b>Среден случай</b>, ако търсеният е на случайна позиция: (n + 1) / 2 = {avgFound.toFixed(1)}. Все още O(n): половината от n е пак линейно.</li>
      </ul>
    </div>
  );
}
