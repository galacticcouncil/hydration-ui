// Round 2: a retrospective mismatch is erased unposted while an incident is
// open. When a reference lands, main.mjs:171-174 resolvePending() deletes the
// pending rows (store.mjs:120) and parks the findings in kv retrospectiveIssues;
// the tick is integrity_alert, but shouldNotify (policy.mjs:87-93) is false
// while the stored notice is integrity_alert, and main.mjs:281-282 then clears
// the list. Black-box test of src/main.mjs; fails at e29022890 + fix-n1 by design.
import test from "node:test"
import assert from "node:assert/strict"
import { spawn } from "node:child_process"
import { createServer } from "node:http"
import { createServer as createNetServer } from "node:net"
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { DatabaseSync } from "node:sqlite"
import { setTimeout as sleep } from "node:timers/promises"
import { fileURLToPath } from "node:url"
import { Store } from "../src/store.mjs"
import { refA, refB, shaA, shaB } from "./review-fixtures.mjs"

const service = fileURLToPath(new URL("..", import.meta.url))
const hook = fileURLToPath(
  new URL("./fixtures/fake-github-hook.mjs", import.meta.url),
)
const rootA = refA.files["/index.html"].sha256,
  rootB = refB.files["/index.html"].sha256,
  // Injected document served once on a sampled route before B was attested.
  FAKE = "f".repeat(64)

async function freePort() {
  const s = createNetServer()
  await new Promise((r) => s.listen(0, "127.0.0.1", r))
  const { port } = s.address()
  await new Promise((r) => s.close(r))
  return port
}

// /observe results per phase. Only quick probes carry the injected document;
// one document per result keeps the release sequence from flapping.
function observation(phase, body) {
  const root = ["trusted-a", "straddle"].includes(phase) ? rootA : rootB
  const ref = root === rootA ? refA : refB
  const result = {
    rootHash: root,
    matchedSha: body.trustedRoots?.[root] || null,
    full: Boolean(body.full),
    issues: [],
    observed: { "/index.html": ref.files["/index.html"] },
  }
  if (phase === "straddle")
    // Old chunk path answered by the next release during the rollout.
    result.issues.push({
      kind: "hash-mismatch",
      path: "/assets/index-aaaa1111.js",
      expected: refA.files["/assets/index-aaaa1111.js"].sha256,
      actual: "e".repeat(64),
      referenceSha: shaA,
    })
  if (phase === "pending") {
    result.documents = [{ path: "/submit-transaction", sha256: FAKE }]
    result.issues.push({
      kind: "hash-mismatch",
      path: "/index.html",
      actual: FAKE,
      untrustedHtml: true,
    })
  }
  if (phase === "clean") result.documents = [{ path: "/", sha256: rootB }]
  return result
}

async function worker(t, view) {
  const server = createServer(async (req, res) => {
    let raw = ""
    for await (const chunk of req) raw += chunk
    const body = JSON.parse(raw)
    const now = new Date().toISOString()
    let result
    if (req.url === "/probe")
      result = {
        rootHash: body.rootHash,
        matchedSha: body.reference?.sha || null,
        issues: [],
      }
    else {
      const phase = view.phase === "pending" && body.full ? "clean" : view.phase
      if (phase === "clean" && !body.full) view.cleanQuick++
      result = observation(phase, body)
    }
    Object.assign(result, {
      at: now,
      completedAt: now,
      egress: { ip: "8.8.8.8", tor: false, kind: "direct", checkedAt: now },
    })
    res.writeHead(200, { "content-type": "application/json" })
    res.end(JSON.stringify({ observerId: "direct", kind: "direct", result }))
  })
  await new Promise((r) => server.listen(0, "127.0.0.1", r))
  t.after(() => {
    server.closeAllConnections()
    server.close()
  })
  return `http://127.0.0.1:${server.address().port}`
}

