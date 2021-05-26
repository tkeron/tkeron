import { readdirSync, Dirent } from "fs";
import { join } from "path";


interface getFilesRecursiveOptions {
    pattern?: RegExp;
    excludePattern?: RegExp;
    returnNamesOnly?: boolean;
    returnOnlyDirs?: boolean;
}

export function* getFilesRecursive(directory: string, options?: getFilesRecursiveOptions) {
    if (!options) options = {};
    const { pattern, returnNamesOnly, excludePattern, returnOnlyDirs } = options;
    let files: Dirent[] = [];
    try {
        files = readdirSync(directory, { withFileTypes: true });
    } catch (_) {
        return;
    }
    const pending = files.map(file => ({ file, directory }));
    while (pending.length) {
        const { file, directory } = pending.pop();
        if (file.isDirectory()) {
            const path = join(directory, file.name);
            if (returnOnlyDirs) {
                yield path;
                continue;
            }
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
        if (!pattern) yield returnNamesOnly ? file.name : join(directory, file.name);
        else if (file.name.match(pattern)) yield returnNamesOnly ? file.name : join(directory, file.name);
    }
};


