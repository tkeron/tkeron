import { parseHTML } from "@tkeron/html-parser";
import { getFilePaths } from "@tkeron/tools";
import { join, dirname } from "path";
import type { Logger } from "@tkeron/tools";
import { silentLogger } from "@tkeron/tools";

const DOCTYPE = "<!doctype html>\n";

const ensureHtmlDocument = (html: string): string => {
  const hasHtmlTag = /<\s*html[\s>]/i.test(html);
  if (hasHtmlTag) return html;
  return `${DOCTYPE}<html><head></head><body>${html}</body></html>`;
};

interface ComponentCache {
  componentMap: Map<string, string[]>;
  contentCache: Map<string, string>;
}

const buildComponentMap = (rootDir: string): Map<string, string[]> => {
  const allFiles = getFilePaths(rootDir, "**/*.com.html", true);
  const map = new Map<string, string[]>();
  for (const file of allFiles) {
    const basename = file.split("/").pop()!;
    const tagName = basename.replace(/\.com\.html$/, "");
    if (!map.has(tagName)) map.set(tagName, []);
    map.get(tagName)!.push(file);
  }
  return map;
};

const getCachedContent = async (
  path: string,
  cache: Map<string, string>,
): Promise<string> => {
  const cached = cache.get(path);
  if (cached !== undefined) return cached;
  const content = await Bun.file(path).text();
  cache.set(path, content);
  return content;
};

export interface ProcessComOptions {
  logger?: Logger;
}

const resolveComponent = (
  tagName: string,
  currentDir: string,
  componentMap: Map<string, string[]>,
): string | null => {
  const matches = componentMap.get(tagName);
  if (!matches || matches.length === 0) return null;
  const localPath = join(currentDir, `${tagName}.com.html`);
  if (matches.includes(localPath)) return localPath;
  return matches[0]!;
};

export const processCom = async (
  tempDir: string,
  options: ProcessComOptions = {},
): Promise<boolean> => {
  const log = options.logger || silentLogger;

  if (!tempDir || typeof tempDir !== "string") {
    log.error(`\n❌ Error: Invalid tempDir provided for processCom.`);
    return false;
  }

  const componentMap = buildComponentMap(tempDir);
  const cache: ComponentCache = {
    componentMap,
    contentCache: new Map(),
  };

  const htmlFiles = getFilePaths(tempDir, "**/*.html", true).filter(
    (p) => !p.endsWith(".com.html"),
  );

  const results = await Promise.all(
    htmlFiles.map(async (htmlFile) => {
      const htmlContent = await Bun.file(htmlFile).text();
      const document = parseHTML(ensureHtmlDocument(htmlContent));

      const htmlElement =
        document.querySelector("html") || document.documentElement;
      let changed = false;
      if (htmlElement) {
        changed = await processComponents(
          htmlElement,
          dirname(htmlFile),
          tempDir,
          [],
          0,
          log,
          cache,
        );
      }

      const output =
        DOCTYPE +
        (htmlElement?.outerHTML || document.documentElement?.outerHTML || "");
      await Bun.write(htmlFile, output);
      return changed;
    }),
  );

  return results.some(Boolean);
};

const processComponents = async (
  element: any,
  currentDir: string,
  rootDir: string,
  componentStack: string[],
  depth: number = 0,
  log: Logger = silentLogger,
  cache: ComponentCache,
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
        const matches = cache.componentMap.get(tagName);
        if (matches && matches.length > 0) {
          const localPath = join(currentDir, `${tagName}.com.html`);
          const filePath = matches.includes(localPath) ? localPath : matches[0];
          log.error(
            `\n❌ Error: Component name '${tagName}' must contain at least one hyphen.`,
          );
          log.error(`\n💡 Custom elements require hyphens to be valid HTML.`);
          log.error(
            `   Rename '${tagName}.com.html' to 'tk-${tagName}.com.html' or similar.`,
          );
          log.error(`   File: ${filePath}\n`);
          throw new Error(
            `Component name '${tagName}' must contain at least one hyphen`,
          );
        }
      } else {
        const componentPath = resolveComponent(
          tagName,
          currentDir,
          cache.componentMap,
        );

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

          const componentHtml = await getCachedContent(
            componentPath,
            cache.contentCache,
          );

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
                cache,
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
      cache,
    );
    hasChanges = hasChanges || childChanged;
  }

  return hasChanges;
};
