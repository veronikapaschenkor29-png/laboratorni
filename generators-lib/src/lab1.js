function* randomNumberGenerator({ minValue = 0, maxValue = 100, useFloats = false } = {}) {
    while (true) {
        if (useFloats) {
            yield Math.random() * (maxValue - minValue) + minValue;
        } else {
            yield Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;
        }
    }
}

async function timeoutIterator(iterator, timeoutSeconds, options = {}) {
    const { 
        processFunc = null, 
        delayMs = 100 
    } = options;
    
    const startTime = Date.now();
    const timeoutMs = timeoutSeconds * 1000;
    let iterationCount = 0;
    let total = 0;
    
    const defaultProcess = (value, count, runningTotal, avg) => {
        const timestamp = new Date().toISOString().substr(11, 12);
        
        if (typeof value === 'number') {
            console.log(
                `[${timestamp}] Iteration ${count}: Value = ${value.toFixed(4)} | ` +
                `Total = ${runningTotal.toFixed(4)} | Average = ${avg.toFixed(4)}`
            );
        } else {
            console.log(`[${timestamp}] Iteration ${count}: Value = ${value}`);
        }
    };
    
    const processor = processFunc || defaultProcess;
    
    console.log(`Starting timeout iterator for ${timeoutSeconds} seconds...`);
    console.log('-'.repeat(70));
    
    while (true) {
        const elapsedTime = Date.now() - startTime;
        
        if (elapsedTime >= timeoutMs) {
            break;
        }
        
        const result = iterator.next();
        
        if (result.done) {
            console.log('Iterator exhausted before timeout.');
            break;
        }
        
        const value = result.value;
        iterationCount++;
        
        if (typeof value === 'number') {
            total += value;
        }
        const average = iterationCount > 0 ? total / iterationCount : 0;
        
        processor(value, iterationCount, total, average);
        
        if (delayMs > 0) {
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
    }
    
    console.log('-'.repeat(70));
    console.log(
        `Timeout reached! Processed ${iterationCount} iterations in ` +
        `${timeoutSeconds.toFixed(2)} seconds.`
    );
    
    const finalAverage = iterationCount > 0 ? total / iterationCount : 0;
    if (iterationCount > 0) {
        console.log(
            `Final statistics: Total = ${total.toFixed(4)}, ` +
            `Average = ${finalAverage.toFixed(4)}`
        );
    }
    
    return {
        iterationCount,
        total,
        average: finalAverage
    };
}

export { randomNumberGenerator, timeoutIterator };
