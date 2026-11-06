#include <cassert>
#include <vector>

struct Node
{
    int data;
    Node *next;
    Node *previous;

    Node(int data = 0) : data(data), next(nullptr), previous(nullptr)
    {
    }
};

void swapNodes(Node *&head, Node *first, Node *second)
{
    if (!first || !second || first == second)
    {
        return;
    }

    Node *firstPrevious = first->previous;
    Node *firstNext = first->next;
    Node *secondPrevious = second->previous;
    Node *secondNext = second->next;

    if (firstNext == second)
    {
        second->previous = firstPrevious;
        second->next = first;
        first->previous = second;
        first->next = secondNext;
    }
    else if (secondNext == first)
    {
        first->previous = secondPrevious;
        first->next = second;
        second->previous = first;
        second->next = firstNext;
    }
    else
    {
        first->previous = secondPrevious;
        first->next = secondNext;
        second->previous = firstPrevious;
        second->next = firstNext;
    }

    if (first->previous)
    {
        first->previous->next = first;
    }

    if (first->next)
    {
        first->next->previous = first;
    }

    if (second->previous)
    {
        second->previous->next = second;
    }

    if (second->next)
    {
        second->next->previous = second;
    }

    if (head == first)
    {
        head = second;
    }
    else if (head == second)
    {
        head = first;
    }
}

Node *listOf(const std::vector<int> &values)
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
            node->previous = tail;
            tail->next = node;
            tail = node;
        }
    }

    return head;
}

Node *nodeAt(Node *head, int index)
{
    while (index--)
    {
        head = head->next;
    }

    return head;
}

bool equals(Node *head, const std::vector<int> &expected)
{
    Node *tail = nullptr;

    for (size_t i = 0; i < expected.size(); i++)
    {
        if (!head || head->data != expected[i])
        {
            return false;
        }

        tail = head;
        head = head->next;
    }

    if (head != nullptr)
    {
        return false;
    }

    for (size_t i = expected.size(); i > 0; i--)
    {
        if (!tail || tail->data != expected[i - 1])
        {
            return false;
        }

        tail = tail->previous;
    }

    return tail == nullptr;
}

void freeList(Node *head)
{
    while (head)
    {
        Node *next = head->next;
        delete head;
        head = next;
    }
}

int main()
{
    Node *list = listOf({1, 2, 3, 4, 5});
    swapNodes(list, nodeAt(list, 1), nodeAt(list, 3));
    assert(equals(list, {1, 4, 3, 2, 5}));
    freeList(list);

    list = listOf({1, 2, 3, 4});
    swapNodes(list, nodeAt(list, 1), nodeAt(list, 2));
    assert(equals(list, {1, 3, 2, 4}));
    freeList(list);

    list = listOf({1, 2, 3, 4});
    swapNodes(list, nodeAt(list, 2), nodeAt(list, 1));
    assert(equals(list, {1, 3, 2, 4}));
    freeList(list);

    list = listOf({1, 2, 3, 4});
    swapNodes(list, nodeAt(list, 0), nodeAt(list, 3));
    assert(equals(list, {4, 2, 3, 1}));
    freeList(list);

    list = listOf({1, 2, 3, 4});
    swapNodes(list, nodeAt(list, 0), nodeAt(list, 1));
    assert(equals(list, {2, 1, 3, 4}));
    freeList(list);

    list = listOf({1, 2, 3, 4});
    swapNodes(list, nodeAt(list, 2), nodeAt(list, 3));
    assert(equals(list, {1, 2, 4, 3}));
    freeList(list);

    list = listOf({1, 2});
    swapNodes(list, nodeAt(list, 0), nodeAt(list, 1));
    assert(equals(list, {2, 1}));
    freeList(list);

    list = listOf({1, 2, 3});
    swapNodes(list, nodeAt(list, 1), nodeAt(list, 1));
    assert(equals(list, {1, 2, 3}));
    freeList(list);

    list = listOf({7});
    swapNodes(list, list, list);
    assert(equals(list, {7}));
    freeList(list);

    list = listOf({1, 2, 3});
    swapNodes(list, nodeAt(list, 0), nullptr);
    assert(equals(list, {1, 2, 3}));
    freeList(list);
}
