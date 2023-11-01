import { Page } from "components/Layout/Page/Page"
import { Navigation } from "./navigation/Navigation"
import { Outlet } from "@tanstack/react-location"

export const PoolsPage = () => {
  return (
    <Page
      subHeader={<Navigation />}
      subHeaderStyle={{
        background: "rgba(9, 9, 9, 0.09)",
        borderTop: "1px solid rgba(114, 131, 165, 0.6)",
      }}
    >
      <Outlet />
    </Page>
  )
}
