#ifndef SINGLY_LINKED_LIST
#define SINGLY_LINKED_LIST
#include <stdexcept>

template <typename T>
class SinglyLinkedList
{
private:
	struct Node
	{
		T data;
		Node *next;

		Node(const T &data) : data(data), next(nullptr)
		{
		}
	};

	int n;		 // number of elements in the list
	Node *first; // beginning of the list
	Node *last;	 // end of the list

public:
	SinglyLinkedList();
	SinglyLinkedList(const SinglyLinkedList<T> &other);
	SinglyLinkedList<T> &operator=(const SinglyLinkedList<T> &other);
	~SinglyLinkedList();

private:
	void copyFrom(const SinglyLinkedList<T> &other);
	void free();

	Node *nodeAt(int index) const;

public:
	void pushFront(const T &el);
	void pushBack(const T &el);
	void insertAt(int index, const T &el);

	T popFront();
	T removeAt(int index);
	void removeAll(const T &el);

	const T &at(int index) const;
	int find(const T &el) const;
	bool isEmpty() const;
	int size() const;
};

template <typename T>
int SinglyLinkedList<T>::size() const
{
	return n;
}

template <typename T>
bool SinglyLinkedList<T>::isEmpty() const
{
	return n == 0;
}

template <typename T>
void SinglyLinkedList<T>::pushFront(const T &el)
{
	Node *node = new Node(el);
	node->next = first;
	first = node;

	if (!last)
	{
		last = node;
	}

	n++;
}

template <typename T>
void SinglyLinkedList<T>::pushBack(const T &el)
{
	Node *node = new Node(el);

	if (isEmpty())
	{
		first = last = node;
	}
	else
	{
		last->next = node;
		last = node;
	}

	n++;
}

template <typename T>
void SinglyLinkedList<T>::insertAt(int index, const T &el)
{
	if (index < 0 || index > n)
	{
		throw std::out_of_range("Invalid index!");
	}

	if (index == 0)
	{
		pushFront(el);
		return;
	}

	if (index == n)
	{
		pushBack(el);
		return;
	}

	Node *previous = nodeAt(index - 1);
	Node *node = new Node(el);

	node->next = previous->next;
	previous->next = node;

	n++;
}

template <typename T>
T SinglyLinkedList<T>::popFront()
{
	if (isEmpty())
	{
		throw std::length_error("Empty list!");
	}

	Node *oldFirst = first;
	T item = first->data;

	first = first->next;
	delete oldFirst;
	n--;

	if (isEmpty())
	{
		last = nullptr;
	}

	return item;
}

template <typename T>
T SinglyLinkedList<T>::removeAt(int index)
{
	if (index < 0 || index >= n)
	{
		throw std::out_of_range("Invalid index!");
	}

	if (index == 0)
	{
		return popFront();
	}

	Node *previous = nodeAt(index - 1);
	Node *toRemove = previous->next;
	T item = toRemove->data;

	previous->next = toRemove->next;

	if (toRemove == last)
	{
		last = previous;
	}

	delete toRemove;
	n--;

	return item;
}

template <typename T>
void SinglyLinkedList<T>::removeAll(const T &el)
{
	Node *current = first;
	Node *previous = nullptr;

	while (current)
	{
		if (current->data != el)
		{
			previous = current;
			current = current->next;
			continue;
		}

		Node *toRemove = current;
		current = current->next;

		if (previous)
		{
			previous->next = current;
		}
		else
		{
			first = current;
		}

		if (toRemove == last)
		{
			last = previous;
		}

		delete toRemove;
		n--;
	}
}

template <typename T>
const T &SinglyLinkedList<T>::at(int index) const
{
	if (index < 0 || index >= n)
	{
		throw std::out_of_range("Invalid index!");
	}

	return nodeAt(index)->data;
}

template <typename T>
int SinglyLinkedList<T>::find(const T &el) const
{
	Node *iter = first;
	int index = 0;

	while (iter)
	{
		if (iter->data == el)
		{
			return index;
		}

		iter = iter->next;
		index++;
	}

	return -1;
}

template <typename T>
typename SinglyLinkedList<T>::Node *SinglyLinkedList<T>::nodeAt(int index) const
{
	Node *iter = first;

	while (index--)
	{
		iter = iter->next;
	}

	return iter;
}

template <typename T>
SinglyLinkedList<T>::SinglyLinkedList() : n(0), first(nullptr), last(nullptr)
{
}

template <typename T>
SinglyLinkedList<T>::SinglyLinkedList(const SinglyLinkedList<T> &other) : SinglyLinkedList()
{
	copyFrom(other);
}

template <typename T>
SinglyLinkedList<T> &SinglyLinkedList<T>::operator=(const SinglyLinkedList<T> &other)
{
	if (this != &other)
	{
		free();
		copyFrom(other);
	}

	return *this;
}

template <typename T>
SinglyLinkedList<T>::~SinglyLinkedList()
{
	free();
}

template <typename T>
void SinglyLinkedList<T>::copyFrom(const SinglyLinkedList<T> &other)
{
	Node *iter = other.first;

	while (iter)
	{
		pushBack(iter->data);
		iter = iter->next;
	}
}

template <typename T>
void SinglyLinkedList<T>::free()
{
	while (!isEmpty())
	{
		popFront();
	}
}

#endif