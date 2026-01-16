import { cpSync, existsSync, mkdirSync, copyFileSync, readdirSync, rmSync } from "fs";
import { join, resolve, basename } from "path";
import type { Logger } from "./logger";
import { silentLogger } from "./logger";

export interface InitOptions {
  projectName: string;
  force?: boolean;
  promptFn?: (question: string) => Promise<boolean>;
  logger?: Logger;
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
  const { projectName, force, logger: log = silentLogger } = options;
  
  if (!projectName) {
    throw new Error("Project name is required");
  }

  const targetPath = resolve(process.cwd(), projectName);
  const isCurrentDir = projectName === "." || targetPath === process.cwd();
  
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
      const tkeronFiles = ['websrc', 'tkeron.d.ts'];
      const existingTkeronFiles = tkeronFiles.filter(f => existsSync(join(targetPath, f)));
      
      if (existingTkeronFiles.length > 0) {
        if (!force) {
          log.log(`\n⚠️  The following tkeron files already exist: ${existingTkeronFiles.join(', ')}`);
          const prompt = options.promptFn || promptUser;
          const shouldContinue = await prompt(
            "\nDo you want to overwrite them? (y/N): "
          );
          
          if (!shouldContinue) {
            log.log("\n❌ Operation cancelled.");
            process.exit(0);
          }
        }
        
        existingTkeronFiles.forEach(file => {
          const filePath = join(targetPath, file);
          rmSync(filePath, { recursive: true, force: true });
        });
        
        log.log("✓ Cleaned existing tkeron files");
      }
    }
  }

  const templatePath = join(import.meta.dir, "..", "examples", "init_sample");
  
  if (!existsSync(templatePath)) {
    throw new Error("Template directory not found");
  }

  // Clean template: remove web directory if it exists (shouldn't be in source template)
  const webDirInTemplate = join(templatePath, "web");
  if (existsSync(webDirInTemplate)) {
    rmSync(webDirInTemplate, { recursive: true, force: true });
  }

  const tkeronDtsPath = join(import.meta.dir, "..", "tkeron.d.ts");
  
  if (!existsSync(tkeronDtsPath)) {
    throw new Error("tkeron.d.ts not found");
  }

  mkdirSync(targetPath, { recursive: true });
  cpSync(templatePath, targetPath, { recursive: true });
  copyFileSync(tkeronDtsPath, join(targetPath, "tkeron.d.ts"));

  const projectDisplayName = isCurrentDir ? basename(targetPath) : projectName;
  log.log(`✓ Created project "${projectDisplayName}"`);
  log.log(`\nNext steps:`);
  if (!isCurrentDir) {
    log.log(`  cd ${projectName}`);
  }
  log.log(`  tk dev websrc`);
}
