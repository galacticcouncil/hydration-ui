import { Page } from "components/Layout/Page/Page"
import { Navigation, PoolNavigation } from "./navigation/Navigation"
import { Outlet, useSearch } from "@tanstack/react-location"

export const PoolsPage = () => {
  const { id } = useSearch()

  return (
    <Page
      subHeader={id != null ? <PoolNavigation /> : <Navigation />}
      sx={{ mt: id != null ? ["-22px", "inherit"] : undefined }}
    >
      <Outlet />
    </Page>
  )
}
