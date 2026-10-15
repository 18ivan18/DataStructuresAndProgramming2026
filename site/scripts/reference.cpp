// Runs the course's own C++ (week01/pointers.cpp, ArrayStack.h, ArrayQueue.h, SinglyLinkedList.h, DoublyLinkedList.h and the week 2-5 solutions) and prints what it does as JSON.
// src/lib/stack.test.ts checks the site's widgets against this output, so the pictures cannot drift
// from the code students read. Regenerate with `npm run reference` from site/.
#include <iostream>
#include <string>
#include <vector>

#define private public // to read ArrayStack's capacity, which has no getter
#include "../../week02/implementation/ArrayStack/ArrayStack.h"
#include "../../week03/implementation/ArrayQueue/ArrayQueue.h"
#include "../../week05/implementation/DoublyLinkedList/DoublyLinkedList.h"
#undef private

#define main solution2_main
#include "../../week02/solutions/2.cpp"
#undef main
#define main solution4_main
#include "../../week02/solutions/4.cpp"
#undef main
#define main pointers_main
#include "../../week01/pointers.cpp"
#undef main
#define main w3s2_main
#include "../../week03/solutions/2.cpp"
#undef main
#define main w3s6_main
#include "../../week03/solutions/6.cpp"
#undef main
#define main w3s7_main
#include "../../week03/solutions/7.cpp"
#undef main
#define main w3s8_main
#include "../../week03/solutions/8.cpp"
#undef main
#include "../../week04/implementation/SinglyLinkedList/SinglyLinkedList.h"
// Every week 4 solution defines its own ListNode, so each lives in a namespace.
// (Their standard headers are included first, so the include guards keep them out of the namespaces.)
#include <set>
#include <stack>
#include <cassert>
#define main main_
namespace w4s1 {
#include "../../week04/solutions/1.cpp"
}
namespace w4s2 {
#include "../../week04/solutions/2.cpp"
}
namespace w4s6 {
#include "../../week04/solutions/6.cpp"
}
namespace w4s7 {
#include "../../week04/solutions/7.cpp"
}
#include <cstdint>
#include <stdlib.h>
namespace w5s1 {
#include "../../week05/solutions/1.cpp"
}
namespace w5s4 {
#include "../../week05/solutions/4.cpp"
}
#define private public // to read MyCircularDeque's first and n
namespace w5s2 {
#include "../../week05/solutions/2.cpp"
}
#undef private
#undef main
#include <sstream>

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
    std::cout << "],\n";

    // pointers.cpp prints addresses and one uninitialised value; the test masks those.
    std::ostringstream buf;
    std::streambuf *old = std::cout.rdbuf(buf.rdbuf());
    pointers_main();
    std::cout.rdbuf(old);
    std::cout << "\"pointersOutput\": [";
    std::string line;
    std::istringstream lines(buf.str());
    for (bool firstLine = true; std::getline(lines, line); firstLine = false)
        std::cout << (firstLine ? "" : ", ") << quote(line);
    std::cout << "]";

    // ---------- week 3 ----------
    std::cout << ",\n\"arrayQueue\": {\"ops\": [";
    {
        // A pseudo-random walk (same LCG idea as above) that grows past several resizes and shrinks back.
        unsigned seed = 11;
        std::vector<int> ops;
        int size = 0;
        for (int i = 0; i < 400; i++)
        {
            seed = seed * 1103515245u + 12345u;
            int bias = i < 200 ? 62 : 38; // grow first, then shrink
            bool push = size == 0 || (int)((seed >> 16) % 100) < bias;
            ops.push_back(push ? 1 + (int)((seed >> 8) % 99) : 0);
            size += push ? 1 : -1;
        }
        for (size_t i = 0; i < ops.size(); i++) std::cout << (i ? "," : "") << ops[i];
        std::cout << "], \"after\": [";
        ArrayQueue<int> q;
        for (size_t i = 0; i < ops.size(); i++)
        {
            int out = -1;
            if (ops[i] > 0) q.enqueue(ops[i]);
            else out = q.dequeue();
            std::cout << (i ? "," : "") << "[" << q.n << "," << q.capacity << "," << q.first << "," << out << "]";
        }
        std::cout << "]}";
    }

    std::cout << ",\n\"myQueue\": [";
    {
        // ops: positive = push, 0 = pop, -1 = peek, -2 = empty
        std::vector<int> ops = {1, 2, -1, 0, 3, -1, 0, 4, 5, -1, 0, 0, -2, 6, 0, 0, -2};
        MyQueue mq;
        for (size_t i = 0; i < ops.size(); i++)
        {
            int r;
            if (ops[i] > 0) { mq.push(ops[i]); r = -100; }
            else if (ops[i] == 0) r = mq.pop();
            else if (ops[i] == -1) r = mq.peek();
            else r = mq.empty() ? 1 : 0;
            std::cout << (i ? "," : "") << "[" << ops[i] << "," << r << "]";
        }
    }
    std::cout << "]";

    // solution 8 reads stdin and prints to stdout, so feed it through string streams.
    std::cout << ",\n\"bridge\": [";
    {
        unsigned seed = 21;
        for (int t = 0; t < 150; t++)
        {
            seed = seed * 1103515245u + 12345u;
            int n = 1 + (int)((seed >> 16) % 10);
            std::vector<int> a(n);
            std::ostringstream in;
            in << n << "\n";
            for (int &x : a)
            {
                seed = seed * 1103515245u + 12345u;
                x = 1 + (int)((seed >> 16) % 6);
                seed = seed * 1103515245u + 12345u;
                if ((seed >> 16) % 2) x = -x;
                in << x << " ";
            }
            std::istringstream input(in.str());
            std::ostringstream output;
            std::streambuf *oldIn = std::cin.rdbuf(input.rdbuf());
            std::streambuf *oldOut = std::cout.rdbuf(output.rdbuf());
            w3s8_main();
            std::cin.rdbuf(oldIn);
            std::cout.rdbuf(oldOut);
            std::cout << (t ? "," : "") << "{\"input\": [";
            for (int i = 0; i < n; i++) std::cout << (i ? "," : "") << a[i];
            std::cout << "], \"output\": [";
            std::istringstream got(output.str());
            int v;
            for (bool f = true; got >> v; f = false) std::cout << (f ? "" : ",") << v;
            std::cout << "]}";
        }
    }
    std::cout << "]";

    std::cout << ",\n\"window\": [";
    {
        unsigned seed = 5;
        for (int t = 0; t < 60; t++)
        {
            seed = seed * 1103515245u + 12345u;
            int n = 1 + (int)((seed >> 16) % 12);
            seed = seed * 1103515245u + 12345u;
            int k = 1 + (int)((seed >> 16) % n);
            std::vector<int> nums(n);
            for (int &x : nums) { seed = seed * 1103515245u + 12345u; x = (int)((seed >> 16) % 21) - 10; }
            std::vector<int> got = maxSlidingWindow(nums, k);
            std::cout << (t ? "," : "") << "{\"nums\": [";
            for (int i = 0; i < n; i++) std::cout << (i ? "," : "") << nums[i];
            std::cout << "], \"k\": " << k << ", \"out\": [";
            for (size_t i = 0; i < got.size(); i++) std::cout << (i ? "," : "") << got[i];
            std::cout << "]}";
        }
    }
    std::cout << "]";

    std::cout << ",\n\"maze\": [";
    {
        unsigned seed = 9;
        for (int t = 0; t < 40; t++)
        {
            std::vector<std::vector<int>> mat(8, std::vector<int>(8));
            for (auto &r : mat) for (int &c : r) { seed = seed * 1103515245u + 12345u; c = (seed >> 16) % 100 < 70 ? 1 : 0; }
            std::pair<int, int> src = {0, 0}, dest = {7, 7};
            int d = findShortestPathLength(mat, src, dest);
            std::cout << (t ? "," : "") << "{\"grid\": [";
            for (int i = 0; i < 8; i++) { std::cout << (i ? "," : "") << "["; for (int j = 0; j < 8; j++) std::cout << (j ? "," : "") << mat[i][j]; std::cout << "]"; }
            std::cout << "], \"dist\": " << d << "}";
        }
    }
    std::cout << "]";

    // ---------- week 4 ----------
    // ops: [kind, a, b]: 0 pushFront x, 1 pushBack x, 2 insertAt i x, 3 popFront, 4 removeAt i, 5 removeAll x, 6 at i, 7 find x
    std::cout << ",\n\"singlyLinkedList\": [";
    {
        SinglyLinkedList<int> l;
        unsigned seed = 13;
        auto rnd = [&](int m) { seed = seed * 1103515245u + 12345u; return (int)((seed >> 16) % m); };
        for (int t = 0; t < 400; t++)
        {
            int n = l.size(), kind = rnd(8), a = 0, b = 0;
            if (n == 0 && (kind == 3 || kind == 4 || kind == 6)) kind = rnd(2); // nothing to remove or read yet
            std::string returned = "void";
            switch (kind)
            {
            case 0: a = 1 + rnd(5); l.pushFront(a); break;
            case 1: a = 1 + rnd(5); l.pushBack(a); break;
            case 2: a = rnd(n + 1); b = 1 + rnd(5); l.insertAt(a, b); break;
            case 3: returned = std::to_string(l.popFront()); break;
            case 4: a = rnd(n); returned = std::to_string(l.removeAt(a)); break;
            case 5: a = 1 + rnd(5); l.removeAll(a); break;
            case 6: a = rnd(n); returned = std::to_string(l.at(a)); break;
            case 7: a = 1 + rnd(6); returned = std::to_string(l.find(a)); break;
            }
            std::cout << (t ? "," : "") << "{\"op\": [" << kind << "," << a << "," << b << "], \"returned\": \"" << returned << "\", \"after\": [";
            for (int i = 0; i < l.size(); i++) std::cout << (i ? "," : "") << l.at(i);
            std::cout << "]}";
        }
    }
    std::cout << "]";

    std::cout << ",\n\"week4\": [";
    {
        unsigned seed = 17;
        auto rnd = [&](int m) { seed = seed * 1103515245u + 12345u; return (int)((seed >> 16) % m); };
        auto toVec = [](auto *h) { std::vector<int> v; while (h) { v.push_back(h->val); h = h->next; } return v; };
        auto printVec = [](const std::vector<int> &v) { std::string s = "["; for (size_t i = 0; i < v.size(); i++) s += (i ? "," : "") + std::to_string(v[i]); return s + "]"; };
        for (int t = 0; t < 60; t++)
        {
            int n = 1 + rnd(8);
            std::vector<int> a(n);
            for (int i = 0; i < n; i++) a[i] = 10 * (i + 1) + rnd(10); // unique, as task 6 requires
            int pos = rnd(n + 1) - 1, del = n >= 2 ? rnd(n - 1) : 0, nth = 1 + rnd(n);
            w4s2::ListNode *tail;
            w4s2::ListNode *cyc = w4s2::listWithCycle(a, pos, tail);
            w4s2::ListNode *start = w4s2::detectCycleConstMemory(cyc), *iter = cyc;
            int startIndex = -1;
            for (int i = 0; start && i < n; i++, iter = iter->next) if (iter == start) { startIndex = i; break; }
            std::vector<int> afterDelete;
            if (n >= 2) { w4s6::ListNode *h = w4s6::listOf(a); w4s6::deleteNode(w4s6::nodeAt(h, del)); afterDelete = toVec(h); }
            std::cout << (t ? "," : "") << "{\"values\": " << printVec(a)
                      << ", \"reversed\": " << printVec(toVec(w4s1::reverseIterative(w4s1::listOf(a))))
                      << ", \"pos\": " << pos << ", \"cycleStart\": " << startIndex
                      << ", \"del\": " << del << ", \"afterDelete\": " << printVec(afterDelete)
                      << ", \"nth\": " << nth << ", \"afterRemoveNth\": " << printVec(toVec(w4s7::removeNthFromEnd(w4s7::listOf(a), nth))) << "}";
        }
    }
    std::cout << "]";

    // ---------- week 5 ----------
    // ops: 0 pushFront x, 1 pushBack x, 2 insertAt i x, 3 popFront, 4 popBack, 5 removeAt i, 6 at i, 7 front, 8 back, 9 find x
    std::cout << ",\n\"doublyLinkedList\": [";
    {
        DoublyLinkedList<int> l;
        unsigned seed = 29;
        auto rnd = [&](int m) { seed = seed * 1103515245u + 12345u; return (int)((seed >> 16) % m); };
        for (int t = 0; t < 400; t++)
        {
            int n = l.size(), kind = rnd(10), a = 0, b = 0;
            if (n == 0 && kind >= 3 && kind <= 8) kind = rnd(2);
            std::string returned = "void";
            switch (kind)
            {
            case 0: a = 1 + rnd(9); l.pushFront(a); break;
            case 1: a = 1 + rnd(9); l.pushBack(a); break;
            case 2: a = rnd(n + 1); b = 1 + rnd(9); l.insertAt(a, b); break;
            case 3: returned = std::to_string(l.popFront()); break;
            case 4: returned = std::to_string(l.popBack()); break;
            case 5: a = rnd(n); returned = std::to_string(l.removeAt(a)); break;
            case 6: a = rnd(n); returned = std::to_string(l.at(a)); break;
            case 7: returned = std::to_string(l.front()); break;
            case 8: returned = std::to_string(l.back()); break;
            case 9: a = 1 + rnd(10); returned = std::to_string(l.find(a)); break;
            }
            std::cout << (t ? "," : "") << "{\"op\": [" << kind << "," << a << "," << b << "], \"returned\": \"" << returned << "\", \"after\": [";
            for (int i = 0; i < l.size(); i++) std::cout << (i ? "," : "") << l.at(i);
            std::cout << "], \"backward\": [";
            bool firstOut = true;
            for (auto *x = l.last; x; x = x->previous, firstOut = false) std::cout << (firstOut ? "" : ",") << x->data;
            std::cout << "]}";
        }
    }
    std::cout << "]";

    std::cout << ",\n\"swapNodes\": [";
    {
        unsigned seed = 31;
        auto rnd = [&](int m) { seed = seed * 1103515245u + 12345u; return (int)((seed >> 16) % m); };
        for (int t = 0; t < 80; t++)
        {
            int n = 1 + rnd(7), i = rnd(n), j = rnd(n);
            std::vector<int> a(n);
            for (int k = 0; k < n; k++) a[k] = k + 1;
            w5s1::Node *h = w5s1::listOf(a);
            w5s1::swapNodes(h, w5s1::nodeAt(h, i), w5s1::nodeAt(h, j));
            std::cout << (t ? "," : "") << "{\"n\": " << n << ", \"i\": " << i << ", \"j\": " << j << ", \"after\": [";
            bool f = true;
            for (auto *x = h; x; x = x->next, f = false) std::cout << (f ? "" : ",") << x->data;
            std::cout << "]}";
        }
    }
    std::cout << "]";

    // The solution's levels come from rand(), but the answers to search and erase do not depend on them.
    std::cout << ",\n\"skiplist\": [";
    {
        unsigned seed = 37;
        auto rnd = [&](int m) { seed = seed * 1103515245u + 12345u; return (int)((seed >> 16) % m); };
        w5s4::Skiplist sk;
        for (int t = 0; t < 300; t++)
        {
            int kind = rnd(3), v = rnd(15);
            int r = -1;
            if (kind == 0) sk.add(v);
            else if (kind == 1) r = sk.search(v);
            else r = sk.erase(v);
            std::cout << (t ? "," : "") << "[" << kind << "," << v << "," << r << "]";
        }
    }
    std::cout << "]";

    // ops: 0 insertFront x, 1 insertLast x, 2 deleteFront, 3 deleteLast, 4 getFront, 5 getRear, 6 isEmpty, 7 isFull
    std::cout << ",\n\"circularDeque\": [";
    {
        unsigned seed = 41;
        auto rnd = [&](int m) { seed = seed * 1103515245u + 12345u; return (int)((seed >> 16) % m); };
        for (int t = 0; t < 12; t++)
        {
            int k = 1 + rnd(5);
            w5s2::MyCircularDeque dq(k);
            std::cout << (t ? "," : "") << "{\"k\": " << k << ", \"ops\": [";
            for (int q = 0; q < 25; q++)
            {
                int kind = rnd(8), x = rnd(100), r = 0;
                switch (kind)
                {
                case 0: r = dq.insertFront(x); break;
                case 1: r = dq.insertLast(x); break;
                case 2: r = dq.deleteFront(); break;
                case 3: r = dq.deleteLast(); break;
                case 4: r = dq.getFront(); break;
                case 5: r = dq.getRear(); break;
                case 6: r = dq.isEmpty(); break;
                case 7: r = dq.isFull(); break;
                }
                std::cout << (q ? "," : "") << "[" << kind << "," << x << "," << r << "," << dq.first << "," << dq.n << "]";
            }
            std::cout << "]}";
        }
    }
    std::cout << "]";
    std::cout << "\n}\n";
}
