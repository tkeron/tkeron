/**
 * Logger wrapper for console functions.
 * These functions can be safely spied/mocked in tests without affecting other concurrent tests.
 */

export const logger = {
  log: (...args: unknown[]) => console.log(...args),
  error: (...args: unknown[]) => console.error(...args),
  warn: (...args: unknown[]) => console.warn(...args),
  info: (...args: unknown[]) => console.info(...args),
};
