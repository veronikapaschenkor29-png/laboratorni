const { BiDirectionalPriorityQueue } = require('../src/priority-queue');

// Приклад 1: Базові операції
console.log('Приклад 1: Базові операції з чергою');
const queue = new BiDirectionalPriorityQueue();

queue.enqueue('Завдання 1', 3);
queue.enqueue('Завдання 2', 1);
queue.enqueue('Завдання 3', 5);
queue.enqueue('Завдання 4', 2);

console.log('Розмір черги:', queue.size());
console.log('Найвищий пріоритет:', queue.peekHighest());
console.log('Найнижчий пріоритет:', queue.peekLowest());

console.log('\nВилучення за пріоритетом:');
console.log('Найвищий:', queue.dequeueHighest());
console.log('Найнищий:', queue.dequeueLowest());

// Приклад 2: Обробка запитів за пріоритетом
console.log('\nПриклад 2: Обробка запитів');
const requestQueue = new BiDirectionalPriorityQueue();

requestQueue.enqueue({ id: 1, type: 'normale' }, 2);
requestQueue.enqueue({ id: 2, type: 'urgent' }, 5);
requestQueue.enqueue({ id: 3, type: 'nieznaczny' }, 1);

console.log('Обробка запитів в порядку пріоритету:');
while (!requestQueue.isEmpty()) {
    const request = requestQueue.dequeueHighest();
    console.log(`Обробка ${request.type} запит (ID: ${request.id})`);
}

// Приклад 3: Часова послідовність
console.log('\nПриклад 3: Часова послідовність');
const timeQueue = new BiDirectionalPriorityQueue();

timeQueue.enqueue('запис 1', 1);
setTimeout(() => timeQueue.enqueue('запис 2', 2), 100);
setTimeout(() => {
    timeQueue.enqueue('запис 3', 3);
    console.log('Найстарший запис:', timeQueue.dequeueOldest());
    console.log('Найновіший запис:', timeQueue.dequeueNewest());
}, 200);
