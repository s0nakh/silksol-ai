#!/bin/sh
# Pre-bundles the oracle function into one ESM file (dist-functions/insurer.mjs) so Netlify doesn't hit
# CJS/ESM issues in rpc-websockets. Builds in a temp dir so a stray ~/.pnp.js can't hijack resolution.
set -e
R="$(cd "$(dirname "$0")/.." && pwd)"
B="$(mktemp -d /tmp/silksol-oracle.XXXX)"
mkdir -p "$B/src/lib" "$B/src/components/solana" "$B/oracle/netlify/functions"
cp "$R/src/lib/insurer.ts" "$B/src/lib/"
cp "$R/src/components/solana/escrowProgram.ts" "$R/src/components/solana/memo.ts" "$B/src/components/solana/"
cp "$R/oracle/netlify/functions/insurer.mts" "$B/oracle/netlify/functions/"
ln -s "$R/node_modules" "$B/node_modules"
cd "$B"
npx -y esbuild@0.25.10 oracle/netlify/functions/insurer.mts \
  --bundle --platform=node --target=node20 --format=esm --preserve-symlinks \
  --outfile="$R/oracle/dist-functions/insurer.mjs" \
  --alias:rpc-websockets=./node_modules/rpc-websockets/dist/index.browser.mjs \
  "--banner:js=import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);"
rm -rf "$B"
# The scheduled monitor has no dependencies; Netlify picks it up as-is.
cp "$R/oracle/netlify/functions/monitor.mjs" "$R/oracle/dist-functions/"
