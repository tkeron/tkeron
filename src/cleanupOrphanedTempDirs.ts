import { readdir, rm } from "fs/promises";
import { join } from "path";
import type { Logger } from "./logger";

export const TEMP_DIR_PREFIX = ".tktmp_build-";

export const cleanupOrphanedTempDirs = async (
  parentDir: string,
  log: Logger,
): Promise<void> => {
  try {
    const entries = await readdir(parentDir, { withFileTypes: true });
    const orphanedDirs = entries.filter(
      (entry) => entry.isDirectory() && entry.name.startsWith(TEMP_DIR_PREFIX),
    );

    await Promise.all(
      orphanedDirs.map(async (dir) => {
        const dirPath = join(parentDir, dir.name);
        try {
          await rm(dirPath, { recursive: true, force: true });
          log.log(`🧹 Cleaned up orphaned temp directory: ${dir.name}`);
        } catch (error) {
          log.warn(
            `Warning: Failed to cleanup orphaned temp directory ${dirPath}`,
          );
        }
      }),
    );
  } catch (error) {}
};
