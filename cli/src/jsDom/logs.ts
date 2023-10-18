import { writeLogElement } from "./writeLogElement";

export const handleLogs = (logs: any[], document: Document) => {
  for (const log of logs) {
    writeLogElement(
      typeof log === "string" ? log : JSON.stringify(log, null, 4),
      document,
      "tkeron_log",
    );
  }
};
