#include <cassert>
#include <queue>
#include <stack>
#include <stdexcept>
#include <string>
#include <vector>

struct Node
{
    char val;
    Node *left, *right;

    Node(char val) : val{val}, left{nullptr}, right{nullptr}
    {
    }
};

void inorderTraversalUtil(Node *node, std::string &result)
{
    if (!node)
    {
        return;
    }
    inorderTraversalUtil(node->left, result);
    result += node->val;
    inorderTraversalUtil(node->right, result);
}

std::string inorderTraversal(Node *root)
{
    std::string result;
    inorderTraversalUtil(root, result);
    return result;
}

int getPrio(char c)
{
    switch (c)
    {
    case '(':
        return 1;
    case '+':
    case '-':
        return 2;
    case '*':
    case '/':
        return 3;

    default:
        break;
    }
    throw std::invalid_argument("Invalid operation");
}

void combine(std::stack<char> &ops, std::stack<Node *> &stack)
{
    Node *root = new Node(ops.top());
    ops.pop();
    // right first, then left
    root->right = stack.top();
    stack.pop();
    root->left = stack.top();
    stack.pop();

    stack.push(root);
}

Node *expTree(const std::string &s)
{

    std::stack<char> ops;
    std::stack<Node *> stack;

    for (size_t i = 0; i < s.length(); i++)
    {
        char ch = s[i];
        if (ch == '(')
        {
            ops.push(ch);
        }
        else if (isdigit(ch))
        {
            // TODO: make 2 digit numbers
            stack.push(new Node(ch));
        }
        else if (ch == ')')
        {
            while (ops.top() != '(')
            {
                combine(ops, stack);
            }
            // pop left '('
            ops.pop();
        }
        else
        {
            while (!ops.empty() && getPrio(ops.top()) >= getPrio(ch))
            { // @note: must be >=, for test case "1+2+3+4+5"
                combine(ops, stack);
            }

            ops.push(ch);
        }
    }

    while (stack.size() > 1 && !ops.empty())
    {
        combine(ops, stack);
    }

    return stack.top();
}

std::vector<std::string> levels(Node *root)
{
    std::vector<std::string> result;

    if (!root)
    {
        return result;
    }

    std::queue<Node *> q;
    q.push(root);

    while (!q.empty())
    {
        int levelSize = q.size();
        std::string level;

        for (int i = 0; i < levelSize; i++)
        {
            Node *node = q.front();
            q.pop();

            level += node->val;

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
    }

    return result;
}

void freeTree(Node *root)
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
    Node *root = expTree("2-3/(5*2)+1");
    assert(inorderTraversal(root) == "2-3/5*2+1");
    std::vector<std::string> expected = {"+", "-1", "2/", "3*", "52"};
    assert(levels(root) == expected);
    freeTree(root);

    root = expTree("3*4-2*5");
    assert(inorderTraversal(root) == "3*4-2*5");
    expected = {"-", "**", "3425"};
    assert(levels(root) == expected);
    freeTree(root);

    root = expTree("1+2+3+4+5");
    assert(inorderTraversal(root) == "1+2+3+4+5");
    freeTree(root);

    root = expTree("7");
    assert(inorderTraversal(root) == "7");
    freeTree(root);

    bool threw = false;

    try
    {
        getPrio('%');
    }
    catch (const std::invalid_argument &)
    {
        threw = true;
    }

    assert(threw);
}
