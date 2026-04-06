function createMemoizedFunction(fn, options = {}) {
    const {
        maxSize = Infinity,
        evictionPolicy = 'LRU',
        ttl = null,
        customEvictionFn = null
    } = options;

    const cache = new Map();
    const accessHistory = new Map();
    const accessCounts = new Map();
    const expiryTimes = new Map();
    let accessOrder = 0;

    function getCacheKey(args) {
        return JSON.stringify(args);
    }

    function evictLRU() {
        let lruKey = null;
        let minAccess = Infinity;

        for (const [key, access] of accessHistory) {
            if (access < minAccess) {
                minAccess = access;
                lruKey = key;
            }
        }

        if (lruKey !== null) {
            cache.delete(lruKey);
            accessHistory.delete(lruKey);
            accessCounts.delete(lruKey);
            expiryTimes.delete(lruKey);
        }
    }

    function evictLFU() {
        let lfuKey = null;
        let minCount = Infinity;

        for (const [key, count] of accessCounts) {
            if (count < minCount) {
                minCount = count;
                lfuKey = key;
            }
        }

        if (lfuKey !== null) {
            cache.delete(lfuKey);
            accessHistory.delete(lfuKey);
            accessCounts.delete(lfuKey);
            expiryTimes.delete(lfuKey);
        }
    }

    function evictExpired() {
        const now = Date.now();
        const keysToDelete = [];

        for (const [key, expiry] of expiryTimes) {
            if (now > expiry) {
                keysToDelete.push(key);
            }
        }

        keysToDelete.forEach(key => {
            cache.delete(key);
            accessHistory.delete(key);
            accessCounts.delete(key);
            expiryTimes.delete(key);
        });
    }

    function enforceEvictionPolicy() {
        if (cache.size >= maxSize) {
            if (customEvictionFn) {
                const keys = Array.from(cache.keys());
                const keyToRemove = customEvictionFn(keys, cache, accessHistory, accessCounts);
                if (keyToRemove !== null && keyToRemove !== undefined) {
                    cache.delete(keyToRemove);
                    accessHistory.delete(keyToRemove);
                    accessCounts.delete(keyToRemove);
                    expiryTimes.delete(keyToRemove);
                }
            } else {
                switch (evictionPolicy) {
                    case 'LRU':
                        evictLRU();
                        break;
                    case 'LFU':
                        evictLFU();
                        break;
                    default:
                        evictLRU();
                }
            }
        }
    }

    function isAsync() {
        return fn.constructor.name === 'AsyncFunction' || fn[Symbol.toStringTag] === 'AsyncFunction';
    }

    if (isAsync()) {
        return async function memoized(...args) {
            evictExpired();

            const key = getCacheKey(args);

            if (cache.has(key)) {
                accessOrder++;
                accessHistory.set(key, accessOrder);
                const count = (accessCounts.get(key) || 0) + 1;
                accessCounts.set(key, count);
                return cache.get(key);
            }

            const result = await fn(...args);

            enforceEvictionPolicy();

            accessOrder++;
            cache.set(key, result);
            accessHistory.set(key, accessOrder);
            accessCounts.set(key, 1);

            if (ttl !== null) {
                expiryTimes.set(key, Date.now() + ttl);
            }

            return result;
        };
    }

    return function memoized(...args) {
        evictExpired();

        const key = getCacheKey(args);

        if (cache.has(key)) {
            accessOrder++;
            accessHistory.set(key, accessOrder);
            const count = (accessCounts.get(key) || 0) + 1;
            accessCounts.set(key, count);
            return cache.get(key);
        }

        const result = fn(...args);

        enforceEvictionPolicy();

        accessOrder++;
        cache.set(key, result);
        accessHistory.set(key, accessOrder);
        accessCounts.set(key, 1);

        if (ttl !== null) {
            expiryTimes.set(key, Date.now() + ttl);
        }

        return result;
    };
}

module.exports = {
    createMemoizedFunction
};
