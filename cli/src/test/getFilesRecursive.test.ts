import { mkdir, rm, writeFile } from "fs/promises";
import { join, dirname } from "path";
import { fileExists } from "../fileExist";
import { getFilesRecursive } from "../getFilesRecursive";

const testDir = join(__dirname, "..", "..", "tmp_test_dir");
const filesPaths = [
  join(testDir, "index.html"),
  join(testDir, "style.css"),
  join(testDir, "main.js"),
  join(testDir, "robots.txt"),
  join(testDir, "docs/index.html"),
  join(testDir, "docs/main.js"),
  join(testDir, "docs/style.css"),
  join(testDir, "docs/robots.txt"),
  join(testDir, "admin/index.html"),
  join(testDir, "admin/main.js"),
  join(testDir, "admin/style.css"),
  join(testDir, "admin/robots.txt"),
];

beforeAll(async () => {
  if (await fileExists(testDir))
    await rm(testDir, { recursive: true, force: true });
  await mkdir(testDir);
  for (const path of filesPaths) {
    const dir = dirname(path);
    if (!(await fileExists(dir))) mkdir(dir);
    await writeFile(path, "...", { encoding: "utf-8" });
  }
});
afterAll(async () => {
  await rm(testDir, { recursive: true, force: true });
});

describe("getFilesRecursive", () => {
  it("get all files", async () => {
    const result = [...getFilesRecursive(testDir, { returnNamesOnly: true })];
    expect(result).toMatchObject([
      "style.css",
      "robots.txt",
      "main.js",
      "index.html",
      "style.css",
      "robots.txt",
      "main.js",
      "index.html",
      "style.css",
      "robots.txt",
      "main.js",
      "index.html",
    ]);
  });
  it("get all files excluding some", async () => {
    const result = [
      ...getFilesRecursive(testDir, {
        returnNamesOnly: true,
        excludePattern: /\.html$/,
      }),
    ];
    expect(result).toMatchObject([
      "style.css",
      "robots.txt",
      "main.js",
      "style.css",
      "robots.txt",
      "main.js",
      "style.css",
      "robots.txt",
      "main.js",
    ]);
  });
  it("get all files with pattern", async () => {
    const result = [
      ...getFilesRecursive(testDir, {
        returnNamesOnly: true,
        pattern: /\.txt$/,
      }),
    ];
    expect(result).toMatchObject(["robots.txt", "robots.txt", "robots.txt"]);
  });
  it("get all files with pattern excluding some", async () => {
    const result = [
      ...getFilesRecursive(testDir, {
        returnNamesOnly: true,
        pattern: /\.txt$/,
        excludePattern: /\.html$/,
      }),
    ];
    expect(result).toMatchObject(["robots.txt", "robots.txt", "robots.txt"]);
  });
});
