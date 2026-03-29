class BiDirectionalPriorityQueue {
    constructor() {
        this.items = [];
    }

    enqueue(item, priority = 0) {
        const entry = { item, priority, timestamp: Date.now() };
        let added = false;

        for (let i = 0; i < this.items.length; i++) {
            if (entry.priority > this.items[i].priority) {
                this.items.splice(i, 0, entry);
                added = true;
                break;
            }
        }

        if (!added) {
            this.items.push(entry);
        }
    }

    dequeueHighest() {
        return this.items.length > 0 ? this.items.shift().item : null;
    }

    dequeueLowest() {
        return this.items.length > 0 ? this.items.pop().item : null;
    }

    dequeueOldest() {
        if (this.items.length === 0) return null;
        let oldest = 0;
        for (let i = 1; i < this.items.length; i++) {
            if (this.items[i].timestamp < this.items[oldest].timestamp) {
                oldest = i;
            }
        }
        return this.items.splice(oldest, 1)[0].item;
    }

    dequeueNewest() {
        if (this.items.length === 0) return null;
        let newest = 0;
        for (let i = 1; i < this.items.length; i++) {
            if (this.items[i].timestamp > this.items[newest].timestamp) {
                newest = i;
            }
        }
        return this.items.splice(newest, 1)[0].item;
    }

    peekHighest() {
        return this.items.length > 0 ? this.items[0].item : null;
    }

    peekLowest() {
        return this.items.length > 0 ? this.items[this.items.length - 1].item : null;
    }

    peekOldest() {
        if (this.items.length === 0) return null;
        let oldest = 0;
        for (let i = 1; i < this.items.length; i++) {
            if (this.items[i].timestamp < this.items[oldest].timestamp) {
                oldest = i;
            }
        }
        return this.items[oldest].item;
    }

    peekNewest() {
        if (this.items.length === 0) return null;
        let newest = 0;
        for (let i = 1; i < this.items.length; i++) {
            if (this.items[i].timestamp > this.items[newest].timestamp) {
                newest = i;
            }
        }
        return this.items[newest].item;
    }

    isEmpty() {
        return this.items.length === 0;
    }

    size() {
        return this.items.length;
    }

    clear() {
        this.items = [];
    }
}

module.exports = {
    BiDirectionalPriorityQueue
};
