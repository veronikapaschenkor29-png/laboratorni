# Generators Library

Бібліотека для роботи з генераторами, таймер-ітераторами, мемоізацією, чергою з пріоритетами та асинхронними функціями масивів.

## Запуск демо

Перейдіть в папку `example` та запустіть потрібну команду:

```bash
cd example
npm install        # Встановлення залежностей
npm run demo:integers   # Демо випадкових цілих чисел
npm run demo:floats     # Демо випадкових дробів
npm run demo:custom     # Демо кастомної обробки
npm run demo:async      # Демо асинхронного приведення карти
npm start               # Основний скрипт
```

## Функціонал

### 1. Генератори (Generators)
- `randomNumberGenerator()` - генератор випадкових чисел з опціями для цілих та дробових значень

### 2. Таймер-ітератор (Timeout Iterator)
- `timeoutIterator()` - обробляє ітератор з заданим таймаутом
- Підтримує кастомні функції обробки
- Має опцію для затримки між ітераціями

### 3. Мемоізація (Memoization)
- `createMemoizedFunction()` - обгортає функцію для кешування результатів
- Підтримує стратегії евикції: LRU (Least Recently Used), LFU (Least Frequently Used), Time-based expiry
- Конфігурована максимальна розмір кеша

### 4. Двонаправлена черга з пріоритетами (Bi-directional Priority Queue)
- `BiDirectionalPriorityQueue` - класс числіла для роботи з черговими операціями
- Методи `enqueue()`, `dequeueHighest()`, `dequeueLowest()`, `dequeueOldest()`, `dequeueNewest()`
- Методи `peekHighest()`, `peekLowest()`, `peekOldest()`, `peekNewest()`

### 5. Асинхронні функції для масивів (Async Array Functions)
- `asyncMap()` - callback-базова версія для обробки елементів масиву асинхронно
- `asyncMapPromise()` - Promise-базова версія
- `asyncMapAsync()` - async/await версія

## Структура проекту

- `generators-lib/` - основна бібліотека
  - `src/generators.js` - генератори
  - `src/timeout-iterator.js` - таймер-ітератор
  - `src/memoization-core.js` - мемоізація
  - `src/priority-queue.js` - черга з пріоритетами
  - `src/async-array.js` - асинхронні функції для масивів
- `example/` - приклади використання
