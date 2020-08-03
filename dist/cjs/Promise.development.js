'use strict';

const { toString } = Object.prototype;

const isObject = obj => toString.call(obj) === '[object Object]';

const isFunction = func => toString.call(func) === '[object Function]';
const isFunc = isFunction;

const isThenable = obj => isObject(obj) && Boolean(obj.then);  //

const FULFILLED = 'promise fulfilled';
const REJECTED = 'promise rejected';
const IS_INNER_CALL = 'is inner call';
const RECORDER = Symbol('recorder instance key');

const createNewPromise = (Promise, currentPromise, onFulfilled, onRejected, detail) => {
    return new Promise((resolve, reject) => {
        const recorder = currentPromise[RECORDER];
        if(recorder.settled){
            if(recorder.fulfilled){
                resolve(detail.data);
            }else {
                reject(detail.rejectedReason);
            }
        }else {
            if(!isFunc(onFulfilled)){
                recorder.eventEmitter.on(FULFILLED, () => {
                    resolve(recorder.result);
                });
            }else {
                recorder.eventEmitter.on(`fulfilledHandlerCalled_${onFulfilled.idx}`, e => {
                    if(e.detail.settledStatus === FULFILLED){
                        if(isThenable(e.detail.data)){
                            e.detail.data.then(data => {
                                resolve(data);
                            }, rejectedReason => {
                                reject(rejectedReason);
                            }, IS_INNER_CALL);
                        }else {
                            resolve(e.detail.data);
                        }
                    }else {
                        reject(e.detail.rejectedReason);
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
                        if(isThenable(e.detail.data)){
                            e.detail.data.then(data => {
                                resolve(data);
                            }, rejectedReason => {
                                reject(rejectedReason);
                            }, IS_INNER_CALL);
                        }else {
                            resolve(e.detail.data);
                        }
                    }else {
                        reject(e.detail.rejectedReason);
                    }
                });
            }
        }
    });
};

const RECORDER$1 = Symbol('recorder key');

class EventEmitter{
    [RECORDER$1] = new Map
    emit(eventType, ...args){
        if(Array.isArray(this[RECORDER$1].get(eventType))){
            this[RECORDER$1].get(eventType).forEach(handler => {
                if(isFunc(handler) && handler.left > 0){
                    handler(...args);
                    handler.left -= 1;
                }
            });
        }
    }
    addListener(eventType, handler){
        handler.left = handler.left || Infinity;
        if(!Array.isArray(this[RECORDER$1].get(eventType))){
            this[RECORDER$1].set(eventType, []);
        }
        this[RECORDER$1].get(eventType).push(handler);
        return this;
    }
    on(eventType, handler){
        return this.addListener(eventType, handler);
    }
    removeListener(eventType, handler){
        const handlers = this[RECORDER$1].get(eventType);
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
                    detail.rejectedReason = err;
                    detail.settledStatus = REJECTED;
                }
                this.eventEmitter.emit(`fulfilledHandlerCalled_${handler.idx}`, {detail});
                return detail;
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
                    detail.rejectedReason = err;
                    detail.settledStatus = REJECTED;
                }
                this.eventEmitter.emit(`fulfilledHandlerCalled_${handler.idx}`, {detail});
                return detail;
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
                    detail.rejectedReason = err;
                    detail.settledStatus = REJECTED;
                }
                this.eventEmitter.emit(`fulfilledHandlerCalled_${handler.idx}`, {detail});
            });
        }
    }
    reject(rejectedReason){
        if(!this.settled){
            this.settled = true;
            this.rejected = true;
            this.result = rejectedReason;

            this.eventEmitter.emit(REJECTED);

            this.rejectedHandlers.forEach(handler => {
                const detail = {};
                try{
                    detail.data = handler(rejectedReason);
                    detail.settledStatus = FULFILLED;
                }catch(err){
                    detail.rejectedReason = err;
                    detail.settledStatus = REJECTED;
                }
                this.eventEmitter.emit(`rejectedHandlerCalled_${handler.idx}`, {detail});
            });
        }
    }
}

