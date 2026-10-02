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

Every expected public file is hashed from its HTTP response body. Proxied
requests require identity encoding and reject unexpected compressed responses.
HTML includes inline code. JS (including lazy chunks and workers), WASM, CSS,
fonts, images, and static configuration are inventoried. `_redirects` and
`_headers` are recorded separately as hosting configuration, because hosts may
consume them without serving them. Route probes check SPA delivery behavior;
the watchdog cannot attest the hosting control plane.

Fresh Chromium contexts exercise `/trade/swap`, `/liquidity`, `/borrow`, and
`/portfolio`, check that the app renders, compare resource bodies, and report
errors and unexpected executable resources. Service workers are blocked in
the probe; their published files remain covered by the full artifact audit.
Existing visitors' caches/service workers are not covered. External API data
is not static build output and cannot be authenticated by these hashes.

Observers use one shared image and implementation. Each runs as a separate
non-root service with no GitHub/Discord/VPN credentials, history volume, host
mounts, or Docker socket. Separate runtime services isolate network paths and
failures. One controller owns history, reference verification and Discord.

Both HTTP file scans and Chromium use the observer's assigned path. Proxied
observers join only internal networks, with no public egress; DNS travels through
SOCKS5. Tor rejects private destinations. NordVPN and custom WireGuard gateways
use [wireproxy](https://github.com/windtf/wireproxy), a userspace WireGuard stack;
they need no TUN device, NET_ADMIN, privileged mode or host routing changes.
A failed gateway has no direct fallback. Browser traffic blocks QUIC and
non-proxied WebRTC, private IP literals/local hostnames, unapproved executable
resources and frames. Direct DNS checks reject private results; proxied DNS
stays remote. These checks are not a guarantee against DNS rebinding or browser
exploits; use a trusted WireGuard peer with public Internet egress.

Every configured observer is required. A disagreeing path raises an integrity
alert even if the majority agrees or references are not yet available. Only
intact attested releases receive the bounded rollout grace. Failed or stale
paths cannot be voted away. HTTP and Chromium separately sample their egress
using the [Tor Project IP check](https://check.torproject.org/api/ip). The default
policy requires as many distinct sampled IPs as configured observers and checks
Tor membership. Failure of the egress check prevents verification. An IP sample
is not proof of the exact exit used for every target request: Tor may choose
different circuits per destination. Countries with disjoint Tor exit constraints
and independent VPN gateways improve coverage, but are not an anonymity promise.

This is **detection**, not automatic rollback or traffic blocking. Multiple exits
improve sampling but cannot rule out content served only to particular victims.
All services on play share its host and operator trust; protection against a
compromised play host requires observers on independently operated hosts.
A common browser user agent reduces one obvious identifier, but headless browser
and polling patterns can still be fingerprinted. Transient changes
between checks and identical redeployments are invisible. “Verified” means the
observed bytes match the approved independent source build and the configured
browser checks passed; it does not certify the source is harmless.

## States and scheduling

| State                | Meaning                                                                                                  |
| -------------------- | -------------------------------------------------------------------------------------------------------- |
| `verified`           | Every required observer passes the production reference, fresh complete audit, browser and egress checks |
| `deployment_pending` | Intact known previous release, within the rollout grace period                                           |
| `stale_deployment`   | Known previous release after the grace period, including an unapproved rollback                          |
| `integrity_alert`    | Unexpected/mismatched executable content or resource policy violation                                    |
| `unverified`         | No trusted matching reference, stale source information, or incomplete/racing checks                     |
| `degraded` / `down`  | Asset/browser/dependency failures or the app cannot be fetched                                           |
| `watchdog_error`     | Internal monitoring failure; never a passing check                                                       |

Each observer probes HTML and entry JS/CSS at 30-second intervals after completion, and schedules full
asset and browser scans independently every five minutes and after changes.
Browser worker connection failures retry at the 30-second polling interval.
An asset scan has a two-minute scheduling budget plus bounded in-flight request
timeouts. Slow probes never overlap copies of the same job. Timestamps and
coverage are explicit; the 30-second interval is not a five-minute asset-check
guarantee. Deployment grace defaults to 15 minutes and applies only to intact
known releases. HTML matching none of the available trusted references and
asset mismatches alert immediately. With no reference at all, status remains
`unverified` while change tracking and browser checks still operate.

Branch polling uses conditional requests (30 seconds with a token, five minutes
without one to respect public API limits). Reference reconciliation runs every
five minutes and examines up to 90 recent successful production workflow runs,
including dispatches on production. Expired GitHub artifacts cannot be restored
automatically. Verified references and the last observed source/time survive
restarts in SQLite. The most recent 30 references are candidates for live matching.

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

`DISCORD_MENTION` optionally accepts one `@here`, `@everyone`, `<@USER_ID>`, or
`<@&ROLE_ID>`. Only critical/error alerts mention it; commit text cannot trigger
mentions. Incident transitions and reminders are deduplicated. Deliveries use
a persistent outbox, bounded exponential backoff and Discord rate-limit delays.
Delivery is at least once: a lost successful response can yield a duplicate
with the same event ID. Events created while the webhook is unset remain in
history but are not queued for later replay. Pending failures appear in status.

The initial deployment intentionally leaves both credentials blank for the
operator to configure. Missing credentials never produce a false passing state.

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
Only Tor has a second image, pinned to the official Tor package and signing key.
No observer owns a separate dashboard, reference cache or alert pipeline. The
`state` volume preserves the existing history across this stack update.
Only the controller joins the existing `gateway` network. It uses play's
`myresolver` Traefik certificate resolver, with no published host ports.
Temporary directories use explicit `type: tmpfs` mounts; Swarm ignores the
Compose `tmpfs` shorthand. Keep these mounts with the read-only root filesystem.

From the repository root:

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

The single SQLite writer is pinned to node `play`, where the local state volume
lives. Updates stop the old writer before starting a replacement. Back up the
volume using SQLite's backup mechanism or a stopped-service volume copy.
Rolling back the **watchdog** means redeploying its previous digest with the same
volume and ENV. This service never rolls back the monitored application.

Endpoints:

- `https://ui-watchdog.play.hydration.cloud/` — read-only status/history dashboard
- `/api/status` — current checks, freshness, configuration and delivery backlog
- `/api/events?limit=100` — persisted change/incident history (maximum 500)
- `/healthz` — controller liveness, independent of application health

Do not expose the observer or proxy ports publicly. Internal `POST /observe`
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
npm test
npx playwright install --with-deps chromium
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
