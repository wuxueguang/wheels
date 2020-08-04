

import debounce from '../src/debounce/index';

const debounced1 = debounce(() => {
    console.log('test');
}, 2000);

debounced1();
setTimeout(debounced1, 1000);
setTimeout(debounced1, 2000);
setTimeout(debounced1, 3000);
setTimeout(debounced1, 4000);
setTimeout(debounced1, 5000);