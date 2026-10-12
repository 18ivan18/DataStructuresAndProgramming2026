# Сайт към упражненията

Интерактивни страници към седмиците, направени с [Astro](https://astro.build), MDX и React.
Страниците са статичен HTML; всеки widget зарежда JavaScript чак когато стигнеш до него.

    npm install
    npm run dev        # http://localhost:4321/DataStructuresAndProgramming2026/
    npm test           # сверява widget-ите със C++ кода на курса
    npm run build      # статичният сайт в dist/

## Структура

| път | какво има там |
| --- | --- |
| `src/pages/weekNN.mdx` | една страница на седмица: теорията от README-то плюс widget-и като тагове |
| `src/data/weeks.ts` | списъкът със седмици; менюто и началната страница се строят от него |
| `src/lib/` | структурите и алгоритмите като чист TypeScript, без DOM, с тестове |
| `src/components/` | widget-ите и общите им части |

## Как е направен един widget

- **Логика** (`src/lib`): `arrayStack.ts` е `ArrayStack.h` като чиста функция; `traces.ts`
  съдържа генератори, които връщат моментна снимка след всяка стъпка.
- **Възпроизвеждане** (`useStepper`, `StepControls`, `TracePanel`): пускане, пауза, плъзгач,
  ← → и интервал, за всеки списък от стъпки.
- **Изгледи** (`StackView`, `TokenTape`): рисуват една снимка.

Нова задача обикновено е един генератор в `src/lib` плюс 30 реда wiring; вижте `BracketsTrace.tsx`.

## Синхрон със C++ кода

`scripts/reference.cpp` компилира `week02/implementation/ArrayStack/ArrayStack.h` и решенията
от `week02/solutions/` и записва какво правят в `src/lib/__fixtures__/cpp.json`. `npm test`
проверява TypeScript логиката срещу този файл. След промяна в C++ кода: `npm run reference`,
после `npm test`.
