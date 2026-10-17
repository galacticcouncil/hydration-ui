import { h160 } from "@galacticcouncil/common"
import {
  moneyMarketKeys,
  useMoneyMarket,
} from "@galacticcouncil/money-market-v2/react"
import type { ActionPlan } from "@galacticcouncil/money-market-v2/types"
import { ActivityType, safeConvertSS58toH160 } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useMutation } from "@tanstack/react-query"

import {
  fetchFeePerGas,
  planToTransaction,
} from "@/modules/money-market-v2/actions/planToTransaction"
import { useRefreshMarket } from "@/modules/money-market-v2/actions/useRefreshMarket"
import { useRpcProvider } from "@/providers/rpcProvider"
import {
  TransactionClosedError,
  TransactionToasts,
  useTransactionsStore,
} from "@/states/transactions"

const { isEvmAccount } = h160

type ActionPlanVariables = {
  plan: ActionPlan
  toasts: TransactionToasts
  activity?: ActivityType
}

/**
 * The one mutation every money-market action submits through: turns a plan
 * into the app's review-and-sign flow and refreshes the market afterwards.
 */
export const useActionPlanMutation = () => {
  const { papi, evm } = useRpcProvider()
  const { account } = useAccount()
  const { market } = useMoneyMarket()
  const refreshMarket = useRefreshMarket()
  const createTransaction = useTransactionsStore((s) => s.createTransaction)

  const address = account?.address ?? ""
  const marketKey = [...moneyMarketKeys.market(market.market)]

  const mutation = useMutation({
    mutationFn: async ({ plan, toasts, activity }: ActionPlanVariables) => {
      const feePerGas = await fetchFeePerGas(evm)
      const tx = planToTransaction(plan, {
        papi,
        from: safeConvertSS58toH160(address),
        feePerGas,
      })

      return createTransaction(
        {
          tx,
          toasts,
          activity,
          invalidateQueries: [marketKey],
          withExtraGas: plan.length > 1 && isEvmAccount(address),
        },
        {
          resolveOn: "submitted",
          // `invalidateQueries` above already refreshes on success.
          onSuccess: () => refreshMarket({ delayedOnly: true }),
        },
      )
    },
    onError: (error) => {
      if (error instanceof TransactionClosedError) mutation.reset()
    },
  })

  return mutation
}
