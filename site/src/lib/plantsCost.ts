/* How much work three ways of solving task 8 do on the same garden.

   Cost model: one step = looking at, comparing or moving one plant.
   - brute:        every day, look at every live plant once (the filter in plantsByDays).
   - stacksCpp:    solutions/8.cpp. To see the bottom of a stack it copies the stack and pops
                   the copy (2·size), and a merge reverses one stack onto another (2·size).
   - stacksLinear: the same idea with each stack's bottom remembered and merges done by
                   linking lists, so a comparison and a merge cost 1 each.
   All three build the stacks or read the input once (n steps) and pay 1 per plant that dies. */

export interface PlantsCost {
  n: number;
  days: number;
  brute: number;
  stacksCpp: number;
  stacksLinear: number;
}

export function plantsCost(p: number[]): PlantsCost {
  const n = p.length;

  // Brute force, including the last day on which nobody dies (that is how it knows to stop).
  let brute = 0;
  let alive = p;
  for (;;) {
    brute += alive.length;
    const next = alive.filter((v, i) => i === 0 || v <= alive[i - 1]);
    if (next.length === alive.length) break;
    alive = next;
  }

  // The stack algorithm, left to right, as in plantsTrace. Runs are kept as arrays with a start
  // offset so popping the top is O(1) here and does not distort the counts.
  let stacksCpp = n, stacksLinear = n, days = 0;
  type Run = { vals: number[]; start: number };
  const size = (r: Run) => r.vals.length - r.start;
  let runs: Run[] = [];
  let cur: number[] = [];
  for (let j = n - 1; j >= 0; j--) {
    cur.unshift(p[j]);
    if (j === 0 || p[j] > p[j - 1]) {
      runs.unshift({ vals: cur, start: 0 });
      cur = [];
    }
  }

  while (runs.length > 1) {
    days++;
    for (let k = 1; k < runs.length; k++) runs[k].start++;
    stacksCpp += runs.length - 1;
    stacksLinear += runs.length - 1;
    runs = runs.filter((r, k) => k === 0 || size(r) > 0);

    let j = 0;
    while (j < runs.length - 1) {
      const left = runs[j], right = runs[j + 1];
      stacksCpp += 2 * size(left); // copy the left stack, then pop the copy down to its bottom
      stacksLinear += 1;
      if (left.vals[left.vals.length - 1] >= right.vals[right.start]) {
        stacksCpp += 2 * size(left); // reverse it, then push it onto the right stack
        stacksLinear += 1;
        runs.splice(j, 2, { vals: [...left.vals.slice(left.start), ...right.vals.slice(right.start)], start: 0 });
      } else j++;
    }
  }

  return { n, days, brute, stacksCpp, stacksLinear };
}

/** Gardens to measure on. */
export const FAMILIES = {
  /** Random amounts 1..n. Few days, so even brute force is nearly linear. */
  random: (n: number, seed = 42) => {
    let s = seed;
    return Array.from({ length: n }, () => ((s = (s * 1103515245 + 12345) % 2147483648), 1 + (s % n)));
  },
  /** A falling block, then 1, then another falling block: one plant dies a day for n/2 days,
      and the left stack stays big, so every comparison in 8.cpp copies it. */
  worst: (n: number) => {
    if (n < 2) return Array.from({ length: n }, () => 1);
    const half = Math.floor(n / 2);
    const left = Array.from({ length: n - half }, (_, i) => n - i);
    const right = Array.from({ length: Math.max(0, half - 1) }, (_, i) => half - i);
    return [...left, 1, ...right];
  },
};
