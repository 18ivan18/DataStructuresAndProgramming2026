export interface TNode {
  id: number;
  val: string;
  kids: (number | null)[];
}

export interface Tree {
  nodes: Map<number, TNode>;
  root: number | null;
  binary: boolean;
}

export type Mark = 'current' | 'stack' | 'queue' | 'visited' | 'path' | 'done';

export interface AuxPanel {
  label: string;
  items: string[];
  /** 'stack' grows upwards, 'queue' left to right with a front, 'row' is a plain strip. */
  shape: 'stack' | 'queue' | 'row';
}

export type TreeKind = 'start' | 'push' | 'pop' | 'visit' | 'move' | 'keep' | 'ok' | 'error';

export interface TreeStep {
  kind: TreeKind;
  message: string;
  marks: Record<number, Mark>;
  aux: AuxPanel[];
  out: string[];
  nodes?: TNode[];
  badges?: Record<number, string>;
  levels?: string[][];
  paths?: string[];
}

export interface TreeRun {
  steps: TreeStep[];
  tree: Tree;
}

export const NIL = new Set(['null', 'nil', 'n', 'x', '-', '.', '#']);

export function emptyTree(binary = true): Tree {
  return { nodes: new Map(), root: null, binary };
}

export function parseLevelArray(text: string): Tree {
  const tokens = text
    .replace(/[[\]]/g, ' ')
    .split(/[\s,]+/)
    .filter(Boolean)
    .slice(0, 31);
  const tree = emptyTree(true);
  if (!tokens.length || NIL.has(tokens[0].toLowerCase())) return tree;

  let next = 1;
  const make = (val: string): number => {
    const id = next++;
    tree.nodes.set(id, { id, val, kids: [null, null] });
    return id;
  };
  tree.root = make(tokens[0]);
  const queue: number[] = [tree.root];
  let at = 1;
  while (queue.length && at < tokens.length) {
    const parent = tree.nodes.get(queue.shift()!)!;
    for (const slot of [0, 1]) {
      if (at >= tokens.length) break;
      const token = tokens[at++];
      if (NIL.has(token.toLowerCase())) continue;
      const id = make(token);
      parent.kids[slot] = id;
      queue.push(id);
    }
  }
  return tree;
}

export function parseEdges(text: string): Tree {
  const numbers = text
    .split(/[\s,\n]+/)
    .filter(Boolean)
    .map(Number)
    .filter((v) => Number.isInteger(v) && v >= 0 && v < 30);
  const tree = emptyTree(false);
  const node = (key: number): TNode => {
    const found = tree.nodes.get(key + 1);
    if (found) return found;
    const made: TNode = { id: key + 1, val: String(key), kids: [] };
    tree.nodes.set(made.id, made);
    return made;
  };
  const hasParent = new Set<number>();
  for (let i = 0; i + 1 < numbers.length; i += 2) {
    const parent = node(numbers[i]);
    const child = node(numbers[i + 1]);
    if (parent.id === child.id || hasParent.has(child.id)) continue;
    parent.kids.push(child.id);
    hasParent.add(child.id);
  }
  const roots = [...tree.nodes.values()].filter((n) => !hasParent.has(n.id));
  tree.root = roots.length ? Math.min(...roots.map((n) => n.id)) : null;
  for (const id of [...tree.nodes.keys()]) {
    if (!reaches(tree, tree.root, id)) tree.nodes.delete(id);
  }
  return tree;
}

function reaches(tree: Tree, from: number | null, target: number): boolean {
  if (from === null) return false;
  if (from === target) return true;
  return (tree.nodes.get(from)?.kids ?? []).some((k) => k !== null && reaches(tree, k, target));
}

export const childrenOf = (tree: Tree, id: number): number[] => (tree.nodes.get(id)?.kids ?? []).filter((k): k is number => k !== null);

export const isLeaf = (tree: Tree, id: number): boolean => childrenOf(tree, id).length === 0;

export const size = (tree: Tree): number => tree.nodes.size;

