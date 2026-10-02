FROM node:25.9.0-bookworm@sha256:78839ac448c23517f8eab2e8f7943d9b4f73979eb7f8bed2c73dbf72ff869e7b AS cli
RUN curl -fsSL --retry 3 'https://github.com/cli/cli/releases/download/v2.88.1/gh_2.88.1_linux_amd64.tar.gz?download=1' -o /tmp/gh.tar.gz \
    && echo '36352a993b97e9758793cdb87f9ba674bd6d88c914488e122be78a1962203803  /tmp/gh.tar.gz' | sha256sum -c - \
    && mkdir /gh && tar -xzf /tmp/gh.tar.gz -C /gh --strip-components=1
RUN curl -fsSL --retry 3 'https://github.com/windtf/wireproxy/releases/download/v1.1.3/wireproxy_linux_amd64.tar.gz?download=1' -o /tmp/wireproxy.tar.gz \
    && echo 'e88c1d090740373fc606c1bafd81d9a5eadc642cce5667616e20e9d7a444f51c  /tmp/wireproxy.tar.gz' | sha256sum -c - \
    && mkdir /wireproxy && tar -xzf /tmp/wireproxy.tar.gz -C /wireproxy

FROM mcr.microsoft.com/playwright:v1.63.0-noble@sha256:eff16c30e6f3f4af0a03fa4b706120d5e9b0891c344a27d64559aff5900a4a27
WORKDIR /app
ENV NODE_ENV=production PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 DATA_DIR=/data PORT=8080
COPY --from=cli /gh/bin/gh /usr/local/bin/gh
COPY --from=cli /wireproxy/wireproxy /usr/local/bin/wireproxy
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force \
    && mkdir -p /data && chown 1000:1000 /data
COPY response-policy.json data-origins.json ./
COPY src ./src
USER 1000:1000
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD node -e 'fetch("http://127.0.0.1:"+(process.env.PORT||8080)+"/healthz",{signal:AbortSignal.timeout(4000)}).then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))'
CMD ["node", "src/main.mjs"]
