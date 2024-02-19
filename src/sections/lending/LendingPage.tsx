import { Outlet, useMatchRoute, useSearch } from "@tanstack/react-location"
import { BackSubHeader } from "components/Layout/Header/BackSubHeader/BackSubHeader"
import { Page } from "components/Layout/Page/Page"
import { AaveLendingDashboardPage } from "sections/lending/AaveLendingDashboardPage"
import { ROUTES } from "sections/lending/components/primitives/Link"

import { LendingPageProviders } from "sections/lending/providers/LendingPageProviders"
import { Navigation } from "sections/lending/ui/navigation/Navigation"

export const LendingPage = () => {
  const { underlyingAsset } = useSearch()
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
    <Page
      subHeader={
        underlyingAsset ? (
          <BackSubHeader label={`Back to markets`} to={ROUTES.markets} />
        ) : (
          <Navigation />
        )
      }
    >
      <LendingPageProviders>
        <Outlet />
      </LendingPageProviders>
    </Page>
  )
}
