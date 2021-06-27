
export const runOncePerTime = (msec: number): (fn: any) => void => {
    let lastDiff = 0;
    let lastFunc = () => { };
    return (fn: any) => {
        lastFunc = fn;
        const now = new Date().getTime();
        if (now - lastDiff < msec) { return; }
        lastFunc();
        lastDiff = now;
    };
};
