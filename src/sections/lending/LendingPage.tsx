import { Outlet, useMatchRoute } from "@tanstack/react-location"
import { Page } from "components/Layout/Page/Page"
import { LendingPageWip } from "sections/lending/LendingPageWip"
import { MainLayout } from "sections/lending/layouts/MainLayout"

export const LendingPage = () => {
  const matchRoute = useMatchRoute()
  return (
    <Page>
      {matchRoute({ to: "/lending/wip" }) ? (
        <LendingPageWip />
      ) : (
        <MainLayout>
          <Outlet />
        </MainLayout>
      )}
    </Page>
  )
}
