
import Promise from '../src/Promise/index';
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
.then(data => console.log('---- 2 ----', data))