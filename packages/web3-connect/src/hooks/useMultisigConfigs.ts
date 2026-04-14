import {
  safeConvertAddressSS58,
  safeConvertPublicKeyToSS58,
} from "@galacticcouncil/utils"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { isArray, isNumber, prop, sortBy } from "remeda"

import { useAccountMultisigs } from "@/hooks/useAccountMultisigs"
import { MultisigConfig, useMultisigStore } from "@/hooks/useMultisigStore"
import i18n from "@/i18n"

const sortByAddress = sortBy<MultisigConfig[]>(prop("address"))

export const useMultisigConfigs = () => {
  const { t } = useTranslation("translations", { i18n })
  const storedConfigs = useMultisigStore((state) => state.configs)
  const { data: multisigs } = useAccountMultisigs()
  return useMemo(() => {
    if (!isArray(multisigs?.accounts)) return sortByAddress(storedConfigs)

    const storedAddresses = new Set(
      storedConfigs.map((c) => safeConvertAddressSS58(c.address)),
    )

    const { accounts } = multisigs

    const indexedConfigs: MultisigConfig[] = accounts
      .filter((multisig) => {
        if (!isNumber(multisig.threshold)) return false
        const address = safeConvertPublicKeyToSS58(multisig.pubKey)
        return !storedAddresses.has(safeConvertAddressSS58(address))
      })
      .map((multisig) => {
        const address = safeConvertPublicKeyToSS58(multisig.pubKey)
        return {
          id: multisig.id,
          address,
          name: `${t("multisig.title")}`,
          threshold: multisig.threshold ?? 0,
          signers: multisig.signatories.map((signatory) =>
            safeConvertPublicKeyToSS58(signatory.signatory.pubKey),
          ),
          isCustom: false,
        }
      })

    return sortByAddress([...indexedConfigs, ...storedConfigs])
  }, [multisigs, storedConfigs, t])
}

export const useActiveMultisigConfig = (): MultisigConfig | null => {
  const configs = useMultisigConfigs()
  const activeConfigId = useMultisigStore((state) => state.activeConfigId)
  return useMemo(
    () => configs.find((c) => c.id === activeConfigId) ?? null,
    [configs, activeConfigId],
  )
}
