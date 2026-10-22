#include <cassert>
#include <queue>
class MyStack
{
    std::queue<int> q;

public:
    MyStack()
    {
    }

    /** Push element x onto stack. */
    void push(int x)
    {
        q.push(x);
        int size = q.size();
        while (size > 1)
        {
            int item = q.front();
            q.pop();
            q.push(item);
            size--;
        }
    }

    /** Removes the element on top of the stack and returns that element. */
    int pop()
    {
        int t = top();
        q.pop();
        return t;
    }

    /** Get the top element. */
    int top()
    {
        return q.front();
    }

    /** Returns whether the stack is empty. */
    bool empty()
    {
        return q.empty();
    }
};

int main()
{
    MyStack myStack;

    myStack.push(1);
    myStack.push(2);

    assert(myStack.top() == 2);
    assert(myStack.pop() == 2);
    assert(!myStack.empty());

    assert(myStack.pop() == 1);
    assert(myStack.empty());
}
