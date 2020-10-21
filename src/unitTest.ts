import { log } from "./log";

/**
 * Run test and print result and time
 * @param name Name of the test
 * @param fn Async function to test. Could return true/undefined to Pass, or False/Error to Fail 
 */
export const test = async (name: string, fn: () => Promise<boolean | void>) => {
    const start = new Date();
    try {
        const ok = await fn();
        const time = new Date().getTime() - start.getTime();
        if (ok || ok === undefined)
            log(`TEST ${name} \x1b[32mPASS\x1b[0m ${time}ms`);
        else
            log(`TEST ${name} \x1b[31mFAIL.\x1b[0m ${time}ms`);
    } catch (_e) {
        const time = new Date().getTime() - start.getTime();
        log(`TEST ${name} \x1b[31mFAIL..\x1b[0m ${time}ms`);
        log(_e);
    }
};
