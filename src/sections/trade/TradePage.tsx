import { Page } from "components/Layout/Page/Page"
import { LINKS } from "utils/navigation"
import { SwapPage } from "./sections/swap/SwapPage"
import { useMatchRoute } from "@tanstack/react-location"
import { BondsPageWrapper } from "./sections/bonds/BondsPageWrapper"
import { OtcPageWrapper } from "./sections/otc/OtcPageWrappet"
import { DcaApp } from "./sections/dca/DcaPage"
import { SubNavigation } from "./SubNavigation"

export const TradePage = () => {
  const matchRoute = useMatchRoute()
  return (
    <Page
      subHeader={<SubNavigation />}
      subHeaderStyle={{
        background: "rgba(9, 9, 9, 0.09)",
        borderTop: "1px solid rgba(114, 131, 165, 0.6)",
      }}
    >
      {matchRoute({ to: LINKS.swap }) && <SwapPage />}
      {matchRoute({ to: LINKS.bonds }) && <BondsPageWrapper />}
      {matchRoute({ to: LINKS.otc }) && <OtcPageWrapper />}
      {matchRoute({ to: LINKS.dca }) && <DcaApp />}
    </Page>
  )
}
