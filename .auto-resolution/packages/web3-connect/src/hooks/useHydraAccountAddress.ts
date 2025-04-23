import { HYDRA_ADDRESS_PREFIX } from "@/constants"
import { useWeb3Connect } from "@/hooks/useWeb3Connect"
import { safeConvertAddressSS58 } from "@/utils/safeConvertAddressSS58"

export const useHydraAccountAddress = (): string | null => {
  const accountAddress = useWeb3Connect((s) => s.account?.address)

  return safeConvertAddressSS58(accountAddress, HYDRA_ADDRESS_PREFIX)
}
