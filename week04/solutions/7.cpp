#include <cassert>
#include <vector>

//  Definition for singly-linked list.
struct ListNode
{
    int val;
    ListNode *next;
    ListNode(int x = 0, ListNode *next = nullptr) : val(x), next(next) {}
};

// int size(ListNode *head)
// {
//     int size = 0;
//     while (head)
//     {
//         size++;
//         head = head->next;
//     }
//     return size;
// }

// ListNode *removeNthFromEnd(ListNode *head, int n)
// {
//     ListNode *curr = head;
//     int sz = size(head);
//     if (sz == 1)
//     {
//         return nullptr;
//     }
//     if (n == sz)
//     {
//         return head->next;
//     }
//     if (n == 1)
//     {
//         while (curr->next->next)
//         {
//             curr = curr->next;
//         }
//         delete curr->next;
//         curr->next = nullptr;
//         return head;
//     }
//     while (sz - n > 1)
//     {
//         curr = curr->next;
//         n++;
//     }
//     ListNode *toBeDeleted = curr->next;
//     curr->next = curr->next->next;
//     delete toBeDeleted;
//     return head;
// }

// [1->2->3->4->5]
// 2
// One pass through
ListNode *removeNthFromEnd(ListNode *head, int n)
{
    ListNode dummyHead;
    ListNode *slow = &dummyHead, *fast = &dummyHead;
    dummyHead.next = head;
    for (int i = 0; i < n + 1; i++)
    {
        fast = fast->next;
    }
    while (fast)
    {
        slow = slow->next;
        fast = fast->next;
    }
    // delete the node
    ListNode *toBeDeleted = slow->next;
    slow->next = slow->next->next;
    delete toBeDeleted;

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
    std::vector<int> expected = {1, 2, 3, 5};
    ListNode *list = removeNthFromEnd(listOf({1, 2, 3, 4, 5}), 2);
    assert(equals(list, expected));
    freeList(list);

    assert(removeNthFromEnd(listOf({1}), 1) == nullptr);

    expected = {1};
    list = removeNthFromEnd(listOf({1, 2}), 1);
    assert(equals(list, expected));
    freeList(list);

    expected = {2, 3, 4, 5};
    list = removeNthFromEnd(listOf({1, 2, 3, 4, 5}), 5);
    assert(equals(list, expected));
    freeList(list);
}
