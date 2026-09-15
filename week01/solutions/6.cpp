#include <functional>
#include <iostream>

double half(double x)
{
    return x / 2;
}

double composeAt(double (*f)(double), int n, double x)
{
    for (int i = 0; i < n; i++)
    {
        x = f(x);
    }

    return x;
}

// std::function може да пази състояние, затова връщаме истинска функция.
std::function<double(double)> compose(double (*f)(double), int n)
{
    return [f, n](double x)
    {
        for (int i = 0; i < n; i++)
        {
            x = f(x);
        }

        return x;
    };
}

int main()
{
    std::cout << composeAt(half, 3, 80) << '\n'; // 10

    std::function<double(double)> halfThreeTimes = compose(half, 3);
    std::cout << halfThreeTimes(80) << '\n'; // 10
    std::cout << halfThreeTimes(8) << '\n';  // 1
}
