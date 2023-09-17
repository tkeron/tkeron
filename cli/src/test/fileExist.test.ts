import { join } from "path";
import { fileExists, fileExistsSync } from "../fileExist";



describe("fileExists", () => {
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



describe("fileExistsSync", () => {
    it("existent file", () => {
        const path = join(__dirname, "..", "tkeron.js");
        const result = fileExistsSync(path);
        expect(result).toBeTruthy();
    });
    it("unexistent file", () => {
        const path = join(__dirname, "..", "qwerty.asdf");
        const result = fileExistsSync(path);
        expect(result).toBeFalsy();
    });
    it("existent directory", () => {
        const path = join(__dirname, "..");
        const result = fileExistsSync(path);
        expect(result).toBeTruthy();
    });
    it("unexistent directory", () => {
        const path = join(__dirname, "..", "qwerty");
        const result = fileExistsSync(path);
        expect(result).toBeFalsy();
    });
});


