import {
  existsSync,
  readdirSync,
  mkdirSync,
  cpSync,
  statSync,
  readFileSync,
  writeFileSync,
} from "fs";
import { join, resolve } from "path";
import type { Logger } from "@tkeron/tools";
import {
  silentLogger,
  detectEnvironments,
  addFrontmatterField,
} from "@tkeron/tools";
import type { Environment } from "@tkeron/tools";

export interface SkillsOptions {
  target?: string;
  force?: boolean;
  dryRun?: boolean;
  logger?: Logger;
}

const getTransform = (env: Environment) => {
  if (env === "cursor") {
    return (content: string) =>
      addFrontmatterField(content, "alwaysApply", false);
  }
  return null;
};

const installToDir = (
  skillNames: string[],
  sourceDir: string,
  targetDir: string,
  transform: ((content: string) => string) | null,
  force: boolean,
  log: Logger,
) => {
  const conflicts: string[] = [];
  for (const name of skillNames) {
    const dest = join(targetDir, name, "SKILL.md");
    if (existsSync(dest)) {
      conflicts.push(name);
    }
  }

  if (conflicts.length > 0 && !force) {
    throw new Error(
      `Skill files already exist: ${conflicts.join(", ")}. Use --force to overwrite.`,
    );
  }

  mkdirSync(targetDir, { recursive: true });

  for (const name of skillNames) {
    const src = join(sourceDir, name);
    const dest = join(targetDir, name);
    cpSync(src, dest, { recursive: true, force: true });

    if (transform) {
      const skillFile = join(dest, "SKILL.md");
      if (existsSync(skillFile)) {
        const content = readFileSync(skillFile, "utf-8");
        writeFileSync(skillFile, transform(content), "utf-8");
      }
    }

    log.log(`✓ Installed skill: ${name}`);
  }
};

const previewToDir = (skillNames: string[], targetDir: string, log: Logger) => {
  for (const name of skillNames) {
    const dest = join(targetDir, name, "SKILL.md");
    log.log(`○ Would install: ${name} → ${dest}`);
  }
};

export const skills = async (options: SkillsOptions = {}) => {
  const {
    target,
    force = false,
    dryRun = false,
    logger: log = silentLogger,
  } = options;

  const sourceDir = join(import.meta.dir, "..", "skills");

  if (!existsSync(sourceDir)) {
    throw new Error("Skills directory not found in tkeron installation");
  }

  const skillNames = readdirSync(sourceDir).filter((name) =>
    statSync(join(sourceDir, name)).isDirectory(),
  );

  if (skillNames.length === 0) {
    throw new Error("No skills available to install");
  }

  if (target !== undefined) {
    const targetDir = resolve(process.cwd(), target);
    if (dryRun) {
      previewToDir(skillNames, targetDir, log);
      log.log(
        `\n📋 ${skillNames.length} skill(s) would be installed in ${targetDir}`,
      );
    } else {
      installToDir(skillNames, sourceDir, targetDir, null, force, log);
      log.log(`\n✅ ${skillNames.length} skill(s) installed in ${targetDir}`);
    }
    return;
  }

  const detected = detectEnvironments(process.cwd());

  if (detected.length === 0) {
    throw new Error("NO_ENVIRONMENTS_DETECTED");
  }

  for (const { env, target: envTarget } of detected) {
    const targetDir = resolve(process.cwd(), envTarget);
    if (dryRun) {
      previewToDir(skillNames, targetDir, log);
      log.log(
        `\n📋 ${skillNames.length} skill(s) would be installed for ${env} in ${targetDir}`,
      );
    } else {
      const transform = getTransform(env);
      installToDir(skillNames, sourceDir, targetDir, transform, force, log);
      log.log(
        `\n✅ ${skillNames.length} skill(s) installed for ${env} in ${targetDir}`,
      );
    }
  }
};
