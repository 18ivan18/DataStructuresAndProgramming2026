#include <cassert>
#include <vector>
#include <string>

//  Definition for a binary tree node.
struct TreeNode
{
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode() : val(0), left(nullptr), right(nullptr) {}
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
    TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
};

std::vector<std::string> binaryTreePaths(TreeNode *root)
{
    if (root == nullptr)
    {
        return std::vector<std::string>();
    }

    if (root->left == nullptr && root->right == nullptr)
    {
        std::vector<std::string> v;
        v.push_back(std::to_string(root->val));
        return v;
    }

    std::vector<std::string> left = binaryTreePaths(root->left);
    for (size_t i = 0; i < left.size(); ++i)
    {
        left[i] = std::to_string(root->val) + "->" + left[i];
    }

    std::vector<std::string> right = binaryTreePaths(root->right);
    for (size_t i = 0; i < right.size(); ++i)
    {
        right[i] = std::to_string(root->val) + "->" + right[i];
    }

    std::vector<std::string> res;
    for (auto x : left)
    {
        res.push_back(x);
    }
    for (auto x : right)
    {
        res.push_back(x);
    }
    return res;
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
    TreeNode *root = new TreeNode(1, new TreeNode(2, nullptr, new TreeNode(5)), new TreeNode(3));
    std::vector<std::string> expected = {"1->2->5", "1->3"};
    assert(binaryTreePaths(root) == expected);
    freeTree(root);

    root = new TreeNode(1);
    expected = {"1"};
    assert(binaryTreePaths(root) == expected);
    freeTree(root);

    root = new TreeNode(1, new TreeNode(2, new TreeNode(4), new TreeNode(5)), new TreeNode(3));
    expected = {"1->2->4", "1->2->5", "1->3"};
    assert(binaryTreePaths(root) == expected);
    freeTree(root);

    assert(binaryTreePaths(nullptr).empty());
}
