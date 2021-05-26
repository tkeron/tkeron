
export interface EventEmitter {
    emit: (event: string, ...args: any[]) => void;
    on: (event: string, listener: (...args: any[]) => void) => () => void;
}

export const getEventEmitter = () => {
    let handlers: any = {};
    let n = 0;
    const ee: EventEmitter = {
        emit: (event: string, ...args: any[]) => {
            if (!(event in handlers)) return;
            for (const listener of handlers[event]) {
                listener(...args);
            }
        },
        on: (event: string, listener: (...args: any[]) => void) => {
            if (!(event in handlers)) handlers[event] = [];
            n++;
            const id = n;
            (listener as any).id = id;
            handlers[event].push(listener);
            return () => {
                handlers[event] = handlers[event].filter((_: any) => _.id !== id);
            };
        }
    };
    return ee;
};
