#include <cassert>
#include <queue>
#include <vector>

struct TreeNode
{
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode(int x = 0, TreeNode *left = nullptr, TreeNode *right = nullptr) : val(x), left(left), right(right) {}
};

std::vector<std::vector<int>> zigzagLevelOrder(TreeNode *root)
{
    std::vector<std::vector<int>> result;

    if (!root)
    {
        return result;
    }

    std::queue<TreeNode *> q;
    q.push(root);
    bool leftToRight = true;

    while (!q.empty())
    {
        int levelSize = q.size();
        std::vector<int> level(levelSize);

        for (int i = 0; i < levelSize; i++)
        {
            TreeNode *node = q.front();
            q.pop();

            level[leftToRight ? i : levelSize - 1 - i] = node->val;

            if (node->left)
            {
                q.push(node->left);
            }

            if (node->right)
            {
                q.push(node->right);
            }
        }

        result.push_back(level);
        leftToRight = !leftToRight;
    }

    return result;
}

void freeTree(TreeNode *root)
{
    if (!root)
    {
        return;
    }

    freeTree(root->left);
    freeTree(root->right);
    delete root;
}

int main()
{
    TreeNode *root = new TreeNode(3, new TreeNode(9), new TreeNode(20, new TreeNode(15), new TreeNode(7)));
    std::vector<std::vector<int>> expected = {{3}, {20, 9}, {15, 7}};
    assert(zigzagLevelOrder(root) == expected);
    freeTree(root);

    root = new TreeNode(1);
    expected = {{1}};
    assert(zigzagLevelOrder(root) == expected);
    freeTree(root);

    root = new TreeNode(1,
                        new TreeNode(2, new TreeNode(4), new TreeNode(5)),
                        new TreeNode(3, new TreeNode(6), new TreeNode(7)));
    expected = {{1}, {3, 2}, {4, 5, 6, 7}};
    assert(zigzagLevelOrder(root) == expected);
    freeTree(root);

    assert(zigzagLevelOrder(nullptr).empty());
}
