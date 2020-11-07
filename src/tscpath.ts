import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const tscpath = join(__dirname, "../node_modules/typescript/lib/tsc.js");
