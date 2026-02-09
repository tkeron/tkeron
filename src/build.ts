import { resolve, dirname, join } from "path";
import { buildDir } from "./buildDir";
import { processPre } from "./processPre";
import { processCom } from "./processCom";
import { processComTs } from "./processComTs";
import { rm, exists, mkdir, cp } from "fs/promises";
import type { Logger } from "./logger";
import { silentLogger } from "./logger";
import {
  cleanupOrphanedTempDirs,
  TEMP_DIR_PREFIX,
} from "./cleanupOrphanedTempDirs";

export interface BuildOptions {
  sourceDir?: string;
  targetDir?: string;
  logger?: Logger;
}
export const build = async (options: BuildOptions) => {
  const log = options?.logger || silentLogger;

  if (!options || typeof options !== "object") {
    log.error(`\n❌ Error: Invalid options provided for build.`);
    return;
  }

  const source = resolve(options.sourceDir || "websrc");
  const target = options.targetDir
    ? resolve(options.targetDir)
    : resolve(dirname(source), "web");

  const sourceParent = dirname(source);
  const tempDir = join(
    sourceParent,
    `${TEMP_DIR_PREFIX}${crypto.randomUUID()}`,
  );

  await cleanupOrphanedTempDirs(sourceParent, log);

  try {
    await mkdir(tempDir, { recursive: true });

    await cp(source, tempDir, { recursive: true });

    await processPre(tempDir, { logger: log, projectRoot: sourceParent });

    const MAX_ITERATIONS = 10;
    for (let i = 0; i < MAX_ITERATIONS; i++) {
      const htmlChanged = await processCom(tempDir, { logger: log });
      const tsChanged = await processComTs(tempDir, { logger: log });

      if (!htmlChanged && !tsChanged) {
        break;
      }
    }

    if (await exists(target)) {
      await rm(target, { recursive: true, force: true });
    }

    await buildDir(tempDir, target, { logger: log });
  } catch (error: any) {
    if (error.code === "ENOENT") {
      const sourceDir = options.sourceDir || "websrc";
      log.error(`\n❌ Error: Source directory "${sourceDir}" does not exist.`);
      log.error(
        `\n💡 Tip: Create the directory first, check the path, or run 'tk init' to create a new project.`,
      );
      log.error(`   Expected: ${source}\n`);
    }

    throw error;
  } finally {
    try {
      await rm(tempDir, { recursive: true, force: true });
    } catch (cleanupError) {
      log.warn(`Warning: Failed to cleanup temp directory ${tempDir}`);
    }
  }
};
