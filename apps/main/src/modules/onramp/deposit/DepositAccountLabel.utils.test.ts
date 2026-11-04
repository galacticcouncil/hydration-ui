import type { Account } from "@galacticcouncil/web3-connect"
import { describe, expect, it } from "vitest"

import { getDepositAccountLabel } from "./DepositAccountLabel.utils"

const address = "9u3Mqg123456789012345678901234567890CrJF9v"
const account = (name: string) =>
  ({ name, address, rawAddress: address, displayAddress: address }) as Account

describe("deposit account labels", () => {
  it("shows a single address for an unnamed account", () => {
    expect(getDepositAccountLabel(account("  "))).not.toContain(" · ")
  })
  it("does not repeat an address supplied as the account name", () => {
    expect(getDepositAccountLabel(account(address))).toBe(
      getDepositAccountLabel(account("")),
    )
  })
  it("recognizes a shortened address regardless of ellipsis format", () => {
    for (const name of ["9u3Mqg...CrJF9v", "9u3Mqg…CrJF9v"])
      expect(getDepositAccountLabel(account(name))).toBe(
        getDepositAccountLabel(account("")),
      )
  })
  it("keeps a real account name with its shortened address", () => {
    expect(getDepositAccountLabel(account("Main"))).toBe(
      `Main · ${getDepositAccountLabel(account(""))}`,
    )
  })
})
