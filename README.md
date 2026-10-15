<div align="center">

# Структури от данни и програмиране

### 2026/2027 · ФМИ, Софийски университет · спец. Компютърни науки

[![C++](https://img.shields.io/badge/C%2B%2B-17%2B-00599C?logo=cplusplus&logoColor=white)](https://en.cppreference.com/)
[![Седмици](https://img.shields.io/badge/седмици-13-blue)](#съдържание-по-седмици)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-success)](#как-да-допринеса-към-това-repo)

_Материали, примерен код и задачи от упражненията._

</div>

---

## Съдържание по седмици

|  #  | Тема                                                              | Материали             |
| :-: | :---------------------------------------------------------------- | :-------------------- |
|  1. | **Преговор** — указатели, big O нотация и функции от по-висок ред | [week01](./week01) |
|  2. | **Структури от данни. Стек**                                      | [week02](./week02) |
|  3. | **Опашка**                                                        | [week03](./week03)    |
|  4. | **Свързан списък**                                                | [week04](./week04)    |
|  5. | **Двусвързан списък**                                             | [week05](./week05)    |
|  6. | **Подготовка за контролно**                                       | [week06](./week06)    |
|  7. | **Въведение в дърветата. Двоични и n-арни дървета**                | [week07](./week07)    |
|  8. | **Двоично наредено дърво (BST)**                                  | [week08](./week08)    |
|  9. | **Итератори. Итератор на BST**                                    | [week09](./week09)    |
| 10. | **Балансирани дървета. AVL и червено-черни**                      | [week10](./week10)    |
| 11. | **Хеш таблици**                                                   | [week11](./week11)    |
| 12. | **Основно API за графи**                                          | [week12](./week12)    |
| 13. | **Тегловни графи. Най-къс път и минимално покриващо дърво**        | [week13](./week13)    |

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
