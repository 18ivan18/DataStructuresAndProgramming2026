#include <iostream>
#include <vector>

bool isEven(int x)
{
    return x % 2 == 0;
}

int *filter(const int *arr, size_t len, bool (*predicate)(int), size_t &resultLen)
{
    resultLen = 0;

    // първо обхождане - колко елемента ще останат
    for (size_t i = 0; i < len; i++)
    {
        if (predicate(arr[i]))
        {
            resultLen++;
        }
    }

    int *result = new int[resultLen];

    // второ обхождане - попълваме новия масив
    size_t j = 0;
    for (size_t i = 0; i < len; i++)
    {
        if (predicate(arr[i]))
        {
            result[j++] = arr[i];
        }
    }

    return result;
}

std::vector<int> filter(const std::vector<int> &v, bool (*predicate)(int))
{
    std::vector<int> result;

    for (size_t i = 0; i < v.size(); i++)
    {
        if (predicate(v[i]))
        {
            result.push_back(v[i]);
        }
    }

    return result;
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
    int arr[] = {1, 2, 3, 4, 5, 6};
    size_t len = sizeof(arr) / sizeof(arr[0]);

    size_t filteredLen = 0;
    int *filtered = filter(arr, len, isEven, filteredLen);

    // 2 4 6
    for (size_t i = 0; i < filteredLen; i++)
    {
        std::cout << filtered[i] << " ";
    }
    std::cout << '\n';

    delete[] filtered;

    std::vector<int> v = {1, 2, 3, 4, 5, 6};

    print(filter(v, isEven)); // 2 4 6
    print(v);                 // 1 2 3 4 5 6 - старият вектор е непроменен
}
