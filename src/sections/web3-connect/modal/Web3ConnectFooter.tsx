import ChevronRight from "assets/icons/ChevronRight.svg?react"
import { Text } from "components/Typography/Text/Text"
import { FC } from "react"
import { useTranslation } from "react-i18next"
import { SContainer, SSwitchButton } from "./Web3ConnectFooter.styled"
import { Web3ConnectProviderIcons } from "sections/web3-connect/providers/Web3ConnectProviderIcons"
import { useConnectedProviders } from "sections/web3-connect/Web3Connect.utils"

type Props = {
  onSwitch: () => void
  onLogout: () => void
}

export const Web3ConnectFooter: FC<Props> = ({ onSwitch }) => {
  const { t } = useTranslation()

  const providers = useConnectedProviders()

  return (
    <SContainer>
      {providers.length > 0 && (
        <div sx={{ flex: "row", align: "center", gap: 6 }}>
          <Web3ConnectProviderIcons providers={providers.map((p) => p.type)} />
          <Text fs={12} color="basic400">
            {t("walletConnect.connectedCount", {
              count: providers.length,
            })}
          </Text>
        </div>
      )}
      <SSwitchButton
        variant="outline"
        size="micro"
        onClick={onSwitch}
        sx={{ ml: "auto" }}
      >
        {t("walletConnect.logout")}/{t("walletConnect.addWallet")}
        <ChevronRight width={18} height={18} />
      </SSwitchButton>
    </SContainer>
  )
}
