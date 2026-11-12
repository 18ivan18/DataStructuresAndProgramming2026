import { emptyTree, parseLevelArray, type AuxPanel, type Mark, type TNode, type Tree, type TreeKind } from './tree';

/* The week 8 widgets. Every step carries the whole tree, because insert and delete change its
   shape: the picture is laid out from the snapshot, not from one fixed tree. */

export interface BstStep {
  kind: TreeKind;
  message: string;
  marks: Record<number, Mark>;
  aux: AuxPanel[];
  /** What the algorithm has written down so far. */
  out: string[];
  nodes: TNode[];
  root: number | null;
  badges?: Record<number, string>;
  /** The input as cells, with `at` the one being read and `span` the part still in play. */
  tape?: string[];
  at?: number;
  span?: number[];
  /** The answer, once there is one. */
  result?: string;
}

interface Model {
  nodes: Map<number, TNode>;
  root: number | null;
  next: number;
}

const model = (tree: Tree): Model => ({
  nodes: new Map([...tree.nodes].map(([id, n]) => [id, { ...n, kids: [...n.kids] }])),
  root: tree.root,
  next: Math.max(0, ...tree.nodes.keys()) + 1,
});

const snap = (m: Model): TNode[] => [...m.nodes.values()].map((n) => ({ ...n, kids: [...n.kids] }));
const lab = (m: Model, id: number): string => m.nodes.get(id)!.val;
const num = (m: Model, id: number): number => Number(m.nodes.get(id)!.val);
const kid = (m: Model, id: number, slot: 0 | 1): number | null => m.nodes.get(id)!.kids[slot] ?? null;
const link = (m: Model, id: number, slot: 0 | 1, to: number | null): void => {
  m.nodes.get(id)!.kids[slot] = to;
};
const make = (m: Model, value: number): number => {
  const id = m.next++;
  m.nodes.set(id, { id, val: String(value), kids: [null, null] });
  return id;
};

/** A tree object out of a step's snapshot, so the picture can be laid out. */
export function treeOf(nodes: TNode[], root: number | null): Tree {
  return { nodes: new Map(nodes.map((n) => [n.id, n])), root, binary: true };
}

export const parseValues = (text: string, limit = 24): number[] =>
  text
    .replace(/[[\]]/g, ' ')
    .split(/[\s,]+/)
    .filter(Boolean)
    .map(Number)
    .filter((v) => Number.isFinite(v))
    .slice(0, limit);

/** The tree that repeated BST insertion builds — the shape depends on the order. */
export function bstFromInsertions(values: number[]): Tree {
  const tree = emptyTree(true);
  const m = model(tree);
  for (const value of values) {
    if (m.root === null) {
      m.root = make(m, value);
      continue;
    }
    let at = m.root;
    for (;;) {
      const slot: 0 | 1 = value < num(m, at) ? 0 : 1;
      const next = kid(m, at, slot);
      if (next === null) {
        link(m, at, slot, make(m, value));
        break;
      }
      at = next;
    }
  }
  return { nodes: m.nodes, root: m.root, binary: true };
}

export const parseBst = (text: string): Tree => parseLevelArray(text);

export function inorderIds(tree: Tree): number[] {
  const out: number[] = [];
  const walk = (id: number | null): void => {
    if (id === null || id === undefined) return;
    const node = tree.nodes.get(id);
    if (!node) return;
    walk(node.kids[0] ?? null);
    out.push(id);
    walk(node.kids[1] ?? null);
  };
  walk(tree.root);
  return out;
}

export const inorderValues = (tree: Tree): number[] => inorderIds(tree).map((id) => Number(tree.nodes.get(id)!.val));

/** The same check as solutions/1.cpp: every node inside the window its ancestors leave it. */
export function isBst(tree: Tree): boolean {
  const ok = (id: number | null, lo: number | null, hi: number | null): boolean => {
    if (id === null || id === undefined) return true;
    const node = tree.nodes.get(id);
    if (!node) return true;
    const value = Number(node.val);
    if ((lo !== null && value <= lo) || (hi !== null && value >= hi)) return false;
    return ok(node.kids[0] ?? null, lo, value) && ok(node.kids[1] ?? null, value, hi);
  };
  return ok(tree.root, null, null);
}

export function heightOf(tree: Tree, id: number | null = tree.root): number {
  if (id === null || id === undefined) return 0;
  const node = tree.nodes.get(id);
  if (!node) return 0;
  return 1 + Math.max(heightOf(tree, node.kids[0] ?? null), heightOf(tree, node.kids[1] ?? null));
}

/** The nodes a search for `value` touches, and whether the last of them is the answer. */
export function searchPath(tree: Tree, value: number): { path: number[]; found: boolean } {
  const path: number[] = [];
  let at = tree.root;
  while (at !== null && at !== undefined) {
    const node = tree.nodes.get(at)!;
    path.push(at);
    const here = Number(node.val);
    if (here === value) return { path, found: true };
    at = here < value ? (node.kids[1] ?? null) : (node.kids[0] ?? null);
  }
  return { path, found: false };
}

