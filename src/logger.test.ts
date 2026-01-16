import { describe, it, expect, spyOn } from "bun:test";
import { logger, silentLogger, createTestLogger } from "./logger";

describe("logger", () => {
  describe("default logger", () => {
    it("should call console.log for log()", () => {
      const consoleSpy = spyOn(console, "log").mockImplementation(() => {});
      try {
        logger.log("test message");
        expect(consoleSpy).toHaveBeenCalledWith("test message");
      } finally {
        consoleSpy.mockRestore();
      }
    });

    it("should call console.error for error()", () => {
      const consoleSpy = spyOn(console, "error").mockImplementation(() => {});
      try {
        logger.error("error message");
        expect(consoleSpy).toHaveBeenCalledWith("error message");
      } finally {
        consoleSpy.mockRestore();
      }
    });

    it("should call console.warn for warn()", () => {
      const consoleSpy = spyOn(console, "warn").mockImplementation(() => {});
      try {
        logger.warn("warning message");
        expect(consoleSpy).toHaveBeenCalledWith("warning message");
      } finally {
        consoleSpy.mockRestore();
      }
    });

    it("should call console.info for info()", () => {
      const consoleSpy = spyOn(console, "info").mockImplementation(() => {});
      try {
        logger.info("info message");
        expect(consoleSpy).toHaveBeenCalledWith("info message");
      } finally {
        consoleSpy.mockRestore();
      }
    });

    it("should handle multiple arguments", () => {
      const consoleSpy = spyOn(console, "log").mockImplementation(() => {});
      try {
        logger.log("message", 123, { key: "value" });
        expect(consoleSpy).toHaveBeenCalledWith("message", 123, { key: "value" });
      } finally {
        consoleSpy.mockRestore();
      }
    });
  });

  describe("silentLogger", () => {
    it("should not throw when calling log()", () => {
      expect(() => silentLogger.log("test")).not.toThrow();
    });

    it("should not throw when calling error()", () => {
      expect(() => silentLogger.error("test")).not.toThrow();
    });

    it("should not throw when calling warn()", () => {
      expect(() => silentLogger.warn("test")).not.toThrow();
    });

    it("should not throw when calling info()", () => {
      expect(() => silentLogger.info("test")).not.toThrow();
    });
  });

  describe("createTestLogger", () => {
    it("should capture log messages", () => {
      const { logger, logs } = createTestLogger();
      logger.log("test message");
      expect(logs).toContain("test message");
    });

    it("should capture error messages", () => {
      const { logger, errors } = createTestLogger();
      logger.error("error message");
      expect(errors).toContain("error message");
    });

    it("should capture warn messages", () => {
      const { logger, warns } = createTestLogger();
      logger.warn("warn message");
      expect(warns).toContain("warn message");
    });

    it("should capture info messages", () => {
      const { logger, infos } = createTestLogger();
      logger.info("info message");
      expect(infos).toContain("info message");
    });

    it("should format multiple arguments as space-separated string", () => {
      const { logger, logs } = createTestLogger();
      logger.log("hello", "world");
      expect(logs).toContain("hello world");
    });

    it("should stringify non-string arguments", () => {
      const { logger, logs } = createTestLogger();
      logger.log("object:", { key: "value" });
      expect(logs.some(l => l.includes('"key":"value"'))).toBe(true);
    });
  });
});
