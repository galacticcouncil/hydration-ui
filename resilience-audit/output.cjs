const fs = require("node:fs")
const path = require("node:path")
const { execFileSync } = require("node:child_process")

const root = path.resolve(__dirname, "..")
const outputDir = process.env.AUDIT_OUTPUT_DIR
  ? path.resolve(process.env.AUDIT_OUTPUT_DIR)
  : path.join(__dirname, "results", "latest")
const evidenceDir = path.join(__dirname, "evidence")
if (outputDir === evidenceDir || outputDir.startsWith(evidenceDir + path.sep)) {
  throw new Error(
    "AUDIT_OUTPUT_DIR must preserve the historical evidence directory",
  )
}
fs.mkdirSync(outputDir, { recursive: true })

function checkoutHead() {
  return execFileSync("git", ["rev-parse", "HEAD"], {
    cwd: root,
    encoding: "utf8",
  }).trim()
}

module.exports = { root, outputDir, checkoutHead }
