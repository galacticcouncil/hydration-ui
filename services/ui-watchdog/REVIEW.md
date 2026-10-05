# Review of #4109 (ui-watchdog)

Reviewed at the PR head, `54527f90e48a4ce4346977a00dcc73144805987a`. Links are permalinks to that commit.

Status labels:
- **Reproduced:** run against the PR's real code.
- **Live:** seen on GitHub or on the play deployment.
- **Traced:** followed through the code.

The existing suite passes: `npm test` 29/29 and `npm run test:browser` 2/2.

## TL;DR

- **Blocker:** the attestation action is pinned to the `v3` tag object's SHA instead of a commit, so no reference is ever built (§0)
- **Bypass #1, "switching the page between checks", still open:** a page that changes between the two loads gives only a warning; more observers don't help (§1)
- **Every release pages:** 3–5 critical mentions per deploy (§2)
- **Bypass #2, "showing the real page only to the watchdog", only partly fixed:** headers, TLS, `HeadlessChrome` and the public exit IPs still give the watchdog away; a fake hidden from it shows `verified` (§3)
- **Noisy, and can go silent:** one transient failure triggers a mention, and nothing watches the watchdog (§4)
- **Not covered:** a malicious dependency in `yarn.lock` shows as `verified` (§5)
- **Tests:** this PR adds 19 regression tests; 17 fail today by design (§7)

## 0. Blocker: the attestation step pins a commit that doesn't exist (Live)

