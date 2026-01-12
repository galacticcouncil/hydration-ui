import { isNot, prop } from "remeda"

import { SProviderButton } from "@/components/provider/ProviderButton.styled"
import { COMPATIBLE_WALLET_PROVIDERS, useWeb3Enable } from "@/hooks"
import { Wallet } from "@/types/wallet"

type Props = {
  installed: Wallet[]
}

export const ProviderConnectAll: React.FC<Props> = ({ installed }) => {
  const { enable } = useWeb3Enable()
  const installedCompatible = installed.filter(({ provider }) =>
    COMPATIBLE_WALLET_PROVIDERS.includes(provider),
  )

  const disabledCompatible = installedCompatible.filter(isNot(prop("enabled")))

  const enableCompatible = async () => {
    await Promise.all(
      disabledCompatible.map(({ provider }) => enable(provider)),
    )
  }

  if (disabledCompatible.length === 0) return null

  return (
    <SProviderButton
      type="button"
      sx={{ width: "100%", mt: 8, py: 10 }}
      onClick={enableCompatible}
    >
      Connect all
    </SProviderButton>
  )
}
