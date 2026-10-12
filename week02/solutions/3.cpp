#include <algorithm>
#include <cassert>
#include <stack>
class MinStack
{
public:
    // we can use only 1 stack <pair<int, int>>
    std::stack<int> st, minSt;

    MinStack()
    {
    }

    void push(int val)
    {
        st.push(val);
        if (minSt.empty())
        {
            minSt.push(val);
            return;
        }

        minSt.push(std::min(val, minSt.top()));
    }

    void pop()
    {
        st.pop();
        minSt.pop();
    }

    int top()
    {
        return st.top();
    }

    int getMin()
    {
        return minSt.top();
    }
};

int main()
{
    MinStack minStack;

    minStack.push(-2);
    minStack.push(0);
    minStack.push(-3);
    assert(minStack.getMin() == -3);

    minStack.pop();
    assert(minStack.top() == 0);
    assert(minStack.getMin() == -2);
}