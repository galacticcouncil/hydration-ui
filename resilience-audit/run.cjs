#!/usr/bin/env node
const fs = require("node:fs")
const path = require("node:path")
const { spawnSync, execFileSync } = require("node:child_process")
const { createHash } = require("node:crypto")

const args = process.argv.slice(2)
if (args.some((arg) => !["--browser", "--acceptance"].includes(arg))) {
  throw new Error(
    "Usage: node resilience-audit/run.cjs [--browser [--acceptance]]",
  )
}
if (args.includes("--acceptance") && !args.includes("--browser")) {
  throw new Error(
    "--acceptance requires --browser; function tests characterize existing failures",
  )
}
process.env.AUDIT_OUTPUT_DIR ||= path.join(
  __dirname,
  "results",
  new Date().toISOString().replaceAll(":", "-"),
)
const { root, outputDir, checkoutHead } = require("./output.cjs")
const browser = args.includes("--browser")
const scripts = browser
  ? ["browser-faults.cjs", "browser-additional.cjs"]
  : [
      "metadata-faults.cjs",
      "dependency-faults.cjs",
      "oneclick-faults.mjs",
      "deep-startup-faults.cjs",
      "deep-crosschain-faults.cjs",
      "deep-data-faults.cjs",
      "wait-faults.cjs",
    ]
if (browser && (process.env.AUDIT_LABEL || process.env.AUDIT_SCENARIOS)) {
  throw new Error(
    "Run an individual browser script for custom AUDIT_LABEL/AUDIT_SCENARIOS",
  )
}
const report = {
  createdAt: new Date().toISOString(),
  checkout: checkoutHead(),
  historicalAuditBase: "19f54bf5bde252a407e23e7ce3e4a8f6e3992182",
  node: process.version,
  lockSha256: createHash("sha256")
    .update(fs.readFileSync(path.join(root, "yarn.lock")))
    .digest("hex"),
  mode: browser
    ? args.includes("--acceptance")
      ? "anonymous native-flow acceptance subset"
      : "browser evidence collection with validity checks"
    : "characterization of audited behaviors, including known failures",
  outputDir,
  scripts: [],
}
const reference = JSON.parse(
  fs.readFileSync(path.join(__dirname, "dependencies.json"), "utf8"),
)
report.installedPackages = {}
for (const name of Object.keys(reference.snapshot.packages)) {
  const file = path.join(root, "node_modules", name, "package.json")
  if (fs.existsSync(file))
    report.installedPackages[name] = JSON.parse(
      fs.readFileSync(file, "utf8"),
    ).version
}
report.trackedWorkingChanges = execFileSync(
  "git",
  ["status", "--porcelain", "--untracked-files=no"],
  {
    cwd: root,
    encoding: "utf8",
  },
).trim()
report.sourceSha256 = {}
for (const entry of reference.dependencies.flatMap(
  (dependency) => dependency.evidence,
)) {
  if (!/^(apps|packages)\//.test(entry.path)) continue
  const file = path.join(root, entry.path)
  if (fs.existsSync(file) && fs.statSync(file).isFile()) {
    report.sourceSha256[entry.path] = createHash("sha256")
      .update(fs.readFileSync(file))
      .digest("hex")
  }
}
for (const script of scripts) {
  console.log(`Running ${script}; output: ${outputDir}`)
  const result = spawnSync(process.execPath, [path.join(__dirname, script)], {
    cwd: root,
    env: process.env,
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
  })
  fs.writeFileSync(
    path.join(outputDir, script + ".log"),
    (result.stdout || "") + (result.stderr || ""),
  )
  const entry = { script, exitCode: result.status, signal: result.signal }
  if (result.error) entry.error = result.error.message
  report.scripts.push(entry)
  if (result.status !== 0) {
    console.error(result.stderr || result.error || `${script} failed`)
    process.exitCode = 1
    break
  }
}
if (browser && !process.exitCode) {
  const { validate } = require("./validate-browser.cjs")
  report.browserValidation = validate(outputDir, args.includes("--acceptance"))
  if (report.browserValidation.errors.length) process.exitCode = 1
}
fs.writeFileSync(
  path.join(outputDir, "run.json"),
  JSON.stringify(report, null, 2) + "\n",
)
console.log(`Saved ${path.join(outputDir, "run.json")}`)
if (report.browserValidation?.errors.length) {
  console.error(report.browserValidation.errors.join("\n"))
}
if (!browser && !process.exitCode) {
  console.log(
    "Audited behaviors reproduced. This does not establish resilience compliance.",
  )
}
