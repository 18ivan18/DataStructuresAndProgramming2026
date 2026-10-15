/* A tiny model of C++ memory for stepping through week01/pointers.cpp: stack frames with
   variables, heap blocks, and console output. Each step is a snapshot for useStepper.
   The traces at the bottom follow pointers.cpp line by line (line numbers are the file's);
   memory.test.ts checks their output against the compiled program. Addresses are made up but
   shaped like real ones: the stack grows down from 0x7ffd..., the heap up from 0x55b1.... */

export type ValueKind = 'int' | 'float' | 'ptr' | 'garbage';

export interface Var {
  name: string;
  type: string;
  addr: number;
  /** A number, or the target address for a pointer; null when uninitialised. */
  value: number | null;
  kind: ValueKind;
  /** Pointer whose block was deleted: it still holds the address, but the memory is gone. */
  dangling?: boolean;
}

export interface Frame {
  fn: string;
  vars: Var[];
}

export interface Block {
  addr: number;
  type: string;
  /** One entry per element; null means never initialised. */
  cells: (number | null)[];
  kind: 'int' | 'float';
  freed: boolean;
}

export interface MemStep {
  line: number;
  frames: Frame[];
  heap: Block[];
  out: string[];
  message: string;
  /** Addresses touched by this line, to highlight. */
  touched: number[];
}

const SIZE: Record<string, number> = { int: 4, float: 4 };
const sizeOf = (type: string) => (type.endsWith('*') ? 8 : SIZE[type] ?? 8);

export const hex = (a: number) => `0x${a.toString(16)}`;

export class Memory {
  frames: Frame[] = [];
  heap: Block[] = [];
  out: string[] = [];
  steps: MemStep[] = [];
  private sp = 0x7ffd5a3c;
  private hp = 0x55b1c2e0;
  private touched: number[] = [];

  call(fn: string) {
    this.frames.push({ fn, vars: [] });
  }

  ret() {
    const frame = this.frames.pop()!;
    // The frame's memory is released: the next call reuses it.
    this.sp += frame.vars.reduce((s, v) => s + sizeOf(v.type), 0);
  }

  declare(name: string, type: string, value: number | null, kind: ValueKind = type.endsWith('*') ? 'ptr' : (type as ValueKind)) {
    this.sp -= sizeOf(type);
    const v: Var = { name, type, addr: this.sp, value, kind };
    this.frames[this.frames.length - 1].vars.push(v);
    this.touched.push(v.addr);
    return v.addr;
  }

  /** Looks a variable up in the innermost frame, like C++ name lookup inside a function. */
  get(name: string): Var {
    const v = this.frames[this.frames.length - 1].vars.find((x) => x.name === name);
    if (!v) throw new Error(`no variable ${name}`);
    return v;
  }

  addrOf(name: string) {
    return this.get(name).addr;
  }

  set(name: string, value: number) {
    const v = this.get(name);
    v.value = value;
    v.dangling = false;
    this.touched.push(v.addr);
  }

  /** Reads what a pointer points at (one level of *). */
  deref(addr: number): number | null {
    for (const f of this.frames) for (const v of f.vars) if (v.addr === addr) return v.value;
    const b = this.block(addr);
    return b.cells[(addr - b.addr) / SIZE[b.kind]];
  }

  /** Writes through a pointer (*p = value). */
  store(addr: number, value: number) {
    for (const f of this.frames) for (const v of f.vars) if (v.addr === addr) { v.value = value; this.touched.push(addr); return; }
    const b = this.block(addr);
    if (b.freed) throw new Error('write to freed memory');
    b.cells[(addr - b.addr) / SIZE[b.kind]] = value;
    this.touched.push(b.addr);
  }

  alloc(type: 'int' | 'float', cells: (number | null)[]) {
    const block: Block = { addr: this.hp, type: cells.length > 1 ? `${type}[${cells.length}]` : type, cells, kind: type, freed: false };
    this.heap.push(block);
    this.hp += 0x20;
    this.touched.push(block.addr);
    return block.addr;
  }

  free(addr: number) {
    const b = this.block(addr);
    b.freed = true;
    for (const f of this.frames) for (const v of f.vars) if (v.kind === 'ptr' && v.value === addr) v.dangling = true;
    this.touched.push(addr);
  }

  print(line: string) {
    this.out.push(line);
  }

  snap(line: number, message: string) {
    this.steps.push({
      line,
      message,
      frames: this.frames.map((f) => ({ fn: f.fn, vars: f.vars.map((v) => ({ ...v })) })),
      heap: this.heap.map((b) => ({ ...b, cells: [...b.cells] })),
      out: [...this.out],
      touched: this.touched,
    });
    this.touched = [];
  }

