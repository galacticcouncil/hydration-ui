import { Box } from "components/Box/Box"
import { css } from "styled-components"
import { theme } from "theme"
import { Text } from "components/Typography/Text/Text"
import { ButtonTransparent } from "components/Button/Button"
import { ReactComponent as ChevronRight } from "assets/icons/ChevronRight.svg"
import { ReactComponent as LogoutIcon } from "assets/icons/LogoutIcon.svg"
import { getProviderMeta, ProviderType } from "./WalletConnectModal.utils"
import { Account } from "state/store"
import { useTranslation } from "react-i18next"
import {
  SContainer,
  SLogoutContainer,
  SSwitchText,
} from "./WalletConnectActiveFooter.styled"

export function WalletConnectActiveFooter(props: {
  account: Account | undefined
  provider: ProviderType
  onSwitch: () => void
  onLogout: () => void
}) {
  const { name, logo } = getProviderMeta(props.provider, { size: 30 })
  const { t } = useTranslation()

  return (
    <SContainer flex>
      {props.account ? (
        <ButtonTransparent onClick={props.onLogout}>
          <SLogoutContainer flex>
            <LogoutIcon />
            <Text css={{ color: "currentColor" }} fs={14} fw={500}>
              {t("walletConnect.logout")}
            </Text>
          </SLogoutContainer>
        </ButtonTransparent>
      ) : (
        <span />
      )}

      <ButtonTransparent
        css={css`
          padding: 12px;
          border-radius: 12px;
          border: 1px solid ${theme.colors.backgroundGray800};
        `}
        onClick={props.onSwitch}
      >
        <Box flex css={{ gap: 22, alignItems: "center" }}>
          <Box flex css={{ gap: 4, alignItems: "center" }}>
            {logo}
            <Text fs={14} fw={600} css={{ color: theme.colors.neutralGray100 }}>
              {name}
            </Text>
          </Box>
          <SSwitchText fs={14} fw={500}>
            <span>{t("walletConnect.switch")}</span>
            <ChevronRight css={{ marginLeft: -3 }} />
          </SSwitchText>
        </Box>
      </ButtonTransparent>
    </SContainer>
  )
}
