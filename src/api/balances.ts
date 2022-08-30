import { useApiPromise } from "utils/network"

import { useEffect, useState } from "react"
import BN from "bignumber.js"

// TODO: determine, whether we want to
// - use subscribe method for each query
// - use react-query and invalidate on each block globally
export function useBalances(address: string) {
  const api = useApiPromise()

  const [value, setValue] = useState<BN | null>(null)

  useEffect(() => {
    let cancel: () => void | undefined
    let cancelled = false
    const callback = api.query.system.account(address, (res) => {
      if (!cancelled) {
        const freeBalance = new BN(res.data.free.toHex())
        const miscFrozenBalance = new BN(res.data.miscFrozen.toHex())
        const feeFrozenBalance = new BN(res.data.feeFrozen.toHex())
        const maxFrozenBalance = miscFrozenBalance.gt(feeFrozenBalance)
          ? miscFrozenBalance
          : feeFrozenBalance

        setValue(freeBalance.minus(maxFrozenBalance))
      }
    })

    callback.then((res) => (cancel = res))
    return () => {
      cancelled = true
      cancel?.()
    }
  }, [api, address])

  return value
}
