#include <cassert>
#include <queue>

class FrontMiddleBackQueue
{
    int size;
    std::deque<int> left, right;

    // adjusts itself such that left.size() >= right.size()
    void adjust()
    {
        int diff = size & 1; // either 1 or 0
        while (left.size() > (diff + right.size()))
        {
            int val = left.back();
            left.pop_back();
            right.push_front(val);
        }
        while (left.size() < (diff + right.size()))
        {
            int val = right.front();
            right.pop_front();
            left.push_back(val);
        }
    }

public:
    FrontMiddleBackQueue() : size(0)
    {
    }

    void pushFront(int val)
    {
        adjust();
        left.push_front(val);
        size++;
        adjust();
    }

    void pushMiddle(int val)
    {
        adjust();
        if (size & 1)
        {
            int val = left.back();
            left.pop_back();
            right.push_front(val);
        }
        left.push_back(val);
        size++;
        adjust();
    }

    void pushBack(int val)
    {
        adjust();
        right.push_back(val);
        size++;
        adjust();
    }

    int popFront()
    {
        if (size == 0)
        {
            return -1;
        }
        adjust();
        int val = left.front();
        left.pop_front();
        size--;
        adjust();
        return val;
    }

    int popMiddle()
    {
        if (size == 0)
        {
            return -1;
        }
        adjust();
        int val = left.back();
        left.pop_back();
        size--;
        adjust();
        return val;
    }

    int popBack()
    {
        if (size == 0)
        {
            return -1;
        }
        if (size == 1)
        {
            adjust();
            int val = left.back();
            left.pop_back();
            size--;
            adjust();
            return val;
        }
        adjust();
        int val = right.back();
        right.pop_back();
        size--;
        adjust();
        return val;
    }
};

int main()
{
    FrontMiddleBackQueue q;

    q.pushFront(1);   // [1]
    q.pushBack(2);    // [1, 2]
    q.pushMiddle(3);  // [1, 3, 2]
    q.pushMiddle(4);  // [1, 4, 3, 2]

    assert(q.popFront() == 1);   // [4, 3, 2]
    assert(q.popMiddle() == 3);  // [4, 2]
    assert(q.popMiddle() == 4);  // [2]
    assert(q.popBack() == 2);    // []
    assert(q.popFront() == -1);  // празна опашка
}
