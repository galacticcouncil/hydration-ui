import { Page } from "components/Layout/Page/Page"
import { Navigation, PoolNavigation } from "./navigation/Navigation"
import { Outlet, useSearch } from "@tanstack/react-location"

export const PoolsPage = () => {
  const { id } = useSearch()

  return (
    <Page
      subHeader={id != null ? <PoolNavigation /> : <Navigation />}
      subHeaderStyle={{
        background: "rgba(9, 9, 9, 0.09)",
        borderTop: "1px solid rgba(114, 131, 165, 0.6)",
      }}
    >
      <Outlet />
    </Page>
  )
}
