#include <iostream>
#include <stack>
#include <queue>

struct Warrior
{
    int attack;
    int position;
    bool isAlive;
};

int main()
{
    int n;
    std::cin >> n;

    std::vector<Warrior> warriors(n);
    for (int i = 0; i < n; ++i)
    {
        std::cin >> warriors[i].attack;
        warriors[i].position = i;
        warriors[i].isAlive = true;
    }

    std::queue<Warrior *> negatives;
    std::stack<Warrior *> positives;

    bool hasPositive = false;
    for (int i = 0; i < (int)warriors.size(); i++)
    {
        if (warriors[i].attack < 0)
        {
            negatives.push(&warriors[i]);

            if (positives.empty())
            {
                negatives.pop();
            }

            if (!hasPositive)
            {
                continue;
            }

            for (int j = i + 1; j < (int)warriors.size(); ++j)
            {
                if (warriors[j].attack < 0)
                {
                    negatives.push(&warriors[j]);
                    i++;
                }
                else
                {
                    break;
                }
            }

            while (!positives.empty() && !negatives.empty())
            {
                Warrior *positive = positives.top();
                Warrior *negative = negatives.front();

                if (positive->attack == abs(negative->attack))
                {
                    positive->isAlive = false;
                    negative->isAlive = false;
                    positives.pop();
                    negatives.pop();
                }
                else if (positive->attack < abs(negative->attack))
                {
                    positive->isAlive = false;
                    positives.pop();
                }
                else
                {
                    negative->isAlive = false;
                    negatives.pop();
                }

                hasPositive = false;
            }

            while (!negatives.empty())
            {
                negatives.pop();
            }
        }
        else
        {
            positives.push(&warriors[i]);
            hasPositive = true;
        }
    }

    bool hasAliveWarriors = false;
    for (int i = 0; i < (int)warriors.size(); ++i)
    {
        if (warriors[i].isAlive)
        {
            hasAliveWarriors = true;
            std::cout << warriors[i].attack << " ";
        }
    }

    if (!hasAliveWarriors)
    {
        std::cout << std::endl;
    }
}