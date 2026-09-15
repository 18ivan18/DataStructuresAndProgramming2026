#include <iostream>
#include <vector>

int square(int x)
{
    return x * x;
}

void map(int *arr, size_t len, int (*operation)(int))
{
    for (size_t i = 0; i < len; i++)
    {
        arr[i] = operation(arr[i]);
    }
}

// Паметта се заделя тук, но се освобождава от извикващия
int *mapToNewArray(const int *arr, size_t len, int (*operation)(int))
{
    int *result = new int[len];

    for (size_t i = 0; i < len; i++)
    {
        result[i] = operation(arr[i]);
    }

    return result;
}

void map(std::vector<int> &v, int (*operation)(int))
{
    for (size_t i = 0; i < v.size(); i++)
    {
        v[i] = operation(v[i]);
    }
}

std::vector<int> mapToNewVector(const std::vector<int> &v, int (*operation)(int))
{
    size_t n = v.size();
    std::vector<int> result(n);

    for (size_t i = 0; i < n; i++)
    {
        result[i] = operation(v[i]);
    }

    return result;
}

void print(const int *arr, size_t len)
{
    for (size_t i = 0; i < len; i++)
    {
        std::cout << arr[i] << " ";
    }
    std::cout << '\n';
}

void print(const std::vector<int> &v)
{
    for (size_t i = 0; i < v.size(); i++)
    {
        std::cout << v[i] << " ";
    }
    std::cout << '\n';
}

int main()
{
    int arr[] = {1, 2, 3};
    size_t len = sizeof(arr) / sizeof(arr[0]);

    int *squared = mapToNewArray(arr, len, square);
    print(squared, len); // 1 4 9
    print(arr, len);     // 1 2 3 - старият масив е непроменен
    delete[] squared;

    map(arr, len, square);
    print(arr, len); // 1 4 9

    std::vector<int> v = {1, 2, 3};

    print(mapToNewVector(v, square)); // 1 4 9
    print(v);                         // 1 2 3 - старият вектор е непроменен

    map(v, square);
    print(v); // 1 4 9
}
