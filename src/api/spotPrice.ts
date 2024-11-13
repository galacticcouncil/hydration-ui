import { useQueries, useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { u32 } from "@polkadot/types"
import { TradeRouter } from "@galacticcouncil/sdk"
import { BN_1, BN_10, BN_NAN } from "utils/constants"
import BN from "bignumber.js"
import { Maybe } from "utils/helpers"
import { useRpcProvider } from "providers/rpcProvider"
import { A_TOKEN_UNDERLYING_ID_MAP } from "sections/lending/ui-config/aTokens"
import { ethers } from "ethers"
import { useProviderRpcUrlStore } from "./provider"
import { JsonRpcProvider } from "@ethersproject/providers"

export const useSpotPrice = (
  assetA: Maybe<u32 | string>,
  assetB: Maybe<u32 | string>,
) => {
  const { tradeRouter, isLoaded } = useRpcProvider()
  const tokenIn = assetA?.toString() ?? ""
  const tokenOut = assetB?.toString() ?? ""

  const routerInitialized = Object.keys(tradeRouter).length > 0

  return useQuery(
    QUERY_KEYS.spotPriceLive(tokenIn, tokenOut),
    getSpotPrice(tradeRouter, tokenIn, tokenOut),
    { enabled: !!tokenIn && !!tokenOut && routerInitialized && isLoaded },
  )
}

export const useSpotPrices = (
  assetsIn: Maybe<u32 | string>[],
  assetOut: Maybe<u32 | string>,
  noRefresh?: boolean,
) => {
  const { tradeRouter, isLoaded } = useRpcProvider()

  const assets = new Set(
    assetsIn.filter((a): a is u32 | string => !!a).map((a) => a.toString()),
  )

  const tokenOut = assetOut?.toString() ?? ""

  const routerInitialized = Object.keys(tradeRouter).length > 0

  return useQueries({
    queries: Array.from(assets).map((tokenIn) => ({
      queryKey: noRefresh
        ? QUERY_KEYS.spotPrice(tokenIn, tokenOut)
        : QUERY_KEYS.spotPriceLive(tokenIn, tokenOut),
      queryFn: getSpotPrice(tradeRouter, tokenIn, tokenOut),
      enabled: !!tokenIn && !!tokenOut && routerInitialized && isLoaded,
    })),
  })
}

export const getSpotPrice =
  (tradeRouter: TradeRouter, tokenIn: string, tokenOut: string) => async () => {
    const tokenInParam = A_TOKEN_UNDERLYING_ID_MAP[tokenIn] ?? tokenIn
    const tokenOutParam = A_TOKEN_UNDERLYING_ID_MAP[tokenOut] ?? tokenOut
    // X -> X would return undefined, no need for spot price in such case
    if (tokenIn === tokenOut || tokenInParam === tokenOutParam)
      return { tokenIn, tokenOut, spotPrice: BN_1 }

    // error replies are valid in case token has no spot price
    let spotPrice = BN_NAN
    try {
      const res = await tradeRouter.getBestSpotPrice(
        tokenInParam,
        tokenOutParam,
      )
      if (res) {
        spotPrice = res.amount.div(BN_10.pow(res.decimals))
      }
    } catch (e) {}
    return { tokenIn, tokenOut, spotPrice }
  }

export type SpotPrice = {
  tokenIn: string
  tokenOut: string
  spotPrice: BN
}

async function getPriceFeedInfo(
  provider: JsonRpcProvider,
  contractAddress: string,
) {
  const contract = new ethers.Contract(
    contractAddress,
    CHAINLINK_AGGREGATOR_ABI,
    provider,
  )

  try {
    const [decimals, description, latestData] = await Promise.all([
      contract.decimals(),
      contract.description(),
      contract.latestRoundData(),
    ])

    const price =
      parseFloat(latestData.answer.toString()) / Math.pow(10, decimals)
    const updatedAt = new Date(latestData.updatedAt.toNumber() * 1000)

    return {
      address: contractAddress,
      pair: description,
      price: price,
      lastUpdate: updatedAt.toISOString(),
      roundId: latestData.roundId.toString(),
    }
  } catch (error) {
    console.error(`Error fetching data for ${contractAddress}:`, error?.message)
    return null
  }
}

export const usePriceFeeInfo = () => {
  const { rpcUrl } = useProviderRpcUrlStore()
  return useQuery({
    enabled: true,
    queryKey: ["price"],
    queryFn: async () => {
      const provider = new ethers.providers.JsonRpcProvider(
        "https://rpc.nice.hydration.cloud",
      )
      console.log(provider, "provider")
      const priceFeedInfo = await getPriceFeedInfo(
        provider,
        "0xbae0c646f387bdf185848ee466f8920582c421e6",
      )

      return priceFeedInfo
    },
  })
}

const CHAINLINK_AGGREGATOR_ABI = [
  "function decimals() external view returns (uint8)",
  "function description() external view returns (string memory)",
  "function latestRoundData() external view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)",
  "function version() external view returns (uint256)",
]
