import fs from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const getPkg = (): any => {
    const pkg = fs.readFileSync(`${__dirname}/../package.json`, { encoding: "utf-8" });
    const json = JSON.parse(pkg);
    return json;
};

export const getVersion = (): string => {
    const pkg = getPkg();
    //@ts-ignore
    return pkg.version;
};

export default getVersion;