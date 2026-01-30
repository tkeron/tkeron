import { normalize } from "path";
import type { Logger } from "./logger";
import { silentLogger } from "./logger";

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

  const { outputs, success } = await Bun.build({
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

  if (!success) return;

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
};
