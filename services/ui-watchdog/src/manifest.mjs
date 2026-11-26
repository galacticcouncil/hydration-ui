import { lstat, readFile, readdir } from "node:fs/promises"
import path from "node:path"
import { sha256 } from "./util.mjs"

export function validateManifest(m, { repo, branch, sha } = {}) {
  if (
    m?.version !== 1 ||
    !/^[a-f0-9]{40}$/.test(m.sha) ||
    m.reproducible !== true ||
    typeof m.files !== "object" ||
    !m.files
  )
    throw new Error("Invalid reference manifest")
  if (
    (repo && m.repo !== repo) ||
    (branch && m.branch !== branch) ||
    (sha && m.sha !== sha)
  )
    throw new Error("Reference source does not match policy")
  const entries = Object.entries(m.files)
  if (!m.files["/index.html"] || entries.length > 20000 || entries.length < 2)
    throw new Error("Invalid reference file inventory")
  for (const [name, f] of entries) {
    if (
      !/^\/(?!\/)/.test(name) ||
      /[\\%?#\x00-\x20]/.test(name) ||
      name.split("/").some((p) => p === "." || p === "..") ||
      !/^[a-f0-9]{64}$/.test(f?.sha256) ||
      !Number.isSafeInteger(f.size) ||
      f.size < 0 ||
      f.size > 32 * 1024 * 1024
    )
      throw new Error("Unsafe reference file entry")
  }
  return m
}

export async function inventory(directory) {
  const files = Object.create(null)
  async function walk(rel = "") {
    for (const name of (await readdir(path.join(directory, rel))).sort()) {
      const next = path.posix.join(rel, name)
      const disk = path.join(directory, next)
      const stat = await lstat(disk)
      if (stat.isSymbolicLink())
        throw new Error("Build output contains a symlink")
      if (stat.isDirectory()) await walk(next)
      else if (stat.isFile()) {
        const bytes = await readFile(disk)
        files[`/${next}`] = { sha256: sha256(bytes), size: bytes.length }
      } else throw new Error("Build output contains a special file")
    }
  }
  await walk()
  return Object.fromEntries(
    Object.entries(files).sort(([a], [b]) => a.localeCompare(b, "en")),
  )
}

export function compareInventories(a, b) {
  return [...new Set([...Object.keys(a), ...Object.keys(b)])]
    .sort()
    .filter((p) => a[p]?.sha256 !== b[p]?.sha256 || a[p]?.size !== b[p]?.size)
}
