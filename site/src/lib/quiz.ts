export type Level = 'лесна' | 'средна' | 'трудна';

export interface Skill {
  id: string;
  label: string;
  anchor?: string;
}

interface PartBase {
  question: string;
  points: number;
  letters?: boolean;
}

export interface ChoicePart extends PartBase {
  kind: 'mc';
  options: string[];
  answer: number;
}

export interface MultiPart extends PartBase {
  kind: 'multi';
  options: string[];
  answer: number[];
}

export interface RowsPart extends PartBase {
  kind: 'rows';
  options: string[];
  rows: { label: string; answer: number }[];
}

export interface NumberPart extends PartBase {
  kind: 'num';
  answer: number;
  tolerance?: number;
  unit?: string;
}

export interface SequencePart extends PartBase {
  kind: 'seq';
  tokens: string[];
  answer: string[];
  separator?: string;
}

export type Part = ChoicePart | MultiPart | RowsPart | NumberPart | SequencePart;

export interface AnswerOf {
  mc: number;
  multi: number[];
  rows: Record<number, number>;
  num: string;
  seq: string[];
}

export type Answer = AnswerOf[Part['kind']];
export type Answers = Record<string, Answer | undefined>;

export interface Task {
  id: string;
  title: string;
  skill: string;
  level: Level;
  intro?: string[];
  code?: string;
  parts: Part[];
  explain: string[];
}

export interface Quiz {
  id: string;
  title: string;
  lead: string;
  skills: Skill[];
  tasks: Task[];
}

export interface Score {
  got: number;
  max: number;
  answered: boolean;
  correct: boolean;
  rowsRight: number;
  rowsOf: number;
}

export interface PartRef {
  id: string;
  index: number;
  task: Task;
  part: Part;
}

export const partId = (taskId: string, index: number): string => `${taskId}.${index}`;

export function quizParts(quiz: Quiz): PartRef[] {
  return quiz.tasks.flatMap((task) => task.parts.map((part, index) => ({ id: partId(task.id, index), index, task, part })));
}

export function parseNumber(text: string): number | null {
  const cleaned = text.replace(/[−–—]/g, '-').replace(/\s/g, '').replace(',', '.');
  if (!/^-?\d*\.?\d+$/.test(cleaned)) return null;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : null;
}

const sameSet = (a: number[], b: number[]): boolean => {
  const x = [...a].sort((p, q) => p - q);
  const y = [...b].sort((p, q) => p - q);
  return x.length === y.length && x.every((v, i) => v === y[i]);
};

const sameList = (a: string[], b: string[]): boolean => a.length === b.length && a.every((v, i) => v === b[i]);

export function isAnswered(part: Part, answer: Answer | undefined): boolean {
  if (answer === undefined) return false;
  switch (part.kind) {
    case 'mc':
      return typeof answer === 'number';
    case 'multi':
    case 'seq':
      return (answer as number[] | string[]).length > 0;
    case 'rows':
      return part.rows.every((_, i) => (answer as AnswerOf['rows'])[i] !== undefined);
    case 'num':
      return (answer as string).trim() !== '';
  }
}

export function gradePart(part: Part, answer: Answer | undefined): Score {
  const blank: Score = { got: 0, max: part.points, answered: false, correct: false, rowsRight: 0, rowsOf: 0 };

  if (part.kind === 'rows') {
    const picked = (answer as AnswerOf['rows'] | undefined) ?? {};
    const right = part.rows.filter((row, i) => picked[i] === row.answer).length;
    const touched = Object.keys(picked).length > 0;
    return {
      got: (part.points * right) / part.rows.length,
      max: part.points,
      answered: touched,
      correct: right === part.rows.length,
      rowsRight: right,
      rowsOf: part.rows.length,
    };
  }

  if (answer === undefined) return blank;
  const answered = isAnswered(part, answer);
  let correct = false;

  switch (part.kind) {
    case 'mc':
      correct = answer === part.answer;
      break;
    case 'multi':
      correct = sameSet(answer as number[], part.answer);
      break;
    case 'seq':
      correct = sameList(answer as string[], part.answer);
      break;
    case 'num': {
      const value = parseNumber(answer as string);
      correct = value !== null && Math.abs(value - part.answer) <= (part.tolerance ?? 0) + 1e-9;
      break;
    }
  }

  return { ...blank, answered, correct, got: correct ? part.points : 0 };
}

export function scoreTask(task: Task, answers: Answers): { got: number; max: number } {
  return task.parts.reduce(
    (sum, part, index) => {
      const score = gradePart(part, answers[partId(task.id, index)]);
      return { got: sum.got + score.got, max: sum.max + score.max };
    },
    { got: 0, max: 0 },
  );
}

export interface QuizProgress {
  got: number;
  max: number;
  answered: number;
  total: number;
}

export function scoreQuiz(quiz: Quiz, answers: Answers): QuizProgress {
  return quizParts(quiz).reduce(
    (sum, { id, part }) => {
      const score = gradePart(part, answers[id]);
      return {
        got: sum.got + score.got,
        max: sum.max + score.max,
        answered: sum.answered + (isAnswered(part, answers[id]) ? 1 : 0),
        total: sum.total + 1,
      };
    },
    { got: 0, max: 0, answered: 0, total: 0 },
  );
}

export interface SkillScore {
  skill: Skill;
  got: number;
  max: number;
  tasks: number[];
}

export function scoreSkills(quiz: Quiz, answers: Answers): SkillScore[] {
  return quiz.skills
    .map((skill) => {
      const tasks = quiz.tasks.filter((task) => task.skill === skill.id);
      const totals = tasks.reduce(
        (sum, task) => {
          const score = scoreTask(task, answers);
          return { got: sum.got + score.got, max: sum.max + score.max };
        },
        { got: 0, max: 0 },
      );
      return { skill, ...totals, tasks: tasks.map((task) => quiz.tasks.indexOf(task) + 1) };
    })
    .filter((entry) => entry.max > 0);
}

export function weakestSkill(scores: SkillScore[]): SkillScore | null {
  const behind = scores.filter((entry) => entry.got < entry.max);
  if (!behind.length) return null;
  return behind.reduce((worst, entry) => (entry.got / entry.max < worst.got / worst.max ? entry : worst));
}

export function correctText(part: Part): string {
  switch (part.kind) {
    case 'mc':
      return part.letters === false ? part.options[part.answer] : `${'АБВГДЕЖ'[part.answer]}. ${part.options[part.answer]}`;
    case 'multi':
      return [...part.answer].sort((a, b) => a - b).map((i) => part.options[i]).join(', ');
    case 'seq':
      return part.answer.join(` ${part.separator ?? '→'} `);
    case 'num':
      return part.unit ? `${part.answer} ${part.unit}` : String(part.answer);
    case 'rows':
      return 'верният избор на всеки ред е ограден в зелено';
  }
}

export const formatPoints = (value: number): string => String(Math.round(value * 10) / 10);
