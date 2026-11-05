import { safeConvertH160toSS58 } from "@galacticcouncil/utils"
import type { Account } from "@galacticcouncil/web3-connect"
import { chainsMap } from "@galacticcouncil/xc-cfg"
import { describe, expect, it, vi } from "vitest"

import type { WithdrawDestinationOption } from "./WithdrawAssetSelect.utils"
import { getWithdrawRecipientRoutes } from "./WithdrawRecipient.utils"

vi.mock("@/modules/xcm/transfer/utils/chain", () => ({
  isAccountValidOnChain: (account: Account) => account.canUseOnHydration,
}))

const evm = "0x1234567890123456789012345678901234567890"
const other = "0x2345678901234567890123456789012345678901"
const routes = ["hydration", "ethereum"].map((key) => ({
  destinationChain: chainsMap.get(key)!,
  destinationChainKey: key,
})) as WithdrawDestinationOption[]
const keys = (result: WithdrawDestinationOption[]) =>
  result.map((r) => r.destinationChainKey)

describe("withdrawal recipient networks", () => {
  it("offers only networks accepting the selected address", () => {
    expect(
      keys(getWithdrawRecipientRoutes(routes, { address: other }, evm)),
    ).toEqual(["hydration", "ethereum"])
    expect(
      keys(
        getWithdrawRecipientRoutes(
          routes,
          { address: safeConvertH160toSS58(other) },
          evm,
        ),
      ),
    ).toEqual(["hydration"])
  })
  it("excludes local self-transfers while permitting the same address on another network", () => {
    expect(
      keys(getWithdrawRecipientRoutes(routes, { address: evm }, evm)),
    ).toEqual(["ethereum"])
    expect(
      getWithdrawRecipientRoutes(
        routes,
        { address: safeConvertH160toSS58(evm) },
        evm,
      ),
    ).toEqual([])
  })
  it("rejects invalid addresses and an account incompatible with its destination", () => {
    expect(
      getWithdrawRecipientRoutes(routes, { address: "invalid" }, evm),
    ).toEqual([])
    expect(
      getWithdrawRecipientRoutes(
        routes,
        { address: other, account: { canUseOnHydration: false } as Account },
        evm,
      ),
    ).toEqual([])
  })
  it("retains separate destination assets on compatible networks", () => {
    expect(
      getWithdrawRecipientRoutes(
        [routes[1]!, { ...routes[1]!, destinationAssetKey: "weth" }],
        { address: other },
        evm,
      ),
    ).toHaveLength(2)
  })
})
