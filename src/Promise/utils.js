
export const isFunc = func => typeof func === 'function';

export const isPromise$ = Promise$ => p => p instanceof Promise$;