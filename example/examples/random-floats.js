const { randomNumberGenerator, timeoutIterator } = require('generators-lib');

async function demo() {
    console.log('Random Floats Demo');
    console.log('Generating random floats between 0 and 1 for 5 seconds...');
    console.log();
    
    const generator = randomNumberGenerator({
        minValue: 0,
        maxValue: 1,
        useFloats: true
    });
    
    await timeoutIterator(generator, 5, { delayMs: 150 });
}

demo().catch(console.error);
