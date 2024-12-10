
export class EventBus {

    callbacks : any[] = [];

    constructor() {
    }

    register(callback : any) {
        this.callbacks.push(callback);
    }

    unregister(callback : any) {
        const index = this.callbacks.indexOf(callback);
        if (index > -1) {
            this.callbacks.splice(index, 1);
        }
    }

    execute(...args : any[]) {
        const callbacks = this.callbacks.slice(0);
        callbacks.forEach((callback) => {
            callback(...args);
        });
    }

};

