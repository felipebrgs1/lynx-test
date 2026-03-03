import { defineConfig } from "@lynx-js/rspeedy";

import { pluginQRCode } from "@lynx-js/qrcode-rsbuild-plugin";
import { pluginReactLynx } from "@lynx-js/react-rsbuild-plugin";
import { pluginTypeCheck } from "@rsbuild/plugin-type-check";
import { pluginLynxTailwind } from "./src/lib/lynx-tailwind/index.js";

export default defineConfig({
  server: {
    port: 3000,
    host: "0.0.0.0",
    strictPort: true,
  },
  plugins: [
    pluginQRCode({
      schema(url) {
        // We use `?fullscreen=true` to open the page in LynxExplorer in full screen mode
        return `${url}?fullscreen=true`;
      },
    }),
    pluginReactLynx(),
    pluginLynxTailwind(),
    pluginTypeCheck(),
  ],
});
