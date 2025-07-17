import { useRpcProvider } from "providers/rpcProvider"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { ApiPromise } from "@polkadot/api"
import type { u32 } from "@polkadot/types"
import { PoolBase, PoolToken, PoolType, StableSwap } from "@galacticcouncil/sdk"
import { OmniPoolToken } from "@galacticcouncil/sdk/build/types/pool/omni/OmniPool"
import { millisecondsInMinute } from "date-fns"
import { TOmnipoolAssetsData } from "./omnipool"
import { HUB_ID } from "utils/api"
import { BN_NAN } from "utils/constants"
import { useActiveQueries } from "hooks/useActiveQueries"
import { setValidXYKPoolAddresses } from "state/store"
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

      const stablePools: StableSwap[] = []
      const xykPools: PoolBase[] = []
      const validXYKPoolAddresses: string[] = []
      const omnipoolTokens: TOmnipoolAssetsData = []
      let hub: PoolToken | undefined

      for (const pool of pools) {
        if (pool.type === PoolType.Stable) {
          stablePools.push(pool as StableSwap)
        } else if (pool.type === PoolType.XYK) {
          xykPools.push(pool)

          const isValid = pool.tokens.some(
            (asset) => asset.isSufficient || whitelist?.includes(asset.id),
          )

          if (isValid) {
            validXYKPoolAddresses.push(pool.address)
          }
        } else if (pool.type === PoolType.Omni) {
          const tokens = pool.tokens as OmniPoolToken[]

          for (const tokenRaw of tokens) {
            const token = {
              ...tokenRaw,
              shares: tokenRaw.shares?.toString(),
              protocolShares: tokenRaw.protocolShares?.toString(),
              cap: tokenRaw.cap?.toString(),
              hubReserves: tokenRaw.hubReserves?.toString(),
            }

            if (token.id === HUB_ID) {
              hub = token
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

              omnipoolTokens.push({
                id,
                hubReserve: hubReserves,
                cap,
                protocolShares,
                shares,
                bits: tradeable,
                balance,
              })
            }
          }
        }
      }

      queryClient.setQueryData(QUERY_KEYS.omnipoolTokens, omnipoolTokens)
      queryClient.setQueryData(QUERY_KEYS.stablePools, stablePools)
      queryClient.setQueryData(QUERY_KEYS.hubToken, hub)
      queryClient.setQueryData(QUERY_KEYS.xykPools, xykPools)

      setValidXYKPoolAddresses(validXYKPoolAddresses)

      return false
    },
    enabled: isLoaded && !!activeQueriesAmount && isWhitelistLoaded,
    refetchInterval: millisecondsInMinute,
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
