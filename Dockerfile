# syntax=docker/dockerfile:1.7

# ---- builder ----------------------------------------------------------------
FROM node:22.13.1-alpine AS builder

# Native build deps for some transitive packages (node-gyp, wasm tooling, git URLs in lockfile)
RUN apk add --no-cache python3 make g++ git

WORKDIR /app

# Copy the whole monorepo. Yarn workspaces need every workspace package.json
# to resolve, and turbo needs the full source tree for `^build`.
COPY . .

ENV YARN_CACHE_FOLDER=/tmp/yarn-cache
RUN --mount=type=cache,target=/tmp/yarn-cache \
    yarn install --frozen-lockfile --network-timeout 600000

# Vite reads apps/main/.env.production automatically in production mode.
RUN yarn build

# ---- runner -----------------------------------------------------------------
FROM node:22.13.1-alpine AS runner

WORKDIR /app

# `serve -s` does SPA fallback (every unknown path → index.html) with no config.
RUN npm i -g serve@14

COPY --from=builder /app/apps/main/build ./build

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -qO- http://127.0.0.1:3000/ >/dev/null 2>&1 || exit 1

CMD ["serve", "-s", "build", "-l", "3000"]
