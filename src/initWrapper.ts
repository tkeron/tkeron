import { init } from "./init";

export async function initWrapper(options: any) {
  if (!options || typeof options !== 'object' || !options.projectName || typeof options.projectName !== 'string') {
    console.error("\n❌ Error: Invalid options provided for init. Project name is required.");
    console.error("\n💡 Usage: tk init <project-name>");
    console.error("   Example: tk init my-app\n");
    process.exit(1);
  }

  try {
    await init(options);
  } catch (error: any) {
    const msg = error.message;
    
    if (msg === "Project name is required") {
      console.error("\n❌ Error: Project name is required.");
      console.error("\n💡 Usage: tk init <project-name>");
      console.error("   Example: tk init my-app\n");
    } else if (msg.includes("already exists")) {
      const projectName = msg.split('"')[1];
      console.error(`\n❌ Error: Directory "${projectName}" already exists.`);
      console.error(`\n💡 Tip: Choose a different name, use '.' for current directory, or use force=true to overwrite.\n`);
    } else if (msg === "Template directory not found") {
      console.error("\n❌ Error: Template directory not found.");
      console.error("\n💡 This might be a tkeron installation issue.");
      console.error("   Try reinstalling: npm i -g tkeron\n");
    } else if (msg === "tkeron.d.ts not found") {
      console.error("\n❌ Error: Type definitions file not found.");
      console.error("\n💡 This might be a tkeron installation issue.");
      console.error("   Try reinstalling: npm i -g tkeron\n");
    } else {
      console.error(`\n❌ Error: ${msg}\n`);
    }
    process.exit(1);
  }
}
