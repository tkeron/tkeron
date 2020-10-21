export const timeout = (ms: number) => new Promise((ok, _err) => setTimeout(ok, ms));

export default timeout;