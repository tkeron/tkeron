import { parseHTML } from "@tkeron/html-parser";
import { getFilePaths } from "@tkeron/tools";

const DOCTYPE = "<!doctype html>\n";

export const deduplicateComStyles = async (tempDir: string): Promise<void> => {
  if (!tempDir || typeof tempDir !== "string") return;

  const htmlFiles = getFilePaths(tempDir, "**/*.html", true).filter(
    (p) => !p.endsWith(".com.html"),
  );

  await Promise.all(
    htmlFiles.map(async (htmlFile) => {
      const htmlContent = await Bun.file(htmlFile).text();
      const document = parseHTML(htmlContent);

      const allStyles = document.querySelectorAll("style[data-tk-com]");
      if (!allStyles || allStyles.length === 0) return;

      const seen = new Set<string>();
      const head = document.querySelector("head");

      for (const style of allStyles) {
        const tkId = style.getAttribute("data-tk-com");
        if (!tkId) continue;

        if (seen.has(tkId)) {
          style.remove();
        } else {
          seen.add(tkId);
          if (head) head.appendChild(style);
        }
      }

      const htmlElement = document.documentElement;
      const output = DOCTYPE + (htmlElement?.outerHTML || "");
      await Bun.write(htmlFile, output);
    }),
  );
};