  private block(addr: number) {
    const b = this.heap.find((x) => addr >= x.addr && addr < x.addr + x.cells.length * SIZE[x.kind]);
    if (!b) throw new Error(`no block at ${hex(addr)}`);
    return b;
  }
}

const fmtFloat = (x: number) => String(Number(Math.fround(x).toPrecision(6)));

/* ---------- pointers.cpp, lines 19-47: pointers, pointer to pointer, new/delete ---------- */
export function pointersTrace(): MemStep[] {
  const m = new Memory();
  m.call('main');
  m.snap(17, 'Програмата започва: main получава своя рамка в стека.');

  m.declare('foo', 'int', 5);
  m.snap(19, 'foo е обикновена променлива: 4 байта в стека, стойност 5.');
  m.declare('pFoo', 'int*', m.addrOf('foo'));
  m.snap(20, '&foo е адресът на foo. pFoo пази този адрес, т.е. сочи към foo.');
  m.declare('ppFoo', 'int**', m.addrOf('pFoo'));
  m.snap(21, 'pFoo също е променлива и също има адрес. ppFoo пази адреса на pFoo: указател към указател.');
  m.print(`foo: ${m.get('foo').value} pFoo: ${hex(m.get('pFoo').value!)} ppFoo: ${hex(m.get('ppFoo').value!)}`);
  m.snap(22, 'Отпечатват се стойностите: числото 5 и двата адреса.');

  m.declare('pBar', 'int*', m.deref(m.get('ppFoo').value!));
  m.snap(24, '*ppFoo е стойността на pFoo, т.е. адресът на foo. Сега pBar също сочи към foo.');
  m.declare('bar', 'int', m.deref(m.get('pFoo').value!));
  m.snap(25, '*pFoo е стойността на foo: bar получава копие, 5.');
  m.declare('baz', 'int', m.deref(m.deref(m.get('ppFoo').value!)!));
  m.snap(26, '**ppFoo: първата * дава pFoo, втората дава foo. baz също е 5.');
  m.print(`pBar: ${hex(m.get('pBar').value!)} bar: ${m.get('bar').value} baz: ${m.get('baz').value}`);
  m.snap(27, 'pBar отпечатва адреса на foo, а bar и baz са просто числа.');

  m.declare('i', 'int*', m.alloc('int', [0]));
  m.snap(29, 'new int() заделя 4 байта в хийпа и ги нулира. В стека остава само указателят i.');
  m.declare('i1', 'int*', m.alloc('int', [5]));
  m.snap(30, 'new int(5): ново парче в хийпа със стойност 5.');
  m.declare('i2', 'int*', m.alloc('int', [5]));
  m.snap(31, 'new int{5} прави същото с другия синтаксис за инициализация.');
  m.declare('i3', 'int*', m.alloc('int', [null, null, null, null, null]));
  m.snap(32, 'new int[5] заделя пет поредни int-а, без да ги инициализира: в тях има каквото е останало в паметта.');
  m.print(`${m.deref(m.get('i').value!)} ${m.deref(m.get('i1').value!)} ${m.deref(m.get('i2').value!)} ?`);
  m.snap(33, '*i3 чете първия елемент на масива. Той не е инициализиран, затова на негово място е „?“: може да е 0, може да е всичко.');

  for (const [name, line] of [['i', 37], ['i1', 38], ['i2', 39]] as const) {
    m.free(m.get(name).value!);
    m.snap(line, `delete ${name} връща паметта. ${name} още пази стария адрес, но вече сочи към нищо: висящ указател.`);
  }
  m.free(m.get('i3').value!);
  m.snap(40, 'Масивът се освобождава с delete[], не с delete. Всяко new си има delete, всяко new[] си има delete[].');

  const fb = m.alloc('float', [0]);
  m.declare('f', 'float*', fb);
  m.declare('f1', 'float*', fb);
  m.snap(42, 'Едно парче float в хийпа и два указателя към него: f и f1 са с една и съща стойност.');
  m.store(m.get('f').value!, 3.14);
  m.snap(43, '*f = 3.14 пише в паметта, към която сочи f.');
  m.print(fmtFloat(m.deref(m.get('f1').value!)!));
  m.snap(44, '*f1 чете същата памет: 3.14, въпреки че никога не сме писали през f1.');
  m.store(m.get('f1').value!, 10.1);
  m.snap(45, '*f1 = 10.1 пише в същото място.');
  m.print(fmtFloat(m.deref(m.get('f').value!)!));
  m.snap(46, 'И *f вижда 10.1: и двата указателя водят до едно и също място.');
  m.free(fb);
  m.snap(47, 'delete f освобождава блока. f1 също става висящ: delete на f1 сега би било двойно освобождаване.');
  return m.steps;
}

