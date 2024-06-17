import HydraLogoFull from "assets/icons/HydraLogoFull.svg?react"
import { Icon } from "components/Icon/Icon"
import { SHeader } from "components/Layout/Header/Header.styled"
import { HeaderMenu } from "components/Layout/Header/menu/HeaderMenu"
import { WarningMessage } from "components/WarningMessage/WarningMessage"
import { useWarningsStore } from "components/WarningMessage/WarningMessage.utils"
import { useVisibleElements } from "hooks/useVisibleElements"
import { useTranslation } from "react-i18next"
import { HeaderToolbar } from "./toolbar/HeaderToolbar"
import { Link, useSearch } from "@tanstack/react-location"
import { LINKS, resetSearchParams } from "utils/navigation"
import { NewFarmsBanner } from "sections/pools/components/NewFarmsBanner"
import { useRpcProvider } from "providers/rpcProvider"
import { useMedia } from "react-use"
import { theme } from "theme"
import HydraLogo from "assets/icons/HydraLogo.svg?react"

export const Header = () => {
  const { t } = useTranslation()
  const { isLoaded } = useRpcProvider()

  const warnings = useWarningsStore()
  const search = useSearch()

  const isMediumMedia = useMedia(theme.viewport.lt.md)

  const { hiddenElementsKeys, observe } = useVisibleElements()

  return (
    <div css={{ position: "sticky", top: 0, zIndex: 5 }}>
      {warnings.warnings.hdxLiquidity.visible && (
        <WarningMessage
          text={t("warningMessage.hdxLiquidity.title")}
          type="hdxLiquidity"
        />
      )}
      {isLoaded && <NewFarmsBanner />}
      <SHeader>
        <div sx={{ flex: "row", justify: "space-between", align: "center" }}>
          <div sx={{ flex: "row", align: "center", gap: 40 }}>
            <Link to={LINKS.swap} search={resetSearchParams(search)}>
              <Icon
                sx={{ color: "white" }}
                icon={
                  !isMediumMedia ? (
                    <HydraLogoFull />
                  ) : (
                    <Icon size={24} icon={<HydraLogo />} />
                  )
                }
              />
            </Link>
            <HeaderMenu ref={observe} />
          </div>
          <HeaderToolbar menuItems={hiddenElementsKeys} />
        </div>
      </SHeader>
    </div>
  )
}
