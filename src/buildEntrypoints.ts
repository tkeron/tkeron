import { normalize } from "path";
import type { Logger } from "@tkeron/tools";
import { silentLogger } from "@tkeron/tools";

export interface BuildEntrypointsOptions {
  logger?: Logger;
}

export const buildEntrypoints = async (
  filePaths: string[],
  root: string,
  options: BuildEntrypointsOptions = {},
) => {
  const log = options.logger || silentLogger;

  if (!filePaths || !Array.isArray(filePaths) || filePaths.length === 0) {
    log.error(`\n❌ Error: No entrypoints provided for buildEntrypoints.`);
    return;
  }

  if (!root || typeof root !== "string") {
    log.error(`\n❌ Error: Invalid root provided for buildEntrypoints.`);
    return;
  }

  try {
    const result = await Bun.build({
      entrypoints: filePaths,
      minify: true,
      splitting: false,
      target: "browser",
      root,
      naming: {
        asset: "[dir]/[name].[ext]",
        chunk: "[dir]/[name].[ext]",
        entry: "[dir]/[name].[ext]",
      },
    });

    const { outputs, success, logs } = result;

    if (!success) {
      if (logs && logs.length > 0) {
        log.error(`\n❌ Build failed with ${logs.length} error(s):\n`);
        for (const logEntry of logs) {
          log.error(`${logEntry.message}`);
          if (logEntry.position) {
            log.error(
              `   at ${logEntry.position.file}:${logEntry.position.line}:${logEntry.position.column}`,
            );
          }
        }
        log.error("");
      } else {
        log.error(`\n❌ Build failed with no error details from Bun.build()`);
      }
      return;
    }

    const artifacts = await Promise.all(
      outputs?.map(async (artifact, index) => {
        const path = artifact.path;
        const pathR = normalize(artifact.path);
        const hash = artifact.hash;
        const kind = artifact.kind;
        const loader = artifact.loader;
        const type = artifact.type;
        const sourcemap = await artifact.sourcemap?.text();

        return {
          path,
          pathR,
          hash,
          index,
          kind,
          loader,
          type,
          sourcemap,
          artifact,
        };
      }),
    );

    return { artifacts };
  } catch (error: any) {
    log.error(`\n❌ Bun.build() threw an exception:`);
    log.error(`   ${error.message}`);
    if (error.stack) {
      log.error(`\n${error.stack}`);
    }
    throw error;
  }
};
