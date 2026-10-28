#include <cassert>
#include <vector>

//  Definition for singly-linked list.
struct ListNode
{
    int val;
    ListNode *next;
    ListNode(int x = 0, ListNode *next = nullptr) : val(x), next(next) {}
};

ListNode *merge(ListNode *left, ListNode *right)
{
    ListNode result;
    ListNode *curr = &result;
    while (left && right)
    {
        if (left->val > right->val)
        {
            curr->next = right;
            right = right->next;
        }
        else
        {
            curr->next = left;
            left = left->next;
        }
        curr = curr->next;
    }
    while (left)
    {
        curr->next = left;
        left = left->next;
        curr = curr->next;
    }
    while (right)
    {
        curr->next = right;
        curr = curr->next;
        right = right->next;
    }
    return result.next;
}

// Top Down Merge Sort
// Time: O(nlogn)
// Space: O(logn), where n is the number of nodes in linked list.
// Since the problem is recursive, we need additional space to store the recursive call stack.
// The maximum depth of the recursion tree is logn
ListNode *sortList(ListNode *head)
{
    if (!head || !head->next)
    {
        return head;
    }
    ListNode *fast = head, *slow = head, *temp = head;
    while (fast && fast->next)
    {
        fast = fast->next->next;
        temp = slow;
        slow = slow->next;
    }
    temp->next = nullptr;
    ListNode *left = sortList(head);
    ListNode *right = sortList(slow);
    return merge(left, right);
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
    std::vector<int> expected = {1, 2, 3, 4};
    ListNode *sorted = sortList(listOf({4, 2, 1, 3}));
    assert(equals(sorted, expected));
    freeList(sorted);

    expected = {-1, 0, 3, 4, 5};
    sorted = sortList(listOf({-1, 5, 3, 4, 0}));
    assert(equals(sorted, expected));
    freeList(sorted);

    assert(sortList(nullptr) == nullptr);

    expected = {7};
    sorted = sortList(listOf({7}));
    assert(equals(sorted, expected));
    freeList(sorted);

    expected = {1, 1, 2, 2};
    sorted = sortList(listOf({2, 1, 2, 1}));
    assert(equals(sorted, expected));
    freeList(sorted);
}
