import assert from "node:assert/strict"

import { safeConvertSS58toPublicKey } from "@galacticcouncil/utils"

import { addressToPublicKey } from "./publicKey"

// ponytail: standalone assert self-check, no framework. Run from this package:
//   ../../node_modules/.bin/esbuild src/utils/publicKey.selfcheck.ts \
//     --bundle --platform=node --format=cjs \
//     '--external:@galacticcouncil/sdk-next' '--external:@galacticcouncil/math-*' \
//     --outfile=.selfcheck.cjs && node .selfcheck.cjs && rm .selfcheck.cjs

const EVM = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
const SS58 = "15oF4uVJwmo4TdGW7VfQxNLavjCXviqxT9S1MgbjMNHr6Sp"
const SOLANA = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
const SUI = "0x00000000000000000000000000000000000000000000000000000000000000AB"

// EVM (H160) -> itself
assert.equal(addressToPublicKey(EVM), EVM)

// Substrate (SS58) -> routed through the public-key decoder (stable key)
assert.equal(addressToPublicKey(SS58), safeConvertSS58toPublicKey(SS58))
assert.equal(addressToPublicKey(SS58), addressToPublicKey(SS58))

// Solana -> itself (must not be misclassified as SS58/EVM)
assert.equal(addressToPublicKey(SOLANA), SOLANA)

// Sui -> itself lowercased
assert.equal(addressToPublicKey(SUI), SUI.toLowerCase())

// Unrecognised -> falsy
assert.equal(addressToPublicKey("not-an-address"), "")
assert.equal(addressToPublicKey(""), "")

// eslint-disable-next-line no-console
console.log("publicKey.selfcheck: all assertions passed")
