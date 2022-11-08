import { ReactComponent as HydraLogo } from "assets/icons/HydraLogo.svg"
import { Icon } from "components/Icon/Icon"
import { HeaderMenu } from "components/Layout/Header/menu/HeaderMenu"
import { SHeader } from "components/Layout/Header/Header.styled"
import { WalletConnectButton } from "sections/wallet/connect/modal/WalletConnectButton"

export const Header = () => {
  return (
    <SHeader>
      <div sx={{ flex: "row", justify: "space-between", align: "center" }}>
        <Icon icon={<HydraLogo />} sx={{ mr: 11 }} />
        <HeaderMenu />
        <WalletConnectButton />
      </div>
    </SHeader>
  )
}
