import HydraLogo from "assets/icons/HydraLogo.svg?react"
import HydraLogoFull from "assets/icons/HydraLogoFull.svg?react"
import { Icon } from "components/Icon/Icon"
import { SHeader } from "components/Layout/Header/Header.styled"
import { HeaderMenu } from "components/Layout/Header/menu/HeaderMenu"
import { WarningMessage } from "components/WarningMessage/WarningMessage"
import { useWarningsStore } from "components/WarningMessage/WarningMessage.utils"
import { useVisibleElements } from "hooks/useVisibleElements"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useMedia } from "react-use"
import { theme } from "theme"
import { HeaderToolbar } from "./toolbar/HeaderToolbar"

export const Header = () => {
  const { t } = useTranslation()

  const isMediumMedia = useMedia(theme.viewport.lt.md)

  const warnings = useWarningsStore()

  const { visible, observe } = useVisibleElements()

  const moreMenuItems = useMemo(() => {
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
          <div sx={{ flex: "row", align: "center", gap: 40 }}>
            <Icon
              sx={{ color: "white" }}
              icon={!isMediumMedia ? <HydraLogoFull /> : <HydraLogo />}
            />
            <HeaderMenu ref={observe} />
          </div>
          <HeaderToolbar menuItems={moreMenuItems} />
        </div>
      </SHeader>
    </div>
  )
}
