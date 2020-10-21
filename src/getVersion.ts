import fs from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const getVersion = (): string => {
    const pkg = fs.readFileSync(`${__dirname}/../package.json`, { encoding: "utf-8" });
    const json = JSON.parse(pkg);
    return json.version;
};

export default getVersion;