class BiDirectionalPriorityQueue {
    constructor() {
        this.items = [];
    }

    enqueue(item, priority = 0) {
        const entry = { item, priority, timestamp: Date.now() };
        let inserted = false;

        for (let i = 0; i < this.items.length; i++) {
            if (entry.priority > this.items[i].priority) {
                this.items.splice(i, 0, entry);
                inserted = true;
                break;
            }
        }

        if (!inserted) {
            this.items.push(entry);
        }
    }

    dequeueHighest() {
        if (this.items.length === 0) return null;
        return this.items.shift().item;
    }

    dequeueLowest() {
        if (this.items.length === 0) return null;
        return this.items.pop().item;
    }

    dequeueOldest() {
        if (this.items.length === 0) return null;
        
        let idx = 0;
        for (let i = 1; i < this.items.length; i++) {
            if (this.items[i].timestamp < this.items[idx].timestamp) {
                idx = i;
            }
        }
        
        return this.items.splice(idx, 1)[0].item;
    }

    dequeueNewest() {
        if (this.items.length === 0) return null;
        
        let idx = 0;
        for (let i = 1; i < this.items.length; i++) {
            if (this.items[i].timestamp > this.items[idx].timestamp) {
                idx = i;
            }
        }
        
        return this.items.splice(idx, 1)[0].item;
    }

    peekHighest() {
        if (this.items.length === 0) return null;
        return this.items[0].item;
    }

    peekLowest() {
        if (this.items.length === 0) return null;
        return this.items[this.items.length - 1].item;
    }

    peekOldest() {
        if (this.items.length === 0) return null;
        
        let idx = 0;
        for (let i = 1; i < this.items.length; i++) {
            if (this.items[i].timestamp < this.items[idx].timestamp) {
                idx = i;
            }
        }
        
        return this.items[idx].item;
    }

    peekNewest() {
        if (this.items.length === 0) return null;
        
        let idx = 0;
        for (let i = 1; i < this.items.length; i++) {
            if (this.items[i].timestamp > this.items[idx].timestamp) {
                idx = i;
            }
        }
        
        return this.items[idx].item;
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
