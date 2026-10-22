import type { ReactElement, ReactNode } from 'react';

const MARKUP = /`([^`]+)`|\*\*([^*]+)\*\*/g;

export function Inline({ text }: { text: string }): ReactElement {
  const parts: ReactNode[] = [];
  let read = 0;

  for (const match of text.matchAll(MARKUP)) {
    const at = match.index;
    if (at > read) parts.push(text.slice(read, at));
    parts.push(match[1] !== undefined ? <code key={at}>{match[1]}</code> : <strong key={at}>{match[2]}</strong>);
    read = at + match[0].length;
  }
  if (read < text.length) parts.push(text.slice(read));

  return <>{parts}</>;
}
