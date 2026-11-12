import { useMemo } from 'react';
import type { ReactElement } from 'react';
import BstShape from './BstShape';
import BstTaskTrace from './BstTaskTrace';
import { Deck, type Slide } from './Deck';

const CHOICES: [string, string, string, string][] = [
  ['несортиран масив', 'O(n)', 'O(1)', 'трябва сортиране'],
  ['сортиран масив', 'O(log n)', 'O(n)', 'наготово'],
  ['свързан списък', 'O(n)', 'O(1)', 'трябва сортиране'],
  ['BST', 'O(h)', 'O(h)', 'наготово, inorder'],
];

const CASES: [string, string][] = [
  ['листо', 'родителят получава nullptr'],
  ['едно дете', 'детето заема мястото му с цялото си поддърво'],
  ['две деца', 'наследникът — най-малкият отдясно — заема мястото му'],
];

const COST: [string, string, string][] = [
  ['търсене, вмъкване, триене', 'O(h)', 'O(n) при изродено дърво'],
  ['k-тият най-малък', 'O(h + k)', 'O(n)'],
  ['подредено изброяване', 'O(n)', 'O(n)'],
  ['памет на итератора', 'O(h)', 'O(n)'],
];

const SLIDES = (notes: string, quiz: string): Slide[] => [
  {
    id: 'slide-cover',
    title: 'Двоично наредено дърво',
    cover: true,
    content: (
      <>
        <p className="sl-eyebrow">Седмица 8 · Структури от данни и програмиране</p>
        <p className="sl-lede">
          Едно условие върху дървото от миналата седмица — и трите операции на речника стават O(h). Наредбата, формата, триенето с две деца и итераторът.
        </p>
        <p className="muted small">← → листат · F е цял екран · Esc връща към бележките</p>
      </>
    ),
  },
  {
    id: 'slide-why',
    title: 'Какво ни липсва досега',
    content: (
      <>
        <table>
          <thead>
            <tr>
              <th>Структура</th>
              <th>намиране</th>
              <th>вмъкване</th>
              <th>подредено изброяване</th>
            </tr>
          </thead>
          <tbody>
            {CHOICES.map(([name, find, add, walk]) => (
              <tr key={name}>
                <td>{name === 'BST' ? <b>{name}</b> : name}</td>
                <td>{find}</td>
                <td>{add}</td>
                <td>{walk}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="callout">
          Сортираният масив пази наредбата чрез <b>позиции</b>, а преместването на позиция струва. Дървото я пази чрез <b>указатели</b> — затова вмъкването не
          мести нищо.
        </p>
      </>
    ),
  },
  {
    id: 'slide-order',
    title: 'Наредбата е за цялото поддърво',
    content: (
      <>
        <div className="sl-cols">
          <div>
            <pre>{'template <typename Key, typename Value>\nstruct Node\n{\n    Key key;\n    Value value;\n\n    Node *left;\n    Node *right;\n};'}</pre>
            <p className="muted small">Наредбата е по ключ. Стойността не участва в сравненията.</p>
          </div>
          <div className="sl-card">
            <h3>Три условия</h3>
            <ul>
              <li>всичко вляво е по-малко от възела;</li>
              <li>всичко вдясно е по-голямо;</li>
              <li>и двете поддървета са BST.</li>
            </ul>
          </div>
        </div>
        <p className="callout">
          Inorder обхождането на BST дава ключовете в <b>растящ ред</b>. Оттам идват задача 2 (k-тият най-малък), задача 8 (итераторът) и най-късата проверка за
          валидност.
        </p>
      </>
    ),
  },
  {
    id: 'slide-validate',
    title: 'Прозорецът пътува надолу',
    badge: 'Пробвай',
    lede: 'Пусни 5 4 6 null null 3 7: числото 3 е наред спрямо родителя си 6, но е в дясното поддърво на 5. Проверка „всяко дете спрямо родителя си“ го пропуска.',
    content: <BstTaskTrace task="validate" />,
  },
  {
    id: 'slide-shape',
    title: 'Формата е редът на вмъкване',
    badge: 'Пробвай',
    lede: 'Едни и същи ключове, различен ред — различна височина. Опитай сортирано.',
    content: <BstShape />,
  },
  {
    id: 'slide-search',
    title: 'Търсенето е всичко останало',
    content: (
      <>
        <pre>{'TreeNode *searchBST(TreeNode *root, int val)\n{\n    while (root && root->val != val)\n    {\n        root = root->val < val ? root->right : root->left;\n    }\n    return root;\n}'}</pre>
        <ul>
          <li>Всяко сравнение изхвърля цяло поддърво — оттам O(h).</li>
          <li>
            Цикълът свършва на възел или на <code>nullptr</code>, а <code>nullptr</code> е точно мястото, където ключът би бил.
          </li>
          <li>
            Затова <b>вмъкването</b> е търсене, което не е намерило: новият ключ става листо и нищо не се мести.
          </li>
        </ul>
        <p className="muted small">
          Липсващият ключ се връща като <code>nullptr</code>, не като изключение — класът <code>BST</code> го връща като итератор, сравним с <code>end()</code>.
        </p>
      </>
    ),
  },
  {
    id: 'slide-insert',
    title: 'Вмъкване: един нов лист',
    badge: 'Пробвай',
    content: <BstTaskTrace task="insert" />,
  },
  {
    id: 'slide-delete-cases',
    title: 'Триене: трите случая',
    content: (
      <>
        <table>
          <thead>
            <tr>
              <th>Случай</th>
              <th>Какво става</th>
            </tr>
          </thead>
          <tbody>
            {CASES.map(([name, what]) => (
              <tr key={name}>
                <td>
                  <b>{name}</b>
                </td>
                <td>{what}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>
          Първите два се пишат с един ред: <code>return x-&gt;left</code> или <code>return x-&gt;right</code> — при листо това е <code>nullptr</code>.
        </p>
        <p className="callout">
          Наследникът е по-голям от всичко отляво и по-малък от всичко останало отдясно, значи наредбата остава. И няма ляво дете — иначе не би бил най-малкият.
          Предшественикът (най-големият отляво) върши същото.
        </p>
      </>
    ),
  },
  {
    id: 'slide-delete',
    title: 'Триене, на живо',
    badge: 'Пробвай',
    lede: 'Върху 5 3 6 2 4 null 7: ключ 2 е листо, 6 има едно дете, 5 и 3 имат две.',
    content: <BstTaskTrace task="delete" />,
  },
  {
    id: 'slide-serialize',
    title: 'Сериализация без нито един null',
    content: (
      <>
        <pre>{'5 3 8 2 4 7   ->   preorder на дървото\n ^ корен\n   ^ ^ ^ по-малките от 5: лявото поддърво\n         ^ ^ първото по-голямо: дясното започва тук'}</pre>
        <p>
          При произволно двоично дърво preorder не стига — трябват и <code>null</code>-овете. При <b>наредено</b> дърво наредбата играе тяхната роля: първото
          число, по-голямо от корена, започва дясното поддърво (<code>std::upper_bound</code>).
        </p>
        <p className="callout">
          Inorder не става: всички BST с едни и същи ключове имат едно и също inorder. То възстановява множеството ключове, но не формата.
        </p>
      </>
    ),
  },
  {
    id: 'slide-iterator',
    title: 'Итераторът е спряно inorder',
    badge: 'Пробвай',
    lede: 'Конструкторът слага левия ръб; next() вади върха и слага левия ръб на дясното му поддърво. O(h) памет, амортизирано O(1) на извикване.',
    content: <BstTaskTrace task="iterator" />,
  },
  {
    id: 'slide-cost',
    title: 'Всичко зависи само от h',
    content: (
      <>
        <table>
          <thead>
            <tr>
              <th>Операция</th>
              <th>Сложност</th>
              <th>В най-лошия случай</th>
            </tr>
          </thead>
          <tbody>
            {COST.map(([name, cost, worst]) => (
              <tr key={name}>
                <td>{name}</td>
                <td>
                  <b>{cost}</b>
                </td>
                <td>{worst}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="callout">
          h е между ⌈log₂(n + 1)⌉ и n, и кое от двете ще е, решава редът на вмъкване, а не кодът. Затова се пише <b>O(h)</b>, а гаранция за log n дават
          балансираните дървета от седмица 10.
        </p>
      </>
    ),
  },
  {
    id: 'slide-end',
    title: 'Накратко',
    content: (
      <>
        <ul>
          <li>Наредбата е за цялото поддърво, не за прякото дете — затова проверката носи интервал надолу.</li>
          <li>Inorder дава растящ ред. Почти всяка задача за BST се свежда до това изречение.</li>
          <li>Търсене, вмъкване и триене са един и същ път надолу: O(h) сравнения и нищо не се мести.</li>
          <li>Триенето с две деца взема наследника — най-малкия отдясно, който няма ляво дете.</li>
          <li>Наредбата замества null-овете при сериализация, а итераторът пази само левия ръб: O(h) памет.</li>
          <li>Формата идва от реда на вмъкване. Сортиран вход изражда дървото в списък.</li>
        </ul>
        <p className="sl-links">
          <a href={notes}>Бележките към седмица 8</a> · <a href={`${notes}#задачи`}>Задачите</a> · <a href={quiz}>Тест за самопроверка</a>
        </p>
      </>
    ),
  },
];

export default function Week08Deck({ notes, quiz }: { notes: string; quiz: string }): ReactElement {
  const slides = useMemo(() => SLIDES(notes, quiz), [notes, quiz]);
  return <Deck title="Седмица 8 · Двоично наредено дърво (BST)" slides={slides} notes={notes} />;
}
