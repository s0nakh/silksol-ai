// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
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
    resolve: {
      alias: {
        // rpc-websockets only exports "browser"/"node" conditions; the Worker build needs an explicit entry.
        "rpc-websockets": new URL("./node_modules/rpc-websockets/dist/index.browser.mjs", import.meta.url).pathname,
      },
    },
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
