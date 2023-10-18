import { join } from "path";
import { pathToUrlResource } from "../pathToUrlResource";

describe("pathToUrlResource", () => {
  it("test dir from 1 level up", async () => {
    const result = pathToUrlResource(__dirname, join(__dirname, ".."));
    expect(result).toMatchObject({ url: "/test", resource: "test" });
  });
  it("test dir from 2 levels up", async () => {
    const result = pathToUrlResource(__dirname, join(__dirname, "..", ".."));
    expect(result).toMatchObject({ url: "/dist/test", resource: "dist__test" });
  });
});
