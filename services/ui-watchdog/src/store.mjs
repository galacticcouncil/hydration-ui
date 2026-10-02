import { DatabaseSync } from "node:sqlite"
import { mkdirSync } from "node:fs"
import path from "node:path"
import { timestamp } from "./util.mjs"

export class Store {
  constructor(directory) {
    mkdirSync(directory, { recursive: true, mode: 0o700 })
    this.db = new DatabaseSync(path.join(directory, "watchdog.sqlite"))
    this.db.exec(`PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL;
      CREATE TABLE IF NOT EXISTS kv (key TEXT PRIMARY KEY, value TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS refs (sha TEXT PRIMARY KEY, manifest TEXT NOT NULL, proof TEXT NOT NULL, at TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS evidence (hash TEXT PRIMARY KEY, at TEXT NOT NULL, data TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS pending_evidence (sha TEXT NOT NULL, observer TEXT NOT NULL, path TEXT NOT NULL, hash TEXT NOT NULL, size INTEGER NOT NULL, PRIMARY KEY(sha,observer,path,hash));
      CREATE TABLE IF NOT EXISTS events (id INTEGER PRIMARY KEY AUTOINCREMENT, at TEXT NOT NULL, kind TEXT NOT NULL, severity TEXT NOT NULL, data TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS outbox (id INTEGER PRIMARY KEY REFERENCES events(id), attempts INTEGER NOT NULL DEFAULT 0, next_at INTEGER NOT NULL DEFAULT 0, delivered_at TEXT, error TEXT);
    `)
    if (
      !this.db
        .prepare("PRAGMA table_info(outbox)")
        .all()
        .some((c) => c.name === "failed_at")
    )
      this.db.exec("ALTER TABLE outbox ADD COLUMN failed_at TEXT")
  }
  get(key, fallback = null) {
    const r = this.db.prepare("SELECT value FROM kv WHERE key=?").get(key)
    return r ? JSON.parse(r.value) : fallback
  }
  set(key, value) {
    this.db
      .prepare("INSERT OR REPLACE INTO kv VALUES (?,?)")
      .run(key, JSON.stringify(value))
  }
  references() {
    return this.db
      .prepare("SELECT * FROM refs ORDER BY at DESC")
      .all()
      .map((r) => ({ ...JSON.parse(r.manifest), proof: JSON.parse(r.proof) }))
  }
  referenceShas() {
    return this.db
      .prepare("SELECT sha FROM refs")
      .all()
      .map((r) => r.sha)
  }
  addReference(m, proof) {
    this.db
      .prepare("INSERT OR REPLACE INTO refs VALUES (?,?,?,?)")
      .run(
        m.sha,
        JSON.stringify(m),
        JSON.stringify(proof),
        proof.createdAt || timestamp(),
      )
  }
  evidence(hash) {
    const row = this.db
      .prepare("SELECT data FROM evidence WHERE hash=?")
      .get(hash)
    return row ? JSON.parse(row.data) : null
  }
  saveEvidence(samples) {
    for (const sample of (samples || []).slice(0, 32)) {
      this.db
        .prepare("INSERT OR IGNORE INTO evidence VALUES(?,?,?)")
        .run(sample.sha256, timestamp(), JSON.stringify(sample))
    }
    // At most 512 capped bodies (~45 MiB); metadata pending verification is separate.
    this.db.exec(
      "DELETE FROM evidence WHERE hash NOT IN (SELECT hash FROM evidence ORDER BY at DESC LIMIT 512)",
    )
  }
  retainPending(sha, observer, result) {
    if (!sha) return
    const samples = [
      ...Object.entries(
        result.matchedSha && result.matchedSha !== sha
          ? {}
          : result.observed || {},
      ).map(([path, f]) => ({ path, ...f })),
      ...(result.documents || [])
        .filter((d) => !d.matchedSha)
        .map((d) => ({ path: "/index.html", size: 0, ...d })),
      ...(result.responses || []).filter(
        (f) => !f.referenceSha || f.referenceSha === sha,
      ),
    ]
    const insert = this.db.prepare(
      "INSERT OR IGNORE INTO pending_evidence VALUES(?,?,?,?,?)",
    )
    for (const f of samples)
      insert.run(sha, observer, f.path, f.sha256, f.size || 0)
    const count = this.db
      .prepare("SELECT COUNT(*) AS n FROM pending_evidence")
      .get().n
    if (count > 20000) {
      this.set("evidenceOverflow", true)
      this.db.exec(
        "DELETE FROM pending_evidence WHERE rowid NOT IN (SELECT rowid FROM pending_evidence ORDER BY rowid LIMIT 20000)",
      )
    }
  }
  resolvePending(references) {
    const findings = []
    for (const ref of references) {
      const rows = this.db
        .prepare("SELECT * FROM pending_evidence WHERE sha=?")
        .all(ref.sha)
      for (const f of rows)
        if (ref.files[f.path]?.sha256 !== f.hash)
          findings.push({
            kind: "hash-mismatch",
            observer: f.observer,
            path: f.path,
            actual: f.hash,
            referenceSha: ref.sha,
            retrospective: true,
          })
      this.db.prepare("DELETE FROM pending_evidence WHERE sha=?").run(ref.sha)
    }
    if (findings.length)
      this.set(
        "retrospectiveIssues",
        [...this.get("retrospectiveIssues", []), ...findings].slice(0, 100),
      )
    return findings
  }
  event(kind, severity, data, notify = true) {
    this.db.exec("BEGIN IMMEDIATE")
    try {
      const r = this.db
        .prepare("INSERT INTO events(at,kind,severity,data) VALUES(?,?,?,?)")
        .run(timestamp(), kind, severity, JSON.stringify(data))
      if (notify)
        this.db
          .prepare("INSERT INTO outbox(id) VALUES(?)")
          .run(r.lastInsertRowid)
      this.db.exec("COMMIT")
      return Number(r.lastInsertRowid)
    } catch (e) {
      this.db.exec("ROLLBACK")
      throw e
    }
  }
  events(limit = 100) {
    return this.db
      .prepare("SELECT * FROM events ORDER BY id DESC LIMIT ?")
      .all(limit)
      .map((e) => ({ ...e, data: JSON.parse(e.data) }))
  }
  pending(now = Date.now()) {
    return this.db
      .prepare(
        "SELECT e.*,o.attempts FROM outbox o JOIN events e ON e.id=o.id WHERE o.delivered_at IS NULL AND o.failed_at IS NULL AND o.next_at<=? ORDER BY CASE e.severity WHEN 'critical' THEN 0 WHEN 'error' THEN 1 ELSE 2 END, o.id LIMIT 5",
      )
      .all(now)
      .map((e) => ({ ...e, data: JSON.parse(e.data) }))
  }
  delivered(id) {
    this.set("deliveryFailure", null)
    this.db
      .prepare("UPDATE outbox SET delivered_at=?,error=NULL WHERE id=?")
      .run(timestamp(), id)
  }
  retry(id, nextAt, error) {
    this.db
      .prepare(
        "UPDATE outbox SET attempts=attempts+1,next_at=?,error=? WHERE id=?",
      )
      .run(nextAt, error, id)
  }
  failed(id, error) {
    this.db
      .prepare("UPDATE outbox SET failed_at=?, error=? WHERE id=?")
      .run(timestamp(), error, id)
    this.set("deliveryFailure", { at: timestamp(), error })
  }
  notifications() {
    return this.db
      .prepare(
        "SELECT COUNT(*) AS pending, MAX(attempts) AS maxAttempts, MIN(next_at) AS nextAttempt FROM outbox WHERE delivered_at IS NULL AND failed_at IS NULL",
      )
      .get()
  }
  prune(days) {
    this.db
      .exec(`UPDATE outbox SET failed_at=datetime('now'), error='Outbox capacity exceeded'
      WHERE delivered_at IS NULL AND failed_at IS NULL AND id NOT IN (
        SELECT o.id FROM outbox o JOIN events e ON e.id=o.id
        WHERE o.delivered_at IS NULL AND o.failed_at IS NULL
        ORDER BY CASE e.severity WHEN 'critical' THEN 0 ELSE 1 END, o.id DESC LIMIT 1000)`)

    const before = new Date(Date.now() - days * 86400000).toISOString()
    this.db
      .prepare(
        "DELETE FROM outbox WHERE id IN (SELECT id FROM events WHERE at<?) AND (delivered_at IS NOT NULL OR failed_at IS NOT NULL)",
      )
      .run(before)
    this.db
      .prepare(
        "DELETE FROM events WHERE at<? AND id NOT IN (SELECT id FROM outbox)",
      )
      .run(before)
  }
  close() {
    this.db.close()
  }
}
