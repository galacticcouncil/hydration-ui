import { describe, expect, it } from "vitest"

import { BtcAddr } from "./bitcoin"

describe("BtcAddr.isValid", () => {
  it.each([
    "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
    "3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy",
    "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq",
    "bc1q8x6u5y28vajpgnks5nvfqlqave9kgwyp8f6x92",
    "BC1QW508D6QEJXTDG4Y5R3ZARVARY0C5XW7KV8F3T4",
    "bc1qrp33g0q5c5txsp9arysrx4k6zdkfs4nce4xj0gdcccefvpysxf3qccfmv3",
    "bc1p0xlxvlhemja6c4dqv22uapctqupfhlxm9h8z3k2e72q4k9hcz7vqzk5jj0",
  ])("accepts %s", (addr) => {
    expect(BtcAddr.isValid(addr)).toBe(true)
  })

  it.each([
    "",
    "bc1q",
    // Bad checksums
    "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNb",
    "bc1q8x6u5y28vajpgnks5nvfqlqave9kgwyp8f6x93",
    // v1 encoded with bech32 instead of bech32m
    "bc1pw508d6qejxtdg4y5r3zarvary0c5xw7kw508d6qejxtdg4y5r3zarvary0c5xw7k7grplx",
    // Mixed case
    "bc1qAr0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq",
    // Testnet
    "tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx",
    "alice.near",
    "t1PKtYdJJHhc3Pxowmznkg7vdTwnhEsCvR4",
  ])("rejects %j", (addr) => {
    expect(BtcAddr.isValid(addr)).toBe(false)
  })
})
