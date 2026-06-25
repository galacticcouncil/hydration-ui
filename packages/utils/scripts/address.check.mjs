// Self-check for NEAR/Zcash address validators.
// Run: node --experimental-strip-types packages/utils/scripts/address.check.mjs
import assert from "node:assert"

import { NearAddr, ZcashAddr } from "../src/helpers/address.ts"

const valid = "t1g621fhbKa3ETnWqtvYyMtHMVMhwRYXcYM"
// one-character-tampered copy must fail the checksum
const tampered = "t1g621fhbKa3ETnWqtvYyMtHMVMhwRYXcYN"

assert(ZcashAddr.isValid(valid), "valid t1 zcash address should pass")
assert(!ZcashAddr.isValid(tampered), "tampered zcash address should fail")
assert(NearAddr.isValid("alice.near"), "alice.near should pass")
assert(!NearAddr.isValid("alice.eth"), "alice.eth should fail")
assert(!NearAddr.isValid("near"), "'near' should fail")

console.log("address.check: all assertions passed")
