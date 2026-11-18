#include <cassert>
#include <vector>

int depthOf(const std::vector<int> &parent, int node)
{
    int depth = 0;

    while (parent[node] != -1)
    {
        node = parent[node];
        depth++;
    }

    return depth;
}

std::vector<int> pathToRoot(const std::vector<int> &parent, int node)
{
    std::vector<int> path;

    while (node != -1)
    {
        path.push_back(node);
        node = parent[node];
    }

    return path;
}

int lowestCommonAncestor(const std::vector<int> &parent, int u, int v)
{
    int depthU = depthOf(parent, u);
    int depthV = depthOf(parent, v);

    while (depthU > depthV)
    {
        u = parent[u];
        depthU--;
    }

    while (depthV > depthU)
    {
        v = parent[v];
        depthV--;
    }

    while (u != v)
    {
        u = parent[u];
        v = parent[v];
    }

    return u;
}

int main()
{
    std::vector<int> parent = {-1, 0, 0, 1, 1, 2, 4, 4};

    assert(depthOf(parent, 0) == 0);
    assert(depthOf(parent, 3) == 2);
    assert(depthOf(parent, 7) == 3);

    assert((pathToRoot(parent, 7) == std::vector<int>{7, 4, 1, 0}));
    assert((pathToRoot(parent, 3) == std::vector<int>{3, 1, 0}));
    assert((pathToRoot(parent, 0) == std::vector<int>{0}));

    assert(lowestCommonAncestor(parent, 3, 7) == 1);
    assert(lowestCommonAncestor(parent, 6, 7) == 4);
    assert(lowestCommonAncestor(parent, 3, 5) == 0);
    assert(lowestCommonAncestor(parent, 4, 7) == 4);
    assert(lowestCommonAncestor(parent, 7, 4) == 4);
    assert(lowestCommonAncestor(parent, 5, 5) == 5);
    assert(lowestCommonAncestor(parent, 0, 6) == 0);

    std::vector<int> chain = {-1, 0, 1, 2, 3};

    assert(depthOf(chain, 4) == 4);
    assert((pathToRoot(chain, 4) == std::vector<int>{4, 3, 2, 1, 0}));
    assert(lowestCommonAncestor(chain, 4, 2) == 2);
    assert(lowestCommonAncestor(chain, 0, 4) == 0);
}
