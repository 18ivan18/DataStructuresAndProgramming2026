import { useEffect, useState } from 'react';
import type { ReactElement } from 'react';
import { Inline } from './Inline';
import {
  type Answer,
  type AnswerOf,
  type Answers,
  type Part,
  type PartRef,
  type Quiz as QuizData,
  type Score,
  correctText,
  formatPoints,
  gradePart,
  partId,
  quizParts,
  scoreQuiz,
  scoreSkills,
  scoreTask,
  weakestSkill,
} from '../lib/quiz';

const LETTERS = 'АБВГДЕЖ';

interface Saved {
  answers: Answers;
  graded: boolean;
}

export default function Quiz({ quiz, back }: { quiz: QuizData; back: string }): ReactElement {
  const [{ answers, graded }, setSaved] = useState<Saved>({ answers: {}, graded: false });
  const [loaded, setLoaded] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const key = `dsp-quiz-${quiz.id}`;
  const parts = quizParts(quiz);
  const progress = scoreQuiz(quiz, answers);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setSaved(JSON.parse(raw) as Saved);
    } catch {}
    setLoaded(true);
  }, [key]);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(key, JSON.stringify({ answers, graded }));
    } catch {}
  }, [loaded, key, answers, graded]);

  const answer = (id: string, value: Answer | undefined): void => {
    setConfirming(false);
    setSaved((s) => ({ ...s, answers: { ...s.answers, [id]: value } }));
  };

  const check = (): void => {
    if (progress.answered < progress.total && !confirming) {
      setConfirming(true);
      return;
    }
    setConfirming(false);
    setSaved((s) => ({ ...s, graded: true }));
  };

  const restart = (): void => {
    setConfirming(false);
    setSaved({ answers: {}, graded: false });
    try {
      localStorage.removeItem(key);
    } catch {}
  };

  const left = progress.total - progress.answered;
  const filled = graded ? (progress.max ? progress.got / progress.max : 0) : progress.answered / progress.total;

  return (
    <div className={`quiz${graded ? ' graded' : ''}`}>
      <div className="qz-bar">
        <div className="qz-track" aria-hidden="true">
          <i style={{ width: `${100 * filled}%` }} />
        </div>
        <p className="qz-count">
          {graded ? (
            <>
              Резултат <b>{formatPoints(progress.got)}</b> от {formatPoints(progress.max)} т.
            </>
          ) : (
            <>
              <b>
                {progress.answered} / {progress.total}
              </b>{' '}
              отговорени
            </>
          )}
        </p>
        {graded ? (
          <button type="button" className="btn" onClick={restart}>
            отначало
          </button>
        ) : (
          <button type="button" className={`btn primary${confirming ? ' warn' : ''}`} onClick={check}>
            {confirming ? `${left} без отговор — провери въпреки това?` : 'провери'}
          </button>
        )}
      </div>

      {graded && <Results quiz={quiz} answers={answers} back={back} />}

      <ol className="qz-tasks">
        {quiz.tasks.map((task, index) => {
          const score = scoreTask(task, answers);
          return (
            <li key={task.id} id={task.id} className="qz-task">
              <header>
                <h3>
                  <span className="qz-n">Задача {index + 1}</span>
                  {task.title}
                </h3>
                <p className="qz-meta">
                  <span className="qz-level">{task.level}</span>
                  {graded && (
                    <span className={`qz-pts ${tone(score.got, score.max)}`}>
                      {formatPoints(score.got)} / {formatPoints(score.max)} т.
                    </span>
                  )}
                </p>
              </header>

              {task.intro?.map((text) => (
                <p key={text}>
                  <Inline text={text} />
                </p>
              ))}
              {task.code && <pre className="qz-code">{task.code}</pre>}

              {task.parts.map((part, pi) => (
                <PartView
                  key={partId(task.id, pi)}
                  entry={{ id: partId(task.id, pi), index: pi, task, part }}
                  value={answers[partId(task.id, pi)]}
                  graded={graded}
                  onAnswer={answer}
                />
              ))}

              {graded && (
                <div className="qz-explain">
                  {task.explain.map((text) => (
                    <p key={text}>
                      <Inline text={text} />
                    </p>
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ol>

      <div className="qz-bottom">
        {graded ? (
          <button type="button" className="btn" onClick={restart}>
            отначало
          </button>
        ) : (
          <button type="button" className={`btn primary${confirming ? ' warn' : ''}`} onClick={check}>
            {confirming ? `${left} без отговор — провери въпреки това?` : 'провери'}
          </button>
        )}
        <span className="muted small">{parts.length} въпроса · отговорите остават в този браузър</span>
      </div>
    </div>
  );
}

function tone(got: number, max: number): string {
  if (got >= max) return 'ok';
  return got > 0 ? 'part' : 'bad';
}

function PartView({
  entry,
  value,
  graded,
  onAnswer,
}: {
  entry: PartRef;
  value: Answer | undefined;
  graded: boolean;
  onAnswer: (id: string, value: Answer | undefined) => void;
}): ReactElement {
  const { id, part } = entry;
  const score = gradePart(part, value);

  return (
    <div className="qz-part">
      <p className="qz-q">
        <Inline text={part.question} />
        <span className="qz-weight">{part.points} т.</span>
      </p>
      {part.kind === 'mc' && <Choices part={part} value={value as AnswerOf['mc'] | undefined} graded={graded} onPick={(i) => onAnswer(id, i)} />}
      {part.kind === 'multi' && (
        <Choices
          part={part}
          multi
          value={value as AnswerOf['multi'] | undefined}
          graded={graded}
          onPick={(i) => {
            const picked = (value as AnswerOf['multi'] | undefined) ?? [];
            onAnswer(id, picked.includes(i) ? picked.filter((x) => x !== i) : [...picked, i]);
          }}
        />
      )}
      {part.kind === 'rows' && (
        <ol className="qz-rows">
          {part.rows.map((row, ri) => {
            const picked = ((value as AnswerOf['rows'] | undefined) ?? {})[ri];
            return (
              <li key={row.label}>
                <p className="qz-row-label">
                  <Inline text={row.label} />
                </p>
                <div className="qz-pills">
                  {part.options.map((option, oi) => (
                    <button
                      key={option}
                      type="button"
                      className={`qz-pill${picked === oi ? ' on' : ''}${graded ? marks(row.answer === oi, picked === oi) : ''}`}
                      aria-pressed={picked === oi}
                      disabled={graded}
                      onClick={() => onAnswer(id, { ...((value as AnswerOf['rows'] | undefined) ?? {}), [ri]: oi })}
                    >
                      <Inline text={option} />
                    </button>
                  ))}
                </div>
              </li>
            );
          })}
        </ol>
      )}
      {part.kind === 'num' && (
        <p className="qz-numline">
          <input
            type="text"
            inputMode="decimal"
            className={`qz-num${graded ? (score.correct ? ' correct' : score.answered ? ' wrong' : '') : ''}`}
            value={(value as AnswerOf['num'] | undefined) ?? ''}
            disabled={graded}
            aria-label={part.question}
            onChange={(e) => onAnswer(id, e.target.value)}
          />
          {part.unit && <span className="qz-unit">{part.unit}</span>}
        </p>
      )}
      {part.kind === 'seq' && (
        <Sequence
          part={part}
          value={(value as AnswerOf['seq'] | undefined) ?? []}
          graded={graded}
          onChange={(next) => onAnswer(id, next)}
        />
      )}
      {graded && <Feedback part={part} score={score} />}
    </div>
  );
}

function marks(right: boolean, chosen: boolean): string {
  if (right && chosen) return ' correct';
  if (right) return ' missed';
  return chosen ? ' wrong' : '';
}

function Choices({
  part,
  value,
  graded,
  multi = false,
  onPick,
}: {
  part: Extract<Part, { kind: 'mc' | 'multi' }>;
  value: number | number[] | undefined;
  graded: boolean;
  multi?: boolean;
  onPick: (index: number) => void;
}): ReactElement {
  const chosen = (i: number): boolean => (multi ? ((value as number[] | undefined) ?? []).includes(i) : value === i);
  const right = (i: number): boolean => (multi ? (part.answer as number[]).includes(i) : part.answer === i);

  return (
    <div className={`qz-opts${multi ? ' multi' : ''}`} role="group" aria-label={part.question}>
      {part.options.map((option, i) => (
        <button
          key={option}
          type="button"
          className={`qz-opt${chosen(i) ? ' on' : ''}${graded ? marks(right(i), chosen(i)) : ''}`}
          aria-pressed={chosen(i)}
          disabled={graded}
          onClick={() => onPick(i)}
        >
          {part.letters !== false && <span className="qz-letter">{LETTERS[i]}</span>}
          <span>
            <Inline text={option} />
          </span>
        </button>
      ))}
      {multi && <p className="small">Повече от един верен отговор; точките се дават само за точното множество.</p>}
    </div>
  );
}

function Sequence({
  part,
  value,
  graded,
  onChange,
}: {
  part: Extract<Part, { kind: 'seq' }>;
  value: string[];
  graded: boolean;
  onChange: (next: string[]) => void;
}): ReactElement {
  const separator = part.separator ?? '→';
  const firstWrong = graded ? value.findIndex((token, i) => token !== part.answer[i]) : -1;

  return (
    <div className="qz-seq">
      <ol className="qz-chosen" aria-label="Избрана последователност">
        {value.map((token, i) => (
          <li key={`${i}-${token}`} className={graded ? (firstWrong === -1 || i < firstWrong ? 'ok' : 'bad') : ''}>
            {i > 0 && <span className="qz-sep">{separator}</span>}
            {token}
          </li>
        ))}
        {!value.length && <li className="qz-chosen-empty">нищо избрано</li>}
      </ol>
      {!graded && (
        <div className="qz-pills">
          {part.tokens.map((token) => (
            <button key={token} type="button" className="qz-pill qz-token" onClick={() => onChange([...value, token])}>
              {token}
            </button>
          ))}
          <button type="button" className="btn ghost" disabled={!value.length} onClick={() => onChange(value.slice(0, -1))}>
            назад
          </button>
          <button type="button" className="btn ghost" disabled={!value.length} onClick={() => onChange([])}>
            изчисти
          </button>
        </div>
      )}
    </div>
  );
}

function Feedback({ part, score }: { part: Part; score: Score }): ReactElement {
  const label = (): string => {
    if (!score.answered) return 'Без отговор';
    if (score.correct) return '✓ Вярно';
    if (part.kind === 'rows') return score.rowsRight ? `${score.rowsRight} от ${score.rowsOf} верни реда` : 'Нито един верен ред';
    return '✗ Не съвсем';
  };

  return (
    <p className={`qz-fb ${score.correct ? 'ok' : score.got > 0 ? 'part' : 'bad'}`}>
      <b>{label()}</b> · {formatPoints(score.got)} / {formatPoints(score.max)} т.
      {!score.correct &&
        (part.kind === 'rows' ? (
          <> — {correctText(part)}</>
        ) : (
          <>
            {' '}
            — вярно: <Inline text={correctText(part)} />
          </>
        ))}
    </p>
  );
}

function Results({ quiz, answers, back }: { quiz: QuizData; answers: Answers; back: string }): ReactElement {
  const total = scoreQuiz(quiz, answers);
  const skills = scoreSkills(quiz, answers);
  const weakest = weakestSkill(skills);
  const percent = total.max ? Math.round((100 * total.got) / total.max) : 0;

  return (
    <section className="qz-results" aria-label="Резултат">
      <p className="qz-total">
        <b>{formatPoints(total.got)}</b>
        <span>
          от {formatPoints(total.max)} т. · {percent}%
        </span>
      </p>
      <p className="qz-verdict">
        {weakest ? (
          <>
            Най-слабо: <b>{weakest.skill.label}</b>
            {weakest.skill.anchor && (
              <>
                {' — '}
                <a href={`${back}#${weakest.skill.anchor}`}>прегледай материала →</a>
              </>
            )}
          </>
        ) : (
          'Всичко вярно. Няма какво да се преговаря.'
        )}
      </p>
      <ul className="qz-skills">
        {skills.map((entry) => (
          <li key={entry.skill.id}>
            <div className="qz-skill-name">
              {entry.skill.label}
              <small>
                Задач{entry.tasks.length > 1 ? 'и' : 'а'}{' '}
                {entry.tasks.map((n, i) => (
                  <span key={n}>
                    {i > 0 && ', '}
                    <a href={`#${quiz.tasks[n - 1].id}`}>{n}</a>
                  </span>
                ))}
              </small>
            </div>
            <div className="qz-track" aria-hidden="true">
              <i style={{ width: `${entry.max ? (100 * entry.got) / entry.max : 0}%` }} />
            </div>
            <b>
              {formatPoints(entry.got)} / {formatPoints(entry.max)}
            </b>
          </li>
        ))}
      </ul>
    </section>
  );
}
