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
