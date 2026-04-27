import { asyncMap, asyncMapPromise, asyncMapAsync } from 'generators-lib';

function example1() {
    console.log('=== Приклад 1: Колбек-базова версія ===\n');
    
    const nums = [1, 2, 3, 4, 5];
    
    asyncMap(nums, (num, idx, done) => {
        setTimeout(() => {
            done(null, num * 2);
        }, 100);
    }, (results) => {
        console.log('Результати:', results);
        console.log();
        example2();
    }, (err) => {
        console.error('Помилка:', err);
    });
}

function example2() {
    console.log('=== Приклад 2: Promise-базова версія ===\n');
    
    const nums = [1, 2, 3, 4, 5];
    
    const asyncOp = (num) => {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(num * 2);
            }, 100);
        });
    };
    
    asyncMapPromise(nums, asyncOp)
        .then(results => {
            console.log('Результати:', results);
            console.log();
            example3();
        })
        .catch(err => console.error('Помилка:', err));
}

async function example3() {
    console.log('=== Приклад 3: Async/await версія ===\n');
    
    const nums = [1, 2, 3, 4, 5];
    
    const asyncOp = async (num) => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return num * 2;
    };
    
    try {
        const results = await asyncMapAsync(nums, asyncOp);
        console.log('Результати:', results);
    } catch (err) {
        console.error('Помилка:', err);
    }
}

example1();
