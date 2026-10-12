#include <iostream>
#include <vector>
#include <stack>
#include <algorithm>

// Data structure to represent an interval
struct Interval
{
    int begin, end;

    bool operator<(const Interval &i) const
    {
        return (begin < i.begin);
    }

    friend std::ostream &operator<<(std::ostream &os, const Interval &i)
    {
        os << "{" << i.begin << ", " << i.end << "}\n";
        return os;
    }
};

// Обръща реда на елементите във вектора
void reverse(std::vector<Interval> &intervals)
{
    for (size_t i = 0; i < intervals.size() / 2; i++)
    {
        std::swap(intervals[i], intervals[intervals.size() - 1 - i]);
    }
}

// Function to merge overlapping intervals
void mergeIntervals(std::vector<Interval> intervals) // no-ref, no-const
{
    // sort the intervals in increasing order of their starting time
    sort(intervals.begin(), intervals.end());

    // create an empty stack
    std::stack<Interval> st;

    // do for each interval
    for (const Interval &curr : intervals)
    {
        // if the stack is empty or the top interval in the stack does not overlap
        // with the current interval, push it into the stack
        if (st.empty() || curr.begin > st.top().end)
        {
            st.push(curr);
        }

        // if the top interval of the stack overlaps with the current interval,
        // merge two intervals by updating the end of the top interval
        // to the current interval
        if (st.top().end < curr.end)
        {
            st.top().end = curr.end;
        }
    }

    // стекът ги връща в обратен ред, затова първо ги събираме и обръщаме
    std::vector<Interval> merged;
    while (!st.empty())
    {
        merged.push_back(st.top());
        st.pop();
    }

    reverse(merged);

    // print all non-overlapping intervals
    for (const Interval &interval : merged)
    {
        std::cout << interval;
    }
}

int main()
{
    std::vector<Interval> intervals = {{1, 5}, {2, 3}, {4, 6}, {7, 8}, {8, 10}, {12, 15}};

    mergeIntervals(intervals);
}