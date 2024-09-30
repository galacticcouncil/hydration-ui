import { useMemo } from "react"
import { useTotalIssuances } from "./totalIssuance"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { useRpcProvider } from "providers/rpcProvider"
import { useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { useAccountBalances } from "./accountBalances"
import { ApiPromise } from "@polkadot/api"
import type { u32 } from "@polkadot/types"

export const useShareOfPools = (assets: string[]) => {
  const { account } = useAccount()

  const totalIssuances = useTotalIssuances()
  const accountBalances = useAccountBalances(account?.address, true)
  const balances = accountBalances.data?.balances.filter((balance) =>
    assets.includes(balance.id),
  )

  const queries = [totalIssuances, accountBalances]
  const isLoading = queries.some((query) => query.isInitialLoading)

  const data = useMemo(() => {
    if (!!totalIssuances.data) {
      return assets.map((asset) => {
        const totalBalance = (balances ?? []).find(
          (balance) => balance.id === asset,
        )
        const totalIssuance = totalIssuances.data.get(asset)

        const calculateTotalShare = () => {
          if (totalBalance && totalIssuance) {
            return totalBalance.total.div(totalIssuance).multipliedBy(100)
          }
          return null
        }

        return {
          asset,
          totalShare: totalIssuance,
          myPoolShare: calculateTotalShare(),
        }
      })
    }

    return null
  }, [assets, balances, totalIssuances.data])

  return { isLoading, isInitialLoading: isLoading, data }
}

export const useSDKPools = () => {
  const { isLoaded, tradeRouter } = useRpcProvider()

  return useQuery({
    queryKey: QUERY_KEYS.pools,
    queryFn: async () => {
      return await tradeRouter.getPools()
    },
    enabled: isLoaded,
  })
}

const getDynamicAssetFees =
  (api: ApiPromise, assetId: string | u32) => async () => {
    const res = await api.query.dynamicFees.assetFee(assetId)
    const data = res.unwrap()

    return {
      protocolFee: data.protocolFee.toBigNumber().div(10_000),
      assetFee: data.assetFee.toBigNumber().div(10_000),
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
