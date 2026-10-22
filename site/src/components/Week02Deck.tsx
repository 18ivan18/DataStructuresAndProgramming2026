import { useMemo } from 'react';
import type { ReactElement } from 'react';
import AmortizedChart from './AmortizedChart';
import CallStackTrace from './CallStackTrace';
import StackSandbox from './StackSandbox';
import { Deck, type Slide } from './Deck';
import { StackView } from './StackView';

const items = (values: number[]) => values.map((value) => ({ key: String(value), label: String(value) }));

function AdtDiagram(): ReactElement {
  return (
    <svg className="sl-art" viewBox="0 0 640 250" role="img" aria-label="Стекът като абстрактен тип данни с две реализации: ArrayStack и LinkedStack">
      <rect x="170" y="8" width="300" height="76" rx="12" fill="var(--accent-soft)" stroke="var(--accent)" />
      <text x="320" y="36" textAnchor="middle" fill="var(--ink)" fontSize="19" fontWeight="700">
        Стек — абстрактен тип
      </text>
      <text x="320" y="62" textAnchor="middle" fill="var(--ink-soft)" fontSize="15" fontFamily="var(--mono)">
        push · pop · top · LIFO
      </text>
      <path d="M260 84 L150 150" fill="none" stroke="var(--line)" strokeWidth="2" />
      <path d="M380 84 L490 150" fill="none" stroke="var(--line)" strokeWidth="2" />
      <rect x="20" y="150" width="260" height="84" rx="12" fill="var(--surface)" stroke="var(--line)" />
      <text x="150" y="178" textAnchor="middle" fill="var(--ink)" fontSize="17" fontWeight="600" fontFamily="var(--mono)">
        ArrayStack
      </text>
      <text x="150" y="202" textAnchor="middle" fill="var(--ink-soft)" fontSize="14">
        едно парче памет
      </text>
      <text x="150" y="222" textAnchor="middle" fill="var(--ink-soft)" fontSize="14">
        push е O(1) амортизирано
      </text>
      <rect x="360" y="150" width="260" height="84" rx="12" fill="var(--surface)" stroke="var(--line)" />
      <text x="490" y="178" textAnchor="middle" fill="var(--ink)" fontSize="17" fontWeight="600" fontFamily="var(--mono)">
        LinkedStack
      </text>
      <text x="490" y="202" textAnchor="middle" fill="var(--ink-soft)" fontSize="14">
        разпръснати възли
      </text>
      <text x="490" y="222" textAnchor="middle" fill="var(--ink-soft)" fontSize="14">
        push е O(1) винаги
      </text>
    </svg>
  );
}

