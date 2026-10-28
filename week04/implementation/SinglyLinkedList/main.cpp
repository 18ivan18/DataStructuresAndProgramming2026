#include "SinglyLinkedList.h"
#include <iostream>

int main()
{
	SinglyLinkedList<int> l1;
	l1.pushBack(2);
	l1.pushBack(3);
	l1.pushFront(1);
	l1.insertAt(3, 4);

	SinglyLinkedList<int> l2(l1);
	l2.pushBack(2);
	l2.removeAll(2);

	l1.removeAt(0);
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

	std::cout << "\nl2 contains 3 at index " << l2.find(3) << std::endl;
	std::cout << "l1 is empty: " << std::boolalpha << l1.isEmpty() << std::endl;
}