import { cpSync, existsSync, mkdirSync, copyFileSync, readdirSync, rmSync } from "fs";
import { join, resolve, basename } from "path";

export interface InitOptions {
  projectName: string;
  force?: boolean;
  promptFn?: (question: string) => Promise<boolean>;
}

export async function promptUser(question: string): Promise<boolean> {
  const readline = await import("readline");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      const response = answer.trim().toLowerCase();
      resolve(response === "y" || response === "yes");
    });
  });
}

export async function init(options: InitOptions) {
  const { projectName, force } = options;
  
  if (!projectName) {
    throw new Error("Project name is required");
  }

  const targetPath = resolve(process.cwd(), projectName);
  const isCurrentDir = projectName === "." || targetPath === process.cwd();
  
  // Check if directory exists and has tkeron files
  if (existsSync(targetPath)) {
    if (!isCurrentDir) {
      throw new Error(`Directory "${projectName}" already exists`);
    }
    
    // Check if tkeron files already exist (web is not included - it's a generated directory)
    const tkeronFiles = ['src', 'tkeron.d.ts'];
    const existingTkeronFiles = tkeronFiles.filter(f => existsSync(join(targetPath, f)));
    
    if (existingTkeronFiles.length > 0) {
      if (!force) {
        console.log(`\n⚠️  The following tkeron files already exist: ${existingTkeronFiles.join(', ')}`);
        const prompt = options.promptFn || promptUser;
        const shouldContinue = await prompt(
          "\nDo you want to overwrite them? (y/N): "
        );
        
        if (!shouldContinue) {
          console.log("\n❌ Operation cancelled.");
          process.exit(0);
        }
      }
      
      // Remove existing tkeron files
      existingTkeronFiles.forEach(file => {
        const filePath = join(targetPath, file);
        rmSync(filePath, { recursive: true, force: true });
      });
      
      console.log("✓ Cleaned existing tkeron files");
    }
  }

  const templatePath = join(import.meta.dir, "..", "examples", "init_sample");
  
  if (!existsSync(templatePath)) {
    throw new Error("Template directory not found");
  }

  const tkeronDtsPath = join(import.meta.dir, "..", "tkeron.d.ts");
  
  if (!existsSync(tkeronDtsPath)) {
    throw new Error("tkeron.d.ts not found");
  }

  mkdirSync(targetPath, { recursive: true });
  cpSync(templatePath, targetPath, { recursive: true });
  copyFileSync(tkeronDtsPath, join(targetPath, "tkeron.d.ts"));

  const projectDisplayName = isCurrentDir ? basename(targetPath) : projectName;
  console.log(`✓ Created project "${projectDisplayName}"`);
  console.log(`\nNext steps:`);
  if (!isCurrentDir) {
    console.log(`  cd ${projectName}`);
  }
  console.log(`  tk dev src`);
}
