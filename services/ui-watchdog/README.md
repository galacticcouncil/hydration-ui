# Hydration UI deployment watchdog

Continuously compare `https://app.hydration.net` with independent builds of
`galacticcouncil/hydration-ui`'s `production` branch. Record observed content
changes and release history, verify files and browser routes, and deliver
Discord incident, deployment, and recovery notifications.

## Trust and coverage

The production hosting account supplies **no trusted metadata**. There is no
Netlify API, token, SDK, or hook. A website-provided SHA or manifest cannot turn
an observation green.

`.github/workflows/ui-watchdog-reference.yml` builds the exact production commit
twice on separate GitHub-hosted runners. Both use the same digest-pinned Node
25.9.0 image, Yarn 1.22.22, frozen lockfile, checked-in production environment,
and vendored theme input. Package installation has network access; the actual
theme and app build has none. Application builds run in containers without the
Docker socket or publication credentials. A separate job compares the two
inventories before signing and publishing the reference manifest.

The watchdog checks the attestation signature, repository, exact workflow path,
`refs/heads/production`, source SHA, and GitHub-hosted runner identity with
`gh attestation verify`. It rejects unsigned, wrong-source, wrong-workflow, PR,
and self-hosted-runner references. It never runs repository code on play.
Protect `production`, the reference workflow, and its build scripts with review
and branch rules: repository/source compromise is outside this check's trust
boundary. An attestation establishes provenance, not freedom from malicious
source or dependencies.

Every expected public file is hashed from **Chromium's decoded response body**.
A blank same-origin page preloads JS with `sec-fetch-dest: script` without executing
it; documents use separate pages. Chromium supplies TLS, HTTP/2, compression and
request headers. Both probes and rendered checks use full Chromium with complete
client-hint metadata, without the HeadlessChrome brand. This removes tested
fingerprints, not every possible fingerprint.

HTML includes inline code. Lazy chunks, workers, WASM, CSS, fonts, images and static
configuration are inventoried. Both HTML samples are checked; mismatches from any
probe, audit or browser check take precedence over races, even after the latest
HTML changes. A→B→A flapping and three consecutive racing probes alert. A single
one-way transition between trusted documents remains non-critical. All stored
references remain eligible for rollback matching; an old release still needs the
production branch to authorize it.

`response-policy.json` pins cache-control and CSP presence/value, with per-path
overrides. Its current baseline records the deployed absence of CSP; this is **not**
a recommendation to omit CSP. The policy is included in signed references. New
external API/WebSocket origins are warnings against `data-origins.json`, not
proof that returned data is safe. `_redirects` and `_headers` are recorded as
hosting inputs, not compared as public files. Configured routes, random real
routes from the build's route tree, referral/deep paths and query variants sample
routing behavior; they cannot attest every hosting rule or country/cookie split.

Rendered checks visit the configured routes in random order and exercise link
navigation. Body jobs finish before navigation or page closure. Service workers
are disabled in these contexts. Built service-worker files are covered only if
present in the reference inventory: an unreferenced rogue `/sw.js`, an existing
visitor's cache, wallet-only interactions and runtime data are not comprehensively
covered. In particular, mutable jsDelivr metadata, RPC/indexer responses and Reown
configuration are outside static build verification.

A malicious dependency already recorded in `yarn.lock` is reproduced by the
reference build and can report **verified**. This is not a dependency malware
scanner. Lockfile review, package release-age policy, pinned runtime metadata,
registry/registrar protections, CT/DNS monitoring and hosting account/deploy alerts
are complementary controls, not capabilities of this watchdog.

