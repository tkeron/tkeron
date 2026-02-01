import { resolve, dirname, join, basename } from "path";
import { rm, stat } from "fs/promises";
import { getFilePaths } from "@tkeron/tools";
import { parseHTML } from "@tkeron/html-parser";
import { build } from "./build.js";
import type { Logger } from "./logger.js";
import { silentLogger } from "./logger.js";

export interface GetBuildResultOptions {
  logger?: Logger;
}

export interface FileInfo {
  fileName: string;
  filePath: string;
  path: string;
  type: string;
  size: number;
  fileHash: string;
  getContentAsString?: () => string;
  dom?: Document;
}

export type BuildResult = Record<string, FileInfo>;

const TEXT_EXTENSIONS = new Set([
  "html",
  "css",
  "js",
  "json",
  "txt",
  "svg",
  "xml",
  "ts",
  "mjs",
  "cjs",
  "md",
  "map",
]);

const MIME_TYPES: Record<string, string> = {
  html: "text/html",
  css: "text/css",
  js: "text/javascript",
  mjs: "text/javascript",
  cjs: "text/javascript",
  json: "application/json",
  txt: "text/plain",
  svg: "image/svg+xml",
  xml: "application/xml",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  ico: "image/x-icon",
  woff: "font/woff",
  woff2: "font/woff2",
  ttf: "font/ttf",
  otf: "font/otf",
  map: "application/json",
  md: "text/markdown",
};

const getMimeType = (fileName: string): string => {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  return MIME_TYPES[ext] || "application/octet-stream";
};

const isTextFile = (fileName: string): boolean => {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  return TEXT_EXTENSIONS.has(ext);
};

const computeHash = async (filePath: string): Promise<string> => {
  const file = Bun.file(filePath);
  const buffer = await file.arrayBuffer();
  const hasher = new Bun.CryptoHasher("sha256");
  hasher.update(new Uint8Array(buffer));
  return hasher.digest("hex");
};

export const getBuildResult = async (
  sourcePath: string,
  options?: GetBuildResultOptions,
): Promise<BuildResult> => {
  const log = options?.logger || silentLogger;
  const resolvedSource = resolve(sourcePath);
  const sourceParent = dirname(resolvedSource);
  const tempOutputDir = join(
    sourceParent,
    `.tktmp_buildresult-${crypto.randomUUID()}`,
  );

  try {
    await build({
      sourceDir: resolvedSource,
      targetDir: tempOutputDir,
      logger: log,
    });

    const allFiles = getFilePaths(tempOutputDir, "**/*", true);
    const result: BuildResult = {};

    for (const absolutePath of allFiles) {
      const relativePath = absolutePath
        .slice(tempOutputDir.length + 1)
        .replace(/\\/g, "/");
      const fileName = basename(absolutePath);
      const filePath = dirname(relativePath);
      const normalizedFilePath = filePath === "." ? "" : filePath;

      const fileStat = await stat(absolutePath);
      const fileHash = await computeHash(absolutePath);
      const mimeType = getMimeType(fileName);

      const fileInfo: FileInfo = {
        fileName,
        filePath: normalizedFilePath,
        path: relativePath,
        type: mimeType,
        size: fileStat.size,
        fileHash,
      };

      if (isTextFile(fileName)) {
        const content = await Bun.file(absolutePath).text();
        fileInfo.getContentAsString = () => content;

        if (fileName.endsWith(".html")) {
          fileInfo.dom = parseHTML(content);
        }
      }

      result[relativePath] = fileInfo;
    }

    return result;
  } finally {
    try {
      await rm(tempOutputDir, { recursive: true, force: true });
    } catch {
      log.warn(`Warning: Failed to cleanup temp directory ${tempOutputDir}`);
    }
  }
};
