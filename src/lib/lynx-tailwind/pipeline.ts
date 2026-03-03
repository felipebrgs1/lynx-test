import path from "node:path";

import tailwindcss from "@tailwindcss/postcss";
import postcss from "postcss";

import { createLynxCssSanitizerPostcssPlugin } from "./sanitizer.js";
import type { LynxCssSanitizerOptions } from "./options.js";

export interface TailwindPostcssOptions {
  base?: string;
  optimize?: boolean | { minify?: boolean };
  transformAssetUrls?: boolean;
}

export interface BuildLynxTailwindCssOptions {
  css: string;
  from?: string;
  sourceMap?: boolean;
  tailwind?: TailwindPostcssOptions;
  sanitizer?: LynxCssSanitizerOptions;
}

export interface LynxCssBuildResult {
  css: string;
  map?: string;
}

export async function buildLynxTailwindCss(
  options: BuildLynxTailwindCssOptions,
): Promise<LynxCssBuildResult> {
  const from = options.from ?? path.join(process.cwd(), "lynx-tailwind.input.css");

  const result = await postcss([
    tailwindcss({
      base: options.tailwind?.base ?? process.cwd(),
      optimize: options.tailwind?.optimize ?? false,
      transformAssetUrls: options.tailwind?.transformAssetUrls ?? false,
    }),
    createLynxCssSanitizerPostcssPlugin(options.sanitizer),
  ]).process(options.css, {
    from,
    map:
      options.sourceMap === true
        ? {
            inline: false,
            annotation: false,
          }
        : false,
  });

  return {
    css: result.css,
    map: result.map ? result.map.toString() : undefined,
  };
}

export async function sanitizeLynxCss(
  css: string,
  options: LynxCssSanitizerOptions = {},
): Promise<LynxCssBuildResult> {
  const result = await postcss([createLynxCssSanitizerPostcssPlugin(options)]).process(css, {
    from: path.join(process.cwd(), "lynx-css.input.css"),
    map: false,
  });

  return {
    css: result.css,
  };
}
