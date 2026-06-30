import assert from "node:assert/strict"

import {
  safeConvertSS58toPublicKey,
  stringEquals,
} from "@galacticcouncil/utils"

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

// Keys are stored case-preserved (no lowercasing) on every branch.

// EVM (H160) -> itself (case preserved)
assert.equal(addressToPublicKey(EVM), EVM)

// Substrate (SS58) -> routed through the public-key decoder (stable key)
assert.equal(addressToPublicKey(SS58), safeConvertSS58toPublicKey(SS58))
assert.equal(addressToPublicKey(SS58), addressToPublicKey(SS58))

// Solana -> itself (case-sensitive base58; must not be misclassified as SS58/EVM)
assert.equal(addressToPublicKey(SOLANA), SOLANA)

// Sui -> itself (case preserved)
assert.equal(addressToPublicKey(SUI), SUI)

// Unrecognised -> falsy
assert.equal(addressToPublicKey("not-an-address"), "")
assert.equal(addressToPublicKey(""), "")

// stringEquals -> case-insensitive comparison (EVM checksum variants match)
assert.equal(stringEquals(EVM, EVM.toLowerCase()), true)
assert.equal(stringEquals(EVM, EVM.toUpperCase()), true)
assert.equal(stringEquals(SOLANA, SOLANA), true)
assert.equal(stringEquals("abc", "abd"), false)

// eslint-disable-next-line no-console
console.log("publicKey.selfcheck: all assertions passed")
