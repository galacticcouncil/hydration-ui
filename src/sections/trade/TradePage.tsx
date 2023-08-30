import { Page } from "components/Layout/Page/Page"
import { SubNavigation } from "./SubNavigation"
import { Outlet, useMatchRoute } from "@tanstack/react-location"
import { LINKS } from "utils/navigation"
import { BackSubHeader } from "components/Layout/Header/BackSubHeader/BackSubHeader"

export const TradePage = () => {
  const matchRoute = useMatchRoute()
  const isBondPage = matchRoute({ to: LINKS.bond })

  return (
    <Page
      subHeader={
        isBondPage ? (
          <BackSubHeader label="Back to bond sale" to={LINKS.bonds} />
        ) : (
          <SubNavigation />
        )
      }
      subHeaderStyle={
        !isBondPage && {
          background: "rgba(9, 9, 9, 0.09)",
          borderTop: "1px solid rgba(114, 131, 165, 0.6)",
        }
      }
    >
      <Outlet />
    </Page>
  )
}
