import { describe, it, expect } from "bun:test";
import { ensureTsconfig } from "../src/ensureTsconfig";
import { rmSync, existsSync, readFileSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { getTestResources } from "./test-helpers";

describe("ensureTsconfig", () => {
  it("should create tsconfig.json when none exists", () => {
    const { dir: TEST_DIR } = getTestResources("ensure-create-new");

    try {
      mkdirSync(TEST_DIR, { recursive: true });

      ensureTsconfig(TEST_DIR);

      const tsconfigPath = join(TEST_DIR, "tsconfig.json");
      expect(existsSync(tsconfigPath)).toBe(true);

      const tsconfig = JSON.parse(readFileSync(tsconfigPath, "utf-8"));
      expect(tsconfig.include).toContain("tkeron.d.ts");
      expect(tsconfig.include).toContain("websrc/**/*");
    } finally {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  it("should include reasonable compilerOptions when creating fresh", () => {
    const { dir: TEST_DIR } = getTestResources("ensure-compiler-options");

    try {
      mkdirSync(TEST_DIR, { recursive: true });

      ensureTsconfig(TEST_DIR);

      const tsconfig = JSON.parse(
        readFileSync(join(TEST_DIR, "tsconfig.json"), "utf-8"),
      );
      expect(tsconfig.compilerOptions).toBeDefined();
      expect(tsconfig.compilerOptions.strict).toBe(true);
      expect(tsconfig.compilerOptions.skipLibCheck).toBe(true);
    } finally {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  it("should merge into existing tsconfig preserving all settings", () => {
    const { dir: TEST_DIR } = getTestResources("ensure-merge-existing");

    try {
      mkdirSync(TEST_DIR, { recursive: true });
      writeFileSync(
        join(TEST_DIR, "tsconfig.json"),
        JSON.stringify({
          compilerOptions: {
            target: "ES2020",
            strict: false,
            paths: { "@/*": ["./src/*"] },
          },
          exclude: ["node_modules", "dist"],
          include: ["src/**/*"],
        }),
      );

      ensureTsconfig(TEST_DIR);

      const tsconfig = JSON.parse(
        readFileSync(join(TEST_DIR, "tsconfig.json"), "utf-8"),
      );
      expect(tsconfig.compilerOptions.target).toBe("ES2020");
      expect(tsconfig.compilerOptions.strict).toBe(false);
      expect(tsconfig.compilerOptions.paths).toEqual({ "@/*": ["./src/*"] });
      expect(tsconfig.exclude).toEqual(["node_modules", "dist"]);
      expect(tsconfig.include).toContain("src/**/*");
      expect(tsconfig.include).toContain("tkeron.d.ts");
      expect(tsconfig.include).toContain("websrc/**/*");
    } finally {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  it("should not duplicate entries when includes already present", () => {
    const { dir: TEST_DIR } = getTestResources("ensure-no-duplicates");

    try {
      mkdirSync(TEST_DIR, { recursive: true });
      writeFileSync(
        join(TEST_DIR, "tsconfig.json"),
        JSON.stringify({ include: ["websrc/**/*", "tkeron.d.ts"] }),
      );

      ensureTsconfig(TEST_DIR);

      const tsconfig = JSON.parse(
        readFileSync(join(TEST_DIR, "tsconfig.json"), "utf-8"),
      );
      const dtsCount = tsconfig.include.filter(
        (e: string) => e === "tkeron.d.ts",
      ).length;
      const websrcCount = tsconfig.include.filter(
        (e: string) => e === "websrc/**/*",
      ).length;
      expect(dtsCount).toBe(1);
      expect(websrcCount).toBe(1);
    } finally {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  it("should add include array when tsconfig has none", () => {
    const { dir: TEST_DIR } = getTestResources("ensure-add-include");

    try {
      mkdirSync(TEST_DIR, { recursive: true });
      writeFileSync(
        join(TEST_DIR, "tsconfig.json"),
        JSON.stringify({ compilerOptions: { strict: true } }),
      );

      ensureTsconfig(TEST_DIR);

      const tsconfig = JSON.parse(
        readFileSync(join(TEST_DIR, "tsconfig.json"), "utf-8"),
      );
      expect(tsconfig.include).toBeDefined();
      expect(tsconfig.include).toContain("tkeron.d.ts");
      expect(tsconfig.include).toContain("websrc/**/*");
      expect(tsconfig.compilerOptions.strict).toBe(true);
    } finally {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  it("should handle invalid JSON in existing tsconfig by creating fresh", () => {
    const { dir: TEST_DIR } = getTestResources("ensure-invalid-json");

    try {
      mkdirSync(TEST_DIR, { recursive: true });
      writeFileSync(join(TEST_DIR, "tsconfig.json"), "{ invalid json }}}");

      ensureTsconfig(TEST_DIR);

      const tsconfig = JSON.parse(
        readFileSync(join(TEST_DIR, "tsconfig.json"), "utf-8"),
      );
      expect(tsconfig.include).toContain("tkeron.d.ts");
      expect(tsconfig.include).toContain("websrc/**/*");
      expect(tsconfig.compilerOptions).toBeDefined();
    } finally {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  it("should handle empty file as existing tsconfig by creating fresh", () => {
    const { dir: TEST_DIR } = getTestResources("ensure-empty-file");

    try {
      mkdirSync(TEST_DIR, { recursive: true });
      writeFileSync(join(TEST_DIR, "tsconfig.json"), "");

      ensureTsconfig(TEST_DIR);

      const tsconfig = JSON.parse(
        readFileSync(join(TEST_DIR, "tsconfig.json"), "utf-8"),
      );
      expect(tsconfig.include).toContain("tkeron.d.ts");
      expect(tsconfig.include).toContain("websrc/**/*");
    } finally {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  it("should restore previous tsconfig when provided", () => {
    const { dir: TEST_DIR } = getTestResources("ensure-restore-previous");

    try {
      mkdirSync(TEST_DIR, { recursive: true });

      const previousTsconfig = {
        compilerOptions: { target: "ES2022", jsx: "react-jsx" },
        include: ["app/**/*"],
      };

      ensureTsconfig(TEST_DIR, previousTsconfig);

      const tsconfig = JSON.parse(
        readFileSync(join(TEST_DIR, "tsconfig.json"), "utf-8"),
      );
      expect(tsconfig.compilerOptions.target).toBe("ES2022");
      expect(tsconfig.compilerOptions.jsx).toBe("react-jsx");
      expect(tsconfig.include).toContain("app/**/*");
      expect(tsconfig.include).toContain("tkeron.d.ts");
      expect(tsconfig.include).toContain("websrc/**/*");
    } finally {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  it("should use previous tsconfig over file on disk when both exist", () => {
    const { dir: TEST_DIR } = getTestResources("ensure-previous-over-disk");

    try {
      mkdirSync(TEST_DIR, { recursive: true });
      writeFileSync(
        join(TEST_DIR, "tsconfig.json"),
        JSON.stringify({
          compilerOptions: { target: "ESNext" },
          include: ["websrc/**/*", "tkeron.d.ts"],
        }),
      );

      const previousTsconfig = {
        compilerOptions: { target: "ES2020", outDir: "./dist" },
        include: ["src/**/*"],
        exclude: ["tests"],
      };

      ensureTsconfig(TEST_DIR, previousTsconfig);

      const tsconfig = JSON.parse(
        readFileSync(join(TEST_DIR, "tsconfig.json"), "utf-8"),
      );
      expect(tsconfig.compilerOptions.target).toBe("ES2020");
      expect(tsconfig.compilerOptions.outDir).toBe("./dist");
      expect(tsconfig.include).toContain("src/**/*");
      expect(tsconfig.include).toContain("tkeron.d.ts");
      expect(tsconfig.include).toContain("websrc/**/*");
      expect(tsconfig.exclude).toEqual(["tests"]);
    } finally {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  it("should be idempotent - running twice produces same result", () => {
    const { dir: TEST_DIR } = getTestResources("ensure-idempotent");

    try {
      mkdirSync(TEST_DIR, { recursive: true });
      writeFileSync(
        join(TEST_DIR, "tsconfig.json"),
        JSON.stringify({ include: ["src/**/*"] }),
      );

      ensureTsconfig(TEST_DIR);
      const first = readFileSync(join(TEST_DIR, "tsconfig.json"), "utf-8");

      ensureTsconfig(TEST_DIR);
      const second = readFileSync(join(TEST_DIR, "tsconfig.json"), "utf-8");

      expect(first).toBe(second);
    } finally {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });
});