const bound = (value: number | null, side: 'lo' | 'hi'): string => (value === null ? (side === 'lo' ? '-∞' : '+∞') : String(value));

const count = (n: number): string => (n === 0 ? 'празно' : n === 1 ? '1 число' : `${n} числа`);

/* ---------- task 1: is this a binary search tree (solutions/1.cpp) ---------- */

export function* validateTrace(tree: Tree): Generator<BstStep> {
  const m = model(tree);
  const frames: string[] = [];
  const done: number[] = [];
  const live: number[] = [];

  const panel = (): AuxPanel[] => [{ label: 'стек на извикванията', items: [...frames], shape: 'stack' }];
  const marks = (current: number | null, bad: number | null = null): Record<number, Mark> => {
    const map: Record<number, Mark> = {};
    done.forEach((id) => (map[id] = 'visited'));
    live.forEach((id) => (map[id] = 'path'));
    if (current !== null) map[current] = 'current';
    if (bad !== null) map[bad] = 'bad';
    return map;
  };

  if (m.root === null) {
    yield {
      kind: 'ok',
      message: 'Празното дърво е валидно BST: няма възел, който да нарушава наредбата.',
      marks: {},
      aux: [],
      out: ['true'],
      nodes: [],
      root: null,
      result: 'true',
    };
    return;
  }

  yield {
    kind: 'start',
    message:
      'Проверката не е „всяко дете спрямо родителя си“. Всеки възел трябва да е в интервала, който му оставят всички предци — затова интервалът пътува надолу.',
    marks: marks(m.root),
    aux: panel(),
    out: [],
    nodes: snap(m),
    root: m.root,
  };

  function* go(id: number | null, lo: number | null, hi: number | null): Generator<BstStep, boolean> {
    if (id === null) return true;
    const me = lab(m, id);
    const value = num(m, id);
    const range = `(${bound(lo, 'lo')}, ${bound(hi, 'hi')})`;
    frames.push(`${me} ∈ ${range}`);
    live.push(id);
    yield {
      kind: 'push',
      message: `validate(${me}): позволеният интервал е ${range}.`,
      marks: marks(id),
      aux: panel(),
      out: [],
      nodes: snap(m),
      root: m.root,
    };

    if ((lo !== null && value <= lo) || (hi !== null && value >= hi)) {
      yield {
        kind: 'error',
        message: `${me} не е в ${range}: ${lo !== null && value <= lo ? `${me} ≤ ${lo}, а всичко в това поддърво трябва да е по-голямо от ${lo}` : `${me} ≥ ${hi}, а всичко в това поддърво трябва да е по-малко от ${hi}`}. Дървото не е BST, а операторът && спира проверката дотук.`,
        marks: marks(null, id),
        aux: panel(),
        out: ['false'],
        nodes: snap(m),
        root: m.root,
        result: 'false',
      };
      return false;
    }

    const [left, right] = m.nodes.get(id)!.kids;
    yield {
      kind: 'ok',
      message: `${me} е в ${range}. Наляво интервалът става (${bound(lo, 'lo')}, ${me}), надясно — (${me}, ${bound(hi, 'hi')}).`,
      marks: marks(id),
      aux: panel(),
      out: [],
      nodes: snap(m),
      root: m.root,
    };

    if (!(yield* go(left ?? null, lo, value))) return false;
    if (!(yield* go(right ?? null, value, hi))) return false;

    frames.pop();
    live.pop();
    done.push(id);
    yield {
      kind: 'pop',
      message: `Поддървото на ${me} е наредено: рамката се маха.`,
      marks: marks(null),
      aux: panel(),
      out: [],
      nodes: snap(m),
      root: m.root,
    };
    return true;
  }

  const ok = yield* go(m.root, null, null);
  if (ok) {
    yield {
      kind: 'ok',
      message: 'Всеки възел е в интервала си: дървото е BST. Същата проверка се пише и с inorder обхождане — то трябва да излезе строго растящо.',
      marks: marks(null),
      aux: panel(),
      out: ['true'],
      nodes: snap(m),
      root: m.root,
      result: 'true',
    };
  }
}

/* ---------- task 2: the k-th smallest element (solutions/2.cpp) ---------- */

