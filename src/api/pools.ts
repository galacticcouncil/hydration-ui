import { useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { TradeRouter } from "@galacticcouncil/sdk"
import { useMemo } from "react"
import { u32 } from "@polkadot/types"
import { useTotalIssuances } from "./totalIssuance"
import { useTokensBalances } from "./balances"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { useRpcProvider } from "providers/rpcProvider"

export const usePools = () => {
  const { tradeRouter } = useRpcProvider()
  return useQuery(QUERY_KEYS.pools, getPools(tradeRouter))
}

export const getPools = (tradeRouter: TradeRouter) => async () =>
  tradeRouter.getPools()

export const useShareOfPools = (assets: (u32 | string)[]) => {
  const { account } = useAccount()

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
          totalShare: calculateTotalShare(),
          transferableShare: calculateTransferableShare(),
        }
      })
    }

    return null
  }, [assets, totalIssuances, totalBalances])

  return { isLoading, data }
}
