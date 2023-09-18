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
import { HeaderSettings } from "./settings/HeaderSettings"
import { Bell } from "./Bell"
import { WarningMessage } from "components/WarningMessage/WarningMessage"
import { useWarningsStore } from "components/WarningMessage/WarningMessage.utils"

const settingsEanbled = import.meta.env.VITE_FF_SETTINGS_ENABLED === "true"

export const Header = () => {
  const isMediumMedia = useMedia(theme.viewport.lt.md)
  const { t } = useTranslation()

  const warnings = useWarningsStore()

  return (
    <div css={{ position: "sticky", top: 0, zIndex: 5 }}>
      {warnings.warnings.staking.visible && (
        <WarningMessage
          type="staking"
          text="Delegated votes are currently not eligible for Action Points."
        />
      )}
      <SHeader>
        <div sx={{ flex: "row", justify: "space-between", align: "center" }}>
          <div sx={{ flex: "row", align: "center" }}>
            <Icon
              sx={{ color: "white" }}
              icon={!isMediumMedia ? <HydraLogoFull /> : <HydraLogo />}
            />
            {!isMediumMedia && <HeaderMenu />}
          </div>
          <div sx={{ flex: "row", align: "center", gap: [12, 24] }}>
            <div sx={{ flex: "row" }}>
              {!isMediumMedia && (
                <InfoTooltip
                  text={t("header.documentation.tooltip")}
                  type="black"
                >
                  <a
                    href="https://docs.hydradx.io/"
                    target="blank"
                    rel="noreferrer"
                  >
                    <SQuestionmark />
                  </a>
                </InfoTooltip>
              )}
              <Bell />
            </div>
            <WalletConnectButton />
            {!isMediumMedia && settingsEanbled && <HeaderSettings />}
          </div>
        </div>
      </SHeader>
    </div>
  )
}
