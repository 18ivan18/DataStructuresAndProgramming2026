import { useMemo } from 'react';
import type { ReactElement } from 'react';
import TreeAnatomy from './TreeAnatomy';
import TreeTaskTrace from './TreeTaskTrace';
import { Deck, type Slide } from './Deck';

const USES: [string, string, string][] = [
  ['preorder', 'корен, ляво, дясно', 'копиране и сериализация; контекст надолу'],
  ['inorder', 'ляво, корен, дясно', 'инфиксният израз; сортиран ред в BST'],
  ['postorder', 'ляво, дясно, корен', 'освобождаване; всичко, смятано от децата нагоре'],
  ['по нива', 'ниво по ниво, отляво надясно', 'разстояние от корена; всяко условие с думата „ниво“'],
];

const TEMPLATE: [string, string, string][] = [
  ['брой възли', '0', '1 + left + right'],
  ['сума на стойностите', '0', 'node->data + left + right'],
  ['височина', '0', '1 + max(left, right)'],
  ['брой листа', '0', 'листо: 1, иначе left + right'],
];

const MEMORY: [string, string, string][] = [
  ['рекурсивно DFS', 'O(h) рамки', 'h = n при изродено дърво'],
  ['итеративно DFS', 'O(h) указателя', 'същото, но стекът е твой'],
  ['BFS с опашка', 'O(w), едно ниво', 'w ≈ n / 2 при пълно дърво'],
];

