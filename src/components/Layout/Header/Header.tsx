import { ReactComponent as HydraLogoFull } from "assets/icons/HydraLogoFull.svg"
import { ReactComponent as HydraLogo } from "assets/icons/HydraLogo.svg"
import { Icon } from "components/Icon/Icon"
import { HeaderMenu } from "components/Layout/Header/menu/HeaderMenu"
import { SHeader, SQuestionmark } from "components/Layout/Header/Header.styled"
import { WalletConnectButton } from "sections/wallet/connect/modal/WalletConnectButton"
import { useTranslation } from "react-i18next"
import { theme } from "theme"
import { useMedia } from "react-use"
import { InfoTooltip } from "components/InfoTooltip/InfoTooltip"
import { NotificationCenterIcon } from "./NotificationCenterIcon"

export const Header = () => {
  const isDesktop = useMedia(theme.viewport.gte.sm)
  const isMediumMedia = useMedia(theme.viewport.lt.md)

  const { t } = useTranslation()

  return (
    <SHeader>
      <div sx={{ flex: "row", justify: "space-between", align: "center" }}>
        <div sx={{ flex: "row", align: "center" }}>
          <Icon
            icon={
              isDesktop && !isMediumMedia ? <HydraLogoFull /> : <HydraLogo />
            }
          />
          {isDesktop && <HeaderMenu />}
        </div>
        <div sx={{ flex: "row", align: "center", gap: [12, 24] }}>
          <div sx={{ flex: "row" }}>
            <InfoTooltip text={t("header.documentation.tooltip")} type="black">
              <a
                href="https://docs.hydradx.io/"
                target="blank"
                rel="noreferrer"
              >
                <SQuestionmark />
              </a>
            </InfoTooltip>
            <NotificationCenterIcon />
          </div>
          <WalletConnectButton />
        </div>
      </div>
    </SHeader>
  )
}
