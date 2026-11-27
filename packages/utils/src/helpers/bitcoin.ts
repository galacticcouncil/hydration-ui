import { sha256 } from "@noble/hashes/sha2"
import { base58check, bech32, bech32m } from "@scure/base"

const b58 = base58check(sha256)

// Mainnet version bytes: P2PKH (1…), P2SH (3…)
const BASE58_VERSIONS = [0x00, 0x05]

const isBase58Address = (addr: string): boolean => {
  try {
    const bytes = b58.decode(addr)
    return bytes.length === 21 && BASE58_VERSIONS.includes(bytes[0]!)
  } catch {
    return false
  }
}

// BIP173 (v0, bech32) / BIP350 (v1+, bech32m)
const isSegwitAddress = (addr: string): boolean => {
  const lower = addr.toLowerCase()
  if (!lower.startsWith("bc1")) return false

  // The first data char is the witness version; "q" encodes 0
  const codec = lower[3] === "q" ? bech32 : bech32m
  const decoded = codec.decodeUnsafe(addr, 90)
  if (!decoded || decoded.prefix !== "bc") return false

  const [version, ...data] = decoded.words
  if (version === undefined || version > 16) return false

  const program = codec.fromWordsUnsafe(data)
  if (!program) return false

  return version === 0
    ? program.length === 20 || program.length === 32
    : program.length >= 2 && program.length <= 40
}

/** Bitcoin mainnet addresses, checksums included. */
export const BtcAddr = {
  isValid: (addr: string): boolean =>
    isBase58Address(addr) || isSegwitAddress(addr),
}