Observers share one implementation/image but run as separate non-root services,
with individual API tokens and separate control networks. Each proxy has a private
observer network and its own egress network; sibling observers cannot call each
other or borrow another gateway. Only the controller has GitHub/Discord secrets
and the state volume. Every service and local Tor volume is pinned to play.
NordVPN/custom WireGuard use [wireproxy](https://github.com/windtf/wireproxy), without
TUN, NET_ADMIN, privileged containers or host routing changes. Proxy observers have
no direct egress. Remote observer endpoints require HTTPS; configure their tokens.

Browser network policy rejects private destinations and unapproved executable
origins on monitored pages. This is not a browser exploit containment guarantee:
Chromium currently runs without its own sandbox on play's container profile.
`CHROMIUM_SANDBOX=true` requires a host/container profile supporting Chromium's
sandbox; it fails closed rather than falling back. Keep runtime images updated.
A compromised observer can forge its own reports; distinct isolated observers
reduce, but do not eliminate, that risk. All play services still share one host.

Tor Project's IP check is supplemented by ipify. The fallback establishes an IP
but not Tor membership, so its result stays **unverified**, without a mention.
Oracle outages do not restart running VPN gateways. Nord selection failures retain
the current tunnel and retry. Sampled exit IPs cannot prove the exact exit used by
every request. All default vantages are datacenter/Tor/VPN addresses: residential
or independently operated browser observers are needed to test IP-class cloaking.
Nothing here proves that every visitor receives the same bytes. Sub-interval swaps
and identical redeployments can remain invisible. No automatic rollback occurs.

## States, releases and alerts

| State | Meaning |
| --- | --- |
| `verified` | Every required path has a matching production reference and fresh asset, browser and egress checks |
| `reference_pending` | A production build/verification is active, within the bounded pending window |
| `protection_inactive` | Zero attested references: integrity protection is inactive |
| `reference_failed` | Missing/failed/unavailable production reference pipeline |
| `deployment_pending` | Trusted releases are rolling out within the grace window |
| `stale_deployment` | A trusted old release remains after the rollout window |
| `integrity_alert` | Byte/header/resource mismatch, persistent racing, flapping or evidence overflow |
| `unverified` | Freshness, egress or transient check failure prevents verification |
| `degraded` / `down` | Three consecutive check failures |
| `alerting_inactive` | Content checks pass but initial Discord delivery is not configured |
| `credentials_missing` | A previously armed credential disappeared on redeploy |
| `watchdog_error` | Internal/storage failure; never a passing check |

The hosting pipeline is unchanged. During an actual reference run, unknown samples
are retained for retrospective checking, for at most `REFERENCE_PENDING_SECONDS`
(default 1200) from first seeing that production commit. All recorded unknown hashes
and asset hashes are checked when its attested reference arrives; discrepancies
become a critical incident even if the live app has since recovered. Expiry is
critical. Missing/failed runs have their own error state. A known asset mismatch
or executable/header-policy violation never receives this grace. Pending metadata
is capped at 20,000 samples; overflow alerts instead of silently discarding evidence.

HTML/entry probes run about every 30 seconds after completion, rendered checks every
five minutes and full audits every **15 minutes**, with 20% scheduling jitter.
New references/changes invalidate checks immediately. Full audits have a two-minute
scheduling budget plus request deadlines. Jobs of one kind do not overlap. These
are sampling intervals, not promises of maximum detection latency. Compression and
the longer full-audit interval reduce synthetic traffic. `FULL_AUDIT_SECONDS=300`
restores five-minute full audits at higher traffic cost.

Integrity incidents have stable keys independent of attacker-controlled hashes.
One critical notification opens an incident; changing bytes/observers do not page
again while it remains open. Only **critical** events can mention Discord users.
Transient failures, egress outages and ordinary releases do not mention anyone.
Content events are throttled per observer; routine freshness changes remain in
history rather than generating a Discord stream. Releases include a compare link
and escaped commit titles. Verified operation emits a daily heartbeat.

The outbox prioritizes critical events, stops permanently on Discord 400/401/403/404
or after 12 failed attempts, and has a 1,000-pending-event cap. Failed deliveries
stop the external heartbeat; one warning cannot block later critical delivery.
Delivery is at least once: a lost successful response can still cause a duplicate.
Captured unknown HTML/JS evidence includes headers and up to 64 KiB of each body
(base64, never executed by the controller), capped at 512 bodies. Inventory state
is bounded and old release paths are removed. SQLite retains events for 90 days.

Reference reconciliation checks current run state every 30 seconds while pending,
five minutes when ready, and backfills 90 successful runs. One bad artifact does
not abort other runs. All verified references are kept; expired artifacts cannot
be recovered from GitHub automatically. Stored source timing survives restart.

## Configure credentials

In GitHub **Settings → Developer settings → Personal access tokens → Fine-grained
tokens**, select resource owner `galacticcouncil`, only `hydration-ui`, an expiry,
and these repository permissions:

| Permission    | Access                                                                             |
| ------------- | ---------------------------------------------------------------------------------- |
| Actions       | Read — retrieve reference artifacts                                                |
| Contents      | Read — production ref and commit comparisons                                       |
| Pull requests | Optional read — current summaries use commit/compare links without this permission |
| Metadata      | Read — automatically included                                                      |

The runtime token needs **no write permission**. The attestation job uses its own
short-lived Actions credentials, never the runtime token. Organization approval
may be needed for a fine-grained token. Configure it as `GITHUB_TOKEN` in the
watchdog service, or mount a Swarm secret and set `GITHUB_TOKEN_FILE`.

Set `DISCORD_WEBHOOK_URL` for notifications. `DISCORD_WEBHOOK_URL_FILE` also works.
The `_FILE` variants take precedence and file-read failures stop startup. ENV
values appear to Swarm administrators; mounted secrets avoid storing values in
the stack file. Neither is exposed by the dashboard or logs.

`DISCORD_MENTION` optionally accepts one `@here`, `@everyone`, `<@USER_ID>` or
`<@&ROLE_ID>`. Attacker-controlled paths and titles are escaped as Discord markdown.
Events created before a webhook is configured stay in history without being queued.
Initial blank GitHub/Discord credentials are allowed and clearly show protection
inactive. Once configured, the store remembers that state: losing a credential
causes `credentials_missing`, an unhealthy controller and no external heartbeat.

Set `HEARTBEAT_URL` (or `HEARTBEAT_URL_FILE`) to an **independent external** dead-man
monitor. The watchdog sends an HTTPS GET approximately every minute only after a
successful persistence cycle, with credentials/references present and no terminal
Discord delivery failure. Configure that provider to alert after missed heartbeats
(e.g. five minutes). No external monitor is enabled until an operator supplies the
URL. Daily Discord heartbeats alone cannot detect a dead process or broken webhook.

Set `DASHBOARD_TOKEN` (or `_FILE`): dashboard, status, history and evidence endpoints
require HTTP Basic auth (any username, token as password) or `Authorization: Bearer`.
There is no public diagnostic projection. A missing dashboard token denies access.
Generate separate random `OBSERVER_TOKEN_DIRECT`, `_TOR_DE`, `_TOR_US`, `_NORD_1`,
`_NORD_2`, `_NORD_3`, `_WIREGUARD` values when rendering the stack. Each worker receives
only its own `OBSERVER_TOKEN`; the controller gets all seven. `_FILE` variants can
be used with Swarm secrets. The template requires explicit dashboard/worker tokens.

## Deployment on play

Image build context is this directory, independent of the Yarn monorepo.
Images are Linux amd64 (play). One stack contains:

- `watchdog`: one coordinator, SQLite history, dashboard and Discord outbox.
- `browser`: the existing service name, now the direct HTTP + Chromium observer.
- `observer-tor-de` / `observer-tor-us` and their Tor gateways: active by default,
  constrained to German and US exits, with independent circuit state.
- `observer-nord-1..3` and `nord-1..3`: three simultaneous NordVPN paths, disabled
  until enabled and configured; all use the same account token.
- `observer-wireguard` and `wireguard`: a configurable additional VPN path,
  disabled until enabled and configured.

All observers, VPN gateways and the coordinator use the same watchdog image.
Only Tor has a second image. Packages come from the authenticated official Tor repository; the deployed image is pinned by digest, without an apt version that disappears from the live mirror.
No observer owns a separate dashboard, reference cache or alert pipeline. The
`state` volume preserves the existing history across this stack update.
Only the controller joins the existing `gateway` network. It uses play's
`myresolver` Traefik certificate resolver, with no published host ports.
Temporary directories use explicit `type: tmpfs` mounts; Swarm ignores the
Compose `tmpfs` shorthand. Keep these mounts with the read-only root filesystem.

CI builds both images for pushes to this repository, publishes commit tags to
GHCR, records BuildKit provenance/SBOM and signs their digests with GitHub artifact
attestations. Publication permissions exist only in that image job, not PR tests
or runtime credentials. A manual Docker Hub fallback is available from the
repository root (manual builds do not acquire GitHub-hosted provenance):


```sh
REVISION=$(git rev-parse HEAD)
docker build --platform linux/amd64 \
  --label org.opencontainers.image.source=https://github.com/galacticcouncil/hydration-ui \
  --label org.opencontainers.image.revision="$REVISION" \
  -t "galacticcouncil/hydration-ui-watchdog:$REVISION" services/ui-watchdog
docker push "galacticcouncil/hydration-ui-watchdog:$REVISION"
docker build --platform linux/amd64 \
  --label org.opencontainers.image.source=https://github.com/galacticcouncil/hydration-ui \
  --label org.opencontainers.image.revision="$REVISION" \
  -t "galacticcouncil/hydration-ui-watchdog-tor:$REVISION" services/ui-watchdog/tor
docker push "galacticcouncil/hydration-ui-watchdog-tor:$REVISION"
```

Resolve both pushed image digests. Set `WATCHDOG_IMAGE` to
`galacticcouncil/hydration-ui-watchdog@sha256:…` and `TOR_IMAGE` to
`galacticcouncil/hydration-ui-watchdog-tor@sha256:…`, then render
`deploy/stack.yml` with `docker stack config` and create/update stack
`ui-watchdog` through play's Swarmpit. Keep the rendered file's current secrets
when making future edits. Never overwrite configured ENV values with the blank
defaults during a later redeploy. Autoredeploy is disabled; use explicit digests.

All services are pinned to node `play`, including the single SQLite writer and local Tor state. Updates stop the old writer before starting a replacement. Back up the
volume using SQLite's backup mechanism or a stopped-service volume copy.
Rolling back the **watchdog** means redeploying its previous digest with the same
volume and ENV. This service never rolls back the monitored application.

Endpoints:

- `https://ui-watchdog.play.hydration.cloud/` — read-only status/history dashboard
- `/api/status` — current checks, freshness, configuration and delivery backlog
- `/api/events?limit=100` — persisted change/incident history (maximum 500)
- `/api/evidence?hash=<sha256>` — authenticated capped forensic sample
- `/healthz` — public process/storage/credential liveness, independent of app integrity

Do not expose the observer or proxy ports publicly. Authenticated internal `POST /observe`
and `POST /probe` endpoints accept bounded reference data and always check their
configured target. No worker can select a different target through an API call.

### Enable NordVPN

Create a [NordVPN access token](https://support.nordvpn.com/hc/en-us/articles/20286980309265-How-to-log-in-to-NordVPN-without-a-GUI-using-a-token).
Set `NORDVPN_TOKEN` once in the rendering environment and `NORDVPN_REPLICAS=1`,
then update the whole stack. The value is used only by the three gateways. It
must not be added to observer or coordinator ENV. Each gateway obtains its
NordLynx key from the provider's service-credentials API, chooses a recommended
WireGuard server, and rotates to another candidate hourly with up to 10% jitter.
After three failed 30-second health checks it selects a new candidate. Selection
failures keep the current tunnel while retries continue; no direct route exists
in the observer. Token/account validity and provider connection limits still
apply. The provider API is an integration dependency and may change.

`NORDVPN_COUNTRY_1`, `_2`, `_3` default to `DE`, `US`, `SG` (two-letter uppercase
codes). `NORDVPN_ROTATE_SECONDS` defaults to `3600` (minimum `300`). This provides
three concurrent exits plus changes over time, using one account token. Different
countries avoid choosing the same server for concurrent sessions. Distinct IP
checks still guard against accidental overlap.

For Swarm secrets, mount the same secret into all three gateways and replace
`NORDVPN_TOKEN` with `NORDVPN_TOKEN_FILE=/run/secrets/nordvpn_token`. The user may
configure credentials later; the initial deployment keeps all Nord services at
zero replicas. To enable via Swarmpit's rendered YAML, set all six Nord services
to one replica **and** set the coordinator's `NORDVPN_REPLICAS` to `"1"` in the same
stack update. A partial enable cannot provide the intended required coverage.

### Enable custom WireGuard

Set `WIREGUARD_REPLICAS=1`, `WIREGUARD_PRIVATE_KEY`, `WIREGUARD_PUBLIC_KEY` (peer),
`WIREGUARD_ENDPOINT=host:port`, `WIREGUARD_ADDRESS` (tunnel CIDR), and optionally
`WIREGUARD_PRESHARED_KEY`, `WIREGUARD_DNS` (comma-separated IPs, default `1.1.1.1`).
Choose a public endpoint with Internet forwarding; all observer traffic and DNS
go through its encrypted tunnel. `WIREGUARD_EXPECTED_EXIT_IP` can pin its public
exit. Private and preshared keys support `_FILE` secrets in the gateway. The
controller needs no VPN key. When editing rendered YAML, enable both WireGuard
services and the coordinator's `WIREGUARD_REPLICAS="1"` together.

### Tor and observer policy

`TOR_EXIT_NODES_DE` / `TOR_EXIT_NODES_US` default to `{de}` / `{us}`. Tor's strict
exit constraints have no cross-country fallback; bootstrap, exit shortages and
origin blocking are monitoring failures. Tor circuit dirtiness is ten minutes;
this does not guarantee a new exit every ten minutes. Tor state has separate
volumes so the two gateways retain independent guards and circuits across restarts.

`MULTI_NETWORK=true` configures direct plus both Tor observers. `OBSERVERS_JSON`
can override the required list, for example to include remote independently
operated workers. Entries are `{id,url,kind}`; `kind` is `direct`, `tor` or `proxy`.
Use authenticated private networking/TLS for remote workers; do not expose the
unauthenticated worker API on the public Internet. `MIN_DISTINCT_EGRESS` defaults
to the number of required observers; lowering it weakens the diversity check.
`PROXY_URL` is a credential-free `socks5h://gateway:9050` address on the private
network, and is mandatory for a proxied worker. No local DNS or HTTP proxy fallback
is offered. Keep the observer network isolation in custom deployments.

## Activate verification

Merge the PR into `master`, then promote the workflow, pinned theme and build
fixes to `production` using the normal release process. The production push runs
the reference workflow. After it succeeds and the read-only token is configured,
the watchdog discovers and verifies the manifest. A manual dispatch must target
`production`; dispatches on other branches are skipped.

Opening a PR and deploying the watchdog do not automatically merge or promote
the production app. Until those steps are complete, change monitoring works but
the dashboard correctly reports `unverified`. No unsigned diagnostic build is
silently installed as a trusted baseline.

For an intentional environment or build-tool change, update the checked-in
recipe and build inputs together. Production's deployed artifacts must use
those same inputs. Mismatches must be investigated, not normalized away or
approved just by observing the new website. Theme updates are explicit changes
to `packages/ui/style-dictionary/source.json`; its initial upstream revision is
`hydration-styles@732405c06e9b2d51f60ad7ef9732407cf04e0d6a`.

## Other configuration

| ENV                                                       | Default                                                       |
| --------------------------------------------------------- | ------------------------------------------------------------- |
| `TARGET_URL`                                              | `https://app.hydration.net` (HTTPS origin)                    |
| `GITHUB_REPOSITORY` / `PRODUCTION_BRANCH`                 | `galacticcouncil/hydration-ui` / `production`                 |
| `POLL_SECONDS` / `FULL_AUDIT_SECONDS` / `BROWSER_SECONDS` | `30` / `300` / `300`                                          |
| `ROLLOUT_GRACE_SECONDS` / `REMINDER_SECONDS`              | `900` / `3600`                                                |
| `REQUEST_TIMEOUT_MS` / `FETCH_CONCURRENCY`                | `20000` / `6`                                                 |
| `RETENTION_DAYS`                                          | `90` for history; pending deliveries are retained             |
| `SMOKE_ROUTES`                                            | JSON array of four public app routes                          |
| `EXTERNAL_SCRIPT_HASHES`                                  | `{}` — exact external script URLs to approved SHA-256 digests |
| `ALLOWED_FRAME_ORIGINS`                                   | `[]` — explicit external frame trust exceptions               |

Keep target, route and external-resource policies consistent across all observers.
Approving an external frame origin trusts its dynamic contents; those contents
are outside source-build integrity coverage. Prefer no exceptions.

## Tests

```sh
cd services/ui-watchdog
npm ci
npx playwright install --with-deps chromium
npm test
npm run test:browser
```

The container-based CI uses the pinned Playwright image. Tests cover injected
HTML, changed lazy chunks, unexpected scripts in a real browser, missing files,
rollout races and grace, stale checks, manifest/archive validation, provenance
policy, persistent notification retries, Discord rate limits and mentions,
private-address filtering, escaping, and request deadlines/size bounds. Network
tests cover a single disagreeing path, missing/stale paths, duplicate exits,
remote DNS through SOCKS, real Chromium proxy routing and failed-proxy behavior,
Nord token reuse/rotation/country selection, and WireGuard configuration injection.
Live NordVPN/WireGuard connectivity must be checked after credentials are supplied;
fixture/configuration tests do not prove a provider connection works.

See `verification.json` for the initial independent-build experiment. It is
diagnostic evidence, not an accepted runtime attestation.

## Reference workflow activation and remaining operations

PR/master dry runs exercise both independent builds, manifest generation and `cmp`,
without signing. CI also runs actionlint and resolves every pinned action SHA through
the commits API, catching annotated-tag object pins. The signer uses attestation
v3.2.0 at `96278af6caaf10aea03fd8d33a09a777ca52d62f`, with an exact certificate identity
and explicit SLSA v1 predicate policy. Install/build containers use writable HOME;
tracked, untracked and ignored additions under `apps/main/public` are checked.

The fixed workflow must reach `production`, then receive a **new production push**
(or fresh dispatch of the fixed production workflow). Re-running the old failed
run uses the old workflow. Until then, and until the read-only runtime token is
configured, play cannot authenticate references and reports protection inactive.

Hosting UI environment variables, build-command changes, plugins/snippets and
conditional routing can still drift. Their byte/header effects are detected on
sampled requests and retained as evidence; changing hosting configuration and
publishing order is outside this service. Review/align the hosting recipe before
arming and require production workflow review. This service has no hosting token.

The independent review tests from [PR #4111](https://github.com/galacticcouncil/hydration-ui/pull/4111)
are included, alongside `test/review.test.mjs` and real-Chromium tests. Their
release fixtures now supply the actual build status and use SQLite to exercise
retrospective verification. Trusted fixtures serve the pinned response headers;
cloak assertions require changed-body evidence so unrelated header errors cannot
produce a false pass. The worker outage fixture explicitly allows its local test
origin and confirms the app was reached before asserting failed egress validation.
The tests preserve the benign trusted-rollout guard and check chunk tampering
both inside and outside the release window. A recent branch push alone cannot
grant pending grace, and pipeline errors cannot excuse unknown bytes when the
expected reference already exists. These fixtures do not establish protection
against arbitrary targeted cloaking or malicious locked dependencies.
