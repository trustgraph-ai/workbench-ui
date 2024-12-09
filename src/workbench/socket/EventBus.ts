
export class EventBus {

    callbacks = [];

    constructor() {
    }

    register(callback) {
        this.callbacks.push(callback);
    }

    unregister(callback) {
        const index = this.callbacks.indexOf(callback);
        if (index > -1) {
            this.callbacks.splice(index, 1);
        }
    }

    execute(...args) {
        const callbacks = this.callbacks.slice(0);
        callbacks.forEach((callback) => {
            callback(...args);
        });
    }

};

