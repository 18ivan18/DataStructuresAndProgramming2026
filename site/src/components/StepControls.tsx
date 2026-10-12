import type { KeyboardEvent } from 'react';
import type { Stepper } from './useStepper';

/* Transport bar shared by every stepping widget: buttons, a scrubber, and keyboard shortcuts
   (← → стъпка, интервал пуска) while focus is inside the widget. */

export function stepperKeys(s: Stepper<unknown>) {
  return (e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    if (target.matches('input, select, textarea')) return;
    if (e.key === 'ArrowRight') s.next();
    else if (e.key === 'ArrowLeft') s.prev();
    else if (e.key === ' ') s.toggle();
    else return;
    e.preventDefault();
  };
}

export function StepControls({ stepper: s, label }: { stepper: Stepper<unknown>; label: string }) {
  return (
    <div className="step-controls" role="group" aria-label={`${label}: стъпки`}>
      <button type="button" onClick={s.reset} disabled={s.atStart} aria-label="Към началото">⏮</button>
      <button type="button" onClick={s.prev} disabled={s.atStart} aria-label="Стъпка назад">◀</button>
      <button type="button" className="play" onClick={s.toggle} aria-label={s.playing ? 'Пауза' : s.atEnd ? 'Отначало' : 'Пусни'}>
        {s.playing ? '⏸' : s.atEnd ? '↺' : '▶'}
      </button>
      <button type="button" onClick={s.next} disabled={s.atEnd} aria-label="Стъпка напред">▶</button>
      <input
        type="range"
        min={0}
        max={s.count - 1}
        value={s.index}
        onChange={(e) => s.seek(Number(e.target.value))}
        aria-label="Стъпка"
      />
      <span className="step-count">
        {s.index} / {s.count - 1}
      </span>
    </div>
  );
}
