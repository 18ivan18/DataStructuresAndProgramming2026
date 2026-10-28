import { useMemo } from 'react';
import type { ReactElement } from 'react';
import QueueSandbox from './QueueSandbox';
import { Deck, type Slide } from './Deck';
import { Ring } from './Ring';

function Chain({ values }: { values: number[] }): ReactElement {
  return (
    <ol className="chain" aria-label={`Свързана опашка: ${values.join(', ')}`}>
      <li className="head">first</li>
      {values.flatMap((value, i) => [
        <li key={`${value}-arrow`} className="arrow" aria-hidden="true">
          →
        </li>,
        <li key={value} className={`node${i === 0 ? ' top' : ''}${i === values.length - 1 ? ' last' : ''}`}>
          {i === values.length - 1 && <span className="addr">last</span>}
          <span className="box">
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

const VARIANTS: [string, string, string, string][] = [
  ['Вектор', 'O(1) аморт.', 'O(n)', 'не'],
  ['Едносвързан списък', 'O(1)', 'O(1)', 'да — това реализираме'],
  ['Двусвързан списък', 'O(1)', 'O(1)', 'да, но с излишен указател'],
];

const SLIDES = (notes: string, quiz: string): Slide[] => [
  {
    id: 'slide-cover',
    title: 'Опашка',
    cover: true,
    content: (
      <>
        <p className="sl-eyebrow">Седмица 3 · Структури от данни и програмиране</p>
        <p className="sl-lede">FIFO, цикличният масив и свързаната опашка — двата края и какво ни струва всеки от тях.</p>
        <Chain values={[4, 5, 6]} />
        <p className="muted small">← → листат · F е цял екран · Esc връща към бележките</p>
      </>
    ),
  },
  {
    id: 'slide-fifo',
    title: 'First In, First Out',
    lede: 'Добавяме и махаме от противоположни страни — за разлика от стека, където двете стават от една и съща.',
    content: (
      <>
        <div className="sl-cols">
          <div>
            <ul>
              <li>
                <code>enqueue</code> — добавя нов елемент в края
              </li>
              <li>
                <code>dequeue</code> — премахва и връща елемента в началото
              </li>
              <li>
                <code>peek</code> — показва началото, без да го маха
              </li>
            </ul>
            <p className="muted small">
              И <code>dequeue</code>, и <code>peek</code> хвърлят <code>std::length_error</code> върху празна опашка: няма какъв <code>T</code> да върнат.
            </p>
          </div>
          <div className="sl-card">
            <h3>Какво значи това</h3>
            <p>
              Редът на излизане е редът на влизане. Само с <code>enqueue</code>, <code>dequeue</code> и <code>peek</code> опашката не може да обърне редица —
              изваждането и връщането в същата опашка само я върти.
            </p>
            <p className="muted small">Обръщането иска достъп до последно влезлия, тоест стек. Затова задачи 1 и 2 си разменят двете структури.</p>
          </div>
        </div>
      </>
    ),
  },
  {
    id: 'slide-where',
    title: 'Върху какво да я сложим',
    lede: 'Изборът на структура решава дали и двете операции ще са бързи.',
    content: (
      <>
        <table>
          <thead>
            <tr>
              <th>Структура</th>
              <th>
                <code>push_back</code>
              </th>
              <th>
                <code>pop_front</code>
              </th>
              <th>Подходяща?</th>
            </tr>
          </thead>
          <tbody>
            {VARIANTS.map(([name, back, front, ok]) => (
              <tr key={name}>
                <td>{name}</td>
                <td>
                  <b>{back}</b>
                </td>
                <td>
                  <b>{front}</b>
                </td>
                <td>{ok}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="callout">
          Векторът пада заради <code>pop_front</code>, който мести n − 1 елемента. Ако спрем да местим и въведем индекс <code>first</code>, получаваме точно
          цикличния масив.
        </p>
        <p>
          Обратният вариант (<code>push_front</code> + <code>pop_back</code>) изключва едносвързания списък: от възел не се връщаме назад, значи{' '}
          <code>pop_back</code> му е O(n).
        </p>
      </>
    ),
  },
  {
    id: 'slide-ring',
    title: 'Последователно: кръгът',
    lede: 'arr[(first + n) % capacity] = el — краят се навива в началото, където dequeue вече е освободил място.',
    content: (
      <>
        <div className="sl-cols">
          <Ring
            cells={[1, 2, 3, 4, 5, 6, 7, 8]}
            first={3}
            n={5}
            markers={[
              { index: 3, label: 'first', cls: 'm-first' },
              { index: 0, label: 'следващ запис', cls: 'm-end' },
            ]}
            label="Цикличен масив с капацитет 8: опашката е 4, 5, 6, 7, 8 и започва на индекс 3"
          />
          <div>
            <pre>{'// enqueue\narr[(first + n) % capacity] = el;\nn++;\n\n// dequeue\nT item = arr[first];\nfirst = (first + 1) % capacity;\nn--;'}</pre>
            <p>
              <code>dequeue</code> не мести нищо — само бута <code>first</code>. Старите стойности остават в клетките (в кръга са бледи), но вече не са част от
              опашката.
            </p>
            <p className="muted small">
              При растеж <code>resize</code> чете <code>arr[(first + i) % this-&gt;capacity]</code> и пише от индекс 0: кръгът се разгъва и{' '}
              <code>first</code> става 0. Затова старият капацитет се обновява <b>след</b> цикъла.
            </p>
          </div>
        </div>
      </>
    ),
  },
  {
    id: 'slide-quarter',
    title: 'Защо смаляваме при четвърт',
    content: (
      <>
        <div className="sl-cols">
          <div>
            <pre>{'// why /4?\nif (n == capacity / 4 && n > 0)\n{\n    resize(capacity / 2);\n}'}</pre>
            <p>
              При правило „половина“ стоим точно на границата веднага след свиването: следващият <code>enqueue</code> удвоява обратно, следващият{' '}
              <code>dequeue</code> пак свива. Всяка операция копира n елемента.
            </p>
          </div>
          <div className="sl-card">
            <h3>А какво пази <code>n &gt; 0</code></h3>
            <p>
              Без него свиването продължава и при изпразване: 8 → 4 → 2, после 1, после <code>resize(0)</code> — и <code>% capacity</code> става деление на
              нула.
            </p>
            <p className="muted small">Същата сметка и същият коментар стояха при стека от седмица 2. Границата за растеж и границата за свиване трябва да са различни.</p>
          </div>
        </div>
        <p className="callout">
          1000 <code>enqueue</code> върху празна опашка: капацитетът минава 8, 16, ..., 1024, а <code>resize</code> премества общо 8 + 16 + ... + 512 = 1016
          елемента — по-малко от едно преместване на елемент. Това е амортизираното O(1).
        </p>
      </>
    ),
  },
  {
    id: 'slide-linked',
    title: 'Свързано: два указателя',
    content: (
      <>
        <Chain values={[4, 5, 6]} />
        <div className="sl-cols">
          <pre>{'Node *oldLast = last;\nlast = new Node(el);\n\nif (isEmpty())\n{\n    first = last;\n}\nelse\n{\n    oldLast->next = last;\n}\n\nn++;'}</pre>
          <div>
            <p>
              Държим <code>first</code> и <code>last</code>, затова и двата края са O(1) — <b>в най-лошия случай</b>, не амортизирано: нищо не се мести и не се
              копира.
            </p>
            <p>
              Редът е важен: <code>last</code> вече е сменен, когато стигнем до проверката. Затова питаме <code>isEmpty()</code>, което гледа{' '}
              <code>first</code> — поле, което методът още не е пипал. С <code>if (!last)</code> проверката никога не е вярна и първият{' '}
              <code>enqueue</code> записва през нулев указател.
            </p>
            <p className="muted small">
              Едносвързан списък стига: опашката не маха от края, значи втори указател на възел не купува нищо.
            </p>
          </div>
        </div>
      </>
    ),
  },
  {
    id: 'slide-sandbox',
    title: 'Двете, една до друга',
    badge: 'Пробвай',
    lede: 'Всяка операция се прилага и към цикличния масив, и към свързаната опашка. Махни няколко отпред и после добавяй: краят ще се навие в началото.',
    content: <QueueSandbox />,
  },
  {
    id: 'slide-stl',
    title: 'Наготово: std::queue',
    content: (
      <>
        <div className="sl-cols">
          <pre>{'#include <queue>\n\nstd::queue<int> q;\nq.push(5);\nq.push(6);\nq.push(7);\n\nwhile (!q.empty())\n{\n    std::cout << q.front();\n    q.pop();\n}'}</pre>
          <div>
            <pre>{'template<\n    class T,\n    class Container = std::deque<T>\n> class queue;'}</pre>
            <p>
              Адаптер, точно като <code>std::stack</code>: иска от контейнера си <code>push_back</code>, <code>pop_front</code>, <code>front</code> и{' '}
              <code>back</code>. <code>std::vector</code> не може да е този контейнер — няма <code>pop_front</code>.
            </p>
            <p className="muted small">
              <code>pop()</code> връща <code>void</code> нарочно: ако изваждането връщаше стойност и копирането ѝ хвърлеше изключение, елементът вече е махнат и
              се губи. Нашите <code>dequeue</code> правят точно това — за <code>int</code> безобидно, иначе не.
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
          <li>Опашката добавя и маха от противоположни краища: редът на излизане е редът на влизане, и обръщане не може без чужда помощ.</li>
          <li>
            Цикличният масив пази <code>first</code> и брои по модул <code>capacity</code> — затова <code>dequeue</code> не мести нищо, а само бута индекса.
          </li>
          <li>Растеж при пълен масив, свиване при четвърт: двете граници са различни, за да няма преоразмеряване при всяка операция.</li>
          <li>
            Свързаната опашка иска указатели към двата края и едносвързан списък ѝ стига. Всяка операция е O(1) в най-лошия случай, но плащаме{' '}
            <code>new</code> и указател на елемент.
          </li>
          <li>Всеки метод оставя всички полета съгласувани — и всяка проверка се чете през поле, което методът още не е сменил.</li>
        </ul>
        <p className="sl-links">
          <a href={notes}>Бележките към седмица 3</a> · <a href={`${notes}#задачи`}>Задачите</a> · <a href={quiz}>Тест за самопроверка</a>
        </p>
      </>
    ),
  },
];

export default function Week03Deck({ notes, quiz }: { notes: string; quiz: string }): ReactElement {
  const slides = useMemo(() => SLIDES(notes, quiz), [notes, quiz]);
  return <Deck title="Седмица 3 · Опашка" slides={slides} notes={notes} />;
}
