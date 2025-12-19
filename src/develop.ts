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
    sourceDir = "websrc",
    outputDir,
  } = options;

  const source = await resolve(sourceDir);
  const target = outputDir
    ? await resolve(outputDir)
    : await resolve(dirname(source), "web");

  console.log("🔨 Building project...");
  await build({ sourceDir: source, targetDir: target });
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
            `<script>new EventSource('/dev-reload').onmessage=e=>{if(e.data==='reload')location.reload()}</script></body>`
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
