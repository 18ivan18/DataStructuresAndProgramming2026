#include <cassert>
#include <vector>

struct Node
{
    int val;
    Node *next;
    Node(int x = 0, Node *next = nullptr) : val(x), next(next) {}
};

Node *insert(Node *head, int insertValue)
{
    if (!head)
    {
        Node *node = new Node(insertValue);
        node->next = node;

        return node;
    }

    Node *prev = head, *curr = prev->next;
    while (curr != head)
    {
        if (prev->val <= insertValue && curr->val >= insertValue)
        {
            break;
        }
        if (prev->val > curr->val && (prev->val <= insertValue || curr->val >= insertValue))
        {
            break;
        }

        prev = curr;
        curr = curr->next;
    }
    prev->next = new Node(insertValue, curr);
    return head;
}

Node *cyclicListOf(const std::vector<int> &values)
{
    Node *head = nullptr, *tail = nullptr;

    for (size_t i = 0; i < values.size(); i++)
    {
        Node *node = new Node(values[i]);

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

    if (tail)
    {
        tail->next = head;
    }

    return head;
}

bool equals(Node *head, const std::vector<int> &expected)
{
    if (!head)
    {
        return expected.empty();
    }

    Node *current = head;

    for (size_t i = 0; i < expected.size(); i++)
    {
        if (current->val != expected[i])
        {
            return false;
        }

        current = current->next;
    }

    return current == head;
}

void freeCyclicList(Node *head)
{
    if (!head)
    {
        return;
    }

    Node *current = head->next;

    while (current != head)
    {
        Node *next = current->next;
        delete current;
        current = next;
    }

    delete head;
}

int main()
{
    Node *list = cyclicListOf({3, 4, 1});
    insert(list, 2);
    assert(equals(list, {3, 4, 1, 2}));
    freeCyclicList(list);

    list = cyclicListOf({3, 4, 1});
    insert(list, 5);
    assert(equals(list, {3, 4, 5, 1}));
    freeCyclicList(list);

    list = cyclicListOf({3, 4, 1});
    insert(list, 0);
    assert(equals(list, {3, 4, 0, 1}));
    freeCyclicList(list);

    list = cyclicListOf({1});
    insert(list, 2);
    assert(equals(list, {1, 2}));
    freeCyclicList(list);

    list = insert(nullptr, 7);
    assert(list != nullptr);
    assert(list->next == list);
    assert(equals(list, {7}));
    freeCyclicList(list);
}