const SLIDES = (notes: string, quiz: string): Slide[] => [
  {
    id: 'slide-cover',
    title: 'Въведение в дърветата',
    cover: true,
    content: (
      <>
        <p className="sl-eyebrow">Седмица 7 · Структури от данни и програмиране</p>
        <p className="sl-lede">
          Първата структура, в която „следващ“ не е един. Понятията, двата записа, четирите обхождания и шаблонът, който решава почти всяка задача за дърво.
        </p>
        <p className="muted small">← → листат · F е цял екран · Esc връща към бележките</p>
      </>
    ),
  },
  {
    id: 'slide-why',
    title: 'Линейно срещу йерархично',
    content: (
      <>
        <div className="sl-cols">
          <div className="sl-card">
            <h3>Списък</h3>
            <p>
              Всеки елемент има най-много един следващ. Всеки два елемента са сравними по „предшествие“ — наредбата е <b>линейна</b>.
            </p>
          </div>
          <div className="sl-card">
            <h3>Дърво</h3>
            <p>
              Един корен, всеки друг възел с точно един родител, без цикли. Има несравними двойки — наредбата е <b>частична</b>.
            </p>
          </div>
        </div>
        <p className="callout">
          Щом всеки възел се достига по точно един път, обхождането не трябва да помни къде е било. Падне ли това условие, структурата е граф — и тогава трябва.
        </p>
      </>
    ),
  },
  {
    id: 'slide-anatomy',
    title: 'Едно дърво, шест понятия',
    badge: 'Пробвай',
    content: <TreeAnatomy />,
  },
  {
    id: 'slide-repr',
    title: 'Как се пише възел',
    content: (
      <>
        <div className="sl-cols">
          <div>
            <pre>{'template <typename T>\nstruct Node\n{\n    T data;\n\n    Node<T> *left;\n    Node<T> *right;\n};'}</pre>
            <p className="muted small">Двоично: две наредени места. Ляво и дясно не са взаимозаменяеми.</p>
          </div>
          <div>
            <pre>{'template <typename T>\nstruct NodeFull\n{\n    T data;\n\n    std::vector<NodeFull<T> *> children;\n};'}</pre>
            <p className="muted small">
              N-ично: вектор от деца. Рекурсията става цикъл по <code>children</code>.
            </p>
          </div>
        </div>
        <p>
          Един и същ указател значи „възел“ и „цялото дърво под него“. Затова функциите върху дърво приемат и връщат <code>Node *</code>, а поддървото е
          пълноценно дърво само по себе си.
        </p>
      </>
    ),
  },
  {
    id: 'slide-levelarray',
    title: 'Как се чете [1,null,2,3]',
    content: (
      <>
        <p>
          Масив по нива, отляво надясно. Първият елемент е коренът; всеки следващ попълва по две клетки — лявото и дясното дете — на поредния вече създаден
          възел. <code>null</code> не е възел и няма деца, затова неговите клетки не се изброяват.
        </p>
        <pre>{'[1,null,2,3]              1 без ляво дете; дясното е 2; лявото на 2 е 3\n[3,9,20,null,null,15,7]   9 е листо; 15 и 7 са децата на 20'}</pre>
        <p className="callout">
          <code>[1,null,2,3]</code> и <code>[1,2,null,3]</code> са различни дървета: едната верига върви надясно, другата — наляво.
        </p>
      </>
    ),
  },
  {
    id: 'slide-orders',
    title: 'Трите реда са един ред разлика',
    content: (
      <>
        <pre>{'void inorder(Node *node)\n{\n    if (!node) return;\n\n    inorder(node->left);\n    visit(node);          // preorder: преди реда отгоре\n    inorder(node->right); // postorder: след реда отдолу\n}'}</pre>
        <table>
          <thead>
            <tr>
              <th>Обхождане</th>
              <th>Ред</th>
              <th>За какво</th>
            </tr>
          </thead>
          <tbody>
            {USES.map(([name, order, use]) => (
              <tr key={name}>
                <td>
                  <b>{name}</b>
                </td>
                <td>{order}</td>
                <td>{use}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    ),
  },
  {
    id: 'slide-traverse',
    title: 'Стекът на извикванията, на живо',
    badge: 'Пробвай',
    lede: 'Една и съща обиколка; различава се само в кой момент записваме възела. Последният вариант държи същия стек на ръка.',
    content: <TreeTaskTrace task="traverse" />,
  },
  {
    id: 'slide-bfs',
    title: 'Един ред разделя нивата',
    badge: 'Пробвай',
    lede: 'В началото на всяка обиколка в опашката стоят точно възлите на едно ниво. Затова размерът се запомня преди цикъла, а не в условието му.',
    content: <TreeTaskTrace task="levels" />,
  },
  {
    id: 'slide-template',
    title: 'Шаблонът, който решава почти всичко',
    content: (
      <>
        <pre>{'T solve(Node *node)\n{\n    if (!node) return neutral;\n\n    T left = solve(node->left);\n    T right = solve(node->right);\n\n    return combine(node->data, left, right);\n}'}</pre>
        <table>
          <thead>
            <tr>
              <th>Задача</th>
              <th>neutral</th>
              <th>combine</th>
            </tr>
          </thead>
          <tbody>
            {TEMPLATE.map(([name, neutral, combine]) => (
              <tr key={name}>
                <td>{name}</td>
                <td>
                  <code>{neutral}</code>
                </td>
                <td>
                  <code>{combine}</code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="muted small">
          Отгоре надолу носиш контекст в параметър (пътя дотук); отдолу нагоре връщаш отговор от всяко поддърво. Задача 2 е вторият вид.
        </p>
      </>
    ),
  },
  {
    id: 'slide-cost',
    title: 'Време едно, памет — две',
    content: (
      <>
        <table>
          <thead>
            <tr>
              <th>Обхождане</th>
              <th>Допълнителна памет</th>
              <th>В най-лошия случай</th>
            </tr>
          </thead>
          <tbody>
            {MEMORY.map(([name, mem, worst]) => (
              <tr key={name}>
                <td>{name}</td>
                <td>
                  <b>{mem}</b>
                </td>
                <td>{worst}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>
          Времето е O(n) и при четирите: всеки възел се пипа веднъж. Паметта зависи от формата — и двете мерки са взаимно обратни: при изродено дърво h = n, а
          w = 1; при пълно дърво h ≈ log n, а w ≈ n / 2.
        </p>
        <p className="callout">
          Дърво с n възела е високо между ⌈log₂(n + 1)⌉ и n. Затова в обосновка се пише <b>O(h)</b>, а не O(log n) — логаритъмът идва чак с гаранция за
          балансираност.
        </p>
      </>
    ),
  },
  {
    id: 'slide-traps',
    title: 'Петте капана',
    content: (
      <>
        <ol>
          <li>
            Проверката за <code>nullptr</code> е първият ред. Празното дърво е валиден вход.
          </li>
          <li>
            Листо е <code>!node-&gt;left &amp;&amp; !node-&gt;right</code>. Възелът с едно дете е най-често забравяната ветка.
          </li>
          <li>
            При BFS <code>levelSize</code> се запомня <b>преди</b> вътрешния цикъл — иначе двете нива се сливат.
          </li>
          <li>
            Децата влизат в опашката винаги отляво надясно. Зиг-загът сменя само къде се записва стойността.
          </li>
          <li>
            <code>delete</code> само в postorder: след него полетата на възела са чужда памет.
          </li>
        </ol>
      </>
    ),
  },
  {
    id: 'slide-end',
    title: 'Накратко',
    content: (
      <>
        <ul>
          <li>Дърво: един корен, по един родител, без цикли — значи частична наредба и точно един път до всеки възел.</li>
          <li>Поддървото е дърво, а указателят към възел е цялото дърво под него. Оттам идва рекурсията.</li>
          <li>Трите DFS реда се различават по един ред код; по нива се прави с опашка и с размера на нивото.</li>
          <li>Три дупки запълват почти всяка задача: отговор за празно дърво, какво питаш децата, как сглобяваш.</li>
          <li>Време O(n) винаги; памет O(h) при дълбочина и O(w) при ширина — и h може да е n.</li>
        </ul>
        <p className="sl-links">
          <a href={notes}>Бележките към седмица 7</a> · <a href={`${notes}#задачи`}>Задачите</a> · <a href={quiz}>Тест за самопроверка</a>
        </p>
      </>
    ),
  },
];

export default function Week07Deck({ notes, quiz }: { notes: string; quiz: string }): ReactElement {
  const slides = useMemo(() => SLIDES(notes, quiz), [notes, quiz]);
  return <Deck title="Седмица 7 · Въведение в дърветата" slides={slides} notes={notes} />;
}
