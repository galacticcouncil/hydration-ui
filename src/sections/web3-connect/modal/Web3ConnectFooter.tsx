import ChevronRight from "assets/icons/ChevronRight.svg?react"
import LogoutIcon from "assets/icons/LogoutIcon.svg?react"
import { ButtonTransparent } from "components/Button/Button"
import { Text } from "components/Typography/Text/Text"
import { FC } from "react"
import { useTranslation } from "react-i18next"
import { useAccount, useWallet } from "sections/web3-connect/Web3Connect.utils"
import { theme } from "theme"
import {
  SContainer,
  SLogoutContainer,
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
        <ButtonTransparent onClick={onLogout}>
          <SLogoutContainer>
            <LogoutIcon css={{ color: theme.colors.basic500 }} />
            <Text css={{ color: theme.colors.basic500 }} fs={14} fw={500}>
              {t("walletConnect.logout")}
            </Text>
          </SLogoutContainer>
        </ButtonTransparent>
      ) : (
        <span />
      )}

      <SSwitchButton onClick={onSwitch}>
        <div sx={{ flex: "row", gap: 22, align: "center" }}>
          <div sx={{ flex: "row", gap: 12, align: "center" }}>
            <>
              <img
                src={wallet?.logo.src}
                alt={wallet?.logo.alt}
                width={30}
                height={30}
              />
              <Text fs={14} fw={600} css={{ color: theme.colors.basic500 }}>
                {wallet?.title}
              </Text>
            </>
          </div>
          <SSwitchText fs={14} fw={500}>
            <span>{t("walletConnect.switch")}</span>
            <ChevronRight css={{ marginLeft: -3, marginTop: 2 }} />
          </SSwitchText>
        </div>
      </SSwitchButton>
    </SContainer>
  )
}
