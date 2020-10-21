import process from "process";



export const getArg = (arg: string, argv?: string[]): string | undefined => {
    //@ts-ignore
    if (typeof globalThis.argv !== "undefined") argv = globalThis.argv;
    if (!argv) argv = process.argv;
    let i = 0;
    for (const n in argv) {
        const s = argv[n];
        const regeq = new RegExp(arg + "=");
        const sregeq = s.match(regeq);
        if (sregeq && "input" in sregeq) {
            //@ts-ignore
            return sregeq.input.split("=")[1];
        }
        // const reg = new RegExp(arg, "g");
        const reg = new RegExp(`^${arg}$`, "g");
        const sreg = s.match(reg);
        const isNx = arg.match(/-{1,2}\w+/);
        if (sreg) {
            if (isNx && argv.length >= (i + 1)) return argv[i + 1];
            return arg;
        }
        i++;
    }
    return undefined;
};
