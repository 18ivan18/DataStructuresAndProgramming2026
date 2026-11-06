#include <cassert>
#include <vector>

class MyCircularDeque
{
private:
    std::vector<int> arr;
    int capacity;
    int first;
    int n;

public:
    MyCircularDeque(int k) : arr(k), capacity(k), first(0), n(0)
    {
    }

    bool insertFront(int value)
    {
        if (isFull())
        {
            return false;
        }

        first = (first - 1 + capacity) % capacity;
        arr[first] = value;
        n++;

        return true;
    }

    bool insertLast(int value)
    {
        if (isFull())
        {
            return false;
        }

        arr[(first + n) % capacity] = value;
        n++;

        return true;
    }

    bool deleteFront()
    {
        if (isEmpty())
        {
            return false;
        }

        first = (first + 1) % capacity;
        n--;

        return true;
    }

    bool deleteLast()
    {
        if (isEmpty())
        {
            return false;
        }

        n--;

        return true;
    }

    int getFront() const
    {
        return isEmpty() ? -1 : arr[first];
    }

    int getRear() const
    {
        return isEmpty() ? -1 : arr[(first + n - 1) % capacity];
    }

    bool isEmpty() const
    {
        return n == 0;
    }

    bool isFull() const
    {
        return n == capacity;
    }
};

int main()
{
    MyCircularDeque myCircularDeque(3);

    assert(myCircularDeque.insertLast(1));
    assert(myCircularDeque.insertLast(2));
    assert(myCircularDeque.insertFront(3));
    assert(!myCircularDeque.insertFront(4));
    assert(myCircularDeque.getRear() == 2);
    assert(myCircularDeque.isFull());
    assert(myCircularDeque.deleteLast());
    assert(myCircularDeque.insertFront(4));
    assert(myCircularDeque.getFront() == 4);

    MyCircularDeque empty(2);

    assert(empty.isEmpty());
    assert(empty.getFront() == -1);
    assert(empty.getRear() == -1);
    assert(!empty.deleteFront());
    assert(!empty.deleteLast());

    MyCircularDeque wrapping(3);

    for (int i = 0; i < 10; i++)
    {
        assert(wrapping.insertLast(i));
        assert(wrapping.getRear() == i);
        assert(wrapping.getFront() == i);
        assert(wrapping.deleteFront());
    }

    assert(wrapping.isEmpty());

    MyCircularDeque single(1);

    assert(single.insertFront(7));
    assert(single.isFull());
    assert(single.getFront() == 7 && single.getRear() == 7);
    assert(!single.insertLast(8));
    assert(single.deleteLast());
    assert(single.isEmpty());
    assert(single.insertLast(9));
    assert(single.getFront() == 9);

    MyCircularDeque bothEnds(4);

    assert(bothEnds.insertFront(2));
    assert(bothEnds.insertFront(1));
    assert(bothEnds.insertLast(3));
    assert(bothEnds.insertLast(4));
    assert(bothEnds.getFront() == 1);
    assert(bothEnds.getRear() == 4);
    assert(bothEnds.deleteFront());
    assert(bothEnds.getFront() == 2);
    assert(bothEnds.deleteLast());
    assert(bothEnds.getRear() == 3);
}
