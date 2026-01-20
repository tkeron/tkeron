import { parseHTML } from "@tkeron/html-parser";
import { getFilePaths } from "@tkeron/tools";
import { join, dirname } from "path";
import type { Logger } from "./logger";
import { silentLogger } from "./logger";

const DOCTYPE = "<!doctype html>\n";

function ensureHtmlDocument(html: string): string {
  const hasHtmlTag = /<\s*html[\s>]/i.test(html);
  if (hasHtmlTag) return html;
  return `${DOCTYPE}<html><head></head><body>${html}</body></html>`;
}

export interface ProcessComTsOptions {
  logger?: Logger;
}

/**
 * Process .com.ts files and replace custom elements with dynamically generated content
 * @param tempDir - Temporary directory containing the source files
 * @returns true if any components were processed, false otherwise
 */
export const processComTs = async (tempDir: string, options: ProcessComTsOptions = {}): Promise<boolean> => {
  const log = options.logger || silentLogger;
  
  if (!tempDir || typeof tempDir !== 'string') {
    log.error(`\n❌ Error: Invalid tempDir provided for processComTs.`);
    return false;
  }

  // Find all .html files (excluding .com.html)
  const htmlFiles = getFilePaths(tempDir, "**/*.html", true).filter(
    (p) => !p.endsWith(".com.html")
  );

  let hasChanges = false;

  for (const htmlFile of htmlFiles) {
    // Read HTML content
    const htmlContent = await Bun.file(htmlFile).text();
    const document = parseHTML(ensureHtmlDocument(htmlContent));

    // Process TypeScript components recursively in the entire document (head and body)
    const htmlElement = document.querySelector("html") || document.documentElement;
    if (htmlElement) {
      const changed = await processComponentsTs(htmlElement, dirname(htmlFile), tempDir, [], 0, log, options);
      hasChanges = hasChanges || changed;
    }

    // Save modified HTML
    const output = DOCTYPE + (htmlElement?.outerHTML || document.documentElement?.outerHTML || "");
    await Bun.write(htmlFile, output);
  }

  return hasChanges;
};

/**
 * Recursively process and replace custom elements with .com.ts generated content
 * @param element - Current DOM element to process
 * @param currentDir - Directory of the current HTML file
 * @param rootDir - Root directory of the project
 * @param componentStack - Stack of component names to detect circular dependencies
 * @param depth - Current recursion depth (to prevent infinite loops)
 * @returns true if any components were processed, false otherwise
 */
