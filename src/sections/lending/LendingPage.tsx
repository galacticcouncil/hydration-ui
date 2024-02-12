import { Outlet, useMatchRoute } from "@tanstack/react-location"
import { Page } from "components/Layout/Page/Page"
import { LendingPageMarketsWip } from "sections/lending/LendingPageMarketsWip"
import { LendingPageWip } from "sections/lending/LendingPageWip"
import { MainLayout } from "sections/lending/layouts/MainLayout"

export const LendingPage = () => {
  const matchRoute = useMatchRoute()
  return (
    <Page>
      {matchRoute({ to: "/lending/wip" }) ? (
        <LendingPageWip />
      ) : matchRoute({ to: "/lending/wip/markets" }) ? (
        <LendingPageMarketsWip />
      ) : (
        <MainLayout>
          <Outlet />
        </MainLayout>
      )}
    </Page>
  )
}