export function height(tree: Tree, id: number | null = tree.root): number {
  if (id === null) return 0;
  const kids = childrenOf(tree, id);
  return 1 + Math.max(0, ...kids.map((k) => height(tree, k)));
}

export function depths(tree: Tree): Map<number, number> {
  const out = new Map<number, number>();
  const walk = (id: number | null, d: number): void => {
    if (id === null) return;
    out.set(id, d);
    childrenOf(tree, id).forEach((k) => walk(k, d + 1));
  };
  walk(tree.root, 0);
  return out;
}

export function subtreeSizes(tree: Tree): Map<number, number> {
  const out = new Map<number, number>();
  const walk = (id: number | null): number => {
    if (id === null) return 0;
    const total = 1 + childrenOf(tree, id).reduce((sum, k) => sum + walk(k), 0);
    out.set(id, total);
    return total;
  };
  walk(tree.root);
  return out;
}

export interface Cell {
  col: number;
  row: number;
}

/** In-order column for a binary tree, mean-of-children for an n-ary one; forests go left to right. */
export function layout(tree: Tree, roots: number[] = tree.root === null ? [] : [tree.root]): Map<number, Cell> {
  const cells = new Map<number, Cell>();
  let col = 0;
  const place = (id: number, row: number): void => {
    const node = tree.nodes.get(id);
    if (!node) return;
    if (tree.binary) {
      const [left, right] = node.kids;
      if (left !== null && left !== undefined) place(left, row + 1);
      cells.set(id, { col: col++, row });
      if (right !== null && right !== undefined) place(right, row + 1);
      return;
    }
    const kids = node.kids.filter((k): k is number => k !== null);
    if (!kids.length) {
      cells.set(id, { col: col++, row });
      return;
    }
    kids.forEach((k) => place(k, row + 1));
    const xs = kids.map((k) => cells.get(k)!.col);
    cells.set(id, { col: (Math.min(...xs) + Math.max(...xs)) / 2, row });
  };
  roots.forEach((id, i) => {
    if (i) col += 1;
    place(id, 0);
  });
  return cells;
}

const snapshot = (tree: Tree): TNode[] => [...tree.nodes.values()].map((n) => ({ ...n, kids: [...n.kids] }));

const label = (tree: Tree, id: number): string => tree.nodes.get(id)!.val;

/* ---------- task 1: preorder, inorder and postorder (solutions/1.cpp) ---------- */

export type Order = 'pre' | 'in' | 'post';
export type Mode = 'rec' | 'iter';

const ORDER_WORD: Record<Order, string> = { pre: 'preorder', in: 'inorder', post: 'postorder' };

