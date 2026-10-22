import { useCallback, useEffect, useState } from 'react';
import type { ReactElement, ReactNode } from 'react';

export interface Slide {
  id: string;
  title: string;
  cover?: boolean;
  badge?: string;
  lede?: string;
  content: ReactNode;
}

const FULLSCREEN = (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
  </svg>
);

export function Deck({ title, slides, notes }: { title: string; slides: Slide[]; notes: string }): ReactElement {
  const [index, setIndex] = useState(0);
  const [ready, setReady] = useState(false);
  const [full, setFull] = useState(false);
  const last = slides.length - 1;
  const go = useCallback((to: number) => setIndex(Math.max(0, Math.min(to, last))), [last]);

  useEffect(() => {
    const asked = location.hash.slice(1);
    const nth = Number(asked.match(/^slide-(\d+)$/)?.[1]);
    const named = slides.findIndex((slide) => slide.id === asked);
    if (nth) go(nth - 1);
    else if (named >= 0) go(named);
    setReady(true);
  }, [go, slides]);

  useEffect(() => {
    if (ready) history.replaceState(null, '', `#slide-${index + 1}`);
  }, [ready, index]);

  useEffect(() => {
    const sync = (): void => setFull(document.fullscreenElement !== null);
    document.addEventListener('fullscreenchange', sync);
    return () => document.removeEventListener('fullscreenchange', sync);
  }, []);

  const toggleFull = (): void => {
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
    else void document.documentElement.requestFullscreen().catch(() => {});
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent): void => {
      const from = event.target as Element | null;
      if (from?.closest?.('input, select, textarea, .playground')) return;
      if ((event.key === ' ' || event.key === 'Enter') && from?.closest?.('button, a')) return;
      switch (event.key) {
        case 'ArrowRight':
        case 'PageDown':
        case ' ':
          go(index + 1);
          break;
        case 'ArrowLeft':
        case 'PageUp':
          go(index - 1);
          break;
        case 'Home':
          go(0);
          break;
        case 'End':
          go(last);
          break;
        case 'f':
        case 'F':
          toggleFull();
          break;
        case 'Escape':
          if (!document.fullscreenElement) location.href = notes;
          break;
        default:
          return;
      }
      event.preventDefault();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [go, index, last, notes]);

  return (
    <div className="deck" role="region" aria-label={`${title}: слайдове`}>
      <div className="deck-stage">
        {slides.map((slide, i) => (
          <section key={slide.id} id={slide.id} className={`slide${slide.cover ? ' sl-cover' : ''}${i === index ? ' on' : ''}`} aria-hidden={i !== index}>
            <div className="slide-in">
              {slide.badge && <span className="sl-badge">{slide.badge}</span>}
              {slide.cover ? <h1>{slide.title}</h1> : <h2>{slide.title}</h2>}
              {slide.lede && <p className="sl-lede">{slide.lede}</p>}
              {slide.content}
            </div>
          </section>
        ))}
      </div>
      <div className="deck-bar">
        <i className="deck-prog" style={{ width: `${(100 * (index + 1)) / slides.length}%` }} aria-hidden="true" />
        <span className="deck-title">{title}</span>
        <button type="button" className="deck-btn" onClick={() => go(index - 1)} disabled={index === 0} aria-label="Предишен слайд">
          ‹
        </button>
        <span className="deck-count" aria-live="polite">
          {index + 1} / {slides.length}
        </span>
        <button type="button" className="deck-btn" onClick={() => go(index + 1)} disabled={index === last} aria-label="Следващ слайд">
          ›
        </button>
        <button type="button" className="deck-btn" onClick={toggleFull} aria-label={full ? 'Изход от цял екран (F)' : 'Цял екран (F)'}>
          {FULLSCREEN}
        </button>
        <button type="button" className="deck-btn theme-toggle" aria-label="Светла или тъмна тема">
          ◐
        </button>
        <a className="deck-btn deck-exit" href={notes}>
          ✕ <span>Бележки</span>
        </a>
      </div>
    </div>
  );
}
