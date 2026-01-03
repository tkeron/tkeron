import { init } from "./init";
import { logger } from "./logger";

export async function initWrapper(options: any) {
  if (!options || typeof options !== 'object') {
    logger.error("\n❌ Error: Invalid options provided for init.");
    logger.error("\n💡 Usage: tk init [project-name]");
    logger.error("   Example: tk init my-app\n");
    process.exit(1);
  }

  // If no project name provided, use current directory
  if (!options.projectName) {
    options.projectName = ".";
  }

  if (typeof options.projectName !== 'string') {
    logger.error("\n❌ Error: Project name must be a string.");
    logger.error("\n💡 Usage: tk init [project-name]");
    logger.error("   Example: tk init my-app\n");
    process.exit(1);
  }

  try {
    await init(options);
  } catch (error: any) {
    const msg = error.message;
    
    if (msg === "Project name is required") {
      logger.error("\n❌ Error: Project name is required.");
      logger.error("\n💡 Usage: tk init <project-name>");
      logger.error("   Example: tk init my-app\n");
    } else if (msg.includes("already exists")) {
      const projectName = msg.split('"')[1];
      logger.error(`\n❌ Error: Directory "${projectName}" already exists.`);
      logger.error(`\n💡 Tip: Choose a different name, use '.' for current directory, or use force=true to overwrite.\n`);
    } else if (msg === "Template directory not found") {
      logger.error("\n❌ Error: Template directory not found.");
      logger.error("\n💡 This might be a tkeron installation issue.");
      logger.error("   Try reinstalling: npm i -g tkeron\n");
    } else if (msg === "tkeron.d.ts not found") {
      logger.error("\n❌ Error: Type definitions file not found.");
      logger.error("\n💡 This might be a tkeron installation issue.");
      logger.error("   Try reinstalling: npm i -g tkeron\n");
    } else {
      logger.error(`\n❌ Error: ${msg}\n`);
    }
    process.exit(1);
  }
}
