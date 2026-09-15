#include <iostream>
#include <vector>

// Задача 5: reduce (foldl) - свива целия масив до една стойност.
// Една функция, а sum, product и max са само различни операции, подадени към нея.

int add(int a, int b)
{
    return a + b;
}

int multiply(int a, int b)
{
    return a * b;
}

int bigger(int a, int b)
{
    return a > b ? a : b;
}

int reduce(const int *arr, size_t len, int (*op)(int, int), int initial)
{
    int result = initial;

    for (size_t i = 0; i < len; i++)
    {
        result = op(result, arr[i]);
    }

    return result;
}

int reduce(const std::vector<int> &v, int (*op)(int, int), int initial)
{
    int result = initial;

    for (size_t i = 0; i < v.size(); i++)
    {
        result = op(result, v[i]);
    }

    return result;
}

int main()
{
    std::vector<int> v = {1, 2, 3, 4, 5};

    std::cout << reduce(v, add, 0) << '\n';      // 15
    std::cout << reduce(v, multiply, 1) << '\n'; // 120

    // За максимум няма неутрален елемент - започваме от първия елемент,
    // затова тук векторът задължително трябва да е непразен.
    std::cout << reduce(v, bigger, v[0]) << '\n'; // 5

    int arr[] = {1, 2, 3, 4, 5};
    size_t len = sizeof(arr) / sizeof(arr[0]);

    std::cout << reduce(arr, len, add, 0) << '\n'; // 15
}
