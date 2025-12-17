import { getPaths } from "@tkeron/tools";
import { join } from "path";
import { buildEntrypoints } from "./buildEntrypoints";

export const buildDir = async (sourceDir: string, targetDir: string) => {
    const htmlFiles = (await getPaths(sourceDir, "**/*.html", "no", true)).filter(
        (p) => !p.endsWith(".com.html")
    );

    const files = await buildEntrypoints(htmlFiles, sourceDir);

    for (const a of files?.artifacts || []) {
        const outPath = join(targetDir, a.pathR);
        if (a.pathR.toLowerCase().endsWith(".html")) {
            const html = await a.artifact.text();
            const normalized = html.replace(/<!doctype html>/i, "<!doctype html>");
            await Bun.write(outPath, normalized, { createPath: true });
        } else {
            await Bun.write(outPath, a.artifact, { createPath: true });
        }
    }
};
