// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { fileURLToPath } from "node:url";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: {
    // Pre-bundle Solana deps up front so the preview doesn't reload repeatedly while discovering them.
    optimizeDeps: {
      include: [
        "buffer",
        "@solana/web3.js",
        "@solana/wallet-adapter-base",
        "@solana/wallet-adapter-react",
        "@solana/wallet-adapter-phantom",
        "@solana/wallet-adapter-solflare",
      ],
    },
    // Playwright writes reports while tests run; don't let those files trigger page reloads.
    server: {
      watch: { ignored: ["**/playwright-report/**", "**/test-results/**"] },
    },
    resolve: {
      alias: {
        // rpc-websockets only exports "browser"/"node" conditions; the Worker build needs an explicit entry.
        // fileURLToPath (not URL.pathname) keeps paths with spaces intact instead of %20-encoding them.
        "rpc-websockets": fileURLToPath(
          new URL("./node_modules/rpc-websockets/dist/index.browser.mjs", import.meta.url),
        ),
      },
    },
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
