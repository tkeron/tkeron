const Channels: any = {};

//@ts-ignore
globalThis.ch = Channels;

interface Channel {
    name: string;
    postMessage(...msg: any[]): void;
    close(): void;
    open(): void;
    onMessage(fn: (...msg: any[]) => any): void;
}

export const channel = (channel: string) => {
    if (!(channel in Channels)) Channels[channel] = {} as any;
    const chid = `ch${channel}${Object.keys(Channels[channel]).length}`;
    let closed = 0;
    const ch: Channel = {
        name: channel,
        open: () => {
            Channels[channel][chid] = ch;
            closed = 0;
        },
        postMessage: (...msg: any[]) => {
            if (closed) return;
            for (const k in Channels[channel]) {
                if (k === chid) continue;
                if ("onMessageMsg" in Channels[channel][k]) Channels[channel][k].onMessageMsg(...msg);
            }
        },
        close: () => {
            closed = 1;
            if ("onMessageMsg" in ch) delete (ch as any).onMessageMsg;
            delete Channels[channel][chid];
        },
        onMessage: (fn: (...msg: any[]) => {}) => {
            (ch as any).onMessageMsg = fn;
        },
    };
    Channels[channel][chid] = ch;
    return ch;
};



