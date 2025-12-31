import { parseHTML } from "@tkeron/html-parser";
import { getFilePaths } from "@tkeron/tools";
import { join, dirname } from "path";
import { tmpdir } from "os";

const DOCTYPE = "<!doctype html>\n";

function ensureHtmlDocument(html: string): string {
  const hasHtmlTag = /<\s*html[\s>]/i.test(html);
  if (hasHtmlTag) return html;
  return `${DOCTYPE}<html><head></head><body>${html}</body></html>`;
}

/**
 * Process .com.ts files and replace custom elements with dynamically generated content
 * @param tempDir - Temporary directory containing the source files
 * @returns true if any components were processed, false otherwise
 */
export const processComTs = async (tempDir: string): Promise<boolean> => {
  // Find all .html files (excluding .com.html)
  const htmlFiles = getFilePaths(tempDir, "**/*.html", true).filter(
    (p) => !p.endsWith(".com.html")
  );

  let hasChanges = false;

  for (const htmlFile of htmlFiles) {
    // Read HTML content
    const htmlContent = await Bun.file(htmlFile).text();
    const document = parseHTML(ensureHtmlDocument(htmlContent));

    // Process TypeScript components recursively
    const body = document.querySelector("body") || document.body;
    if (body) {
      const changed = await processComponentsTs(body, dirname(htmlFile), tempDir, []);
      hasChanges = hasChanges || changed;
    }

    // Save modified HTML
    const htmlElement = document.querySelector("html") || document.documentElement;
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
  depth: number = 0
): Promise<boolean> {
  let hasChanges = false;
  // Prevent infinite recursion
  const MAX_DEPTH = 50;
  if (depth > MAX_DEPTH) {
    console.warn(`Maximum component nesting depth (${MAX_DEPTH}) reached`);
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
          console.error(`\n❌ Error: Circular component dependency detected.`);
          console.error(`\n💡 Component chain: ${chain}`);
          console.error(`\n   Components cannot include themselves directly or indirectly.`);
          console.error(`   Check your .com.ts files for circular references.\n`);
          throw new Error(`Circular dependency: ${chain}`);
        }

        // Read component TypeScript code
        const originalComponentCode = await Bun.file(componentPath).text();

        // Get the original element's HTML
        const elementHTML = (child as any).outerHTML;

        // Create a wrapper code that executes the component with access to `com`
        // Save the result to a temporary output file to avoid variable name conflicts
        const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
        const outputPath = componentPath.replace(/\.com\.ts$/, `.com.output.${uniqueSuffix}.json`);
        const wrapperCode = `
import { parseHTML } from "@tkeron/html-parser";

const __tkeron_element_html = ${JSON.stringify(elementHTML)};
const __tkeron_temp_doc = parseHTML(\`<html><body>\${__tkeron_element_html}</body></html>\`);
const com = __tkeron_temp_doc.querySelector("${tagName}");

if (!com) {
  throw new Error("Failed to create component element for ${tagName}");
}

// --- Original .com.ts code ---
${originalComponentCode}

// --- Save the result to a file ---
await Bun.write(${JSON.stringify(outputPath)}, JSON.stringify({ innerHTML: com.innerHTML }));
`;

        // Overwrite the .com.ts file temporarily with wrapper code
        const backupCode = originalComponentCode;
        
        try {
          await Bun.write(componentPath, wrapperCode);

          // Execute the component file using Bun.spawn
          const proc = Bun.spawn(["bun", "run", componentPath], {
            cwd: dirname(componentPath),
            stdout: "pipe",
            stderr: "pipe",
          });

          await proc.exited;

          // Check if execution was successful
          if (proc.exitCode !== 0) {
            const stderr = await new Response(proc.stderr).text();
            console.error(`\n❌ Error: Component <${tagName}> failed to execute.`);
            console.error(`\n💡 Component file: ${componentPath}`);
            console.error(`\nError details:\n${stderr}\n`);
            throw new Error(`Component ${tagName} execution failed`);
          }

          // Read the output
          const outputData = JSON.parse(await Bun.file(outputPath).text());
          const newInnerHTML = outputData.innerHTML;

          // Parse the new content
          const tempDoc = parseHTML(
            `<html><body><div id="__tkeron_component_root__">${newInnerHTML}</div></body></html>`
          );
          const body = tempDoc.querySelector("body");
          const tempContainer = body?.querySelector("#__tkeron_component_root__") ||
            body?.firstElementChild;

          if (!tempContainer) {
            // Empty content, just remove the element
            const parent = (child as any).parentNode;
            if (parent) {
              parent.removeChild(child);
            }
            continue;
          }

          // Get all nodes from the component and clone them
          const nodesToInsert = Array.from((tempContainer as any).childNodes || []).map(
            (node: any) => (node?.cloneNode ? node.cloneNode(true) : node)
          );

          // Replace the custom element with component content
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

          const nextCurrentDir = dirname(componentPath);
          const nextStack = [...componentStack, tagName];

          // Process nested components in the newly inserted content
          for (const node of nodesToInsert) {
            if ((node as any).nodeType === 1) {
              // Element node
              const nestedChanged = await processComponentsTs(node, nextCurrentDir, rootDir, nextStack, depth + 1);
              hasChanges = hasChanges || nestedChanged;
            }
          }
        } finally {
          // Restore original component code
          await Bun.write(componentPath, backupCode);
          
          // Clean up output file
          try {
            const fs = await import("fs/promises");
            await fs.unlink(outputPath);
          } catch (e) {
            // Ignore cleanup errors
          }
        }
      } else {
        // Component not found, recurse into children
        const childChanged = await processComponentsTs(child, currentDir, rootDir, componentStack, depth + 1);
        hasChanges = hasChanges || childChanged;
      }
    } else {
      // Not a custom element, recurse into children
      const childChanged = await processComponentsTs(child, currentDir, rootDir, componentStack, depth + 1);
      hasChanges = hasChanges || childChanged;
    }
  }

  return hasChanges;
}