export function* kthTrace(tree: Tree, k: number): Generator<BstStep> {
  const m = model(tree);
  const stack: number[] = [];
  const written: number[] = [];
  let left = k;

  const panel = (): AuxPanel[] => [
    { label: 'стек', items: stack.map((id) => lab(m, id)), shape: 'stack' },
    { label: 'остават', items: [String(Math.max(left, 0))], shape: 'row' },
  ];
  const marks = (current: number | null, answer: number | null = null): Record<number, Mark> => {
    const map: Record<number, Mark> = {};
    written.forEach((id) => (map[id] = 'visited'));
    stack.forEach((id) => (map[id] = 'stack'));
    if (current !== null) map[current] = 'current';
    if (answer !== null) map[answer] = 'done';
    return map;
  };

  const total = tree.nodes.size;
  if (m.root === null || k < 1 || k > total) {
    yield {
      kind: 'error',
      message: total === 0 ? 'Празно дърво: няма k-ти елемент.' : `k трябва да е между 1 и ${total} — толкова възела има в дървото.`,
      marks: {},
      aux: [],
      out: [],
      nodes: snap(m),
      root: m.root,
    };
    return;
  }

  yield {
    kind: 'start',
    message: `Inorder обхождането на BST дава стойностите в растящ ред, затова k-тият най-малък е k-тият по ред. Нищо не се сортира: спираме след ${k} изваждания.`,
    marks: marks(m.root),
    aux: panel(),
    out: [],
    nodes: snap(m),
    root: m.root,
  };

  let at: number | null = m.root;
  for (;;) {
    while (at !== null) {
      stack.push(at);
      const next = kid(m, at, 0);
      yield {
        kind: 'push',
        message: `push(${lab(m, at)}): слизаме наляво, където са по-малките. ${next === null ? 'Няма ляво дете: това е най-малкият непипнат възел.' : `Следва ${lab(m, next)}.`}`,
        marks: marks(at),
        aux: panel(),
        out: written.map((id) => lab(m, id)),
        nodes: snap(m),
        root: m.root,
      };
      at = next;
    }
    const top = stack.pop()!;
    written.push(top);
    left--;
    if (left === 0) {
      yield {
        kind: 'ok',
        message: `Вадим ${lab(m, top)}: броячът стигна нула, значи ${lab(m, top)} е k-тият най-малък при k = ${k}. Спираме веднага — пипнахме ${written.length} от ${total} възела, затова обхождането е O(h + k), а не O(n).`,
        marks: marks(null, top),
        aux: panel(),
        out: written.map((id) => lab(m, id)),
        nodes: snap(m),
        root: m.root,
        result: lab(m, top),
      };
      return;
    }
    const right = kid(m, top, 1);
    yield {
      kind: 'visit',
      message: `Вадим ${lab(m, top)}: лявото му поддърво е изчерпано, значи това е следващият по големина. Остават ${left}. ${right === null ? 'Няма дясно дете.' : `Сега надясно, към ${lab(m, right)}.`}`,
      marks: marks(right),
      aux: panel(),
      out: written.map((id) => lab(m, id)),
      nodes: snap(m),
      root: m.root,
    };
    at = right;
  }
}

/* ---------- task 5: search (solutions/5.cpp) ---------- */

export function* searchTrace(tree: Tree, value: number): Generator<BstStep> {
  const m = model(tree);
  const path: number[] = [];
  const marks = (current: number | null, found: number | null = null): Record<number, Mark> => {
    const map: Record<number, Mark> = {};
    path.forEach((id) => (map[id] = 'path'));
    if (current !== null) map[current] = 'current';
    if (found !== null) map[found] = 'done';
    return map;
  };
  const panel = (): AuxPanel[] => [{ label: 'изминат път', items: path.map((id) => lab(m, id)), shape: 'row' }];

  if (m.root === null) {
    yield {
      kind: 'error',
      message: 'Празно дърво: търсенето връща nullptr веднага.',
      marks: {},
      aux: [],
      out: [],
      nodes: [],
      root: null,
      result: 'nullptr',
    };
    return;
  }

  yield {
    kind: 'start',
    message: `Търсим ${value}. Всяко сравнение изхвърля цяло поддърво — затова цената е височината, а не броят на възлите.`,
    marks: marks(m.root),
    aux: panel(),
    out: [],
    nodes: snap(m),
    root: m.root,
  };

  let at: number | null = m.root;
  while (at !== null) {
    const me = num(m, at);
    path.push(at);
    if (me === value) {
      yield {
        kind: 'ok',
        message: `${me} == ${value}: намерен след ${path.length} сравнения. Връща се указател към възела, не копие — затова searchBST връща цялото поддърво с корен ${me}.`,
        marks: marks(null, at),
        aux: panel(),
        out: [],
        nodes: snap(m),
        root: m.root,
        result: String(me),
      };
      return;
    }
    const slot: 0 | 1 = me < value ? 1 : 0;
    const next = kid(m, at, slot);
    yield {
      kind: next === null ? 'error' : 'move',
      message:
        next === null
          ? `${value} ${me < value ? '>' : '<'} ${me}, но ${me} няма ${slot === 1 ? 'дясно' : 'ляво'} дете: ${value} не се съдържа в дървото. Връщаме nullptr — празно поддърво, не грешка.`
          : `${value} ${me < value ? '>' : '<'} ${me}, значи ${value} може да е само ${slot === 1 ? 'надясно' : 'наляво'}. ${slot === 1 ? 'Лявото' : 'Дясното'} поддърво отпада цялото.`,
      marks: next === null ? marks(null) : marks(next),
      aux: panel(),
      out: [],
      nodes: snap(m),
      root: m.root,
      result: next === null ? 'nullptr' : undefined,
    };
    at = next;
  }
}

