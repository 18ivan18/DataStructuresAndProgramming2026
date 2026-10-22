import { useMemo } from 'react';
import type { ReactElement } from 'react';
import ListSandbox from './ListSandbox';
import ListTaskTrace from './ListTaskTrace';
import { Deck, type Slide } from './Deck';

function Chain({ values, doubly = false }: { values: number[]; doubly?: boolean }): ReactElement {
  return (
    <ol className="chain" aria-label={`Свързан списък: ${values.join(', ')}`}>
      <li className="head">first</li>
      {values.flatMap((value, i) => [
        <li key={`${value}-arrow`} className="arrow" aria-hidden="true">
          {doubly ? '⇄' : '→'}
        </li>,
        <li key={value} className={`node${i === values.length - 1 ? ' top' : ''}`}>
          <span className="box">
            {doubly && <span className="next">prev</span>}
            <span className="data">{value}</span>
            <span className="next">next</span>
          </span>
        </li>,
      ])}
      <li className="arrow" aria-hidden="true">
        →
      </li>
      <li className="null">nullptr</li>
    </ol>
  );
}

function Cells({ values }: { values: number[] }): ReactElement {
  return (
    <ol className="cells" aria-label={`Масив: ${values.join(', ')}`}>
      {values.map((value, i) => (
        <li key={value} className="cell full">
          <span className="v">{value}</span>
          <span className="i">{i}</span>
        </li>
      ))}
    </ol>
  );
}

const COSTS: [string, string, string][] = [
  ['Добавяне на произволна позиция', 'O(n)', 'O(n)'],
  ['Добавяне в началото или в края', 'O(1)', 'O(1)'],
  ['Премахване от произволна позиция', 'O(n)', 'O(n)'],
  ['Премахване от началото', 'O(1)', 'O(1)'],
  ['Премахване от края', 'O(n)', 'O(1)'],
  ['„Преглед“ на произволен елемент', 'O(n)', 'O(n)'],
  ['„Преглед“ на първия или последния', 'O(1)', 'O(1)'],
];

