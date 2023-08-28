import { Page } from "components/Layout/Page/Page"
import { LINKS } from "utils/navigation"
import { SwapPage } from "./sections/swap/SwapPage"
import { useMatchRoute } from "@tanstack/react-location"
import { BondsPageWrapper } from "./sections/bonds/BondsPageWrapper"
import { OtcPageWrapper } from "./sections/otc/OtcPageWrappet"
import { DcaApp } from "./sections/dca/DcaPage"
import { SubNavigation } from "./SubNavigation"

const isOtcPageEnabled = import.meta.env.VITE_FF_OTC_ENABLED === "true"
const isDcaPageEnabled = import.meta.env.VITE_FF_DCA_ENABLED === "true"
const isBondsPageEnabled = import.meta.env.VITE_FF_BONDS_ENABLED === "true"

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
      {isBondsPageEnabled && matchRoute({ to: LINKS.bonds }) && (
        <BondsPageWrapper />
      )}
      {isOtcPageEnabled && matchRoute({ to: LINKS.otc }) && <OtcPageWrapper />}
      {isDcaPageEnabled && matchRoute({ to: LINKS.dca }) && <DcaApp />}
    </Page>
  )
}
