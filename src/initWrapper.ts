import { init } from "./init";
import type { Logger } from "./logger";
import { logger as defaultLogger } from "./logger";

export interface InitWrapperOptions {
  projectName?: string;
  force?: boolean;
  logger?: Logger;
  [key: string]: any;
}

export async function initWrapper(options: InitWrapperOptions) {
  const log = options?.logger || defaultLogger;

  if (!options || typeof options !== "object") {
    log.error("\n❌ Error: Invalid options provided for init.");
    log.error("\n💡 Usage: tk init [project-name]");
    log.error("   Example: tk init my-app\n");
    process.exit(1);
  }

  if (!options.projectName) {
    options.projectName = ".";
  }

  if (typeof options.projectName !== "string") {
    log.error("\n❌ Error: Project name must be a string.");
    log.error("\n💡 Usage: tk init [project-name]");
    log.error("   Example: tk init my-app\n");
    process.exit(1);
  }

  try {
    await init({ ...options, logger: log });
  } catch (error: any) {
    const msg = error.message;

    if (msg === "Project name is required") {
      log.error("\n❌ Error: Project name is required.");
      log.error("\n💡 Usage: tk init <project-name>");
      log.error("   Example: tk init my-app\n");
    } else if (msg.includes("already exists")) {
      const projectName = msg.split('"')[1];
      log.error(`\n❌ Error: Directory "${projectName}" already exists.`);
      log.error(
        `\n💡 Tip: Choose a different name, use '.' for current directory, or use force=true to overwrite.\n`,
      );
    } else if (msg === "Template directory not found") {
      log.error("\n❌ Error: Template directory not found.");
      log.error("\n💡 This might be a tkeron installation issue.");
      log.error("   Try reinstalling: npm i -g tkeron\n");
    } else if (msg === "tkeron.d.ts not found") {
      log.error("\n❌ Error: Type definitions file not found.");
      log.error("\n💡 This might be a tkeron installation issue.");
      log.error("   Try reinstalling: npm i -g tkeron\n");
    } else {
      log.error(`\n❌ Error: ${msg}\n`);
    }
    process.exit(1);
  }
}
