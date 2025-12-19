import { describe, it, expect, beforeAll } from "bun:test";
import { build } from "./build";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { parseHTML } from "@tkeron/html-parser";

describe("Examples Build Tests", () => {
  const EXAMPLES_DIR = join(import.meta.dir, "..", "examples");

  // Build all examples once before running any tests
  beforeAll(async () => {
    const examples = [
      "basic_build",
      "with_assets", 
      "with_pre",
      "with_com_html_priority",
      "with_com_ts_priority",
      "with_com_mixed_priority"
    ];

    await Promise.all(
      examples.map(example => 
        build({
          sourceDir: join(EXAMPLES_DIR, example, "src"),
          targetDir: join(EXAMPLES_DIR, example, "web"),
        })
      )
    );
  }, 30000);

  describe("basic_build", () => {
    const srcDir = join(EXAMPLES_DIR, "basic_build/src");
    const outDir = join(EXAMPLES_DIR, "basic_build/web");

    it("should generate index.html and index.js", () => {
      expect(existsSync(join(outDir, "index.html"))).toBe(true);
      expect(existsSync(join(outDir, "index.js"))).toBe(true);
    });

    it("index.html should have valid structure with script injection", () => {
      const htmlContent = readFileSync(join(outDir, "index.html"), "utf-8");
      const doc = parseHTML(htmlContent);
      
      // Check basic structure
      expect(htmlContent).toContain("<!doctype html>");
      expect(doc.querySelector("html")).toBeTruthy();
      expect(doc.querySelector("head")).toBeTruthy();
      expect(doc.querySelector("body")).toBeTruthy();
      
      // Check script injection
      const script = doc.querySelector('script[type="module"]');
      expect(script).toBeTruthy();
      expect(script?.getAttribute("src")).toBe("./index.js");
      expect(script?.hasAttribute("crossorigin")).toBe(true);
      expect(script?.parentElement?.tagName).toBe("HEAD");
    });

    it("index.js should contain bundled code", () => {
      const jsContent = readFileSync(join(outDir, "index.js"), "utf-8");
      
      expect(jsContent.length).toBeGreaterThan(0);
      expect(jsContent).toContain("button");
      expect(jsContent).toContain("querySelector");
    });
  });

  describe("with_assets", () => {
    const srcDir = join(EXAMPLES_DIR, "with_assets/src");
    const outDir = join(EXAMPLES_DIR, "with_assets/web");

    it("should generate main files", () => {
      expect(existsSync(join(outDir, "index.html"))).toBe(true);
      expect(existsSync(join(outDir, "index.js"))).toBe(true);
    });

    it("should preserve directory structure for nested HTML", () => {
      expect(existsSync(join(outDir, "section"))).toBe(true);
      expect(existsSync(join(outDir, "section/index.html"))).toBe(true);
      expect(existsSync(join(outDir, "section/index.js"))).toBe(true);
    });

    it("index.html should contain image reference", () => {
      const htmlContent = readFileSync(join(outDir, "index.html"), "utf-8");
      const doc = parseHTML(htmlContent);
      
      // Check script injection
      const script = doc.querySelector('script[type="module"]');
      expect(script?.getAttribute("src")).toBe("./index.js");
      
      // Check image reference
      const img = doc.querySelector("img");
      expect(img).toBeTruthy();
      expect(img?.getAttribute("src")).toContain("profile.png");
      expect(img?.getAttribute("alt")).toBe("tkeron profile picture");
    });

    it("nested HTML should have script injection", () => {
      const nestedHtml = readFileSync(join(outDir, "section/index.html"), "utf-8");
      const doc = parseHTML(nestedHtml);
      
      const script = doc.querySelector('script[type="module"]');
      expect(script?.getAttribute("src")).toBe("./index.js");
      
      // Check relative image path
      const img = doc.querySelector("img");
      expect(img?.getAttribute("src")).toBe("../profile.png");
    });
  });

  describe("with_pre", () => {
    const srcDir = join(EXAMPLES_DIR, "with_pre/src");
    const outDir = join(EXAMPLES_DIR, "with_pre/web");

    it("should generate files from .pre.ts files", () => {
      expect(existsSync(join(outDir, "contact.html"))).toBe(true);
      expect(existsSync(join(outDir, "contact.js"))).toBe(true);
      expect(existsSync(join(outDir, "section/index.html"))).toBe(true);
      expect(existsSync(join(outDir, "section/index.js"))).toBe(true);
    });

    it("should generate standard files", () => {
      expect(existsSync(join(outDir, "index.html"))).toBe(true);
      expect(existsSync(join(outDir, "index.js"))).toBe(true);
    });

    it("pre-generated contact.html should have script with correct path", () => {
      const contactHtml = readFileSync(join(outDir, "contact.html"), "utf-8");
      const doc = parseHTML(contactHtml);
      
      // Verify script injection with correct path
      const script = doc.querySelector('script[type="module"]');
      expect(script).toBeTruthy();
      expect(script?.getAttribute("src")).toBe("./contact.js");
      expect(script?.hasAttribute("crossorigin")).toBe(true);
      
      // Verify content
      const h1 = doc.querySelector("h1");
      expect(h1?.textContent).toBe("Contact Us");
    });

    it("pre-generated section/index.html should have script with correct path", () => {
      const sectionHtml = readFileSync(join(outDir, "section/index.html"), "utf-8");
      const doc = parseHTML(sectionHtml);
      
      const script = doc.querySelector('script[type="module"]');
      expect(script?.getAttribute("src")).toBe("./index.js");
    });

    it("regular index.html should have script injection", () => {
      const indexHtml = readFileSync(join(outDir, "index.html"), "utf-8");
      const doc = parseHTML(indexHtml);
      
      const script = doc.querySelector('script[type="module"]');
      expect(script?.getAttribute("src")).toBe("./index.js");
    });
  });

  describe("with_com_html_priority", () => {
    const srcDir = join(EXAMPLES_DIR, "with_com_html_priority/src");
    const outDir = join(EXAMPLES_DIR, "with_com_html_priority/web");

    it("should generate all HTML files", () => {
      expect(existsSync(join(outDir, "index.html"))).toBe(true);
      expect(existsSync(join(outDir, "admin/dashboard.html"))).toBe(true);
      expect(existsSync(join(outDir, "blog/post.html"))).toBe(true);
    });

    it("should not include .com.html files in output", () => {
      expect(existsSync(join(outDir, "site-header.com.html"))).toBe(false);
      expect(existsSync(join(outDir, "info-box.com.html"))).toBe(false);
      expect(existsSync(join(outDir, "admin/site-header.com.html"))).toBe(false);
    });

    it("index.html should use root components", () => {
      const htmlContent = readFileSync(join(outDir, "index.html"), "utf-8");
      const doc = parseHTML(htmlContent);
      
      // Should have root header
      expect(htmlContent).toContain("Root Header Component");
      expect(htmlContent).toContain("This header is from the root directory");
      
      // Should have root info box
      expect(htmlContent).toContain("Root Info Box");
      
      // Should not have custom elements
      expect(htmlContent).not.toContain("<site-header>");
      expect(htmlContent).not.toContain("<info-box>");
    });

    it("admin/dashboard.html should use local overrides", () => {
      const htmlContent = readFileSync(join(outDir, "admin/dashboard.html"), "utf-8");
      
      // Should have local admin header (not root)
      expect(htmlContent).toContain("Admin Header (Local Override)");
      expect(htmlContent).toContain("This header is from the admin directory");
      expect(htmlContent).not.toContain("Root Header Component");
      
      // Should have admin panel (local component)
      expect(htmlContent).toContain("Admin Panel");
      
      // Should have nested component
      expect(htmlContent).toContain("Nested Stat Component");
      
      // Should not have custom elements
      expect(htmlContent).not.toContain("<site-header>");
      expect(htmlContent).not.toContain("<admin-panel>");
      expect(htmlContent).not.toContain("<nested-stat>");
    });

    it("blog/post.html should use root components and local blog components", () => {
      const htmlContent = readFileSync(join(outDir, "blog/post.html"), "utf-8");
      
      // Should use root header (no local override)
      expect(htmlContent).toContain("Root Header Component");
      
      // Should have blog-specific components
      expect(htmlContent).toContain("Comments");
      expect(htmlContent).toContain("User123:");
      expect(htmlContent).toContain("Great article!");
      
      // Should not have custom elements
      expect(htmlContent).not.toContain("<comment-section>");
      expect(htmlContent).not.toContain("<comment-item>");
    });
  });

  describe("with_com_ts_priority", () => {
    const srcDir = join(EXAMPLES_DIR, "with_com_ts_priority/src");
    const outDir = join(EXAMPLES_DIR, "with_com_ts_priority/web");

    it("should generate all HTML files", () => {
      expect(existsSync(join(outDir, "index.html"))).toBe(true);
      expect(existsSync(join(outDir, "analytics/report.html"))).toBe(true);
      expect(existsSync(join(outDir, "sales/regional/overview.html"))).toBe(true);
    });

    it("should not include .com.ts files in output", () => {
      expect(existsSync(join(outDir, "user-stats.com.ts"))).toBe(false);
      expect(existsSync(join(outDir, "data-table.com.ts"))).toBe(false);
      expect(existsSync(join(outDir, "analytics/user-stats.com.ts"))).toBe(false);
    });

    it("index.html should use root TypeScript components", () => {
      const htmlContent = readFileSync(join(outDir, "index.html"), "utf-8");
      
      // Should have root user stats
      expect(htmlContent).toContain("User Statistics (Root)");
      expect(htmlContent).toContain("Total: 1000");
      expect(htmlContent).toContain("Active: 750");
      
      // Should have root data table
      expect(htmlContent).toContain("Data Table (Root)");
      expect(htmlContent).toContain("Item A");
      
      // Should not have custom elements
      expect(htmlContent).not.toContain("<user-stats>");
      expect(htmlContent).not.toContain("<data-table>");
    });

    it("analytics/report.html should use local overrides", () => {
      const htmlContent = readFileSync(join(outDir, "analytics/report.html"), "utf-8");
      
      // Should have local analytics stats (not root)
      expect(htmlContent).toContain("Analytics User Stats (Local Override)");
      expect(htmlContent).toContain("Total Users:</strong> 5000");
      expect(htmlContent).toContain("Premium:</strong> 800");
      expect(htmlContent).not.toContain("User Statistics (Root)");
      
      // Should have chart widget (local component)
      expect(htmlContent).toContain("Chart Widget");
      
      // Should not have custom elements
      expect(htmlContent).not.toContain("<user-stats>");
      expect(htmlContent).not.toContain("<chart-widget>");
    });

    it("sales/regional/overview.html should use deep local overrides", () => {
      const htmlContent = readFileSync(join(outDir, "sales/regional/overview.html"), "utf-8");
      
      // Should use root user-stats (no local override)
      expect(htmlContent).toContain("User Statistics (Root)");
      
      // Should have deep local data-table
      expect(htmlContent).toContain("Regional Data Table (Deep Local Override)");
      expect(htmlContent).toContain("sales/regional/ directory");
      expect(htmlContent).toContain("North");
      expect(htmlContent).toContain("$45,000");
      expect(htmlContent).not.toContain("Data Table (Root)");
      
      // Should have sales summary (local component)
      expect(htmlContent).toContain("Sales Summary");
      expect(htmlContent).toContain("$176,000");
      
      // Should not have custom elements
      expect(htmlContent).not.toContain("<data-table>");
      expect(htmlContent).not.toContain("<sales-summary>");
    });
  });

  describe("with_com_mixed_priority", () => {
    const srcDir = join(EXAMPLES_DIR, "with_com_mixed_priority/src");
    const outDir = join(EXAMPLES_DIR, "with_com_mixed_priority/web");

    it("should generate all HTML files", () => {
      expect(existsSync(join(outDir, "index.html"))).toBe(true);
      expect(existsSync(join(outDir, "dashboard/main.html"))).toBe(true);
      expect(existsSync(join(outDir, "users/profiles/view.html"))).toBe(true);
      expect(existsSync(join(outDir, "settings/config.html"))).toBe(true);
    });

    it("should not include component files in output", () => {
      expect(existsSync(join(outDir, "page-header.com.html"))).toBe(false);
      expect(existsSync(join(outDir, "feature-card.com.ts"))).toBe(false);
      expect(existsSync(join(outDir, "dashboard/page-header.com.ts"))).toBe(false);
    });

    it("index.html should use root components (both .html and .ts)", () => {
      const htmlContent = readFileSync(join(outDir, "index.html"), "utf-8");
      
      // Should have root HTML header
      expect(htmlContent).toContain("Root Header (HTML Component)");
      expect(htmlContent).toContain("static HTML component from root");
      
      // Should have root TS feature card
      expect(htmlContent).toContain("Feature 1 (Root TS Component)");
      expect(htmlContent).toContain("dynamic TypeScript component");
      
      // Should have root HTML footer
      expect(htmlContent).toContain("Root Footer (HTML Component)");
      
      // Should not have custom elements
      expect(htmlContent).not.toContain("<page-header>");
      expect(htmlContent).not.toContain("<feature-card");
      expect(htmlContent).not.toContain("<footer-info>");
    });

    it("dashboard/main.html should use local .com.ts override of root .com.html", () => {
      const htmlContent = readFileSync(join(outDir, "dashboard/main.html"), "utf-8");
      
      // Should have local TS header (overrides root HTML)
      expect(htmlContent).toContain("Dashboard Header (Local TS Override)");
      expect(htmlContent).toContain("TypeScript component overrides the root HTML component");
      expect(htmlContent).not.toContain("Root Header (HTML Component)");
      
      // Should have dashboard stats widget (local)
      expect(htmlContent).toContain("Dashboard Stats");
      expect(htmlContent).toContain("1523");
      
      // Should not have custom elements
      expect(htmlContent).not.toContain("<page-header>");
      expect(htmlContent).not.toContain("<stats-widget>");
    });

    it("users/profiles/view.html should demonstrate deep nesting", () => {
      const htmlContent = readFileSync(join(outDir, "users/profiles/view.html"), "utf-8");
      
      // Should have deep local HTML header
      expect(htmlContent).toContain("Profile Header (Deep Local HTML Override)");
      expect(htmlContent).toContain("users/profiles/ directory");
      
      // Should have local TS user profile with nested HTML component
      expect(htmlContent).toContain("Jane Doe");
      expect(htmlContent).toContain("jane@example.com");
      expect(htmlContent).toContain("Edit Profile");
      expect(htmlContent).toContain("View Activity");
      
      // Should have activity feed (local TS)
      expect(htmlContent).toContain("Recent Activity (Local TS Component)");
      expect(htmlContent).toContain("Updated profile");
      
      // Should not have custom elements
      expect(htmlContent).not.toContain("<user-profile>");
      expect(htmlContent).not.toContain("<profile-actions>");
      expect(htmlContent).not.toContain("<activity-feed>");
    });

    it("settings/config.html should prove .com.ts priority over .com.html in same directory", () => {
      const htmlContent = readFileSync(join(outDir, "settings/config.html"), "utf-8");
      
      // Should use TS component (not HTML)
      expect(htmlContent).toContain("TypeScript Component Wins!");
      expect(htmlContent).toContain(".com.ts has priority over .com.html");
      expect(htmlContent).not.toContain("This is the HTML component");
      expect(htmlContent).not.toContain("If you see this, the .com.ts version was NOT used");
      
      // Should not have custom elements
      expect(htmlContent).not.toContain("<priority-test>");
    });
  });

});
