// Encodes AssetRegistry.update(asset_id=55, asset_type=Erc20, location=X1[AccountKey20=VAULT])
// and prints SCALE calldata + blake2-256 preimage hash for governance submission.
//
// Run: node scripts/encode-hdcl-asset-update.mjs
//
// Connects to lark to load runtime metadata, then builds the call from typed
// descriptors so XCM Location encoding doesn't have to be hand-rolled.

import { createClient } from "polkadot-api"
import { getWsProvider } from "polkadot-api/ws-provider/node"
import { withPolkadotSdkCompat } from "polkadot-api/polkadot-sdk-compat"
import { hydration } from "@galacticcouncil/descriptors"
import { Binary } from "polkadot-api"
import { blake2b } from "blakejs"

const RPC = "wss://0.lark.hydration.cloud"
const HDCL_ASSET_ID = 55
const VAULT_ADDRESS = "0xB82cF8A62EB1b51a2f2A9d71C120E2fB8ae548D8"

// Lark exposes legacy substrate JSON-RPC, not the chainHead/v2 spec papi
// uses by default. `polkadot-sdk-compat` shims the legacy methods so papi
// can talk to the node without subscriptions blowing up.
const client = createClient(withPolkadotSdkCompat(getWsProvider(RPC)))
const api = client.getTypedApi(hydration)

const vaultBytes = Binary.fromHex(VAULT_ADDRESS)

const tx = api.tx.AssetRegistry.update({
  asset_id: HDCL_ASSET_ID,
  name: undefined,
  asset_type: { type: "Erc20", value: undefined },
  existential_deposit: undefined,
  xcm_rate_limit: undefined,
  is_sufficient: undefined,
  symbol: undefined,
  decimals: undefined,
  location: {
    parents: 0,
    interior: {
      type: "X1",
      value: {
        type: "AccountKey20",
        value: { network: undefined, key: vaultBytes },
      },
    },
  },
})

const callData = await tx.getEncodedData()
const callBytes = callData.asBytes()
const callHex = "0x" + Buffer.from(callBytes).toString("hex")

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

client.destroy()
