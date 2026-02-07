import { build } from "./build";
import type { Logger } from "./logger";
import { logger as defaultLogger } from "./logger";

export interface BuildWrapperOptions {
  sourceDir?: string;
  targetDir?: string;
  logger?: Logger;
  [key: string]: any;
}

export const buildWrapper = async (options: BuildWrapperOptions) => {
  const log = options?.logger || defaultLogger;

  try {
    await build({ ...options, logger: log });
  } catch (error: any) {
    log.error(`\n❌ Build failed: ${error.message}\n`);
    process.exit(1);
  }
};
