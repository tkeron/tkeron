import { Loader } from "esbuild";

export const buildLoaders = {
  ".jpg": "file" as Loader,
  ".png": "file" as Loader,
  ".gif": "file" as Loader,
  ".ico": "file" as Loader,
  ".webp": "file" as Loader,
  ".mp3": "file" as Loader,
  ".svg": "file" as Loader,
  ".js": "file" as Loader,
  ".css": "text" as Loader,
  ".html": "text" as Loader,
};

export const getExtModules = () => {
  let content = "";
  const exts = Object.keys(buildLoaders).sort();
  for (const ext of exts) {
    content += `declare module '*${ext}';\n`;
  }
  return content;
};
