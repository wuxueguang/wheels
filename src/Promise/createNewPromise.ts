
import { isFunc, isThenable } from '../utils/funcs';
import { RECORDER, IS_INNER_CALL, FULFILLED, REJECTED } from './consts';

const createNewPromise = (Promise, currentPromise, onFulfilled, onRejected, detail) => {
    return new Promise((resolve, reject) => {
        const recorder = currentPromise[RECORDER];
        if(recorder.settled){
            if(recorder.fulfilled){
                resolve(detail.data);
            }else{
                reject(detail.rejectedReason);
            }
        }else{
            if(!isFunc(onFulfilled)){
                recorder.eventEmitter.on(FULFILLED, () => {
                    resolve(recorder.result);
                });
            }else{
                recorder.eventEmitter.on(`fulfilledHandlerCalled_${onFulfilled.idx}`, e => {
                    if(e.detail.settledStatus === FULFILLED){
                        if(isThenable(e.detail.data)){
                            e.detail.data.then(data => {
                                resolve(data);
                            }, rejectedReason => {
                                reject(rejectedReason);
                            }, IS_INNER_CALL);
                        }else{
                            resolve(e.detail.data);
                        }
                    }else{
                        reject(e.detail.rejectedReason);
                    }
                });
            }
            
            if(!isFunc(onRejected)){
                recorder.eventEmitter.on(REJECTED, () => {
                    reject(recorder.result);   
                });
            }else{
                recorder.eventEmitter.on(`rejectedHandlerCalled_${onRejected.idx}`, e => {
                    if(e.detail.settledStatus === FULFILLED){
                        if(isThenable(e.detail.data)){
                            e.detail.data.then(data => {
                                resolve(data);
                            }, rejectedReason => {
                                reject(rejectedReason);
                            }, IS_INNER_CALL);
                        }else{
                            resolve(e.detail.data);
                        }
                    }else{
                        reject(e.detail.rejectedReason);
                    }
                });
            }
        }
    });
};

export default createNewPromise;