const { randomNumberGenerator, timeoutIterator } = require('generators-lib');

async function demo() {
    console.log('Custom Processing Demo');
    console.log('Using a custom processor that shows progress bar style output...');
    console.log();
    
    const generator = randomNumberGenerator({
        minValue: 0,
        maxValue: 100,
        useFloats: false
    });
    
    const customProcessor = (value, count, total, average) => {
        const date = new Date();
        const dateStr = date.toLocaleDateString('uk-UA');
        const timeStr = date.toLocaleTimeString('uk-UA');
        
        const barLength = Math.floor(value / 5);
        const bar = '█'.repeat(barLength) + '░'.repeat(20 - barLength);
        
        console.log(
            `[${dateStr} ${timeStr}] #${count.toString().padStart(3, '0')} ` +
            `|${bar}| ${value.toString().padStart(3, ' ')}% ` +
            `(avg: ${average.toFixed(1)})`
        );
    };
    
    await timeoutIterator(generator, 5, { 
        processFunc: customProcessor,
        delayMs: 200 
    });
}

demo().catch(console.error);
