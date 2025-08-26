import { sleep } from "@galacticcouncil/utils"
import { useEffect, useState } from "react"

import { useAssets } from "@/providers/assetsProvider"

export const useLiquidityMiningRewards = (isEmpty = false) => {
  const { native } = useAssets()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // eslint-disable-next-line prettier/prettier
    (async () => {
      await sleep(1200)
      setLoading(false)
    })()
  }, [])

  return {
    // TODO: add claimable amount
    claimableAmount: isEmpty ? 0 : 130100,
    // TODO: add total amount
    totalAmountUsd: isEmpty ? 0 : 2855.24,
    symbol: native.symbol,
    loading,
  }
}
