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
  transpileCache: Map<string, string>;
}

const buildComponentMap = (rootDir: string): Map<string, string[]> => {
  const allFiles = getFilePaths(rootDir, "**/*.com.ts", true);
  const map = new Map<string, string[]>();
  for (const file of allFiles) {
    const basename = file.split("/").pop()!;
    const tagName = basename.replace(/\.com\.ts$/, "");
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

const getCachedTranspile = (
  tsCode: string,
  cache: Map<string, string>,
): string => {
  const cached = cache.get(tsCode);
  if (cached !== undefined) return cached;
  const transpiler = new Bun.Transpiler({ loader: "ts" });
  const jsCode = transpiler.transformSync(tsCode);
  cache.set(tsCode, jsCode);
  return jsCode;
};

export interface ProcessComTsOptions {
  logger?: Logger;
}

export const processComTs = async (
  tempDir: string,
  options: ProcessComTsOptions = {},
): Promise<boolean> => {
  const log = options.logger || silentLogger;

  if (!tempDir || typeof tempDir !== "string") {
    log.error(`\n❌ Error: Invalid tempDir provided for processComTs.`);
    return false;
  }

  const componentMap = buildComponentMap(tempDir);
  const cache: ComponentCache = {
    componentMap,
    contentCache: new Map(),
    transpileCache: new Map(),
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
        changed = await processComponentsTs(
          htmlElement,
          dirname(htmlFile),
          tempDir,
          [],
          0,
          log,
          options,
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

const resolveComponent = (
  tagName: string,
  currentDir: string,
  componentMap: Map<string, string[]>,
): string | null => {
  const matches = componentMap.get(tagName);
  if (!matches || matches.length === 0) return null;
  const localPath = join(currentDir, `${tagName}.com.ts`);
  if (matches.includes(localPath)) return localPath;
  return matches[0]!;
};

const processComponentsTs = async (
  element: any,
  currentDir: string,
  rootDir: string,
  componentStack: string[],
  depth: number = 0,
  log: Logger = silentLogger,
  options: ProcessComTsOptions = {},
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
          const localPath = join(currentDir, `${tagName}.com.ts`);
          const filePath = matches.includes(localPath) ? localPath : matches[0];
          log.error(
            `\n❌ Error: Component name '${tagName}' must contain at least one hyphen.`,
          );
          log.error(`\n💡 Custom elements require hyphens to be valid HTML.`);
          log.error(
            `   Rename '${tagName}.com.ts' to 'tk-${tagName}.com.ts' or similar.`,
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
            log.error(`   Check your .com.ts files for circular references.\n`);
            throw new Error(`Circular dependency: ${chain}`);
          }

          const originalComponentCode = await getCachedContent(
            componentPath,
            cache.contentCache,
          );

          const elementHTML = (child as any).outerHTML;

          log.info(
            `Processing component <${tagName}> from ${componentPath.replace(rootDir, ".")}`,
          );

          const tempDoc = parseHTML(
            "<html><body>" + elementHTML + "</body></html>",
          );
          const com = tempDoc.querySelector(tagName);

          if (!com) {
            log.error(
              `\n❌ Error: Failed to create component element for <${tagName}>`,
            );
            throw new Error(
              `Failed to create component element for ${tagName}`,
            );
          }

          const hasImports = /^\s*import\s+/m.test(originalComponentCode);

          try {
            if (hasImports) {
              const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
              const tempPath = componentPath.replace(
                /\.com\.ts$/,
                `.com.${uniqueSuffix}.ts`,
              );

              const importRegex = /^(\s*import\s+.*?(?:;|\n))/gm;
              const imports: string[] = [];
              let codeWithoutImports = originalComponentCode.replace(
                importRegex,
                (match) => {
                  imports.push(match);
                  return "";
                },
              );

              const wrappedCode = `${imports.join("\n")}
export const component = async function(com: any) {
${codeWithoutImports}
}
`;
              await Bun.write(tempPath, wrappedCode);

              try {
                const module = await import(tempPath);
                await module.component(com);
              } finally {
                try {
                  const { unlink } = await import("fs/promises");
                  await unlink(tempPath);
                } catch {}
              }
            } else {
              const jsCode = getCachedTranspile(
                originalComponentCode,
                cache.transpileCache,
              );
              const AsyncFunction = Object.getPrototypeOf(
                async function () {},
              ).constructor;
              const executeComponent = new AsyncFunction("com", jsCode);
              await executeComponent(com);
            }
          } catch (execError: any) {
            log.error(
              `\n❌ Error executing component <${tagName}>: ${componentPath.replace(rootDir, ".")}`,
            );
            log.error(`   ${execError.message}`);
            throw execError;
          }

          const newInnerHTML = com.innerHTML;

          const newContentDoc = parseHTML(`<div>${newInnerHTML}</div>`);
          const div = newContentDoc.querySelector("div");

          if (!div) {
            const parent = (child as any).parentNode;
            if (parent) {
              parent.removeChild(child);
            }
            continue;
          }

          const nextCurrentDir = dirname(componentPath);
          const nextStack = [...componentStack, tagName];

          await processComponentsTs(
            div,
            nextCurrentDir,
            rootDir,
            nextStack,
            depth + 1,
            log,
            options,
            cache,
          );

          const nodesToInsert = Array.from((div as any).childNodes || []).map(
            (node: any) => (node?.cloneNode ? node.cloneNode(true) : node),
          );

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
        }
      }
    }

    const childChanged = await processComponentsTs(
      child,
      currentDir,
      rootDir,
      componentStack,
      depth,
      log,
      options,
      cache,
    );
    hasChanges = hasChanges || childChanged;
  }

  return hasChanges;
};
