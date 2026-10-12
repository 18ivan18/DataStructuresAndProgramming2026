/* A stack drawn the way it is talked about: bottom at the bottom, top at the top.
   Items are keyed, so a pushed item mounts (and drops in via CSS) and a popped one leaves. */

export interface StackItem {
  key: string;
  label: string;
  sub?: string;
  tone?: 'ok' | 'bad' | 'muted';
}

export function StackView({ items, title, empty = 'празен', minSlots = 4 }: { items: StackItem[]; title: string; empty?: string; minSlots?: number }) {
  const slots = Math.max(0, minSlots - items.length);
  return (
    <figure className="stack-view" aria-label={`${title}: ${items.length ? items.map((i) => i.label).join(', ') + ' (последният е на върха)' : empty}`}>
      <figcaption>{title}</figcaption>
      <ol className="sv-items" reversed>
        {[...items].reverse().map((item, i) => (
          <li key={item.key} className={`sv-item${i === 0 ? ' top' : ''}${item.tone ? ` ${item.tone}` : ''}`}>
            <span className="sv-label">{item.label}</span>
            {item.sub && <span className="sv-sub">{item.sub}</span>}
            {i === 0 && <span className="sv-top">← връх</span>}
          </li>
        ))}
        {items.length === 0 && <li className="sv-empty">{empty}</li>}
        {Array.from({ length: slots - (items.length === 0 ? 1 : 0) }, (_, i) => <li key={`slot-${i}`} className="sv-slot" aria-hidden="true" />)}
      </ol>
    </figure>
  );
}
