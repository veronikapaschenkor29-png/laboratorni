const { createMemoizedFunction } = require('generators-lib');


console.log('Приклад 1: Фібоначчі');
const fib = (n) => n <= 1 ? n : fib(n - 1) + fib(n - 2);

const fibMemo = (n) => n <= 1 ? n : memoFib(n - 1) + memoFib(n - 2);
const memoFib = createMemoizedFunction(fibMemo, { maxSize: 50 });

console.time('Без мемоізації (15)');
console.log('Результат:', fib(15));
console.timeEnd('Без мемоізації (15)');

console.time('З мемоізацією (15)');
console.log('Результат:', memoFib(15));
console.timeEnd('З мемоізацією (15)');


console.log('\nПриклад 2: Дорогі обчислення');
const expensiveCalc = (x, y) => {
    let result = 0;
    for (let i = 0; i < 100000000; i++) {
        result += Math.sqrt(x * y + i);
    }
    return result;
};

const memoCalc = createMemoizedFunction(expensiveCalc, { 
    maxSize: 3,
    evictionPolicy: 'LRU'
});

console.time('Перший виклик');
console.log('Результат:', memoCalc(5, 10));
console.timeEnd('Перший виклик');

console.time('Другий виклик (з кешу)');
console.log('Результат:', memoCalc(5, 10));
console.timeEnd('Другий виклик (з кешу)');

console.log('\nПриклад 3: LFU з TTL');
const memoLFU = createMemoizedFunction(expensiveCalc, { 
    maxSize: 5,
    evictionPolicy: 'LFU',
    ttl: 2000
});

console.log('Результат:', memoLFU(3, 4));
console.log('Очікування 2.5 секунди...');
setTimeout(() => {
    console.log('Результат (повинен переобчислити):', memoLFU(3, 4));
}, 2500);


console.log('\nПриклад 4: Асинхронна функція');
const asyncFetch = async (url) => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({ url, data: 'response' });
        }, 500);
    });
};

const memoAsync = createMemoizedFunction(asyncFetch, { 
    maxSize: 10,
    evictionPolicy: 'LRU'
});

(async () => {
    console.time('Перший асинхронний виклик');
    const result1 = await memoAsync('https://api.example.com');
    console.log('Результат:', result1);
    console.timeEnd('Перший асинхронний виклик');

    console.time('Другий асинхронний виклик (з кешу)');
    const result2 = await memoAsync('https://api.example.com');
    console.log('Результат:', result2);
    console.timeEnd('Другий асинхронний виклик (з кешу)');
})();
