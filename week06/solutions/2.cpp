// *Definition for singly-linked list.
struct ListNode
{
    int val;
    ListNode *next;
    ListNode(int x, ListNode *next) : val(x), next(next) {}
};

#include <cassert>
#include <vector>

ListNode *reverse(ListNode *head)
{
    ListNode *prev = nullptr;
    while (head)
    {
        ListNode *next = head->next;
        head->next = prev;
        prev = head;
        head = next;
    }

    return prev;
}

bool isPalindrome(ListNode *head)
{
    ListNode *slow = head;
    ListNode *fast = head;
    while (fast && fast->next)
    {
        slow = slow->next;
        fast = fast->next->next;
    }

    ListNode *second = reverse(slow);
    bool result = true;
    for (ListNode *left = head, *right = second; right; left = left->next, right = right->next)
    {
        if (left->val != right->val)
        {
            result = false;
            break;
        }
    }
    reverse(second);

    return result;
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
    ListNode *list = listOf({1, 2, 2, 1});
    assert(isPalindrome(list));
    assert(equals(list, {1, 2, 2, 1}));
    freeList(list);

    list = listOf({1, 2});
    assert(!isPalindrome(list));
    freeList(list);

    list = listOf({1, 2, 3, 2, 1});
    assert(isPalindrome(list));
    assert(equals(list, {1, 2, 3, 2, 1}));
    freeList(list);

    list = listOf({1, 2, 3});
    assert(!isPalindrome(list));
    freeList(list);

    list = listOf({7});
    assert(isPalindrome(list));
    freeList(list);

    list = listOf({1, 2, 3, 4, 2, 1});
    assert(!isPalindrome(list));
    assert(equals(list, {1, 2, 3, 4, 2, 1}));
    freeList(list);

    assert(isPalindrome(nullptr));
}
