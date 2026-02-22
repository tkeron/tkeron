import { build } from "./build";
import type { Logger } from "@tkeron/tools";
import { logger as defaultLogger } from "@tkeron/tools";

export interface BuildWrapperOptions {
  logger?: Logger;
  [key: string]: any;
}

export const buildWrapper = async (options: BuildWrapperOptions) => {
  const log = options?.logger || defaultLogger;

  try {
    await build({ logger: log });
  } catch (error: any) {
    log.error(`\n❌ Build failed: ${error.message}\n`);
    process.exit(1);
  }
};
