#include <iostream>

size_t next(size_t i)
{
    return i + 3;
}

int sumOnIndices(const int *arr, size_t len, size_t (*next)(size_t))
{
    int sum = 0;

    for (size_t i = 0; i < len; i = next(i))
    {
        sum += arr[i];
    }

    return sum;
}

int main()
{
    int arr[] = {1, 2, 3, 4, 5, 6, 7, 8};
    size_t len = sizeof(arr) / sizeof(arr[0]);

    // indices 0, 3, 6 -> 1 + 4 + 7 = 12
    std::cout << sumOnIndices(arr, len, next) << '\n';
}
