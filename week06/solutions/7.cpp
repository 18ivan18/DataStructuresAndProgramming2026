#include <cassert>
#include <vector>

struct ListNode
{
    int val;
    ListNode *next;
    ListNode(int x = 0, ListNode *next = nullptr) : val(x), next(next) {}
};

void deleteList(ListNode *head)
{
    while (head)
    {
        ListNode *del = head;
        head = head->next;
        delete del;
    }
}

ListNode *partition(ListNode *head, int x)
{
    ListNode firstHalfHead, secondHalfHead, *firstHalf = &firstHalfHead,
                                            *secondHalf = &secondHalfHead;
    while (head)
    {
        if (head->val < x)
        {
            firstHalf->next = head;
            firstHalf = firstHalf->next;
        }
        else
        {
            secondHalf->next = head;
            secondHalf = secondHalf->next;
        }
        head = head->next;
    }
    firstHalf->next = secondHalfHead.next;
    secondHalf->next = nullptr;
    return firstHalfHead.next;
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

int main()
{
    ListNode *list = partition(listOf({1, 4, 3, 2, 5, 2}), 3);
    assert(equals(list, {1, 2, 2, 4, 3, 5}));
    deleteList(list);

    list = partition(listOf({2, 1}), 2);
    assert(equals(list, {1, 2}));
    deleteList(list);

    list = partition(listOf({1, 2, 3}), 10);
    assert(equals(list, {1, 2, 3}));
    deleteList(list);

    list = partition(listOf({1, 2, 3}), 0);
    assert(equals(list, {1, 2, 3}));
    deleteList(list);

    assert(partition(nullptr, 5) == nullptr);
}
