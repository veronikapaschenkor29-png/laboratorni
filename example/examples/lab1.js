import { randomNumberGenerator, timeoutIterator } from 'generators-lib';

async function integers() {
    console.log('\n=== Цілі числа від 1 до 100 ===');
    const gen = randomNumberGenerator({ minValue: 1, maxValue: 100, useFloats: false });
    await timeoutIterator(gen, 3, { delayMs: 150 });
}

async function floats() {
    console.log('\n=== Дробові числа від 0 до 1 ===');
    const gen = randomNumberGenerator({ minValue: 0, maxValue: 1, useFloats: true });
    await timeoutIterator(gen, 3, { delayMs: 150 });
}

async function withCustomProcessor() {
    console.log('\n=== Кастомний процесор (прогрес-бар) ===');
    const gen = randomNumberGenerator({ minValue: 0, maxValue: 100, useFloats: false });
    const bar = (value, count, _, avg) => {
        const filled = '█'.repeat(Math.floor(value / 5));
        const empty  = '░'.repeat(20 - Math.floor(value / 5));
        console.log(`#${count.toString().padStart(3, '0')} |${filled}${empty}| ${value}%  avg: ${avg.toFixed(1)}`);
    };
    await timeoutIterator(gen, 3, { processFunc: bar, delayMs: 200 });
}

await integers();
await floats();
await withCustomProcessor();
