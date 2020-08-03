'use strict';

const isFunc = func => typeof func === 'function';

const isPromise$ = Promise$ => p => p instanceof Promise$;

const FULFILLED = 'promise fulfilled';
const REJECTED = 'promise rejected';
const IS_INNER_CALL = 'is inner call';
const RECORDER = Symbol('recorder instance key');

const createNewPromise$ = (Promise$, currentPromise$, onFulfilled, onRejected) => {
    return new Promise$((resolve, reject) => {
        const recorder = currentPromise$[RECORDER];
        if(!isFunc(onFulfilled)){
            recorder.eventEmitter.on(FULFILLED, () => {
                resolve(recorder.result);
            });
        }else {
            recorder.eventEmitter.on(`fulfilledHandlerCalled_${onFulfilled.idx}`, e => {
                if(e.detail.settledStatus === FULFILLED){
                    if(isPromise$(Promise$)(e.detail.data)){
                        e.detail.data.then(data => {
                            resolve(data);
                        }, rejectedReason => {
                            reject(rejectedReason);
                        }, IS_INNER_CALL);
                    }else {
                        resolve(e.detail.data);
                    }
                }else {
                    reject(e.detail.rejectReason);
                }
            });
        }
        
        if(!isFunc(onRejected)){
            recorder.eventEmitter.on(REJECTED, () => {
                reject(recorder.result);   
            });
        }else {
            recorder.eventEmitter.on(`rejectedHandlerCalled_${onRejected.idx}`, e => {
                if(e.detail.settledStatus === FULFILLED){
                    if(isPromise$(Promise$)(e.detail.data)){
                        e.detail.data.then(data => {
                            resolve(data);
                        }, rejectedReason => {
                            reject(rejectedReason);
                        }, IS_INNER_CALL);
                    }else {
                        resolve(e.detail.data);
                    }
                }else {
                    reject(e.detail.rejectReason);
                }
            });
        }
    });
};

const RECORDER$1 = Symbol('recorder key');

class EventEmitter{
    [RECORDER$1] = new Map
    emit(eventType, ...args){
        if(Array.isArray(this[RECORDER$1].get(eventType))){
            this[RECORDER$1].get(eventType).forEach(handler => {
                handler(...args);
            });
        }
    }
    addListener(eventType, handler){
        if(!Array.isArray(this[RECORDER$1].get(eventType))){
            this[RECORDER$1].set(eventType, []);
        }
        this[RECORDER$1].get(eventType).push(handler);
        return this;
    }
    on(eventType, handler){
        return this.addListener(eventType, handler);
    }
}

class Recorder{
    settled = false
    fulfilled = false
    rejected = false
    result = undefined

    fulfilledHandlers = []
    rejectedHandlers = []

    eventEmitter = new EventEmitter

    addFulfilledHandlers(handler){
        if(isFunc(handler)){
            this.fulfilledHandlers.push(handler);
            if(this.fulfilled){
                const detail = {};
                try{
                    detail.data = handler(this.result);
                    detail.settledStatus = FULFILLED;
                }catch(err){
                    detail.rejectReason = err;
                    detail.settledStatus = REJECTED;
                }
                this.eventEmitter.emit(`fulfilledHandlerCalled_${handler.idx}`, {detail});
            }
        }
    }
    addRejectedHandlers(handler){
        if(isFunc(handler)){
            this.rejectedHandlers.push(handler);
            if(this.rejected){
                const detail = {};
                try{
                    detail.data = handler(this.result);
                    detail.settledStatus = FULFILLED;
                }catch(err){
                    detail.rejectReason = err;
                    detail.settledStatus = REJECTED;
                }
                this.eventEmitter.emit(`fulfilledHandlerCalled_${handler.idx}`, {detail});
            }
        }
    }

    resolve(data){
        if(!this.settled){
            this.settled = true;
            this.fulfilled = true;
            this.result = data;

            this.eventEmitter.emit(FULFILLED);

            this.fulfilledHandlers.forEach(handler => {
                const detail = {};
                try{
                    detail.data = handler(data);
                    detail.settledStatus = FULFILLED;
                }catch(err){
                    detail.rejectReason = err;
                    detail.settledStatus = REJECTED;
                }
                this.eventEmitter.emit(`fulfilledHandlerCalled_${handler.idx}`, {detail});
            });
        }
    }
    reject(rejectReason){
        if(!this.settled){
            this.settled = true;
            this.rejected = true;
            this.result = rejectReason;

            this.eventEmitter.emit(REJECTED);

            this.rejectedHandlers.forEach(handler => {
                const detail = {};
                try{
                    detail.data = handler(rejectReason);
                    detail.settledStatus = FULFILLED;
                }catch(err){
                    detail.rejectReason = err;
                    detail.settledStatus = REJECTED;
                }
                this.eventEmitter.emit(`rejectedHandlerCalled_${handler.idx}`, {detail});
            });
        }
    }
}

class Promise${
    static resolve(data){
        return new Promise$(resolve => resolve(data));
    }
    static reject(rejectedReason){
        return new Promise$((_, reject) => reject(rejectedReason));
    }
    static all(iterable){
        return new Promise$((resolve, reject) => {
            
        });
    }
    [RECORDER] = new Recorder
    constructor(resolver){
        if(isFunc(resolver)){
            resolver(this[RECORDER].resolve.bind(this[RECORDER]), this[RECORDER].reject.bind(this[RECORDER]));
        }else {
            throw new TypeError(`Promise$ resolver ${resolver} is not a function`);
        }
    }
    then(onFulfilled, onRejected, isInnerCall){
        const fulfilledHandler = data => isFunc(onFulfilled) ? onFulfilled(data) : undefined;
        const rejectedHandler = data => isFunc(onRejected) ? onRejected(data) : undefined;

        fulfilledHandler.idx = this[RECORDER].fulfilledHandlers.length;
        rejectedHandler.idx = this[RECORDER].rejectedHandlers.length;

        this[RECORDER].addFulfilledHandlers(fulfilledHandler);
        this[RECORDER].addRejectedHandlers(rejectedHandler);
        if(isInnerCall !== IS_INNER_CALL){
            return createNewPromise$(Promise$, this, fulfilledHandler, rejectedHandler);
        }
    }
    catch(onRejected){
        return this.then(undefined, onRejected);
    }
}

// const p = new Promise$((resolve, reject) => {
//     setTimeout(() => {
//         resolve('resolve data')
//         // reject('resolve data')
//     }, 1000);
// })

// p.then(data => {
//     console.log('---- p1 resolved ----', data);
//     throw 'rejected reason';
// }).then(null, rejectedReason => console.log('---- p2 rejected ----', rejectedReason))
// p.then(data => console.log('---- p3 resolved ----', data))


Promise$.reject('test').then(null, data => console.log(data));

module.exports = Promise$;
