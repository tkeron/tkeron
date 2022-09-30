import express from "express";
import { Server } from "http";
import watch from "node-watch";
import { EventEmitter } from "stream";
import { build } from "./build";
import { fileExists } from "./fileExist";
import { getOptions } from "./getOptions";

export const dev = async (
  sourceDir: string,
  outputDir: string,
  port = 5000,
  addr = "127.0.0.1"
) => {
  const opts = getOptions({ outputDir, sourceDir });
  sourceDir = opts.sourceDir;
  outputDir = opts.outputDir;
  if (!(await fileExists(sourceDir))) throw `source directory doesn't exist`;
  await build({ sourceDir, outputDir, hotRestart: true });
  let building = false;
  let rebuild = false;
  const events = new EventEmitter();
  const watcher = watch(sourceDir, { recursive: true }, async (_event, _) => {
    if (building) {
      rebuild = true;
      return;
    }
    building = true;
    await build({ sourceDir, outputDir, hotRestart: true });
    if (rebuild) await build({ sourceDir, outputDir, hotRestart: true });
    events.emit("built");
    building = false;
  });
  const app = express();
  app.use(express.static(outputDir));

  let firstRequest = true;
  app.get("/compdate.txt", (_request, reply) => {
    if (firstRequest) {
      firstRequest = false;
      reply.send({ reload: true });
      return;
    }
    const lastListener = () => reply.send({ reload: true });
    events.once("built", lastListener);
  });
  let server: Server;
  try {
    server = app.listen(port, addr, () =>
      console["log"](`linstening on ${addr}:${port}`)
    );
  } catch (_) {
    console["log"]("error starting local dev server", _);
  }
  return {
    closeWatcher: () => watcher.close(),
    closeServer: () => server.close(),
  };
};

export const cmdDev = async (
  sourceDir: string,
  outputDir: string,
  port = 5000,
  addr = "127.0.0.1"
) => {
  await dev(sourceDir, outputDir, port, addr);
};
