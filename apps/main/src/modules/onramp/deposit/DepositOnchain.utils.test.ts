import type { Account } from "@galacticcouncil/web3-connect"
import { WalletProviderType } from "@galacticcouncil/web3-connect/src/config/providers"
import { chainsMap } from "@galacticcouncil/xc-cfg"
import { describe, expect, it, vi } from "vitest"

import { canUseDepositAccount } from "@/modules/onramp/deposit/DepositOnchain.utils"

// The picker owns address validation; the native wallet mode gate remains upstream.
vi.mock("@/modules/xcm/transfer/utils/chain", () => ({
  isAccountValidOnChain: (account: Account | null) => !!account,
}))
vi.mock("@galacticcouncil/ui/assets/icons", () => ({}))
vi.mock("@galacticcouncil/ui/components", () => ({}))
vi.mock("@galacticcouncil/money-market/ui-config", () => ({
  AaveV3HydrationMainnet: {
    GHO_TOKEN_ADDRESS: "0x0000000000000000000000000000000000000000",
  },
}))

const chain = (key: string) => {
  const value = chainsMap.get(key)
  if (!value) throw new Error(`Missing chain ${key}`)
  return value
}
const account = (provider: WalletProviderType, address: string): Account => ({
  name: "Preview",
  address,
  rawAddress: address,
  displayAddress: address,
  publicKey: "",
  provider,
  canUseOnHydration: true,
})
const substrate = "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
const evm = "0x0000000000000000000000000000000000000001"

describe("Deposit source accounts", () => {
  it("requires a selected account", () => {
    expect(canUseDepositAccount(null, chain("assethub"))).toBe(false)
  })
  it("lets a watched Substrate address inspect a compatible source", () => {
    expect(
      canUseDepositAccount(
        account(WalletProviderType.ExternalWallet, substrate),
        chain("assethub"),
      ),
    ).toBe(true)
  })
  it("does not send a watched Substrate address to an Ethereum balance reader", () => {
    expect(
      canUseDepositAccount(
        account(WalletProviderType.ExternalWallet, substrate),
        chain("ethereum"),
      ),
    ).toBe(false)
  })
  it("lets a watched EVM address inspect Ethereum", () => {
    expect(
      canUseDepositAccount(
        account(WalletProviderType.ExternalWallet, evm),
        chain("ethereum"),
      ),
    ).toBe(true)
  })
})
