import { useMemo, useState } from 'react';
import type { ReactElement, ReactNode } from 'react';
import { childrenOf, depths, height, isLeaf, layout, parseLevelArray, size, subtreeSizes, type Mark } from '../lib/tree';
import { TreeDiagram } from './TreeDiagram';

type Concept = 'root' | 'leaves' | 'inner' | 'subtree' | 'depth' | 'order';

const TABS: [Concept, string][] = [
  ['root', 'корен и деца'],
  ['leaves', 'листа'],
  ['inner', 'вътрешни възли'],
  ['subtree', 'поддърво'],
  ['depth', 'ниво, дълбочина, височина'],
  ['order', 'сравними ли са два възела'],
];

export default function TreeAnatomy(): ReactElement {
  const [concept, setConcept] = useState<Concept>('root');
  const tree = useMemo(() => parseLevelArray('A B C D E null F'), []);
  const cells = useMemo(() => layout(tree), [tree]);
  const byVal = useMemo(() => new Map([...tree.nodes.values()].map((n) => [n.val, n.id])), [tree]);
  const id = (val: string): number => byVal.get(val)!;
  const level = useMemo(() => depths(tree), [tree]);
  const sizes = useMemo(() => subtreeSizes(tree), [tree]);

  const marks: Record<number, Mark> = {};
  let badges: Record<number, string> | undefined;
  let text: ReactNode = null;

  if (concept === 'root') {
    marks[id('A')] = 'current';
    marks[id('B')] = 'stack';
    marks[id('C')] = 'stack';
    text = (
      <>
        <b>A</b> е <b>корен</b>: единственият възел без родител, и единственото място, откъдето външният свят държи дървото — точно както <code>first</code> държи
        списък. <b>B</b> и <b>C</b> са неговите <b>деца</b>, а A е техният <b>родител</b>. B и C са <b>братя</b>.
        <br />
        Всеки възел има най-много един родител. Точно това прави структурата дърво: няма как да стигнеш до един и същ възел по два различни пътя.
      </>
    );
  }

  if (concept === 'leaves') {
    [...tree.nodes.values()].forEach((n) => {
      if (isLeaf(tree, n.id)) marks[n.id] = 'current';
    });
    text = (
      <>
        <b>Листата</b> са възлите без деца — тук <b>D</b>, <b>E</b> и <b>F</b>. В кода листо е възел, за който{' '}
        <code>node-&gt;left == nullptr &amp;&amp; node-&gt;right == nullptr</code>. Почти всяка рекурсия върху дърво спира именно тук: листото е дъното, от което
        отговорът започва да се връща нагоре.
      </>
    );
  }

  if (concept === 'inner') {
    [...tree.nodes.values()].forEach((n) => {
      if (!isLeaf(tree, n.id)) marks[n.id] = 'path';
    });
    badges = Object.fromEntries([...tree.nodes.values()].map((n) => [n.id, String(childrenOf(tree, n.id).length)]));
    text = (
      <>
        <b>Вътрешните</b> възли са тези с поне едно дете. Цифрата отбелязва колко деца има всеки. В <b>двоично</b> дърво това число е 0, 1 или 2 — и внимавай:{' '}
        <b>C</b> има само дясно дете. Възел с едно дете е най-честият пропуснат случай в задачите; дърво, в което всеки възел има 0 или 2 деца, се нарича{' '}
        <b>пълно</b> (full).
      </>
    );
  }

  if (concept === 'subtree') {
    marks[id('B')] = 'current';
    marks[id('D')] = 'path';
    marks[id('E')] = 'path';
    text = (
      <>
        <b>Поддървото</b> на B е самото B заедно с всичко под него — {sizes.get(id('B'))} възела. Погледнато отвътре, то е пълноценно дърво с корен B.
        <br />
        Затова почти всяка задача за дърво се решава рекурсивно: <code>f(node)</code> пита <code>f(node-&gt;left)</code> и <code>f(node-&gt;right)</code> и
        сглобява отговора. Указателят <code>Node *</code> едновременно значи „възел“ и „цялото дърво под него“.
      </>
    );
  }

  if (concept === 'depth') {
    [...tree.nodes.values()].forEach((n) => {
      marks[n.id] = level.get(n.id) === 0 ? 'current' : level.get(n.id) === 1 ? 'stack' : 'queue';
    });
    badges = Object.fromEntries([...tree.nodes.values()].map((n) => [n.id, String(level.get(n.id))]));
    text = (
      <>
        Цифрата до всеки възел е неговата <b>дълбочина</b> — броят на стъпките от корена дотам. Възлите с една и съща дълбочина образуват <b>ниво</b>; тук нивата
        са 3. <b>Височината</b> на дървото е дължината на най-дългия път от корена до листо, мерена в брой възли: {height(tree)}.
        <br />
        Височината е единственото, което има значение за сложността: рекурсията заема толкова рамки, а обхождането в ширина държи най-широкото ниво в опашката.
        Дърво с {size(tree)} възела може да е високо {size(tree)} (изродено в списък) или само ⌈log₂({size(tree)} + 1)⌉ = 3, ако е добре разклонено.
      </>
    );
  }

  if (concept === 'order') {
    marks[id('A')] = 'path';
    marks[id('B')] = 'path';
    marks[id('E')] = 'current';
    marks[id('F')] = 'current';
    text = (
      <>
        A е предшественик на E — те са <b>сравними</b>: между тях има път надолу (A, B, E). Но <b>E</b> и <b>F</b> не са: нито едното е над другото. Затова
        множеството от възлите с релацията „предшествие“ е <b>частично наредено</b>.
        <br />
        В списък такива двойки няма — там всеки два елемента са сравними, значи наредбата е <b>линейна</b>. Точно това губим и печелим: няма „следващ“ елемент, но
        затова пък има по няколко посоки надолу и затова едно търсене може да отрязва цели поддървета.
      </>
    );
  }

  return (
    <div className="playground">
      <div className="presets" role="group" aria-label="Понятия">
        {TABS.map(([key, name]) => (
          <button key={key} type="button" aria-pressed={key === concept} onClick={() => setConcept(key)}>
            {name}
          </button>
        ))}
      </div>
      <TreeDiagram nodes={[...tree.nodes.values()]} cells={cells} marks={marks} badges={badges} label="Дърво с корен A" stubs={concept === 'inner'} minWidth={240} />
      <p className="tn-note">{text}</p>
    </div>
  );
}