/* ---------- task 6: insert (solutions/6.cpp) ---------- */

export function* insertTrace(tree: Tree, value: number): Generator<BstStep> {
  const m = model(tree);
  const path: number[] = [];
  const marks = (current: number | null, fresh: number | null = null): Record<number, Mark> => {
    const map: Record<number, Mark> = {};
    path.forEach((id) => (map[id] = 'path'));
    if (current !== null) map[current] = 'current';
    if (fresh !== null) map[fresh] = 'done';
    return map;
  };
  const panel = (): AuxPanel[] => [{ label: 'изминат път', items: path.map((id) => lab(m, id)), shape: 'row' }];

  if (m.root === null) {
    const id = make(m, value);
    m.root = id;
    yield {
      kind: 'ok',
      message: `Празното дърво е единственият случай, в който вмъкването мести корена: ${value} става корен. Точно заради него insertIntoBST връща указател.`,
      marks: { [id]: 'done' },
      aux: [],
      out: [],
      nodes: snap(m),
      root: m.root,
      result: String(value),
    };
    return;
  }

  yield {
    kind: 'start',
    message: `Вмъкваме ${value}. Новият възел винаги става листо: слизаме по същия път, по който би минало търсенето, и го закачаме там, където търсенето е стигнало до nullptr.`,
    marks: marks(m.root),
    aux: panel(),
    out: [],
    nodes: snap(m),
    root: m.root,
  };

  let at = m.root;
  for (;;) {
    const me = num(m, at);
    path.push(at);
    const slot: 0 | 1 = value < me ? 0 : 1;
    const side = slot === 0 ? 'ляво' : 'дясно';
    const next = kid(m, at, slot);
    if (next === null) {
      const fresh = make(m, value);
      link(m, at, slot, fresh);
      yield {
        kind: 'ok',
        message: `${value} ${value < me ? '<' : '>'} ${me}, а ${side}то дете липсва: ${value} става ${side} дете на ${me}. Готово — O(h) сравнения и един нов възел, нищо друго не се мести.`,
        marks: marks(null, fresh),
        aux: panel(),
        out: [],
        nodes: snap(m),
        root: m.root,
        result: String(value),
      };
      return;
    }
    yield {
      kind: 'move',
      message: `${value} ${value < me ? '<' : '>'} ${me}: продължаваме ${side === 'ляво' ? 'наляво' : 'надясно'}, към ${lab(m, next)}. В рекурсивния запис точно това е редът \`${side === 'ляво' ? 'root->left' : 'root->right'} = insertIntoBST(${side === 'ляво' ? 'root->left' : 'root->right'}, val)\` — присвояването връща същия указател обратно.`,
      marks: marks(next),
      aux: panel(),
      out: [],
      nodes: snap(m),
      root: m.root,
    };
    at = next;
  }
}

/* ---------- task 7: delete (solutions/7.cpp) ---------- */

