import { WalletHeader } from "./header/WalletHeader"
import { WalletTabs } from "./header/WalletTabs"
import { useMatchRoute } from "@tanstack/react-location"
import { LINKS } from "utils/navigation"
import { WalletVesting } from "./vesting/WalletVesting"
import { WalletAssets } from "sections/wallet/assets/WalletAssets"
import { Page } from "components/Layout/Page/Page"

export const WalletPage = () => {
  const matchRoute = useMatchRoute()

  return (
    <Page>
      <WalletHeader />
      <WalletTabs />
      {matchRoute({ to: LINKS.walletVesting }) && <WalletVesting />}
      {matchRoute({ to: LINKS.walletAssets }) && <WalletAssets />}
    </Page>
  )
}
