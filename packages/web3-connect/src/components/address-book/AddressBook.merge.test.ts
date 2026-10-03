import { describe, expect, it, vi } from "vitest"

import { buildAddresses } from "@/components/address-book/AddressBook.merge"
import type { Address } from "@/components/address-book/AddressBook.store"
import { WalletMode } from "@/config/wallet"

vi.mock("@/utils/wallet", () => ({ getWalletModeName: () => "" }))

const entry: Address = {
  publicKey: "0xabc",
  address: "addr",
  name: "Alice",
  mode: WalletMode.Substrate,
  savedBy: ["walletA"],
  isCustom: true,
}

describe("buildAddresses", () => {
  it("global add clears savedBy of a wallet-scoped entry", () => {
    const [result] = buildAddresses(
      [entry],
      [{ ...entry, name: "", savedBy: [], isGlobal: true }],
      "walletB",
    )
    expect(result?.savedBy).toEqual([])
    expect(result).not.toHaveProperty("isGlobal")
  })

  it("wallet sync keeps savedBy scoping", () => {
    const [result] = buildAddresses(
      [entry],
      [{ ...entry, savedBy: [], isCustom: false }],
      "walletB",
    )
    expect(result?.savedBy).toEqual(["walletA"])
  })
})