export function* traversalTrace(tree: Tree, order: Order, mode: Mode): Generator<TreeStep> {
  const out: string[] = [];
  const frames: number[] = [];
  const visited: number[] = [];

  const marks = (current: number | null, held: number[], shape: Mark): Record<number, Mark> => {
    const map: Record<number, Mark> = {};
    visited.forEach((id) => (map[id] = 'visited'));
    held.forEach((id) => (map[id] = shape));
    if (current !== null) map[current] = 'current';
    return map;
  };

  if (tree.root === null) {
    yield { kind: 'ok', message: 'Празно дърво: обхождането е празно.', marks: {}, aux: [], out: [] };
    return;
  }

  if (mode === 'iter') {
    const stack: number[] = [];
    let node: number | null = tree.root;
    const panel = (): AuxPanel[] => [{ label: 'стек', items: stack.map((id) => label(tree, id)), shape: 'stack' }];
    yield {
      kind: 'start',
      message: 'Итеративно inorder: стекът пази възлите, в които още не сме изписали нищо, а node върви по левия ръб.',
      marks: marks(node, stack, 'stack'),
      aux: panel(),
      out: [],
    };
    while (node !== null || stack.length) {
      while (node !== null) {
        stack.push(node);
        const left: number | null = tree.nodes.get(node)!.kids[0] ?? null;
        yield {
          kind: 'push',
          message: `push(${label(tree, node)}): слизаме наляво, без да изписваме нищо. ${left === null ? 'Лявото дете липсва, значи стигнахме дъното.' : `Следва ${label(tree, left)}.`}`,
          marks: marks(node, stack, 'stack'),
          aux: panel(),
          out: [...out],
        };
        node = left;
      }
      const top = stack.pop()!;
      out.push(label(tree, top));
      visited.push(top);
      const right: number | null = tree.nodes.get(top)!.kids[1] ?? null;
      yield {
        kind: 'visit',
        message: `Вадим ${label(tree, top)} от стека и го изписваме: лявото му поддърво е готово. ${right === null ? 'Няма дясно дете.' : `Сега надясно, към ${label(tree, right)}.`}`,
        marks: marks(right, stack, 'stack'),
        aux: panel(),
        out: [...out],
      };
      node = right;
    }
    yield {
      kind: 'ok',
      message: `Стекът е празен и node е nullptr: готово. Inorder: [${out.join(', ')}].`,
      marks: marks(null, [], 'stack'),
      aux: panel(),
      out: [...out],
    };
    return;
  }

  function* go(id: number | null, from: string): Generator<TreeStep> {
    if (id === null) return;
    frames.push(id);
    const panel = (): AuxPanel[] => [{ label: 'стек на извикванията', items: frames.map((f) => label(tree, f)), shape: 'stack' }];
    yield {
      kind: 'push',
      message: `${from}: нова рамка за ${label(tree, id)} на стека на извикванията.`,
      marks: marks(id, frames, 'stack'),
      aux: panel(),
      out: [...out],
    };
    const [left, right] = tree.nodes.get(id)!.kids;
    const visit = (): TreeStep => {
      out.push(label(tree, id));
      visited.push(id);
      return {
        kind: 'visit',
        message: `Изписваме ${label(tree, id)} — ${ORDER_WORD[order]} изписва ${order === 'pre' ? 'при влизане, преди двете поддървета' : order === 'in' ? 'между лявото и дясното поддърво' : 'най-накрая, след двете поддървета'}.`,
        marks: marks(id, frames, 'stack'),
        aux: panel(),
        out: [...out],
      };
    };
    if (order === 'pre') yield visit();
    if (left !== null && left !== undefined) yield* go(left, `${label(tree, id)}->left`);
    if (order === 'in') yield visit();
    if (right !== null && right !== undefined) yield* go(right, `${label(tree, id)}->right`);
    if (order === 'post') yield visit();
    frames.pop();
    yield {
      kind: 'pop',
      message: `${label(tree, id)} е готов: рамката се маха и продължаваме оттам, откъдето сме дошли.`,
      marks: marks(frames.length ? frames[frames.length - 1] : null, frames, 'stack'),
      aux: panel(),
      out: [...out],
    };
  }

  yield {
    kind: 'start',
    message: `Рекурсивно ${ORDER_WORD[order]}: всяко извикване заема рамка в стека, значи паметта е O(височината).`,
    marks: marks(tree.root, [], 'stack'),
    aux: [{ label: 'стек на извикванията', items: [], shape: 'stack' }],
    out: [],
  };
  yield* go(tree.root, 'Влизаме в корена');
  yield {
    kind: 'ok',
    message: `Стекът е празен: готово. ${ORDER_WORD[order]}: [${out.join(', ')}].`,
    marks: marks(null, [], 'stack'),
    aux: [{ label: 'стек на извикванията', items: [], shape: 'stack' }],
    out: [...out],
  };
}

/* ---------- tasks 3, 4, 5: breadth first, zigzag and the right side view ---------- */

export type LevelMode = 'levels' | 'zigzag' | 'right';

