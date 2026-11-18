#include <cassert>
#include <stack>
#include <vector>
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

void inorderTraversalUtil(TreeNode *node, std::vector<int> &result)
{
    if (!node)
    {
        return;
    }
    inorderTraversalUtil(node->left, result);
    result.push_back(node->val);
    inorderTraversalUtil(node->right, result);
}

std::vector<int> inorderTraversalRec(TreeNode *root)
{
    std::vector<int> result;
    inorderTraversalUtil(root, result);
    return result;
}

std::vector<int> inorderTraversal(TreeNode *root)
{
    std::vector<int> result;
    std::stack<TreeNode *> st;
    TreeNode *node = root;
    while (node != nullptr || !st.empty())
    {
        while (node != nullptr)
        {
            st.push(node);
            node = node->left;
        }
        node = st.top();
        st.pop();
        result.push_back(node->val);
        node = node->right;
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
    TreeNode *root = new TreeNode(1, nullptr, new TreeNode(2, new TreeNode(3), nullptr));
    std::vector<int> expected = {1, 3, 2};

    assert(inorderTraversal(root) == expected);
    assert(inorderTraversalRec(root) == expected);
    assert(inorderTraversal(root) == expected);
    assert(inorderTraversalRec(root) == expected);
    freeTree(root);

    root = new TreeNode(1, new TreeNode(2), nullptr);
    expected = {2, 1};
    assert(inorderTraversal(root) == expected);
    assert(inorderTraversalRec(root) == expected);
    freeTree(root);

    root = new TreeNode(1);
    expected = {1};
    assert(inorderTraversal(root) == expected);
    assert(inorderTraversalRec(root) == expected);
    freeTree(root);

    assert(inorderTraversal(nullptr).empty());
    assert(inorderTraversalRec(nullptr).empty());
}