/* ---------- pointers.cpp, lines 49-56: swap by value and by pointer ---------- */
export function swapTrace(): MemStep[] {
  const m = new Memory();
  m.call('main');
  m.declare('a', 'int', 5);
  m.declare('b', 'int', 10);
  m.snap(49, 'a = 5 и b = 10 в рамката на main.');

  // Arguments are evaluated in the caller, then copied into the new frame.
  let [a, b] = [m.get('a').value!, m.get('b').value!];
  m.snap(50, `swap(a, b) с подаване по стойност: подаваме стойностите ${a} и ${b}.`);
  m.call('swap(int, int)');
  m.declare('first', 'int', a);
  m.declare('second', 'int', b);
  m.snap(3, 'Новата рамка получава КОПИЯ: first и second са отделни променливи, на други адреси.');
  m.declare('firstCopy', 'int', m.get('first').value);
  m.snap(5, 'firstCopy = first.');
  m.set('first', m.get('second').value!);
  m.snap(6, 'first = second: променя се копието.');
  m.set('second', m.get('firstCopy').value!);
  m.snap(7, 'second = firstCopy: копията са разменени...');
  m.ret();
  m.snap(8, '...и рамката изчезва заедно с тях. a и b в main не са пипнати.');
  m.print(`${m.get('a').value} ${m.get('b').value}`);
  m.snap(52, `Отпечатва се ${m.get('a').value} ${m.get('b').value}: нищо не е разменено.`);

  [a, b] = [m.addrOf('a'), m.addrOf('b')];
  m.snap(54, `swap(&a, &b): този път подаваме АДРЕСИТЕ ${hex(a)} и ${hex(b)}.`);
  m.call('swap(int*, int*)');
  m.declare('first', 'int*', a);
  m.declare('second', 'int*', b);
  m.snap(10, 'Копират се адресите: first сочи към a, second към b.');
  m.declare('firstCopy', 'int', m.deref(m.get('first').value!));
  m.snap(12, 'firstCopy = *first: четем a през указателя.');
  m.store(m.get('first').value!, m.deref(m.get('second').value!)!);
  m.snap(13, '*first = *second: пишем през указателя право в a.');
  m.store(m.get('second').value!, m.get('firstCopy').value!);
  m.snap(14, '*second = firstCopy: и в b.');
  m.ret();
  m.snap(15, 'Рамката изчезва, но промените са в a и b, които живеят в main.');
  m.print(`${m.get('a').value} ${m.get('b').value}`);
  m.snap(56, `Отпечатва се ${m.get('a').value} ${m.get('b').value}: разменени.`);
  return m.steps;
}

/* The two code excerpts shown next to the traces, with their line numbers in pointers.cpp. */
export const POINTERS_CODE = { from: 17, lines: `int main()
{
    int foo = 5;
    int *pFoo = &foo; // & operator takes the address of a variable
    int **ppFoo = &pFoo;
    std::cout << "foo: " << foo << " pFoo: " << pFoo << " ppFoo: " << ppFoo << '\\n';

    int *pBar = *ppFoo;
    int bar = *pFoo;
    int baz = **ppFoo;
    std::cout << "pBar: " << pBar << " bar: " << bar << " baz: " << baz << '\\n';

    int *i = new int();
    int *i1 = new int(5);
    int *i2 = new int{5};
    int *i3 = new int[5];
    std::cout << *i << " " << *i1
              << " " << *i2
              << " " << *i3 << '\\n';

    delete i;
    delete i1;
    delete i2;
    delete[] i3;

    float *f = new float(), *f1 = f;
    *f = 3.14f;
    std::cout << *f1 << '\\n';
    *f1 = 10.1f;
    std::cout << *f << '\\n';
    delete f;` .split('\n') };

export const SWAP_CODE = {
  segments: [
    { from: 3, lines: ['void swap(int first, int second)', '{', '    int firstCopy = first;', '    first = second;', '    second = firstCopy;', '}'] },
    { from: 10, lines: ['void swap(int *first, int *second)', '{', '    int firstCopy = *first;', '    *first = *second;', '    *second = firstCopy;', '}'] },
    { from: 49, lines: ['    int a = 5, b = 10;', '    swap(a, b);', '    // not swapped', "    std::cout << a << \" \" << b << '\\n';", '', '    swap(&a, &b);', '    // swapped', "    std::cout << a << \" \" << b << '\\n';"] },
  ],
};
