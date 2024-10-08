import { mkdir, rm, rmdir } from "fs/promises";
import { main } from "../main";

beforeAll(async () => {
  await mkdir("front", { recursive: true });
});
afterAll(async () => {
  await rm("front", { force: true, recursive: true });
});

describe("main", () => {
  it("command build", () => {
    main("tk", ["build"]);
  });
});
