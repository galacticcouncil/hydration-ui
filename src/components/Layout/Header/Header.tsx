import { ReactComponent as HydraLogoFull } from "assets/icons/HydraLogoFull.svg"
import { ReactComponent as HydraLogo } from "assets/icons/HydraLogo.svg"
import { Icon } from "components/Icon/Icon"
import { HeaderMenu } from "components/Layout/Header/menu/HeaderMenu"
import { SHeader } from "components/Layout/Header/Header.styled"
import { WalletConnectButton } from "sections/wallet/connect/modal/WalletConnectButton"
import { IconButton } from "components/IconButton/IconButton"
import { ReactComponent as BellIcon } from "assets/icons/BellIcon.svg"
import { useToast } from "state/toasts"
import { useTranslation } from "react-i18next"
import { useMedia } from "react-use"
import { theme } from "theme"

export const Header = () => {
  const isDesktop = useMedia(theme.viewport.gte.sm)
  const { setSidebar } = useToast()
  const { t } = useTranslation()

  return (
    <SHeader>
      <div sx={{ flex: "row", justify: "space-between", align: "center" }}>
        <Icon
          icon={isDesktop ? <HydraLogoFull /> : <HydraLogo />}
          sx={{ mr: 11 }}
        />
        {isDesktop && <HeaderMenu />}
        <div sx={{ flex: "row", align: "center", gap: [12, 24] }}>
          <IconButton
            icon={<BellIcon />}
            name={t("toast.sidebar.title")}
            sx={{ color: "neutralGray300" }}
            onClick={() => setSidebar(true)}
          />
        </div>
        <WalletConnectButton />
      </div>
    </SHeader>
  )
}
