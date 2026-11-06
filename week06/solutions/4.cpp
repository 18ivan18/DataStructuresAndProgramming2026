#include <cassert>
#include <vector>

struct Node
{
    int val;
    Node *next;
    Node(int x = 0, Node *next = nullptr) : val(x), next(next) {}
};

Node *reverse(Node *head)
{
    Node *curr = head, *prev = nullptr, *next;
    while (curr)
    {
        next = curr->next;
        curr->next = prev;
        prev = curr;
        curr = next;
    }
    return prev;
}

// 1 -> 2  3 -> 4
// 1 -> 2  4 -> 3
// 1 -> 4 -> 2 -> 3
Node *reorderList(Node *head)
{
    Node *fast = head, *slow = head;
    while (fast && fast->next)
    {
        slow = slow->next;
        fast = fast->next->next;
    }
    Node *mid = slow;
    slow = slow->next;
    mid->next = nullptr;

    slow = reverse(slow);

    fast = head;

    while (slow)
    {
        Node *fastNext = fast->next, *slowNext = slow->next;
        fast->next = slow;
        slow->next = fastNext;
        fast = fastNext;
        slow = slowNext;
    }

    return head;
}

Node *listOf(const std::vector<int> &values)
{
    Node *head = nullptr;

    for (size_t i = values.size(); i > 0; i--)
    {
        head = new Node(values[i - 1], head);
    }

    return head;
}

bool equals(Node *head, const std::vector<int> &expected)
{
    for (size_t i = 0; i < expected.size(); i++)
    {
        if (!head || head->val != expected[i])
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
    Node *list = reorderList(listOf({1, 2, 3, 4}));
    assert(equals(list, {1, 4, 2, 3}));
    freeList(list);

    list = reorderList(listOf({1, 2, 3, 4, 5}));
    assert(equals(list, {1, 5, 2, 4, 3}));
    freeList(list);

    list = reorderList(listOf({1, 2}));
    assert(equals(list, {1, 2}));
    freeList(list);

    list = reorderList(listOf({1}));
    assert(equals(list, {1}));
    freeList(list);
}
