#include <cassert>
#include <vector>
// Definition for singly-linked list.
struct ListNode
{
    int val;
    ListNode *next;
    ListNode(int x = 0, ListNode *next = nullptr) : val(x), next(next) {}
};

ListNode *mergeTwoLists(ListNode *l1, ListNode *l2)
{
    ListNode dummyHead;
    ListNode *curr = &dummyHead;
    while (l1 || l2)
    {
        if (!l1)
        {
            curr->next = l2;
            l2 = l2->next;
        }
        else if (!l2)
        {
            curr->next = l1;
            l1 = l1->next;
        }
        else
        {
            if (l1->val > l2->val)
            {
                curr->next = l2;
                l2 = l2->next;
            }
            else
            {
                curr->next = l1;
                l1 = l1->next;
            }
        }
        curr = curr->next;
    }

    return dummyHead.next;
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
    std::vector<int> expected = {1, 1, 2, 3, 4, 4};
    ListNode *merged = mergeTwoLists(listOf({1, 2, 4}), listOf({1, 3, 4}));
    assert(equals(merged, expected));
    freeList(merged);

    assert(mergeTwoLists(nullptr, nullptr) == nullptr);

    expected = {0};
    merged = mergeTwoLists(nullptr, listOf({0}));
    assert(equals(merged, expected));
    freeList(merged);

    expected = {1, 2, 3, 4, 5, 6};
    merged = mergeTwoLists(listOf({1, 2, 3}), listOf({4, 5, 6}));
    assert(equals(merged, expected));
    freeList(merged);
}
