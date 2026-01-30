import type { Logger } from "./loggerObj";

export const silentLogger: Logger = {
  log: () => {},
  error: () => {},
  warn: () => {},
  info: () => {},
};
