import { createLogDecorator, wrapWithLog } from 'generators-lib';


function example1_info() {
    console.log('\n=== Example 1: INFO level ===');

    const logInfo = createLogDecorator({ level: 'INFO' });

    function add(a, b) { return a + b; }
    const loggedAdd = logInfo(add);

    loggedAdd(3, 7);
    loggedAdd(10, 20);
}


function example2_debug_structured() {
    console.log('\n=== Example 2: DEBUG + structured JSON ===');

    const logDebug = createLogDecorator({ level: 'DEBUG', structured: true });

    function multiply(x, y) { return x * y; }
    const logged = logDebug(multiply);

    logged(6, 7);
}


function example3_error_level() {
    console.log('\n=== Example 3: ERROR level (silent on success) ===');

    const logError = createLogDecorator({ level: 'ERROR' });

    function riskyDivide(a, b) {
        if (b === 0) throw new RangeError('Division by zero');
        return a / b;
    }

    const logged = logError(riskyDivide);

    console.log('  10 / 2 =', logged(10, 2));
    try {
        logged(10, 0);
    } catch (_) {}
}


async function example4_async() {
    console.log('\n=== Example 4: async function ===');

    const logInfo = createLogDecorator({ level: 'INFO' });

    async function fetchUser(id) {
        await new Promise(r => setTimeout(r, 50));
        if (id <= 0) throw new Error(`Invalid user id: ${id}`);
        return { id, name: `User #${id}` };
    }

    const logged = logInfo(fetchUser);

    const user = await logged(42);
    console.log('  Result:', user);

    try {
        await logged(-1);
    } catch (_) {}
}


function example5_customFormatter() {
    console.log('\n=== Example 5: custom formatter ===');

    const COLORS = { call: '\x1b[36m', return: '\x1b[32m', throw: '\x1b[31m', reset: '\x1b[0m' };

    const logColored = createLogDecorator({
        level: 'DEBUG',
        formatter(entry) {
            const color = COLORS[entry.phase] || '';
            const ts    = entry.timestamp.slice(11, 23);
            return `${color}[${ts}] ${entry.fn}.${entry.phase}${COLORS.reset}`;
        },
    });

    function greet(name) { return `Hello, ${name}!`; }
    const logged = logColored(greet);

    logged('world');
}


function example6_override() {
    console.log('\n=== Example 6: per-function level override ===');

    const decorator = createLogDecorator({ level: 'ERROR' });

    function heavyCalc(n) {
        return n * n;
    }

    const logged = decorator(heavyCalc, { level: 'DEBUG' });
    logged(9);
}


(async () => {
    example1_info();
    example2_debug_structured();
    example3_error_level();
    await example4_async();
    example5_customFormatter();
    example6_override();
    console.log('\nDone.\n');
})().catch(err => { console.error(err); process.exit(1); });