async function processComponentsTs(
  element: any,
  currentDir: string,
  rootDir: string,
  componentStack: string[],
  depth: number = 0,
  log: Logger = silentLogger,
  options: ProcessComTsOptions = {}
): Promise<boolean> {
  let hasChanges = false;
  // Prevent infinite recursion
  const MAX_DEPTH = 50;
  if (depth > MAX_DEPTH) {
    log.warn(`Maximum component nesting depth (${MAX_DEPTH}) reached`);
    return hasChanges;
  }

  // Get all child elements
  const children = Array.from(element.children || []);

  for (const child of children) {
    const tagName = (child as any).tagName?.toLowerCase();

    // Check if it's a custom element (contains a hyphen)
    if (tagName && tagName.includes("-")) {
      // Try to find .com.ts component file (local first, then root)
      const localPath = join(currentDir, `${tagName}.com.ts`);
      const rootPath = join(rootDir, `${tagName}.com.ts`);

      let componentPath: string | null = null;

      if (await Bun.file(localPath).exists()) {
        componentPath = localPath;
      } else if (await Bun.file(rootPath).exists()) {
        componentPath = rootPath;
      }

      if (componentPath) {
        hasChanges = true;
        
        // Check for circular dependencies
        if (componentStack.includes(tagName)) {
          const chain = [...componentStack, tagName].join(" -> ");
          log.error(`\n❌ Error: Circular component dependency detected.`);
          log.error(`\n💡 Component chain: ${chain}`);
          log.error(`\n   Components cannot include themselves directly or indirectly.`);
          log.error(`   Check your .com.ts files for circular references.\n`);
          throw new Error(`Circular dependency: ${chain}`);
        }

        // Read component TypeScript code
        const originalComponentCode = await Bun.file(componentPath).text();

        // Get the original element's HTML
        const elementHTML = (child as any).outerHTML;

        log.info(`Processing component <${tagName}> from ${componentPath}`);

        // Create the `com` element using parseHTML in the current process
        const tempDoc = parseHTML('<html><body>' + elementHTML + '</body></html>');
        const com = tempDoc.querySelector(tagName);

        if (!com) {
          log.error(`\n❌ Error: Failed to create component element for <${tagName}>`);
          throw new Error(`Failed to create component element for ${tagName}`);
        }



        // Check if the code has imports (needs special handling)
        const hasImports = /^\s*import\s+/m.test(originalComponentCode);
        
        try {
          if (hasImports) {
            // For code with imports, write to temp file and use dynamic import
            const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
            const tempPath = componentPath.replace(/\.com\.ts$/, `.com.${uniqueSuffix}.ts`);
            
            // Extract imports and separate them from the rest of the code
            const importRegex = /^(\s*import\s+.*?(?:;|\n))/gm;
            const imports: string[] = [];
            let codeWithoutImports = originalComponentCode.replace(importRegex, (match) => {
              imports.push(match);
              return '';
            });
            
            // Wrap the code to export a function that receives `com`
            const wrappedCode = `${imports.join('\n')}
export default async function(com: any) {
${codeWithoutImports}
}
`;
            await Bun.write(tempPath, wrappedCode);
            
            try {
              const module = await import(tempPath);
              await module.default(com);
            } finally {
              // Cleanup temp file
              try { 
                const fs = await import("fs/promises");
                await fs.unlink(tempPath);
              } catch {}
            }
          } else {
            // For simple code without imports, use AsyncFunction (faster)
            const transpiler = new Bun.Transpiler({ loader: "ts" });
            const jsCode = transpiler.transformSync(originalComponentCode);
            const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
            const executeComponent = new AsyncFunction('com', jsCode);
            await executeComponent(com);
          }
        } catch (execError: any) {
          log.error(`\n❌ Error executing component <${tagName}>:`);
          log.error(`   ${execError.message}`);
          throw execError;
        }

        const newInnerHTML = com.innerHTML;

        // Parse the new content
        const newContentDoc = parseHTML(`<div>${newInnerHTML}</div>`);
        const div = newContentDoc.querySelector("div");

        if (!div) {
          // Empty content, just remove the element
          const parent = (child as any).parentNode;
          if (parent) {
            parent.removeChild(child);
          }
          continue;
        }

        const nextCurrentDir = dirname(componentPath);
        const nextStack = [...componentStack, tagName];

        // Process nested components in the parsed content BEFORE inserting
        // The div itself acts as a container, process its children (including custom elements)
        await processComponentsTs(div, nextCurrentDir, rootDir, nextStack, depth + 1, log, options);
        
        // Get all nodes from the processed content
        const nodesToInsert = Array.from((div as any).childNodes || []).map(
          (node: any) => (node?.cloneNode ? node.cloneNode(true) : node)
        );

        // Replace the custom element with processed component content
        const parent = (child as any).parentNode;

        if (parent) {
          if (nodesToInsert.length === 0) {
            // Empty component, just remove
            parent.removeChild(child);
          } else if (nodesToInsert.length === 1) {
            // Single node, replace directly
            parent.replaceChild(nodesToInsert[0], child);
          } else {
            // Multiple nodes: replace with first, then insert others after
            parent.replaceChild(nodesToInsert[0], child);
            let refNode = nodesToInsert[0];
            for (let i = 1; i < nodesToInsert.length; i++) {
              parent.insertBefore(nodesToInsert[i], refNode.nextSibling);
              refNode = nodesToInsert[i];
            }
          }
        }
      } else {
        // Component not found, recurse into children
        const childChanged = await processComponentsTs(child, currentDir, rootDir, componentStack, depth + 1, log, options);
        hasChanges = hasChanges || childChanged;
      }
    } else {
      // Not a custom element, recurse into children
      const childChanged = await processComponentsTs(child, currentDir, rootDir, componentStack, depth + 1, log, options);
      hasChanges = hasChanges || childChanged;
    }
  }

  return hasChanges;
}