export function* deleteTrace(tree: Tree, key: number): Generator<BstStep> {
  const m = model(tree);
  const path: number[] = [];
  const marks = (current: number | null, extra: Record<number, Mark> = {}): Record<number, Mark> => {
    const map: Record<number, Mark> = {};
    path.forEach((id) => (map[id] = 'path'));
    if (current !== null) map[current] = 'current';
    return { ...map, ...extra };
  };
  const panel = (): AuxPanel[] => [{ label: 'изминат път', items: path.map((id) => lab(m, id)), shape: 'row' }];

  if (m.root === null) {
    yield {
      kind: 'error',
      message: 'Празно дърво: няма какво да се трие, връщаме nullptr.',
      marks: {},
      aux: [],
      out: [],
      nodes: [],
      root: null,
    };
    return;
  }

  yield {
    kind: 'start',
    message: `Триенето е две неща: намери възела (както при търсене) и го махни, без да развалиш наредбата. Търсим ${key}.`,
    marks: marks(m.root),
    aux: panel(),
    out: [],
    nodes: snap(m),
    root: m.root,
  };

  /* Find the node and its parent. */
  let parent: number | null = null;
  let at: number | null = m.root;
  while (at !== null && num(m, at) !== key) {
    const me = num(m, at);
    path.push(at);
    const slot: 0 | 1 = me < key ? 1 : 0;
    const next = kid(m, at, slot);
    yield {
      kind: next === null ? 'error' : 'move',
      message:
        next === null
          ? `${key} ${me < key ? '>' : '<'} ${me} и ${slot === 1 ? 'дясно' : 'ляво'} дете няма: ключът не е в дървото. Връщаме корена непроменен — това не е грешка.`
          : `${key} ${me < key ? '>' : '<'} ${me}: продължаваме ${slot === 1 ? 'надясно' : 'наляво'}.`,
      marks: next === null ? marks(null) : marks(next),
      aux: panel(),
      out: [],
      nodes: snap(m),
      root: m.root,
    };
    parent = at;
    at = next;
  }
  if (at === null) return;

  const target = at;
  const me = lab(m, target);
  const left = kid(m, target, 0);
  const right = kid(m, target, 1);
  const attach = (child: number | null): void => {
    if (parent === null) m.root = child;
    else link(m, parent, kid(m, parent, 0) === target ? 0 : 1, child);
  };

  yield {
    kind: 'visit',
    message: `Намерихме ${me}. Сега случаят се решава по броя на децата му: ${!left && !right ? 'няма деца' : !left || !right ? 'има точно едно дете' : 'има две деца'}.`,
    marks: marks(target),
    aux: panel(),
    out: [],
    nodes: snap(m),
    root: m.root,
  };

  if (left === null || right === null) {
    const child = left ?? right;
    attach(child);
    m.nodes.delete(target);
    yield {
      kind: 'ok',
      message:
        child === null
          ? `${me} е листо: родителят му получава nullptr на негово място и възелът се освобождава. Двата случая „няма деца“ и „има едно дете“ се пишат с един и същ ред: връщаме \`${left === null ? 'x->right' : 'x->left'}\`, което при листо е nullptr.`
          : `${me} има само едно дете: ${lab(m, child)} заема мястото му заедно с цялото си поддърво. Наредбата се запазва, защото всичко под ${me} е било от една и съща страна на предците му.`,
      marks: marks(null, child === null ? {} : { [child]: 'done' }),
      aux: panel(),
      out: [],
      nodes: snap(m),
      root: m.root,
    };
    return;
  }

  /* Two children: the successor is the smallest value on the right. */
  let successor = right;
  const walk: number[] = [right];
  while (kid(m, successor, 0) !== null) {
    successor = kid(m, successor, 0)!;
    walk.push(successor);
    yield {
      kind: 'move',
      message: `min(${me}->right): слизаме наляво, към ${lab(m, successor)}.`,
      marks: marks(successor, {
        [target]: 'bad',
        ...Object.fromEntries(walk.map((id) => [id, 'path' as Mark])),
        [successor]: 'current',
      }),
      aux: panel(),
      out: [],
      nodes: snap(m),
      root: m.root,
    };
  }

  yield {
    kind: 'visit',
    message: `С две деца нито едно от тях не може просто да се вдигне на мястото на ${me}. Трябва стойността, която е веднага след ${me} в inorder реда — най-малката в дясното поддърво, тоест ${lab(m, successor)}. Тя няма ляво дете, иначе не би била най-малката.`,
    marks: marks(null, { [target]: 'bad', [successor]: 'current' }),
    aux: panel(),
    out: [],
    nodes: snap(m),
    root: m.root,
  };

  /* deleteMin(x->right), then the successor takes the target's place. */
  const successorParent = walk.length > 1 ? walk[walk.length - 2] : null;
  const successorRight = kid(m, successor, 1);
  if (successorParent !== null) link(m, successorParent, 0, successorRight);
  const newRight = successorParent !== null ? right : successorRight;
  link(m, successor, 0, left);
  link(m, successor, 1, newRight);
  attach(successor);
  m.nodes.delete(target);
  path.length = 0;

  yield {
    kind: 'ok',
    message: `${lab(m, successor)} се изважда от дясното поддърво (deleteMin го сваля, а дясното му дете заема мястото му) и застава на мястото на ${me} — със старото ляво поддърво и с остатъка от дясното. Inorder редът е непокътнат, а цената е O(h): един път надолу за намирането и още един за най-малкия.`,
    marks: { [successor]: 'done' },
    aux: [{ label: 'изминат път', items: [], shape: 'row' }],
    out: [],
    nodes: snap(m),
    root: m.root,
  };
}

/* ---------- task 3: serialize and deserialize (solutions/3.cpp) ---------- */

