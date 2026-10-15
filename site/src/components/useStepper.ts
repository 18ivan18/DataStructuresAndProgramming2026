import { useCallback, useEffect, useState } from 'react';

/* Replays a precomputed list of snapshots. Knows nothing about what a step contains, so any
   algorithm that can be written as a generator of snapshots gets the same controls. */

export interface Stepper<T> {
  step: T;
  index: number;
  count: number;
  atStart: boolean;
  atEnd: boolean;
  playing: boolean;
  seek: (i: number) => void;
  next: () => void;
  prev: () => void;
  toggle: () => void;
  reset: () => void;
}

export function useStepper<T>(steps: T[], intervalMs = 900): Stepper<T> {
  const [state, setState] = useState({ steps, index: 0 });
  const [playing, setPlaying] = useState(false);
  const last = steps.length - 1;

  // New steps (another algorithm, start or parameter) mean a new run: go back to the beginning.
  // This happens during render, not in an effect, so no render ever pairs the new steps with an old
  // index: callers that index their own arrays by `index` would read past the end.
  if (state.steps !== steps) {
    setState({ steps, index: 0 });
    setPlaying(false);
  }
  const index = state.steps === steps ? Math.min(state.index, last) : 0;
  const setIndex = (update: number | ((i: number) => number)) =>
    setState((s) => ({ ...s, index: typeof update === 'function' ? update(s.index) : update }));

  useEffect(() => {
    if (!playing) return;
    if (index >= last) {
      setPlaying(false);
      return;
    }
    const timer = setTimeout(() => setIndex((i) => Math.min(i + 1, last)), intervalMs);
    return () => clearTimeout(timer);
  }, [playing, index, last, intervalMs]);

  const seek = useCallback((i: number) => setIndex(Math.max(0, Math.min(i, last))), [last]);

  return {
    step: steps[Math.min(index, last)],
    index,
    count: steps.length,
    atStart: index === 0,
    atEnd: index >= last,
    playing,
    seek,
    next: () => seek(index + 1),
    prev: () => {
      setPlaying(false);
      seek(index - 1);
    },
    toggle: () => {
      if (index >= last) {
        setIndex(0);
        setPlaying(true);
      } else setPlaying((p) => !p);
    },
    reset: () => {
      setPlaying(false);
      setIndex(0);
    },
  };
}
