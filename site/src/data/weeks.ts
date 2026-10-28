/* The course outline, from the repository README. The sidebar and the home page are built from
   it; weeks without an interactive page link to their folder on GitHub. */

export interface Week {
  n: number;
  title: string;
  folder: string;
  /** Route of the interactive page, when there is one. */
  page?: string;
  /** Whether the week has a quiz at <page>/quiz/. */
  quiz?: boolean;
  /** Whether the week has a slide deck at <page>/slides/. */
  slides?: boolean;
}

export const REPO = 'https://github.com/18ivan18/DataStructuresAndProgramming2026';

export const WEEKS: Week[] = [
  { n: 1, title: 'Преговор: указатели, big O, функции от по-висок ред', folder: 'week01', page: 'week01' },
  { n: 2, title: 'Структури от данни. Стек', folder: 'week02', page: 'week02', quiz: true, slides: true },
  { n: 3, title: 'Опашка', folder: 'week03', page: 'week03', quiz: true, slides: true },
  { n: 4, title: 'Свързан списък', folder: 'week04', page: 'week04', quiz: true, slides: true },
  { n: 5, title: 'Двусвързан списък', folder: 'week05', page: 'week05', quiz: true, slides: true },
  { n: 6, title: 'Подготовка за контролно', folder: 'week06' },
  { n: 7, title: 'Въведение в дърветата', folder: 'week07' },
  { n: 8, title: 'Двоично наредено дърво (BST)', folder: 'week08' },
  { n: 9, title: 'Итератори. Итератор на BST', folder: 'week09' },
  { n: 10, title: 'Балансирани дървета. AVL и червено-черни', folder: 'week10' },
  { n: 11, title: 'Хеш таблици', folder: 'week11' },
  { n: 12, title: 'Основно API за графи', folder: 'week12' },
  { n: 13, title: 'Тегловни графи. Най-къс път и МПД', folder: 'week13' },
];

export const weekHref = (w: Week, base: string) => (w.page ? `${base}${w.page}/` : `${REPO}/tree/main/${w.folder}`);

export const quizHref = (w: Week, base: string) => `${base}${w.page}/quiz/`;

export const slidesHref = (w: Week, base: string) => `${base}${w.page}/slides/`;
