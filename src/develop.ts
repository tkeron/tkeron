import { resolve, dirname } from "path";
import { watch } from "fs";
import { build } from "./build";

export interface TkeronDevOptions {
  outputDir?: string;
  sourceDir?: string;
  port?: number;
  host?: string;
}

const reloadClients = new Set<ReadableStreamDefaultController>();

export interface DevelopServer {
  stop: () => Promise<void>;
  port: number;
  host: string;
}

export const develop = async (
  options: TkeronDevOptions
): Promise<DevelopServer> => {
  if (!options || typeof options !== 'object') {
    throw new Error('Invalid options provided for develop');
  }

  const {
    port = 3000,
    host = "localhost",
    sourceDir,
    outputDir,
  } = options;

  const source = await resolve(sourceDir || "websrc");
  const target = outputDir
    ? await resolve(outputDir)
    : await resolve(dirname(source), "web");

  console.log("🔨 Building project...");
  try {
    await build({ sourceDir: source, targetDir: target });
  } catch (error: any) {
    if (error.code === "ENOENT") {
      const actualSourceDir = sourceDir || "websrc";
      console.error(`\n❌ Error: Source directory "${actualSourceDir}" does not exist.`);
      console.error(`\n💡 Tip: Create the directory first or check the path.`);
      console.error(`   Expected: ${source}\n`);
      process.exit(1);
    }
    throw error;
  }
  console.log("✅ Build complete!");

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
            "Connection": "keep-alive",
          },
        });
      }

      const filePath = url.pathname === "/" ? "/index.html" : url.pathname;
      const file = Bun.file(`${target}${filePath}`);

      if (await file.exists()) {
        if (filePath.endsWith(".html")) {
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
</script></body>`
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
        
        reloadClients.forEach((controller) => {
          try {
            controller.enqueue("data: reload\n\n");
          } catch (e) {
            reloadClients.delete(controller);
          }
        });
      }
    }
  );

  const stop = async () => {
    console.log("\n👋 Shutting down server...");
    watcher.close();
    server.stop();
    // Wait for connections to close
    await new Promise(resolve => setTimeout(resolve, 100));
  };

  setupSigintHandler(stop);

  return {
    stop,
    port: server.port ?? port,
    host: server.hostname ?? host,
  };
};

export function setupSigintHandler(stopCallback: () => Promise<void>) {
  process.on("SIGINT", async () => {
    await stopCallback();
    process.exit(0);
  });
}
