<div align="center">

# Структури от данни и програмиране

### 2026/2027 · ФМИ, Софийски университет · спец. Компютърни науки

[![C++](https://img.shields.io/badge/C%2B%2B-17%2B-00599C?logo=cplusplus&logoColor=white)](https://en.cppreference.com/)
[![Седмици](https://img.shields.io/badge/седмици-13-blue)](#съдържание-по-седмици)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-success)](#как-да-допринеса-към-това-repo)

_Материали, примерен код и задачи от упражненията._

**[Интерактивни материали към упражненията](https://18ivan18.github.io/DataStructuresAndProgramming2026/)**

</div>

---

## Съдържание по седмици

|  #  | Тема | Материали | Бележки | Тест | Слайдове |
| :-: | :--- | :-------- | :------ | :--- | :------- |
|  1. | **Преговор** — указатели, big O нотация и функции от по-висок ред | [week01](./week01) | [бележки](https://18ivan18.github.io/DataStructuresAndProgramming2026/week01/) | — | — |
|  2. | **Структури от данни. Стек** | [week02](./week02) | [бележки](https://18ivan18.github.io/DataStructuresAndProgramming2026/week02/) | [тест](https://18ivan18.github.io/DataStructuresAndProgramming2026/week02/quiz/) | [слайдове](https://18ivan18.github.io/DataStructuresAndProgramming2026/week02/slides/) |
|  3. | **Опашка** | [week03](./week03) | [бележки](https://18ivan18.github.io/DataStructuresAndProgramming2026/week03/) | [тест](https://18ivan18.github.io/DataStructuresAndProgramming2026/week03/quiz/) | [слайдове](https://18ivan18.github.io/DataStructuresAndProgramming2026/week03/slides/) |
|  4. | **Свързан списък** | [week04](./week04) | [бележки](https://18ivan18.github.io/DataStructuresAndProgramming2026/week04/) | [тест](https://18ivan18.github.io/DataStructuresAndProgramming2026/week04/quiz/) | [слайдове](https://18ivan18.github.io/DataStructuresAndProgramming2026/week04/slides/) |
|  5. | **Двусвързан списък** | [week05](./week05) | [бележки](https://18ivan18.github.io/DataStructuresAndProgramming2026/week05/) | [тест](https://18ivan18.github.io/DataStructuresAndProgramming2026/week05/quiz/) | [слайдове](https://18ivan18.github.io/DataStructuresAndProgramming2026/week05/slides/) |
|  6. | **Подготовка за контролно** | [week06](./week06) | — | — | — |
|  7. | **Въведение в дърветата. Двоични и n-арни дървета** | [week07](./week07) | — | — | — |
|  8. | **Двоично наредено дърво (BST)** | [week08](./week08) | — | — | — |
|  9. | **Итератори. Итератор на BST** | [week09](./week09) | — | — | — |
| 10. | **Балансирани дървета. AVL и червено-черни** | [week10](./week10) | — | — | — |
| 11. | **Хеш таблици** | [week11](./week11) | — | — | — |
| 12. | **Основно API за графи** | [week12](./week12) | — | — | — |
| 13. | **Тегловни графи. Най-къс път и минимално покриващо дърво** | [week13](./week13) | — | — | — |

---

## Интерактивни материали

Бележките от упражненията ги има и като сайт, на който примерите се пускат стъпка по стъпка:
динамичният масив показва цената на всяко добавяне, стекът и списъкът се пипат на живо, а
решенията на задачите се въртят възел по възел.

- [Начало](https://18ivan18.github.io/DataStructuresAndProgramming2026/) — указател към всички упражнения
- **Тест** — въпроси за самопроверка с обяснение след всеки отговор и разбивка по теми накрая.
  Отговорите се пазят само в браузъра на четящия.
- **Слайдове** — същите материали като презентация за упражнението, със същите интерактивни
  примери вътре. Стрелките листат, `F` е цял екран, `Esc` връща към бележките.

Кодът на сайта е в [`site/`](./site) и се публикува на GitHub Pages автоматично при всеки push
към `main`, който пипа тази папка.

---

## Реализации на структурите от данни

- Стек
  - [Динамичен масив](./week02/implementation/ArrayStack/ArrayStack.h)
  - [Свързан списък](./week02/implementation/LinkedStack/LinkedStack.h)
- Опашка
  - [Цикличен масив](./week03/implementation/ArrayQueue/ArrayQueue.h)
  - [Свързан списък](./week03/implementation/LinkedQueue/LinkedQueue.h)
- Свързан списък
  - [Едносвързан](./week04/implementation/SinglyLinkedList/SinglyLinkedList.h)
  - [Двусвързан](./week05/implementation/DoublyLinkedList/DoublyLinkedList.h)
- Двоично наредено дърво
  - [BST](./week08/implementation/BST/BST.h)
- Вектор
  - [Динамичен масив с итератор](./week09/implementation/Vector/Vector.h)
- Балансирано дърво
  - [AVL](./week10/solutions/AVL/AVLTree.h)
  - [Червено-черно (ляво наклонено)](./week10/solutions/RedBlack/RedBlackTree.h)
- Хеш таблица
  - [Външно хеширане](./week11/implementation/SeparateChaining/SeparateChainingHashST.cpp)
  - [Линейно пробване](./week11/implementation/LinearProbing/LinearProbingHashST.cpp)

---

## Как е организирано repo-то?

```text
weekNN/
├── README.md         # теория, примери и задачи за седмицата
├── implementation/   # реализациите на структурите от данни
├── solutions/        # примерни решения на задачите
└── *.cpp             # кодът, който писахме на упражнението
```

### Компилиране

```bash
g++ -std=c++17 -Wall -Wextra <file>.cpp -o <file> && ./<file>
```

---

## Теми за малки семинари

- `auto`
- `std::function` и ламбда функции, curry-ране
- `make`, `cmake`, процесът на компилация

---

## Какво да чета?

- [Списък с книги и ресурси](https://github.com/semerdzhiev/reading/blob/main/algorithms.adoc)
- [cppreference.com](https://en.cppreference.com/) — справочникът за всичко от стандартната библиотека

---

## Как да допринеса към това repo?

[Това](https://www.dataschool.io/how-to-contribute-on-github/) е много полезно ръководство стъпка по стъпка как да контрибютвате към open source проект.
