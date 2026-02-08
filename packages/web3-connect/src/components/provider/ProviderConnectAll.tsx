import { useTranslation } from "react-i18next"
import { isNot, prop } from "remeda"

import { SProviderButton } from "@/components/provider/ProviderButton.styled"
import { COMPATIBLE_WALLET_PROVIDERS, useWeb3Enable } from "@/hooks"
import { Wallet } from "@/types/wallet"

type Props = {
  installed: Wallet[]
}

export const ProviderConnectAll: React.FC<Props> = ({ installed }) => {
  const { t } = useTranslation()
  const { enable } = useWeb3Enable({ disconnectOnError: true })
  const installedCompatible = installed.filter(({ provider }) =>
    COMPATIBLE_WALLET_PROVIDERS.includes(provider),
  )

  const disabledCompatible = installedCompatible.filter(isNot(prop("enabled")))

  const enableCompatible = async () => {
    for (const { provider } of disabledCompatible) {
      try {
        await enable(provider)
      } catch (error) {
        console.error(error)
        continue
      }
    }
  }

  if (disabledCompatible.length === 0) return null

  return (
    <SProviderButton
      sx={{ width: "100%", mt: 8, py: 10 }}
      onClick={enableCompatible}
    >
      {t("provider.connectAll")}
    </SProviderButton>
  )
}
