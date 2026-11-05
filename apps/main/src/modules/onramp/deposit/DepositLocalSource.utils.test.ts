import {
  safeConvertAddressSS58,
  safeConvertSS58toPublicKey,
} from "@galacticcouncil/utils"
import type { Account } from "@galacticcouncil/web3-connect"
import { WalletProviderType } from "@galacticcouncil/web3-connect/src/config/providers"
import { chainsMap } from "@galacticcouncil/xc-cfg"
import { describe, expect, it } from "vitest"

import {
  isHydrationDepositSource,
  withHydrationDepositSource,
} from "./DepositLocalSource.utils"

const alice = "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
const account = (address: string): Account => ({
  address,
  rawAddress: address,
  displayAddress: address,
  publicKey: "",
  name: "Source",
  provider: WalletProviderType.Subwallet,
  canUseOnHydration: true,
})

describe("Hydration deposit sources", () => {
  it("adds native HDX as a same-chain source without manufacturing bridge routes", () => {
    const source = withHydrationDepositSource([])[0]!
    expect(source.chain.key).toBe("hydration")
    expect(source.assets.map(({ key }) => key)).toEqual(["hdx"])
    expect(source.chain.getAssetId(source.assets[0]!)).toBe(0)
    expect(source.routes).toEqual([])
  })
  it("keeps external sources and does not duplicate Hydration", () => {
    const external = {
      chain: chainsMap.get("ethereum")!,
      assets: [],
      routes: [],
      isTagSelect: false,
    }
    const pairs = withHydrationDepositSource([external])
    expect(pairs).toHaveLength(2)
    expect(pairs[1]).toBe(external)
    expect(withHydrationDepositSource(pairs)).toBe(pairs)
  })
  it("allows a different valid Hydration account", () => {
    expect(
      isHydrationDepositSource(
        account(alice),
        account("0x1111111111111111111111111111111111111111"),
      ),
    ).toBe(true)
  })
  it("excludes the receiving account across wallet providers and SS58 formats", () => {
    const receiver = {
      ...account(alice),
      publicKey: safeConvertSS58toPublicKey(alice),
    }
    const source = {
      ...account(safeConvertAddressSS58(alice, 63)),
      provider: WalletProviderType.Talisman,
    }
    expect(isHydrationDepositSource(source, receiver)).toBe(false)
  })
  it("requires a valid compatible source and allows selection before a recipient is chosen", () => {
    expect(isHydrationDepositSource(account(alice), null)).toBe(true)
    expect(
      isHydrationDepositSource(
        { ...account(alice), canUseOnHydration: false },
        null,
      ),
    ).toBe(false)
    expect(isHydrationDepositSource(account("invalid"), null)).toBe(false)
  })
})
