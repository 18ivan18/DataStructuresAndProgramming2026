struct Node
{
    int data;
    Node *next;
};

void reverse(Node *&head, int m, int n)
{
    // base case
    if (m > n)
    {
        return;
    }

    Node *prev = nullptr; // the previous pointer
    Node *curr = head;    // the main pointer

    // 1. Skip the first `m` nodes
    for (int i = 0; curr != nullptr && i < m; i++)
    {
        prev = curr;
        curr = curr->next;
    }

    // `prev` now points to (m-1)'th node
    // `curr` now points to m'th node

    Node *start = curr;
    Node *end = nullptr;

    // 2. Traverse and reverse the sublist from position `m` to `n`
    for (int i = 1; curr != nullptr && i <= n - m + 1; i++)
    {
        // Take note of the next node
        Node *next = curr->next;

        // move the current node onto the `end`
        curr->next = end;
        end = curr;

        // move to the next node
        curr = next;
    }

    /*
        `start` points to the m'th node
        `end` now points to the n'th node
        `curr` now points to the (n+1)'th node
    */

    // 3. Fix the pointers and return the head node

    if (start)
    {
        start->next = curr;
        if (prev != nullptr)
        {
            prev->next = end;
        }
        // when m = 0, `prev` is nullptr
        else
        {
            // fix the head pointer to point to the new front
            head = end;
        }
    }
}

#include <cassert>
#include <vector>

Node *listOf(const std::vector<int> &values)
{
    Node *head = nullptr;

    for (size_t i = values.size(); i > 0; i--)
    {
        head = new Node{values[i - 1], head};
    }

    return head;
}

bool equals(Node *head, const std::vector<int> &expected)
{
    for (size_t i = 0; i < expected.size(); i++)
    {
        if (!head || head->data != expected[i])
        {
            return false;
        }

        head = head->next;
    }

    return head == nullptr;
}

void freeList(Node *head)
{
    while (head)
    {
        Node *next = head->next;
        delete head;
        head = next;
    }
}

int main()
{
    Node *list = listOf({1, 2, 3, 4, 5, 6, 7});
    reverse(list, 1, 4);
    assert(equals(list, {1, 5, 4, 3, 2, 6, 7}));
    freeList(list);

    list = listOf({1, 2, 3, 4, 5});
    reverse(list, 0, 4);
    assert(equals(list, {5, 4, 3, 2, 1}));
    freeList(list);

    list = listOf({1, 2, 3});
    reverse(list, 1, 1);
    assert(equals(list, {1, 2, 3}));
    freeList(list);

    list = listOf({1, 2, 3});
    reverse(list, 2, 1);
    assert(equals(list, {1, 2, 3}));
    freeList(list);

    list = nullptr;
    reverse(list, 0, 2);
    assert(list == nullptr);
}
