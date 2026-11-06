#include <cassert>
#include <stack>
#include <vector>

template <typename T>
struct Node
{
    T data;
    Node<T> *next;

    Node(const T &data, Node<T> *next = nullptr) : data(data), next(next)
    {
    }
};

int quotaFor(int index, int base, int extra)
{
    return index < extra ? base + 1 : base;
}

void equalize(Node<std::stack<int>> *list)
{
    int count = 0;
    int total = 0;

    for (Node<std::stack<int>> *iter = list; iter; iter = iter->next)
    {
        count++;
        total += iter->data.size();
    }

    if (count == 0)
    {
        return;
    }

    int base = total / count;
    int extra = total % count;

    Node<std::stack<int>> *donor = list;
    Node<std::stack<int>> *receiver = list;
    int donorIndex = 0;
    int receiverIndex = 0;

    while (donor && receiver)
    {
        if ((int)donor->data.size() <= quotaFor(donorIndex, base, extra))
        {
            donor = donor->next;
            donorIndex++;
            continue;
        }

        if ((int)receiver->data.size() >= quotaFor(receiverIndex, base, extra))
        {
            receiver = receiver->next;
            receiverIndex++;
            continue;
        }

        receiver->data.push(donor->data.top());
        donor->data.pop();
    }
}

Node<std::stack<int>> *listOfStacks(const std::vector<std::vector<int>> &stacks)
{
    Node<std::stack<int>> *head = nullptr;
    Node<std::stack<int>> *tail = nullptr;

    for (size_t i = 0; i < stacks.size(); i++)
    {
        std::stack<int> stack;

        for (size_t j = 0; j < stacks[i].size(); j++)
        {
            stack.push(stacks[i][j]);
        }

        Node<std::stack<int>> *node = new Node<std::stack<int>>(stack);

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

bool equals(Node<std::stack<int>> *list, const std::vector<std::vector<int>> &expected)
{
    for (size_t i = 0; i < expected.size(); i++)
    {
        if (!list || list->data.size() != expected[i].size())
        {
            return false;
        }

        std::stack<int> stack = list->data;

        for (size_t j = expected[i].size(); j > 0; j--)
        {
            if (stack.top() != expected[i][j - 1])
            {
                return false;
            }

            stack.pop();
        }

        list = list->next;
    }

    return list == nullptr;
}

void freeList(Node<std::stack<int>> *list)
{
    while (list)
    {
        Node<std::stack<int>> *next = list->next;
        delete list;
        list = next;
    }
}

int main()
{
    Node<std::stack<int>> *list = listOfStacks({{5, 4, 3, 2, 1}, {7, 6}, {11, 10, 9, 8}, {12}});
    equalize(list);
    assert(equals(list, {{5, 4, 3}, {7, 6, 1}, {11, 10, 9}, {12, 2, 8}}));
    freeList(list);

    list = listOfStacks({{1, 2, 3}, {4}, {5}});
    equalize(list);

    for (Node<std::stack<int>> *iter = list; iter; iter = iter->next)
    {
        assert(iter->data.size() >= 1 && iter->data.size() <= 2);
    }

    freeList(list);

    list = listOfStacks({{1, 2}, {3, 4}});
    equalize(list);
    assert(equals(list, {{1, 2}, {3, 4}}));
    freeList(list);

    list = listOfStacks({{1, 2, 3, 4, 5}, {}, {}});
    equalize(list);

    for (Node<std::stack<int>> *iter = list; iter; iter = iter->next)
    {
        assert(iter->data.size() >= 1 && iter->data.size() <= 2);
    }

    freeList(list);

    equalize(nullptr);
}
