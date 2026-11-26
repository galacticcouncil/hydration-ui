// review §11: unresolvable pending evidence overflowed and muted every alert for good
import test from "node:test"
import assert from "node:assert/strict"
import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import { Store } from "../src/store.mjs"

const shas = ["1", "2", "3", "4", "5"].map((c) => c.repeat(40))
const hash = (n) => n.toString(16).padStart(64, "0")
const observed = (n, offset = 0) =>
  Object.fromEntries(
    Array.from({ length: n }, (_, i) => [
      `/assets/${offset + i}.js`,
      { sha256: hash(offset + i), size: 1 },
    ]),
  )

async function store(t) {
  const dir = await mkdtemp(path.join(tmpdir(), "watchdog-pending-"))
  const s = new Store(dir)
  t.after(async () => {
    s.close()
    await rm(dir, { recursive: true, force: true })
  })
  return s
}

const rowsFor = (s, sha) =>
  s.db
    .prepare("SELECT COUNT(*) AS n FROM pending_evidence WHERE sha=?")
    .get(sha).n

test("pending evidence is kept only for the last three production commits", async (t) => {
  const s = await store(t)
  for (const sha of shas.slice(0, 4)) {
    s.trimPending(sha)
    s.retainPending(sha, "direct", { observed: observed(5) })
  }
  assert.equal(rowsFor(s, shas[0]), 0, "the oldest commit is still retained")
  for (const sha of shas.slice(1, 4)) assert.equal(rowsFor(s, sha), 5)
  s.trimPending(shas[2])
  assert.equal(rowsFor(s, shas[1]), 5, "a repeated commit must not evict")
})

test("an evidence overflow alerts once and clears when old commits are trimmed", async (t) => {
  const s = await store(t)
  s.trimPending(shas[0])
  const insert = s.db.prepare("INSERT INTO pending_evidence VALUES(?,?,?,?,?)")
  s.db.exec("BEGIN")
  for (let i = 0; i < 20000; i++)
    insert.run(shas[0], "direct", `/f/${i}`, hash(i), 1)
  s.db.exec("COMMIT")
  s.retainPending(shas[0], "direct", { observed: observed(1, 20000) })
  assert.equal(s.get("evidenceOverflow"), true)
  assert.equal(s.pendingCount(), 20000)
  s.trimPending(shas[1])
  assert.equal(
    s.get("evidenceOverflow"),
    true,
    "the overflowing commit is still within the window",
  )
  s.trimPending(shas[2])
  s.trimPending(shas[3])
  assert.equal(s.pendingCount(), 0)
  assert.equal(
    s.get("evidenceOverflow"),
    false,
    "the overflow flag must clear once the table is below the cap",
  )
})

test("a restart trims evidence left by commits that were never tracked", async (t) => {
  const s = await store(t)
  for (const sha of shas)
    s.retainPending(sha, "tor-de", { observed: observed(3) })
  s.set("evidenceOverflow", true)
  s.trimPending(shas[4])
  assert.deepEqual(s.get("pendingShas"), [shas[4]])
  assert.equal(s.pendingCount(), 3)
  assert.equal(s.get("evidenceOverflow"), false)
})
