<div align="center">

# Седмица 1 — Преговор

**Указатели · Сложност (Big O) · Функции от по-висок ред**

[![C++](https://img.shields.io/badge/C%2B%2B-17%2B-00599C?logo=cplusplus&logoColor=white)](https://en.cppreference.com/)
[![Тема](https://img.shields.io/badge/тема-преговор-blue)](#)
[![Задачи](https://img.shields.io/badge/задачи-8-success)](#задачи)

</div>

### Как да компилирам примерите?

```bash
g++ -std=c++17 -Wall -Wextra pointers.cpp -o pointers && ./pointers
```

---

## Анализ на алгоритми

Да бъде **анализиран** даден алгоритъм означава да бъде доказано, че той е **коректен**, и ако е коректен, да бъде изчислено колко **ресурси ползва** — за всеки възможен вход — като ресурсите са основно **време** и **памет**.

> В този курс ще разглеждаме само втората част от анализа на алгоритми — **сложността**.

**„Сложност на алгоритъм“** е мярка за това **колко ресурси ползва този алгоритъм**. За какви ресурси става дума?

| Ресурс    | Какво искаме                          | „Качествен алгоритъм“ е такъв, който…      |
| :-------- | :------------------------------------ | :----------------------------------------- |
| **Време** | Алгоритмите ни да работят бързо       | …работи бързо върху _всички_ входове       |
| **Памет** | Алгоритмите ни да ползват малко памет | …ползва малко памет върху _всички_ входове |

**Сложността по време** е мярка, която ни казва как нараства времето за изпълнение на даден алгоритъм, когато големината на входа му клони към _безкрайност_.

**Сложността по памет** е мярка, която ни казва как нараства паметта, която даден алгоритъм ползва, когато големината на входа му клони към _безкрайност_.

Когато разглеждаме сложността по време, разглеждаме _три_ случая:

- Най-добър случай (**Best case**)
- Среден случай (**Average case**)
- Най-лош случай (**Worst case**)

<details>
<summary><b>Коя е най-ценната величина от трите?</b></summary>

<br>

**Средният случай!** ..._Но:_

- Средното време за работа обикновено се определя трудно.
- Затова ще се фокусираме върху времето за работа **в най-лошия случай**.

</details>

---

## Асимптотични означения

> Всяко означение е **множество от функции**. Затова коректният прочит на `f(n) = O(g(n))` е „_f принадлежи на множеството O(g)_“.

| Означение   | Име                    | Дефиниция                                                                                                                              |  Интуиция   |
| :---------- | :--------------------- | :------------------------------------------------------------------------------------------------------------------------------------- | :---------: |
| **Θ(g(n))** | Точна граница          | { f(n) \| ∃c<sub>1</sub>, c<sub>2</sub> > 0, ∃n<sub>0</sub> : ∀n ≥ n<sub>0</sub>, 0 ≤ c<sub>1</sub>.g(n) ≤ f(n) ≤ c<sub>2</sub>.g(n) } | f(n) ≈ g(n) |
| **O(g(n))** | Нестрога горна граница | { f(n) \| ∃c > 0, ∃n<sub>0</sub> : ∀n ≥ n<sub>0</sub>, 0 ≤ f(n) ≤ c.g(n) }                                                             | f(n) ≤ g(n) |
| **Ω(g(n))** | Нестрога долна граница | { f(n) \| ∃c > 0, ∃n<sub>0</sub> : ∀n ≥ n<sub>0</sub>, 0 ≤ c.g(n) ≤ f(n) }                                                             | f(n) ≥ g(n) |
| **o(g(n))** | Строга горна граница   | { f(n) \| ∀c > 0, ∃n<sub>0</sub> : ∀n ≥ n<sub>0</sub>, 0 ≤ f(n) < c.g(n) }                                                             | f(n) ≺ g(n) |
| **ω(g(n))** | Строга долна граница   | { f(n) \| ∀c > 0, ∃n<sub>0</sub> : ∀n ≥ n<sub>0</sub>, 0 ≤ c.g(n) < f(n) }                                                             | f(n) ≻ g(n) |

### Кои бяха основните сложности с примери?

| Big O                | Име          | Пример                                               |
| :------------------- | :----------- | :--------------------------------------------------- |
| **O(1)**             | Constant     | Odd or even number · Look-up table (on average)      |
| **O(log n)**         | Logarithmic  | Finding element in a sorted array with binary search |
| **O(n)**             | Linear       | Find max element in an unsorted array                |
| **O(n log n)**       | Linearithmic | Sorting elements in an array with merge sort         |
| **O(n<sup>2</sup>)** | Quadratic    | Duplicate elements in an array (naïve)               |
| **O(n<sup>3</sup>)** | Cubic        | 3 variables equation solver                          |
| **O(2<sup>n</sup>)** | Exponential  | Find all subsets                                     |
| **O(n!)**            | Factorial    | Find all permutations of a given set/string          |

### Защо ме вълнува сложността?

> Разликата между O(n log n) и O(n²) не е „малко по-бавно“ — при `n = 1 000 000` това е разликата между **20 секунди** и **12 дни**.

|         n |  O(1)   | O(log n) |  O(n)   | O(n log n) |  O(n²)  |   O(2<sup>n</sup>)   |        O(n!)         |
| --------: | :-----: | :------: | :-----: | :--------: | :-----: | :------------------: | :------------------: |
|         1 | < 1 sec | < 1 sec  | < 1 sec |  < 1 sec   | < 1 sec |       < 1 sec        |       < 1 sec        |
|        10 | < 1 sec | < 1 sec  | < 1 sec |  < 1 sec   | < 1 sec |       < 1 sec        |        4 sec         |
|       100 | < 1 sec | < 1 sec  | < 1 sec |  < 1 sec   | < 1 sec | 40170 trillion years | > vigintillion years |
|     1,000 | < 1 sec | < 1 sec  | < 1 sec |  < 1 sec   | < 1 sec | > vigintillion years |  > centillion years  |
|    10,000 | < 1 sec | < 1 sec  | < 1 sec |  < 1 sec   |  2 min  |  > centillion years  |  > centillion years  |
|   100,000 | < 1 sec | < 1 sec  | < 1 sec |   1 sec    | 3 hours |  > centillion years  |  > centillion years  |
| 1,000,000 | < 1 sec | < 1 sec  |  1 sec  |   20 sec   | 12 days |  > centillion years  |  > centillion years  |

Примери за анализ на конкретни функции: [`complexity.cpp`](./complexity.cpp)

---

## Указатели

> **Указател** е променлива, която приема за стойност адрес в паметта.

Указателите имат фиксирана големина. Тъй като те също са променливи, заделени на стека, те също имат адрес. Затова можем да декларираме **указател към указател**, т.е. указател, който сочи към адреса на променлива от тип указател.

```cpp
int foo = 5;
int *pFoo = &foo;    // & operator takes the address of a variable
int **ppFoo = &pFoo;
```

Можем да **дереференцираме** указател (т.е. да достъпим стойността на променливата, към която сочи) с оператора `*`.

```cpp
int *pFoo = *ppFoo;
int foo = *pFoo;
int bar = **ppFoo;
```

### Динамична памет

Указателите са основата на динамичното заделяне на памет. Когато използваме оператор `new`, ние получаваме адрес към новозаделената памет. Наша работа е да се погрижим за тази памет, като я запазим в променлива.

```cpp
int *i = new int();
int *i = new int(5);
int *i = new int{5};
int *i = new int[5];
```

> Всяко `new` иска `delete`, а всяко `new[]` иска `delete[]`.

Едно място в паметта може да се достъпва чрез няколко указателя:

```cpp
int *i = new int(), *i1 = i;
```

### Защо ми трябват указатели при подаване на аргументи?

```cpp
void swap(int first, int second) {
    int firstCopy = first;
    first = second;
    second = firstCopy;
}
```

> Горният фрагмент код **не работи правилно**, защото аргументите на функцията са подадени по стойност.

Това означава, че се създават две локални за функцията променливи с имена `first` и `second`, които приемат подадените им стойности. Разменяме техните стойности и след изпълнение на функцията стойностите на подадените аргументи остават същите. Това лесно може да се промени, ако ги подадем чрез указатели.

Пълен пример: [`pointers.cpp`](./pointers.cpp)

---

## Функции от по-висок ред

**Функциите от по-висок ред** са функции, които приемат функции като аргумент или връщат функции като резултат. Използват се във функционалните езици за програмиране (какъвто C++ не е, но поддържа доста от функционалностите — например ламбда функции и `std::function`).

### Как? — с указател към функция

```cpp
void myIntFunc(int x)
{
    std::cout << x << std::endl;
}

int main()
{
    void (*foo)(int);
    /* the ampersand is actually optional */
    foo = &myIntFunc;

    /* call myIntFunc (note that you do not need to write (*foo)(2)) */
    foo(2);
    /* but if you want to, you may */
    (*foo)(2);
}
```

### А как ги подавам на други функции като параметър?

```cpp
int resultOfCalculation(int (*op)(int, int),
                        int x, int y)
{
    return (*op)(x, y);
}

int add(int a, int b)  { return a + b; }
int mult(int a, int b) { return a * b; }

int main()
{
    int (*addPtr)(int, int);
    addPtr = &add;

    int sum  = resultOfCalculation(addPtr, 1, 2);
    int prod = resultOfCalculation(mult, 1, 2);
}
```

> Можем да използваме името на някоя функция като указател към нея — `&` не е задължителен.

Пълен пример: [`functions.cpp`](./functions.cpp)

### `std::function` от `<functional>`

<details>
<summary>Голям пример от <a href="https://en.cppreference.com/w/cpp/utility/functional/function">cppreference</a> — кликни, за да разгънеш</summary>

```cpp
#include <functional>
#include <iostream>

struct Foo {
    Foo(int num) : num_(num) {}
    void print_add(int i) const { std::cout << num_ + i << '\n'; }
    int num_;
};

void print_num(int i)
{
    std::cout << i << '\n';
}

struct PrintNum {
    void operator()(int i) const
    {
        std::cout << i << '\n';
    }
};

int main()
{
    // store a free function
    std::function<void(int)> f_display = print_num;
    f_display(-9);

    // store a lambda
    std::function<void()> f_display_42 = []() { print_num(42); };
    f_display_42();

    // store the result of a call to std::bind
    std::function<void()> f_display_31337 = std::bind(print_num, 31337);
    f_display_31337();

    // store a call to a member function
    std::function<void(const Foo&, int)> f_add_display = &Foo::print_add;
    const Foo foo(314159);
    f_add_display(foo, 1);
    f_add_display(314159, 1);

    // store a call to a data member accessor
    std::function<int(Foo const&)> f_num = &Foo::num_;
    std::cout << "num_: " << f_num(foo) << '\n';

    // store a call to a member function and object
    using std::placeholders::_1;
    std::function<void(int)> f_add_display2 = std::bind(&Foo::print_add, foo, _1);
    f_add_display2(2);

    // store a call to a member function and object ptr
    std::function<void(int)> f_add_display3 = std::bind(&Foo::print_add, &foo, _1);
    f_add_display3(3);

    // store a call to a function object
    std::function<void(int)> f_display_obj = PrintNum();
    f_display_obj(18);

    auto factorial = [](int n) {
        // store a lambda object to emulate "recursive lambda"; aware of extra overhead
        std::function<int(int)> fac = [&](int n) { return (n < 2) ? 1 : n * fac(n - 1); };
        // note that "auto fac = [&](int n){...};" does not work in recursive calls
        return fac(n);
    };
    for (int i{5}; i != 8; ++i) { std::cout << i << "! = " << factorial(i) << ";  "; }
}
```

</details>

### Кои са основните функции от по-висок ред, които правят живота ни по-лесен?

| Функция                | Какво приема                                  | Какво връща                                               |
| :--------------------- | :-------------------------------------------- | :-------------------------------------------------------- |
| **`map`**              | вектор + едноместна функция                   | нов вектор с приложената функция върху всеки елемент      |
| **`filter`**           | вектор + едноместен предикат                  | нов вектор само с елементите, за които предикатът е верен |
| **`reduce`** (`foldl`) | вектор + двуместна функция + начална стойност | една акумулирана стойност                                 |

<table>
<tr><th>map</th><th>filter</th><th>reduce (foldl)</th></tr>
<tr valign="top">
<td>

```text
Input:  [1,2,3] square
Output: [1,4,9]
```

</td>
<td>

```text
Input:  [1,2,3] isEven
Output: [2]
```

</td>
<td>

```text
Input:  [1,2,3] + 0
Output: (((0 + 1) + 2) + 3)

Input:  [1,2,3] append ""
Output: ((("" + "1") + "2") + "3")
```

</td>
</tr>
</table>

---

# Задачи

### Задача 1

Да се напише функция, която приема като аргумент масив от цели числа, броя на елементите и друга функция — `next(i)` (тя приема едно число и връща числото, което е с 3 по-голямо от подаденото), и връща сумата на елементите, които се намират на индекси, получени чрез прилагане на `next` върху предишните индекси (в примера — кратни на `3`, индексите започват от `0`).

$\sum_{i=0, next(i)}^{n} arr[i]$

> Реализирайте сами функцията `next` и я използвайте в другата функция!

### Задача 2

Да се напише функция, която приема като аргумент масив от цели числа, броя на числата и двуаргументна булева функция `isDivisible(x, y)` (проверява дали `x` се дели на `y` без остатък), и връща броя на всички двойки числа от масива, отговарящи на това условие.

> Реализирайте сами функцията `isDivisible` и я използвайте в другата функция!

### Задача 3

Да се напише функция `map`, която приема като аргументи масив от цели числа, неговата размерност и едноаргументна функция `operation`, и прилага функцията `operation` върху всеки един елемент на масива.

> Да се реализира и втори път като функция, която **връща нов масив**, вместо да променя елементите на стария.

### Задача 4

Да се напише функция `filter`, която приема като аргументи масив от цели числа, неговата размерност и едноаргументен предикат, и връща нов масив с елементите от масива, отговарящи на предиката.

> Да се измисли механизъм за връщане на големината на филтрирания масив.

### Задача 5

Да се напише функция `reduce` (позната още като `foldl`), която приема като аргументи масив от цели числа, неговата размерност, двуаргументна функция `operation` и начална стойност, и свива масива до една стойност.

Чрез нея да се реализират `sum`, `product` и `max` — **без да се пипа тялото на `reduce`**.

```text
Input:  [1,2,3,4,5]  add       0  ->  15
Input:  [1,2,3,4,5]  multiply  1  ->  120
Input:  [1,2,3,4,5]  bigger    1  ->  5
```

> Каква е началната стойност за `max` и защо тя е по-особена от тази за `sum` и `product`?

### Задача 6

Да се напише функция `compose`, която приема като аргументи едноаргументна функция от тип `double` и цяло число `n`, и връща композицията на функцията `n` пъти.

### Задача 7

Да се напише функция, която приема масив от низове, броя на низовете и булева двуместна функция, която има за аргументи два низа. Функцията да извежда на екрана низовете, подредени според наредбата, зададена от двуместната функция.

**Пример:**

```text
Input:   4          Output:  eating
         i                   i
         love                love
         eating              pizza
         pizza
```

### Задача 8

Ако `f` и `g` са числови функции и `n` е естествено число, да се дефинира функция от по-висок ред `switchsum(n, x, f, g)`, която връща като резултат функция, чиято стойност в дадена точка `x` е равна на `f(x) + g(f(x)) + f(g(f(x))) + ...` (сумата включва `n` събираеми).

**Пример:**

```text
f(x) = x + 1
g(x) = x * 2

switchsum(1, 2, f, g) → 3
switchsum(2, 2, f, g) → 9
switchsum(3, 2, f, g) → 16
switchsum(4, 2, f, g) → 30
```
