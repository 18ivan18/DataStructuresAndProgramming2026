#include <iostream>
#include <vector>

struct Node
{
    int value;
    std::vector<Node *> children;

    Node(int value) : value(value)
    {
    }
};

int countGifts(Node *node, std::vector<int> &gifts)
{
    int subordinates = 0;

    for (size_t i = 0; i < node->children.size(); i++)
    {
        subordinates += 1 + countGifts(node->children[i], gifts);
    }

    gifts[node->value] = subordinates;

    return subordinates;
}

int main()
{
    int n;
    std::cin >> n;

    if (n <= 0)
    {
        return 0;
    }

    std::vector<Node *> nodes(n);

    for (int i = 0; i < n; i++)
    {
        nodes[i] = new Node(i);
    }

    for (int i = 0; i < n - 1; i++)
    {
        int parent, child;
        std::cin >> parent >> child;
        nodes[parent]->children.push_back(nodes[child]);
    }

    std::vector<int> gifts(n, 0);
    countGifts(nodes[0], gifts);

    for (int i = 0; i < n; i++)
    {
        std::cout << gifts[i] << " ";
    }

    std::cout << '\n';

    for (int i = 0; i < n; i++)
    {
        delete nodes[i];
    }
}