export function* serializeTrace(tree: Tree): Generator<BstStep> {
  const m = model(tree);
  const written: number[] = [];
  const order: string[] = [];

  const marks = (current: number | null, frames: number[] = []): Record<number, Mark> => {
    const map: Record<number, Mark> = {};
    written.forEach((id) => (map[id] = 'visited'));
    frames.forEach((id) => (map[id] = 'path'));
    if (current !== null) map[current] = 'current';
    return map;
  };

  if (m.root === null) {
    yield {
      kind: 'ok',
      message: 'Празното дърво се сериализира в празен низ, а празният низ се връща като nullptr.',
      marks: {},
      aux: [],
      out: [],
      nodes: [],
      root: null,
      result: '""',
    };
    return;
  }

  yield {
    kind: 'start',
    message: 'Сериализацията е preorder: първо коренът, после лявото поддърво, после дясното. Нито един null не се записва — при BST не е нужен.',
    marks: marks(m.root),
    aux: [],
    out: [],
    nodes: snap(m),
    root: m.root,
  };

  const frames: number[] = [];
  function* emit(id: number | null): Generator<BstStep> {
    if (id === null) return;
    frames.push(id);
    written.push(id);
    order.push(lab(m, id));
    yield {
      kind: 'visit',
      message: `Записваме ${lab(m, id)} — при влизане, значи преди двете поддървета.`,
      marks: marks(id, frames),
      aux: [],
      out: [...order],
      nodes: snap(m),
      root: m.root,
    };
    yield* emit(kid(m, id, 0));
    yield* emit(kid(m, id, 1));
    frames.pop();
  }
  yield* emit(m.root);

  /* Rebuilding: the first value is the root, the first bigger value starts the right subtree. */
  const built = model(emptyTree(true));
  const byIndex = new Map<number, number>();
  const spanOf = (from: number, to: number): number[] => Array.from({ length: to - from }, (_, i) => from + i);
  const builtMarks = (current: number | null): Record<number, Mark> => {
    const map: Record<number, Mark> = {};
    [...built.nodes.keys()].forEach((id) => (map[id] = 'visited'));
    if (current !== null) map[current] = 'current';
    return map;
  };

  yield {
    kind: 'start',
    message: `Низът е „${order.join(' ')}“. Десериализацията използва точно това, което знаем за BST: първото число е коренът, а първото число, по-голямо от него, започва дясното поддърво. Всичко между тях е лявото.`,
    marks: {},
    aux: [],
    out: [],
    nodes: [],
    root: null,
    tape: [...order],
    at: 0,
    span: spanOf(0, order.length),
  };

  function* rebuild(from: number, to: number): Generator<BstStep, number | null> {
    if (from >= to) return null;
    const value = Number(order[from]);
    const id = make(built, value);
    byIndex.set(from, id);
    if (built.root === null) built.root = id;
    let split = from + 1;
    while (split < to && Number(order[split]) < value) split++;
    yield {
      kind: 'push',
      message: `В отрязъка [${from}, ${to - 1}] коренът е ${value}. ${
        split < to
          ? `Първото число, по-голямо от ${value}, е ${order[split]} на позиция ${split}: лявото поддърво е ${count(split - from - 1)}, дясното — ${count(to - split)}.`
          : to - from === 1
            ? 'Отрязъкът свършва тук, значи това е листо.'
            : `Няма число, по-голямо от ${value}: дясно поддърво няма, а лявото е ${count(split - from - 1)}.`
      }`,
      marks: builtMarks(id),
      aux: [],
      out: [],
      nodes: snap(built),
      root: built.root,
      tape: [...order],
      at: from,
      span: spanOf(from, to),
    };
    const left = yield* rebuild(from + 1, split);
    const right = yield* rebuild(split, to);
    link(built, id, 0, left);
    link(built, id, 1, right);
    if (left !== null || right !== null) {
      yield {
        kind: 'pop',
        message: `${value} получава децата си: ${left === null ? 'няма ляво' : `ляво ${lab(built, left)}`}, ${right === null ? 'няма дясно' : `дясно ${lab(built, right)}`}.`,
        marks: builtMarks(id),
        aux: [],
        out: [],
        nodes: snap(built),
        root: built.root,
        tape: [...order],
        at: from,
        span: spanOf(from, to),
      };
    }
    return id;
  }

  yield* rebuild(0, order.length);
  yield {
    kind: 'ok',
    message: `Същото дърво, от ${order.length} числа без нито един null. Разделянето е O(n) на ниво, значи O(n · h) общо; със записани граници за всяко поддърво става O(n).`,
    marks: builtMarks(null),
    aux: [],
    out: [...order],
    nodes: snap(built),
    root: built.root,
    tape: [...order],
    at: order.length,
    span: [],
    result: order.join(' '),
  };
}

/* ---------- task 4: a sorted sequence into a balanced BST (solutions/4.cpp) ---------- */

