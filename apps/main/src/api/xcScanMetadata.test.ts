import { QueryClient } from "@tanstack/react-query"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { xcScanAssetsQuery, xcScanChainsQuery } from "@/api/xcScanMetadata"
import { queryXcScanMetadata } from "@/modules/xcm/history/xcScanStore"

vi.mock("@/modules/xcm/history/xcScanStore", () => ({
  queryXcScanMetadata: vi.fn(),
}))

const queryMetadata = vi.mocked(queryXcScanMetadata)
const paseo = "urn:ocn:paseo:0"
const assethub = "urn:ocn:paseo:1000"

const fetchChains = () =>
  new QueryClient().fetchQuery({ ...xcScanChainsQuery(), retry: false })
const fetchAssets = (keys: readonly string[]) =>
  new QueryClient().fetchQuery({ ...xcScanAssetsQuery(keys), retry: false })

beforeEach(() => {
  queryMetadata.mockReset()
})

describe("XCScan chain metadata", () => {
  it("follows pagination and deduplicates chains by their complete URN", async () => {
    queryMetadata
      .mockResolvedValueOnce({
        items: [{ urn: paseo, runtimeChain: "Paseo" }],
        pageInfo: { hasNextPage: true, endCursor: "page-two" },
      })
      .mockResolvedValueOnce({
        items: [
          { urn: paseo, chainTokens: ["PAS"], chainDecimals: [10] },
          { urn: assethub, runtimeChain: "Asset Hub Paseo" },
        ],
        pageInfo: { hasNextPage: false, endCursor: "last-page" },
      })

    const chains = await fetchChains()

    expect(chains).toEqual({
      [paseo]: { urn: paseo, chainTokens: ["PAS"], chainDecimals: [10] },
      [assethub]: {
        urn: assethub,
        runtimeChain: "Asset Hub Paseo",
        chainTokens: [],
        chainDecimals: [],
      },
    })
    expect(queryMetadata).toHaveBeenCalledTimes(2)
    expect(queryMetadata).toHaveBeenNthCalledWith(
      1,
      {
        args: { op: "chains.list" },
        pagination: { limit: 100, cursor: undefined },
      },
      expect.any(AbortSignal),
    )
    expect(queryMetadata).toHaveBeenNthCalledWith(
      2,
      {
        args: { op: "chains.list" },
        pagination: { limit: 100, cursor: "page-two" },
      },
      queryMetadata.mock.calls[0]?.[1],
    )
  })

  it("rejects pagination that repeats the current cursor", async () => {
    queryMetadata.mockResolvedValue({
      items: [],
      pageInfo: { hasNextPage: true, endCursor: "same-page" },
    })

    await expect(fetchChains()).rejects.toThrow(
      "XCScan metadata pagination did not advance",
    )
    expect(queryMetadata).toHaveBeenCalledTimes(2)
  })

  it("rejects a cursor cycle across multiple pages", async () => {
    for (const cursor of ["page-a", "page-b", "page-a"]) {
      queryMetadata.mockResolvedValueOnce({
        items: [],
        pageInfo: { hasNextPage: true, endCursor: cursor },
      })
    }

    await expect(fetchChains()).rejects.toThrow(
      "XCScan metadata pagination did not advance",
    )
    expect(queryMetadata).toHaveBeenCalledTimes(3)
  })
})

describe("XCScan asset metadata", () => {
  it("deduplicates requests without merging canonical asset ids or networks", async () => {
    const ethereum = "urn:ocn:ethereum:1"
    const uppercaseId = "0xAbC"
    const lowercaseId = "0xabc"
    const keys = [
      `${assethub}|native`,
      `${paseo}|native`,
      `${ethereum}|${uppercaseId}`,
      `${ethereum}|${lowercaseId}`,
      `${paseo}|native`,
    ]
    const assets = [
      { chainId: paseo, id: "native", symbol: "PAS", decimals: 10 },
      { chainId: assethub, id: "native", symbol: "PAS", decimals: 10 },
      { chainId: ethereum, id: uppercaseId, symbol: "ABC", decimals: 18 },
      { chainId: ethereum, id: lowercaseId, symbol: "ABC", decimals: 6 },
    ]
    queryMetadata.mockResolvedValue({ items: assets })

    const metadata = await fetchAssets(keys)

    expect(xcScanAssetsQuery(keys).queryKey).toEqual(
      xcScanAssetsQuery([...keys].reverse()).queryKey,
    )
    expect(metadata).toEqual(
      Object.fromEntries(
        assets.map((asset) => [`${asset.chainId}|${asset.id}`, asset]),
      ),
    )
    expect(queryMetadata).toHaveBeenCalledExactlyOnceWith(
      {
        args: {
          op: "assets",
          criteria: [
            { network: ethereum, assets: [uppercaseId, lowercaseId] },
            { network: paseo, assets: ["native"] },
            { network: assethub, assets: ["native"] },
          ],
        },
      },
      expect.any(AbortSignal),
    )
  })

  it("normalizes numeric asset ids and numeric-string decimals", async () => {
    queryMetadata.mockResolvedValue({
      items: [{ chainId: assethub, id: 1984, symbol: "USDT", decimals: "6" }],
    })

    await expect(fetchAssets([`${assethub}|1984`])).resolves.toEqual({
      [`${assethub}|1984`]: {
        chainId: assethub,
        id: "1984",
        symbol: "USDT",
        decimals: 6,
      },
    })
  })

  it.each([Number.MAX_SAFE_INTEGER + 1, 1.5, -1])(
    "rejects numeric asset id %j that cannot safely identify an asset",
    async (id) => {
      queryMetadata.mockResolvedValue({
        items: [{ chainId: assethub, id, symbol: "TEST", decimals: 10 }],
      })

      await expect(fetchAssets([`${assethub}|${id}`])).rejects.toThrow()
    },
  )

  it("preserves an asset id larger than a safe integer when supplied as a string", async () => {
    const id = "9007199254740993"
    const asset = { chainId: assethub, id, symbol: "TEST", decimals: 10 }
    queryMetadata.mockResolvedValue({ items: [asset] })

    await expect(fetchAssets([`${assethub}|${id}`])).resolves.toEqual({
      [`${assethub}|${id}`]: asset,
    })
  })

  it("disables malformed-only keys and never requests an empty criteria list", async () => {
    const keys = ["", "malformed", paseo]

    expect(xcScanAssetsQuery(keys).enabled).toBe(false)
    await expect(fetchAssets(keys)).resolves.toEqual({})
    expect(queryMetadata).not.toHaveBeenCalled()
  })

  it.each([null, "", "1.5", -1, 256])(
    "rejects invalid decimals %j rather than coercing them to zero",
    async (decimals) => {
      queryMetadata.mockResolvedValue({
        items: [{ chainId: paseo, id: "native", symbol: "PAS", decimals }],
      })

      await expect(fetchAssets([`${paseo}|native`])).rejects.toThrow()
    },
  )

  it("keeps missing decimals unknown while preserving an explicit zero", async () => {
    queryMetadata.mockResolvedValue({
      items: [
        { chainId: paseo, id: "native", symbol: "PAS" },
        { chainId: assethub, id: "42", symbol: "NFT", decimals: 0 },
      ],
    })

    const metadata = await fetchAssets([`${paseo}|native`, `${assethub}|42`])

    expect(metadata[`${paseo}|native`]?.decimals).toBeUndefined()
    expect(metadata[`${assethub}|42`]?.decimals).toBe(0)
  })
})
