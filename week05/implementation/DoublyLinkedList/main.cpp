#include "DoublyLinkedList.h"
#include <iostream>

int main()
{
	DoublyLinkedList<int> l1;
	l1.pushBack(2);
	l1.pushBack(3);
	l1.pushFront(1);
	l1.insertAt(3, 4);

	DoublyLinkedList<int> l2(l1);
	l2.popBack();
	l2.popFront();

	std::cout << "l1: ";
	for (int i = 0; i < l1.size(); i++)
	{
		std::cout << l1.at(i) << " ";
	}

	std::cout << "\nl2: ";
	for (int i = 0; i < l2.size(); i++)
	{
		std::cout << l2.at(i) << " ";
	}

	std::cout << "\nl1 front: " << l1.front() << ", l1 back: " << l1.back() << std::endl;
	std::cout << "l1 contains 3 at index " << l1.find(3) << std::endl;
}