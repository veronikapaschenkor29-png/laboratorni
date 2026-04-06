function asyncMap(array, callback, onComplete, onError) {
    const results = new Array(array.length);
    let finished = 0;

    if (array.length === 0) {
        onComplete([]);
        return;
    }

    array.forEach((item, idx) => {
        callback(item, idx, (err, res) => {
            if (err) {
                if (onError) onError(err);
                return;
            }
            results[idx] = res;
            finished++;
            
            if (finished === array.length) {
                onComplete(results);
            }
        });
    });
}

function asyncMapPromise(array, callback) {
    return new Promise((resolve, reject) => {
        if (array.length === 0) {
            resolve([]);
            return;
        }

        const results = new Array(array.length);
        let done = 0;

        array.forEach((item, idx) => {
            Promise.resolve(callback(item, idx))
                .then(res => {
                    results[idx] = res;
                    done++;
                    if (done === array.length) {
                        resolve(results);
                    }
                })
                .catch(reject);
        });
    });
}

async function asyncMapAsync(array, callback) {
    const results = [];
    
    for (let i = 0; i < array.length; i++) {
        results[i] = await callback(array[i], i);
    }
    
    return results;
}

module.exports = {
    asyncMap,
    asyncMapPromise,
    asyncMapAsync
};
