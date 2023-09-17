import { stat } from "fs/promises";
import { statSync } from "fs";

export const fileExists = async (path: string) => !!(await stat(path).catch(_ => false));
export const fileExistsSync = (path: string) => {
    try {
        statSync(path);
    } catch (e) {
        return false;
    }
    return true;
};

