import { safeConvertSS58toH160 } from "@galacticcouncil/utils"

import { useAccount } from "@/hooks/useAccount"

export const useEvmAddress = () => {
  const { account } = useAccount()
  return account?.address ? safeConvertSS58toH160(account.address) : undefined
}
