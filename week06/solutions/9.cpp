#include <cassert>
#include <vector>

struct ListNode
{
    int val;
    ListNode *next;
    ListNode(int x = 0, ListNode *next = nullptr) : val(x), next(next) {}
};

void shuffle(ListNode *&head)
{
    if (!head || !head->next)
    {
        return;
    }

    int length = 0;

    for (ListNode *iter = head; iter; iter = iter->next)
    {
        length++;
    }

    ListNode *firstHalfEnd = head;

    for (int i = 1; i < (length + 1) / 2; i++)
    {
        firstHalfEnd = firstHalfEnd->next;
    }

    ListNode *current = firstHalfEnd->next;
    firstHalfEnd->next = nullptr;

    ListNode *reversed = nullptr;

    while (current)
    {
        ListNode *next = current->next;
        current->next = reversed;
        reversed = current;
        current = next;
    }

    ListNode *reversedEnd = reversed;

    while (reversedEnd->next)
    {
        reversedEnd = reversedEnd->next;
    }

    reversedEnd->next = head;
    head = reversed;
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
    ListNode *list = listOf({1, 2, 3, 4, 5});
    shuffle(list);
    assert(equals(list, {5, 4, 1, 2, 3}));
    freeList(list);

    list = listOf({1, 2, 3, 4});
    shuffle(list);
    assert(equals(list, {4, 3, 1, 2}));
    freeList(list);

    list = listOf({1, 2, 3});
    shuffle(list);
    assert(equals(list, {3, 1, 2}));
    freeList(list);

    list = listOf({1, 2});
    shuffle(list);
    assert(equals(list, {2, 1}));
    freeList(list);

    list = listOf({1});
    shuffle(list);
    assert(equals(list, {1}));
    freeList(list);

    list = nullptr;
    shuffle(list);
    assert(list == nullptr);
}