export function* levelOrderTrace(tree: Tree, mode: LevelMode): Generator<TreeStep> {
  const levels: string[][] = [];
  const out: string[] = [];
  const seen: number[] = [];
  const queue: number[] = [];

  const panel = (): AuxPanel[] => [{ label: 'опашка', items: queue.map((id) => label(tree, id)), shape: 'queue' }];
  const marks = (current: number | null): Record<number, Mark> => {
    const map: Record<number, Mark> = {};
    seen.forEach((id) => (map[id] = 'visited'));
    queue.forEach((id) => (map[id] = 'queue'));
    if (current !== null) map[current] = 'current';
    return map;
  };

  if (tree.root === null) {
    yield { kind: 'ok', message: 'Празно дърво: нищо не влиза в опашката.', marks: {}, aux: panel(), out: [], levels: [] };
    return;
  }

  queue.push(tree.root);
  yield {
    kind: 'start',
    message:
      mode === 'levels'
        ? 'Коренът влиза в опашката. Всяка итерация обработва точно толкова възела, колкото са в опашката в момента — това е едно ниво.'
        : mode === 'zigzag'
          ? 'Обхождането е същото. Различно е само къде слагаме стойността в масива на нивото.'
          : 'Обхождането е същото. Записваме само последния възел от всяко ниво.',
    marks: marks(null),
    aux: panel(),
    out: [],
    levels: [],
  };

  let depth = 0;
  while (queue.length) {
    const levelSize = queue.length;
    const leftToRight = depth % 2 === 0;
    const level: string[] = new Array(levelSize).fill('');
    yield {
      kind: 'keep',
      message: `levelSize = ${levelSize}: толкова възела има на ниво ${depth}.${mode === 'zigzag' ? ` Пълним масива ${leftToRight ? 'отляво надясно' : 'отдясно наляво'}.` : ''}`,
      marks: marks(null),
      aux: panel(),
      out: [...out],
      levels: [...levels.map((l) => [...l])],
    };
    for (let i = 0; i < levelSize; i++) {
      const id = queue.shift()!;
      seen.push(id);
      const slot = mode === 'zigzag' && !leftToRight ? levelSize - 1 - i : i;
      level[slot] = label(tree, id);
      const kids = childrenOf(tree, id);
      kids.forEach((k) => queue.push(k));
      const last = i === levelSize - 1;
      if (mode === 'right' && last) out.push(label(tree, id));
      yield {
        kind: last ? 'pop' : 'move',
        message:
          mode === 'right'
            ? last
              ? `${label(tree, id)} е последният от нивото (size == 1), значи той се вижда отдясно.`
              : `Вадим ${label(tree, id)} и добавяме децата му. Не е последен от нивото, затова не го записваме.`
            : mode === 'zigzag'
              ? `Вадим ${label(tree, id)} — ${i + 1}-ият от нивото — и го слагаме на позиция ${slot}. ${kids.length ? `Децата ${kids.map((k) => label(tree, k)).join(' и ')} влизат в опашката отзад, винаги отляво надясно.` : 'Няма деца.'}`
              : `Вадим ${label(tree, id)} и го добавяме към нивото. ${kids.length ? `Децата му (${kids.map((k) => label(tree, k)).join(', ')}) влизат в края на опашката.` : 'Листо: няма какво да влезе.'}`,
        marks: marks(null),
        aux: panel(),
        out: [...out],
        levels: [...levels.map((l) => [...l]), [...level]],
      };
    }
    levels.push(level);
    if (mode !== 'right') out.push(...level);
    yield {
      kind: 'keep',
      message: `Ниво ${depth} е готово: [${level.join(', ')}].${queue.length ? ` В опашката са останали само възлите от ниво ${depth + 1}.` : ' Опашката е празна.'}`,
      marks: marks(null),
      aux: panel(),
      out: [...out],
      levels: levels.map((l) => [...l]),
    };
    depth++;
  }

  yield {
    kind: 'ok',
    message:
      mode === 'right'
        ? `Готово: отдясно се виждат [${out.join(', ')}].`
        : `Готово: ${levels.map((l) => `[${l.join(', ')}]`).join(', ')}.`,
    marks: marks(null),
    aux: panel(),
    out: [...out],
    levels: levels.map((l) => [...l]),
  };
}