export function* sortedTrace(values: number[]): Generator<BstStep> {
  const built = model(emptyTree(true));
  const cells = values.map(String);
  const spanOf = (from: number, to: number): number[] => Array.from({ length: to - from }, (_, i) => from + i);
  const marks = (current: number | null): Record<number, Mark> => {
    const map: Record<number, Mark> = {};
    [...built.nodes.keys()].forEach((id) => (map[id] = 'visited'));
    if (current !== null) map[current] = 'current';
    return map;
  };

  if (!values.length) {
    yield {
      kind: 'ok',
      message: 'Празен списък: връщаме nullptr.',
      marks: {},
      aux: [],
      out: [],
      nodes: [],
      root: null,
      tape: [],
      at: 0,
      span: [],
    };
    return;
  }

  yield {
    kind: 'start',
    message:
      'Сортираният вход е в inorder ред. Коренът трябва да е средата: тогава двете половини са равни по брой и височината е най-малката възможна. Същото важи и за всяка половина — оттам идва рекурсията.',
    marks: {},
    aux: [],
    out: [],
    nodes: [],
    root: null,
    tape: cells,
    at: Math.floor(values.length / 2),
    span: spanOf(0, values.length),
  };

  function* go(from: number, to: number, why: string): Generator<BstStep, number | null> {
    if (from >= to) return null;
    const mid = from + Math.floor((to - from) / 2);
    const id = make(built, values[mid]);
    if (built.root === null) built.root = id;
    yield {
      kind: 'visit',
      message: `${why} В [${from}, ${to - 1}] средата е ${values[mid]} на позиция ${mid} — slow/fast я намират с едно минаване през списъка, без да го броят. ${values[mid]} става корен на това поддърво.`,
      marks: marks(id),
      aux: [],
      out: [],
      nodes: snap(built),
      root: built.root,
      tape: cells,
      at: mid,
      span: spanOf(from, to),
    };
    const left = yield* go(from, mid, `Лявата половина на ${values[mid]}.`);
    const right = yield* go(mid + 1, to, `Дясната половина на ${values[mid]}.`);
    link(built, id, 0, left);
    link(built, id, 1, right);
    if (left !== null || right !== null) {
      yield {
        kind: 'pop',
        message: `${values[mid]} получава ${left === null ? '' : `ляво дете ${lab(built, left)}`}${left !== null && right !== null ? ' и ' : ''}${right === null ? '' : `дясно дете ${lab(built, right)}`}.`,
        marks: marks(id),
        aux: [],
        out: [],
        nodes: snap(built),
        root: built.root,
        tape: cells,
        at: mid,
        span: spanOf(from, to),
      };
    }
    return id;
  }

  yield* go(0, values.length, 'Целият списък.');
  const result: Tree = { nodes: built.nodes, root: built.root, binary: true };
  yield {
    kind: 'ok',
    message: `Готово: ${values.length} възела и височина ${heightOf(result)} — ⌈log₂(${values.length} + 1)⌉ = ${Math.ceil(Math.log2(values.length + 1))}, тоест минималната възможна. Ако същите числа се вмъкваха едно по едно с put, дървото щеше да се изроди в списък с височина ${values.length}.`,
    marks: marks(null),
    aux: [],
    out: values.map(String),
    nodes: snap(built),
    root: built.root,
    tape: cells,
    at: values.length,
    span: [],
  };
}

/* ---------- tasks 8 and 9: the iterator (solutions/8.cpp and 9.cpp) ---------- */

export type IterOp = 'next' | 'prev' | 'hasNext' | 'hasPrev';

export function parseOps(text: string, twoWay: boolean): IterOp[] {
  const words = text
    .toLowerCase()
    .split(/[\s,()]+/)
    .filter(Boolean)
    .slice(0, 20);
  const out: IterOp[] = [];
  for (const word of words) {
    if (word.startsWith('hasn') || word === 'h') out.push('hasNext');
    else if (word.startsWith('hasp')) out.push(twoWay ? 'hasPrev' : 'hasNext');
    else if (word.startsWith('p')) out.push(twoWay ? 'prev' : 'next');
    else if (word.startsWith('n')) out.push('next');
  }
  return out;
}

const OP_TEXT: Record<IterOp, string> = {
  next: 'next()',
  prev: 'prev()',
  hasNext: 'hasNext()',
  hasPrev: 'hasPrev()',
};

