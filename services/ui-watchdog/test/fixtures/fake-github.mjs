// Stand-in for src/github.mjs, driven by a JSON control file
// (FAKE_GITHUB_CONTROL): { head: "<sha>", references: [manifest, ...] }.
// Every references() call appends its expected sha to FAKE_GITHUB_CALLS.
import { appendFileSync, readFileSync } from "node:fs"

const control = () =>
  JSON.parse(readFileSync(process.env.FAKE_GITHUB_CONTROL, "utf8"))

export class GitHub {
  constructor(c) {
    this.c = c
  }
  async head() {
    return control().head
  }
  async compare() {
    return null
  }
  async references(store, expectedSha, onStatus = () => {}) {
    if (process.env.FAKE_GITHUB_CALLS)
      appendFileSync(process.env.FAKE_GITHUB_CALLS, `${expectedSha}\n`)
    const known = new Set(store.referenceShas())
    let added = 0
    for (const m of control().references)
      if (!known.has(m.sha)) {
        store.addReference(m, { createdAt: new Date().toISOString() })
        known.add(m.sha)
        added++
      }
    const state = known.has(expectedSha) ? "ready" : "building"
    onStatus({ state, sha: expectedSha })
    return {
      state,
      sha: expectedSha,
      added,
      checkedAt: new Date().toISOString(),
    }
  }
}
