import { isFunc, isThenable } from '../utils/funcs';
import { RECORDER, IS_INNER_CALL } from './consts';
import createNewPromise from './createNewPromise';
import Recorder from './Recorder';

class Promise{
    static resolve(data){
        return new Promise((resolve, reject) => {
            if(isThenable(data)){
                data.then(data => {
                    resolve(data);
                }, rejectedReason => {
                    reject(rejectedReason);
                });
            }else{
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
                }else{
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
                }else{
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
                            console.log(rejectedReasons)
                            reject(rejectedReasons);
                        }
                    });
                }else{
                    resolve(item);
                }
            });
        });
    }

    [RECORDER] = new Recorder
    constructor(resolver){
        if(isFunc(resolver)){
            resolver(this[RECORDER].resolve.bind(this[RECORDER]), this[RECORDER].reject.bind(this[RECORDER]));
        }else{
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

export default Promise;



