import type { Account } from "@galacticcouncil/web3-connect"
import { WalletProviderType } from "@galacticcouncil/web3-connect/src/config/providers"
import { describe, expect, it } from "vitest"

import {
  canUseWithdrawAccount,
  selectWithdrawSourceAccount,
} from "./WithdrawOnchain.utils"

const account = (
  address: string,
  provider = WalletProviderType.ExternalWallet,
): Account => ({
  name: "Source wallet",
  address,
  rawAddress: address,
  displayAddress: address,
  publicKey: "",
  provider,
  canUseOnHydration: true,
})
const substrate = account("5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY")
const evm = account(
  "0x0000000000000000000000000000000000000001",
  WalletProviderType.MetaMask,
)

describe("Hydration withdrawal source selection", () => {
  it("accepts compatible Substrate and EVM addresses", () => {
    expect(canUseWithdrawAccount(substrate)).toBe(true)
    expect(canUseWithdrawAccount(evm)).toBe(true)
  })
  it("rejects missing, invalid and incompatible sources", () => {
    expect(canUseWithdrawAccount(null)).toBe(false)
    expect(canUseWithdrawAccount(account("invalid"))).toBe(false)
    expect(
      canUseWithdrawAccount({ ...substrate, canUseOnHydration: false }),
    ).toBe(false)
  })
  it("prefers the active compatible connected account", () => {
    expect(selectWithdrawSourceAccount(evm, [substrate, evm])).toBe(evm)
  })
  it("falls back to a connected Hydration account without pooling its funds", () => {
    expect(
      selectWithdrawSourceAccount(account("invalid"), [substrate, evm]),
    ).toBe(substrate)
    expect(selectWithdrawSourceAccount(null, [substrate])).toBe(substrate)
  })
  it("does not reuse a disconnected active account", () => {
    expect(selectWithdrawSourceAccount(substrate, [])).toBeNull()
    expect(selectWithdrawSourceAccount(evm, [substrate])).toBe(substrate)
  })
})
