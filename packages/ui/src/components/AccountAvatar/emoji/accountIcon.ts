import { accountPublicKey, NearAddr, ZecAddr } from "@galacticcouncil/utils"

import { DEGENS, EMOJIS } from "./snakewatch"

export type AccountIcon = { emoji: string } | { image: string }

export const accountIcon = (address: string): AccountIcon | null => {
  const publicKey = accountPublicKey(address)
  if (!publicKey) return keylessIcon(address)

  // the lossy Number() is the spec, matching snakewatch's emojify.js.
  // The double is m*2^e with e~202, so both the halving and the modulo are exact
  // — no BigInt, no Math.floor.
  return (
    DEGENS[publicKey] ?? {
      emoji: EMOJIS[(Number(publicKey) / 2) % EMOJIS.length],
    }
  )
}

// NEAR ids and Zcash t-addresses have no 32-byte public key, so the glyph is
// picked by a string hash of the address instead.
const keylessIcon = (address: string): AccountIcon | null => {
  if (!NearAddr.isValid(address) && !ZecAddr.isValid(address)) return null

  let hash = 0
  for (const char of address) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return { emoji: EMOJIS[hash % EMOJIS.length] }
}
