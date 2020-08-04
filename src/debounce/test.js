
const _ = require('lodash');

var debounced1 = _.debounce(function () {
    console.log('test');
}, 2000, {leading: true, trailing: false});
debounced1();
setTimeout(debounced1, 1000);
setTimeout(debounced1, 2000);
setTimeout(debounced1, 3000);
setTimeout(debounced1, 4000);
setTimeout(debounced1, 5000);