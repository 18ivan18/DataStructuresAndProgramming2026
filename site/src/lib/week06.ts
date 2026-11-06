import { ListMachine, valuesFrom, type ListStep } from './linked';

export interface PrepStep extends ListStep {
  stack?: number[];
}

export interface PrepRun {
  steps: PrepStep[];
  ids: number[];
  lanes?: number[];
  dummies?: number[];
}

function buildList(m: ListMachine, values: number[]): number[] {
  const ids = values.map((v) => m.create(v));
  ids.forEach((id, i) => {
    if (i + 1 < ids.length) m.node(id).next = ids[i + 1];
  });
  return ids;
}

const valuesOf = (m: ListMachine, start: number | null): number[] => valuesFrom([...m.nodes.values()], start) as number[];

const show = (m: ListMachine, id: number | null): string => (id === null ? 'nullptr' : String(m.node(id).val));

const steps = (m: ListMachine): PrepStep[] => m.steps as PrepStep[];

export function kGroupTrace(values: number[], k: number): PrepRun {
  const m = new ListMachine();
  const ids = buildList(m, values);
  m.set('head', ids[0] ?? null);
  m.snap('start', `Обръщаме всяка пълна група от по ${k} възела. Последната група остава непроменена, ако е по-къса.`);

  const reverseGroup = (headId: number): number => {
    m.set('head', headId);
    let left = k;
    let test: number | null = headId;
    while (test !== null && left > 0) {
      test = m.node(test).next;
      left--;
      m.hops++;
    }
    if (left !== 0) {
      m.snap('keep', `От ${show(m, headId)} напред има по-малко от ${k} възела: групата остава както е.`);
      return headId;
    }
    m.snap('keep', `От ${show(m, headId)} напред има поне ${k} възела: тази група се обръща.`);
    m.set('prev', null);
    m.set('cur', headId);
    left = k;
    while (m.get('cur') !== null && left > 0) {
      const cur = m.get('cur')!;
      m.set('tmp', m.node(cur).next);
      m.snap('move', 'tmp = cur->next: пазим остатъка, преди да счупим връзката към него.');
      m.setNext(cur, m.get('prev'));
      m.snap('apply', `cur->next = prev: ${show(m, cur)} вече сочи назад.`);
      m.set('prev', cur);
      m.set('cur', m.get('tmp'));
      m.hops++;
      m.snap('move', `prev = cur, cur = tmp: следва ${show(m, m.get('cur'))}.`);
      left--;
    }
    const first = m.get('prev')!;
    const rest = m.get('cur');
    m.drop('tmp');
    m.snap('apply', `Групата е обърната: започва от ${show(m, first)}, а ${show(m, headId)} ѝ е краят и още сочи назад.`);
    if (rest === null) return first;
    const tail = reverseGroup(rest);
    m.set('head', headId);
    m.setNext(headId, tail);
    m.snap('apply', `head->next = обърнатия остатък: ${show(m, headId)} се закача за ${show(m, tail)}.`);
    return first;
  };

  const head = ids.length ? reverseGroup(ids[0]) : null;
  m.drop('prev');
  m.drop('cur');
  m.set('head', head);
  m.snap('ok', `Връщаме новото начало: [${valuesOf(m, head).join(', ')}]. Всеки възел се пипа по два пъти, значи O(n).`);
  return { steps: steps(m), ids };
}

export function palindromeTrace(values: number[]): PrepRun {
  const m = new ListMachine();
  const ids = buildList(m, values);
  const stack: number[] = [];
  const snap = (kind: ListStep['kind'], message: string, result?: string): void => {
    m.snap(kind, message, undefined, result);
    steps(m)[m.steps.length - 1].stack = [...stack];
  };
  m.set('head', ids[0] ?? null);
  m.set('slow', ids[0] ?? null);
  m.set('fast', ids[0] ?? null);
  if (values.length < 2) {
    snap('ok', 'Списък с по-малко от два възела е палиндром без никаква работа.', 'true');
    return { steps: steps(m), ids };
  }
  snap('start', 'fast тича двойно по-бързо от slow. Докато стигне края, slow е по средата, а стекът пази първата половина.');

  let odd = false;
  while (m.get('fast') !== null) {
    const slow = m.get('slow')!;
    stack.push(m.node(slow).val as number);
    snap('push', `s.push(slow->val): ${show(m, slow)} отива в стека. Върхът винаги е последното видяно от първата половина.`);
    m.advance('slow');
    m.advance('fast');
    if (m.get('fast') === null) {
      odd = true;
      snap('keep', 'fast свърши след една стъпка: броят възли е нечетен и slow стои точно след средния възел.');
      break;
    }
    m.advance('fast');
    snap('move', `slow → ${show(m, m.get('slow'))}, fast → ${show(m, m.get('fast'))}.`);
  }
  if (!odd) snap('keep', `fast е nullptr: броят възли е четен и slow е първият възел от втората половина (${show(m, m.get('slow'))}).`);

  if (odd) {
    const middle = stack.pop()!;
    snap('pop', `Средният възел (${middle}) се сравнява сам със себе си: махаме го от стека.`);
  }
  while (m.get('slow') !== null) {
    const slow = m.get('slow')!;
    const top = stack[stack.length - 1];
    if ((m.node(slow).val as number) !== top) {
      snap('error', `slow->val = ${show(m, slow)}, а върхът на стека е ${top}: различават се, значи не е палиндром.`, 'false');
      return { steps: steps(m), ids };
    }
    stack.pop();
    snap('ok', `${show(m, slow)} съвпада с върха на стека: s.pop() и продължаваме.`);
    m.advance('slow');
  }
  snap('ok', `Втората половина свърши, без нито едно разминаване: палиндром. Стекът обаче е O(n) памет.`, 'true');
  return { steps: steps(m), ids };
}

