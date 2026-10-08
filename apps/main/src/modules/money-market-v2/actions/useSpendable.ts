import type { ActionPlan } from "@galacticcouncil/money-market-v2/types"
import { safeConvertSS58toH160 } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

import { useAccountBalances } from "@/api/balances"
import { useAccountFeePaymentAssetId } from "@/api/payments"
import {
  fetchFeePerGas,
  planToTransaction,
} from "@/modules/money-market-v2/actions/planToTransaction"
import { useEstimateFee } from "@/modules/transactions/hooks/useEstimateFee"
import { useMaxBalance } from "@/modules/transactions/hooks/useMaxBalance"
import { useRpcProvider } from "@/providers/rpcProvider"

const FEE_PCT_BUFFER = 0.5

type UseSpendableParams = {
  assetId?: string
  plan: ActionPlan | null
}

/**
 * How much of `assetId` the wallet can move once the fee is paid. `plan` is
 * the action's single-call plan with the wallet's transferable balance as the
 * amount - it only exists to estimate the fee.
 *
 * ponytail: an isolation-join supply paid in the same asset carries extra
 * calls, so its fee is under-estimated here. Upgrade = run the assessment once
 * to read `isolationJoin`, then estimate the full plan.
 */
export const useSpendable = ({
  assetId,
  plan,
}: UseSpendableParams): { spendable?: string; isLoading: boolean } => {
  const { papi, evm, isReady } = useRpcProvider()
  const { account } = useAccount()
  const { isBalanceLoading } = useAccountBalances()
  const { data: feePaymentAssetId, isLoading: isFeeAssetLoading } =
    useAccountFeePaymentAssetId()

  const { data: feePerGas } = useQuery({
    queryKey: ["evmFeePerGas"],
    queryFn: () => fetchFeePerGas(evm),
    enabled: isReady,
  })

  const from = account ? safeConvertSS58toH160(account.address) : ""

  const tx = useMemo(
    () =>
      plan && from && feePerGas !== undefined
        ? planToTransaction(plan, { papi, from, feePerGas })
        : null,
    [plan, papi, from, feePerGas],
  )

  const { maxBalanceHuman } = useMaxBalance({
    assetId,
    tx,
    feePctBuffer: FEE_PCT_BUFFER,
  })
  // Same query as the one inside useMaxBalance - read only for its status.
  const { data: fee } = useEstimateFee(tx)

  const paysFee = !!assetId && feePaymentAssetId === Number(assetId)
  const isLoading = isFeeAssetLoading || isBalanceLoading || (paysFee && !fee)

  return {
    spendable: isLoading ? undefined : maxBalanceHuman,
    isLoading,
  }
}
