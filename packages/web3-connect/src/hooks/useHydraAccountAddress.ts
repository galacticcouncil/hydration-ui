import { safeConvertAddressSS58 } from "@galacticcouncil/utils"

import { useWeb3Connect } from "@/hooks/useWeb3Connect"

export const useHydraAccountAddress = (): string | null => {
  const accountAddress = useWeb3Connect((s) => s.account?.address)

  return safeConvertAddressSS58(accountAddress ?? "")
}
