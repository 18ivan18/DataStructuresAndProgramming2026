#include <algorithm>
#include <cassert>
#include <queue>
#include <stack>
#include <vector>

bool canParade(std::queue<int> arriving)
{
    std::stack<int> side;
    int next = 1;

    while (!arriving.empty() || !side.empty())
    {
        if (!side.empty() && side.top() == next)
        {
            side.pop();
            next++;
        }
        else if (!arriving.empty())
        {
            side.push(arriving.front());
            arriving.pop();
        }
        else
        {
            return false;
        }
    }

    return true;
}

std::queue<int> queueOf(const std::vector<int> &values)
{
    std::queue<int> result;

    for (size_t i = 0; i < values.size(); i++)
    {
        result.push(values[i]);
    }

    return result;
}

bool avoids231(const std::vector<int> &a)
{
    for (size_t i = 0; i < a.size(); i++)
    {
        for (size_t j = i + 1; j < a.size(); j++)
        {
            for (size_t k = j + 1; k < a.size(); k++)
            {
                if (a[k] < a[i] && a[i] < a[j])
                {
                    return false;
                }
            }
        }
    }

    return true;
}

int main()
{
    assert(canParade(queueOf({5, 1, 2, 4, 3})));
    assert(!canParade(queueOf({2, 3, 1})));
    assert(canParade(queueOf({1, 2, 3, 4, 5})));
    assert(canParade(queueOf({5, 4, 3, 2, 1})));
    assert(canParade(queueOf({3, 1, 2})));
    assert(!canParade(queueOf({2, 4, 1, 3})));
    assert(canParade(queueOf({1})));
    assert(canParade(queueOf({})));

    for (int n = 1; n <= 7; n++)
    {
        std::vector<int> a(n);

        for (int i = 0; i < n; i++)
        {
            a[i] = i + 1;
        }

        do
        {
            assert(canParade(queueOf(a)) == avoids231(a));
        } while (std::next_permutation(a.begin(), a.end()));
    }
}
