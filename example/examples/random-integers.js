const { randomNumberGenerator, timeoutIterator } = require('generators-lib');

async function demo() {
    console.log('Random Integers Demo');
    console.log('Generating random integers between 1 and 100 for 5 seconds...');
    console.log();
    
    const generator = randomNumberGenerator({
        minValue: 1,
        maxValue: 100,
        useFloats: false
    });
    
    await timeoutIterator(generator, 5, { delayMs: 150 });
}

demo().catch(console.error);
