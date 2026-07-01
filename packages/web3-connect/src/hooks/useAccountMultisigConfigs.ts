import {
  safeConvertAddressSS58,
  safeConvertPublicKeyToSS58,
} from "@galacticcouncil/utils"
import { useMemo } from "react"

import { useAccount } from "@/hooks/useAccount"
import { useMultisigConfigs } from "@/hooks/useMultisigConfigs"
import { MultisigConfig } from "@/hooks/useMultisigStore"

const isConfigRelatedToAccount = (
  config: MultisigConfig,
  accountAddress: string,
) => {
  if (safeConvertAddressSS58(config.address) === accountAddress) return true

  return config.signers.some(
    (signer) => safeConvertAddressSS58(signer) === accountAddress,
  )
}

export const useAccountMultisigConfigs = () => {
  const { account } = useAccount()
  const configs = useMultisigConfigs()

  return useMemo(() => {
    if (!account) return []

    const accountAddress = safeConvertPublicKeyToSS58(account.publicKey)
    if (!accountAddress) return []

    return configs.filter((config) =>
      isConfigRelatedToAccount(config, accountAddress),
    )
  }, [account, configs])
}