export function* iteratorTrace(tree: Tree, ops: IterOp[], twoWay: boolean): Generator<BstStep> {
  const m = model(tree);
  const stack: number[] = [];
  const seen: string[] = [];
  let cursor = -1;
  const popped: number[] = [];

  const panel = (): AuxPanel[] =>
    twoWay
      ? [
          {
            label: 'стек',
            items: stack.map((id) => lab(m, id)),
            shape: 'stack',
          },
          {
            label: `seen (i = ${cursor})`,
            items: seen.map((v, i) => (i === cursor ? `[${v}]` : v)),
            shape: 'row',
          },
        ]
      : [
          {
            label: 'стек',
            items: stack.map((id) => lab(m, id)),
            shape: 'stack',
          },
        ];
  const marks = (current: number | null): Record<number, Mark> => {
    const map: Record<number, Mark> = {};
    popped.forEach((id) => (map[id] = 'visited'));
    stack.forEach((id) => (map[id] = 'stack'));
    if (current !== null) map[current] = 'current';
    return map;
  };
  const cells = (): string[] => ops.map((op) => OP_TEXT[op]);

  /* The constructor pushes the whole left edge: the smallest element ends up on top. */
  let at: number | null = m.root;
  while (at !== null) {
    stack.push(at);
    at = kid(m, at, 0);
  }

  yield {
    kind: 'start',
    message: m.root
      ? `Конструкторът слага в стека целия ляв ръб — ${stack.map((id) => lab(m, id)).join(', ')}. На върха стои най-малкият елемент, а стекът пази точно възлите, чиито стойности още не са върнати, но вече са „отворени“: O(h) памет, не O(n).`
      : 'Празно дърво: стекът е празен, значи hasNext() веднага е false.',
    marks: marks(null),
    aux: panel(),
    out: [],
    nodes: snap(m),
    root: m.root,
    tape: cells(),
    at: 0,
  };

  const out: string[] = [];
  let step = 0;
  for (const op of ops) {
    step++;
    if (op === 'hasNext') {
      const answer = cursor + 1 < seen.length || stack.length > 0;
      out.push(`hasNext → ${answer}`);
      yield {
        kind: answer ? 'ok' : 'error',
        message: `hasNext(): ${answer ? 'стекът не е празен' : 'стекът е празен и няма накъде'}, значи ${answer}. Една проверка, O(1) — нищо не се обхожда.`,
        marks: marks(null),
        aux: panel(),
        out: [...out],
        nodes: snap(m),
        root: m.root,
        tape: cells(),
        at: step - 1,
      };
      continue;
    }
    if (op === 'hasPrev') {
      const answer = cursor > 0;
      out.push(`hasPrev → ${answer}`);
      yield {
        kind: answer ? 'ok' : 'error',
        message: `hasPrev(): указателят е на позиция ${cursor} в seen, значи ${answer}.`,
        marks: marks(null),
        aux: panel(),
        out: [...out],
        nodes: snap(m),
        root: m.root,
        tape: cells(),
        at: step - 1,
      };
      continue;
    }
    if (op === 'prev') {
      if (cursor <= 0) {
        out.push('prev → ?');
        yield {
          kind: 'error',
          message: 'prev() при указател на първия елемент не е валидно извикване — условието го гарантира, затова кодът не го проверява.',
          marks: marks(null),
          aux: panel(),
          out: [...out],
          nodes: snap(m),
          root: m.root,
          tape: cells(),
          at: step - 1,
        };
        continue;
      }
      cursor--;
      out.push(`prev → ${seen[cursor]}`);
      yield {
        kind: 'move',
        message: `prev(): дърво назад не се обхожда — затова задача 9 пази вече върнатите стойности в seen и само мести указателя. Връща ${seen[cursor]} за O(1), а паметта става O(n).`,
        marks: marks(null),
        aux: panel(),
        out: [...out],
        nodes: snap(m),
        root: m.root,
        tape: cells(),
        at: step - 1,
      };
      continue;
    }

    /* next() */
    if (twoWay && cursor + 1 < seen.length) {
      cursor++;
      out.push(`next → ${seen[cursor]}`);
      yield {
        kind: 'move',
        message: `next(): указателят още не е стигнал края на seen, затова стойността ${seen[cursor]} се чете оттам — дървото не се пипа.`,
        marks: marks(null),
        aux: panel(),
        out: [...out],
        nodes: snap(m),
        root: m.root,
        tape: cells(),
        at: step - 1,
      };
      continue;
    }
    if (!stack.length) {
      out.push('next → ?');
      yield {
        kind: 'error',
        message: 'next() при празен стек не е валидно извикване: условието гарантира, че next() се вика само когато hasNext() е true.',
        marks: marks(null),
        aux: panel(),
        out: [...out],
        nodes: snap(m),
        root: m.root,
        tape: cells(),
        at: step - 1,
      };
      continue;
    }
    const top = stack.pop()!;
    popped.push(top);
    seen.push(lab(m, top));
    cursor = seen.length - 1;
    out.push(`next → ${lab(m, top)}`);
    let down = kid(m, top, 1);
    const pushed: string[] = [];
    while (down !== null) {
      stack.push(down);
      pushed.push(lab(m, down));
      down = kid(m, down, 0);
    }
    yield {
      kind: 'visit',
      message: `next(): вадим ${lab(m, top)} от върха — лявото му поддърво вече е върнато. ${pushed.length ? `После в стека влиза левият ръб на дясното му поддърво: ${pushed.join(', ')}.` : 'Няма дясно поддърво, значи нищо не влиза в стека.'} Едно извикване може да стигне до O(h), но всеки възел влиза и излиза от стека по веднъж, значи n извиквания са общо O(n) — амортизирано O(1).`,
      marks: marks(null),
      aux: panel(),
      out: [...out],
      nodes: snap(m),
      root: m.root,
      tape: cells(),
      at: step - 1,
    };
  }

  yield {
    kind: 'ok',
    message: `Готово. ${twoWay ? 'Напред стойността се взема от дървото само първия път; назад — винаги от seen.' : 'Итераторът пази O(h) памет и не построява масив: обхождането може да се спре по всяко време, точно както прави итераторът на std::map.'}`,
    marks: marks(null),
    aux: panel(),
    out: [...out],
    nodes: snap(m),
    root: m.root,
    tape: cells(),
    at: ops.length,
  };
}

/** The Scheme serialization the BST class is asked for: (key:value left right), () for empty. */
export function schemeString(tree: Tree, id: number | null = tree.root, labelOf: (node: TNode) => string = (n) => n.val): string {
  if (id === null || id === undefined) return '()';
  const node = tree.nodes.get(id);
  if (!node) return '()';
  return `(${labelOf(node)} ${schemeString(tree, node.kids[0] ?? null, labelOf)} ${schemeString(tree, node.kids[1] ?? null, labelOf)})`;
}
