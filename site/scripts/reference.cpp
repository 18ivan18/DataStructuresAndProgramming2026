// Runs the course's own C++ (ArrayStack.h and the week 2 solutions) and prints what it does as JSON.
// src/lib/stack.test.ts checks the site's widgets against this output, so the pictures cannot drift
// from the code students read. Regenerate with `npm run reference` from site/.
#include <iostream>
#include <string>
#include <vector>

#define private public // to read ArrayStack's capacity, which has no getter
#include "../../week02/implementation/ArrayStack/ArrayStack.h"
#undef private

#define main solution2_main
#include "../../week02/solutions/2.cpp"
#undef main
#define main solution4_main
#include "../../week02/solutions/4.cpp"
#undef main

static std::string quote(const std::string &s) { return "\"" + s + "\""; }

// ops: positive number = push it, 0 = pop
static void arrayStackCase(const char *name, const std::vector<int> &ops, bool &first)
{
    ArrayStack<int> st;
    std::cout << (first ? "" : ",\n") << "  " << quote(name) << ": {\"ops\": [";
    for (size_t i = 0; i < ops.size(); i++) std::cout << (i ? "," : "") << ops[i];
    std::cout << "], \"after\": [";
    for (size_t i = 0; i < ops.size(); i++)
    {
        int popped = -1;
        if (ops[i] > 0) st.push(ops[i]);
        else popped = st.pop();
        std::cout << (i ? "," : "") << "[" << st.n << "," << st.capacity << "," << popped << "]";
    }
    std::cout << "]}";
    first = false;
}

int main()
{
    std::cout << "{\n\"arrayStack\": {\n";
    bool first = true;

    std::vector<int> up;
    for (int i = 1; i <= 40; i++) up.push_back(i);
    std::vector<int> upDown = up;
    for (int i = 0; i < 40; i++) upDown.push_back(0);
    arrayStackCase("push 40, pop 40", upDown, first);

    // Hover around a resize boundary: the case the /4 shrink rule exists for.
    std::vector<int> boundary;
    for (int i = 1; i <= 9; i++) boundary.push_back(i);
    for (int k = 0; k < 6; k++) { boundary.push_back(0); boundary.push_back(100 + k); }
    arrayStackCase("around a boundary", boundary, first);

    // A fixed pseudo-random walk (LCG, same in TypeScript), never popping an empty stack.
    unsigned seed = 7;
    std::vector<int> walk;
    int size = 0;
    for (int i = 0; i < 300; i++)
    {
        seed = seed * 1103515245u + 12345u;
        bool push = size == 0 || (seed >> 16) % 100 < 55;
        walk.push_back(push ? 1 + (seed >> 8) % 99 : 0);
        size += push ? 1 : -1;
    }
    arrayStackCase("random walk", walk, first);
    std::cout << "\n},\n";

    std::vector<std::string> brackets = {"()", "()[]{}", "(]", "([)]", "{[]}", "[", "]", "()(()", "((([[{}]])))", "{[()()]}[", ")("};
    std::cout << "\"brackets\": {";
    for (size_t i = 0; i < brackets.size(); i++)
        std::cout << (i ? ", " : "") << quote(brackets[i]) << ": " << (isValid(brackets[i]) ? "true" : "false");
    std::cout << "},\n";

    std::vector<std::vector<std::string>> rpn = {
        {"2", "1", "+", "3", "*"},
        {"4", "13", "5", "/", "+"},
        {"10", "6", "9", "3", "+", "-11", "*", "/", "*", "17", "+", "5", "+"},
        {"7", "-2", "/"},
        {"3", "4", "-", "5", "*"},
    };
    std::cout << "\"rpn\": [";
    for (size_t i = 0; i < rpn.size(); i++)
    {
        std::cout << (i ? ", " : "") << "{\"tokens\": [";
        for (size_t j = 0; j < rpn[i].size(); j++) std::cout << (j ? "," : "") << quote(rpn[i][j]);
        std::cout << "], \"value\": " << evalRPN(rpn[i]) << "}";
    }
    std::cout << "]\n}\n";
}
