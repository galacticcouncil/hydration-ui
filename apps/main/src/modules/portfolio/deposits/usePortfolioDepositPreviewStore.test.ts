import { beforeEach, describe, expect, it, vi } from "vitest"

import { portfolioDepositSamples } from "./PortfolioDepositPreview.mock"
import {
  getClaimablePortfolioDepositSamples,
  getPortfolioDepositSamples,
} from "./PortfolioDepositPreview.utils"
import { usePortfolioDepositPreviewStore } from "./usePortfolioDepositPreviewStore"

vi.mock("@galacticcouncil/utils", () => ({
  DOT_ASSET_ID: "5",
  ETH_ASSET_ID: "20",
  HDX_ASSET_ID: "0",
  HOLLAR_ASSET_ID: "222",
  USDC_ASSET_ID: "22",
  USDT_ASSET_ID: "10",
}))

beforeEach(() => {
  usePortfolioDepositPreviewStore.setState(
    usePortfolioDepositPreviewStore.getInitialState(),
    true,
  )
})

const store = () => usePortfolioDepositPreviewStore.getState()
const currentSamples = () =>
  getPortfolioDepositSamples(portfolioDepositSamples, store().claimedIds)

describe("portfolio deposit sample claims", () => {
  it("marks an eligible fixture completed and updates the shared claim count", () => {
    const initialCount =
      getClaimablePortfolioDepositSamples(currentSamples()).length
    store().claimSample("sample-ethereum-usdc")
    expect(store().claimedIds).toEqual(["sample-ethereum-usdc"])
    expect(
      currentSamples().find(({ id }) => id === "sample-ethereum-usdc")?.status,
    ).toBe("completed")
    expect(getClaimablePortfolioDepositSamples(currentSamples())).toHaveLength(
      initialCount - 1,
    )
    expect(
      portfolioDepositSamples.find(({ id }) => id === "sample-ethereum-usdc")
        ?.status,
    ).toBe("claimable")
  })

  it("does not add the same preview claim twice", () => {
    store().claimSample("sample-ethereum-usdc")
    const claimedIds = store().claimedIds
    store().claimSample("sample-ethereum-usdc")
    expect(store().claimedIds).toBe(claimedIds)
  })

  it("ignores unknown samples and deposits that are not claimable", () => {
    store().claimSample("unknown-transfer")
    store().claimSample("sample-bank-usd")
    store().claimSample("sample-assethub-usdt")
    expect(store().claimedIds).toEqual([])
  })
})
