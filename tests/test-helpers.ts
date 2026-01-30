import { tmpdir } from "os";
import { join } from "path";
import { createTestLogger, silentLogger } from "../src/logger";
import type { Logger } from "../src/logger";

export { createTestLogger, silentLogger };
export type { Logger };

const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

let resourceCounter = 0;

export const getTestResources = (
  testName: string,
): { port: number; dir: string } => {
  const hash = hashString(testName);
  const port = 9000 + (hash % 10000); // Port range: 9000-18999
  const uniqueId = `${hash}-${resourceCounter++}`;
  const dir = join(tmpdir(), `tkeron-test-${uniqueId}`);

  return { port, dir };
};
