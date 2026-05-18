import { skills } from "./skills.js";
import type { Logger } from "@tkeron/tools";
import { logger as defaultLogger } from "@tkeron/tools";
import { createInterface } from "readline";

const stdinConfirm = async (message: string): Promise<boolean> => {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise<boolean>((resolve) => {
    rl.question(message, (answer) => {
      rl.close();
      const trimmed = answer.trim().toLowerCase();
      resolve(trimmed === "y" || trimmed === "yes");
    });
  });
};

export interface SkillsWrapperOptions {
  target?: string;
  force?: boolean;
  dryRun?: boolean;
  logger?: Logger;
  confirm?: (message: string) => Promise<boolean>;
  [key: string]: any;
}

export const skillsWrapper = async (options: SkillsWrapperOptions = {}) => {
  const log = options?.logger || defaultLogger;
  const confirm = options?.confirm ?? stdinConfirm;

  try {
    await skills({
      target: options.target,
      force: options.force,
      dryRun: options.dryRun,
      logger: log,
    });
  } catch (error: any) {
    if (error.message === "NO_ENVIRONMENTS_DETECTED") {
      if (options.dryRun) {
        log.log(
          "\n⚠ No known AI environment detected (.cursor/, .github/, .claude/).",
        );
        log.log("  Would create a skills/ directory in the current directory.");
        return;
      }
      log.log(
        "\n⚠ No known AI environment detected (.cursor/, .github/, .claude/).",
      );
      log.log(
        "  A skills/ directory will be created in the current directory instead.",
      );

      const proceed = await confirm("  Continue? (y/N): ");
      if (!proceed) {
        log.log("Aborted.");
        return;
      }

      try {
        await skills({ target: "skills", force: options.force, logger: log });
      } catch (err: any) {
        log.error(`\n❌ ${err.message}\n`);
        if (/already exist/i.test(err.message)) {
          log.error(
            "💡 Tip: pass --force to overwrite existing skill files.\n",
          );
        }
        process.exit(1);
      }
      return;
    }

    log.error(`\n❌ ${error.message}\n`);
    if (/already exist/i.test(error.message)) {
      log.error("💡 Tip: pass --force to overwrite existing skill files.\n");
    }
    process.exit(1);
  }
};