export function reorderTrace(values: number[]): PrepRun {
  const m = new ListMachine();
  const ids = buildList(m, values);
  m.set('head', ids[0] ?? null);
  m.set('slow', ids[0] ?? null);
  m.set('fast', ids[0] ?? null);
  m.snap('start', 'Три стъпки: намираме средата с два указателя, обръщаме втората половина и после сплитаме двете.');

  while (m.get('fast') !== null && m.node(m.get('fast')!).next !== null) {
    m.advance('slow');
    m.advance('fast');
    m.advance('fast');
    m.snap('move', `slow → ${show(m, m.get('slow'))}, fast → ${show(m, m.get('fast'))}.`);
  }
  const mid = m.get('slow')!;
  m.set('mid', mid);
  m.set('slow', m.node(mid).next);
  m.snap('keep', `fast стигна края, значи slow е последният възел от първата половина: ${show(m, mid)}.`);
  m.setNext(mid, null);
  m.snap('apply', `mid->next = nullptr: двете половини вече са два отделни списъка.`);

  m.set('prev', null);
  m.set('cur', m.get('slow'));
  m.snap('keep', `Обръщаме втората половина: [${valuesOf(m, m.get('cur')).join(', ')}].`);
  while (m.get('cur') !== null) {
    const cur = m.get('cur')!;
    m.set('next', m.node(cur).next);
    m.setNext(cur, m.get('prev'));
    m.set('prev', cur);
    m.set('cur', m.get('next'));
    m.hops++;
    m.snap('apply', `${show(m, cur)} сочи назад; продължаваме с ${show(m, m.get('cur'))}.`);
  }
  m.drop('next');
  m.drop('cur');
  m.set('slow', m.get('prev'));
  m.drop('prev');
  m.set('fast', m.get('head'));
  m.snap('keep', `Обърнатата втора половина започва от ${show(m, m.get('slow'))}. fast тръгва от началото, slow от нея.`);

  while (m.get('slow') !== null) {
    const fast = m.get('fast')!;
    const slow = m.get('slow')!;
    const fastNext = m.node(fast).next;
    const slowNext = m.node(slow).next;
    m.setNext(fast, slow);
    m.setNext(slow, fastNext);
    m.snap('apply', `fast->next = slow, slow->next = fastNext: ${show(m, slow)} се вмъква след ${show(m, fast)}.`);
    m.set('fast', fastNext);
    m.set('slow', slowNext);
    m.hops += 2;
    if (slowNext !== null) m.snap('move', `fast = fastNext (${show(m, fastNext)}), slow = slowNext (${show(m, slowNext)}).`);
  }
  m.drop('mid');
  m.drop('slow');
  m.drop('fast');
  m.snap('ok', `Готово: [${valuesOf(m, m.get('head')).join(', ')}]. Три обхождания, O(1) памет.`);
  return { steps: steps(m), ids };
}

