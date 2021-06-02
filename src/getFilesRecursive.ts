import { readdirSync, Dirent } from "fs";
import { join, resolve, relative } from "path";
import { pathToUrlResource } from "./pathToUrlResource";


interface getFilesRecursiveOptions {
    pattern?: RegExp;
    excludePattern?: RegExp;
    returnNamesOnly?: boolean;
    returnOnlyDirs?: boolean;
    useDirectoryBase?: boolean;
}

export function* getFilesRecursive(directory: string, options?: getFilesRecursiveOptions) {
    if (!options) options = {};
    const { pattern, returnNamesOnly, excludePattern, returnOnlyDirs, useDirectoryBase } = options;
    let files: Dirent[] = [];
    try {
        files = readdirSync(directory, { withFileTypes: true });
    } catch (_) {
        return;
    }
    const topDirectory = directory;
    const pending = files.map(file => ({ file, directory }));
    while (pending.length) {
        const { file, directory } = pending.pop();
        if (file.isDirectory()) {
            const path = join(directory, file.name);
            if (returnOnlyDirs && useDirectoryBase) yield pathToUrlResource(path, topDirectory).url;
            if (returnOnlyDirs && !useDirectoryBase) yield path;
            let files: Dirent[] = [];
            try {
                files = readdirSync(path, { withFileTypes: true });
            } catch (e) {
                continue;
            }
            files.map(file => ({ file, directory: path })).forEach(item => pending.push(item));
            continue;
        }
        if (!file.isFile()) continue;
        if (excludePattern && file.name.match(excludePattern)) continue;
        if (useDirectoryBase && !pattern) yield returnNamesOnly ? file.name : pathToUrlResource(join(directory, file.name), topDirectory).url;
        if (!useDirectoryBase && !pattern) yield returnNamesOnly ? file.name : join(directory, file.name);
        if (useDirectoryBase && pattern && file.name.match(pattern)) yield returnNamesOnly ? file.name : pathToUrlResource(join(directory, file.name), topDirectory).url;
        if (!useDirectoryBase && pattern && file.name.match(pattern)) yield returnNamesOnly ? file.name : join(directory, file.name);
    }
};