/* ---------- task 2: every path from the root to a leaf (solutions/2.cpp) ---------- */

export function* pathsTrace(tree: Tree): Generator<TreeStep> {
  const frames: number[] = [];
  const done: number[] = [];
  const panel = (returned: string[]): AuxPanel[] => [
    { label: 'стек на извикванията', items: frames.map((f) => label(tree, f)), shape: 'stack' },
    { label: 'връща се', items: returned, shape: 'row' },
  ];
  const marks = (current: number | null): Record<number, Mark> => {
    const map: Record<number, Mark> = {};
    done.forEach((id) => (map[id] = 'visited'));
    frames.forEach((id) => (map[id] = 'path'));
    if (current !== null) map[current] = 'current';
    return map;
  };

  if (tree.root === null) {
    yield { kind: 'ok', message: 'Празно дърво: няма нито един път.', marks: {}, aux: [], out: [], paths: [] };
    return;
  }

  function* go(id: number): Generator<TreeStep, string[]> {
    frames.push(id);
    const me = label(tree, id);
    yield { kind: 'push', message: `binaryTreePaths(${me}): нова рамка.`, marks: marks(id), aux: panel([]), out: [], paths: [] };

    const [left, right] = tree.nodes.get(id)!.kids;
    if ((left === null || left === undefined) && (right === null || right === undefined)) {
      frames.pop();
      done.push(id);
      const mine = [me];
      yield {
        kind: 'visit',
        message: `${me} е листо: връща се само ["${me}"]. Оттук пътищата започват да се сглобяват нагоре.`,
        marks: marks(null),
        aux: panel(mine),
        out: [],
        paths: mine,
      };
      return mine;
    }

    const collected: string[] = [];
    for (const [side, kid] of [['left', left], ['right', right]] as const) {
      if (kid === null || kid === undefined) {
        yield {
          kind: 'keep',
          message: `${me}->${side} е nullptr: връща празен списък, значи оттам няма път.`,
          marks: marks(id),
          aux: panel(collected),
          out: [],
          paths: [...collected],
        };
        continue;
      }
      const got = yield* go(kid);
      const prefixed = got.map((p) => `${me}->${p}`);
      collected.push(...prefixed);
      yield {
        kind: 'move',
        message: `${me} слага себе си пред всеки път от ${side === 'left' ? 'лявото' : 'дясното'} поддърво: ${prefixed.map((p) => `"${p}"`).join(', ')}.`,
        marks: marks(id),
        aux: panel(collected),
        out: [],
        paths: [...collected],
      };
    }
    frames.pop();
    done.push(id);
    yield {
      kind: 'pop',
      message: `${me} връща ${collected.length} ${collected.length === 1 ? 'път' : 'пътя'} нагоре и рамката му се маха.`,
      marks: marks(null),
      aux: panel(collected),
      out: [],
      paths: [...collected],
    };
    return collected;
  }

  const all = yield* go(tree.root);
  yield {
    kind: 'ok',
    message: `Готово: ${all.map((p) => `"${p}"`).join(', ')}. Всеки възел се пипа веднъж, но съединяването на низовете го прави O(n · височина).`,
    marks: marks(null),
    aux: [],
    out: [],
    paths: all,
  };
}

/* ---------- task 7: how many gifts each manager buys (solutions/7.cpp) ---------- */

