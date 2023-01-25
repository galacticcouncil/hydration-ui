import { ReactComponent as HydraLogoFull } from "assets/icons/HydraLogoFull.svg"
import { ReactComponent as HydraLogo } from "assets/icons/HydraLogo.svg"
import { Icon } from "components/Icon/Icon"
import { HeaderMenu } from "components/Layout/Header/menu/HeaderMenu"
import {
  SBellIcon,
  SHeader,
  SQuestionmark,
} from "components/Layout/Header/Header.styled"
import { WalletConnectButton } from "sections/wallet/connect/modal/WalletConnectButton"
import { useToast } from "state/toasts"
import { useTranslation } from "react-i18next"
import { theme } from "theme"
import { useMedia } from "react-use"
import { Spinner } from "components/Spinner/Spinner.styled"
import { InfoTooltip } from "components/InfoTooltip/InfoTooltip"

export const Header = () => {
  const isDesktop = useMedia(theme.viewport.gte.sm)
  const isMediumMedia = useMedia(theme.viewport.lt.md)
  const { setSidebar, toasts } = useToast()
  const { t } = useTranslation()

  const loadingToasts = toasts.filter((toast) => toast.variant === "progress")
  const isLoadingToast = !!loadingToasts.length

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
              <SQuestionmark
                onClick={() =>
                  window.open("https://docs.hydradx.io/", "_blank")
                }
              />
            </InfoTooltip>
            <InfoTooltip
              text={
                isLoadingToast
                  ? t("header.notification.pending.tooltip", {
                      number: loadingToasts.length,
                    })
                  : t("header.notification.tooltip")
              }
              type={isLoadingToast ? "default" : "black"}
            >
              <div css={{ position: "relative" }}>
                {isLoadingToast && <Spinner width={40} height={40} />}
                <SBellIcon
                  onClick={() => setSidebar(true)}
                  aria-label={t("toast.sidebar.title")}
                  css={
                    isLoadingToast && {
                      position: "absolute",
                    }
                  }
                />
              </div>
            </InfoTooltip>
          </div>
          <WalletConnectButton />
        </div>
      </div>
    </SHeader>
  )
}