const SLIDES = (notes: string, quiz: string): Slide[] => [
  {
    id: 'slide-cover',
    title: 'Свързан списък',
    cover: true,
    content: (
      <>
        <p className="sl-eyebrow">Седмица 4 · Структури от данни и програмиране</p>
        <p className="sl-lede">Възли, указатели и реда, в който се присвояват. Едносвързан и двусвързан списък.</p>
        <Chain values={[1, 2, 3]} />
        <p className="muted small">← → листат · F е цял екран · Esc връща към бележките</p>
      </>
    ),
  },
  {
    id: 'slide-what',
    title: 'Какво пази един възел',
    content: (
      <>
        <div className="sl-cols">
          <div>
            <p>
              Всеки възел носи не само стойността, но и <b>кой е следващият</b>. Така от първия елемент стигаме до всички останали, следвайки указателите.
            </p>
            <pre>{'struct Node\n{\n    T data;\n    Node *next;\n};'}</pre>
          </div>
          <div className="sl-card">
            <h3>Класът пази три неща</h3>
            <ul>
              <li>
                <code>first</code> — началото, за <code>pushFront</code> и <code>popFront</code>
              </li>
              <li>
                <code>last</code> — краят, за да е <code>pushBack</code> за O(1)
              </li>
              <li>
                <code>n</code> — броят, за да е <code>size</code> за O(1)
              </li>
            </ul>
            <p className="muted small">
              Трите трябва да са съгласувани след всяка операция. Половината грешки в списъци са точно забравен <code>last</code>.
            </p>
          </div>
        </div>
      </>
    ),
  },
  {
    id: 'slide-random',
    title: 'Какво губим: директния достъп',
    lede: 'Няма начин да стигнем до k-тия елемент, без да минем през предходните k.',
    content: (
      <>
        <div className="sl-cols">
          <div>
            <h3>Масив</h3>
            <Cells values={[1, 2, 3, 4, 5]} />
            <p>
              <code>arr[k]</code> е едно събиране — адресът се сметва.
            </p>
          </div>
          <div>
            <h3>Списък</h3>
            <Chain values={[1, 2, 3]} />
            <p>
              <code>at(k)</code> са k стъпки по указатели.
            </p>
          </div>
        </div>
        <p className="callout">
          Затова списък никога не се обхожда по индекс: <code>at(0)</code>, <code>at(1)</code>, ..., <code>at(9)</code> прави 0 + 1 + ... + 9 = 45 стъпки вместо 9.
        </p>
      </>
    ),
  },
  {
    id: 'slide-costs',
    title: 'Цената на операциите',
    content: (
      <>
        <table>
          <thead>
            <tr>
              <th>Операция</th>
              <th>Едносвързан</th>
              <th>Двусвързан</th>
            </tr>
          </thead>
          <tbody>
            {COSTS.map(([op, single, double]) => (
              <tr key={op}>
                <td>{op}</td>
                <td>
                  <b>{single}</b>
                </td>
                <td>
                  <b>{double}</b>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>
          Единствената разлика е премахването от края: имаме <code>last</code>, но в едносвързан списък от възел не се връщаме назад, а новият край трябва да е <b>предишният</b> възел.
        </p>
      </>
    ),
  },
  {
    id: 'slide-methods',
    title: 'Методите ред по ред',
    badge: 'Пробвай',
    lede: 'Сравни pushBack (нито една стъпка по указатели благодарение на last) с at и insertAt, които обхождат от началото.',
    content: <ListSandbox kind="singly" />,
  },
  {
    id: 'slide-order',
    title: 'Редът на двете присвоявания',
    content: (
      <>
        <div className="sl-cols">
          <div>
            <h3>Правилно</h3>
            <pre>{'node->next = previous->next;\nprevious->next = node;'}</pre>
            <p>
              Първо запазваме остатъка от списъка, после го откъсваме от <code>previous</code>.
            </p>
          </div>
          <div>
            <h3>Обратният ред</h3>
            <pre>{'previous->next = node;\nnode->next = previous->next;'}</pre>
            <p>
              Вторият ред вече чете <code>node</code>: новият възел сочи сам към себе си, а остатъкът от списъка се губи.
            </p>
          </div>
        </div>
        <p className="callout">Общото правило при указатели: никога не презаписвай връзка, преди да си запазил накъде е сочела.</p>
      </>
    ),
  },
  {
    id: 'slide-doubly',
    title: 'Двусвързан списък',
    content: (
      <>
        <Chain values={[1, 2, 3]} doubly />
        <p>
          Всеки възел пази и указател към предишния, значи се движим в двете посоки — и премахваме от края за O(1). Цената е по още един указател на възел и по едно
          присвояване повече при всяко вмъкване.
        </p>
        <pre>{'nullptr <-- [ 1 ] <--> [ 2 ] <--> [ 3 ] --> nullptr\n   ^                                  ^\n first                              last'}</pre>
        <p className="muted small">Директният достъп си остава O(n) — двете връзки не помагат за индексиране.</p>
      </>
    ),
  },
  {
    id: 'slide-reverse',
    title: 'Задача 1: обръщане на списък',
    badge: 'Пробвай',
    lede: 'Три указателя и по една обърната стрелка на всяка стъпка. Допълнителна памет O(1).',
    content: <ListTaskTrace task="reverse" />,
  },
  {
    id: 'slide-cycle',
    title: 'Задача 2: има ли цикъл',
    badge: 'Пробвай',
    lede: 'Костенурка и заек: бавният прави една стъпка, бързият две. Ако има цикъл, бързият рано или късно догонва бавния.',
    content: <ListTaskTrace task="cycle" />,
  },
  {
    id: 'slide-delete',
    title: 'Задача 6: изтриване без достъп до началото',
    badge: 'Пробвай',
    lede: 'Подаден ни е самият възел. Щом не можем да стигнем до предишния, преписваме следващия върху себе си и трием него.',
    content: <ListTaskTrace task="delete" />,
  },
  {
    id: 'slide-nth',
    title: 'Задача 7: n-тият от края',
    badge: 'Пробвай',
    lede: 'Два указателя на разстояние n и фиктивно начало, за да няма специален случай при махане на първия възел.',
    content: <ListTaskTrace task="nth" />,
  },
  {
    id: 'slide-rest',
    title: 'Останалите задачи',
    content: (
      <>
        <ol className="sl-tasks">
          <li>Сливане на два сортирани списъка</li>
          <li>Сортиране на свързан списък — може ли за O(n log n) и O(1) памет?</li>
          <li>Сбор на числа, записани по цифри в обратен ред</li>
          <li>Изравняване на многослоен двусвързан списък</li>
        </ol>
        <p className="muted small">Номерата в бележките са 3, 4, 5 и 8. Към тях има и допълнителни задачи в папката на седмицата.</p>
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
            Възелът пази данни и връзка; класът пази <code>first</code>, <code>last</code> и <code>n</code> — и трите трябва да излизат съгласувани от всяка
            операция.
          </li>
          <li>Краищата са O(1), всичко по средата е O(n). Директен достъп няма и не може да има.</li>
          <li>Никога не презаписвай указател, преди да си запазил накъде сочи, и не чети от възел, след като си го изтрил.</li>
          <li>Списъкът печели при вмъкване по указател и стабилни адреси; масивът печели при индексиране и при обхождане.</li>
        </ul>
        <p className="sl-links">
          <a href={notes}>Бележките към седмица 4</a> · <a href={quiz}>Тест за самопроверка</a>
        </p>
      </>
    ),
  },
];

export default function Week04Deck({ notes, quiz }: { notes: string; quiz: string }): ReactElement {
  const slides = useMemo(() => SLIDES(notes, quiz), [notes, quiz]);
  return <Deck title="Седмица 4 · Свързан списък" slides={slides} notes={notes} />;
}