export function* giftsTrace(tree: Tree): Generator<TreeStep> {
  const frames: number[] = [];
  const done: number[] = [];
  const gifts = new Map<number, number>();
  const row = (): string[] => [...tree.nodes.values()].sort((a, b) => Number(a.val) - Number(b.val)).map((n) => (gifts.has(n.id) ? String(gifts.get(n.id)) : '·'));
  const panel = (): AuxPanel[] => [
    { label: 'стек на извикванията', items: frames.map((f) => label(tree, f)), shape: 'stack' },
    { label: 'gifts', items: row(), shape: 'row' },
  ];
  const marks = (current: number | null): Record<number, Mark> => {
    const map: Record<number, Mark> = {};
    done.forEach((id) => (map[id] = 'visited'));
    frames.forEach((id) => (map[id] = 'path'));
    if (current !== null) map[current] = 'current';
    return map;
  };
  const badges = (): Record<number, string> => Object.fromEntries([...gifts].map(([id, v]) => [id, String(v)]));

  if (tree.root === null) {
    yield { kind: 'ok', message: 'Няма служители.', marks: {}, aux: [], out: [] };
    return;
  }

  yield {
    kind: 'start',
    message: 'Всеки началник купува подарък на всеки свой подчинен — пряк или косвен. Значи търсим за всеки възел броя на възлите в поддървото му без самия него.',
    marks: marks(tree.root),
    aux: panel(),
    out: [],
    badges: badges(),
  };

  function* go(id: number): Generator<TreeStep, number> {
    frames.push(id);
    const me = label(tree, id);
    const kids = childrenOf(tree, id);
    yield {
      kind: 'push',
      message: `countGifts(${me}): ${kids.length ? `${kids.length} ${kids.length === 1 ? 'пряк подчинен' : 'преки подчинени'} — ${kids.map((k) => label(tree, k)).join(', ')}.` : 'няма подчинени.'}`,
      marks: marks(id),
      aux: panel(),
      out: [],
      badges: badges(),
    };
    let subordinates = 0;
    for (const kid of kids) {
      const below = yield* go(kid);
      subordinates += 1 + below;
      yield {
        kind: 'move',
        message: `От ${label(tree, kid)} се връща ${below}: той плюс неговите ${below} правят ${1 + below}. Сборът за ${me} става ${subordinates}.`,
        marks: marks(id),
        aux: panel(),
        out: [],
        badges: badges(),
      };
    }
    gifts.set(id, subordinates);
    frames.pop();
    done.push(id);
    yield {
      kind: 'visit',
      message: `gifts[${me}] = ${subordinates}.`,
      marks: marks(null),
      aux: panel(),
      out: [],
      badges: badges(),
    };
    return subordinates;
  }

  yield* go(tree.root);
  yield {
    kind: 'ok',
    message: `Готово: ${row().join(' ')}. Едно постфиксно обхождане, O(n).`,
    marks: marks(null),
    aux: panel(),
    out: [],
    badges: badges(),
  };
}

/* ---------- task 6: the expression tree of an infix string (solutions/6.cpp) ---------- */

const PRIO: Record<string, number> = { '(': 1, '+': 2, '-': 2, '*': 3, '/': 3 };

export interface ExprRun extends TreeRun {
  ok: boolean;
}

