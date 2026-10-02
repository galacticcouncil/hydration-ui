import { execFile } from "node:child_process"
import { promisify } from "node:util"
import { mkdtemp, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import { unzipSync } from "fflate"
import { validateManifest } from "./manifest.mjs"
import { request, sha256, timestamp } from "./util.mjs"

const exec = promisify(execFile)

export function verificationArgs(c, file, bundle, sha) {
  return [
    "attestation",
    "verify",
    file,
    "--bundle",
    bundle,
    "--repo",
    c.repo,
    "--signer-workflow",
    `${c.repo}/.github/workflows/${c.workflow}`,
    "--source-ref",
    `refs/heads/${c.branch}`,
    "--source-digest",
    sha,
    "--deny-self-hosted-runners",
    "--format",
    "json",
  ]
}

export function unpackReference(bytes) {
  let rejected = false,
    count = 0
  const files = unzipSync(bytes, {
    filter: (f) => {
      count++
      const ok =
        ["reference.json", "reference.sigstore.json"].includes(f.name) &&
        f.originalSize <= 8 * 1024 * 1024
      if (!ok || count > 2) rejected = true
      return ok && count <= 2
    },
  })
  if (
    rejected ||
    count !== 2 ||
    !files["reference.json"] ||
    !files["reference.sigstore.json"]
  )
    throw new Error("Unexpected reference archive contents")
  return files
}

export class GitHub {
  constructor(c) {
    this.c = c
    this.cache = new Map()
  }
  async api(suffix, { etag = false } = {}) {
    const key = `/repos/${this.c.repo}${suffix}`
    const cached = this.cache.get(key)
    const r = await request(`https://api.github.com${key}`, {
      timeoutMs: this.c.timeoutMs,
      maxBytes: 8 * 1024 * 1024,
      headers: {
        accept: "application/vnd.github+json",
        "user-agent": "Hydration-UI-Watchdog",
        "x-github-api-version": "2022-11-28",
        ...(this.c.token ? { authorization: `Bearer ${this.c.token}` } : {}),
        ...(etag && cached?.etag ? { "if-none-match": cached.etag } : {}),
      },
    })
    if (r.status === 304 && cached) return cached.value
    if (r.status !== 200)
      throw new Error(
        `GitHub ${suffix.split("?")[0]} returned HTTP ${r.status}`,
      )
    const value = JSON.parse(r.bytes)
    if (etag) this.cache.set(key, { etag: r.headers.get("etag"), value })
    return value
  }
  async head() {
    const r = await this.api(
      `/git/ref/heads/${encodeURIComponent(this.c.branch)}`,
      { etag: true },
    )
    if (!/^[a-f0-9]{40}$/.test(r.object?.sha) || r.object.type !== "commit")
      throw new Error("Invalid production ref")
    return r.object.sha
  }
  async compare(from, to) {
    if (!/^[a-f0-9]{40}$/.test(from) || !/^[a-f0-9]{40}$/.test(to)) return null
    const r = await this.api(`/compare/${from}...${to}?per_page=100`)
    const pullRequests = [
      ...new Set(
        (r.commits || []).flatMap((x) => {
          const title = x.commit.message.split("\n")[0]
          const match = title.match(/Merge pull request #(\d+)|\(#(\d+)\)$/)
          return match ? [Number(match[1] || match[2])] : []
        }),
      ),
    ].map((number) => ({
      number,
      url: `https://github.com/${this.c.repo}/pull/${number}`,
    }))
    return {
      url: `https://github.com/${this.c.repo}/compare/${from}...${to}`,
      status: r.status,
      ahead: r.ahead_by,
      behind: r.behind_by,
      totalCommits: r.total_commits,
      pullRequests,
      commits: (r.commits || []).slice(0, 100).map((x) => ({
        sha: x.sha,
        message: x.commit.message.split("\n")[0].slice(0, 300),
        url: `https://github.com/${this.c.repo}/commit/${x.sha}`,
      })),
      files: (r.files || []).map((x) => ({
        path: x.filename,
        status: x.status,
      })),
      truncated: r.total_commits > 100 || (r.files || []).length === 300,
    }
  }
  async download(id) {
    if (!Number.isSafeInteger(id)) throw new Error("Invalid artifact id")
    const r = await request(
      `https://api.github.com/repos/${this.c.repo}/actions/artifacts/${id}/zip`,
      {
        timeoutMs: this.c.timeoutMs,
        maxBytes: 1024,
        headers: {
          authorization: `Bearer ${this.c.token}`,
          "user-agent": "Hydration-UI-Watchdog",
          accept: "application/vnd.github+json",
        },
      },
    )
    if (r.status !== 302)
      throw new Error(`Artifact download returned HTTP ${r.status}`)
    const location = new URL(r.headers.get("location"))
    if (
      location.protocol !== "https:" ||
      location.username ||
      location.password
    )
      throw new Error("Unsafe artifact redirect")
    // Deliberately do not forward the GitHub Authorization header to storage.
    const zip = await request(location, {
      timeoutMs: 60000,
      maxBytes: 8 * 1024 * 1024,
    })
    if (zip.status !== 200)
      throw new Error(`Artifact storage returned HTTP ${zip.status}`)
    return zip.bytes
  }
  async references(store, expectedSha) {
    if (!this.c.token)
      return {
        state: "unconfigured",
        message: "Set GITHUB_TOKEN with Actions and Contents read access",
      }
    const known = new Set(store.referenceShas())
    let added = 0
    // Reconcile recent successful runs, including intermediate releases missed while offline.
    // Bound backfill; expose the limit rather than claiming unlimited history coverage.
    for (let page = 1; page <= 3; page++) {
      const data = await this.api(
        `/actions/workflows/${this.c.workflow}/runs?branch=${encodeURIComponent(this.c.branch)}&status=success&per_page=30&page=${page}`,
      )
      const runs = data.workflow_runs || []
      for (const run of runs) {
        if (
          !["push", "workflow_dispatch"].includes(run.event) ||
          run.head_branch !== this.c.branch ||
          run.head_repository?.full_name !== this.c.repo ||
          run.path !== `.github/workflows/${this.c.workflow}` ||
          !/^[a-f0-9]{40}$/.test(run.head_sha)
        )
          continue
        if (known.has(run.head_sha)) continue
        const { artifacts = [] } = await this.api(
          `/actions/runs/${run.id}/artifacts?per_page=100`,
        )
        const artifact = artifacts.find(
          (a) => a.name === `ui-reference-${run.head_sha}` && !a.expired,
        )
        if (!artifact) continue
        const files = unpackReference(await this.download(artifact.id))
        const raw = Buffer.from(files["reference.json"])
        const manifest = validateManifest(JSON.parse(raw), {
          ...this.c,
          sha: run.head_sha,
        })
        const temp = await mkdtemp(path.join(tmpdir(), "ui-reference-"))
        try {
          const file = path.join(temp, "reference.json"),
            bundle = path.join(temp, "reference.sigstore.json")
          await writeFile(file, raw)
          await writeFile(bundle, files["reference.sigstore.json"])
          try {
            await exec(
              "gh",
              verificationArgs(this.c, file, bundle, run.head_sha),
              {
                timeout: 90000,
                maxBuffer: 8 * 1024 * 1024,
                env: {
                  PATH: process.env.PATH,
                  GH_TOKEN: this.c.token,
                  GH_PROMPT_DISABLED: "1",
                  GH_NO_UPDATE_NOTIFIER: "1",
                  XDG_CACHE_HOME: "/tmp/ui-watchdog-cache",
                  GH_CONFIG_DIR: "/tmp/ui-watchdog-gh",
                },
              },
            )
          } catch {
            throw new Error(
              "Reference attestation failed signature or identity verification",
            )
          }
          store.addReference(manifest, {
            runId: run.id,
            artifactId: artifact.id,
            manifestHash: sha256(raw),
            verifiedAt: timestamp(),
            createdAt: run.created_at,
          })
          known.add(manifest.sha)
          added++
        } finally {
          await rm(temp, { recursive: true, force: true })
        }
      }
      if (runs.length < 30) break
    }
    return {
      state: known.has(expectedSha) ? "ready" : "waiting",
      message: known.has(expectedSha)
        ? ""
        : "Waiting for an attested reference for the production commit",
      added,
      backfillLimit: 90,
      checkedAt: timestamp(),
    }
  }
}
