import { resolve, dirname } from "path";
import { watch } from "fs";
import { build } from "./src/build";

export interface TkeronDevOptions {
  outputDir?: string;
  sourceDir?: string;
  port?: number;
  host?: string;
}

export interface DevelopServer {
  stop: () => void;
  port: number;
  host: string;
}

export const develop = async (
  options: TkeronDevOptions
): Promise<DevelopServer> => {
  const {
    port = 3000,
    host = "localhost",
    outputDir = "webout",
    sourceDir = "websrc",
  } = options;

  const source = await resolve(sourceDir);
  const target = outputDir
    ? await resolve(outputDir)
    : await resolve(dirname(source), "webout");

  console.log("🔨 Building project...");
  await build({ sourceDir: source, targetDir: target });
  console.log("✅ Build complete!");

  const server = Bun.serve({
    port,
    hostname: host,
    async fetch(req) {
      const url = new URL(req.url);
      const filePath = url.pathname === "/" ? "/index.html" : url.pathname;
      const file = Bun.file(`${target}${filePath}`);

      if (await file.exists()) {
        return new Response(file);
      }

      return new Response("Not Found", { status: 404 });
    },
  });

  console.log(`🚀 Development server running at http://${host}:${port}`);

  const watcher = watch(
    source,
    { recursive: true },
    async (event, filename) => {
      if (filename) {
        console.log(`📝 File changed: ${filename}`);
        console.log("🔨 Rebuilding...");
        await build({ sourceDir: source, targetDir: target });
        console.log("✅ Build complete!");
      }
    }
  );

  const stop = () => {
    console.log("\n👋 Shutting down server...");
    watcher.close();
    server.stop();
  };

  process.on("SIGINT", () => {
    stop();
    process.exit(0);
  });

  return {
    stop,
    port: server.port ?? port,
    host: server.hostname ?? host,
  };
};
