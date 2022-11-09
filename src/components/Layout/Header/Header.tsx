import { ReactComponent as HydraLogoFull } from "assets/icons/HydraLogoFull.svg"
import { ReactComponent as HydraLogo } from "assets/icons/HydraLogo.svg"
import { Icon } from "components/Icon/Icon"
import { HeaderMenu } from "components/Layout/Header/menu/HeaderMenu"
import { SHeader } from "components/Layout/Header/Header.styled"
import { WalletConnectButton } from "sections/wallet/connect/modal/WalletConnectButton"
import { useMedia } from "react-use"
import { theme } from "theme"

export const Header = () => {
  const isDesktop = useMedia(theme.viewport.gte.sm)
  return (
    <SHeader>
      <div sx={{ flex: "row", justify: "space-between", align: "center" }}>
        <Icon
          icon={isDesktop ? <HydraLogoFull /> : <HydraLogo />}
          sx={{ mr: 11 }}
        />
        {isDesktop && <HeaderMenu />}
        <WalletConnectButton />
      </div>
    </SHeader>
  )
}
