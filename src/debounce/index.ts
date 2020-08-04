
type Option = {
    leading?: boolean,
    maxWait?: number,
    trailing?: boolean
};

function debounce(
    callback: Function,
    wait: number = 0,
    options: Option = {
        leading: false,
        trailing: true,
    }
): Function {
    let st;
    let arrs;
    function debounced(...args){
        arrs = args;
        clearTimeout(st);
        st = setTimeout(() => {
            callback(...args);
        }, wait);
    }

    debounced.cancel = function(): void{
        clearTimeout(st);
    };
    debounced.flush = function(): void{
        this.cancel();
        callback(arrs);
    };

    return debounced;
}

export default debounce;