async function watchdog(t, name, workerUrl) {
  const dir = mkdtempSync(join(tmpdir(), `watchdog-retro-${name}-`))
  const control = join(dir, "github.json"),
    calls = join(dir, "references.log"),
    database = join(dir, "watchdog.sqlite")
  const setControl = (value) => {
    writeFileSync(`${control}.tmp`, JSON.stringify(value))
    renameSync(`${control}.tmp`, control)
  }
  setControl({ head: shaB, references: [refA] })
  // A is attested and live for an hour; production has just moved to B.
  const store = new Store(dir)
  store.addReference(refA, {
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  })
  store.set("source", { sha: shaA, firstSeen: Date.now() - 3600000 })
  store.close()

  const env = {
    ...process.env,
    ROLE: "watchdog",
    DATA_DIR: dir,
    PORT: String(await freePort()),
    GITHUB_TOKEN: "test",
    OBSERVERS_JSON: JSON.stringify([
      { id: "direct", kind: "direct", url: workerUrl },
    ]),
    MIN_DISTINCT_EGRESS: "1",
    POLL_SECONDS: "10",
    FULL_AUDIT_SECONDS: "30",
    BROWSER_SECONDS: "30",
    FAKE_GITHUB_CONTROL: control,
    FAKE_GITHUB_CALLS: calls,
  }
  for (const key of [
    "DISCORD_WEBHOOK_URL",
    "DISCORD_WEBHOOK_URL_FILE",
    "HEARTBEAT_URL",
    "HEARTBEAT_URL_FILE",
    "GITHUB_TOKEN_FILE",
    "DASHBOARD_TOKEN",
    "MULTI_NETWORK",
    "OBSERVER_TOKEN_DIRECT",
    "NODE_TEST_CONTEXT",
  ])
    delete env[key]
  const child = spawn(process.execPath, ["--import", hook, "src/main.mjs"], {
    cwd: service,
    env,
    stdio: ["ignore", "pipe", "pipe"],
  })
  let output = "",
    exited = null
  for (const stream of [child.stdout, child.stderr])
    stream.on("data", (d) => (output = (output + d).slice(-4000)))
  const done = new Promise((r) =>
    child.on("exit", (code, signal) => r((exited = { code, signal }))),
  )
  t.after(async () => {
    if (!exited) {
      child.kill("SIGTERM")
      const timer = setTimeout(() => child.kill("SIGKILL"), 8000)
      await done
      clearTimeout(timer)
    }
    rmSync(dir, { recursive: true, force: true })
  })

  const tail = () => `\n--- ${name} watchdog output ---\n${output.slice(-1500)}`
  const query = (sql, ...args) => {
    if (exited)
      throw new Error(
        `Harness: ${name} watchdog exited (${JSON.stringify(exited)})${tail()}`,
      )
    let db
    try {
      db = new DatabaseSync(database, { readOnly: true })
      return db.prepare(sql).all(...args)
    } catch {
      return [] // busy or not yet in WAL mode; poll again
    } finally {
      db?.close()
    }
  }
  return {
    setControl,
    tail,
    query,
    events: () =>
      query("SELECT * FROM events ORDER BY id").map((e) => ({
        ...e,
        data: JSON.parse(e.data),
      })),
    calls: () =>
      existsSync(calls) ? readFileSync(calls, "utf8").split("\n") : [],
    async waitFor(what, ready, ms) {
      for (const end = Date.now() + ms; Date.now() < end; await sleep(500))
        if (ready()) return
      throw new Error(`Harness: no ${what} within ${ms / 1000} s${tail()}`)
    },
  }
}

// Production moves A -> B; the injected document is served once while B's
// reference is building, then live content is clean again before B lands.
async function release(t, name, { straddle }) {
  const view = { phase: straddle ? "straddle" : "trusted-a", cleanQuick: 0 }
  const w = await watchdog(t, name, await worker(t, view))
  await w.waitFor(
    "production_changed event for B",
    () =>
      w
        .events()
        .some((e) => e.kind === "production_changed" && e.data.sha === shaB),
    60000,
  )
  await w.waitFor(
    "reference discovery for B",
    () => w.calls().includes(shaB),
    60000,
  )
  if (straddle)
    await w.waitFor(
      "critical straddle event",
      () => w.events().some((e) => e.severity === "critical"),
      60000,
    )
  view.phase = "pending"
  await w.waitFor(
    "retained row for the injected document",
    () =>
      w.query(
        "SELECT 1 FROM pending_evidence WHERE sha=? AND hash=?",
        shaB,
        FAKE,
      ).length,
    40000,
  )
  view.phase = "clean"
  const served = view.cleanQuick
  await w.waitFor("clean probe", () => view.cleanQuick > served, 30000)
  await sleep(1000)
  const mark = Math.max(0, ...w.events().map((e) => e.id))
  w.setControl({ head: shaB, references: [refA, refB] })
  await w.waitFor(
    "attested reference for B",
    () => w.query("SELECT 1 FROM refs WHERE sha=?", shaB).length,
    50000,
  )
  await sleep(20000)
  const after = w.events().filter((e) => e.id > mark)
  return {
    reported: after.some(
      (e) => e.severity === "critical" && JSON.stringify(e.data).includes(FAKE),
    ),
    after: after.map((e) => `${e.kind}/${e.severity}`),
    tail: w.tail(),
  }
}

test(
  "a retrospective mismatch found while an incident is open is still reported",
  { timeout: 150000 },
  async (t) => {
    const [control, incident] = await Promise.all([
      release(t, "control", { straddle: false }),
      release(t, "incident", { straddle: true }),
    ])
    assert.ok(
      control.reported,
      `Control (no open incident): the retroactive check raised no critical event for the injected document, so this harness proves nothing. Events after B landed: ${control.after.join(", ") || "none"}${control.tail}`,
    )
    assert.ok(
      incident.reported,
      `The retroactive check found a mismatch (an injected document served before B was attested) while an incident was open, and it was discarded without any event; its pending evidence is already deleted. Events after B landed: ${incident.after.join(", ") || "none"}`,
    )
  },
)
