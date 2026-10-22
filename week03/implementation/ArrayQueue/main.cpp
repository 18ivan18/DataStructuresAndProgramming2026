#include "ArrayQueue.h"
#include <iostream>

int main()
{
	ArrayQueue<int> q1;
	q1.enqueue(22);
	q1.enqueue(2);
	q1.enqueue(3);
	q1.enqueue(33);

	q1.dequeue();
	q1.dequeue();
	q1.dequeue();

	ArrayQueue<int> q2(q1);
	q2.enqueue(23);
	q2.enqueue(24);
	q2.enqueue(25);

	q1.dequeue();
	std::cout << "q1 is empty: " << std::boolalpha << q1.isEmpty() << std::endl;

	// след много добавяния и премахвания опашката обикаля масива в кръг
	ArrayQueue<int> q3;
	for (int i = 0; i < 20; i++)
	{
		q3.enqueue(i);

		if (i % 2 == 0)
		{
			q3.dequeue();
		}
	}

	std::cout << "q3 size: " << q3.size() << ", peek: " << q3.peek() << std::endl;
}