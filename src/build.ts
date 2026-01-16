import { resolve, dirname, join, relative } from "path";
import { buildDir } from "./buildDir";
import { processPre } from "./processPre";
import { processCom } from "./processCom";
import { processComTs } from "./processComTs";
import { rm, exists, mkdir, cp, readdir } from "fs/promises";
import type { Logger } from "./logger";
import { silentLogger } from "./logger";

// Prefix for temp directories - unique to tkeron to avoid conflicts
export const TEMP_DIR_PREFIX = ".tktmp_build-";

/**
 * Clean up any orphaned temp directories from previous failed builds.
 * This ensures no leftover .tktmp_build-* directories remain.
 */
export const cleanupOrphanedTempDirs = async (parentDir: string, log: Logger = silentLogger): Promise<void> => {
  try {
    const entries = await readdir(parentDir, { withFileTypes: true });
    const orphanedDirs = entries.filter(
      (entry) => entry.isDirectory() && entry.name.startsWith(TEMP_DIR_PREFIX)
    );
    
    await Promise.all(
      orphanedDirs.map(async (dir) => {
        const dirPath = join(parentDir, dir.name);
        try {
          await rm(dirPath, { recursive: true, force: true });
          log.log(`🧹 Cleaned up orphaned temp directory: ${dir.name}`);
        } catch (error) {
          log.warn(`Warning: Failed to cleanup orphaned temp directory ${dirPath}`);
        }
      })
    );
  } catch (error) {
    // Ignore errors during orphan cleanup - it's a best-effort operation
  }
};

export interface BuildOptions {
  sourceDir?: string;
  targetDir?: string;
  logger?: Logger;
}
export const build = async (options: BuildOptions) => {
  const log = options?.logger || silentLogger;
  
  if (!options || typeof options !== 'object') {
    log.error(`\n❌ Error: Invalid options provided for build.`);
    return;
  }

  const source = await resolve(options.sourceDir || "websrc");
  const target = options.targetDir
    ? await resolve(options.targetDir)
    : await resolve(dirname(source), "web");

  // Create temp directory as sibling to source, not in system /tmp
  // This preserves relative imports to files outside websrc
  const sourceParent = dirname(source);
  const tempDir = join(
    sourceParent,
    `${TEMP_DIR_PREFIX}${crypto.randomUUID()}`
  );

  // Clean up any orphaned temp directories from previous failed builds
  await cleanupOrphanedTempDirs(sourceParent, log);

  try {
    await mkdir(tempDir, { recursive: true });

    await cp(source, tempDir, { recursive: true });

    // Process .pre.ts files first (only once, they generate HTML)
    await processPre(tempDir, { logger: log });

    // Process components iteratively:
    // 1. .com.html replaces static components
    // 2. .com.ts can insert new components dynamically
    // 3. Repeat until no more changes (max 10 iterations)
    const MAX_ITERATIONS = 10;
    for (let i = 0; i < MAX_ITERATIONS; i++) {
      const htmlChanged = await processCom(tempDir, { logger: log });
      const tsChanged = await processComTs(tempDir, { logger: log });
      
      // If neither made changes, we're done
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
      log.error(
        `\n❌ Error: Source directory "${sourceDir}" does not exist.`
      );
      log.error(`\n💡 Tip: Create the directory first, check the path, or run 'tk init' to create a new project.`);
      log.error(`   Expected: ${source}\n`);
      process.exit(1);
    }
    throw error;
  } finally {
    // Always cleanup temp directory, even if build fails
    // Catch cleanup errors to avoid hiding the original error
    try {
      await rm(tempDir, { recursive: true, force: true });
    } catch (cleanupError) {
      log.warn(`Warning: Failed to cleanup temp directory ${tempDir}`);
    }
  }
};
