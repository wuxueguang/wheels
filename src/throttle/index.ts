

const throttle = (callback, wait, ) => {
    let canCall = true;
    function throttled(...args){
        if(canCall){
            callback(...args);
            canCall = false;
            setTimeout(() => {
                canCall = true;
            }, wait);
        }
    }

    return throttled;
}

export default throttle;