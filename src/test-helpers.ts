import { tmpdir } from "os";
import { join } from "path";
import { createTestLogger, silentLogger } from "./logger";
import type { Logger } from "./logger";

// Re-export for convenience
export { createTestLogger, silentLogger };
export type { Logger };

/**
 * Simple hash function to generate a deterministic number from a string
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

let resourceCounter = 0;

/**
 * Get deterministic test resources (port and directory) based on test name
 * This ensures that tests can run concurrently without resource collisions
 */
export function getTestResources(testName: string): { port: number; dir: string } {
  const hash = hashString(testName);
  const port = 9000 + (hash % 10000); // Port range: 9000-18999
  const uniqueId = `${hash}-${resourceCounter++}`;
  const dir = join(tmpdir(), `tkeron-test-${uniqueId}`);
  
  return { port, dir };
}
