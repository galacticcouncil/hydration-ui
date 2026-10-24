#!/bin/sh
set -eu
cd /work
test "$(node --version)" = "v25.9.0"
test "$(yarn --version)" = "1.22.22"
test -s packages/ui/style-dictionary/source.json
test -f apps/main/scripts/build.mjs
export TZ=UTC LANG=C.UTF-8 NODE_OPTIONS=--max-old-space-size=10000
yarn workspace @galacticcouncil/ui theme
# Generate the exact published bytes. The repository's regular CI separately
# builds workspace declarations and performs TypeScript/lint/test checks.
cd apps/main
node scripts/build.mjs
