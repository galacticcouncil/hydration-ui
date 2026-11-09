FROM debian:trixie-slim@sha256:a99cfc517144bc59b1978475ec53b46ecabec7e43635402ee5b77cc54cd1b20a
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates curl gnupg netcat-openbsd \
    && curl -fsSL https://deb.torproject.org/torproject.org/A3C4F0F979CAA22CDBA8F512EE8CBC9E886DDD89.asc -o /tmp/tor-key.asc \
    && test "$(gpg --show-keys --with-colons /tmp/tor-key.asc | awk -F: '$1 == "fpr" {print $10; exit}')" = A3C4F0F979CAA22CDBA8F512EE8CBC9E886DDD89 \
    && gpg --dearmor < /tmp/tor-key.asc > /usr/share/keyrings/tor.gpg \
    && echo 'deb [signed-by=/usr/share/keyrings/tor.gpg] https://deb.torproject.org/torproject.org trixie main' > /etc/apt/sources.list.d/tor.list \
    && apt-get update && apt-get install -y --no-install-recommends tor tor-geoipdb \
    && rm -rf /var/lib/apt/lists/* /tmp/tor-key.asc \
    && mkdir -p /data && chown 10001:10001 /data
COPY torrc /etc/tor/torrc
COPY start.sh health.sh /usr/local/bin/
USER 10001:10001
HEALTHCHECK --interval=60s --timeout=10s --start-period=3m --retries=5 CMD sh /usr/local/bin/health.sh
ENTRYPOINT ["sh", "/usr/local/bin/start.sh"]
