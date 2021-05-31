import { buildLoaders, getExtModules } from "../buildLoaders";




describe("buildLoaders", () => {
    it("verify loaders", () => {
        const expectedKeys = ['.css', '.gif', '.html', '.ico', '.jpg', '.js', '.png', '.svg', '.webp'];
        const expectedValues = ['file', 'file', 'file', 'file', 'file', 'file', 'file', 'file', 'text'];
        const keys = Object.keys(buildLoaders).sort();
        const values = Object.values(buildLoaders).sort();
        expect(keys).toMatchObject(expectedKeys);
        expect(values).toMatchObject(expectedValues);
    });
    it("verify ext modules", () => {
        const expected = `declare module '*.css';
        declare module '*.gif';
        declare module '*.html';
        declare module '*.ico';
        declare module '*.jpg';
        declare module '*.js';
        declare module '*.png';
        declare module '*.svg';
        declare module '*.webp';
        `.replace(/[\n\t]/g, " ").replace(/\s+/g, " ");
        const extModules = getExtModules().replace(/[\n\t]/g, " ").replace(/\s+/g, " ");
        expect(extModules).toBe(expected);
    });
});


