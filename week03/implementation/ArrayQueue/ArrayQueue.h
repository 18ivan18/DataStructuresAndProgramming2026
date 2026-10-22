#ifndef ARRAY_QUEUE
#define ARRAY_QUEUE
#include <stdexcept>

template <typename T>
class ArrayQueue
{
private:
	static const int INIT_CAPACITY = 8;

	int n;		 // number of elements on queue
	int capacity;
	int first;	 // index of the first element

	T *arr; // circular array of items

public:
	ArrayQueue();
	ArrayQueue(const ArrayQueue<T> &other);
	ArrayQueue<T> &operator=(const ArrayQueue<T> &other);
	~ArrayQueue();

private:
	void copyFrom(const ArrayQueue<T> &other);
	void free();

	void resize(int capacity);

public:
	void enqueue(const T &el);
	T dequeue();
	const T &peek();
	bool isEmpty() const;
	int size() const;
};

template <typename T>
int ArrayQueue<T>::size() const
{
	return n;
}

template <typename T>
void ArrayQueue<T>::enqueue(const T &el)
{
	if (n >= capacity)
	{
		resize(capacity * 2);
	}

	// краят се навива в началото на масива, ако там има място
	arr[(first + n) % capacity] = el;
	n++;
}

template <typename T>
T ArrayQueue<T>::dequeue()
{
	if (isEmpty())
	{
		throw std::length_error("Empty queue!");
	}

	T item = arr[first];

	// началото също се навива
	first = (first + 1) % capacity;
	n--;

	// why /4?
	if (n == capacity / 4 && n > 0)
	{
		resize(capacity / 2);
	}

	return item;
}

template <typename T>
const T &ArrayQueue<T>::peek()
{
	if (isEmpty())
	{
		throw std::length_error("Empty queue!");
	}

	return arr[first];
}

template <typename T>
bool ArrayQueue<T>::isEmpty() const
{
	return n == 0;
}

template <typename T>
ArrayQueue<T>::ArrayQueue() : n(0), capacity(INIT_CAPACITY), first(0), arr(new T[capacity])
{
}

template <typename T>
ArrayQueue<T>::ArrayQueue(const ArrayQueue<T> &other)
{
	copyFrom(other);
}

template <typename T>
ArrayQueue<T> &ArrayQueue<T>::operator=(const ArrayQueue<T> &other)
{
	if (this != &other)
	{
		free();
		copyFrom(other);
	}

	return *this;
}

template <typename T>
ArrayQueue<T>::~ArrayQueue()
{
	free();
}

template <typename T>
void ArrayQueue<T>::copyFrom(const ArrayQueue<T> &other)
{
	arr = new T[other.capacity];

	n = other.n;
	capacity = other.capacity;

	// копието започва от началото на масива, без навиване
	first = 0;

	for (int i = 0; i < n; i++)
	{
		arr[i] = other.arr[(other.first + i) % other.capacity];
	}
}

template <typename T>
void ArrayQueue<T>::free()
{
	delete[] arr;
}

template <typename T>
void ArrayQueue<T>::resize(int capacity)
{
	T *temp = new T[capacity];

	// подреждаме елементите от началото на новия масив, докато старият капацитет още се знае
	for (int i = 0; i < n; i++)
	{
		temp[i] = arr[(first + i) % this->capacity];
	}

	delete[] arr;
	arr = temp;

	this->capacity = capacity;
	first = 0;
}

#endif