import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { describe, expect, test } from "vitest";

import { buildLynxTailwindCss, sanitizeLynxCss } from "../pipeline.js";

describe("sanitizeLynxCss", () => {
  test("keeps only Lynx-safe declarations and flattens @layer", async () => {
    const inputCss = `
      @layer utilities {
        .safe {
          display: flex;
          position: absolute;
          padding: 1rem;
          color: var(--brand-color, #111111);
          top: 10vh;
        }

        .bad {
          display: block;
          float: left;
        }

        .hoverable:hover {
          color: #123456;
        }
      }

      :root {
        --brand-color: #ff0000;
      }

      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `;

    const result = await sanitizeLynxCss(inputCss, {
      remBasePx: 16,
      targetLengthUnit: "rpx",
      rpxPerPx: 2,
    });

    expect(result.css).toContain(".safe");
    expect(result.css).toContain("display: flex");
    expect(result.css).toContain("position: absolute");
    expect(result.css).toContain("padding: 32rpx");
    expect(result.css).toContain("color: #ff0000");

    expect(result.css).not.toContain("top: 10vh");
    expect(result.css).not.toContain(".bad");
    expect(result.css).not.toContain(".hoverable:hover");
    expect(result.css).not.toContain("--brand-color");

    expect(result.css).toContain("@keyframes spin");
  });

  test("removes declarations with unresolved var()", async () => {
    const result = await sanitizeLynxCss(`.token { color: var(--missing-color); }`);

    expect(result.css).not.toContain(".token");
    expect(result.css).not.toContain("color:");
  });

  test("converts oklch colors to rgb for Lynx compatibility", async () => {
    const result = await sanitizeLynxCss(`
      :root {
        --brand-color: oklch(63.7% 0.237 25.331);
      }

      .token {
        color: var(--brand-color);
      }
    `);

    expect(result.css).toContain(".token");
    expect(result.css).toContain("color: rgb(");
    expect(result.css).not.toContain("oklch(");
  });
});

describe("buildLynxTailwindCss", () => {
  test("runs Tailwind v4 and then sanitizes for Lynx", async () => {
    const tempDir = await fs.mkdtemp(path.join(process.cwd(), ".lynx-tailwind-"));

    try {
      const result = await buildLynxTailwindCss({
        css: `
          @import "tailwindcss";
          @source inline("flex p-4 text-red-500");
        `,
        from: path.join(tempDir, "input.css"),
        tailwind: {
          base: tempDir,
          optimize: false,
          transformAssetUrls: false,
        },
      });

      expect(result.css).toContain(".flex");
      expect(result.css).toContain("display: flex");
      expect(result.css).toContain(".p-4");
      expect(result.css).toContain("padding: calc(8rpx * 4)");
      expect(result.css).not.toContain("display: inline");
      expect(result.css).not.toContain("var(--");
    } finally {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  });
});
