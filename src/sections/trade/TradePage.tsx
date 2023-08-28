import { Page } from "components/Layout/Page/Page"
import { SubNavigation } from "./SubNavigation"
import { Outlet } from "@tanstack/react-location"

export const TradePage = () => (
  <Page
    subHeader={<SubNavigation />}
    subHeaderStyle={{
      background: "rgba(9, 9, 9, 0.09)",
      borderTop: "1px solid rgba(114, 131, 165, 0.6)",
    }}
  >
    <Outlet />
  </Page>
)
