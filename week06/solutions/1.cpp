#include <cassert>
#include <vector>

//  Definition for singly-linked list.
struct ListNode
{
    int val;
    ListNode *next;
    ListNode(int x = 0, ListNode *next = nullptr) : val(x), next(next) {}
};

ListNode *reverseKGroup(ListNode *head, int k)
{
    ListNode *node = head;
    for (int i = 0; i < k; i++)
    {
        if (!node)
        {
            return head;
        }
        node = node->next;
    }

    ListNode *prev = reverseKGroup(node, k);
    ListNode *cur = head;
    for (int i = 0; i < k; i++)
    {
        ListNode *next = cur->next;
        cur->next = prev;
        prev = cur;
        cur = next;
    }

    return prev;
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
    ListNode *list = reverseKGroup(listOf({1, 2, 3, 4, 5}), 2);
    assert(equals(list, {2, 1, 4, 3, 5}));
    freeList(list);

    list = reverseKGroup(listOf({1, 2, 3, 4, 5}), 3);
    assert(equals(list, {3, 2, 1, 4, 5}));
    freeList(list);

    list = reverseKGroup(listOf({1, 2, 3, 4, 5}), 1);
    assert(equals(list, {1, 2, 3, 4, 5}));
    freeList(list);

    list = reverseKGroup(listOf({1}), 1);
    assert(equals(list, {1}));
    freeList(list);

    list = reverseKGroup(listOf({1, 2, 3, 4}), 2);
    assert(equals(list, {2, 1, 4, 3}));
    freeList(list);

    list = reverseKGroup(listOf({1, 2, 3, 4, 5}), 4);
    assert(equals(list, {4, 3, 2, 1, 5}));
    freeList(list);

    list = reverseKGroup(listOf({1, 2, 3, 4, 5}), 5);
    assert(equals(list, {5, 4, 3, 2, 1}));
    freeList(list);

    assert(reverseKGroup(nullptr, 2) == nullptr);
}
