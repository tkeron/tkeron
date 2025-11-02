import { normalize } from "path";

export const buildEntrypoints = async (filePaths: string[], root: string) => {
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
    })
  );

  return { artifacts };
};
