'use strict';

const { toString } = Object.prototype;

const isFunction = func => toString.call(func) === '[object Function]';
const isFunc = isFunction;
  //

const RECORDER = Symbol('recorder key');

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
    on(eventType, handler){
        return this.addListener(eventType, handler);
    }
    removeListener(eventType, handler){
        const handlers = this[RECORDER].get(eventType);
        while(handlers.includes(handler)){
            handler[handler.indexOf(handler)] = undefined;
        }
    }
    off(eventType, handler){
        this.removeListener(eventType, handler);
    }
    once(eventType, handler){
        handler.left = 1;
        this.addListener(eventType, handler);
    }
}

const eventEmitter = new EventEmitter;

eventEmitter.once('test', () => {
    console.log('------');
});

eventEmitter.emit('test');
eventEmitter.emit('test');
