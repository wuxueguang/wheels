import { isFunc } from "../utils/funcs";

const RECORDER = Symbol('recorder property key');

class EventEmitter{
    [RECORDER] = new Map
    emit(eventType, ...args){
        if(Array.isArray(this[RECORDER].get(eventType))){
            this[RECORDER].get(eventType).forEach(handler => {
                if(isFunc(handler) && handler.left > 0){
                    handler(...args);
                    handler.left -= 1;
                }
            });
        }
    }
    addListener(eventType, handler){
        handler.left = handler.left || Infinity;
        if(!Array.isArray(this[RECORDER].get(eventType))){
            this[RECORDER].set(eventType, []);
        }
        this[RECORDER].get(eventType).push(handler);
        return this;
    }
    removeListener(eventType, handler){
        const handlers = this[RECORDER].get(eventType);
        while(handlers.includes(handler)){
            handler[handler.indexOf(handler)] = undefined;
        }
    }
    once(eventType, handler){
        handler.left = 1;
        this.addListener(eventType, handler);
    }
    on(eventType, handler){
        return this.addListener(eventType, handler);
    }
    off(eventType, handler){
        this.removeListener(eventType, handler);
    }
}

export default EventEmitter;