#include <cassert>
#include <queue>
#include <vector>

struct TreeNode
{
    int value;
    TreeNode *left = nullptr, *right = nullptr;

    TreeNode(int value) : value{value} {}
};

std::vector<std::vector<int>> levelOrderTraversal(TreeNode *node)
{

    std::queue<TreeNode *> q;
    if (node)
    {
        q.push(node);
    }
    std::vector<std::vector<int>> result;
    while (!q.empty())
    {
        int levelSize = q.size();
        std::vector<int> level;
        for (int i = 0; i < levelSize; i++)
        {
            TreeNode *root = q.front();
            q.pop();
            level.push_back(root->value);
            if (root->left)
            {
                q.push(root->left);
            }
            if (root->right)
            {
                q.push(root->right);
            }
        }
        result.push_back(level);
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
    TreeNode *root = new TreeNode(3);
    root->left = new TreeNode(9);
    root->right = new TreeNode(20);
    root->right->left = new TreeNode(15);
    root->right->right = new TreeNode(7);

    std::vector<std::vector<int>> expected = {{3}, {9, 20}, {15, 7}};
    assert(levelOrderTraversal(root) == expected);
    freeTree(root);

    root = new TreeNode(1);
    expected = {{1}};
    assert(levelOrderTraversal(root) == expected);
    freeTree(root);

    assert(levelOrderTraversal(nullptr).empty());
}
