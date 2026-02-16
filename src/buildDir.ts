import { getPaths } from "@tkeron/tools";
import { join } from "path";
import { buildEntrypoints } from "./buildEntrypoints";
import type { Logger } from "@tkeron/tools";
import { silentLogger } from "@tkeron/tools";

export interface BuildDirOptions {
  logger?: Logger;
}

export const buildDir = async (
  sourceDir: string,
  targetDir: string,
  options: BuildDirOptions = {},
) => {
  const log = options.logger || silentLogger;

  if (
    !sourceDir ||
    typeof sourceDir !== "string" ||
    !targetDir ||
    typeof targetDir !== "string"
  ) {
    log.error(
      `\n❌ Error: Invalid sourceDir or targetDir provided for buildDir.`,
    );
    return;
  }

  const htmlFiles = (await getPaths(sourceDir, "**/*.html", "no", true)).filter(
    (p) => !p.endsWith(".com.html"),
  );

  const files = await buildEntrypoints(htmlFiles, sourceDir, { logger: log });

  if (!files || !files.artifacts) {
    throw new Error("Bundle failed");
  }

  for (const a of files?.artifacts || []) {
    const outPath = join(targetDir, a.pathR);
    if (a.pathR.toLowerCase().endsWith(".html")) {
      const html = await a.artifact.text();
      const normalized = html.replace(/<!doctype html>/i, "<!doctype html>");
      await Bun.write(outPath, normalized, { createPath: true });
    } else {
      await Bun.write(outPath, a.artifact, { createPath: true });
    }
  }
};
