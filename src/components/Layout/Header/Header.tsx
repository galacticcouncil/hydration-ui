import { BasiliskIcon } from "assets/icons/tokens/BasiliskIcon"
import { ReactComponent as BasiliskLogo } from "assets/icons/BasiliskLogo.svg"
import { Icon } from "components/Icon/Icon"
import { HeaderMenu } from "components/Layout/Header/menu/HeaderMenu"
import { SHeader } from "components/Layout/Header/Header.styled"
import { WalletConnectButton } from "sections/wallet/connect/modal/WalletConnectButton"

export const Header = () => {
  return (
    <SHeader>
      <div sx={{ flex: "row", justify: "space-between", align: "center" }}>
        <div sx={{ flex: "row", align: "center" }}>
          <Icon size={32} icon={<BasiliskIcon />} sx={{ mr: 11 }} />
          <Icon sx={{ mr: 60 }}>
            <BasiliskLogo />
          </Icon>
          <HeaderMenu />
        </div>

        <WalletConnectButton />
      </div>
    </SHeader>
  )
}
