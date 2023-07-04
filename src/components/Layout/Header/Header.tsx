import { ReactComponent as HydraLogoFull } from "assets/icons/HydraLogoFull.svg"
import { ReactComponent as HydraLogo } from "assets/icons/HydraLogo.svg"
import { Icon } from "components/Icon/Icon"
import { HeaderMenu } from "components/Layout/Header/menu/HeaderMenu"
import {
  SHeader,
  SQuestionmark,
} from 'components/Layout/Header/Header.styled'
import { WalletConnectButton } from "sections/wallet/connect/modal/WalletConnectButton"
import { useTranslation } from "react-i18next"
import { theme } from "theme"
import { useMedia } from "react-use"
import { InfoTooltip } from "components/InfoTooltip/InfoTooltip"
import { css } from "@emotion/react"
import { useDepegStore, DepegWarningModal } from "./DepegWarningModal"
import { HeaderSettings } from "./settings/HeaderSettings"
import { Bell } from './Bell'

const depegEnabled = import.meta.env.VITE_FF_DEPEG_WARNING === "true"
const settingsEanbled = import.meta.env.VITE_FF_SETTINGS_ENABLED === "true"

export const Header = () => {
  const isDesktop = useMedia(theme.viewport.gte.sm)
  const isMediumMedia = useMedia(theme.viewport.lt.md)
  const { t } = useTranslation()

  const depeg = useDepegStore()

  return (
    <>
      {depeg.depegOpen && depegEnabled && (
        <DepegWarningModal onClose={() => depeg.setDepegOpen(false)} />
      )}
      <SHeader
        css={
          depeg.depegOpen && depegEnabled
            ? css`
                @media ${theme.viewport.gte.md} {
                  top: 40px;
                }
              `
            : undefined
        }
      >
        <div sx={{ flex: "row", justify: "space-between", align: "center" }}>
          <div sx={{ flex: "row", align: "center" }}>
            <Icon
              sx={{ color: "white" }}
              icon={
                isDesktop && !isMediumMedia ? <HydraLogoFull /> : <HydraLogo />
              }
            />
            {isDesktop && <HeaderMenu />}
          </div>
          <div sx={{ flex: "row", align: "center", gap: [12, 24] }}>
            <div sx={{ flex: "row" }}>
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
              <Bell />
            </div>
            <WalletConnectButton />
            {isDesktop && settingsEanbled && <HeaderSettings />}
          </div>
        </div>
      </SHeader>
    </>
  )
}
