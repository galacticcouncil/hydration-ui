const fs = require("node:fs")
const path = require("node:path")

function validate(outputDir, acceptance) {
  const errors = []
  const cases = []
  const expected = new Set([
    "baseline",
    "all-external-reject",
    "all-external-hang",
    "metadata-malformed",
    "metadata-hang",
    "warm-all-external-hang",
    "neckwork-malformed-stats",
  ])
  for (const folder of ["browser-verified", "browser-additional"]) {
    const results = JSON.parse(
      fs.readFileSync(
        path.join(outputDir, folder, "browser-results.json"),
        "utf8",
      ),
    )
    for (const row of results) {
      if (!expected.delete(row.name))
        errors.push(`Unexpected or duplicate scenario: ${row.name}`)
      const healthyRpc = Object.values(row.websocketTraffic).some(
        (traffic) =>
          traffic.successfulStateCalls > 0 ||
          traffic.successfulChainHeadCalls > 0,
      )
      const quote = Number(row.quoteInputValues?.[1])
      const nativeQuote =
        row.inputEditable &&
        row.quoteInputValues?.[0] === "1" &&
        Number.isFinite(quote) &&
        quote > 0
      if (row.harnessError || row.screenshotError || !healthyRpc) {
        errors.push(
          `${row.name}: invalid observation (harness/screenshot error or no responsive Hydration RPC)`,
        )
      }
      if (row.name === "baseline" && (!nativeQuote || row.pageErrors.length)) {
        errors.push(
          "baseline: a working native quote without page errors is required",
        )
      }
      if (acceptance) {
        if (row.name === "neckwork-malformed-stats") {
          if (
            row.pageErrors.length ||
            !row.liquidityPoolLinks ||
            /Something went wrong|BigError/.test(row.bodyText || "")
          ) {
            errors.push(
              `${row.name}: malformed optional statistics disabled the liquidity route`,
            )
          }
        } else if (!nativeQuote || row.pageErrors.length) {
          errors.push(
            `${row.name}: native quoting must survive the injected optional-service outage`,
          )
        }
      }
      cases.push({ name: row.name, healthyRpc, nativeQuote: !!nativeQuote })
    }
  }
  if (expected.size)
    errors.push(`Missing scenarios: ${[...expected].join(", ")}`)
  if (cases.length !== 7)
    errors.push(
      `Expected all seven browser scenarios; observed ${cases.length}`,
    )
  return { acceptance, cases, errors }
}

module.exports = { validate }