export function exprTreeTrace(text: string): ExprRun {
  const source = text.replace(/\s+/g, '').slice(0, 24);
  const tree = emptyTree(true);
  const steps: TreeStep[] = [];
  let next = 1;

  const make = (val: string): number => {
    const id = next++;
    tree.nodes.set(id, { id, val, kids: [null, null] });
    return id;
  };
  const ops: string[] = [];
  const stack: number[] = [];
  const panel = (): AuxPanel[] => [
    { label: 'стек от оператори', items: [...ops], shape: 'stack' },
    { label: 'стек от поддървета', items: stack.map((id) => tree.nodes.get(id)!.val), shape: 'stack' },
  ];
  const push = (kind: TreeKind, message: string, current: number | null = null): void => {
    const marks: Record<number, Mark> = {};
    stack.forEach((id) => (marks[id] = 'done'));
    if (current !== null) marks[current] = 'current';
    steps.push({ kind, message, marks, aux: panel(), out: [], nodes: snapshot(tree) });
  };

  if (!source.length) {
    steps.push({ kind: 'error', message: 'Въведи израз.', marks: {}, aux: [], out: [], nodes: [] });
    return { steps, tree, ok: false };
  }

  push('start', `Два стека: един за операторите, един за готовите поддървета. Четем „${source}“ отляво надясно.`);

  const combine = (): boolean => {
    if (ops.length === 0 || stack.length < 2) return false;
    const op = ops.pop()!;
    const id = make(op);
    const right = stack.pop()!;
    const left = stack.pop()!;
    tree.nodes.get(id)!.kids = [left, right];
    stack.push(id);
    push('visit', `combine: „${op}“ слиза от стека и става корен — дясното поддърво е ${tree.nodes.get(right)!.val}, лявото ${tree.nodes.get(left)!.val}. Първото изваждане е дясното!`, id);
    return true;
  };

  for (const ch of source) {
    if (ch === '(') {
      ops.push(ch);
      push('push', '„(“ влиза в стека от оператори като преграда: нищо отпреди нея няма да се слее, докато не дойде „)“.');
      continue;
    }
    if (/[0-9]/.test(ch)) {
      const id = make(ch);
      stack.push(id);
      push('push', `${ch} е операнд: става листо и влиза в стека от поддървета.`, id);
      continue;
    }
    if (ch === ')') {
      while (ops.length && ops[ops.length - 1] !== '(') {
        if (!combine()) break;
      }
      if (ops[ops.length - 1] === '(') {
        ops.pop();
        push('pop', '„)“: сляхме всичко до преградата и махаме и самата „(“. Скобите не оставят възел в дървото.');
      } else {
        steps.push({ kind: 'error', message: 'Затваряща скоба без отваряща.', marks: {}, aux: panel(), out: [], nodes: snapshot(tree) });
        return { steps, tree, ok: false };
      }
      continue;
    }
    if (!(ch in PRIO)) {
      steps.push({ kind: 'error', message: `„${ch}“ не е нито цифра, нито оператор.`, marks: {}, aux: panel(), out: [], nodes: snapshot(tree) });
      return { steps, tree, ok: false };
    }
    while (ops.length && PRIO[ops[ops.length - 1]] >= PRIO[ch]) {
      if (!combine()) break;
    }
    ops.push(ch);
    push('push', `„${ch}“ влиза в стека. Преди това слязоха всички оператори с приоритет, по-голям или равен на неговия — заради „по-голям или равен“ еднаквите оператори се свързват отляво надясно.`);
  }

  while (stack.length > 1 && ops.length) {
    if (!combine()) break;
  }

  if (stack.length !== 1 || ops.length) {
    steps.push({
      kind: 'error',
      message: ops.length ? `Остана оператор „${ops[ops.length - 1]}“ без операнд.` : 'Изразът не е валиден: в стека не остана точно едно дърво.',
      marks: {},
      aux: panel(),
      out: [],
      nodes: snapshot(tree),
    });
    return { steps, tree, ok: false };
  }
  tree.root = stack[0];
  push('ok', `Остана едно дърво — то е коренът. Inorder обхождането му връща пак „${inorderString(tree)}“.`);
  return { steps, tree, ok: true };
}

export function inorderString(tree: Tree): string {
  const out: string[] = [];
  const walk = (id: number | null): void => {
    if (id === null || id === undefined) return;
    const node = tree.nodes.get(id);
    if (!node) return;
    walk(node.kids[0] ?? null);
    out.push(node.val);
    walk(node.kids[1] ?? null);
  };
  walk(tree.root);
  return out.join('');
}

export function levelStrings(tree: Tree): string[] {
  if (tree.root === null) return [];
  const out: string[] = [];
  let level = [tree.root];
  while (level.length) {
    out.push(level.map((id) => tree.nodes.get(id)!.val).join(''));
    level = level.flatMap((id) => childrenOf(tree, id));
  }
  return out;
}

export const traversalValues = (tree: Tree, order: Order): string[] => {
  const out: string[] = [];
  const walk = (id: number | null): void => {
    if (id === null || id === undefined) return;
    const node = tree.nodes.get(id)!;
    if (order === 'pre') out.push(node.val);
    walk(node.kids[0] ?? null);
    if (order === 'in') out.push(node.val);
    walk(node.kids[1] ?? null);
    if (order === 'post') out.push(node.val);
  };
  walk(tree.root);
  return out;
};
