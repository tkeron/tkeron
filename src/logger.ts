/**
 * Logger type and default implementation.
 * 
 * All functions accept an optional logger in their options.
 * If not provided, uses the default logger (console output).
 * For tests, pass a silent logger or custom mock.
 */

export interface Logger {
  log: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
}

/** Default logger that outputs to console */
export const logger: Logger = {
  log: (...args: unknown[]) => console.log(...args),
  error: (...args: unknown[]) => console.error(...args),
  warn: (...args: unknown[]) => console.warn(...args),
  info: (...args: unknown[]) => console.info(...args),
};

/** Silent logger for tests - does nothing */
export const silentLogger: Logger = {
  log: () => {},
  error: () => {},
  warn: () => {},
  info: () => {},
};

/** Creates a logger that captures messages in arrays for test assertions */
export const createTestLogger = () => {
  const logs: string[] = [];
  const errors: string[] = [];
  const warns: string[] = [];
  const infos: string[] = [];
  
  const format = (args: unknown[]) => 
    args.map(a => typeof a === 'string' ? a : JSON.stringify(a)).join(' ');
  
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
