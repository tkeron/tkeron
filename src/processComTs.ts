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
      const changed = await processComponentsTs(
        htmlElement,
        dirname(htmlFile),
        tempDir,
        [],
        0,
        log,
        options,
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

const processComponentsTs = async (
  element: any,
  currentDir: string,
  rootDir: string,
  componentStack: string[],
  depth: number = 0,
  log: Logger = silentLogger,
  options: ProcessComTsOptions = {},
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
        const localPath = join(currentDir, `${tagName}.com.ts`);
        const globMatches = getFilePaths(rootDir, `**/${tagName}.com.ts`, true);
        if ((await Bun.file(localPath).exists()) || globMatches.length > 0) {
          log.error(
            `\n❌ Error: Component name '${tagName}' must contain at least one hyphen.`,
          );
          log.error(`\n💡 Custom elements require hyphens to be valid HTML.`);
          log.error(
            `   Rename '${tagName}.com.ts' to 'tk-${tagName}.com.ts' or similar.`,
          );
          log.error(
            `   File: ${(await Bun.file(localPath).exists()) ? localPath : globMatches[0]}\n`,
          );
          throw new Error(
            `Component name '${tagName}' must contain at least one hyphen`,
          );
        }
      } else {
        const localPath = join(currentDir, `${tagName}.com.ts`);

        let componentPath: string | null = null;

        if (await Bun.file(localPath).exists()) {
          componentPath = localPath;
        } else {
          const globMatches = getFilePaths(
            rootDir,
            `**/${tagName}.com.ts`,
            true,
          );
          if (globMatches.length > 0) {
            componentPath = globMatches[0];
          }
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
            log.error(`   Check your .com.ts files for circular references.\n`);
            throw new Error(`Circular dependency: ${chain}`);
          }

          const originalComponentCode = await Bun.file(componentPath).text();

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
                  const fs = await import("fs/promises");
                  await fs.unlink(tempPath);
                } catch {}
              }
            } else {
              const transpiler = new Bun.Transpiler({ loader: "ts" });
              const jsCode = transpiler.transformSync(originalComponentCode);
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
    );
    hasChanges = hasChanges || childChanged;
  }

  return hasChanges;
};
