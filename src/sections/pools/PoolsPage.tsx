import { Page } from "components/Layout/Page/Page"
import { Navigation } from "./navigation/Navigation"
import { Outlet } from "@tanstack/react-location"

export const PoolsPage = () => {
  return (
    <Page subHeader={<Navigation />}>
      <Outlet />
    </Page>
  )
}
