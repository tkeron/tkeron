import { createReadStream, createWriteStream } from "fs";
import { mkdir } from "fs/promises";
import { dirname } from "path";

export interface CopyFileResponse {
  status: boolean;
  message: string;
  from: string;
  to: string;
  err?: Error;
}

export const copyFile = async (
  from: string,
  to: string
): Promise<CopyFileResponse> =>
  new Promise(async (resume) => {
    const toDirectory = dirname(to);

    await mkdir(toDirectory, { recursive: true });

    const rs = createReadStream(from);
    const ws = createWriteStream(to);

    rs.on("error", (err) => {
      ws.close();
      resume({ status: false, message: "error reading file", err, from, to });
    });
    ws.on("error", (err) => {
      rs.close();
      resume({ status: false, message: "error writing file", err, from, to });
    });

    rs.on("end", () => {
      rs.close();
      ws.close();
      resume({ status: true, message: "file copied", from, to });
    });

    rs.pipe(ws);
  });