[`ui-watchdog-reference.yml:66`](https://github.com/galacticcouncil/hydration-ui/blob/54527f90e48a4ce4346977a00dcc73144805987a/.github/workflows/ui-watchdog-reference.yml#L66) uses `actions/attest-build-provenance@43d14bc2b83dec42d39ecae14e916627a18bb661 # v3`. GitHub returns `422 No commit found` for it.

**How it happened:**
- `v3` in that repo is an annotated tag, and `43d14bc2…` is the SHA of the tag object. The commit it points to is `977bb373…`.
- `git ls-remote <repo> refs/tags/v3`, or `git/ref/tags/v3 → object.sha`, returns the tag object. A pin needs the peeled commit: `refs/tags/v3^{}`, or `gh api repos/actions/attest-build-provenance/commits/v3 --jq .sha`.
- The other three pins resolve to commits, so only this one is broken.
- The pin came in with the first commit (`db46c0036`) and was never exercised, because the workflow only runs on a push to `production`.

- **Use `96278af6caaf10aea03fd8d33a09a777ca52d62f # v3.2.0`.** Its `action.yml` declares `bundle-path` and emits SLSA provenance v1, which is `gh attestation verify`'s default predicate.
- **Don't switch to v4 (`4d101475…`) without testing.** It drops the predicate step and its default predicate type is unverified.
- **PR CI never resolved this pin.** The workflow only runs on a push to `production`. Add a PR/master dry-run job (build, manifest, `cmp`, no attest), plus actionlint and a check that every pinned action SHA exists.
- **After fixing, it needs another production push.** Re-running the failed run won't pick up the fixed workflow.
- **Smaller recipe items:**
  - Add `-e HOME=/tmp`: the uid has no passwd entry, so HOME is `/`.
  - Use `git status --porcelain` instead of `git diff --exit-code`, which misses untracked files an install script could drop under `apps/main/public/`.
  - `--cpus 4 --memory 12g` assumes 4-vCPU runners.

## 1. Bypass #1, "switching the page between checks": "can't verify" throws away the evidence (Reproduced)

**Root cause:**
- [`scan.mjs:200-201`](https://github.com/galacticcouncil/hydration-ui/blob/54527f90e48a4ce4346977a00dcc73144805987a/services/ui-watchdog/src/scan.mjs#L200-L201) returns `unverified` on `probe.racing || audit?.racing` before any integrity issue is looked at. This includes probe, audit and browser hash mismatches.
- `observe()` checks only the first `/` sample against the references; the second only sets `racing` ([`scan.mjs:166-168`](https://github.com/galacticcouncil/hydration-ui/blob/54527f90e48a4ce4346977a00dcc73144805987a/services/ui-watchdog/src/scan.mjs#L166-L168)).
- `unverified` is sent as a warning with no mention ([`main.mjs:193-202`](https://github.com/galacticcouncil/hydration-ui/blob/54527f90e48a4ce4346977a00dcc73144805987a/services/ui-watchdog/src/main.mjs#L193-L202)), repeated hourly at the same severity.

**Why more observers don't help.** Racing observers are filtered out of the comparison ([`observers.mjs:23-29`](https://github.com/galacticcouncil/hydration-ui/blob/54527f90e48a4ce4346977a00dcc73144805987a/services/ui-watchdog/src/observers.mjs#L23-L29)). The switching happens per client, so every observer in every location races.

**Simulation: one hour, 3 observers, the real code:**

| Attack (users get the fake page in all of them) | Result | Discord |
|---|---|---|
| (a) fake/real alternating per request | `unverified` | ~70 warnings, 0 mentions |
| (b) random nonce in the fake page on every request | `unverified` | ~924 warnings/h, 0 mentions |
| (c) first `/` per time window fake, then real | `unverified` | ~618 warnings/h, 0 mentions |
| (d) stable fake, only the full audit races (a preload decoy arms one variation) | `unverified` | warnings only |
| (e) real first, fake on the re-fetch | `unverified` | warnings only; the PR records no issue at all |
| Control: identical fake served to everyone | critical | 3 mentions within 35 s |

**More cases the fix must cover:**
- **A racing audit silences the probe.** `snapshot()` passes the last stored audit regardless of age ([`observers.mjs:322-325`](https://github.com/galacticcouncil/hydration-ui/blob/54527f90e48a4ce4346977a00dcc73144805987a/services/ui-watchdog/src/observers.mjs#L322-L325)). One racing audit hides the probe's own `hash-mismatch`, even on `index.html`, until the next clean audit.
- **Alternating two *trusted* releases while one chunk is modified.** Both HTML hashes match a reference. So "a race is harmless if both pages are trusted" still hides the chunk mismatch. Integrity evidence must always beat racing.
- **Audit and browser evidence is dropped when the HTML hash has moved.** Their issues only count when their `rootHash`/`matchedSha` equal the latest probe's ([`scan.mjs:202-211`](https://github.com/galacticcouncil/hydration-ui/blob/54527f90e48a4ce4346977a00dcc73144805987a/services/ui-watchdog/src/scan.mjs#L202-L211)).
- **Random injection.** At injection rate p, a probe is critical with probability p² and suppressed with probability 2p(1−p). At 5% that is 0.25% critical versus 9.5% suppressed.

**Fix (validated in the reference patch):**
1. In `observe()`, check the second `/` sample against the references and keep both hashes.
2. In `assess()`, evaluate integrity issues from probe, audit and browser first. Judge each against the reference that check matched itself. Only then look at racing.
3. A race is harmless only when every HTML hash observed is trusted and the sequence moves one way. A→B→A (flapping) is critical.
4. Escalate racing that lasts 2–3 probes, even when there are zero references.
5. Build the incident fingerprint from the state plus the alerting observers, not from `currentRoot` or `actual`. Otherwise (b) turns into about 300 critical mentions an hour.
6. Replace [`core.test.mjs:104-115`](https://github.com/galacticcouncil/hydration-ui/blob/54527f90e48a4ce4346977a00dcc73144805987a/services/ui-watchdog/test/core.test.mjs#L104-L115). It only asserts `state !== "verified"`, so Bypass #1 passes it. Use exact-state assertions instead.

## 2. Every normal release pages the channel (Reproduced)

When references exist, unknown live HTML is `integrity_alert` immediately: critical, with a mention ([`scan.mjs:88-94`](https://github.com/galacticcouncil/hydration-ui/blob/54527f90e48a4ce4346977a00dcc73144805987a/services/ui-watchdog/src/scan.mjs#L88-L94) → `assess()`, before any grace).

**Live timing:**
- `production` moved to `a6cfe58a5` at 08:59:14Z.
- The watchdog logged `content_changed` at 09:02:05Z, so Netlify was live about 3 minutes later.
- The reference needs two cold docker installs and builds, then the attest job (about 6–10 min), then the next 300 s reconcile. The reconcile triggered by `production_changed` runs at about T0+30 s, too early to help.

**Simulated release with the real code:**
- **15–17 Discord posts:** 3–5 critical mentions (3 with default timing, 5 with desynchronized Tor latencies), about 8 warnings and 4 info.
- **`verified` only at about T0+20 min.** After the reference is ingested, the browser job still binds `sha=null` ([`observers.mjs:286-293`](https://github.com/galacticcouncil/hydration-ui/blob/54527f90e48a4ce4346977a00dcc73144805987a/services/ui-watchdog/src/observers.mjs#L286-L293)). A `finally` also overwrites `due=0` ([`main.mjs:73-76`](https://github.com/galacticcouncil/hydration-ui/blob/54527f90e48a4ce4346977a00dcc73144805987a/services/ui-watchdog/src/main.mjs#L73-L76)).
- **Up to 7 critical mentions per release with Nord and WireGuard enabled.** Several releases a day means about 6–10 or more false pages a day.
- **Rollout split is critical even when the reference already exists.** `knownRollout` rejects an observer that has just switched and is `unverified` ([`observers.mjs:81-88`](https://github.com/galacticcouncil/hydration-ui/blob/54527f90e48a4ce4346977a00dcc73144805987a/services/ui-watchdog/src/observers.mjs#L81-L88)). 31 of 31 simulated gated releases still fired 1–2 criticals.
- **Pipeline breaks make every later release critical.** Examples: an expired token, an npm outage, `cmp` nondeterminism, or a file name `validateManifest` rejects. Every later release then becomes a permanent critical with hourly mentions, which buries any real attack.

**Fix:**
- **Preferred: the reference before publishing.** Stop Netlify auto-publishing for production, and publish from the attest job once the reference is attested. Then unknown HTML is never legitimate.
- **Fallback:** while the reference run for `source.sha` is in progress, treat unknown HTML as `reference_pending` (warning, bounded time).
  - Record every unknown hash during that window and check them all when the reference lands. Any mismatch is a retroactive critical.
  - A failed or missing run becomes its own error state.
  - A plain time grace without the retroactive check would just be an attacker's window, since the repo is public and production pushes are visible.
- **Either way, fix `knownRollout`:** accept observers whose `matchedSha` is trusted even if they are still `unverified` for freshness reasons.
- **Zero references must not look like a release.** With no token or no successful run (play today), a tamper served to everyone produces the same Discord stream as a release. Emit an `error` saying "integrity protection inactive" instead.
- **Rollbacks:** match against all stored references, not just the newest 30 ([`store.mjs:26-31`](https://github.com/galacticcouncil/hydration-ui/blob/54527f90e48a4ce4346977a00dcc73144805987a/services/ui-watchdog/src/store.mjs#L26-L31)). Today a Netlify rollback older than about 1–2 weeks looks like tampering.

## 3. Bypass #2, "showing the real page only to the watchdog": the watchdog is recognisable (Reproduced + Live)

**End-to-end result.** Fixtures that serve the fake page only to (i) real-looking Chrome, (ii) link-click navigations, or (iii) routes the watchdog never requests all come out `verified`, while users get the fake.

None of the items below needs a specific IP, and each covers every observer at once.

**3.1 The dashboard publishes the exact IPs to whitelist (Live).**
- Every observer's HTTP and browser exit IP is in the public dashboard ([`server.mjs:11`](https://github.com/galacticcouncil/hydration-ui/blob/54527f90e48a4ce4346977a00dcc73144805987a/services/ui-watchdog/src/server.mjs#L11)), `/api/status`, `/api/events` (in every event, kept 90 days, [`main.mjs:213-217`](https://github.com/galacticcouncil/hydration-ui/blob/54527f90e48a4ce4346977a00dcc73144805987a/services/ui-watchdog/src/main.mjs#L213-L217)) and the Discord text. That includes the play host's own address.
- Per-check timestamps reveal the fixed schedule.
- It also shows whether Discord and the GitHub token are configured, so an attacker can check whether monitoring is armed.
- The Traefik router has no auth middleware ([`stack.yml:107-113`](https://github.com/galacticcouncil/hydration-ui/blob/54527f90e48a4ce4346977a00dcc73144805987a/services/ui-watchdog/deploy/stack.yml#L107-L113)).

**3.2 The IPs can be filtered as a class.** Play is a Hetzner datacenter IP. Tor exits are a public list (about 1,366). NordVPN servers can be listed without auth from `api.nordvpn.com`. A Netlify Edge Function (it sees IP, geo and headers), or a DNS hijacker's own server, can serve clean bytes to datacenter, Tor and VPN ranges and the drainer to residential IPs. That is broad, not "one specific IP".

**3.3 HTTP scanner headers and TLS (captured).** [`scan.mjs:36-44`](https://github.com/galacticcouncil/hydration-ui/blob/54527f90e48a4ce4346977a00dcc73144805987a/services/ui-watchdog/src/scan.mjs#L36-L44) sends a Chrome/153 user agent, but nothing else matches Chrome.

| Path | What gives it away |
|---|---|
| Direct (undici) | `cache-control: no-cache`, `pragma: no-cache`, `accept: */*`, `accept-language: *`, `sec-fetch-mode: cors`, and no `sec-fetch-dest` |
| Proxied ([`transport.mjs:29`](https://github.com/galacticcouncil/hydration-ui/blob/54527f90e48a4ce4346977a00dcc73144805987a/services/ui-watchdog/src/transport.mjs#L29)) | `accept-encoding: identity`, and no `accept` or `accept-language` |
| Both | no `sec-ch-ua*`; the TLS fingerprint is Node's (JA4 `t13d5212h1`, HTTP/1.1, no GREASE) instead of Chrome's `t13d1516h2` |

**3.4 Headless Chromium says `HeadlessChrome` (captured).**
- `headless: true` runs chrome-headless-shell 153 ([`browser.mjs:40-42`](https://github.com/galacticcouncil/hydration-ui/blob/54527f90e48a4ce4346977a00dcc73144805987a/services/ui-watchdog/src/browser.mjs#L40-L42)).
- Playwright's UA override sends metadata without `brands`, so `sec-ch-ua` carries `"HeadlessChrome";v="153"`.
- `navigator.webdriver` is `true`, but only server-side signals matter: reading it would require changed bytes.

**3.5 Only `/` and 4 routes are ever requested, and `_redirects` is never compared.**
- HTTP checks fetch only `/`. The browser visits 4 fixed routes in a fixed order ([`config.mjs:57-58`](https://github.com/galacticcouncil/hydration-ui/blob/54527f90e48a4ce4346977a00dcc73144805987a/services/ui-watchdog/src/config.mjs#L57-L58)). The app has 62 routes, including referral links (`/<code>`), `/submit-transaction` and the PWA `start_url` `/?utm_source=androidappinstallbanner`.
- `_redirects` and `_headers` are excluded from comparison ([`scripts/manifest.mjs:13-18`](https://github.com/galacticcouncil/hydration-ui/blob/54527f90e48a4ce4346977a00dcc73144805987a/services/ui-watchdog/scripts/manifest.mjs#L13-L18)). Forced `200!` rewrites with `Country=`, `Language=` or `Cookie=` conditions, and Netlify split testing, are never seen.

**3.6 The cheapest chunk cloak.** Lazy chunks of routes the browser never visits are only fetched by the HTTP audit, which never sends `sec-fetch-dest`. Serving modified bytes only when `sec-fetch-dest: script` is present hides them from every observer, with no IP or HeadlessChrome detection needed.

**3.7 Response headers are never recorded.** Only status, hash, size and content type are kept ([`scan.mjs:46-52`](https://github.com/galacticcouncil/hydration-ui/blob/54527f90e48a4ce4346977a00dcc73144805987a/services/ui-watchdog/src/scan.mjs#L46-L52)). Setting `cache-control: max-age=31536000, immutable` on a chunk and swapping it briefly leaves the malicious chunk in visitors' caches after the swap ends. Today everything is `max-age=0, must-revalidate` with no CSP, so a header policy is easy to pin.

**Hardening (in order):**
1. Fix §1.
2. Do the byte hashing through Chromium (for example, preloads on a blank same-origin page), so headers, TLS, HTTP/2 and `sec-fetch-*` are real Chrome. Otherwise, replay Chrome's exact header set per request type. Either way, drop `pragma`/`no-cache` and allow gzip/br, hashing the decoded bytes under a size cap.
3. Remove the `HeadlessChrome` brand: set full `userAgentMetadata` through CDP `Emulation.setUserAgentOverride`, or run branded Chrome headed under Xvfb.
4. Randomise routes, query strings and order, and add jitter. Each cycle, sample random real and fake deep paths, which must all return the reference `index.html`, and a random subset of files.
5. Stop publishing exit IPs, timings and configuration state, or put the dashboard behind auth.
6. Pin a response-header policy per path. Warn on new external `fetch`/WebSocket origins against a baseline ([`browser.mjs:256`](https://github.com/galacticcouncil/hydration-ui/blob/54527f90e48a4ce4346977a00dcc73144805987a/services/ui-watchdog/src/browser.mjs#L256)).
7. The hard limit: every vantage point is a datacenter, Tor or VPN address. Cloaking by IP class is only caught from residential or independent vantage points, for example a staff-machine browser check against the attested manifest.

## 4. Alert noise and silent failures (Reproduced + Live)

**4.1 One transient failure pages people.**
- **Chain:** any single probe error makes an observer `down`. Any single `fetch-failed`, `browser-error`, cross-origin ≥400 in Chromium, or failed egress check makes it `degraded`. One such observer makes the aggregate `degraded`. That maps to `error` ([`main.mjs:196`](https://github.com/galacticcouncil/hydration-ui/blob/54527f90e48a4ce4346977a00dcc73144805987a/services/ui-watchdog/src/main.mjs#L196)), which gets a mention ([`discord.mjs:4-7`](https://github.com/galacticcouncil/hydration-ui/blob/54527f90e48a4ce4346977a00dcc73144805987a/services/ui-watchdog/src/discord.mjs#L4-L7)). Recovery then adds 2 more posts.
- **Live:** 9 error events in the first ~9 hours on play.
- **Fix:** N consecutive failures per path, mention only on `critical`, and one message per incident.

**4.2 check.torproject.org is a hard dependency** for HTTP, Chromium and the VPN gateways ([`network.mjs:5`](https://github.com/galacticcouncil/hydration-ui/blob/54527f90e48a4ce4346977a00dcc73144805987a/services/ui-watchdog/src/network.mjs#L5)). If it fails, every observer goes `degraded` with a mention and the gateways restart. Treat egress-check failure as `unverified`, and add a second source.

**4.3 False `browser-error` from closing the page early (Reproduced).**
- [`browser.mjs:253-254`](https://github.com/galacticcouncil/hydration-ui/blob/54527f90e48a4ce4346977a00dcc73144805987a/services/ui-watchdog/src/browser.mjs#L253-L254) closes the page before awaiting the body-hash jobs.
- Result: `response.body: Target page, context or browser has been closed`, then `degraded`, then a mention.
- It is dormant on play only because there is no reference yet.
- Fix: await the jobs with a deadline, then close.

**4.4 The watchdog can go silent with nobody told.**
- **Storage failure:** a SQLite error (disk full) means no event can be stored or sent; it becomes `watchdog_error` with no event and a silent restart loop.
- **Broken webhook:** a 401/404 is retried forever, and the first failed event blocks all later ones, so criticals queue behind warnings.
- **Wiped credentials:** a redeploy with blank `${VAR:-}` defaults ([`stack.yml:77-79`](https://github.com/galacticcouncil/hydration-ui/blob/54527f90e48a4ce4346977a00dcc73144805987a/services/ui-watchdog/deploy/stack.yml#L77-L79)) turns alerting off silently.
- **Observer health:** observer `/healthz` always returns ok.
- **Fix:** an external dead-man's switch (heartbeat or uptime monitor), a daily "still verified" message, `${VAR:?}` or Swarm secrets, and a final failed state for deliveries.

**4.5 More noise:**
- Every coordinator restart posts 5 messages.
- A worker 429 after an ungraceful restart is reported as `down` with a mention.
- `content_changed`/`assets_changed` aren't throttled: about 600 an hour under flapping content.
- One bad reference artifact aborts the whole reconcile pass ([`github.mjs:191-224`](https://github.com/galacticcouncil/hydration-ui/blob/54527f90e48a4ce4346977a00dcc73144805987a/services/ui-watchdog/src/github.mjs#L191-L224)).

**4.6 Netlify settings drift looks identical to an attack, and no evidence is kept.**
- **Drift sources:** a UI `VITE_*` env var (Vite lets `process.env` override `.env.production`), a different build command, a build plugin or snippet injection all make a permanent mismatch.
- **Example:** deploy previews of this same commit differ only by an injected `<script async src="/.netlify/scripts/cdp">` block.
- **Evidence:** only hashes are stored, so an operator can't see what was served.
- **Fix:** keep a capped copy of each new unknown HTML/JS body plus its headers. Move the Netlify build command and env into `netlify.toml`.

**4.7 Unbounded state and traffic.**
- `observer:<id>:observed` is merged forever and rewritten every 30 s ([`observers.mjs:229`](https://github.com/galacticcouncil/hydration-ui/blob/54527f90e48a4ce4346977a00dcc73144805987a/services/ui-watchdog/src/observers.mjs#L229)). That grows to about 9 MB and 87 ms per write at 90 days, per observer.
- The full audit is about 17–41 GB/day of synthetic Netlify traffic (0.5–1.2 TB a month), uncompressed through Tor.

**4.8 Attacker-crafted links in alerts.** Live resource paths and commit titles reach Discord embeds as markdown ([`discord.mjs:72-80`](https://github.com/galacticcouncil/hydration-ui/blob/54527f90e48a4ce4346977a00dcc73144805987a/services/ui-watchdog/src/discord.mjs#L72-L80)). A masked link can appear inside the real compromise alert. Escape `[ ] ( )`.

## 5. Scope: what it does and doesn't protect against

**Catches,** once the fixes above are in, references exist and the webhook is set:
- Tampering served to everyone: a Safe{Wallet}/Bybit-style edit of a JS file, within 30 s for HTML/entry files and about 5 min for chunks.
- Netlify build-environment tampering, including UI env vars and snippet injection.
- New external script origins on the probed routes.
- DNS hijacks that don't cloak.
- Stale or partial deploys.

**Misses:**
- **Lockfile-borne dependency attacks.** A malicious version in `yarn.lock`, like the Sept 2025 npm compromise, is reproduced by the reference build and reported `verified`. Say this in the PR, since "dependency injection" is part of the pitch.
- **Server-side cloaking** (§3).
- **Runtime data:** `cdn.jsdelivr.net/gh/galacticcouncil/intergalactic-asset-metadata@master`, including the token whitelist (mutable `@master`, [`AssetMetadataFactory.ts:35`](https://github.com/galacticcouncil/hydration-ui/blob/54527f90e48a4ce4346977a00dcc73144805987a/packages/utils/src/lib/AssetMetadataFactory.ts#L35)), plus RPC, indexer and Reown config.
- **Code loaded only on wallet interaction.**
- **Swaps shorter than one check interval.**
- **Existing visitors' caches.** The README's service-worker sentence claims more than is true: a rogue `/sw.js` is never requested.

**Cheap complementary controls:**
- Certificate Transparency monitoring for `*.hydration.net`. Every HTTPS hijack needs a new certificate.
- Registrar/registry lock with hardware 2FA, plus NS/A record monitoring.
- Netlify SSO/2FA, a token audit, and **deploy notifications to Discord**. A notification shows an out-of-band deploy even when the content is cloaked.
- Pin the jsDelivr metadata to a commit.
- Lockfile review plus a minimum release age for new package versions.

## 6. Lower-priority items

- Chromium runs with `--no-sandbox` (Playwright default) on attacker-served pages in a frozen image. A compromised observer can forge its own results and call its siblings' unauthenticated APIs.
- The Tor image pins an exact apt version ([`tor/Dockerfile:7`](https://github.com/galacticcouncil/hydration-ui/blob/54527f90e48a4ce4346977a00dcc73144805987a/services/ui-watchdog/tor/Dockerfile#L7)). It becomes unbuildable at the next Tor release.
- A NordVPN API failure at rotation marks a working tunnel unhealthy, then crash-loops. The README's "selection failures keep the current tunnel" holds for only about 2.5 min.
- Only the coordinator is pinned to `play`. Observers, gateways and Tor volumes float.
- Gateway SOCKS ports (`0.0.0.0:9050`) have no auth on the shared egress network. Remote `OBSERVERS_JSON` workers may use `http:`.
- The watchdog images are built and pushed by hand, with no CI provenance.
- `gh attestation verify --signer-workflow` matches as a prefix (info; needs write access to exploit).
- `build.mjs` (Vite JS `build()`) gives output identical to the CLI for the current config. Vendoring the theme is a good change; designers now need a PR to update `source.json`.

## 7. Regression tests (this PR)

| File | Run by | Covers |
|---|---|---|
| `test/review-fixtures.mjs` | — | Shared fixtures: in-memory sites, references, observer groups |
| `test/bypass1-racing.test.mjs` | `npm test` | Bypass #1 variants (a)–(e); guard for a race between trusted builds; alternating attested documents |
| `test/p1-release.test.mjs` | `npm test` | Release paging, staggered rollout, retroactive check, guard |
| `test/bypass2-http.test.mjs` | `npm test` | HTTP header tells; routes never checked |
| `test/p4-exposure.test.mjs` | `npm test` | Exit IPs in public output; egress-check outage |
| `test/bypass2-browser.integration.mjs` | `npm run test:browser` | `HeadlessChrome` identity; fake served only to real-looking Chrome or to link clicks |
| `test/p3-page-close.integration.mjs` | `npm run test:browser` | A slow trusted body is hashed, not reported as `browser-error` |

In `package.json`, `test:browser` now runs `test/*.integration.mjs`, so `npm test` still needs no browser.

| Test | Expected after fix |
|---|---|
| Bypass #1 (a)–(e) | `integrity_alert` / critical |
| Release race between two attested builds (guard) | non-critical |
| Alternating attested documents + modified asset, outside a release window | `integrity_alert` |
| Chromium probe identity | no `HeadlessChrome`, no automation tells |
| Fake served only to real-looking Chrome / link clicks / unchecked routes | detected |
| HTTP checks | no cache-busting or wildcard header tells |
| Release while the reference is still building | no page; retroactive check when it lands |
| Staggered rollout of attested builds | no page |
| Unknown HTML once the reference exists or grace expires (guard) | critical |
| Slow trusted body | hashed, not `browser-error` |
| Public status, events and dashboard | no observer IPs |
| Egress-check outage | `unverified`, no page |

Also worth adding:
- Response-header policy (`cache-control`/CSP change with the same body → alert).
- Zero references → "protection inactive" error.
- One transient failure → no mention.
- 24 h `verified` → at least one heartbeat.
- A Discord 404 → escalation, and a bounded outbox.

The reference fix (6 files, +202/−23, unreviewed and meant as a guide) is in the description of the PR that added this file.

---

# Round 2: follow-up at `e290228908abbbe471e64772602ab0e8b7f7f3b6`

Checked 2026-10-05. Same labels as above. The existing suite passes at this head: `npm test` 72/72, `npm run test:browser` 12/12. CI is green, including the PR run of the reference workflow (two builds, `cmp` equal).

## TL;DR

- **Round 1 is fixed** apart from the items below: attest pin, racing (§1), release paging (§2, with one gap), scanner tells (§3, with one gap), noise and silent failures (§4), README scope (§5). The regression tests from round 1 were made stricter, not weaker.
- **Blocker for prod:** `/favicon/favicon.ico` is in the build inventory, and Playwright never surfaces responses for URLs ending in `/favicon.ico`. The Chrome transport waits for that response in every full audit, times out, and reports `fetch-failed`, so observers become `degraded` after three audits and the watchdog can never reach `verified`. (§8)
- **Every release still pages:** a check that spans the Netlify switch while the new reference is building is a critical with a mention, from a single observer. The team keeps this alert on purpose. (§9)
- **Chunk cloak, second form:** the audit preloads JS with `sec-fetch-mode: no-cors` and no `Origin`; every real chunk load is `cors` with `Origin`. A server keyed on that shows the audit clean bytes. (§10)
- **The retroactive check is thrown away on exactly those releases:** if a critical is already open when the reference lands, the mismatches it finds are deleted without any event. That is the only check that tells an injection timed to a release apart from the §9 alarm. (§16)
- **Two `Set-Cookie` headers turn a critical into a quiet error:** the tampered file is recorded as `fetch-failed`, so instead of an immediate critical the result is an error post without a mention after ~45 min. (§17)
- **The audit is still recognisable:** header order, a `/favicon.ico` request no browser makes, and `referer: /` on every file. (§18)
- **A wrong exit stays "retrying" forever:** an exit-IP or Tor mismatch is hidden behind the fallback oracle and never posted. (§19)
- **Also open:** sticky evidence overflow (§11), a revert reads as flapping (§12), the pending window starts at the branch move (§13), no `nosniff` on prod (§14), smaller items (§15, §20).
- **Tests:** 15 regression tests in `test/`. 12 fail at this head by design and pass once the recommended fixes for §8, §10 and §16–§19 are in; 3 are guards that pass today (§21).

Each section ends with a recommended fix. Before launch: §8, §10, §16 and §17. Soon after: §18 and §19, then §11–§14 and §20. Each recommendation for §8, §10 and §16–§19 was implemented once as a check: with all of them in place, `npm test` passes 79/79 and `npm run test:browser` 20/20.

§16–§20 come from a second pass over the same head with the §8/§10 fix in place: three reviewers with different angles (attacker, operator, release engineer), each finding checked by a skeptical verifier. The attacker pass stopped early, so `browser.mjs`, the Discord payload paths and HTTP caching had the least attention.

## What Discord sees per release today (Reproduced)

Simulated with the real coordinator logic (`assess`, `combineObservers`, `shouldNotify`, `Store`, `deliver`) on a 5 s clock:

| When | Event | Severity | Posted | Mention |
|---|---|---|---|---|
| merge + ≤36 s | `production_changed` | info | yes | no |
| switch … reference landing | `deployment_pending`, `reference_pending`, `content_changed`, `unverified` | warning | **no** (stored only) | — |
| landing + 1–3 min | `deployment_verified` | info | yes | no |

So a clean release is two posts. The gate is `logEvent` ([main.mjs:45-56](services/ui-watchdog/src/main.mjs#L45-L56)): only critical/error, the four listed kinds, or a recovery are queued; warnings never leave the database.

With a straddle (§9) the release becomes four posts: the two above, plus a critical with the configured mention at switch + ~5 s, plus a recovery `verification_passed` later. While that false incident is open, a genuine tamper on any other observer posts nothing: `shouldNotify` ([policy.mjs:86-94](services/ui-watchdog/src/policy.mjs#L86-L94)) returns false until the aggregate has been `verified` for 60 s, and the daily heartbeat is suppressed as well.

## 8. Blocker: `favicon.ico` cannot be fetched through Chrome (Reproduced)

- The inventory contains `/favicon/favicon.ico` (`apps/main/build/favicon/favicon.ico`).
- `chromeTransport` fetches every non-document file with `page.waitForResponse` ([chrome.mjs:226-228](services/ui-watchdog/src/chrome.mjs#L226-L228)). Playwright filters page events for URLs ending in `/favicon.ico`, so the wait never resolves.
- Result at this head, from the new test: `fetch-failed /favicon/favicon.ico: page.waitForResponse: Timeout 5000ms exceeded while waiting for event "response"`. `fetch-failed` is a non-integrity kind, so the observer is `unverified`, then `degraded` after `FAILURE_THRESHOLD` consecutive audits, which is an error post with no mention, and `verified` is never reached.
- It does not show on play today because play has no reference; without one, the audit only fetches what `index.html` references, and `htmlResources` ignores `rel=icon`.
- It came with the Chromium transport (`a7954dd2f`); at `54527f90e` the audit used plain HTTPS and hashed this file like any other.
- **Recommended fix:** for URLs ending in `/favicon.ico`, read the response from the page's own CDP session (`Network.responseReceived`, then `Network.getResponseBody` on `loadingFinished`) instead of `page.waitForResponse`, and return the same `{ status, allHeaders, body }` shape. Renaming the file would also work, but any later `favicon.ico` would bring the error back without anyone noticing.

## 9. The release straddle still pages (Reproduced)

**What happens.** A check fetches `/` and gets release A, then its entry-chunk fetches land after Netlify switched to B. A's content-hashed chunk paths no longer exist, so the `/* /index.html 200` rewrite answers them with B's `index.html` (200, `text/html`). `observe()` compares that body with A's reference entry and pushes `hash-mismatch` with `trustedDocument: false`, because B is not attested yet ([scan.mjs:195-210](services/ui-watchdog/src/scan.mjs#L195-L210)). `assess()` excuses only `untrustedHtml` issues inside the pending window ([scan.mjs:319-321](services/ui-watchdog/src/scan.mjs#L319-L321)), so the observer is `integrity_alert`, `combineObservers` makes the group critical from that one observer ([observers.mjs:72-78](services/ui-watchdog/src/observers.mjs#L72-L78)), and Discord gets the mention. `production` moved 12 times in September–October, so this is a false page most weeks.

**Why round 1 missed it.** The guard test added then (`bypass1-racing.test.mjs:85`) attested B before sampling, which turns the same bytes into `trustedDocument: true`.

**Duration.** A straddled quick probe clears at the next probe (~30 s) with no post. A straddled audit stays critical until the reference lands, up to 15 min, because the later `content_changed` is throttled by the audit's own `assets_changed` and nothing re-runs the audit. `reconcileEvidence` never flips `trustedDocument` on an existing issue, so landing alone does not clear it either.

**Possible fix** (implemented and tested once, but not needed now; see the decision below):
- An asset response that has a reference entry, mismatches it, and is `text/html` is the SPA rewrite answering a vanished path. It is recorded as a document sample (`{ path, sha256, matchedSha, fallback: true }`), never as that path's bytes in `observed`, so it cannot create observer disagreement or retrospective findings.
- Classified once every document of the check is known: if the hash is a trusted root or a document this check navigated to, it becomes `missing-asset` (non-integrity: `unverified`, `degraded` after three). Otherwise it stays `hash-mismatch` + `untrustedHtml`: excused only inside the pending window, retained under `/index.html`, checked against the attested `index.html` when it lands, critical otherwise. Fallbacks never vouch for each other.
- Changed JS/CSS/WASM bytes never enter that branch. The round-1 tests "alternating attested documents cannot mask a tampered asset" and "a release race between two attested builds stays non-critical" pass unchanged.
- `browser.mjs` applies the same rule to same-origin responses (Chromium reports a `text/html` script response with status 200, then refuses to run it). `resolvePending` and `reconcileEvidence` treat the attested document at any path as the fallback. Fallback samples are excluded from the A→B→A sequence.
- `trustedDocument` / `trustedSwitch` are removed as subsumed. One consequence to judge: an attested document at a chunk path outside any release window is now `unverified` → `degraded` (error) rather than critical. Those bytes are not executable by this app (module scripts), so I think that is the right severity for a broken deploy.
- Residuals: a straddle in the few seconds before the reference run is discovered (`referenceStatus` `pending`, not `building`) is still critical, by the existing "a branch push alone never permits unknown content" rule; in the browser probe the fallback is labelled `untrustedHtml` rather than `missing-asset` when B is still unknown (same outcome); stored results from before the upgrade that carry `trustedDocument` are not stripped, for one audit cycle.

**Decision (2026-10-05):** the team keeps this alert on releases, so this fix is not needed now. With that choice §16 has to be fixed, because the straddle alert is what silences the retroactive check.

## 10. Bypass #2, chunk cloak: the audit's JS requests do not look like the app's (Reproduced)

- `chromeTransport` injects `<link rel=preload as=script>` ([chrome.mjs:229-236](services/ui-watchdog/src/chrome.mjs#L229-L236)). Chromium sends that with `sec-fetch-mode: no-cors` and no `Origin`.
- Every real chunk load (`<script type=module crossorigin>`, `<link rel=modulepreload crossorigin>`, `import()`) and the rendered probe send `sec-fetch-mode: cors` with `Origin`.
- A server that serves tampered bytes only to `cors` script loads: the audit reported no issue and `unverified`, while a real page's `import("/wallet.js")` returned the drainer. Chunks that are imported only on user action (for example `@aave/contract-helpers` in `ApprovedAmountService`) are never loaded by the rendered probe, so the audit was the only check covering them.
- **Also latent:** the transport hashes `response.body()`, which Playwright re-encodes from Chromium's text decoding. Without a charset the bootstrap page's default encoding applied, so non-ASCII JS/CSS hashed wrong. Not live, because Netlify sends `charset=UTF-8` on HTML/JS/CSS; it would break on any host that drops the charset.
- **Recommended fix:** request each file type the way the Vite build does.
  - Scripts via `<link rel=modulepreload crossorigin>`: fetched and compiled, never evaluated, with headers identical to `import()`.
  - Stylesheets and fonts via CORS preloads (`crossorigin`), images via plain preloads, WASM and other data via `fetch()`.
  - `--lang=en-US` instead of the `acceptLanguage` override, which re-appended `;q=0.9`.
  - Declare `<meta charset="utf-8">` on the bootstrap page, and read `favicon.ico` through CDP (§8).
  - Worker scripts are still requested as module scripts, so a cloak keyed on `sec-fetch-dest: worker` stays uncovered; say so in the README.
- The two tests appended to `test/browser.integration.mjs` check this: a cloak keyed on `sec-fetch-mode: cors` must be caught, every file type must carry the same headers as on a real page, and non-ASCII text and `favicon.ico` must hash exactly.

## 11. Evidence overflow is permanent and then mutes everything (Reproduced)

- `retainPending` caps `pending_evidence` at 20,000 rows and sets `evidenceOverflow` ([store.mjs:94-102](services/ui-watchdog/src/store.mjs#L94-L102)). Nothing clears it, and rows for a commit whose reference never lands (a failed run nobody re-runs, or no `GITHUB_TOKEN`) are never deleted.
- One release is ~500 files × observers, so about 8 such releases trip it. Then `snapshot()` adds `evidence-overflow` to every observer, which is an integrity kind, so a clean, fresh, verified release assesses `integrity_alert` on every observer, forever.
- After that single critical, `shouldNotify` suppresses every later message (see "What Discord sees per release today") and the external heartbeat, which does not look at the state ([main.mjs:322-337](services/ui-watchdog/src/main.mjs#L322-L337)), stays green.
- On prod a person merges `production`, so the reference run always triggers; the leak needs failed runs. On play without a token it leaks on every release.
- Fix: delete pending rows for a commit once its reference lands or its run is final; clear the flag when the table is below the cap; let the external heartbeat stop on any `integrity_alert` or `watchdog_error`.

## 12. A revert is critical (Reproduced with synthetic hashes)

`record()` keeps the last two document hashes in `sequence` indefinitely ([observers.mjs:239-256](services/ui-watchdog/src/observers.mjs#L239-L256)). A revert on `production` rebuilds identical bytes (the build embeds no commit or time), so A→B→A is `flapping` and critical. The README says rollbacks authorized by the production branch are fine. Fix: drop the sequence when the flapped-to hash is the current production reference.

## 13. The pending window starts at the branch move (Traced)

`releaseWindow` counts `REFERENCE_PENDING_SECONDS` (1200) from `source.firstSeen`, which is the branch move ([policy.mjs:186-192](services/ui-watchdog/src/policy.mjs#L186-L192)). Netlify switches ~3 min later and the reference needs 6–20 min after that, so a slow run ends the window while `referenceStatus` is still `building`; the still-unknown HTML then becomes critical with no straddle at all. Count from the run's start, or from the first unknown observation.

## 14. Prod sends no `nosniff` and no CSP (Live)

Chromium 153 refuses `text/html` for module scripts, `modulepreload` and `import()`, but executes a classic `<script src>` whose response is `text/html` unless `X-Content-Type-Options: nosniff` is set. The app's own scripts are modules, so §9's fallback bytes cannot run; the header still closes the polyglot route for anything that is not. Add `X-Content-Type-Options: nosniff` to `_headers` and pin it in `response-policy.json`.

## 15. Minor

- `REMINDER_SECONDS` is documented and parsed but unused.
- `HEARTBEAT_URL` is optional in `deploy/stack.yml`; without it nothing watches the watchdog.
- Chromium runs without its sandbox by default (documented).
- `resolvePending` does not skip external URLs; if `EXTERNAL_SCRIPT_HASHES` is ever set, approved scripts become retrospective criticals.
- Remaining tells: the watchdog always presents as Linux "Chromium", never "Google Chrome", and never arrives by a cross-site navigation.

## 16. The retroactive check is discarded while an incident is open (Reproduced)

**What the check is for.** While a release's reference is building, unknown HTML is tolerated and every unknown hash is kept in `pending_evidence`. When the attested reference lands, `resolvePending` compares them against it. A mismatch means visitors were served something that was never built (round 1 §2).

**What goes wrong.**
- The findings are parked in kv `retrospectiveIssues` ([main.mjs:171-174](services/ui-watchdog/src/main.mjs#L171-L174), [store.mjs:104-128](services/ui-watchdog/src/store.mjs#L104-L128)) and make the next tick `integrity_alert` ([observers.mjs:450-472](services/ui-watchdog/src/observers.mjs#L450-L472)).
- If an incident is already open, `shouldNotify` returns false ([policy.mjs:86-94](services/ui-watchdog/src/policy.mjs#L86-L94)), so nothing is logged, and [main.mjs:281-282](services/ui-watchdog/src/main.mjs#L281-L282) clears `retrospectiveIssues` in the same tick.
- `resolvePending` has already deleted the `pending_evidence` rows ([store.mjs:120](services/ui-watchdog/src/store.mjs#L120)), so the evidence is gone for good: no event, nothing in `/api/events`.

**When it happens.** The stored notice stays `integrity_alert` until the aggregate has been `verified` for 60 s. A release whose straddle alarm fired (§9) cannot verify before its reference lands, and the landing is exactly when this check runs. So on every such release, whatever the check finds is discarded. An injection timed to a release (the repo is public and `production` pushes are visible) produces a critical that looks like the accepted straddle alarm, and the one check that would tell the two apart is thrown away.

**Reproduced** with `test/round2-retrospective.integration.mjs`, a black-box run of `src/main.mjs` against a fake GitHub and a fake observer that reads the SQLite event log:
- with no incident open, the mismatch is posted (control, passes today);
- with the straddle critical open: "Events after B landed: none".

**Recommended fix** (`main.mjs`, about 15 lines): where `resolvePending` is called ([main.mjs:171-174](services/ui-watchdog/src/main.mjs#L171-L174)), keep its return value and, when it has findings, log a `retrospective_mismatch` critical right there through `logEvent`, outside `shouldNotify`, with the observers, paths and a plain summary. Leave the incident logic as it is. Two details to decide:
- With no incident open, a real mismatch then pages twice (this event plus the incident it opens). Skip one if that is too loud.
- After a backfill across several references, link every source commit, not only the first.

## 17. Two `Set-Cookie` headers turn a critical into a quiet error (Reproduced)

The Chromium transport builds `new Headers(await response.allHeaders())` ([chrome.mjs:260](services/ui-watchdog/src/chrome.mjs#L260)). Playwright joins repeated `set-cookie` values with `\n`, Node's `Headers` rejects that value, and the file is recorded as `fetch-failed` instead of being hashed.

Same tampered chunk, with the §8/§10 fix in place:

| Served | Audit records | Result |
|---|---|---|
| tampered | `hash-mismatch` | `integrity_alert`: critical with a mention |
| tampered, plus two `Set-Cookie` headers | `fetch-failed` | `unverified`, then `degraded` after 3 audits (~45 min): an error post, no mention |

- Browsers accept repeated `Set-Cookie`, so visitors get the tampered file. Anyone who can change the served bytes can add the header (`_headers`, an edge function, a hijacker's own server).
- It matters most for chunks only the audit covers, such as on-demand wallet code. If `/` itself carries two cookies, every HTTP check is `down`, and only the rendered probe, which does not build `Headers`, still sees the page.
- It came with the Chromium transport (`a7954dd2f`), like §8.

**Recommended fix:** build the headers from `response.headersArray()`, so repeated headers stay separate:

```js
const headers = new Headers()
for (const { name, value } of await response.headersArray())
  headers.append(name, value)
```

The CDP read of `favicon.ico` (§8) should expose the same `headersArray()` shape, splitting CDP's `\n`-joined values.

## 18. The audit is still recognisable (Reproduced)

With the §10 fix, the audit's header values match a real page's for every file type: a full audit of the production build compared 509 files with 0 mismatches. Four tells remain; none comes from that fix.

- **Header order.** `continueChrome` passes an explicit header list to `Fetch.continueRequest` ([chrome.mjs:75-82](services/ui-watchdog/src/chrome.mjs#L75-L82)), so every audit and rendered-probe request is reordered: the audit sends `host, connection, accept, upgrade-insecure-requests, user-agent, sec-ch-ua, …` where Chrome sends `host, connection, sec-ch-ua, sec-ch-ua-mobile, sec-ch-ua-platform, upgrade-insecure-requests, user-agent, accept, …`. Under CDP interception Chromium adds no `pragma` or `cache-control`, so the rewrite does nothing else. Raw order is visible to a hijacker's own server; a Netlify Edge Function sees sorted headers.
- **`/favicon.ico`.** The transport's blank page has no icon link, so the audit's first request is `/favicon.ico` ([chrome.mjs:188-195](services/ui-watchdog/src/chrome.mjs#L188-L195)). A browser on the real `index.html` never requests that path, because the page declares `/favicon/favicon.ico`.
- **Referer.** Every file is preloaded from the blank page at `/`, so every request carries `referer: <origin>/`. Visitors send that only for files named by the page they landed on; lazily loaded chunks carry the current route (`/trade/swap/market?…`). A cloak "tamper unless the referer is `/`" hides on-demand chunks from the audit, the only check that covers them.
- **Locale on Linux.** The `--lang=en-US` from the §10 fix was only verified on macOS; the image sets no `LANG`.

**Recommended fix** (`chrome.mjs`, plus small changes in `scan.mjs`, `policy.mjs`, `browser.mjs`):
- Continue intercepted requests without a header override (`route.continue()` with no `headers`). Nothing else depends on the deletion.
- Put `<link rel="icon" href="data:,">` on every locally fulfilled blank page.
- Keep a small pool of blank pages, one per referer path, fulfilled locally like the current one. `observe()` passes the wanted referer with each request: `/` for files named by the root HTML, and for every other file a random real app route (the candidates `sampledRoutes` already uses). Don't set the Referer through `Fetch.continueRequest` headers, because that brings the order tell back, and don't use `history.replaceState` on one shared page, because audit requests run concurrently.
- Set `LANGUAGE=en_US:en` and `LANG=en_US.UTF-8` in the Chromium environment.
- The §10 test in `test/browser.integration.mjs` already expects this Referer split.

**Limits of this fix.**
- A cloak keyed on one specific route is caught only on audits that draw it (up to four routes per audit).
- In browsers, chunks imported by other chunks carry the importing chunk's URL as the Referer; the audit does not reproduce that.
- The 32 MB guard closes a pooled page without evicting it, so later files that draw that route become `fetch-failed`. That is narrower than before, when it blinded the whole audit.
- Worker scripts (`dest: worker`) and the web manifest (`dest: manifest`) are still requested differently, as the README says.

## 19. A wrong exit stays "retrying" forever (Reproduced)

- `checkEgress` asks check.torproject.org, then ipify, and catches every error ([network.mjs:11-39](services/ui-watchdog/src/network.mjs#L11-L39)). So the definitive answers of `validateEgress` ([network.mjs:117-122](services/ui-watchdog/src/network.mjs#L117-L122)) are swallowed:
  - an `EXPECTED_EXIT_IP` mismatch falls through to ipify, and the stored error becomes "Invalid fallback egress address";
  - a `tor` observer whose exit is not Tor (`IsTor: false`) falls through to ipify and *succeeds* with `tor: null`.
- `snapshot()` maps any egress problem to `unverified`, "Network egress validation is unavailable; retrying", with no counter ([observers.mjs:496-515](services/ui-watchdog/src/observers.mjs#L496-L515)). A misrouted or wrongly pinned observer is excluded from `verified` forever and nothing is posted: observer diversity is lost and nobody is told. No tamper slips through, because that observer never says `verified`.
- **Recommended fix:**
  - In `validateEgress`, mark the two definitive answers (wrong `IsTor` for the configured path, exit other than `EXPECTED_EXIT_IP`) with `error.mismatch = true`, and have `checkEgress` rethrow such errors instead of asking the fallback.
  - Copy the flag into the stored egress record (`egress.mismatch`) in the worker's and the browser probe's egress `catch`.
  - In `snapshot()`, count consecutive mismatching records per observer (reset on a clean one) and report the observer `degraded`, an error post, at `FAILURE_THRESHOLD`.
  - An oracle outage stays `unverified`, as round 1 §4.2 asked.

## 20. Smaller items (Traced unless noted)

- **An expired `GITHUB_TOKEN` goes quiet (Reproduced).** `head()` gets a 401 and the source task only records `sourceError` ([main.mjs:80](services/ui-watchdog/src/main.mjs#L80)). After 180 s every observer is `unverified` ("Cannot confirm the current production branch"), a warning that is never posted, and the external heartbeat keeps pinging, because it only checks that a token is set ([main.mjs:322-337](services/ui-watchdog/src/main.mjs#L322-L337)). The next release then pages as tampering (round 1 §2). Fix: post GitHub 401/403 as `credentials_missing`, escalate a stale source after ~10 min, and include `sourceFresh` in the heartbeat condition. Until then, use a token without an expiry or put the expiry in a calendar.
- **The public `/healthz` shows when monitoring is disarmed.** It is answered before authentication ([server.mjs:53-55](services/ui-watchdog/src/server.mjs#L53-L55)) and Traefik routes it publicly ([stack.yml:131](services/ui-watchdog/deploy/stack.yml#L131)). It returns 503 exactly when credentials were lost or the loop stalled. The container healthcheck uses 127.0.0.1, so exclude the path: ``Host(`ui-watchdog.play.hydration.cloud`) && !Path(`/healthz`)``.
- **Observers use Swarm's default 10 s stop grace** (`x-observer`, [stack.yml:19](services/ui-watchdog/deploy/stack.yml#L19)), so every deploy kills running audits and the coordinator records failures. Add `stop_grace_period: 2m`.
- **Observer `/healthz` restarts observers during outages a restart cannot fix** ([worker.mjs:50-55](services/ui-watchdog/src/worker.mjs#L50-L55)). Three failures plus 5 minutes without a success return 503, so a dead Tor exit or an unreachable target restarts the observer every 5–7 minutes and aborts its audits, while the Tor gateway's own healthcheck only checks bootstrap. Make `/healthz` report process liveness only.
- **A worker answering 429 is never counted** ([observers.mjs:353-356](services/ui-watchdog/src/observers.mjs#L353-L356), and the same for audit and browser). A stuck job leaves the observer silently `unverified`; slow jobs still escalate through the call timeout. Give each worker job a deadline that kills its browser, and keep `REQUEST_TIMEOUT_MS` low enough that a quick probe fits in the 240 s call timeout.
- **Changing `PRODUCTION_BRANCH` or `GITHUB_REPOSITORY` with the existing volume** makes every tick throw in `validateManifest` ([main.mjs:179-181](services/ui-watchdog/src/main.mjs#L179-L181)): a `watchdog_error` restart loop, with nothing posted. Skip non-matching references with a log line, and post loop errors (rate-limited).
- **The image job publishes from every branch push** ([ui-watchdog.yml:40](.github/workflows/ui-watchdog.yml#L40)), and the README's deploy section documents only a manual Docker Hub build, without `gh attestation verify`. Gate the job on master, and document the verification (`--source-ref refs/heads/master`) and the GHCR pull credentials.
- **The reference build's install container can write `.git`** ([ui-watchdog-reference.yml:35-37](.github/workflows/ui-watchdog-reference.yml#L35-L37)), and the host then runs `git status` and `git ls-files` ([:48-49](.github/workflows/ui-watchdog-reference.yml#L48-L49)). A dependency's install script can set `core.fsmonitor` and run code on the runner (reproduced: the hook runs on `git status`). The build job only has `contents: read`, so this is defence in depth: mount `.git` read-only and run the inventory with `git -c core.fsmonitor= -c core.hooksPath=/dev/null`.
- **`check-action-pins.py` accepts commits from forks** ([check-action-pins.py:17-19](services/ui-watchdog/scripts/check-action-pins.py#L17-L19)) and ignores the `# vX` comment. Require `commits/<tag from the comment>` to resolve to the pinned SHA.
- **`build-reference.sh` pins Node as a literal** (`v25.9.0`, [build-reference.sh:4](services/ui-watchdog/scripts/build-reference.sh#L4)). Compare it with `.nvmrc`, so a Node bump without a recipe update fails as `reference_failed` instead of drifting silently.
- **`refs` is never pruned** and is parsed on every 5 s tick: about 87 ms per tick after a year. Cache the parsed references.

## 21. Regression tests (round 2)

| File | Run by | Covers |
|---|---|---|
| `test/browser.integration.mjs` (2 tests appended) | `npm run test:browser` | §8, §10 |
| `test/round2-retrospective.integration.mjs`, `test/fixtures/fake-github*.mjs` | `npm run test:browser` | §16, as a black-box run of `src/main.mjs` against a fake GitHub and a fake observer |
| `test/round2-transport.integration.mjs`, `test/fixtures/round2-origin.mjs` | `npm run test:browser` | §17, §18 |
| `test/round2-egress.test.mjs` | `npm test` | §19 |

The retrospective test needs no browser, but it binds ports and takes about 70 s, so it runs with `test:browser`.

| Test | Expected after fix |
|---|---|
| Each file type requested like the app; `cors`-only chunk cloak | same headers as a real page, Referer split as in §18; cloak detected |
| Non-ASCII text and `favicon.ico` hashed exactly | hashed, no issues |
| Retrospective mismatch while an incident is open | a critical event after the reference lands (the scenario without an open incident passes today) |
| Tampered chunk with two `Set-Cookie` headers | `hash-mismatch`, `integrity_alert` |
| Clean files and `favicon.ico` with repeated `Set-Cookie` and `Cache-Status` | hashed, no issues |
| Audit and rendered-probe header order | the same order as a plain Chromium page |
| `/favicon.ico` when the app declares its icon elsewhere | never requested |
| Lazy chunk cloaked on `referer: /`; entry files | cloak detected; entry files still sent with `/` |
| Exit other than `EXPECTED_EXIT_IP` | rejected as that mismatch, fallback not asked |
| `tor` observer on a non-Tor exit | rejected, not a `tor: null` success |
| Egress mismatch on 3 and on 5 consecutive records (threshold 3 and 5) | `degraded`, an error post |
| Guards: an oracle outage falls back to ipify; a clean record resets the count; an outage stays `unverified` | unchanged (pass today) |

At this head, `npm test` gives 75/79 and `npm run test:browser` 12/20, and every failure is one of the assertions above. With the recommended fixes for §8, §10 and §16–§19 implemented (checked once with a reference implementation), they pass 79/79 and 20/20, and every new file passed three runs in a row.

Also worth adding:
- An expired `GITHUB_TOKEN` posts an error within ~10 min (§20).
- An observer whose worker keeps answering 429 eventually goes `down` (§20).
- Retrospective findings that span several references link every source commit (§16).
