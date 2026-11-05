import { describe, expect, it } from "vitest"

import { hasReceiveAssetChange } from "./OnrampTransferSummary.utils"

const route = (source: string, destination: string) => ({
  source: { asset: { key: source } },
  destination: { asset: { key: destination } },
})

describe("receiving asset changes", () => {
  it("hides an ordinary cross-chain transfer of the same token", () => {
    expect(
      hasReceiveAssetChange(
        { key: "bnc" },
        { key: "bnc" },
        route("bnc", "bnc"),
      ),
    ).toBe(false)
  })

  it.each([
    ["eth", "weth_wh"],
    ["wnear", "near"],
    ["whype", "hype"],
    ["usdc", "usdc_wh"],
    ["usdc", "usdc_eth"],
  ])(
    "shows %s arriving as %s, including variants sharing a display symbol",
    (source, destination) => {
      expect(
        hasReceiveAssetChange(
          { key: source },
          { key: destination },
          route(source, destination),
        ),
      ).toBe(true)
    },
  )

  it("hides incomplete or stale route selections", () => {
    expect(
      hasReceiveAssetChange(null, { key: "weth_wh" }, route("eth", "weth_wh")),
    ).toBe(false)
    expect(
      hasReceiveAssetChange({ key: "eth" }, null, route("eth", "weth_wh")),
    ).toBe(false)
    expect(
      hasReceiveAssetChange({ key: "eth" }, { key: "weth_wh" }, null),
    ).toBe(false)
    expect(
      hasReceiveAssetChange(
        { key: "usdc" },
        { key: "usdc_wh" },
        route("eth", "weth_wh"),
      ),
    ).toBe(false)
    expect(
      hasReceiveAssetChange(
        { key: "usdc" },
        { key: "usdc_eth" },
        route("usdc", "usdc_wh"),
      ),
    ).toBe(false)
  })
})
