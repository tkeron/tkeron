//@ts-ignore
const toHexString = (bytes: Uint8Array): string => bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, "0"), "");
export const rnds = (n: number): string => toHexString(crypto.getRandomValues(new Uint8Array(n))).slice(0, n);

export const watchChange = (u: any, onChange: (prop: string, val: any) => void) => {
    const u2: any = {};
    Object.keys(u).forEach(k => {
        u2[k] = u[k];
        Object.defineProperty(u, k, {
            get() {
                return u2[k];
            },
            set(v) {
                onChange(k, v);
                u2[k] = v;
            }
        });
    });
};



