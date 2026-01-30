import { resolve, dirname } from "path";
import { watch } from "fs";
import { build } from "./build";
import type { Logger } from "./logger";
import { logger as defaultLogger } from "./logger";
import { setupSigintHandler } from "./setupSigintHandler";

export interface TkeronDevOptions {
  outputDir?: string;
  sourceDir?: string;
  port?: number;
  host?: string;
  logger?: Logger;
}

const reloadClients = new Set<ReadableStreamDefaultController>();

export interface DevelopServer {
  stop: () => Promise<void>;
  port: number;
  host: string;
}

export const develop = async (
  options: TkeronDevOptions,
): Promise<DevelopServer> => {
  if (!options || typeof options !== "object") {
    throw new Error("Invalid options provided for develop");
  }

  const {
    port = 3000,
    host = "localhost",
    sourceDir,
    outputDir,
    logger: log = defaultLogger,
  } = options;

  const source = await resolve(sourceDir || "websrc");
  const target = outputDir
    ? await resolve(outputDir)
    : await resolve(dirname(source), "web");

  log.log("🔨 Building project...");
  try {
    await build({ sourceDir: source, targetDir: target, logger: log });
  } catch (error: any) {
    if (error.code === "ENOENT") {
      const actualSourceDir = sourceDir || "websrc";
      log.error(
        `\n❌ Error: Source directory "${actualSourceDir}" does not exist.`,
      );
      log.error(
        `\n💡 Tip: Create the directory first, check the path, or run 'tk init' to create a new project.`,
      );
      log.error(`   Expected: ${source}\n`);
      process.exit(1);
    }
    throw error;
  }
  log.log("✅ Build complete!");

  const server = Bun.serve({
    development: true,
    port,
    hostname: host,
    async fetch(req) {
      const url = new URL(req.url);

      if (url.pathname === "/dev-reload") {
        let controller: ReadableStreamDefaultController;
        const stream = new ReadableStream({
          start(ctrl) {
            controller = ctrl;
            reloadClients.add(controller);
            controller.enqueue("data: connected\n\n");
          },
          cancel() {
            reloadClients.delete(controller);
          },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
          },
        });
      }

      let filePath =
        url.pathname === "/" ? "/index.html" : decodeURIComponent(url.pathname);

      if (filePath.endsWith("/")) {
        filePath = `${filePath}index.html`;
      }

      let file = Bun.file(`${target}${filePath}`);
      let isHtml = filePath.endsWith(".html");

      if (!(await file.exists()) && !filePath.includes(".")) {
        const htmlFile = Bun.file(`${target}${filePath}.html`);
        if (await htmlFile.exists()) {
          file = htmlFile;
          isHtml = true;
        }
      }

      if (await file.exists()) {
        if (isHtml) {
          const html = await file.text();
          const injectedHtml = html.replace(
            "</body>",
            `<script>
(function() {
  let es;
  function connect() {
    es = new EventSource('/dev-reload');
    es.onmessage = function(e) {
      if (e.data === 'reload') {
        console.log('🔄 Reloading page...');
        location.reload();
      }
    };
    es.onerror = function() {
      es.close();
      setTimeout(connect, 1000);
    };
  }
  connect();
})();
</script></body>`,
          );
          return new Response(injectedHtml, {
            headers: { "Content-Type": "text/html" },
          });
        }
        return new Response(file);
      }

      return new Response("Not Found", { status: 404 });
    },
  });

  log.log(`🚀 Development server running at http://${host}:${port}`);

  const watcher = watch(
    source,
    { recursive: true },
    async (event, filename) => {
      if (filename) {
        log.log(`📝 File changed: ${filename}`);
        log.log("🔨 Rebuilding...");
        await build({ sourceDir: source, targetDir: target, logger: log });
        log.log("✅ Build complete!");

        reloadClients.forEach((controller) => {
          try {
            controller.enqueue("data: reload\n\n");
          } catch (e) {
            reloadClients.delete(controller);
          }
        });
      }
    },
  );

  const stop = async () => {
    log.log("\n👋 Shutting down server...");
    watcher.close();
    server.stop();

    await new Promise((resolve) => setTimeout(resolve, 100));
  };

  setupSigintHandler(stop);

  return {
    stop,
    port: server.port ?? port,
    host: server.hostname ?? host,
  };
};

export { setupSigintHandler } from "./setupSigintHandler";
