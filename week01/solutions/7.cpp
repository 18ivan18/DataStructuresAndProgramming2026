#include <iostream>
#include <string>
#include <vector>

// Задача 6: подрежда низовете според наредбата, зададена от предиката.
// Сортирането и извеждането са разделени в две отделни функции.

bool lexicographically(const std::string &lhs, const std::string &rhs)
{
    return lhs < rhs;
}

bool byLength(const std::string &lhs, const std::string &rhs)
{
    return lhs.length() < rhs.length();
}

std::vector<std::string> sorted(const std::vector<std::string> &strings,
                                bool (*comesBefore)(const std::string &, const std::string &))
{
    std::vector<std::string> result = strings;

    for (size_t i = 0; i < result.size(); i++)
    {
        size_t minIndex = i;

        for (size_t j = i + 1; j < result.size(); j++)
        {
            if (comesBefore(result[j], result[minIndex]))
            {
                minIndex = j;
            }
        }

        std::swap(result[i], result[minIndex]);
    }

    return result;
}

void print(const std::vector<std::string> &strings)
{
    for (size_t i = 0; i < strings.size(); i++)
    {
        std::cout << strings[i] << '\n';
    }
}

int main()
{
    std::vector<std::string> strings = {"i", "love", "eating", "pizza"};

    // eating i love pizza
    print(sorted(strings, lexicographically));
    std::cout << '\n';

    // i love pizza eating
    print(sorted(strings, byLength));
    std::cout << '\n';

    // оригиналният вектор е непроменен
    print(strings);
}
