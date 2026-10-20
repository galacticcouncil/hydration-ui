import { describe, expect, it, vi } from "vitest"

import type { Address } from "./AddressBook.store"
import { buildAddresses } from "./AddressBook.utils"

vi.mock("@/utils/wallet", () => ({}))

const account: Address = {
  address: "15oF4uVJwmo4TdGW7VfQxNLavjCXviqxT9S1MgbjMNHr6Sp5",
  publicKey:
    "0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d",
  mode: "substrate" as Address["mode"],
  name: "Alice",
  savedBy: [],
}

describe("address-book recipient names", () => {
  it.each(["", "Bob"])(
    "preserves a wallet account name when saving a recipient",
    (name) => {
      const result = buildAddresses(
        [account],
        [{ ...account, name, isCustom: true }],
        null,
      )

      expect(result[0]?.name).toBe("Alice")
    },
  )

  it.each(["", "   "])("ignores a blank wallet name", (name) => {
    const result = buildAddresses([account], [{ ...account, name }], null)

    expect(result[0]?.name).toBe("Alice")
  })

  it("updates a wallet account name from a wallet refresh", () => {
    const result = buildAddresses(
      [account],
      [{ ...account, name: "Charlie" }],
      null,
    )

    expect(result[0]?.name).toBe("Charlie")
  })

  it("preserves a custom contact name during a wallet refresh", () => {
    const result = buildAddresses(
      [{ ...account, isCustom: true }],
      [{ ...account, name: "Bob" }],
      null,
    )

    expect(result[0]?.name).toBe("Alice")
  })
})
