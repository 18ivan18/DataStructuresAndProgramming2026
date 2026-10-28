#include <cassert>
#include <vector>

//   Definition for singly-linked list.
struct ListNode
{
    int val;
    ListNode *next;
    ListNode(int x = 0, ListNode *next = nullptr) : val(x), next(next) {}
};

ListNode *addTwoNumbers(ListNode *l1, ListNode *l2)
{
    ListNode dummyHead;
    ListNode *curr = &dummyHead;
    bool carry = false;
    while (l1 || l2)
    {
        curr->next = new ListNode();
        curr = curr->next;
        int x = l1 ? l1->val : 0;
        int y = l2 ? l2->val : 0;
        curr->val = (x + y + carry) % 10;
        carry = (x + y + carry) / 10;
        if (l1)
        {
            l1 = l1->next;
        }
        if (l2)
        {
            l2 = l2->next;
        }
    }
    if (carry)
    {
        curr->next = new ListNode(1);
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
    ListNode *first = listOf({2, 4, 3});
    ListNode *second = listOf({5, 6, 4});
    std::vector<int> expected = {7, 0, 8};
    ListNode *sum = addTwoNumbers(first, second);
    assert(equals(sum, expected));
    freeList(first);
    freeList(second);
    freeList(sum);

    first = listOf({0});
    second = listOf({0});
    expected = {0};
    sum = addTwoNumbers(first, second);
    assert(equals(sum, expected));
    freeList(first);
    freeList(second);
    freeList(sum);

    first = listOf({9, 9, 9, 9, 9, 9, 9});
    second = listOf({9, 9, 9, 9});
    expected = {8, 9, 9, 9, 0, 0, 0, 1};
    sum = addTwoNumbers(first, second);
    assert(equals(sum, expected));
    freeList(first);
    freeList(second);
    freeList(sum);
}
