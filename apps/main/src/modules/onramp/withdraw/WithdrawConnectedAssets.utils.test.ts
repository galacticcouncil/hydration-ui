import type { Asset } from "@galacticcouncil/xc-core"
import { describe, expect, it } from "vitest"

import type { WithdrawDestinationOption } from "./WithdrawAssetSelect.utils"
import { getWithdrawFundedAssets } from "./WithdrawConnectedAssets.utils"

const route = (key: string, assetId: string, destination: string) =>
  ({
    assetId,
    sourceAssetKey: key,
    sourceAsset: { key } as Asset,
    destinationChainKey: destination,
    destinationAssetKey: key,
  }) as WithdrawDestinationOption

const options = [
  route("dot", "5", "hydration"),
  route("dot", "5", "assethub"),
  route("usdc", "22", "ethereum"),
]
const metadata = (id: string) =>
  id === "5"
    ? { name: "Polkadot", decimals: 10 }
    : id === "22"
      ? { name: "USD Coin", decimals: 6 }
      : undefined

describe("connected withdrawal funds", () => {
  it("lists a holding once while retaining its destination choices", () => {
    const rows = getWithdrawFundedAssets(
      options,
      { "5": { transferable: 12500000000n } },
      metadata,
    )
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({
      assetId: "5",
      amount: 12500000000n,
      decimals: 10,
    })
    expect(rows[0]?.routes.map((option) => option.destinationChainKey)).toEqual(
      ["hydration", "assethub"],
    )
  })

  it("does not offer zero, unavailable or locked funds", () => {
    expect(
      getWithdrawFundedAssets(
        options,
        { "5": { transferable: 0n }, "22": { transferable: -1n } },
        metadata,
      ),
    ).toEqual([])
    expect(getWithdrawFundedAssets(options, {}, metadata)).toEqual([])
  })

  it("does not offer balances without a known asset and supported route", () => {
    expect(
      getWithdrawFundedAssets(
        [route("unknown", "99", "hydration")],
        { "99": { transferable: 10n } },
        metadata,
      ),
    ).toEqual([])
    expect(
      getWithdrawFundedAssets([], { "5": { transferable: 10n } }, metadata),
    ).toEqual([])
  })

  it("retains native units and each asset's decimals", () => {
    expect(
      getWithdrawFundedAssets(
        options,
        { "22": { transferable: 1234567n } },
        metadata,
      )[0],
    ).toMatchObject({ amount: 1234567n, decimals: 6, name: "USD Coin" })
  })
})
