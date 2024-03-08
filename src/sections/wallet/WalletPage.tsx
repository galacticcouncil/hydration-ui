import { Outlet } from "@tanstack/react-location"
import { Page } from "components/Layout/Page/Page"
import { Navigation } from "sections/wallet/navigation/Navigation"

export const WalletPage = () => {
  return (
    <Page subHeader={<Navigation />}>
      <Outlet />
    </Page>
  )
}
