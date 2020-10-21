const now = () => new Date().getTime();
export const condenser = (msec: number): (fn: any) => Promise<void> => {
    let last = 0;
    let lastf = async () => { };
    const f = async (fn: any) => {
        lastf = fn;
        if (now() - last < msec) { return; }
        await lastf();
        last = now();
    };
    return f;
};
