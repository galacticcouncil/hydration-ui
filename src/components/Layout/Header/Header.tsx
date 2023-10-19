import HydraLogoFull from "assets/icons/HydraLogoFull.svg?react"
import HydraLogo from "assets/icons/HydraLogo.svg?react"
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
import { HeaderMenuTabletButton } from "components/Layout/Header/menu/HeaderMenuTabletButton"
import { useWarningsStore } from "components/WarningMessage/WarningMessage.utils"
import { useVisibleElements } from "hooks/useVisibleElements"
import { useMemo } from "react"

const settingsEanbled = import.meta.env.VITE_FF_SETTINGS_ENABLED === "true"

export const Header = () => {
  const { t } = useTranslation()

  const isMediumMedia = useMedia(theme.viewport.lt.md)
  const isSmallMedia = useMedia(theme.viewport.lt.sm)

  const warnings = useWarningsStore()

  const { visible, observe } = useVisibleElements()

  const visibleTabletItems = useMemo(() => {
    return Object.entries(visible)
      .filter(([, isVisible]) => !isVisible)
      .map(([key]) => key)
  }, [visible])

  return (
    <div css={{ position: "sticky", top: 0, zIndex: 5 }}>
      {warnings.warnings.hdxLiquidity.visible && (
        <WarningMessage
          text={t("warningMessage.hdxLiquidity.title")}
          type="hdxLiquidity"
        />
      )}
      <SHeader>
        <div sx={{ flex: "row", justify: "space-between", align: "center" }}>
          <div sx={{ flex: "row", align: "center" }}>
            <Icon
              sx={{ color: "white" }}
              icon={!isMediumMedia ? <HydraLogoFull /> : <HydraLogo />}
            />
            <HeaderMenu ref={observe} />
          </div>
          <div sx={{ flex: "row", align: "center", gap: 14 }}>
            <div sx={{ flex: "row" }}>
              {!isSmallMedia && (
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
            {!isSmallMedia && isMediumMedia && (
              <HeaderMenuTabletButton items={visibleTabletItems} />
            )}
            {!isSmallMedia && settingsEanbled && <HeaderSettings />}
          </div>
        </div>
      </SHeader>
    </div>
  )
}
