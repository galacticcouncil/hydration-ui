import { accountPublicKey } from "@galacticcouncil/utils"

// Temporary, opt-in demo. Remove this module and its call sites after design review.
const params = new URLSearchParams(
  typeof window === "undefined" ? "" : window.location.search,
)
if (params.get("demoWallet") === "1")
  sessionStorage.setItem("ramp-demo-wallet", "1")
if (params.get("demoWallet") === "0")
  sessionStorage.removeItem("ramp-demo-wallet")
export const DEMO_WALLET_ENABLED =
  typeof sessionStorage !== "undefined" &&
  sessionStorage.getItem("ramp-demo-wallet") === "1"
const demoPublicKeys = new Set([
  "0x" + "d1".repeat(32),
  "0x" + "d2".repeat(32),
  accountPublicKey("0x1234567890123456789012345678901234567890"),
  accountPublicKey("0x2345678901234567890123456789012345678901"),
])
export const isDemoAddress = (address: string) =>
  DEMO_WALLET_ENABLED &&
  !!address &&
  demoPublicKeys.has(accountPublicKey(address))
