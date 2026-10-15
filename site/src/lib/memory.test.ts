import { describe, expect, it } from 'vitest';
import { pointersTrace, swapTrace, POINTERS_CODE, SWAP_CODE } from './memory';
import cpp from './__fixtures__/cpp.json';
import { readFileSync } from 'node:fs';

// Addresses differ on every run, and *i3 reads uninitialised memory: mask both.
const mask = (line: string) => line.replace(/0x[0-9a-f]+/g, 'ADDR').replace(/^(0 5 5) \S+$/, '$1 ?');

describe('pointers.cpp traces', () => {
  it('print what the compiled program prints', () => {
    const out = [...pointersTrace().at(-1)!.out, ...swapTrace().at(-1)!.out];
    expect(out.map(mask)).toEqual(cpp.pointersOutput.map(mask));
  });

  it('show code that is really in pointers.cpp, at the right line numbers', () => {
    const file = readFileSync(new URL('../../../week01/pointers.cpp', import.meta.url), 'utf8').split('\n');
    const check = (from: number, lines: string[]) => lines.forEach((l, i) => expect(file[from - 1 + i].trimEnd()).toBe(l.trimEnd()));
    check(POINTERS_CODE.from, POINTERS_CODE.lines);
    SWAP_CODE.segments.forEach((seg) => check(seg.from, seg.lines));
  });

  it('only ever points at the line being executed', () => {
    const shown = new Set([
      ...POINTERS_CODE.lines.map((_, i) => POINTERS_CODE.from + i),
      ...SWAP_CODE.segments.flatMap((s) => s.lines.map((_, i) => s.from + i)),
    ]);
    for (const step of [...pointersTrace(), ...swapTrace()]) expect(shown.has(step.line), `line ${step.line}`).toBe(true);
  });

  it('models pointers the way C++ lays them out', () => {
    const steps = pointersTrace();
    const at = (line: number) => steps.find((s) => s.line === line)!;
    const vars = Object.fromEntries(at(21).frames[0].vars.map((v) => [v.name, v]));
    expect(vars.pFoo.value).toBe(vars.foo.addr);
    expect(vars.ppFoo.value).toBe(vars.pFoo.addr);
    expect(vars.ppFoo.addr).toBe(vars.pFoo.addr - 8); // pointers are 8 bytes, the stack grows down
  });

  it('marks pointers dangling after delete, including aliases', () => {
    const last = pointersTrace().at(-1)!;
    const v = Object.fromEntries(last.frames[0].vars.map((x) => [x.name, x]));
    for (const name of ['i', 'i1', 'i2', 'i3', 'f', 'f1']) expect(v[name].dangling, name).toBe(true);
    expect(v.pFoo.dangling).toBeFalsy();
    expect(last.heap.every((b) => b.freed)).toBe(true);
  });

  it('swaps only through pointers, and drops each call frame', () => {
    const steps = swapTrace();
    expect(steps.find((s) => s.line === 52)!.out.at(-1)).toBe('5 10');
    expect(steps.at(-1)!.out.at(-1)).toBe('10 5');
    expect(Math.max(...steps.map((s) => s.frames.length))).toBe(2);
    expect(steps.at(-1)!.frames).toHaveLength(1);
  });
});
