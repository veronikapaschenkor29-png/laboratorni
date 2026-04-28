# Laboratorni

Бібліотека на Node.js (ES Modules), що реалізує всі 9 лабораторних робіт.

## Запуск

```bash
cd example
npm install
npm run lab1   # Генератори
npm run lab3   # Мемоізація
npm run lab4   # Черга з пріоритетами
npm run lab5   # Async Map
npm run lab6   # Потоки
npm run lab7   # Реактивна комунікація
npm run lab8   # Auth Proxy
npm run lab9   # Декоратор логування
```

## Лабораторні роботи

### 1. Генератори

`randomNumberGenerator` — нескінченний генератор. `timeoutIterator` — споживає його протягом N секунд.

```js
import { randomNumberGenerator, timeoutIterator } from 'generators-lib';

const gen = randomNumberGenerator({ minValue: 1, maxValue: 100, useFloats: false });
await timeoutIterator(gen, 5, { delayMs: 150 });

const customProcessor = (value, count, _, avg) => {
    const bar = '█'.repeat(Math.floor(value / 5)) + '░'.repeat(20 - Math.floor(value / 5));
    console.log(`#${count} |${bar}| ${value}%  avg: ${avg.toFixed(1)}`);
};
await timeoutIterator(gen, 5, { processFunc: customProcessor, delayMs: 200 });
```

### 2. Налаштування проєкту

Бібліотека підключається як локальна залежність. Обидва пакети використовують ES Modules.

```json
{
  "type": "module",
  "dependencies": {
    "generators-lib": "file:../generators-lib"
  }
}
```

### 3. Мемоізація

`createMemoizedFunction(fn, options)` — кешує результати з підтримкою LRU, LFU, TTL та custom-евікції.

```js
import { createMemoizedFunction } from 'generators-lib';

const memoFib = createMemoizedFunction(
    (n) => n <= 1 ? n : memoFib(n - 1) + memoFib(n - 2),
    { maxSize: 50, evictionPolicy: 'LRU' }
);

console.log(memoFib(40)); // перший виклик — обчислення
console.log(memoFib(40)); // другий виклик — з кешу

const memoLFU = createMemoizedFunction(fn, { maxSize: 5, evictionPolicy: 'LFU', ttl: 2000 });
```

### 4. Двонаправлена черга з пріоритетами

`_heap` (сортований за пріоритетом) + `_fifo` (порядок вставки). Всі `peek*` — O(1). Монотонний `_seq` — стабільне сортування.

```js
import { BiDirectionalPriorityQueue } from 'generators-lib';

const queue = new BiDirectionalPriorityQueue();
queue.enqueue('критичний', 10);
queue.enqueue('звичайний', 3);
queue.enqueue('низький',   1);

console.log(queue.dequeueHighest()); // критичний
console.log(queue.dequeueLowest());  // низький
console.log(queue.dequeueOldest());  // звичайний (за часом вставки)
console.log(queue.dequeueNewest());  // undefined (черга порожня)
```

### 5. Асинхронні функції масивів

Три варіанти — callback (error-first), Promise, async/await. Усі підтримують `AbortSignal`.

```js
import { asyncMap, asyncMapPromise, asyncMapAsync } from 'generators-lib';

const nums = [1, 2, 3, 4, 5];

asyncMap(nums,
    (n, i, done) => setTimeout(() => done(null, n * 2), 100),
    results => console.log(results)
);

const r2 = await asyncMapPromise(nums, n => new Promise(res => setTimeout(() => res(n * 2), 100)));

const r3 = await asyncMapAsync(nums, async n => {
    await new Promise(res => setTimeout(res, 100));
    return n * 2;
});
```

### 6. Потокова обробка великих даних

```js
import { chunkStream, paginatedStream, processStream } from 'generators-lib';

const bigArray = Array.from({ length: 100_000 }, (_, i) => i);
const stream   = chunkStream(bigArray, { chunkSize: 1000 });
const stats    = await processStream(stream, async (chunk) => {
    // обробка кожного чанку окремо
});
console.log(`Оброблено за ${stats.elapsed}ms`);

for await (const item of paginatedStream(fetchPage)) {
    // посторінкова вибірка до порожньої відповіді
}
```

### 7. Реактивна комунікація

`EventChannel` — кожен listener ізольований у `try/catch`; помилки → канал `'listenerError'`. `Subject` — push-based примітив.

```js
import { EventChannel, Subject } from 'generators-lib';

const ch = new EventChannel();
ch.subscribe('listenerError', (err, ev) => console.error(ev, err.message));
ch.subscribe('msg', val => { console.log('A:', val); throw new Error('упс'); });
ch.subscribe('msg', val => console.log('B:', val)); // виконається попри помилку вище
ch.emit('msg', 'привіт');

const subj = new Subject();
subj.subscribe({ next: v => console.log('stream:', v), complete: () => console.log('done') });
subj.next(42);
subj.complete();
```

### 8. Auth Proxy з ін'єкцією залежностей

Три незалежні шари: `BaseHttpClient` → `AuthProxy(strategy)` → `LoggingProxy` / `RateLimitProxy`. Жоден шар не знає про деталі інших.

```js
import { BaseHttpClient, JwtStrategy, AuthProxy, LoggingProxy, RateLimitProxy } from 'generators-lib';

const strategy = new JwtStrategy(process.env.TOKEN, refreshTokenFn);
const client = new LoggingProxy(
    new RateLimitProxy(
        new AuthProxy(new BaseHttpClient(), strategy),
        { maxRequests: 30, windowMs: 60_000 }
    )
);

const data = await client.get('https://api.example.com/resource');
```

### 9. Декоратор логування

`createLogDecorator(options)` — фабрика-декоратор. `wrapWithLog(fn, options)` — shorthand.

```js
import { createLogDecorator, wrapWithLog } from 'generators-lib';

const withInfo = createLogDecorator({ level: 'INFO' });
const add = withInfo((a, b) => a + b);
add(3, 7); // [INFO] add(3, 7) → 10  +0ms

const withDebug = createLogDecorator({ level: 'DEBUG', structured: true });
const mul = withDebug((x, y) => x * y);
mul(6, 7); // JSON-лог з мітками часу та аргументами

const safe = wrapWithLog(riskyFn, { level: 'ERROR' });
safe(); // мовчить при успіху, логує лише виняток
```

## Структура

```
generators-lib/src/
  generators.js          — завдання 1
  timeout-iterator.js    — завдання 1
  memoization-core.js    — завдання 3
  priority-queue.js      — завдання 4
  async-array.js         — завдання 5
  stream-processor.js    — завдання 6
  observable.js          — завдання 7
  auth-proxy.js          — завдання 8
  logging-decorator.js   — завдання 9
  index.js               — re-export barrel

example/examples/
  lab1.js   — завдання 1
  lab3.js   — завдання 3
  lab4.js   — завдання 4
  lab5.js   — завдання 5
  lab6.js   — завдання 6
  lab7.js   — завдання 7
  lab8.js   — завдання 8
  lab9.js   — завдання 9
```
