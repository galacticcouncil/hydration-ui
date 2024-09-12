import { Outlet, useSearch } from "@tanstack/react-location"
import { BackSubHeader } from "components/Layout/Header/BackSubHeader/BackSubHeader"
import { Page } from "components/Layout/Page/Page"
import { ROUTES } from "sections/lending/components/primitives/Link"

import { LendingPageProviders } from "sections/lending/providers/LendingPageProviders"
import { Navigation } from "sections/lending/ui/navigation/Navigation"

/* <Page
      subHeader={
        underlyingAsset ? (
          <BackSubHeader label={`Back to markets`} to={ROUTES.markets} />
        ) : (
          <Navigation />
        )
      }
    > */

export const LendingPage = () => {
  const { underlyingAsset } = useSearch()

  return (
    <LendingPageProviders>
      <Outlet />
    </LendingPageProviders>
  )
}
