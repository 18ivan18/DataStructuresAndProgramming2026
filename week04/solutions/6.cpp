#include <cassert>
#include <vector>

struct ListNode
{
    int val;
    ListNode *next;
    ListNode(int x) : val(x), next(nullptr) {}
};

void deleteNode(ListNode *node)
{

    node->val = node->next->val;
    // 4 -> 1 -> 1 -> 9
    //      |
    //     node
    ListNode *tmp = node->next;
    node->next = node->next->next;
    // 4 -> 1 -> 9
    //      |
    //     node
    delete tmp;
}

ListNode *listOf(const std::vector<int> &values)
{
    ListNode *head = nullptr, *tail = nullptr;

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
    }

    return head;
}

ListNode *nodeAt(ListNode *head, int index)
{
    while (index--)
    {
        head = head->next;
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
    ListNode *list = listOf({4, 5, 1, 9});
    deleteNode(nodeAt(list, 1));
    std::vector<int> expected = {4, 1, 9};
    assert(equals(list, expected));
    freeList(list);

    list = listOf({4, 5, 1, 9});
    deleteNode(nodeAt(list, 2));
    expected = {4, 5, 9};
    assert(equals(list, expected));
    freeList(list);

    list = listOf({0, 1});
    deleteNode(nodeAt(list, 0));
    expected = {1};
    assert(equals(list, expected));
    freeList(list);
}
