import { useMemo } from "react"
import { useTotalIssuances } from "./totalIssuance"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { useRpcProvider } from "providers/rpcProvider"
import { useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { useAccountBalances } from "./accountBalances"

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
    if (!!totalIssuances.data && balances) {
      return assets.map((asset) => {
        const totalBalance = balances.find((balance) => balance.id === asset)
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
