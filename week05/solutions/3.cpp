#include <cassert>
#include <list>
#include <string>
class BrowserHistory
{
    std::list<std::string> history;
    std::list<std::string>::iterator it;

public:
    BrowserHistory(std::string homepage)
    {
        history.push_back(homepage);
        it = history.begin();
    }

    void visit(std::string url)
    {
        auto next = it;
        next++;
        history.erase(next, history.end());
        history.push_back(url);
        it++;
    }

    std::string back(int steps)
    {
        while (it != history.begin() && steps--)
        {
            it--;
        }
        return *it;
    }

    std::string forward(int steps)
    {
        while (it != --history.end() && steps--)
        {
            it++;
        }
        return *it;
    }
};

int main()
{
    BrowserHistory browserHistory("ivanarabadzhiyski.com");

    browserHistory.visit("google.com");
    browserHistory.visit("facebook.com");
    browserHistory.visit("youtube.com");

    assert(browserHistory.back(1) == "facebook.com");
    assert(browserHistory.back(1) == "google.com");
    assert(browserHistory.forward(1) == "facebook.com");

    browserHistory.visit("linkedin.com");

    assert(browserHistory.forward(2) == "linkedin.com");
    assert(browserHistory.back(2) == "google.com");
    assert(browserHistory.back(7) == "ivanarabadzhiyski.com");
    assert(browserHistory.forward(100) == "linkedin.com");
}
