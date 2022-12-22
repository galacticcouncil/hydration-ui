import { ReactComponent as HydraLogoFull } from "assets/icons/HydraLogoFull.svg"
import { ReactComponent as HydraLogo } from "assets/icons/HydraLogo.svg"
import { Icon } from "components/Icon/Icon"
import { HeaderMenu } from "components/Layout/Header/menu/HeaderMenu"
import { SBellIcon, SHeader } from "components/Layout/Header/Header.styled"
import { WalletConnectButton } from "sections/wallet/connect/modal/WalletConnectButton"
import { useToast } from "state/toasts"
import { useTranslation } from "react-i18next"
import { theme } from "theme"
import { useMedia } from "react-use"
import { Spinner } from "components/Spinner/Spinner.styled"

export const Header = () => {
  const isDesktop = useMedia(theme.viewport.gte.sm)
  const { setSidebar, toasts } = useToast()
  const { t } = useTranslation()

  const isLoadingToast = !!toasts.find((toast) => toast.variant === "progress")

  return (
    <SHeader>
      <div sx={{ flex: "row", justify: "space-between", align: "center" }}>
        <Icon icon={isDesktop ? <HydraLogoFull /> : <HydraLogo />} />
        {isDesktop && <HeaderMenu />}
        <div sx={{ flex: "row", align: "center", gap: [12, 24] }}>
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
          <WalletConnectButton />
        </div>
      </div>
    </SHeader>
  )
}
