import { useMemo } from "react"

import { useRpcProvider } from "@/providers/rpcProvider"

export const useOtcExistentialDepositorMultiplier = () => {
  const { papi, isApiLoaded } = useRpcProvider()

  return useMemo(
    () =>
      isApiLoaded
        ? papi.constants.OTC.ExistentialDepositMultiplier()
        : undefined,
    [papi, isApiLoaded],
  )
}
