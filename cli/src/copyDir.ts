import { normalize, join } from "path";
import { getFilesRecursive } from "./getFilesRecursive";
import { CopyFileResponse, copyFile } from "./copyFile";

export const copyDir = async (sourceDir: string, targetDir: string) => {
  const files = getFilesRecursive(sourceDir);
  const allFilesPromises: Promise<CopyFileResponse>[] = [];

  for (const file of files) {
    const targetFileName = normalize(file).slice(normalize(sourceDir).length);
    const target = join(targetDir, targetFileName);

    allFilesPromises.push(copyFile(file, target));
  }

  return await Promise.all(allFilesPromises);
};
