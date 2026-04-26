async function* chunkStream(data, { chunkSize = 100, delayMs = 0, signal } = {}) {
    let offset = 0;
    while (offset < data.length) {
        if (signal && signal.aborted) {
            const err = new Error(signal.reason || 'Stream aborted');
            err.name = 'AbortError';
            throw err;
        }

        const chunk = data.slice(offset, offset + chunkSize);
        offset += chunkSize;

        if (delayMs > 0) {
            await new Promise((res, rej) => {
                const t = setTimeout(res, delayMs);
                if (signal) {
                    signal.addEventListener('abort', () => {
                        clearTimeout(t);
                        const e = new Error(signal.reason || 'Stream aborted');
                        e.name = 'AbortError';
                        rej(e);
                    }, { once: true });
                }
            });
        }

        yield chunk;
    }
}

async function* paginatedStream(fetchPage, { signal } = {}) {
    let page = 0;
    while (true) {
        if (signal && signal.aborted) {
            const err = new Error('Stream aborted');
            err.name = 'AbortError';
            throw err;
        }

        let records;
        try {
            records = await fetchPage(page++);
        } catch (err) {
            throw err;
        }

        if (!records || records.length === 0) return;

        for (const record of records) {
            yield record;
        }
    }
}

async function* nodeReadableToAsyncIter(readable) {
    const queue = [];
    let done    = false;
    let error   = null;
    let notify  = null;

    function wake() { if (notify) { notify(); notify = null; } }

    readable.on('data',  chunk => { queue.push(chunk); wake(); });
    readable.on('end',   ()    => { done = true;  wake(); });
    readable.on('error', err  => { error = err;   wake(); });

    try {
        while (true) {
            if (queue.length > 0) {
                yield queue.shift();
                continue;
            }
            if (error) throw error;
            if (done)  return;
            await new Promise(res => { notify = res; });
        }
    } finally {
        readable.destroy();
    }
}

async function processStream(source, handler, { signal, onProgress } = {}) {
    let processed = 0;
    let errors    = 0;
    const start   = Date.now();

    for await (const item of source) {
        if (signal && signal.aborted) {
            const err = new Error('Processing aborted');
            err.name = 'AbortError';
            throw err;
        }

        try {
            await handler(item, processed);
        } catch (err) {
            errors++;
            if (onProgress) onProgress({ type: 'error', error: err, processed, errors });
            throw err;
        }

        processed++;
        if (onProgress) onProgress({ type: 'progress', processed, errors, elapsed: Date.now() - start });
    }

    return { processed, errors, elapsed: Date.now() - start };
}

export { chunkStream, paginatedStream, nodeReadableToAsyncIter, processStream };
