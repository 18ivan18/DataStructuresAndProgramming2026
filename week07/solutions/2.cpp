#include <cassert>
#include <queue>
#include <string>
#include <vector>

struct TreeNode
{
    int val;
    TreeNode *left, *right;
    TreeNode(int x = 0, TreeNode *left = nullptr, TreeNode *right = nullptr) : val(x), left(left), right(right) {}
};

const std::string NIL = "null";

TreeNode *buildTree(const std::vector<std::string> &tokens)
{
    if (tokens.empty() || tokens[0] == NIL)
    {
        return nullptr;
    }

    TreeNode *root = new TreeNode(std::stoi(tokens[0]));
    std::queue<TreeNode *> parents;
    parents.push(root);
    size_t i = 1;

    while (!parents.empty() && i < tokens.size())
    {
        TreeNode *parent = parents.front();
        parents.pop();

        if (i < tokens.size() && tokens[i] != NIL)
        {
            parent->left = new TreeNode(std::stoi(tokens[i]));
            parents.push(parent->left);
        }
        i++;

        if (i < tokens.size() && tokens[i] != NIL)
        {
            parent->right = new TreeNode(std::stoi(tokens[i]));
            parents.push(parent->right);
        }
        i++;
    }

    return root;
}

std::vector<std::string> levelArray(TreeNode *root)
{
    std::vector<std::string> tokens;

    if (!root)
    {
        return tokens;
    }

    std::queue<TreeNode *> nodes;
    nodes.push(root);

    while (!nodes.empty())
    {
        TreeNode *node = nodes.front();
        nodes.pop();

        if (!node)
        {
            tokens.push_back(NIL);
            continue;
        }

        tokens.push_back(std::to_string(node->val));
        nodes.push(node->left);
        nodes.push(node->right);
    }

    while (!tokens.empty() && tokens.back() == NIL)
    {
        tokens.pop_back();
    }

    return tokens;
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
    TreeNode *root = buildTree({"1", "null", "2", "3"});
    assert(root->val == 1);
    assert(!root->left);
    assert(root->right->val == 2);
    assert(root->right->left->val == 3);
    assert(!root->right->right);
    assert((levelArray(root) == std::vector<std::string>{"1", "null", "2", "3"}));
    freeTree(root);

    root = buildTree({"3", "9", "20", "null", "null", "15", "7"});
    assert(root->left->val == 9);
    assert(!root->left->left && !root->left->right);
    assert(root->right->left->val == 15 && root->right->right->val == 7);
    assert((levelArray(root) == std::vector<std::string>{"3", "9", "20", "null", "null", "15", "7"}));
    freeTree(root);

    root = buildTree({"1", "2"});
    assert(root->left->val == 2 && !root->right);
    assert((levelArray(root) == std::vector<std::string>{"1", "2"}));
    freeTree(root);

    root = buildTree({"1"});
    assert(root->val == 1 && !root->left && !root->right);
    assert((levelArray(root) == std::vector<std::string>{"1"}));
    freeTree(root);

    assert(buildTree({}) == nullptr);
    assert(buildTree({"null"}) == nullptr);
    assert(levelArray(nullptr).empty());

    root = buildTree({"5", "4", "7", "3", "null", "2", "null", "-1", "null", "9"});
    assert((levelArray(root) == std::vector<std::string>{"5", "4", "7", "3", "null", "2", "null", "-1", "null", "9"}));
    freeTree(root);
}
