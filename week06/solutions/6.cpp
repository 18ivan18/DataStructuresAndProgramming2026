#include <cassert>
#include <vector>

//  Definition for singly-linked list.
struct ListNode
{
    int val;
    ListNode *next;
    ListNode(int x, ListNode *next) : val(x), next(next) {}
};

ListNode *oddEvenList(ListNode *head)
{
    if (!head)
    {
        return head;
    }
    ListNode *odd = head, *even = head->next, *evenHead = even;
    while (even && even->next)
    {
        odd->next = even->next;
        odd = odd->next;
        even->next = odd->next;
        even = even->next;
    }
    odd->next = evenHead;
    return head;
}

ListNode *listOf(const std::vector<int> &values)
{
    ListNode *head = nullptr;

    for (size_t i = values.size(); i > 0; i--)
    {
        head = new ListNode(values[i - 1], head);
    }

    return head;
}

bool equals(ListNode *head, const std::vector<int> &expected)
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

void freeList(ListNode *head)
{
    while (head)
    {
        ListNode *next = head->next;
        delete head;
        head = next;
    }
}

int main()
{
    ListNode *list = oddEvenList(listOf({1, 2, 3, 4, 5}));
    assert(equals(list, {1, 3, 5, 2, 4}));
    freeList(list);

    list = oddEvenList(listOf({2, 1, 3, 5, 6, 4, 7}));
    assert(equals(list, {2, 3, 6, 7, 1, 5, 4}));
    freeList(list);

    list = oddEvenList(listOf({1}));
    assert(equals(list, {1}));
    freeList(list);

    list = oddEvenList(listOf({1, 2}));
    assert(equals(list, {1, 2}));
    freeList(list);

    assert(oddEvenList(nullptr) == nullptr);
}
