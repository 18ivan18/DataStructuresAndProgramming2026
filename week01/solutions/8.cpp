#include <functional>
#include <iostream>

int increment(int x)
{
    return x + 1;
}

int twice(int x)
{
    return x * 2;
}

int switchsumAt(int n, int x, int (*f)(int), int (*g)(int))
{
    int sum = 0;
    int term = x;

    for (int i = 0; i < n; i++)
    {
        term = i % 2 == 0 ? f(term) : g(term);
        sum += term;
    }

    return sum;
}

std::function<int(int)> switchsum(int n, int (*f)(int), int (*g)(int))
{
    return [n, f, g](int x)
    {
        return switchsumAt(n, x, f, g);
    };
}

int main()
{
    // f(x) = x + 1, g(x) = x * 2
    std::cout << switchsumAt(1, 2, increment, twice) << '\n'; // 3
    std::cout << switchsumAt(2, 2, increment, twice) << '\n'; // 9
    std::cout << switchsumAt(3, 2, increment, twice) << '\n'; // 16
    std::cout << switchsumAt(4, 2, increment, twice) << '\n'; // 30

    std::function<int(int)> sum4 = switchsum(4, increment, twice);
    std::cout << sum4(2) << '\n'; // 30
}
