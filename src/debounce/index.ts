
type Option = {
    leading?: boolean,
    maxWait?: number,
    trailing?: boolean
};

function debounce(
    func: Function,
    wait: number = 0,
    options: Option = {
        leading: false,
        trailing: true,
    }
): Function {
    let st;
    let args;
    let result;
    let debounced;

    if(options.trailing){
        debounced = function(...argus){
            args = argus;
            clearTimeout(st);
            st = setTimeout(() => {
                result = func.apply(null, args);
            }, wait);
            return result;
        }
    }

    let canCall = true;
    if(options.leading){
        debounced = function(...args){
            clearTimeout(st);
            if(canCall){
                result = func.apply(null, args);
                canCall = false;
            }
            st = setTimeout(() => {
                canCall = true;
            }, wait);
            return result;
        }
    }

    debounced.cancel = function(): void{
        clearTimeout(st);
    };
    debounced.flush = function(): void{
        this.cancel();
        func.apply(null, args);
    };
    
    return debounced;
}

export default debounce;