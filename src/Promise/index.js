
import {isFunc, isPromise$} from './utils';
import {RECORDER, IS_INNER_CALL} from './consts';
import createNewPromise$ from './createNewPromise';
import Recorder from './Recorder';

class Promise${
    static resolve(data){
        return new Promise$(resolve => resolve(data));
    }
    static reject(rejectedReason){
        return new Promise$((_, reject) => reject(rejectedReason));
    }
    static all(iterable){
        const results = [];
        let counter = 0;
        let fulfilledCounter = 0;
        return new Promise$((resolve, reject) => {
            
        });
    }
    [RECORDER] = new Recorder
    constructor(resolver){
        if(isFunc(resolver)){
            resolver(this[RECORDER].resolve.bind(this[RECORDER]), this[RECORDER].reject.bind(this[RECORDER]));
        }else{
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

export default Promise$;

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


Promise$.reject('test').then(null, data => console.log(data))



