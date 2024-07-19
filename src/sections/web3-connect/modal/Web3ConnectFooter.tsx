import ChevronRight from "assets/icons/ChevronRight.svg?react"
import LogoutIcon from "assets/icons/LogoutIcon.svg?react"
import { Text } from "components/Typography/Text/Text"
import { FC } from "react"
import { useTranslation } from "react-i18next"
import { useAccount, useWallet } from "sections/web3-connect/Web3Connect.utils"
import {
  SContainer,
  SLogoutButton,
  SSwitchButton,
  SSwitchText,
} from "./Web3ConnectFooter.styled"

type Props = {
  onSwitch: () => void
  onLogout: () => void
}

export const Web3ConnectFooter: FC<Props> = ({ onLogout, onSwitch }) => {
  const { t } = useTranslation()

  const { account } = useAccount()
  const { wallet } = useWallet()

  return (
    <SContainer>
      {account ? (
        <SLogoutButton variant="outline" size="micro" onClick={onLogout}>
          <LogoutIcon sx={{ ml: -3 }} />
          {t("walletConnect.logout")}
        </SLogoutButton>
      ) : (
        <span />
      )}

      <SSwitchButton variant="outline" size="micro" onClick={onSwitch}>
        <div sx={{ flex: "row", gap: [8, 20], align: "center" }}>
          <div sx={{ flex: "row", gap: 8, align: "center" }}>
            <img
              src={wallet?.logo.src}
              alt={wallet?.logo.alt}
              width={26}
              height={26}
            />
            <Text
              fs={14}
              fw={600}
              color="basic400"
              sx={{ display: ["none", "block"] }}
            >
              {wallet?.title}
            </Text>
          </div>
          <SSwitchText fs={14} fw={500} font="GeistSemiBold">
            <span>{t("walletConnect.switch")}</span>
            <ChevronRight sx={{ ml: -3 }} />
          </SSwitchText>
        </div>
      </SSwitchButton>
    </SContainer>
  )
}
