#include <cassert>
#include <set>
#include <vector>
//   Definition for singly-linked list.
struct ListNode
{
    int val;
    ListNode *next;
    ListNode(int x) : val(x), next(nullptr) {}
};
// space: O(N)
// time: O(N)
ListNode *detectCycle(ListNode *head)
{
    std::set<ListNode *> set;
    while (head)
    {
        if (set.find(head) != set.end())
        {
            return head;
        }
        set.insert(head);
        head = head->next;
    }
    return nullptr;
}

// space: O(1)
// time: O(N)
ListNode *detectCycleConstMemory(ListNode *head)
{
    ListNode *slow = head;
    ListNode *fast = head;
    // find the node that two pointers meet
    while (fast != nullptr)
    {
        slow = slow->next;
        if (fast->next == nullptr)
        {
            return nullptr;
        }
        fast = fast->next->next;
        if (slow == fast)
        {
            break;
        }
    }
    if (fast == nullptr)
    {
        return nullptr;
    }
    slow = head;
    // find the node where the cycle begins
    while (slow != fast)
    {
        slow = slow->next;
        fast = fast->next;
    }
    return fast;
}

ListNode *listWithCycle(const std::vector<int> &values, int pos, ListNode *&tail)
{
    ListNode *head = nullptr;
    ListNode *cycleStart = nullptr;
    tail = nullptr;

    for (size_t i = 0; i < values.size(); i++)
    {
        ListNode *node = new ListNode(values[i]);

        if (!head)
        {
            head = tail = node;
        }
        else
        {
            tail->next = node;
            tail = node;
        }

        if ((int)i == pos)
        {
            cycleStart = node;
        }
    }

    if (tail && cycleStart)
    {
        tail->next = cycleStart;
    }

    return head;
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
    ListNode *tail = nullptr;

    ListNode *list = listWithCycle({3, 2, 0, -4}, 1, tail);
    assert(detectCycle(list) != nullptr);
    assert(detectCycle(list)->val == 2);
    assert(detectCycleConstMemory(list) == detectCycle(list));
    tail->next = nullptr;
    freeList(list);

    list = listWithCycle({1, 2}, 0, tail);
    assert(detectCycle(list) != nullptr);
    assert(detectCycleConstMemory(list) != nullptr);
    tail->next = nullptr;
    freeList(list);

    list = listWithCycle({1}, -1, tail);
    assert(detectCycle(list) == nullptr);
    assert(detectCycleConstMemory(list) == nullptr);
    freeList(list);

    assert(detectCycle(nullptr) == nullptr);
    assert(detectCycleConstMemory(nullptr) == nullptr);
}
