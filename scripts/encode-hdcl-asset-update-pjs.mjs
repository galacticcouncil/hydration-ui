// Same encoder as encode-hdcl-asset-update.mjs but using @polkadot/api
// (lark exposes only legacy substrate JSON-RPC, no chainHead/v2 methods —
// papi's WS provider keeps reconnecting on it; @polkadot/api handles legacy
// nodes natively).
//
// Usage:
//   node --experimental-vm-modules scripts/encode-hdcl-asset-update-pjs.mjs
//
// Pulls @polkadot/api from a sibling repo's node_modules to avoid having
// to install it in this workspace.

import { ApiPromise, WsProvider } from "/Users/ben/Claude Code/hollar/node_modules/@polkadot/api/index.js"
import { blake2b } from "blakejs"

const RPC = "wss://0.lark.hydration.cloud"
const HDCL_ASSET_ID = 55
const VAULT_ADDRESS = "0xB82cF8A62EB1b51a2f2A9d71C120E2fB8ae548D8"

const provider = new WsProvider(RPC)
const api = await ApiPromise.create({ provider })

const tx = api.tx.assetRegistry.update(
  HDCL_ASSET_ID,
  null, // name
  { Erc20: null }, // asset_type
  null, // existential_deposit
  null, // xcm_rate_limit
  null, // is_sufficient
  null, // symbol
  null, // decimals
  {
    parents: 0,
    interior: { X1: [{ AccountKey20: { network: null, key: VAULT_ADDRESS } }] },
  },
)

const callHex = tx.method.toHex()
const callBytes = Buffer.from(callHex.slice(2), "hex")
const hash = "0x" + Buffer.from(blake2b(callBytes, undefined, 32)).toString("hex")

console.log("Call:           AssetRegistry.update")
console.log("  asset_id      55")
console.log("  asset_type    Erc20")
console.log(`  location      0,X1[AccountKey20(${VAULT_ADDRESS})]`)
console.log()
console.log(`Encoded:        ${callHex}`)
console.log(`Length:         ${callBytes.length} bytes`)
console.log(`Preimage hash:  ${hash}`)
console.log()
console.log("Origin:         RegistryOrigin = EitherOf<EnsureRoot, GeneralAdmin>")

await api.disconnect()
