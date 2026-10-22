import { describe, expect, it, vi } from "vitest"

import type { Address } from "./AddressBook.store"
import { buildAddresses } from "./AddressBook.utils"

vi.mock("@/utils/wallet", () => ({}))

const alice: Address = {
  address: "15oF4uVJwmo4TdGW7VfQxNLavjCXviqxT9S1MgbjMNHr6Sp5",
  publicKey:
    "0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d",
  mode: "substrate" as Address["mode"],
  name: "Alice",
  savedBy: [],
}

describe("buildAddresses", () => {
  it.each(["", "Bob"])(
    "preserves a wallet account name when saving a recipient",
    (name) => {
      const result = buildAddresses(
        [alice],
        [{ ...alice, name, isCustom: true }],
        null,
      )

      expect(result[0]?.name).toBe("Alice")
    },
  )

  it.each(["", "   "])("ignores a blank wallet name", (name) => {
    const result = buildAddresses([alice], [{ ...alice, name }], null)

    expect(result[0]?.name).toBe("Alice")
  })

  it("updates a wallet account name from a wallet refresh", () => {
    const result = buildAddresses(
      [alice],
      [{ ...alice, name: "Charlie" }],
      null,
    )

    expect(result[0]?.name).toBe("Charlie")
  })

  it("preserves a custom contact name during a wallet refresh", () => {
    const result = buildAddresses(
      [{ ...alice, isCustom: true }],
      [{ ...alice, name: "Bob" }],
      null,
    )

    expect(result[0]?.name).toBe("Alice")
  })

  it("global add clears savedBy of a wallet-scoped entry", () => {
    const [result] = buildAddresses(
      [{ ...alice, savedBy: ["walletA"], isCustom: true }],
      [{ ...alice, isCustom: true, isGlobal: true }],
      "walletB",
    )
    expect(result?.savedBy).toEqual([])
  })

  it("wallet sync keeps savedBy scoping", () => {
    const [result] = buildAddresses(
      [{ ...alice, savedBy: ["walletA"], isCustom: true }],
      [alice],
      "walletB",
    )
    expect(result?.savedBy).toEqual(["walletA"])
  })
})
