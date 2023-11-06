import { useMemo } from "react"
import { useTotalIssuances } from "./totalIssuance"
import { useTokensBalances } from "./balances"
import { useAccountStore } from "state/store"

export const useShareOfPools = (assets: string[]) => {
  const { account } = useAccountStore()

  const totalIssuances = useTotalIssuances(assets)
  const totalBalances = useTokensBalances(assets, account?.address)

  const queries = [...totalIssuances, ...totalBalances]
  const isLoading = queries.some((query) => query.isLoading)

  const data = useMemo(() => {
    if (!!totalIssuances.length && !!totalBalances.length) {
      return assets.map((asset) => {
        const totalBalance = totalBalances.find(
          (balance) => balance.data?.assetId === asset,
        )
        const totalIssuance = totalIssuances.find(
          (issuance) => issuance.data?.token === asset,
        )

        const calculateTotalShare = () => {
          if (totalBalance?.data && totalIssuance?.data) {
            return totalBalance.data.total
              .div(totalIssuance.data.total)
              .multipliedBy(100)
          }
          return null
        }

        const calculateTransferableShare = () => {
          if (totalBalance?.data && totalIssuance?.data) {
            return totalBalance.data.balance
              .div(totalIssuance.data.total)
              .multipliedBy(100)
          }
          return null
        }

        return {
          asset,
          totalShare: totalIssuance?.data?.total,
          myPoolShare: calculateTotalShare(),
          transferableShare: calculateTransferableShare(),
        }
      })
    }

    return null
  }, [assets, totalIssuances, totalBalances])

  return { isLoading, isInitialLoading: isLoading, data }
}
