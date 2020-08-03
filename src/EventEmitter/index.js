
const RECORDER = Symbol('recorder key');

class EventEmitter{
    [RECORDER] = new Map
    emit(eventType, ...args){
        if(Array.isArray(this[RECORDER].get(eventType))){
            this[RECORDER].get(eventType).forEach(handler => {
                handler(...args);
            });
        }
    }
    addListener(eventType, handler){
        if(!Array.isArray(this[RECORDER].get(eventType))){
            this[RECORDER].set(eventType, []);
        }
        this[RECORDER].get(eventType).push(handler);
        return this;
    }
    on(eventType, handler){
        return this.addListener(eventType, handler);
    }
}

export default EventEmitter;