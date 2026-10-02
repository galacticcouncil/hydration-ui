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
      CREATE TABLE IF NOT EXISTS events (id INTEGER PRIMARY KEY AUTOINCREMENT, at TEXT NOT NULL, kind TEXT NOT NULL, severity TEXT NOT NULL, data TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS outbox (id INTEGER PRIMARY KEY REFERENCES events(id), attempts INTEGER NOT NULL DEFAULT 0, next_at INTEGER NOT NULL DEFAULT 0, delivered_at TEXT, error TEXT);
    `)
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
      .prepare("SELECT * FROM refs ORDER BY at DESC LIMIT 30")
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
        "SELECT e.*,o.attempts FROM outbox o JOIN events e ON e.id=o.id WHERE o.delivered_at IS NULL AND o.next_at<=? ORDER BY o.id LIMIT 5",
      )
      .all(now)
      .map((e) => ({ ...e, data: JSON.parse(e.data) }))
  }
  delivered(id) {
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
  notifications() {
    return this.db
      .prepare(
        "SELECT COUNT(*) AS pending, MAX(attempts) AS maxAttempts, MIN(next_at) AS nextAttempt FROM outbox WHERE delivered_at IS NULL",
      )
      .get()
  }
  prune(days) {
    const before = new Date(Date.now() - days * 86400000).toISOString()
    this.db
      .prepare(
        "DELETE FROM outbox WHERE id IN (SELECT id FROM events WHERE at<?) AND delivered_at IS NOT NULL",
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
