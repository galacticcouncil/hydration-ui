import ChevronRight from "assets/icons/ChevronRight.svg?react"
import LogoutIcon from "assets/icons/LogoutIcon.svg?react"
import { Text } from "components/Typography/Text/Text"
import { FC } from "react"
import { useTranslation } from "react-i18next"
import { SContainer, SSwitchButton } from "./Web3ConnectFooter.styled"
import { Web3ConnectProviderIcons } from "sections/web3-connect/providers/Web3ConnectProviderIcons"
import { useConnectedProviders } from "sections/web3-connect/Web3Connect.utils"
import {
  PROVIDERS_BY_WALLET_MODE,
  useWeb3ConnectStore,
} from "sections/web3-connect/store/useWeb3ConnectStore"
import { pick } from "utils/rx"
import { useShallow } from "hooks/useShallow"

type Props = {
  onSwitch: () => void
  onLogout: () => void
}

export const Web3ConnectFooter: FC<Props> = ({ onSwitch, onLogout }) => {
  const { t } = useTranslation()

  const { mode } = useWeb3ConnectStore(
    useShallow((state) => pick(state, ["mode"])),
  )

  const providers = useConnectedProviders()
  const providersByMode = PROVIDERS_BY_WALLET_MODE[mode]
  const connectedProviders = providers.filter(({ type }) => {
    return providersByMode.includes(type)
  })

  return (
    <SContainer>
      {connectedProviders.length > 0 && (
        <div sx={{ flex: "row", align: "center", gap: 6 }}>
          <Web3ConnectProviderIcons
            providers={connectedProviders.map((p) => p.type)}
          />
          <Text fs={12} color="basic400">
            {t("walletConnect.connectedCount", {
              count: connectedProviders.length,
            })}
          </Text>
        </div>
      )}
      <div sx={{ flex: "row", ml: "auto", gap: 8 }}>
        <SSwitchButton
          variant="outline"
          size="micro"
          onClick={onLogout}
          sx={{ color: "basic300" }}
        >
          {t("walletConnect.logout")}
          <LogoutIcon width={18} height={18} sx={{ mr: -8 }} />
        </SSwitchButton>
        <SSwitchButton
          variant="outline"
          size="micro"
          onClick={onSwitch}
          sx={{ color: "brightBlue600" }}
        >
          {t("walletConnect.manage")}
          <ChevronRight width={18} height={18} sx={{ mr: -8 }} />
        </SSwitchButton>
      </div>
    </SContainer>
  )
}
