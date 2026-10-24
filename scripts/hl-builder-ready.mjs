/**
 * Checks whether an address is eligible to collect Hyperliquid builder fees.
 *
 *   node scripts/hl-builder-ready.mjs 0x<address>
 *
 * Requires ≥100 USDC in the *perps* account (spot does not count) and the
 * "Manual / Standard" account type, which the API reports as `disabled`.
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/trading/builder-codes
 */
import { HttpTransport, InfoClient } from "@nktkas/hyperliquid"

const user = process.argv[2]

if (!user) {
  console.error("usage: node scripts/hl-builder-ready.mjs 0x<address>")
  process.exit(1)
}

const info = new InfoClient({ transport: new HttpTransport() })

const [perps, spot, abstraction] = await Promise.all([
  info.clearinghouseState({ user }),
  info.spotClearinghouseState({ user }),
  info.userAbstraction({ user }).catch((e) => `unavailable (${e.message})`),
])

const perpValue = Number(perps.marginSummary.accountValue)
const spotUsdc = spot.balances.find((b) => b.coin === "USDC")?.total ?? "0"
const modeOk = abstraction === "disabled" || abstraction === "default"

console.log(`address            ${user}`)
console.log(
  `perps accountValue ${perpValue} USDC   ${perpValue >= 100 ? "OK" : "BELOW 100 — not eligible"}`,
)
console.log(`spot USDC          ${spotUsdc} USDC   (does NOT count)`)
console.log(
  `account type       ${abstraction}   ${modeOk ? "OK" : 'NOT eligible — set to "Manual" on app.hyperliquid.xyz'}`,
)
console.log(
  `\nverdict            ${perpValue >= 100 && modeOk ? "READY — approveBuilderFee will succeed" : "NOT READY"}`,
)
