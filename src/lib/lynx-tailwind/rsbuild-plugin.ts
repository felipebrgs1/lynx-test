import tailwindcss from "@tailwindcss/postcss";
import type { RsbuildPlugin } from "@rsbuild/core";

import { createLynxCssSanitizerPostcssPlugin } from "./sanitizer.js";
import type { LynxCssSanitizerOptions } from "./options.js";
import type { TailwindPostcssOptions } from "./pipeline.js";

export interface LynxTailwindRsbuildPluginOptions {
  includeTailwindPostcssPlugin?: boolean;
  tailwind?: TailwindPostcssOptions;
  sanitizer?: LynxCssSanitizerOptions;
}

export function pluginLynxTailwind(
  options: LynxTailwindRsbuildPluginOptions = {},
): RsbuildPlugin {
  return {
    name: "plugin-lynx-tailwind-v4",
    setup(api) {
      api.modifyRsbuildConfig((config, { mergeRsbuildConfig }) => {
        return mergeRsbuildConfig(config, {
          tools: {
            postcss: (_postcssConfig, context) => {
              if (options.includeTailwindPostcssPlugin !== false) {
                context.addPlugins(
                  tailwindcss({
                    base: options.tailwind?.base ?? api.context.rootPath,
                    optimize: options.tailwind?.optimize ?? false,
                    transformAssetUrls: options.tailwind?.transformAssetUrls ?? false,
                  }),
                  { order: "pre" },
                );
              }

              context.addPlugins(createLynxCssSanitizerPostcssPlugin(options.sanitizer), {
                order: "post",
              });
            },
          },
        });
      });
    },
  };
}
