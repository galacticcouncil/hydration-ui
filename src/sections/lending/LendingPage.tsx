import { Outlet, useMatchRoute } from "@tanstack/react-location"
import { Page } from "components/Layout/Page/Page"
import { AaveLendingDashboardPage } from "sections/lending/AaveLendingDashboardPage"

import { LendingPageProviders } from "sections/lending/providers/LendingPageProviders"
import { Navigation } from "sections/lending/ui/navigation/Navigation"

export const LendingPage = () => {
  const matchRoute = useMatchRoute()
  // @TODO: for testing only, remove when not needed
  if (matchRoute({ to: "/lending/aave" })) {
    return (
      <Page>
        <LendingPageProviders>
          <AaveLendingDashboardPage />
        </LendingPageProviders>
      </Page>
    )
  }
  return (
    <Page subHeader={<Navigation />}>
      <LendingPageProviders>
        <Outlet />
      </LendingPageProviders>
    </Page>
  )
}
