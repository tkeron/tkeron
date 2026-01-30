import type { Logger } from "./loggerObj";

export const createTestLogger = () => {
  const logs: string[] = [];
  const errors: string[] = [];
  const warns: string[] = [];
  const infos: string[] = [];

  const format = (args: unknown[]) =>
    args.map((a) => (typeof a === "string" ? a : JSON.stringify(a))).join(" ");

  return {
    logger: {
      log: (...args: unknown[]) => logs.push(format(args)),
      error: (...args: unknown[]) => errors.push(format(args)),
      warn: (...args: unknown[]) => warns.push(format(args)),
      info: (...args: unknown[]) => infos.push(format(args)),
    } as Logger,
    logs,
    errors,
    warns,
    infos,
  };
};
