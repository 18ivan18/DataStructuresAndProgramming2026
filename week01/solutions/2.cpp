#include <iostream>

bool isDivisible(int x, int y)
{
    return y != 0 && x % y == 0;
}

size_t countPairs(const int *arr, size_t len, bool (*predicate)(int, int))
{
    size_t count = 0;

    for (size_t i = 0; i < len; i++)
    {
        for (size_t j = 0; j < len; j++)
        {
            if (i != j && predicate(arr[i], arr[j]))
            {
                count++;
            }
        }
    }

    return count;
}

int main()
{
    int arr[] = {2, 3, 4, 6};
    size_t len = sizeof(arr) / sizeof(arr[0]);

    // (4, 2), (6, 2), (6, 3) -> 3
    std::cout << countPairs(arr, len, isDivisible) << '\n';
}
