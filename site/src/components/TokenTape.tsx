/* The input, one token per cell: read, current, still to come. Pairs and culprits can be highlighted. */
export function TokenTape({ tokens, at, matched = [], bad = [] }: { tokens: string[]; at: number; matched?: number[]; bad?: number[] }) {
  return (
    <ol className="tape" aria-label="Вход">
      {tokens.map((t, i) => {
        const state = bad.includes(i) ? 'bad' : i === at ? 'current' : matched.includes(i) ? 'matched' : i < at ? 'done' : 'todo';
        return (
          <li key={i} className={`tape-cell ${state}`} aria-current={i === at ? 'step' : undefined}>
            {t}
          </li>
        );
      })}
    </ol>
  );
}
