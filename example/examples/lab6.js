import { chunkStream, paginatedStream, processStream } from 'generators-lib';

async function example1_chunkStream() {
    console.log('\n=== Example 1: chunkStream ===');

    const bigArray = Array.from({ length: 10_000 }, (_, i) => i + 1);
    let totalSum   = 0;
    let chunkCount = 0;

    const stream = chunkStream(bigArray, { chunkSize: 1000 });

    const stats = await processStream(stream, async (chunk) => {
        chunkCount++;
        totalSum += chunk.reduce((a, b) => a + b, 0);
        await new Promise(r => setTimeout(r, 2));
        process.stdout.write(`  chunk #${chunkCount} processed (${chunk.length} items)\r`);
    });

    console.log(`\n  Done — chunks: ${chunkCount}, sum: ${totalSum}, time: ${stats.elapsed}ms`);
}

async function example2_paginatedStream() {
    console.log('\n=== Example 2: paginatedStream ===');

    const DB = [
        [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }],
        [{ id: 3, name: 'Carol' }, { id: 4, name: 'Dave' }],
        [{ id: 5, name: 'Eve' }],
        [],
    ];

    async function fetchPage(page) {
        await new Promise(r => setTimeout(r, 10));
        return DB[page] || [];
    }

    const users = [];
    for await (const user of paginatedStream(fetchPage)) {
        users.push(user);
    }

    console.log('  Fetched users:', users.map(u => u.name).join(', '));
}

async function example3_errorPropagation() {
    console.log('\n=== Example 3: error propagation ===');

    async function* brokenSource() {
        yield 'item-1';
        yield 'item-2';
        throw new Error('Producer exploded mid-stream');
    }

    try {
        for await (const item of brokenSource()) {
            console.log('  Received:', item);
        }
    } catch (err) {
        console.log('  Consumer caught error:', err.message);
    }
}

async function example4_abort() {
    console.log('\n=== Example 4: abort mid-stream ===');

    const controller = new AbortController();
    const bigArray   = Array.from({ length: 100 }, (_, i) => i);

    setTimeout(() => controller.abort('user cancelled'), 80);

    let received = 0;
    try {
        for await (const chunk of chunkStream(bigArray, {
            chunkSize: 10,
            delayMs:   20,
            signal:    controller.signal,
        })) {
            received += chunk.length;
        }
        console.log(`  Finished without abort (received ${received} items)`);
    } catch (err) {
        console.log(`  Aborted after ${received} items — reason: ${err.message}`);
    }
}

(async () => {
    await example1_chunkStream();
    await example2_paginatedStream();
    await example3_errorPropagation();
    await example4_abort();
    console.log('\nDone.\n');
})().catch(err => { console.error(err); process.exit(1); });
