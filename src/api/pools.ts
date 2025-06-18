import { useRpcProvider } from "providers/rpcProvider"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { ApiPromise } from "@polkadot/api"
import type { u32 } from "@polkadot/types"
import { PoolToken, PoolType } from "@galacticcouncil/sdk"
import { OmniPoolToken } from "@galacticcouncil/sdk/build/types/pool/omni/OmniPool"
import { millisecondsInMinute } from "date-fns"
import { TOmnipoolAssetsData } from "./omnipool"
import { HUB_ID } from "utils/api"
import { BN_NAN } from "utils/constants"
import { useActiveQueries } from "hooks/useActiveQueries"
import { setOmnipoolIds, setValidXYKPoolAddresses } from "state/store"
import { useExternalWhitelist } from "./external"

export const useSDKPools = () => {
  const { isLoaded, sdk, timestamp } = useRpcProvider()
  const queryClient = useQueryClient()
  const activeQueriesAmount = useActiveQueries(["pools"])
  const { data: whitelist, isSuccess: isWhitelistLoaded } =
    useExternalWhitelist()

  const { api } = sdk

  return useQuery({
    queryKey: [...QUERY_KEYS.allPools, timestamp],
    queryFn: async () => {
      const pools = await api.router.getPools()

      const stablePools = pools.filter((pool) => pool.type === PoolType.Stable)

      const omnipoolTokens = (
        pools.find((pool) => pool.type === PoolType.Omni)
          ?.tokens as OmniPoolToken[]
      ).map((token) => {
        return {
          ...token,
          shares: token.shares?.toString(),
          protocolShares: token.protocolShares?.toString(),
          cap: token.cap?.toString(),
          hubReserves: token.hubReserves?.toString(),
        }
      })

      const { tokens, hub } = omnipoolTokens.reduce<{
        tokens: TOmnipoolAssetsData
        hub: PoolToken
      }>(
        (acc, token) => {
          if (token.id === HUB_ID) {
            acc.hub = token
          } else {
            const {
              id,
              hubReserves,
              cap,
              protocolShares,
              shares,
              tradeable,
              balance,
            } = token

            acc.tokens.push({
              id,
              hubReserve: hubReserves,
              cap,
              protocolShares,
              shares,
              bits: tradeable,
              balance,
            } as TOmnipoolAssetsData[number])
          }

          return acc
        },
        { tokens: [], hub: {} as PoolToken },
      )

      const xykPools = pools.filter((pool) => pool.type === PoolType.XYK)

      queryClient.setQueryData(QUERY_KEYS.omnipoolTokens, tokens)
      queryClient.setQueryData(QUERY_KEYS.stablePools, stablePools)
      queryClient.setQueryData(QUERY_KEYS.hubToken, hub)
      queryClient.setQueryData(QUERY_KEYS.xykPools, xykPools)

      setOmnipoolIds(tokens.map((token) => token.id))

      setValidXYKPoolAddresses(
        xykPools
          .filter((pool) =>
            pool.tokens.some(
              (asset) => asset.isSufficient || whitelist?.includes(asset.id),
            ),
          )
          .map((pool) => pool.address),
      )

      return false
    },
    enabled: isLoaded && !!activeQueriesAmount && isWhitelistLoaded,
    staleTime: millisecondsInMinute,
  })
}

const getDynamicAssetFees =
  (api: ApiPromise, assetId: string | u32) => async () => {
    const res = await api.query.dynamicFees.assetFee(assetId)

    const data = res.unwrapOr(null)

    return {
      protocolFee: data?.protocolFee.toBigNumber().div(10_000) ?? BN_NAN,
      assetFee: data?.assetFee.toBigNumber().div(10_000) ?? BN_NAN,
    }
  }

export const useDynamicAssetFees = (assetId: string | u32) => {
  const { api, isLoaded } = useRpcProvider()

  return useQuery({
    queryKey: QUERY_KEYS.dynamicAssetFee(assetId),
    queryFn: getDynamicAssetFees(api, assetId),
    enabled: isLoaded && !!assetId,
  })
}
