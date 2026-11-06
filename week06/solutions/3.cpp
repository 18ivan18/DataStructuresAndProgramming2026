//  Definition for singly-linked list.
struct ListNode
{
    int val;
    ListNode *next;
    ListNode(int x = 0, ListNode *next = nullptr) : val(x), next(next) {}
};
#include <cassert>
#include <vector>

ListNode *removeZeroSumSublists(ListNode *head)
{
    ListNode dummyHead;
    dummyHead.next = head;
    ListNode *pre = &dummyHead;

    ListNode *pointer = head;
    ListNode *curr = pointer;

    int sum = 0, numberOfNodesInSequence = 0;
    bool hasDeleted = false;
    while (pointer)
    {
        sum = 0;
        curr = pointer;
        hasDeleted = false;
        numberOfNodesInSequence = 0;

        while (curr)
        {
            sum += curr->val;
            numberOfNodesInSequence++;
            if (sum == 0)
            {
                ListNode *toBeDeleted, *temp = pointer;

                pointer = curr->next;
                pre->next = pointer;

                for (int i = 0; i < numberOfNodesInSequence; i++)
                {
                    toBeDeleted = temp;
                    temp = temp->next;
                    delete toBeDeleted;
                }

                hasDeleted = true;
                break;
            }
            curr = curr->next;
        }
        if (!hasDeleted)
        {
            pointer = pointer->next;
            pre = pre->next;
        }
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
    ListNode *list = removeZeroSumSublists(listOf({1, 2, -3, 3, 1}));
    assert(equals(list, {3, 1}));
    freeList(list);

    list = removeZeroSumSublists(listOf({1, 2, 3, -3, 4}));
    assert(equals(list, {1, 2, 4}));
    freeList(list);

    list = removeZeroSumSublists(listOf({1, 2, 3, -3, -2}));
    assert(equals(list, {1}));
    freeList(list);

    assert(removeZeroSumSublists(listOf({1, -1})) == nullptr);

    list = removeZeroSumSublists(listOf({5, -3, -2, 4}));
    assert(equals(list, {4}));
    freeList(list);
}
