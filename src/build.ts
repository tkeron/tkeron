import { resolve, dirname, join, relative } from "path";
import { buildDir } from "./buildDir";
import { processPre } from "./processPre";
import { processCom } from "./processCom";
import { processComTs } from "./processComTs";
import { rm, exists, mkdir, cp } from "fs/promises";

export interface BuildOptions {
  sourceDir?: string;
  targetDir?: string;
}
export const build = async (options: BuildOptions) => {
  const source = await resolve(options.sourceDir || "websrc");
  const target = options.targetDir
    ? await resolve(options.targetDir)
    : await resolve(dirname(source), "web");

  // Create temp directory as sibling to source, not in system /tmp
  // This preserves relative imports to files outside websrc
  const sourceParent = dirname(source);
  const tempDir = join(
    sourceParent,
    `.tmp_tkeron-build-${crypto.randomUUID()}`
  );

  try {
    await mkdir(tempDir, { recursive: true });

    await cp(source, tempDir, { recursive: true });

    // Process .pre.ts files first (only once, they generate HTML)
    await processPre(tempDir);

    // Process components iteratively:
    // 1. .com.html replaces static components
    // 2. .com.ts can insert new components dynamically
    // 3. Repeat until no more changes (max 10 iterations)
    const MAX_ITERATIONS = 10;
    for (let i = 0; i < MAX_ITERATIONS; i++) {
      const htmlChanged = await processCom(tempDir);
      const tsChanged = await processComTs(tempDir);
      
      // If neither made changes, we're done
      if (!htmlChanged && !tsChanged) {
        break;
      }
    }

    if (await exists(target)) {
      await rm(target, { recursive: true, force: true });
    }

    await buildDir(tempDir, target);
  } catch (error: any) {
    if (error.code === "ENOENT") {
      const sourceDir = options.sourceDir || "websrc";
      console.error(
        `\n❌ Error: Source directory "${sourceDir}" does not exist.`
      );
      console.error(`\n💡 Tip: Create the directory first or check the path.`);
      console.error(`   Expected: ${source}\n`);
      process.exit(1);
    }
    throw error;
  } finally {
    // Always cleanup temp directory, even if build fails
    // Catch cleanup errors to avoid hiding the original error
    try {
      await rm(tempDir, { recursive: true, force: true });
    } catch (cleanupError) {
      console.warn(`Warning: Failed to cleanup temp directory ${tempDir}`);
    }
  }
};
