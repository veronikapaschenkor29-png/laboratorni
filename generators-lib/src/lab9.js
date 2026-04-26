const LEVEL_NUM = { DEBUG: 0, INFO: 1, ERROR: 2 };

function makeEntry(level, fnName, phase, data) {
    return {
        timestamp: new Date().toISOString(),
        level,
        fn: fnName,
        phase,
        ...data,
    };
}

function createLogDecorator(decoratorOptions = {}) {
    const {
        level:     configLevel = 'INFO',
        output                 = 'console',
        structured             = false,
        formatter              = null,
        logger                 = console,
    } = decoratorOptions;

    const minLevel = LEVEL_NUM[configLevel] ?? LEVEL_NUM.INFO;

    function emit(entry) {
        let text;
        if (structured) {
            text = JSON.stringify(entry);
        } else if (typeof formatter === 'function') {
            text = formatter(entry);
        } else {
            const prefix = `[${entry.timestamp}] [${entry.level}] ${entry.fn}`;
            if (entry.phase === 'call')   text = `${prefix} called  args=${JSON.stringify(entry.args)}`;
            if (entry.phase === 'return') text = `${prefix} returned ${JSON.stringify(entry.result)} (${entry.elapsedMs}ms)`;
            if (entry.phase === 'throw')  text = `${prefix} threw    ${entry.error} (${entry.elapsedMs}ms)`;
        }

        if (typeof output === 'function') {
            output(entry);
        } else if (entry.level === 'ERROR') {
            logger.error(text);
        } else {
            logger.log(text);
        }
    }

    return function decorate(fn, callOpts = {}) {
        const fnName   = callOpts.name || fn.name || 'anonymous';
        const fnLevel  = callOpts.level ? callOpts.level.toUpperCase() : configLevel.toUpperCase();
        const fnMinLvl = LEVEL_NUM[fnLevel] ?? minLevel;

        const isAsync = fn.constructor.name === 'AsyncFunction';

        if (isAsync) {
            return async function loggedAsync(...args) {
                const start = Date.now();

                if (fnMinLvl <= LEVEL_NUM.INFO) {
                    emit(makeEntry(fnLevel, fnName, 'call', { args }));
                }

                try {
                    const result = await fn(...args);
                    const elapsedMs = Date.now() - start;

                    if (fnMinLvl <= LEVEL_NUM.INFO) {
                        emit(makeEntry(fnLevel, fnName, 'return', { result, elapsedMs }));
                    }

                    return result;
                } catch (err) {
                    const elapsedMs = Date.now() - start;
                    emit(makeEntry('ERROR', fnName, 'throw', {
                        error: err.message,
                        stack: err.stack,
                        elapsedMs,
                    }));
                    throw err;
                }
            };
        }

        return function loggedSync(...args) {
            const start = Date.now();

            if (fnMinLvl <= LEVEL_NUM.INFO) {
                emit(makeEntry(fnLevel, fnName, 'call', { args }));
            }

            try {
                const result = fn(...args);
                const elapsedMs = Date.now() - start;

                if (fnMinLvl <= LEVEL_NUM.INFO) {
                    emit(makeEntry(fnLevel, fnName, 'return', { result, elapsedMs }));
                }

                return result;
            } catch (err) {
                const elapsedMs = Date.now() - start;
                emit(makeEntry('ERROR', fnName, 'throw', {
                    error: err.message,
                    stack: err.stack,
                    elapsedMs,
                }));
                throw err;
            }
        };
    };
}

function wrapWithLog(fn, options = {}) {
    return createLogDecorator(options)(fn);
}

export { createLogDecorator, wrapWithLog };
