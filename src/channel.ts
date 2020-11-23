const Channels: any = {};

interface Channel {
    name: string;
    postMessage(msg: any): Channel;
    close(): Channel;
    open(): Channel;
    onMessage(fn: (msg: any) => any): Channel;
}

export const channel = (channel: string) => {
    if (!(channel in Channels)) Channels[channel] = {
        onMessageMsg: (msg: any) => { }
    } as any;
    const chid = `ch${Object.keys(Channels[channel]).length}`;
    let closed = 0;
    const ch: Channel = {
        name: channel,
        open: () => {
            Channels[channel][chid] = ch;
            closed = 0;
            return ch;
        },
        postMessage: (msg: any) => {
            if (closed) return ch;
            for (const k in Channels[channel]) {
                if (k === chid) continue;
                Channels[channel][k].onMessageMsg(msg);
            }
            return ch;
        },
        close: () => {
            closed = 1;
            delete Channels[channel][chid];
            return ch;
        },
        onMessage: (fn: (msg: any) => {}) => {
            for (const k in Channels[channel]) {
                if (k === chid) continue;
                Channels[channel][k].onMessageMsg = fn;
            }
            return ch;
        },
    };
    Channels[channel][chid] = ch;
    return ch;
};


