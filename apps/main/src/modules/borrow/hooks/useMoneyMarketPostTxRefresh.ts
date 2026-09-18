import { useRefreshMoneyMarketData } from "@galacticcouncil/money-market/hooks"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useEffect } from "react"

import { ToastData, useToastsStore } from "@/states/toasts"

export const POST_TX_REFRESH_DELAYS = [2000, 4000, 6000]

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
  const refreshMoneyMarketData = useRefreshMoneyMarketData()

  const address = account?.address

  useEffect(() => {
    if (!address) return

    const timeouts: Array<ReturnType<typeof setTimeout>> = []

    const unsubscribe = useToastsStore.subscribe((state, prevState) => {
      const successAt = latestSuccessAt(state.toasts[address])
      const prevSuccessAt = latestSuccessAt(prevState.toasts[address])
      if (!successAt || successAt === prevSuccessAt) return

      timeouts.push(
        ...POST_TX_REFRESH_DELAYS.map((delay) =>
          setTimeout(refreshMoneyMarketData, delay),
        ),
      )
    })

    return () => {
      unsubscribe()
      timeouts.forEach((timeout) => clearTimeout(timeout))
    }
  }, [address, refreshMoneyMarketData])
}