class Promise{
    static resolve(data){
        return new Promise((resolve, reject) => {
            if(isThenable(data)){
                data.then(data => {
                    resolve(data);
                }, rejectedReason => {
                    reject(rejectedReason);
                });
            }else {
                resolve(data);
            }
        });
    }
    static reject(rejectedReason){
        return new Promise((_, reject) => reject(rejectedReason));
    }
    static all(iterable){
        const results = [];
        let counter = 0;
        let fulfilledCounter = 0;
        return new Promise((resolve, reject) => {
            [...iterable].forEach((item, idx) => {
                if(isThenable(item)){
                    item.then(data => {
                        counter += 1;
                        fulfilledCounter += 1;
                        results[idx] = data;
                    }, rejectedReason => {
                        counter += 1;
                        results[idx] = rejectedReason;
                        reject(rejectedReason);
                    });
                }else {
                    results[idx] = item;
                    counter += 1;
                    fulfilledCounter += 1;
                }
                if(counter === fulfilledCounter === iterable.length){
                    resolve(results);
                }
            });
        });
    }
    static race(iterable){
        return new Promise((resolve, reject) => {
            for(let item of iterable){
                item.then(data => {
                    resolve(data);
                }, rejectedReason => {
                    reject(rejectedReason);
                });
            }
        });
    }
    static allSettled(iterable){
        const results = [];
        const counter = 0;
        return new Promise(resolve => {
            const callback = () => {
                if(counter === iterable.length){
                    resolve(results);
                }
            };
            [...iterable].forEach((item, idx) => {
                if(isThenable(item)){
                    item.then(data => {
                        counter += 1;
                        results[idx] = data;
                        callback();
                    }, rejectedReason => {
                        counter += 1;
                        results[idx] = rejectedReason;
                        callback();
                    });
                }else {
                    counter += 1;
                    results[idx] = item;
                    callback();
                }
            });
        });
    }
    static any(iterable){
        return new Promise((resolve, reject) => {
            const counter = 0;
            const rejectedReasons = [];

            [...iterable].forEach((item, idx) => {
                if(isThenable(item)){
                    item.then(data => {
                        resolve(data);
                    }, rejectedReason => {
                        counter += 1;
                        rejectedReasons[idx] = rejectedReason;
                        if(counter === iterable.length){
                            console.log(rejectedReasons);
                            reject(rejectedReasons);
                        }
                    });
                }else {
                    resolve(item);
                }
            });
        });
    }

    [RECORDER] = new Recorder
    constructor(resolver){
        if(isFunc(resolver)){
            resolver(this[RECORDER].resolve.bind(this[RECORDER]), this[RECORDER].reject.bind(this[RECORDER]));
        }else {
            throw new TypeError(`Promise resolver ${resolver} is not a function`);
        }
    }
    then(onFulfilled, onRejected, isInnerCall){
        const fulfilledHandler = data => isFunc(onFulfilled) ? onFulfilled(data) : undefined;
        const rejectedHandler = data => isFunc(onRejected) ? onRejected(data) : undefined;

        fulfilledHandler.idx = this[RECORDER].fulfilledHandlers.length;
        rejectedHandler.idx = this[RECORDER].rejectedHandlers.length;

        const fulfilledDetail = this[RECORDER].addFulfilledHandlers(fulfilledHandler);
        const rejectedDetail = this[RECORDER].addRejectedHandlers(rejectedHandler);
        if(isInnerCall !== IS_INNER_CALL){
            return createNewPromise(Promise, this, fulfilledHandler, rejectedHandler, fulfilledDetail || rejectedDetail);
        }
    }
    catch(onRejected){
        return this.then(undefined, onRejected);
    }
    finally(handler){
        if(isFunc(handler)){
            this[RECORDER].addFulfilledHandlers(handler);
            this[RECORDER].addRejectedHandlers(handler);
        }
        return createNewPromise(Promise, this);
    }
}

// var p1 = new Promise((resolve, reject) => {
//     setTimeout(() => {
//         reject('resolved data');
//     }, 1000);
// });åå

// p1.finally(() => console.log('finally1'));
// p1.finally(() => console.log('finally2'));
// p1.finally(() => console.log('finally3'));
// p1.then(data => console.log('111111', data), err => console.log(err));
// p1.then(data => console.log('222222', data), err => console.log(err));
// p1.finally(() => console.log('finally'));
// p1.then(data => console.log('333333', data), err => console.log(err));
// const p2 = new Promise((_, reject) => {
//     setTimeout(() => {
//         reject('rejected reason');
//     }, 2000);
// });

// Promise.any([p1, p2]).then(data => {
//     console.log('---- resolved ----', data);
// }, rejectedReason => {
//     console.log('---- rejected ----', rejectedReason);
// });


Promise.resolve('test')
.then(data => {
    console.log('---- 1 ----', data);
    return data;
})
.then(data => console.log('---- 2 ----', data));

module.exports = Promise;
