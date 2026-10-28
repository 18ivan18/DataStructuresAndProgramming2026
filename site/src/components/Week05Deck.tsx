import { useMemo } from 'react';
import type { ReactElement } from 'react';
import ListSandbox from './ListSandbox';
import { Ring } from './Ring';
import { Deck, type Slide } from './Deck';

function Chain({ values, doubly = false }: { values: number[]; doubly?: boolean }): ReactElement {
  return (
    <ol className="chain" aria-label={`${doubly ? 'Двусвързан' : 'Едносвързан'} списък: ${values.join(', ')}`}>
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

const COSTS: [string, string, string][] = [
  ['Добавяне в началото', 'O(1)', 'O(1)'],
  ['Добавяне в края', 'O(1)', 'O(1)'],
  ['Премахване от началото', 'O(1)', 'O(1)'],
  ['Премахване от края', 'O(n)', 'O(1)'],
  ['Премахване на възел по даден указател', 'O(n)', 'O(1)'],
  ['Добавяне или премахване на произволна позиция', 'O(n)', 'O(n)'],
  ['„Преглед“ на произволен елемент', 'O(n)', 'O(n)'],
  ['Памет за връзки на възел', '8 байта', '16 байта'],
];

const SLIDES = (notes: string, quiz: string): Slide[] => [
  {
    id: 'slide-cover',
    title: 'Двусвързан списък',
    cover: true,
    content: (
      <>
        <p className="sl-eyebrow">Седмица 5 · Структури от данни и програмиране</p>
        <p className="sl-lede">Още един указател на възел: обратна посока, краища за O(1) и структурата дек.</p>
        <Chain values={[1, 2, 3]} doubly />
        <p className="muted small">← → листат · F е цял екран · Esc връща към бележките</p>
      </>
    ),
  },
  {
    id: 'slide-kinds',
    title: 'Разновидности на свързания списък',
    content: (
      <>
        <div className="sl-cols">
          <div>
            <h3>Едносвързан</h3>
            <pre>{'head\n |\n v\n[ 1 ] --> [ 2 ] --> [ 3 ] --> nullptr'}</pre>
            <p className="muted small">Една връзка. Напред и само напред.</p>
            <h3>Двусвързан</h3>
            <pre>{'          first                       last\n            |                          |\n            v                          v\nnullptr <-- [ 1 ] <--> [ 2 ] <--> [ 3 ] --> nullptr'}</pre>
            <p className="muted small">Две връзки. И двете посоки, и двата края.</p>
          </div>
          <div>
            <h3>Цикличен</h3>
            <pre>{'  +-------------------------------+\n  v                               |\n[ 1 ] <--> [ 2 ] <--> [ 3 ] <--> [ 4 ]\n  |                               ^\n  +-------------------------------+'}</pre>
            <p className="muted small">Краищата се държат за ръце. Никъде няма nullptr.</p>
            <div className="sl-card">
              <h3>От тях излиза декът</h3>
              <p>
                <b>d</b>ouble <b>e</b>nded <b>que</b>ue — бързо добавяне и премахване и в двата края.
              </p>
            </div>
          </div>
        </div>
      </>
    ),
  },
  {
    id: 'slide-node',
    title: 'Какво пази един възел сега',
    content: (
      <>
        <div className="sl-cols">
          <div>
            <pre>{'struct Node\n{\n    T data;\n    Node *next;\n    Node *previous;\n};'}</pre>
            <p>
              Единствената разлика с седмица 4 е <code>previous</code>. Класът пази същите три неща: <code>first</code>, <code>last</code> и <code>n</code>.
            </p>
          </div>
          <div className="sl-card">
            <h3>Какво купува този указател</h3>
            <ul>
              <li>Обхождане и назад, от <code>last</code> към <code>first</code>.</li>
              <li>
                <code>popBack</code> за O(1): новият край е <code>last-&gt;previous</code>, а дотам вече има връзка.
              </li>
              <li>Премахване на възел, към който държим указател, без никакво обхождане.</li>
            </ul>
            <p className="muted small">Цената е по 8 байта на възел и по едно присвояване повече при всяка промяна — всяка връзка вече е двупосочна и трябва да се поправя от двете страни.</p>
          </div>
        </div>
      </>
    ),
  },
  {
    id: 'slide-costs',
    title: 'Какво се промени в цените',
    lede: 'Само два реда се различават — но заради тях структурата съществува.',
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
        <p className="callout">
          Директният достъп си остава O(n). Двете връзки не помагат за индексиране — възлите пак са разпръснати и адресът на k-тия не се изчислява.
        </p>
      </>
    ),
  },
  {
    id: 'slide-nodeat',
    title: 'nodeAt тръгва от по-близкия край',
    badge: 'Пробвай',
    lede: 'Пусни at с индекс в първата и във втората половина: обхождането сменя посоката.',
    content: (
      <>
        <div className="sl-cols">
          <pre>{'if (index < n / 2)\n{\n    Node *iter = first;\n\n    while (index--)\n    {\n        iter = iter->next;\n    }\n\n    return iter;\n}\n\nNode *iter = last;\n\nfor (int i = n - 1; i > index; i--)\n{\n    iter = iter->previous;\n}'}</pre>
          <div className="sl-card">
            <h3>Колко струва това</h3>
            <p>
              Отпред стъпките са <code>index</code>, отзад — <code>n - 1 - index</code>. В най-лошия случай се минава половината списък вместо целия.
            </p>
            <p>
              Обхождане на целия списък с <code>at(0)</code>, ..., <code>at(9)</code>: <b>20</b> стъпки тук, <b>45</b> в едносвързания.
            </p>
            <p className="muted small">Два пъти по-малко, но и двете са O(n²) за n извиквания. Списък пак не се обхожда по индекс — обхожда се с указател.</p>
          </div>
        </div>
      </>
    ),
  },
  {
    id: 'slide-methods',
    title: 'Методите ред по ред',
    badge: 'Пробвай',
    lede: 'Всяко премахване минава през removeNode: четири указателя, нито една стъпка по списъка.',
    content: <ListSandbox kind="doubly" />,
  },
  {
    id: 'slide-removenode',
    title: 'removeNode: един метод за всички премахвания',
    content: (
      <>
        <div className="sl-cols">
          <pre>{'if (node->previous)\n{\n    node->previous->next = node->next;\n}\nelse\n{\n    first = node->next;\n}\n\nif (node->next)\n{\n    node->next->previous = node->previous;\n}\nelse\n{\n    last = node->previous;\n}\n\ndelete node;\nn--;'}</pre>
          <div>
            <p>
              Двата <code>if</code>-а са двата специални случая и те са само два: <code>previous == nullptr</code> значи „това е <code>first</code>“, <code>next == nullptr</code> значи „това е <code>last</code>“.
            </p>
            <p>
              Затова <code>popFront</code> е <code>removeNode(first)</code>, <code>popBack</code> е <code>removeNode(last)</code>, а <code>removeAt(index)</code> е <code>removeNode(nodeAt(index))</code> — обхождането е в <code>nodeAt</code>, не в премахването.
            </p>
            <p className="callout">
              И никога не чети от възел след <code>delete</code>. <code>delete last; last = last-&gt;previous;</code> е точно този бъг.
            </p>
          </div>
        </div>
      </>
    ),
  },
  {
    id: 'slide-order',
    title: 'Редът на четирите присвоявания',
    content: (
      <>
        <div className="sl-cols">
          <div>
            <h3>Правилно</h3>
            <pre>{'node->previous = current->previous;\nnode->next = current;\ncurrent->previous->next = node;\ncurrent->previous = node;'}</pre>
            <p>Първо пишем в новия възел, после пренасочваме съседите. Последен се презаписва този указател, който вече не ни трябва.</p>
          </div>
          <div>
            <h3>Обратният ред</h3>
            <pre>{'current->previous = node;\nnode->previous = current->previous;'}</pre>
            <p>
              Първият ред изгуби левия съсед, затова вторият присвоява <code>node-&gt;previous = node</code>. Възелът сочи сам към себе си, а списъкът отляво е недостижим.
            </p>
          </div>
        </div>
        <p className="callout">Същото правило като при едносвързания списък: никога не презаписвай връзка, преди да си запазил накъде е сочела.</p>
      </>
    ),
  },
  {
    id: 'slide-circular',
    title: 'Цикличен двусвързан списък',
    content: (
      <>
        <div className="sl-cols">
          <div>
            <pre>{'      +---------------------------------+\n      v                                 |\n     [ 1 ] <--> [ 2 ] <--> [ 3 ] <--> [ 4 ]\n      |                                 ^\n      +---------------------------------+'}</pre>
            <p>
              Последният сочи към първия, първият — към последния. Няма <code>nullptr</code> в краищата, значи няма и специални случаи при краищата.
            </p>
          </div>
          <div className="sl-card">
            <h3>Какво се променя в кода</h3>
            <ul>
              <li>
                Стига един указател: краят е <code>head-&gt;previous</code>.
              </li>
              <li>
                <code>while (iter)</code> вече не спира — обхождането брои n стъпки или следи връщането в изходния възел.
              </li>
              <li>Празният списък е единственият специален случай.</li>
            </ul>
          </div>
        </div>
      </>
    ),
  },
  {
    id: 'slide-deque',
    title: 'Дек: пак АТД, не контейнер',
    content: (
      <>
        <div className="sl-cols">
          <div className="sl-card">
            <h3>Четирите операции</h3>
            <ul>
              <li>
                <code>pushFront</code> · <code>popFront</code>
              </li>
              <li>
                <code>pushBack</code> · <code>popBack</code>
              </li>
            </ul>
            <p>И четирите за O(1). Това е цялото обещание на дека.</p>
          </div>
          <div>
            <p>
              Стекът ползва само единия край, опашката добавя в единия и маха от другия. И двата са частни случаи на дека — затова с дек се реализират и двете.
            </p>
            <p className="muted small">
              Както в седмица 2: типът казва какви операции има и колко струват, а контейнерът отдолу е наш избор. Долу има две еднакво добри реализации.
            </p>
          </div>
        </div>
      </>
    ),
  },
  {
    id: 'slide-deque-impl',
    title: 'Две реализации на един дек',
    content: (
      <>
        <div className="sl-cols">
          <div>
            <h3>Цикличен масив</h3>
            <Ring
              cells={[2, null, 3]}
              first={2}
              n={2}
              markers={[
                { index: 2, label: 'front', cls: 'm-first' },
                { index: 0, label: 'rear', cls: 'm-rear' },
              ]}
              label="Цикличен дек върху масив с капацитет 3, first = 2, n = 2"
            />
            <p className="muted small">
              Пази се само <code>first</code> и <code>n</code>; краят е <code>(first + n - 1) % k</code>. Нулева заделена памет при добавяне, но капацитетът е фиксиран.
            </p>
          </div>
          <div>
            <h3>Цикличен двусвързан списък</h3>
            <pre>{'       head\n        |\n        v\n  +--> [ 3 ] <--> [ 2 ] <--+\n  |                        |\n  +------------------------+'}</pre>
            <p className="muted small">
              Расте без ограничение, краят е <code>head-&gt;previous</code>. Цената е по един <code>new</code> на добавяне и по два указателя на елемент.
            </p>
          </div>
        </div>
        <p className="callout">
          И двете правят всяка операция за O(1). Какво не става: едносвързан списък (краят е O(n)) и обикновен динамичен масив, в който началото е индекс 0 (добавянето отпред мести всичко).
        </p>
      </>
    ),
  },
  {
    id: 'slide-stl',
    title: 'Наготово в STL',
    content: (
      <>
        <div className="sl-cols">
          <pre>{'#include <list>\n#include <deque>\n\nstd::list<int> l{1, 2, 3};\nl.push_front(0);\nl.push_back(4);\nl.pop_back();\n\nstd::deque<int> d{1, 2, 3};\nd.push_front(0);\nstd::cout << d[2];'}</pre>
          <div>
            <table>
              <thead>
                <tr>
                  <th>Контейнер</th>
                  <th>Какво е</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <code>std::forward_list</code>
                  </td>
                  <td>едносвързан списък</td>
                </tr>
                <tr>
                  <td>
                    <code>std::list</code>
                  </td>
                  <td>двусвързан списък</td>
                </tr>
                <tr>
                  <td>
                    <code>std::deque</code>
                  </td>
                  <td>редица от блокове памет</td>
                </tr>
              </tbody>
            </table>
            <p className="muted small">
              Затова <code>d[2]</code> съществува, а <code>l[2]</code> — не: в дека индексът се смята (кой блок, кое място), докато адресите на възлите не следват никаква закономерност.
            </p>
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
            Вторият указател купува обратната посока и O(1) край; плаща се с 8 байта на възел и по едно присвояване повече.
          </li>
          <li>
            Всяко премахване минава през <code>removeNode</code> — два специални случая, четири указателя, нула обхождане.
          </li>
          <li>
            <code>nodeAt</code> тръгва от по-близкия край, но достъпът по индекс си остава O(n).
          </li>
          <li>В цикличния списък няма <code>nullptr</code>: краят е съседът на началото, а обхождането спира по брой.</li>
          <li>Декът е АТД с четири бързи операции; реализира се с цикличен масив или с цикличен двусвързан списък.</li>
        </ul>
        <p className="sl-links">
          <a href={notes}>Бележките към седмица 5</a> · <a href={`${notes}#задачи`}>Задачите</a> · <a href={quiz}>Тест за самопроверка</a>
        </p>
      </>
    ),
  },
];

export default function Week05Deck({ notes, quiz }: { notes: string; quiz: string }): ReactElement {
  const slides = useMemo(() => SLIDES(notes, quiz), [notes, quiz]);
  return <Deck title="Седмица 5 · Двусвързан списък" slides={slides} notes={notes} />;
}
