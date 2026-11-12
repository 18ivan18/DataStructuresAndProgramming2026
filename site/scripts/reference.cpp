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
namespace w6s1 {
#include "../../week06/solutions/1.cpp"
}
namespace w6s2 {
#include "../../week06/solutions/2.cpp"
}
namespace w6s4 {
#include "../../week06/solutions/4.cpp"
}
namespace w6s6 {
#include "../../week06/solutions/6.cpp"
}
namespace w6s7 {
#include "../../week06/solutions/7.cpp"
}
namespace w6s9 {
#include "../../week06/solutions/9.cpp"
}
namespace w6s8 {
#include "../../week06/solutions/8.cpp"
}
#include <queue>
#include <stdexcept>
#include <functional>
namespace w7s1 {
#include "../../week07/solutions/1.cpp"
}
namespace w7s2 {
#include "../../week07/solutions/2.cpp"
}
namespace w7s3 {
#include "../../week07/solutions/3.cpp"
}
namespace w7s4 {
#include "../../week07/solutions/4.cpp"
}
namespace w7s5 {
#include "../../week07/solutions/5.cpp"
}
namespace w7s6 {
#include "../../week07/solutions/6.cpp"
}
namespace w7s7 {
#include "../../week07/solutions/7.cpp"
}
namespace w7s8 {
#include "../../week07/solutions/8.cpp"
}
// Every standard header the week 8 solutions use, pulled in before the namespaces so that
// their own #includes are no-ops and nothing from std lands inside a namespace.
#include <algorithm>
#include <sstream>
#include <stack>
#include <string>
namespace w8s1 {
#include "../../week08/solutions/1.cpp"
}
namespace w8s2 {
#include "../../week08/solutions/2.cpp"
}
namespace w8s3 {
#include "../../week08/solutions/3.cpp"
}
namespace w8s4 {
#include "../../week08/solutions/4.cpp"
}
namespace w8s5 {
#include "../../week08/solutions/5.cpp"
}
namespace w8s6 {
#include "../../week08/solutions/6.cpp"
}
namespace w8s7 {
#include "../../week08/solutions/7.cpp"
}
namespace w8s8 {
#include "../../week08/solutions/8.cpp"
}
namespace w8s9 {
#include "../../week08/solutions/9.cpp"
}
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

    std::cout << ",\n\"week6\": [";
    {
        unsigned seed = 43;
        auto rnd = [&](int m) { seed = seed * 1103515245u + 12345u; return (int)((seed >> 16) % m); };
        auto toVec = [](auto *h) { std::vector<int> v; while (h) { v.push_back(h->val); h = h->next; } return v; };
        auto printVec = [](const std::vector<int> &v) { std::string s = "["; for (size_t i = 0; i < v.size(); i++) s += (i ? "," : "") + std::to_string(v[i]); return s + "]"; };
        for (int t = 0; t < 80; t++)
        {
            int n = 1 + rnd(9);
            std::vector<int> a(n);
            for (int i = 0; i < n; i++) a[i] = 1 + rnd(9);
            int k = 1 + rnd(n), x = 1 + rnd(9);
            std::vector<int> pal = a;
            if (t % 3 == 0) for (int i = 0; i < n / 2; i++) pal[n - 1 - i] = pal[i];
            w6s9::ListNode *sh = w6s9::listOf(a);
            w6s9::shuffle(sh);
            std::vector<int> arriving(n);
            for (int i = 0; i < n; i++) arriving[i] = i + 1;
            for (int i = n - 1; i > 0; i--) std::swap(arriving[i], arriving[rnd(i + 1)]);
            std::cout << (t ? "," : "") << "{\"values\": " << printVec(a)
                      << ", \"k\": " << k << ", \"kGroup\": " << printVec(toVec(w6s1::reverseKGroup(w6s1::listOf(a), k)))
                      << ", \"palindromeOf\": " << printVec(pal) << ", \"palindrome\": " << (w6s2::isPalindrome(w6s2::listOf(pal)) ? "true" : "false")
                      << ", \"reorder\": " << printVec(toVec(w6s4::reorderList(w6s4::listOf(a))))
                      << ", \"oddEven\": " << printVec(toVec(w6s6::oddEvenList(w6s6::listOf(a))))
                      << ", \"x\": " << x << ", \"partition\": " << printVec(toVec(w6s7::partition(w6s7::listOf(a), x)))
                      << ", \"shuffle\": " << printVec(toVec(sh))
                      << ", \"arriving\": " << printVec(arriving) << ", \"parade\": " << (w6s8::canParade(w6s8::queueOf(arriving)) ? "true" : "false") << "}";
        }
    }
    std::cout << "]";

    std::cout << ",\n\"week7\": [";
    {
        const int NUL = -1000;
        unsigned seed = 44;
        auto rnd = [&](int m) { seed = seed * 1103515245u + 12345u; return (int)((seed >> 16) % m); };
        auto printVec = [](const std::vector<int> &v) { std::string s = "["; for (size_t i = 0; i < v.size(); i++) s += (i ? "," : "") + std::to_string(v[i]); return s + "]"; };
        auto printTokens = [&](const std::vector<int> &v) { std::string s = "["; for (size_t i = 0; i < v.size(); i++) s += std::string(i ? "," : "") + (v[i] == NUL ? "null" : std::to_string(v[i])); return s + "]"; };
        auto printLevels = [&](const std::vector<std::vector<int>> &v) { std::string s = "["; for (size_t i = 0; i < v.size(); i++) s += std::string(i ? "," : "") + printVec(v[i]); return s + "]"; };
        auto printStrings = [](const std::vector<std::string> &v) { std::string s = "["; for (size_t i = 0; i < v.size(); i++) s += std::string(i ? "," : "") + "\"" + v[i] + "\""; return s + "]"; };
        auto build = [&](const std::vector<int> &a, auto make) {
            using N = decltype(make(0));
            N root = a.empty() || a[0] == NUL ? nullptr : make(a[0]);
            std::queue<N> q;
            if (root) q.push(root);
            size_t at = 1;
            while (!q.empty() && at < a.size())
            {
                N p = q.front();
                q.pop();
                if (at < a.size()) { int v = a[at++]; if (v != NUL) { p->left = make(v); q.push(p->left); } }
                if (at < a.size()) { int v = a[at++]; if (v != NUL) { p->right = make(v); q.push(p->right); } }
            }
            return root;
        };
        for (int t = 0; t < 60; t++)
        {
            std::vector<int> a;
            int n = 1 + rnd(12);
            for (int i = 0; i < n; i++) a.push_back(i == 0 || rnd(4) ? 1 + rnd(9) : NUL);
            std::cout << (t ? "," : "") << "{\"tokens\": " << printTokens(a)
                      << ", \"inorder\": " << printVec(w7s2::inorderTraversal(build(a, [](int v) { return new w7s2::TreeNode(v); })))
                      << ", \"inorderRec\": " << printVec(w7s2::inorderTraversalRec(build(a, [](int v) { return new w7s2::TreeNode(v); })))
                      << ", \"paths\": " << printStrings(w7s3::binaryTreePaths(build(a, [](int v) { return new w7s3::TreeNode(v); })))
                      << ", \"levels\": " << printLevels(w7s4::levelOrderTraversal(build(a, [](int v) { return new w7s4::TreeNode(v); })))
                      << ", \"zigzag\": " << printLevels(w7s5::zigzagLevelOrder(build(a, [](int v) { return new w7s5::TreeNode(v); })))
                      << ", \"right\": " << printVec(w7s6::rightSideView(build(a, [](int v) { return new w7s6::TreeNode(v); })));
            std::vector<std::string> toks;
            for (int v : a) toks.push_back(v == NUL ? "null" : std::to_string(v));
            w7s1::TreeNode *built = w7s1::buildTree(toks);
            std::cout << ", \"levelArray\": " << printStrings(w7s1::levelArray(built)) << "}";
            w7s1::freeTree(built);
        }
    }
    std::cout << "]";

    std::cout << ",\n\"week7expr\": [";
    {
        unsigned seed = 45;
        auto rnd = [&](int m) { seed = seed * 1103515245u + 12345u; return (int)((seed >> 16) % m); };
        std::function<std::string(int)> gen = [&](int depth) -> std::string {
            std::string s;
            int parts = 1 + rnd(3);
            for (int i = 0; i < parts; i++)
            {
                if (i) s += std::string(1, "+-*/"[rnd(4)]);
                if (depth > 0 && rnd(3) == 0) s += "(" + gen(depth - 1) + ")";
                else s += std::string(1, (char)('1' + rnd(9)));
            }
            return s;
        };
        std::vector<std::string> cases = {"2-3/(5*2)+1", "3*4-2*5", "1+2+3+4+5", "7", "2*(3+4)", "(1+2)*(3-4)"};
        while (cases.size() < 40)
        {
            std::string s = gen(2);
            if (s.size() <= 20) cases.push_back(s);
        }
        for (size_t t = 0; t < cases.size(); t++)
        {
            w7s7::Node *root = w7s7::expTree(cases[t]);
            std::cout << (t ? "," : "") << "{\"s\": \"" << cases[t] << "\", \"inorder\": \"" << w7s7::inorderTraversal(root) << "\", \"levels\": [";
            std::vector<std::string> ls = w7s7::levels(root);
            for (size_t i = 0; i < ls.size(); i++) std::cout << (i ? "," : "") << "\"" << ls[i] << "\"";
            std::cout << "]}";
            w7s7::freeTree(root);
        }
    }
    std::cout << "]";

    std::cout << ",\n\"week7gifts\": [";
    {
        unsigned seed = 46;
        auto rnd = [&](int m) { seed = seed * 1103515245u + 12345u; return (int)((seed >> 16) % m); };
        for (int t = 0; t < 40; t++)
        {
            int n = 1 + rnd(12);
            std::vector<w7s8::Node *> nodes;
            for (int i = 0; i < n; i++) nodes.push_back(new w7s8::Node(i));
            std::string edges = "[";
            for (int i = 1; i < n; i++)
            {
                int parent = rnd(i);
                nodes[parent]->children.push_back(nodes[i]);
                edges += std::string(i > 1 ? "," : "") + "[" + std::to_string(parent) + "," + std::to_string(i) + "]";
            }
            edges += "]";
            std::vector<int> gifts(n, 0);
            w7s8::countGifts(nodes[0], gifts);
            std::cout << (t ? "," : "") << "{\"n\": " << n << ", \"edges\": " << edges << ", \"gifts\": [";
            for (int i = 0; i < n; i++) std::cout << (i ? "," : "") << gifts[i];
            std::cout << "]}";
            for (int i = 0; i < n; i++) delete nodes[i];
        }
    }
    std::cout << "]";

    // ---------- week 8 ----------
    // Random trees, most of them not ordered: what solutions/1.cpp says about each.
    std::cout << ",\n\"week8valid\": [";
    {
        const int NUL = -1000;
        unsigned seed = 47;
        auto rnd = [&](int m) { seed = seed * 1103515245u + 12345u; return (int)((seed >> 16) % m); };
        auto printTokens = [&](const std::vector<int> &v) { std::string s = "["; for (size_t i = 0; i < v.size(); i++) s += std::string(i ? "," : "") + (v[i] == NUL ? "null" : std::to_string(v[i])); return s + "]"; };
        auto build = [&](const std::vector<int> &a, auto make) {
            using N = decltype(make(0));
            N root = a.empty() || a[0] == NUL ? nullptr : make(a[0]);
            std::queue<N> q;
            if (root) q.push(root);
            size_t at = 1;
            while (!q.empty() && at < a.size())
            {
                N p = q.front();
                q.pop();
                if (at < a.size()) { int v = a[at++]; if (v != NUL) { p->left = make(v); q.push(p->left); } }
                if (at < a.size()) { int v = a[at++]; if (v != NUL) { p->right = make(v); q.push(p->right); } }
            }
            return root;
        };
        // A few trees that are ordered by construction, so the true case is covered too.
        std::vector<std::vector<int>> cases = {
            {2, 1, 3}, {5, 1, 4, NUL, NUL, 3, 6}, {10, 5, 15, 1, 12}, {2, 2}, {1}, {},
            {5, 3, 8, 1, 4, 7, 9}, {8, 4, 12, 2, 6, 10, 14}, {1, NUL, 2, NUL, 3},
        };
        while (cases.size() < 50)
        {
            std::vector<int> a;
            int n = 1 + rnd(10);
            for (int i = 0; i < n; i++) a.push_back(i == 0 || rnd(5) ? 1 + rnd(20) : NUL);
            cases.push_back(a);
        }
        for (size_t t = 0; t < cases.size(); t++)
        {
            w8s1::TreeNode *root = build(cases[t], [](int v) { return new w8s1::TreeNode(v); });
            std::cout << (t ? "," : "") << "{\"tokens\": " << printTokens(cases[t]) << ", \"valid\": " << (w8s1::isValidBST(root) ? "true" : "false") << "}";
            w8s1::freeTree(root);
        }
    }
    std::cout << "]";

    // Real search trees, built by inserting distinct values in a random order.
    std::cout << ",\n\"week8\": [";
    {
        unsigned seed = 48;
        auto rnd = [&](int m) { seed = seed * 1103515245u + 12345u; return (int)((seed >> 16) % m); };
        auto printVec = [](const std::vector<int> &v) { std::string s = "["; for (size_t i = 0; i < v.size(); i++) s += (i ? "," : "") + std::to_string(v[i]); return s + "]"; };
        auto printStrings = [](const std::vector<std::string> &v) { std::string s = "["; for (size_t i = 0; i < v.size(); i++) s += std::string(i ? "," : "") + "\"" + v[i] + "\""; return s + "]"; };
        auto bstOf = [](const std::vector<int> &vals, auto make) {
            using N = decltype(make(0));
            N root = nullptr;
            for (int v : vals)
            {
                if (!root) { root = make(v); continue; }
                N at = root;
                for (;;)
                {
                    if (v < at->val) { if (!at->left) { at->left = make(v); break; } at = at->left; }
                    else { if (!at->right) { at->right = make(v); break; } at = at->right; }
                }
            }
            return root;
        };
        auto levelOf = [](auto root) {
            std::vector<std::string> out;
            if (!root) return out;
            std::queue<decltype(root)> q;
            q.push(root);
            while (!q.empty())
            {
                auto x = q.front();
                q.pop();
                if (!x) { out.push_back("null"); continue; }
                out.push_back(std::to_string(x->val));
                q.push(x->left);
                q.push(x->right);
            }
            while (!out.empty() && out.back() == "null") out.pop_back();
            return out;
        };
        std::vector<std::vector<int>> orders = {
            {2, 1, 3}, {5, 3, 8, 2, 4, 7}, {4, 2, 7, 1, 3}, {40, 20, 60, 10, 30, 50, 70},
            {5, 3, 6, 2, 4, 7}, {7, 3, 15, 9, 20}, {1, 2, 3, 4, 5}, {5, 4, 3, 2, 1}, {1},
        };
        while (orders.size() < 50)
        {
            int n = 1 + rnd(9);
            std::vector<int> vals;
            for (int i = 0, v = 1; i < n; i++) { vals.push_back(v); v += 1 + rnd(3); }
            for (int i = n - 1; i > 0; i--) std::swap(vals[i], vals[rnd(i + 1)]);
            orders.push_back(vals);
        }
        for (size_t t = 0; t < orders.size(); t++)
        {
            const std::vector<int> &vals = orders[t];
            int n = (int)vals.size();
            int k = 1 + rnd(n);
            int find = rnd(2) ? vals[rnd(n)] : 1000 + rnd(5);
            int del = rnd(4) ? vals[rnd(n)] : 1000 + rnd(5);
            int add = 1000 + rnd(50);

            w8s2::TreeNode *forKth = bstOf(vals, [](int v) { return new w8s2::TreeNode(v); });
            w8s3::TreeNode *forSer = bstOf(vals, [](int v) { return new w8s3::TreeNode(v); });
            w8s5::TreeNode *forFind = bstOf(vals, [](int v) { return new w8s5::TreeNode(v); });
            w8s6::TreeNode *forAdd = bstOf(vals, [](int v) { return new w8s6::TreeNode(v); });
            w8s7::TreeNode *forDel = bstOf(vals, [](int v) { return new w8s7::TreeNode(v); });
            w8s8::TreeNode *forIter = bstOf(vals, [](int v) { return new w8s8::TreeNode(v); });

            std::vector<int> sortedValues;
            w8s2::inorder(forKth, sortedValues);
            std::vector<w8s4::ListNode *> listNodes;
            w8s4::TreeNode *balanced = w8s4::sortedListToBST(w8s4::listOf(sortedValues, listNodes));

            std::vector<int> walked;
            w8s8::BSTIterator it(forIter);
            while (it.hasNext()) walked.push_back(it.next());

            w8s5::TreeNode *found = w8s5::searchBST(forFind, find);
            // Both return the (possibly new) root: deleteNode frees the node it removes, so the
            // tree has to be freed through what came back, never through the old pointer.
            w8s6::TreeNode *afterAdd = w8s6::insertIntoBST(forAdd, add);
            w8s7::TreeNode *afterDel = w8s7::deleteNode(forDel, del);
            std::string serialized = w8s3::serialize(forSer);
            std::vector<std::string> tokens;
            {
                std::istringstream parts(serialized);
                for (std::string word; parts >> word;) tokens.push_back(word);
            }

            std::cout << (t ? "," : "") << "{\"order\": " << printVec(vals)
                      << ", \"tokens\": " << printStrings(levelOf(forKth))
                      << ", \"sorted\": " << printVec(sortedValues)
                      << ", \"k\": " << k << ", \"kth\": " << w8s2::kthSmallestStack(forKth, k)
                      << ", \"preorder\": " << printStrings(tokens)
                      << ", \"find\": " << find << ", \"found\": " << (found ? "true" : "false")
                      << ", \"insert\": " << add << ", \"afterInsert\": " << printStrings(levelOf(afterAdd))
                      << ", \"del\": " << del << ", \"afterDelete\": " << printStrings(levelOf(afterDel))
                      << ", \"balanced\": " << printStrings(levelOf(balanced))
                      << ", \"walked\": " << printVec(walked) << "}";

            w8s2::freeTree(forKth);
            w8s3::freeTree(forSer);
            w8s5::freeTree(forFind);
            w8s6::freeTree(afterAdd);
            w8s7::freeTree(afterDel);
            w8s8::freeTree(forIter);
            w8s4::freeTree(balanced);
            w8s4::freeNodes(listNodes);
        }
    }
    std::cout << "]";
    std::cout << "\n}\n";
}
