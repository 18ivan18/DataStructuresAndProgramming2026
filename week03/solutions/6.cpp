#include <cassert>
#include <vector>
#include <queue>

std::vector<int> maxSlidingWindow(std::vector<int> &nums, int k)
{
    std::deque<int> dq; // creating deque which has pop and push functions from front and back both, contains indexes
    std::vector<int> ans;
    if (nums.size() == 1 && k == 1) // edge case
    {
        ans.push_back(nums[0]);
        return ans;
    }
    for (int i = 0; i < (int)nums.size(); i++)
    {
        if (!dq.empty() && dq.front() <= i - k) // if the index is out of bound of the window's left most index
        {
            dq.pop_front(); // pop then
        }
        while (!dq.empty() && nums[i] > nums[dq.back()]) // pop until it is the maximum element in the deque
        {
            dq.pop_back();
        }
        dq.push_back(i);
        if (i >= k - 1) // for every window
        {
            ans.push_back(nums[dq.front()]);
        }
    }
    return ans;
}

int main()
{
    std::vector<int> nums = {1, 3, -1, -3, 5, 3, 6, 7};
    std::vector<int> expected = {3, 3, 5, 5, 6, 7};
    assert(maxSlidingWindow(nums, 3) == expected);

    std::vector<int> one = {1};
    expected = {1};
    assert(maxSlidingWindow(one, 1) == expected);

    std::vector<int> two = {1, -1};
    expected = {1, -1};
    assert(maxSlidingWindow(two, 1) == expected);

    std::vector<int> nine = {9, 11};
    expected = {11};
    assert(maxSlidingWindow(nine, 2) == expected);

    std::vector<int> four = {4, -2};
    expected = {4};
    assert(maxSlidingWindow(four, 2) == expected);
}