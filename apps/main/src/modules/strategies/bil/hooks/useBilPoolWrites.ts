import {
  buildBorrow,
  buildRepay,
  markets,
  MAX_UINT_AMOUNT,
} from "@galacticcouncil/money-market/core"
import { moneyMarketKeys } from "@galacticcouncil/money-market/react"
import type { ActionPlan } from "@galacticcouncil/money-market/types"
import { useMutation } from "@tanstack/react-query"
import { useCallback } from "react"
import { useTranslation } from "react-i18next"
import { parseUnits } from "viem"

import {
  fetchFeePerGas,
  planToTransaction,
} from "@/modules/money-market/actions/planToTransaction"
import { useUserAddress } from "@/modules/money-market/hooks"
import { HOLLAR_ADDRESS } from "@/modules/strategies/bil/config/constants"
import { useBilStrategy } from "@/modules/strategies/bil/context/BilStrategyContext"
import { BIL_QUERY_KEY_PREFIX } from "@/modules/strategies/bil/utils/queryKeys"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTransactionsStore } from "@/states/transactions"

const BIL_MARKET = markets.bil_v3

type BilPoolWriteOptions = {
  onClose?: () => void
}

function useBilPoolPlanSubmit({ onClose }: BilPoolWriteOptions = {}) {
  const rpc = useRpcProvider()
  const user = useUserAddress()
  const { createTransaction } = useTransactionsStore()

  const submitPlan = useCallback(
    async (
      plan: ActionPlan,
      toasts: { submitted: string; success: string },
    ) => {
      if (!user) return

      const feePerGas = await fetchFeePerGas(rpc.evm)

      return createTransaction(
        {
          tx: planToTransaction(plan, {
            papi: rpc.papi,
            from: user,
            feePerGas,
          }),
          toasts,
          invalidateQueries: [
            [BIL_QUERY_KEY_PREFIX],
            [...moneyMarketKeys.market(BIL_MARKET.market)],
          ],
        },
        {
          onSubmitted: onClose,
        },
      )
    },
    [createTransaction, onClose, rpc.evm, rpc.papi, user],
  )

  return { user, submitPlan }
}

/**
 * Borrow HOLLAR against the user's BIL collateral on the BIL Aave pool.
 *
 * Variable rate only: the GhoAToken facilitator rejects stable-rate borrows.
 */
export function useBorrowHollar({ onClose }: BilPoolWriteOptions = {}) {
  const { t } = useTranslation(["strategies", "common"])
  const { hollar } = useBilStrategy()
  const { user, submitPlan } = useBilPoolPlanSubmit({ onClose })

  return useMutation({
    mutationFn: async (hollarAmount: string) => {
      if (!user) return

      const plan = buildBorrow({
        market: BIL_MARKET,
        asset: HOLLAR_ADDRESS,
        amount: parseUnits(hollarAmount, hollar.decimals),
        onBehalfOf: user,
      })

      return submitPlan(plan, {
        submitted: t("bil.borrow.toast.submitted", {
          amount: hollarAmount,
          symbol: hollar.symbol,
        }),
        success: t("bil.borrow.toast.success", {
          amount: hollarAmount,
          symbol: hollar.symbol,
        }),
      })
    },
  })
}

/**
 * Repay HOLLAR debt on the BIL Aave pool.
 *
 * When repaying the full debt, pass `repayAll: true` so the call uses
 * `MAX_UINT_AMOUNT` (Aave's "repay everything" sentinel) instead of a fixed
 * amount that may drift with accrued interest.
 */
export function useRepayHollar({ onClose }: BilPoolWriteOptions = {}) {
  const { t } = useTranslation(["strategies", "common"])
  const { hollar } = useBilStrategy()
  const { user, submitPlan } = useBilPoolPlanSubmit({ onClose })

  return useMutation({
    mutationFn: async ({
      amount,
      repayAll,
    }: {
      amount: string
      repayAll?: boolean
    }) => {
      if (!user) return

      const plan = buildRepay({
        market: BIL_MARKET,
        asset: HOLLAR_ADDRESS,
        amount: repayAll
          ? MAX_UINT_AMOUNT
          : parseUnits(amount, hollar.decimals),
        onBehalfOf: user,
      })

      return submitPlan(plan, {
        submitted: t("bil.repay.toast.submitted", {
          amount,
          symbol: hollar.symbol,
        }),
        success: t("bil.repay.toast.success", {
          amount,
          symbol: hollar.symbol,
        }),
      })
    },
  })
}
