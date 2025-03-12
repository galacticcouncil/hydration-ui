import { useRpcProvider } from "providers/rpcProvider"

export const useExistentialDepositMultiplier = (): number | undefined => {
  const { api, isLoaded } = useRpcProvider()

  const s = api.consts.otc.existentialDepositMultiplier

  return isLoaded ? s.toNumber() : undefined
}
