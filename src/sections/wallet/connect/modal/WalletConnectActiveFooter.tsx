import { theme } from "theme"
import { Text } from "components/Typography/Text/Text"
import { ButtonTransparent } from "components/Button/Button"
import { ReactComponent as ChevronRight } from "assets/icons/ChevronRight.svg"
import { ReactComponent as LogoutIcon } from "assets/icons/LogoutIcon.svg"
import { Account } from "state/store"
import { useTranslation } from "react-i18next"
import {
  SContainer,
  SLogoutContainer,
  SSwitchButton,
  SSwitchText,
} from "./WalletConnectActiveFooter.styled"
import { getWalletBySource } from "@talismn/connect-wallets"

export function WalletConnectActiveFooter(props: {
  account: Account | undefined
  provider: string
  onSwitch: () => void
  onLogout: () => void
}) {
  const { t } = useTranslation()
  const wallet = getWalletBySource(props.provider)

  return (
    <SContainer>
      {props.account ? (
        <ButtonTransparent onClick={props.onLogout}>
          <SLogoutContainer>
            <LogoutIcon />
            <Text css={{ color: "currentColor" }} fs={14} fw={500}>
              {t("walletConnect.logout")}
            </Text>
          </SLogoutContainer>
        </ButtonTransparent>
      ) : (
        <span />
      )}

      <SSwitchButton onClick={props.onSwitch}>
        <div sx={{ flex: "row", gap: 22, align: "center" }}>
          <div sx={{ flex: "row", gap: 12, align: "center" }}>
            <img
              src={wallet?.logo.src}
              alt={wallet?.logo.alt}
              width={30}
              height={30}
            />
            <Text fs={14} fw={600} css={{ color: theme.colors.neutralGray100 }}>
              {wallet?.title}
            </Text>
          </div>
          <SSwitchText fs={14} fw={500}>
            <span>{t("walletConnect.switch")}</span>
            <ChevronRight css={{ marginLeft: -3 }} />
          </SSwitchText>
        </div>
      </SSwitchButton>
    </SContainer>
  )
}
