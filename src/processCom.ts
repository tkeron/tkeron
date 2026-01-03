import { parseHTML } from "@tkeron/html-parser";
import { getFilePaths } from "@tkeron/tools";
import { join, dirname } from "path";
import { logger } from "./logger";

const DOCTYPE = "<!doctype html>\n";

function ensureHtmlDocument(html: string): string {
  // `parseHTML` may treat fragments inconsistently; wrap fragments into a document.
  const hasHtmlTag = /<\s*html[\s>]/i.test(html);
  if (hasHtmlTag) return html;
  return `${DOCTYPE}<html><head></head><body>${html}</body></html>`;
}

/**
 * Process .com.html files and replace custom elements with component content
 * @param tempDir - Temporary directory containing the source files
 */
export const processCom = async (tempDir: string): Promise<boolean> => {
  if (!tempDir || typeof tempDir !== 'string') {
    logger.error(`\n❌ Error: Invalid tempDir provided for processCom.`);
    return false;
  }

  // Find all .html files
  const htmlFiles = getFilePaths(tempDir, "**/*.html", true).filter(
    (p) => !p.endsWith(".com.html")
  );

  let hasChanges = false;

  for (const htmlFile of htmlFiles) {
    // Read HTML content
    const htmlContent = await Bun.file(htmlFile).text();
    const document = parseHTML(ensureHtmlDocument(htmlContent));

    // Process components recursively
    const body = document.querySelector("body") || document.body;
    if (body) {
      const changed = await processComponents(body, dirname(htmlFile), tempDir, []);
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
 * Recursively process and replace custom elements with component content
 * @param element - Current DOM element to process
 * @param currentDir - Directory of the current HTML file
 * @param rootDir - Root directory of the project
 * @param depth - Current recursion depth (to prevent infinite loops)
 * @returns true if any components were processed, false otherwise
 */
async function processComponents(
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
    logger.warn(`Maximum component nesting depth (${MAX_DEPTH}) reached`);
    return hasChanges;
  }

  // Get all child elements
  const children = Array.from(element.children || []);

  for (const child of children) {
    const tagName = (child as any).tagName?.toLowerCase();

    // Check if it's a custom element (contains a hyphen)
    if (tagName && tagName.includes("-")) {
      // Try to find component file (local first, then root)
      const localPath = join(currentDir, `${tagName}.com.html`);
      const rootPath = join(rootDir, `${tagName}.com.html`);

      let componentPath: string | null = null;

      if (await Bun.file(localPath).exists()) {
        componentPath = localPath;
      } else if (await Bun.file(rootPath).exists()) {
        componentPath = rootPath;
      }

      if (componentPath) {
        hasChanges = true;
        
        if (componentStack.includes(tagName)) {
          const chain = [...componentStack, tagName].join(" -> ");
          logger.error(`\n❌ Error: Circular component dependency detected.`);
          logger.error(`\n💡 Component chain: ${chain}`);
          logger.error(`\n   Components cannot include themselves directly or indirectly.`);
          logger.error(`   Check your .com.html files for circular references.\n`);
          throw new Error(`Circular dependency: ${chain}`);
        }

        // Read component content
        const componentHtml = await Bun.file(componentPath).text();

        // Parse component HTML in a wrapper (as fragment)
        const tempDoc = parseHTML(
          `<html><body><div id="__tkeron_component_root__">${componentHtml}</div></body></html>`
        );
        const body = tempDoc.querySelector("body");
        const tempContainer = body?.querySelector("#__tkeron_component_root__") ||
          body?.firstElementChild;

        if (!tempContainer) continue;

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
            const nestedChanged = await processComponents(node, nextCurrentDir, rootDir, nextStack, depth + 1);
            hasChanges = hasChanges || nestedChanged;
          }
        }
      } else {
        // Component not found, recurse into children
        const childChanged = await processComponents(child, currentDir, rootDir, componentStack, depth + 1);
        hasChanges = hasChanges || childChanged;
      }
    } else {
      // Not a custom element, recurse into children
      const childChanged = await processComponents(child, currentDir, rootDir, componentStack, depth + 1);
      hasChanges = hasChanges || childChanged;
    }
  }

  return hasChanges;
}
