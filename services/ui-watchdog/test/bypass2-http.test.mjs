// Bypass #2 "showing the real page only to the watchdog", HTTP layer. The
// attackers below never look at IP addresses, so adding observers/locations
// does not help. Uses the production config() defaults on purpose.
import test from "node:test"
import assert from "node:assert/strict"
import { config } from "../src/config.mjs"
import { assess, observe } from "../src/scan.mjs"
import { siteTransport } from "../src/transport.mjs"
import { socksFixture } from "./proxy-fixture.mjs"
import { A, fakeHtml, html, refA, site } from "./review-fixtures.mjs"

const observerConfig = (target, extra = {}) => ({
  ...config({ ROLE: "observer" }),
  target,
  timeoutMs: 2000,
  concurrency: 4,
  ...extra,
})

test("Bypass #2: HTML served only on routes the watchdog never requests is detected", async (t) => {
  // Netlify serves index.html on every SPA route; at 54527f90e the HTTP probe
  // only requests "/" (scan.mjs:66, 167) and "/index.html" (full audit), and
  // the browser only the four fixed SMOKE_ROUTES (config.mjs:57-58).
  const known = ["/", "/index.html", ...config({}).routes]
  const s = await site(t, {
    deploy: { files: A },
    attack: (req, url) =>
      !url.pathname.startsWith("/assets/") && !known.includes(url.pathname)
        ? html(fakeHtml())
        : undefined,
  })
  const c = observerConfig(s.target)
  const states = []
  for (let run = 0; run < 8; run++) {
    const probe = await observe(c, [refA])
    states.push(assess({ probe }).state)
  }
  assert(states.includes("integrity_alert"), `8 quick probes: ${states}`)
})

test("Bypass #2: HTTP checks carry no cache-busting or wildcard header tells", async (t) => {
  const s = await site(t, { deploy: { files: A } })
  await observe(observerConfig(s.target), [refA])
  // Proxied observers (tor/nord/wireguard) use node:http through SOCKS.
  const proxy = await socksFixture(t, Number(new URL(s.target).port))
  const proxied = observerConfig("http://remote.invalid", {
    proxyUrl: proxy.url,
    requireProxy: true,
  })
  await observe({ ...proxied, siteRequest: siteTransport(proxied) }, [refA])
  const documents = s.log.filter((r) => r.path === "/")
  assert.equal(documents.length, 4)
  for (const { headers: h } of documents) {
    // A desktop Chrome navigation sends neither header (only a hard reload does).
    assert.equal(h.pragma, undefined, JSON.stringify(h))
    assert.notEqual(h["cache-control"], "no-cache", JSON.stringify(h))
    // Node fetch defaults: accept "*/*", accept-language "*".
    assert.match(h.accept || "", /^text\/html/, JSON.stringify(h))
    assert.match(h["accept-language"] || "", /^[a-z]{2}(-[A-Z]{2})?,/, JSON.stringify(h))
    assert.doesNotMatch(h["user-agent"] || "", /node|undici|watchdog/i)
  }
})
