// *Definition for singly-linked list.
struct ListNode
{
    int val;
    ListNode *next;
    ListNode(int x, ListNode *next) : val(x), next(next) {}
};

#include <cassert>
#include <stack>
#include <vector>

bool isPalindrome(ListNode *head)
{
    if (!head || !head->next)
    {
        return true;
    }
    ListNode *fast = head, *slow = head;
    std::stack<int> s;
    bool odd = false;
    while (fast)
    {
        s.push(slow->val);
        slow = slow->next;
        fast = fast->next;
        if (fast)
        {
            fast = fast->next;
        }
        else
        {
            odd = true;
            break;
        }
    }
    std::stack<int> temp = s;

    if (odd)
    {
        s.pop();
    }

    while (slow)
    {
        if (slow->val != s.top())
        {
            return false;
        }
        s.pop();
        slow = slow->next;
    }
    return true;
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
    freeList(list);

    list = listOf({1, 2});
    assert(!isPalindrome(list));
    freeList(list);

    list = listOf({1, 2, 3, 2, 1});
    assert(isPalindrome(list));
    freeList(list);

    list = listOf({1, 2, 3});
    assert(!isPalindrome(list));
    freeList(list);

    list = listOf({7});
    assert(isPalindrome(list));
    freeList(list);

    list = listOf({1, 2, 3, 4, 2, 1});
    assert(!isPalindrome(list));
    freeList(list);

    assert(isPalindrome(nullptr));
}
