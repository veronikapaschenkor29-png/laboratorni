const { createMemoizedFunction } = require('../src/memoization-core');

// Приклад 1: Мемоізація чисел Фібоначчі
console.log('Приклад 1: Фібоначчі');
const fib = (n) => n <= 1 ? n : fib(n - 1) + fib(n - 2);
const memoFib = createMemoizedFunction(fib, { maxSize: 50 });

console.time('Непаралізована Фібоначчі(35)');
console.log('Результат:', fib(35));
console.timeEnd('Непаралізована Фібоначчі(35)');

console.time('Мемоізована Фібоначчі(35)');
console.log('Результат:', memoFib(35));
console.timeEnd('Мемоізована Фібоначчі(35)');

// Приклад 2: Дорогі обчислення з LRU
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

// Приклад 3: LFU з TTL
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
