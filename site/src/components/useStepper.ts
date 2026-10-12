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
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const last = steps.length - 1;

  // New steps (another algorithm, start or parameter) mean a new run: go back to the beginning.
  useEffect(() => {
    setIndex(0);
    setPlaying(false);
  }, [steps]);

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
