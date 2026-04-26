class EventChannel {
    constructor() {
        this._listeners = new Map();
    }

    subscribe(event, listener) {
        if (typeof listener !== 'function') throw new TypeError('Listener must be a function');
        if (!this._listeners.has(event)) this._listeners.set(event, new Set());
        this._listeners.get(event).add(listener);
        return {
            unsubscribe: () => this.unsubscribe(event, listener),
        };
    }

    unsubscribe(event, listener) {
        const set = this._listeners.get(event);
        if (set) set.delete(listener);
    }

    emit(event, ...args) {
        if (event === 'error') {
            const handlers = this._listeners.get('error');
            if (!handlers || handlers.size === 0) {
                const err = args[0] instanceof Error ? args[0] : new Error(String(args[0]));
                throw err;
            }
        }

        const handlers = this._listeners.get(event);
        if (!handlers || handlers.size === 0) return;

        for (const fn of handlers) {
            try {
                fn(...args);
            } catch (err) {
                const listenerErrorHandlers = this._listeners.get('listenerError');
                if (listenerErrorHandlers && listenerErrorHandlers.size > 0) {
                    for (const handler of listenerErrorHandlers) {
                        try { handler(err, event, fn); } catch (_) {}
                    }
                } else {
                    console.error('[EventChannel] Unhandled listener error on event "%s":', event, err);
                }
            }
        }
    }

    clear(event) {
        if (event !== undefined) this._listeners.delete(event);
        else this._listeners.clear();
    }

    listenerCount(event) {
        const set = this._listeners.get(event);
        return set ? set.size : 0;
    }
}

class Subject {
    constructor() {
        this._subs     = new Set();
        this._closed   = false;
        this._terminal = null;
    }

    subscribe(observer = {}) {
        if (typeof observer === 'function') observer = { next: observer };

        if (this._terminal) {
            if (this._terminal.kind === 'error' && observer.error) {
                try { observer.error(this._terminal.payload); } catch (_) {}
            } else if (this._terminal.kind === 'complete' && observer.complete) {
                try { observer.complete(); } catch (_) {}
            }
            return { unsubscribe: () => {} };
        }

        const sub = { ...observer, active: true };
        this._subs.add(sub);
        return {
            unsubscribe: () => {
                sub.active = false;
                this._subs.delete(sub);
            },
        };
    }

    next(value) {
        if (this._closed) return;
        for (const sub of this._subs) {
            if (!sub.active || !sub.next) continue;
            try {
                sub.next(value);
            } catch (err) {
                if (sub.error) {
                    try { sub.error(err); } catch (_) {}
                }
            }
        }
    }

    error(err) {
        if (this._closed) return;
        this._closed   = true;
        this._terminal = { kind: 'error', payload: err };

        let hadHandler = false;
        for (const sub of [...this._subs]) {
            sub.active = false;
            if (sub.error) {
                hadHandler = true;
                try { sub.error(err); } catch (_) {}
            }
        }
        this._subs.clear();

        if (!hadHandler) throw err;
    }

    complete() {
        if (this._closed) return;
        this._closed   = true;
        this._terminal = { kind: 'complete' };

        for (const sub of [...this._subs]) {
            sub.active = false;
            if (sub.complete) {
                try { sub.complete(); } catch (_) {}
            }
        }
        this._subs.clear();
    }

    get subscriberCount() { return this._subs.size; }
    get isClosed()        { return this._closed; }
}

export { EventChannel, Subject };
