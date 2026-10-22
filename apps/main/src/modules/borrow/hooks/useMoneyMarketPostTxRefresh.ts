import { useRefreshMoneyMarketData } from "@galacticcouncil/money-market/hooks"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useQueryClient } from "@tanstack/react-query"
import { useCallback, useEffect } from "react"

import {
  AAVE_HEALTH_FACTOR_QUERY_KEY,
  AAVE_SUMMARY_QUERY_KEY,
} from "@/api/aave"
import { MAX_WITHDRAW_ALL_QUERY_KEY } from "@/api/balances/account.queries"
import { ToastData, useToastsStore } from "@/states/toasts"

export const POST_TX_REFRESH_DELAYS = [2000, 4000, 6000]

const POST_TX_QUERY_KEYS = [
  ["borrow"],
  AAVE_HEALTH_FACTOR_QUERY_KEY,
  AAVE_SUMMARY_QUERY_KEY,
  MAX_WITHDRAW_ALL_QUERY_KEY,
] as const

const latestSuccessAt = (toasts: ReadonlyArray<ToastData> = []) =>
  toasts.reduce<string | undefined>(
    (latest, toast) =>
      toast.variant === "success" && (!latest || toast.dateCreated > latest)
        ? toast.dateCreated
        : latest,
    undefined,
  )

/**
 * Arms extra money market refreshes after a transaction succeeds.
 */
export const useMoneyMarketPostTxRefresh = () => {
  const { account } = useAccount()
  const queryClient = useQueryClient()
  const refreshMoneyMarketData = useRefreshMoneyMarketData()

  const address = account?.address

  const refreshMoneyMarketQueries = useCallback(() => {
    refreshMoneyMarketData()

    for (const queryKey of POST_TX_QUERY_KEYS) {
      void queryClient.invalidateQueries({ queryKey })
    }
  }, [queryClient, refreshMoneyMarketData])

  useEffect(() => {
    if (!address) return

    const timeouts: Array<ReturnType<typeof setTimeout>> = []

    const unsubscribe = useToastsStore.subscribe((state, prevState) => {
      const successAt = latestSuccessAt(state.toasts[address])
      const prevSuccessAt = latestSuccessAt(prevState.toasts[address])
      if (!successAt || successAt === prevSuccessAt) return

      timeouts.push(
        ...POST_TX_REFRESH_DELAYS.map((delay) =>
          setTimeout(refreshMoneyMarketQueries, delay),
        ),
      )
    })

    return () => {
      unsubscribe()
      timeouts.forEach((timeout) => clearTimeout(timeout))
    }
  }, [address, refreshMoneyMarketQueries])
}
