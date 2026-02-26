const { randomNumberGenerator, timeoutIterator } = require('generators-lib');

async function main() {
    console.log('='.repeat(70));
    console.log('GENERATORS-LIB DEMO');
    console.log('='.repeat(70));
    console.log();

    console.log('Demo 1: Random Integer Generator (5 values)');
    console.log('-'.repeat(40));
    const intGen = randomNumberGenerator({ minValue: 1, maxValue: 100 });
    for (let i = 0; i < 5; i++) {
        console.log(`  Value ${i + 1}: ${intGen.next().value}`);
    }
    console.log();

    console.log('Demo 2: Random Float Generator (5 values)');
    console.log('-'.repeat(40));
    const floatGen = randomNumberGenerator({ 
        minValue: 0, 
        maxValue: 1, 
        useFloats: true 
    });
    for (let i = 0; i < 5; i++) {
        console.log(`  Value ${i + 1}: ${floatGen.next().value.toFixed(6)}`);
    }
    console.log();

    console.log('Demo 3: Timeout Iterator (3 seconds with random integers)');
    console.log('-'.repeat(40));
    const gen = randomNumberGenerator({ minValue: 1, maxValue: 50 });
    const stats = await timeoutIterator(gen, 3, { delayMs: 200 });
    
    console.log();
    console.log('Returned statistics object:', stats);
    console.log();
    console.log('='.repeat(70));
    console.log('DEMO COMPLETED');
    console.log('='.repeat(70));
}

main().catch(console.error);
