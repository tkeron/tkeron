import { getPaths } from "@tkeron/tools";
import { join } from "path";
import { buildEntrypoints } from "./buildEntrypoints";

export const buildDir = async (sourceDir: string, targetDir: string) => {
    const htmlFiles = await getPaths(sourceDir, "**/*.html", "no", true);

    const files = await buildEntrypoints(htmlFiles, sourceDir);

    for (const a of files?.artifacts || []) {
        await Bun.write(join(targetDir, a.pathR), a.artifact, { createPath: true });
    }
};
