/* eslint-disable */

/**
 * Inline <head> script that pings RPC endpoints before the app mounts so the
 * best node is ready by the time app needs it.
 */
(function () {
  try {
    // Skip when the user has opted out of auto RPC resolution.
    const rpcStore = localStorage.getItem("rpcUrl");
    const autoMode =
      typeof rpcStore === "string"
        ? JSON.parse(rpcStore)?.state?.autoMode
        : undefined;
    if (autoMode === false) return;

    const urls = __RPC_URLS__;

    function wsToHttp(url) {
      return url.replace(/^(ws)(s)?:\/\//, function (_, _insecure, secure) {
        return secure ? "https://" : "http://";
      });
    }

    function hexToBytes(hex) {
      const normalized = hex.indexOf("0x") === 0 ? hex.slice(2) : hex;
      const bytes = new Uint8Array(normalized.length / 2);
      for (let i = 0; i < bytes.length; i++) {
        bytes[i] = parseInt(normalized.slice(i * 2, i * 2 + 2), 16);
      }
      return bytes;
    }

    function decodeCompactNumber(bytes) {
      const byte0 = bytes[0];
      if (byte0 === undefined) return 0;

      const mode = byte0 & 0b11;

      if (mode === 0) return byte0 >> 2;

      if (mode === 1) {
        const byte1 = bytes[1];
        if (byte1 === undefined) return 0;
        return ((byte0 >> 2) | (byte1 << 6)) >>> 0;
      }

      if (mode === 2) {
        const byte1 = bytes[1];
        const byte2 = bytes[2];
        const byte3 = bytes[3];
        if (byte1 === undefined || byte2 === undefined || byte3 === undefined) {
          return 0;
        }
        return ((byte0 >> 2) | (byte1 << 6) | (byte2 << 14) | (byte3 << 22)) >>> 0;
      }

      const len = (byte0 >> 2) + 4;
      let result = 0n;
      for (let i = 1; i <= len; i++) {
        const byte = bytes[i];
        if (byte === undefined) break;
        result |= BigInt(byte) << BigInt(8 * (i - 1));
      }

      return Number(result);
    }

    function getBlock(wsUrl, timeoutMs, signal) {
      const defaultResponse = {
        url: wsUrl,
        ping: Infinity,
        timestamp: 0,
        blockNumber: null,
      };

      if (signal && signal.aborted) return Promise.resolve(defaultResponse);

      const controller = new AbortController();
      const onParentAbort = function () {
        controller.abort();
      };
      if (signal) signal.addEventListener("abort", onParentAbort);

      const cleanup = function () {
        if (signal) signal.removeEventListener("abort", onParentAbort);
      };

      return Promise.race([
        (async function () {
          const start = performance.now();
          const res = await fetch(wsToHttp(wsUrl), {
            signal: controller.signal,
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id: 1,
              jsonrpc: "2.0",
              method: "chain_getBlock",
              params: [],
            }),
          });
          const ping = performance.now() - start;

          const data = await res.json();

          const blockNumber = Number(data.result.block.header.number);
          const tsExtinsic = data.result.block.extrinsics[0];
          const tsBytes = hexToBytes(tsExtinsic);
          const timestamp = decodeCompactNumber(tsBytes.subarray(4));

          return { url: wsUrl, ping: ping, blockNumber: blockNumber, timestamp: timestamp };
        })(),
        new Promise(function (resolve) {
          setTimeout(function () {
            controller.abort();
            resolve(defaultResponse);
          }, timeoutMs);
        }),
      ])
        .catch(function () {
          return defaultResponse;
        })
        .finally(cleanup);
    }

    async function getBestRpcs(wsUrls, timeoutMs) {
      const controller = new AbortController();
      const signal = controller.signal;

      const results = [];

      const promises = wsUrls.map(async function (url) {
        if (signal.aborted) return;
        const res = await getBlock(url, timeoutMs, signal);
        if (res.ping === Infinity || signal.aborted) return;

        results.push(res);
        results.sort(function (a, b) {
          return b.timestamp - a.timestamp;
        });

        // Wait for up to 3 results, then abort the rest.
        if (results.length === 3 || results.length === wsUrls.length) {
          controller.abort();
        }
      });

      await Promise.all(promises);

      return results;
    }

    getBestRpcs(urls, 5000)
      .then(function (results) {
        if (results.length > 0) {
          window.__HYDRATION_BEST_RPCS__ = results;
        }
      })
      .catch(function () {
        // Fail silently — resolver falls back to the worker ping.
      });
  } catch (error) {
    // Fail silently if something goes wrong.
  }
})();
