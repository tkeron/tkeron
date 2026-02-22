import {
  cpSync,
  existsSync,
  mkdirSync,
  copyFileSync,
  readFileSync,
  readdirSync,
  rmSync,
} from "fs";
import { join, resolve, basename } from "path";
import type { Logger } from "@tkeron/tools";
import { silentLogger } from "@tkeron/tools";
import { promptUser } from "./promptUser";
import { ensureTsconfig } from "./ensureTsconfig";

export interface InitOptions {
  projectName: string;
  force?: boolean;
  promptFn?: (question: string) => Promise<boolean>;
  logger?: Logger;
}

export const init = async (options: InitOptions) => {
  const { projectName, force, logger: log = silentLogger } = options;

  if (!projectName) {
    throw new Error("Project name is required");
  }

  const targetPath = resolve(process.cwd(), projectName);
  const isCurrentDir = projectName === "." || targetPath === process.cwd();

  let skipWebsrc = false;

  if (existsSync(targetPath)) {
    if (!isCurrentDir) {
      if (!force) {
        const files = readdirSync(targetPath);
        if (files.length > 0) {
          throw new Error(`Directory "${projectName}" already exists`);
        }
      } else {
        rmSync(targetPath, { recursive: true, force: true });
        log.log(`✓ Removed existing directory "${projectName}"`);
      }
    } else {
      const tkeronFiles = ["websrc", "tkeron.d.ts"];
      const existingTkeronFiles = tkeronFiles.filter((f) =>
        existsSync(join(targetPath, f)),
      );

      if (existingTkeronFiles.length > 0) {
        if (!force) {
          log.log(
            `\n⚠️  The following tkeron files already exist: ${existingTkeronFiles.join(", ")}`,
          );
          const prompt = options.promptFn || promptUser;
          const shouldContinue = await prompt(
            "\nDo you want to overwrite them? (y/N): ",
          );

          if (shouldContinue) {
            existingTkeronFiles.forEach((file) => {
              const filePath = join(targetPath, file);
              rmSync(filePath, { recursive: true, force: true });
            });
            log.log("✓ Cleaned existing tkeron files");
          } else {
            skipWebsrc = existingTkeronFiles.includes("websrc");
          }
        } else {
          existingTkeronFiles.forEach((file) => {
            const filePath = join(targetPath, file);
            rmSync(filePath, { recursive: true, force: true });
          });
          log.log("✓ Cleaned existing tkeron files");
        }
      }
    }
  }

  const templatePath = join(import.meta.dir, "..", "examples", "init_sample");

  if (!existsSync(templatePath)) {
    throw new Error("Template directory not found");
  }

  const webDirInTemplate = join(templatePath, "web");
  if (existsSync(webDirInTemplate)) {
    rmSync(webDirInTemplate, { recursive: true, force: true });
  }

  const tkeronDtsPath = join(import.meta.dir, "..", "tkeron.d.ts");

  if (!existsSync(tkeronDtsPath)) {
    throw new Error("tkeron.d.ts not found");
  }

  const tsconfigPath = join(targetPath, "tsconfig.json");
  let previousTsconfig: Record<string, unknown> | undefined;
  if (existsSync(tsconfigPath)) {
    try {
      previousTsconfig = JSON.parse(readFileSync(tsconfigPath, "utf-8"));
    } catch {
      previousTsconfig = undefined;
    }
  }

  mkdirSync(targetPath, { recursive: true });
  const websrcInTemplate = join(templatePath, "websrc");
  cpSync(templatePath, targetPath, {
    recursive: true,
    filter: skipWebsrc
      ? (src: string) =>
          src !== websrcInTemplate && !src.startsWith(websrcInTemplate + "/")
      : undefined,
  });
  copyFileSync(tkeronDtsPath, join(targetPath, "tkeron.d.ts"));

  ensureTsconfig(targetPath, previousTsconfig);

  const projectDisplayName = isCurrentDir ? basename(targetPath) : projectName;
  log.log(`✓ Created project "${projectDisplayName}"`);
  log.log(`\nNext steps:`);
  if (!isCurrentDir) {
    log.log(`  cd ${projectName}`);
  }
  log.log(`  tk dev websrc`);
};
