#ifndef DOUBLY_LINKED_LIST
#define DOUBLY_LINKED_LIST
#include <stdexcept>

template <typename T>
class DoublyLinkedList
{
private:
	struct Node
	{
		T data;
		Node *next;
		Node *previous;

		Node(const T &data) : data(data), next(nullptr), previous(nullptr)
		{
		}
	};

	int n;		 // number of elements in the list
	Node *first; // beginning of the list
	Node *last;	 // end of the list

public:
	DoublyLinkedList();
	DoublyLinkedList(const DoublyLinkedList<T> &other);
	DoublyLinkedList<T> &operator=(const DoublyLinkedList<T> &other);
	~DoublyLinkedList();

private:
	void copyFrom(const DoublyLinkedList<T> &other);
	void free();

	Node *nodeAt(int index) const;
	T removeNode(Node *node);

public:
	void pushFront(const T &el);
	void pushBack(const T &el);
	void insertAt(int index, const T &el);

	T popFront();
	T popBack();
	T removeAt(int index);

	const T &at(int index) const;
	const T &front() const;
	const T &back() const;
	int find(const T &el) const;
	bool isEmpty() const;
	int size() const;
};

template <typename T>
int DoublyLinkedList<T>::size() const
{
	return n;
}

template <typename T>
bool DoublyLinkedList<T>::isEmpty() const
{
	return n == 0;
}

template <typename T>
void DoublyLinkedList<T>::pushFront(const T &el)
{
	Node *node = new Node(el);

	if (isEmpty())
	{
		first = last = node;
	}
	else
	{
		node->next = first;
		first->previous = node;
		first = node;
	}

	n++;
}

template <typename T>
void DoublyLinkedList<T>::pushBack(const T &el)
{
	Node *node = new Node(el);

	if (isEmpty())
	{
		first = last = node;
	}
	else
	{
		node->previous = last;
		last->next = node;
		last = node;
	}

	n++;
}

template <typename T>
void DoublyLinkedList<T>::insertAt(int index, const T &el)
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

	Node *current = nodeAt(index);
	Node *node = new Node(el);

	node->previous = current->previous;
	node->next = current;
	current->previous->next = node;
	current->previous = node;

	n++;
}

template <typename T>
T DoublyLinkedList<T>::removeNode(Node *node)
{
	T item = node->data;

	if (node->previous)
	{
		node->previous->next = node->next;
	}
	else
	{
		first = node->next;
	}

	if (node->next)
	{
		node->next->previous = node->previous;
	}
	else
	{
		last = node->previous;
	}

	delete node;
	n--;

	return item;
}

template <typename T>
T DoublyLinkedList<T>::popFront()
{
	if (isEmpty())
	{
		throw std::length_error("Empty list!");
	}

	return removeNode(first);
}

template <typename T>
T DoublyLinkedList<T>::popBack()
{
	if (isEmpty())
	{
		throw std::length_error("Empty list!");
	}

	return removeNode(last);
}

template <typename T>
T DoublyLinkedList<T>::removeAt(int index)
{
	if (index < 0 || index >= n)
	{
		throw std::out_of_range("Invalid index!");
	}

	return removeNode(nodeAt(index));
}

template <typename T>
const T &DoublyLinkedList<T>::at(int index) const
{
	if (index < 0 || index >= n)
	{
		throw std::out_of_range("Invalid index!");
	}

	return nodeAt(index)->data;
}

template <typename T>
const T &DoublyLinkedList<T>::front() const
{
	if (isEmpty())
	{
		throw std::length_error("Empty list!");
	}

	return first->data;
}

template <typename T>
const T &DoublyLinkedList<T>::back() const
{
	if (isEmpty())
	{
		throw std::length_error("Empty list!");
	}

	return last->data;
}

template <typename T>
int DoublyLinkedList<T>::find(const T &el) const
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
typename DoublyLinkedList<T>::Node *DoublyLinkedList<T>::nodeAt(int index) const
{
	if (index < n / 2)
	{
		Node *iter = first;

		while (index--)
		{
			iter = iter->next;
		}

		return iter;
	}

	Node *iter = last;

	for (int i = n - 1; i > index; i--)
	{
		iter = iter->previous;
	}

	return iter;
}

template <typename T>
DoublyLinkedList<T>::DoublyLinkedList() : n(0), first(nullptr), last(nullptr)
{
}

template <typename T>
DoublyLinkedList<T>::DoublyLinkedList(const DoublyLinkedList<T> &other) : DoublyLinkedList()
{
	copyFrom(other);
}

template <typename T>
DoublyLinkedList<T> &DoublyLinkedList<T>::operator=(const DoublyLinkedList<T> &other)
{
	if (this != &other)
	{
		free();
		copyFrom(other);
	}

	return *this;
}

template <typename T>
DoublyLinkedList<T>::~DoublyLinkedList()
{
	free();
}

template <typename T>
void DoublyLinkedList<T>::copyFrom(const DoublyLinkedList<T> &other)
{
	Node *iter = other.first;

	while (iter)
	{
		pushBack(iter->data);
		iter = iter->next;
	}
}

template <typename T>
void DoublyLinkedList<T>::free()
{
	while (!isEmpty())
	{
		popFront();
	}
}

#endif