export function shuffleTrace(values: number[]): PrepRun {
  const m = new ListMachine();
  const ids = buildList(m, values);
  m.set('head', ids[0] ?? null);
  if (values.length < 2) {
    m.snap('ok', 'С по-малко от два възела няма какво да се размества.');
    return { steps: steps(m), ids };
  }
  const length = values.length;
  m.hops += length;
  m.snap('start', `Първо едно обхождане за дължината: ${length} възела. Средният принадлежи на първата половина, значи първата половина е ${Math.floor((length + 1) / 2)} възела.`);

  m.set('firstHalfEnd', ids[0]);
  for (let i = 1; i < Math.floor((length + 1) / 2); i++) {
    m.advance('firstHalfEnd');
    m.snap('move', `firstHalfEnd → ${show(m, m.get('firstHalfEnd'))}.`);
  }
  const end = m.get('firstHalfEnd')!;
  m.set('current', m.node(end).next);
  m.snap('keep', `Първата половина свършва на ${show(m, end)}, втората започва от ${show(m, m.get('current'))}.`);
  m.setNext(end, null);
  m.snap('apply', 'firstHalfEnd->next = nullptr: отрязваме втората половина.');

  m.set('reversed', null);
  while (m.get('current') !== null) {
    const cur = m.get('current')!;
    m.set('next', m.node(cur).next);
    m.setNext(cur, m.get('reversed'));
    m.set('reversed', cur);
    m.set('current', m.get('next'));
    m.hops++;
    m.snap('apply', `${show(m, cur)} сочи назад: обърнатата втора половина вече започва от него.`);
  }
  m.drop('next');
  m.drop('current');

  m.set('reversedEnd', m.get('reversed'));
  while (m.node(m.get('reversedEnd')!).next !== null) {
    m.advance('reversedEnd');
    m.snap('move', `reversedEnd → ${show(m, m.get('reversedEnd'))}: търсим края на обърнатата половина.`);
  }
  m.setNext(m.get('reversedEnd')!, m.get('head'));
  m.snap('apply', `reversedEnd->next = head: закачаме цялата първа половина след ${show(m, m.get('reversedEnd'))}.`);
  const head = m.get('reversed')!;
  m.set('head', head);
  m.drop('reversed');
  m.drop('reversedEnd');
  m.drop('firstHalfEnd');
  m.snap('ok', `head = reversed: [${valuesOf(m, head).join(', ')}].`);
  return { steps: steps(m), ids };
}

export function partitionTrace(values: number[], x: number): PrepRun {
  const m = new ListMachine();
  const firstHead = m.create('d');
  const secondHead = m.create('d');
  const ids = buildList(m, values);
  m.set('firstHalfHead', firstHead);
  m.set('secondHalfHead', secondHead);
  m.set('firstHalf', firstHead);
  m.set('secondHalf', secondHead);
  m.set('head', ids[0] ?? null);
  m.snap('start', `Две фиктивни глави и две вериги: по-малките от ${x} отиват в горната, останалите в долната. Така няма специален случай за първия възел.`);

  while (m.get('head') !== null) {
    const cur = m.get('head')!;
    const small = (m.node(cur).val as number) < x;
    const chain = small ? 'firstHalf' : 'secondHalf';
    m.setNext(m.get(chain)!, cur);
    m.set(chain, cur);
    m.snap('apply', `${show(m, cur)} ${small ? '<' : '>='} ${x}: закачаме го в ${small ? 'първата' : 'втората'} верига.`);
    m.set('head', m.node(cur).next);
    m.hops++;
  }

  m.setNext(m.get('firstHalf')!, m.node(secondHead).next);
  m.snap('apply', 'firstHalf->next = secondHalfHead.next: слепваме двете вериги.');
  m.setNext(m.get('secondHalf')!, null);
  m.snap('apply', `secondHalf->next = nullptr: без този ред краят още сочи в стария списък и се получава цикъл.`);
  const head = m.node(firstHead).next;
  m.drop('firstHalf');
  m.drop('secondHalf');
  m.set('head', head);
  m.snap('ok', `Връщаме firstHalfHead.next: [${valuesOf(m, head).join(', ')}]. Относителният ред в двете части е запазен.`);
  return { steps: steps(m), ids, lanes: values.map((v) => (v < x ? 0 : 1)), dummies: [firstHead, secondHead] };
}

export function oddEvenTrace(values: number[]): PrepRun {
  const m = new ListMachine();
  const ids = buildList(m, values);
  m.set('head', ids[0] ?? null);
  if (!ids.length) {
    m.snap('ok', 'Празен списък.');
    return { steps: steps(m), ids };
  }
  m.set('odd', ids[0]);
  m.set('even', m.node(ids[0]).next);
  m.set('evenHead', m.get('even'));
  m.snap('start', 'Двете вериги се разплитат на място: odd върви по елементите на нечетни позиции, even — по тези на четни.');

  while (m.get('even') !== null && m.node(m.get('even')!).next !== null) {
    const odd = m.get('odd')!;
    const even = m.get('even')!;
    m.setNext(odd, m.node(even).next);
    m.set('odd', m.node(odd).next);
    m.snap('apply', `odd->next = even->next: ${show(m, odd)} прескача ${show(m, even)} и сочи ${show(m, m.get('odd'))}.`);
    m.setNext(even, m.node(m.get('odd')!).next);
    m.set('even', m.node(even).next);
    m.hops += 2;
    m.snap('apply', `even->next = odd->next: ${show(m, even)} сочи ${show(m, m.get('even'))}.`);
  }
  m.setNext(m.get('odd')!, m.get('evenHead'));
  m.snap('apply', `odd->next = evenHead: краят на нечетната верига се закача за началото на четната.`);
  m.drop('odd');
  m.drop('even');
  m.drop('evenHead');
  m.snap('ok', `Готово: [${valuesOf(m, ids[0]).join(', ')}]. O(1) памет и едно обхождане.`);
  return { steps: steps(m), ids, lanes: values.map((_, i) => i % 2) };
}
