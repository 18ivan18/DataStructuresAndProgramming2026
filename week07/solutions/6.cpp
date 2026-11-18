#include <cassert>
#include <queue>
#include <vector>

struct TreeNode
{
    int val;
    TreeNode *left, *right;

    TreeNode(int val) : val{val}, left{nullptr}, right{nullptr}
    {
    }
};

std::vector<int> rightSideView(TreeNode *root)
{
    // handle edge cases
    if (root == nullptr)
    {
        return {};
    }
    std::vector<int> solution;
    // create queue for BFS
    std::queue<TreeNode *> queue;
    queue.push(root);
    while (!queue.empty())
    {
        // obtain the size of the queue to only check the nodes at each level
        int size = queue.size();
        while (size > 0)
        {
            TreeNode *current = queue.front();
            queue.pop();
            // if the left child is not nullptr it can be added to the tree
            if (current->left != nullptr)
            {
                queue.push(current->left);
            }
            // if the right child is not nullptr it can be added to the tree
            if (current->right != nullptr)
            {
                queue.push(current->right);
            }
            // if the element is the last one, it means that it's the right side view node
            if (size == 1)
            {
                solution.push_back(current->val);
            }
            size--;
        }
    }
    return solution;
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
    TreeNode *root = new TreeNode(1);
    root->left = new TreeNode(2);
    root->right = new TreeNode(3);
    root->left->right = new TreeNode(5);
    root->right->right = new TreeNode(4);

    std::vector<int> expected = {1, 3, 4};
    assert(rightSideView(root) == expected);
    freeTree(root);

    root = new TreeNode(1);
    root->right = new TreeNode(3);
    expected = {1, 3};
    assert(rightSideView(root) == expected);
    freeTree(root);

    root = new TreeNode(1);
    root->left = new TreeNode(2);
    root->left->left = new TreeNode(3);
    expected = {1, 2, 3};
    assert(rightSideView(root) == expected);
    freeTree(root);

    assert(rightSideView(nullptr).empty());
}
