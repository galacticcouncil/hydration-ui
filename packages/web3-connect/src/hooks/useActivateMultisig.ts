import { safeConvertSS58toPublicKey } from "@galacticcouncil/utils"
import { useCallback } from "react"
import { useTranslation } from "react-i18next"
import { pick } from "remeda"
import { useShallow } from "zustand/shallow"

import { MultisigConfig, useMultisigStore } from "@/hooks/useMultisigStore"
import { StoredAccount, useWeb3Connect } from "@/hooks/useWeb3Connect"

/**
 * Shared logic for activating a multisig account with a given signer.
 *
 * Used by both MultisigSetup (when the connected wallet was prefilled as
 * the first signer and we can skip the signer-select step) and
 * MultisigSignerSelect (the existing manual selection flow).
 */
export function useActivateMultisig() {
  const { t } = useTranslation()
  const { setActive } = useMultisigStore()
  const { accounts, toggle, setAccount } = useWeb3Connect(
    useShallow(pick(["accounts", "toggle", "setAccount"])),
  )

  const activate = useCallback(
    (config: MultisigConfig, signerAddress: string) => {
      const signerAccount = accounts.find((a) => a.address === signerAddress)
      if (!signerAccount) return

      const multisigAccount: StoredAccount = {
        name:
          config.name ||
          `${t("multisig.title")} (${config.threshold}/${config.signers.length})`,
        address: config.address,
        rawAddress: config.address,
        publicKey: safeConvertSS58toPublicKey(config.address),
        provider: signerAccount.provider,
        isMultisig: true,
        multisigConfigId: config.id,
        multisigSignerAddress: signerAddress,
      }

      setActive(config.id, signerAddress)
      setAccount(multisigAccount)
      toggle()
    },
    [accounts, setActive, setAccount, toggle, t],
  )

  return { activate }
}