const SLIDES = (notes: string, quiz: string): Slide[] => [
  {
    id: 'slide-cover',
    title: 'Структури от данни. Стек',
    cover: true,
    content: (
      <div className="sl-cover-grid">
        <div>
          <p className="sl-eyebrow">Седмица 2 · Структури от данни и програмиране</p>
          <p className="sl-lede">Динамичен масив, амортизирана сложност и стекът — с двете му физически представяния.</p>
          <p className="muted small">← → листат · F е цял екран · Esc връща към бележките</p>
        </div>
        <StackView items={items([5, 42, 69, 77])} title="стек" minSlots={5} />
      </div>
    ),
  },
  {
    id: 'slide-what',
    title: 'Какво е структура от данни',
    content: (
      <>
        <p>Начин да организираме информация така, че да я ползваме <b>ефикасно</b>.</p>
        <div className="sl-cols">
          <div className="sl-card">
            <h3>Линейни (списъчни)</h3>
            <p>Елементите имат наредба: първи, втори, ..., последен — като хартиен списък.</p>
            <ol className="cells" aria-hidden="true">
              {[3, 7, 1, 4, 8].map((v, i) => (
                <li key={v} className="cell full">
                  <span className="v">{v}</span>
                  <span className="i">{i}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="sl-card">
            <h3>Абстрактни (АТД)</h3>
            <p>Дефинират <b>какви операции</b> има и как се държат, без да казват как са реализирани.</p>
            <p className="muted small">Контейнер е структурата, с която реализираме АТД. Един АТД — много контейнери, различна ефикасност.</p>
          </div>
        </div>
      </>
    ),
  },
  {
    id: 'slide-adt',
    title: 'Един тип, две реализации',
    lede: 'Ограничението е функционалността: щом типът обещава LIFO, никой не бърка по средата.',
    content: <AdtDiagram />,
  },
  {
    id: 'slide-vector',
    title: 'Динамичен масив',
    content: (
      <>
        <table>
          <thead>
            <tr>
              <th>Операция</th>
              <th>Сложност</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Добавяне на произволна позиция</td>
              <td>
                <b>O(n)</b>
              </td>
            </tr>
            <tr>
              <td>Добавяне в края</td>
              <td>
                <b>O(1)</b> амортизирано
              </td>
            </tr>
            <tr>
              <td>Премахване от произволна позиция</td>
              <td>
                <b>O(n)</b>
              </td>
            </tr>
            <tr>
              <td>Премахване от края</td>
              <td>
                <b>O(1)</b> амортизирано
              </td>
            </tr>
            <tr>
              <td>„Преглед“ на произволен елемент</td>
              <td>
                <b>O(1)</b>
              </td>
            </tr>
          </tbody>
        </table>
        <pre>{'if (n >= capacity)\n{\n    resize(capacity * 2);\n}\n\narr[n++] = element;'}</pre>
      </>
    ),
  },
  {
    id: 'slide-amortized',
    title: 'Какво значи „амортизирано“',
    badge: 'Пробвай',
    lede: 'Повечето добавяния струват една стъпка. Когато масивът е пълен, едно добавяне копира всичко — но средната цена не минава 3.',
    content: <AmortizedChart />,
  },
  {
    id: 'slide-quarter',
    title: 'Защо смаляваме при четвърт',
    badge: 'Пробвай',
    content: (
      <>
        <div className="sl-cols">
          <div>
            <pre>{'// why /4?\nif (--n == capacity / 4 && n > 0)\n{\n    resize(capacity / 2);\n}'}</pre>
            <p>
              При правило „половина“ един <code>pop</code> и един <code>push</code> на границата преоразмеряват масива всеки път — всяка от двете операции
              става O(n).
            </p>
            <p className="muted small">Превключи правилото в графиката: при /2 всеки стълб е скъп, при /4 няма нито един.</p>
          </div>
          <AmortizedChart mode="wobble" />
        </div>
      </>
    ),
  },
  {
    id: 'slide-lifo',
    title: 'Стек: Last In, First Out',
    content: (
      <>
        <div className="sl-cols sl-cols-3">
          <StackView items={items([3, 7])} title="преди" minSlots={4} />
          <StackView items={items([3, 7, 4])} title="след push(4)" minSlots={4} />
          <StackView items={items([3, 7])} title="след pop() → 4" minSlots={4} />
        </div>
        <ul>
          <li>
            <code>push</code> — добавя нов елемент най-отгоре
          </li>
          <li>
            <code>pop</code> — премахва и връща най-горния
          </li>
          <li>
            <code>top</code> — показва най-горния, без да го премахва
          </li>
        </ul>
        <p className="muted small">Достъпът е само до върха. Точно това ограничение прави структурата полезна.</p>
      </>
    ),
  },
  {
    id: 'slide-impl',
    title: 'Последователно и свързано, едно до друго',
    badge: 'Пробвай',
    lede: 'Всяка операция се прилага и към ArrayStack, и към LinkedStack. На деветия push масивът се препълва.',
    content: <StackSandbox />,
  },
  {
    id: 'slide-callstack',
    title: 'Стекът, който вече ползваш',
    badge: 'Пробвай',
    lede: 'Всяко извикване на функция получава рамка на върха на стека на извикванията.',
    content: <CallStackTrace />,
  },
  {
    id: 'slide-stl',
    title: 'Наготово: std::stack',
    content: (
      <>
        <div className="sl-cols">
          <pre>{'#include <stack>\n\nstd::stack<int> st;\nst.push(5);\nst.push(-42);\nst.push(69);\n\nwhile (!st.empty())\n{\n    std::cout << st.top() << " ";\n    st.pop();\n}'}</pre>
          <div>
            <pre>{'template<\n    class T,\n    class Container = std::deque<T>\n> class stack;'}</pre>
            <p>
              <code>std::stack</code> е <b>адаптер</b> над друг контейнер. По подразбиране това е <code>std::deque</code>, но вторият параметър е наш
              избор — стекът иска само <code>push_back</code>, <code>pop_back</code> и <code>back</code>.
            </p>
            <p className="muted small">Няма индексиране и няма итератори: интерфейсът следва абстрактния тип, не контейнера отдолу.</p>
          </div>
        </div>
      </>
    ),
  },
  {
    id: 'slide-end',
    title: 'Накратко',
    content: (
      <>
        <ul>
          <li>
            Абстрактният тип казва <b>какво</b>, контейнерът — <b>как</b>.
          </li>
          <li>
            Амортизирано O(1) е твърдение за цялата поредица: скъпите push-ове са толкова редки, че сборът остава линеен.
          </li>
          <li>Смаляването при четвърт оставя луфт, за да няма преоразмеряване при всяка операция на границата.</li>
          <li>Стекът дава достъп само до върха — и затова обръща ред, помни откъде си дошъл и носи извикванията на функциите.</li>
        </ul>
        <p className="sl-links">
          <a href={notes}>Бележките към седмица 2</a> · <a href={`${notes}#задачи`}>Задачите</a> · <a href={quiz}>Тест за самопроверка</a>
        </p>
      </>
    ),
  },
];

export default function Week02Deck({ notes, quiz }: { notes: string; quiz: string }): ReactElement {
  const slides = useMemo(() => SLIDES(notes, quiz), [notes, quiz]);
  return <Deck title="Седмица 2 · Структури от данни. Стек" slides={slides} notes={notes} />;
}
