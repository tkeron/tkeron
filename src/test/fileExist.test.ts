import { join } from "path";
import { fileExists } from "../fileExist";



describe("file exist", () => {
    it("existent file", async () => {
        const path = join(__dirname, "..", "tkeron.js");
        const result = await fileExists(path);
        expect(result).toBeTruthy();
    });
    it("unexistent file", async () => {
        const path = join(__dirname, "..", "qwerty.asdf");
        const result = await fileExists(path);
        expect(result).toBeFalsy();
    });
    it("existent directory", async () => {
        const path = join(__dirname, "..");
        const result = await fileExists(path);
        expect(result).toBeTruthy();
    });
    it("unexistent directory", async () => {
        const path = join(__dirname, "..", "qwerty");
        const result = await fileExists(path);
        expect(result).toBeFalsy();
    });
});


