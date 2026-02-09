import { parseHTML } from "@tkeron/html-parser";
import { getFilePaths } from "@tkeron/tools";
import { join, dirname } from "path";
import type { Logger } from "./logger";
import { silentLogger } from "./logger";

const DOCTYPE = "<!doctype html>\n";

const ensureHtmlDocument = (html: string): string => {
  const hasHtmlTag = /<\s*html[\s>]/i.test(html);
  if (hasHtmlTag) return html;
  return `${DOCTYPE}<html><head></head><body>${html}</body></html>`;
};

export interface ProcessComOptions {
  logger?: Logger;
}

export const processCom = async (
  tempDir: string,
  options: ProcessComOptions = {},
): Promise<boolean> => {
  const log = options.logger || silentLogger;

  if (!tempDir || typeof tempDir !== "string") {
    log.error(`\n❌ Error: Invalid tempDir provided for processCom.`);
    return false;
  }

  const htmlFiles = getFilePaths(tempDir, "**/*.html", true).filter(
    (p) => !p.endsWith(".com.html"),
  );

  let hasChanges = false;

  for (const htmlFile of htmlFiles) {
    const htmlContent = await Bun.file(htmlFile).text();
    const document = parseHTML(ensureHtmlDocument(htmlContent));

    const htmlElement =
      document.querySelector("html") || document.documentElement;
    if (htmlElement) {
      const changed = await processComponents(
        htmlElement,
        dirname(htmlFile),
        tempDir,
        [],
        0,
        log,
      );
      hasChanges = hasChanges || changed;
    }

    const output =
      DOCTYPE +
      (htmlElement?.outerHTML || document.documentElement?.outerHTML || "");
    await Bun.write(htmlFile, output);
  }

  return hasChanges;
};

const processComponents = async (
  element: any,
  currentDir: string,
  rootDir: string,
  componentStack: string[],
  depth: number = 0,
  log: Logger = silentLogger,
): Promise<boolean> => {
  let hasChanges = false;
  const MAX_DEPTH = 50;
  if (depth > MAX_DEPTH) {
    log.warn(`Maximum component nesting depth (${MAX_DEPTH}) reached`);
    return hasChanges;
  }

  const children = Array.from(element.children || []);

  for (const child of children) {
    const tagName = (child as any).tagName?.toLowerCase();

    if (tagName) {
      if (!tagName.includes("-")) {
        const localPath = join(currentDir, `${tagName}.com.html`);
        const rootPath = join(rootDir, `${tagName}.com.html`);
        if (
          (await Bun.file(localPath).exists()) ||
          (await Bun.file(rootPath).exists())
        ) {
          log.error(
            `\n❌ Error: Component name '${tagName}' must contain at least one hyphen.`,
          );
          log.error(`\n💡 Custom elements require hyphens to be valid HTML.`);
          log.error(
            `   Rename '${tagName}.com.html' to 'tk-${tagName}.com.html' or similar.`,
          );
          log.error(
            `   File: ${(await Bun.file(localPath).exists()) ? localPath : rootPath}\n`,
          );
          throw new Error(
            `Component name '${tagName}' must contain at least one hyphen`,
          );
        }
      } else {
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
            log.error(`\n❌ Error: Circular component dependency detected.`);
            log.error(`\n💡 Component chain: ${chain}`);
            log.error(
              `\n   Components cannot include themselves directly or indirectly.`,
            );
            log.error(
              `   Check your .com.html files for circular references.\n`,
            );
            throw new Error(`Circular dependency: ${chain}`);
          }

          const componentHtml = await Bun.file(componentPath).text();

          const tempDoc = parseHTML(
            `<html><body><div id="__tkeron_component_root__">${componentHtml}</div></body></html>`,
          );
          const body = tempDoc.querySelector("body");
          const tempContainer =
            body?.querySelector("#__tkeron_component_root__") ||
            body?.firstElementChild;

          if (!tempContainer) continue;

          const nodesToInsert = Array.from(
            (tempContainer as any).childNodes || [],
          ).map((node: any) => (node?.cloneNode ? node.cloneNode(true) : node));

          const parent = (child as any).parentNode;

          if (parent) {
            if (nodesToInsert.length === 0) {
              parent.removeChild(child);
            } else if (nodesToInsert.length === 1) {
              parent.replaceChild(nodesToInsert[0], child);
            } else {
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

          for (const node of nodesToInsert) {
            if ((node as any).nodeType === 1) {
              const nestedChanged = await processComponents(
                node,
                nextCurrentDir,
                rootDir,
                nextStack,
                depth + 1,
                log,
              );
              hasChanges = hasChanges || nestedChanged;
            }
          }
        }
      }
    }

    const childChanged = await processComponents(
      child,
      currentDir,
      rootDir,
      componentStack,
      depth,
      log,
    );
    hasChanges = hasChanges || childChanged;
  }

  return hasChanges;
};
