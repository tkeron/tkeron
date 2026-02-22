import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const REQUIRED_INCLUDES = ["websrc/**/*", "tkeron.d.ts"];

const DEFAULT_COMPILER_OPTIONS = {
  target: "ESNext",
  module: "ESNext",
  lib: ["ESNext", "DOM"],
  moduleResolution: "bundler",
  strict: true,
  skipLibCheck: true,
};

const createFreshTsconfig = () => ({
  compilerOptions: { ...DEFAULT_COMPILER_OPTIONS },
  include: [...REQUIRED_INCLUDES],
});

const mergeIncludes = (existing: string[]): string[] => {
  const merged = [...existing];
  for (const entry of REQUIRED_INCLUDES) {
    if (!merged.includes(entry)) {
      merged.push(entry);
    }
  }
  return merged;
};

export const ensureTsconfig = (
  targetPath: string,
  previousTsconfig?: Record<string, unknown>,
) => {
  const tsconfigPath = join(targetPath, "tsconfig.json");

  if (previousTsconfig) {
    const existingIncludes = Array.isArray(previousTsconfig.include)
      ? (previousTsconfig.include as string[])
      : [];
    const merged = {
      ...previousTsconfig,
      include: mergeIncludes(existingIncludes),
    };
    writeFileSync(tsconfigPath, JSON.stringify(merged, null, 2));
    return;
  }

  if (existsSync(tsconfigPath)) {
    try {
      const content = readFileSync(tsconfigPath, "utf-8");
      const parsed = JSON.parse(content);
      const existingIncludes = Array.isArray(parsed.include)
        ? (parsed.include as string[])
        : [];
      const merged = { ...parsed, include: mergeIncludes(existingIncludes) };
      writeFileSync(tsconfigPath, JSON.stringify(merged, null, 2));
      return;
    } catch {
      writeFileSync(
        tsconfigPath,
        JSON.stringify(createFreshTsconfig(), null, 2),
      );
      return;
    }
  }

  writeFileSync(tsconfigPath, JSON.stringify(createFreshTsconfig(), null, 2));
};
