import { sleep } from "@galacticcouncil/utils"
import { useEffect, useState } from "react"

export const useLiquidityMiningRewards = (isEmpty = false) => {
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
    totalAmount: isEmpty ? 0 : 2855.24,
    loading,
  }
}
