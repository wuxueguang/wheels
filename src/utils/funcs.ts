
const { toString } = Object.prototype;

export const isObject = obj => toString.call(obj) === '[object Object]';

export const isFunction = func => toString.call(func) === '[object Function]';
export const isFunc = isFunction;

export const isThenable = obj => isObject(obj) && Boolean(obj.then);  // 