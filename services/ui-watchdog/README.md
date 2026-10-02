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

Every expected public file is hashed from its decoded HTTP response body.
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

The browser runs as a separate non-root service, with no GitHub/Discord secrets,
history volume, host mounts, or Docker socket. It can reach the controller only
over the private probe network; the controller exposes read-only APIs. The
browser blocks non-HTTPS/WSS, private/metadata addresses, unapproved external
scripts, and unapproved frames. DNS checks are a best-effort extra defense, not
a network firewall or guarantee against DNS rebinding/browser exploits.

This is **detection**, not automatic rollback or traffic blocking. One observer
cannot rule out content served only to particular victims. Transient changes
between checks and identical redeployments are invisible. “Verified” means the
observed bytes match the approved independent source build and the configured
browser checks passed; it does not certify the source is harmless.

## States and scheduling

| State                | Meaning                                                                              |
| -------------------- | ------------------------------------------------------------------------------------ |
| `verified`           | Current production reference, fresh complete file audit and browser checks all pass  |
| `deployment_pending` | Intact known previous release, within the rollout grace period                       |
| `stale_deployment`   | Known previous release after the grace period, including an unapproved rollback      |
| `integrity_alert`    | Unexpected/mismatched executable content or resource policy violation                |
| `unverified`         | No trusted matching reference, stale source information, or incomplete/racing checks |
| `degraded` / `down`  | Asset/browser/dependency failures or the app cannot be fetched                       |
| `watchdog_error`     | Internal monitoring failure; never a passing check                                   |

The controller probes HTML and entry JS/CSS every 30 seconds, and schedules full
asset and browser scans independently every five minutes and after changes.
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

| Permission    | Access                                                                            |
| ------------- | --------------------------------------------------------------------------------- |
| Actions       | Read — retrieve reference artifacts                                               |
| Contents      | Read — production ref and commit comparisons                                      |
| Pull requests | Read — reserve for richer PR metadata; current summaries use commit/compare links |
| Metadata      | Read — automatically included                                                     |

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
The image is Linux amd64 (play). The stack has two services, `watchdog` and
`browser`, plus a persistent `state` volume and isolated probe/egress networks.
Only the controller joins the existing `gateway` network. It uses play's
`myresolver` Traefik certificate resolver, with no published host ports.

From the repository root:

```sh
REVISION=$(git rev-parse HEAD)
docker build --platform linux/amd64 \
  --label org.opencontainers.image.source=https://github.com/galacticcouncil/hydration-ui \
  --label org.opencontainers.image.revision="$REVISION" \
  -t "galacticcouncil/hydration-ui-watchdog:$REVISION" services/ui-watchdog
docker push "galacticcouncil/hydration-ui-watchdog:$REVISION"
```

Resolve the pushed image digest. Set `WATCHDOG_IMAGE` to
`galacticcouncil/hydration-ui-watchdog@sha256:…`, then render
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

Do not proxy the browser service. Its internal `POST /probe` endpoint accepts
bounded reference data and always probes its configured target.

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

Keep target, route and external-resource policies consistent in both services.
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
private-address filtering, escaping, and request deadlines/size bounds.

See `verification.json` for the initial independent-build experiment. It is
diagnostic evidence, not an accepted runtime attestation.
